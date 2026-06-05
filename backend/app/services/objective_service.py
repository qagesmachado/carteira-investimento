from __future__ import annotations

from datetime import date, datetime

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select

from app.models.asset import Asset, AssetType
from app.models.objective import (
    DEFAULT_OBJECTIVE_NAME,
    Objective,
    ObjectiveMode,
    ObjectiveStatus,
)
from app.models.objective_allocation import ObjectiveAllocation
from app.models.pension_contribution_year import PensionContributionYear
from app.models.portfolio import Portfolio
from app.models.position import Position
from app.schemas.objective import (
    AssetDivergenceRead,
    AssetPartitionRead,
    ObjectiveAllocationItem,
    ObjectiveAllocationRead,
    ObjectiveCreate,
    ObjectiveRead,
    ObjectivesSnapshotRead,
    ObjectiveUpdate,
    PartitionSliceRead,
    PensionContributionRead,
    PensionContributionSummaryRead,
    PensionYearCreate,
    PensionYearUpdate,
)
from app.services.pension_contribution_engine import compute_pension_contribution_metrics
from app.services.asset_service import get_asset_by_id
from app.services.fx_service import get_usd_brl_state
from app.services.objective_divergence import compute_divergence
from app.services.portfolio_service import get_portfolio, list_positions
from app.services.position_metrics import (
    position_current_value,
    position_invested_value,
    uses_manual_position_values,
    value_in_brl,
)


def split_mode_for_asset_type(asset_type: AssetType | str) -> str:
    if isinstance(asset_type, str):
        asset_type = AssetType(asset_type)
    return "amount" if uses_manual_position_values(asset_type) else "shares"


def position_allocation_total(position: Position, asset: Asset) -> float | None:
    if uses_manual_position_values(asset.asset_type):
        return position.current_value
    return position.quantity


def ensure_default_objective(session: Session, portfolio_id: int) -> Objective:
    get_portfolio(session, portfolio_id)
    existing = session.exec(
        select(Objective).where(
            Objective.portfolio_id == portfolio_id,
            Objective.is_default.is_(True),
        ),
    ).first()
    if existing is not None:
        return existing

    objective = Objective(
        portfolio_id=portfolio_id,
        name=DEFAULT_OBJECTIVE_NAME,
        is_default=True,
    )
    session.add(objective)
    session.commit()
    session.refresh(objective)
    return objective


def ensure_default_objectives_for_all_portfolios(session: Session) -> None:
    for portfolio in session.exec(select(Portfolio)).all():
        ensure_default_objective(session, portfolio.id)


def list_objectives(session: Session, portfolio_id: int) -> list[Objective]:
    get_portfolio(session, portfolio_id)
    ensure_default_objective(session, portfolio_id)
    return list(
        session.exec(
            select(Objective)
            .where(Objective.portfolio_id == portfolio_id)
            .order_by(Objective.is_default.desc(), Objective.name),
        ).all(),
    )


def get_objective(session: Session, portfolio_id: int, objective_id: int) -> Objective:
    objective = session.get(Objective, objective_id)
    if objective is None or objective.portfolio_id != portfolio_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="objective not found")
    return objective


def _resolve_objective_mode(mode: str) -> ObjectiveMode:
    try:
        return ObjectiveMode(mode)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="invalid objective mode",
        ) from exc


def _validate_single_pension_objective_per_portfolio(
    session: Session,
    portfolio_id: int,
    *,
    exclude_objective_id: int | None = None,
) -> None:
    for objective in list_objectives(session, portfolio_id):
        if objective.id == exclude_objective_id:
            continue
        if _objective_mode_value(objective) == ObjectiveMode.PENSION_CONTRIBUTION:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="pension contribution objective already exists in portfolio",
            )


def _list_pension_years(session: Session, objective_id: int) -> list[PensionContributionYear]:
    rows = session.exec(
        select(PensionContributionYear)
        .where(PensionContributionYear.objective_id == objective_id)
        .order_by(PensionContributionYear.plan_year.desc()),
    ).all()
    return list(rows)


def _build_pension_year_read(row: PensionContributionYear) -> PensionContributionRead:
    metrics = compute_pension_contribution_metrics(
        plan_year=row.plan_year,
        annual_gross_income_brl=row.annual_gross_income_brl,
        contributed_ytd_brl=row.contributed_ytd_brl or 0.0,
    )
    return PensionContributionRead(
        plan_year=metrics.plan_year,
        annual_gross_income_brl=metrics.annual_gross_income_brl,
        contributed_ytd_brl=metrics.contributed_ytd_brl,
        target_annual_brl=metrics.target_annual_brl,
        remaining_brl=metrics.remaining_brl,
        months_remaining=metrics.months_remaining,
        monthly_needed_brl=metrics.monthly_needed_brl,
        progress_percent=metrics.progress_percent,
        target_reached=metrics.target_reached,
    )


def _build_pension_contribution_summary(
    session: Session,
    objective_id: int,
) -> PensionContributionSummaryRead:
    year_reads = [_build_pension_year_read(row) for row in _list_pension_years(session, objective_id)]
    consolidated = sum(row.contributed_ytd_brl for row in year_reads)
    return PensionContributionSummaryRead(
        years=year_reads,
        consolidated_total_brl=consolidated,
    )


def _get_pension_year_row(
    session: Session,
    objective_id: int,
    plan_year: int,
) -> PensionContributionYear | None:
    return session.exec(
        select(PensionContributionYear).where(
            PensionContributionYear.objective_id == objective_id,
            PensionContributionYear.plan_year == plan_year,
        ),
    ).first()


def _validate_pension_amounts(
    annual_gross_income_brl: float | None,
    contributed_ytd_brl: float | None,
) -> None:
    if annual_gross_income_brl is not None and annual_gross_income_brl < 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="annual gross income must be non-negative",
        )
    if contributed_ytd_brl is not None and contributed_ytd_brl < 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="contributed amount must be non-negative",
        )


def _upsert_pension_year_row(
    session: Session,
    objective_id: int,
    plan_year: int,
    *,
    annual_gross_income_brl: float | None = None,
    contributed_ytd_brl: float | None = None,
    income_provided: bool = False,
    contributed_provided: bool = False,
) -> PensionContributionYear:
    row = _get_pension_year_row(session, objective_id, plan_year)
    if row is None:
        row = PensionContributionYear(
            objective_id=objective_id,
            plan_year=plan_year,
            annual_gross_income_brl=annual_gross_income_brl,
            contributed_ytd_brl=contributed_ytd_brl or 0.0,
        )
    else:
        if income_provided:
            row.annual_gross_income_brl = annual_gross_income_brl
        if contributed_provided:
            row.contributed_ytd_brl = contributed_ytd_brl or 0.0
    row.updated_at = datetime.utcnow()
    session.add(row)
    return row


def _validate_partition_asset(
    session: Session,
    portfolio_id: int,
    partition_asset_id: int | None,
    *,
    required: bool,
) -> None:
    if partition_asset_id is None:
        if required:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="partition_asset_id is required for single_asset objectives",
            )
        return
    positions = {p.asset_id: p for p in list_positions(session, portfolio_id)}
    if partition_asset_id not in positions:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="partition asset must be in portfolio",
        )


def _objective_mode_value(objective: Objective) -> ObjectiveMode:
    mode = objective.mode
    if mode is None:
        return ObjectiveMode.MULTI_ASSET
    if isinstance(mode, str):
        return ObjectiveMode(mode)
    return mode


def create_objective(session: Session, portfolio_id: int, payload: ObjectiveCreate) -> Objective:
    get_portfolio(session, portfolio_id)
    ensure_default_objective(session, portfolio_id)
    name = payload.name.strip()
    if not name:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="objective name is required",
        )
    if name == DEFAULT_OBJECTIVE_NAME:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="reserved objective name",
        )

    mode = _resolve_objective_mode(payload.mode)
    partition_asset_id = payload.partition_asset_id
    plan_year: int | None = None
    annual_gross_income_brl: float | None = None

    if mode == ObjectiveMode.SINGLE_ASSET:
        if partition_asset_id is not None:
            _validate_partition_asset(session, portfolio_id, partition_asset_id, required=True)
    elif mode == ObjectiveMode.PENSION_CONTRIBUTION:
        if partition_asset_id is not None:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="partition_asset_id is not allowed for pension_contribution objectives",
            )
        _validate_single_pension_objective_per_portfolio(session, portfolio_id)
        plan_year = payload.plan_year or date.today().year
        annual_gross_income_brl = payload.annual_gross_income_brl
        _validate_pension_amounts(annual_gross_income_brl, 0.0)
    elif partition_asset_id is not None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="partition_asset_id is only allowed for single_asset objectives",
        )

    objective = Objective(
        portfolio_id=portfolio_id,
        name=name,
        description=payload.description,
        is_default=False,
        mode=mode,
        partition_asset_id=partition_asset_id,
    )
    session.add(objective)
    try:
        session.commit()
    except IntegrityError as exc:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="objective name already exists in portfolio",
        ) from exc
    session.refresh(objective)
    if mode == ObjectiveMode.PENSION_CONTRIBUTION and objective.id is not None:
        _upsert_pension_year_row(
            session,
            objective.id,
            plan_year or date.today().year,
            annual_gross_income_brl=annual_gross_income_brl,
            contributed_ytd_brl=0.0,
            income_provided=True,
            contributed_provided=True,
        )
        session.commit()
        session.refresh(objective)
    return objective


def update_objective(
    session: Session,
    portfolio_id: int,
    objective_id: int,
    payload: ObjectiveUpdate,
) -> Objective:
    objective = get_objective(session, portfolio_id, objective_id)
    if objective.is_default:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="default objective cannot be updated",
        )

    data = payload.model_dump(exclude_unset=True)
    mode = _objective_mode_value(objective)
    if "name" in data and data["name"] is not None:
        name = data["name"].strip()
        if not name:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="objective name is required",
            )
        if name == DEFAULT_OBJECTIVE_NAME:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="reserved objective name",
            )
        objective.name = name
    if "description" in data:
        objective.description = data["description"]

    objective.updated_at = datetime.utcnow()
    session.add(objective)
    try:
        session.commit()
    except IntegrityError as exc:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="objective name already exists in portfolio",
        ) from exc
    session.refresh(objective)
    return objective


def delete_objective(session: Session, portfolio_id: int, objective_id: int) -> None:
    objective = get_objective(session, portfolio_id, objective_id)
    if objective.is_default:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="default objective cannot be deleted",
        )

    allocations = session.exec(
        select(ObjectiveAllocation).where(ObjectiveAllocation.objective_id == objective_id),
    ).all()
    for allocation in allocations:
        session.delete(allocation)
    pension_years = session.exec(
        select(PensionContributionYear).where(PensionContributionYear.objective_id == objective_id),
    ).all()
    for row in pension_years:
        session.delete(row)
    session.delete(objective)
    session.commit()


def _allocation_value(allocation: ObjectiveAllocation, split_mode: str) -> float:
    if split_mode == "amount":
        return allocation.amount or 0.0
    return allocation.quantity or 0.0


def _normalize_slice_name(slice_name: str) -> str:
    return slice_name.strip()


def _validate_slice_names_unique(items: list[ObjectiveAllocationItem]) -> None:
    seen: set[str] = set()
    for item in items:
        normalized = _normalize_slice_name(item.slice_name)
        if not normalized:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="slice name is required",
            )
        key = normalized.casefold()
        if key in seen:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="duplicate slice name in objective",
            )
        seen.add(key)


def _validate_allocation_item(item: ObjectiveAllocationItem, split_mode: str) -> None:
    if not _normalize_slice_name(item.slice_name):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="slice name is required",
        )
    if split_mode == "amount":
        if item.amount is None or item.amount <= 0:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="amount must be positive for fixed income or pension assets",
            )
        if item.quantity is not None:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="quantity is not allowed for this asset type",
            )
        return

    if item.quantity is None or item.quantity <= 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="quantity must be positive for share-based assets",
        )
    if item.amount is not None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="amount is not allowed for this asset type",
        )


def _explicit_totals_by_asset(
    session: Session,
    portfolio_id: int,
    *,
    exclude_objective_id: int | None = None,
) -> dict[int, float]:
    objectives = list_objectives(session, portfolio_id)
    totals: dict[int, float] = {}
    for objective in objectives:
        if objective.is_default or objective.id == exclude_objective_id:
            continue
        if _objective_mode_value(objective) == ObjectiveMode.PENSION_CONTRIBUTION:
            continue
        allocations = session.exec(
            select(ObjectiveAllocation).where(ObjectiveAllocation.objective_id == objective.id),
        ).all()
        for allocation in allocations:
            asset = get_asset_by_id(session, allocation.asset_id)
            split_mode = split_mode_for_asset_type(asset.asset_type)
            totals[allocation.asset_id] = totals.get(allocation.asset_id, 0.0) + _allocation_value(
                allocation,
                split_mode,
            )
    return totals


def replace_objective_allocations(
    session: Session,
    portfolio_id: int,
    objective_id: int,
    items: list[ObjectiveAllocationItem],
) -> Objective:
    objective = get_objective(session, portfolio_id, objective_id)
    if objective.is_default:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="default objective allocations cannot be edited",
        )
    if _objective_mode_value(objective) == ObjectiveMode.PENSION_CONTRIBUTION:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="pension contribution objectives do not support asset allocations",
        )

    positions = {p.asset_id: p for p in list_positions(session, portfolio_id)}
    explicit_totals = _explicit_totals_by_asset(
        session,
        portfolio_id,
        exclude_objective_id=objective_id,
    )

    objective_mode = _objective_mode_value(objective)
    if objective_mode == ObjectiveMode.SINGLE_ASSET:
        if not items:
            objective.partition_asset_id = None
        else:
            asset_ids = {item.asset_id for item in items}
            if len(asset_ids) > 1:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                    detail="single_asset objective allows only one asset",
                )
            only_asset_id = next(iter(asset_ids))
            if objective.partition_asset_id is None:
                _validate_partition_asset(
                    session,
                    portfolio_id,
                    only_asset_id,
                    required=True,
                )
                objective.partition_asset_id = only_asset_id
            elif only_asset_id != objective.partition_asset_id:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                    detail="single_asset objective can only allocate its partition asset",
                )

    _validate_slice_names_unique(items)

    new_totals: dict[int, float] = {}
    validated: list[tuple[ObjectiveAllocationItem, Asset, str]] = []
    for item in items:
        if item.asset_id not in positions:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail=f"asset {item.asset_id} is not in portfolio",
            )
        asset = get_asset_by_id(session, item.asset_id)
        split_mode = split_mode_for_asset_type(asset.asset_type)
        _validate_allocation_item(item, split_mode)
        value = item.amount if split_mode == "amount" else item.quantity
        assert value is not None
        new_totals[item.asset_id] = new_totals.get(item.asset_id, 0.0) + value
        validated.append((item, asset, split_mode))

    for asset_id, new_value in new_totals.items():
        position = positions[asset_id]
        asset = get_asset_by_id(session, asset_id)
        total = position_allocation_total(position, asset)
        if total is None:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail=f"asset {asset_id} has no position total",
            )
        combined = explicit_totals.get(asset_id, 0.0) + new_value
        if combined > total + 1e-9:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail=(
                    f"allocation for asset {asset_id} exceeds position total "
                    f"({combined} > {total})"
                ),
            )

        divergence = compute_divergence(total, combined)
        if divergence.status.value == "over_total":
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail=f"asset {asset_id} has allocation divergence; adjust first",
            )

    existing = session.exec(
        select(ObjectiveAllocation).where(ObjectiveAllocation.objective_id == objective_id),
    ).all()
    for allocation in existing:
        session.delete(allocation)
    session.flush()

    now = datetime.utcnow()
    for item, _asset, split_mode in validated:
        allocation = ObjectiveAllocation(
            objective_id=objective_id,
            asset_id=item.asset_id,
            slice_name=_normalize_slice_name(item.slice_name),
            quantity=item.quantity if split_mode == "shares" else None,
            amount=item.amount if split_mode == "amount" else None,
            updated_at=now,
        )
        session.add(allocation)

    objective.updated_at = now
    session.add(objective)
    session.commit()
    session.refresh(objective)
    return objective


def _allocation_fraction(
    position: Position,
    asset: Asset,
    *,
    quantity: float | None,
    amount: float | None,
    split_mode: str,
) -> float | None:
    total = position_allocation_total(position, asset)
    if total is None or total <= 0:
        return None
    if split_mode == "amount":
        if amount is None:
            return None
        return amount / total
    if quantity is None:
        return None
    return quantity / total


def _allocation_financial_metrics(
    position: Position | None,
    asset: Asset,
    *,
    quantity: float | None,
    amount: float | None,
    split_mode: str,
    usd_brl_rate: float | None,
) -> tuple[float | None, float | None, float | None, float | None]:
    current_value_brl: float | None = None
    invested_value_brl: float | None = None
    profit_brl: float | None = None
    profit_percent: float | None = None

    if position is None:
        return current_value_brl, invested_value_brl, profit_brl, profit_percent

    if split_mode == "amount" and amount is not None:
        current_value_brl = value_in_brl(amount, asset.currency, usd_brl_rate)
    elif split_mode == "shares" and quantity is not None and asset.current_quote is not None:
        part_value = quantity * asset.current_quote
        current_value_brl = value_in_brl(part_value, asset.currency, usd_brl_rate)
    else:
        full = position_current_value(position, asset)
        fraction = _allocation_fraction(
            position,
            asset,
            quantity=quantity,
            amount=amount,
            split_mode=split_mode,
        )
        if full is not None and fraction is not None:
            current_value_brl = value_in_brl(full * fraction, asset.currency, usd_brl_rate)

    invested_total = position_invested_value(position, asset)
    fraction = _allocation_fraction(
        position,
        asset,
        quantity=quantity,
        amount=amount,
        split_mode=split_mode,
    )
    if invested_total is not None and fraction is not None:
        invested_part = invested_total * fraction
        invested_value_brl = value_in_brl(invested_part, asset.currency, usd_brl_rate)
        if current_value_brl is not None and invested_value_brl is not None and invested_value_brl > 0:
            profit_brl = current_value_brl - invested_value_brl
            profit_percent = (profit_brl / invested_value_brl) * 100

    return current_value_brl, invested_value_brl, profit_brl, profit_percent


def _build_allocation_read(
    asset: Asset,
    *,
    allocation_id: int,
    slice_name: str,
    quantity: float | None,
    amount: float | None,
    position: Position | None,
    usd_brl_rate: float | None,
) -> ObjectiveAllocationRead:
    split_mode = split_mode_for_asset_type(asset.asset_type)
    current_value_brl, invested_value_brl, profit_brl, profit_percent = _allocation_financial_metrics(
        position,
        asset,
        quantity=quantity,
        amount=amount,
        split_mode=split_mode,
        usd_brl_rate=usd_brl_rate,
    )

    return ObjectiveAllocationRead(
        id=allocation_id,
        slice_name=slice_name,
        asset_id=asset.id,
        symbol=asset.symbol,
        name=asset.name,
        asset_type=asset.asset_type,
        quantity=quantity,
        amount=amount,
        split_mode=split_mode,
        current_value_brl=current_value_brl,
        invested_value_brl=invested_value_brl,
        profit_brl=profit_brl,
        profit_percent=profit_percent,
    )


def _build_asset_partitions(
    session: Session,
    objectives: list[Objective],
    allocation_rows_by_objective: dict[int, list[ObjectiveAllocationRead]],
    divergences: list[AssetDivergenceRead],
    positions_by_asset: dict[int, Position],
    usd_brl_rate: float | None,
) -> list[AssetPartitionRead]:
    partitions: list[AssetPartitionRead] = []

    for divergence in divergences:
        if divergence.allocated_explicit <= 1e-9:
            continue
        asset_id = divergence.asset_id
        position = positions_by_asset.get(asset_id)
        asset = get_asset_by_id(session, asset_id)
        position_current_brl: float | None = None
        position_invested_brl: float | None = None
        position_profit_brl: float | None = None
        if position is not None:
            full_current = position_current_value(position, asset)
            full_invested = position_invested_value(position, asset)
            position_current_brl = value_in_brl(full_current, asset.currency, usd_brl_rate)
            position_invested_brl = value_in_brl(full_invested, asset.currency, usd_brl_rate)
            if (
                position_current_brl is not None
                and position_invested_brl is not None
                and position_invested_brl > 0
            ):
                position_profit_brl = position_current_brl - position_invested_brl

        slices: list[PartitionSliceRead] = []
        for objective in objectives:
            if objective.id is None:
                continue
            rows = allocation_rows_by_objective.get(objective.id, [])
            for row in rows:
                if row.asset_id != asset_id:
                    continue
                slices.append(
                    PartitionSliceRead(
                        objective_id=objective.id,
                        objective_name=objective.name,
                        slice_name=row.slice_name,
                        is_default=objective.is_default,
                        quantity=row.quantity,
                        amount=row.amount,
                        current_value_brl=row.current_value_brl,
                        invested_value_brl=row.invested_value_brl,
                        profit_brl=row.profit_brl,
                    ),
                )

        partitions.append(
            AssetPartitionRead(
                asset_id=asset_id,
                symbol=divergence.symbol,
                name=divergence.name,
                split_mode=divergence.split_mode,
                position_total=divergence.total,
                free=divergence.free,
                position_current_value_brl=position_current_brl,
                position_invested_value_brl=position_invested_brl,
                position_profit_brl=position_profit_brl,
                slices=slices,
            ),
        )

    return partitions


def build_objectives_snapshot(session: Session, portfolio_id: int) -> ObjectivesSnapshotRead:
    get_portfolio(session, portfolio_id)
    ensure_default_objective(session, portfolio_id)
    objectives = list_objectives(session, portfolio_id)
    positions = list_positions(session, portfolio_id)
    positions_by_asset = {p.asset_id: p for p in positions}
    usd_brl_rate, _ = get_usd_brl_state(session)

    explicit_by_asset: dict[int, float] = {}
    allocation_rows_by_objective: dict[int, list[ObjectiveAllocationRead]] = {
        obj.id: [] for obj in objectives if obj.id is not None
    }

    for objective in objectives:
        if objective.is_default or objective.id is None:
            continue
        if _objective_mode_value(objective) == ObjectiveMode.PENSION_CONTRIBUTION:
            continue
        allocations = session.exec(
            select(ObjectiveAllocation).where(ObjectiveAllocation.objective_id == objective.id),
        ).all()
        for allocation in allocations:
            asset = get_asset_by_id(session, allocation.asset_id)
            position = positions_by_asset.get(allocation.asset_id)
            split_mode = split_mode_for_asset_type(asset.asset_type)
            value = _allocation_value(allocation, split_mode)
            explicit_by_asset[allocation.asset_id] = (
                explicit_by_asset.get(allocation.asset_id, 0.0) + value
            )
            assert allocation.id is not None
            allocation_rows_by_objective[objective.id].append(
                _build_allocation_read(
                    asset,
                    allocation_id=allocation.id,
                    slice_name=allocation.slice_name,
                    quantity=allocation.quantity,
                    amount=allocation.amount,
                    position=position,
                    usd_brl_rate=usd_brl_rate,
                ),
            )

    divergences: list[AssetDivergenceRead] = []
    default_objective = next(obj for obj in objectives if obj.is_default)
    default_rows: list[ObjectiveAllocationRead] = []

    patrimony_brl = 0.0
    for position in positions:
        asset = get_asset_by_id(session, position.asset_id)
        full_value = position_current_value(position, asset)
        brl = value_in_brl(full_value, asset.currency, usd_brl_rate)
        if brl is not None:
            patrimony_brl += brl

        total = position_allocation_total(position, asset)
        if total is None:
            continue

        split_mode = split_mode_for_asset_type(asset.asset_type)
        explicit = explicit_by_asset.get(position.asset_id, 0.0)
        divergence = compute_divergence(total, explicit)

        divergences.append(
            AssetDivergenceRead(
                asset_id=position.asset_id,
                symbol=asset.symbol,
                name=asset.name,
                split_mode=split_mode,
                total=total,
                allocated_explicit=explicit,
                free=divergence.free,
                delta=divergence.delta,
                status=divergence.status.value,
            ),
        )

        free_value = divergence.free if divergence.status.value == "ok" else max(0.0, total - explicit)
        if free_value > 1e-9 and default_objective.id is not None:
            default_rows.append(
                _build_allocation_read(
                    asset,
                    allocation_id=-position.asset_id,
                    slice_name="Livre",
                    quantity=free_value if split_mode == "shares" else None,
                    amount=free_value if split_mode == "amount" else None,
                    position=position,
                    usd_brl_rate=usd_brl_rate,
                ),
            )

    if default_objective.id is not None:
        allocation_rows_by_objective[default_objective.id] = default_rows

    objective_reads: list[ObjectiveRead] = []
    for objective in objectives:
        if objective.id is None:
            continue
        rows = allocation_rows_by_objective.get(objective.id, [])
        mode = _objective_mode_value(objective)
        pension_contribution: PensionContributionSummaryRead | None = None
        if mode == ObjectiveMode.PENSION_CONTRIBUTION:
            assert objective.id is not None
            pension_contribution = _build_pension_contribution_summary(session, objective.id)
            total_value = pension_contribution.consolidated_total_brl
        else:
            total_value = sum(row.current_value_brl or 0.0 for row in rows)
        objective_reads.append(
            ObjectiveRead(
                id=objective.id,
                portfolio_id=objective.portfolio_id,
                name=objective.name,
                description=objective.description,
                is_default=objective.is_default,
                mode=mode.value,
                partition_asset_id=objective.partition_asset_id,
                allocations=rows,
                total_value_brl=total_value,
                pension_contribution=pension_contribution,
            ),
        )

    asset_partitions = _build_asset_partitions(
        session,
        objectives,
        allocation_rows_by_objective,
        divergences,
        positions_by_asset,
        usd_brl_rate,
    )

    return ObjectivesSnapshotRead(
        portfolio_id=portfolio_id,
        objectives=objective_reads,
        divergences=divergences,
        asset_partitions=asset_partitions,
        patrimony_brl=patrimony_brl,
    )


def _require_pension_objective(session: Session, portfolio_id: int, objective_id: int) -> Objective:
    objective = get_objective(session, portfolio_id, objective_id)
    if _objective_mode_value(objective) != ObjectiveMode.PENSION_CONTRIBUTION:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="objective is not pension_contribution",
        )
    return objective


def add_pension_year(
    session: Session,
    portfolio_id: int,
    objective_id: int,
    payload: PensionYearCreate,
) -> None:
    objective = _require_pension_objective(session, portfolio_id, objective_id)
    assert objective.id is not None
    _validate_pension_amounts(payload.annual_gross_income_brl, payload.contributed_ytd_brl)
    if _get_pension_year_row(session, objective.id, payload.plan_year) is not None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="pension year already exists for objective",
        )
    _upsert_pension_year_row(
        session,
        objective.id,
        payload.plan_year,
        annual_gross_income_brl=payload.annual_gross_income_brl,
        contributed_ytd_brl=payload.contributed_ytd_brl or 0.0,
        income_provided=True,
        contributed_provided=True,
    )
    objective.updated_at = datetime.utcnow()
    session.add(objective)
    session.commit()


def upsert_pension_year(
    session: Session,
    portfolio_id: int,
    objective_id: int,
    plan_year: int,
    payload: PensionYearUpdate,
) -> None:
    objective = _require_pension_objective(session, portfolio_id, objective_id)
    assert objective.id is not None
    data = payload.model_dump(exclude_unset=True)
    income = data.get("annual_gross_income_brl")
    contributed = data.get("contributed_ytd_brl")
    _validate_pension_amounts(income, contributed)
    if _get_pension_year_row(session, objective.id, plan_year) is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="pension year not found",
        )
    _upsert_pension_year_row(
        session,
        objective.id,
        plan_year,
        annual_gross_income_brl=income,
        contributed_ytd_brl=contributed,
        income_provided="annual_gross_income_brl" in data,
        contributed_provided="contributed_ytd_brl" in data,
    )
    objective.updated_at = datetime.utcnow()
    session.add(objective)
    session.commit()


def delete_pension_year(
    session: Session,
    portfolio_id: int,
    objective_id: int,
    plan_year: int,
) -> None:
    objective = _require_pension_objective(session, portfolio_id, objective_id)
    assert objective.id is not None
    row = _get_pension_year_row(session, objective.id, plan_year)
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="pension year not found",
        )
    if len(_list_pension_years(session, objective.id)) <= 1:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="cannot delete the last pension year",
        )
    session.delete(row)
    objective.updated_at = datetime.utcnow()
    session.add(objective)
    session.commit()


def migrate_legacy_pension_objectives_to_years(session: Session) -> None:
    objectives = session.exec(select(Objective)).all()
    by_portfolio: dict[int, list[Objective]] = {}
    for objective in objectives:
        if _objective_mode_value(objective) != ObjectiveMode.PENSION_CONTRIBUTION:
            continue
        by_portfolio.setdefault(objective.portfolio_id, []).append(objective)

    for portfolio_id, pension_objectives in by_portfolio.items():
        pension_objectives.sort(key=lambda item: item.id or 0)
        keeper = pension_objectives[0]
        assert keeper.id is not None

        for objective in pension_objectives:
            assert objective.id is not None
            if (
                objective.plan_year is not None
                or objective.annual_gross_income_brl is not None
                or (objective.contributed_ytd_brl or 0.0) > 0
            ):
                target_id = keeper.id if objective.id != keeper.id else objective.id
                plan_year = objective.plan_year or date.today().year
                existing = _get_pension_year_row(session, target_id, plan_year)
                if existing is None:
                    _upsert_pension_year_row(
                        session,
                        target_id,
                        plan_year,
                        annual_gross_income_brl=objective.annual_gross_income_brl,
                        contributed_ytd_brl=objective.contributed_ytd_brl or 0.0,
                        income_provided=True,
                        contributed_provided=True,
                    )
                elif objective.id != keeper.id:
                    if objective.annual_gross_income_brl is not None and existing.annual_gross_income_brl is None:
                        existing.annual_gross_income_brl = objective.annual_gross_income_brl
                    existing.contributed_ytd_brl = max(
                        existing.contributed_ytd_brl or 0.0,
                        objective.contributed_ytd_brl or 0.0,
                    )
                    existing.updated_at = datetime.utcnow()
                    session.add(existing)
                objective.plan_year = None
                objective.annual_gross_income_brl = None
                objective.contributed_ytd_brl = 0.0
                session.add(objective)

        for objective in pension_objectives[1:]:
            assert objective.id is not None
            extra_years = _list_pension_years(session, objective.id)
            for row in extra_years:
                row.objective_id = keeper.id
                session.add(row)
            allocations = session.exec(
                select(ObjectiveAllocation).where(ObjectiveAllocation.objective_id == objective.id),
            ).all()
            for allocation in allocations:
                session.delete(allocation)
            session.delete(objective)

    session.commit()


def delete_objectives_for_portfolio(session: Session, portfolio_id: int) -> None:
    objectives = session.exec(
        select(Objective).where(Objective.portfolio_id == portfolio_id),
    ).all()
    for objective in objectives:
        allocations = session.exec(
            select(ObjectiveAllocation).where(ObjectiveAllocation.objective_id == objective.id),
        ).all()
        for allocation in allocations:
            session.delete(allocation)
        pension_years = session.exec(
            select(PensionContributionYear).where(
                PensionContributionYear.objective_id == objective.id,
            ),
        ).all()
        for row in pension_years:
            session.delete(row)
        session.delete(objective)

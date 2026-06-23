"""Valores de posição por finalidade (investimento vs. reserva / fora do rebalanceamento)."""

from __future__ import annotations

from sqlmodel import Session, select

from app.models.asset import Asset
from app.models.objective import Objective, ObjectiveMode
from app.models.objective_allocation import ObjectiveAllocation
from app.models.position import Position
from app.schemas.patrimony_control import LinkedEmergencyReserveItemRead
from app.services.asset_service import get_asset_by_id
from app.services.fx_service import get_usd_brl_state
from app.services.objective_service import (
    _allocation_financial_metrics,
    _objective_mode_value,
    split_mode_for_asset_type,
)
from app.services.portfolio_service import list_positions
from app.services.position_metrics import position_current_value, value_in_brl


def _allocation_current_value_brl(
    position: Position,
    asset: Asset,
    allocation: ObjectiveAllocation,
    *,
    usd_brl_rate: float | None,
) -> float:
    split_mode = split_mode_for_asset_type(asset.asset_type)
    current_value_brl, _, _, _ = _allocation_financial_metrics(
        position,
        asset,
        quantity=allocation.quantity,
        amount=allocation.amount,
        split_mode=split_mode,
        usd_brl_rate=usd_brl_rate,
    )
    return current_value_brl or 0.0


def _portfolio_allocations(session: Session, portfolio_id: int) -> list[ObjectiveAllocation]:
    objectives = session.exec(
        select(Objective).where(
            Objective.portfolio_id == portfolio_id,
            Objective.is_default.is_(False),
        ),
    ).all()
    objective_ids = [
        objective.id
        for objective in objectives
        if objective.id is not None
        and _objective_mode_value(objective) != ObjectiveMode.PENSION_CONTRIBUTION
    ]
    if not objective_ids:
        return []
    return list(
        session.exec(
            select(ObjectiveAllocation).where(
                ObjectiveAllocation.objective_id.in_(objective_ids),
            ),
        ).all(),
    )


def compute_excluded_rebalance_by_asset(
    session: Session,
    portfolio_id: int,
    *,
    usd_brl_rate: float | None = None,
) -> dict[int, float]:
    """Soma por asset_id o valor BRL de fatias marcadas como não-investimento."""
    if usd_brl_rate is None:
        usd_brl_rate, _ = get_usd_brl_state(session)

    positions_by_asset = {p.asset_id: p for p in list_positions(session, portfolio_id)}
    excluded_by_asset: dict[int, float] = {}

    for allocation in _portfolio_allocations(session, portfolio_id):
        if not allocation.exclude_from_rebalance:
            continue
        position = positions_by_asset.get(allocation.asset_id)
        if position is None:
            continue
        asset = get_asset_by_id(session, allocation.asset_id)
        if asset is None:
            continue
        value_brl = _allocation_current_value_brl(
            position,
            asset,
            allocation,
            usd_brl_rate=usd_brl_rate,
        )
        excluded_by_asset[allocation.asset_id] = (
            excluded_by_asset.get(allocation.asset_id, 0.0) + value_brl
        )

    return excluded_by_asset


def compute_rebalance_value_brl(
    position: Position,
    asset: Asset,
    *,
    usd_brl_rate: float | None,
    excluded_brl: float,
) -> float | None:
    full_brl = value_in_brl(position_current_value(position, asset), asset.currency, usd_brl_rate)
    if full_brl is None:
        return None
    return max(0.0, round(full_brl - excluded_brl, 2))


def compute_linked_emergency_reserve_items(
    session: Session,
    portfolio_id: int,
    *,
    usd_brl_rate: float | None = None,
) -> list[LinkedEmergencyReserveItemRead]:
    if usd_brl_rate is None:
        usd_brl_rate, _ = get_usd_brl_state(session)

    positions_by_asset = {p.asset_id: p for p in list_positions(session, portfolio_id)}
    by_asset: dict[int, LinkedEmergencyReserveItemRead] = {}

    for allocation in _portfolio_allocations(session, portfolio_id):
        if not allocation.is_emergency_reserve:
            continue
        position = positions_by_asset.get(allocation.asset_id)
        if position is None:
            continue
        asset = get_asset_by_id(session, allocation.asset_id)
        if asset is None or asset.id is None:
            continue
        value_brl = _allocation_current_value_brl(
            position,
            asset,
            allocation,
            usd_brl_rate=usd_brl_rate,
        )
        if value_brl <= 1e-9:
            continue
        existing = by_asset.get(asset.id)
        if existing is None:
            by_asset[asset.id] = LinkedEmergencyReserveItemRead(
                asset_id=asset.id,
                symbol=asset.symbol,
                objective_id=allocation.objective_id,
                objective_name=allocation.slice_name,
                amount_brl=round(value_brl, 2),
                location="corretora",
            )
        else:
            existing.amount_brl = round(existing.amount_brl + value_brl, 2)

    return sorted(by_asset.values(), key=lambda item: item.symbol)

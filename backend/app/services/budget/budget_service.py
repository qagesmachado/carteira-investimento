from dataclasses import dataclass
from datetime import date, datetime
from typing import Literal

from fastapi import HTTPException, status
from sqlmodel import Session, delete, func, select

from app.models.budget.category import BudgetCategory
from app.models.budget.income_source import BudgetIncomeSource, IncomeRecurrenceHint
from app.models.budget.month import BudgetMonth, BudgetMonthIncome, BudgetMonthTarget
from app.models.budget.profile import BudgetProfile
from app.models.budget.recurring_expense import BudgetRecurringExpense
from app.models.budget.tag import BudgetTag
from app.models.budget.transaction import BudgetTransaction, BudgetTransactionType
from app.schemas.budget import (
    BudgetCategoryCreate,
    BudgetCategoryKpiRead,
    BudgetCategoryRead,
    BudgetCategoryUpdate,
    BudgetCategoryUsageDetail,
    BudgetCategoryUsageSummary,
    BudgetCategoryUsageTransaction,
    BudgetDashboardRead,
    BudgetIncomeEntryCreate,
    BudgetIncomeEntryUpdate,
    BudgetIncomeSourceCreate,
    BudgetIncomeSourceRead,
    BudgetIncomeSourceUpdate,
    BudgetMonthIncomeItem,
    BudgetMonthIncomesUpdate,
    BudgetMonthPatch,
    BudgetMonthSnapshotRead,
    BudgetMonthTargetItem,
    BudgetMonthTargetsUpdate,
    BudgetProfileCreate,
    BudgetProfileRead,
    BudgetProfileUpdate,
    BudgetRemoveTargetCategories,
    BudgetTagCreate,
    BudgetTagRead,
    BudgetTagUpdate,
    BudgetTransactionCreate,
    BudgetTransactionRead,
    BudgetTransactionUpdate,
    DashboardMonthRow,
    DashboardSliceRead,
)
from app.services.budget.budget_engine import (
    DEFAULT_CATEGORY_SEED,
    DEFAULT_TARGET_PERCENTS,
    build_category_kpi,
    compare_year_months,
    list_timeline_months,
    list_year_months,
    list_year_months_between,
    parse_year_month,
    RECURRING_INCOME_MONTHS,
    DASHBOARD_FORWARD_MONTHS,
    round_money,
    shift_year_month,
    year_month_index,
)
from app.services.budget.profile_service import get_budget_profile

SnapshotView = Literal["full", "targets", "incomes", "expenses", "dashboard", "settlement"]
VALID_SNAPSHOT_VIEWS = frozenset(
    {"full", "targets", "incomes", "expenses", "dashboard", "settlement"}
)


def _profile_to_read(profile: BudgetProfile) -> BudgetProfileRead:
    return BudgetProfileRead(id=profile.id, name=profile.name, description=profile.description)


def _seed_categories(session: Session, profile_id: int) -> list[BudgetCategory]:
    categories: list[BudgetCategory] = []
    for index, (name, color) in enumerate(DEFAULT_CATEGORY_SEED):
        cat = BudgetCategory(
            profile_id=profile_id,
            name=name,
            sort_order=index,
            color=color,
        )
        session.add(cat)
        categories.append(cat)
    session.flush()
    return categories


def create_budget_profile(session: Session, payload: BudgetProfileCreate) -> BudgetProfileRead:
    existing = session.exec(select(BudgetProfile).where(BudgetProfile.name == payload.name)).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="profile name already exists")
    profile = BudgetProfile(name=payload.name.strip(), description=payload.description)
    session.add(profile)
    session.flush()
    _seed_categories(session, profile.id)
    session.commit()
    session.refresh(profile)
    return _profile_to_read(profile)


def update_budget_profile(
    session: Session, profile_id: int, payload: BudgetProfileUpdate
) -> BudgetProfileRead:
    profile = get_budget_profile(session, profile_id)
    if payload.name is not None:
        name = payload.name.strip()
        clash = session.exec(
            select(BudgetProfile).where(BudgetProfile.name == name, BudgetProfile.id != profile_id)
        ).first()
        if clash:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="profile name already exists")
        profile.name = name
    if payload.description is not None:
        profile.description = payload.description
    session.add(profile)
    session.commit()
    session.refresh(profile)
    return _profile_to_read(profile)


def delete_budget_profile(session: Session, profile_id: int) -> None:
    from app.services.property_financing_service import delete_property_financings_for_profile

    profile = get_budget_profile(session, profile_id)
    delete_property_financings_for_profile(session, profile_id)
    session.exec(delete(BudgetTransaction).where(BudgetTransaction.profile_id == profile_id))
    session.exec(delete(BudgetRecurringExpense).where(BudgetRecurringExpense.profile_id == profile_id))
    months = session.exec(select(BudgetMonth).where(BudgetMonth.profile_id == profile_id)).all()
    month_ids = [m.id for m in months if m.id is not None]
    if month_ids:
        session.exec(delete(BudgetMonthIncome).where(BudgetMonthIncome.month_id.in_(month_ids)))
        session.exec(delete(BudgetMonthTarget).where(BudgetMonthTarget.month_id.in_(month_ids)))
    session.exec(delete(BudgetMonth).where(BudgetMonth.profile_id == profile_id))
    session.exec(delete(BudgetIncomeSource).where(BudgetIncomeSource.profile_id == profile_id))
    session.exec(delete(BudgetTag).where(BudgetTag.profile_id == profile_id))
    session.exec(delete(BudgetCategory).where(BudgetCategory.profile_id == profile_id))
    session.delete(profile)
    session.commit()


def list_profiles_read(session: Session) -> list[BudgetProfileRead]:
    return [_profile_to_read(p) for p in session.exec(select(BudgetProfile).order_by(BudgetProfile.name)).all()]


def _parse_date(value: str) -> date:
    try:
        return date.fromisoformat(value)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=f"invalid date: {value}") from exc


def _validate_year_month(year_month: str) -> None:
    parse_year_month(year_month)


def _get_categories(session: Session, profile_id: int) -> list[BudgetCategory]:
    return list(
        session.exec(
            select(BudgetCategory)
            .where(BudgetCategory.profile_id == profile_id)
            .order_by(BudgetCategory.sort_order, BudgetCategory.id)
        ).all()
    )


def ensure_budget_month(session: Session, profile_id: int, year_month: str) -> BudgetMonth:
    _validate_year_month(year_month)
    get_budget_profile(session, profile_id)
    month = session.exec(
        select(BudgetMonth).where(
            BudgetMonth.profile_id == profile_id,
            BudgetMonth.year_month == year_month,
        )
    ).first()
    if month:
        return month
    # Não semeia metas: um mês sem linhas próprias herda do mês anterior (ver _effective_targets).
    month = BudgetMonth(profile_id=profile_id, year_month=year_month)
    session.add(month)
    session.commit()
    session.refresh(month)
    return month


def _transaction_to_read(
    tx: BudgetTransaction,
    categories_by_id: dict[int, BudgetCategory] | None = None,
    tags_by_id: dict[int, BudgetTag] | None = None,
    *,
    session: Session | None = None,
) -> BudgetTransactionRead:
    category_name = None
    tag_name = None
    tag_color = None
    if tx.category_id:
        cat = (categories_by_id or {}).get(tx.category_id)
        if cat is None and session is not None:
            cat = session.get(BudgetCategory, tx.category_id)
        category_name = cat.name if cat else None
    if tx.tag_id:
        tag = (tags_by_id or {}).get(tx.tag_id)
        if tag is None and session is not None:
            tag = session.get(BudgetTag, tx.tag_id)
        if tag:
            tag_name = tag.name
            tag_color = tag.color
    return BudgetTransactionRead(
        id=tx.id,
        profile_id=tx.profile_id,
        month_id=tx.month_id,
        transaction_type=tx.transaction_type.value,
        event_date=tx.event_date.isoformat(),
        description=tx.description,
        amount_brl=tx.amount_brl,
        category_id=tx.category_id,
        category_name=category_name,
        tag_id=tx.tag_id,
        tag_name=tag_name,
        tag_color=tag_color,
        income_source_id=tx.income_source_id,
        notes=tx.notes,
        recurring=tx.recurring_expense_id is not None,
        recurring_expense_id=tx.recurring_expense_id,
        settled=bool(tx.settled),
    )


def _income_is_recurring_from_source(source: BudgetIncomeSource | None) -> bool:
    return source is not None and source.recurrence_hint == IncomeRecurrenceHint.RECURRING


def _income_is_recurring(session: Session, income: BudgetMonthIncome) -> bool:
    if income.source_id is None:
        return False
    source = session.get(BudgetIncomeSource, income.source_id)
    return _income_is_recurring_from_source(source)


def _income_to_read(
    income: BudgetMonthIncome,
    sources_by_id: dict[int, BudgetIncomeSource] | None = None,
    *,
    session: Session | None = None,
) -> BudgetMonthIncomeItem:
    source = None
    if income.source_id is not None:
        source = (sources_by_id or {}).get(income.source_id)
        if source is None and session is not None:
            source = session.get(BudgetIncomeSource, income.source_id)
    return BudgetMonthIncomeItem(
        id=income.id,
        source_id=income.source_id,
        label=income.label,
        amount_brl=income.amount_brl,
        recurring=_income_is_recurring_from_source(source),
        received=bool(income.received),
    )


@dataclass(frozen=True)
class EffectiveTarget:
    category_id: int
    percent: float
    name: str
    color: str


def _month_has_targets(session: Session, month_id: int) -> bool:
    row = session.exec(
        select(BudgetMonthTarget.id).where(BudgetMonthTarget.month_id == month_id)
    ).first()
    return row is not None


def _find_targets_source_month(
    session: Session, profile_id: int, year_month: str
) -> BudgetMonth | None:
    """Mês mais recente (<= year_month) que possui linhas próprias de metas."""
    return session.exec(
        select(BudgetMonth)
        .join(BudgetMonthTarget, BudgetMonthTarget.month_id == BudgetMonth.id)
        .where(
            BudgetMonth.profile_id == profile_id,
            BudgetMonth.year_month <= year_month,
        )
        .order_by(BudgetMonth.year_month.desc())
    ).first()


def _effective_targets(
    session: Session, profile_id: int, month: BudgetMonth
) -> tuple[list[EffectiveTarget], bool]:
    """Conjunto efetivo de metas do mês: próprio > herdado do anterior > padrões.

    Retorna (metas, inherited) onde `inherited` indica que o conjunto veio de um
    mês anterior (não do próprio mês nem dos padrões).
    """
    categories = _get_categories(session, profile_id)
    cat_by_id = {c.id: c for c in categories if c.id is not None}
    order_index = {c.id: index for index, c in enumerate(categories)}

    own = _month_has_targets(session, month.id)
    source_month = month if own else _find_targets_source_month(session, profile_id, month.year_month)
    inherited = (not own) and source_month is not None

    if source_month is not None:
        rows = session.exec(
            select(BudgetMonthTarget).where(BudgetMonthTarget.month_id == source_month.id)
        ).all()
        result: list[EffectiveTarget] = []
        for row in rows:
            cat = cat_by_id.get(row.category_id)
            if cat is None:
                continue
            result.append(
                EffectiveTarget(
                    category_id=row.category_id,
                    percent=row.percent,
                    name=row.name_override or cat.name,
                    color=row.color_override or cat.color,
                )
            )
        result.sort(key=lambda t: order_index.get(t.category_id, len(categories)))
        return result, inherited

    defaults = [
        EffectiveTarget(category_id=cat.id, percent=percent, name=cat.name, color=cat.color)
        for cat, percent in zip(categories, DEFAULT_TARGET_PERCENTS, strict=False)
    ]
    return defaults, False


def _effective_planned_income(
    session: Session, profile_id: int, month: BudgetMonth, income_total: float
) -> float:
    if month.planned_income_brl is not None:
        return month.planned_income_brl
    prev = session.exec(
        select(BudgetMonth)
        .where(
            BudgetMonth.profile_id == profile_id,
            BudgetMonth.year_month < month.year_month,
            BudgetMonth.planned_income_brl.is_not(None),
        )
        .order_by(BudgetMonth.year_month.desc())
    ).first()
    if prev is not None and prev.planned_income_brl is not None:
        return prev.planned_income_brl
    return income_total


def _categories_by_id(session: Session, profile_id: int) -> dict[int, BudgetCategory]:
    return {cat.id: cat for cat in _get_categories(session, profile_id) if cat.id is not None}


def _tags_by_id(session: Session, profile_id: int, tag_ids: set[int]) -> dict[int, BudgetTag]:
    if not tag_ids:
        return {}
    rows = session.exec(
        select(BudgetTag).where(BudgetTag.profile_id == profile_id, BudgetTag.id.in_(tag_ids))
    ).all()
    return {tag.id: tag for tag in rows if tag.id is not None}


def _income_sources_by_id(session: Session, source_ids: set[int]) -> dict[int, BudgetIncomeSource]:
    if not source_ids:
        return {}
    rows = session.exec(select(BudgetIncomeSource).where(BudgetIncomeSource.id.in_(source_ids))).all()
    return {source.id: source for source in rows if source.id is not None}


def _month_income_total(session: Session, month_id: int) -> float:
    total = session.exec(
        select(func.coalesce(func.sum(BudgetMonthIncome.amount_brl), 0.0)).where(
            BudgetMonthIncome.month_id == month_id
        )
    ).one()
    return round_money(float(total))


def _month_expense_total(session: Session, month_id: int) -> float:
    total = session.exec(
        select(func.coalesce(func.sum(BudgetTransaction.amount_brl), 0.0)).where(
            BudgetTransaction.month_id == month_id,
            BudgetTransaction.transaction_type == BudgetTransactionType.EXPENSE,
        )
    ).one()
    return round_money(float(total))


def _expense_stats_by_category(
    transactions: list[BudgetTransaction],
) -> tuple[dict[int, float], dict[int, int]]:
    spent_by_category: dict[int, float] = {}
    count_by_category: dict[int, int] = {}
    for tx in transactions:
        if tx.transaction_type != BudgetTransactionType.EXPENSE or tx.category_id is None:
            continue
        spent_by_category[tx.category_id] = spent_by_category.get(tx.category_id, 0.0) + tx.amount_brl
        count_by_category[tx.category_id] = count_by_category.get(tx.category_id, 0) + 1
    return spent_by_category, count_by_category


def _kpi_from_effective(
    target: EffectiveTarget,
    planned: float,
    spent: float,
    count: int,
) -> BudgetCategoryKpiRead:
    kpi = build_category_kpi(
        category_id=target.category_id,
        category_name=target.name,
        color=target.color,
        percent=target.percent,
        planned_income_brl=planned,
        spent_brl=round_money(spent),
        transaction_count=count,
    )
    return BudgetCategoryKpiRead(
        category_id=kpi.category_id,
        category_name=kpi.category_name,
        color=kpi.color,
        percent=kpi.percent,
        target_brl=kpi.target_brl,
        spent_brl=kpi.spent_brl,
        remaining_brl=kpi.remaining_brl,
        usage_percent=kpi.usage_percent,
        exceeded=kpi.exceeded,
        transaction_count=kpi.transaction_count,
    )


def _build_effective_category_kpis(
    session: Session,
    profile_id: int,
    effective: list[EffectiveTarget],
    planned: float,
    spent_by_category: dict[int, float],
    count_by_category: dict[int, int],
) -> list[BudgetCategoryKpiRead]:
    """KPIs das metas do mês + categorias com gasto fora do conjunto de metas."""
    category_kpis: list[BudgetCategoryKpiRead] = []
    seen: set[int] = set()
    for target in effective:
        seen.add(target.category_id)
        category_kpis.append(
            _kpi_from_effective(
                target,
                planned,
                spent_by_category.get(target.category_id, 0.0),
                count_by_category.get(target.category_id, 0),
            )
        )
    extras = {cid for cid in spent_by_category if cid not in seen}
    if extras:
        categories = _get_categories(session, profile_id)
        order_index = {c.id: index for index, c in enumerate(categories)}
        cat_by_id = {c.id: c for c in categories if c.id is not None}
        for cid in sorted(extras, key=lambda c: order_index.get(c, len(categories))):
            cat = cat_by_id.get(cid)
            if cat is None:
                continue
            category_kpis.append(
                _kpi_from_effective(
                    EffectiveTarget(category_id=cid, percent=0.0, name=cat.name, color=cat.color),
                    planned,
                    spent_by_category.get(cid, 0.0),
                    count_by_category.get(cid, 0),
                )
            )
    return category_kpis


def _build_target_only_category_kpis(
    effective: list[EffectiveTarget],
    planned: float,
) -> list[BudgetCategoryKpiRead]:
    return [_kpi_from_effective(target, planned, 0.0, 0) for target in effective]


def _snapshot_response(
    *,
    profile_id: int,
    year_month: str,
    month: BudgetMonth,
    income_total: float,
    expense_total: float,
    categories: list[BudgetCategoryKpiRead],
    incomes: list[BudgetMonthIncomeItem],
    transactions: list[BudgetTransactionRead],
    targets_inherited: bool = False,
) -> BudgetMonthSnapshotRead:
    income_usage = round_money(expense_total / income_total * 100.0) if income_total > 0 else 0.0
    return BudgetMonthSnapshotRead(
        profile_id=profile_id,
        year_month=year_month,
        planned_income_brl=month.planned_income_brl,
        income_total_brl=income_total,
        expense_total_brl=expense_total,
        remaining_brl=round_money(income_total - expense_total),
        income_usage_percent=income_usage,
        categories=categories,
        incomes=incomes,
        transactions=transactions,
        targets_inherited=targets_inherited,
    )


def _load_expense_transactions(session: Session, month_id: int) -> list[BudgetTransaction]:
    return list(
        session.exec(
            select(BudgetTransaction)
            .where(
                BudgetTransaction.month_id == month_id,
                BudgetTransaction.transaction_type == BudgetTransactionType.EXPENSE,
            )
            .order_by(BudgetTransaction.event_date.desc(), BudgetTransaction.id.desc())
        ).all()
    )


def _load_all_transactions(session: Session, month_id: int) -> list[BudgetTransaction]:
    return list(
        session.exec(
            select(BudgetTransaction)
            .where(BudgetTransaction.month_id == month_id)
            .order_by(BudgetTransaction.event_date.desc(), BudgetTransaction.id.desc())
        ).all()
    )


def _transactions_to_read(
    session: Session,
    profile_id: int,
    transactions: list[BudgetTransaction],
) -> list[BudgetTransactionRead]:
    categories_by_id = _categories_by_id(session, profile_id)
    tag_ids = {tx.tag_id for tx in transactions if tx.tag_id is not None}
    tags_by_id = _tags_by_id(session, profile_id, tag_ids)
    return [
        _transaction_to_read(tx, categories_by_id, tags_by_id) for tx in transactions
    ]


def _incomes_to_read(session: Session, incomes: list[BudgetMonthIncome]) -> list[BudgetMonthIncomeItem]:
    source_ids = {income.source_id for income in incomes if income.source_id is not None}
    sources_by_id = _income_sources_by_id(session, source_ids)
    return [_income_to_read(income, sources_by_id) for income in incomes]


def build_month_snapshot(
    session: Session,
    profile_id: int,
    year_month: str,
    *,
    skip_recurring_sync: bool = False,
    view: SnapshotView = "full",
) -> BudgetMonthSnapshotRead:
    if view not in VALID_SNAPSHOT_VIEWS:
        raise HTTPException(status_code=422, detail=f"invalid snapshot view: {view}")
    if not skip_recurring_sync:
        from app.services.budget.recurring_expense import sync_recurring_expenses_for_month

        sync_recurring_expenses_for_month(session, profile_id, year_month)

    month = ensure_budget_month(session, profile_id, year_month)
    effective_targets, targets_inherited = _effective_targets(session, profile_id, month)

    if view == "targets":
        income_total = _month_income_total(session, month.id)
        planned = _effective_planned_income(session, profile_id, month, income_total)
        return _snapshot_response(
            profile_id=profile_id,
            year_month=year_month,
            month=month,
            income_total=income_total,
            expense_total=0.0,
            categories=_build_target_only_category_kpis(effective_targets, planned),
            incomes=[],
            transactions=[],
            targets_inherited=targets_inherited,
        )

    if view == "incomes":
        incomes = list(
            session.exec(select(BudgetMonthIncome).where(BudgetMonthIncome.month_id == month.id)).all()
        )
        income_total = round_money(sum(i.amount_brl for i in incomes))
        return _snapshot_response(
            profile_id=profile_id,
            year_month=year_month,
            month=month,
            income_total=income_total,
            expense_total=0.0,
            categories=[],
            incomes=_incomes_to_read(session, incomes),
            transactions=[],
        )

    if view == "settlement":
        incomes = list(
            session.exec(select(BudgetMonthIncome).where(BudgetMonthIncome.month_id == month.id)).all()
        )
        sources_by_id = {
            s.id: s
            for s in session.exec(
                select(BudgetIncomeSource).where(BudgetIncomeSource.profile_id == profile_id)
            ).all()
            if s.id is not None
        }
        recurring_incomes = [
            income
            for income in incomes
            if _income_is_recurring_from_source(
                sources_by_id.get(income.source_id) if income.source_id is not None else None
            )
        ]
        transactions = [
            tx
            for tx in _load_expense_transactions(session, month.id)
            if tx.recurring_expense_id is not None
        ]
        income_total = round_money(sum(i.amount_brl for i in recurring_incomes))
        expense_total = round_money(sum(t.amount_brl for t in transactions))
        return _snapshot_response(
            profile_id=profile_id,
            year_month=year_month,
            month=month,
            income_total=income_total,
            expense_total=expense_total,
            categories=[],
            incomes=_incomes_to_read(session, recurring_incomes),
            transactions=_transactions_to_read(session, profile_id, transactions),
        )

    if view in ("expenses", "dashboard"):
        transactions = _load_expense_transactions(session, month.id)
        income_total = _month_income_total(session, month.id)
        expense_total = round_money(sum(t.amount_brl for t in transactions))
        planned = _effective_planned_income(session, profile_id, month, income_total)
        spent_by_category, count_by_category = _expense_stats_by_category(transactions)
        category_kpis = _build_effective_category_kpis(
            session, profile_id, effective_targets, planned, spent_by_category, count_by_category
        )
        tx_reads = _transactions_to_read(session, profile_id, transactions)
        return _snapshot_response(
            profile_id=profile_id,
            year_month=year_month,
            month=month,
            income_total=income_total,
            expense_total=expense_total,
            categories=category_kpis,
            incomes=[],
            transactions=tx_reads,
            targets_inherited=targets_inherited,
        )

    transactions = _load_all_transactions(session, month.id)
    incomes = list(
        session.exec(select(BudgetMonthIncome).where(BudgetMonthIncome.month_id == month.id)).all()
    )
    income_total = round_money(sum(i.amount_brl for i in incomes))
    expense_total = round_money(
        sum(t.amount_brl for t in transactions if t.transaction_type == BudgetTransactionType.EXPENSE)
    )
    planned = _effective_planned_income(session, profile_id, month, income_total)
    spent_by_category, count_by_category = _expense_stats_by_category(transactions)
    return _snapshot_response(
        profile_id=profile_id,
        year_month=year_month,
        month=month,
        income_total=income_total,
        expense_total=expense_total,
        categories=_build_effective_category_kpis(
            session, profile_id, effective_targets, planned, spent_by_category, count_by_category
        ),
        incomes=_incomes_to_read(session, incomes),
        transactions=_transactions_to_read(session, profile_id, transactions),
        targets_inherited=targets_inherited,
    )


def patch_budget_month(
    session: Session, profile_id: int, year_month: str, payload: BudgetMonthPatch
) -> BudgetMonthSnapshotRead:
    month = ensure_budget_month(session, profile_id, year_month)
    if payload.planned_income_brl is not None:
        month.planned_income_brl = payload.planned_income_brl
        session.add(month)
        session.commit()
    return build_month_snapshot(session, profile_id, year_month)


def _propagate_categories_to_following_months(
    session: Session,
    profile_id: int,
    year_month: str,
    category_ids: list[int],
) -> None:
    """Inclui categorias (0%) nos meses > year_month que já têm metas próprias.

    Meses sem linhas próprias continuam herdando e não são materializados aqui.
    """
    if not category_ids:
        return
    valid_ids = {c.id for c in _get_categories(session, profile_id)}
    to_add = [cid for cid in dict.fromkeys(category_ids) if cid in valid_ids]
    if not to_add:
        return
    following = session.exec(
        select(BudgetMonth).where(
            BudgetMonth.profile_id == profile_id,
            BudgetMonth.year_month > year_month,
        )
    ).all()
    for following_month in following:
        if following_month.id is None or not _month_has_targets(session, following_month.id):
            continue
        existing_ids = {
            row.category_id
            for row in session.exec(
                select(BudgetMonthTarget).where(BudgetMonthTarget.month_id == following_month.id)
            ).all()
        }
        for category_id in to_add:
            if category_id in existing_ids:
                continue
            session.add(
                BudgetMonthTarget(
                    month_id=following_month.id,
                    category_id=category_id,
                    percent=0.0,
                )
            )


def _copy_targets_to_following_months(
    session: Session,
    profile_id: int,
    year_month: str,
    targets: list,
) -> None:
    """Substitui o conjunto de metas dos meses seguintes customizados pelo conjunto atual."""
    new_ids = {item.category_id for item in targets}
    following = session.exec(
        select(BudgetMonth).where(
            BudgetMonth.profile_id == profile_id,
            BudgetMonth.year_month > year_month,
        )
    ).all()
    for following_month in following:
        if following_month.id is None or not _month_has_targets(session, following_month.id):
            continue
        existing = {
            row.category_id: row
            for row in session.exec(
                select(BudgetMonthTarget).where(BudgetMonthTarget.month_id == following_month.id)
            ).all()
        }
        for category_id in set(existing.keys()) - new_ids:
            _assert_category_removable_from_month(
                session,
                profile_id,
                following_month.year_month,
                following_month.id,
                category_id,
            )
        session.exec(delete(BudgetMonthTarget).where(BudgetMonthTarget.month_id == following_month.id))
        session.flush()
        for item in targets:
            prev = existing.get(item.category_id)
            session.add(
                BudgetMonthTarget(
                    month_id=following_month.id,
                    category_id=item.category_id,
                    percent=item.percent,
                    name_override=prev.name_override if prev else None,
                    color_override=prev.color_override if prev else None,
                )
            )


def _category_has_month_expenses(
    session: Session, profile_id: int, month_id: int, category_id: int
) -> bool:
    tx = session.exec(
        select(BudgetTransaction.id).where(
            BudgetTransaction.profile_id == profile_id,
            BudgetTransaction.month_id == month_id,
            BudgetTransaction.category_id == category_id,
            BudgetTransaction.transaction_type == BudgetTransactionType.EXPENSE,
        )
    ).first()
    return tx is not None


def _category_has_active_recurring_covering(
    session: Session, profile_id: int, year_month: str, category_id: int
) -> bool:
    """Recorrência ativa que cobre o mês (start <= ym e sem fim ou fim >= ym)."""
    rules = session.exec(
        select(BudgetRecurringExpense).where(
            BudgetRecurringExpense.profile_id == profile_id,
            BudgetRecurringExpense.category_id == category_id,
            BudgetRecurringExpense.is_active == True,  # noqa: E712
            BudgetRecurringExpense.start_year_month <= year_month,
        )
    ).all()
    for rule in rules:
        if rule.end_year_month is None or compare_year_months(rule.end_year_month, year_month) >= 0:
            return True
    return False


def _assert_category_removable_from_month(
    session: Session, profile_id: int, year_month: str, month_id: int, category_id: int
) -> None:
    if _category_has_month_expenses(session, profile_id, month_id, category_id):
        raise HTTPException(status_code=409, detail="category has transactions")
    if _category_has_active_recurring_covering(session, profile_id, year_month, category_id):
        raise HTTPException(status_code=409, detail="category has recurring expenses")


def _remove_categories_from_month_targets(
    session: Session,
    month_id: int,
    category_ids: list[int],
) -> None:
    if not category_ids:
        return
    session.exec(
        delete(BudgetMonthTarget).where(
            BudgetMonthTarget.month_id == month_id,
            BudgetMonthTarget.category_id.in_(category_ids),
        )
    )


def remove_target_categories(
    session: Session,
    profile_id: int,
    year_month: str,
    payload: BudgetRemoveTargetCategories,
) -> BudgetMonthSnapshotRead:
    """Remove categorias dos conjuntos de metas do mês e/ou dos meses seguintes."""
    _validate_year_month(year_month)
    get_budget_profile(session, profile_id)
    valid_ids = {c.id for c in _get_categories(session, profile_id)}
    category_ids = [cid for cid in dict.fromkeys(payload.category_ids) if cid in valid_ids]
    if not category_ids:
        raise HTTPException(status_code=422, detail="no valid category_ids")

    month = ensure_budget_month(session, profile_id, year_month)
    if payload.apply_to_current:
        for category_id in category_ids:
            _assert_category_removable_from_month(
                session, profile_id, year_month, month.id, category_id
            )
        if _month_has_targets(session, month.id):
            remaining = session.exec(
                select(BudgetMonthTarget).where(BudgetMonthTarget.month_id == month.id)
            ).all()
            remaining_ids = {row.category_id for row in remaining} - set(category_ids)
            if not remaining_ids:
                raise HTTPException(
                    status_code=422,
                    detail="at least one target required",
                )
            _remove_categories_from_month_targets(session, month.id, category_ids)
        else:
            # Mês herdado: materializa o conjunto efetivo sem as categorias removidas.
            effective, _ = _effective_targets(session, profile_id, month)
            kept = [t for t in effective if t.category_id not in set(category_ids)]
            if not kept:
                raise HTTPException(status_code=422, detail="at least one target required")
            for target in kept:
                session.add(
                    BudgetMonthTarget(
                        month_id=month.id,
                        category_id=target.category_id,
                        percent=target.percent,
                    )
                )

    if payload.apply_to_following_months:
        following = session.exec(
            select(BudgetMonth).where(
                BudgetMonth.profile_id == profile_id,
                BudgetMonth.year_month > year_month,
            )
        ).all()
        for following_month in following:
            if following_month.id is None or not _month_has_targets(session, following_month.id):
                continue
            remaining = session.exec(
                select(BudgetMonthTarget).where(BudgetMonthTarget.month_id == following_month.id)
            ).all()
            present = {row.category_id for row in remaining}
            to_remove = [cid for cid in category_ids if cid in present]
            if not to_remove:
                continue
            remaining_ids = present - set(to_remove)
            if not remaining_ids:
                continue
            for category_id in to_remove:
                _assert_category_removable_from_month(
                    session,
                    profile_id,
                    following_month.year_month,
                    following_month.id,
                    category_id,
                )
            _remove_categories_from_month_targets(session, following_month.id, to_remove)

    session.commit()
    return build_month_snapshot(session, profile_id, year_month)


def update_month_targets(
    session: Session, profile_id: int, year_month: str, payload: BudgetMonthTargetsUpdate
) -> BudgetMonthSnapshotRead:
    month = ensure_budget_month(session, profile_id, year_month)
    if payload.planned_income_brl is not None:
        month.planned_income_brl = payload.planned_income_brl
    valid_ids = {c.id for c in _get_categories(session, profile_id)}
    if not payload.targets:
        raise HTTPException(status_code=422, detail="at least one target required")
    total_percent = round_money(sum(t.percent for t in payload.targets))
    if abs(total_percent - 100.0) > 0.01:
        raise HTTPException(
            status_code=422,
            detail=f"percents must sum to 100, got {total_percent}",
        )
    seen: set[int] = set()
    for item in payload.targets:
        if item.category_id not in valid_ids:
            raise HTTPException(status_code=422, detail=f"invalid category_id: {item.category_id}")
        if item.category_id in seen:
            raise HTTPException(status_code=422, detail=f"duplicate category_id: {item.category_id}")
        seen.add(item.category_id)
    # Categorias que saem do conjunto: bloqueia se houver despesa/recorrência no mês.
    existing_rows = {
        t.category_id: t
        for t in session.exec(
            select(BudgetMonthTarget).where(BudgetMonthTarget.month_id == month.id)
        ).all()
    }
    if existing_rows:
        previous_ids = set(existing_rows.keys())
    else:
        effective, _ = _effective_targets(session, profile_id, month)
        previous_ids = {t.category_id for t in effective}
    removed_ids = previous_ids - seen
    for category_id in removed_ids:
        _assert_category_removable_from_month(
            session, profile_id, year_month, month.id, category_id
        )
    session.exec(delete(BudgetMonthTarget).where(BudgetMonthTarget.month_id == month.id))
    session.flush()
    for item in payload.targets:
        prev = existing_rows.get(item.category_id)
        name_override = item.name if item.name else (prev.name_override if prev else None)
        color_override = item.color if item.color else (prev.color_override if prev else None)
        session.add(
            BudgetMonthTarget(
                month_id=month.id,
                category_id=item.category_id,
                percent=item.percent,
                name_override=name_override,
                color_override=color_override,
            )
        )
    if payload.apply_to_following_months:
        _copy_targets_to_following_months(session, profile_id, year_month, payload.targets)
    else:
        _propagate_categories_to_following_months(
            session, profile_id, year_month, payload.propagate_category_ids
        )
    session.add(month)
    session.commit()
    return build_month_snapshot(session, profile_id, year_month)


def _category_to_read(category: BudgetCategory) -> BudgetCategoryRead:
    return BudgetCategoryRead(
        id=category.id,
        profile_id=category.profile_id,
        name=category.name,
        sort_order=category.sort_order,
        color=category.color,
    )


def list_categories(session: Session, profile_id: int) -> list[BudgetCategoryRead]:
    get_budget_profile(session, profile_id)
    return [_category_to_read(c) for c in _get_categories(session, profile_id)]


def _category_usage_counts(
    session: Session, profile_id: int, category_id: int
) -> tuple[int, int]:
    tx_count = session.exec(
        select(func.count())
        .select_from(BudgetTransaction)
        .where(
            BudgetTransaction.profile_id == profile_id,
            BudgetTransaction.category_id == category_id,
        )
    ).one()
    rec_count = session.exec(
        select(func.count())
        .select_from(BudgetRecurringExpense)
        .where(
            BudgetRecurringExpense.profile_id == profile_id,
            BudgetRecurringExpense.category_id == category_id,
        )
    ).one()
    return int(tx_count), int(rec_count)


def _category_usage_summary(
    session: Session, category: BudgetCategory
) -> BudgetCategoryUsageSummary:
    assert category.id is not None
    tx_count, rec_count = _category_usage_counts(session, category.profile_id, category.id)
    return BudgetCategoryUsageSummary(
        id=category.id,
        profile_id=category.profile_id,
        name=category.name,
        sort_order=category.sort_order,
        color=category.color,
        transaction_count=tx_count,
        recurring_count=rec_count,
        can_delete=tx_count == 0 and rec_count == 0,
    )


def list_categories_usage(session: Session, profile_id: int) -> list[BudgetCategoryUsageSummary]:
    get_budget_profile(session, profile_id)
    return [_category_usage_summary(session, c) for c in _get_categories(session, profile_id)]


def get_category_usage(
    session: Session, profile_id: int, category_id: int
) -> BudgetCategoryUsageDetail:
    from app.services.budget.recurring_expense import recurring_expense_to_read

    category = _get_category(session, profile_id, category_id)
    summary = _category_usage_summary(session, category)
    tx_rows = session.exec(
        select(BudgetTransaction, BudgetMonth.year_month)
        .join(BudgetMonth, BudgetTransaction.month_id == BudgetMonth.id)
        .where(
            BudgetTransaction.profile_id == profile_id,
            BudgetTransaction.category_id == category_id,
        )
        .order_by(BudgetTransaction.event_date.desc(), BudgetTransaction.id.desc())
    ).all()
    transactions = [
        BudgetCategoryUsageTransaction(
            id=tx.id,
            event_date=tx.event_date.isoformat(),
            year_month=year_month,
            description=tx.description,
            amount_brl=tx.amount_brl,
            recurring=tx.recurring_expense_id is not None,
        )
        for tx, year_month in tx_rows
        if tx.id is not None
    ]
    rules = session.exec(
        select(BudgetRecurringExpense)
        .where(
            BudgetRecurringExpense.profile_id == profile_id,
            BudgetRecurringExpense.category_id == category_id,
        )
        .order_by(BudgetRecurringExpense.description)
    ).all()
    return BudgetCategoryUsageDetail(
        **summary.model_dump(),
        transactions=transactions,
        recurring_expenses=[recurring_expense_to_read(session, rule) for rule in rules],
    )


def delete_category_expenses(
    session: Session, profile_id: int, category_id: int
) -> BudgetCategoryUsageDetail:
    """Remove todas as despesas (pontuais e recorrentes) vinculadas à meta."""
    from app.services.budget.recurring_expense import _delete_rule_transactions

    _get_category(session, profile_id, category_id)
    rules = session.exec(
        select(BudgetRecurringExpense).where(
            BudgetRecurringExpense.profile_id == profile_id,
            BudgetRecurringExpense.category_id == category_id,
        )
    ).all()
    for rule in rules:
        if rule.id is not None:
            _delete_rule_transactions(session, rule.id)
        session.delete(rule)
    session.flush()
    txs = session.exec(
        select(BudgetTransaction).where(
            BudgetTransaction.profile_id == profile_id,
            BudgetTransaction.category_id == category_id,
        )
    ).all()
    for tx in txs:
        session.delete(tx)
    session.commit()
    return get_category_usage(session, profile_id, category_id)


def create_category(
    session: Session, profile_id: int, payload: BudgetCategoryCreate
) -> BudgetCategoryRead:
    get_budget_profile(session, profile_id)
    name = payload.name.strip()
    clash = session.exec(
        select(BudgetCategory).where(
            BudgetCategory.profile_id == profile_id, BudgetCategory.name == name
        )
    ).first()
    if clash:
        raise HTTPException(status_code=409, detail="category name already exists")
    existing = _get_categories(session, profile_id)
    next_order = max((c.sort_order for c in existing), default=-1) + 1
    category = BudgetCategory(
        profile_id=profile_id,
        name=name,
        sort_order=next_order,
        color=payload.color,
    )
    session.add(category)
    session.commit()
    session.refresh(category)
    return _category_to_read(category)


def _get_category(session: Session, profile_id: int, category_id: int) -> BudgetCategory:
    category = session.get(BudgetCategory, category_id)
    if category is None or category.profile_id != profile_id:
        raise HTTPException(status_code=404, detail="category not found")
    return category


def _profile_month_ids(session: Session, profile_id: int) -> list[int]:
    return [
        m.id
        for m in session.exec(
            select(BudgetMonth).where(BudgetMonth.profile_id == profile_id)
        ).all()
        if m.id is not None
    ]


def update_category(
    session: Session, profile_id: int, category_id: int, payload: BudgetCategoryUpdate
) -> BudgetCategoryRead:
    category = _get_category(session, profile_id, category_id)
    scope = payload.scope or "all"
    if scope not in ("all", "from_month"):
        raise HTTPException(status_code=422, detail="invalid scope")

    if scope == "all":
        if payload.name is not None:
            name = payload.name.strip()
            clash = session.exec(
                select(BudgetCategory).where(
                    BudgetCategory.profile_id == profile_id,
                    BudgetCategory.name == name,
                    BudgetCategory.id != category_id,
                )
            ).first()
            if clash:
                raise HTTPException(status_code=409, detail="category name already exists")
            category.name = name
        if payload.color is not None:
            category.color = payload.color
        session.add(category)
        # Limpa overrides por mês: todos os meses passam a exibir o catálogo.
        month_ids = _profile_month_ids(session, profile_id)
        if month_ids:
            rows = session.exec(
                select(BudgetMonthTarget).where(
                    BudgetMonthTarget.month_id.in_(month_ids),
                    BudgetMonthTarget.category_id == category_id,
                )
            ).all()
            for row in rows:
                row.name_override = None
                row.color_override = None
                session.add(row)
        session.commit()
        session.refresh(category)
        return _category_to_read(category)

    # scope == "from_month": aplica override do mês informado em diante; catálogo intacto.
    if payload.year_month is None:
        raise HTTPException(status_code=422, detail="year_month required for from_month scope")
    _validate_year_month(payload.year_month)
    month = ensure_budget_month(session, profile_id, payload.year_month)
    if not _month_has_targets(session, month.id):
        effective, _ = _effective_targets(session, profile_id, month)
        for target in effective:
            session.add(
                BudgetMonthTarget(
                    month_id=month.id,
                    category_id=target.category_id,
                    percent=target.percent,
                )
            )
        session.flush()
    target_months = session.exec(
        select(BudgetMonth).where(
            BudgetMonth.profile_id == profile_id,
            BudgetMonth.year_month >= payload.year_month,
        )
    ).all()
    new_name = payload.name.strip() if payload.name is not None else None
    for target_month in target_months:
        row = session.exec(
            select(BudgetMonthTarget).where(
                BudgetMonthTarget.month_id == target_month.id,
                BudgetMonthTarget.category_id == category_id,
            )
        ).first()
        if row is None:
            continue
        if new_name is not None:
            row.name_override = new_name
        if payload.color is not None:
            row.color_override = payload.color
        session.add(row)
    session.commit()
    session.refresh(category)
    return _category_to_read(category)


def delete_category(session: Session, profile_id: int, category_id: int) -> None:
    _get_category(session, profile_id, category_id)
    tx = session.exec(
        select(BudgetTransaction.id).where(
            BudgetTransaction.profile_id == profile_id,
            BudgetTransaction.category_id == category_id,
        )
    ).first()
    if tx is not None:
        raise HTTPException(status_code=409, detail="category has transactions")
    rec = session.exec(
        select(BudgetRecurringExpense.id).where(
            BudgetRecurringExpense.profile_id == profile_id,
            BudgetRecurringExpense.category_id == category_id,
        )
    ).first()
    if rec is not None:
        raise HTTPException(status_code=409, detail="category has recurring expenses")
    month_ids = _profile_month_ids(session, profile_id)
    if month_ids:
        session.exec(
            delete(BudgetMonthTarget).where(
                BudgetMonthTarget.month_id.in_(month_ids),
                BudgetMonthTarget.category_id == category_id,
            )
        )
    category = session.get(BudgetCategory, category_id)
    if category is not None:
        session.delete(category)
    session.commit()


def update_month_incomes(
    session: Session, profile_id: int, year_month: str, payload: BudgetMonthIncomesUpdate
) -> BudgetMonthSnapshotRead:
    month = ensure_budget_month(session, profile_id, year_month)
    session.exec(delete(BudgetMonthIncome).where(BudgetMonthIncome.month_id == month.id))
    for item in payload.items:
        if item.amount_brl <= 0:
            raise HTTPException(status_code=422, detail="income amount must be positive")
        if item.source_id is not None:
            source = session.get(BudgetIncomeSource, item.source_id)
            if source is None or source.profile_id != profile_id:
                raise HTTPException(status_code=422, detail=f"invalid source_id: {item.source_id}")
        session.add(
            BudgetMonthIncome(
                month_id=month.id,
                source_id=item.source_id,
                label=item.label.strip(),
                amount_brl=item.amount_brl,
            )
        )
    session.commit()
    return build_month_snapshot(session, profile_id, year_month)


def _get_or_create_recurring_source(
    session: Session, profile_id: int, label: str
) -> BudgetIncomeSource:
    get_budget_profile(session, profile_id)
    existing = session.exec(
        select(BudgetIncomeSource).where(
            BudgetIncomeSource.profile_id == profile_id,
            BudgetIncomeSource.name == label,
        )
    ).first()
    if existing:
        existing.recurrence_hint = IncomeRecurrenceHint.RECURRING
        session.add(existing)
        session.flush()
        return existing
    source = BudgetIncomeSource(
        profile_id=profile_id,
        name=label,
        recurrence_hint=IncomeRecurrenceHint.RECURRING,
    )
    session.add(source)
    session.flush()
    return source


def _set_month_income_for_source(
    session: Session,
    profile_id: int,
    year_month: str,
    source_id: int,
    label: str,
    amount_brl: float,
) -> None:
    month = ensure_budget_month(session, profile_id, year_month)
    existing = session.exec(
        select(BudgetMonthIncome).where(
            BudgetMonthIncome.month_id == month.id,
            BudgetMonthIncome.source_id == source_id,
        )
    ).first()
    if existing:
        existing.label = label
        existing.amount_brl = amount_brl
        session.add(existing)
        return
    session.add(
        BudgetMonthIncome(
            month_id=month.id,
            source_id=source_id,
            label=label,
            amount_brl=amount_brl,
        )
    )


def _get_month_income(
    session: Session, profile_id: int, year_month: str, income_id: int
) -> BudgetMonthIncome:
    month = ensure_budget_month(session, profile_id, year_month)
    income = session.get(BudgetMonthIncome, income_id)
    if income is None or income.month_id != month.id:
        raise HTTPException(status_code=404, detail="income not found")
    return income


def add_month_income_entry(
    session: Session, profile_id: int, year_month: str, payload: BudgetIncomeEntryCreate
) -> BudgetMonthSnapshotRead:
    get_budget_profile(session, profile_id)
    label = payload.label.strip()
    if payload.recurring_12_months:
        source = _get_or_create_recurring_source(session, profile_id, label)
        for offset in range(RECURRING_INCOME_MONTHS):
            ym = shift_year_month(year_month, offset)
            _set_month_income_for_source(
                session, profile_id, ym, source.id, label, payload.amount_brl
            )
    else:
        month = ensure_budget_month(session, profile_id, year_month)
        session.add(
            BudgetMonthIncome(
                month_id=month.id,
                source_id=None,
                label=label,
                amount_brl=payload.amount_brl,
            )
        )
    session.commit()
    return build_month_snapshot(session, profile_id, year_month)


def update_month_income_entry(
    session: Session,
    profile_id: int,
    year_month: str,
    income_id: int,
    payload: BudgetIncomeEntryUpdate,
) -> BudgetMonthSnapshotRead:
    income = _get_month_income(session, profile_id, year_month, income_id)
    only_received = (
        payload.received is not None
        and payload.label is None
        and payload.amount_brl is None
    )
    if payload.received is not None:
        if not _income_is_recurring(session, income):
            raise HTTPException(
                status_code=422, detail="received flag only allowed for recurring incomes"
            )
        income.received = payload.received
        session.add(income)
        if only_received:
            session.commit()
            return build_month_snapshot(session, profile_id, year_month, view="settlement")

    label = payload.label.strip() if payload.label is not None else income.label
    amount_brl = payload.amount_brl if payload.amount_brl is not None else income.amount_brl
    if amount_brl <= 0:
        raise HTTPException(status_code=422, detail="income amount must be positive")

    if income.source_id is not None and _income_is_recurring(session, income):
        source = session.get(BudgetIncomeSource, income.source_id)
        if source is None:
            raise HTTPException(status_code=422, detail="invalid source_id")
        source.name = label
        session.add(source)
        linked = session.exec(
            select(BudgetMonthIncome).where(BudgetMonthIncome.source_id == source.id)
        ).all()
        for row in linked:
            row.label = label
            row.amount_brl = amount_brl
            session.add(row)
    else:
        income.label = label
        income.amount_brl = amount_brl
        session.add(income)

    session.commit()
    return build_month_snapshot(session, profile_id, year_month)


def delete_month_income_entry(
    session: Session, profile_id: int, year_month: str, income_id: int
) -> BudgetMonthSnapshotRead:
    income = _get_month_income(session, profile_id, year_month, income_id)
    session.delete(income)
    session.commit()
    return build_month_snapshot(session, profile_id, year_month)


def copy_incomes_from_previous_month(
    session: Session, profile_id: int, year_month: str
) -> BudgetMonthSnapshotRead:
    month = ensure_budget_month(session, profile_id, year_month)
    prev = shift_year_month(year_month, -1)
    prev_month = session.exec(
        select(BudgetMonth).where(
            BudgetMonth.profile_id == profile_id,
            BudgetMonth.year_month == prev,
        )
    ).first()
    if not prev_month:
        raise HTTPException(status_code=404, detail="previous month not found")
    prev_incomes = session.exec(
        select(BudgetMonthIncome).where(BudgetMonthIncome.month_id == prev_month.id)
    ).all()
    session.exec(delete(BudgetMonthIncome).where(BudgetMonthIncome.month_id == month.id))
    for income in prev_incomes:
        session.add(
            BudgetMonthIncome(
                month_id=month.id,
                source_id=income.source_id,
                label=income.label,
                amount_brl=income.amount_brl,
            )
        )
    session.commit()
    return build_month_snapshot(session, profile_id, year_month)


def create_transaction(
    session: Session, profile_id: int, year_month: str, payload: BudgetTransactionCreate
) -> BudgetTransactionRead:
    month = ensure_budget_month(session, profile_id, year_month)
    try:
        tx_type = BudgetTransactionType(payload.transaction_type)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail="invalid transaction_type") from exc
    if tx_type == BudgetTransactionType.EXPENSE and payload.category_id is None:
        raise HTTPException(status_code=422, detail="category_id required for expense")
    if payload.category_id is not None:
        cat = session.get(BudgetCategory, payload.category_id)
        if cat is None or cat.profile_id != profile_id:
            raise HTTPException(status_code=422, detail="invalid category_id")
    if payload.tag_id is not None:
        tag = session.get(BudgetTag, payload.tag_id)
        if tag is None or tag.profile_id != profile_id:
            raise HTTPException(status_code=422, detail="invalid tag_id")
    if payload.income_source_id is not None:
        source = session.get(BudgetIncomeSource, payload.income_source_id)
        if source is None or source.profile_id != profile_id:
            raise HTTPException(status_code=422, detail="invalid income_source_id")
    tx = BudgetTransaction(
        profile_id=profile_id,
        month_id=month.id,
        transaction_type=tx_type,
        event_date=_parse_date(payload.event_date),
        description=payload.description.strip(),
        amount_brl=payload.amount_brl,
        category_id=payload.category_id,
        tag_id=payload.tag_id,
        income_source_id=payload.income_source_id,
        notes=payload.notes,
    )
    session.add(tx)
    session.commit()
    session.refresh(tx)
    return _transaction_to_read(tx, session=session)


def update_transaction(
    session: Session, profile_id: int, transaction_id: int, payload: BudgetTransactionUpdate
) -> BudgetTransactionRead:
    tx = session.get(BudgetTransaction, transaction_id)
    if tx is None or tx.profile_id != profile_id:
        raise HTTPException(status_code=404, detail="transaction not found")
    if payload.settled is not None:
        if tx.recurring_expense_id is None:
            raise HTTPException(
                status_code=422, detail="settled flag only allowed for recurring expenses"
            )
        tx.settled = payload.settled
    if payload.event_date is not None:
        tx.event_date = _parse_date(payload.event_date)
    if payload.description is not None:
        tx.description = payload.description.strip()
    if payload.amount_brl is not None:
        tx.amount_brl = payload.amount_brl
    if payload.category_id is not None:
        cat = session.get(BudgetCategory, payload.category_id)
        if cat is None or cat.profile_id != profile_id:
            raise HTTPException(status_code=422, detail="invalid category_id")
        tx.category_id = payload.category_id
    if payload.tag_id is not None:
        if payload.tag_id == 0:
            tx.tag_id = None
        else:
            tag = session.get(BudgetTag, payload.tag_id)
            if tag is None or tag.profile_id != profile_id:
                raise HTTPException(status_code=422, detail="invalid tag_id")
            tx.tag_id = payload.tag_id
    if payload.income_source_id is not None:
        tx.income_source_id = payload.income_source_id
    if payload.notes is not None:
        tx.notes = payload.notes
    session.add(tx)
    session.commit()
    session.refresh(tx)
    return _transaction_to_read(tx, session=session)


def delete_transaction(session: Session, profile_id: int, transaction_id: int) -> None:
    from app.services.budget.recurring_expense import delete_expense_transaction

    delete_expense_transaction(session, profile_id, transaction_id)


def list_tags(session: Session, profile_id: int) -> list[BudgetTagRead]:
    get_budget_profile(session, profile_id)
    tags = session.exec(
        select(BudgetTag).where(BudgetTag.profile_id == profile_id).order_by(BudgetTag.name)
    ).all()
    result: list[BudgetTagRead] = []
    for tag in tags:
        count = session.exec(
            select(func.count())
            .select_from(BudgetTransaction)
            .where(BudgetTransaction.tag_id == tag.id)
        ).one()
        result.append(
            BudgetTagRead(
                id=tag.id,
                profile_id=tag.profile_id,
                name=tag.name,
                color=tag.color,
                usage_count=int(count),
            )
        )
    return result


def create_tag(session: Session, profile_id: int, payload: BudgetTagCreate) -> BudgetTagRead:
    get_budget_profile(session, profile_id)
    clash = session.exec(
        select(BudgetTag).where(BudgetTag.profile_id == profile_id, BudgetTag.name == payload.name.strip())
    ).first()
    if clash:
        raise HTTPException(status_code=409, detail="tag name already exists")
    tag = BudgetTag(profile_id=profile_id, name=payload.name.strip(), color=payload.color)
    session.add(tag)
    session.commit()
    session.refresh(tag)
    return BudgetTagRead(id=tag.id, profile_id=tag.profile_id, name=tag.name, color=tag.color, usage_count=0)


def update_tag(
    session: Session, profile_id: int, tag_id: int, payload: BudgetTagUpdate
) -> BudgetTagRead:
    tag = session.get(BudgetTag, tag_id)
    if tag is None or tag.profile_id != profile_id:
        raise HTTPException(status_code=404, detail="tag not found")
    if payload.name is not None:
        tag.name = payload.name.strip()
    if payload.color is not None:
        tag.color = payload.color
    session.add(tag)
    session.commit()
    session.refresh(tag)
    count = session.exec(
        select(func.count()).select_from(BudgetTransaction).where(BudgetTransaction.tag_id == tag.id)
    ).one()
    return BudgetTagRead(
        id=tag.id,
        profile_id=tag.profile_id,
        name=tag.name,
        color=tag.color,
        usage_count=int(count),
    )


def delete_tag(session: Session, profile_id: int, tag_id: int) -> None:
    tag = session.get(BudgetTag, tag_id)
    if tag is None or tag.profile_id != profile_id:
        raise HTTPException(status_code=404, detail="tag not found")
    count = session.exec(
        select(func.count()).select_from(BudgetTransaction).where(BudgetTransaction.tag_id == tag.id)
    ).one()
    if int(count) > 0:
        raise HTTPException(status_code=409, detail="tag has transactions")
    session.delete(tag)
    session.commit()


def list_income_sources(session: Session, profile_id: int) -> list[BudgetIncomeSourceRead]:
    get_budget_profile(session, profile_id)
    sources = session.exec(
        select(BudgetIncomeSource)
        .where(BudgetIncomeSource.profile_id == profile_id)
        .order_by(BudgetIncomeSource.sort_order, BudgetIncomeSource.name)
    ).all()
    return [
        BudgetIncomeSourceRead(
            id=s.id,
            profile_id=s.profile_id,
            name=s.name,
            recurrence_hint=s.recurrence_hint.value,
            sort_order=s.sort_order,
            is_active=s.is_active,
        )
        for s in sources
    ]


def create_income_source(
    session: Session, profile_id: int, payload: BudgetIncomeSourceCreate
) -> BudgetIncomeSourceRead:
    get_budget_profile(session, profile_id)
    try:
        hint = IncomeRecurrenceHint(payload.recurrence_hint)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail="invalid recurrence_hint") from exc
    source = BudgetIncomeSource(
        profile_id=profile_id,
        name=payload.name.strip(),
        recurrence_hint=hint,
    )
    session.add(source)
    session.commit()
    session.refresh(source)
    return BudgetIncomeSourceRead(
        id=source.id,
        profile_id=source.profile_id,
        name=source.name,
        recurrence_hint=source.recurrence_hint.value,
        sort_order=source.sort_order,
        is_active=source.is_active,
    )


def update_income_source(
    session: Session, profile_id: int, source_id: int, payload: BudgetIncomeSourceUpdate
) -> BudgetIncomeSourceRead:
    source = session.get(BudgetIncomeSource, source_id)
    if source is None or source.profile_id != profile_id:
        raise HTTPException(status_code=404, detail="income source not found")
    if payload.name is not None:
        source.name = payload.name.strip()
    if payload.recurrence_hint is not None:
        try:
            source.recurrence_hint = IncomeRecurrenceHint(payload.recurrence_hint)
        except ValueError as exc:
            raise HTTPException(status_code=422, detail="invalid recurrence_hint") from exc
    if payload.is_active is not None:
        source.is_active = payload.is_active
    session.add(source)
    session.commit()
    session.refresh(source)
    return BudgetIncomeSourceRead(
        id=source.id,
        profile_id=source.profile_id,
        name=source.name,
        recurrence_hint=source.recurrence_hint.value,
        sort_order=source.sort_order,
        is_active=source.is_active,
    )


def delete_income_source(session: Session, profile_id: int, source_id: int) -> None:
    from app.services.budget.recurring_income import delete_recurring_income

    source = session.get(BudgetIncomeSource, source_id)
    if source is None or source.profile_id != profile_id:
        raise HTTPException(status_code=404, detail="income source not found")
    if source.recurrence_hint == IncomeRecurrenceHint.RECURRING:
        delete_recurring_income(session, profile_id, source_id)
        return
    session.delete(source)
    session.commit()


def _aggregate_slices(
    rows: list[tuple[int | None, str | None, str | None, float]],
    fallback_name: str,
    fallback_color: str,
) -> list[DashboardSliceRead]:
    totals: dict[int, tuple[str, str, float]] = {}
    for row_id, name, color, amount in rows:
        key = row_id if row_id is not None else -1
        label = name or fallback_name
        col = color or fallback_color
        if key in totals:
            prev_name, prev_color, prev_amount = totals[key]
            totals[key] = (prev_name, prev_color, prev_amount + amount)
        else:
            totals[key] = (label, col, amount)
    grand = sum(v[2] for v in totals.values())
    slices: list[DashboardSliceRead] = []
    for key, (name, color, amount) in sorted(totals.items(), key=lambda x: -x[1][2]):
        pct = round_money(amount / grand * 100.0) if grand > 0 else 0.0
        slices.append(
            DashboardSliceRead(
                id=key,
                name=name,
                color=color,
                amount_brl=round_money(amount),
                percent=pct,
            )
        )
    return slices


def aggregate_timeline_totals(
    session: Session, profile_id: int, ym_list: list[str]
) -> dict[str, tuple[float, float]]:
    if not ym_list:
        return {}
    totals = {ym: (0.0, 0.0) for ym in ym_list}

    income_rows = session.exec(
        select(BudgetMonth.year_month, func.coalesce(func.sum(BudgetMonthIncome.amount_brl), 0.0))
        .join(BudgetMonthIncome, BudgetMonthIncome.month_id == BudgetMonth.id)
        .where(BudgetMonth.profile_id == profile_id, BudgetMonth.year_month.in_(ym_list))
        .group_by(BudgetMonth.year_month)
    ).all()
    for ym, amount in income_rows:
        totals[ym] = (round_money(float(amount)), totals[ym][1])

    expense_rows = session.exec(
        select(BudgetMonth.year_month, func.coalesce(func.sum(BudgetTransaction.amount_brl), 0.0))
        .join(BudgetTransaction, BudgetTransaction.month_id == BudgetMonth.id)
        .where(
            BudgetMonth.profile_id == profile_id,
            BudgetMonth.year_month.in_(ym_list),
            BudgetTransaction.transaction_type == BudgetTransactionType.EXPENSE,
        )
        .group_by(BudgetMonth.year_month)
    ).all()
    for ym, amount in expense_rows:
        income_brl, _ = totals[ym]
        totals[ym] = (income_brl, round_money(float(amount)))
    return totals


def build_dashboard(
    session: Session,
    profile_id: int,
    focus_year_month: str,
    months: int,
    forward_months: int,
    from_year_month: str | None = None,
    to_year_month: str | None = None,
) -> BudgetDashboardRead:
    _validate_year_month(focus_year_month)
    get_budget_profile(session, profile_id)

    range_from: str | None = None
    range_to: str | None = None
    if from_year_month is not None or to_year_month is not None:
        if from_year_month is None or to_year_month is None:
            raise HTTPException(
                status_code=422, detail="from and to must be provided together (YYYY-MM)"
            )
        _validate_year_month(from_year_month)
        _validate_year_month(to_year_month)
        if compare_year_months(from_year_month, to_year_month) > 0:
            raise HTTPException(status_code=422, detail="from must be <= to")
        try:
            ym_list = list_year_months_between(from_year_month, to_year_month)
        except ValueError as exc:
            raise HTTPException(status_code=422, detail=str(exc)) from exc
        if len(ym_list) > 60:
            raise HTTPException(status_code=422, detail="range cannot exceed 60 months")
        range_from = from_year_month
        range_to = to_year_month
        months = len(ym_list)
        forward_months = 0
    else:
        if months not in (3, 6):
            raise HTTPException(status_code=422, detail="months must be 3 or 6")
        if forward_months < 0 or forward_months > 12:
            forward_months = DASHBOARD_FORWARD_MONTHS
        ym_list = list_timeline_months(focus_year_month, months, forward_months)

    sync_through = max(ym_list, key=year_month_index)
    from app.services.budget.recurring_expense import sync_recurring_expenses_for_month

    sync_recurring_expenses_for_month(session, profile_id, sync_through)

    totals_by_month = aggregate_timeline_totals(session, profile_id, ym_list)
    timeline = [
        DashboardMonthRow(
            year_month=ym,
            income_brl=totals_by_month[ym][0],
            expense_brl=totals_by_month[ym][1],
        )
        for ym in ym_list
    ]

    focus_snapshot = build_month_snapshot(
        session, profile_id, focus_year_month, skip_recurring_sync=True, view="dashboard"
    )
    expense_tag_rows: list[tuple[int | None, str | None, str | None, float]] = []
    expense_category_rows: list[tuple[int | None, str | None, str | None, float]] = []
    income_tag_rows: list[tuple[int | None, str | None, str | None, float]] = []
    category_colors = {c.category_id: c.color for c in focus_snapshot.categories}
    for tx in focus_snapshot.transactions:
        if tx.transaction_type != BudgetTransactionType.EXPENSE.value:
            continue
        expense_tag_rows.append(
            (
                tx.tag_id,
                tx.tag_name or "Sem tag",
                tx.tag_color or "#64748b",
                tx.amount_brl,
            )
        )
        expense_category_rows.append(
            (
                tx.category_id,
                tx.category_name or "Sem meta",
                category_colors.get(tx.category_id or -1, "#64748b"),
                tx.amount_brl,
            )
        )

    return BudgetDashboardRead(
        profile_id=profile_id,
        months=months,
        focus_year_month=focus_year_month,
        forward_months=forward_months,
        from_year_month=range_from,
        to_year_month=range_to,
        result_brl=focus_snapshot.remaining_brl,
        income_brl=focus_snapshot.income_total_brl,
        expense_brl=focus_snapshot.expense_total_brl,
        balance_brl=focus_snapshot.remaining_brl,
        timeline=timeline,
        expenses_by_tag=_aggregate_slices(expense_tag_rows, "Sem tag", "#64748b"),
        expenses_by_category=_aggregate_slices(expense_category_rows, "Sem meta", "#64748b"),
        incomes_by_tag=_aggregate_slices(income_tag_rows, "Sem tag", "#22c55e"),
    )

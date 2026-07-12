from fastapi import HTTPException
from sqlmodel import Session, delete, select

from app.models.budget.income_source import BudgetIncomeSource, IncomeRecurrenceHint
from app.models.budget.month import BudgetMonth, BudgetMonthIncome
from app.schemas.budget import BudgetIncomeSourceRead
from app.services.budget.budget_engine import compare_year_months, parse_year_month


def _get_profile(session: Session, profile_id: int):
    from app.services.budget.budget_service import get_budget_profile

    return get_budget_profile(session, profile_id)


def _validate_year_month(year_month: str) -> None:
    try:
        parse_year_month(year_month)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=f"invalid year_month: {year_month}") from exc


def income_source_to_read(source: BudgetIncomeSource) -> BudgetIncomeSourceRead:
    return BudgetIncomeSourceRead(
        id=source.id,
        profile_id=source.profile_id,
        name=source.name,
        recurrence_hint=source.recurrence_hint.value,
        sort_order=source.sort_order,
        is_active=source.is_active,
    )


def _get_recurring_source(session: Session, profile_id: int, source_id: int) -> BudgetIncomeSource:
    source = session.get(BudgetIncomeSource, source_id)
    if source is None or source.profile_id != profile_id:
        raise HTTPException(status_code=404, detail="income source not found")
    if source.recurrence_hint != IncomeRecurrenceHint.RECURRING:
        raise HTTPException(status_code=422, detail="income source is not recurring")
    return source


def _earliest_income_year_month(session: Session, source_id: int) -> str | None:
    row = session.exec(
        select(BudgetMonth.year_month)
        .join(BudgetMonthIncome, BudgetMonthIncome.month_id == BudgetMonth.id)
        .where(BudgetMonthIncome.source_id == source_id)
        .order_by(BudgetMonth.year_month)
    ).first()
    return row


def _delete_income_rows_for_source(session: Session, source_id: int) -> None:
    session.exec(delete(BudgetMonthIncome).where(BudgetMonthIncome.source_id == source_id))


def _delete_income_rows_from_month(session: Session, source_id: int, from_year_month: str) -> None:
    rows = session.exec(
        select(BudgetMonthIncome)
        .join(BudgetMonth, BudgetMonthIncome.month_id == BudgetMonth.id)
        .where(
            BudgetMonthIncome.source_id == source_id,
            BudgetMonth.year_month >= from_year_month,
        )
    ).all()
    for row in rows:
        session.delete(row)


def delete_recurring_income(session: Session, profile_id: int, source_id: int) -> None:
    source = _get_recurring_source(session, profile_id, source_id)
    _get_profile(session, profile_id)
    _delete_income_rows_for_source(session, source.id)
    session.delete(source)
    session.commit()


def stop_recurring_income_from_month(
    session: Session, profile_id: int, source_id: int, from_year_month: str
) -> BudgetIncomeSourceRead | None:
    _validate_year_month(from_year_month)
    source = _get_recurring_source(session, profile_id, source_id)
    _get_profile(session, profile_id)

    earliest = _earliest_income_year_month(session, source.id)
    if earliest is None or compare_year_months(from_year_month, earliest) <= 0:
        delete_recurring_income(session, profile_id, source_id)
        return None

    _delete_income_rows_from_month(session, source.id, from_year_month)
    session.commit()
    session.refresh(source)
    return income_source_to_read(source)

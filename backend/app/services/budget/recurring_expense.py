from datetime import date

from fastapi import HTTPException
from sqlmodel import Session, delete, select

from app.models.budget.category import BudgetCategory
from app.models.budget.month import BudgetMonth
from app.models.budget.recurring_expense import BudgetRecurringExpense
from app.models.budget.tag import BudgetTag
from app.models.budget.transaction import BudgetTransaction, BudgetTransactionType
from app.schemas.budget import (
    BudgetExpenseEntryCreate,
    BudgetExpenseEntryUpdate,
    BudgetRecurringExpenseRead,
)
from app.services.budget.budget_engine import (
    RECURRING_EXPENSE_HORIZON,
    compare_year_months,
    event_date_for_day,
    parse_year_month,
    round_money,
    shift_year_month,
)


def _ensure_month(session: Session, profile_id: int, year_month: str):
    from app.services.budget.budget_service import ensure_budget_month

    return ensure_budget_month(session, profile_id, year_month)


def _get_profile(session: Session, profile_id: int):
    from app.services.budget.budget_service import get_budget_profile

    return get_budget_profile(session, profile_id)


def _validate_expense_refs(
    session: Session, profile_id: int, category_id: int, tag_id: int | None
) -> None:
    cat = session.get(BudgetCategory, category_id)
    if cat is None or cat.profile_id != profile_id:
        raise HTTPException(status_code=422, detail="invalid category_id")
    if tag_id is not None:
        tag = session.get(BudgetTag, tag_id)
        if tag is None or tag.profile_id != profile_id:
            raise HTTPException(status_code=422, detail="invalid tag_id")


def _parse_event_date(value: str) -> date:
    try:
        return date.fromisoformat(value)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=f"invalid date: {value}") from exc


def _effective_materialization_end(rule: BudgetRecurringExpense, through_year_month: str) -> str:
    if rule.end_year_month:
        return rule.end_year_month
    default_end = shift_year_month(rule.start_year_month, RECURRING_EXPENSE_HORIZON - 1)
    if compare_year_months(through_year_month, default_end) > 0:
        return through_year_month
    return default_end


def _iter_year_months(start_year_month: str, end_year_month: str) -> list[str]:
    months: list[str] = []
    current = start_year_month
    while compare_year_months(current, end_year_month) <= 0:
        months.append(current)
        current = shift_year_month(current, 1)
    return months


def _delete_rule_transactions(session: Session, rule_id: int) -> None:
    session.exec(
        delete(BudgetTransaction).where(BudgetTransaction.recurring_expense_id == rule_id)
    )


def _delete_rule_transactions_from_month(
    session: Session, rule_id: int, from_year_month: str
) -> None:
    txs = session.exec(
        select(BudgetTransaction)
        .join(BudgetMonth, BudgetTransaction.month_id == BudgetMonth.id)
        .where(
            BudgetTransaction.recurring_expense_id == rule_id,
            BudgetMonth.year_month >= from_year_month,
        )
    ).all()
    for tx in txs:
        session.delete(tx)


def _validate_year_month(year_month: str) -> None:
    try:
        parse_year_month(year_month)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=f"invalid year_month: {year_month}") from exc


def _upsert_rule_transaction(
    session: Session,
    profile_id: int,
    rule: BudgetRecurringExpense,
    year_month: str,
) -> None:
    month = _ensure_month(session, profile_id, year_month)
    existing = session.exec(
        select(BudgetTransaction).where(
            BudgetTransaction.recurring_expense_id == rule.id,
            BudgetTransaction.month_id == month.id,
        )
    ).first()
    payload = {
        "description": rule.description,
        "amount_brl": rule.amount_brl,
        "category_id": rule.category_id,
        "tag_id": rule.tag_id,
        "event_date": event_date_for_day(year_month, rule.day_of_month),
    }
    if existing:
        existing.description = payload["description"]
        existing.amount_brl = payload["amount_brl"]
        existing.category_id = payload["category_id"]
        existing.tag_id = payload["tag_id"]
        existing.event_date = payload["event_date"]
        session.add(existing)
        return
    session.add(
        BudgetTransaction(
            profile_id=profile_id,
            month_id=month.id,
            transaction_type=BudgetTransactionType.EXPENSE,
            recurring_expense_id=rule.id,
            notes=None,
            income_source_id=None,
            **payload,
        )
    )


def materialize_recurring_expense(
    session: Session, profile_id: int, rule: BudgetRecurringExpense, through_year_month: str
) -> None:
    end = _effective_materialization_end(rule, through_year_month)
    for ym in _iter_year_months(rule.start_year_month, end):
        _upsert_rule_transaction(session, profile_id, rule, ym)


def sync_recurring_expenses_for_month(session: Session, profile_id: int, year_month: str) -> None:
    rules = session.exec(
        select(BudgetRecurringExpense).where(
            BudgetRecurringExpense.profile_id == profile_id,
            BudgetRecurringExpense.is_active.is_(True),
        )
    ).all()
    changed = False
    for rule in rules:
        if compare_year_months(year_month, rule.start_year_month) < 0:
            continue
        if rule.end_year_month and compare_year_months(year_month, rule.end_year_month) > 0:
            continue
        materialize_recurring_expense(session, profile_id, rule, year_month)
        changed = True
    if changed:
        session.commit()


def recurring_expense_to_read(
    session: Session, rule: BudgetRecurringExpense
) -> BudgetRecurringExpenseRead:
    cat = session.get(BudgetCategory, rule.category_id)
    tag = session.get(BudgetTag, rule.tag_id) if rule.tag_id else None
    return BudgetRecurringExpenseRead(
        id=rule.id,
        profile_id=rule.profile_id,
        description=rule.description,
        amount_brl=rule.amount_brl,
        category_id=rule.category_id,
        category_name=cat.name if cat else None,
        tag_id=rule.tag_id,
        tag_name=tag.name if tag else None,
        day_of_month=rule.day_of_month,
        start_year_month=rule.start_year_month,
        end_year_month=rule.end_year_month,
        indefinite=rule.end_year_month is None,
        is_active=rule.is_active,
    )


def list_recurring_expenses(session: Session, profile_id: int) -> list[BudgetRecurringExpenseRead]:
    _get_profile(session, profile_id)
    rules = session.exec(
        select(BudgetRecurringExpense)
        .where(BudgetRecurringExpense.profile_id == profile_id)
        .order_by(BudgetRecurringExpense.description)
    ).all()
    return [recurring_expense_to_read(session, rule) for rule in rules]


def _start_year_month_from_date(event_date: date) -> str:
    return f"{event_date.year:04d}-{event_date.month:02d}"


def _validate_recurring_end(start_year_month: str, end_year_month: str | None, indefinite: bool) -> None:
    if indefinite:
        return
    if end_year_month is None:
        raise HTTPException(status_code=422, detail="end_year_month required when not indefinite")
    if compare_year_months(end_year_month, start_year_month) < 0:
        raise HTTPException(status_code=422, detail="end_year_month must be on or after start month")


def create_expense_entry(
    session: Session, profile_id: int, year_month: str, payload: BudgetExpenseEntryCreate
) -> BudgetRecurringExpenseRead | None:
    _get_profile(session, profile_id)
    _validate_expense_refs(session, profile_id, payload.category_id, payload.tag_id)
    event_date = _parse_event_date(payload.event_date)
    start_year_month = _start_year_month_from_date(event_date)

    if not payload.recurring:
        month = _ensure_month(session, profile_id, year_month)
        session.add(
            BudgetTransaction(
                profile_id=profile_id,
                month_id=month.id,
                transaction_type=BudgetTransactionType.EXPENSE,
                event_date=event_date,
                description=payload.description.strip(),
                amount_brl=round_money(payload.amount_brl),
                category_id=payload.category_id,
                tag_id=payload.tag_id,
            )
        )
        session.commit()
        return None

    _validate_recurring_end(start_year_month, payload.end_year_month, payload.indefinite)
    rule = BudgetRecurringExpense(
        profile_id=profile_id,
        description=payload.description.strip(),
        amount_brl=round_money(payload.amount_brl),
        category_id=payload.category_id,
        tag_id=payload.tag_id,
        day_of_month=event_date.day,
        start_year_month=start_year_month,
        end_year_month=None if payload.indefinite else payload.end_year_month,
    )
    session.add(rule)
    session.flush()
    through = payload.end_year_month or shift_year_month(start_year_month, RECURRING_EXPENSE_HORIZON - 1)
    materialize_recurring_expense(session, profile_id, rule, through)
    session.commit()
    session.refresh(rule)
    return recurring_expense_to_read(session, rule)


def update_recurring_expense(
    session: Session,
    profile_id: int,
    rule_id: int,
    payload: BudgetExpenseEntryUpdate,
) -> BudgetRecurringExpenseRead:
    rule = session.get(BudgetRecurringExpense, rule_id)
    if rule is None or rule.profile_id != profile_id:
        raise HTTPException(status_code=404, detail="recurring expense not found")

    fields_set = payload.model_fields_set
    if "description" in fields_set and payload.description is not None:
        rule.description = payload.description.strip()
    if "amount_brl" in fields_set and payload.amount_brl is not None:
        rule.amount_brl = round_money(payload.amount_brl)
    if "category_id" in fields_set and payload.category_id is not None:
        _validate_expense_refs(session, profile_id, payload.category_id, rule.tag_id)
        rule.category_id = payload.category_id
    if "tag_id" in fields_set:
        _validate_expense_refs(session, profile_id, rule.category_id, payload.tag_id)
        rule.tag_id = payload.tag_id
    if "event_date" in fields_set and payload.event_date is not None:
        event_date = _parse_event_date(payload.event_date)
        rule.day_of_month = event_date.day
        rule.start_year_month = _start_year_month_from_date(event_date)
    if payload.indefinite is True:
        rule.end_year_month = None
    elif "end_year_month" in fields_set:
        rule.end_year_month = payload.end_year_month
    _validate_recurring_end(rule.start_year_month, rule.end_year_month, rule.end_year_month is None)

    session.add(rule)
    through = rule.end_year_month or shift_year_month(
        rule.start_year_month, RECURRING_EXPENSE_HORIZON - 1
    )
    # Upsert preserva settled; remove só meses fora da nova vigência.
    existing_txs = session.exec(
        select(BudgetTransaction).where(BudgetTransaction.recurring_expense_id == rule.id)
    ).all()
    valid_months = set(_iter_year_months(rule.start_year_month, through))
    for tx in existing_txs:
        month = session.get(BudgetMonth, tx.month_id)
        if month is None or month.year_month not in valid_months:
            session.delete(tx)
    materialize_recurring_expense(session, profile_id, rule, through)
    session.commit()
    session.refresh(rule)
    return recurring_expense_to_read(session, rule)


def delete_recurring_expense(session: Session, profile_id: int, rule_id: int) -> None:
    rule = session.get(BudgetRecurringExpense, rule_id)
    if rule is None or rule.profile_id != profile_id:
        raise HTTPException(status_code=404, detail="recurring expense not found")
    _delete_rule_transactions(session, rule.id)
    session.delete(rule)
    session.commit()


def stop_recurring_expense_from_month(
    session: Session, profile_id: int, rule_id: int, from_year_month: str
) -> BudgetRecurringExpenseRead | None:
    _validate_year_month(from_year_month)
    rule = session.get(BudgetRecurringExpense, rule_id)
    if rule is None or rule.profile_id != profile_id:
        raise HTTPException(status_code=404, detail="recurring expense not found")

    if compare_year_months(from_year_month, rule.start_year_month) <= 0:
        delete_recurring_expense(session, profile_id, rule_id)
        return None

    last_active_month = shift_year_month(from_year_month, -1)
    if (
        rule.end_year_month is not None
        and compare_year_months(last_active_month, rule.end_year_month) > 0
    ):
        last_active_month = rule.end_year_month

    rule.end_year_month = last_active_month
    session.add(rule)
    _delete_rule_transactions_from_month(session, rule.id, from_year_month)
    session.commit()
    session.refresh(rule)
    return recurring_expense_to_read(session, rule)


def delete_expense_transaction(session: Session, profile_id: int, transaction_id: int) -> None:
    tx = session.get(BudgetTransaction, transaction_id)
    if tx is None or tx.profile_id != profile_id:
        raise HTTPException(status_code=404, detail="transaction not found")
    if tx.recurring_expense_id is not None:
        month = session.get(BudgetMonth, tx.month_id)
        if month is None:
            raise HTTPException(status_code=404, detail="month not found")
        stop_recurring_expense_from_month(
            session, profile_id, tx.recurring_expense_id, month.year_month
        )
        return
    session.delete(tx)
    session.commit()

from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select

from app.models.manual_patrimony_item import (
    EmergencyReserveLocation,
    ManualPatrimonyCategory,
    ManualPatrimonyItem,
)
from app.schemas.patrimony_control import (
    ManualPatrimonyItemCreate,
    ManualPatrimonyItemRead,
    ManualPatrimonyItemUpdate,
    PatrimonyControlSnapshotRead,
)
from app.services.objective_investment import compute_linked_emergency_reserve_items
from app.services.patrimony_control_engine import aggregate_manual_totals
from app.services.portfolio_patrimony import compute_portfolio_patrimony_brl
from app.services.portfolio_service import get_portfolio


def _validate_category(value: str) -> ManualPatrimonyCategory:
    try:
        category = ManualPatrimonyCategory(value)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=f"invalid category: {value}",
        ) from exc
    if category == ManualPatrimonyCategory.CASH:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=(
                "category cash is no longer supported; "
                "use emergency_reserve with location dinheiro_especie"
            ),
        )
    return category


def _validate_location(category: ManualPatrimonyCategory, location: str | None) -> str | None:
    if category == ManualPatrimonyCategory.EMERGENCY_RESERVE:
        normalized = (location or "").strip()
        if not normalized:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="location is required for emergency_reserve",
            )
        try:
            return EmergencyReserveLocation(normalized).value
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail=f"invalid location: {normalized}",
            ) from exc
    return None


def _item_to_read(item: ManualPatrimonyItem) -> ManualPatrimonyItemRead:
    assert item.id is not None
    return ManualPatrimonyItemRead(
        id=item.id,
        portfolio_id=item.portfolio_id,
        category=item.category.value,
        name=item.name,
        amount_brl=item.amount_brl,
        location=item.location,
        notes=item.notes,
    )


def _list_manual_items(session: Session, portfolio_id: int) -> list[ManualPatrimonyItem]:
    return list(
        session.exec(
            select(ManualPatrimonyItem)
            .where(ManualPatrimonyItem.portfolio_id == portfolio_id)
            .order_by(ManualPatrimonyItem.category, ManualPatrimonyItem.name),
        ).all(),
    )


def delete_manual_patrimony_items_for_portfolio(session: Session, portfolio_id: int) -> None:
    items = session.exec(
        select(ManualPatrimonyItem).where(ManualPatrimonyItem.portfolio_id == portfolio_id),
    ).all()
    for item in items:
        session.delete(item)


def build_patrimony_control_snapshot(
    session: Session,
    portfolio_id: int,
) -> PatrimonyControlSnapshotRead:
    get_portfolio(session, portfolio_id)
    items = _list_manual_items(session, portfolio_id)
    invested_gross = compute_portfolio_patrimony_brl(session, portfolio_id)
    manual_total = aggregate_manual_totals(items)
    linked_items = compute_linked_emergency_reserve_items(session, portfolio_id)
    linked_emergency_total = round(sum(item.amount_brl for item in linked_items), 2)
    invested_excluding_emergency = max(0.0, round(invested_gross - linked_emergency_total, 2))
    total_emergency = round(manual_total + linked_emergency_total, 2)
    total_patrimony = round(invested_gross + manual_total, 2)
    return PatrimonyControlSnapshotRead(
        portfolio_id=portfolio_id,
        invested_portfolio_brl=invested_gross,
        invested_excluding_emergency_brl=invested_excluding_emergency,
        linked_emergency_reserve_brl=linked_emergency_total,
        manual_items=[_item_to_read(item) for item in items],
        linked_emergency_reserve_items=linked_items,
        total_emergency_reserve_brl=total_emergency,
        total_manual_brl=manual_total,
        total_patrimony_brl=total_patrimony,
    )


def _get_manual_item(
    session: Session,
    portfolio_id: int,
    item_id: int,
) -> ManualPatrimonyItem:
    get_portfolio(session, portfolio_id)
    item = session.get(ManualPatrimonyItem, item_id)
    if item is None or item.portfolio_id != portfolio_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="item not found")
    return item


def create_manual_patrimony_item(
    session: Session,
    portfolio_id: int,
    payload: ManualPatrimonyItemCreate,
) -> ManualPatrimonyItem:
    get_portfolio(session, portfolio_id)
    category = _validate_category(payload.category)
    location = _validate_location(category, payload.location)
    item = ManualPatrimonyItem(
        portfolio_id=portfolio_id,
        category=category,
        name=payload.name.strip(),
        amount_brl=payload.amount_brl,
        location=location,
        notes=(payload.notes or "").strip() or None,
    )
    session.add(item)
    try:
        session.commit()
    except IntegrityError as exc:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="item name already exists for this portfolio",
        ) from exc
    session.refresh(item)
    return item


def update_manual_patrimony_item(
    session: Session,
    portfolio_id: int,
    item_id: int,
    payload: ManualPatrimonyItemUpdate,
) -> ManualPatrimonyItem:
    item = _get_manual_item(session, portfolio_id, item_id)
    category = _validate_category(payload.category) if payload.category is not None else item.category
    if payload.name is not None:
        item.name = payload.name.strip()
    if payload.amount_brl is not None:
        item.amount_brl = payload.amount_brl
    if payload.notes is not None:
        item.notes = payload.notes.strip() or None
    item.category = category
    if payload.location is not None or payload.category is not None:
        item.location = _validate_location(
            category,
            payload.location if payload.location is not None else item.location,
        )
    item.updated_at = datetime.utcnow()
    session.add(item)
    try:
        session.commit()
    except IntegrityError as exc:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="item name already exists for this portfolio",
        ) from exc
    session.refresh(item)
    return item


def delete_manual_patrimony_item(
    session: Session,
    portfolio_id: int,
    item_id: int,
) -> None:
    item = _get_manual_item(session, portfolio_id, item_id)
    session.delete(item)
    session.commit()

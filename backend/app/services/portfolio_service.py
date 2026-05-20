import logging
from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select

from app.models.portfolio import AppPreference, Portfolio
from app.models.position import Position
from app.schemas.portfolio import (
    PortfolioCreate,
    PortfolioRead,
    PortfolioUpdate,
    PositionCreate,
    PositionRead,
    PositionUpdate,
)

ACTIVE_PORTFOLIO_KEY = "active_portfolio_id"
logger = logging.getLogger(__name__)
_MAX_PORTFOLIO_NAME_SUFFIX = 99


def portfolio_name_exists(
    session: Session,
    name: str,
    *,
    exclude_id: int | None = None,
) -> bool:
    for portfolio in session.exec(select(Portfolio)).all():
        if exclude_id is not None and portfolio.id == exclude_id:
            continue
        if portfolio.name == name:
            return True
    return False


def resolve_unique_portfolio_name(session: Session, desired_name: str) -> tuple[str, bool]:
    """Retorna (nome único, foi_renomeado)."""
    base = desired_name.strip()
    if not base:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="portfolio name is required",
        )
    if not portfolio_name_exists(session, base):
        return base, False
    for suffix in range(2, _MAX_PORTFOLIO_NAME_SUFFIX + 1):
        candidate = f"{base} ({suffix})"
        if not portfolio_name_exists(session, candidate):
            logger.info("portfolio_name_resolved from=%s to=%s", base, candidate)
            return candidate, True
    raise HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail="could not resolve unique portfolio name",
    )


def _touch_portfolio(portfolio: Portfolio) -> None:
    portfolio.updated_at = datetime.utcnow()


def list_portfolios(session: Session) -> list[Portfolio]:
    return list(session.exec(select(Portfolio).order_by(Portfolio.name)).all())


def get_portfolio(session: Session, portfolio_id: int) -> Portfolio:
    portfolio = session.get(Portfolio, portfolio_id)
    if portfolio is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="portfolio not found")
    return portfolio


def create_portfolio(session: Session, payload: PortfolioCreate) -> Portfolio:
    portfolio = Portfolio(**payload.model_dump())
    session.add(portfolio)
    try:
        session.commit()
    except IntegrityError as exc:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="portfolio name already exists",
        ) from exc
    session.refresh(portfolio)
    return portfolio


def update_portfolio(session: Session, portfolio_id: int, payload: PortfolioUpdate) -> Portfolio:
    portfolio = get_portfolio(session, portfolio_id)
    previous_name = portfolio.name
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(portfolio, key, value)
    _touch_portfolio(portfolio)
    session.add(portfolio)
    try:
        session.commit()
    except IntegrityError as exc:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="portfolio name already exists",
        ) from exc
    session.refresh(portfolio)
    if payload.name is not None and portfolio.name != previous_name:
        logger.info(
            "portfolio_renamed id=%s from=%s to=%s",
            portfolio_id,
            previous_name,
            portfolio.name,
        )
    return portfolio


def delete_portfolio(session: Session, portfolio_id: int) -> None:
    portfolio = get_portfolio(session, portfolio_id)
    positions = session.exec(
        select(Position).where(Position.portfolio_id == portfolio_id),
    ).all()
    for position in positions:
        session.delete(position)
    session.delete(portfolio)
    pref = session.get(AppPreference, ACTIVE_PORTFOLIO_KEY)
    if pref and pref.value == str(portfolio_id):
        session.delete(pref)
    session.commit()


def list_positions(session: Session, portfolio_id: int) -> list[Position]:
    get_portfolio(session, portfolio_id)
    return list(
        session.exec(
            select(Position)
            .where(Position.portfolio_id == portfolio_id)
            .order_by(Position.id),
        ).all(),
    )


def create_position(
    session: Session,
    portfolio_id: int,
    payload: PositionCreate,
) -> Position:
    get_portfolio(session, portfolio_id)
    existing = session.exec(
        select(Position).where(
            Position.portfolio_id == portfolio_id,
            Position.asset_id == payload.asset_id,
        ),
    ).first()
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="position for this asset already exists in portfolio",
        )
    position = Position(portfolio_id=portfolio_id, **payload.model_dump())
    session.add(position)
    session.commit()
    session.refresh(position)
    return position


def update_position(
    session: Session,
    portfolio_id: int,
    position_id: int,
    payload: PositionUpdate,
) -> Position:
    position = _get_position(session, portfolio_id, position_id)
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(position, key, value)
    position.updated_at = datetime.utcnow()
    session.add(position)
    session.commit()
    session.refresh(position)
    return position


def delete_position(session: Session, portfolio_id: int, position_id: int) -> None:
    position = _get_position(session, portfolio_id, position_id)
    session.delete(position)
    session.commit()


def _get_position(session: Session, portfolio_id: int, position_id: int) -> Position:
    position = session.get(Position, position_id)
    if position is None or position.portfolio_id != portfolio_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="position not found")
    return position


def get_active_portfolio_id(session: Session) -> int | None:
    pref = session.get(AppPreference, ACTIVE_PORTFOLIO_KEY)
    if pref is None:
        return None
    try:
        portfolio_id = int(pref.value)
    except ValueError:
        return None
    if session.get(Portfolio, portfolio_id) is None:
        session.delete(pref)
        session.commit()
        return None
    return portfolio_id


def set_active_portfolio_id(session: Session, portfolio_id: int | None) -> int | None:
    if portfolio_id is not None:
        get_portfolio(session, portfolio_id)
    pref = session.get(AppPreference, ACTIVE_PORTFOLIO_KEY)
    if portfolio_id is None:
        if pref is not None:
            session.delete(pref)
            session.commit()
        return None
    if pref is None:
        pref = AppPreference(key=ACTIVE_PORTFOLIO_KEY, value=str(portfolio_id))
        session.add(pref)
    else:
        pref.value = str(portfolio_id)
        session.add(pref)
    session.commit()
    return portfolio_id


def to_portfolio_read(portfolio: Portfolio) -> PortfolioRead:
    return PortfolioRead.model_validate(portfolio)


def to_position_read(position: Position) -> PositionRead:
    return PositionRead.model_validate(position)

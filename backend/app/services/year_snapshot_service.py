from datetime import date

from fastapi import HTTPException, status
from sqlmodel import Session, select

from app.models.asset import Asset
from app.models.position import Position, PositionStatus
from app.models.year_snapshot import PortfolioYearSnapshot, PositionSnapshot
from app.schemas.year_snapshot import (
    PositionSnapshotRead,
    YearSnapshotCreate,
    YearSnapshotDetailRead,
    YearSnapshotSummary,
)
from app.services.portfolio_service import get_portfolio, list_positions


def _default_snapshot_date(year: int) -> date:
    return date(year, 12, 31)


def _get_snapshot_for_year(
    session: Session,
    portfolio_id: int,
    year: int,
) -> PortfolioYearSnapshot | None:
    return session.exec(
        select(PortfolioYearSnapshot).where(
            PortfolioYearSnapshot.portfolio_id == portfolio_id,
            PortfolioYearSnapshot.year == year,
        ),
    ).first()


def list_year_snapshots(session: Session, portfolio_id: int) -> list[YearSnapshotSummary]:
    get_portfolio(session, portfolio_id)
    snapshots = session.exec(
        select(PortfolioYearSnapshot)
        .where(PortfolioYearSnapshot.portfolio_id == portfolio_id)
        .order_by(PortfolioYearSnapshot.year.desc()),
    ).all()
    result: list[YearSnapshotSummary] = []
    for snapshot in snapshots:
        position_count = len(
            session.exec(
                select(PositionSnapshot).where(PositionSnapshot.snapshot_id == snapshot.id),
            ).all(),
        )
        result.append(
            YearSnapshotSummary(
                id=snapshot.id,  # type: ignore[arg-type]
                portfolio_id=snapshot.portfolio_id,
                year=snapshot.year,
                snapshot_date=snapshot.snapshot_date,
                created_at=snapshot.created_at,
                position_count=position_count,
            ),
        )
    return result


def _to_position_snapshot_reads(
    session: Session,
    snapshot_id: int,
) -> list[PositionSnapshotRead]:
    rows = session.exec(
        select(PositionSnapshot)
        .where(PositionSnapshot.snapshot_id == snapshot_id)
        .order_by(PositionSnapshot.id),
    ).all()
    if not rows:
        return []

    asset_ids = {row.asset_id for row in rows}
    assets = {
        asset.id: asset
        for asset in session.exec(select(Asset).where(Asset.id.in_(asset_ids))).all()
        if asset.id is not None
    }

    result: list[PositionSnapshotRead] = []
    for row in rows:
        asset = assets.get(row.asset_id)
        if asset is None:
            continue
        result.append(
            PositionSnapshotRead(
                asset_id=row.asset_id,
                symbol=asset.symbol,
                asset_name=asset.name,
                display_class=asset.display_class,
                quantity=row.quantity,
                average_price=row.average_price,
                invested_amount=row.invested_amount,
                currency=row.currency,
            ),
        )
    return result


def find_year_snapshot_detail(
    session: Session,
    portfolio_id: int,
    year: int,
) -> YearSnapshotDetailRead | None:
    snapshot = _get_snapshot_for_year(session, portfolio_id, year)
    if snapshot is None:
        return None
    return YearSnapshotDetailRead(
        id=snapshot.id,  # type: ignore[arg-type]
        portfolio_id=snapshot.portfolio_id,
        year=snapshot.year,
        snapshot_date=snapshot.snapshot_date,
        created_at=snapshot.created_at,
        positions=_to_position_snapshot_reads(session, snapshot.id),  # type: ignore[arg-type]
    )


def get_year_snapshot_detail(
    session: Session,
    portfolio_id: int,
    year: int,
) -> YearSnapshotDetailRead:
    get_portfolio(session, portfolio_id)
    snapshot = find_year_snapshot_detail(session, portfolio_id, year)
    if snapshot is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="year snapshot not found",
        )
    return snapshot


def create_year_snapshot(
    session: Session,
    portfolio_id: int,
    payload: YearSnapshotCreate,
) -> YearSnapshotDetailRead:
    get_portfolio(session, portfolio_id)
    existing = _get_snapshot_for_year(session, portfolio_id, payload.year)
    if existing is not None and not payload.replace:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="year snapshot already exists",
        )

    if existing is not None:
        session.exec(
            select(PositionSnapshot).where(PositionSnapshot.snapshot_id == existing.id),
        )
        for row in session.exec(
            select(PositionSnapshot).where(PositionSnapshot.snapshot_id == existing.id),
        ).all():
            session.delete(row)
        session.delete(existing)
        session.commit()

    snapshot_date = payload.snapshot_date or _default_snapshot_date(payload.year)
    snapshot = PortfolioYearSnapshot(
        portfolio_id=portfolio_id,
        year=payload.year,
        snapshot_date=snapshot_date,
    )
    session.add(snapshot)
    session.commit()
    session.refresh(snapshot)

    positions = list_positions(session, portfolio_id)
    asset_ids = {position.asset_id for position in positions}
    assets = {
        asset.id: asset
        for asset in session.exec(select(Asset).where(Asset.id.in_(asset_ids))).all()
        if asset.id is not None
    }

    for position in positions:
        if position.status != PositionStatus.ACTIVE:
            continue
        asset = assets.get(position.asset_id)
        if asset is None:
            continue
        session.add(
            PositionSnapshot(
                snapshot_id=snapshot.id,  # type: ignore[arg-type]
                asset_id=position.asset_id,
                quantity=position.quantity,
                average_price=position.average_price,
                invested_amount=position.invested_amount,
                currency=asset.currency,
            ),
        )

    session.commit()
    return get_year_snapshot_detail(session, portfolio_id, payload.year)


def delete_year_snapshot(session: Session, portfolio_id: int, year: int) -> None:
    get_portfolio(session, portfolio_id)
    snapshot = _get_snapshot_for_year(session, portfolio_id, year)
    if snapshot is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="year snapshot not found",
        )
    for row in session.exec(
        select(PositionSnapshot).where(PositionSnapshot.snapshot_id == snapshot.id),
    ).all():
        session.delete(row)
    session.delete(snapshot)
    session.commit()

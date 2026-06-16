from datetime import date

import pytest
from fastapi import HTTPException
from sqlmodel import Session, SQLModel, create_engine

from app.db.session import ALL_TABLES, _ensure_asset_columns
from app.models.asset import AssetMarket, AssetType
from app.models.position import PositionStatus
from app.schemas.asset import AssetCreate
from app.schemas.portfolio import PositionCreate, PositionUpdate
from app.schemas.year_snapshot import YearSnapshotCreate
from app.services.asset_service import create_asset
from app.services.portfolio_service import create_portfolio, create_position, update_position
from app.services.year_snapshot_service import (
    create_year_snapshot,
    delete_year_snapshot,
    get_year_snapshot_detail,
    list_year_snapshots,
)
from app.schemas.portfolio import PortfolioCreate


@pytest.fixture
def db_session(tmp_path):
    engine = create_engine(
        f"sqlite:///{(tmp_path / 'carteira.db').as_posix()}",
        connect_args={"check_same_thread": False},
    )
    SQLModel.metadata.create_all(engine, tables=ALL_TABLES)
    _ensure_asset_columns(engine)
    with Session(engine) as session:
        yield session


def _portfolio(session: Session) -> int:
    portfolio = create_portfolio(session, PortfolioCreate(name="Carteira IR", base_currency="BRL"))
    return portfolio.id  # type: ignore[return-value]


def _asset(session: Session, symbol: str = "BBSE3") -> int:
    asset = create_asset(
        session,
        AssetCreate(
            symbol=symbol,
            name="Ativo teste",
            asset_type=AssetType.STOCK,
            market=AssetMarket.NATIONAL,
            country="BR",
            currency="BRL",
        ),
    )
    return asset.id  # type: ignore[return-value]


def test_create_year_snapshot_copies_active_positions(db_session: Session):
    portfolio_id = _portfolio(db_session)
    asset_id = _asset(db_session)
    create_position(
        db_session,
        portfolio_id,
        PositionCreate(asset_id=asset_id, quantity=100, average_price=32.5),
    )

    snapshot = create_year_snapshot(
        db_session,
        portfolio_id,
        YearSnapshotCreate(year=2024),
    )

    assert snapshot.year == 2024
    assert snapshot.snapshot_date == date(2024, 12, 31)
    assert len(snapshot.positions) == 1
    assert snapshot.positions[0].quantity == 100
    assert snapshot.positions[0].average_price == 32.5


def test_create_year_snapshot_rejects_duplicate_without_replace(db_session: Session):
    portfolio_id = _portfolio(db_session)
    create_year_snapshot(db_session, portfolio_id, YearSnapshotCreate(year=2024))

    with pytest.raises(HTTPException) as exc:
        create_year_snapshot(db_session, portfolio_id, YearSnapshotCreate(year=2024))
    assert exc.value.status_code == 409


def test_create_year_snapshot_replace_updates_positions(db_session: Session):
    portfolio_id = _portfolio(db_session)
    asset_id = _asset(db_session)
    position = create_position(
        db_session,
        portfolio_id,
        PositionCreate(asset_id=asset_id, quantity=10, average_price=20),
    )
    create_year_snapshot(db_session, portfolio_id, YearSnapshotCreate(year=2024))

    update_position(
        db_session,
        portfolio_id,
        position.id,  # type: ignore[arg-type]
        PositionUpdate(quantity=50, average_price=25),
    )

    replaced = create_year_snapshot(
        db_session,
        portfolio_id,
        YearSnapshotCreate(year=2024, replace=True),
    )
    assert replaced.positions[0].quantity == 50
    assert replaced.positions[0].average_price == 25


def test_list_and_delete_year_snapshot(db_session: Session):
    portfolio_id = _portfolio(db_session)
    create_year_snapshot(db_session, portfolio_id, YearSnapshotCreate(year=2023))
    create_year_snapshot(db_session, portfolio_id, YearSnapshotCreate(year=2024))

    listed = list_year_snapshots(db_session, portfolio_id)
    assert [item.year for item in listed] == [2024, 2023]

    delete_year_snapshot(db_session, portfolio_id, 2023)
    with pytest.raises(HTTPException) as exc:
        get_year_snapshot_detail(db_session, portfolio_id, 2023)
    assert exc.value.status_code == 404


def test_snapshot_ignores_closed_positions(db_session: Session):
    portfolio_id = _portfolio(db_session)
    asset_id = _asset(db_session)
    create_position(
        db_session,
        portfolio_id,
        PositionCreate(asset_id=asset_id, quantity=5, average_price=10, status=PositionStatus.CLOSED),
    )

    snapshot = create_year_snapshot(
        db_session,
        portfolio_id,
        YearSnapshotCreate(year=2024),
    )
    assert snapshot.positions == []

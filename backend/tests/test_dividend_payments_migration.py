"""Migracao + backfill do portfolio_id em dividend_payment (banco unificado)."""

from datetime import date
from pathlib import Path

from sqlmodel import Session, SQLModel, create_engine, select

from app.db.migrate_legacy import migrate_legacy_databases
from app.db.session import ALL_TABLES, PORTFOLIO_TABLES
from app.models.asset import Asset, AssetMarket, AssetType, DisplayClass
from app.models.dividend_payment import DividendPayment, DividendPaymentType
from app.models.portfolio import Portfolio
from app.schemas.portfolio import PortfolioCreate
from app.services.portfolio_service import create_portfolio

_DISPLAY_STOCK = DisplayClass.STOCKS


def _make_engine(tmp_path: Path):
    db_path = tmp_path / "carteira.db"
    engine = create_engine(
        f"sqlite:///{db_path.as_posix()}",
        connect_args={"check_same_thread": False},
    )
    SQLModel.metadata.create_all(engine, tables=ALL_TABLES)
    return engine, db_path


def _seed_legacy_payment_without_portfolio_id(engine) -> int:
    with Session(engine) as session:
        asset = Asset(
            symbol="BBSE3",
            name="BB Seguridade",
            asset_type=AssetType.STOCK,
            market=AssetMarket.NATIONAL,
            country="BR",
            currency="BRL",
            display_class=_DISPLAY_STOCK,
        )
        session.add(asset)
        session.commit()
        session.refresh(asset)
        payment = DividendPayment(
            asset_id=asset.id,  # type: ignore[arg-type]
            portfolio_id=None,
            payment_type=DividendPaymentType.DIVIDEND,
            payment_date=date(2024, 6, 1),
            amount=100.0,
            currency="BRL",
        )
        session.add(payment)
        session.commit()
        return asset.id  # type: ignore[return-value]


def test_backfill_assigns_controle_investimento(tmp_path, monkeypatch):
    data_dir = tmp_path / "data"
    data_dir.mkdir()
    legacy_portfolios = data_dir / "portfolios.db"
    monkeypatch.setenv("LOCAL_DATA_DIR", str(data_dir))

    legacy_engine = create_engine(
        f"sqlite:///{legacy_portfolios.as_posix()}",
        connect_args={"check_same_thread": False},
    )
    SQLModel.metadata.create_all(legacy_engine, tables=PORTFOLIO_TABLES)
    with Session(legacy_engine) as session:
        create_portfolio(session, PortfolioCreate(name="Controle investimento"))
    legacy_engine.dispose()

    engine, db_path = _make_engine(tmp_path)
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{db_path.as_posix()}")
    _seed_legacy_payment_without_portfolio_id(engine)

    migrate_legacy_databases(engine)

    with Session(engine) as session:
        payment = session.exec(select(DividendPayment)).first()
        assert payment is not None
        assert payment.portfolio_id is not None
        portfolio = session.get(Portfolio, payment.portfolio_id)
        assert portfolio is not None
        assert portfolio.name.casefold() == "controle investimento"


def test_backfill_keeps_null_when_target_portfolio_missing(tmp_path, monkeypatch):
    data_dir = tmp_path / "data"
    data_dir.mkdir()
    monkeypatch.setenv("LOCAL_DATA_DIR", str(data_dir))

    engine, db_path = _make_engine(tmp_path)
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{db_path.as_posix()}")
    _seed_legacy_payment_without_portfolio_id(engine)

    migrate_legacy_databases(engine)

    with Session(engine) as session:
        payment = session.exec(select(DividendPayment)).first()
        assert payment is not None
        assert payment.portfolio_id is None


def test_backfill_is_idempotent(tmp_path, monkeypatch):
    data_dir = tmp_path / "data"
    data_dir.mkdir()
    legacy_portfolios = data_dir / "portfolios.db"
    monkeypatch.setenv("LOCAL_DATA_DIR", str(data_dir))

    legacy_engine = create_engine(
        f"sqlite:///{legacy_portfolios.as_posix()}",
        connect_args={"check_same_thread": False},
    )
    SQLModel.metadata.create_all(legacy_engine, tables=PORTFOLIO_TABLES)
    with Session(legacy_engine) as session:
        create_portfolio(session, PortfolioCreate(name="CONTROLE INVESTIMENTO"))
    legacy_engine.dispose()

    engine, db_path = _make_engine(tmp_path)
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{db_path.as_posix()}")
    asset_id = _seed_legacy_payment_without_portfolio_id(engine)

    migrate_legacy_databases(engine)
    migrate_legacy_databases(engine)

    with Session(engine) as session:
        payment = session.exec(select(DividendPayment)).first()
        assert payment is not None
        assert payment.portfolio_id is not None
        assert payment.asset_id == asset_id

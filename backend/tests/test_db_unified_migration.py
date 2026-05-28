"""Testes de migração legado → banco unificado."""

from datetime import date
from pathlib import Path

from sqlmodel import Session, SQLModel, create_engine, select

from app.core.config import MIGRATION_UNIFIED_DB_KEY
from app.db.migrate_legacy import migrate_legacy_databases
from app.db.session import ALL_TABLES, PORTFOLIO_TABLES
from app.models.dividend_payment import DividendPayment, DividendPaymentType
from app.models.portfolio import AppPreference, Portfolio
from app.schemas.asset import AssetCreate
from app.schemas.portfolio import PortfolioCreate
from app.services.asset_service import create_asset
from app.services.portfolio_service import create_portfolio


def _make_unified_engine(db_path: Path):
    engine = create_engine(
        f"sqlite:///{db_path.as_posix()}",
        connect_args={"check_same_thread": False},
    )
    SQLModel.metadata.create_all(engine, tables=ALL_TABLES)
    return engine


def _seed_legacy_portfolios_db(path: Path) -> None:
    engine = create_engine(
        f"sqlite:///{path.as_posix()}",
        connect_args={"check_same_thread": False},
    )
    SQLModel.metadata.create_all(engine, tables=PORTFOLIO_TABLES)
    with Session(engine) as session:
        create_portfolio(
            session,
            PortfolioCreate(name="Controle investimento"),
        )
    engine.dispose()


def _seed_legacy_assets_db(path: Path, portfolio_id: int = 99) -> None:
    engine = create_engine(
        f"sqlite:///{path.as_posix()}",
        connect_args={"check_same_thread": False},
    )
    from app.models.asset import Asset

    SQLModel.metadata.create_all(
        engine,
        tables=[Asset.__table__, DividendPayment.__table__],
    )
    with engine.begin() as conn:
        conn.exec_driver_sql(
            "INSERT INTO asset (symbol, name, asset_type, market, country, currency) "
            "VALUES ('BBSE3', 'BB Seguridade', 'stock', 'national', 'BR', 'BRL')",
        )
        asset_id = conn.exec_driver_sql("SELECT id FROM asset").scalar_one()
        conn.exec_driver_sql(
            "INSERT INTO dividendpayment "
            "(asset_id, payment_type, payment_date, amount, currency, portfolio_id) "
            "VALUES (?, 'dividend', '2024-06-01', 100.0, 'BRL', NULL)",
            (asset_id,),
        )
    engine.dispose()


def test_migrate_legacy_portfolios_into_unified_db(tmp_path, monkeypatch):
    data_dir = tmp_path / "data"
    data_dir.mkdir()
    unified_path = data_dir / "carteira.db"
    legacy_portfolios = data_dir / "portfolios.db"
    monkeypatch.setenv("LOCAL_DATA_DIR", str(data_dir))
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{unified_path.as_posix()}")

    _seed_legacy_portfolios_db(legacy_portfolios)
    engine = _make_unified_engine(unified_path)

    migrate_legacy_databases(engine)

    with Session(engine) as session:
        portfolios = session.exec(select(Portfolio)).all()
        assert len(portfolios) == 1
        assert portfolios[0].name == "Controle investimento"
        pref = session.get(AppPreference, MIGRATION_UNIFIED_DB_KEY)
        assert pref is not None
        assert pref.value == "done"

    assert legacy_portfolios.with_suffix(".db.migrated").is_file()


def test_migrate_legacy_backfills_dividend_portfolio_id(tmp_path, monkeypatch):
    data_dir = tmp_path / "data"
    data_dir.mkdir()
    unified_path = data_dir / "carteira.db"
    legacy_portfolios = data_dir / "portfolios.db"
    monkeypatch.setenv("LOCAL_DATA_DIR", str(data_dir))
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{unified_path.as_posix()}")

    _seed_legacy_portfolios_db(legacy_portfolios)
    engine = _make_unified_engine(unified_path)

    from app.models.asset import Asset

    with Session(engine) as session:
        asset = create_asset(
            session,
            AssetCreate(
                symbol="ITSA4",
                name="Itausa",
                asset_type="stock",
                market="national",
                country="BR",
                currency="BRL",
            ),
        )
        payment = DividendPayment(
            asset_id=asset.id,  # type: ignore[arg-type]
            portfolio_id=None,
            payment_type=DividendPaymentType.DIVIDEND,
            payment_date=date(2024, 1, 10),
            amount=50.0,
            currency="BRL",
        )
        session.add(payment)
        session.commit()

    migrate_legacy_databases(engine)

    with Session(engine) as session:
        payment = session.exec(select(DividendPayment)).first()
        assert payment is not None
        assert payment.portfolio_id is not None
        portfolio = session.get(Portfolio, payment.portfolio_id)
        assert portfolio is not None
        assert portfolio.name.casefold() == "controle investimento"

from collections.abc import Generator

from sqlalchemy.engine import Engine
from sqlmodel import Session, SQLModel, create_engine

import app.models  # noqa: F401
from app.core.config import settings
from app.models.analysis import (
    AnalysisCriterionDefinition,
    AnalysisProfileSettings,
    AnalysisViabilityRule,
    AssetAnalysisScore,
)
from app.models.asset import Asset
from app.models.dividend_payment import DividendPayment
from app.models.portfolio import AppPreference, Portfolio
from app.models.position import Position

assets_engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False},
)

portfolios_engine = create_engine(
    settings.resolved_portfolios_database_url(),
    connect_args={"check_same_thread": False},
)

ASSET_TABLES = [
    Asset.__table__,
    DividendPayment.__table__,
    AnalysisCriterionDefinition.__table__,
    AnalysisProfileSettings.__table__,
    AnalysisViabilityRule.__table__,
    AssetAnalysisScore.__table__,
]
PORTFOLIO_TABLES = [
    Portfolio.__table__,
    Position.__table__,
    AppPreference.__table__,
]

POSITION_OPTIONAL_COLUMNS = {
    "invested_amount": "FLOAT",
    "current_value": "FLOAT",
    "contracted_yield": "VARCHAR",
}

ASSET_OPTIONAL_COLUMNS = {
    "fixed_income_indexer": "VARCHAR",
    "fixed_income_yield_description": "TEXT",
    "fixed_income_title_type": "VARCHAR",
    "maturity_date": "DATE",
    "purchase_date": "DATE",
}


def _ensure_position_columns(engine: Engine) -> None:
    """SQLite create_all does not add columns to an existing local DB."""
    with engine.begin() as connection:
        existing = {
            row[1]
            for row in connection.exec_driver_sql("PRAGMA table_info(position)").fetchall()
        }
        for column, sql_type in POSITION_OPTIONAL_COLUMNS.items():
            if column not in existing:
                connection.exec_driver_sql(
                    f"ALTER TABLE position ADD COLUMN {column} {sql_type}",
                )


def _ensure_asset_columns(engine: Engine) -> None:
    """SQLite create_all does not add columns to an existing local DB."""
    with engine.begin() as connection:
        existing = {
            row[1]
            for row in connection.exec_driver_sql("PRAGMA table_info(asset)").fetchall()
        }
        for column, sql_type in ASSET_OPTIONAL_COLUMNS.items():
            if column not in existing:
                connection.exec_driver_sql(
                    f"ALTER TABLE asset ADD COLUMN {column} {sql_type}",
                )


def init_db() -> None:
    SQLModel.metadata.create_all(assets_engine, tables=ASSET_TABLES)
    SQLModel.metadata.create_all(portfolios_engine, tables=PORTFOLIO_TABLES)
    _ensure_asset_columns(assets_engine)
    _ensure_position_columns(portfolios_engine)


def get_session() -> Generator[Session, None, None]:
    with Session(assets_engine) as session:
        yield session


def get_portfolios_session() -> Generator[Session, None, None]:
    with Session(portfolios_engine) as session:
        yield session

from collections.abc import Generator

from sqlalchemy.engine import Engine
from sqlmodel import Session, SQLModel, create_engine

import app.models  # noqa: F401
from app.core.config import settings
from app.db.migrate_legacy import migrate_legacy_databases
from app.models.analysis import (
    AnalysisCriterionDefinition,
    AnalysisProfileSettings,
    AnalysisSegmentCatalog,
    AnalysisViabilityRule,
    AssetAnalysisScore,
)
from app.models.asset import Asset
from app.models.dividend_payment import DividendPayment
from app.models.objective import Objective
from app.models.objective_allocation import ObjectiveAllocation
from app.models.portfolio import AppPreference, Portfolio
from app.models.position import Position

engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False},
)

# Compatibilidade removida — use `engine` e `get_session` apenas.

ASSET_TABLES = [
    Asset.__table__,
    DividendPayment.__table__,
    AnalysisCriterionDefinition.__table__,
    AnalysisProfileSettings.__table__,
    AnalysisViabilityRule.__table__,
    AnalysisSegmentCatalog.__table__,
    AssetAnalysisScore.__table__,
]
PORTFOLIO_TABLES = [
    Portfolio.__table__,
    Position.__table__,
    AppPreference.__table__,
    Objective.__table__,
    ObjectiveAllocation.__table__,
]
ALL_TABLES = ASSET_TABLES + PORTFOLIO_TABLES

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

ASSET_ANALYSIS_SCORE_OPTIONAL_COLUMNS = {
    "value_text": "VARCHAR",
}

OBJECTIVE_OPTIONAL_COLUMNS = {
    "mode": "VARCHAR",
    "partition_asset_id": "INTEGER",
}


def _ensure_position_columns(engine_param: Engine) -> None:
    """SQLite create_all does not add columns to an existing local DB."""
    with engine_param.begin() as connection:
        existing = {
            row[1]
            for row in connection.exec_driver_sql("PRAGMA table_info(position)").fetchall()
        }
        for column, sql_type in POSITION_OPTIONAL_COLUMNS.items():
            if column not in existing:
                connection.exec_driver_sql(
                    f"ALTER TABLE position ADD COLUMN {column} {sql_type}",
                )


def _ensure_asset_columns(engine_param: Engine) -> None:
    """SQLite create_all does not add columns to an existing local DB."""
    with engine_param.begin() as connection:
        existing = {
            row[1]
            for row in connection.exec_driver_sql("PRAGMA table_info(asset)").fetchall()
        }
        for column, sql_type in ASSET_OPTIONAL_COLUMNS.items():
            if column not in existing:
                connection.exec_driver_sql(
                    f"ALTER TABLE asset ADD COLUMN {column} {sql_type}",
                )


def _ensure_asset_analysis_score_columns(engine_param: Engine) -> None:
    with engine_param.begin() as connection:
        existing = {
            row[1]
            for row in connection.exec_driver_sql(
                "PRAGMA table_info(asset_analysis_score)"
            ).fetchall()
        }
        for column, sql_type in ASSET_ANALYSIS_SCORE_OPTIONAL_COLUMNS.items():
            if column not in existing:
                connection.exec_driver_sql(
                    f"ALTER TABLE asset_analysis_score ADD COLUMN {column} {sql_type}",
                )


def _ensure_objective_columns(engine_param: Engine) -> None:
    with engine_param.begin() as connection:
        tables = {
            row[0]
            for row in connection.exec_driver_sql(
                "SELECT name FROM sqlite_master WHERE type='table'"
            ).fetchall()
        }
        if "objective" not in tables:
            return
        existing = {
            row[1]
            for row in connection.exec_driver_sql("PRAGMA table_info(objective)").fetchall()
        }
        for column, sql_type in OBJECTIVE_OPTIONAL_COLUMNS.items():
            if column not in existing:
                connection.exec_driver_sql(
                    f"ALTER TABLE objective ADD COLUMN {column} {sql_type}",
                )


def _migrate_objective_allocation_slices(engine_param: Engine) -> None:
    """Permite várias fatias do mesmo ativo; nome interno único por objetivo."""
    with engine_param.begin() as connection:
        tables = {
            row[0]
            for row in connection.exec_driver_sql(
                "SELECT name FROM sqlite_master WHERE type='table'"
            ).fetchall()
        }
        if "objectiveallocation" not in tables:
            return

        columns = {
            row[1]
            for row in connection.exec_driver_sql(
                "PRAGMA table_info(objectiveallocation)"
            ).fetchall()
        }
        if "slice_name" in columns:
            return

        connection.exec_driver_sql(
            """
            CREATE TABLE objectiveallocation_new (
                id INTEGER PRIMARY KEY,
                objective_id INTEGER NOT NULL,
                asset_id INTEGER NOT NULL,
                slice_name VARCHAR NOT NULL,
                quantity FLOAT,
                amount FLOAT,
                updated_at DATETIME,
                UNIQUE (objective_id, slice_name)
            )
            """
        )
        connection.exec_driver_sql(
            """
            INSERT INTO objectiveallocation_new (
                id, objective_id, asset_id, slice_name, quantity, amount, updated_at
            )
            SELECT
                id,
                objective_id,
                asset_id,
                'Principal',
                quantity,
                amount,
                updated_at
            FROM objectiveallocation
            """
        )
        connection.exec_driver_sql("DROP TABLE objectiveallocation")
        connection.exec_driver_sql(
            "ALTER TABLE objectiveallocation_new RENAME TO objectiveallocation"
        )


def _ensure_dividend_payment_portfolio_column(engine_param: Engine) -> None:
    with engine_param.begin() as connection:
        tables = {
            row[0]
            for row in connection.exec_driver_sql(
                "SELECT name FROM sqlite_master WHERE type='table'"
            ).fetchall()
        }
        if "dividendpayment" not in tables:
            return
        existing = {
            row[1]
            for row in connection.exec_driver_sql(
                "PRAGMA table_info(dividendpayment)"
            ).fetchall()
        }
        if "portfolio_id" not in existing:
            connection.exec_driver_sql(
                "ALTER TABLE dividendpayment ADD COLUMN portfolio_id INTEGER",
            )


def init_db() -> None:
    SQLModel.metadata.create_all(engine, tables=ALL_TABLES)
    migrate_legacy_databases(engine)
    _ensure_asset_columns(engine)
    _ensure_asset_analysis_score_columns(engine)
    _ensure_position_columns(engine)
    _ensure_objective_columns(engine)
    _migrate_objective_allocation_slices(engine)
    _ensure_dividend_payment_portfolio_column(engine)
    _ensure_default_objectives(engine)


def _ensure_default_objectives(engine_param: Engine) -> None:
    from app.services.objective_service import ensure_default_objectives_for_all_portfolios

    with Session(engine_param) as session:
        ensure_default_objectives_for_all_portfolios(session)


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session

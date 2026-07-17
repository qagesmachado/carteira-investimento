import logging
import shutil
from collections.abc import Generator
from datetime import datetime
from pathlib import Path

from sqlalchemy.engine import Engine
from sqlmodel import Session, SQLModel, create_engine, select

import app.models  # noqa: F401
from app.core.config import settings
from app.db.migrate_legacy import migrate_legacy_databases
from app.models.analysis import (
    AnalysisCriterionDefinition,
    AnalysisProfileSettings,
    AnalysisSegmentCatalog,
    AnalysisViabilityRule,
    AssetAnalysisScore,
    PortfolioAssetAllocation,
    PortfolioAssetAnalysisStatus,
    PortfolioAnalysisMethodology,
)
from app.models.asset import Asset
from app.models.crypto_fee import CryptoFee, CryptoFeeType
from app.models.dividend_payment import DividendPayment
from app.models.manual_patrimony_item import ManualPatrimonyItem
from app.models.objective import Objective
from app.models.objective_allocation import ObjectiveAllocation
from app.models.pension_contribution_year import PensionContributionYear
from app.models.property_financing import (
    PropertyFinancing,
    PropertyFinancingEntry,
    PropertyFinancingEntryTemplate,
)
from app.models.portfolio import AppPreference, Portfolio
from app.models.position import Position
from app.models.year_snapshot import PortfolioYearSnapshot, PositionSnapshot
from app.models.budget import (
    BudgetCategory,
    BudgetIncomeSource,
    BudgetMonth,
    BudgetMonthIncome,
    BudgetMonthTarget,
    BudgetProfile,
    BudgetRecurringExpense,
    BudgetTag,
    BudgetTransaction,
)

logger = logging.getLogger(__name__)

# Versão do schema esperada pelo código. Incrementar ao adicionar uma migração
# nova; é comparada com o `PRAGMA user_version` gravado dentro do arquivo do banco.
SCHEMA_VERSION = 5

engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False},
)

# Compatibilidade removida — use `engine` e `get_session` apenas.

ASSET_TABLES = [
    Asset.__table__,
    DividendPayment.__table__,
    CryptoFee.__table__,
    AnalysisCriterionDefinition.__table__,
    AnalysisProfileSettings.__table__,
    AnalysisViabilityRule.__table__,
    AnalysisSegmentCatalog.__table__,
    AssetAnalysisScore.__table__,
]
PORTFOLIO_TABLES = [
    Portfolio.__table__,
    Position.__table__,
    PortfolioAssetAllocation.__table__,
    PortfolioAssetAnalysisStatus.__table__,
    PortfolioAnalysisMethodology.__table__,
    PortfolioYearSnapshot.__table__,
    PositionSnapshot.__table__,
    AppPreference.__table__,
    Objective.__table__,
    ObjectiveAllocation.__table__,
    PensionContributionYear.__table__,
    PropertyFinancing.__table__,
    PropertyFinancingEntry.__table__,
    PropertyFinancingEntryTemplate.__table__,
    ManualPatrimonyItem.__table__,
]
BUDGET_TABLES = [
    BudgetProfile.__table__,
    BudgetCategory.__table__,
    BudgetTag.__table__,
    BudgetIncomeSource.__table__,
    BudgetMonth.__table__,
    BudgetMonthTarget.__table__,
    BudgetMonthIncome.__table__,
    BudgetRecurringExpense.__table__,
    BudgetTransaction.__table__,
]
ALL_TABLES = ASSET_TABLES + PORTFOLIO_TABLES + BUDGET_TABLES

POSITION_OPTIONAL_COLUMNS = {
    "invested_amount": "FLOAT",
    "current_value": "FLOAT",
    "contracted_yield": "VARCHAR",
}

PORTFOLIO_OPTIONAL_COLUMNS = {
    "delete_locked": "BOOLEAN NOT NULL DEFAULT 0",
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
    "plan_year": "INTEGER",
    "annual_gross_income_brl": "FLOAT",
    "contributed_ytd_brl": "FLOAT DEFAULT 0",
    "exclude_from_rebalance": "BOOLEAN DEFAULT 0",
    "is_emergency_reserve": "BOOLEAN DEFAULT 0",
}


OBJECTIVE_ALLOCATION_OPTIONAL_COLUMNS = {
    "exclude_from_rebalance": "BOOLEAN DEFAULT 0",
    "is_emergency_reserve": "BOOLEAN DEFAULT 0",
}


def _ensure_objective_allocation_columns(engine_param: Engine) -> None:
    with engine_param.begin() as connection:
        tables = {
            row[0]
            for row in connection.exec_driver_sql(
                "SELECT name FROM sqlite_master WHERE type='table'"
            ).fetchall()
        }
        if "objectiveallocation" not in tables:
            return
        existing = {
            row[1]
            for row in connection.exec_driver_sql(
                "PRAGMA table_info(objectiveallocation)"
            ).fetchall()
        }
        for column, sql_type in OBJECTIVE_ALLOCATION_OPTIONAL_COLUMNS.items():
            if column not in existing:
                connection.exec_driver_sql(
                    f"ALTER TABLE objectiveallocation ADD COLUMN {column} {sql_type}",
                )


def _migrate_objective_flags_to_allocations(engine_param: Engine) -> None:
    """Copia flags legadas do objetivo para todas as suas fatias (uma vez)."""
    with engine_param.begin() as connection:
        tables = {
            row[0]
            for row in connection.exec_driver_sql(
                "SELECT name FROM sqlite_master WHERE type='table'"
            ).fetchall()
        }
        if "objective" not in tables or "objectiveallocation" not in tables:
            return
        obj_cols = {
            row[1]
            for row in connection.exec_driver_sql("PRAGMA table_info(objective)").fetchall()
        }
        alloc_cols = {
            row[1]
            for row in connection.exec_driver_sql(
                "PRAGMA table_info(objectiveallocation)"
            ).fetchall()
        }
        if "exclude_from_rebalance" not in alloc_cols:
            return
        if "exclude_from_rebalance" not in obj_cols:
            return
        connection.exec_driver_sql(
            """
            UPDATE objectiveallocation
            SET exclude_from_rebalance = 1
            WHERE objective_id IN (
                SELECT id FROM objective WHERE exclude_from_rebalance = 1
            )
            """
        )
        connection.exec_driver_sql(
            """
            UPDATE objectiveallocation
            SET is_emergency_reserve = 1,
                exclude_from_rebalance = 1
            WHERE objective_id IN (
                SELECT id FROM objective WHERE is_emergency_reserve = 1
            )
            """
        )
        connection.exec_driver_sql(
            """
            UPDATE objective
            SET exclude_from_rebalance = 0,
                is_emergency_reserve = 0
            """
        )


def _ensure_portfolio_columns(engine_param: Engine) -> None:
    with engine_param.begin() as connection:
        existing = {
            row[1]
            for row in connection.exec_driver_sql("PRAGMA table_info(portfolio)").fetchall()
        }
        for column, sql_type in PORTFOLIO_OPTIONAL_COLUMNS.items():
            if column not in existing:
                connection.exec_driver_sql(
                    f"ALTER TABLE portfolio ADD COLUMN {column} {sql_type}",
                )


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


def _ensure_dividend_payment_amount_columns(engine_param: Engine) -> None:
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
        if "gross_amount" not in existing:
            connection.exec_driver_sql(
                "ALTER TABLE dividendpayment ADD COLUMN gross_amount REAL",
            )
        if "tax_withheld" not in existing:
            connection.exec_driver_sql(
                "ALTER TABLE dividendpayment ADD COLUMN tax_withheld REAL",
            )


def _migrate_property_financing_schema(engine_param: Engine) -> None:
    """Recria lançamentos quando o schema antigo (períodos mensais) ainda existir."""
    with engine_param.begin() as connection:
        tables = {
            row[0]
            for row in connection.exec_driver_sql(
                "SELECT name FROM sqlite_master WHERE type='table'"
            ).fetchall()
        }
        if "propertyfinancingentry" not in tables:
            return
        columns = {
            row[1]
            for row in connection.exec_driver_sql(
                "PRAGMA table_info(propertyfinancingentry)"
            ).fetchall()
        }
        if "financing_id" in columns and "event_date" in columns:
            return
        connection.exec_driver_sql("DROP TABLE IF EXISTS propertyfinancingentry")
        connection.exec_driver_sql("DROP TABLE IF EXISTS propertyfinancingperiod")
    SQLModel.metadata.create_all(engine_param, tables=[PropertyFinancingEntry.__table__])


def _database_file_path(engine_param: Engine) -> Path | None:
    """Caminho do arquivo SQLite, ou None para bancos em memória/outros."""
    database = engine_param.url.database
    if not database or database == ":memory:":
        return None
    return Path(database)


def read_user_version(engine_param: Engine) -> int:
    """Versão do schema gravada dentro do arquivo do banco (0 por padrão)."""
    with engine_param.connect() as connection:
        row = connection.exec_driver_sql("PRAGMA user_version").fetchone()
        return int(row[0]) if row else 0


def _write_user_version(engine_param: Engine, version: int) -> None:
    with engine_param.begin() as connection:
        connection.exec_driver_sql(f"PRAGMA user_version = {int(version)}")


def _backup_database(path: Path, current_version: int) -> Path | None:
    """Copia o banco antes de migrar; retorna o caminho do backup criado."""
    if not path.exists() or path.stat().st_size == 0:
        return None
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    backup_path = path.with_name(f"{path.name}.bak-v{current_version}-{timestamp}")
    shutil.copy2(path, backup_path)
    logger.info("Backup do banco criado antes da migração: %s", backup_path)
    return backup_path


def _migrate_manual_patrimony_cash_to_emergency_reserve(engine_param: Engine) -> None:
    """Converte itens legados category=cash para reserva com localização espécie."""
    with engine_param.begin() as connection:
        tables = {
            row[0]
            for row in connection.exec_driver_sql(
                "SELECT name FROM sqlite_master WHERE type='table'"
            ).fetchall()
        }
        if "manualpatrimonyitem" not in tables:
            return
        connection.exec_driver_sql(
            """
            UPDATE manualpatrimonyitem
            SET category = 'emergency_reserve',
                location = 'dinheiro_especie'
            WHERE category = 'cash'
            """
        )


def _ensure_budget_columns(engine_param: Engine) -> None:
    with engine_param.begin() as connection:
        existing = {
            row[1]
            for row in connection.exec_driver_sql("PRAGMA table_info(budgettransaction)").fetchall()
        }
        if "recurring_expense_id" not in existing:
            connection.exec_driver_sql(
                "ALTER TABLE budgettransaction ADD COLUMN recurring_expense_id INTEGER"
            )


def init_db() -> None:
    db_path = _database_file_path(engine)
    pre_existing = bool(db_path and db_path.exists() and db_path.stat().st_size > 0)
    current_version = read_user_version(engine) if pre_existing else 0
    needs_migration = current_version < SCHEMA_VERSION

    # Antes de mexer em um banco já existente desatualizado, fazer backup.
    if needs_migration and pre_existing and db_path is not None:
        _backup_database(db_path, current_version)

    SQLModel.metadata.create_all(engine, tables=ALL_TABLES)
    migrate_legacy_databases(engine)
    _ensure_asset_columns(engine)
    _ensure_asset_analysis_score_columns(engine)
    _ensure_portfolio_columns(engine)
    _ensure_position_columns(engine)
    _ensure_objective_columns(engine)
    _migrate_objective_allocation_slices(engine)
    _ensure_objective_allocation_columns(engine)
    _migrate_objective_flags_to_allocations(engine)
    _ensure_dividend_payment_portfolio_column(engine)
    _ensure_dividend_payment_amount_columns(engine)
    _migrate_property_financing_schema(engine)
    _migrate_pension_contribution_years(engine)
    _migrate_manual_patrimony_cash_to_emergency_reserve(engine)
    _ensure_budget_columns(engine)
    _ensure_default_objectives(engine)
    _migrate_global_allocations_to_portfolio(engine)

    if needs_migration:
        _write_user_version(engine, SCHEMA_VERSION)


def _migrate_global_allocations_to_portfolio(engine_param: Engine) -> None:
    """Copia alocações globais legadas (asset_analysis_score) para cada carteira com posição."""
    from app.models.asset import DisplayClass
    from app.services.analysis_defaults import (
        ANALYSIS_LINK_CODE,
        PROFILE_CRYPTO,
        PROFILE_ETF_INTL,
        TARGET_PERCENT_CODE,
    )
    from app.services.asset_service import get_asset_by_id, infer_display_class

    with engine_param.begin() as connection:
        tables = {
            row[0]
            for row in connection.exec_driver_sql(
                "SELECT name FROM sqlite_master WHERE type='table'"
            ).fetchall()
        }
        if "portfolio_asset_allocation" not in tables:
            return

    with Session(engine_param) as session:
        existing_count = session.exec(select(PortfolioAssetAllocation)).first()
        if existing_count is not None:
            return

        score_rows = session.exec(select(AssetAnalysisScore)).all()
        by_asset: dict[int, dict[str, str | None]] = {}
        for row in score_rows:
            if row.criterion_code not in (TARGET_PERCENT_CODE, ANALYSIS_LINK_CODE):
                continue
            by_asset.setdefault(row.asset_id, {})[row.criterion_code] = row.value_text

        if not by_asset:
            return

        positions = session.exec(select(Position)).all()
        positions_by_asset: dict[int, set[int]] = {}
        for position in positions:
            positions_by_asset.setdefault(position.asset_id, set()).add(position.portfolio_id)

        for asset_id, refs in by_asset.items():
            asset = get_asset_by_id(session, asset_id)
            if asset is None:
                continue
            display_class = infer_display_class(asset.asset_type, asset.market, asset.etf_subtype)
            if display_class == DisplayClass.CRYPTO:
                profile = PROFILE_CRYPTO
            elif display_class == DisplayClass.INTERNATIONAL:
                profile = PROFILE_ETF_INTL
            else:
                continue

            target_raw = refs.get(TARGET_PERCENT_CODE)
            if target_raw is None or not str(target_raw).strip():
                continue
            try:
                target_percent = float(str(target_raw).strip().replace(",", "."))
            except ValueError:
                continue

            link_raw = refs.get(ANALYSIS_LINK_CODE)
            analysis_link = link_raw.strip() if isinstance(link_raw, str) and link_raw.strip() else None

            for portfolio_id in positions_by_asset.get(asset_id, set()):
                session.add(
                    PortfolioAssetAllocation(
                        portfolio_id=portfolio_id,
                        asset_id=asset_id,
                        profile=profile,
                        target_percent=target_percent,
                        analysis_link=analysis_link,
                    )
                )
        session.commit()


def _migrate_pension_contribution_years(engine_param: Engine) -> None:
    from app.models.objective import ObjectiveMode
    from app.services.objective_service import migrate_legacy_pension_objectives_to_years

    with Session(engine_param) as session:
        migrate_legacy_pension_objectives_to_years(session)


def _ensure_default_objectives(engine_param: Engine) -> None:
    from app.services.objective_service import ensure_default_objectives_for_all_portfolios

    with Session(engine_param) as session:
        ensure_default_objectives_for_all_portfolios(session)


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session

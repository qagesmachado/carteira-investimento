"""Migração automática de dois SQLite legados para banco unificado."""

from __future__ import annotations

import os
import shutil
from pathlib import Path

from sqlalchemy.engine import Engine
from sqlmodel import create_engine

from app.core.config import MIGRATION_UNIFIED_DB_KEY, settings

LEGACY_DIVIDEND_BACKFILL_PORTFOLIO_NAME = "Controle investimento"

PORTFOLIO_TABLE_NAMES = ("portfolio", "position", "apppreference")


def _runtime_local_data_dir() -> Path:
    explicit = os.getenv("LOCAL_DATA_DIR", "").strip()
    if explicit:
        return Path(explicit)
    return settings.local_data_dir


def _legacy_portfolios_db_path() -> Path:
    return _runtime_local_data_dir() / "portfolios.db"


def _table_exists(connection, table_name: str, *, schema: str | None = None) -> bool:
    if schema:
        row = connection.exec_driver_sql(
            f"SELECT name FROM {schema}.sqlite_master WHERE type='table' AND name=?",
            (table_name,),
        ).fetchone()
        return row is not None
    row = connection.exec_driver_sql(
        "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
        (table_name,),
    ).fetchone()
    return row is not None


def _migration_done(connection) -> bool:
    if not _table_exists(connection, "apppreference"):
        return False
    row = connection.exec_driver_sql(
        "SELECT value FROM apppreference WHERE key = ?",
        (MIGRATION_UNIFIED_DB_KEY,),
    ).fetchone()
    return row is not None and row[0] == "done"


def _mark_migration_done(connection) -> None:
    connection.exec_driver_sql(
        "INSERT OR REPLACE INTO apppreference (key, value) VALUES (?, ?)",
        (MIGRATION_UNIFIED_DB_KEY, "done"),
    )


def _backup_file(path: Path) -> None:
    if path.is_file():
        backup = path.with_suffix(path.suffix + ".bak")
        if not backup.is_file():
            shutil.copy2(path, backup)


def _merge_legacy_portfolios_db(engine: Engine, legacy_path: Path) -> None:
    if not legacy_path.is_file():
        return
    _backup_file(legacy_path)
    legacy_engine = create_engine(
        f"sqlite:///{legacy_path.as_posix()}",
        connect_args={"check_same_thread": False},
    )
    try:
        with legacy_engine.connect() as source, engine.begin() as dest:
            for table_name in PORTFOLIO_TABLE_NAMES:
                if not _table_exists(source, table_name):
                    continue
                rows = source.exec_driver_sql(f"SELECT * FROM {table_name}").fetchall()
                if not rows:
                    continue
                columns = [
                    row[1]
                    for row in source.exec_driver_sql(
                        f"PRAGMA table_info({table_name})",
                    ).fetchall()
                ]
                placeholders = ", ".join("?" for _ in columns)
                col_list = ", ".join(columns)
                local_count = dest.exec_driver_sql(
                    f"SELECT COUNT(*) FROM {table_name}",
                ).scalar_one()
                if local_count == 0:
                    for row in rows:
                        dest.exec_driver_sql(
                            f"INSERT INTO {table_name} ({col_list}) VALUES ({placeholders})",
                            tuple(row),
                        )
                else:
                    for row in rows:
                        dest.exec_driver_sql(
                            f"INSERT OR IGNORE INTO {table_name} ({col_list}) VALUES ({placeholders})",
                            tuple(row),
                        )
    finally:
        legacy_engine.dispose()


def _merge_legacy_assets_db(engine: Engine, legacy_path: Path) -> None:
    if not legacy_path.is_file():
        return
    _backup_file(legacy_path)
    legacy_engine = create_engine(
        f"sqlite:///{legacy_path.as_posix()}",
        connect_args={"check_same_thread": False},
    )
    asset_tables = (
        "asset",
        "dividendpayment",
        "analysis_criterion_definition",
        "analysis_profile_settings",
        "analysis_viability_rule",
        "analysis_segment_catalog",
        "asset_analysis_score",
    )
    try:
        with legacy_engine.connect() as source, engine.begin() as dest:
            for table_name in asset_tables:
                if not _table_exists(source, table_name):
                    continue
                rows = source.exec_driver_sql(f"SELECT * FROM {table_name}").fetchall()
                if not rows:
                    continue
                columns = [
                    row[1]
                    for row in source.exec_driver_sql(
                        f"PRAGMA table_info({table_name})",
                    ).fetchall()
                ]
                placeholders = ", ".join("?" for _ in columns)
                col_list = ", ".join(columns)
                local_count = dest.exec_driver_sql(
                    f"SELECT COUNT(*) FROM {table_name}",
                ).scalar_one()
                insert_sql = (
                    f"INSERT INTO {table_name} ({col_list}) VALUES ({placeholders})"
                    if local_count == 0
                    else f"INSERT OR IGNORE INTO {table_name} ({col_list}) VALUES ({placeholders})"
                )
                for row in rows:
                    dest.exec_driver_sql(insert_sql, tuple(row))
    finally:
        legacy_engine.dispose()


def _resolve_backfill_portfolio_id(connection) -> int | None:
    rows = connection.exec_driver_sql("SELECT id, name FROM portfolio").fetchall()
    target = LEGACY_DIVIDEND_BACKFILL_PORTFOLIO_NAME.strip().casefold()
    for row in rows:
        name = (row[1] or "").strip().casefold()
        if name == target:
            return int(row[0])
    return None


def _ensure_dividend_portfolio_id_column(connection) -> None:
    if not _table_exists(connection, "dividendpayment"):
        return
    existing = {
        row[1]
        for row in connection.exec_driver_sql("PRAGMA table_info(dividendpayment)").fetchall()
    }
    if "portfolio_id" not in existing:
        connection.exec_driver_sql(
            "ALTER TABLE dividendpayment ADD COLUMN portfolio_id INTEGER",
        )


def _backfill_dividend_portfolio_ids(connection) -> None:
    _ensure_dividend_portfolio_id_column(connection)
    target_id = _resolve_backfill_portfolio_id(connection)
    if target_id is None:
        return
    connection.exec_driver_sql(
        "UPDATE dividendpayment SET portfolio_id = ? WHERE portfolio_id IS NULL",
        (target_id,),
    )


def migrate_legacy_databases(engine: Engine) -> None:
    """Une portfolios.db (e opcionalmente carteira.db legado) no banco unificado."""
    with engine.begin() as connection:
        if _migration_done(connection):
            return

    legacy_portfolios = _legacy_portfolios_db_path()
    legacy_assets_cwd = settings.legacy_assets_db_path()

    db_path_str = str(engine.url.database or "")
    unified_path = Path(db_path_str) if db_path_str else None
    if unified_path and unified_path.is_file():
        _backup_file(unified_path)

    _merge_legacy_portfolios_db(engine, legacy_portfolios)
    if legacy_assets_cwd.is_file() and (
        unified_path is None or legacy_assets_cwd.resolve() != unified_path.resolve()
    ):
        _merge_legacy_assets_db(engine, legacy_assets_cwd)

    with engine.begin() as connection:
        _backfill_dividend_portfolio_ids(connection)
        _mark_migration_done(connection)

    if legacy_portfolios.is_file():
        migrated = legacy_portfolios.with_suffix(".db.migrated")
        if not migrated.is_file():
            legacy_portfolios.rename(migrated)

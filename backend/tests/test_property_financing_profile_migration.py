"""Migração propertyfinancing: portfolio_id → profile_id (SCHEMA_VERSION 7)."""

from datetime import datetime
from pathlib import Path

from sqlalchemy import create_engine, text
from app.db.session import (
    SCHEMA_VERSION,
    _migrate_property_financing_portfolio_to_profile,
    read_user_version,
)


def _create_legacy_db(db_path: Path) -> None:
    engine = create_engine(
        f"sqlite:///{db_path.as_posix()}",
        connect_args={"check_same_thread": False},
    )
    with engine.begin() as conn:
        conn.execute(text("PRAGMA user_version = 6"))
        conn.execute(
            text(
                """
                CREATE TABLE portfolio (
                    id INTEGER PRIMARY KEY,
                    name VARCHAR NOT NULL,
                    description VARCHAR,
                    holder VARCHAR,
                    created_at DATETIME,
                    updated_at DATETIME
                )
                """
            )
        )
        conn.execute(
            text(
                """
                CREATE TABLE budgetprofile (
                    id INTEGER PRIMARY KEY,
                    name VARCHAR NOT NULL UNIQUE,
                    description VARCHAR,
                    created_at DATETIME
                )
                """
            )
        )
        conn.execute(
            text(
                """
                CREATE TABLE apppreference (
                    key VARCHAR PRIMARY KEY,
                    value VARCHAR NOT NULL
                )
                """
            )
        )
        conn.execute(
            text(
                """
                CREATE TABLE propertyfinancing (
                    id INTEGER PRIMARY KEY,
                    portfolio_id INTEGER NOT NULL,
                    name VARCHAR NOT NULL,
                    property_type VARCHAR NOT NULL,
                    description VARCHAR,
                    created_at DATETIME,
                    updated_at DATETIME,
                    UNIQUE (portfolio_id, name)
                )
                """
            )
        )
        conn.execute(
            text(
                """
                CREATE TABLE propertyfinancingentry (
                    id INTEGER PRIMARY KEY,
                    financing_id INTEGER NOT NULL,
                    event_date DATE NOT NULL,
                    entry_type VARCHAR NOT NULL,
                    event_category VARCHAR NOT NULL,
                    description VARCHAR NOT NULL,
                    amount_brl FLOAT NOT NULL,
                    updated_at DATETIME
                )
                """
            )
        )
        conn.execute(
            text(
                """
                INSERT INTO portfolio (id, name, created_at, updated_at)
                VALUES (1, 'Carteira A', datetime('now'), datetime('now')),
                       (2, 'Carteira B', datetime('now'), datetime('now'))
                """
            )
        )
        conn.execute(
            text(
                """
                INSERT INTO budgetprofile (id, name, created_at)
                VALUES (10, 'Perfil Ativo', datetime('now')),
                       (11, 'Outro Perfil', datetime('now'))
                """
            )
        )
        conn.execute(
            text(
                """
                INSERT INTO apppreference (key, value)
                VALUES ('active_budget_profile_id', '10')
                """
            )
        )
        now = datetime.utcnow().isoformat()
        conn.execute(
            text(
                """
                INSERT INTO propertyfinancing
                    (id, portfolio_id, name, property_type, description, created_at, updated_at)
                VALUES
                    (1, 1, 'Casa', 'casa', NULL, :now, :now),
                    (2, 2, 'Casa', 'casa', NULL, :now, :now)
                """
            ),
            {"now": now},
        )
        conn.execute(
            text(
                """
                INSERT INTO propertyfinancingentry
                    (id, financing_id, event_date, entry_type, event_category,
                     description, amount_brl, updated_at)
                VALUES
                    (1, 1, '2026-01-15', 'expense', 'financiamento', 'Parcela', 1000, :now),
                    (2, 2, '2026-01-15', 'income', 'aluguel', 'Aluguel', 800, :now)
                """
            ),
            {"now": now},
        )
    engine.dispose()


def test_migrate_property_financing_portfolio_to_profile(tmp_path: Path) -> None:
    assert SCHEMA_VERSION == 7
    db_path = tmp_path / "carteira.db"
    _create_legacy_db(db_path)
    engine = create_engine(
        f"sqlite:///{db_path.as_posix()}",
        connect_args={"check_same_thread": False},
    )

    _migrate_property_financing_portfolio_to_profile(engine)
    # Segunda chamada: idempotente
    _migrate_property_financing_portfolio_to_profile(engine)

    with engine.connect() as conn:
        rows = conn.execute(
            text(
                "SELECT id, profile_id, name, property_type FROM propertyfinancing ORDER BY id"
            )
        ).fetchall()
        assert len(rows) == 2
        assert all(row[1] == 10 for row in rows)
        assert all(row[3] == "casa" for row in rows)
        names = {row[2] for row in rows}
        assert "Casa" in names
        assert any(n.startswith("Casa (carteira ") for n in names)
        count = conn.execute(text("SELECT COUNT(*) FROM propertyfinancingentry")).scalar()
        assert count == 2
        cols = {
            row[1]
            for row in conn.execute(text("PRAGMA table_info(propertyfinancing)")).fetchall()
        }
        assert "profile_id" in cols
        assert "portfolio_id" not in cols
        assert read_user_version(engine) == 6  # stamp só em init_db completo

    engine.dispose()


def test_migrate_creates_pessoal_when_no_budget_profile(tmp_path: Path) -> None:
    db_path = tmp_path / "carteira.db"
    engine = create_engine(
        f"sqlite:///{db_path.as_posix()}",
        connect_args={"check_same_thread": False},
    )
    with engine.begin() as conn:
        conn.execute(text("PRAGMA user_version = 6"))
        conn.execute(
            text(
                """
                CREATE TABLE propertyfinancing (
                    id INTEGER PRIMARY KEY,
                    portfolio_id INTEGER NOT NULL,
                    name VARCHAR NOT NULL,
                    property_type VARCHAR NOT NULL,
                    description VARCHAR,
                    created_at DATETIME,
                    updated_at DATETIME
                )
                """
            )
        )
        conn.execute(
            text(
                """
                INSERT INTO propertyfinancing
                    (id, portfolio_id, name, property_type, created_at, updated_at)
                VALUES (1, 1, 'Lote', 'lote', datetime('now'), datetime('now'))
                """
            )
        )

    _migrate_property_financing_portfolio_to_profile(engine)

    with engine.connect() as conn:
        profile = conn.execute(
            text("SELECT id, name FROM budgetprofile ORDER BY id LIMIT 1")
        ).fetchone()
        assert profile is not None
        assert profile[1] == "Pessoal"
        row = conn.execute(
            text("SELECT profile_id, name FROM propertyfinancing WHERE id = 1")
        ).fetchone()
        assert row is not None
        assert row[0] == profile[0]
        assert row[1] == "Lote"

    engine.dispose()

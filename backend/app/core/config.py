import os
from pathlib import Path
from typing import Literal

from pydantic import BaseModel

AssetLookupMode = Literal["fake", "yfinance"]

MIGRATION_UNIFIED_DB_KEY = "migration_unified_db"


def _asset_lookup_mode_from_env() -> AssetLookupMode:
    raw = os.getenv("ASSET_LOOKUP_MODE", "yfinance").strip().lower()
    if raw == "fake":
        return "fake"
    return "yfinance"


def _default_local_data_dir() -> Path:
    explicit = os.getenv("LOCAL_DATA_DIR", "").strip()
    if explicit:
        return Path(explicit)
    local_app = os.getenv("LOCALAPPDATA", "").strip()
    if local_app:
        return Path(local_app) / "carteira-investimento"
    return Path.home() / ".local" / "share" / "carteira-investimento"


def _sqlite_url_for_path(path: Path) -> str:
    return f"sqlite:///{path.as_posix()}"


def _default_database_url() -> str:
    explicit = os.getenv("DATABASE_URL", "").strip()
    if explicit:
        return explicit
    data_dir = _default_local_data_dir()
    data_dir.mkdir(parents=True, exist_ok=True)
    return _sqlite_url_for_path(data_dir / "carteira.db")


class Settings(BaseModel):
    app_name: str = "Carteira Investimento API"
    database_url: str = _default_database_url()
    local_data_dir: Path = _default_local_data_dir()
    asset_lookup_mode: AssetLookupMode = _asset_lookup_mode_from_env()

    def legacy_portfolios_db_path(self) -> Path:
        """Caminho do portfolios.db legado (pré-unificação), usado só na migração."""
        return self.local_data_dir / "portfolios.db"

    def legacy_assets_db_path(self) -> Path:
        """Possível carteira.db legado no cwd do backend (dev)."""
        return Path("carteira.db")


settings = Settings()

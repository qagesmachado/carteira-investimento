import os
from pathlib import Path
from typing import Literal

from pydantic import BaseModel

AssetLookupMode = Literal["fake", "yfinance"]


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


class Settings(BaseModel):
    app_name: str = "Carteira Investimento API"
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./carteira.db")
    local_data_dir: Path = _default_local_data_dir()
    portfolios_database_url: str = os.getenv("PORTFOLIOS_DATABASE_URL", "")
    asset_lookup_mode: AssetLookupMode = _asset_lookup_mode_from_env()

    def resolved_portfolios_database_url(self) -> str:
        if self.portfolios_database_url:
            return self.portfolios_database_url
        self.local_data_dir.mkdir(parents=True, exist_ok=True)
        return _sqlite_url_for_path(self.local_data_dir / "portfolios.db")


settings = Settings()

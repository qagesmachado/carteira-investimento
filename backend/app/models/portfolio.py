from datetime import datetime
from enum import StrEnum

from sqlmodel import Field, SQLModel


class PortfolioStatus(StrEnum):
    ACTIVE = "active"
    ARCHIVED = "archived"
    SIMULATION = "simulation"


class Portfolio(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True)
    description: str | None = None
    holder: str | None = None
    objective: str | None = None
    base_currency: str = "BRL"
    status: PortfolioStatus = PortfolioStatus.ACTIVE
    allocation_targets_json: str | None = None
    notes: str | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class AppPreference(SQLModel, table=True):
    """Chave-valor local (ex.: carteira ativa)."""

    key: str = Field(primary_key=True)
    value: str

from datetime import datetime
from enum import StrEnum

from sqlmodel import Field, SQLModel, UniqueConstraint


class ManualPatrimonyCategory(StrEnum):
    EMERGENCY_RESERVE = "emergency_reserve"
    # Legado — migrado para emergency_reserve + location dinheiro_especie
    CASH = "cash"


class EmergencyReserveLocation(StrEnum):
    BANCO = "banco"
    DINHEIRO_ESPECIE = "dinheiro_especie"
    CORRETORA = "corretora"


class ManualPatrimonyItem(SQLModel, table=True):
    __table_args__ = (UniqueConstraint("portfolio_id", "name"),)

    id: int | None = Field(default=None, primary_key=True)
    portfolio_id: int = Field(foreign_key="portfolio.id", index=True)
    category: ManualPatrimonyCategory = Field(index=True)
    name: str = Field(index=True)
    amount_brl: float
    location: str | None = None
    notes: str | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

from datetime import date, datetime
from enum import StrEnum

from sqlmodel import Field, SQLModel, UniqueConstraint


class PositionStatus(StrEnum):
    ACTIVE = "active"
    CLOSED = "closed"
    WATCHING = "watching"


class Position(SQLModel, table=True):
    __table_args__ = (UniqueConstraint("portfolio_id", "asset_id"),)

    id: int | None = Field(default=None, primary_key=True)
    portfolio_id: int = Field(foreign_key="portfolio.id", index=True)
    asset_id: int = Field(index=True)
    quantity: float = 0
    average_price: float = 0
    invested_amount: float | None = None
    current_value: float | None = None
    contracted_yield: str | None = None
    entry_date: date | None = None
    custody: str | None = None
    linked_objective: str | None = None
    notes: str | None = None
    status: PositionStatus = PositionStatus.ACTIVE
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

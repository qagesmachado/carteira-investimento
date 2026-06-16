from datetime import date, datetime

from sqlmodel import SQLModel

from app.models.asset import DisplayClass


class YearSnapshotCreate(SQLModel):
    year: int
    snapshot_date: date | None = None
    replace: bool = False


class YearSnapshotSummary(SQLModel):
    id: int
    portfolio_id: int
    year: int
    snapshot_date: date
    created_at: datetime
    position_count: int


class PositionSnapshotRead(SQLModel):
    asset_id: int
    symbol: str
    asset_name: str
    display_class: DisplayClass
    quantity: float
    average_price: float
    invested_amount: float | None
    currency: str


class YearSnapshotDetailRead(SQLModel):
    id: int
    portfolio_id: int
    year: int
    snapshot_date: date
    created_at: datetime
    positions: list[PositionSnapshotRead]

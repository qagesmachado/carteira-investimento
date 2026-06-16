from datetime import date, datetime

from sqlmodel import Field, SQLModel, UniqueConstraint


class PortfolioYearSnapshot(SQLModel, table=True):
    __table_args__ = (UniqueConstraint("portfolio_id", "year"),)

    id: int | None = Field(default=None, primary_key=True)
    portfolio_id: int = Field(foreign_key="portfolio.id", index=True)
    year: int = Field(index=True)
    snapshot_date: date
    created_at: datetime = Field(default_factory=datetime.utcnow)


class PositionSnapshot(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    snapshot_id: int = Field(foreign_key="portfolioyearsnapshot.id", index=True)
    asset_id: int = Field(foreign_key="asset.id", index=True)
    quantity: float = 0
    average_price: float = 0
    invested_amount: float | None = None
    currency: str

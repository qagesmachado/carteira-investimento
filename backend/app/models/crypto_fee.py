from datetime import date
from enum import StrEnum

from sqlmodel import Field, SQLModel


class CryptoFeeType(StrEnum):
    PURCHASE = "purchase"
    TRANSFER = "transfer"


class CryptoFee(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    portfolio_id: int = Field(foreign_key="portfolio.id", index=True)
    asset_id: int = Field(foreign_key="asset.id", index=True)
    fee_type: CryptoFeeType
    fee_date: date = Field(index=True)
    quantity_moved: float = Field(gt=0)
    fee_quantity_btc: float = Field(ge=0)
    quote_brl: float = Field(gt=0)
    fx_rate: float = Field(gt=0)
    notes: str | None = None

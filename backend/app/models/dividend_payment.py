from datetime import date
from enum import StrEnum

from sqlmodel import Field, SQLModel


class DividendPaymentType(StrEnum):
    DIVIDEND = "dividend"
    JCP = "jcp"
    CREDIT = "credit"
    FRACTION = "fraction"
    REDEMPTION = "redemption"
    OTHER = "other"


class DividendPayment(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    asset_id: int = Field(foreign_key="asset.id", index=True)
    portfolio_id: int | None = Field(default=None, foreign_key="portfolio.id", index=True)
    payment_type: DividendPaymentType
    payment_date: date = Field(index=True)
    amount: float
    currency: str
    notes: str | None = None
    company_cnpj: str | None = None
    payer_cnpj: str | None = None
    payer_name: str | None = None

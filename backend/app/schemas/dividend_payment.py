from datetime import date

from sqlmodel import SQLModel

from app.models.asset import AssetMarket, DisplayClass
from app.models.dividend_payment import DividendPaymentType


class DividendPaymentBase(SQLModel):
    asset_id: int
    portfolio_id: int | None = None
    payment_type: DividendPaymentType
    payment_date: date
    amount: float
    gross_amount: float | None = None
    tax_withheld: float | None = None
    currency: str
    notes: str | None = None
    company_cnpj: str | None = None
    payer_cnpj: str | None = None
    payer_name: str | None = None


class DividendPaymentCreate(DividendPaymentBase):
    pass


class DividendPaymentUpdate(SQLModel):
    asset_id: int | None = None
    portfolio_id: int | None = None
    payment_type: DividendPaymentType | None = None
    payment_date: date | None = None
    amount: float | None = None
    gross_amount: float | None = None
    tax_withheld: float | None = None
    currency: str | None = None
    notes: str | None = None
    company_cnpj: str | None = None
    payer_cnpj: str | None = None
    payer_name: str | None = None


class DividendPaymentRead(DividendPaymentBase):
    id: int
    portfolio_id: int | None = None
    symbol: str
    asset_name: str
    market: AssetMarket
    display_class: DisplayClass


class BulkDividendImportRow(SQLModel):
    row_index: int
    symbol: str
    payment_type: DividendPaymentType = DividendPaymentType.DIVIDEND
    payment_date: date
    amount: float
    currency: str | None = None
    notes: str | None = None
    company_cnpj: str | None = None
    payer_cnpj: str | None = None
    payer_name: str | None = None


class BulkDividendPreviewRequest(SQLModel):
    items: list[BulkDividendImportRow]
    portfolio_id: int | None = None


class BulkDividendPreviewItem(SQLModel):
    row_index: int
    symbol: str
    status: str
    detail: str | None = None
    payload: DividendPaymentCreate | None = None


class BulkDividendPreviewResponse(SQLModel):
    items: list[BulkDividendPreviewItem]


class BulkDividendCreateRequest(SQLModel):
    payments: list[DividendPaymentCreate]
    portfolio_id: int | None = None


class BulkDividendCreateItemResult(SQLModel):
    row_index: int | None = None
    symbol: str
    status: str
    payment: DividendPaymentRead | None = None
    detail: str | None = None


class BulkDividendCreateResponse(SQLModel):
    results: list[BulkDividendCreateItemResult]

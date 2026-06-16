from datetime import date

from sqlmodel import SQLModel

from app.models.asset import AssetMarket, AssetType, DisplayClass
from app.models.dividend_payment import DividendPaymentType


class AnnualIrPaymentRow(SQLModel):
    symbol: str
    asset_name: str
    asset_type: AssetType
    display_class: DisplayClass
    market: AssetMarket
    payment_type: DividendPaymentType
    payment_date: date
    amount: float
    currency: str
    company_cnpj: str | None = None
    payer_cnpj: str | None = None
    payer_name: str | None = None


class AnnualIrSummaryByAsset(SQLModel):
    asset_id: int
    symbol: str
    asset_name: str
    asset_type: AssetType
    display_class: DisplayClass
    totals_by_type: dict[str, float]
    total_by_currency: dict[str, float]


class AnnualIrPositionRow(SQLModel):
    symbol: str
    asset_name: str
    asset_type: AssetType
    display_class: DisplayClass
    quantity: float
    average_price: float
    currency: str
    invested_amount: float | None = None


class AnnualIrReportRead(SQLModel):
    year: int
    portfolio_id: int
    has_position_snapshot: bool
    snapshot_date: date | None = None
    payments: list[AnnualIrPaymentRow]
    summary_by_asset: list[AnnualIrSummaryByAsset]
    positions: list[AnnualIrPositionRow]
    grand_totals_by_type: dict[str, dict[str, float]]

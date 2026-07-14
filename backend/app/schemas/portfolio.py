from datetime import date, datetime

from pydantic import Field
from sqlmodel import SQLModel

from app.models.dividend_payment import DividendPaymentType
from app.models.portfolio import PortfolioStatus
from app.models.position import PositionStatus
from app.schemas.asset import AssetCreate, AssetRead, AssetUpdate


class PortfolioBase(SQLModel):
    name: str
    description: str | None = None
    holder: str | None = None
    objective: str | None = None
    base_currency: str = "BRL"
    status: PortfolioStatus = PortfolioStatus.ACTIVE
    allocation_targets_json: str | None = None
    notes: str | None = None


class PortfolioCreate(PortfolioBase):
    pass


class PortfolioUpdate(SQLModel):
    name: str | None = None
    description: str | None = None
    holder: str | None = None
    objective: str | None = None
    base_currency: str | None = None
    status: PortfolioStatus | None = None
    allocation_targets_json: str | None = None
    notes: str | None = None


class PortfolioRead(PortfolioBase):
    id: int
    created_at: datetime
    updated_at: datetime


class PortfolioSummaryRead(SQLModel):
    portfolio_id: int
    invested_brl: float
    current_brl: float
    profit_brl: float
    profit_pct: float | None
    position_count: int
    is_active: bool


class PositionCreate(SQLModel):
    asset_id: int
    quantity: float = Field(default=0, ge=0)
    average_price: float = Field(default=0, ge=0)
    invested_amount: float | None = Field(default=None, ge=0)
    current_value: float | None = Field(default=None, ge=0)
    contracted_yield: str | None = None
    entry_date: date | None = None
    custody: str | None = None
    linked_objective: str | None = None
    notes: str | None = None
    status: PositionStatus = PositionStatus.ACTIVE


class PositionUpdate(SQLModel):
    quantity: float | None = Field(default=None, ge=0)
    average_price: float | None = Field(default=None, ge=0)
    invested_amount: float | None = Field(default=None, ge=0)
    current_value: float | None = Field(default=None, ge=0)
    contracted_yield: str | None = None
    entry_date: date | None = None
    custody: str | None = None
    linked_objective: str | None = None
    notes: str | None = None
    status: PositionStatus | None = None


class FixedIncomePositionCreate(SQLModel):
    """Cadastro unificado de renda fixa/previdência: produto + posição numa ação."""

    asset: AssetCreate
    invested_amount: float = Field(ge=0)
    current_value: float | None = Field(default=None, ge=0)
    entry_date: date | None = None


class FixedIncomePositionUpdate(SQLModel):
    """Atualização unificada de renda fixa/previdência: produto + posição numa ação."""

    asset: AssetUpdate
    invested_amount: float = Field(ge=0)
    current_value: float | None = Field(default=None, ge=0)
    entry_date: date | None = None


class PositionRead(SQLModel):
    id: int
    portfolio_id: int
    asset_id: int
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
    created_at: datetime
    updated_at: datetime


class QuoteRefreshFailure(SQLModel):
    symbol: str
    detail: str


class QuoteRefreshResponse(SQLModel):
    updated: int
    skipped: int
    failed: list[QuoteRefreshFailure] = []
    refreshed_at: datetime


class ActivePortfolioRead(SQLModel):
    portfolio_id: int | None = None


class SetActivePortfolioRequest(SQLModel):
    portfolio_id: int | None = None


# --- Export / import ---

EXPORT_VERSION = 2
EXPORT_VERSION_LEGACY = 1

COMPARE_ASSET_FIELDS = (
    "name",
    "asset_type",
    "market",
    "country",
    "currency",
    "etf_subtype",
    "sector",
    "subsector",
    "segment",
    "company_cnpj",
    "payer_cnpj",
    "payer_name",
    "quote_source",
    "current_quote",
    "notes",
    "fixed_income_indexer",
    "fixed_income_yield_description",
    "fixed_income_title_type",
    "maturity_date",
    "purchase_date",
)


class PortfolioExportMeta(SQLModel):
    name: str
    description: str | None = None
    holder: str | None = None
    objective: str | None = None
    base_currency: str = "BRL"
    status: PortfolioStatus = PortfolioStatus.ACTIVE
    allocation_targets_json: str | None = None
    notes: str | None = None


class PositionExportItem(SQLModel):
    symbol: str
    quantity: float = Field(default=0, ge=0)
    average_price: float = Field(default=0, ge=0)
    invested_amount: float | None = Field(default=None, ge=0)
    current_value: float | None = Field(default=None, ge=0)
    contracted_yield: str | None = None
    entry_date: date | None = None
    custody: str | None = None
    linked_objective: str | None = None
    notes: str | None = None
    status: PositionStatus = PositionStatus.ACTIVE


class DividendPaymentExportItem(SQLModel):
    symbol: str
    payment_type: DividendPaymentType
    payment_date: date
    amount: float = Field(gt=0)
    currency: str
    notes: str | None = None
    company_cnpj: str | None = None
    payer_cnpj: str | None = None
    payer_name: str | None = None


class PortfolioExportDocument(SQLModel):
    version: int = EXPORT_VERSION
    exported_at: datetime
    portfolio: PortfolioExportMeta
    assets: list[AssetCreate]
    positions: list[PositionExportItem]
    dividend_payments: list[DividendPaymentExportItem] = []


class ImportConflictField(SQLModel):
    field: str
    base_value: str | None = None
    file_value: str | None = None
    resolution: str = "keep_base"
    custom_value: str | None = None


class ImportAssetPreviewItem(SQLModel):
    symbol: str
    status: str
    base_asset: AssetRead | None = None
    file_asset: AssetCreate | None = None
    lookup: AssetCreate | None = None
    fields: list[ImportConflictField] = []


class ImportPreviewRequest(SQLModel):
    document: PortfolioExportDocument


class ImportPreviewResponse(SQLModel):
    portfolio: PortfolioExportMeta
    assets: list[ImportAssetPreviewItem]
    positions: list[PositionExportItem]
    target_portfolio_id: int | None = None


class ImportAssetResolution(SQLModel):
    symbol: str
    action: str
    fields: list[ImportConflictField] = []
    asset_create: AssetCreate | None = None


class ImportConfirmRequest(SQLModel):
    document: PortfolioExportDocument
    asset_resolutions: list[ImportAssetResolution]
    target_portfolio_id: int | None = None
    create_new_portfolio: bool = True


class ImportConfirmResponse(SQLModel):
    portfolio_id: int
    portfolio_name: str
    portfolio_name_adjusted: bool = False
    assets_created: int
    assets_updated: int
    positions_imported: int
    dividend_payments_imported: int = 0

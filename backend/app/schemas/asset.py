from datetime import date

from pydantic import Field
from sqlmodel import SQLModel

from app.models.asset import (
    AssetMarket,
    AssetType,
    DisplayClass,
    EtfSubtype,
    FixedIncomeIndexer,
)


class AssetBase(SQLModel):
    symbol: str
    name: str
    asset_type: AssetType
    market: AssetMarket
    country: str | None = None
    currency: str
    etf_subtype: EtfSubtype | None = None
    sector: str | None = None
    subsector: str | None = None
    segment: str | None = None
    company_cnpj: str | None = None
    payer_cnpj: str | None = None
    payer_name: str | None = None
    quote_source: str | None = None
    current_quote: float | None = None
    notes: str | None = None
    fixed_income_indexer: FixedIncomeIndexer | None = None
    fixed_income_yield_description: str | None = None
    fixed_income_title_type: str | None = None
    maturity_date: date | None = None
    purchase_date: date | None = None


class AssetCreate(AssetBase):
    pass


class AssetUpdate(SQLModel):
    symbol: str | None = None
    name: str | None = None
    asset_type: AssetType | None = None
    market: AssetMarket | None = None
    country: str | None = None
    currency: str | None = None
    etf_subtype: EtfSubtype | None = None
    sector: str | None = None
    subsector: str | None = None
    segment: str | None = None
    company_cnpj: str | None = None
    payer_cnpj: str | None = None
    payer_name: str | None = None
    quote_source: str | None = None
    current_quote: float | None = None
    notes: str | None = None
    fixed_income_indexer: FixedIncomeIndexer | None = None
    fixed_income_yield_description: str | None = None
    fixed_income_title_type: str | None = None
    maturity_date: date | None = None
    purchase_date: date | None = None


class AssetRead(AssetBase):
    id: int
    display_class: DisplayClass


class AssetLookupRead(SQLModel):
    symbol: str
    name: str
    asset_type: AssetType
    market: AssetMarket
    country: str | None = None
    currency: str
    sector: str | None = None
    subsector: str | None = None
    segment: str | None = None
    company_cnpj: str | None = None
    payer_cnpj: str | None = None
    payer_name: str | None = None
    quote_source: str | None = None
    current_quote: float | None = None


class BulkPreviewRequest(SQLModel):
    symbols: list[str]


class BulkPreviewItem(SQLModel):
    symbol: str
    lookup: AssetLookupRead | None = None
    error: str | None = None
    already_in_db: bool = False


class BulkPreviewResponse(SQLModel):
    items: list[BulkPreviewItem]
    warnings: list[str] = Field(default_factory=list)


class BulkCreateRequest(SQLModel):
    assets: list[AssetCreate]


class BulkCreateItemResult(SQLModel):
    symbol: str
    status: str
    asset: AssetRead | None = None
    detail: str | None = None


class BulkCreateResponse(SQLModel):
    results: list[BulkCreateItemResult]

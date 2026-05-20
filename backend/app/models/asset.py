from datetime import date
from enum import StrEnum

from sqlmodel import Field, SQLModel


class AssetType(StrEnum):
    STOCK = "stock"
    ETF = "etf"
    FII = "fii"
    FIXED_INCOME = "fixed_income"
    CRYPTO = "crypto"
    PENSION = "pension"
    OTHER = "other"


class AssetMarket(StrEnum):
    NATIONAL = "national"
    INTERNATIONAL = "international"


class EtfSubtype(StrEnum):
    VARIABLE_INCOME = "variable_income"
    FIXED_INCOME = "fixed_income"


class DisplayClass(StrEnum):
    STOCKS = "stocks"
    FUNDS = "funds"
    FIXED_INCOME = "fixed_income"
    INTERNATIONAL = "international"
    CRYPTO = "crypto"
    PENSION = "pension"
    OTHER = "other"


class FixedIncomeIndexer(StrEnum):
    PREFIXED = "prefixed"
    IPCA_PLUS = "ipca_plus"
    POST_FIXED = "post_fixed"


class Asset(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    symbol: str = Field(index=True, unique=True)
    name: str
    asset_type: AssetType
    market: AssetMarket
    country: str | None = None
    currency: str
    display_class: DisplayClass
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

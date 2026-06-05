from datetime import date

from sqlmodel import SQLModel

from app.models.crypto_fee import CryptoFeeType


class CryptoFeeBase(SQLModel):
    portfolio_id: int
    asset_id: int
    fee_type: CryptoFeeType
    fee_date: date
    quantity_moved: float
    fee_quantity_btc: float
    quote_brl: float
    fx_rate: float
    notes: str | None = None


class CryptoFeeCreate(CryptoFeeBase):
    pass


class CryptoFeeUpdate(SQLModel):
    portfolio_id: int | None = None
    asset_id: int | None = None
    fee_type: CryptoFeeType | None = None
    fee_date: date | None = None
    quantity_moved: float | None = None
    fee_quantity_btc: float | None = None
    quote_brl: float | None = None
    fx_rate: float | None = None
    notes: str | None = None


class CryptoFeeRead(CryptoFeeBase):
    id: int
    symbol: str
    asset_name: str
    final_quantity_after_fee: float
    fee_value_brl: float
    fee_value_usd: float
    fee_percent: float


class BitcoinPositionSummary(SQLModel):
    asset_id: int | None = None
    symbol: str | None = None
    name: str | None = None
    quantity: float | None = None
    average_price_brl: float | None = None
    average_price_usd: float | None = None
    total_invested_brl: float | None = None
    quote_brl: float | None = None
    quote_usd: float | None = None
    current_value_brl: float | None = None
    profit_brl: float | None = None
    profit_percent: float | None = None


class BitcoinRebalanceSummary(SQLModel):
    target_value_brl: float | None = None
    missing_value_brl: float | None = None
    above_target_brl: float | None = None
    rebalance_action: str | None = None


class BitcoinSnapshotRead(SQLModel):
    portfolio_id: int
    position: BitcoinPositionSummary
    rebalance: BitcoinRebalanceSummary
    total_fees_brl: float
    total_fees_usd: float
    profit_after_fees_brl: float | None = None
    appreciation_after_fees_percent: float | None = None
    transfer_ledger_final_btc: float = 0.0
    transfer_ledger_count: int = 0

from pydantic import BaseModel, Field, field_validator

from app.models.asset import DisplayClass

REBALANCE_CLASS_KEYS: tuple[str, ...] = (
    DisplayClass.STOCKS.value,
    DisplayClass.FUNDS.value,
    DisplayClass.INTERNATIONAL.value,
    DisplayClass.FIXED_INCOME.value,
    DisplayClass.CRYPTO.value,
)

DEFAULT_CLASS_TARGETS: dict[str, float] = {
    DisplayClass.STOCKS.value: 30.0,
    DisplayClass.FUNDS.value: 5.0,
    DisplayClass.INTERNATIONAL.value: 20.0,
    DisplayClass.FIXED_INCOME.value: 40.0,
    DisplayClass.CRYPTO.value: 5.0,
}

DEFAULT_STOCKS_SPLIT: dict[str, float] = {
    "etf": 70.0,
    "stock": 30.0,
}


class ClassTargets(BaseModel):
    stocks: float = Field(default=30.0, ge=0, le=100)
    funds: float = Field(default=5.0, ge=0, le=100)
    international: float = Field(default=20.0, ge=0, le=100)
    fixed_income: float = Field(default=40.0, ge=0, le=100)
    crypto: float = Field(default=5.0, ge=0, le=100)

    @field_validator("stocks", "funds", "international", "fixed_income", "crypto")
    @classmethod
    def _round_pct(cls, value: float) -> float:
        return round(float(value), 4)


class StocksSplitTargets(BaseModel):
    etf: float = Field(default=70.0, ge=0, le=100)
    stock: float = Field(default=30.0, ge=0, le=100)

    @field_validator("etf", "stock")
    @classmethod
    def _round_pct(cls, value: float) -> float:
        return round(float(value), 4)


class AllocationTargets(BaseModel):
    classes: ClassTargets = Field(default_factory=ClassTargets)
    stocks_split: StocksSplitTargets = Field(default_factory=StocksSplitTargets)

    def validate_sums(self) -> None:
        class_sum = sum(
            getattr(self.classes, key) for key in ("stocks", "funds", "international", "fixed_income", "crypto")
        )
        if abs(class_sum - 100.0) > 0.01:
            raise ValueError(f"class targets must sum to 100, got {class_sum}")
        split_sum = self.stocks_split.etf + self.stocks_split.stock
        if abs(split_sum - 100.0) > 0.01:
            raise ValueError(f"stocks_split must sum to 100, got {split_sum}")


class AllocationTargetsUpdate(BaseModel):
    classes: ClassTargets
    stocks_split: StocksSplitTargets


class ClassRebalanceRowRead(BaseModel):
    display_class: str
    label: str
    current_value_brl: float
    current_percent: float
    target_percent: float
    target_value_brl: float
    gap_brl: float


class StocksSubTypeRebalanceRowRead(BaseModel):
    sub_type: str
    label: str
    current_value_brl: float
    current_percent_of_stocks: float
    target_percent_of_stocks: float
    target_value_brl: float
    gap_brl: float


class AssetRebalanceRowRead(BaseModel):
    asset_id: int
    symbol: str
    name: str
    asset_type: str
    current_value_brl: float
    current_percent: float
    target_percent: float | None
    target_value_brl: float | None
    gap_brl: float | None
    sum_score: float | None
    score_included: bool


class RebalanceSnapshotRead(BaseModel):
    portfolio_id: int
    patrimony_brl: float
    usd_brl_rate: float | None
    classes: list[ClassRebalanceRowRead]
    stocks_sub_types: list[StocksSubTypeRebalanceRowRead]
    stock_assets: list[AssetRebalanceRowRead]
    international_assets: list[AssetRebalanceRowRead] = Field(default_factory=list)
    fund_assets: list[AssetRebalanceRowRead] = Field(default_factory=list)
    total_gap_brl: float
    assets_without_score_count: int
    fund_assets_without_score_count: int = 0

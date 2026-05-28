from pydantic import BaseModel, Field


class ObjectiveCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    description: str | None = None
    mode: str = "multi_asset"
    partition_asset_id: int | None = None


class ObjectiveUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    description: str | None = None


class ObjectiveAllocationItem(BaseModel):
    slice_name: str = Field(min_length=1, max_length=120)
    asset_id: int
    quantity: float | None = None
    amount: float | None = None


class ObjectiveAllocationsReplace(BaseModel):
    allocations: list[ObjectiveAllocationItem]


class ObjectiveAllocationRead(BaseModel):
    id: int
    slice_name: str
    asset_id: int
    symbol: str
    name: str
    asset_type: str
    quantity: float | None
    amount: float | None
    split_mode: str
    current_value_brl: float | None
    invested_value_brl: float | None = None
    profit_brl: float | None = None
    profit_percent: float | None = None


class PartitionSliceRead(BaseModel):
    objective_id: int
    objective_name: str
    slice_name: str
    is_default: bool
    quantity: float | None
    amount: float | None
    current_value_brl: float | None
    invested_value_brl: float | None
    profit_brl: float | None


class AssetPartitionRead(BaseModel):
    asset_id: int
    symbol: str
    name: str
    split_mode: str
    position_total: float
    free: float
    position_current_value_brl: float | None
    position_invested_value_brl: float | None
    position_profit_brl: float | None
    slices: list[PartitionSliceRead]


class AssetDivergenceRead(BaseModel):
    asset_id: int
    symbol: str
    name: str
    split_mode: str
    total: float
    allocated_explicit: float
    free: float
    delta: float
    status: str


class ObjectiveRead(BaseModel):
    id: int
    portfolio_id: int
    name: str
    description: str | None
    is_default: bool
    mode: str
    partition_asset_id: int | None
    allocations: list[ObjectiveAllocationRead]
    total_value_brl: float


class ObjectivesSnapshotRead(BaseModel):
    portfolio_id: int
    objectives: list[ObjectiveRead]
    divergences: list[AssetDivergenceRead]
    asset_partitions: list[AssetPartitionRead]
    patrimony_brl: float

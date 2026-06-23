from pydantic import BaseModel, Field


class ManualPatrimonyItemCreate(BaseModel):
    category: str
    name: str = Field(min_length=1, max_length=120)
    amount_brl: float = Field(gt=0)
    location: str | None = Field(default=None, max_length=200)
    notes: str | None = Field(default=None, max_length=500)


class ManualPatrimonyItemUpdate(BaseModel):
    category: str | None = None
    name: str | None = Field(default=None, min_length=1, max_length=120)
    amount_brl: float | None = Field(default=None, gt=0)
    location: str | None = Field(default=None, max_length=200)
    notes: str | None = Field(default=None, max_length=500)


class ManualPatrimonyItemRead(BaseModel):
    id: int
    portfolio_id: int
    category: str
    name: str
    amount_brl: float
    location: str | None
    notes: str | None


class LinkedEmergencyReserveItemRead(BaseModel):
    asset_id: int
    symbol: str
    objective_id: int
    objective_name: str
    amount_brl: float
    location: str


class PatrimonyControlSnapshotRead(BaseModel):
    portfolio_id: int
    invested_portfolio_brl: float
    invested_excluding_emergency_brl: float
    linked_emergency_reserve_brl: float
    manual_items: list[ManualPatrimonyItemRead]
    linked_emergency_reserve_items: list[LinkedEmergencyReserveItemRead]
    total_emergency_reserve_brl: float
    total_manual_brl: float
    total_patrimony_brl: float

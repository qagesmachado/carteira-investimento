from pydantic import BaseModel, Field


class PropertyFinancingCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    property_type: str
    description: str | None = None


class PropertyFinancingUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    property_type: str | None = None
    description: str | None = None


class PropertyFinancingEntryCreate(BaseModel):
    event_date: str
    entry_type: str
    event_category: str
    description: str = Field(min_length=1, max_length=200)
    amount_brl: float = Field(gt=0)


class PropertyFinancingEntryUpdate(BaseModel):
    event_date: str | None = None
    entry_type: str | None = None
    event_category: str | None = None
    description: str | None = Field(default=None, min_length=1, max_length=200)
    amount_brl: float | None = Field(default=None, gt=0)


class FinancingSummaryMetricsRead(BaseModel):
    total_income_brl: float
    total_expenses_brl: float
    profit_brl: float
    capital_invested_brl: float


class PropertyFinancingEntryRead(BaseModel):
    id: int
    event_date: str
    entry_type: str
    event_category: str
    description: str
    amount_brl: float


class PropertyFinancingRead(BaseModel):
    id: int
    portfolio_id: int
    name: str
    property_type: str
    description: str | None
    entries: list[PropertyFinancingEntryRead]
    metrics: FinancingSummaryMetricsRead


class TimelineRowRead(BaseModel):
    label: str
    year: int
    month: int | None
    income_brl: float
    expenses_brl: float


class PropertyFinancingConsolidatedRead(BaseModel):
    financing_count: int
    metrics: FinancingSummaryMetricsRead
    monthly_timeline: list[TimelineRowRead]
    annual_timeline: list[TimelineRowRead]


class PropertyFinancingSnapshotRead(BaseModel):
    portfolio_id: int
    financings: list[PropertyFinancingRead]
    consolidated: PropertyFinancingConsolidatedRead

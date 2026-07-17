from pydantic import BaseModel, Field, field_validator

from app.services.analysis_engine import (
    AnalysisSummary,
    CriterionDefinition,
    TableDisplaySettings,
    TableSumColumnSettings,
    ViabilidadeWeightSettings,
    ViabilityRule,
)


class ScoreOptionRead(BaseModel):
    value: int
    label: str
    seal: str = ""
    characteristic: str = ""
    color: str | None = None


class CriterionDefinitionRead(BaseModel):
    code: str
    block: str
    label: str
    help_text: str = ""
    weight: float = 1.0
    sort_order: int = 0
    input_type: str = "select"
    score_options: list[ScoreOptionRead] = Field(default_factory=list)


class ViabilityBandRead(BaseModel):
    id: str
    label: str
    min_score: float
    color: str | None = None


class ViabilityRuleRead(BaseModel):
    block: str
    method: str
    bands: list[ViabilityBandRead] = Field(default_factory=list)


class TableSumColumnSettingsRead(BaseModel):
    use_fundamental: bool = True
    use_diagram: bool = True
    label: str = "Soma"
    diagram_multiplier: float = 2.0
    viabilidade_weights: ViabilidadeWeightSettings = Field(default_factory=ViabilidadeWeightSettings)


class TableDisplaySettingsRead(BaseModel):
    sum_column: TableSumColumnSettingsRead = Field(default_factory=TableSumColumnSettingsRead)


class AnalysisConfigRead(BaseModel):
    profile: str
    criteria: list[CriterionDefinitionRead]
    rules: list[ViabilityRuleRead]
    table_display: TableDisplaySettingsRead = Field(default_factory=TableDisplaySettingsRead)


class AnalysisConfigUpdate(BaseModel):
    criteria: list[CriterionDefinition]
    rules: list[ViabilityRule]
    table_display: TableDisplaySettings | None = None


class ViabilityResultRead(BaseModel):
    block: str
    score: float | None
    band_id: str | None
    label: str
    color: str | None = None


class BlockSummaryRead(BaseModel):
    score: float | None
    viability: ViabilityResultRead | None


class AnalysisSummaryRead(BaseModel):
    fundamental: BlockSummaryRead
    diagrama: BlockSummaryRead
    viabilidade: ViabilityResultRead | None = None


class AssetAnalysisRead(BaseModel):
    asset_id: int
    symbol: str
    name: str
    asset_type: str
    display_class: str
    scores: dict[str, int | None]
    score_refs: dict[str, str | None] = Field(default_factory=dict)
    summary: AnalysisSummaryRead
    is_pending: bool = False


class AssetPendingUpdate(BaseModel):
    portfolio_id: int
    is_pending: bool


class AnalysisProfileSummaryRead(BaseModel):
    profile: str
    total: int
    classified: int
    pending: int


class AnalysisPortfolioSummaryRead(BaseModel):
    portfolio_id: int
    classified_count: int
    pending_count: int
    profiles: list[AnalysisProfileSummaryRead] = Field(default_factory=list)


class PendingAssetRead(BaseModel):
    asset_id: int
    symbol: str
    name: str
    asset_type: str
    profile: str


class PendingAssetsGroupRead(BaseModel):
    profile: str
    assets: list[PendingAssetRead] = Field(default_factory=list)


class AnalysisPortfolioPendingRead(BaseModel):
    portfolio_id: int
    groups: list[PendingAssetsGroupRead] = Field(default_factory=list)


class AssetScoresUpdate(BaseModel):
    scores: dict[str, int | None]
    score_refs: dict[str, str | None] = Field(default_factory=dict)


class EtfIntlAllocationUpdate(BaseModel):
    asset_id: int
    target_percent: float = Field(ge=0, le=100)
    analysis_link: str | None = None


class EtfIntlAllocationsBulkUpdate(BaseModel):
    portfolio_id: int
    allocations: list[EtfIntlAllocationUpdate] = Field(min_length=1)


class CryptoAllocationsBulkUpdate(BaseModel):
    portfolio_id: int
    allocations: list[EtfIntlAllocationUpdate] = Field(min_length=1)


class StockBrAllocationsBulkUpdate(BaseModel):
    portfolio_id: int
    allocations: list[EtfIntlAllocationUpdate] = Field(min_length=1)


class FiiBrAllocationsBulkUpdate(BaseModel):
    portfolio_id: int
    allocations: list[EtfIntlAllocationUpdate] = Field(min_length=1)


class AnalysisMethodologyRead(BaseModel):
    portfolio_id: int
    profile: str
    methodology: str


class AnalysisMethodologyUpdate(BaseModel):
    portfolio_id: int
    methodology: str


class SegmentCatalogEntryRead(BaseModel):
    slug: str
    name: str
    score: int
    weight: float = 1.0
    help_text: str = ""
    color: str | None = None
    sort_order: int = 0

    @field_validator("name", "help_text")
    @classmethod
    def non_empty_text(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("Campo obrigatório.")
        return stripped


class SegmentCatalogUpdate(BaseModel):
    segments: list[SegmentCatalogEntryRead]

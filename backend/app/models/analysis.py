from datetime import datetime
from enum import StrEnum

from sqlmodel import Field, SQLModel, UniqueConstraint


class AnalysisBlockDb(StrEnum):
    FUNDAMENTAL = "fundamental"
    DIAGRAMA = "diagrama"


class AnalysisCriterionDefinition(SQLModel, table=True):
    __tablename__ = "analysis_criterion_definition"
    __table_args__ = (UniqueConstraint("profile", "code"),)

    id: int | None = Field(default=None, primary_key=True)
    profile: str = Field(index=True)
    block: str
    code: str
    label: str
    help_text: str = ""
    weight: float = 1.0
    sort_order: int = 0
    score_options_json: str = "[]"


class AnalysisViabilityRule(SQLModel, table=True):
    __tablename__ = "analysis_viability_rule"
    __table_args__ = (UniqueConstraint("profile", "block"),)

    id: int | None = Field(default=None, primary_key=True)
    profile: str = Field(index=True)
    block: str
    method: str = "min"
    rules_json: str = "{}"


class AnalysisProfileSettings(SQLModel, table=True):
    __tablename__ = "analysis_profile_settings"

    profile: str = Field(primary_key=True)
    settings_json: str = "{}"


class AssetAnalysisScore(SQLModel, table=True):
    __tablename__ = "asset_analysis_score"
    __table_args__ = (UniqueConstraint("asset_id", "criterion_code"),)

    id: int | None = Field(default=None, primary_key=True)
    asset_id: int = Field(index=True)
    criterion_code: str = Field(index=True)
    score: int | None = None
    value_text: str | None = None
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class AnalysisSegmentCatalog(SQLModel, table=True):
    __tablename__ = "analysis_segment_catalog"
    __table_args__ = (UniqueConstraint("profile", "slug"),)

    id: int | None = Field(default=None, primary_key=True)
    profile: str = Field(index=True)
    slug: str
    name: str
    score: int
    weight: float = 1.0
    help_text: str = ""
    color: str | None = None
    sort_order: int = 0

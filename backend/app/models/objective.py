from datetime import datetime
from enum import StrEnum

from sqlmodel import Field, SQLModel, UniqueConstraint


DEFAULT_OBJECTIVE_NAME = "Livre"


class ObjectiveStatus(StrEnum):
    ACTIVE = "active"
    ARCHIVED = "archived"


class ObjectiveMode(StrEnum):
    MULTI_ASSET = "multi_asset"
    SINGLE_ASSET = "single_asset"
    PENSION_CONTRIBUTION = "pension_contribution"


class Objective(SQLModel, table=True):
    __table_args__ = (UniqueConstraint("portfolio_id", "name"),)

    id: int | None = Field(default=None, primary_key=True)
    portfolio_id: int = Field(foreign_key="portfolio.id", index=True)
    name: str = Field(index=True)
    description: str | None = None
    is_default: bool = False
    mode: ObjectiveMode = ObjectiveMode.MULTI_ASSET
    partition_asset_id: int | None = Field(default=None, foreign_key="asset.id")
    plan_year: int | None = None
    annual_gross_income_brl: float | None = None
    contributed_ytd_brl: float = 0.0
    status: ObjectiveStatus = ObjectiveStatus.ACTIVE
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

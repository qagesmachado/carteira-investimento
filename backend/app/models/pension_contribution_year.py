from datetime import datetime

from sqlmodel import Field, SQLModel, UniqueConstraint


class PensionContributionYear(SQLModel, table=True):
    __table_args__ = (UniqueConstraint("objective_id", "plan_year"),)

    id: int | None = Field(default=None, primary_key=True)
    objective_id: int = Field(foreign_key="objective.id", index=True)
    plan_year: int = Field(index=True)
    annual_gross_income_brl: float | None = None
    contributed_ytd_brl: float = 0.0
    updated_at: datetime = Field(default_factory=datetime.utcnow)

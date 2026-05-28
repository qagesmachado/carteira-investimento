from datetime import datetime

from sqlmodel import Field, SQLModel, UniqueConstraint


class ObjectiveAllocation(SQLModel, table=True):
    __table_args__ = (UniqueConstraint("objective_id", "slice_name"),)

    id: int | None = Field(default=None, primary_key=True)
    objective_id: int = Field(foreign_key="objective.id", index=True)
    asset_id: int = Field(foreign_key="asset.id", index=True)
    slice_name: str = Field(index=True)
    quantity: float | None = None
    amount: float | None = None
    updated_at: datetime = Field(default_factory=datetime.utcnow)

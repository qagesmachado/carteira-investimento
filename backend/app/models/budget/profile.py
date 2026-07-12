from datetime import datetime

from sqlmodel import Field, SQLModel


class BudgetProfile(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True)
    description: str | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

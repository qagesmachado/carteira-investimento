from sqlmodel import Field, SQLModel, UniqueConstraint


class BudgetTag(SQLModel, table=True):
    __table_args__ = (UniqueConstraint("profile_id", "name"),)

    id: int | None = Field(default=None, primary_key=True)
    profile_id: int = Field(foreign_key="budgetprofile.id", index=True)
    name: str
    color: str = "#22c55e"

from sqlmodel import Field, SQLModel, UniqueConstraint


class BudgetCategory(SQLModel, table=True):
    __table_args__ = (UniqueConstraint("profile_id", "name"),)

    id: int | None = Field(default=None, primary_key=True)
    profile_id: int = Field(foreign_key="budgetprofile.id", index=True)
    name: str
    sort_order: int = 0
    color: str = "#64748b"

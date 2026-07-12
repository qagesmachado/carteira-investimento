from sqlmodel import Field, SQLModel, UniqueConstraint


class BudgetMonth(SQLModel, table=True):
    __table_args__ = (UniqueConstraint("profile_id", "year_month"),)

    id: int | None = Field(default=None, primary_key=True)
    profile_id: int = Field(foreign_key="budgetprofile.id", index=True)
    year_month: str = Field(index=True)
    planned_income_brl: float | None = None


class BudgetMonthTarget(SQLModel, table=True):
    __table_args__ = (UniqueConstraint("month_id", "category_id"),)

    id: int | None = Field(default=None, primary_key=True)
    month_id: int = Field(foreign_key="budgetmonth.id", index=True)
    category_id: int = Field(foreign_key="budgetcategory.id", index=True)
    percent: float


class BudgetMonthIncome(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    month_id: int = Field(foreign_key="budgetmonth.id", index=True)
    source_id: int | None = Field(default=None, foreign_key="budgetincomesource.id", index=True)
    label: str
    amount_brl: float

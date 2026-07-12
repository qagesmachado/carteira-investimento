from sqlmodel import Field, SQLModel


class BudgetRecurringExpense(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    profile_id: int = Field(foreign_key="budgetprofile.id", index=True)
    description: str
    amount_brl: float
    category_id: int = Field(foreign_key="budgetcategory.id", index=True)
    tag_id: int | None = Field(default=None, foreign_key="budgettag.id", index=True)
    day_of_month: int = Field(default=1)
    start_year_month: str = Field(index=True)
    end_year_month: str | None = None
    is_active: bool = True

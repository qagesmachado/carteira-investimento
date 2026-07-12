from datetime import date
from enum import StrEnum

from sqlmodel import Field, SQLModel


class BudgetTransactionType(StrEnum):
    INCOME = "income"
    EXPENSE = "expense"


class BudgetTransaction(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    profile_id: int = Field(foreign_key="budgetprofile.id", index=True)
    month_id: int = Field(foreign_key="budgetmonth.id", index=True)
    transaction_type: BudgetTransactionType
    event_date: date = Field(index=True)
    description: str
    amount_brl: float
    category_id: int | None = Field(default=None, foreign_key="budgetcategory.id", index=True)
    tag_id: int | None = Field(default=None, foreign_key="budgettag.id", index=True)
    income_source_id: int | None = Field(default=None, foreign_key="budgetincomesource.id", index=True)
    recurring_expense_id: int | None = Field(
        default=None, foreign_key="budgetrecurringexpense.id", index=True
    )
    notes: str | None = None

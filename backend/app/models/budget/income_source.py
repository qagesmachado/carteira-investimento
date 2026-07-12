from enum import StrEnum

from sqlmodel import Field, SQLModel, UniqueConstraint


class IncomeRecurrenceHint(StrEnum):
    RECURRING = "recurring"
    VARIABLE = "variable"
    ONE_OFF = "one_off"


class BudgetIncomeSource(SQLModel, table=True):
    __table_args__ = (UniqueConstraint("profile_id", "name"),)

    id: int | None = Field(default=None, primary_key=True)
    profile_id: int = Field(foreign_key="budgetprofile.id", index=True)
    name: str
    recurrence_hint: IncomeRecurrenceHint = IncomeRecurrenceHint.VARIABLE
    sort_order: int = 0
    is_active: bool = True

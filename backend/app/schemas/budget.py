from datetime import date

from pydantic import BaseModel, Field


class BudgetProfileCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    description: str | None = None


class BudgetProfileUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    description: str | None = None


class BudgetProfileRead(BaseModel):
    id: int
    name: str
    description: str | None


class BudgetCategoryRead(BaseModel):
    id: int
    profile_id: int
    name: str
    sort_order: int
    color: str


class BudgetCategoryCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    color: str = "#64748b"


class BudgetCategoryUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    color: str | None = None
    # 'all' altera o catálogo (todos os meses); 'from_month' aplica override do year_month em diante.
    scope: str = "all"
    year_month: str | None = None


class BudgetTagCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    color: str = "#22c55e"


class BudgetTagUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    color: str | None = None


class BudgetTagRead(BaseModel):
    id: int
    profile_id: int
    name: str
    color: str
    usage_count: int = 0


class BudgetIncomeSourceCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    recurrence_hint: str = "variable"


class BudgetIncomeSourceUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    recurrence_hint: str | None = None
    is_active: bool | None = None


class BudgetIncomeSourceRead(BaseModel):
    id: int
    profile_id: int
    name: str
    recurrence_hint: str
    sort_order: int
    is_active: bool


class BudgetMonthIncomeItem(BaseModel):
    id: int | None = None
    source_id: int | None = None
    label: str
    amount_brl: float
    recurring: bool = False
    received: bool = False


class BudgetIncomeEntryCreate(BaseModel):
    label: str = Field(min_length=1, max_length=120)
    amount_brl: float = Field(gt=0)
    recurring_12_months: bool = False


class BudgetIncomeEntryUpdate(BaseModel):
    label: str | None = Field(default=None, min_length=1, max_length=120)
    amount_brl: float | None = Field(default=None, gt=0)
    received: bool | None = None


class BudgetMonthIncomesUpdate(BaseModel):
    items: list[BudgetMonthIncomeItem]


class BudgetMonthTargetItem(BaseModel):
    category_id: int
    percent: float
    name: str | None = None
    color: str | None = None


class BudgetMonthTargetsUpdate(BaseModel):
    planned_income_brl: float | None = None
    targets: list[BudgetMonthTargetItem]
    # Categorias novas a incluir (com 0%) nos meses seguintes que já tiverem metas próprias.
    propagate_category_ids: list[int] = Field(default_factory=list)
    # Copia o conjunto completo (categorias + %) para meses seguintes com metas próprias.
    apply_to_following_months: bool = False


class BudgetRemoveTargetCategories(BaseModel):
    """Remove categorias dos conjuntos de metas (sem exigir soma 100%)."""

    category_ids: list[int] = Field(min_length=1)
    # Se true, remove também dos meses > year_month que já tiverem metas próprias.
    apply_to_following_months: bool = False
    # Se true, remove do mês year_month (quando ele já tiver linhas próprias).
    apply_to_current: bool = True


class BudgetMonthPatch(BaseModel):
    planned_income_brl: float | None = None


class BudgetExpenseEntryCreate(BaseModel):
    description: str = Field(min_length=1, max_length=240)
    event_date: str
    amount_brl: float = Field(gt=0)
    category_id: int
    tag_id: int | None = None
    recurring: bool = False
    indefinite: bool = False
    end_year_month: str | None = None


class BudgetExpenseEntryUpdate(BaseModel):
    description: str | None = Field(default=None, min_length=1, max_length=240)
    event_date: str | None = None
    amount_brl: float | None = Field(default=None, gt=0)
    category_id: int | None = None
    tag_id: int | None = None
    indefinite: bool | None = None
    end_year_month: str | None = None


class BudgetRecurringExpenseRead(BaseModel):
    id: int
    profile_id: int
    description: str
    amount_brl: float
    category_id: int
    category_name: str | None = None
    tag_id: int | None
    tag_name: str | None = None
    day_of_month: int
    start_year_month: str
    end_year_month: str | None
    indefinite: bool
    is_active: bool


class BudgetCategoryUsageSummary(BaseModel):
    id: int
    profile_id: int
    name: str
    sort_order: int
    color: str
    transaction_count: int
    recurring_count: int
    can_delete: bool


class BudgetCategoryUsageTransaction(BaseModel):
    id: int
    event_date: str
    year_month: str
    description: str
    amount_brl: float
    recurring: bool


class BudgetCategoryUsageDetail(BudgetCategoryUsageSummary):
    transactions: list[BudgetCategoryUsageTransaction] = Field(default_factory=list)
    recurring_expenses: list[BudgetRecurringExpenseRead] = Field(default_factory=list)


class BudgetTransactionCreate(BaseModel):
    transaction_type: str
    event_date: str
    description: str = Field(min_length=1, max_length=240)
    amount_brl: float = Field(gt=0)
    category_id: int | None = None
    tag_id: int | None = None
    income_source_id: int | None = None
    notes: str | None = None


class BudgetTransactionUpdate(BaseModel):
    event_date: str | None = None
    description: str | None = Field(default=None, min_length=1, max_length=240)
    amount_brl: float | None = Field(default=None, gt=0)
    category_id: int | None = None
    tag_id: int | None = None
    income_source_id: int | None = None
    notes: str | None = None
    settled: bool | None = None


class BudgetTransactionRead(BaseModel):
    id: int
    profile_id: int
    month_id: int
    transaction_type: str
    event_date: str
    description: str
    amount_brl: float
    category_id: int | None
    category_name: str | None = None
    tag_id: int | None
    tag_name: str | None = None
    tag_color: str | None = None
    income_source_id: int | None
    notes: str | None
    recurring: bool = False
    recurring_expense_id: int | None = None
    settled: bool = False


class BudgetCategoryKpiRead(BaseModel):
    category_id: int
    category_name: str
    color: str
    percent: float
    target_brl: float
    spent_brl: float
    remaining_brl: float
    usage_percent: float
    exceeded: bool
    transaction_count: int


class BudgetMonthSnapshotRead(BaseModel):
    profile_id: int
    year_month: str
    planned_income_brl: float | None
    income_total_brl: float
    expense_total_brl: float
    remaining_brl: float
    income_usage_percent: float
    categories: list[BudgetCategoryKpiRead]
    incomes: list[BudgetMonthIncomeItem]
    transactions: list[BudgetTransactionRead]
    # True quando as metas do mês são herdadas do mês anterior (o mês não tem metas próprias).
    targets_inherited: bool = False


class DashboardMonthRow(BaseModel):
    year_month: str
    income_brl: float
    expense_brl: float


class DashboardSliceRead(BaseModel):
    id: int
    name: str
    color: str
    amount_brl: float
    percent: float


class BudgetDashboardRead(BaseModel):
    profile_id: int
    months: int
    focus_year_month: str
    forward_months: int
    from_year_month: str | None = None
    to_year_month: str | None = None
    result_brl: float
    income_brl: float
    expense_brl: float
    balance_brl: float
    timeline: list[DashboardMonthRow]
    expenses_by_tag: list[DashboardSliceRead]
    expenses_by_category: list[DashboardSliceRead]
    incomes_by_tag: list[DashboardSliceRead] = []


class ActiveBudgetProfileRead(BaseModel):
    profile_id: int | None


class ActiveBudgetProfileUpdate(BaseModel):
    profile_id: int | None

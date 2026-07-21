from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlmodel import Session

from app.db.session import get_session
from app.schemas.budget import (
    ActiveBudgetProfileRead,
    ActiveBudgetProfileUpdate,
    BudgetCategoryCreate,
    BudgetCategoryRead,
    BudgetCategoryUpdate,
    BudgetCategoryUsageDetail,
    BudgetCategoryUsageSummary,
    BudgetDashboardRead,
    BudgetExpenseEntryCreate,
    BudgetExpenseEntryUpdate,
    BudgetIncomeEntryCreate,
    BudgetIncomeEntryUpdate,
    BudgetIncomeSourceCreate,
    BudgetIncomeSourceRead,
    BudgetIncomeSourceUpdate,
    BudgetMonthIncomesUpdate,
    BudgetMonthPatch,
    BudgetMonthSnapshotRead,
    BudgetMonthTargetsUpdate,
    BudgetProfileCreate,
    BudgetProfileRead,
    BudgetProfileUpdate,
    BudgetRemoveTargetCategories,
    BudgetTagCreate,
    BudgetTagRead,
    BudgetTagUpdate,
    BudgetRecurringExpenseRead,
    BudgetTransactionCreate,
    BudgetTransactionRead,
    BudgetTransactionUpdate,
)
from app.services.budget.budget_service import (
    add_month_income_entry,
    build_dashboard,
    build_month_snapshot,
    copy_incomes_from_previous_month,
    create_budget_profile,
    create_category,
    create_income_source,
    create_tag,
    create_transaction,
    delete_budget_profile,
    delete_category,
    delete_category_expenses,
    delete_income_source,
    delete_month_income_entry,
    delete_tag,
    delete_transaction,
    get_category_usage,
    list_categories,
    list_categories_usage,
    list_income_sources,
    list_profiles_read,
    list_tags,
    patch_budget_month,
    remove_target_categories,
    update_category,
    update_budget_profile,
    update_income_source,
    update_month_income_entry,
    update_month_incomes,
    update_month_targets,
    update_tag,
    update_transaction,
)
from app.services.budget.recurring_expense import (
    create_expense_entry,
    delete_recurring_expense,
    list_recurring_expenses,
    stop_recurring_expense_from_month,
    update_recurring_expense,
)
from app.services.budget.recurring_income import stop_recurring_income_from_month
from app.services.budget.profile_service import (
    get_active_budget_profile_id,
    get_budget_profile,
    set_active_budget_profile_id,
)

router = APIRouter(prefix="/budget", tags=["budget"])


@router.get("/active", response_model=ActiveBudgetProfileRead)
def get_active_profile(session: Annotated[Session, Depends(get_session)]) -> ActiveBudgetProfileRead:
    return ActiveBudgetProfileRead(profile_id=get_active_budget_profile_id(session))


@router.put("/active", response_model=ActiveBudgetProfileRead)
def put_active_profile(
    payload: ActiveBudgetProfileUpdate,
    session: Annotated[Session, Depends(get_session)],
) -> ActiveBudgetProfileRead:
    profile_id = set_active_budget_profile_id(session, payload.profile_id)
    return ActiveBudgetProfileRead(profile_id=profile_id)


@router.get("/profiles", response_model=list[BudgetProfileRead])
def get_profiles(session: Annotated[Session, Depends(get_session)]) -> list[BudgetProfileRead]:
    return list_profiles_read(session)


@router.post("/profiles", response_model=BudgetProfileRead, status_code=status.HTTP_201_CREATED)
def post_profile(
    payload: BudgetProfileCreate,
    session: Annotated[Session, Depends(get_session)],
) -> BudgetProfileRead:
    return create_budget_profile(session, payload)


@router.patch("/profiles/{profile_id}", response_model=BudgetProfileRead)
def patch_profile(
    profile_id: int,
    payload: BudgetProfileUpdate,
    session: Annotated[Session, Depends(get_session)],
) -> BudgetProfileRead:
    return update_budget_profile(session, profile_id, payload)


@router.delete("/profiles/{profile_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_profile(
    profile_id: int,
    session: Annotated[Session, Depends(get_session)],
) -> None:
    delete_budget_profile(session, profile_id)


@router.get("/profiles/{profile_id}/tags", response_model=list[BudgetTagRead])
def get_tags(
    profile_id: int,
    session: Annotated[Session, Depends(get_session)],
) -> list[BudgetTagRead]:
    return list_tags(session, profile_id)


@router.post("/profiles/{profile_id}/tags", response_model=BudgetTagRead, status_code=status.HTTP_201_CREATED)
def post_tag(
    profile_id: int,
    payload: BudgetTagCreate,
    session: Annotated[Session, Depends(get_session)],
) -> BudgetTagRead:
    return create_tag(session, profile_id, payload)


@router.patch("/profiles/{profile_id}/tags/{tag_id}", response_model=BudgetTagRead)
def patch_tag(
    profile_id: int,
    tag_id: int,
    payload: BudgetTagUpdate,
    session: Annotated[Session, Depends(get_session)],
) -> BudgetTagRead:
    return update_tag(session, profile_id, tag_id, payload)


@router.delete("/profiles/{profile_id}/tags/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_tag(
    profile_id: int,
    tag_id: int,
    session: Annotated[Session, Depends(get_session)],
) -> None:
    delete_tag(session, profile_id, tag_id)


@router.get("/profiles/{profile_id}/categories", response_model=list[BudgetCategoryRead])
def get_categories(
    profile_id: int,
    session: Annotated[Session, Depends(get_session)],
) -> list[BudgetCategoryRead]:
    return list_categories(session, profile_id)


@router.get(
    "/profiles/{profile_id}/categories/usage",
    response_model=list[BudgetCategoryUsageSummary],
)
def get_categories_usage(
    profile_id: int,
    session: Annotated[Session, Depends(get_session)],
) -> list[BudgetCategoryUsageSummary]:
    return list_categories_usage(session, profile_id)


@router.post(
    "/profiles/{profile_id}/categories",
    response_model=BudgetCategoryRead,
    status_code=status.HTTP_201_CREATED,
)
def post_category(
    profile_id: int,
    payload: BudgetCategoryCreate,
    session: Annotated[Session, Depends(get_session)],
) -> BudgetCategoryRead:
    return create_category(session, profile_id, payload)


@router.get(
    "/profiles/{profile_id}/categories/{category_id}/usage",
    response_model=BudgetCategoryUsageDetail,
)
def get_category_usage_detail(
    profile_id: int,
    category_id: int,
    session: Annotated[Session, Depends(get_session)],
) -> BudgetCategoryUsageDetail:
    return get_category_usage(session, profile_id, category_id)


@router.delete(
    "/profiles/{profile_id}/categories/{category_id}/expenses",
    response_model=BudgetCategoryUsageDetail,
)
def remove_category_expenses(
    profile_id: int,
    category_id: int,
    session: Annotated[Session, Depends(get_session)],
) -> BudgetCategoryUsageDetail:
    return delete_category_expenses(session, profile_id, category_id)


@router.patch("/profiles/{profile_id}/categories/{category_id}", response_model=BudgetCategoryRead)
def patch_category(
    profile_id: int,
    category_id: int,
    payload: BudgetCategoryUpdate,
    session: Annotated[Session, Depends(get_session)],
) -> BudgetCategoryRead:
    return update_category(session, profile_id, category_id, payload)


@router.delete(
    "/profiles/{profile_id}/categories/{category_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remove_category(
    profile_id: int,
    category_id: int,
    session: Annotated[Session, Depends(get_session)],
) -> None:
    delete_category(session, profile_id, category_id)


@router.get("/profiles/{profile_id}/income-sources", response_model=list[BudgetIncomeSourceRead])
def get_income_sources(
    profile_id: int,
    session: Annotated[Session, Depends(get_session)],
) -> list[BudgetIncomeSourceRead]:
    return list_income_sources(session, profile_id)


@router.post(
    "/profiles/{profile_id}/income-sources",
    response_model=BudgetIncomeSourceRead,
    status_code=status.HTTP_201_CREATED,
)
def post_income_source(
    profile_id: int,
    payload: BudgetIncomeSourceCreate,
    session: Annotated[Session, Depends(get_session)],
) -> BudgetIncomeSourceRead:
    return create_income_source(session, profile_id, payload)


@router.patch("/profiles/{profile_id}/income-sources/{source_id}", response_model=BudgetIncomeSourceRead)
def patch_income_source(
    profile_id: int,
    source_id: int,
    payload: BudgetIncomeSourceUpdate,
    session: Annotated[Session, Depends(get_session)],
) -> BudgetIncomeSourceRead:
    return update_income_source(session, profile_id, source_id, payload)


@router.delete("/profiles/{profile_id}/income-sources/{source_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_income_source(
    profile_id: int,
    source_id: int,
    session: Annotated[Session, Depends(get_session)],
) -> None:
    delete_income_source(session, profile_id, source_id)


@router.post(
    "/profiles/{profile_id}/income-sources/{source_id}/stop-from/{year_month}",
    response_model=BudgetIncomeSourceRead,
    responses={204: {"description": "Fonte removida por completo"}},
)
def stop_recurring_income(
    profile_id: int,
    source_id: int,
    year_month: str,
    session: Annotated[Session, Depends(get_session)],
) -> BudgetIncomeSourceRead | Response:
    result = stop_recurring_income_from_month(session, profile_id, source_id, year_month)
    if result is None:
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    return result


@router.get("/profiles/{profile_id}/months/{year_month}", response_model=BudgetMonthSnapshotRead)
def get_month_snapshot(
    profile_id: int,
    year_month: str,
    session: Annotated[Session, Depends(get_session)],
    view: str = Query(default="full"),
) -> BudgetMonthSnapshotRead:
    return build_month_snapshot(session, profile_id, year_month, view=view)  # type: ignore[arg-type]


@router.patch("/profiles/{profile_id}/months/{year_month}", response_model=BudgetMonthSnapshotRead)
def patch_month(
    profile_id: int,
    year_month: str,
    payload: BudgetMonthPatch,
    session: Annotated[Session, Depends(get_session)],
) -> BudgetMonthSnapshotRead:
    return patch_budget_month(session, profile_id, year_month, payload)


@router.put("/profiles/{profile_id}/months/{year_month}/targets", response_model=BudgetMonthSnapshotRead)
def put_month_targets(
    profile_id: int,
    year_month: str,
    payload: BudgetMonthTargetsUpdate,
    session: Annotated[Session, Depends(get_session)],
) -> BudgetMonthSnapshotRead:
    return update_month_targets(session, profile_id, year_month, payload)


@router.post(
    "/profiles/{profile_id}/months/{year_month}/targets/remove-categories",
    response_model=BudgetMonthSnapshotRead,
)
def post_remove_target_categories(
    profile_id: int,
    year_month: str,
    payload: BudgetRemoveTargetCategories,
    session: Annotated[Session, Depends(get_session)],
) -> BudgetMonthSnapshotRead:
    return remove_target_categories(session, profile_id, year_month, payload)


@router.put("/profiles/{profile_id}/months/{year_month}/incomes", response_model=BudgetMonthSnapshotRead)
def put_month_incomes(
    profile_id: int,
    year_month: str,
    payload: BudgetMonthIncomesUpdate,
    session: Annotated[Session, Depends(get_session)],
) -> BudgetMonthSnapshotRead:
    return update_month_incomes(session, profile_id, year_month, payload)


@router.post("/profiles/{profile_id}/months/{year_month}/incomes", response_model=BudgetMonthSnapshotRead)
def post_month_income(
    profile_id: int,
    year_month: str,
    payload: BudgetIncomeEntryCreate,
    session: Annotated[Session, Depends(get_session)],
) -> BudgetMonthSnapshotRead:
    return add_month_income_entry(session, profile_id, year_month, payload)


@router.patch(
    "/profiles/{profile_id}/months/{year_month}/incomes/{income_id}",
    response_model=BudgetMonthSnapshotRead,
)
def patch_month_income(
    profile_id: int,
    year_month: str,
    income_id: int,
    payload: BudgetIncomeEntryUpdate,
    session: Annotated[Session, Depends(get_session)],
) -> BudgetMonthSnapshotRead:
    return update_month_income_entry(session, profile_id, year_month, income_id, payload)


@router.delete(
    "/profiles/{profile_id}/months/{year_month}/incomes/{income_id}",
    response_model=BudgetMonthSnapshotRead,
)
def remove_month_income(
    profile_id: int,
    year_month: str,
    income_id: int,
    session: Annotated[Session, Depends(get_session)],
) -> BudgetMonthSnapshotRead:
    return delete_month_income_entry(session, profile_id, year_month, income_id)


@router.post(
    "/profiles/{profile_id}/months/{year_month}/copy-previous-incomes",
    response_model=BudgetMonthSnapshotRead,
)
def post_copy_previous_incomes(
    profile_id: int,
    year_month: str,
    session: Annotated[Session, Depends(get_session)],
) -> BudgetMonthSnapshotRead:
    return copy_incomes_from_previous_month(session, profile_id, year_month)


@router.post(
    "/profiles/{profile_id}/months/{year_month}/expenses",
    response_model=BudgetMonthSnapshotRead,
)
def post_month_expense(
    profile_id: int,
    year_month: str,
    payload: BudgetExpenseEntryCreate,
    session: Annotated[Session, Depends(get_session)],
) -> BudgetMonthSnapshotRead:
    create_expense_entry(session, profile_id, year_month, payload)
    return build_month_snapshot(session, profile_id, year_month)


@router.get(
    "/profiles/{profile_id}/recurring-expenses",
    response_model=list[BudgetRecurringExpenseRead],
)
def get_recurring_expenses(
    profile_id: int,
    session: Annotated[Session, Depends(get_session)],
) -> list[BudgetRecurringExpenseRead]:
    return list_recurring_expenses(session, profile_id)


@router.patch(
    "/profiles/{profile_id}/recurring-expenses/{rule_id}",
    response_model=BudgetRecurringExpenseRead,
)
def patch_recurring_expense(
    profile_id: int,
    rule_id: int,
    payload: BudgetExpenseEntryUpdate,
    session: Annotated[Session, Depends(get_session)],
) -> BudgetRecurringExpenseRead:
    return update_recurring_expense(session, profile_id, rule_id, payload)


@router.delete(
    "/profiles/{profile_id}/recurring-expenses/{rule_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remove_recurring_expense(
    profile_id: int,
    rule_id: int,
    session: Annotated[Session, Depends(get_session)],
) -> None:
    delete_recurring_expense(session, profile_id, rule_id)


@router.post(
    "/profiles/{profile_id}/recurring-expenses/{rule_id}/stop-from/{year_month}",
    response_model=BudgetRecurringExpenseRead,
    responses={204: {"description": "Regra removida por completo"}},
)
def stop_recurring_expense(
    profile_id: int,
    rule_id: int,
    year_month: str,
    session: Annotated[Session, Depends(get_session)],
) -> BudgetRecurringExpenseRead | Response:
    result = stop_recurring_expense_from_month(session, profile_id, rule_id, year_month)
    if result is None:
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    return result


@router.post(
    "/profiles/{profile_id}/months/{year_month}/transactions",
    response_model=BudgetTransactionRead,
    status_code=status.HTTP_201_CREATED,
)
def post_transaction(
    profile_id: int,
    year_month: str,
    payload: BudgetTransactionCreate,
    session: Annotated[Session, Depends(get_session)],
) -> BudgetTransactionRead:
    return create_transaction(session, profile_id, year_month, payload)


@router.patch("/profiles/{profile_id}/transactions/{transaction_id}", response_model=BudgetTransactionRead)
def patch_transaction(
    profile_id: int,
    transaction_id: int,
    payload: BudgetTransactionUpdate,
    session: Annotated[Session, Depends(get_session)],
) -> BudgetTransactionRead:
    return update_transaction(session, profile_id, transaction_id, payload)


@router.delete("/profiles/{profile_id}/transactions/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_transaction(
    profile_id: int,
    transaction_id: int,
    session: Annotated[Session, Depends(get_session)],
) -> None:
    delete_transaction(session, profile_id, transaction_id)


@router.get("/profiles/{profile_id}/dashboard", response_model=BudgetDashboardRead)
def get_dashboard(
    profile_id: int,
    session: Annotated[Session, Depends(get_session)],
    focus: str = Query(..., description="YYYY-MM focus month (KPIs)"),
    months: int = Query(default=6, ge=3, le=6),
    forward: int | None = Query(
        default=None,
        ge=0,
        le=12,
        description="Meses à frente do foco; default = months (janela simétrica)",
    ),
    from_: str | None = Query(
        default=None, alias="from", description="Início do intervalo manual (YYYY-MM)"
    ),
    to: str | None = Query(default=None, description="Fim do intervalo manual (YYYY-MM)"),
) -> BudgetDashboardRead:
    if from_ is not None or to is not None:
        return build_dashboard(
            session,
            profile_id,
            focus,
            months=0,
            forward_months=0,
            from_year_month=from_,
            to_year_month=to,
        )
    if months not in (3, 6):
        months = 6
    forward_months = months if forward is None else forward
    return build_dashboard(session, profile_id, focus, months, forward_months)

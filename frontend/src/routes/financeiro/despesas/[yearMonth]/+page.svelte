<script lang="ts">
  import { page } from '$app/stores';

  import {
    createMonthExpense,
    deleteRecurringExpense,
    deleteTransaction,
    getMonthSnapshot,
    listRecurringExpenses,
    listTags,
    stopRecurringExpenseFromMonth,
    updateRecurringExpense,
    updateTransaction,
    type BudgetMonthSnapshot,
    type BudgetRecurringExpense,
    type BudgetTag,
    type BudgetTransaction
  } from '$lib/api/budget';
  import { parseApiError } from '$lib/api/parseApiError';
  import DismissibleAlert from '$lib/components/DismissibleAlert.svelte';
  import EmptyStateCallout from '$lib/components/EmptyStateCallout.svelte';
  import LucideIcon from '$lib/components/LucideIcon.svelte';
  import BudgetExpenseDeleteConfirmModal from '$lib/features/financeiro/BudgetExpenseDeleteConfirmModal.svelte';
  import BudgetExpenseEditModal from '$lib/features/financeiro/BudgetExpenseEditModal.svelte';
  import BudgetExpenseForm from '$lib/features/financeiro/BudgetExpenseForm.svelte';
  import BudgetExpenseList from '$lib/features/financeiro/BudgetExpenseList.svelte';
  import PageSection from '$lib/components/PageSection.svelte';
  import { NO_BUDGET_PROFILE_EMPTY_STATE } from '$lib/features/onboarding/emptyStateCopy';
  import { FINANCEIRO_EXPENSES_LUCIDE_ICON } from '$lib/icons/lucideIconCatalog';
  import type {
    BudgetExpenseDeleteAction,
    BudgetExpenseDeleteTarget
  } from '$lib/features/financeiro/budgetExpenseDelete';
  import {
    filterActiveRecurringExpenses,
    listMonthExpenses
  } from '$lib/features/financeiro/budgetExpenseRows';
  import { getBudgetLayoutContext } from '$lib/features/financeiro/budgetLayoutContext';
  import { formatBrl } from '$lib/features/rebalance/allocationTargets';
  import { hideMoneyValues } from '$lib/stores/hideMoneyValues';

  const ctx = getBudgetLayoutContext();
  const { activeProfileId, yearMonth: yearMonthStore } = ctx;

  let snapshot: BudgetMonthSnapshot | null = null;
  let recurringRules: BudgetRecurringExpense[] = [];
  let tags: BudgetTag[] = [];
  let loading = true;
  let initialized = false;
  let saving = false;
  let error = '';
  let message = '';
  let editingExpense: BudgetTransaction | null = null;
  let editingRecurring: BudgetRecurringExpense | null = null;
  let pendingDelete: BudgetExpenseDeleteTarget | null = null;

  $: profileId = $activeProfileId;
  $: yearMonth = $page.params.yearMonth ?? $yearMonthStore;
  $: expenses = listMonthExpenses(snapshot?.transactions ?? []);
  $: activeRecurringRules = filterActiveRecurringExpenses(recurringRules, yearMonth);
  $: expenseTotal = snapshot?.expense_total_brl ?? 0;
  $: incomeTotal = snapshot?.income_total_brl ?? 0;
  $: remaining = snapshot?.remaining_brl ?? 0;
  $: editModalOpen = editingExpense != null || editingRecurring != null;
  $: deleteModalOpen = pendingDelete != null;

  $: if (yearMonth && yearMonth !== $yearMonthStore) {
    yearMonthStore.set(yearMonth);
  }

  async function loadPage() {
    if (profileId == null) {
      snapshot = null;
      recurringRules = [];
      loading = false;
      return;
    }
    loading = true;
    error = '';
    try {
      [snapshot, tags, recurringRules] = await Promise.all([
        getMonthSnapshot(profileId, yearMonth, 'expenses'),
        listTags(profileId),
        listRecurringExpenses(profileId)
      ]);
    } catch (err) {
      snapshot = null;
      recurringRules = [];
      error = parseApiError(err, 'Não foi possível carregar as despesas.');
    } finally {
      loading = false;
      initialized = true;
    }
  }

  $: if (profileId != null && yearMonth) {
    void loadPage();
  }

  function formatValue(value: number): string {
    if ($hideMoneyValues) {
      return 'R$ ••••••';
    }
    return formatBrl(value);
  }

  function cancelEdit() {
    editingExpense = null;
    editingRecurring = null;
  }

  function startEditExpense(expense: BudgetTransaction) {
    if (expense.recurring && expense.recurring_expense_id != null) {
      editingRecurring =
        recurringRules.find((rule) => rule.id === expense.recurring_expense_id) ?? null;
      editingExpense = null;
      return;
    }
    editingExpense = expense;
    editingRecurring = null;
  }

  async function handleSubmit(payload: {
    description: string;
    event_date: string;
    amount_brl: number;
    category_id: number;
    tag_id: number | null;
    recurring?: boolean;
    indefinite?: boolean;
    end_year_month?: string | null;
  }) {
    if (profileId == null) {
      return;
    }
    saving = true;
    error = '';
    try {
      const wasEditing = editingRecurring != null || editingExpense != null;
      if (editingRecurring) {
        await updateRecurringExpense(profileId, editingRecurring.id, payload);
      } else if (editingExpense) {
        await updateTransaction(profileId, editingExpense.id, payload);
      } else {
        await createMonthExpense(profileId, yearMonth, payload);
      }
      editingExpense = null;
      editingRecurring = null;
      await loadPage();
      message = wasEditing ? 'Despesa atualizada.' : 'Despesa salva.';
    } catch (err) {
      error = parseApiError(err, 'Não foi possível salvar a despesa.');
    } finally {
      saving = false;
    }
  }

  function requestDeleteExpense(expense: BudgetTransaction) {
    if (expense.recurring && expense.recurring_expense_id != null) {
      pendingDelete = {
        kind: 'recurring',
        ruleId: expense.recurring_expense_id,
        description: expense.description,
        amount_brl: expense.amount_brl,
        fromYearMonth: yearMonth
      };
      return;
    }
    pendingDelete = { kind: 'pontual', expense };
  }

  function requestDeleteRecurring(rule: BudgetRecurringExpense) {
    pendingDelete = {
      kind: 'recurring',
      ruleId: rule.id,
      description: rule.description,
      amount_brl: rule.amount_brl,
      fromYearMonth: yearMonth
    };
  }

  function cancelDelete() {
    pendingDelete = null;
  }

  async function confirmDelete(action: BudgetExpenseDeleteAction) {
    if (pendingDelete == null || profileId == null) {
      return;
    }
    saving = true;
    error = '';
    try {
      if (pendingDelete.kind === 'pontual') {
        await deleteTransaction(profileId, pendingDelete.expense.id);
        if (editingExpense?.id === pendingDelete.expense.id) {
          editingExpense = null;
        }
      } else if (action === 'stop-from-month') {
        await stopRecurringExpenseFromMonth(
          profileId,
          pendingDelete.ruleId,
          pendingDelete.fromYearMonth
        );
        if (editingRecurring?.id === pendingDelete.ruleId) {
          editingRecurring = null;
        }
      } else {
        await deleteRecurringExpense(profileId, pendingDelete.ruleId);
        if (editingRecurring?.id === pendingDelete.ruleId) {
          editingRecurring = null;
        }
      }
      pendingDelete = null;
      await loadPage();
      message = 'Despesa excluída.';
    } catch (err) {
      error = parseApiError(err, 'Não foi possível excluir a despesa.');
    } finally {
      saving = false;
    }
  }
</script>

<svelte:head>
  <title>Despesas — Financeiro</title>
</svelte:head>

<div class="flex flex-col gap-3">
{#if error}
  <DismissibleAlert text={error} variant="error" on:dismiss={() => (error = '')} />
{/if}
{#if message}
  <DismissibleAlert text={message} variant="success" on:dismiss={() => (message = '')} />
{/if}
{#if profileId == null}
  <PageSection testId="financeiro-despesas-heading">
    <div class="flex items-center gap-2">
      <span class="text-primary" aria-hidden="true">
        <LucideIcon name={FINANCEIRO_EXPENSES_LUCIDE_ICON} size="lg" />
      </span>
      <h2 class="card-title text-lg">Despesas do mês</h2>
    </div>
    <EmptyStateCallout
      {...NO_BUDGET_PROFILE_EMPTY_STATE}
      card={false}
      testId="financeiro-despesas-sem-perfil"
    />
  </PageSection>
{:else if loading && !initialized}
  <span class="loading loading-spinner loading-md"></span>
{:else}
  <PageSection testId="financeiro-despesas-heading">
  <div class="flex flex-wrap items-start justify-between gap-3">
    <div class="flex items-center gap-2">
      <span class="text-primary" aria-hidden="true">
        <LucideIcon name={FINANCEIRO_EXPENSES_LUCIDE_ICON} size="lg" />
      </span>
      <h2 class="card-title text-lg">Despesas do mês</h2>
    </div>

    <div
      class="flex flex-wrap items-center gap-x-6 gap-y-1 rounded-box bg-base-200 px-4 py-2 text-sm"
      data-testid="budget-despesas-resumo"
    >
      <div class="text-right">
        <p class="text-xs text-base-content/60">Receitas</p>
        <p class="font-semibold tabular-nums text-success" data-testid="budget-resumo-receitas">
          {formatValue(incomeTotal)}
        </p>
      </div>
      <div class="text-right">
        <p class="text-xs text-base-content/60">Despesas</p>
        <p class="font-semibold tabular-nums text-error" data-testid="budget-resumo-despesas">
          {formatValue(expenseTotal)}
        </p>
      </div>
      <div class="text-right">
        <p class="text-xs text-base-content/60">Sobrando</p>
        <p
          class="font-semibold tabular-nums {remaining >= 0 ? 'text-success' : 'text-error'}"
          data-testid="budget-resumo-sobrando"
        >
          {formatValue(remaining)}
        </p>
      </div>
    </div>
  </div>

  <BudgetExpenseForm
    categories={snapshot?.categories ?? []}
    {tags}
    {saving}
    onSubmit={handleSubmit}
  />

  <BudgetExpenseList
    {expenses}
    recurringRules={activeRecurringRules}
    onEditExpense={startEditExpense}
    onDeleteExpense={requestDeleteExpense}
    onEditRecurring={(rule) => {
      editingRecurring = rule;
      editingExpense = null;
    }}
    onDeleteRecurring={requestDeleteRecurring}
  />
  </PageSection>

  <BudgetExpenseEditModal
    open={editModalOpen}
    categories={snapshot?.categories ?? []}
    {tags}
    editing={editingExpense}
    {editingRecurring}
    {saving}
    onSubmit={handleSubmit}
    onClose={cancelEdit}
  />

  <BudgetExpenseDeleteConfirmModal
    open={deleteModalOpen}
    target={pendingDelete}
    {saving}
    onConfirm={confirmDelete}
    onClose={cancelDelete}
  />

{/if}
</div>


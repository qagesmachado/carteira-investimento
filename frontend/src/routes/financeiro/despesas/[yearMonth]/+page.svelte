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
  import BudgetExpenseDeleteConfirmModal from '$lib/features/financeiro/BudgetExpenseDeleteConfirmModal.svelte';
  import BudgetExpenseEditModal from '$lib/features/financeiro/BudgetExpenseEditModal.svelte';
  import BudgetExpenseForm from '$lib/features/financeiro/BudgetExpenseForm.svelte';
  import BudgetExpenseList from '$lib/features/financeiro/BudgetExpenseList.svelte';
  import PageSection from '$lib/components/PageSection.svelte';
  import type {
    BudgetExpenseDeleteAction,
    BudgetExpenseDeleteTarget
  } from '$lib/features/financeiro/budgetExpenseDelete';
  import { listMonthExpenses } from '$lib/features/financeiro/budgetExpenseRows';
  import { getBudgetLayoutContext } from '$lib/features/financeiro/budgetLayoutContext';
  import { formatBrl } from '$lib/features/rebalance/allocationTargets';
  import { hideMoneyValues } from '$lib/stores/hideMoneyValues';

  const ctx = getBudgetLayoutContext();
  const { activeProfileId, yearMonth: yearMonthStore } = ctx;

  let snapshot: BudgetMonthSnapshot | null = null;
  let recurringRules: BudgetRecurringExpense[] = [];
  let tags: BudgetTag[] = [];
  let loading = true;
  let saving = false;
  let error = '';
  let editingExpense: BudgetTransaction | null = null;
  let editingRecurring: BudgetRecurringExpense | null = null;
  let pendingDelete: BudgetExpenseDeleteTarget | null = null;

  $: profileId = $activeProfileId;
  $: yearMonth = $page.params.yearMonth ?? $yearMonthStore;
  $: expenses = listMonthExpenses(snapshot?.transactions ?? []);
  $: expenseTotal = snapshot?.expense_total_brl ?? 0;
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
{#if profileId == null}
  <p class="text-base-content/70">Crie um perfil de orçamento em Perfis para começar.</p>
{:else if loading}
  <span class="loading loading-spinner loading-md"></span>
{:else}
  <PageSection title="Despesas do mês" testId="financeiro-despesas-heading">
  {#if error}
    <div class="alert alert-error">{error}</div>
  {/if}

  <p class="font-medium" data-testid="budget-expense-total">
    Total de despesas: {formatValue(expenseTotal)}
  </p>

  <BudgetExpenseForm
    categories={snapshot?.categories ?? []}
    {tags}
    {saving}
    onSubmit={handleSubmit}
  />

  <BudgetExpenseList
    {expenses}
    {recurringRules}
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


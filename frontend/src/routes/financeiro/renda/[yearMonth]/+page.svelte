<script lang="ts">
  import { page } from '$app/stores';

  import {
    copyPreviousMonthIncomes,
    createMonthIncome,
    deleteIncomeSource,
    deleteMonthIncome,
    getMonthSnapshot,
    stopRecurringIncomeFromMonth,
    updateMonthIncome,
    type BudgetMonthIncomeItem,
    type BudgetMonthSnapshot
  } from '$lib/api/budget';
  import { parseApiError } from '$lib/api/parseApiError';
  import DismissibleAlert from '$lib/components/DismissibleAlert.svelte';
  import EmptyStateCallout from '$lib/components/EmptyStateCallout.svelte';
  import LucideIcon from '$lib/components/LucideIcon.svelte';
  import { NO_BUDGET_PROFILE_EMPTY_STATE } from '$lib/features/onboarding/emptyStateCopy';
  import BudgetIncomeCopyConfirmModal from '$lib/features/financeiro/BudgetIncomeCopyConfirmModal.svelte';
  import BudgetIncomeDeleteConfirmModal from '$lib/features/financeiro/BudgetIncomeDeleteConfirmModal.svelte';
  import BudgetIncomeEditModal from '$lib/features/financeiro/BudgetIncomeEditModal.svelte';
  import BudgetIncomeForm from '$lib/features/financeiro/BudgetIncomeForm.svelte';
  import BudgetIncomeList from '$lib/features/financeiro/BudgetIncomeList.svelte';
  import PageSection from '$lib/components/PageSection.svelte';
  import { FINANCEIRO_INCOME_LUCIDE_ICON } from '$lib/icons/lucideIconCatalog';
  import type {
    BudgetIncomeDeleteAction,
    BudgetIncomeDeleteTarget
  } from '$lib/features/financeiro/budgetIncomeDelete';
  import {
    buildIncomeCopyDiff,
    type BudgetIncomeCopyDiff
  } from '$lib/features/financeiro/budgetIncomeCopyDiff';
  import { shiftYearMonth } from '$lib/features/financeiro/budgetMonth';
  import { getBudgetLayoutContext } from '$lib/features/financeiro/budgetLayoutContext';
  import { formatBrl } from '$lib/features/rebalance/allocationTargets';

  const ctx = getBudgetLayoutContext();
  const { activeProfileId, yearMonth: yearMonthStore } = ctx;

  let snapshot: BudgetMonthSnapshot | null = null;
  let loading = true;
  let saving = false;
  let error = '';
  let message = '';
  let editingIncome: BudgetMonthIncomeItem | null = null;
  let pendingDelete: BudgetIncomeDeleteTarget | null = null;
  let copyModalOpen = false;
  let copyPreviewLoading = false;
  let copyDiff: BudgetIncomeCopyDiff | null = null;

  $: profileId = $activeProfileId;
  $: yearMonth = $page.params.yearMonth ?? $yearMonthStore;
  $: incomes = snapshot?.incomes ?? [];
  $: incomeTotal = snapshot?.income_total_brl ?? 0;
  $: deleteModalOpen = pendingDelete != null;
  $: editModalOpen = editingIncome != null;

  $: if (yearMonth && yearMonth !== $yearMonthStore) {
    yearMonthStore.set(yearMonth);
  }

  async function loadPage() {
    if (profileId == null) {
      snapshot = null;
      loading = false;
      return;
    }
    loading = true;
    error = '';
    try {
      snapshot = await getMonthSnapshot(profileId, yearMonth, 'incomes');
    } catch (err) {
      snapshot = null;
      error = parseApiError(err, 'Não foi possível carregar a renda.');
    } finally {
      loading = false;
    }
  }

  $: if (profileId != null && yearMonth) {
    void loadPage();
  }

  function cancelEdit() {
    editingIncome = null;
  }

  async function handleCreate(payload: {
    label: string;
    amount_brl: number;
    recurring_12_months: boolean;
  }) {
    if (profileId == null) {
      return;
    }
    saving = true;
    error = '';
    try {
      snapshot = await createMonthIncome(profileId, yearMonth, payload);
      message = 'Renda salva.';
    } catch (err) {
      error = parseApiError(err, 'Não foi possível salvar a renda.');
    } finally {
      saving = false;
    }
  }

  async function handleUpdate(payload: {
    label: string;
    amount_brl: number;
    recurring_12_months: boolean;
  }) {
    if (profileId == null || editingIncome?.id == null) {
      return;
    }
    saving = true;
    error = '';
    try {
      snapshot = await updateMonthIncome(profileId, yearMonth, editingIncome.id, {
        label: payload.label,
        amount_brl: payload.amount_brl
      });
      editingIncome = null;
      message = 'Renda atualizada.';
    } catch (err) {
      error = parseApiError(err, 'Não foi possível salvar a renda.');
    } finally {
      saving = false;
    }
  }

  function requestDelete(income: BudgetMonthIncomeItem) {
    if (income.recurring && income.source_id != null) {
      pendingDelete = {
        kind: 'recurring',
        sourceId: income.source_id,
        label: income.label,
        amount_brl: income.amount_brl,
        fromYearMonth: yearMonth
      };
      return;
    }
    pendingDelete = { kind: 'pontual', income };
  }

  function cancelDelete() {
    pendingDelete = null;
  }

  async function confirmDelete(action: BudgetIncomeDeleteAction) {
    if (pendingDelete == null || profileId == null) {
      return;
    }
    saving = true;
    error = '';
    try {
      if (pendingDelete.kind === 'pontual') {
        if (pendingDelete.income.id == null) {
          return;
        }
        snapshot = await deleteMonthIncome(profileId, yearMonth, pendingDelete.income.id);
        if (editingIncome?.id === pendingDelete.income.id) {
          editingIncome = null;
        }
      } else if (action === 'stop-from-month') {
        await stopRecurringIncomeFromMonth(
          profileId,
          pendingDelete.sourceId,
          pendingDelete.fromYearMonth
        );
        if (editingIncome?.source_id === pendingDelete.sourceId) {
          editingIncome = null;
        }
        await loadPage();
      } else {
        await deleteIncomeSource(profileId, pendingDelete.sourceId);
        if (editingIncome?.source_id === pendingDelete.sourceId) {
          editingIncome = null;
        }
        await loadPage();
      }
      pendingDelete = null;
      message = 'Renda excluída.';
    } catch (err) {
      error = parseApiError(err, 'Não foi possível excluir a renda.');
    } finally {
      saving = false;
    }
  }

  async function openCopyPreviousModal() {
    if (profileId == null) {
      return;
    }
    copyModalOpen = true;
    copyPreviewLoading = true;
    copyDiff = null;
    error = '';
    try {
      const previousYearMonth = shiftYearMonth(yearMonth, -1);
      const previousSnapshot = await getMonthSnapshot(profileId, previousYearMonth, 'incomes');
      copyDiff = buildIncomeCopyDiff(incomes, previousSnapshot.incomes, previousYearMonth);
    } catch (err) {
      copyModalOpen = false;
      error = parseApiError(err, 'Não foi possível carregar a renda do mês anterior.');
    } finally {
      copyPreviewLoading = false;
    }
  }

  function cancelCopyPrevious() {
    copyModalOpen = false;
    copyDiff = null;
    copyPreviewLoading = false;
  }

  async function confirmCopyPrevious() {
    if (profileId == null) {
      return;
    }
    saving = true;
    error = '';
    try {
      snapshot = await copyPreviousMonthIncomes(profileId, yearMonth);
      editingIncome = null;
      copyModalOpen = false;
      copyDiff = null;
      message = 'Renda do mês anterior copiada.';
    } catch (err) {
      error = parseApiError(err, 'Não foi possível copiar a renda do mês anterior.');
    } finally {
      saving = false;
    }
  }
</script>

<svelte:head>
  <title>Renda — Financeiro</title>
</svelte:head>

<div class="flex flex-col gap-3">
{#if error}
  <DismissibleAlert text={error} variant="error" on:dismiss={() => (error = '')} />
{/if}
{#if message}
  <DismissibleAlert text={message} variant="success" on:dismiss={() => (message = '')} />
{/if}
{#if profileId == null}
  <PageSection testId="financeiro-renda-heading">
    <div class="flex items-center gap-2">
      <span class="text-primary" aria-hidden="true">
        <LucideIcon name={FINANCEIRO_INCOME_LUCIDE_ICON} size="lg" />
      </span>
      <h2 class="card-title text-lg">Renda do mês</h2>
    </div>
    <EmptyStateCallout
      {...NO_BUDGET_PROFILE_EMPTY_STATE}
      card={false}
      testId="financeiro-renda-sem-perfil"
    />
  </PageSection>
{:else if loading}
  <span class="loading loading-spinner loading-md"></span>
{:else}
  <PageSection testId="financeiro-renda-heading">
  <div class="flex items-center gap-2">
    <span class="text-primary" aria-hidden="true">
      <LucideIcon name={FINANCEIRO_INCOME_LUCIDE_ICON} size="lg" />
    </span>
    <h2 class="card-title text-lg">Renda do mês</h2>
  </div>

  <div class="flex flex-wrap items-center justify-between gap-2">
    <p class="font-medium" data-testid="budget-income-total">Total do mês: {formatBrl(incomeTotal)}</p>
    <button
      type="button"
      class="btn btn-outline btn-sm gap-1.5"
      data-testid="budget-copy-previous-incomes"
      disabled={saving || copyPreviewLoading}
      on:click={openCopyPreviousModal}
    >
      <LucideIcon name="Copy" size="sm" aria-hidden="true" />
      Copiar mês anterior
    </button>
  </div>

  <BudgetIncomeForm {saving} onSubmit={handleCreate} />

  <BudgetIncomeList
    {incomes}
    onEdit={(income) => {
      editingIncome = income;
    }}
    onDelete={requestDelete}
  />
  </PageSection>

  <BudgetIncomeEditModal
    open={editModalOpen}
    editing={editingIncome}
    {saving}
    onSubmit={handleUpdate}
    onClose={cancelEdit}
  />

  <BudgetIncomeDeleteConfirmModal
    open={deleteModalOpen}
    target={pendingDelete}
    {saving}
    onConfirm={confirmDelete}
    onClose={cancelDelete}
  />

  <BudgetIncomeCopyConfirmModal
    open={copyModalOpen}
    diff={copyDiff}
    loadingPreview={copyPreviewLoading}
    {saving}
    onConfirm={confirmCopyPrevious}
    onClose={cancelCopyPrevious}
  />

{/if}
</div>

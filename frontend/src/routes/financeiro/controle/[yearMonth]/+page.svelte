<script lang="ts">
  import { page } from '$app/stores';

  import {
    getMonthSnapshot,
    updateMonthIncome,
    updateTransaction,
    type BudgetMonthSnapshot
  } from '$lib/api/budget';
  import { parseApiError } from '$lib/api/parseApiError';
  import DismissibleAlert from '$lib/components/DismissibleAlert.svelte';
  import EmptyStateCallout from '$lib/components/EmptyStateCallout.svelte';
  import LucideIcon from '$lib/components/LucideIcon.svelte';
  import PageSection from '$lib/components/PageSection.svelte';
  import BudgetSettlementPanel from '$lib/features/financeiro/BudgetSettlementPanel.svelte';
  import { summarizeSettlement } from '$lib/features/financeiro/budgetSettlement';
  import { getBudgetLayoutContext } from '$lib/features/financeiro/budgetLayoutContext';
  import { NO_BUDGET_PROFILE_EMPTY_STATE } from '$lib/features/onboarding/emptyStateCopy';
  import { FINANCEIRO_CONTROLE_LUCIDE_ICON } from '$lib/icons/lucideIconCatalog';

  const ctx = getBudgetLayoutContext();
  const { activeProfileId, yearMonth: yearMonthStore } = ctx;

  let snapshot: BudgetMonthSnapshot | null = null;
  let loading = true;
  let saving = false;
  let error = '';

  $: profileId = $activeProfileId;
  $: yearMonth = $page.params.yearMonth ?? $yearMonthStore;
  $: incomeItems = (snapshot?.incomes ?? []).map((item) => ({
    id: item.id ?? 0,
    label: item.label,
    amount_brl: item.amount_brl,
    event_date: null as string | null,
    done: Boolean(item.received)
  }));
  $: expenseItems = (snapshot?.transactions ?? []).map((item) => ({
    id: item.id,
    label: item.description,
    amount_brl: item.amount_brl,
    event_date: item.event_date,
    done: Boolean(item.settled)
  }));
  $: incomeSummary = summarizeSettlement(incomeItems);
  $: expenseSummary = summarizeSettlement(expenseItems);

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
      snapshot = await getMonthSnapshot(profileId, yearMonth, 'settlement');
    } catch (err) {
      snapshot = null;
      error = parseApiError(err, 'Não foi possível carregar o controle do mês.');
    } finally {
      loading = false;
    }
  }

  $: if (profileId != null && yearMonth) {
    void loadPage();
  }

  async function toggleIncomeReceived(id: number, received: boolean) {
    if (profileId == null) {
      return;
    }
    saving = true;
    error = '';
    try {
      snapshot = await updateMonthIncome(profileId, yearMonth, id, { received });
    } catch (err) {
      error = parseApiError(err, 'Não foi possível atualizar o status da renda.');
      await loadPage();
    } finally {
      saving = false;
    }
  }

  async function toggleExpenseSettled(id: number, settled: boolean) {
    if (profileId == null || snapshot == null) {
      return;
    }
    saving = true;
    error = '';
    try {
      const updated = await updateTransaction(profileId, id, { settled });
      snapshot = {
        ...snapshot,
        transactions: snapshot.transactions.map((tx) => (tx.id === id ? updated : tx))
      };
    } catch (err) {
      error = parseApiError(err, 'Não foi possível atualizar o status da despesa.');
      await loadPage();
    } finally {
      saving = false;
    }
  }
</script>

<svelte:head>
  <title>Controle — Financeiro</title>
</svelte:head>

<div class="flex flex-col gap-3">
  {#if error}
    <DismissibleAlert text={error} variant="error" on:dismiss={() => (error = '')} />
  {/if}
  {#if profileId == null}
    <PageSection testId="financeiro-controle-heading">
      <div class="flex items-center gap-2">
        <span class="text-primary" aria-hidden="true">
          <LucideIcon name={FINANCEIRO_CONTROLE_LUCIDE_ICON} size="lg" />
        </span>
        <h2 class="card-title text-lg">Controle do mês</h2>
      </div>
      <EmptyStateCallout
        {...NO_BUDGET_PROFILE_EMPTY_STATE}
        card={false}
        testId="financeiro-controle-sem-perfil"
      />
    </PageSection>
  {:else if loading}
    <span class="loading loading-spinner loading-md"></span>
  {:else}
    <PageSection testId="financeiro-controle-heading">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <span class="text-primary" aria-hidden="true">
            <LucideIcon name={FINANCEIRO_CONTROLE_LUCIDE_ICON} size="lg" />
          </span>
          <h2 class="card-title text-lg">Controle do mês</h2>
        </div>
        <p class="text-sm opacity-70" data-testid="budget-settlement-header-summary">
          {incomeSummary.doneCount} de {incomeSummary.totalCount} recebidos ·
          {expenseSummary.doneCount} de {expenseSummary.totalCount} pagos
        </p>
      </div>

      <div class="mt-4 grid gap-4 lg:grid-cols-2">
        <BudgetSettlementPanel
          title="Rendas recorrentes"
          testIdPrefix="budget-settlement-income"
          emptyMessage="Nenhuma renda recorrente neste mês. Cadastre em Renda com «Recorrente (12 meses)»."
          checkboxLabel="Recebido"
          items={incomeItems}
          {saving}
          onToggle={toggleIncomeReceived}
        />
        <BudgetSettlementPanel
          title="Despesas recorrentes"
          testIdPrefix="budget-settlement-expense"
          emptyMessage="Nenhuma despesa recorrente neste mês. Cadastre em Despesas com «Despesa recorrente»."
          checkboxLabel="Pago"
          items={expenseItems}
          {saving}
          onToggle={toggleExpenseSettled}
        />
      </div>
    </PageSection>
  {/if}
</div>

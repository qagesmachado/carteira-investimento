<script lang="ts">
  import { page } from '$app/stores';

  import {
    deleteTransaction,
    getMonthSnapshot,
    type BudgetMonthSnapshot
  } from '$lib/api/budget';
  import { parseApiError } from '$lib/api/parseApiError';
  import BudgetCategoryCard from '$lib/features/financeiro/BudgetCategoryCard.svelte';
  import { getBudgetLayoutContext } from '$lib/features/financeiro/budgetLayoutContext';
  import { formatIsoDateToBr } from '$lib/brDate';
  import { formatBrl } from '$lib/features/rebalance/allocationTargets';
  import { hideMoneyValues } from '$lib/stores/hideMoneyValues';

  const ctx = getBudgetLayoutContext();
  const { activeProfileId, yearMonth: yearMonthStore } = ctx;

  let snapshot: BudgetMonthSnapshot | null = null;
  let loading = true;
  let error = '';
  let expandedCategoryId: number | null = null;

  $: profileId = $activeProfileId;
  $: yearMonth = $page.params.yearMonth ?? $yearMonthStore;

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
      snapshot = await getMonthSnapshot(profileId, yearMonth);
    } catch (err) {
      snapshot = null;
      error = parseApiError(err, 'Não foi possível carregar o orçamento.');
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

  async function handleDeleteExpense(transactionId: number) {
    if (profileId == null) {
      return;
    }
    try {
      await deleteTransaction(profileId, transactionId);
      await loadPage();
    } catch (err) {
      error = parseApiError(err, 'Não foi possível excluir a despesa.');
    }
  }
</script>

<svelte:head>
  <title>Orçamento — Financeiro</title>
</svelte:head>

<h2 class="text-xl font-semibold" data-testid="financeiro-orcamento-heading">Orçamento do mês</h2>

{#if profileId == null}
  <p class="text-base-content/70">Crie um perfil de orçamento em Perfis para começar.</p>
{:else if loading}
  <span class="loading loading-spinner loading-md"></span>
{:else if error}
  <div class="alert alert-error">{error}</div>
{:else if snapshot}
  <div class="grid gap-2 sm:grid-cols-3">
    <div class="stat rounded-box bg-base-100 shadow">
      <div class="stat-title">Sua renda</div>
      <div class="stat-value text-lg">{formatValue(snapshot.income_total_brl)}</div>
    </div>
    <div class="stat rounded-box bg-base-100 shadow">
      <div class="stat-title">Gastos do mês</div>
      <div class="stat-value text-lg text-error">{formatValue(snapshot.expense_total_brl)}</div>
      <div class="stat-desc">
        {snapshot.income_usage_percent.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}% da renda
      </div>
    </div>
    <div class="stat rounded-box bg-base-100 shadow">
      <div class="stat-title">Saldo restante</div>
      <div class="stat-value text-lg {snapshot.remaining_brl >= 0 ? 'text-success' : 'text-error'}">
        {formatValue(snapshot.remaining_brl)}
      </div>
    </div>
  </div>

  <h3 class="text-lg font-medium">Metas financeiras</h3>
  <div class="grid gap-2 lg:grid-cols-2">
    {#each snapshot.categories as category (category.category_id)}
      <BudgetCategoryCard
        {category}
        transactions={snapshot.transactions}
        expanded={expandedCategoryId === category.category_id}
        on:toggle={(event) => {
          expandedCategoryId = expandedCategoryId === event.detail ? null : event.detail;
        }}
        on:delete={(event) => void handleDeleteExpense(event.detail)}
      />
    {/each}
  </div>

  <section class="card bg-base-100 shadow">
    <div class="card-body">
      <h3 class="card-title text-base">Transações recentes</h3>
      <ul class="divide-y">
        {#each snapshot.transactions as tx (tx.id)}
          <li class="flex flex-wrap items-center gap-2 py-2 text-sm">
            <span>{formatIsoDateToBr(tx.event_date)}</span>
            <span class="flex-1">{tx.description}</span>
            {#if tx.tag_name}
              <span class="badge badge-sm">{tx.tag_name}</span>
            {/if}
            {#if tx.category_name}
              <span class="text-base-content/70">{tx.category_name}</span>
            {/if}
            <span class="font-medium tabular-nums {tx.transaction_type === 'expense' ? 'text-error' : 'text-success'}">
              {formatValue(tx.amount_brl)}
            </span>
          </li>
        {/each}
      </ul>
    </div>
  </section>
{/if}

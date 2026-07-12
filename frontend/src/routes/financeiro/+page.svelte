<script lang="ts">
  import { getBudgetDashboard, type BudgetDashboard } from '$lib/api/budget';
  import { parseApiError } from '$lib/api/parseApiError';
  import BrYearMonthInput from '$lib/components/BrYearMonthInput.svelte';
  import PageSection from '$lib/components/PageSection.svelte';
  import BudgetCashflowChart from '$lib/features/financeiro/BudgetCashflowChart.svelte';
  import BudgetDistributionChart from '$lib/features/financeiro/BudgetDistributionChart.svelte';
  import { getBudgetLayoutContext } from '$lib/features/financeiro/budgetLayoutContext';
  import {
    compareYearMonths,
    shiftYearMonth
  } from '$lib/features/financeiro/budgetMonth';
  import { formatBrl } from '$lib/features/rebalance/allocationTargets';
  import { hideMoneyValues } from '$lib/stores/hideMoneyValues';

  const ctx = getBudgetLayoutContext();
  const { activeProfileId, yearMonth: yearMonthStore } = ctx;

  type PeriodMode = 3 | 6 | 'custom';

  let periodMode: PeriodMode = 3;
  let customFrom = '';
  let customTo = '';
  let dashboard: BudgetDashboard | null = null;
  let loading = true;
  let error = '';
  let rangeError = '';

  $: profileId = $activeProfileId;
  $: focusMonth = $yearMonthStore;

  $: if (focusMonth && !customFrom && !customTo) {
    customFrom = shiftYearMonth(focusMonth, -3);
    customTo = shiftYearMonth(focusMonth, 3);
  }

  async function loadDashboard(
    profile: number | null,
    mode: PeriodMode,
    focus: string,
    fromYm: string,
    toYm: string
  ) {
    if (profile == null || !focus) {
      dashboard = null;
      loading = false;
      return;
    }
    if (mode === 'custom') {
      if (!fromYm || !toYm) {
        return;
      }
      if (compareYearMonths(fromYm, toYm) > 0) {
        rangeError = 'O mês inicial deve ser anterior ou igual ao mês final.';
        return;
      }
      rangeError = '';
    } else {
      rangeError = '';
    }

    loading = true;
    error = '';
    try {
      if (mode === 'custom') {
        dashboard = await getBudgetDashboard(profile, focus, {
          fromYearMonth: fromYm,
          toYearMonth: toYm
        });
      } else {
        dashboard = await getBudgetDashboard(profile, focus, {
          months: mode,
          forwardMonths: mode
        });
      }
    } catch (err) {
      dashboard = null;
      error = parseApiError(err, 'Não foi possível carregar o painel.');
    } finally {
      loading = false;
    }
  }

  $: void loadDashboard(profileId, periodMode, focusMonth, customFrom, customTo);

  function setPreset(option: 3 | 6) {
    periodMode = option;
  }

  function setCustomMode() {
    if (focusMonth) {
      if (!customFrom) {
        customFrom = shiftYearMonth(focusMonth, -3);
      }
      if (!customTo) {
        customTo = shiftYearMonth(focusMonth, 3);
      }
    }
    periodMode = 'custom';
  }

  function formatValue(value: number): string {
    if ($hideMoneyValues) {
      return 'R$ ••••••';
    }
    return formatBrl(value);
  }
</script>

<svelte:head>
  <title>Painel — Financeiro</title>
</svelte:head>

<div class="flex flex-col gap-3">
{#if profileId == null}
  <p class="text-base-content/70">Crie um perfil de orçamento em Perfis para começar.</p>
{:else if error}
  <div class="alert alert-error">{error}</div>
{:else}
  <PageSection title="Painel financeiro" testId="financeiro-painel-heading">
  <div class="flex flex-wrap items-end gap-3">
    <div class="flex flex-wrap gap-2">
      {#each [3, 6] as option}
        <button
          type="button"
          class="btn btn-sm {periodMode === option ? 'btn-primary' : 'btn-outline'}"
          data-testid="budget-dashboard-months-{option}"
          on:click={() => setPreset(option)}
        >
          {option}M
        </button>
      {/each}
      <button
        type="button"
        class="btn btn-sm {periodMode === 'custom' ? 'btn-primary' : 'btn-outline'}"
        data-testid="budget-dashboard-months-custom"
        on:click={setCustomMode}
      >
        Personalizado
      </button>
    </div>
    {#if periodMode === 'custom'}
      <div class="flex flex-wrap items-end gap-3" data-testid="budget-dashboard-custom-range">
        <BrYearMonthInput
          bind:value={customFrom}
          legend="Mês inicial"
          showFieldLabels={false}
          testId="budget-dashboard-from"
        />
        <BrYearMonthInput
          bind:value={customTo}
          legend="Mês final"
          showFieldLabels={false}
          testId="budget-dashboard-to"
        />
      </div>
    {/if}
  </div>
  {#if rangeError}
    <p class="text-sm text-error" data-testid="budget-dashboard-range-error">{rangeError}</p>
  {/if}
  </PageSection>

  {#if loading && !dashboard}
    <span class="loading loading-spinner loading-md"></span>
  {:else if dashboard}
    <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      <div class="stat rounded-box bg-base-100 shadow">
        <div class="stat-title">Resultado</div>
        <div class="stat-value text-lg {dashboard.result_brl >= 0 ? 'text-success' : 'text-error'}">
          {formatValue(dashboard.result_brl)}
        </div>
      </div>
      <div class="stat rounded-box bg-base-100 shadow">
        <div class="stat-title">Receitas</div>
        <div class="stat-value text-lg text-success">{formatValue(dashboard.income_brl)}</div>
      </div>
      <div class="stat rounded-box bg-base-100 shadow">
        <div class="stat-title">Despesas</div>
        <div class="stat-value text-lg text-error">{formatValue(dashboard.expense_brl)}</div>
      </div>
      <div class="stat rounded-box bg-base-100 shadow">
        <div class="stat-title">Saldo</div>
        <div class="stat-value text-lg">{formatValue(dashboard.balance_brl)}</div>
      </div>
    </div>

    <BudgetCashflowChart timeline={dashboard.timeline} />

    <div class="grid gap-2 lg:grid-cols-2">
      <BudgetDistributionChart
        title="Transações por tags"
        slices={dashboard.expenses_by_tag}
        expandable
        testId="budget-dashboard-tags-chart"
      />
      <BudgetDistributionChart
        title="Despesas por metas"
        slices={dashboard.expenses_by_category}
        expandable
        testId="budget-dashboard-categories-chart"
      />
    </div>
  {/if}
{/if}
</div>

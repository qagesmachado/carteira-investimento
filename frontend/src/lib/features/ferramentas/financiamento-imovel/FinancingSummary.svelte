<script lang="ts">
  import type { PropertyFinancingSnapshot } from '$lib/api/propertyFinancings';
  import { formatBrl } from '$lib/features/rebalance/allocationTargets';
  import { createEventDispatcher } from 'svelte';

  import FinancingCashflowChart from './FinancingCashflowChart.svelte';
  import { formatPropertyType } from './propertyTypeLabels';

  export let snapshot: PropertyFinancingSnapshot;

  const dispatch = createEventDispatcher<{ selectFinancing: number }>();

  $: metrics = snapshot.consolidated.metrics;
  $: financings = snapshot.financings;
</script>

<section class="rounded-box bg-base-100 p-4 shadow-sm" data-testid="financing-summary">
  <h2 class="text-lg font-semibold">Resumo dos financiamentos</h2>
  <p class="mb-4 text-sm opacity-70">
    Receitas, despesas e lucro consolidados da carteira.
  </p>

  <div class="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
    <div class="rounded-lg border border-base-300 p-3">
      <p class="text-xs uppercase opacity-60">Total recebido</p>
      <p class="text-xl font-semibold text-success" data-testid="summary-total-income">
        {formatBrl(metrics.total_income_brl)}
      </p>
    </div>
    <div class="rounded-lg border border-base-300 p-3">
      <p class="text-xs uppercase opacity-60">Capital investido total</p>
      <p class="text-xl font-semibold text-error" data-testid="summary-capital-invested">
        {formatBrl(metrics.capital_invested_brl)}
      </p>
    </div>
    <div class="rounded-lg border border-base-300 p-3">
      <p class="text-xs uppercase opacity-60">Lucro (receita − despesa)</p>
      <p
        class="text-xl font-semibold"
        data-testid="summary-profit"
        class:text-success={metrics.profit_brl >= 0}
        class:text-error={metrics.profit_brl < 0}
      >
        {formatBrl(metrics.profit_brl)}
      </p>
    </div>
    <div class="rounded-lg border border-base-300 p-3">
      <p class="text-xs uppercase opacity-60">Imóveis</p>
      <p class="text-xl font-semibold">{snapshot.consolidated.financing_count}</p>
    </div>
  </div>

  <h3 class="mb-2 font-medium">Por imóvel</h3>
  {#if financings.length === 0}
    <p class="text-sm opacity-70">
      Nenhum financiamento cadastrado. Use «+ Novo imóvel» para começar.
    </p>
  {:else}
    <div class="mb-6 overflow-x-auto">
      <table class="table table-sm">
        <thead>
          <tr>
            <th>Imóvel</th>
            <th>Tipo</th>
            <th>Receitas</th>
            <th>Despesas</th>
            <th>Lucro</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {#each financings as financing (financing.id)}
            <tr data-testid={`financing-summary-row-${financing.id}`}>
              <td>{financing.name}</td>
              <td>{formatPropertyType(financing.property_type)}</td>
              <td>{formatBrl(financing.metrics.total_income_brl)}</td>
              <td>{formatBrl(financing.metrics.total_expenses_brl)}</td>
              <td>{formatBrl(financing.metrics.profit_brl)}</td>
              <td>
                <button
                  type="button"
                  class="btn btn-xs btn-ghost"
                  data-testid={`financing-summary-open-${financing.id}`}
                  on:click={() => dispatch('selectFinancing', financing.id)}
                >
                  Abrir
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}

  <FinancingCashflowChart
    monthlyTimeline={snapshot.consolidated.monthly_timeline}
    annualTimeline={snapshot.consolidated.annual_timeline}
    title="Consolidado — receitas vs despesas"
  />
</section>

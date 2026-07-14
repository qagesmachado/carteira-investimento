<script lang="ts">
  import type { Portfolio, PortfolioSummary } from '$lib/api/portfolios';
  import { hideMoneyValues } from '$lib/stores/hideMoneyValues';
  import {
    formatPortfolioHubMetric,
    formatPortfolioHubProfit,
    profitValueClass
  } from '$lib/features/portfolios/portfolioHubMetrics';
  import PortfolioHubAllocationSummary from '$lib/features/portfolios/PortfolioHubAllocationSummary.svelte';

  export let portfolio: Portfolio;
  export let summary: PortfolioSummary | undefined = undefined;
  export let onEdit: () => void = () => undefined;
  export let onDelete: () => void = () => undefined;
  export let deleteLocked = false;

  $: metrics = {
    investedBrl: summary?.invested_brl ?? 0,
    currentBrl: summary?.current_brl ?? 0,
    profitBrl: summary?.profit_brl ?? 0,
    profitPct: summary?.profit_pct ?? null
  };

  function statusLabel(status: Portfolio['status']): string {
    if (status === 'simulation') return 'Simulação';
    if (status === 'archived') return 'Arquivada';
    return 'Ativa';
  }
</script>

<article
  class="card bg-base-100 shadow {summary?.is_active
    ? 'ring-2 ring-primary ring-offset-2 ring-offset-base-200'
    : ''}"
  data-testid="portfolio-detail-summary"
  data-portfolio-id={portfolio.id}
>
  <div class="card-body gap-4">
    {#if portfolio.status !== 'active'}
      <div class="flex flex-wrap items-start justify-end gap-2">
        <span class="badge badge-ghost">{statusLabel(portfolio.status)}</span>
      </div>
    {/if}

    <div class="grid gap-3 sm:grid-cols-3">
      <div>
        <p class="text-xs font-medium uppercase tracking-wide text-base-content/60">Total aplicado</p>
        <p class="text-lg font-semibold">
          {#if $hideMoneyValues}
            R$ ••••••
          {:else}
            {formatPortfolioHubMetric(metrics.investedBrl)}
          {/if}
        </p>
      </div>
      <div>
        <p class="text-xs font-medium uppercase tracking-wide text-base-content/60">Total atual</p>
        <p class="text-lg font-semibold">
          {#if $hideMoneyValues}
            R$ ••••••
          {:else}
            {formatPortfolioHubMetric(metrics.currentBrl)}
          {/if}
        </p>
      </div>
      <div>
        <p class="text-xs font-medium uppercase tracking-wide text-base-content/60">Lucro</p>
        <p class="text-lg font-semibold {profitValueClass(metrics.profitBrl)}">
          {#if $hideMoneyValues}
            R$ ••••••
          {:else}
            {formatPortfolioHubProfit(metrics)}
          {/if}
        </p>
      </div>
    </div>

    <PortfolioHubAllocationSummary
      allocationTargetsJson={portfolio.allocation_targets_json}
      variant="inlineMedium"
    />

    <div class="card-actions justify-between gap-2">
      <button
        class="btn btn-outline btn-error btn-sm"
        type="button"
        data-testid="portfolio-positions-delete"
        disabled={deleteLocked}
        title={deleteLocked ? 'Exclusão bloqueada nas configurações da carteira.' : undefined}
        aria-disabled={deleteLocked}
        on:click={onDelete}
      >
        Excluir
      </button>
      <button
        class="btn btn-outline btn-sm"
        type="button"
        data-testid="portfolio-detail-edit"
        on:click={onEdit}
      >
        Editar
      </button>
    </div>
  </div>
</article>

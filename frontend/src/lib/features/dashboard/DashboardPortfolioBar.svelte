<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  import type { Portfolio } from '$lib/api/portfolios';
  import PortfolioSelect from '$lib/features/portfolios/PortfolioSelect.svelte';

  import LucideIcon from '$lib/components/LucideIcon.svelte';
  import {
    DASHBOARD_PORTFOLIO_LUCIDE_ICON,
    DASHBOARD_QUOTES_LUCIDE_ICON
  } from '$lib/icons/lucideIconCatalog';

  import { formatDashboardFxBadge, formatDashboardQuotesBadge } from './formatDashboardFxBadge';

  export let portfolios: Portfolio[] = [];
  export let activeId: number | null = null;
  export let activePortfolioName = '';
  export let usdBrlRate: number | null = null;
  export let usdBrlRefreshedAt: string | null = null;
  export let quotesRefreshedAt: string | null = null;
  export let disabled = false;
  export let portfolioSelectTestId = 'dashboard-portfolio-select';

  const dispatch = createEventDispatcher<{ select: number }>();

  const statusPillClass =
    'flex w-full items-center justify-between gap-3 rounded-full border border-base-300 bg-base-100 px-3 py-2 text-sm text-base-content/80';

  const statusIconSlotClass = 'inline-flex h-6 w-6 shrink-0 items-center justify-center';

  $: fxBadge = formatDashboardFxBadge(usdBrlRate, usdBrlRefreshedAt);
  $: quotesBadge = formatDashboardQuotesBadge(quotesRefreshedAt);
  $: displayName = activePortfolioName.trim() || 'Nenhuma carteira';
</script>

<div
  class="flex flex-wrap items-center justify-between gap-4"
  data-testid="dashboard-portfolio-bar"
>
  <div class="flex min-w-0 flex-1 items-center gap-4">
    <div
      class="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"
      aria-hidden="true"
    >
      <LucideIcon name={DASHBOARD_PORTFOLIO_LUCIDE_ICON} size="2xl" />
    </div>

    <div class="min-w-0">
      <p class="text-sm text-base-content/60">Carteira</p>
      <div class="relative mt-0.5 inline-flex min-h-[1.75rem] min-w-[10rem] max-w-full items-center">
        <div class="pointer-events-none flex items-center gap-2 pr-1">
          <span class="truncate text-lg font-bold text-base-content">{displayName}</span>
          <svg
            class="h-4 w-4 shrink-0 text-base-content/50"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <PortfolioSelect
          {portfolios}
          {activeId}
          {disabled}
          selectClass="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          testId={portfolioSelectTestId}
          on:select={(event) => dispatch('select', event.detail)}
        />
      </div>
    </div>
  </div>

  <div class="inline-flex shrink-0 flex-col items-stretch gap-2" data-testid="dashboard-status-badges">
    <div class={statusPillClass} data-testid="dashboard-fx-badge">
      <span class={statusIconSlotClass} aria-hidden="true">
        <img
          src="/icons/dashboard/us-flag.svg"
          alt=""
          class="h-6 w-6 rounded-full"
        />
      </span>
      {#if fxBadge}
        <span class="whitespace-nowrap text-right">{fxBadge}</span>
      {:else}
        <span class="whitespace-nowrap text-right text-base-content/50">USD/BRL indisponível</span>
      {/if}
    </div>

    <div class={statusPillClass} data-testid="dashboard-quotes-badge">
      <span class="{statusIconSlotClass} text-base-content/70" aria-hidden="true">
        <LucideIcon name={DASHBOARD_QUOTES_LUCIDE_ICON} size="lg" />
      </span>
      {#if quotesBadge}
        <span class="whitespace-nowrap text-right">{quotesBadge}</span>
      {:else}
        <span class="whitespace-nowrap text-right text-base-content/50">Cotações indisponíveis</span>
      {/if}
    </div>
  </div>
</div>

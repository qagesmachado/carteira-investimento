<script lang="ts">
  import LucideIcon from '$lib/components/LucideIcon.svelte';
  import { formatMoneyAmount } from '$lib/assetLabels';
  import { formatTickerForDisplay } from '$lib/formatTickerForDisplay';
  import {
    TOP_ASSET_DIVIDENDS_TAB_LUCIDE_ICON,
    TOP_ASSET_GROSS_PROFIT_TAB_LUCIDE_ICON,
    TOP_ASSET_POSITION_VALUE_TAB_LUCIDE_ICON,
    TOP_ASSET_PROFIT_PERCENT_TAB_LUCIDE_ICON,
    TOP_ASSET_SEE_ALL_LUCIDE_ICON,
    type LucideIconName
  } from '$lib/icons/lucideIconCatalog';
  import { CONSOLIDADA_PATH } from '$lib/routes/appRoutes';

  import type { TopAssetDividendRow } from './dividendDashboard';
  import DashboardPatrimonyFilterCheckboxes from './DashboardPatrimonyFilterCheckboxes.svelte';
  import type { DashboardPatrimonyFilterAvailability } from './dashboardPatrimonyScope';
  import { hasDashboardPatrimonyFilterOptions } from './dashboardPatrimonyScope';
  import {
    displayClassIconFgClass,
    lucideIconForDisplayClass
  } from './displayClassLucideIcons';
  import TopAssetRankBadge from './TopAssetRankBadge.svelte';
  import {
    formatProfitPercentWithNominal,
    TOP_ASSET_METRIC_HEADERS,
    type TopAssetMetric,
    type TopAssetRow
  } from './topAssetsDashboard';

  export let profitPercentRows: TopAssetRow[] = [];
  export let positionValueRows: TopAssetRow[] = [];
  export let dividendRows: TopAssetDividendRow[] = [];
  export let grossProfitRows: TopAssetRow[] = [];
  export let filterAvailability: DashboardPatrimonyFilterAvailability = {
    hasNonInvestment: false,
    hasPension: false
  };

  let activeTab: TopAssetMetric = 'profit_percent';

  $: showPatrimonyFilters = hasDashboardPatrimonyFilterOptions(filterAvailability);

  const TABS: { id: TopAssetMetric; label: string; icon: LucideIconName }[] = [
    { id: 'profit_percent', label: 'Maior lucro (%)', icon: TOP_ASSET_PROFIT_PERCENT_TAB_LUCIDE_ICON },
    { id: 'position_value', label: 'Maior posição', icon: TOP_ASSET_POSITION_VALUE_TAB_LUCIDE_ICON },
    { id: 'dividends', label: 'Proventos (total)', icon: TOP_ASSET_DIVIDENDS_TAB_LUCIDE_ICON },
    { id: 'gross_profit', label: 'Retorno bruto', icon: TOP_ASSET_GROSS_PROFIT_TAB_LUCIDE_ICON }
  ];

  $: rowsForTab =
    activeTab === 'profit_percent'
      ? profitPercentRows
      : activeTab === 'position_value'
        ? positionValueRows
        : activeTab === 'gross_profit'
          ? grossProfitRows
          : [];

  $: hasAnyData =
    profitPercentRows.length > 0 ||
    positionValueRows.length > 0 ||
    dividendRows.length > 0 ||
    grossProfitRows.length > 0;

  $: metricHeader = TOP_ASSET_METRIC_HEADERS[activeTab];

  $: maxMetricValue =
    activeTab === 'dividends'
      ? Math.max(...dividendRows.map((row) => row.amountBrl), 0)
      : Math.max(...rowsForTab.map((row) => row.sortValue), 0);

  function formatPositionMetric(row: TopAssetRow): string {
    if (activeTab === 'profit_percent' && row.profitPercent != null) {
      return formatProfitPercentWithNominal(row.profitPercent, row.displayAmount, row.currency);
    }
    if (activeTab === 'gross_profit' && row.profitPercent != null) {
      return `${formatMoneyAmount(row.displayAmount, row.currency)} (${row.profitPercent.toLocaleString('pt-BR', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
      })}%)`;
    }
    return formatMoneyAmount(row.displayAmount, row.currency);
  }

  function formatDividendMetric(row: TopAssetDividendRow): string {
    return formatMoneyAmount(row.amountBrl, row.currency);
  }

  function metricBarPercent(value: number): number {
    if (maxMetricValue <= 0) {
      return 0;
    }
    return (value / maxMetricValue) * 100;
  }

  function metricBarClass(): string {
    return activeTab === 'dividends' ? 'bg-success' : 'bg-primary';
  }
</script>

<section class="card bg-base-100 shadow" aria-label="Top ativos" data-testid="dashboard-top-assets">
  <div class="card-body gap-4">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <h2 class="card-title text-lg">Top ativos</h2>
      {#if showPatrimonyFilters}
        <DashboardPatrimonyFilterCheckboxes {filterAvailability} compact />
      {/if}
    </div>

    <div class="tabs tabs-boxed w-fit" role="tablist" aria-label="Critérios de ranking">
      {#each TABS as tab}
        <button
          type="button"
          role="tab"
          class="tab tab-sm inline-flex items-center gap-1.5 {activeTab === tab.id ? 'tab-active' : ''}"
          aria-selected={activeTab === tab.id}
          data-testid="dashboard-top-tab-{tab.id}"
          on:click={() => (activeTab = tab.id)}
        >
          <LucideIcon name={tab.icon} size="sm" />
          <span>{tab.label}</span>
        </button>
      {/each}
    </div>

    {#if !hasAnyData}
      <p class="text-sm text-base-content/60">
        Sem dados para ranking. Cadastre posições com cotação ou proventos.
      </p>
    {:else if activeTab === 'dividends'}
      {#if dividendRows.length === 0}
        <p class="text-sm text-base-content/60">
          Nenhum provento cadastrado para os ativos desta carteira.
          <a class="link link-primary" href="/proventos">Cadastrar proventos</a>
        </p>
      {:else}
        <p class="text-xs text-base-content/60">Soma histórica de todos os proventos por ativo.</p>
        <div class="overflow-x-auto">
          <table class="table table-sm">
            <thead>
              <tr>
                <th class="w-12">#</th>
                <th>Ticker</th>
                <th>Nome do ativo</th>
                <th>Tipo</th>
                <th class="text-right">{metricHeader}</th>
              </tr>
            </thead>
            <tbody>
              {#each dividendRows as item, index}
                <tr>
                  <td>
                    <TopAssetRankBadge rank={index + 1} />
                  </td>
                  <td>
                    <span
                      class="inline-flex rounded-md bg-base-200 px-2 py-0.5 font-mono text-xs font-semibold"
                      data-testid="dashboard-top-ticker-{item.assetId}"
                    >
                      {formatTickerForDisplay(item.symbol)}
                    </span>
                  </td>
                  <td>{item.assetName}</td>
                  <td>
                    <span class="inline-flex items-center gap-1.5">
                      <LucideIcon
                        name={lucideIconForDisplayClass(item.displayClass)}
                        size="sm"
                        class={displayClassIconFgClass(item.displayClass)}
                      />
                      <span>{item.typeLabel}</span>
                    </span>
                  </td>
                  <td class="text-right">
                    <div class="flex flex-col items-end gap-1">
                      <span>{formatDividendMetric(item)}</span>
                      <div class="h-1.5 w-24 overflow-hidden rounded-full bg-base-200">
                        <div
                          class="h-full rounded-full {metricBarClass()}"
                          style="width: {metricBarPercent(item.amountBrl)}%"
                        ></div>
                      </div>
                    </div>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    {:else if rowsForTab.length === 0}
      <p class="text-sm text-base-content/60">Nenhum ativo com dados para este critério.</p>
    {:else}
      <div class="overflow-x-auto">
        <table class="table table-sm">
          <thead>
            <tr>
              <th class="w-12">#</th>
              <th>Ticker</th>
              <th>Nome do ativo</th>
              <th>Tipo</th>
              <th class="text-right">{metricHeader}</th>
            </tr>
          </thead>
          <tbody>
            {#each rowsForTab as item, index}
              <tr>
                <td>
                  <TopAssetRankBadge rank={index + 1} />
                </td>
                <td>
                  <span
                    class="inline-flex rounded-md bg-base-200 px-2 py-0.5 font-mono text-xs font-semibold"
                    data-testid="dashboard-top-ticker-{item.assetId}"
                  >
                    {formatTickerForDisplay(item.symbol)}
                  </span>
                </td>
                <td>{item.assetName}</td>
                <td>
                  <span class="inline-flex items-center gap-1.5">
                    <LucideIcon
                      name={lucideIconForDisplayClass(item.displayClass)}
                      size="sm"
                      class={displayClassIconFgClass(item.displayClass)}
                    />
                    <span>{item.typeLabel}</span>
                  </span>
                </td>
                <td class="text-right">
                  <div class="flex flex-col items-end gap-1">
                    <span>{formatPositionMetric(item)}</span>
                    <div class="h-1.5 w-24 overflow-hidden rounded-full bg-base-200">
                      <div
                        class="h-full rounded-full {metricBarClass()}"
                        style="width: {metricBarPercent(item.sortValue)}%"
                      ></div>
                    </div>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}

    <div class="text-center">
      <a
        class="btn btn-outline btn-sm gap-1.5"
        href={CONSOLIDADA_PATH}
        data-testid="dashboard-top-see-all"
      >
        <span>Ver todos os ativos</span>
        <LucideIcon name={TOP_ASSET_SEE_ALL_LUCIDE_ICON} size="sm" />
      </a>
    </div>
  </div>
</section>

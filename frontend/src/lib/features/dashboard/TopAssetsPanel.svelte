<script lang="ts">
  import { formatMoneyAmount } from '$lib/assetLabels';
  import { formatTickerForDisplay } from '$lib/formatTickerForDisplay';
  import type { DividendPayment } from '$lib/api/dividendPayments';

  import type { TopAssetDividendRow } from './dividendDashboard';
  import {
    formatProfitPercentWithNominal,
    TOP_ASSET_METRIC_HEADERS,
    type TopAssetMetric,
    type TopAssetRow,
    buildAssetMonthlyDividendAmounts,
    sparklinePointsFromAmounts,
    sparklinePolyline
  } from './topAssetsDashboard';

  export let profitPercentRows: TopAssetRow[] = [];
  export let positionValueRows: TopAssetRow[] = [];
  export let dividendRows: TopAssetDividendRow[] = [];
  export let grossProfitRows: TopAssetRow[] = [];
  export let dividendPayments: DividendPayment[] = [];

  let activeTab: TopAssetMetric = 'profit_percent';

  const TABS: { id: TopAssetMetric; label: string }[] = [
    { id: 'profit_percent', label: 'Maior lucro (%)' },
    { id: 'position_value', label: 'Maior posição' },
    { id: 'dividends', label: 'Proventos (total)' },
    { id: 'gross_profit', label: 'Retorno bruto' }
  ];

  const rankClass: Record<number, string> = {
    1: 'text-warning font-bold',
    2: 'text-base-content/70 font-semibold',
    3: 'text-accent font-semibold'
  };

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

  function sparklineForAsset(assetId: number): string {
    const amounts = buildAssetMonthlyDividendAmounts(dividendPayments, assetId);
    return sparklinePolyline(sparklinePointsFromAmounts(amounts));
  }
</script>

<section class="card bg-base-100 shadow" aria-label="Top ativos" data-testid="dashboard-top-assets">
  <div class="card-body gap-4">
    <h2 class="card-title text-lg">Top ativos</h2>

    <div class="tabs tabs-boxed w-fit" role="tablist" aria-label="Critérios de ranking">
      {#each TABS as tab}
        <button
          type="button"
          role="tab"
          class="tab tab-sm {activeTab === tab.id ? 'tab-active' : ''}"
          aria-selected={activeTab === tab.id}
          data-testid="dashboard-top-tab-{tab.id}"
          on:click={() => (activeTab = tab.id)}
        >
          {tab.label}
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
                <th class="w-10">#</th>
                <th>Ticker</th>
                <th>Nome do ativo</th>
                <th>Tipo</th>
                <th class="text-right">{metricHeader}</th>
                <th class="w-24">Evolução 12M</th>
              </tr>
            </thead>
            <tbody>
              {#each dividendRows as item, index}
                <tr>
                  <td class={rankClass[index + 1] ?? ''}>{index + 1}</td>
                  <td class="font-medium">{formatTickerForDisplay(item.symbol)}</td>
                  <td>{item.assetName}</td>
                  <td>{item.typeLabel}</td>
                  <td class="text-right">
                    <div class="flex flex-col items-end gap-1">
                      <span>{formatDividendMetric(item)}</span>
                      <div class="h-1.5 w-24 overflow-hidden rounded-full bg-base-200">
                        <div
                          class="h-full rounded-full bg-success"
                          style="width: {metricBarPercent(item.amountBrl)}%"
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <svg viewBox="0 0 72 24" class="h-6 w-full text-success" aria-hidden="true">
                      <polyline
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.5"
                        points={sparklineForAsset(item.assetId)}
                      />
                    </svg>
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
              <th class="w-10">#</th>
              <th>Ticker</th>
              <th>Nome do ativo</th>
              <th>Tipo</th>
              <th class="text-right">{metricHeader}</th>
              <th class="w-24">Evolução 12M</th>
            </tr>
          </thead>
          <tbody>
            {#each rowsForTab as item, index}
              <tr>
                <td class={rankClass[index + 1] ?? ''}>{index + 1}</td>
                <td class="font-medium">{formatTickerForDisplay(item.symbol)}</td>
                <td>{item.assetName}</td>
                <td>{item.typeLabel}</td>
                <td class="text-right">
                  <div class="flex flex-col items-end gap-1">
                    <span>{formatPositionMetric(item)}</span>
                    <div class="h-1.5 w-24 overflow-hidden rounded-full bg-base-200">
                      <div
                        class="h-full rounded-full bg-primary"
                        style="width: {metricBarPercent(item.sortValue)}%"
                      ></div>
                    </div>
                  </div>
                </td>
                <td>
                  <svg viewBox="0 0 72 24" class="h-6 w-full text-success" aria-hidden="true">
                    <polyline
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.5"
                      points={sparklineForAsset(item.assetId)}
                    />
                  </svg>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}

    <div class="text-center">
      <a class="link link-primary text-sm" href="/portfolios/consolidada" data-testid="dashboard-top-see-all">
        Ver todos os ativos →
      </a>
    </div>
  </div>
</section>

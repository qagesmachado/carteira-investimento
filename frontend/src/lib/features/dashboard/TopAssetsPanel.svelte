<script lang="ts">
  import { formatMoneyAmount } from '$lib/assetLabels';
  import { formatTickerForDisplay } from '$lib/formatTickerForDisplay';

  import type { TopAssetDividendRow } from './dividendDashboard';
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

  let activeTab: TopAssetMetric = 'profit_percent';

  const TABS: { id: TopAssetMetric; label: string }[] = [
    { id: 'profit_percent', label: 'Maior lucro (%)' },
    { id: 'position_value', label: 'Maior posição' },
    { id: 'dividends', label: 'Proventos (total)' },
    { id: 'gross_profit', label: 'Retorno bruto' }
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
</script>

<section class="card bg-base-100 shadow" aria-label="Top ativos">
  <div class="card-body gap-4">
    <h2 class="card-title text-lg">Top ativos</h2>

    <div class="tabs tabs-boxed w-fit" role="tablist" aria-label="Critérios de ranking">
      {#each TABS as tab}
        <button
          type="button"
          role="tab"
          class="tab tab-sm {activeTab === tab.id ? 'tab-active' : ''}"
          aria-selected={activeTab === tab.id}
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
                <th>Ticker</th>
                <th>Nome do ativo</th>
                <th>Tipo</th>
                <th class="text-right">{metricHeader}</th>
              </tr>
            </thead>
            <tbody>
              {#each dividendRows as item}
                <tr>
                  <td class="font-medium">{formatTickerForDisplay(item.symbol)}</td>
                  <td>{item.assetName}</td>
                  <td>{item.typeLabel}</td>
                  <td class="text-right">{formatDividendMetric(item)}</td>
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
              <th>Ticker</th>
              <th>Nome do ativo</th>
              <th>Tipo</th>
              <th class="text-right">{metricHeader}</th>
            </tr>
          </thead>
          <tbody>
            {#each rowsForTab as item}
              <tr>
                <td class="font-medium">{formatTickerForDisplay(item.symbol)}</td>
                <td>{item.assetName}</td>
                <td>{item.typeLabel}</td>
                <td class="text-right">{formatPositionMetric(item)}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</section>

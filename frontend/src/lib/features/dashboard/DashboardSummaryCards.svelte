<script lang="ts">
  import { formatMoneyAmount } from '$lib/assetLabels';

  import type { DashboardPatrimony } from './portfolioDashboard';
  import type { DividendAssetTotals } from '$lib/features/proventos/dividendSummary';
  import { formatDividendPaymentsTotalAmounts } from '$lib/features/proventos/dividendSummary';

  export let patrimony: DashboardPatrimony;
  export let dividendsMonth: DividendAssetTotals;
  export let dividendsYear: DividendAssetTotals;

  function formatProfitPercent(value: number | null): string {
    if (value == null) {
      return '—';
    }
    return `${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
  }
</script>

<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
  <div class="stat rounded-box bg-base-100 shadow">
    <div class="stat-title">Patrimônio total</div>
    <div class="stat-value text-primary text-2xl">
      {formatMoneyAmount(patrimony.currentBrl, 'BRL')}
    </div>
    <div class="stat-desc">Consolidado em reais</div>
  </div>

  <div class="stat rounded-box bg-base-100 shadow">
    <div class="stat-title">Valor investido</div>
    <div class="stat-value text-2xl">{formatMoneyAmount(patrimony.investedBrl, 'BRL')}</div>
  </div>

  <div class="stat rounded-box bg-base-100 shadow">
    <div class="stat-title">Lucro / prejuízo</div>
    <div
      class="stat-value text-2xl"
      class:text-success={patrimony.profitBrl >= 0}
      class:text-error={patrimony.profitBrl < 0}
    >
      {formatMoneyAmount(patrimony.profitBrl, 'BRL')}
    </div>
    <div class="stat-desc">{formatProfitPercent(patrimony.profitPercent)}</div>
  </div>

  <div class="stat rounded-box bg-base-100 shadow">
    <div class="stat-title">Proventos (mês)</div>
    <div class="stat-value text-2xl">
      {formatDividendPaymentsTotalAmounts(dividendsMonth) || 'R$ 0,00'}
    </div>
    <div class="stat-desc">
      {#if dividendsMonth.count === 0}
        <a class="link link-primary" href="/proventos">Cadastrar proventos</a>
      {:else}
        {dividendsMonth.count} lançamento(s)
      {/if}
    </div>
  </div>

  <div class="stat rounded-box bg-base-100 shadow">
    <div class="stat-title">Proventos (ano)</div>
    <div class="stat-value text-2xl">
      {formatDividendPaymentsTotalAmounts(dividendsYear) || 'R$ 0,00'}
    </div>
    <div class="stat-desc">{dividendsYear.count} lançamento(s) no ano</div>
  </div>

  <div class="stat rounded-box bg-base-100 shadow">
    <div class="stat-title">Posições ativas</div>
    <div class="stat-value text-2xl">{patrimony.activePositions}</div>
  </div>
</div>

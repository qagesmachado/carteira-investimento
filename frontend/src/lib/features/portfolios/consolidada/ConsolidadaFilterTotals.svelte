<script lang="ts">
  import { formatMoneyAmount } from '$lib/assetLabels';

  import ConsolidadaFilterTotalCard from './ConsolidadaFilterTotalCard.svelte';

  export let totalInvestedBrlCurrency = 0;
  export let totalInvestedBrlCurrencyLines = 0;
  export let totalInvestedUsdIntl = 0;
  export let totalInvestedUsdIntlLines = 0;

  export let totalCurrentBrlCurrency = 0;
  export let totalCurrentBrlCurrencyLines = 0;
  export let totalCurrentUsdIntl = 0;
  export let totalCurrentUsdIntlLines = 0;

  export let totalProfitBrlCurrency = 0;
  export let aggregateProfitPercentBrlCurrency: number | null = null;
  export let profitBrlCurrencyRowsCount = 0;
  export let totalProfitUsdIntl = 0;
  export let aggregateProfitUsdIntlPercent: number | null = null;
  export let profitUsdIntlRowsCount = 0;

  export let totalInvestedBrl = 0;
  export let totalCurrentBrl = 0;
  export let totalProfitBrl = 0;
  export let aggregateProfitPercent: number | null = null;
  export let totalInvestedBrlLines = 0;
  export let totalCurrentBrlLines = 0;
  export let profitBrlRowsCount = 0;
  export let usdBrlRate: number | null = null;

  function formatPercent(value: number | null): string {
    if (value == null) {
      return '—';
    }
    const prefix = value >= 0 ? '+' : '';
    return `${prefix}${value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}%`;
  }

  $: profitIcon =
    totalProfitBrlCurrency < 0 || totalProfitUsdIntl < 0 ? 'TrendingDown' : 'TrendingUp';
  $: profitBorderClass =
    totalProfitBrlCurrency < 0 || totalProfitUsdIntl < 0
      ? 'border-error/40'
      : 'border-success/40';
  $: profitGradientClass =
    totalProfitBrlCurrency < 0 || totalProfitUsdIntl < 0 ? 'from-error/20' : 'from-success/20';
  $: profitTitleClass =
    totalProfitBrlCurrency < 0 || totalProfitUsdIntl < 0 ? 'text-error' : 'text-success';
  $: profitIconBgClass =
    totalProfitBrlCurrency < 0 || totalProfitUsdIntl < 0 ? 'bg-error/15' : 'bg-success/15';
  $: profitIconFgClass =
    totalProfitBrlCurrency < 0 || totalProfitUsdIntl < 0 ? 'text-error' : 'text-success';
</script>

<p
  class="text-xs font-semibold uppercase tracking-wide text-base-content/70"
  data-testid="consolidada-filter-totals-caption"
>
  Totais do filtro atual (BRL nativo + internacional USD)
</p>

<div class="grid gap-2 sm:grid-cols-2 xl:grid-cols-4" data-testid="consolidada-filter-totals-grid">
  <ConsolidadaFilterTotalCard
    title="Total aplicado (filtro atual)"
    lucideIcon="Banknote"
    borderClass="border-primary/35"
    gradientClass="from-primary/15"
    titleClass="text-primary/90"
    iconBgClass="bg-primary/15"
    iconFgClass="text-primary"
    testId="consolidada-total-invested"
  >
    <div class="mt-3 space-y-2">
      <p class="text-3xl font-bold tabular-nums tracking-tight text-base-content">
        {totalInvestedBrlCurrencyLines > 0 ? formatMoneyAmount(totalInvestedBrlCurrency, 'BRL') : '—'}
      </p>
      <p class="text-xs text-base-content/60">
        {totalInvestedBrlCurrencyLines} posição(ões) em moeda BRL (valor aplicado)
      </p>
      <p class="border-t border-base-300/70 pt-2 text-3xl font-bold tabular-nums tracking-tight text-base-content">
        {totalInvestedUsdIntlLines > 0 ? formatMoneyAmount(totalInvestedUsdIntl, 'USD') : '—'}
      </p>
      <p class="text-xs text-base-content/60">
        {totalInvestedUsdIntlLines} posição(ões) internacional(is) em USD (valor aplicado)
      </p>
    </div>
  </ConsolidadaFilterTotalCard>

  <ConsolidadaFilterTotalCard
    title="Total atual (filtro atual)"
    lucideIcon="ChartLine"
    borderClass="border-secondary/35"
    gradientClass="from-secondary/15"
    titleClass="text-secondary"
    iconBgClass="bg-secondary/15"
    iconFgClass="text-secondary"
    testId="consolidada-total-current"
  >
    <div class="mt-3 space-y-2">
      <p class="text-3xl font-bold tabular-nums tracking-tight text-base-content">
        {totalCurrentBrlCurrencyLines > 0 ? formatMoneyAmount(totalCurrentBrlCurrency, 'BRL') : '—'}
      </p>
      <p class="text-xs text-base-content/60">
        {totalCurrentBrlCurrencyLines} posição(ões) em moeda BRL (valor atual)
      </p>
      <p class="border-t border-base-300/70 pt-2 text-3xl font-bold tabular-nums tracking-tight text-base-content">
        {totalCurrentUsdIntlLines > 0 ? formatMoneyAmount(totalCurrentUsdIntl, 'USD') : '—'}
      </p>
      <p class="text-xs text-base-content/60">
        {totalCurrentUsdIntlLines} posição(ões) internacional(is) em USD (valor atual)
      </p>
    </div>
  </ConsolidadaFilterTotalCard>

  <ConsolidadaFilterTotalCard
    title="Lucro (filtro atual)"
    lucideIcon={profitIcon}
    borderClass={profitBorderClass}
    gradientClass={profitGradientClass}
    titleClass={profitTitleClass}
    iconBgClass={profitIconBgClass}
    iconFgClass={profitIconFgClass}
    testId="consolidada-total-profit"
  >
    <div class="mt-3 space-y-2">
      {#if profitBrlCurrencyRowsCount === 0}
        <p class="text-3xl font-bold tabular-nums text-base-content/60">—</p>
        <p class="text-sm font-semibold tabular-nums text-base-content/50">—</p>
      {:else}
        <p class="text-3xl font-bold tabular-nums tracking-tight text-base-content">
          {formatMoneyAmount(totalProfitBrlCurrency, 'BRL')}
        </p>
        <p class="text-sm font-semibold tabular-nums text-base-content/90">
          {formatPercent(aggregateProfitPercentBrlCurrency)} · moeda BRL
        </p>
      {/if}
      <div class="border-t border-base-300/70 pt-2">
        {#if profitUsdIntlRowsCount === 0}
          <p class="text-3xl font-bold tabular-nums text-base-content/60">—</p>
          <p class="text-sm font-semibold tabular-nums text-base-content/50">—</p>
        {:else}
          <p class="text-3xl font-bold tabular-nums tracking-tight text-base-content">
            {formatMoneyAmount(totalProfitUsdIntl, 'USD')}
          </p>
          <p class="text-sm font-semibold tabular-nums text-base-content/90">
            {formatPercent(aggregateProfitUsdIntlPercent)} · internacional USD
          </p>
        {/if}
      </div>
    </div>
  </ConsolidadaFilterTotalCard>

  <ConsolidadaFilterTotalCard
    title="Consolidado total (em reais)"
    lucideIcon="Layers"
    borderClass="border-warning/45"
    gradientClass="from-warning/15"
    titleClass="text-warning"
    iconBgClass="bg-warning/15"
    iconFgClass="text-warning"
    testId="consolidada-total-brl"
    gridClass="sm:col-span-2 xl:col-span-1"
  >
    <p class="mt-1 text-[11px] leading-snug text-base-content/55">
      Soma de tudo na grade filtrada, em BRL: posições em real + posições em USD convertidas pela taxa USD/BRL
      {#if usdBrlRate == null}
        <span class="text-warning">(sem taxa, USD não entra no somatório)</span>
      {/if}
    </p>
    <dl class="mt-3 space-y-2.5 border-t border-base-300/80 pt-3 text-sm">
      <div class="flex items-baseline justify-between gap-2">
        <dt class="text-base-content/65">Aplicado</dt>
        <dd class="text-base font-bold tabular-nums text-base-content">
          {totalInvestedBrlLines > 0 ? formatMoneyAmount(totalInvestedBrl, 'BRL') : '—'}
        </dd>
      </div>
      <div class="flex items-baseline justify-between gap-2">
        <dt class="text-base-content/65">Atual</dt>
        <dd class="text-base font-bold tabular-nums text-base-content">
          {totalCurrentBrlLines > 0 ? formatMoneyAmount(totalCurrentBrl, 'BRL') : '—'}
        </dd>
      </div>
      <div class="flex items-baseline justify-between gap-2 border-t border-base-300/60 pt-2">
        <dt class="font-medium text-base-content/80">Lucro</dt>
        <dd class="text-right">
          {#if profitBrlRowsCount === 0}
            <span class="text-lg font-bold text-base-content/50">—</span>
          {:else}
            <span class="block text-lg font-bold tabular-nums text-base-content"
              >{formatMoneyAmount(totalProfitBrl, 'BRL')}</span
            >
            {#if aggregateProfitPercent != null}
              <span class="text-sm font-semibold tabular-nums text-base-content/85">
                ({formatPercent(aggregateProfitPercent)})
              </span>
            {/if}
          {/if}
        </dd>
      </div>
    </dl>
  </ConsolidadaFilterTotalCard>
</div>

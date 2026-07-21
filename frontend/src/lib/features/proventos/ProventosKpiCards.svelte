<script lang="ts">
  import type { DividendPayment } from '$lib/api/dividendPayments';
  import { formatMoneyAmount } from '$lib/assetLabels';
  import LucideIcon from '$lib/components/LucideIcon.svelte';
  import { formatTickerForDisplay } from '$lib/formatTickerForDisplay';
  import {
    PROVENTOS_KPI_COUNT_LUCIDE_ICON,
    PROVENTOS_KPI_MONTH_LUCIDE_ICON,
    PROVENTOS_KPI_TOP_PAYER_LUCIDE_ICON,
    PROVENTOS_KPI_YEAR_LUCIDE_ICON,
    type LucideIconName
  } from '$lib/icons/lucideIconCatalog';

  import { computeProventosKpis, type CurrencyTotals } from './proventosKpis';

  export let payments: DividendPayment[] = [];
  /**
   * Maior pagador considerando apenas ativos **em carteira** (mesma regra do Dashboard).
   * Os demais KPIs (total no ano/mês, nº de lançamentos) seguem o histórico completo.
   */
  export let topPayer: { symbol: string; amountBrl: number; currency: string } | null = null;

  const MONTH_LABELS = [
    'Jan',
    'Fev',
    'Mar',
    'Abr',
    'Mai',
    'Jun',
    'Jul',
    'Ago',
    'Set',
    'Out',
    'Nov',
    'Dez'
  ];

  function formatTotals(totals: CurrencyTotals): string {
    const currencies = Object.keys(totals).sort((a, b) => a.localeCompare(b, 'pt-BR'));
    if (currencies.length === 0) {
      return formatMoneyAmount(0, 'BRL');
    }
    return currencies.map((code) => formatMoneyAmount(totals[code], code)).join(' · ');
  }

  type Kpi = {
    label: string;
    value: string;
    hint: string;
    icon: LucideIconName;
    bgClass: string;
    fgClass: string;
    testId: string;
  };

  $: kpis = computeProventosKpis(payments);
  $: cards = [
    {
      label: 'Total no ano',
      value: formatTotals(kpis.yearTotalByCurrency),
      hint: String(kpis.year),
      icon: PROVENTOS_KPI_YEAR_LUCIDE_ICON,
      bgClass: 'bg-success/15',
      fgClass: 'text-success',
      testId: 'proventos-kpi-ano'
    },
    {
      label: 'Este mês',
      value: formatTotals(kpis.monthTotalByCurrency),
      hint: `${MONTH_LABELS[kpis.month - 1]}/${kpis.year}`,
      icon: PROVENTOS_KPI_MONTH_LUCIDE_ICON,
      bgClass: 'bg-primary/15',
      fgClass: 'text-primary',
      testId: 'proventos-kpi-mes'
    },
    {
      label: 'Lançamentos',
      value: String(kpis.count),
      hint: kpis.count === 1 ? 'provento cadastrado' : 'proventos cadastrados',
      icon: PROVENTOS_KPI_COUNT_LUCIDE_ICON,
      bgClass: 'bg-secondary/15',
      fgClass: 'text-secondary',
      testId: 'proventos-kpi-lancamentos'
    },
    {
      label: 'Maior pagador (em carteira)',
      value: topPayer ? formatTickerForDisplay(topPayer.symbol) : '—',
      hint: topPayer ? formatMoneyAmount(topPayer.amountBrl, topPayer.currency) : 'sem ativos em carteira',
      icon: PROVENTOS_KPI_TOP_PAYER_LUCIDE_ICON,
      bgClass: 'bg-warning/15',
      fgClass: 'text-warning',
      testId: 'proventos-kpi-maior-pagador'
    }
  ] satisfies Kpi[];
</script>

<div class="grid gap-2 sm:grid-cols-2 xl:grid-cols-4" data-testid="proventos-kpi-cards">
  {#each cards as card (card.testId)}
    <div class="card bg-base-100 shadow" data-testid={card.testId}>
      <div class="card-body flex-row items-center gap-3 p-4">
        <div
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl {card.bgClass} {card.fgClass}"
          aria-hidden="true"
        >
          <LucideIcon name={card.icon} size="md" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-xs text-base-content/60">{card.label}</p>
          <p class="truncate text-lg font-semibold tabular-nums">{card.value}</p>
          <p class="truncate text-xs text-base-content/50">{card.hint}</p>
        </div>
      </div>
    </div>
  {/each}
</div>

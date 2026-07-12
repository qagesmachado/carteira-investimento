<script lang="ts">
  import { formatMoneyAmount } from '$lib/assetLabels';

  import type { DashboardPatrimony } from './portfolioDashboard';
  import type { DashboardPatrimonyFilterAvailability } from './dashboardPatrimonyScope';
  import type { DividendAssetTotals } from '$lib/features/proventos/dividendSummary';
  import { formatDividendPaymentsTotalAmounts } from '$lib/features/proventos/dividendSummary';
  import DashboardKpiCard from './DashboardKpiCard.svelte';
  import { KPI_ICON_ACCENTS } from './dashboardIcons';
  import {
    DASHBOARD_DIVIDENDS_MONTH_LUCIDE_ICON,
    DASHBOARD_DIVIDENDS_YEAR_LUCIDE_ICON,
    DASHBOARD_INVESTED_LUCIDE_ICON,
    DASHBOARD_PATRIMONY_LUCIDE_ICON,
    DASHBOARD_POSITIONS_LUCIDE_ICON,
    DASHBOARD_PROFIT_LUCIDE_ICON
  } from '$lib/icons/lucideIconCatalog';

  export let patrimony: DashboardPatrimony;
  export let dividendsMonth: DividendAssetTotals;
  export let dividendsYear: DividendAssetTotals;
  export let filterAvailability: DashboardPatrimonyFilterAvailability = {
    hasNonInvestment: false,
    hasPension: false
  };

  function formatProfitPercent(value: number | null): string {
    if (value == null) {
      return '—';
    }
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
  }

  $: profitPrefix = patrimony.profitBrl >= 0 ? '+' : '';
  $: profitValueClass = patrimony.profitBrl >= 0 ? 'text-success' : 'text-error';
  $: profitBadgeClass =
    patrimony.profitBrl >= 0 ? 'bg-success/15 text-success' : 'bg-error/15 text-error';
</script>

<div class="grid gap-2 sm:grid-cols-2 xl:grid-cols-3" data-testid="dashboard-kpi-grid">
  <DashboardKpiCard
    title="Patrimônio total"
    value={formatMoneyAmount(patrimony.currentBrl, 'BRL')}
    description="Consolidado em reais"
    lucideIcon={DASHBOARD_PATRIMONY_LUCIDE_ICON}
    iconBgClass={KPI_ICON_ACCENTS.patrimony.bgClass}
    iconFgClass={KPI_ICON_ACCENTS.patrimony.fgClass}
    testId="dashboard-kpi-patrimony"
    {filterAvailability}
  />

  <DashboardKpiCard
    title="Valor investido"
    value={formatMoneyAmount(patrimony.investedBrl, 'BRL')}
    lucideIcon={DASHBOARD_INVESTED_LUCIDE_ICON}
    iconBgClass={KPI_ICON_ACCENTS.invested.bgClass}
    iconFgClass={KPI_ICON_ACCENTS.invested.fgClass}
    testId="dashboard-kpi-invested"
  />

  <DashboardKpiCard
    title="Lucro / prejuízo"
    value="{profitPrefix}{formatMoneyAmount(patrimony.profitBrl, 'BRL')}"
    lucideIcon={DASHBOARD_PROFIT_LUCIDE_ICON}
    iconBgClass={KPI_ICON_ACCENTS.profit.bgClass}
    iconFgClass={KPI_ICON_ACCENTS.profit.fgClass}
    valueClass={profitValueClass}
    badge={formatProfitPercent(patrimony.profitPercent)}
    badgeClass={profitBadgeClass}
    testId="dashboard-kpi-profit"
  />

  <DashboardKpiCard
    title="Proventos (mês)"
    value={formatDividendPaymentsTotalAmounts(dividendsMonth) || 'R$ 0,00'}
    description={dividendsMonth.count === 0 ? '' : `${dividendsMonth.count} lançamento(s)`}
    actionHref={dividendsMonth.count === 0 ? '/proventos' : ''}
    actionLabel={dividendsMonth.count === 0 ? 'Cadastrar proventos' : ''}
    lucideIcon={DASHBOARD_DIVIDENDS_MONTH_LUCIDE_ICON}
    iconBgClass={KPI_ICON_ACCENTS['dividends-month'].bgClass}
    iconFgClass={KPI_ICON_ACCENTS['dividends-month'].fgClass}
    testId="dashboard-kpi-dividends-month"
  />

  <DashboardKpiCard
    title="Proventos (ano)"
    value={formatDividendPaymentsTotalAmounts(dividendsYear) || 'R$ 0,00'}
    description="{dividendsYear.count} lançamento(s) no ano"
    lucideIcon={DASHBOARD_DIVIDENDS_YEAR_LUCIDE_ICON}
    iconBgClass={KPI_ICON_ACCENTS['dividends-year'].bgClass}
    iconFgClass={KPI_ICON_ACCENTS['dividends-year'].fgClass}
    testId="dashboard-kpi-dividends-year"
  />

  <DashboardKpiCard
    title="Posições ativas"
    value={String(patrimony.activePositions)}
    lucideIcon={DASHBOARD_POSITIONS_LUCIDE_ICON}
    iconBgClass={KPI_ICON_ACCENTS.positions.bgClass}
    iconFgClass={KPI_ICON_ACCENTS.positions.fgClass}
    maskValue={false}
    testId="dashboard-kpi-positions"
  />
</div>

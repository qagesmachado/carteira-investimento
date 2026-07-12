export type DashboardIconName =
  | 'wallet'
  | 'coins-stack'
  | 'trend-up'
  | 'calendar'
  | 'bar-chart'
  | 'layers'
  | 'refresh'
  | 'fx'
  | 'eye'
  | 'eye-off'
  | 'scales'
  | 'pie-chart'
  | 'target'
  | 'external-link';

const ICON_BASE = '/icons/dashboard';

/** @deprecated Novos ícones: Lucide — ver `$lib/icons/lucideIconCatalog.ts` e `.cursor/rules/app/lucide-icons.mdc` */

export function dashboardIconPath(name: DashboardIconName): string {
  return `${ICON_BASE}/${name}.svg`;
}

export const KPI_ICON_ACCENTS: Record<
  'patrimony' | 'invested' | 'profit' | 'dividends-month' | 'dividends-year' | 'positions',
  { icon: DashboardIconName; bgClass: string; fgClass: string }
> = {
  patrimony: { icon: 'wallet', bgClass: 'bg-primary/15', fgClass: 'text-primary' },
  invested: { icon: 'coins-stack', bgClass: 'bg-info/15', fgClass: 'text-info' },
  profit: { icon: 'trend-up', bgClass: 'bg-success/15', fgClass: 'text-success' },
  'dividends-month': { icon: 'calendar', bgClass: 'bg-warning/15', fgClass: 'text-warning' },
  'dividends-year': { icon: 'bar-chart', bgClass: 'bg-secondary/15', fgClass: 'text-secondary' },
  positions: { icon: 'layers', bgClass: 'bg-accent/15', fgClass: 'text-accent' }
};

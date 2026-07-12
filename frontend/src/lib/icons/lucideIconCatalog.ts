import type { ComponentType } from 'svelte';
import {
  BadgeDollarSign,
  Banknote,
  BanknoteArrowUp,
  ChartNoAxesColumn,
  ChartPie,
  CircleDollarSign,
  Coins,
  DollarSign,
  HandCoins,
  PiggyBank,
  Receipt,
  RotateCw,
  ScrollText,
  TrendingUp,
  Wallet,
  WalletMinimal
} from 'lucide-svelte';

/**
 * Registro central de ícones Lucide usados no app.
 * Novos ícones: importar de `lucide-svelte`, adicionar entrada aqui e usar via `<LucideIcon />`.
 * Catálogo completo: https://lucide.dev/icons/
 */
export const LUCIDE_ICON_ENTRIES = [
  { name: 'HandCoins', label: 'Mão com moedas', component: HandCoins },
  { name: 'CircleDollarSign', label: 'Círculo com cifrão', component: CircleDollarSign },
  { name: 'Coins', label: 'Moedas empilhadas', component: Coins },
  { name: 'BadgeDollarSign', label: 'Selo com cifrão', component: BadgeDollarSign },
  { name: 'DollarSign', label: 'Cifrão', component: DollarSign },
  { name: 'Banknote', label: 'Cédula', component: Banknote },
  { name: 'BanknoteArrowUp', label: 'Cédula com seta para cima', component: BanknoteArrowUp },
  { name: 'ChartNoAxesColumn', label: 'Gráfico de colunas', component: ChartNoAxesColumn },
  { name: 'ChartPie', label: 'Gráfico pizza', component: ChartPie },
  { name: 'Receipt', label: 'Recibo', component: Receipt },
  { name: 'RotateCw', label: 'Atualizar (sentido horário)', component: RotateCw },
  { name: 'ScrollText', label: 'Pergaminho com texto', component: ScrollText },
  { name: 'TrendingUp', label: 'Tendência de alta', component: TrendingUp },
  { name: 'Wallet', label: 'Carteira', component: Wallet },
  { name: 'WalletMinimal', label: 'Carteira (minimal)', component: WalletMinimal },
  { name: 'PiggyBank', label: 'Cofrinho', component: PiggyBank }
] as const;

export type LucideIconName = (typeof LUCIDE_ICON_ENTRIES)[number]['name'];

/** Subset exibido em `/dev/icones-lucide` (financeiro / dashboard). */
export const LUCIDE_ICON_GALLERY = LUCIDE_ICON_ENTRIES;

/** Ícone do seletor «Carteira» no painel do dashboard. */
export const DASHBOARD_PORTFOLIO_LUCIDE_ICON: LucideIconName = 'Wallet';

/** Ícone do KPI «Patrimônio total» no dashboard. */
export const DASHBOARD_PATRIMONY_LUCIDE_ICON: LucideIconName = 'WalletMinimal';

/** Ícone do KPI «Valor investido» no dashboard. */
export const DASHBOARD_INVESTED_LUCIDE_ICON: LucideIconName = 'BanknoteArrowUp';

/** Ícone do KPI «Proventos (mês)» no dashboard. */
export const DASHBOARD_DIVIDENDS_MONTH_LUCIDE_ICON: LucideIconName = 'Receipt';

/** Ícone do KPI «Proventos (ano)» no dashboard. */
export const DASHBOARD_DIVIDENDS_YEAR_LUCIDE_ICON: LucideIconName = 'ChartNoAxesColumn';

/** Ícone do KPI «Lucro / prejuízo» no dashboard. */
export const DASHBOARD_PROFIT_LUCIDE_ICON: LucideIconName = 'TrendingUp';

/** Ícone do KPI «Posições ativas» no dashboard. */
export const DASHBOARD_POSITIONS_LUCIDE_ICON: LucideIconName = 'ScrollText';

/** Ícone do botão «Atualizar câmbio» na toolbar do hero do dashboard. */
export const DASHBOARD_FX_REFRESH_LUCIDE_ICON: LucideIconName = 'Banknote';

/** Ícone do botão «Atualizar cotações» na toolbar do hero do dashboard. */
export const DASHBOARD_QUOTES_REFRESH_LUCIDE_ICON: LucideIconName = 'RotateCw';

/** Ícone do badge «Cotações · …» no painel da carteira do dashboard. */
export const DASHBOARD_QUOTES_LUCIDE_ICON: LucideIconName = 'CircleDollarSign';

/** Ícone do painel «Último provento» — [HandCoins](https://lucide.dev/icons/hand-coins) */
export const LAST_DIVIDEND_LUCIDE_ICON: LucideIconName = 'HandCoins';

/** Ícone do painel «Classe em destaque» — [ChartPie](https://lucide.dev/icons/chart-pie) */
export const FEATURED_CLASS_LUCIDE_ICON: LucideIconName = 'ChartPie';

export function getLucideIconComponent(name: LucideIconName): ComponentType {
  const row = LUCIDE_ICON_ENTRIES.find((entry) => entry.name === name);
  if (!row) {
    throw new Error(`Ícone Lucide desconhecido: ${name}`);
  }
  return row.component;
}

export const LUCIDE_ICON_SIZE_PX = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
  '2xl': 40
} as const;

export type LucideIconSize = keyof typeof LUCIDE_ICON_SIZE_PX;

import type { ComponentType } from 'svelte';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BadgeDollarSign,
  BadgePercent,
  Banknote,
  BanknoteArrowUp,
  Bitcoin,
  BookOpen,
  Building2,
  Calculator,
  CandlestickChart,
  ChartLine,
  ChartNoAxesColumn,
  ChartPie,
  ChevronDown,
  CircleCheck,
  CircleDollarSign,
  CircleEllipsis,
  CircleX,
  Coins,
  DollarSign,
  ExternalLink,
  Eye,
  Globe,
  GitBranch,
  HandCoins,
  Info,
  Landmark,
  Layers,
  LayoutDashboard,
  Medal,
  Pencil,
  PiggyBank,
  Plus,
  Receipt,
  RotateCw,
  Scale,
  ScrollText,
  Search,
  Settings,
  SlidersHorizontal,
  Tags,
  Trash2,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
  Umbrella,
  Wallet,
  WalletMinimal,
  X
} from 'lucide-svelte';

/**
 * Registro central de ícones Lucide usados no app.
 * Novos ícones: importar de `lucide-svelte`, adicionar entrada aqui e usar via `<LucideIcon />`.
 * Catálogo completo: https://lucide.dev/icons/
 */
export const LUCIDE_ICON_ENTRIES = [
  { name: 'ArrowDown', label: 'Seta para baixo', component: ArrowDown },
  { name: 'ArrowLeft', label: 'Seta para esquerda', component: ArrowLeft },
  { name: 'ArrowRight', label: 'Seta para direita', component: ArrowRight },
  { name: 'ArrowUp', label: 'Seta para cima', component: ArrowUp },
  { name: 'HandCoins', label: 'Mão com moedas', component: HandCoins },
  { name: 'CircleDollarSign', label: 'Círculo com cifrão', component: CircleDollarSign },
  { name: 'Coins', label: 'Moedas empilhadas', component: Coins },
  { name: 'BadgeDollarSign', label: 'Selo com cifrão', component: BadgeDollarSign },
  { name: 'BadgePercent', label: 'Selo com percentual', component: BadgePercent },
  { name: 'DollarSign', label: 'Cifrão', component: DollarSign },
  { name: 'Eye', label: 'Olho', component: Eye },
  { name: 'ExternalLink', label: 'Link externo', component: ExternalLink },
  { name: 'Banknote', label: 'Cédula', component: Banknote },
  { name: 'BanknoteArrowUp', label: 'Cédula com seta para cima', component: BanknoteArrowUp },
  { name: 'Bitcoin', label: 'Bitcoin', component: Bitcoin },
  { name: 'BookOpen', label: 'Livro aberto', component: BookOpen },
  { name: 'Building2', label: 'Edifício', component: Building2 },
  { name: 'Calculator', label: 'Calculadora', component: Calculator },
  { name: 'CandlestickChart', label: 'Gráfico de candlestick', component: CandlestickChart },
  { name: 'ChartLine', label: 'Gráfico de linha', component: ChartLine },
  { name: 'ChartNoAxesColumn', label: 'Gráfico de colunas', component: ChartNoAxesColumn },
  { name: 'ChartPie', label: 'Gráfico pizza', component: ChartPie },
  { name: 'ChevronDown', label: 'Chevron para baixo', component: ChevronDown },
  { name: 'CircleCheck', label: 'Círculo com check', component: CircleCheck },
  { name: 'CircleEllipsis', label: 'Círculo com reticências', component: CircleEllipsis },
  { name: 'CircleX', label: 'Círculo com X', component: CircleX },
  { name: 'Globe', label: 'Globo', component: Globe },
  { name: 'GitBranch', label: 'Ramificação', component: GitBranch },
  { name: 'Info', label: 'Informação', component: Info },
  { name: 'Landmark', label: 'Instituição', component: Landmark },
  { name: 'Layers', label: 'Camadas', component: Layers },
  { name: 'LayoutDashboard', label: 'Painel', component: LayoutDashboard },
  { name: 'Medal', label: 'Medalha', component: Medal },
  { name: 'Pencil', label: 'Lápis', component: Pencil },
  { name: 'PiggyBank', label: 'Cofrinho', component: PiggyBank },
  { name: 'Plus', label: 'Adicionar', component: Plus },
  { name: 'Receipt', label: 'Recibo', component: Receipt },
  { name: 'RotateCw', label: 'Atualizar (sentido horário)', component: RotateCw },
  { name: 'Scale', label: 'Balança', component: Scale },
  { name: 'ScrollText', label: 'Pergaminho com texto', component: ScrollText },
  { name: 'Search', label: 'Buscar', component: Search },
  { name: 'Settings', label: 'Configurações', component: Settings },
  { name: 'SlidersHorizontal', label: 'Controles deslizantes', component: SlidersHorizontal },
  { name: 'Tags', label: 'Etiquetas', component: Tags },
  { name: 'Trash2', label: 'Lixeira', component: Trash2 },
  { name: 'TrendingDown', label: 'Tendência de baixa', component: TrendingDown },
  { name: 'TrendingUp', label: 'Tendência de alta', component: TrendingUp },
  { name: 'TriangleAlert', label: 'Alerta triangular', component: TriangleAlert },
  { name: 'Umbrella', label: 'Guarda-chuva', component: Umbrella },
  { name: 'Wallet', label: 'Carteira', component: Wallet },
  { name: 'WalletMinimal', label: 'Carteira (minimal)', component: WalletMinimal },
  { name: 'X', label: 'Fechar', component: X },
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

/** Ícone do botão voltar no hero da página de posições. */
export const PORTFOLIO_POSITIONS_BACK_LUCIDE_ICON: LucideIconName = 'ArrowLeft';

/** Ícone do botão adicionar ativo na página de posições. */
export const PORTFOLIO_POSITIONS_ADD_LUCIDE_ICON: LucideIconName = 'Plus';

/** Ícone da busca na tabela de posições. */
export const PORTFOLIO_POSITIONS_SEARCH_LUCIDE_ICON: LucideIconName = 'Search';

/** Ícone do botão Detalhes na tabela de posições. */
export const PORTFOLIO_POSITIONS_DETAILS_LUCIDE_ICON: LucideIconName = 'Eye';

/** Ícone do botão Classificar na tabela de posições. */
export const PORTFOLIO_POSITIONS_CLASSIFY_LUCIDE_ICON: LucideIconName = 'Tags';

/** Ícone do botão Remover na tabela de posições. */
export const PORTFOLIO_POSITIONS_REMOVE_LUCIDE_ICON: LucideIconName = 'Trash2';

/** Ícone do badge «Cotações · …» no painel da carteira do dashboard. */
export const DASHBOARD_QUOTES_LUCIDE_ICON: LucideIconName = 'CircleDollarSign';

/** Ícone do painel «Último provento» — [HandCoins](https://lucide.dev/icons/hand-coins) */
export const LAST_DIVIDEND_LUCIDE_ICON: LucideIconName = 'HandCoins';

/** Ícone do painel «Classe em destaque» — [ChartPie](https://lucide.dev/icons/chart-pie) */
export const FEATURED_CLASS_LUCIDE_ICON: LucideIconName = 'ChartPie';

/** Aba «Maior lucro (%)» no painel Top ativos. */
export const TOP_ASSET_PROFIT_PERCENT_TAB_LUCIDE_ICON: LucideIconName = 'TrendingUp';

/** Aba «Maior posição» no painel Top ativos. */
export const TOP_ASSET_POSITION_VALUE_TAB_LUCIDE_ICON: LucideIconName = 'Layers';

/** Aba «Proventos (total)» no painel Top ativos. */
export const TOP_ASSET_DIVIDENDS_TAB_LUCIDE_ICON: LucideIconName = 'HandCoins';

/** Aba «Retorno bruto» no painel Top ativos. */
export const TOP_ASSET_GROSS_PROFIT_TAB_LUCIDE_ICON: LucideIconName = 'BadgePercent';

/** Link «Ver todos os ativos» no painel Top ativos. */
export const TOP_ASSET_SEE_ALL_LUCIDE_ICON: LucideIconName = 'ArrowRight';

/** Painel de filtros da visão consolidada. */
export const CONSOLIDADA_FILTERS_LUCIDE_ICON: LucideIconName = 'SlidersHorizontal';

/** Ícone do painel de simulação de rebalanceamento. */
export const REBALANCE_SIMULATION_LUCIDE_ICON: LucideIconName = 'Scale';

/** Ícone do botão calcular aporte no rebalanceamento. */
export const REBALANCE_CALCULATE_LUCIDE_ICON: LucideIconName = 'Calculator';

/** Ícone do link configurar metas no rebalanceamento. */
export const REBALANCE_SETTINGS_LUCIDE_ICON: LucideIconName = 'Settings';

/** Ícone do KPI desvio total no rebalanceamento. */
export const REBALANCE_DEVIATION_LUCIDE_ICON: LucideIconName = 'TrendingDown';

/** Ícone do KPI acima da meta no rebalanceamento. */
export const REBALANCE_ABOVE_TARGET_LUCIDE_ICON: LucideIconName = 'ArrowUp';

/** Ícone do KPI abaixo da meta no rebalanceamento. */
export const REBALANCE_BELOW_TARGET_LUCIDE_ICON: LucideIconName = 'ArrowDown';

/** Toast de sucesso. */
export const APP_TOAST_SUCCESS_LUCIDE_ICON: LucideIconName = 'CircleCheck';

/** Toast de erro. */
export const APP_TOAST_ERROR_LUCIDE_ICON: LucideIconName = 'CircleX';

/** Toast de aviso. */
export const APP_TOAST_WARNING_LUCIDE_ICON: LucideIconName = 'TriangleAlert';

/** Chevron dos menus dropdown da navbar — [ChevronDown](https://lucide.dev/icons/chevron-down) */
export const NAV_DROPDOWN_CHEVRON_LUCIDE_ICON: LucideIconName = 'ChevronDown';

/** Coluna Fundamental na metodologia de análise AUVP. */
export const ANALYSIS_FUNDAMENTAL_COLUMN_LUCIDE_ICON: LucideIconName = 'Scale';

/** Coluna Diagrama na metodologia de análise AUVP. */
export const ANALYSIS_DIAGRAM_COLUMN_LUCIDE_ICON: LucideIconName = 'GitBranch';

/** Status pendente na análise. */
export const ANALYSIS_PENDING_LUCIDE_ICON: LucideIconName = 'CircleEllipsis';

/** Link externo de análise (ETF intl / cripto). */
export const ANALYSIS_EXTERNAL_LINK_LUCIDE_ICON: LucideIconName = 'ExternalLink';

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

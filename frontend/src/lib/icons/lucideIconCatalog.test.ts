import { describe, expect, it } from 'vitest';

import {
  DASHBOARD_DIVIDENDS_MONTH_LUCIDE_ICON,
  DASHBOARD_DIVIDENDS_YEAR_LUCIDE_ICON,
  DASHBOARD_FX_REFRESH_LUCIDE_ICON,
  DASHBOARD_INVESTED_LUCIDE_ICON,
  DASHBOARD_PATRIMONY_LUCIDE_ICON,
  DASHBOARD_PORTFOLIO_LUCIDE_ICON,
  DASHBOARD_POSITIONS_LUCIDE_ICON,
  DASHBOARD_PROFIT_LUCIDE_ICON,
  DASHBOARD_QUOTES_LUCIDE_ICON,
  DASHBOARD_QUOTES_REFRESH_LUCIDE_ICON,
  FEATURED_CLASS_LUCIDE_ICON,
  TOP_ASSET_DIVIDENDS_TAB_LUCIDE_ICON,
  TOP_ASSET_GROSS_PROFIT_TAB_LUCIDE_ICON,
  TOP_ASSET_POSITION_VALUE_TAB_LUCIDE_ICON,
  TOP_ASSET_PROFIT_PERCENT_TAB_LUCIDE_ICON,
  TOP_ASSET_SEE_ALL_LUCIDE_ICON,
  getLucideIconComponent,
  LAST_DIVIDEND_LUCIDE_ICON,
  LUCIDE_ICON_ENTRIES
} from './lucideIconCatalog';

describe('lucideIconCatalog', () => {
  it('mantém registro de ícones Lucide', () => {
    expect(LUCIDE_ICON_ENTRIES.length).toBeGreaterThanOrEqual(5);
    expect(LUCIDE_ICON_ENTRIES.some((entry) => entry.name === 'Wallet')).toBe(true);
  });

  it('resolve componente do ícone de último provento', () => {
    expect(LAST_DIVIDEND_LUCIDE_ICON).toBe('HandCoins');
    expect(getLucideIconComponent(LAST_DIVIDEND_LUCIDE_ICON)).toBeTruthy();
  });

  it('usa ChartPie no painel de classe em destaque', () => {
    expect(FEATURED_CLASS_LUCIDE_ICON).toBe('ChartPie');
    expect(getLucideIconComponent(FEATURED_CLASS_LUCIDE_ICON)).toBeTruthy();
  });

  it('usa Wallet no seletor de carteira do dashboard', () => {
    expect(DASHBOARD_PORTFOLIO_LUCIDE_ICON).toBe('Wallet');
    expect(getLucideIconComponent(DASHBOARD_PORTFOLIO_LUCIDE_ICON)).toBeTruthy();
  });

  it('usa BanknoteArrowUp no KPI de valor investido do dashboard', () => {
    expect(DASHBOARD_INVESTED_LUCIDE_ICON).toBe('BanknoteArrowUp');
    expect(getLucideIconComponent(DASHBOARD_INVESTED_LUCIDE_ICON)).toBeTruthy();
  });

  it('usa WalletMinimal no KPI de patrimônio total do dashboard', () => {
    expect(DASHBOARD_PATRIMONY_LUCIDE_ICON).toBe('WalletMinimal');
    expect(getLucideIconComponent(DASHBOARD_PATRIMONY_LUCIDE_ICON)).toBeTruthy();
  });

  it('usa ScrollText no KPI de posições ativas do dashboard', () => {
    expect(DASHBOARD_POSITIONS_LUCIDE_ICON).toBe('ScrollText');
    expect(getLucideIconComponent(DASHBOARD_POSITIONS_LUCIDE_ICON)).toBeTruthy();
  });

  it('usa ChartNoAxesColumn no KPI de proventos do ano do dashboard', () => {
    expect(DASHBOARD_DIVIDENDS_YEAR_LUCIDE_ICON).toBe('ChartNoAxesColumn');
    expect(getLucideIconComponent(DASHBOARD_DIVIDENDS_YEAR_LUCIDE_ICON)).toBeTruthy();
  });

  it('usa TrendingUp no KPI de lucro/prejuízo do dashboard', () => {
    expect(DASHBOARD_PROFIT_LUCIDE_ICON).toBe('TrendingUp');
    expect(getLucideIconComponent(DASHBOARD_PROFIT_LUCIDE_ICON)).toBeTruthy();
  });

  it('usa Receipt no KPI de proventos do mês do dashboard', () => {
    expect(DASHBOARD_DIVIDENDS_MONTH_LUCIDE_ICON).toBe('Receipt');
    expect(getLucideIconComponent(DASHBOARD_DIVIDENDS_MONTH_LUCIDE_ICON)).toBeTruthy();
  });

  it('usa RotateCw no botão de atualizar cotações do dashboard', () => {
    expect(DASHBOARD_QUOTES_REFRESH_LUCIDE_ICON).toBe('RotateCw');
    expect(getLucideIconComponent(DASHBOARD_QUOTES_REFRESH_LUCIDE_ICON)).toBeTruthy();
  });

  it('usa Banknote no botão de atualizar câmbio do dashboard', () => {
    expect(DASHBOARD_FX_REFRESH_LUCIDE_ICON).toBe('Banknote');
    expect(getLucideIconComponent(DASHBOARD_FX_REFRESH_LUCIDE_ICON)).toBeTruthy();
  });

  it('usa CircleDollarSign no badge de cotações do dashboard', () => {
    expect(DASHBOARD_QUOTES_LUCIDE_ICON).toBe('CircleDollarSign');
    expect(getLucideIconComponent(DASHBOARD_QUOTES_LUCIDE_ICON)).toBeTruthy();
  });

  it('usa icones semanticos nas abas do painel Top ativos', () => {
    expect(TOP_ASSET_PROFIT_PERCENT_TAB_LUCIDE_ICON).toBe('TrendingUp');
    expect(TOP_ASSET_POSITION_VALUE_TAB_LUCIDE_ICON).toBe('Layers');
    expect(TOP_ASSET_DIVIDENDS_TAB_LUCIDE_ICON).toBe('HandCoins');
    expect(TOP_ASSET_GROSS_PROFIT_TAB_LUCIDE_ICON).toBe('BadgePercent');
    expect(TOP_ASSET_SEE_ALL_LUCIDE_ICON).toBe('ArrowRight');
    expect(getLucideIconComponent(TOP_ASSET_SEE_ALL_LUCIDE_ICON)).toBeTruthy();
  });

  it('registra icones da visao consolidada', () => {
    expect(getLucideIconComponent('LayoutDashboard')).toBeTruthy();
    expect(getLucideIconComponent('ChartLine')).toBeTruthy();
    expect(getLucideIconComponent('TrendingDown')).toBeTruthy();
    expect(getLucideIconComponent('SlidersHorizontal')).toBeTruthy();
  });

  it('registra ChevronDown para menus dropdown da navbar', () => {
    expect(getLucideIconComponent('ChevronDown')).toBeTruthy();
  });

  it('registra ChevronDown para menus dropdown da navbar', () => {
    expect(getLucideIconComponent('ChevronDown')).toBeTruthy();
  });

  it('registra icones da pagina de posicoes da carteira', () => {
    expect(getLucideIconComponent('ArrowLeft')).toBeTruthy();
    expect(getLucideIconComponent('Plus')).toBeTruthy();
    expect(getLucideIconComponent('Search')).toBeTruthy();
    expect(getLucideIconComponent('Eye')).toBeTruthy();
    expect(getLucideIconComponent('Tags')).toBeTruthy();
    expect(getLucideIconComponent('Trash2')).toBeTruthy();
  });

  it('registra icones da metodologia de analise AUVP', () => {
    expect(getLucideIconComponent('GitBranch')).toBeTruthy();
    expect(getLucideIconComponent('Scale')).toBeTruthy();
    expect(getLucideIconComponent('ExternalLink')).toBeTruthy();
  });

  it('falha para nome desconhecido', () => {
    expect(() => getLucideIconComponent('Unknown' as never)).toThrow(/desconhecido/);
  });

  it('registra ChevronDown para menus dropdown da navbar', () => {
    expect(getLucideIconComponent('ChevronDown')).toBeTruthy();
  });
});

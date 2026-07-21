/** Rotas com seletor de carteira no painel Hub (hierarquia Carteira / Ferramentas). */
export const FERRAMENTAS_HEADER_PORTFOLIO_ROUTES = [
  { route: '/objetivos', heading: 'Objetivos financeiros' },
  { route: '/taxas-cripto', heading: 'Criptomoedas' },
  { route: '/calculo-preco-medio', heading: 'Cálculo de preço médio' },
  { route: '/conferencia-ir', heading: 'Conferência anual de IR' },
  { route: '/controle-patrimonio', heading: 'Controle de patrimônio' }
] as const;

/** Mantido para compatibilidade E2E — agora no PortfolioWorkspaceBarPanel. */
export const PORTFOLIO_SELECT_HEADER_TEST_ID = 'portfolio-select-header';

/** Rotas de Ferramentas que exibem o seletor de carteira no cabeçalho (PageHeader). */
export const FERRAMENTAS_HEADER_PORTFOLIO_ROUTES = [
  { route: '/ferramentas/objetivos', heading: 'Objetivos financeiros' },
  { route: '/ferramentas/criptomoedas', heading: 'Criptomoedas' },
  { route: '/ferramentas/financiamento-imovel', heading: 'Financiamento imóvel' },
  { route: '/ferramentas/calculo-preco-medio', heading: 'Cálculo de preço médio' },
  { route: '/ferramentas/conferencia-ir', heading: 'Conferência anual de IR' },
  { route: '/ferramentas/controle-patrimonio', heading: 'Controle de patrimônio' }
] as const;

export const PORTFOLIO_SELECT_HEADER_TEST_ID = 'portfolio-select-header';

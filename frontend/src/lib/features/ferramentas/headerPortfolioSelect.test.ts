import { describe, expect, it } from 'vitest';

import {
  FERRAMENTAS_HEADER_PORTFOLIO_ROUTES,
  PORTFOLIO_SELECT_HEADER_TEST_ID
} from './headerPortfolioSelect';

describe('headerPortfolioSelect', () => {
  it('lista todas as ferramentas com seletor de carteira no cabeçalho', () => {
    expect(FERRAMENTAS_HEADER_PORTFOLIO_ROUTES).toHaveLength(6);
    expect(FERRAMENTAS_HEADER_PORTFOLIO_ROUTES.map((entry) => entry.route)).toEqual([
      '/ferramentas/objetivos',
      '/ferramentas/criptomoedas',
      '/ferramentas/financiamento-imovel',
      '/ferramentas/calculo-preco-medio',
      '/ferramentas/conferencia-ir',
      '/ferramentas/controle-patrimonio'
    ]);
  });

  it('expõe test id estável para o seletor do cabeçalho', () => {
    expect(PORTFOLIO_SELECT_HEADER_TEST_ID).toBe('portfolio-select-header');
  });
});

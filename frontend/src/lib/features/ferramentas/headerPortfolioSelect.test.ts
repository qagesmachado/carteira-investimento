import { describe, expect, it } from 'vitest';

import {
  FERRAMENTAS_HEADER_PORTFOLIO_ROUTES,
  PORTFOLIO_SELECT_HEADER_TEST_ID
} from './headerPortfolioSelect';

describe('headerPortfolioSelect', () => {
  it('lista rotas com painel de carteira (hierarquia Carteira / Ferramentas)', () => {
    expect(FERRAMENTAS_HEADER_PORTFOLIO_ROUTES).toHaveLength(5);
    expect(FERRAMENTAS_HEADER_PORTFOLIO_ROUTES.map((entry) => entry.route)).toEqual([
      '/objetivos',
      '/taxas-cripto',
      '/calculo-preco-medio',
      '/conferencia-ir',
      '/controle-patrimonio'
    ]);
  });

  it('expõe test id estável para o seletor do painel', () => {
    expect(PORTFOLIO_SELECT_HEADER_TEST_ID).toBe('portfolio-select-header');
  });
});

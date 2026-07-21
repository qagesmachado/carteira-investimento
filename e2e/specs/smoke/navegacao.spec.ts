import { expect, test } from '../fixtures/test';

/**
 * Smoke de navegação (somente leitura).
 *
 * Cada caso apenas navega para a rota e confirma que a casca da página
 * (heading) renderiza — sem semear dados. Roda em dois alvos:
 *  - `npm run test:all` (projeto ui, servidores de dev por worker);
 *  - passo 4 do build (contra o .exe empacotado, via playwright.smoke.config.js).
 *
 * Tag @smoke: usada pelo config de smoke (grep) e para identificar testes
 * de integridade de navegação do executável.
 */

type SmokeRoute = { route: string; heading: string };

const ROUTES: SmokeRoute[] = [
  { route: '/', heading: 'Carteira de Investimentos' },
  { route: '/dashboard', heading: 'Dashboard' },
  { route: '/portfolios', heading: 'Carteiras' },
  { route: '/consolidada', heading: 'Visão consolidada' },
  { route: '/assets', heading: 'Cadastro de ativos no banco de dados' },
  { route: '/proventos', heading: 'Proventos' },
  { route: '/proventos/resumo', heading: 'Proventos' },
  { route: '/proventos/adicionar', heading: 'Proventos' },
  { route: '/proventos/lancamentos', heading: 'Proventos' },
  { route: '/dados', heading: 'Dados' },
  { route: '/rebalanceamento', heading: 'Rebalanceamento' },
  { route: '/rebalanceamento/configuracao', heading: 'Metas de rebalanceamento' },
  { route: '/analise', heading: 'Análise de ativos' },
  { route: '/analise/sumario', heading: 'Análise de ativos' },
  { route: '/analise/acoes-br', heading: 'Análise de ativos' },
  { route: '/analise/fiis', heading: 'Análise de ativos' },
  { route: '/analise/fiis/segmentos', heading: 'Análise de ativos' },
  { route: '/analise/internacional', heading: 'Análise de ativos' },
  { route: '/analise/criptomoedas', heading: 'Análise de ativos' },
  { route: '/objetivos', heading: 'Objetivos financeiros' },
  { route: '/taxas-cripto', heading: 'Criptomoedas' },
  { route: '/financeiro/financiamento-imovel', heading: 'Financeiro' },
  { route: '/calculo-preco-medio', heading: 'Cálculo de preço médio' },
  { route: '/conferencia-ir', heading: 'Conferência anual de IR' },
  { route: '/controle-patrimonio', heading: 'Controle de patrimônio' },
  { route: '/financeiro', heading: 'Financeiro' },
  { route: '/financeiro/controle', heading: 'Financeiro' },
  { route: '/financeiro/metas', heading: 'Financeiro' },
  { route: '/financeiro/metas/historico', heading: 'Financeiro' },
  { route: '/financeiro/perfis', heading: 'Financeiro' },
  { route: '/info', heading: 'Informações do sistema' }
];

test.describe('SMOKE-NAV', () => {
  for (const { route, heading } of ROUTES) {
    test(`carrega ${route}`, { tag: '@smoke' }, async ({ page }) => {
      await page.goto(route);
      await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
    });
  }

  test('URL legada /portfolios/consolidada redireciona para /consolidada', { tag: '@smoke' }, async ({
    page
  }) => {
    await page.goto('/portfolios/consolidada?display_class=acao_br');
    await expect(page).toHaveURL(/\/consolidada\?display_class=acao_br$/);
    await expect(page.getByRole('heading', { name: 'Visão consolidada', exact: true })).toBeVisible();
  });

  test('URL legada /ferramentas/objetivos redireciona para /objetivos', { tag: '@smoke' }, async ({
    page
  }) => {
    await page.goto('/ferramentas/objetivos');
    await expect(page).toHaveURL(/\/objetivos$/);
    await expect(
      page.getByRole('heading', { name: 'Objetivos financeiros', exact: true })
    ).toBeVisible();
  });

  test('URL legada /ferramentas/financiamento-imovel redireciona para Financeiro', {
    tag: '@smoke'
  }, async ({ page }) => {
    await page.goto('/ferramentas/financiamento-imovel');
    await expect(page).toHaveURL(/\/financeiro\/financiamento-imovel$/);
    await expect(page.getByRole('heading', { name: 'Financeiro', exact: true })).toBeVisible();
  });

  test('deep-link sobrevive a reload (fallback SPA)', { tag: '@smoke' }, async ({ page }) => {
    await page.goto('/objetivos');
    await expect(
      page.getByRole('heading', { name: 'Objetivos financeiros', exact: true })
    ).toBeVisible();

    await page.reload();
    await expect(
      page.getByRole('heading', { name: 'Objetivos financeiros', exact: true })
    ).toBeVisible();
  });
});

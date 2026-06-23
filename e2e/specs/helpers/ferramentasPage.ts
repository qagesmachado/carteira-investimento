import { expect, type Locator, type Page } from '@playwright/test';

/** Mantido alinhado a `frontend/src/lib/features/ferramentas/headerPortfolioSelect.ts`. */
export const FERRAMENTAS_HEADER_PORTFOLIO_ROUTES = [
  { route: '/ferramentas/objetivos', heading: 'Objetivos financeiros' },
  { route: '/ferramentas/criptomoedas', heading: 'Criptomoedas' },
  { route: '/ferramentas/financiamento-imovel', heading: 'Financiamento imóvel' },
  { route: '/ferramentas/calculo-preco-medio', heading: 'Cálculo de preço médio' },
  { route: '/ferramentas/conferencia-ir', heading: 'Conferência anual de IR' },
  { route: '/ferramentas/controle-patrimonio', heading: 'Controle de patrimônio' }
] as const;

export const PORTFOLIO_SELECT_HEADER_TEST_ID = 'portfolio-select-header';

export function headerPortfolioSelect(page: Page): Locator {
  return page.getByTestId(PORTFOLIO_SELECT_HEADER_TEST_ID);
}

export async function expectHeaderPortfolioSelectVisible(page: Page): Promise<void> {
  const select = headerPortfolioSelect(page);
  await expect(select).toBeVisible();
  await expect(select).toHaveAttribute('aria-label', 'Selecionar carteira');
}

export async function gotoFerramentaPage(
  page: Page,
  route: string,
  heading: string
): Promise<void> {
  await page.goto(route);
  await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
  await expectHeaderPortfolioSelectVisible(page);
}

export async function selectHeaderPortfolioByName(page: Page, name: string): Promise<void> {
  await headerPortfolioSelect(page).selectOption({ label: name });
}

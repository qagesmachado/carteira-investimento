import { expect, type APIRequestContext } from '@playwright/test';

import { E2E_PORTFOLIO_PRINCIPAL, E2E_PORTFOLIO_SECONDARY } from './e2eFixtures';
import { clearAllTestAssets } from './seedAssets';
import {
  clearAllPortfolios,
  createPortfolio,
  setActivePortfolio
} from './testPortfolios';
import { getWorkerApiBaseUrl } from './workerContext';

export async function seedPropertyFinancingEmpty(
  request: APIRequestContext
): Promise<number> {
  await clearAllTestAssets(request, getWorkerApiBaseUrl());
  await clearAllPortfolios(request);
  const portfolio = await createPortfolio(request, E2E_PORTFOLIO_PRINCIPAL);
  await setActivePortfolio(request, portfolio.id);
  return portfolio.id;
}

export async function seedPropertyFinancingTwoPortfolios(
  request: APIRequestContext
): Promise<{ primaryId: number; secondaryId: number }> {
  await clearAllTestAssets(request, getWorkerApiBaseUrl());
  await clearAllPortfolios(request);
  const primary = await createPortfolio(request, E2E_PORTFOLIO_PRINCIPAL);
  const secondary = await createPortfolio(request, E2E_PORTFOLIO_SECONDARY);
  await setActivePortfolio(request, primary.id);

  const today = new Date();
  const eventDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-15`;
  const financingId = await createFinancingViaApi(request, primary.id, 'Apto Seed', 'apartamento');
  await createEntryViaApi(request, primary.id, financingId, {
    event_date: eventDate,
    entry_type: 'expense',
    event_category: 'financiamento',
    description: 'Parcela seed',
    amount_brl: 3000
  });
  await createEntryViaApi(request, primary.id, financingId, {
    event_date: eventDate,
    entry_type: 'income',
    event_category: 'aluguel',
    description: 'Aluguel seed',
    amount_brl: 2000
  });

  return { primaryId: primary.id, secondaryId: secondary.id };
}

export async function createFinancingViaApi(
  request: APIRequestContext,
  portfolioId: number,
  name: string,
  propertyType = 'casa'
): Promise<number> {
  const response = await request.post(
    `${getWorkerApiBaseUrl()}/portfolios/${portfolioId}/property-financings`,
    {
      data: { name, property_type: propertyType }
    }
  );
  expect(response.ok()).toBeTruthy();
  return ((await response.json()) as { id: number }).id;
}

export async function createEntryViaApi(
  request: APIRequestContext,
  portfolioId: number,
  financingId: number,
  payload: {
    event_date: string;
    entry_type: 'income' | 'expense';
    event_category: 'aluguel' | 'financiamento' | 'outras_taxas' | 'entrada_financiamento';
    description: string;
    amount_brl: number;
  }
): Promise<number> {
  const response = await request.post(
    `${getWorkerApiBaseUrl()}/portfolios/${portfolioId}/property-financings/${financingId}/entries`,
    { data: payload }
  );
  expect(response.ok()).toBeTruthy();
  return ((await response.json()) as { id: number }).id;
}

export function todayIsoDate(): string {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${today.getFullYear()}-${month}-${day}`;
}

export function todayBrDate(): string {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${day}/${month}/${today.getFullYear()}`;
}

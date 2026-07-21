import { expect, type APIRequestContext } from '@playwright/test';

import {
  clearAllBudgetProfiles,
  createBudgetProfileViaApi,
  setActiveBudgetProfileViaApi,
  type BudgetProfileSeed
} from './seedBudget';
import { getWorkerApiBaseUrl } from './workerContext';

export async function seedPropertyFinancingEmpty(
  request: APIRequestContext
): Promise<number> {
  await clearAllBudgetProfiles(request);
  const profile = await createBudgetProfileViaApi(request, 'Casa E2E Fin');
  await setActiveBudgetProfileViaApi(request, profile.id);
  return profile.id;
}

export async function seedPropertyFinancingTwoProfiles(
  request: APIRequestContext
): Promise<{ primaryId: number; secondaryId: number }> {
  await clearAllBudgetProfiles(request);
  const primary = await createBudgetProfileViaApi(request, 'Perfil Fin A');
  const secondary = await createBudgetProfileViaApi(request, 'Perfil Fin B');
  await setActiveBudgetProfileViaApi(request, primary.id);

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

/** @deprecated Use seedPropertyFinancingTwoProfiles */
export async function seedPropertyFinancingTwoPortfolios(
  request: APIRequestContext
): Promise<{ primaryId: number; secondaryId: number }> {
  return seedPropertyFinancingTwoProfiles(request);
}

export async function createFinancingViaApi(
  request: APIRequestContext,
  profileId: number,
  name: string,
  propertyType = 'casa'
): Promise<number> {
  const response = await request.post(
    `${getWorkerApiBaseUrl()}/budget/profiles/${profileId}/property-financings`,
    {
      data: { name, property_type: propertyType }
    }
  );
  expect(response.ok()).toBeTruthy();
  return ((await response.json()) as { id: number }).id;
}

export async function createEntryViaApi(
  request: APIRequestContext,
  profileId: number,
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
    `${getWorkerApiBaseUrl()}/budget/profiles/${profileId}/property-financings/${financingId}/entries`,
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

export type { BudgetProfileSeed };

import { type APIRequestContext } from '@playwright/test';

import { getWorkerApiBaseUrl } from './workerContext';

export function currentBudgetYearMonth(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function shiftBudgetYearMonth(yearMonth: string, deltaMonths: number): string {
  const [yearStr, monthStr] = yearMonth.split('-');
  const total = Number(yearStr) * 12 + (Number(monthStr) - 1) + deltaMonths;
  const year = Math.floor(total / 12);
  const month = (total % 12) + 1;
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}`;
}

export type BudgetProfileSeed = {
  id: number;
  name: string;
};

export async function clearAllBudgetProfiles(request: APIRequestContext): Promise<void> {
  const apiBaseUrl = getWorkerApiBaseUrl();
  const response = await request.get(`${apiBaseUrl}/budget/profiles`);
  if (!response.ok()) {
    return;
  }
  const profiles = (await response.json()) as { id: number }[];
  for (const profile of profiles) {
    await request.delete(`${apiBaseUrl}/budget/profiles/${profile.id}`);
  }
}

export async function createBudgetProfileViaApi(
  request: APIRequestContext,
  name: string,
  description = 'E2E'
): Promise<BudgetProfileSeed> {
  const apiBaseUrl = getWorkerApiBaseUrl();
  const response = await request.post(`${apiBaseUrl}/budget/profiles`, {
    data: { name, description }
  });
  if (!response.ok()) {
    throw new Error(await response.text());
  }
  return response.json();
}

export async function setActiveBudgetProfileViaApi(
  request: APIRequestContext,
  profileId: number
): Promise<void> {
  const apiBaseUrl = getWorkerApiBaseUrl();
  const response = await request.put(`${apiBaseUrl}/budget/active`, {
    data: { profile_id: profileId }
  });
  if (!response.ok()) {
    throw new Error(await response.text());
  }
}

export async function seedBudgetProfile(
  request: APIRequestContext,
  name = 'Casa E2E'
): Promise<BudgetProfileSeed> {
  await clearAllBudgetProfiles(request);
  const profile = await createBudgetProfileViaApi(request, name);
  await setActiveBudgetProfileViaApi(request, profile.id);
  return profile;
}

export async function seedBudgetTwoProfiles(
  request: APIRequestContext
): Promise<{ profileA: BudgetProfileSeed; profileB: BudgetProfileSeed }> {
  await clearAllBudgetProfiles(request);
  const profileA = await createBudgetProfileViaApi(request, 'Perfil A');
  const profileB = await createBudgetProfileViaApi(request, 'Perfil B');
  await setActiveBudgetProfileViaApi(request, profileA.id);
  return { profileA, profileB };
}

export async function getMonthSnapshotViaApi(
  request: APIRequestContext,
  profileId: number,
  yearMonth: string
) {
  const apiBaseUrl = getWorkerApiBaseUrl();
  const response = await request.get(`${apiBaseUrl}/budget/profiles/${profileId}/months/${yearMonth}`);
  if (!response.ok()) {
    throw new Error(await response.text());
  }
  return response.json();
}

export async function getMonthTargetsViaApi(
  request: APIRequestContext,
  profileId: number,
  yearMonth: string
) {
  const apiBaseUrl = getWorkerApiBaseUrl();
  const response = await request.get(
    `${apiBaseUrl}/budget/profiles/${profileId}/months/${yearMonth}?view=targets`
  );
  if (!response.ok()) {
    throw new Error(await response.text());
  }
  return response.json();
}

export async function listBudgetCategoriesViaApi(
  request: APIRequestContext,
  profileId: number
): Promise<{ id: number; name: string; color: string; sort_order: number }[]> {
  const apiBaseUrl = getWorkerApiBaseUrl();
  const response = await request.get(`${apiBaseUrl}/budget/profiles/${profileId}/categories`);
  if (!response.ok()) {
    throw new Error(await response.text());
  }
  return response.json();
}

export async function createBudgetTagViaApi(
  request: APIRequestContext,
  profileId: number,
  name: string,
  color = '#3b82f6'
) {
  const apiBaseUrl = getWorkerApiBaseUrl();
  const response = await request.post(`${apiBaseUrl}/budget/profiles/${profileId}/tags`, {
    data: { name, color }
  });
  if (!response.ok()) {
    throw new Error(await response.text());
  }
  return response.json();
}

export async function listBudgetTagsViaApi(request: APIRequestContext, profileId: number) {
  const apiBaseUrl = getWorkerApiBaseUrl();
  const response = await request.get(`${apiBaseUrl}/budget/profiles/${profileId}/tags`);
  if (!response.ok()) {
    throw new Error(await response.text());
  }
  return response.json() as Promise<{ id: number; name: string; color: string }[]>;
}

export async function createBudgetExpenseViaApi(
  request: APIRequestContext,
  profileId: number,
  yearMonth: string,
  payload: {
    description: string;
    amount_brl: number;
    category_id: number;
    tag_id?: number | null;
    event_date?: string;
  }
) {
  const apiBaseUrl = getWorkerApiBaseUrl();
  const response = await request.post(
    `${apiBaseUrl}/budget/profiles/${profileId}/months/${yearMonth}/transactions`,
    {
      data: {
        transaction_type: 'expense',
        event_date: payload.event_date ?? `${yearMonth}-10`,
        description: payload.description,
        amount_brl: payload.amount_brl,
        category_id: payload.category_id,
        tag_id: payload.tag_id ?? null
      }
    }
  );
  if (!response.ok()) {
    throw new Error(await response.text());
  }
  return response.json();
}

export async function updateBudgetTargetsViaApi(
  request: APIRequestContext,
  profileId: number,
  yearMonth: string,
  plannedIncome: number,
  targets: { category_id: number; percent: number }[],
  options?: { propagate_category_ids?: number[] }
) {
  const apiBaseUrl = getWorkerApiBaseUrl();
  const response = await request.put(
    `${apiBaseUrl}/budget/profiles/${profileId}/months/${yearMonth}/targets`,
    {
      data: {
        planned_income_brl: plannedIncome,
        targets,
        ...(options?.propagate_category_ids
          ? { propagate_category_ids: options.propagate_category_ids }
          : {})
      }
    }
  );
  if (!response.ok()) {
    throw new Error(await response.text());
  }
  return response.json();
}

export async function updateBudgetIncomesViaApi(
  request: APIRequestContext,
  profileId: number,
  yearMonth: string,
  items: { label: string; amount_brl: number }[]
) {
  const apiBaseUrl = getWorkerApiBaseUrl();
  const response = await request.put(
    `${apiBaseUrl}/budget/profiles/${profileId}/months/${yearMonth}/incomes`,
    { data: { items } }
  );
  if (!response.ok()) {
    throw new Error(await response.text());
  }
  return response.json();
}

export async function createBudgetIncomeViaApi(
  request: APIRequestContext,
  profileId: number,
  yearMonth: string,
  payload: { label: string; amount_brl: number; recurring_12_months?: boolean }
) {
  const apiBaseUrl = getWorkerApiBaseUrl();
  const response = await request.post(
    `${apiBaseUrl}/budget/profiles/${profileId}/months/${yearMonth}/incomes`,
    { data: payload }
  );
  if (!response.ok()) {
    throw new Error(await response.text());
  }
  return response.json();
}

export async function createBudgetMonthExpenseViaApi(
  request: APIRequestContext,
  profileId: number,
  yearMonth: string,
  payload: {
    description: string;
    amount_brl: number;
    category_id: number;
    event_date?: string;
    recurring?: boolean;
    indefinite?: boolean;
    end_year_month?: string | null;
  }
) {
  const apiBaseUrl = getWorkerApiBaseUrl();
  const response = await request.post(
    `${apiBaseUrl}/budget/profiles/${profileId}/months/${yearMonth}/expenses`,
    {
      data: {
        description: payload.description,
        event_date: payload.event_date ?? `${yearMonth}-10`,
        amount_brl: payload.amount_brl,
        category_id: payload.category_id,
        recurring: payload.recurring ?? false,
        indefinite: payload.indefinite ?? false,
        end_year_month: payload.end_year_month ?? null
      }
    }
  );
  if (!response.ok()) {
    throw new Error(await response.text());
  }
  return response.json();
}

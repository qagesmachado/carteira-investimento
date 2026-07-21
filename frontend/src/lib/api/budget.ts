import { API_BASE_URL } from './config';

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(await response.text());
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}

export type BudgetProfile = {
  id: number;
  name: string;
  description: string | null;
};

export type BudgetTag = {
  id: number;
  profile_id: number;
  name: string;
  color: string;
  usage_count: number;
};

export type BudgetCategory = {
  id: number;
  profile_id: number;
  name: string;
  sort_order: number;
  color: string;
};

export type BudgetCategoryUsageSummary = BudgetCategory & {
  transaction_count: number;
  recurring_count: number;
  can_delete: boolean;
};

export type BudgetCategoryUsageTransaction = {
  id: number;
  event_date: string;
  year_month: string;
  description: string;
  amount_brl: number;
  recurring: boolean;
};

export type BudgetCategoryUsageDetail = BudgetCategoryUsageSummary & {
  transactions: BudgetCategoryUsageTransaction[];
  recurring_expenses: BudgetRecurringExpense[];
};

export type BudgetCategoryScope = 'all' | 'from_month';

export type BudgetIncomeSource = {
  id: number;
  profile_id: number;
  name: string;
  recurrence_hint: string;
  sort_order: number;
  is_active: boolean;
};

export type BudgetMonthIncomeItem = {
  id?: number | null;
  source_id?: number | null;
  label: string;
  amount_brl: number;
  recurring?: boolean;
  received?: boolean;
};

export type BudgetCategoryKpi = {
  category_id: number;
  category_name: string;
  color: string;
  percent: number;
  target_brl: number;
  spent_brl: number;
  remaining_brl: number;
  usage_percent: number;
  exceeded: boolean;
  transaction_count: number;
};

export type BudgetTransaction = {
  id: number;
  profile_id: number;
  month_id: number;
  transaction_type: 'income' | 'expense';
  event_date: string;
  description: string;
  amount_brl: number;
  category_id: number | null;
  category_name: string | null;
  tag_id: number | null;
  tag_name: string | null;
  tag_color: string | null;
  income_source_id: number | null;
  notes: string | null;
  recurring?: boolean;
  recurring_expense_id?: number | null;
  settled?: boolean;
};

export type BudgetRecurringExpense = {
  id: number;
  profile_id: number;
  description: string;
  amount_brl: number;
  category_id: number;
  category_name: string | null;
  tag_id: number | null;
  tag_name: string | null;
  day_of_month: number;
  start_year_month: string;
  end_year_month: string | null;
  indefinite: boolean;
  is_active: boolean;
};

export type BudgetMonthSnapshot = {
  profile_id: number;
  year_month: string;
  planned_income_brl: number | null;
  income_total_brl: number;
  expense_total_brl: number;
  remaining_brl: number;
  income_usage_percent: number;
  categories: BudgetCategoryKpi[];
  incomes: BudgetMonthIncomeItem[];
  transactions: BudgetTransaction[];
  targets_inherited: boolean;
};

export type DashboardSlice = {
  id: number;
  name: string;
  color: string;
  amount_brl: number;
  percent: number;
};

export type BudgetDashboard = {
  profile_id: number;
  months: number;
  focus_year_month: string;
  forward_months: number;
  from_year_month: string | null;
  to_year_month: string | null;
  result_brl: number;
  income_brl: number;
  expense_brl: number;
  balance_brl: number;
  timeline: { year_month: string; income_brl: number; expense_brl: number }[];
  expenses_by_tag: DashboardSlice[];
  expenses_by_category: DashboardSlice[];
  incomes_by_tag: DashboardSlice[];
};

export async function listBudgetProfiles(fetcher: typeof fetch = fetch): Promise<BudgetProfile[]> {
  const response = await fetcher(`${API_BASE_URL}/budget/profiles`);
  return parseResponse<BudgetProfile[]>(response);
}

export async function createBudgetProfile(
  payload: { name: string; description?: string | null },
  fetcher: typeof fetch = fetch
): Promise<BudgetProfile> {
  const response = await fetcher(`${API_BASE_URL}/budget/profiles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return parseResponse<BudgetProfile>(response);
}

export async function updateBudgetProfile(
  id: number,
  payload: { name?: string; description?: string | null },
  fetcher: typeof fetch = fetch
): Promise<BudgetProfile> {
  const response = await fetcher(`${API_BASE_URL}/budget/profiles/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return parseResponse<BudgetProfile>(response);
}

export async function deleteBudgetProfile(id: number, fetcher: typeof fetch = fetch): Promise<void> {
  const response = await fetcher(`${API_BASE_URL}/budget/profiles/${id}`, { method: 'DELETE' });
  await parseResponse<void>(response);
}

export async function getActiveBudgetProfileId(fetcher: typeof fetch = fetch): Promise<number | null> {
  const response = await fetcher(`${API_BASE_URL}/budget/active`);
  const body = await parseResponse<{ profile_id: number | null }>(response);
  return body.profile_id;
}

export async function setActiveBudgetProfileId(
  profileId: number | null,
  fetcher: typeof fetch = fetch
): Promise<number | null> {
  const response = await fetcher(`${API_BASE_URL}/budget/active`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profile_id: profileId })
  });
  const body = await parseResponse<{ profile_id: number | null }>(response);
  return body.profile_id;
}

export type BudgetSnapshotView = 'full' | 'targets' | 'incomes' | 'expenses' | 'settlement';

export async function getMonthSnapshot(
  profileId: number,
  yearMonth: string,
  view: BudgetSnapshotView = 'full',
  fetcher: typeof fetch = fetch
): Promise<BudgetMonthSnapshot> {
  const query = view === 'full' ? '' : `?view=${encodeURIComponent(view)}`;
  const response = await fetcher(
    `${API_BASE_URL}/budget/profiles/${profileId}/months/${yearMonth}${query}`
  );
  return parseResponse<BudgetMonthSnapshot>(response);
}

export async function updateMonthTargets(
  profileId: number,
  yearMonth: string,
  payload: {
    planned_income_brl?: number | null;
    targets: { category_id: number; percent: number; name?: string; color?: string }[];
    /** Inclui estas categorias (0%) nos meses seguintes que já tiverem metas próprias. */
    propagate_category_ids?: number[];
    /** Copia o conjunto completo (categorias + %) para os meses seguintes customizados. */
    apply_to_following_months?: boolean;
  },
  fetcher: typeof fetch = fetch
): Promise<BudgetMonthSnapshot> {
  const response = await fetcher(`${API_BASE_URL}/budget/profiles/${profileId}/months/${yearMonth}/targets`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return parseResponse<BudgetMonthSnapshot>(response);
}

export async function removeTargetCategories(
  profileId: number,
  yearMonth: string,
  payload: {
    category_ids: number[];
    apply_to_current?: boolean;
    apply_to_following_months?: boolean;
  },
  fetcher: typeof fetch = fetch
): Promise<BudgetMonthSnapshot> {
  const response = await fetcher(
    `${API_BASE_URL}/budget/profiles/${profileId}/months/${yearMonth}/targets/remove-categories`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }
  );
  return parseResponse<BudgetMonthSnapshot>(response);
}

export async function patchMonth(
  profileId: number,
  yearMonth: string,
  payload: { planned_income_brl?: number | null },
  fetcher: typeof fetch = fetch
): Promise<BudgetMonthSnapshot> {
  const response = await fetcher(`${API_BASE_URL}/budget/profiles/${profileId}/months/${yearMonth}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return parseResponse<BudgetMonthSnapshot>(response);
}

export async function updateMonthIncomes(
  profileId: number,
  yearMonth: string,
  items: BudgetMonthIncomeItem[],
  fetcher: typeof fetch = fetch
): Promise<BudgetMonthSnapshot> {
  const response = await fetcher(`${API_BASE_URL}/budget/profiles/${profileId}/months/${yearMonth}/incomes`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items })
  });
  return parseResponse<BudgetMonthSnapshot>(response);
}

export async function createMonthIncome(
  profileId: number,
  yearMonth: string,
  payload: { label: string; amount_brl: number; recurring_12_months?: boolean },
  fetcher: typeof fetch = fetch
): Promise<BudgetMonthSnapshot> {
  const response = await fetcher(`${API_BASE_URL}/budget/profiles/${profileId}/months/${yearMonth}/incomes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return parseResponse<BudgetMonthSnapshot>(response);
}

export async function updateMonthIncome(
  profileId: number,
  yearMonth: string,
  incomeId: number,
  payload: { label?: string; amount_brl?: number; received?: boolean },
  fetcher: typeof fetch = fetch
): Promise<BudgetMonthSnapshot> {
  const response = await fetcher(
    `${API_BASE_URL}/budget/profiles/${profileId}/months/${yearMonth}/incomes/${incomeId}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }
  );
  return parseResponse<BudgetMonthSnapshot>(response);
}

export async function deleteMonthIncome(
  profileId: number,
  yearMonth: string,
  incomeId: number,
  fetcher: typeof fetch = fetch
): Promise<BudgetMonthSnapshot> {
  const response = await fetcher(
    `${API_BASE_URL}/budget/profiles/${profileId}/months/${yearMonth}/incomes/${incomeId}`,
    { method: 'DELETE' }
  );
  return parseResponse<BudgetMonthSnapshot>(response);
}

export async function copyPreviousMonthIncomes(
  profileId: number,
  yearMonth: string,
  fetcher: typeof fetch = fetch
): Promise<BudgetMonthSnapshot> {
  const response = await fetcher(
    `${API_BASE_URL}/budget/profiles/${profileId}/months/${yearMonth}/copy-previous-incomes`,
    { method: 'POST' }
  );
  return parseResponse<BudgetMonthSnapshot>(response);
}

export async function createTransaction(
  profileId: number,
  yearMonth: string,
  payload: {
    transaction_type: 'income' | 'expense';
    event_date: string;
    description: string;
    amount_brl: number;
    category_id?: number | null;
    tag_id?: number | null;
    income_source_id?: number | null;
    notes?: string | null;
  },
  fetcher: typeof fetch = fetch
): Promise<BudgetTransaction> {
  const response = await fetcher(
    `${API_BASE_URL}/budget/profiles/${profileId}/months/${yearMonth}/transactions`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }
  );
  return parseResponse<BudgetTransaction>(response);
}

export async function updateTransaction(
  profileId: number,
  transactionId: number,
  payload: {
    event_date?: string;
    description?: string;
    amount_brl?: number;
    category_id?: number | null;
    tag_id?: number | null;
    income_source_id?: number | null;
    notes?: string | null;
    settled?: boolean;
  },
  fetcher: typeof fetch = fetch
): Promise<BudgetTransaction> {
  const response = await fetcher(
    `${API_BASE_URL}/budget/profiles/${profileId}/transactions/${transactionId}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }
  );
  return parseResponse<BudgetTransaction>(response);
}

export async function deleteTransaction(
  profileId: number,
  transactionId: number,
  fetcher: typeof fetch = fetch
): Promise<void> {
  const response = await fetcher(
    `${API_BASE_URL}/budget/profiles/${profileId}/transactions/${transactionId}`,
    { method: 'DELETE' }
  );
  await parseResponse<void>(response);
}

export async function listTags(profileId: number, fetcher: typeof fetch = fetch): Promise<BudgetTag[]> {
  const response = await fetcher(`${API_BASE_URL}/budget/profiles/${profileId}/tags`);
  return parseResponse<BudgetTag[]>(response);
}

export async function createTag(
  profileId: number,
  payload: { name: string; color: string },
  fetcher: typeof fetch = fetch
): Promise<BudgetTag> {
  const response = await fetcher(`${API_BASE_URL}/budget/profiles/${profileId}/tags`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return parseResponse<BudgetTag>(response);
}

export async function updateTag(
  profileId: number,
  tagId: number,
  payload: { name?: string; color?: string },
  fetcher: typeof fetch = fetch
): Promise<BudgetTag> {
  const response = await fetcher(`${API_BASE_URL}/budget/profiles/${profileId}/tags/${tagId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return parseResponse<BudgetTag>(response);
}

export async function deleteTag(
  profileId: number,
  tagId: number,
  fetcher: typeof fetch = fetch
): Promise<void> {
  const response = await fetcher(`${API_BASE_URL}/budget/profiles/${profileId}/tags/${tagId}`, {
    method: 'DELETE'
  });
  await parseResponse<void>(response);
}

export async function listCategories(
  profileId: number,
  fetcher: typeof fetch = fetch
): Promise<BudgetCategory[]> {
  const response = await fetcher(`${API_BASE_URL}/budget/profiles/${profileId}/categories`);
  return parseResponse<BudgetCategory[]>(response);
}

export async function listCategoriesUsage(
  profileId: number,
  fetcher: typeof fetch = fetch
): Promise<BudgetCategoryUsageSummary[]> {
  const response = await fetcher(`${API_BASE_URL}/budget/profiles/${profileId}/categories/usage`);
  return parseResponse<BudgetCategoryUsageSummary[]>(response);
}

export async function getCategoryUsage(
  profileId: number,
  categoryId: number,
  fetcher: typeof fetch = fetch
): Promise<BudgetCategoryUsageDetail> {
  const response = await fetcher(
    `${API_BASE_URL}/budget/profiles/${profileId}/categories/${categoryId}/usage`
  );
  return parseResponse<BudgetCategoryUsageDetail>(response);
}

export async function deleteCategoryExpenses(
  profileId: number,
  categoryId: number,
  fetcher: typeof fetch = fetch
): Promise<BudgetCategoryUsageDetail> {
  const response = await fetcher(
    `${API_BASE_URL}/budget/profiles/${profileId}/categories/${categoryId}/expenses`,
    { method: 'DELETE' }
  );
  return parseResponse<BudgetCategoryUsageDetail>(response);
}

export async function createCategory(
  profileId: number,
  payload: { name: string; color?: string },
  fetcher: typeof fetch = fetch
): Promise<BudgetCategory> {
  const response = await fetcher(`${API_BASE_URL}/budget/profiles/${profileId}/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return parseResponse<BudgetCategory>(response);
}

export async function updateCategory(
  profileId: number,
  categoryId: number,
  payload: {
    name?: string;
    color?: string;
    scope?: BudgetCategoryScope;
    year_month?: string;
  },
  fetcher: typeof fetch = fetch
): Promise<BudgetCategory> {
  const response = await fetcher(
    `${API_BASE_URL}/budget/profiles/${profileId}/categories/${categoryId}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }
  );
  return parseResponse<BudgetCategory>(response);
}

export async function deleteCategory(
  profileId: number,
  categoryId: number,
  fetcher: typeof fetch = fetch
): Promise<void> {
  const response = await fetcher(
    `${API_BASE_URL}/budget/profiles/${profileId}/categories/${categoryId}`,
    { method: 'DELETE' }
  );
  await parseResponse<void>(response);
}

export async function listIncomeSources(
  profileId: number,
  fetcher: typeof fetch = fetch
): Promise<BudgetIncomeSource[]> {
  const response = await fetcher(`${API_BASE_URL}/budget/profiles/${profileId}/income-sources`);
  return parseResponse<BudgetIncomeSource[]>(response);
}

export async function createIncomeSource(
  profileId: number,
  payload: { name: string; recurrence_hint?: string },
  fetcher: typeof fetch = fetch
): Promise<BudgetIncomeSource> {
  const response = await fetcher(`${API_BASE_URL}/budget/profiles/${profileId}/income-sources`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return parseResponse<BudgetIncomeSource>(response);
}

export async function deleteIncomeSource(
  profileId: number,
  sourceId: number,
  fetcher: typeof fetch = fetch
): Promise<void> {
  const response = await fetcher(`${API_BASE_URL}/budget/profiles/${profileId}/income-sources/${sourceId}`, {
    method: 'DELETE'
  });
  await parseResponse<void>(response);
}

export async function stopRecurringIncomeFromMonth(
  profileId: number,
  sourceId: number,
  fromYearMonth: string,
  fetcher: typeof fetch = fetch
): Promise<BudgetIncomeSource | null> {
  const response = await fetcher(
    `${API_BASE_URL}/budget/profiles/${profileId}/income-sources/${sourceId}/stop-from/${encodeURIComponent(fromYearMonth)}`,
    { method: 'POST' }
  );
  if (response.status === 204) {
    return null;
  }
  return parseResponse<BudgetIncomeSource>(response);
}

export async function createMonthExpense(
  profileId: number,
  yearMonth: string,
  payload: {
    description: string;
    event_date: string;
    amount_brl: number;
    category_id: number;
    tag_id?: number | null;
    recurring?: boolean;
    indefinite?: boolean;
    end_year_month?: string | null;
  },
  fetcher: typeof fetch = fetch
): Promise<BudgetMonthSnapshot> {
  const response = await fetcher(`${API_BASE_URL}/budget/profiles/${profileId}/months/${yearMonth}/expenses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return parseResponse<BudgetMonthSnapshot>(response);
}

export async function listRecurringExpenses(
  profileId: number,
  fetcher: typeof fetch = fetch
): Promise<BudgetRecurringExpense[]> {
  const response = await fetcher(`${API_BASE_URL}/budget/profiles/${profileId}/recurring-expenses`);
  return parseResponse<BudgetRecurringExpense[]>(response);
}

export async function updateRecurringExpense(
  profileId: number,
  ruleId: number,
  payload: {
    description?: string;
    event_date?: string;
    amount_brl?: number;
    category_id?: number;
    tag_id?: number | null;
    indefinite?: boolean;
    end_year_month?: string | null;
  },
  fetcher: typeof fetch = fetch
): Promise<BudgetRecurringExpense> {
  const response = await fetcher(
    `${API_BASE_URL}/budget/profiles/${profileId}/recurring-expenses/${ruleId}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }
  );
  return parseResponse<BudgetRecurringExpense>(response);
}

export async function deleteRecurringExpense(
  profileId: number,
  ruleId: number,
  fetcher: typeof fetch = fetch
): Promise<void> {
  const response = await fetcher(`${API_BASE_URL}/budget/profiles/${profileId}/recurring-expenses/${ruleId}`, {
    method: 'DELETE'
  });
  await parseResponse<void>(response);
}

export async function stopRecurringExpenseFromMonth(
  profileId: number,
  ruleId: number,
  fromYearMonth: string,
  fetcher: typeof fetch = fetch
): Promise<BudgetRecurringExpense | null> {
  const response = await fetcher(
    `${API_BASE_URL}/budget/profiles/${profileId}/recurring-expenses/${ruleId}/stop-from/${encodeURIComponent(fromYearMonth)}`,
    { method: 'POST' }
  );
  if (response.status === 204) {
    return null;
  }
  return parseResponse<BudgetRecurringExpense>(response);
}

export async function getBudgetDashboard(
  profileId: number,
  focusYearMonth: string,
  options: {
    months?: 3 | 6;
    forwardMonths?: number;
    fromYearMonth?: string;
    toYearMonth?: string;
  } = {},
  fetcher: typeof fetch = fetch
): Promise<BudgetDashboard> {
  const params = new URLSearchParams({ focus: focusYearMonth });
  if (options.fromYearMonth && options.toYearMonth) {
    params.set('from', options.fromYearMonth);
    params.set('to', options.toYearMonth);
  } else {
    const months = options.months ?? 6;
    const forward = options.forwardMonths ?? months;
    params.set('months', String(months));
    params.set('forward', String(forward));
  }
  const response = await fetcher(
    `${API_BASE_URL}/budget/profiles/${profileId}/dashboard?${params.toString()}`
  );
  return parseResponse<BudgetDashboard>(response);
}

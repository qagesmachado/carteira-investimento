import { getContext, setContext } from 'svelte';
import { writable, type Writable } from 'svelte/store';

import type { BudgetProfile } from '$lib/api/budget';
import { currentYearMonth } from '$lib/features/financeiro/budgetMonth';

export type BudgetLayoutContext = {
  profiles: Writable<BudgetProfile[]>;
  activeProfileId: Writable<number | null>;
  yearMonth: Writable<string>;
  reloadProfiles: () => Promise<void>;
};

const BUDGET_LAYOUT_KEY = Symbol('budget-layout');

export function setBudgetLayoutContext(context: BudgetLayoutContext): void {
  setContext(BUDGET_LAYOUT_KEY, context);
}

export function getBudgetLayoutContext(): BudgetLayoutContext {
  return getContext<BudgetLayoutContext>(BUDGET_LAYOUT_KEY);
}

export function createBudgetLayoutStores(): BudgetLayoutContext {
  const profiles = writable<BudgetProfile[]>([]);
  const activeProfileId = writable<number | null>(null);
  const yearMonth = writable<string>(currentYearMonth());
  return {
    profiles,
    activeProfileId,
    yearMonth,
    reloadProfiles: async () => {}
  };
}

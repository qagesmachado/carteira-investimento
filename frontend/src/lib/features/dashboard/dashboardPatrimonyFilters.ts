import { writable } from 'svelte/store';

export type DashboardPatrimonyFilters = {
  includeNonInvestment: boolean;
  includePension: boolean;
};

export const DEFAULT_DASHBOARD_PATRIMONY_FILTERS: DashboardPatrimonyFilters = {
  includeNonInvestment: false,
  includePension: false
};

export const dashboardPatrimonyFilters = writable<DashboardPatrimonyFilters>(
  DEFAULT_DASHBOARD_PATRIMONY_FILTERS
);

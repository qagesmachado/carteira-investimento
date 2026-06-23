import { API_BASE_URL } from './config';
import { apiFetch } from './http';

export type SplitMode = 'shares' | 'amount';

export type ObjectiveMode = 'multi_asset' | 'single_asset' | 'pension_contribution';

export type PensionContribution = {
  plan_year: number;
  annual_gross_income_brl: number | null;
  contributed_ytd_brl: number;
  target_annual_brl: number;
  remaining_brl: number;
  months_remaining: number;
  monthly_needed_brl: number | null;
  progress_percent: number;
  target_reached: boolean;
};

export type PensionContributionSummary = {
  years: PensionContribution[];
  consolidated_total_brl: number;
};

export type ObjectiveAllocation = {
  id: number;
  slice_name: string;
  asset_id: number;
  symbol: string;
  name: string;
  asset_type: string;
  quantity: number | null;
  amount: number | null;
  split_mode: SplitMode;
  current_value_brl: number | null;
  invested_value_brl: number | null;
  profit_brl: number | null;
  profit_percent: number | null;
  exclude_from_rebalance: boolean;
  is_emergency_reserve: boolean;
};

export type PartitionSlice = {
  objective_id: number;
  objective_name: string;
  slice_name: string;
  is_default: boolean;
  exclude_from_rebalance: boolean;
  is_emergency_reserve: boolean;
  quantity: number | null;
  amount: number | null;
  current_value_brl: number | null;
  invested_value_brl: number | null;
  profit_brl: number | null;
};

export type AssetPartition = {
  asset_id: number;
  symbol: string;
  name: string;
  split_mode: SplitMode;
  position_total: number;
  free: number;
  position_current_value_brl: number | null;
  position_invested_value_brl: number | null;
  position_profit_brl: number | null;
  slices: PartitionSlice[];
};

export type AssetDivergence = {
  asset_id: number;
  symbol: string;
  name: string;
  split_mode: SplitMode;
  total: number;
  allocated_explicit: number;
  free: number;
  delta: number;
  status: 'ok' | 'over_total' | 'invalid';
};

export type Objective = {
  id: number;
  portfolio_id: number;
  name: string;
  description: string | null;
  is_default: boolean;
  mode: ObjectiveMode;
  partition_asset_id: number | null;
  allocations: ObjectiveAllocation[];
  total_value_brl: number;
  pension_contribution: PensionContributionSummary | null;
};

export type ObjectivesSnapshot = {
  portfolio_id: number;
  objectives: Objective[];
  divergences: AssetDivergence[];
  asset_partitions: AssetPartition[];
  patrimony_brl: number;
};

export type ObjectiveCreatePayload = {
  name: string;
  description?: string | null;
  mode?: ObjectiveMode;
  partition_asset_id?: number | null;
  plan_year?: number | null;
  annual_gross_income_brl?: number | null;
};

export type ObjectiveUpdatePayload = {
  name?: string;
  description?: string | null;
};

export type AllocationPurposeUpdatePayload = {
  exclude_from_rebalance?: boolean;
  is_emergency_reserve?: boolean;
};

export type PensionYearCreatePayload = {
  plan_year: number;
  annual_gross_income_brl?: number | null;
  contributed_ytd_brl?: number | null;
};

export type PensionYearUpdatePayload = {
  annual_gross_income_brl?: number | null;
  contributed_ytd_brl?: number | null;
};

export type ObjectiveAllocationItem = {
  slice_name: string;
  asset_id: number;
  quantity?: number | null;
  amount?: number | null;
  exclude_from_rebalance?: boolean;
  is_emergency_reserve?: boolean;
};

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.json() as Promise<T>;
}

export async function getObjectivesSnapshot(portfolioId: number): Promise<ObjectivesSnapshot> {
  const response = await apiFetch(`${API_BASE_URL}/portfolios/${portfolioId}/objectives`);
  return parseResponse<ObjectivesSnapshot>(response);
}

export async function createObjective(
  portfolioId: number,
  payload: ObjectiveCreatePayload
): Promise<Objective> {
  const response = await apiFetch(`${API_BASE_URL}/portfolios/${portfolioId}/objectives`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return parseResponse<Objective>(response);
}

export async function updateObjective(
  portfolioId: number,
  objectiveId: number,
  payload: ObjectiveUpdatePayload
): Promise<Objective> {
  const response = await apiFetch(
    `${API_BASE_URL}/portfolios/${portfolioId}/objectives/${objectiveId}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }
  );
  return parseResponse<Objective>(response);
}

export async function deleteObjective(portfolioId: number, objectiveId: number): Promise<void> {
  const response = await apiFetch(
    `${API_BASE_URL}/portfolios/${portfolioId}/objectives/${objectiveId}`,
    { method: 'DELETE' }
  );
  if (!response.ok) {
    throw new Error(await response.text());
  }
}

export async function replaceObjectiveAllocations(
  portfolioId: number,
  objectiveId: number,
  allocations: ObjectiveAllocationItem[]
): Promise<Objective> {
  const response = await apiFetch(
    `${API_BASE_URL}/portfolios/${portfolioId}/objectives/${objectiveId}/allocations`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ allocations })
    }
  );
  return parseResponse<Objective>(response);
}

export async function updateAllocationPurpose(
  portfolioId: number,
  objectiveId: number,
  allocationId: number,
  payload: AllocationPurposeUpdatePayload
): Promise<Objective> {
  const response = await apiFetch(
    `${API_BASE_URL}/portfolios/${portfolioId}/objectives/${objectiveId}/allocations/${allocationId}/purpose`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }
  );
  return parseResponse<Objective>(response);
}

export async function addPensionYear(
  portfolioId: number,
  objectiveId: number,
  payload: PensionYearCreatePayload
): Promise<Objective> {
  const response = await apiFetch(
    `${API_BASE_URL}/portfolios/${portfolioId}/objectives/${objectiveId}/pension-years`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }
  );
  return parseResponse<Objective>(response);
}

export async function updatePensionYear(
  portfolioId: number,
  objectiveId: number,
  planYear: number,
  payload: PensionYearUpdatePayload
): Promise<Objective> {
  const response = await apiFetch(
    `${API_BASE_URL}/portfolios/${portfolioId}/objectives/${objectiveId}/pension-years/${planYear}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }
  );
  return parseResponse<Objective>(response);
}

export async function deletePensionYear(
  portfolioId: number,
  objectiveId: number,
  planYear: number
): Promise<Objective> {
  const response = await apiFetch(
    `${API_BASE_URL}/portfolios/${portfolioId}/objectives/${objectiveId}/pension-years/${planYear}`,
    { method: 'DELETE' }
  );
  return parseResponse<Objective>(response);
}

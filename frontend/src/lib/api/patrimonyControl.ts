import { API_BASE_URL } from './config';
import { apiFetch } from './http';

export type ManualPatrimonyCategory = 'emergency_reserve';

export type ManualPatrimonyItem = {
  id: number;
  portfolio_id: number;
  category: ManualPatrimonyCategory;
  name: string;
  amount_brl: number;
  location: string | null;
  notes: string | null;
};

export type LinkedEmergencyReserveItem = {
  asset_id: number;
  symbol: string;
  objective_id: number;
  objective_name: string;
  amount_brl: number;
  location: string;
};

export type PatrimonyControlSnapshot = {
  portfolio_id: number;
  invested_portfolio_brl: number;
  invested_excluding_emergency_brl: number;
  linked_emergency_reserve_brl: number;
  manual_items: ManualPatrimonyItem[];
  linked_emergency_reserve_items: LinkedEmergencyReserveItem[];
  total_emergency_reserve_brl: number;
  total_manual_brl: number;
  total_patrimony_brl: number;
};

export type ManualPatrimonyItemCreate = {
  category: ManualPatrimonyCategory;
  name: string;
  amount_brl: number;
  location?: string | null;
  notes?: string | null;
};

export type ManualPatrimonyItemUpdate = Partial<ManualPatrimonyItemCreate>;

function portfolioBase(portfolioId: number): string {
  return `${API_BASE_URL}/portfolios/${portfolioId}`;
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.json() as Promise<T>;
}

export async function getPatrimonyControlSnapshot(
  portfolioId: number
): Promise<PatrimonyControlSnapshot> {
  const response = await apiFetch(`${portfolioBase(portfolioId)}/patrimony-control`);
  return parseResponse<PatrimonyControlSnapshot>(response);
}

export async function createManualPatrimonyItem(
  portfolioId: number,
  payload: ManualPatrimonyItemCreate
): Promise<ManualPatrimonyItem> {
  const response = await apiFetch(`${portfolioBase(portfolioId)}/manual-patrimony-items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return parseResponse<ManualPatrimonyItem>(response);
}

export async function updateManualPatrimonyItem(
  portfolioId: number,
  itemId: number,
  payload: ManualPatrimonyItemUpdate
): Promise<ManualPatrimonyItem> {
  const response = await apiFetch(
    `${portfolioBase(portfolioId)}/manual-patrimony-items/${itemId}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }
  );
  return parseResponse<ManualPatrimonyItem>(response);
}

export async function deleteManualPatrimonyItem(
  portfolioId: number,
  itemId: number
): Promise<void> {
  const response = await apiFetch(
    `${portfolioBase(portfolioId)}/manual-patrimony-items/${itemId}`,
    { method: 'DELETE' }
  );
  if (!response.ok) {
    throw new Error(await response.text());
  }
}

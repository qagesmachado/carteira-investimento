import { API_BASE_URL } from './config';
import { apiFetch } from './http';

export type PropertyType =
  | 'casa'
  | 'lote'
  | 'apartamento'
  | 'galpao'
  | 'sala_comercial';

export type EntryType = 'income' | 'expense';

export type EventCategory =
  | 'aluguel'
  | 'financiamento'
  | 'outras_taxas'
  | 'entrada_financiamento';

export type FinancingSummaryMetrics = {
  total_income_brl: number;
  total_expenses_brl: number;
  profit_brl: number;
  capital_invested_brl: number;
};

export type FinancingEntry = {
  id: number;
  event_date: string;
  entry_type: EntryType;
  event_category: EventCategory;
  description: string;
  amount_brl: number;
};

export type FinancingEntryTemplate = {
  id: number;
  name: string;
  entry_type: EntryType;
  event_category: EventCategory;
  description: string;
  amount_brl: number;
  sort_order: number;
};

export type PropertyFinancing = {
  id: number;
  portfolio_id: number;
  name: string;
  property_type: PropertyType;
  description: string | null;
  entries: FinancingEntry[];
  entry_templates: FinancingEntryTemplate[];
  metrics: FinancingSummaryMetrics;
};

export type TimelineRow = {
  label: string;
  year: number;
  month: number | null;
  income_brl: number;
  expenses_brl: number;
};

export type PropertyFinancingConsolidated = {
  financing_count: number;
  metrics: FinancingSummaryMetrics;
  monthly_timeline: TimelineRow[];
  annual_timeline: TimelineRow[];
};

export type PropertyFinancingSnapshot = {
  portfolio_id: number;
  financings: PropertyFinancing[];
  consolidated: PropertyFinancingConsolidated;
};

export type PropertyFinancingCreate = {
  name: string;
  property_type: PropertyType;
  description?: string | null;
};

export type PropertyFinancingUpdate = Partial<PropertyFinancingCreate>;

export type FinancingEntryCreate = {
  event_date: string;
  entry_type: EntryType;
  event_category: EventCategory;
  description: string;
  amount_brl: number;
};

export type FinancingEntryUpdate = Partial<FinancingEntryCreate>;

export type FinancingEntryTemplateCreate = {
  name: string;
  entry_type: EntryType;
  event_category: EventCategory;
  description: string;
  amount_brl: number;
};

export type FinancingEntryTemplateUpdate = Partial<
  Omit<FinancingEntryTemplateCreate, 'name'>
> & {
  name?: string;
};

function baseUrl(portfolioId: number): string {
  return `${API_BASE_URL}/portfolios/${portfolioId}/property-financings`;
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.json() as Promise<T>;
}

export async function getPropertyFinancingSnapshot(
  portfolioId: number
): Promise<PropertyFinancingSnapshot> {
  const response = await apiFetch(`${baseUrl(portfolioId)}`);
  return parseResponse<PropertyFinancingSnapshot>(response);
}

export async function createPropertyFinancing(
  portfolioId: number,
  payload: PropertyFinancingCreate
): Promise<PropertyFinancing> {
  const response = await apiFetch(`${baseUrl(portfolioId)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return parseResponse<PropertyFinancing>(response);
}

export async function updatePropertyFinancing(
  portfolioId: number,
  financingId: number,
  payload: PropertyFinancingUpdate
): Promise<PropertyFinancing> {
  const response = await apiFetch(`${baseUrl(portfolioId)}/${financingId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return parseResponse<PropertyFinancing>(response);
}

export async function deletePropertyFinancing(
  portfolioId: number,
  financingId: number
): Promise<void> {
  const response = await apiFetch(`${baseUrl(portfolioId)}/${financingId}`, { method: 'DELETE' });
  if (!response.ok) {
    throw new Error(await response.text());
  }
}

export async function createFinancingEntry(
  portfolioId: number,
  financingId: number,
  payload: FinancingEntryCreate
): Promise<FinancingEntry> {
  const response = await apiFetch(`${baseUrl(portfolioId)}/${financingId}/entries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return parseResponse<FinancingEntry>(response);
}

export async function updateFinancingEntry(
  portfolioId: number,
  entryId: number,
  payload: FinancingEntryUpdate
): Promise<FinancingEntry> {
  const response = await apiFetch(`${baseUrl(portfolioId)}/entries/${entryId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return parseResponse<FinancingEntry>(response);
}

export async function deleteFinancingEntry(
  portfolioId: number,
  entryId: number
): Promise<void> {
  const response = await apiFetch(`${baseUrl(portfolioId)}/entries/${entryId}`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    throw new Error(await response.text());
  }
}

export async function createFinancingEntryTemplate(
  portfolioId: number,
  financingId: number,
  payload: FinancingEntryTemplateCreate
): Promise<FinancingEntryTemplate> {
  const response = await apiFetch(
    `${baseUrl(portfolioId)}/${financingId}/entry-templates`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }
  );
  return parseResponse<FinancingEntryTemplate>(response);
}

export async function updateFinancingEntryTemplate(
  portfolioId: number,
  templateId: number,
  payload: FinancingEntryTemplateUpdate
): Promise<FinancingEntryTemplate> {
  const response = await apiFetch(`${baseUrl(portfolioId)}/entry-templates/${templateId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return parseResponse<FinancingEntryTemplate>(response);
}

export async function deleteFinancingEntryTemplate(
  portfolioId: number,
  templateId: number
): Promise<void> {
  const response = await apiFetch(`${baseUrl(portfolioId)}/entry-templates/${templateId}`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    throw new Error(await response.text());
  }
}

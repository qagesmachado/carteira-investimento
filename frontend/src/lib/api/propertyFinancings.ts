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
  profile_id: number;
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
  profile_id: number;
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

function baseUrl(profileId: number): string {
  return `${API_BASE_URL}/budget/profiles/${profileId}/property-financings`;
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.json() as Promise<T>;
}

export async function getPropertyFinancingSnapshot(
  profileId: number
): Promise<PropertyFinancingSnapshot> {
  const response = await apiFetch(`${baseUrl(profileId)}`);
  return parseResponse<PropertyFinancingSnapshot>(response);
}

export async function createPropertyFinancing(
  profileId: number,
  payload: PropertyFinancingCreate
): Promise<PropertyFinancing> {
  const response = await apiFetch(`${baseUrl(profileId)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return parseResponse<PropertyFinancing>(response);
}

export async function updatePropertyFinancing(
  profileId: number,
  financingId: number,
  payload: PropertyFinancingUpdate
): Promise<PropertyFinancing> {
  const response = await apiFetch(`${baseUrl(profileId)}/${financingId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return parseResponse<PropertyFinancing>(response);
}

export async function deletePropertyFinancing(
  profileId: number,
  financingId: number
): Promise<void> {
  const response = await apiFetch(`${baseUrl(profileId)}/${financingId}`, { method: 'DELETE' });
  if (!response.ok) {
    throw new Error(await response.text());
  }
}

export async function createFinancingEntry(
  profileId: number,
  financingId: number,
  payload: FinancingEntryCreate
): Promise<FinancingEntry> {
  const response = await apiFetch(`${baseUrl(profileId)}/${financingId}/entries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return parseResponse<FinancingEntry>(response);
}

export async function updateFinancingEntry(
  profileId: number,
  entryId: number,
  payload: FinancingEntryUpdate
): Promise<FinancingEntry> {
  const response = await apiFetch(`${baseUrl(profileId)}/entries/${entryId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return parseResponse<FinancingEntry>(response);
}

export async function deleteFinancingEntry(
  profileId: number,
  entryId: number
): Promise<void> {
  const response = await apiFetch(`${baseUrl(profileId)}/entries/${entryId}`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    throw new Error(await response.text());
  }
}

export async function createFinancingEntryTemplate(
  profileId: number,
  financingId: number,
  payload: FinancingEntryTemplateCreate
): Promise<FinancingEntryTemplate> {
  const response = await apiFetch(
    `${baseUrl(profileId)}/${financingId}/entry-templates`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }
  );
  return parseResponse<FinancingEntryTemplate>(response);
}

export async function updateFinancingEntryTemplate(
  profileId: number,
  templateId: number,
  payload: FinancingEntryTemplateUpdate
): Promise<FinancingEntryTemplate> {
  const response = await apiFetch(`${baseUrl(profileId)}/entry-templates/${templateId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return parseResponse<FinancingEntryTemplate>(response);
}

export async function deleteFinancingEntryTemplate(
  profileId: number,
  templateId: number
): Promise<void> {
  const response = await apiFetch(`${baseUrl(profileId)}/entry-templates/${templateId}`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    throw new Error(await response.text());
  }
}

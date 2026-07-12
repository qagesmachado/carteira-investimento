import type { EntryType, EventCategory } from '$lib/api/propertyFinancings';

export const ENTRY_TYPE_OPTIONS: { value: EntryType; label: string }[] = [
  { value: 'income', label: 'Receita' },
  { value: 'expense', label: 'Despesa' }
];

export const INCOME_EVENT_OPTIONS: { value: EventCategory; label: string }[] = [
  { value: 'aluguel', label: 'Aluguel' }
];

export const EXPENSE_EVENT_OPTIONS: { value: EventCategory; label: string }[] = [
  { value: 'financiamento', label: 'Financiamento' },
  { value: 'outras_taxas', label: 'Outras taxas' },
  { value: 'entrada_financiamento', label: 'Entrada do financiamento' }
];

export function eventOptionsForType(entryType: EntryType) {
  return entryType === 'income' ? INCOME_EVENT_OPTIONS : EXPENSE_EVENT_OPTIONS;
}

export function formatEntryType(entryType: EntryType): string {
  return entryType === 'income' ? 'Receita' : 'Despesa';
}

export function formatEventCategory(category: EventCategory): string {
  const all = [...INCOME_EVENT_OPTIONS, ...EXPENSE_EVENT_OPTIONS];
  return all.find((option) => option.value === category)?.label ?? category;
}

export function defaultEventCategoryForType(entryType: EntryType): EventCategory {
  return entryType === 'income' ? 'aluguel' : 'financiamento';
}

export function normalizeEventCategoryForType(
  entryType: EntryType,
  eventCategory: EventCategory
): EventCategory {
  return eventOptionsForType(entryType).some((option) => option.value === eventCategory)
    ? eventCategory
    : defaultEventCategoryForType(entryType);
}

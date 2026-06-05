import type { FinancingEntry } from '$lib/api/propertyFinancings';

import { formatEntryType, formatEventCategory } from './eventLabels';

export type FinancingEntrySortKey =
  | 'event_date'
  | 'entry_type'
  | 'event_category'
  | 'description'
  | 'amount_brl';

export type SortDirection = 'asc' | 'desc';

export function sortFinancingEntries(
  entries: FinancingEntry[],
  key: FinancingEntrySortKey,
  direction: SortDirection
): FinancingEntry[] {
  const factor = direction === 'asc' ? 1 : -1;
  return [...entries].sort((a, b) => {
    let cmp = 0;
    switch (key) {
      case 'event_date':
        cmp = a.event_date.localeCompare(b.event_date);
        break;
      case 'entry_type':
        cmp = formatEntryType(a.entry_type).localeCompare(formatEntryType(b.entry_type), 'pt-BR');
        break;
      case 'event_category':
        cmp = formatEventCategory(a.event_category).localeCompare(
          formatEventCategory(b.event_category),
          'pt-BR'
        );
        break;
      case 'description':
        cmp = a.description.localeCompare(b.description, 'pt-BR');
        break;
      case 'amount_brl':
        cmp = a.amount_brl - b.amount_brl;
        break;
      default:
        cmp = 0;
    }
    if (cmp === 0 && key !== 'event_date') {
      cmp = b.event_date.localeCompare(a.event_date);
    }
    return cmp * factor;
  });
}

export function toggleSortDirection(direction: SortDirection): SortDirection {
  return direction === 'asc' ? 'desc' : 'asc';
}

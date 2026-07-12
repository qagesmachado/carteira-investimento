import type {
  EntryType,
  EventCategory,
  FinancingEntryCreate,
  FinancingEntryTemplate
} from '$lib/api/propertyFinancings';

import { normalizeEventCategoryForType } from './eventLabels';

export type FinancingEntryTemplateFields = Pick<
  FinancingEntryCreate,
  'entry_type' | 'event_category' | 'description' | 'amount_brl'
>;

export type FinancingEntryTemplateFormFields = FinancingEntryTemplateFields;

export function applyFinancingEntryTemplate(
  template: FinancingEntryTemplate
): FinancingEntryTemplateFields {
  return {
    entry_type: template.entry_type,
    event_category: template.event_category,
    description: template.description,
    amount_brl: template.amount_brl
  };
}

export type BuildTemplateFromFormResult =
  | { ok: true; fields: FinancingEntryTemplateFormFields }
  | { ok: false; error: string };

export function buildTemplateFromFormFields(
  fields: {
    entryType: EntryType;
    eventCategory: EventCategory;
    description: string;
    amountBrl: number;
  }
): BuildTemplateFromFormResult {
  if (!fields.description.trim()) {
    return { ok: false, error: 'Informe a descrição.' };
  }
  if (!Number.isFinite(fields.amountBrl) || fields.amountBrl <= 0) {
    return { ok: false, error: 'Informe um valor maior que zero.' };
  }
  return {
    ok: true,
    fields: {
      entry_type: fields.entryType,
      event_category: normalizeEventCategoryForType(fields.entryType, fields.eventCategory),
      description: fields.description.trim(),
      amount_brl: fields.amountBrl
    }
  };
}

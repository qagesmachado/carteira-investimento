import type { PropertyType } from '$lib/api/propertyFinancings';

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  casa: 'Casa',
  lote: 'Lote',
  apartamento: 'Apartamento',
  galpao: 'Galpão',
  sala_comercial: 'Sala comercial'
};

export function formatPropertyType(type: PropertyType): string {
  return PROPERTY_TYPE_LABELS[type] ?? type;
}

export const PROPERTY_TYPE_OPTIONS = Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => ({
  value: value as PropertyType,
  label
}));

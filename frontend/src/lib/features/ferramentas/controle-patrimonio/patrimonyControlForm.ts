import type { ManualPatrimonyCategory } from '$lib/api/patrimonyControl';

export type EmergencyReserveLocation = 'banco' | 'dinheiro_especie' | 'corretora';

export const EMERGENCY_RESERVE_LOCATION_OPTIONS: {
  value: EmergencyReserveLocation;
  label: string;
}[] = [
  { value: 'banco', label: 'Banco' },
  { value: 'dinheiro_especie', label: 'Dinheiro em espécie' },
  { value: 'corretora', label: 'Corretora' }
];

export const EMERGENCY_RESERVE_LOCATION_LABELS: Record<EmergencyReserveLocation, string> = {
  banco: 'Banco',
  dinheiro_especie: 'Dinheiro em espécie',
  corretora: 'Corretora'
};

export function formatEmergencyReserveLocation(value: string | null | undefined): string {
  if (!value) {
    return '—';
  }
  return (
    EMERGENCY_RESERVE_LOCATION_LABELS[value as EmergencyReserveLocation] ?? value
  );
}

export function isEmergencyReserveLocation(value: string): value is EmergencyReserveLocation {
  return value in EMERGENCY_RESERVE_LOCATION_LABELS;
}

export const MANUAL_PATRIMONY_CATEGORY_LABELS: Record<ManualPatrimonyCategory, string> = {
  emergency_reserve: 'Reserva de emergência'
};

export type ManualPatrimonyFormValues = {
  category: ManualPatrimonyCategory;
  name: string;
  amount_brl: string;
  location: EmergencyReserveLocation | '';
  notes: string;
};

export function validateManualPatrimonyForm(
  values: ManualPatrimonyFormValues
): string | null {
  const name = values.name.trim();
  if (!name) {
    return 'Informe um nome.';
  }
  const amount = Number(values.amount_brl.replace(',', '.'));
  if (!Number.isFinite(amount) || amount <= 0) {
    return 'Informe um valor maior que zero.';
  }
  if (values.category === 'emergency_reserve' && !values.location) {
    return 'Selecione a localização.';
  }
  return null;
}

export function parseAmountBrl(value: string): number {
  return Number(value.replace(',', '.'));
}

export function pctOfPatrimony(value: number, total: number): string {
  if (!total || total <= 0) {
    return '—';
  }
  return `${((value / total) * 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  })}%`;
}

export function pctOfEmergencyReserve(value: number, emergencyTotal: number): string {
  if (!emergencyTotal || emergencyTotal <= 0) {
    return '—';
  }
  return `${((value / emergencyTotal) * 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  })}%`;
}

export const LINKED_EMERGENCY_RESERVE_OBSERVATION =
  'Atualizado automaticamente pelos objetivos financeiros (fatia marcada como reserva).';

export function formatLinkedEmergencyReserveObservation(sliceName?: string | null): string {
  if (sliceName?.trim()) {
    return `${LINKED_EMERGENCY_RESERVE_OBSERVATION} Fatia: ${sliceName.trim()}.`;
  }
  return LINKED_EMERGENCY_RESERVE_OBSERVATION;
}

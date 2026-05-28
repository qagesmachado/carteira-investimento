import type { SplitMode } from './splitMode';

export type AllocationDraft = {
  slice_name: string;
  asset_id: number;
  quantity?: number | null;
  amount?: number | null;
};

export type ValidateAllocationsResult =
  | { ok: true; free: number }
  | { ok: false; message: string };

export function validateAllocationDraft(
  splitMode: SplitMode,
  total: number,
  explicitOthers: number,
  draftValue: number
): ValidateAllocationsResult {
  if (!Number.isFinite(draftValue) || draftValue <= 0) {
    return { ok: false, message: 'Informe um valor positivo.' };
  }

  const combined = explicitOthers + draftValue;
  if (combined > total + 1e-9) {
    const unit = splitMode === 'amount' ? 'R$' : 'cotas';
    return {
      ok: false,
      message: `Soma excede o total (${combined.toFixed(2)} ${unit} > ${total.toFixed(2)} ${unit}).`
    };
  }

  return { ok: true, free: total - combined };
}

export function buildAllocationPayload(
  splitMode: SplitMode,
  sliceName: string,
  assetId: number,
  value: number
): AllocationDraft {
  const base = { slice_name: sliceName.trim(), asset_id: assetId };
  if (splitMode === 'amount') {
    return { ...base, amount: value };
  }
  return { ...base, quantity: value };
}

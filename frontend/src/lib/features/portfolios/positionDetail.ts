import type { Asset } from '$lib/api/assets';
import type { Position } from '$lib/api/portfolios';
import { formatMoneyAmount, formatSectorForDisplay } from '$lib/assetLabels';
import {
  computePositionProfit,
  formatPositionProfit,
  formatQuantityForDisplay,
  positionCurrentValue,
  positionInvestedValue,
  usesManualPositionValues,
  valueInBrl
} from './positionMetrics';

export type PositionDetailItem = {
  label: string;
  value: string;
  hint?: string;
};

export type PositionDetailSections = {
  pricing: PositionDetailItem[];
  totals: PositionDetailItem[];
  metadata: PositionDetailItem[];
  dividendsLabel: string;
  dividendsValue: string;
};

function formatUnitPrice(value: number | null | undefined, currency: string): string {
  if (value == null || !Number.isFinite(value)) {
    return '—';
  }
  return formatMoneyAmount(value, currency);
}

function maybeBrlEquivalent(
  amount: number | null | undefined,
  currency: string,
  usdBrlRate: number | null | undefined,
  enabled: boolean
): string | undefined {
  if (!enabled || currency.trim().toUpperCase() !== 'USD') {
    return undefined;
  }
  const brl = valueInBrl(amount, currency, usdBrlRate);
  if (brl == null) {
    return 'Atualize o câmbio USD/BRL para ver o equivalente em reais';
  }
  return `≈ ${formatMoneyAmount(brl, 'BRL')}`;
}

function pushIf(items: PositionDetailItem[], label: string, value: string, hint?: string): void {
  const trimmed = value.trim();
  if (trimmed && trimmed !== '—') {
    items.push({ label, value, hint });
  }
}

export function buildPositionDetailSections(
  position: Position,
  asset: Asset,
  options?: { usdBrlRate?: number | null; showBrlEquivalentHints?: boolean }
): PositionDetailSections {
  const usdBrlRate = options?.usdBrlRate;
  const brlHints = options?.showBrlEquivalentHints === true;
  const currency = asset.currency;
  const pricing: PositionDetailItem[] = [];
  const totals: PositionDetailItem[] = [];
  const metadata: PositionDetailItem[] = [];

  if (usesManualPositionValues(asset)) {
    pricing.push({
      label: 'Preço médio de compra',
      value: '—',
      hint: 'Não se aplica a renda fixa ou previdência'
    });
    pricing.push({
      label: 'Preço atual (cotação)',
      value: '—',
      hint: 'Não se aplica a renda fixa ou previdência'
    });
    pushIf(totals, 'Valor aplicado', formatUnitPrice(position.invested_amount, currency));
    pushIf(totals, 'Valor atual', formatUnitPrice(position.current_value, currency));
    pushIf(totals, 'Rendimento contratado', position.contracted_yield?.trim() ?? '—');
  } else {
    const avgPrice = position.average_price;
    const quote = asset.current_quote;
    pricing.push({
      label: 'Preço médio de compra',
      value: formatUnitPrice(avgPrice, currency),
      hint: maybeBrlEquivalent(avgPrice, currency, usdBrlRate, brlHints)
    });
    if (quote == null) {
      pricing.push({
        label: 'Preço atual (cotação)',
        value: '—',
        hint: 'Atualize as cotações para ver o preço unitário'
      });
    } else {
      pricing.push({
        label: 'Preço atual (cotação)',
        value: formatUnitPrice(quote, currency),
        hint: maybeBrlEquivalent(quote, currency, usdBrlRate, brlHints)
      });
    }
    pricing.push({
      label: 'Quantidade',
      value: formatQuantityForDisplay(position.quantity)
    });
    const invested = positionInvestedValue(position, asset);
    const current = positionCurrentValue(position, asset);
    pushIf(
      totals,
      'Valor aplicado (total)',
      invested != null ? formatUnitPrice(invested, currency) : '—',
      invested != null ? maybeBrlEquivalent(invested, currency, usdBrlRate, brlHints) : undefined
    );
    pushIf(
      totals,
      'Valor atual (total)',
      current != null ? formatUnitPrice(current, currency) : '—',
      current != null ? maybeBrlEquivalent(current, currency, usdBrlRate, brlHints) : undefined
    );
    const profit = computePositionProfit(position, asset);
    if (profit != null) {
      totals.push({
        label: 'Lucro',
        value: formatPositionProfit(position, asset)
      });
    }
  }

  if (asset.sector?.trim()) {
    pushIf(metadata, 'Setor', formatSectorForDisplay(asset.sector));
  }
  if (position.custody?.trim()) {
    pushIf(metadata, 'Custódia', position.custody.trim());
  }
  if (position.entry_date?.trim()) {
    const d = position.entry_date.trim();
    const formatted = /^\d{4}-\d{2}-\d{2}/.test(d)
      ? new Date(`${d}T12:00:00`).toLocaleDateString('pt-BR')
      : d;
    pushIf(metadata, 'Data de entrada', formatted);
  }
  if (position.linked_objective?.trim()) {
    pushIf(metadata, 'Objetivo vinculado', position.linked_objective.trim());
  }
  if (position.notes?.trim()) {
    pushIf(metadata, 'Notas', position.notes.trim());
  }

  return {
    pricing,
    totals,
    metadata,
    dividendsLabel: 'Dividendos recebidos',
    dividendsValue: 'Em breve'
  };
}

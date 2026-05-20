import type { Asset, AssetType } from '$lib/api/assets';
import type { Position } from '$lib/api/portfolios';
import {
  formatAssetTypeForDisplay,
  formatCurrencyCodeForDisplay,
  formatMoneyAmount
} from '$lib/assetLabels';
import { formatBrDecimalDisplay } from '$lib/brDecimal';

const QUANTITY_FORMATTER = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 8
});

export function usesManualPositionValues(asset: Asset): boolean {
  return asset.asset_type === 'fixed_income' || asset.asset_type === 'pension';
}

export function positionInvestedValue(position: Position, asset: Asset | undefined): number | null {
  if (asset && usesManualPositionValues(asset)) {
    return position.invested_amount ?? null;
  }
  return position.quantity * position.average_price;
}

export function positionCurrentValue(position: Position, asset: Asset | undefined): number | null {
  if (asset && usesManualPositionValues(asset)) {
    return position.current_value ?? null;
  }
  if (asset?.current_quote == null) {
    return null;
  }
  return position.quantity * asset.current_quote;
}

export function formatQuantityForDisplay(quantity: number): string {
  if (!Number.isFinite(quantity)) {
    return '—';
  }
  return QUANTITY_FORMATTER.format(quantity);
}

export type PositionProfit = {
  profit: number;
  percent: number;
} | null;

export function computePositionProfit(
  position: Position,
  asset: Asset | undefined
): PositionProfit {
  const invested = positionInvestedValue(position, asset);
  const current = positionCurrentValue(position, asset);
  if (invested == null || current == null || invested <= 0) {
    return null;
  }
  const profit = current - invested;
  return { profit, percent: (profit / invested) * 100 };
}

export function formatPositionProfit(position: Position, asset: Asset | undefined): string {
  if (!asset) {
    return '—';
  }
  const result = computePositionProfit(position, asset);
  if (!result) {
    return '—';
  }
  return `${formatMoneyAmount(result.profit, asset.currency)} (${result.percent.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}%)`;
}

export type CurrencyTotals = {
  currency: string;
  invested: number;
  current: number;
  profit: number;
};

export type PortfolioSummary = {
  countByType: { type: AssetType; label: string; count: number }[];
  totalsByCurrency: CurrencyTotals[];
};

/** Equivalente em BRL para exibição (apresentacional). BRL 1:1; USD × taxa; demais moedas → null. */
export function valueInBrl(
  amount: number | null | undefined,
  currency: string | undefined,
  usdBrlRate: number | null | undefined
): number | null {
  if (amount == null || !Number.isFinite(amount)) {
    return null;
  }
  const c = currency?.trim().toUpperCase();
  if (!c) {
    return null;
  }
  if (c === 'BRL') {
    return amount;
  }
  if (c === 'USD') {
    if (usdBrlRate == null || !Number.isFinite(usdBrlRate) || usdBrlRate <= 0) {
      return null;
    }
    return amount * usdBrlRate;
  }
  return null;
}

/** Posição em USD com valor na moeda original — exibir ícone com tooltip (ex.: internacional). */
export function shouldShowNativeCurrencyHint(
  asset: { currency?: string },
  nativeValue: number | null | undefined
): boolean {
  if (nativeValue == null) {
    return false;
  }
  return asset.currency?.trim().toUpperCase() === 'USD';
}

export function nativeCurrencyHintLabel(
  asset: { currency?: string },
  nativeValue: number
): string {
  const currency = asset.currency?.trim().toUpperCase() ?? '';
  return `Moeda original — ${formatMoneyAmount(nativeValue, currency)} (${formatCurrencyCodeForDisplay(currency)})`;
}

/** Posição em USD com equivalente BRL — exibir ícone com tooltip na tabela consolidada. */
export function shouldShowBrlEquivalentHint(
  asset: { currency?: string },
  brlValue: number | null | undefined
): boolean {
  if (brlValue == null) {
    return false;
  }
  return asset.currency?.trim().toUpperCase() === 'USD';
}

export function brlEquivalentHintLabel(brlValue: number): string {
  return `Equivalente em reais — ${formatMoneyAmount(brlValue, 'BRL')}`;
}

export function computePortfolioSummary(
  positions: Position[],
  assetById: Record<number, Asset>
): PortfolioSummary {
  const typeCounts = new Map<AssetType, number>();
  const currencyMap = new Map<string, CurrencyTotals>();

  for (const position of positions) {
    const asset = assetById[position.asset_id];
    if (!asset) {
      continue;
    }

    typeCounts.set(asset.asset_type, (typeCounts.get(asset.asset_type) ?? 0) + 1);

    const invested = positionInvestedValue(position, asset);
    const current = positionCurrentValue(position, asset);
    if (invested == null || current == null) {
      continue;
    }

    const currency = asset.currency;
    const existing = currencyMap.get(currency) ?? {
      currency,
      invested: 0,
      current: 0,
      profit: 0
    };
    existing.invested += invested;
    existing.current += current;
    existing.profit += current - invested;
    currencyMap.set(currency, existing);
  }

  const countByType = [...typeCounts.entries()]
    .map(([type, count]) => ({
      type,
      label: formatAssetTypeForDisplay(type),
      count
    }))
    .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'));

  const totalsByCurrency = [...currencyMap.values()].sort((a, b) =>
    a.currency.localeCompare(b.currency, 'pt-BR')
  );

  return { countByType, totalsByCurrency };
}

/** @deprecated use formatQuantityForDisplay */
export function formatBrDecimalQuantity(value: number): string {
  return formatBrDecimalDisplay(value);
}

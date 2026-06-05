import { formatMoneyAmount } from '$lib/assetLabels';

export type CryptoFeeDetailSummary = {
  profitAfterFeesBrl: number | null;
  appreciationAfterFeesPercent: number | null;
  totalFeesBrl: number;
  totalFeesUsd: number;
};

function formatPercent(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) {
    return '';
  }
  return `${value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}%`;
}

/** Exibe lucro após taxas no painel de detalhes (consolidada / cripto). */
export function formatCryptoProfitAfterFees(
  summary: CryptoFeeDetailSummary,
  currency: string,
  usdBrlRate: number | null | undefined,
  showBrlHints: boolean
): { value: string; hint?: string } {
  const { profitAfterFeesBrl, appreciationAfterFeesPercent, totalFeesBrl, totalFeesUsd } =
    summary;

  const feesHint =
    totalFeesBrl > 0 || totalFeesUsd > 0
      ? `Taxas pagas: ${formatMoneyAmount(totalFeesUsd, 'USD')} (≈ ${formatMoneyAmount(totalFeesBrl, 'BRL')})`
      : undefined;

  if (profitAfterFeesBrl == null || !Number.isFinite(profitAfterFeesBrl)) {
    const hints = [feesHint, showBrlHints ? 'Atualize as cotações para calcular o lucro após taxas' : undefined]
      .filter(Boolean)
      .join(' · ');
    return { value: '—', hint: hints || undefined };
  }

  const pctSuffix = (() => {
    const pct = formatPercent(appreciationAfterFeesPercent);
    return pct ? ` (${pct})` : '';
  })();

  const cur = currency.trim().toUpperCase();
  if (cur === 'USD' && showBrlHints && usdBrlRate != null && usdBrlRate > 0) {
    const profitUsd = profitAfterFeesBrl / usdBrlRate;
    const value = `${formatMoneyAmount(profitUsd, 'USD')}${pctSuffix}`;
    const hints = [`≈ ${formatMoneyAmount(profitAfterFeesBrl, 'BRL')}`, feesHint].filter(Boolean);
    return { value, hint: hints.join(' · ') };
  }

  const value = `${formatMoneyAmount(profitAfterFeesBrl, currency)}${pctSuffix}`;
  return { value, hint: feesHint };
}

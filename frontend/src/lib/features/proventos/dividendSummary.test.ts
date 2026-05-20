import { describe, expect, it } from 'vitest';

import type { Asset } from '$lib/api/assets';
import type { DividendPayment } from '$lib/api/dividendPayments';

import {
  buildDividendTotalsByAssetId,
  formatDividendPaymentsTotalAmounts,
  formatDividendPaymentsTotalLabel,
  formatDividendsReceivedSummary,
  summarizeDividendPayments
} from './dividendSummary';

const brAsset: Asset = {
  id: 1,
  symbol: 'CAML3',
  name: 'Camil',
  asset_type: 'stock',
  market: 'national',
  country: 'BR',
  currency: 'BRL',
  display_class: 'stocks'
};

const usAsset: Asset = {
  ...brAsset,
  id: 2,
  symbol: 'VOO',
  currency: 'USD',
  market: 'international',
  display_class: 'international'
};

const payments: DividendPayment[] = [
  {
    id: 1,
    asset_id: 1,
    payment_type: 'dividend',
    payment_date: '2025-01-15',
    amount: 100,
    currency: 'BRL',
    symbol: 'CAML3',
    asset_name: 'Camil',
    market: 'national',
    display_class: 'stocks'
  },
  {
    id: 2,
    asset_id: 1,
    payment_type: 'dividend',
    payment_date: '2025-06-15',
    amount: 50.5,
    currency: 'BRL',
    symbol: 'CAML3',
    asset_name: 'Camil',
    market: 'national',
    display_class: 'stocks'
  },
  {
    id: 3,
    asset_id: 2,
    payment_type: 'dividend',
    payment_date: '2025-03-01',
    amount: 12.34,
    currency: 'USD',
    symbol: 'VOO',
    asset_name: 'Vanguard',
    market: 'international',
    display_class: 'international'
  }
];

describe('dividendSummary', () => {
  it('agrega totais por asset_id e moeda', () => {
    const map = buildDividendTotalsByAssetId(payments);
    expect(map.get(1)?.count).toBe(2);
    expect(map.get(1)?.totalByCurrency.BRL).toBeCloseTo(150.5);
    expect(map.get(2)?.totalByCurrency.USD).toBeCloseTo(12.34);
  });

  it('formata resumo com contagem quando há múltiplos lançamentos', () => {
    const map = buildDividendTotalsByAssetId(payments);
    const summary = formatDividendsReceivedSummary(map.get(1), brAsset);
    expect(summary).toContain('R$');
    expect(summary).toContain('2 lançamentos');
  });

  it('formata resumo USD sem contagem para um lançamento', () => {
    const map = buildDividendTotalsByAssetId(payments);
    const summary = formatDividendsReceivedSummary(map.get(2), usAsset);
    expect(summary).toMatch(/US\$/);
    expect(summary).not.toContain('lançamentos');
  });

  it('retorna mensagem quando não há proventos', () => {
    expect(formatDividendsReceivedSummary(undefined, brAsset)).toBe('Nenhum provento cadastrado');
  });

  it('resume totais filtrados por moeda', () => {
    const totals = summarizeDividendPayments(payments);
    expect(totals.count).toBe(3);
    expect(totals.totalByCurrency.BRL).toBeCloseTo(150.5);
    expect(totals.totalByCurrency.USD).toBeCloseTo(12.34);
    expect(formatDividendPaymentsTotalLabel(totals)).toBe('Total (3 lançamentos)');
    expect(formatDividendPaymentsTotalAmounts(totals)).toContain('R$');
    expect(formatDividendPaymentsTotalAmounts(totals)).toContain('US$');
  });
});

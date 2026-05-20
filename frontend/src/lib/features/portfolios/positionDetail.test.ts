import { describe, expect, it } from 'vitest';

import type { Asset } from '$lib/api/assets';
import type { Position } from '$lib/api/portfolios';

import { buildPositionDetailSections } from './positionDetail';

const stockAsset: Asset = {
  id: 1,
  symbol: 'BBSE3',
  name: 'BB Seguridade',
  asset_type: 'stock',
  market: 'national',
  country: 'BR',
  currency: 'BRL',
  display_class: 'stocks',
  current_quote: 35.5,
  sector: 'Financial Services'
};

const stockPosition: Position = {
  id: 1,
  portfolio_id: 1,
  asset_id: 1,
  quantity: 100,
  average_price: 32.5,
  status: 'active',
  created_at: '',
  updated_at: ''
};

const rfAsset: Asset = {
  id: 2,
  symbol: 'CDB',
  name: 'CDB',
  asset_type: 'fixed_income',
  market: 'national',
  country: 'BR',
  currency: 'BRL',
  display_class: 'fixed_income'
};

const rfPosition: Position = {
  id: 2,
  portfolio_id: 1,
  asset_id: 2,
  quantity: 0,
  average_price: 0,
  invested_amount: 10000,
  current_value: 10500,
  contracted_yield: 'IPCA + 8%',
  status: 'active',
  created_at: '',
  updated_at: ''
};

describe('buildPositionDetailSections', () => {
  it('inclui preço médio e cotação para mercado', () => {
    const sections = buildPositionDetailSections(stockPosition, stockAsset);
    const labels = sections.pricing.map((i) => i.label);
    expect(labels).toContain('Preço médio de compra');
    expect(labels).toContain('Preço atual (cotação)');
    expect(sections.pricing.find((i) => i.label === 'Preço médio de compra')?.value).toMatch(/32/);
    expect(sections.pricing.find((i) => i.label === 'Preço atual (cotação)')?.value).toMatch(/35/);
    expect(sections.dividendsValue).toBe('Em breve');
  });

  it('indica ausência de cotação', () => {
    const sections = buildPositionDetailSections(stockPosition, { ...stockAsset, current_quote: null });
    const quote = sections.pricing.find((i) => i.label === 'Preço atual (cotação)');
    expect(quote?.value).toBe('—');
    expect(quote?.hint).toMatch(/Atualize as cotações/);
  });

  it('RF manual sem preço unitário', () => {
    const sections = buildPositionDetailSections(rfPosition, rfAsset);
    expect(sections.pricing.find((i) => i.label === 'Preço médio de compra')?.value).toBe('—');
    expect(sections.totals.some((i) => i.label === 'Valor aplicado')).toBe(true);
    expect(sections.totals.some((i) => i.label === 'Rendimento contratado')).toBe(true);
  });

  it('adiciona equivalente BRL para USD quando há taxa', () => {
    const voo: Asset = { ...stockAsset, symbol: 'VOO', currency: 'USD', current_quote: 400 };
    const pos: Position = { ...stockPosition, average_price: 380 };
    const sections = buildPositionDetailSections(pos, voo, {
      usdBrlRate: 5,
      showBrlEquivalentHints: true
    });
    const avg = sections.pricing.find((i) => i.label === 'Preço médio de compra');
    expect(avg?.hint).toMatch(/≈.*R\$/);
  });

  it('não exibe hint de câmbio USD/BRL na carteira', () => {
    const voo: Asset = { ...stockAsset, symbol: 'BTC-USD', currency: 'USD', current_quote: 76_000 };
    const pos: Position = { ...stockPosition, average_price: 80_000 };
    const sections = buildPositionDetailSections(pos, voo);
    const avg = sections.pricing.find((i) => i.label === 'Preço médio de compra');
    expect(avg?.hint).toBeUndefined();
  });

  it('usa resumo de proventos quando informado', () => {
    const sections = buildPositionDetailSections(stockPosition, stockAsset, {
      dividendsSummary: 'R$ 150,50 (2 lançamentos)'
    });
    expect(sections.dividendsValue).toBe('R$ 150,50 (2 lançamentos)');
  });
});

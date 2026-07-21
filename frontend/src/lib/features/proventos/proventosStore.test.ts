import { get } from 'svelte/store';
import { describe, expect, it, vi } from 'vitest';

import type { Asset } from '$lib/api/assets';
import type { DividendPayment } from '$lib/api/dividendPayments';
import type { Portfolio, Position } from '$lib/api/portfolios';

import {
  createProventosStore,
  selectHasNoPortfolio,
  type ProventosApi
} from './proventosStore';

const assets: Asset[] = [
  {
    id: 1,
    symbol: 'ITSA4',
    name: 'Itausa',
    asset_type: 'stock',
    market: 'national',
    country: 'BR',
    currency: 'BRL',
    display_class: 'stocks'
  }
];

const portfolios: Portfolio[] = [
  { id: 1, name: 'Carteira A' } as Portfolio,
  { id: 2, name: 'Carteira B' } as Portfolio
];

function makePayment(overrides: Partial<DividendPayment>): DividendPayment {
  return {
    id: 1,
    asset_id: 1,
    portfolio_id: 1,
    payment_type: 'dividend',
    payment_date: '2026-05-10',
    amount: 100,
    currency: 'BRL',
    symbol: 'ITSA4',
    asset_name: 'Itausa',
    market: 'national',
    display_class: 'stocks',
    ...overrides
  };
}

const positionsByPortfolio: Record<number, Position[]> = {
  1: [{ asset_id: 1, quantity: 10, average_price: 5 } as Position],
  2: []
};

function makeApi(overrides: Partial<ProventosApi> = {}): ProventosApi {
  const payments = [
    makePayment({ id: 1, portfolio_id: 1 }),
    makePayment({ id: 2, portfolio_id: 2, symbol: 'BBSE3' })
  ];
  return {
    listAssets: vi.fn(async () => assets),
    listDividendPayments: vi.fn(async (params) => {
      if (params?.portfolio_id != null) {
        return payments.filter((p) => p.portfolio_id === params.portfolio_id);
      }
      return payments;
    }),
    createDividendPayment: vi.fn(async () => makePayment({ id: 99 })),
    updateDividendPayment: vi.fn(async () => makePayment({ id: 1 })),
    deleteDividendPayment: vi.fn(async () => undefined),
    listPortfolios: vi.fn(async () => portfolios),
    listPositions: vi.fn(async (portfolioId: number) => positionsByPortfolio[portfolioId] ?? []),
    getActivePortfolioId: vi.fn(async () => 1),
    setActivePortfolioId: vi.fn(async (id: number | null) => id),
    ...overrides
  };
}

describe('proventosStore.loadInitialData', () => {
  it('carrega ativos, carteiras e aplica a carteira ativa ao filtro', async () => {
    const store = createProventosStore(makeApi());
    await store.loadInitialData();

    const state = get(store);
    expect(state.initialized).toBe(true);
    expect(state.assets).toHaveLength(1);
    expect(state.portfolios).toHaveLength(2);
    expect(state.activePortfolioId).toBe(1);
    expect(state.portfolioFilter).toBe(1);
    expect(state.serverFilters).toEqual({ portfolio_id: 1 });
    // Apenas proventos da carteira ativa (id 1).
    expect(state.payments.map((p) => p.id)).toEqual([1]);
    // Posições da carteira ativa carregadas (para o destaque "em carteira").
    expect(state.positions.map((p) => p.asset_id)).toEqual([1]);
  });

  it('ensureLoaded só carrega uma vez', async () => {
    const api = makeApi();
    const store = createProventosStore(api);
    await store.ensureLoaded();
    await store.ensureLoaded();
    expect(api.listAssets).toHaveBeenCalledTimes(1);
  });

  it('sem carteira cadastrada não busca proventos (evita vazar órfãos)', async () => {
    const api = makeApi({
      listPortfolios: vi.fn(async () => []),
      getActivePortfolioId: vi.fn(async () => null)
    });
    const store = createProventosStore(api);
    await store.loadInitialData();

    const state = get(store);
    expect(state.initialized).toBe(true);
    expect(state.portfolios).toEqual([]);
    expect(state.payments).toEqual([]);
    expect(state.portfolioFilter).toBe('');
    expect(api.listDividendPayments).not.toHaveBeenCalled();
    expect(selectHasNoPortfolio(state)).toBe(true);
  });

  it('selectHasNoPortfolio é falso quando há carteiras', async () => {
    const store = createProventosStore(makeApi());
    await store.loadInitialData();
    expect(selectHasNoPortfolio(get(store))).toBe(false);
  });
});

describe('proventosStore mutations', () => {
  it('create atualiza a lista e define mensagem de sucesso', async () => {
    const api = makeApi();
    const store = createProventosStore(api);
    await store.loadInitialData();

    const ok = await store.create({
      asset_id: 1,
      portfolio_id: 1,
      payment_type: 'dividend',
      payment_date: '2026-05-12',
      amount: 10,
      currency: 'BRL'
    });

    expect(ok).toBe(true);
    expect(api.createDividendPayment).toHaveBeenCalledTimes(1);
    const state = get(store);
    expect(state.message).toBe('Provento cadastrado.');
    expect(state.loading).toBe(false);
  });

  it('create retorna false e define erro quando a API falha', async () => {
    const api = makeApi({
      createDividendPayment: vi.fn(async () => {
        throw new Error('boom');
      })
    });
    const store = createProventosStore(api);
    await store.loadInitialData();

    const ok = await store.create({
      asset_id: 1,
      portfolio_id: 1,
      payment_type: 'dividend',
      payment_date: '2026-05-12',
      amount: 10,
      currency: 'BRL'
    });

    expect(ok).toBe(false);
    expect(get(store).error).toBeTruthy();
  });

  it('setServerFilters aplica filtro de carteira e recarrega', async () => {
    const store = createProventosStore(makeApi());
    await store.loadInitialData();

    await store.setServerFilters({ portfolio_id: 2 });

    const state = get(store);
    expect(state.portfolioFilter).toBe(2);
    expect(state.payments.map((p) => p.id)).toEqual([2]);
    // Carteira 2 não tem posições → destaque em carteira fica vazio.
    expect(state.positions).toEqual([]);
  });

  it('selectPortfolio persiste a carteira ativa e recarrega proventos + posições', async () => {
    const api = makeApi();
    const store = createProventosStore(api);
    await store.loadInitialData();

    await store.selectPortfolio(2);

    const state = get(store);
    expect(api.setActivePortfolioId).toHaveBeenCalledWith(2);
    expect(state.activePortfolioId).toBe(2);
    expect(state.portfolioFilter).toBe(2);
    expect(state.serverFilters).toEqual({ portfolio_id: 2 });
    expect(state.payments.map((p) => p.id)).toEqual([2]);
    expect(state.positions).toEqual([]);
  });

  it('remove recarrega e define mensagem', async () => {
    const api = makeApi();
    const store = createProventosStore(api);
    await store.loadInitialData();

    const ok = await store.remove(1);

    expect(ok).toBe(true);
    expect(api.deleteDividendPayment).toHaveBeenCalledWith(1);
    expect(get(store).message).toBe('Provento removido.');
  });
});

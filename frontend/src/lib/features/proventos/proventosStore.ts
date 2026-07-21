import { get, writable } from 'svelte/store';

import { listAssets, type Asset } from '$lib/api/assets';
import {
  createDividendPayment,
  deleteDividendPayment,
  listDividendPayments,
  updateDividendPayment,
  type DividendPayment,
  type DividendPaymentCreate,
  type DividendPaymentListParams
} from '$lib/api/dividendPayments';
import { parseApiError } from '$lib/api/parseApiError';
import {
  getActivePortfolioId,
  listPortfolios,
  listPositions,
  setActivePortfolioId,
  type Portfolio,
  type Position
} from '$lib/api/portfolios';

export type ProventosApi = {
  listAssets: typeof listAssets;
  listDividendPayments: typeof listDividendPayments;
  createDividendPayment: typeof createDividendPayment;
  updateDividendPayment: typeof updateDividendPayment;
  deleteDividendPayment: typeof deleteDividendPayment;
  listPortfolios: typeof listPortfolios;
  listPositions: typeof listPositions;
  getActivePortfolioId: typeof getActivePortfolioId;
  setActivePortfolioId: typeof setActivePortfolioId;
};

const DEFAULT_API: ProventosApi = {
  listAssets,
  listDividendPayments,
  createDividendPayment,
  updateDividendPayment,
  deleteDividendPayment,
  listPortfolios,
  listPositions,
  getActivePortfolioId,
  setActivePortfolioId
};

export type ProventosState = {
  assets: Asset[];
  assetsLoading: boolean;
  assetsError: string;
  payments: DividendPayment[];
  paymentsError: string;
  /** Posições da carteira selecionada (usadas apenas para destaque/ranking em carteira). */
  positions: Position[];
  portfolios: Portfolio[];
  activePortfolioId: number | null;
  serverFilters: DividendPaymentListParams;
  portfolioFilter: number | '';
  message: string;
  error: string;
  loading: boolean;
  initialized: boolean;
};

const ASSETS_ERROR_FALLBACK =
  'Não foi possível carregar a base de ativos. Verifique se o backend está em execução (porta 8000).';
const PAYMENTS_ERROR_FALLBACK =
  'Não foi possível carregar os proventos. Reinicie o backend se a tabela de proventos ainda não existir.';

function initialState(): ProventosState {
  return {
    assets: [],
    assetsLoading: true,
    assetsError: '',
    payments: [],
    paymentsError: '',
    positions: [],
    portfolios: [],
    activePortfolioId: null,
    serverFilters: {},
    portfolioFilter: '',
    message: '',
    error: '',
    loading: false,
    initialized: false
  };
}

/**
 * Estado "sem carteira": não há nenhuma carteira cadastrada. Usado para exibir onboarding
 * (empty state com CTA para criar carteira) em vez da leitura global de proventos.
 */
export function selectHasNoPortfolio(state: ProventosState): boolean {
  return state.initialized && state.portfolios.length === 0;
}

export function createProventosStore(api: ProventosApi = DEFAULT_API) {
  const store = writable<ProventosState>(initialState());
  const { subscribe, update, set } = store;

  function patch(partial: Partial<ProventosState>) {
    update((state) => ({ ...state, ...partial }));
  }

  async function refreshPayments(): Promise<void> {
    const { serverFilters } = get(store);
    try {
      const payments = await api.listDividendPayments(serverFilters);
      patch({ payments, paymentsError: '' });
    } catch (err) {
      patch({ payments: [], paymentsError: parseApiError(err, PAYMENTS_ERROR_FALLBACK) });
    }
  }

  async function refreshPositions(): Promise<void> {
    const portfolioId = get(store).serverFilters.portfolio_id;
    if (portfolioId == null) {
      patch({ positions: [] });
      return;
    }
    try {
      const positions = await api.listPositions(portfolioId);
      patch({ positions });
    } catch {
      patch({ positions: [] });
    }
  }

  async function loadAssets(): Promise<void> {
    patch({ assetsLoading: true, assetsError: '' });
    try {
      const assets = await api.listAssets();
      patch({ assets, assetsLoading: false });
    } catch (err) {
      patch({ assets: [], assetsLoading: false, assetsError: parseApiError(err, ASSETS_ERROR_FALLBACK) });
    }
  }

  async function loadInitialData(): Promise<void> {
    patch({ assetsLoading: true, assetsError: '', paymentsError: '' });

    const [assetsResult, portfoliosResult, activeResult] = await Promise.allSettled([
      api.listAssets(),
      api.listPortfolios(),
      api.getActivePortfolioId()
    ]);

    if (assetsResult.status === 'fulfilled') {
      patch({ assets: assetsResult.value, assetsLoading: false });
    } else {
      patch({
        assets: [],
        assetsLoading: false,
        assetsError: parseApiError(assetsResult.reason, ASSETS_ERROR_FALLBACK)
      });
    }

    const portfolios = portfoliosResult.status === 'fulfilled' ? portfoliosResult.value : [];
    const activePortfolioId = activeResult.status === 'fulfilled' ? activeResult.value : null;

    let serverFilters: DividendPaymentListParams = get(store).serverFilters;
    let portfolioFilter: number | '' = get(store).portfolioFilter;
    if (activePortfolioId != null && portfolios.some((p) => p.id === activePortfolioId)) {
      portfolioFilter = activePortfolioId;
      serverFilters = { ...serverFilters, portfolio_id: activePortfolioId };
    }

    patch({ portfolios, activePortfolioId, serverFilters, portfolioFilter, initialized: true });

    // Sem nenhuma carteira cadastrada não há escopo válido: não buscamos proventos para
    // evitar vazar registros órfãos (legado sem portfolio_id) na leitura global.
    if (portfolios.length === 0) {
      patch({ payments: [], positions: [] });
      return;
    }

    await Promise.all([refreshPayments(), refreshPositions()]);
  }

  async function ensureLoaded(): Promise<void> {
    if (get(store).initialized) {
      return;
    }
    await loadInitialData();
  }

  async function setServerFilters(filters: DividendPaymentListParams): Promise<void> {
    patch({
      serverFilters: filters,
      portfolioFilter: filters.portfolio_id == null ? '' : filters.portfolio_id
    });
    try {
      await Promise.all([refreshPayments(), refreshPositions()]);
    } catch {
      patch({ error: 'Não foi possível aplicar os filtros.' });
    }
  }

  /**
   * Troca a carteira ativa da seção (painel no topo). Persiste a carteira ativa
   * globalmente e recarrega proventos + posições do novo escopo.
   */
  async function selectPortfolio(portfolioId: number): Promise<void> {
    if (get(store).portfolioFilter === portfolioId) {
      return;
    }
    patch({
      activePortfolioId: portfolioId,
      portfolioFilter: portfolioId,
      serverFilters: { ...get(store).serverFilters, portfolio_id: portfolioId }
    });
    try {
      await api.setActivePortfolioId(portfolioId);
      await Promise.all([refreshPayments(), refreshPositions()]);
    } catch {
      patch({ error: 'Não foi possível trocar a carteira.' });
    }
  }

  async function create(payload: DividendPaymentCreate): Promise<boolean> {
    patch({ loading: true, error: '', message: '' });
    try {
      await api.createDividendPayment(payload);
      await refreshPayments();
      patch({ loading: false, message: 'Provento cadastrado.' });
      return true;
    } catch (err) {
      patch({ loading: false, error: parseApiError(err, 'Não foi possível cadastrar o provento.') });
      return false;
    }
  }

  async function updatePayment(id: number, payload: DividendPaymentCreate): Promise<boolean> {
    patch({ loading: true, error: '', message: '' });
    try {
      await api.updateDividendPayment(id, payload);
      await refreshPayments();
      patch({ loading: false, message: 'Provento atualizado.' });
      return true;
    } catch (err) {
      patch({ loading: false, error: parseApiError(err, 'Não foi possível atualizar o provento.') });
      return false;
    }
  }

  async function remove(id: number): Promise<boolean> {
    patch({ loading: true, error: '', message: '' });
    try {
      await api.deleteDividendPayment(id);
      await refreshPayments();
      patch({ loading: false, message: 'Provento removido.' });
      return true;
    } catch (err) {
      patch({ loading: false, error: parseApiError(err, 'Não foi possível remover o provento.') });
      return false;
    }
  }

  function setMessage(message: string) {
    patch({ message });
  }

  function setError(error: string) {
    patch({ error });
  }

  function setAssetsError(assetsError: string) {
    patch({ assetsError });
  }

  function setPaymentsError(paymentsError: string) {
    patch({ paymentsError });
  }

  function reset() {
    set(initialState());
  }

  return {
    subscribe,
    loadInitialData,
    ensureLoaded,
    refreshPayments,
    refreshPositions,
    loadAssets,
    setServerFilters,
    selectPortfolio,
    create,
    updatePayment,
    remove,
    setMessage,
    setError,
    setAssetsError,
    setPaymentsError,
    reset
  };
}

export const proventosStore = createProventosStore();
export type ProventosStore = ReturnType<typeof createProventosStore>;

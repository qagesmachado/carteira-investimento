<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';

  import {
    listAssets,
    type Asset,
    type AssetType,
    type DisplayClass
  } from '$lib/api/assets';
  import { getBitcoinSnapshot, type BitcoinSnapshot } from '$lib/api/cryptoFees';
  import { getUsdBrl, refreshUsdBrl } from '$lib/api/fx';
  import { listDividendPayments, type DividendPayment } from '$lib/api/dividendPayments';
  import {
    getActivePortfolioId,
    listPortfolios,
    listPositions,
    refreshPortfolioQuotes,
    setActivePortfolioId,
    type Portfolio,
    type Position
  } from '$lib/api/portfolios';
  import { parseApiError } from '$lib/api/parseApiError';
  import PortfolioSelect from '$lib/features/portfolios/PortfolioSelect.svelte';
  import {
    formatAssetTypeForDisplay,
    formatCurrencyCodeForDisplay,
    formatDisplayClassForDisplay,
    formatMoneyAmount
  } from '$lib/assetLabels';
  import DismissibleAlert from '$lib/components/DismissibleAlert.svelte';
  import type { CryptoFeeDetailSummary } from '$lib/features/bitcoin/cryptoFeePositionDetail';
  import BrlEquivalentHint from '$lib/features/portfolios/BrlEquivalentHint.svelte';
  import PositionDetailPanel from '$lib/features/portfolios/PositionDetailPanel.svelte';
  import {
    buildDividendTotalsByAssetId,
    formatDividendsReceivedSummary
  } from '$lib/features/proventos/dividendSummary';
  import {
    computePositionProfit,
    formatPositionProfit,
    formatQuantityForDisplay,
    positionCurrentValue,
    positionInvestedValue,
    usesManualPositionValues,
    valueInBrl
  } from '$lib/features/portfolios/positionMetrics';
  import { formatTickerForDisplay } from '$lib/formatTickerForDisplay';

  type SortKey =
    | 'ticker'
    | 'name'
    | 'asset_type'
    | 'display_class'
    | 'currency'
    | 'quantity'
    | 'invested'
    | 'current'
    | 'profit';

  /** Filtros como string para binds de <select> funcionarem de forma estável */
  let filterAssetTypeStr = '';
  let filterDisplayClassStr = '';

  const ASSET_TYPES: AssetType[] = [
    'stock',
    'etf',
    'fii',
    'fixed_income',
    'crypto',
    'pension',
    'other'
  ];

  const DISPLAY_CLASSES: DisplayClass[] = [
    'stocks',
    'funds',
    'fixed_income',
    'international',
    'crypto',
    'pension',
    'other'
  ];

  /** Valor sentinela no <select>: filtra por mercado nacional (não é um display_class da API). */
  const FILTER_DISPLAY_CLASS_NATIONAL = '__national__';

  let portfolios: Portfolio[] = [];
  let assets: Asset[] = [];
  let positions: Position[] = [];
  let dividendPayments: DividendPayment[] = [];
  let activeId: number | null = null;
  let usdBrlRate: number | null = null;
  let usdBrlRefreshedAt: string | null = null;

  let filterText = '';
  let filterCurrency = '';

  let sortKey: SortKey = 'ticker';
  let sortDir: 'asc' | 'desc' = 'asc';

  let loading = false;
  let refreshingQuotes = false;
  let refreshingFx = false;

  let quotesMessage = '';
  let quotesError = '';
  let fxMessage = '';
  let fxError = '';
  let loadError = '';
  let expandedPositionId: number | null = null;
  let prevActiveIdForExpanded: number | null = null;
  let bitcoinSnapshot: BitcoinSnapshot | null = null;

  $: assetById = Object.fromEntries(assets.map((a) => [a.id, a]));
  $: dividendTotalsByAssetId = buildDividendTotalsByAssetId(dividendPayments);

  function dividendsSummaryForAsset(asset: Asset): string {
    return formatDividendsReceivedSummary(dividendTotalsByAssetId.get(asset.id), asset);
  }

  function cryptoFeeSummaryForAsset(asset: Asset): CryptoFeeDetailSummary | undefined {
    if (asset.asset_type !== 'crypto' || !bitcoinSnapshot) {
      return undefined;
    }
    const snapshotAssetId = bitcoinSnapshot.position.asset_id;
    if (snapshotAssetId != null && snapshotAssetId !== asset.id) {
      return undefined;
    }
    return {
      profitAfterFeesBrl: bitcoinSnapshot.profit_after_fees_brl,
      appreciationAfterFeesPercent: bitcoinSnapshot.appreciation_after_fees_percent,
      totalFeesBrl: bitcoinSnapshot.total_fees_brl,
      totalFeesUsd: bitcoinSnapshot.total_fees_usd
    };
  }

  async function loadBitcoinSnapshot(
    portfolioId: number | null,
    positionList: Position[],
    assetList: Asset[]
  ) {
    if (portfolioId == null) {
      bitcoinSnapshot = null;
      return;
    }
    const byId = Object.fromEntries(assetList.map((a) => [a.id, a]));
    const hasCrypto = positionList.some((p) => byId[p.asset_id]?.asset_type === 'crypto');
    if (!hasCrypto) {
      bitcoinSnapshot = null;
      return;
    }
    try {
      bitcoinSnapshot = await getBitcoinSnapshot(portfolioId);
    } catch {
      bitcoinSnapshot = null;
    }
  }

  $: if (activeId !== prevActiveIdForExpanded) {
    prevActiveIdForExpanded = activeId;
    expandedPositionId = null;
  }

  function togglePositionDetails(positionId: number) {
    expandedPositionId = expandedPositionId === positionId ? null : positionId;
  }

  function positionDetailPanelId(positionId: number): string {
    return `position-detail-${positionId}`;
  }

  function formatFxTimestamp(iso: string | null): string {
    if (!iso) {
      return '';
    }
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) {
      return iso;
    }
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(d);
  }

  $: fxStatusLine =
    usdBrlRate != null && usdBrlRefreshedAt
      ? `USD/BRL: ${usdBrlRate.toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 4
        })} — atualizado em ${formatFxTimestamp(usdBrlRefreshedAt)}`
      : 'Sem taxa USD/BRL armazenada. Use «Atualizar câmbio (USD/BRL)» para ver equivalentes em reais.';

  type Row = {
    position: Position;
    asset: Asset;
    invested: number | null;
    current: number | null;
    profit: ReturnType<typeof computePositionProfit>;
    investedBrl: number | null;
    currentBrl: number | null;
  };

  function isUsdAsset(asset: Asset): boolean {
    return asset.currency?.trim().toUpperCase() === 'USD';
  }

  function buildRows(list: Position[], byId: Record<number, Asset>, fxRate: number | null): Row[] {
    const out: Row[] = [];
    for (const position of list) {
      const asset = byId[position.asset_id];
      if (!asset) {
        continue;
      }
      const invested = positionInvestedValue(position, asset);
      const current = positionCurrentValue(position, asset);
      const profit = computePositionProfit(position, asset);
      const investedBrl = valueInBrl(invested, asset.currency, fxRate);
      const currentBrl = valueInBrl(current, asset.currency, fxRate);
      out.push({
        position,
        asset,
        invested,
        current,
        profit,
        investedBrl,
        currentBrl
      });
    }
    return out;
  }

  function currencyMatches(filterRaw: string, assetCurrency: string | undefined): boolean {
    const f = filterRaw.trim().toLowerCase();
    if (!f) {
      return true;
    }
    const cur = (assetCurrency ?? '').trim().toUpperCase();
    if (!cur) {
      return false;
    }
    if (cur.includes(f.toUpperCase()) || f.toUpperCase().includes(cur)) {
      return true;
    }
    if (cur === 'BRL' && (f === 'brl' || f === 'real' || f === 'r$' || f === 'reais')) {
      return true;
    }
    if (cur === 'USD' && (f === 'usd' || f === 'dolar' || f === 'dol' || f === '$')) {
      return true;
    }
    return cur === f.toUpperCase();
  }

  function formatConsolidatedProfit(row: Row): string {
    if (isUsdAsset(row.asset)) {
      return formatPositionProfit(row.position, row.asset);
    }
    if (
      row.investedBrl != null &&
      row.currentBrl != null &&
      row.investedBrl > 0 &&
      Number.isFinite(row.currentBrl - row.investedBrl)
    ) {
      const p = row.currentBrl - row.investedBrl;
      const pct = (p / row.investedBrl) * 100;
      return `${formatMoneyAmount(p, 'BRL')} (${pct.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}%)`;
    }
    return formatPositionProfit(row.position, row.asset);
  }

  function consolidatedProfitBrl(row: Row): number | null {
    if (
      row.investedBrl != null &&
      row.currentBrl != null &&
      row.investedBrl > 0 &&
      Number.isFinite(row.currentBrl - row.investedBrl)
    ) {
      return row.currentBrl - row.investedBrl;
    }
    return null;
  }

  function consolidatedProfitAmount(row: Row): number | null {
    if (
      !isUsdAsset(row.asset) &&
      row.investedBrl != null &&
      row.currentBrl != null &&
      row.investedBrl > 0 &&
      Number.isFinite(row.currentBrl - row.investedBrl)
    ) {
      return row.currentBrl - row.investedBrl;
    }
    return row.profit?.profit ?? null;
  }

  function profitColorClass(amount: number | null): string {
    if (amount == null) {
      return '';
    }
    return amount >= 0 ? 'text-success' : 'text-error';
  }

  function headerSortClass(key: SortKey): string {
    return sortKey === key ? 'font-bold' : 'font-normal';
  }

  function sortValue(row: Row, key: SortKey): string | number {
    switch (key) {
      case 'ticker':
        return row.asset.symbol.toLowerCase();
      case 'name':
        return (row.asset.name ?? '').toLowerCase();
      case 'asset_type':
        return formatAssetTypeForDisplay(row.asset.asset_type);
      case 'display_class':
        return formatDisplayClassForDisplay(row.asset.display_class);
      case 'currency':
        return row.asset.currency.toLowerCase();
      case 'quantity':
        return usesManualPositionValues(row.asset) ? -1 : row.position.quantity;
      case 'invested':
        return row.investedBrl ?? row.invested ?? -Infinity;
      case 'current':
        return row.currentBrl ?? row.current ?? -Infinity;
      case 'profit': {
        if (row.investedBrl != null && row.currentBrl != null && row.investedBrl > 0) {
          return row.currentBrl - row.investedBrl;
        }
        return row.profit?.profit ?? -Infinity;
      }
      default:
        return '';
    }
  }

  /** Inclui ETFs de renda fixa quando o filtro «Tipo» é «Renda fixa». */
  function rowMatchesAssetTypeFilter(asset: Asset, filterStr: string): boolean {
    if (filterStr === '') {
      return true;
    }
    if (filterStr === 'fixed_income') {
      if (asset.asset_type === 'fixed_income') {
        return true;
      }
      return (
        asset.asset_type === 'etf' &&
        (asset.etf_subtype === 'fixed_income' || asset.display_class === 'fixed_income')
      );
    }
    return asset.asset_type === filterStr;
  }

  function compareRows(a: Row, b: Row, key: SortKey, dir: number): number {
    const va = sortValue(a, key);
    const vb = sortValue(b, key);
    if (typeof va === 'number' && typeof vb === 'number') {
      return va === vb ? 0 : va < vb ? -dir : dir;
    }
    const sa = String(va);
    const sb = String(vb);
    return sa === sb ? 0 : sa < sb ? -dir : dir;
  }

  function rowMatchesTextSearch(row: Row, raw: string): boolean {
    const t = raw.trim().toLowerCase();
    if (!t) {
      return true;
    }
    const sym = row.asset.symbol.toLowerCase();
    const name = (row.asset.name ?? '').toLowerCase();
    if (sym.includes(t) || name.includes(t)) {
      return true;
    }
    const typeLabel = formatAssetTypeForDisplay(row.asset.asset_type).toLowerCase();
    if (typeLabel.includes(t) || row.asset.asset_type.toLowerCase().includes(t)) {
      return true;
    }
    const classLabel = formatDisplayClassForDisplay(row.asset.display_class).toLowerCase();
    if (classLabel.includes(t) || row.asset.display_class.toLowerCase().includes(t)) {
      return true;
    }
    return false;
  }

  $: allRows = buildRows(positions, assetById, usdBrlRate);

  $: filteredRows = allRows.filter((row) => {
    if (!rowMatchesTextSearch(row, filterText)) {
      return false;
    }
    if (!rowMatchesAssetTypeFilter(row.asset, filterAssetTypeStr)) {
      return false;
    }
    if (filterDisplayClassStr === FILTER_DISPLAY_CLASS_NATIONAL) {
      if (row.asset.market !== 'national') {
        return false;
      }
    } else if (filterDisplayClassStr !== '' && row.asset.display_class !== filterDisplayClassStr) {
      return false;
    }
    if (!currencyMatches(filterCurrency, row.asset.currency)) {
      return false;
    }
    return true;
  });

  $: displayedRows = [...filteredRows].sort((a, b) =>
    compareRows(a, b, sortKey, sortDir === 'asc' ? 1 : -1)
  );

  /** Posições cuja moeda do ativo é BRL (subtotais «em reais» nos cartões). */
  $: rowsBrlCurrency = displayedRows.filter(
    (r) => r.asset.currency?.trim().toUpperCase() === 'BRL'
  );
  $: totalInvestedBrlCurrency = rowsBrlCurrency.reduce((sum, r) => {
    if (r.investedBrl == null) {
      return sum;
    }
    return sum + r.investedBrl;
  }, 0);
  $: totalCurrentBrlCurrency = rowsBrlCurrency.reduce((sum, r) => {
    if (r.currentBrl == null) {
      return sum;
    }
    return sum + r.currentBrl;
  }, 0);
  $: totalInvestedBrlCurrencyLines = rowsBrlCurrency.filter((r) => r.investedBrl != null).length;
  $: totalCurrentBrlCurrencyLines = rowsBrlCurrency.filter((r) => r.currentBrl != null).length;
  $: profitBrlCurrencyRows = rowsBrlCurrency.filter((r) => r.investedBrl != null && r.currentBrl != null);
  $: totalProfitBrlCurrency = profitBrlCurrencyRows.reduce(
    (sum, r) => sum + (r.currentBrl! - r.investedBrl!),
    0
  );
  $: sumInvestedBrlCurrencyForPct = profitBrlCurrencyRows.reduce((sum, r) => sum + r.investedBrl!, 0);
  $: aggregateProfitPercentBrlCurrency =
    sumInvestedBrlCurrencyForPct > 0 ? (totalProfitBrlCurrency / sumInvestedBrlCurrencyForPct) * 100 : null;

  /**
   * Consolidado em BRL: recalcula com valueInBrl para não depender só do cache em Row
   * (garante USD internacional quando há taxa, mesmo se algo na linha mudar).
   */
  $: totalInvestedBrl = displayedRows.reduce((sum, r) => {
    const v = valueInBrl(r.invested, r.asset.currency, usdBrlRate);
    return v != null ? sum + v : sum;
  }, 0);
  $: totalCurrentBrl = displayedRows.reduce((sum, r) => {
    const v = valueInBrl(r.current, r.asset.currency, usdBrlRate);
    return v != null ? sum + v : sum;
  }, 0);
  $: totalInvestedBrlLines = displayedRows.filter(
    (r) => valueInBrl(r.invested, r.asset.currency, usdBrlRate) != null
  ).length;
  $: totalCurrentBrlLines = displayedRows.filter(
    (r) => valueInBrl(r.current, r.asset.currency, usdBrlRate) != null
  ).length;

  /** Lucro e % do consolidado: linhas com aplicado e atual convertíveis para BRL. */
  $: profitBrlRows = displayedRows.filter(
    (r) =>
      valueInBrl(r.invested, r.asset.currency, usdBrlRate) != null &&
      valueInBrl(r.current, r.asset.currency, usdBrlRate) != null
  );
  $: totalProfitBrl = profitBrlRows.reduce((sum, r) => {
    const a = valueInBrl(r.invested, r.asset.currency, usdBrlRate)!;
    const b = valueInBrl(r.current, r.asset.currency, usdBrlRate)!;
    return sum + (b - a);
  }, 0);
  $: sumInvestedBrlForProfitPct = profitBrlRows.reduce(
    (sum, r) => sum + valueInBrl(r.invested, r.asset.currency, usdBrlRate)!,
    0
  );
  $: aggregateProfitPercent =
    sumInvestedBrlForProfitPct > 0 ? (totalProfitBrl / sumInvestedBrlForProfitPct) * 100 : null;

  /** Internacional em USD (valores na moeda do ativo, sem conversão) */
  $: usdInternationalRows = displayedRows.filter(
    (r) => r.asset.currency?.trim().toUpperCase() === 'USD' && r.asset.market === 'international'
  );
  $: totalInvestedUsdIntl = usdInternationalRows.reduce((sum, r) => {
    if (r.invested == null) {
      return sum;
    }
    return sum + r.invested;
  }, 0);
  $: totalCurrentUsdIntl = usdInternationalRows.reduce((sum, r) => {
    if (r.current == null) {
      return sum;
    }
    return sum + r.current;
  }, 0);
  $: totalInvestedUsdIntlLines = usdInternationalRows.filter((r) => r.invested != null).length;
  $: totalCurrentUsdIntlLines = usdInternationalRows.filter((r) => r.current != null).length;
  $: profitUsdIntlRows = usdInternationalRows.filter((r) => r.invested != null && r.current != null);
  $: totalProfitUsdIntl = profitUsdIntlRows.reduce((sum, r) => sum + (r.current! - r.invested!), 0);
  $: sumInvestedUsdIntlForPct = profitUsdIntlRows.reduce((sum, r) => sum + r.invested!, 0);
  $: aggregateProfitUsdIntlPercent =
    sumInvestedUsdIntlForPct > 0 ? (totalProfitUsdIntl / sumInvestedUsdIntlForPct) * 100 : null;

  function formatOptionalMoney(value: number | null, currency: string | undefined): string {
    if (value == null || !currency) {
      return '—';
    }
    return formatMoneyAmount(value, currency);
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      sortDir = sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      sortKey = key;
      sortDir = 'asc';
    }
  }

  async function syncActiveAndPositions() {
    let serverActiveId = await getActivePortfolioId();
    if (serverActiveId != null && !portfolios.some((p) => p.id === serverActiveId)) {
      await setActivePortfolioId(null);
      serverActiveId = null;
    }
    activeId = serverActiveId ?? portfolios[0]?.id ?? null;
    if (activeId != null && serverActiveId !== activeId) {
      await setActivePortfolioId(activeId);
    }
    if (activeId != null) {
      positions = await listPositions(activeId);
    } else {
      positions = [];
    }
  }

  async function loadFx() {
    try {
      const s = await getUsdBrl();
      usdBrlRate = s.rate;
      usdBrlRefreshedAt = s.refreshed_at;
      /* Sem taxa guardada o consolidado em BRL fica vazio para USD; tenta obter uma vez (mesma origem do botão). */
      if (usdBrlRate == null) {
        try {
          const r = await refreshUsdBrl();
          usdBrlRate = r.rate;
          usdBrlRefreshedAt = r.refreshed_at;
        } catch {
          /* mantém null — o utilizador pode usar «Atualizar câmbio» */
        }
      }
    } catch {
      usdBrlRate = null;
      usdBrlRefreshedAt = null;
    }
  }

  async function refresh() {
    loadError = '';
    portfolios = await listPortfolios();
    try {
      assets = await listAssets();
    } catch {
      assets = [];
      loadError = 'Não foi possível carregar a base de ativos.';
    }
    try {
      await syncActiveAndPositions();
    } catch (err) {
      positions = [];
      if (!loadError) {
        loadError = parseApiError(err, 'Não foi possível carregar as posições da carteira.');
      }
    }
    try {
      dividendPayments = activeId != null
        ? await listDividendPayments({ portfolio_id: activeId })
        : [];
    } catch {
      dividendPayments = [];
    }
    await loadBitcoinSnapshot(activeId, positions, assets);
    await loadFx();
  }

  async function handleSelectPortfolio(id: number) {
    if (id === activeId) {
      return;
    }
    activeId = id;
    await setActivePortfolioId(id);
    positions = await listPositions(id);
    try {
      dividendPayments = await listDividendPayments({ portfolio_id: id });
    } catch {
      dividendPayments = [];
    }
    await loadBitcoinSnapshot(id, positions, assets);
  }

  async function handlePortfolioSelect(id: number) {
    await handleSelectPortfolio(id);
  }

  async function handleRefreshQuotes() {
    if (!activeId) {
      return;
    }
    refreshingQuotes = true;
    quotesError = '';
    quotesMessage = '';
    try {
      const result = await refreshPortfolioQuotes(activeId);
      await refresh();
      const failedCount = result.failed.length;
      quotesMessage = `Cotações atualizadas: ${result.updated}. Ignoradas (sem mercado): ${result.skipped}.${
        failedCount > 0 ? ` Falhas: ${failedCount}.` : ''
      }`;
    } catch (err) {
      quotesError = parseApiError(err, 'Não foi possível atualizar as cotações.');
    } finally {
      refreshingQuotes = false;
    }
  }

  async function handleRefreshFx() {
    refreshingFx = true;
    fxError = '';
    fxMessage = '';
    try {
      const result = await refreshUsdBrl();
      usdBrlRate = result.rate;
      usdBrlRefreshedAt = result.refreshed_at;
      fxMessage = `Câmbio USD/BRL atualizado (${result.rate.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4
      })}).`;
    } catch (err) {
      fxError = parseApiError(err, 'Não foi possível atualizar o câmbio USD/BRL.');
    } finally {
      refreshingFx = false;
    }
  }

  onMount(() => {
    const classParam = $page.url.searchParams.get('display_class');
    if (classParam && DISPLAY_CLASSES.includes(classParam as DisplayClass)) {
      filterDisplayClassStr = classParam;
    }
    loading = true;
    refresh()
      .catch((err) => {
        loadError = parseApiError(err, 'Não foi possível carregar os dados.');
      })
      .finally(() => {
        loading = false;
      });
  });
</script>

<svelte:head>
  <title>Visão consolidada</title>
</svelte:head>

<main class="min-h-screen w-full bg-base-200">
  <div class="mx-auto flex w-full min-w-0 max-w-none flex-col gap-6 px-4 py-8 2xl:max-w-[112rem]">
    <section
      class="w-full min-w-0 rounded-box bg-gradient-to-r from-primary to-secondary px-6 py-10 text-primary-content"
    >
      <h1 class="text-4xl font-bold">Visão consolidada</h1>
    </section>

    <DismissibleAlert text={loadError} variant="error" on:dismiss={() => (loadError = '')} />
    <DismissibleAlert text={quotesMessage} variant="success" on:dismiss={() => (quotesMessage = '')} />
    <DismissibleAlert text={quotesError} variant="error" on:dismiss={() => (quotesError = '')} />
    <DismissibleAlert text={fxMessage} variant="success" on:dismiss={() => (fxMessage = '')} />
    <DismissibleAlert text={fxError} variant="error" on:dismiss={() => (fxError = '')} />

    <div class="card bg-base-100 shadow">
      <div class="card-body flex flex-col gap-4">
        <p class="text-sm text-base-content/70">{fxStatusLine}</p>
        <div class="flex flex-row flex-wrap items-center justify-between gap-4">
        <div class="form-control min-w-[12rem] flex-1">
          <span class="label-text text-xs font-semibold">Carteira ativa</span>
          <PortfolioSelect
            {portfolios}
            {activeId}
            disabled={portfolios.length === 0}
            ariaLabel="Carteira ativa"
            on:select={(event) => void handlePortfolioSelect(event.detail)}
          />
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            class="btn btn-outline btn-sm"
            type="button"
            disabled={loading || !activeId || refreshingQuotes}
            on:click={handleRefreshQuotes}
          >
            {refreshingQuotes ? 'Atualizando cotações…' : 'Atualizar cotações'}
          </button>
          <button
            class="btn btn-primary btn-sm"
            type="button"
            disabled={loading || refreshingFx}
            on:click={handleRefreshFx}
          >
            {refreshingFx ? 'Atualizando câmbio…' : 'Atualizar câmbio (USD/BRL)'}
          </button>
          <a class="btn btn-ghost btn-sm" href="/portfolios">Editar posições</a>
        </div>
        </div>
      </div>
    </div>

    {#if !activeId}
      <p class="text-center text-sm text-base-content/60">
        Crie ou selecione uma carteira em <a class="link link-primary" href="/portfolios">Carteiras</a>.
      </p>
    {:else}
      <div class="card bg-base-100 shadow">
        <div class="card-body gap-4">
          <h2 class="card-title text-lg">Filtros</h2>
          <p class="text-sm text-base-content/70">
            Moeda: aceita código (BRL, USD) ou termos como «real» ou «dólar». Valores das colunas aplicado/atual: em reais
            quando houver conversão; caso contrário, na moeda da posição.
          </p>
          <div class="flex flex-wrap gap-3">
            <label class="form-control min-w-[12rem] flex-1">
              <span class="label-text">Buscar</span>
              <input
                class="input input-bordered input-sm"
                placeholder="Ticker, nome, tipo (ex.: ETF)…"
                bind:value={filterText}
              />
            </label>
            <label class="form-control w-44">
              <span class="label-text">Tipo</span>
              <select class="select select-bordered select-sm" bind:value={filterAssetTypeStr}>
                <option value="">Todos</option>
                {#each ASSET_TYPES as t}
                  <option value={t}>{formatAssetTypeForDisplay(t)}</option>
                {/each}
              </select>
            </label>
            <label class="form-control min-w-[12rem] sm:w-52">
              <span class="label-text">Classe de exibição</span>
              <select class="select select-bordered select-sm" bind:value={filterDisplayClassStr}>
                <option value="">Todas</option>
                <option value={FILTER_DISPLAY_CLASS_NATIONAL}>Nacional</option>
                {#each DISPLAY_CLASSES as c}
                  <option value={c}>{formatDisplayClassForDisplay(c)}</option>
                {/each}
              </select>
            </label>
            <label class="form-control min-w-[8rem] w-40">
              <span class="label-text">Moeda</span>
              <input
                class="input input-bordered input-sm"
                placeholder="BRL, USD, real…"
                bind:value={filterCurrency}
              />
            </label>
          </div>

          {#if displayedRows.length > 0}
            <p class="text-xs font-semibold uppercase tracking-wide text-base-content/70">
              Totais do filtro atual (BRL nativo + internacional USD)
            </p>
            <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div
                class="rounded-box border-2 border-primary/35 bg-gradient-to-br from-primary/15 to-base-100 p-5 shadow-md"
              >
                <p class="text-xs font-bold uppercase tracking-wide text-primary/90">Total aplicado (filtro atual)</p>
                <div class="mt-3 space-y-2">
                  <p class="text-xl font-bold tabular-nums tracking-tight text-base-content">
                    {totalInvestedBrlCurrencyLines > 0
                      ? formatMoneyAmount(totalInvestedBrlCurrency, 'BRL')
                      : '—'}
                  </p>
                  <p class="text-xs text-base-content/60">
                    {totalInvestedBrlCurrencyLines} posição(ões) em moeda BRL (valor aplicado)
                  </p>
                  <p class="border-t border-base-300/70 pt-2 text-xl font-bold tabular-nums tracking-tight text-base-content">
                    {totalInvestedUsdIntlLines > 0 ? formatMoneyAmount(totalInvestedUsdIntl, 'USD') : '—'}
                  </p>
                  <p class="text-xs text-base-content/60">
                    {totalInvestedUsdIntlLines} posição(ões) internacional(is) em USD (valor aplicado)
                  </p>
                </div>
              </div>
              <div
                class="rounded-box border-2 border-secondary/35 bg-gradient-to-br from-secondary/15 to-base-100 p-5 shadow-md"
              >
                <p class="text-xs font-bold uppercase tracking-wide text-secondary">Total atual (filtro atual)</p>
                <div class="mt-3 space-y-2">
                  <p class="text-xl font-bold tabular-nums tracking-tight text-base-content">
                    {totalCurrentBrlCurrencyLines > 0
                      ? formatMoneyAmount(totalCurrentBrlCurrency, 'BRL')
                      : '—'}
                  </p>
                  <p class="text-xs text-base-content/60">
                    {totalCurrentBrlCurrencyLines} posição(ões) em moeda BRL (valor atual)
                  </p>
                  <p class="border-t border-base-300/70 pt-2 text-xl font-bold tabular-nums tracking-tight text-base-content">
                    {totalCurrentUsdIntlLines > 0 ? formatMoneyAmount(totalCurrentUsdIntl, 'USD') : '—'}
                  </p>
                  <p class="text-xs text-base-content/60">
                    {totalCurrentUsdIntlLines} posição(ões) internacional(is) em USD (valor atual)
                  </p>
                </div>
              </div>
              <div
                class="rounded-box border-2 border-success/40 bg-gradient-to-br from-success/20 to-base-100 p-5 shadow-md"
              >
                <p class="text-xs font-bold uppercase tracking-wide text-success">Lucro (filtro atual)</p>
                <div class="mt-3 space-y-2">
                  {#if profitBrlCurrencyRows.length === 0}
                    <p class="text-xl font-bold tabular-nums text-base-content/60">—</p>
                    <p class="text-sm font-semibold tabular-nums text-base-content/50">—</p>
                  {:else}
                    <p class="text-xl font-bold tabular-nums tracking-tight text-base-content">
                      {formatMoneyAmount(totalProfitBrlCurrency, 'BRL')}
                    </p>
                    <p class="text-sm font-semibold tabular-nums text-base-content/90">
                      {#if aggregateProfitPercentBrlCurrency != null}
                        {aggregateProfitPercentBrlCurrency >= 0 ? '+' : ''}{aggregateProfitPercentBrlCurrency.toLocaleString(
                          'pt-BR',
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          }
                        )}% · moeda BRL
                      {:else}
                        —
                      {/if}
                    </p>
                  {/if}
                  <div class="border-t border-base-300/70 pt-2">
                    {#if profitUsdIntlRows.length === 0}
                      <p class="text-xl font-bold tabular-nums text-base-content/60">—</p>
                      <p class="text-sm font-semibold tabular-nums text-base-content/50">—</p>
                    {:else}
                      <p class="text-xl font-bold tabular-nums tracking-tight text-base-content">
                        {formatMoneyAmount(totalProfitUsdIntl, 'USD')}
                      </p>
                      <p class="text-sm font-semibold tabular-nums text-base-content/90">
                        {#if aggregateProfitUsdIntlPercent != null}
                          {aggregateProfitUsdIntlPercent >= 0 ? '+' : ''}{aggregateProfitUsdIntlPercent.toLocaleString(
                            'pt-BR',
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            }
                          )}% · internacional USD
                        {:else}
                          —
                        {/if}
                      </p>
                    {/if}
                  </div>
                </div>
              </div>
              <div
                class="rounded-box border-2 border-warning/45 bg-gradient-to-br from-warning/15 to-base-100 p-5 shadow-md sm:col-span-2 xl:col-span-1"
              >
                <p class="text-xs font-bold uppercase tracking-wide text-warning">Consolidado total (em reais)</p>
                <p class="mt-1 text-[11px] leading-snug text-base-content/55">
                  Soma de tudo na grade filtrada, em BRL: posições em real + posições em USD convertidas pela taxa USD/BRL
                  {#if usdBrlRate == null}
                    <span class="text-warning">(sem taxa, USD não entra no somatório)</span>
                  {/if}
                </p>
                <dl class="mt-3 space-y-2.5 border-t border-base-300/80 pt-3 text-sm">
                  <div class="flex items-baseline justify-between gap-2">
                    <dt class="text-base-content/65">Aplicado</dt>
                    <dd class="text-base font-bold tabular-nums text-base-content">
                      {totalInvestedBrlLines > 0 ? formatMoneyAmount(totalInvestedBrl, 'BRL') : '—'}
                    </dd>
                  </div>
                  <div class="flex items-baseline justify-between gap-2">
                    <dt class="text-base-content/65">Atual</dt>
                    <dd class="text-base font-bold tabular-nums text-base-content">
                      {totalCurrentBrlLines > 0 ? formatMoneyAmount(totalCurrentBrl, 'BRL') : '—'}
                    </dd>
                  </div>
                  <div class="flex items-baseline justify-between gap-2 border-t border-base-300/60 pt-2">
                    <dt class="font-medium text-base-content/80">Lucro</dt>
                    <dd class="text-right">
                      {#if profitBrlRows.length === 0}
                        <span class="text-lg font-bold text-base-content/50">—</span>
                      {:else}
                        <span class="block text-lg font-bold tabular-nums text-base-content"
                          >{formatMoneyAmount(totalProfitBrl, 'BRL')}</span
                        >
                        {#if aggregateProfitPercent != null}
                          <span class="text-sm font-semibold tabular-nums text-base-content/85">
                            ({aggregateProfitPercent >= 0 ? '+' : ''}{aggregateProfitPercent.toLocaleString('pt-BR', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}%)
                          </span>
                        {/if}
                      {/if}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          {/if}

          <div class="w-full min-w-0 rounded-lg border border-base-300 bg-base-100 p-3 sm:px-4 sm:py-4">
            <table class="table table-sm table-zebra w-full">
              <thead>
                <tr>
                  <th class="align-bottom pl-1 sm:pl-2">
                    <button
                      type="button"
                      class="btn btn-ghost btn-xs h-auto min-h-0 gap-1 whitespace-nowrap px-1 font-normal normal-case {headerSortClass(
                        'ticker'
                      )}"
                      on:click={() => toggleSort('ticker')}
                    >
                      Ativo
                      {#if sortKey === 'ticker'}
                        <span class="text-xs opacity-90" aria-hidden="true">{sortDir === 'asc' ? '▲' : '▼'}</span>
                      {/if}
                    </button>
                  </th>
                  <th class="align-bottom">
                    <button
                      type="button"
                      class="btn btn-ghost btn-xs h-auto min-h-0 gap-1 whitespace-nowrap px-1 font-normal normal-case {headerSortClass(
                        'name'
                      )}"
                      on:click={() => toggleSort('name')}
                    >
                      Nome
                      {#if sortKey === 'name'}
                        <span class="text-xs opacity-90" aria-hidden="true">{sortDir === 'asc' ? '▲' : '▼'}</span>
                      {/if}
                    </button>
                  </th>
                  <th class="align-bottom">
                    <button
                      type="button"
                      class="btn btn-ghost btn-xs h-auto min-h-0 gap-1 whitespace-nowrap px-1 font-normal normal-case {headerSortClass(
                        'asset_type'
                      )}"
                      on:click={() => toggleSort('asset_type')}
                    >
                      Tipo
                      {#if sortKey === 'asset_type'}
                        <span class="text-xs opacity-90" aria-hidden="true">{sortDir === 'asc' ? '▲' : '▼'}</span>
                      {/if}
                    </button>
                  </th>
                  <th class="align-bottom">
                    <button
                      type="button"
                      class="btn btn-ghost btn-xs h-auto min-h-0 gap-1 whitespace-nowrap px-1 font-normal normal-case {headerSortClass(
                        'display_class'
                      )}"
                      on:click={() => toggleSort('display_class')}
                    >
                      Classe
                      {#if sortKey === 'display_class'}
                        <span class="text-xs opacity-90" aria-hidden="true">{sortDir === 'asc' ? '▲' : '▼'}</span>
                      {/if}
                    </button>
                  </th>
                  <th class="align-bottom">
                    <button
                      type="button"
                      class="btn btn-ghost btn-xs h-auto min-h-0 gap-1 whitespace-nowrap px-1 font-normal normal-case {headerSortClass(
                        'currency'
                      )}"
                      on:click={() => toggleSort('currency')}
                    >
                      Moeda
                      {#if sortKey === 'currency'}
                        <span class="text-xs opacity-90" aria-hidden="true">{sortDir === 'asc' ? '▲' : '▼'}</span>
                      {/if}
                    </button>
                  </th>
                  <th class="w-16 max-w-[4.5rem] align-bottom px-1">
                    <button
                      type="button"
                      class="btn btn-ghost btn-xs h-auto min-h-0 gap-1 whitespace-nowrap px-0 font-normal normal-case {headerSortClass(
                        'quantity'
                      )}"
                      on:click={() => toggleSort('quantity')}
                    >
                      Qtd
                      {#if sortKey === 'quantity'}
                        <span class="text-xs opacity-90" aria-hidden="true">{sortDir === 'asc' ? '▲' : '▼'}</span>
                      {/if}
                    </button>
                  </th>
                  <th class="align-bottom text-right pr-2 sm:pr-3">
                    <button
                      type="button"
                      class="btn btn-ghost btn-xs h-auto min-h-0 gap-1 whitespace-nowrap px-1 font-normal normal-case {headerSortClass(
                        'invested'
                      )}"
                      on:click={() => toggleSort('invested')}
                    >
                      Aplicado
                      {#if sortKey === 'invested'}
                        <span class="text-xs opacity-90" aria-hidden="true">{sortDir === 'asc' ? '▲' : '▼'}</span>
                      {/if}
                    </button>
                  </th>
                  <th class="align-bottom text-right pr-2 sm:pr-3">
                    <button
                      type="button"
                      class="btn btn-ghost btn-xs h-auto min-h-0 gap-1 whitespace-nowrap px-1 font-normal normal-case {headerSortClass(
                        'current'
                      )}"
                      on:click={() => toggleSort('current')}
                    >
                      Atual
                      {#if sortKey === 'current'}
                        <span class="text-xs opacity-90" aria-hidden="true">{sortDir === 'asc' ? '▲' : '▼'}</span>
                      {/if}
                    </button>
                  </th>
                  <th class="align-bottom text-right pr-4 sm:pr-6">
                    <button
                      type="button"
                      class="btn btn-ghost btn-xs h-auto min-h-0 gap-1 whitespace-nowrap px-1 font-normal normal-case {headerSortClass(
                        'profit'
                      )}"
                      on:click={() => toggleSort('profit')}
                    >
                      Lucro
                      {#if sortKey === 'profit'}
                        <span class="text-xs opacity-90" aria-hidden="true">{sortDir === 'asc' ? '▲' : '▼'}</span>
                      {/if}
                    </button>
                  </th>
                  <th class="align-bottom w-20"><span class="sr-only">Ações</span></th>
                </tr>
              </thead>
              <tbody>
                {#if displayedRows.length === 0}
                  <tr>
                    <td colspan="10" class="text-center text-sm text-base-content/60">
                      Nenhuma posição com os filtros atuais.
                    </td>
                  </tr>
                {:else}
                  {#each displayedRows as row}
                    <tr>
                      <td class="whitespace-nowrap pl-1 font-medium sm:pl-2">{formatTickerForDisplay(row.asset.symbol)}</td>
                      <td class="max-w-[10rem] truncate sm:max-w-[14rem] lg:max-w-[18rem]" title={row.asset.name}
                        >{row.asset.name}</td
                      >
                      <td>{formatAssetTypeForDisplay(row.asset.asset_type)}</td>
                      <td>{formatDisplayClassForDisplay(row.asset.display_class)}</td>
                      <td>{formatCurrencyCodeForDisplay(row.asset.currency)}</td>
                      <td class="w-16 max-w-[4.5rem] whitespace-nowrap px-1 text-sm tabular-nums">
                        {#if usesManualPositionValues(row.asset)}
                          <span class="text-xs" title={row.position.contracted_yield ?? ''}>—</span>
                        {:else}
                          {formatQuantityForDisplay(row.position.quantity)}
                        {/if}
                      </td>
                      <td class="overflow-visible whitespace-nowrap pr-2 text-right align-middle sm:pr-3">
                        {#if isUsdAsset(row.asset)}
                          <span class="inline-flex items-center justify-end gap-1.5">
                            <span
                              class="tabular-nums"
                              title={row.investedBrl == null
                                ? 'Atualize o câmbio USD/BRL para ver o equivalente em reais no ícone $'
                                : undefined}
                            >
                              {formatOptionalMoney(row.invested, row.asset.currency)}
                            </span>
                            <BrlEquivalentHint asset={row.asset} brlValue={row.investedBrl} />
                          </span>
                        {:else if row.investedBrl != null}
                          <span class="tabular-nums">{formatMoneyAmount(row.investedBrl, 'BRL')}</span>
                        {:else}
                          <span class="tabular-nums">{formatOptionalMoney(row.invested, row.asset.currency)}</span>
                        {/if}
                      </td>
                      <td class="overflow-visible whitespace-nowrap pr-2 text-right align-middle sm:pr-3">
                        {#if isUsdAsset(row.asset)}
                          <span class="inline-flex items-center justify-end gap-1.5">
                            <span
                              class="tabular-nums"
                              title={row.currentBrl == null
                                ? 'Atualize o câmbio USD/BRL para ver o equivalente em reais no ícone $'
                                : undefined}
                            >
                              {formatOptionalMoney(row.current, row.asset.currency)}
                            </span>
                            <BrlEquivalentHint asset={row.asset} brlValue={row.currentBrl} />
                          </span>
                        {:else if row.currentBrl != null}
                          <span class="tabular-nums">{formatMoneyAmount(row.currentBrl, 'BRL')}</span>
                        {:else}
                          <span class="tabular-nums">{formatOptionalMoney(row.current, row.asset.currency)}</span>
                        {/if}
                      </td>
                      <td class="overflow-visible whitespace-nowrap pr-4 text-right text-sm tabular-nums sm:pr-6">
                        {#if isUsdAsset(row.asset)}
                          <span class="inline-flex items-center justify-end gap-1.5">
                            <span class="tabular-nums {profitColorClass(consolidatedProfitAmount(row))}">
                              {formatConsolidatedProfit(row)}
                            </span>
                            <BrlEquivalentHint
                              asset={row.asset}
                              brlValue={consolidatedProfitBrl(row)}
                            />
                          </span>
                        {:else}
                          <span class={profitColorClass(consolidatedProfitAmount(row))}>
                            {formatConsolidatedProfit(row)}
                          </span>
                        {/if}
                      </td>
                      <td class="whitespace-nowrap px-1">
                        <button
                          class="btn btn-ghost btn-xs"
                          type="button"
                          aria-expanded={expandedPositionId === row.position.id}
                          aria-controls={positionDetailPanelId(row.position.id)}
                          on:click={() => togglePositionDetails(row.position.id)}>Detalhes</button
                        >
                      </td>
                    </tr>
                    {#if expandedPositionId === row.position.id}
                      <tr class="bg-base-200/50">
                        <td colspan="10">
                          <PositionDetailPanel
                            position={row.position}
                            asset={row.asset}
                            variant="consolidated"
                            usdBrlRate={usdBrlRate}
                            dividendsSummary={dividendsSummaryForAsset(row.asset)}
                            cryptoFeeSummary={cryptoFeeSummaryForAsset(row.asset)}
                            panelId={positionDetailPanelId(row.position.id)}
                          />
                        </td>
                      </tr>
                    {/if}
                  {/each}
                {/if}
              </tbody>
            </table>
          </div>

          <p class="text-xs text-base-content/60">
            Os três primeiros cartões mostram subtotais em R$ (moeda BRL) e em US$ (internacional). O consolidado em
            reais soma tudo o que puder ser convertido (BRL nativo + USD × taxa). Sem taxa USD/BRL, linhas em dólar não
            entram no consolidado. Posições em USD: valor em US$ na tabela; passe o mouse no ícone $ para ver o equivalente em reais.
            Lucro na tabela: em US$ para posições internacionais (com equivalente em R$ no ícone); em R$ para ativos em reais.
          </p>
        </div>
      </div>
    {/if}
  </div>
</main>

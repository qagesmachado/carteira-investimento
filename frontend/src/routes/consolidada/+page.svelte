<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';

  import {
    listAssets,
    type Asset,
    type AssetType,
    type DisplayClass
  } from '$lib/api/assets';
  import { getCryptoSnapshot, type CryptoSnapshot } from '$lib/api/cryptoFees';
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
  import PageSection from '$lib/components/PageSection.svelte';
  import DashboardPortfolioBar from '$lib/features/dashboard/DashboardPortfolioBar.svelte';
  import ConsolidadaFilterContextStrip from '$lib/features/portfolios/consolidada/ConsolidadaFilterContextStrip.svelte';
  import ConsolidadaFiltersPanel from '$lib/features/portfolios/consolidada/ConsolidadaFiltersPanel.svelte';
  import ConsolidadaFilterTotals from '$lib/features/portfolios/consolidada/ConsolidadaFilterTotals.svelte';
  import ConsolidadaPositionsTable from '$lib/features/portfolios/consolidada/ConsolidadaPositionsTable.svelte';
  import ConsolidadaShortcutBar from '$lib/features/portfolios/consolidada/ConsolidadaShortcutBar.svelte';
  import {
    clearAllConsolidadaFilters,
    clearConsolidadaFilterField,
    FILTER_DISPLAY_CLASS_NATIONAL,
    sanitizeConsolidadaPatrimonyFilters,
    type ConsolidadaFilterState
  } from '$lib/features/portfolios/consolidada/consolidadaFilterState';
  import type { ConsolidadaRow, ConsolidadaSortKey } from '$lib/features/portfolios/consolidada/consolidadaRowTypes';
  import {
    formatAssetTypeForDisplay,
    formatCurrencyCodeForDisplay,
    formatDisplayClassForDisplay,
    formatMoneyAmount
  } from '$lib/assetLabels';
  import DismissibleAlert from '$lib/components/DismissibleAlert.svelte';
  import AppPageShell from '$lib/components/AppPageShell.svelte';
  import EmptyStateCallout from '$lib/components/EmptyStateCallout.svelte';
  import { NO_PORTFOLIO_EMPTY_STATE } from '$lib/features/onboarding/emptyStateCopy';
  import PageHero from '$lib/components/PageHero.svelte';
  import DashboardHeroToolbar from '$lib/features/dashboard/DashboardHeroToolbar.svelte';
  import {
    computeDashboardPatrimonyFilterAvailability,
    isPensionAsset,
    resolvePositionCurrentBrlForDashboard,
    resolvePositionInvestedBrlForDashboard
  } from '$lib/features/dashboard/dashboardPatrimonyScope';
  import type { DashboardPatrimonyFilters } from '$lib/features/dashboard/dashboardPatrimonyFilters';
  import type { CryptoFeeDetailSummary } from '$lib/features/bitcoin/cryptoFeePositionDetail';
  import {
    computeExcludedRebalanceBrl,
    computeInvestmentValueBrl,
    findAssetPartition
  } from '$lib/features/portfolios/positionPurpose';
  import {
    computeInvestmentShare,
    scalePositionAmount
  } from '$lib/features/portfolios/consolidadaInvestmentDisplay';
  import { getObjectivesSnapshot, type ObjectivesSnapshot } from '$lib/api/objetivos';
  import {
    buildDividendTotalsByAssetId,
    formatDividendsReceivedSummary
  } from '$lib/features/proventos/dividendSummary';
  import {
    computePositionProfit,
    formatQuantityForDisplay,
    positionCurrentValue,
    positionInvestedValue,
    usesManualPositionValues,
    valueInBrl
  } from '$lib/features/portfolios/positionMetrics';
  import { formatTickerForDisplay } from '$lib/formatTickerForDisplay';

  type SortKey = ConsolidadaSortKey;

  /** Filtros como string para binds de <select> funcionarem de forma estÃ¡vel */

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

  /** Valor sentinela no <select>: filtra por mercado nacional (nÃ£o Ã© um display_class da API). */

  let portfolios: Portfolio[] = [];
  let assets: Asset[] = [];
  let positions: Position[] = [];
  let dividendPayments: DividendPayment[] = [];
  let activeId: number | null = null;
  let usdBrlRate: number | null = null;
  let usdBrlRefreshedAt: string | null = null;
  let quotesRefreshedAt: string | null = null;
  let dataLoadedAt: string | null = null;

  let filterState: ConsolidadaFilterState = {
    filterText: '',
    filterAssetTypeStr: '',
    filterDisplayClassStr: '',
    filterCurrency: '',
    filterIncludeNonInvestment: false,
    filterIncludePension: false
  };

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
  let cryptoSnapshotsByAssetId: Record<number, CryptoSnapshot> = {};
  let objectivesSnapshot: ObjectivesSnapshot | null = null;

  $: assetById = Object.fromEntries(assets.map((a) => [a.id, a]));
  $: activePortfolio = portfolios.find((p) => p.id === activeId) ?? null;
  $: dividendTotalsByAssetId = buildDividendTotalsByAssetId(dividendPayments);

  function dividendsSummaryForAsset(asset: Asset): string {
    return formatDividendsReceivedSummary(dividendTotalsByAssetId.get(asset.id), asset);
  }

  function cryptoFeeSummaryForAsset(asset: Asset): CryptoFeeDetailSummary | undefined {
    if (asset.asset_type !== 'crypto') {
      return undefined;
    }
    const snapshot = cryptoSnapshotsByAssetId[asset.id];
    if (!snapshot) {
      return undefined;
    }
    return {
      profitAfterFeesBrl: snapshot.profit_after_fees_brl,
      appreciationAfterFeesPercent: snapshot.appreciation_after_fees_percent,
      totalFeesBrl: snapshot.total_fees_brl,
      totalFeesUsd: snapshot.total_fees_usd
    };
  }

  async function loadCryptoSnapshots(
    portfolioId: number | null,
    positionList: Position[],
    assetList: Asset[]
  ) {
    if (portfolioId == null) {
      cryptoSnapshotsByAssetId = {};
      return;
    }
    const byId = Object.fromEntries(assetList.map((a) => [a.id, a]));
    const cryptoAssetIds = [
      ...new Set(
        positionList
          .map((p) => p.asset_id)
          .filter((id) => byId[id]?.asset_type === 'crypto')
      )
    ];
    if (cryptoAssetIds.length === 0) {
      cryptoSnapshotsByAssetId = {};
      return;
    }
    const entries = await Promise.all(
      cryptoAssetIds.map(async (assetId) => {
        try {
          const snap = await getCryptoSnapshot(portfolioId, assetId);
          return [assetId, snap] as const;
        } catch {
          return null;
        }
      })
    );
    cryptoSnapshotsByAssetId = Object.fromEntries(
      entries.filter((entry): entry is readonly [number, CryptoSnapshot] => entry != null)
    );
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

  type Row = ConsolidadaRow;

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

  function consolidatedProfitBrl(row: Row): number | null {
    const invested = displayInvestedBrl(row);
    const current = displayCurrentBrl(row);
    if (
      invested != null &&
      current != null &&
      invested > 0 &&
      Number.isFinite(current - invested)
    ) {
      return current - invested;
    }
    return null;
  }

  function consolidatedProfitAmount(row: Row): number | null {
    if (!isUsdAsset(row.asset)) {
      return consolidatedProfitBrl(row);
    }
    const invested = displayInvestedNative(row);
    const current = displayCurrentNative(row);
    if (invested != null && current != null && invested > 0) {
      return current - invested;
    }
    return row.profit?.profit ?? null;
  }

  function profitColorClass(amount: number | null): string {
    if (amount == null) {
      return '';
    }
    return amount >= 0 ? 'text-success' : 'text-error';
  }

  function profitBadgeClass(amount: number | null): string {
    if (amount == null) {
      return 'bg-base-200 text-base-content/60';
    }
    return amount >= 0 ? 'bg-success/15 text-success' : 'bg-error/15 text-error';
  }

  function consolidatedProfitPercent(row: Row): number | null {
    const amount = consolidatedProfitAmount(row);
    const invested = isUsdAsset(row.asset) ? displayInvestedNative(row) : displayInvestedBrl(row);
    if (amount == null || invested == null || invested <= 0) {
      return null;
    }
    return (amount / invested) * 100;
  }

  function formatConsolidatedProfitAmount(row: Row): string {
    const amount = consolidatedProfitAmount(row);
    if (amount == null) {
      return '—';
    }
    return formatMoneyAmount(amount, isUsdAsset(row.asset) ? 'USD' : 'BRL');
  }

  function handleFilterChipRemove(chipId: string) {
    filterState = clearConsolidadaFilterField(filterState, chipId);
  }

  function handleClearFilters() {
    filterState = clearAllConsolidadaFilters(filterState);
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

  /** Inclui ETFs de renda fixa quando o filtro Â«TipoÂ» Ã© Â«Renda fixaÂ». */
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

  function assetPartitionFor(assetId: number) {
    return findAssetPartition(objectivesSnapshot?.asset_partitions ?? [], assetId) ?? null;
  }

  function patrimonyFilters(): DashboardPatrimonyFilters {
    return {
      includeNonInvestment: effectiveFilterState.filterIncludeNonInvestment,
      includePension: effectiveFilterState.filterIncludePension
    };
  }

  function investmentShare(row: Row): number {
    return computeInvestmentShare(
      effectiveFilterState.filterIncludeNonInvestment,
      row.currentBrl,
      investmentCurrentBrl(row)
    );
  }

  function displayInvestedNative(row: Row): number | null {
    return scalePositionAmount(row.invested, investmentShare(row));
  }

  function displayCurrentNative(row: Row): number | null {
    return scalePositionAmount(row.current, investmentShare(row));
  }

  function investmentCurrentBrl(row: Row): number | null {
    return computeInvestmentValueBrl(
      row.currentBrl,
      computeExcludedRebalanceBrl(assetPartitionFor(row.asset.id))
    );
  }

  function displayCurrentBrl(row: Row): number | null {
    return resolvePositionCurrentBrlForDashboard(
      row.position,
      row.asset,
      usdBrlRate,
      assetPartitionFor(row.asset.id) ?? undefined,
      patrimonyFilters()
    );
  }

  function displayInvestedBrl(row: Row): number | null {
    return resolvePositionInvestedBrlForDashboard(
      row.position,
      row.asset,
      usdBrlRate,
      assetPartitionFor(row.asset.id) ?? undefined,
      patrimonyFilters()
    );
  }

  async function loadObjectivesSnapshot(portfolioId: number) {
    try {
      objectivesSnapshot = await getObjectivesSnapshot(portfolioId);
    } catch {
      objectivesSnapshot = null;
    }
  }

  $: allRows = buildRows(positions, assetById, usdBrlRate);
  $: partitionsByAssetId = Object.fromEntries(
    (objectivesSnapshot?.asset_partitions ?? []).map((partition) => [partition.asset_id, partition])
  );
  $: filterAvailability = computeDashboardPatrimonyFilterAvailability(
    positions,
    assetById,
    partitionsByAssetId
  );
  $: effectiveFilterState = sanitizeConsolidadaPatrimonyFilters(filterState, filterAvailability);

  $: filteredRows = allRows.filter((row) => {
    if (!rowMatchesTextSearch(row, filterState.filterText)) {
      return false;
    }
    if (!rowMatchesAssetTypeFilter(row.asset, filterState.filterAssetTypeStr)) {
      return false;
    }
    if (filterState.filterDisplayClassStr === FILTER_DISPLAY_CLASS_NATIONAL) {
      if (row.asset.market !== 'national') {
        return false;
      }
    } else if (filterState.filterDisplayClassStr !== '' && row.asset.display_class !== filterState.filterDisplayClassStr) {
      return false;
    }
    if (!currencyMatches(filterState.filterCurrency, row.asset.currency)) {
      return false;
    }
    if (!effectiveFilterState.filterIncludePension && isPensionAsset(row.asset)) {
      return false;
    }
    if (!effectiveFilterState.filterIncludeNonInvestment && !isPensionAsset(row.asset)) {
      const investmentValue = investmentCurrentBrl(row);
      const currentBrl = row.currentBrl;
      if (currentBrl != null && currentBrl > 0 && (investmentValue == null || investmentValue <= 0)) {
        return false;
      }
    }
    return true;
  });

  $: displayedRows = [...filteredRows].sort((a, b) =>
    compareRows(a, b, sortKey, sortDir === 'asc' ? 1 : -1)
  );

  /** PosiÃ§Ãµes cuja moeda do ativo Ã© BRL (subtotais Â«em reaisÂ» nos cartÃµes). */
  $: rowsBrlCurrency = displayedRows.filter(
    (r) => r.asset.currency?.trim().toUpperCase() === 'BRL'
  );
  $: totalInvestedBrlCurrency = rowsBrlCurrency.reduce((sum, r) => {
    const v = displayInvestedBrl(r);
    if (v == null) {
      return sum;
    }
    return sum + v;
  }, 0);
  $: totalCurrentBrlCurrency = rowsBrlCurrency.reduce((sum, r) => {
    const v = displayCurrentBrl(r);
    if (v == null) {
      return sum;
    }
    return sum + v;
  }, 0);
  $: totalInvestedBrlCurrencyLines = rowsBrlCurrency.filter((r) => displayInvestedBrl(r) != null).length;
  $: totalCurrentBrlCurrencyLines = rowsBrlCurrency.filter((r) => displayCurrentBrl(r) != null).length;
  $: profitBrlCurrencyRows = rowsBrlCurrency.filter(
    (r) => displayInvestedBrl(r) != null && displayCurrentBrl(r) != null
  );
  $: totalProfitBrlCurrency = profitBrlCurrencyRows.reduce(
    (sum, r) => sum + (displayCurrentBrl(r)! - displayInvestedBrl(r)!),
    0
  );
  $: sumInvestedBrlCurrencyForPct = profitBrlCurrencyRows.reduce(
    (sum, r) => sum + displayInvestedBrl(r)!,
    0
  );
  $: aggregateProfitPercentBrlCurrency =
    sumInvestedBrlCurrencyForPct > 0 ? (totalProfitBrlCurrency / sumInvestedBrlCurrencyForPct) * 100 : null;

  /**
   * Consolidado em BRL: recalcula com valueInBrl para nÃ£o depender sÃ³ do cache em Row
   * (garante USD internacional quando hÃ¡ taxa, mesmo se algo na linha mudar).
   */
  $: totalInvestedBrl = displayedRows.reduce((sum, r) => {
    const v = displayInvestedBrl(r);
    return v != null ? sum + v : sum;
  }, 0);
  $: totalCurrentBrl = displayedRows.reduce((sum, r) => {
    const v = displayCurrentBrl(r);
    return v != null ? sum + v : sum;
  }, 0);
  $: totalInvestedBrlLines = displayedRows.filter((r) => displayInvestedBrl(r) != null).length;
  $: totalCurrentBrlLines = displayedRows.filter((r) => displayCurrentBrl(r) != null).length;

  /** Lucro e % do consolidado: linhas com aplicado e atual convertíveis para BRL. */
  $: profitBrlRows = displayedRows.filter((r) => {
    const invested = displayInvestedBrl(r);
    const current = displayCurrentBrl(r);
    return invested != null && current != null;
  });
  $: totalProfitBrl = profitBrlRows.reduce((sum, r) => {
    const a = displayInvestedBrl(r)!;
    const b = displayCurrentBrl(r)!;
    return sum + (b - a);
  }, 0);
  $: sumInvestedBrlForProfitPct = profitBrlRows.reduce((sum, r) => {
    const a = displayInvestedBrl(r)!;
    return sum + a;
  }, 0);
  $: aggregateProfitPercent =
    sumInvestedBrlForProfitPct > 0 ? (totalProfitBrl / sumInvestedBrlForProfitPct) * 100 : null;

  /** Internacional em USD (valores na moeda do ativo, sem conversÃ£o) */
  $: usdInternationalRows = displayedRows.filter(
    (r) => r.asset.currency?.trim().toUpperCase() === 'USD' && r.asset.market === 'international'
  );
  $: totalInvestedUsdIntl = usdInternationalRows.reduce((sum, r) => {
    const v = displayInvestedNative(r);
    if (v == null) {
      return sum;
    }
    return sum + v;
  }, 0);
  $: totalCurrentUsdIntl = usdInternationalRows.reduce((sum, r) => {
    const v = displayCurrentNative(r);
    if (v == null) {
      return sum;
    }
    return sum + v;
  }, 0);
  $: totalInvestedUsdIntlLines = usdInternationalRows.filter((r) => displayInvestedNative(r) != null).length;
  $: totalCurrentUsdIntlLines = usdInternationalRows.filter((r) => displayCurrentNative(r) != null).length;
  $: profitUsdIntlRows = usdInternationalRows.filter(
    (r) => displayInvestedNative(r) != null && displayCurrentNative(r) != null
  );
  $: totalProfitUsdIntl = profitUsdIntlRows.reduce(
    (sum, r) => sum + (displayCurrentNative(r)! - displayInvestedNative(r)!),
    0
  );
  $: sumInvestedUsdIntlForPct = profitUsdIntlRows.reduce(
    (sum, r) => sum + displayInvestedNative(r)!,
    0
  );
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
      await loadObjectivesSnapshot(activeId);
    } else {
      positions = [];
      objectivesSnapshot = null;
    }
  }

  async function loadFx() {
    try {
      const s = await getUsdBrl();
      usdBrlRate = s.rate;
      usdBrlRefreshedAt = s.refreshed_at;
      /* Sem taxa guardada o consolidado em BRL fica vazio para USD; tenta obter uma vez (mesma origem do botÃ£o). */
      if (usdBrlRate == null) {
        try {
          const r = await refreshUsdBrl();
          usdBrlRate = r.rate;
          usdBrlRefreshedAt = r.refreshed_at;
        } catch {
          /* mantÃ©m null â€” o utilizador pode usar Â«Atualizar cÃ¢mbioÂ» */
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
    await loadCryptoSnapshots(activeId, positions, assets);
    await loadFx();
    dataLoadedAt = new Date().toISOString();
  }

  async function handleSelectPortfolio(id: number) {
    if (id === activeId) {
      return;
    }
    activeId = id;
    await setActivePortfolioId(id);
    positions = await listPositions(id);
    await loadObjectivesSnapshot(id);
    try {
      dividendPayments = await listDividendPayments({ portfolio_id: id });
    } catch {
      dividendPayments = [];
    }
    await loadCryptoSnapshots(id, positions, assets);
    dataLoadedAt = new Date().toISOString();
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
      quotesRefreshedAt = result.refreshed_at;
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
      filterState.filterDisplayClassStr = classParam;
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
  <AppPageShell paddingY="py-4" class="flex w-full min-w-0 flex-col gap-3">
    <PageHero
      title="Visão consolidada"
      subtitle="Todas as posições da carteira numa única grade"
      variant="dashboard"
    >
      <DashboardHeroToolbar
        slot="actions"
        {loading}
        {refreshingQuotes}
        {refreshingFx}
        quotesDisabled={activeId == null}
        onRefreshQuotes={handleRefreshQuotes}
        onRefreshFx={handleRefreshFx}
      />
    </PageHero>

    <DismissibleAlert text={loadError} variant="error" on:dismiss={() => (loadError = '')} />
    <DismissibleAlert text={quotesMessage} variant="success" on:dismiss={() => (quotesMessage = '')} />
    <DismissibleAlert text={quotesError} variant="error" on:dismiss={() => (quotesError = '')} />
    <DismissibleAlert text={fxMessage} variant="success" on:dismiss={() => (fxMessage = '')} />
    <DismissibleAlert text={fxError} variant="error" on:dismiss={() => (fxError = '')} />

    <PageSection>
      <DashboardPortfolioBar
        {portfolios}
        {activeId}
        activePortfolioName={activePortfolio?.name ?? ''}
        {usdBrlRate}
        {usdBrlRefreshedAt}
        quotesRefreshedAt={quotesRefreshedAt ?? dataLoadedAt}
        disabled={portfolios.length === 0}
        on:select={(event) => void handlePortfolioSelect(event.detail)}
      />
    </PageSection>

    {#if !activeId}
      <EmptyStateCallout {...NO_PORTFOLIO_EMPTY_STATE} testId="consolidada-sem-carteira" />
    {:else}
      <PageSection title="Explorar posições" testId="consolidada-filters-section">
        <ConsolidadaFiltersPanel
          bind:filterState
          chipsFilterState={effectiveFilterState}
          assetTypes={ASSET_TYPES}
          displayClasses={DISPLAY_CLASSES}
          {filterAvailability}
          on:chipRemove={(event) => handleFilterChipRemove(event.detail)}
          on:clearAll={handleClearFilters}
        />
      </PageSection>

      <ConsolidadaFilterContextStrip
        filterState={effectiveFilterState}
        visibleCount={displayedRows.length}
        {sortKey}
        {sortDir}
      />

      {#if displayedRows.length > 0}
        <PageSection title="Totais do filtro" testId="consolidada-filter-totals">
          <ConsolidadaFilterTotals
            {totalInvestedBrlCurrency}
            {totalInvestedBrlCurrencyLines}
            {totalInvestedUsdIntl}
            {totalInvestedUsdIntlLines}
            {totalCurrentBrlCurrency}
            {totalCurrentBrlCurrencyLines}
            {totalCurrentUsdIntl}
            {totalCurrentUsdIntlLines}
            {totalProfitBrlCurrency}
            {aggregateProfitPercentBrlCurrency}
            profitBrlCurrencyRowsCount={profitBrlCurrencyRows.length}
            {totalProfitUsdIntl}
            {aggregateProfitUsdIntlPercent}
            profitUsdIntlRowsCount={profitUsdIntlRows.length}
            {totalInvestedBrl}
            {totalCurrentBrl}
            {totalProfitBrl}
            {aggregateProfitPercent}
            {totalInvestedBrlLines}
            {totalCurrentBrlLines}
            profitBrlRowsCount={profitBrlRows.length}
            {usdBrlRate}
          />
        </PageSection>
      {/if}

      <PageSection title="Posições ({displayedRows.length})" testId="consolidada-positions-section">
        <ConsolidadaPositionsTable
          rows={displayedRows}
          {sortKey}
          {sortDir}
          {expandedPositionId}
          {usdBrlRate}
          {isUsdAsset}
          {displayInvestedBrl}
          {displayCurrentBrl}
          {displayInvestedNative}
          {displayCurrentNative}
          {formatOptionalMoney}
          {formatConsolidatedProfitAmount}
          {consolidatedProfitAmount}
          {consolidatedProfitBrl}
          {consolidatedProfitPercent}
          {profitColorClass}
          {profitBadgeClass}
          {assetPartitionFor}
          {dividendsSummaryForAsset}
          {cryptoFeeSummaryForAsset}
          {positionDetailPanelId}
          on:sort={(event) => toggleSort(event.detail)}
          on:toggleDetails={(event) => togglePositionDetails(event.detail)}
        />
      </PageSection>

      <ConsolidadaShortcutBar />
    {/if}
  </AppPageShell>
</main>

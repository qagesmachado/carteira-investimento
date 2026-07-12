<script lang="ts">
  import { onMount } from 'svelte';

  import { listAssets, type Asset } from '$lib/api/assets';
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
  import { getPortfolioRebalance, type RebalanceSnapshot } from '$lib/api/rebalance';
  import { getObjectivesSnapshot, type ObjectivesSnapshot } from '$lib/api/objetivos';
  import { parseApiError } from '$lib/api/parseApiError';
  import DismissibleAlert from '$lib/components/DismissibleAlert.svelte';
  import AppPageShell from '$lib/components/AppPageShell.svelte';
  import PageHero from '$lib/components/PageHero.svelte';
  import PageSection from '$lib/components/PageSection.svelte';
  import AllocationChart from '$lib/features/dashboard/AllocationChart.svelte';
  import DashboardHeroToolbar from '$lib/features/dashboard/DashboardHeroToolbar.svelte';
  import DashboardHighlightsRow from '$lib/features/dashboard/DashboardHighlightsRow.svelte';
  import DashboardPortfolioBar from '$lib/features/dashboard/DashboardPortfolioBar.svelte';
  import DashboardShortcutBar from '$lib/features/dashboard/DashboardShortcutBar.svelte';
  import DashboardSummaryCards from '$lib/features/dashboard/DashboardSummaryCards.svelte';
  import Dividends12MonthChart from '$lib/features/dashboard/Dividends12MonthChart.svelte';
  import TopAssetsPanel from '$lib/features/dashboard/TopAssetsPanel.svelte';
  import {
    filterPaymentsInRange,
    getMonthBounds,
    getYearBounds,
    topAssetsByDividendAmount
  } from '$lib/features/dashboard/dividendDashboard';
  import {
    computeAllocationByDisplayClass,
    computeDashboardPatrimony,
    computeGrossReturnByDisplayClass,
    pickTopGrossReturnClasses
  } from '$lib/features/dashboard/portfolioDashboard';
  import { dashboardPatrimonyFilters } from '$lib/features/dashboard/dashboardPatrimonyFilters';
  import {
    computeDashboardPatrimonyFilterAvailability,
    sanitizeDashboardPatrimonyFilters
  } from '$lib/features/dashboard/dashboardPatrimonyScope';
  import {
    topAssetsByGrossProfit,
    topAssetsByPositionValue,
    topAssetsByProfitPercent
  } from '$lib/features/dashboard/topAssetsDashboard';
  import { summarizeDividendPayments } from '$lib/features/proventos/dividendSummary';

  let portfolios: Portfolio[] = [];
  let assets: Asset[] = [];
  let positions: Position[] = [];
  let dividendPayments: DividendPayment[] = [];
  let rebalanceSnapshot: RebalanceSnapshot | null = null;
  let objectivesSnapshot: ObjectivesSnapshot | null = null;
  let activeId: number | null = null;
  let usdBrlRate: number | null = null;
  let usdBrlRefreshedAt: string | null = null;
  let quotesRefreshedAt: string | null = null;
  let dataLoadedAt: string | null = null;

  let loading = false;
  let rebalanceLoading = false;
  let refreshingQuotes = false;
  let refreshingFx = false;

  let quotesMessage = '';
  let quotesError = '';
  let fxMessage = '';
  let fxError = '';
  let loadError = '';
  let rebalanceError = '';

  $: assetById = Object.fromEntries(assets.map((a) => [a.id, a]));
  $: activePortfolio = portfolios.find((p) => p.id === activeId) ?? null;
  $: partitionsByAssetId = Object.fromEntries(
    (objectivesSnapshot?.asset_partitions ?? []).map((partition) => [partition.asset_id, partition])
  );
  $: patrimonyFilters = $dashboardPatrimonyFilters;
  $: filterAvailability = computeDashboardPatrimonyFilterAvailability(
    positions,
    assetById,
    partitionsByAssetId
  );
  $: effectivePatrimonyFilters = sanitizeDashboardPatrimonyFilters(
    patrimonyFilters,
    filterAvailability
  );
  $: patrimony = computeDashboardPatrimony(
    positions,
    assetById,
    usdBrlRate,
    partitionsByAssetId,
    effectivePatrimonyFilters
  );
  $: allocationRows = computeAllocationByDisplayClass(
    positions,
    assetById,
    usdBrlRate,
    partitionsByAssetId,
    effectivePatrimonyFilters
  );
  $: grossReturnRows = computeGrossReturnByDisplayClass(positions, assetById, usdBrlRate);
  $: featuredClasses = pickTopGrossReturnClasses(grossReturnRows);

  $: assetIdsInPortfolio = new Set(
    positions.map((p) => p.asset_id).filter((id) => assetById[id])
  );

  $: monthBounds = getMonthBounds();
  $: yearBounds = getYearBounds();
  $: dividendsMonth = summarizeDividendPayments(
    filterPaymentsInRange(dividendPayments, monthBounds.from, monthBounds.to)
  );
  $: dividendsYear = summarizeDividendPayments(
    filterPaymentsInRange(dividendPayments, yearBounds.from, yearBounds.to)
  );
  $: allPaymentsForPortfolio = dividendPayments.filter((p) =>
    assetIdsInPortfolio.has(p.asset_id)
  );
  $: topDividendAssets = topAssetsByDividendAmount(
    allPaymentsForPortfolio,
    assetIdsInPortfolio,
    assetById,
    5
  );
  $: topByProfitPercent = topAssetsByProfitPercent(positions, assetById, 5);
  $: topByPositionValue = topAssetsByPositionValue(positions, assetById, usdBrlRate, 5);
  $: topByGrossProfit = topAssetsByGrossProfit(positions, assetById, usdBrlRate, 5);

  async function loadFx() {
    try {
      const fx = await getUsdBrl();
      usdBrlRate = fx.rate;
      usdBrlRefreshedAt = fx.refreshed_at;
    } catch {
      usdBrlRate = null;
      usdBrlRefreshedAt = null;
    }
  }

  async function loadPositionsForActive() {
    if (activeId == null) {
      positions = [];
      return;
    }
    positions = await listPositions(activeId);
  }

  async function loadPaymentsForActive() {
    if (activeId == null) {
      dividendPayments = [];
      return;
    }
    dividendPayments = await listDividendPayments({ portfolio_id: activeId });
  }

  async function loadObjectivesForActive() {
    if (activeId == null) {
      objectivesSnapshot = null;
      return;
    }
    try {
      objectivesSnapshot = await getObjectivesSnapshot(activeId);
    } catch {
      objectivesSnapshot = null;
    }
  }

  async function loadRebalanceForActive() {
    if (activeId == null) {
      rebalanceSnapshot = null;
      return;
    }
    rebalanceLoading = true;
    rebalanceError = '';
    try {
      rebalanceSnapshot = await getPortfolioRebalance(activeId);
    } catch (err) {
      rebalanceSnapshot = null;
      rebalanceError = parseApiError(err, 'Não foi possível carregar aderência ao rebalanceamento.');
    } finally {
      rebalanceLoading = false;
    }
  }

  async function refresh() {
    const [portfolioList, assetList, active] = await Promise.all([
      listPortfolios(),
      listAssets(),
      getActivePortfolioId()
    ]);
    portfolios = portfolioList;
    assets = assetList;
    activeId = active ?? (portfolioList[0]?.id ?? null);
    await loadFx();
    await Promise.all([
      loadPositionsForActive(),
      loadPaymentsForActive(),
      loadRebalanceForActive(),
      loadObjectivesForActive()
    ]);
    dataLoadedAt = new Date().toISOString();
  }

  async function handlePortfolioSelect(id: number) {
    if (id === activeId) {
      return;
    }
    activeId = id;
    loadError = '';
    try {
      await setActivePortfolioId(id);
      await Promise.all([
      loadPositionsForActive(),
      loadPaymentsForActive(),
      loadRebalanceForActive(),
      loadObjectivesForActive()
    ]);
      dataLoadedAt = new Date().toISOString();
    } catch (err) {
      loadError = parseApiError(err, 'Não foi possível trocar a carteira.');
    }
  }

  async function handleRefreshQuotes() {
    if (activeId == null) {
      return;
    }
    refreshingQuotes = true;
    quotesError = '';
    quotesMessage = '';
    try {
      const result = await refreshPortfolioQuotes(activeId);
      quotesRefreshedAt = result.refreshed_at;
      await refresh();
      quotesMessage = `Cotações atualizadas: ${result.updated}. Ignoradas: ${result.skipped}.`;
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
      fxMessage = `Câmbio USD/BRL atualizado.`;
    } catch (err) {
      fxError = parseApiError(err, 'Não foi possível atualizar o câmbio USD/BRL.');
    } finally {
      refreshingFx = false;
    }
  }

  onMount(() => {
    loading = true;
    refresh()
      .catch((err) => {
        loadError = parseApiError(err, 'Não foi possível carregar o dashboard.');
      })
      .finally(() => {
        loading = false;
      });
  });
</script>

<svelte:head>
  <title>Dashboard</title>
</svelte:head>

<main class="min-h-screen w-full bg-base-200">
  <AppPageShell paddingY="py-4" class="flex w-full min-w-0 flex-col gap-3">
    <PageHero title="Dashboard" variant="dashboard">
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
    <DismissibleAlert text={rebalanceError} variant="error" on:dismiss={() => (rebalanceError = '')} />
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
      <p class="text-center text-sm text-base-content/60">
        Crie ou selecione uma carteira em <a class="link link-primary" href="/portfolios">Carteiras</a>.
      </p>
    {:else if loading}
      <p class="text-center text-sm text-base-content/60">Carregando…</p>
    {:else}
      {#if patrimony.activePositions === 0}
        <div class="alert">
          <span>
            Nenhuma posição nesta carteira. Cadastre ativos e posições em
            <a class="link link-primary" href="/portfolios">Carteiras</a>.
          </span>
        </div>
      {:else}
        <DashboardSummaryCards
          {patrimony}
          {dividendsMonth}
          {dividendsYear}
          {filterAvailability}
        />

        <DashboardHighlightsRow
          rebalance={rebalanceSnapshot}
          rebalanceLoading={rebalanceLoading}
          featuredClasses={featuredClasses}
          payments={allPaymentsForPortfolio}
          assetSymbolById={Object.fromEntries(assets.map((asset) => [asset.id, asset.symbol]))}
        />

        <div class="grid gap-3 lg:grid-cols-2">
          <AllocationChart rows={allocationRows} {filterAvailability} />
          <Dividends12MonthChart payments={allPaymentsForPortfolio} {usdBrlRate} />
        </div>

        <TopAssetsPanel
          profitPercentRows={topByProfitPercent}
          positionValueRows={topByPositionValue}
          dividendRows={topDividendAssets}
          grossProfitRows={topByGrossProfit}
          dividendPayments={allPaymentsForPortfolio}
        />

        <DashboardShortcutBar />
      {/if}
    {/if}
  </AppPageShell>
</main>

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
  import { parseApiError } from '$lib/api/parseApiError';
  import { formatCurrencyCodeForDisplay, formatMoneyAmount } from '$lib/assetLabels';
  import DismissibleAlert from '$lib/components/DismissibleAlert.svelte';
  import AllocationChart from '$lib/features/dashboard/AllocationChart.svelte';
  import DashboardSummaryCards from '$lib/features/dashboard/DashboardSummaryCards.svelte';
  import DividendSummaryPanel from '$lib/features/dashboard/DividendSummaryPanel.svelte';
  import TopAssetsPanel from '$lib/features/dashboard/TopAssetsPanel.svelte';
  import {
    filterPaymentsInRange,
    getMonthBounds,
    getYearBounds,
    topAssetsByDividendAmount
  } from '$lib/features/dashboard/dividendDashboard';
  import {
    computeAllocationByDisplayClass,
    computeDashboardPatrimony
  } from '$lib/features/dashboard/portfolioDashboard';
  import {
    topAssetsByGrossProfit,
    topAssetsByPositionValue,
    topAssetsByProfitPercent
  } from '$lib/features/dashboard/topAssetsDashboard';
  import PortfolioSelect from '$lib/features/portfolios/PortfolioSelect.svelte';
  import { summarizeDividendPayments } from '$lib/features/proventos/dividendSummary';

  let portfolios: Portfolio[] = [];
  let assets: Asset[] = [];
  let positions: Position[] = [];
  let dividendPayments: DividendPayment[] = [];
  let activeId: number | null = null;
  let usdBrlRate: number | null = null;
  let usdBrlRefreshedAt: string | null = null;

  let loading = false;
  let refreshingQuotes = false;
  let refreshingFx = false;

  let quotesMessage = '';
  let quotesError = '';
  let fxMessage = '';
  let fxError = '';
  let loadError = '';

  $: assetById = Object.fromEntries(assets.map((a) => [a.id, a]));
  $: patrimony = computeDashboardPatrimony(positions, assetById, usdBrlRate);
  $: allocationRows = computeAllocationByDisplayClass(positions, assetById, usdBrlRate);

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
      : 'Sem taxa USD/BRL armazenada. Use «Atualizar câmbio (USD/BRL)» para converter posições em dólar.';

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
    await loadPositionsForActive();
    await loadPaymentsForActive();
  }

  async function handlePortfolioSelect(id: number) {
    if (id === activeId) {
      return;
    }
    activeId = id;
    loadError = '';
    try {
      await setActivePortfolioId(id);
      await loadPositionsForActive();
      await loadPaymentsForActive();
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
  <div class="mx-auto flex w-full min-w-0 max-w-6xl flex-col gap-6 px-4 py-8">
    <section
      class="w-full rounded-box bg-gradient-to-r from-primary to-secondary px-6 py-10 text-primary-content"
    >
      <h1 class="text-4xl font-bold">Dashboard</h1>
      <p class="mt-2 text-primary-content/90">Visão executiva da carteira selecionada</p>
    </section>

    <DismissibleAlert text={loadError} variant="error" on:dismiss={() => (loadError = '')} />
    <DismissibleAlert text={quotesMessage} variant="success" on:dismiss={() => (quotesMessage = '')} />
    <DismissibleAlert text={quotesError} variant="error" on:dismiss={() => (quotesError = '')} />
    <DismissibleAlert text={fxMessage} variant="success" on:dismiss={() => (fxMessage = '')} />
    <DismissibleAlert text={fxError} variant="error" on:dismiss={() => (fxError = '')} />

    <div class="card bg-base-100 shadow">
      <div class="card-body flex flex-col gap-4">
        <p class="text-sm text-base-content/70">{fxStatusLine}</p>
        <div class="flex flex-row flex-wrap items-end justify-between gap-4">
          <div class="form-control min-w-[12rem] flex-1">
            <span class="label-text text-xs font-semibold">Carteira</span>
            <PortfolioSelect
              {portfolios}
              {activeId}
              disabled={portfolios.length === 0}
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
          </div>
        </div>
      </div>
    </div>

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
        />

        {#if patrimony.totalsByCurrency.length > 0}
          <div class="card bg-base-100 shadow">
            <div class="card-body">
              <h2 class="card-title text-lg">Por moeda</h2>
              <ul class="flex flex-wrap gap-4 text-sm">
                {#each patrimony.totalsByCurrency as row}
                  <li>
                    <span class="font-semibold">{formatCurrencyCodeForDisplay(row.currency)}:</span>
                    {formatMoneyAmount(row.current, row.currency)} (aplicado
                    {formatMoneyAmount(row.invested, row.currency)})
                  </li>
                {/each}
              </ul>
            </div>
          </div>
        {/if}

        <div class="grid gap-6 lg:grid-cols-2">
          <AllocationChart rows={allocationRows} />
          <DividendSummaryPanel payments={allPaymentsForPortfolio} {usdBrlRate} />
        </div>

        <TopAssetsPanel
          profitPercentRows={topByProfitPercent}
          positionValueRows={topByPositionValue}
          dividendRows={topDividendAssets}
          grossProfitRows={topByGrossProfit}
        />
      {/if}
    {/if}
  </div>
</main>

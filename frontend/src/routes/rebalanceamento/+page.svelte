<script lang="ts">
  import { onMount } from 'svelte';

  import { parseApiError } from '$lib/api/parseApiError';
  import { getUsdBrl, refreshUsdBrl } from '$lib/api/fx';
  import {
    getActivePortfolioId,
    listPortfolios,
    refreshPortfolioQuotes,
    setActivePortfolioId,
    type Portfolio
  } from '$lib/api/portfolios';
  import { getPortfolioRebalance, type RebalanceSnapshot } from '$lib/api/rebalance';
  import DismissibleAlert from '$lib/components/DismissibleAlert.svelte';
  import AppPageShell from '$lib/components/AppPageShell.svelte';
  import PageHero from '$lib/components/PageHero.svelte';
  import PageSection from '$lib/components/PageSection.svelte';
  import DashboardHeroToolbar from '$lib/features/dashboard/DashboardHeroToolbar.svelte';
  import DashboardPortfolioBar from '$lib/features/dashboard/DashboardPortfolioBar.svelte';
  import AssetRebalanceTable from '$lib/features/rebalance/AssetRebalanceTable.svelte';
  import RebalanceAssetGroupTabs from '$lib/features/rebalance/RebalanceAssetGroupTabs.svelte';
  import RebalanceClassTable from '$lib/features/rebalance/RebalanceClassTable.svelte';
  import RebalanceKpiCards from '$lib/features/rebalance/RebalanceKpiCards.svelte';
  import RebalanceSimulationPanel from '$lib/features/rebalance/RebalanceSimulationPanel.svelte';
  import RebalanceTableFilter from '$lib/features/rebalance/RebalanceTableFilter.svelte';
  import type { RebalanceAssetGroupTab } from '$lib/features/rebalance/rebalanceAssetGroupTabs';
  import {
    computeClassInvestmentAllocation,
    defaultIncludedClasses,
    getClassContributionFromPlan,
    resolveInvestmentAmount,
    type SimulationMode
  } from '$lib/features/rebalance/investmentAllocation';
  import {
    filterConfiguredRebalanceClasses,
    resolveAssetGroupTab,
    sumClassRebalanceGapBrl,
    visibleAssetGroupTabs
  } from '$lib/features/rebalance/rebalanceVisibility';

  type AssetGroupTab = RebalanceAssetGroupTab;

  let portfolios: Portfolio[] = [];
  let activeId: number | null = null;
  let snapshot: RebalanceSnapshot | null = null;
  let loading = true;
  let error = '';
  let simulationMode: SimulationMode = 'final_total';
  let simulationInput = 0;
  let includedClasses: Record<string, boolean> = {};
  let assetGroupTab: AssetGroupTab = 'stocks';
  let assetFilterText = '';

  let usdBrlRate: number | null = null;
  let usdBrlRefreshedAt: string | null = null;
  let quotesRefreshedAt: string | null = null;
  let dataLoadedAt: string | null = null;
  let refreshingQuotes = false;
  let refreshingFx = false;
  let quotesMessage = '';
  let quotesError = '';
  let fxMessage = '';
  let fxError = '';

  $: activePortfolio = portfolios.find((portfolio) => portfolio.id === activeId) ?? null;

  $: visibleClasses = snapshot ? filterConfiguredRebalanceClasses(snapshot.classes) : [];
  $: visibleAssetTabs = snapshot ? visibleAssetGroupTabs(snapshot.classes) : [];
  $: visibleTotalGapBrl = sumClassRebalanceGapBrl(snapshot?.classes ?? []);

  $: activeAssetRows =
    assetGroupTab === 'stocks'
      ? (snapshot?.stock_assets ?? [])
      : assetGroupTab === 'international'
        ? (snapshot?.international_assets ?? [])
        : assetGroupTab === 'crypto'
          ? (snapshot?.crypto_assets ?? [])
          : (snapshot?.fund_assets ?? []);
  $: activeAssetEmptyMessage =
    assetGroupTab === 'stocks'
      ? 'Nenhuma posição em Ações/ETF BR nesta carteira.'
      : assetGroupTab === 'international'
        ? 'Nenhuma posição em ETF internacional nesta carteira.'
        : assetGroupTab === 'crypto'
          ? 'Nenhuma posição na estratégia Criptomoeda nesta carteira.'
          : 'Nenhuma posição em FII nesta carteira.';

  $: resolvedInvestmentAmount =
    snapshot != null
      ? resolveInvestmentAmount(simulationMode, simulationInput, snapshot.patrimony_brl)
      : 0;

  $: investmentPlan =
    snapshot != null && resolvedInvestmentAmount > 0
      ? computeClassInvestmentAllocation(
          visibleClasses,
          snapshot.patrimony_brl,
          resolvedInvestmentAmount,
          includedClasses
        )
      : null;

  $: includedClassCount = Object.values(includedClasses).filter(Boolean).length;

  $: allocationByClass = new Map(
    (investmentPlan?.rows ?? []).map((row) => [row.display_class, row])
  );

  $: activeClassContribution = getClassContributionFromPlan(
    investmentPlan,
    assetGroupTab === 'stocks'
      ? 'stocks'
      : assetGroupTab === 'international'
        ? 'international'
        : assetGroupTab === 'crypto'
          ? 'crypto'
          : 'funds'
  );

  function handleAssetGroupSelect(tab: AssetGroupTab) {
    assetGroupTab = tab;
    assetFilterText = '';
  }

  function initializeIncludedClasses() {
    if (snapshot == null) {
      includedClasses = {};
      return;
    }
    includedClasses = defaultIncludedClasses(filterConfiguredRebalanceClasses(snapshot.classes));
  }

  function resolveActiveAssetTab(preferred: AssetGroupTab = 'stocks'): AssetGroupTab {
    if (snapshot == null) {
      return preferred;
    }
    return resolveAssetGroupTab(snapshot.classes, preferred);
  }

  function toggleClassInclusion(displayClass: string, checked: boolean) {
    if (!checked && includedClassCount <= 1) {
      return;
    }
    includedClasses = { ...includedClasses, [displayClass]: checked };
  }

  function handleClassInclusionChange(displayClass: string, event: Event) {
    const target = event.currentTarget;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }
    toggleClassInclusion(displayClass, target.checked);
  }

  async function loadFx() {
    try {
      const fx = await getUsdBrl();
      usdBrlRate = fx.rate;
      usdBrlRefreshedAt = fx.refreshed_at;
      if (usdBrlRate == null) {
        try {
          const refreshed = await refreshUsdBrl();
          usdBrlRate = refreshed.rate;
          usdBrlRefreshedAt = refreshed.refreshed_at;
        } catch {
          /* usuário pode usar Atualizar câmbio */
        }
      }
    } catch {
      usdBrlRate = null;
      usdBrlRefreshedAt = null;
    }
  }

  async function loadSnapshot(portfolioId: number) {
    loading = true;
    error = '';
    try {
      snapshot = await getPortfolioRebalance(portfolioId);
      simulationInput = 0;
      initializeIncludedClasses();
      assetGroupTab = resolveActiveAssetTab('stocks');
      dataLoadedAt = new Date().toISOString();
    } catch (err) {
      snapshot = null;
      error = parseApiError(err, 'Não foi possível carregar o rebalanceamento.');
    } finally {
      loading = false;
    }
  }

  async function loadPage() {
    loading = true;
    error = '';
    try {
      portfolios = await listPortfolios();
      activeId = await getActivePortfolioId();
      const id = activeId ?? portfolios[0]?.id ?? null;
      await loadFx();
      if (id != null) {
        activeId = id;
        await loadSnapshot(id);
      } else {
        snapshot = null;
        loading = false;
      }
    } catch (err) {
      error = parseApiError(err, 'Não foi possível carregar carteiras.');
      loading = false;
    }
  }

  onMount(() => {
    void loadPage();
  });

  async function handlePortfolioSelect(id: number) {
    if (id === activeId) return;
    activeId = id;
    try {
      await setActivePortfolioId(id);
      await loadSnapshot(id);
    } catch (err) {
      error = parseApiError(err, 'Não foi possível trocar a carteira.');
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
      await loadSnapshot(activeId);
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
      fxMessage = 'Câmbio USD/BRL atualizado.';
      if (activeId != null) {
        await loadSnapshot(activeId);
      }
    } catch (err) {
      fxError = parseApiError(err, 'Não foi possível atualizar o câmbio USD/BRL.');
    } finally {
      refreshingFx = false;
    }
  }
</script>

<svelte:head>
  <title>Rebalanceamento</title>
</svelte:head>

<main class="min-h-screen w-full bg-base-200">
  <AppPageShell paddingY="py-4" class="flex w-full min-w-0 flex-col gap-3">
    <PageHero
      title="Rebalanceamento"
      subtitle="Compare alocação atual com metas e simule aportes"
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

    <DismissibleAlert text={error} variant="error" on:dismiss={() => (error = '')} />
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
        portfolioSelectTestId="rebalance-portfolio-select"
        on:select={(event) => void handlePortfolioSelect(event.detail)}
      />
    </PageSection>

    {#if loading}
      <p class="text-sm opacity-70">Carregando…</p>
    {:else if !snapshot}
      <p class="text-sm opacity-70">Nenhuma carteira selecionada.</p>
    {:else}
      <PageSection testId="rebalance-simulation-section">
        <RebalanceSimulationPanel
          bind:mode={simulationMode}
          bind:amountInput={simulationInput}
          patrimonyBrl={snapshot.patrimony_brl}
          resolvedInvestmentBrl={resolvedInvestmentAmount}
          finalPatrimonyBrl={investmentPlan?.finalPatrimonyBrl ?? null}
          totalSuggestedContributionBrl={investmentPlan?.totalSuggestedContributionBrl ?? null}
        />
      </PageSection>

      <PageSection testId="rebalance-kpi-section">
        <RebalanceKpiCards
          classes={visibleClasses}
          patrimonyBrl={snapshot.patrimony_brl}
          totalGapBrl={visibleTotalGapBrl}
          finalPatrimonyBrl={investmentPlan?.finalPatrimonyBrl ?? null}
        />
      </PageSection>

      <PageSection title="Balanceamento por classe" testId="rebalance-class-section">
        <RebalanceClassTable
          classes={visibleClasses}
          patrimonyBrl={snapshot.patrimony_brl}
          totalGapBrl={visibleTotalGapBrl}
          {includedClasses}
          {includedClassCount}
          {allocationByClass}
          finalPatrimonyBrl={investmentPlan?.finalPatrimonyBrl ?? null}
          hasActiveSimulation={resolvedInvestmentAmount > 0}
          onClassInclusionChange={handleClassInclusionChange}
        />
      </PageSection>

      <PageSection title="Por ativo" testId="rebalance-asset-section">
        <div class="flex flex-col gap-4">
          {#if visibleAssetTabs.length === 0}
            <p class="text-sm text-base-content/70">
              Nenhuma classe com meta de pelo menos 1% possui detalhamento por ativo.
            </p>
          {:else}
          <div class="flex flex-wrap items-end justify-between gap-3">
            <RebalanceAssetGroupTabs
              activeTab={assetGroupTab}
              tabs={visibleAssetTabs}
              onSelect={handleAssetGroupSelect}
            />
            <RebalanceTableFilter
              bind:value={assetFilterText}
              testId="rebalance-asset-filter"
            />
          </div>
        {#if assetGroupTab === 'stocks' && snapshot.assets_without_score_count > 0}
          <DismissibleAlert
            variant="warning"
            text="Há {snapshot.assets_without_score_count} ativo(s) sem pontuação (Soma). Classifique em Análise de ativos (aba Ações/ETF BR) para calcular % desejada."
          />
        {/if}
        {#if assetGroupTab === 'funds' && snapshot.fund_assets_without_score_count > 0}
          <DismissibleAlert
            variant="warning"
            text="Há {snapshot.fund_assets_without_score_count} FII(s) sem pontuação (Soma). Classifique em Análise de ativos (aba FIIs) para calcular % desejada."
          />
        {/if}
        {#if assetGroupTab === 'crypto' && snapshot.crypto_assets_without_allocation_count > 0}
          <DismissibleAlert
            variant="warning"
            text="Há {snapshot.crypto_assets_without_allocation_count} ativo(s) sem alocação definida. Configure em Análise → Criptomoedas."
          />
        {/if}
        {#if assetGroupTab === 'international' && snapshot.usd_brl_rate == null}
          <DismissibleAlert
            variant="warning"
            text="Câmbio USD/BRL indisponível — valores monetários exibem «—» até atualizar a cotação."
          />
        {/if}
        <AssetRebalanceTable
          rows={activeAssetRows}
          emptyMessage={activeAssetEmptyMessage}
          showSumColumn={assetGroupTab === 'stocks' || assetGroupTab === 'funds'}
          showUsdPrimary={assetGroupTab === 'international'}
          usdBrlRate={snapshot.usd_brl_rate}
          currentPatrimonyBrl={snapshot.patrimony_brl}
          finalPatrimonyBrl={investmentPlan?.finalPatrimonyBrl ?? null}
          classContributionBrl={activeClassContribution}
          bind:filterText={assetFilterText}
        />
          {/if}
        </div>
      </PageSection>
    {/if}
  </AppPageShell>
</main>

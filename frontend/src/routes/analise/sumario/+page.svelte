<script lang="ts">
  import { onMount } from 'svelte';

  import { getAnalysisPortfolioSummary, type AnalysisPortfolioSummary } from '$lib/api/analysis';
  import { parseApiError } from '$lib/api/parseApiError';
  import {
    getActivePortfolioId,
    listPortfolios,
    setActivePortfolioId,
    type Portfolio
  } from '$lib/api/portfolios';
  import DismissibleAlert from '$lib/components/DismissibleAlert.svelte';
  import PageSection from '$lib/components/PageSection.svelte';
  import AnalysisHubNavCards from '$lib/features/analise/AnalysisHubNavCards.svelte';
  import AnalysisOverviewSection from '$lib/features/analise/AnalysisOverviewSection.svelte';
  import AnalysisSummaryKpiCards from '$lib/features/analise/AnalysisSummaryKpiCards.svelte';
  import AnalysisPendingAssetsModal from '$lib/features/analise/AnalysisPendingAssetsModal.svelte';
  import PortfolioWorkspaceBarPanel from '$lib/features/portfolios/PortfolioWorkspaceBarPanel.svelte';

  let portfolios: Portfolio[] = [];
  let activeId: number | null = null;
  let summary: AnalysisPortfolioSummary | null = null;
  let loading = true;
  let error = '';
  let pendingModalOpen = false;

  $: activePortfolioName = portfolios.find((portfolio) => portfolio.id === activeId)?.name ?? '';
  $: classifiedCount = summary?.classified_count ?? 0;
  $: pendingCount = summary?.pending_count ?? 0;

  async function loadSummary() {
    if (activeId == null) {
      summary = null;
      return;
    }
    summary = await getAnalysisPortfolioSummary(activeId);
  }

  async function loadData() {
    loading = true;
    error = '';
    try {
      const [portfolioList, active] = await Promise.all([listPortfolios(), getActivePortfolioId()]);
      portfolios = portfolioList;
      activeId = active ?? (portfolioList[0]?.id ?? null);
      await loadSummary();
    } catch (err) {
      portfolios = [];
      activeId = null;
      summary = null;
      error = parseApiError(
        err,
        'Não foi possível carregar o sumário. Verifique se o backend está em execução.'
      );
    } finally {
      loading = false;
    }
  }

  async function handlePortfolioSelect(id: number) {
    if (id === activeId) {
      return;
    }
    activeId = id;
    error = '';
    try {
      await setActivePortfolioId(id);
      await loadSummary();
    } catch (err) {
      error = parseApiError(err, 'Não foi possível trocar a carteira.');
    }
  }

  onMount(() => {
    void loadData();
  });
</script>

<svelte:head>
  <title>Análise — Sumário</title>
</svelte:head>

<div class="flex flex-col gap-3">
  {#if error}
    <DismissibleAlert variant="error" message={error} on:dismiss={() => (error = '')} />
  {/if}

  <PortfolioWorkspaceBarPanel
    {portfolios}
    {activeId}
    {activePortfolioName}
    showQuoteStatus={false}
    portfolioSelectTestId="analysis-portfolio-select"
    testId="analysis-portfolio-bar"
    on:select={(event) => void handlePortfolioSelect(event.detail)}
  />

  <PageSection title="Visão geral" testId="analysis-summary-section">
    {#if loading}
      <p class="text-sm text-base-content/70">Carregando sumário…</p>
    {:else}
      <AnalysisSummaryKpiCards
        {classifiedCount}
        {pendingCount}
        onReviewPending={() => (pendingModalOpen = true)}
      />
    {/if}
  </PageSection>

  <AnalysisPendingAssetsModal
    open={pendingModalOpen}
    portfolioId={activeId}
    onClose={() => (pendingModalOpen = false)}
  />

  <PageSection testId="analysis-hub-section">
    <AnalysisOverviewSection />
  </PageSection>

  <PageSection title="Atalhos" testId="analysis-hub-shortcuts-section">
    <p class="mb-4 text-sm text-base-content/70">
      Acesse rapidamente cada área de análise da carteira ativa.
    </p>
    <AnalysisHubNavCards />
  </PageSection>
</div>

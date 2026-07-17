<script lang="ts">
  import { onMount } from 'svelte';

  import {
    getAnalysisMethodology,
    listCryptoAnalysis,
    saveAnalysisMethodology,
    saveCryptoAllocations,
    PROFILE_CRYPTO,
    type AnalysisMethodology
  } from '$lib/api/analysis';
  import { parseApiError } from '$lib/api/parseApiError';
  import {
    getActivePortfolioId,
    listPortfolios,
    listPositions,
    setActivePortfolioId,
    type Portfolio,
    type Position
  } from '$lib/api/portfolios';
  import DismissibleAlert from '$lib/components/DismissibleAlert.svelte';
  import AnalysisMethodologySelector from '$lib/features/analise/AnalysisMethodologySelector.svelte';
  import AnalysisSimpleAllocationPanel from '$lib/features/analise/AnalysisSimpleAllocationPanel.svelte';
  import PortfolioWorkspaceBarPanel from '$lib/features/portfolios/PortfolioWorkspaceBarPanel.svelte';

  let portfolios: Portfolio[] = [];
  let positions: Position[] = [];
  let activeId: number | null = null;
  let methodology: AnalysisMethodology = 'simples';
  let loading = true;
  let error = '';
  let simpleAllocationPanel: AnalysisSimpleAllocationPanel;

  $: activePortfolioName = portfolios.find((portfolio) => portfolio.id === activeId)?.name ?? '';

  async function loadMethodology() {
    if (activeId == null) {
      methodology = 'simples';
      return;
    }
    const result = await getAnalysisMethodology('crypto', activeId);
    methodology = result.methodology;
  }

  async function reloadAllocation() {
    if (simpleAllocationPanel && activeId != null) {
      await simpleAllocationPanel.reload(activeId);
    }
  }

  async function loadPositionsForActive() {
    if (activeId == null) {
      positions = [];
      return;
    }
    positions = await listPositions(activeId);
  }

  async function loadData() {
    loading = true;
    error = '';
    try {
      const [portfolioList, active] = await Promise.all([listPortfolios(), getActivePortfolioId()]);
      portfolios = portfolioList;
      activeId = active ?? (portfolioList[0]?.id ?? null);
      await loadPositionsForActive();
      await loadMethodology();
      await reloadAllocation();
    } catch (err) {
      portfolios = [];
      positions = [];
      activeId = null;
      error = parseApiError(
        err,
        'Não foi possível carregar a análise. Verifique se o backend está em execução.'
      );
    } finally {
      loading = false;
    }
  }

  async function handlePortfolioSelect(id: number) {
    if (id === activeId) return;
    activeId = id;
    error = '';
    try {
      await setActivePortfolioId(id);
      await loadPositionsForActive();
      await loadMethodology();
      await reloadAllocation();
    } catch (err) {
      error = parseApiError(err, 'Não foi possível trocar a carteira.');
    }
  }

  async function handleMethodologyChange(next: AnalysisMethodology) {
    if (activeId == null || next === methodology) return;
    error = '';
    try {
      const result = await saveAnalysisMethodology('crypto', activeId, next);
      methodology = result.methodology;
      await reloadAllocation();
    } catch (err) {
      error = parseApiError(err, 'Não foi possível alterar a metodologia.');
    }
  }

  onMount(() => {
    void loadData();
  });
</script>

<svelte:head>
  <title>Análise — Criptomoedas</title>
</svelte:head>

<div class="flex flex-col gap-3">
  <PortfolioWorkspaceBarPanel
    {portfolios}
    {activeId}
    {activePortfolioName}
    disabled={loading || portfolios.length === 0}
    portfolioSelectTestId="analysis-portfolio-select"
    testId="analysis-portfolio-bar"
    showQuoteStatus={false}
    on:select={(event) => void handlePortfolioSelect(event.detail)}
  />

  {#if error}
    <DismissibleAlert text={error} variant="error" on:dismiss={() => (error = '')} />
  {/if}

  <AnalysisMethodologySelector
    profileSlug="crypto"
    value={methodology}
    disabled={loading || activeId == null}
    onChange={(next) => void handleMethodologyChange(next)}
  />

  <AnalysisSimpleAllocationPanel
    bind:this={simpleAllocationPanel}
    profile={PROFILE_CRYPTO}
    sectionTitle="Criptomoedas"
    sectionTestId="analysis-cripto-section"
    filterTestId="analysis-cripto-table-filter"
    description="Defina o percentual desejado de cada cripto (soma 100%) e opcionalmente um link externo de análise."
    emptyMessage="Nenhuma criptomoeda na carteira ativa. Adicione posições em Carteiras."
    classDisplayClass="crypto"
    rebalanceAssetsKey="crypto_assets"
    {activeId}
    {positions}
    {loading}
    listAnalysis={listCryptoAnalysis}
    saveAllocations={saveCryptoAllocations}
  />
</div>

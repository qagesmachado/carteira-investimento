<script lang="ts">
  import { onMount } from 'svelte';

  import { listAssets, type Asset } from '$lib/api/assets';
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
  import PageHeader from '$lib/components/PageHeader.svelte';
  import PageSection from '$lib/components/PageSection.svelte';
  import PortfolioSelect from '$lib/features/portfolios/PortfolioSelect.svelte';
  import { PORTFOLIO_SELECT_HEADER_TEST_ID } from '$lib/features/ferramentas/headerPortfolioSelect';
  import { resolveActivePortfolioId } from '$lib/features/portfolios/resolveActivePortfolioId';
  import AveragePriceCalculator from '$lib/features/ferramentas/calculo-preco-medio/AveragePriceCalculator.svelte';

  let assets: Asset[] = [];
  let portfolios: Portfolio[] = [];
  let positions: Position[] = [];
  let activeId: number | null = null;
  let loading = true;
  let error = '';

  async function loadPositions(portfolioId: number) {
    positions = await listPositions(portfolioId);
  }

  async function refreshData() {
    loading = true;
    error = '';
    try {
      const [assetList, portfolioList, storedActiveId] = await Promise.all([
        listAssets(),
        listPortfolios(),
        getActivePortfolioId()
      ]);
      assets = assetList;
      portfolios = portfolioList;
      activeId = resolveActivePortfolioId(storedActiveId, portfolioList);
      if (activeId != null) {
        await loadPositions(activeId);
      } else {
        positions = [];
      }
    } catch (err) {
      error = parseApiError(err);
      positions = [];
    } finally {
      loading = false;
    }
  }

  async function handlePortfolioChange(portfolioId: number) {
    if (portfolioId === activeId) {
      return;
    }
    error = '';
    try {
      await setActivePortfolioId(portfolioId);
      activeId = portfolioId;
      await loadPositions(portfolioId);
    } catch (err) {
      error = parseApiError(err);
    }
  }

  onMount(() => {
    void refreshData();
  });
</script>

<svelte:head>
  <title>Cálculo de preço médio · Ferramentas</title>
</svelte:head>

<div class="flex flex-col gap-3">
  <PageHeader
    title="Cálculo de preço médio"
    subtitle="Combine dois lotes do mesmo ativo e obtenha quantidade total, preço médio ponderado e valor investido."
  >
    <div slot="actions">
      <PortfolioSelect
        testId={PORTFOLIO_SELECT_HEADER_TEST_ID}
        {portfolios}
        activeId={activeId}
        disabled={loading}
        on:select={(e) => void handlePortfolioChange(e.detail)}
      />
    </div>
  </PageHeader>

  {#if error}
    <DismissibleAlert variant="error" text={error} on:dismiss={() => (error = '')} />
  {/if}

  {#if loading}
    <p class="text-sm opacity-70">Carregando…</p>
  {:else}
    <PageSection>
      <AveragePriceCalculator
        {assets}
        {portfolios}
        activePortfolioId={activeId}
        {positions}
        onPortfolioChange={handlePortfolioChange}
      />
    </PageSection>
  {/if}
</div>

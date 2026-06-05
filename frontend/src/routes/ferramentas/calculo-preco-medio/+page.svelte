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
      const [assetList, portfolioList, activeResponse] = await Promise.all([
        listAssets(),
        listPortfolios(),
        getActivePortfolioId()
      ]);
      assets = assetList;
      portfolios = portfolioList;
      activeId = activeResponse.portfolio_id ?? portfolioList[0]?.id ?? null;
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

<div>
  <div class="mb-6">
    <h2 class="text-xl font-semibold">Cálculo de preço médio</h2>
    <p class="text-sm text-base-content/70">
      Combine dois lotes do mesmo ativo e obtenha quantidade total, preço médio ponderado e valor
      investido.
    </p>
  </div>

  {#if error}
    <DismissibleAlert variant="error" text={error} on:dismiss={() => (error = '')} />
  {/if}

  {#if loading}
    <p class="text-sm opacity-70">Carregando…</p>
  {:else}
    <AveragePriceCalculator
      {assets}
      {portfolios}
      activePortfolioId={activeId}
      {positions}
      onPortfolioChange={handlePortfolioChange}
    />
  {/if}
</div>

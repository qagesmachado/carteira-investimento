<script lang="ts">
  import type { Asset } from '$lib/api/assets';
  import type { Portfolio, Position } from '$lib/api/portfolios';

  import AveragePriceResult from './AveragePriceResult.svelte';
  import {
    computeWeightedAveragePrice,
    type WeightedAverageOutcome
  } from './computeWeightedAveragePrice';
  import { buildMarketPositionOptions } from './filterMarketPositions';
  import ManualLotsForm from './ManualLotsForm.svelte';
  import PortfolioLotForm from './PortfolioLotForm.svelte';

  export let assets: Asset[] = [];
  export let portfolios: Portfolio[] = [];
  export let activePortfolioId: number | null = null;
  export let positions: Position[] = [];
  export let onPortfolioChange: (portfolioId: number) => void = () => undefined;

  type TabId = 'manual' | 'portfolio';

  let activeTab: TabId = 'manual';

  let manualAssetId: number | '' = '';
  let manualLot1Quantity = 0;
  let manualLot1Price = 0;
  let manualLot2Quantity = 0;
  let manualLot2Price = 0;

  let selectedPositionId: number | '' = '';
  let portfolioLot2Quantity = 0;
  let portfolioLot2Price = 0;

  $: manualAsset = assets.find((asset) => asset.id === manualAssetId);
  $: manualCurrency = manualAsset?.currency ?? 'BRL';

  $: portfolioOptionList = buildMarketPositionOptions(positions, assets);
  $: selectedPortfolioOption =
    selectedPositionId === ''
      ? null
      : (portfolioOptionList.find((option) => option.positionId === selectedPositionId) ?? null);
  $: portfolioCurrency = selectedPortfolioOption?.currency ?? 'BRL';

  $: manualOutcome = computeManualOutcome(
    manualLot1Quantity,
    manualLot1Price,
    manualLot2Quantity,
    manualLot2Price
  );

  $: portfolioOutcome = computePortfolioOutcome(
    selectedPortfolioOption,
    portfolioLot2Quantity,
    portfolioLot2Price
  );

  $: displayOutcome = activeTab === 'manual' ? manualOutcome : portfolioOutcome;
  $: displayCurrency = activeTab === 'manual' ? manualCurrency : portfolioCurrency;

  function computeManualOutcome(
    q1: number,
    p1: number,
    q2: number,
    p2: number
  ): WeightedAverageOutcome | null {
    if (q1 <= 0 && q2 <= 0 && p1 <= 0 && p2 <= 0) {
      return null;
    }
    return computeWeightedAveragePrice(
      { quantity: q1, averagePrice: p1 },
      { quantity: q2, averagePrice: p2 }
    );
  }

  function computePortfolioOutcome(
    option: (typeof portfolioOptionList)[number] | null,
    q2: number,
    p2: number
  ): WeightedAverageOutcome | null {
    if (!option) {
      return null;
    }
    if (q2 <= 0 && p2 <= 0) {
      return null;
    }
    return computeWeightedAveragePrice(
      { quantity: option.quantity, averagePrice: option.averagePrice },
      { quantity: q2, averagePrice: p2 }
    );
  }

  function resetManual() {
    manualAssetId = '';
    manualLot1Quantity = 0;
    manualLot1Price = 0;
    manualLot2Quantity = 0;
    manualLot2Price = 0;
  }

  function resetPortfolio() {
    selectedPositionId = '';
    portfolioLot2Quantity = 0;
    portfolioLot2Price = 0;
  }

  function handleClear() {
    if (activeTab === 'manual') {
      resetManual();
    } else {
      resetPortfolio();
    }
  }
</script>

<div class="flex flex-col gap-4" data-testid="average-price-calculator">
  <div role="tablist" class="tabs tabs-boxed w-fit" aria-label="Modo de cálculo">
    <button
      type="button"
      role="tab"
      class="tab"
      class:tab-active={activeTab === 'manual'}
      aria-selected={activeTab === 'manual'}
      data-testid="tab-manual"
      on:click={() => (activeTab = 'manual')}
    >
      Manual
    </button>
    <button
      type="button"
      role="tab"
      class="tab"
      class:tab-active={activeTab === 'portfolio'}
      aria-selected={activeTab === 'portfolio'}
      data-testid="tab-portfolio"
      on:click={() => (activeTab = 'portfolio')}
    >
      Com posição da carteira
    </button>
  </div>

  {#if activeTab === 'manual'}
    <ManualLotsForm
      {assets}
      bind:assetId={manualAssetId}
      bind:lot1Quantity={manualLot1Quantity}
      bind:lot1Price={manualLot1Price}
      bind:lot2Quantity={manualLot2Quantity}
      bind:lot2Price={manualLot2Price}
    />
  {:else}
    <PortfolioLotForm
      {portfolios}
      {activePortfolioId}
      {positions}
      {assets}
      bind:selectedPositionId
      bind:lot2Quantity={portfolioLot2Quantity}
      bind:lot2Price={portfolioLot2Price}
      {onPortfolioChange}
    />
  {/if}

  <div class="flex justify-end">
    <button class="btn btn-ghost btn-sm" type="button" data-testid="clear-calculator" on:click={handleClear}>
      Limpar
    </button>
  </div>

  <AveragePriceResult outcome={displayOutcome} currency={displayCurrency} />
</div>

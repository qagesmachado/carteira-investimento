<script lang="ts">
  import type { Asset } from '$lib/api/assets';
  import type { Portfolio, Position } from '$lib/api/portfolios';
  import { formatCurrencyCodeForDisplay, formatMoneyAmount } from '$lib/assetLabels';
  import BrDecimalInput from '$lib/components/BrDecimalInput.svelte';
  import PortfolioSelect from '$lib/features/portfolios/PortfolioSelect.svelte';
  import { formatQuantityForDisplay } from '$lib/features/portfolios/positionMetrics';

  import { buildMarketPositionOptions } from './filterMarketPositions';
  import MarketPositionPicker from './MarketPositionPicker.svelte';

  export let portfolios: Portfolio[] = [];
  export let activePortfolioId: number | null = null;
  export let positions: Position[] = [];
  export let assets: Asset[] = [];
  export let selectedPositionId: number | '' = '';
  export let lot2Quantity = 0;
  export let lot2Price = 0;
  export let onPortfolioChange: (portfolioId: number) => void = () => undefined;

  $: options = buildMarketPositionOptions(positions, assets);
  $: selectedOption =
    selectedPositionId === ''
      ? null
      : (options.find((option) => option.positionId === selectedPositionId) ?? null);
  $: currencyLabel = selectedOption
    ? formatCurrencyCodeForDisplay(selectedOption.currency)
    : 'R$';

  function handlePortfolioSelect(event: CustomEvent<number>) {
    selectedPositionId = '';
    lot2Quantity = 0;
    lot2Price = 0;
    onPortfolioChange(event.detail);
  }

  function handlePositionSelect(event: CustomEvent<number>) {
    selectedPositionId = event.detail;
    lot2Quantity = 0;
    lot2Price = 0;
  }
</script>

<section class="rounded-box bg-base-100 p-4 shadow-sm" data-testid="portfolio-lot-form">
  <h3 class="mb-1 font-medium">Com posição da carteira</h3>
  <p class="mb-4 text-sm opacity-70">
    Selecione uma posição existente como Lote 1 e informe a nova compra como Lote 2.
  </p>

  <div class="mb-4 grid gap-3 sm:max-w-md">
    <PortfolioSelect
      {portfolios}
      activeId={activePortfolioId}
      on:select={handlePortfolioSelect}
    />
  </div>

  {#if options.length === 0}
    <p class="text-sm opacity-70">
      Nenhuma posição de mercado com quantidade e preço médio nesta carteira.
    </p>
  {:else}
    <label class="form-control mb-4 sm:max-w-xl">
      <span class="label-text">Posição (Lote 1)</span>
      <MarketPositionPicker
        {options}
        bind:value={selectedPositionId}
        on:select={handlePositionSelect}
      />
    </label>

    {#if selectedOption}
      <div class="mb-4 grid gap-3 sm:grid-cols-2 md:max-w-2xl">
        <div class="rounded-lg border border-base-300 bg-base-200/30 p-3">
          <p class="text-xs uppercase opacity-60">Lote 1 — quantidade</p>
          <p class="font-medium" data-testid="portfolio-lot1-quantity">
            {formatQuantityForDisplay(selectedOption.quantity)}
          </p>
        </div>
        <div class="rounded-lg border border-base-300 bg-base-200/30 p-3">
          <p class="text-xs uppercase opacity-60">Lote 1 — preço médio</p>
          <p class="font-medium" data-testid="portfolio-lot1-price">
            {formatMoneyAmount(selectedOption.averagePrice, selectedOption.currency)}
          </p>
        </div>
      </div>
    {/if}

    <fieldset class="rounded-lg border border-base-300 p-3 md:max-w-md">
      <legend class="px-1 text-sm font-medium">Lote 2 — nova compra</legend>
      <div class="mt-2 grid gap-3">
        <BrDecimalInput
          bind:value={lot2Quantity}
          label="Quantidade"
          inputClass="input input-bordered w-full"
          testId="portfolio-lot2-quantity"
          disabled={selectedOption == null}
        />
        <BrDecimalInput
          bind:value={lot2Price}
          label="Preço médio ({currencyLabel})"
          inputClass="input input-bordered w-full"
          testId="portfolio-lot2-price"
          disabled={selectedOption == null}
        />
      </div>
    </fieldset>
  {/if}
</section>

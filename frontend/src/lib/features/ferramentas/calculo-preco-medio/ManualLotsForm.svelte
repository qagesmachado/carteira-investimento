<script lang="ts">
  import type { Asset } from '$lib/api/assets';
  import { formatCurrencyCodeForDisplay } from '$lib/assetLabels';
  import BrDecimalInput from '$lib/components/BrDecimalInput.svelte';
  import AssetPicker from '$lib/features/portfolios/AssetPicker.svelte';
  import { usesManualPositionValues } from '$lib/features/portfolios/positionMetrics';

  export let assets: Asset[] = [];
  export let assetId: number | '' = '';
  export let lot1Quantity = 0;
  export let lot1Price = 0;
  export let lot2Quantity = 0;
  export let lot2Price = 0;

  $: marketAssets = assets.filter((asset) => !usesManualPositionValues(asset));
  $: selectedAsset = marketAssets.find((asset) => asset.id === assetId);
  $: currencyLabel = selectedAsset
    ? formatCurrencyCodeForDisplay(selectedAsset.currency)
    : 'R$';
</script>

<div data-testid="manual-lots-form">
  <h3 class="mb-1 font-medium">Modo manual</h3>
  <p class="mb-4 text-sm opacity-70">
    Informe quantidade e preço médio de compra de cada lote do mesmo ativo.
  </p>

  <div class="mb-4">
    <span class="label-text mb-1 block text-sm">Ativo (referência)</span>
    <AssetPicker assets={marketAssets} bind:value={assetId} />
  </div>

  <div class="grid gap-4 md:grid-cols-2">
    <fieldset class="rounded-lg border border-base-300 p-3">
      <legend class="px-1 text-sm font-medium">Lote 1</legend>
      <div class="mt-2 grid gap-3">
        <BrDecimalInput
          bind:value={lot1Quantity}
          label="Quantidade"
          inputClass="input input-bordered w-full"
          testId="manual-lot1-quantity"
        />
        <BrDecimalInput
          bind:value={lot1Price}
          label="Preço médio ({currencyLabel})"
          inputClass="input input-bordered w-full"
          testId="manual-lot1-price"
        />
      </div>
    </fieldset>

    <fieldset class="rounded-lg border border-base-300 p-3">
      <legend class="px-1 text-sm font-medium">Lote 2</legend>
      <div class="mt-2 grid gap-3">
        <BrDecimalInput
          bind:value={lot2Quantity}
          label="Quantidade"
          inputClass="input input-bordered w-full"
          testId="manual-lot2-quantity"
        />
        <BrDecimalInput
          bind:value={lot2Price}
          label="Preço médio ({currencyLabel})"
          inputClass="input input-bordered w-full"
          testId="manual-lot2-price"
        />
      </div>
    </fieldset>
  </div>
</div>

<script lang="ts">
  import type { Asset } from '$lib/api/assets';
  import type { CryptoFee, CryptoFeeCreate, CryptoFeeType } from '$lib/api/cryptoFees';
  import type { Portfolio } from '$lib/api/portfolios';
  import {
    formatIsoDateToBr,
    parseBrDateToIso,
    sanitizeBrDateTyping
  } from '$lib/brDate';
  import BrDecimalInput from '$lib/components/BrDecimalInput.svelte';

  import { cryptoFeeTypeOptions } from './cryptoFeeLabels';

  export let assets: Asset[] = [];
  export let portfolios: Portfolio[] = [];
  export let activePortfolioId: number | null = null;
  export let editing: CryptoFee | null = null;
  export let loading = false;
  export let onSubmit: (payload: CryptoFeeCreate) => void = () => undefined;
  export let onCancel: () => void = () => undefined;

  let portfolioId: number | '' = '';
  let assetId: number | '' = '';
  let feeType: CryptoFeeType = 'purchase';
  let feeDateBr = '';
  let quantityMovedValue = 0;
  let feeQuantityValue = 0;
  let quoteBrlValue = 0;
  let fxRateValue = 5.5;
  let notes = '';
  let formError = '';

  let loadedEditingId: number | null = null;
  let portfolioDefaultApplied = false;
  let quantityMovedInput: BrDecimalInput;
  let feeQuantityInput: BrDecimalInput;
  let quoteBrlInput: BrDecimalInput;
  let fxRateInput: BrDecimalInput;

  $: cryptoAssets = assets.filter((asset) => asset.asset_type === 'crypto');

  $: if (editing && editing.id !== loadedEditingId) {
    loadedEditingId = editing.id;
    portfolioId = editing.portfolio_id;
    assetId = editing.asset_id;
    feeType = editing.fee_type;
    feeDateBr = formatIsoDateToBr(editing.fee_date);
    quantityMovedValue = editing.quantity_moved;
    feeQuantityValue = editing.fee_quantity_btc;
    quoteBrlValue = editing.quote_brl;
    fxRateValue = editing.fx_rate;
    notes = editing.notes ?? '';
    formError = '';
    portfolioDefaultApplied = true;
  }

  $: if (!editing) {
    loadedEditingId = null;
  }

  $: if (
    !editing &&
    !portfolioDefaultApplied &&
    portfolioId === '' &&
    activePortfolioId != null &&
    portfolios.some((p) => p.id === activePortfolioId)
  ) {
    portfolioId = activePortfolioId;
    portfolioDefaultApplied = true;
  }

  $: if (
    !editing &&
    assetId === '' &&
    cryptoAssets.length === 1 &&
    cryptoAssets[0].id != null
  ) {
    assetId = cryptoAssets[0].id;
  }

  function handleDateInput(event: Event) {
    const target = event.currentTarget as HTMLInputElement;
    feeDateBr = sanitizeBrDateTyping(target.value);
    target.value = feeDateBr;
  }

  function handleSubmit() {
    formError = '';
    if (portfolioId === '') {
      formError = 'Selecione uma carteira.';
      return;
    }
    if (assetId === '') {
      formError = 'Selecione um ativo cripto.';
      return;
    }
    const feeDateIso = parseBrDateToIso(feeDateBr);
    if (!feeDateIso) {
      formError = 'Informe uma data válida.';
      return;
    }
    if (!quantityMovedInput?.flush()) {
      formError = 'Quantidade movimentada inválida.';
      return;
    }
    if (!feeQuantityInput?.flush()) {
      formError = 'Quantidade de taxa inválida.';
      return;
    }
    const quantityMoved = quantityMovedValue;
    const feeQuantity = feeQuantityValue;
    if (quantityMoved <= 0) {
      formError = 'Quantidade movimentada inválida.';
      return;
    }
    if (feeQuantity < 0) {
      formError = 'Quantidade de taxa inválida.';
      return;
    }
    if (feeQuantity > quantityMoved) {
      formError = 'Taxa não pode exceder a quantidade movimentada.';
      return;
    }
    if (!quoteBrlInput?.flush()) {
      formError = 'Cotação em reais inválida.';
      return;
    }
    if (!fxRateInput?.flush()) {
      formError = 'Fator de conversão inválido.';
      return;
    }
    if (!Number.isFinite(quoteBrlValue) || quoteBrlValue <= 0) {
      formError = 'Cotação em reais inválida.';
      return;
    }
    if (!Number.isFinite(fxRateValue) || fxRateValue <= 0) {
      formError = 'Fator de conversão inválido.';
      return;
    }

    onSubmit({
      portfolio_id: Number(portfolioId),
      asset_id: Number(assetId),
      fee_type: feeType,
      fee_date: feeDateIso,
      quantity_moved: quantityMoved,
      fee_quantity_btc: feeQuantity,
      quote_brl: quoteBrlValue,
      fx_rate: fxRateValue,
      notes: notes.trim() || null
    });
  }

  function resetForm() {
    portfolioId = activePortfolioId ?? '';
    assetId = cryptoAssets.length === 1 && cryptoAssets[0].id != null ? cryptoAssets[0].id : '';
    feeType = 'purchase';
    feeDateBr = '';
    quantityMovedValue = 0;
    feeQuantityValue = 0;
    quoteBrlValue = 0;
    fxRateValue = 5.5;
    notes = '';
    formError = '';
    portfolioDefaultApplied = true;
    onCancel();
  }
</script>

<form
  class="rounded-box bg-base-100 p-4 shadow"
  data-testid="crypto-fee-form"
  on:submit|preventDefault={handleSubmit}
>
  <h2 class="mb-4 text-lg font-semibold">
    {editing ? 'Editar taxa' : 'Registrar taxa BTC'}
  </h2>

  {#if formError}
    <p class="mb-3 text-sm text-error">{formError}</p>
  {/if}

  <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
    <label class="form-control">
      <span class="label-text">Carteira</span>
      <select class="select select-bordered" bind:value={portfolioId} data-testid="crypto-fee-portfolio">
        <option value="">Selecione…</option>
        {#each portfolios as portfolio}
          <option value={portfolio.id}>{portfolio.name}</option>
        {/each}
      </select>
    </label>

    <label class="form-control">
      <span class="label-text">Ativo</span>
      <select class="select select-bordered" bind:value={assetId} data-testid="crypto-fee-asset">
        <option value="">Selecione…</option>
        {#each cryptoAssets as asset}
          <option value={asset.id}>{asset.symbol}</option>
        {/each}
      </select>
    </label>

    <label class="form-control">
      <span class="label-text">Tipo</span>
      <select class="select select-bordered" bind:value={feeType} data-testid="crypto-fee-type">
        {#each cryptoFeeTypeOptions as option}
          <option value={option.value}>{option.label}</option>
        {/each}
      </select>
    </label>

    <label class="form-control">
      <span class="label-text">Data</span>
      <input
        class="input input-bordered"
        type="text"
        placeholder="dd/mm/aaaa"
        data-testid="crypto-fee-date"
        bind:value={feeDateBr}
        on:input={handleDateInput}
      />
    </label>

    <BrDecimalInput
      bind:this={quantityMovedInput}
      bind:value={quantityMovedValue}
      btcQuantity
      label="Quantidade movimentada (BTC)"
      inputClass="input input-bordered w-full"
      testId="crypto-fee-quantity-moved"
    />

    <BrDecimalInput
      bind:this={feeQuantityInput}
      bind:value={feeQuantityValue}
      btcQuantity
      label="Quantidade de taxa (BTC)"
      inputClass="input input-bordered w-full"
      testId="crypto-fee-quantity-fee"
    />

    <BrDecimalInput
      bind:this={quoteBrlInput}
      bind:value={quoteBrlValue}
      label="Cotação (R$)"
      inputClass="input input-bordered w-full"
      testId="crypto-fee-quote-brl"
    />

    <BrDecimalInput
      bind:this={fxRateInput}
      bind:value={fxRateValue}
      label="Fator conversão R$/US$"
      inputClass="input input-bordered w-full"
      testId="crypto-fee-fx-rate"
    />

    <label class="form-control md:col-span-2 lg:col-span-3">
      <span class="label-text">Observações</span>
      <input class="input input-bordered" type="text" bind:value={notes} />
    </label>
  </div>

  <div class="mt-4 flex flex-wrap gap-2">
    <button class="btn btn-primary" type="submit" disabled={loading} data-testid="crypto-fee-submit">
      {loading ? 'Salvando…' : editing ? 'Atualizar' : 'Salvar'}
    </button>
    {#if editing}
      <button class="btn btn-ghost" type="button" on:click={resetForm}>Cancelar</button>
    {/if}
  </div>
</form>

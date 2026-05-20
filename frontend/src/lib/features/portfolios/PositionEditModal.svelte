<script lang="ts">
  import type { Asset } from '$lib/api/assets';
  import { updatePosition, type Position } from '$lib/api/portfolios';
  import { formatCurrencyCodeForDisplay } from '$lib/assetLabels';
  import { parseApiError } from '$lib/api/parseApiError';
  import BrDecimalInput from '$lib/components/BrDecimalInput.svelte';
  import { formatTickerForDisplay } from '$lib/formatTickerForDisplay';

  export let open = false;
  export let position: Position | null = null;
  export let asset: Asset | null = null;
  export let portfolioId: number | null = null;
  export let onClose: () => void = () => undefined;
  export let onSaved: () => void | Promise<void> = () => undefined;

  let quantity = 0;
  let averagePrice = 0;
  let investedAmount = 0;
  let currentValue = 0;
  let contractedYield = '';
  let error = '';
  let loading = false;
  let quantityInput: BrDecimalInput;
  let averagePriceInput: BrDecimalInput;
  let investedAmountInput: BrDecimalInput;
  let currentValueInput: BrDecimalInput;

  /** Só repovoa o formulário ao abrir ou quando a posição vinda do servidor muda (id/updated_at). */
  let formSyncToken = '';

  $: currencyLabel = asset ? formatCurrencyCodeForDisplay(asset.currency) : '';
  $: averagePriceLabel = asset ? `Preço médio (${asset.currency})` : 'Preço médio';
  $: investedAmountLabel = asset ? `Valor aplicado (${asset.currency})` : 'Valor aplicado';
  $: currentValueLabel = asset ? `Valor atual (${asset.currency})` : 'Valor atual';
  $: usesManualValues =
    asset?.asset_type === 'fixed_income' || asset?.asset_type === 'pension';

  $: if (!open || !position || !asset) {
    formSyncToken = '';
  }

  $: if (open && position && asset) {
    const nextToken = `${position.id}:${position.updated_at}:${usesManualValues ? 'm' : 'q'}`;
    if (nextToken !== formSyncToken) {
      formSyncToken = nextToken;
      quantity = position.quantity;
      averagePrice = position.average_price;
      investedAmount = position.invested_amount ?? 0;
      currentValue = position.current_value ?? 0;
      contractedYield = position.contracted_yield ?? '';
      error = '';
    }
  }

  function handleClose() {
    open = false;
    onClose();
  }

  async function handleSubmit() {
    if (!position || portfolioId == null) {
      return;
    }
    if (usesManualValues) {
      const validManualInputs = investedAmountInput?.flush() && currentValueInput?.flush();
      if (!validManualInputs) {
        error = 'Valores manuais inválidos. Use vírgula para centavos (ex.: 1234,56).';
        return;
      }
      if (investedAmount <= 0) {
        error = 'Informe um valor aplicado maior que zero.';
        return;
      }
      if (currentValue < 0) {
        error = 'Valor atual não pode ser negativo.';
        return;
      }
      if (!contractedYield.trim()) {
        error = 'Informe o rendimento contratado.';
        return;
      }
    } else {
      if (!quantityInput?.flush() || !averagePriceInput?.flush()) {
        error = 'Quantidade ou preço médio inválidos. Use vírgula para decimais (ex.: 1,88637).';
        return;
      }
      if (quantity <= 0) {
        error = 'Informe uma quantidade maior que zero.';
        return;
      }
      if (averagePrice < 0) {
        error = 'Preço médio não pode ser negativo.';
        return;
      }
    }

    loading = true;
    error = '';
    try {
      await updatePosition(
        portfolioId,
        position.id,
        usesManualValues
          ? {
              invested_amount: investedAmount,
              current_value: currentValue,
              contracted_yield: contractedYield.trim()
            }
          : {
              quantity,
              average_price: averagePrice
            }
      );
      handleClose();
      await onSaved();
    } catch (err) {
      error = parseApiError(err, 'Não foi possível atualizar a posição.');
    } finally {
      loading = false;
    }
  }
</script>

{#if open && position && asset}
  <div class="modal modal-open">
    <div class="modal-box">
      <h3 class="text-lg font-bold">Editar posição — {formatTickerForDisplay(asset.symbol)}</h3>
      <p class="text-sm text-base-content/70">
        Moeda do ativo: {currencyLabel} · {asset.name}
      </p>

      <div class="mt-4 grid gap-3">
        {#key formSyncToken}
          {#if usesManualValues}
            <BrDecimalInput
              bind:this={investedAmountInput}
              bind:value={investedAmount}
              label={investedAmountLabel}
              inputClass="input input-bordered"
              disabled={loading}
            />
            <BrDecimalInput
              bind:this={currentValueInput}
              bind:value={currentValue}
              label={currentValueLabel}
              inputClass="input input-bordered"
              disabled={loading}
            />
            <label class="form-control">
              <span class="label-text">Rendimento contratado</span>
              <input
                class="input input-bordered"
                placeholder="Ex.: 100% CDI"
                bind:value={contractedYield}
                disabled={loading}
              />
            </label>
          {:else}
            <BrDecimalInput
              bind:this={quantityInput}
              bind:value={quantity}
              label="Quantidade"
              inputClass="input input-bordered"
              disabled={loading}
            />
            <BrDecimalInput
              bind:this={averagePriceInput}
              bind:value={averagePrice}
              label={averagePriceLabel}
              inputClass="input input-bordered"
              disabled={loading}
            />
          {/if}
        {/key}
      </div>

      {#if error}
        <p class="mt-2 text-sm text-error">{error}</p>
      {/if}

      <div class="modal-action">
        <button class="btn btn-ghost" type="button" disabled={loading} on:click={handleClose}>
          Cancelar
        </button>
        <button class="btn btn-primary" type="button" disabled={loading} on:click={handleSubmit}>
          {loading ? 'Salvando…' : 'Salvar'}
        </button>
      </div>
    </div>
  </div>
{/if}

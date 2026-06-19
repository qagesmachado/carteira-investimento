<script lang="ts">
  import type { Asset, AssetCreate, AssetType } from '$lib/api/assets';
  import { parseApiError } from '$lib/api/parseApiError';
  import {
    createFixedIncomePosition,
    createPosition,
    type PositionCreate
  } from '$lib/api/portfolios';
  import BrDecimalInput from '$lib/components/BrDecimalInput.svelte';
  import AssetForm from '$lib/features/assets/AssetForm.svelte';
  import AssetPicker from '$lib/features/portfolios/AssetPicker.svelte';
  import { usesManualPositionValues } from '$lib/features/portfolios/positionMetrics';

  export let open = false;
  export let portfolioId: number | null = null;
  export let assets: Asset[] = [];
  export let loading = false;
  export let onClose: () => void = () => undefined;
  export let onSaved: () => void | Promise<void> = () => undefined;

  type AddKind = 'market' | 'fixed_income' | 'pension';
  let kind: AddKind = 'market';

  let addAssetId: number | '' = '';
  let addQuantity = 0;
  let addAvgPrice = 0;
  let quantityInput: BrDecimalInput;
  let avgPriceInput: BrDecimalInput;

  let investedAmount = 0;
  let currentValue = 0;
  let investedInput: BrDecimalInput;
  let currentInput: BrDecimalInput;
  let formKey = 0;

  let error = '';
  let saving = false;

  /** Bolsa = qualquer ativo que não seja renda fixa tradicional nem previdência. */
  $: marketAssets = assets.filter((a) => !usesManualPositionValues(a));
  $: selectedAsset =
    addAssetId !== '' ? (assets.find((a) => a.id === Number(addAssetId)) ?? null) : null;
  $: avgPriceLabel = selectedAsset ? `Preço médio (${selectedAsset.currency})` : 'Preço médio';

  $: manualAssetSeed = {
    symbol: '',
    name: '',
    asset_type: (kind === 'pension' ? 'pension' : 'fixed_income') as AssetType,
    market: 'national' as const,
    country: 'BR',
    currency: 'BRL'
  } satisfies Partial<AssetCreate>;

  let prevOpen = false;
  $: if (open && !prevOpen) {
    prevOpen = true;
    resetState();
  } else if (!open && prevOpen) {
    prevOpen = false;
  }

  function resetState() {
    kind = 'market';
    addAssetId = '';
    addQuantity = 0;
    addAvgPrice = 0;
    investedAmount = 0;
    currentValue = 0;
    error = '';
    formKey += 1;
  }

  function selectKind(next: AddKind) {
    if (kind === next) {
      return;
    }
    kind = next;
    error = '';
    investedAmount = 0;
    currentValue = 0;
    formKey += 1;
  }

  function handleClose() {
    open = false;
    onClose();
  }

  async function handleAddMarket() {
    if (portfolioId == null || addAssetId === '') {
      error = 'Selecione um ativo.';
      return;
    }
    if (!quantityInput?.flush() || !avgPriceInput?.flush()) {
      error = 'Quantidade ou preço médio inválidos. Use vírgula para decimais (ex.: 1,88637).';
      return;
    }
    if (addQuantity <= 0) {
      error = 'Informe uma quantidade maior que zero.';
      return;
    }
    if (addAvgPrice < 0) {
      error = 'Preço médio não pode ser negativo.';
      return;
    }
    saving = true;
    error = '';
    try {
      const payload: PositionCreate = {
        asset_id: Number(addAssetId),
        quantity: addQuantity,
        average_price: addAvgPrice
      };
      await createPosition(portfolioId, payload);
      handleClose();
      await onSaved();
    } catch (err) {
      error = parseApiError(err, 'Não foi possível adicionar a posição.');
    } finally {
      saving = false;
    }
  }

  async function handleSaveManual(assetPayload: AssetCreate) {
    if (portfolioId == null) {
      return;
    }
    if (!investedInput?.flush() || !currentInput?.flush()) {
      error = 'Valores inválidos. Use vírgula para centavos (ex.: 1234,56).';
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
    saving = true;
    error = '';
    try {
      await createFixedIncomePosition(portfolioId, {
        asset: assetPayload,
        invested_amount: investedAmount,
        current_value: currentValue
      });
      handleClose();
      await onSaved();
    } catch (err) {
      error = parseApiError(err, 'Não foi possível cadastrar o ativo na carteira.');
    } finally {
      saving = false;
    }
  }
</script>

{#if open}
  <div class="modal modal-open">
    <div class="modal-box max-w-3xl">
      <h3 class="text-lg font-bold">Adicionar ativo à carteira</h3>

      <div role="tablist" class="tabs tabs-boxed mt-4">
        <button
          type="button"
          role="tab"
          class="tab"
          class:tab-active={kind === 'market'}
          on:click={() => selectKind('market')}
        >
          Bolsa
        </button>
        <button
          type="button"
          role="tab"
          class="tab"
          class:tab-active={kind === 'fixed_income'}
          on:click={() => selectKind('fixed_income')}
        >
          Renda fixa
        </button>
        <button
          type="button"
          role="tab"
          class="tab"
          class:tab-active={kind === 'pension'}
          on:click={() => selectKind('pension')}
        >
          Previdência
        </button>
      </div>

      {#if kind === 'market'}
        <p class="mt-3 text-sm text-base-content/70">
          Selecione um ativo já cadastrado na base e informe quantidade e preço médio.
        </p>
        <div class="mt-4 grid gap-3">
          <div class="form-control">
            <span class="label-text mb-1">Ativo</span>
            <AssetPicker bind:value={addAssetId} assets={marketAssets} disabled={saving} {loading} />
          </div>
          <BrDecimalInput
            bind:this={quantityInput}
            bind:value={addQuantity}
            label="Quantidade"
            inputClass="input input-bordered"
            disabled={saving}
          />
          <BrDecimalInput
            bind:this={avgPriceInput}
            bind:value={addAvgPrice}
            label={avgPriceLabel}
            inputClass="input input-bordered"
            disabled={saving}
          />
        </div>

        {#if error}
          <p class="mt-2 text-sm text-error">{error}</p>
        {/if}

        <div class="modal-action">
          <button class="btn btn-ghost" type="button" disabled={saving} on:click={handleClose}>
            Cancelar
          </button>
          <button class="btn btn-primary" type="button" disabled={saving} on:click={handleAddMarket}>
            {saving ? 'Salvando…' : 'Adicionar'}
          </button>
        </div>
      {:else}
        {#key formKey}
          <AssetForm
            asset={manualAssetSeed}
            mode="create"
            lockType
            availableTypes={[manualAssetSeed.asset_type]}
            showInfoAlert={false}
            headerTitle={kind === 'pension' ? 'Dados da previdência' : 'Dados da renda fixa'}
            formClass="mt-2"
            submitLabel="Salvar na carteira"
            showCancelButton
            cancelLabel="Cancelar"
            onCancel={handleClose}
            onSave={handleSaveManual}
            loading={saving}
          >
            <div slot="portfolio-values" class="rounded-lg border border-base-300 bg-base-200/30 p-4">
              <p class="mb-3 text-sm font-semibold text-base-content/90">Valores na carteira</p>
              <div class="grid gap-4 md:grid-cols-2">
                <BrDecimalInput
                  bind:this={investedInput}
                  bind:value={investedAmount}
                  label="Valor aplicado"
                  inputClass="input input-bordered"
                  disabled={saving}
                />
                <BrDecimalInput
                  bind:this={currentInput}
                  bind:value={currentValue}
                  label="Valor atual"
                  inputClass="input input-bordered"
                  disabled={saving}
                />
              </div>
            </div>
          </AssetForm>
        {/key}

        {#if error}
          <p class="mt-2 text-sm text-error">{error}</p>
        {/if}
      {/if}
    </div>
  </div>
{/if}

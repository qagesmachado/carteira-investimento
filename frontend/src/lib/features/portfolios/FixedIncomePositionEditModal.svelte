<script lang="ts">
  import type { Asset, AssetUpdate } from '$lib/api/assets';
  import { parseApiError } from '$lib/api/parseApiError';
  import { updateFixedIncomePosition, type Position } from '$lib/api/portfolios';
  import BrDecimalInput from '$lib/components/BrDecimalInput.svelte';
  import AssetForm from '$lib/features/assets/AssetForm.svelte';

  export let open = false;
  export let position: Position | null = null;
  export let asset: Asset | null = null;
  export let portfolioId: number | null = null;
  export let onClose: () => void = () => undefined;
  export let onSaved: () => void | Promise<void> = () => undefined;

  let investedAmount = 0;
  let currentValue = 0;
  let investedInput: BrDecimalInput;
  let currentInput: BrDecimalInput;
  let error = '';
  let saving = false;

  /** Só repovoa os valores ao abrir ou quando a posição muda (id/updated_at). */
  let formSyncToken = '';

  $: if (!open || !position || !asset) {
    formSyncToken = '';
  }

  $: if (open && position && asset) {
    const nextToken = `${position.id}:${position.updated_at}`;
    if (nextToken !== formSyncToken) {
      formSyncToken = nextToken;
      investedAmount = position.invested_amount ?? 0;
      currentValue = position.current_value ?? 0;
      error = '';
    }
  }

  function handleClose() {
    open = false;
    onClose();
  }

  async function handleUpdate(assetPayload: AssetUpdate) {
    if (!position || portfolioId == null) {
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
      await updateFixedIncomePosition(portfolioId, position.id, {
        asset: assetPayload,
        invested_amount: investedAmount,
        current_value: currentValue
      });
      handleClose();
      await onSaved();
    } catch (err) {
      error = parseApiError(err, 'Não foi possível atualizar o ativo na carteira.');
    } finally {
      saving = false;
    }
  }
</script>

{#if open && position && asset}
  <div class="modal modal-open">
    <div class="modal-box max-w-3xl">
      <h3 class="text-lg font-bold">Editar ativo na carteira</h3>
      {#key formSyncToken}
        <AssetForm
          {asset}
          mode="edit"
          lockType
          readonlySymbol
          availableTypes={[asset.asset_type]}
          showInfoAlert={false}
          headerTitle={asset.asset_type === 'pension' ? 'Dados da previdência' : 'Dados da renda fixa'}
          formClass="mt-2"
          submitLabel="Salvar alterações"
          showCancelButton
          cancelLabel="Cancelar"
          onCancel={handleClose}
          onUpdate={handleUpdate}
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
    </div>
  </div>
{/if}

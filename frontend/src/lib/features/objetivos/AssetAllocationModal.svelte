<script lang="ts">
  import type { Asset } from '$lib/api/assets';
  import type { AssetDivergence, Objective } from '$lib/api/objetivos';
  import AssetPicker from '$lib/features/portfolios/AssetPicker.svelte';
  import BrDecimalInput from '$lib/components/BrDecimalInput.svelte';
  import { formatBrl } from '$lib/features/rebalance/allocationTargets';
  import { formatTickerForDisplay } from '$lib/formatTickerForDisplay';
  import { createEventDispatcher } from 'svelte';

  import { explicitOthersForDraft } from './allocationCapacity';
  import { isAssetBlocked, totalForAsset } from './computeDivergence';
  import { formatProfitCell } from './formatAllocationProfit';
  import { splitModeForAsset } from './splitMode';
  import { hasDuplicateSliceName } from './sliceNameValidation';
  import { buildAllocationPayload, validateAllocationDraft } from './validateAllocations';

  export let open = false;
  /** Incrementado pelo pai a cada abertura — força formulário limpo ao adicionar nova fatia. */
  export let sessionKey = 0;
  export let assets: Asset[] = [];
  export let objective: Objective | null = null;
  export let divergences: AssetDivergence[] = [];
  export let editingAllocationId: number | null = null;
  export let saving = false;
  export let error = '';

  const dispatch = createEventDispatcher<{
    close: void;
    save: { payload: ReturnType<typeof buildAllocationPayload> };
  }>();

  let selectedAssetId: number | '' = '';
  let sliceNameInput = '';
  let valueInput = 0;
  let brInput: BrDecimalInput;
  let localError = '';

  $: isSingleAsset = objective?.mode === 'single_asset';
  $: isEditing = editingAllocationId != null;

  $: editingRow =
    isEditing && objective
      ? objective.allocations.find((a) => a.id === editingAllocationId) ?? null
      : null;

  /** Monoativo: ativo fixo (criação ou primeira fatia já gravada). */
  $: lockedAssetId = (() => {
    if (!objective || !isSingleAsset) return null;
    if (objective.partition_asset_id != null) return objective.partition_asset_id;
    const row = objective.allocations[0];
    return row?.asset_id ?? null;
  })();

  $: showAssetPicker = !isSingleAsset;

  $: lockedAsset =
    lockedAssetId != null ? (assets.find((a) => a.id === lockedAssetId) ?? null) : null;

  $: selectedAsset = isSingleAsset
    ? lockedAsset
    : selectedAssetId !== ''
      ? (assets.find((a) => a.id === Number(selectedAssetId)) ?? null)
      : null;

  $: splitMode = selectedAsset ? splitModeForAsset(selectedAsset) : 'shares';
  $: blocked =
    selectedAsset != null ? isAssetBlocked(divergences, selectedAsset.id) : false;
  $: total =
    selectedAsset != null ? totalForAsset(divergences, selectedAsset.id) : null;
  $: explicitOthers =
    selectedAsset != null && objective
      ? explicitOthersForDraft(
          divergences,
          objective,
          selectedAsset.id,
          isEditing ? editingAllocationId : null
        )
      : 0;
  $: validation =
    selectedAsset && total != null
      ? validateAllocationDraft(splitMode, total, explicitOthers, valueInput)
      : null;
  $: freePreview = validation?.ok ? validation.free : null;
  $: validationHint =
    validation && !validation.ok ? validation.message : null;

  $: duplicateSliceName =
    objective != null &&
    hasDuplicateSliceName(objective.allocations, sliceNameInput, editingAllocationId);

  $: modalAssetLabel =
    selectedAsset != null ? formatTickerForDisplay(selectedAsset.symbol) : (objective?.name ?? '');
  $: modalTitle = isEditing
    ? `Editar fatia em ${modalAssetLabel}`
    : `Nova fatia em ${modalAssetLabel}`;

  let appliedFormSyncKey = '';

  function applySessionFormState() {
    if (editingRow) {
      selectedAssetId = editingRow.asset_id;
      sliceNameInput = editingRow.slice_name;
      valueInput =
        editingRow.split_mode === 'amount'
          ? (editingRow.amount ?? 0)
          : (editingRow.quantity ?? 0);
    } else if (isSingleAsset && lockedAssetId != null) {
      selectedAssetId = lockedAssetId;
      sliceNameInput = '';
      valueInput = 0;
    } else {
      selectedAssetId = '';
      sliceNameInput = '';
      valueInput = 0;
    }
    localError = '';
  }

  /** Inclui modo (add/edit) e linha — evita aplicar vazio antes de `editingRow` existir. */
  $: formSyncKey = open
    ? `${sessionKey}:${editingAllocationId ?? 'new'}:${editingRow?.id ?? 'pending'}`
    : '';

  $: if (formSyncKey && formSyncKey !== appliedFormSyncKey) {
    const canApply = !isEditing || editingRow != null;
    if (canApply) {
      appliedFormSyncKey = formSyncKey;
      applySessionFormState();
    }
  }
  $: if (!open) {
    appliedFormSyncKey = '';
  }

  async function handleSubmit(event: Event) {
    event.preventDefault();
    localError = '';
    if (!selectedAsset || !objective) return;
    const sliceName = sliceNameInput.trim();
    if (!sliceName) {
      localError = 'Informe o nome interno da fatia.';
      return;
    }
    if (duplicateSliceName) {
      localError = 'Já existe uma fatia com este nome neste objetivo.';
      return;
    }
    if (blocked) {
      localError = 'Ativo com divergência — regularize antes de editar.';
      return;
    }
    if (splitMode === 'amount' && brInput && !brInput.flush()) {
      localError = 'Valor inválido.';
      return;
    }
    if (!validation?.ok) {
      localError = validation?.message ?? 'Valor inválido.';
      return;
    }
    dispatch('save', {
      payload: buildAllocationPayload(splitMode, sliceName, selectedAsset.id, valueInput)
    });
  }
</script>

{#if open && objective}
  <dialog class="modal modal-open" data-testid="objetivo-allocation-modal">
    <div class="modal-box max-w-3xl overflow-visible">
      <h3 class="text-lg font-bold">{modalTitle}</h3>
      <form class="mt-4 space-y-3" on:submit={handleSubmit} data-testid="allocation-form">
        {#key formSyncKey}
        {#if isSingleAsset}
          <p class="text-sm opacity-70">
            Dê um nome à fatia (ex.: Viagem, Reserva) e informe cotas ou R$. O mesmo ativo pode
            aparecer várias vezes com finalidades diferentes.
          </p>
        {/if}

        <label class="form-control w-full">
          <span class="label-text">Nome interno da fatia</span>
          <input
            type="text"
            class="input input-bordered w-full"
            bind:value={sliceNameInput}
            required
            maxlength="120"
            placeholder="Ex.: Viagem Europa"
            disabled={saving}
            data-testid="allocation-slice-name-input"
          />
        </label>

        {#if showAssetPicker}
          <div>
            <span class="label-text mb-1 block">Ativo</span>
            <AssetPicker assets={assets} bind:value={selectedAssetId} disabled={saving} />
          </div>
        {:else if isSingleAsset && !lockedAsset}
          <p class="text-sm text-warning" data-testid="allocation-missing-partition-asset">
            Este objetivo monoativo ainda não tem ativo definido. Renomeie o objetivo e escolha o
            ativo a particionar, ou exclua e crie de novo com o ativo selecionado.
          </p>
        {:else if lockedAsset}
          <div
            class="rounded-lg border border-base-300 bg-base-200/40 px-3 py-2"
            data-testid="allocation-partition-asset-label"
          >
            <span class="label-text block opacity-70">Ativo</span>
            <p class="font-medium">
              {formatTickerForDisplay(lockedAsset.symbol)} — {lockedAsset.name}
            </p>
          </div>
        {/if}

        {#if blocked}
          <p class="text-sm text-error" data-testid="allocation-blocked-message">
            Ativo com divergência — regularize antes de editar.
          </p>
        {/if}

        {#if duplicateSliceName}
          <p class="text-sm text-error">Já existe uma fatia com este nome neste objetivo.</p>
        {/if}

        {#if selectedAsset && total != null}
          <div class="grid gap-2 rounded-lg border border-base-300 p-3 text-sm sm:grid-cols-2">
            <p>
              <span class="opacity-70">Total na carteira:</span>
              {splitMode === 'amount' ? formatBrl(total) : `${total.toLocaleString('pt-BR')} cotas`}
            </p>
            {#if editingRow}
              <p>
                <span class="opacity-70">Custo da fatia:</span>
                {formatBrl(editingRow.invested_value_brl)}
              </p>
              <p>
                <span class="opacity-70">Valor da fatia:</span>
                {formatBrl(editingRow.current_value_brl)}
              </p>
              <p>
                <span class="opacity-70">Lucro da fatia:</span>
                {formatProfitCell(editingRow.profit_brl, editingRow.profit_percent)}
              </p>
            {/if}
          </div>

          {#if splitMode === 'amount'}
            <BrDecimalInput
              bind:this={brInput}
              bind:value={valueInput}
              label="Valor neste objetivo (R$)"
              disabled={blocked || saving}
            />
          {:else}
            <label class="form-control w-full">
              <span class="label-text">Quantidade de cotas neste objetivo</span>
              <input
                type="number"
                min="0"
                step="any"
                class="input input-bordered w-full"
                value={valueInput > 0 ? valueInput : ''}
                disabled={blocked || saving}
                data-testid="allocation-shares-input"
                on:input={(event) => {
                  const raw = event.currentTarget.value.trim();
                  valueInput = raw === '' ? 0 : Number(raw);
                }}
              />
            </label>
          {/if}

          {#if validationHint}
            <p class="text-sm text-warning" data-testid="allocation-validation-hint">
              {validationHint}
            </p>
          {/if}

          {#if freePreview != null}
            <p class="text-sm" data-testid="allocation-free-preview">
              Restante (Livre):
              {splitMode === 'amount'
                ? formatBrl(freePreview)
                : `${freePreview.toLocaleString('pt-BR')} cotas`}
            </p>
          {/if}
        {/if}

        {#if localError || error}
          <p class="text-sm text-error">{localError || error}</p>
        {/if}

        <div class="modal-action">
          <button type="button" class="btn" on:click={() => dispatch('close')}>Cancelar</button>
          <button
            type="submit"
            class="btn btn-primary"
            disabled={saving ||
              blocked ||
              !selectedAsset ||
              !sliceNameInput.trim() ||
              duplicateSliceName ||
              !validation?.ok}
            data-testid="allocation-save-btn"
          >
            Salvar
          </button>
        </div>
        {/key}
      </form>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button type="button" aria-label="Fechar" on:click={() => dispatch('close')}> </button>
    </form>
  </dialog>
{/if}

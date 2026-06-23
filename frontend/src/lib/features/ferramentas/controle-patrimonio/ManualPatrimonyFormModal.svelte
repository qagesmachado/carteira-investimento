<script lang="ts">
  import type { ManualPatrimonyCategory, ManualPatrimonyItem } from '$lib/api/patrimonyControl';
  import { createEventDispatcher } from 'svelte';

  import {
    EMERGENCY_RESERVE_LOCATION_OPTIONS,
    MANUAL_PATRIMONY_CATEGORY_LABELS,
    type EmergencyReserveLocation,
    type ManualPatrimonyFormValues,
    validateManualPatrimonyForm,
    isEmergencyReserveLocation
  } from './patrimonyControlForm';

  export let open = false;
  export let category: ManualPatrimonyCategory = 'emergency_reserve';
  export let initial: ManualPatrimonyItem | null = null;
  export let saving = false;
  export let error = '';

  const dispatch = createEventDispatcher<{
    close: void;
    save: ManualPatrimonyFormValues;
  }>();

  let name = '';
  let amountBrl = '';
  let location: EmergencyReserveLocation | '' = '';
  let notes = '';
  let wasOpen = false;
  let localError = '';

  $: title = initial
    ? `Editar ${MANUAL_PATRIMONY_CATEGORY_LABELS[category].toLowerCase()}`
    : `Adicionar ${MANUAL_PATRIMONY_CATEGORY_LABELS[category].toLowerCase()}`;
  $: showLocation = category === 'emergency_reserve';

  $: if (open && !wasOpen) {
    name = initial?.name ?? '';
    amountBrl = initial ? String(initial.amount_brl) : '';
    location =
      initial?.location && isEmergencyReserveLocation(initial.location)
        ? initial.location
        : '';
    notes = initial?.notes ?? '';
    localError = '';
    wasOpen = true;
  } else if (!open) {
    wasOpen = false;
  }

  function handleSubmit() {
    const values: ManualPatrimonyFormValues = {
      category,
      name,
      amount_brl: amountBrl,
      location,
      notes
    };
    const validationError = validateManualPatrimonyForm(values);
    if (validationError) {
      localError = validationError;
      return;
    }
    localError = '';
    dispatch('save', values);
  }
</script>

{#if open}
  <dialog class="modal modal-open" aria-labelledby="manual-patrimony-form-title">
    <div class="modal-box max-w-lg">
      <h3 id="manual-patrimony-form-title" class="text-lg font-bold">{title}</h3>
      {#if error}
        <div class="alert alert-error mt-3 text-sm">{error}</div>
      {/if}
      {#if localError}
        <div class="alert alert-warning mt-3 text-sm">{localError}</div>
      {/if}
      <form class="mt-4 flex flex-col gap-3" on:submit|preventDefault={handleSubmit}>
        <label class="form-control">
          <span class="label-text">Nome</span>
          <input
            class="input input-bordered"
            required
            maxlength="120"
            data-testid="manual-patrimony-name"
            bind:value={name}
          />
        </label>
        {#if showLocation}
          <label class="form-control">
            <span class="label-text">Localização</span>
            <select
              class="select select-bordered"
              required
              data-testid="manual-patrimony-location"
              bind:value={location}
            >
              <option value="" disabled>Selecione…</option>
              {#each EMERGENCY_RESERVE_LOCATION_OPTIONS as option}
                <option value={option.value}>{option.label}</option>
              {/each}
            </select>
          </label>
        {/if}
        <label class="form-control">
          <span class="label-text">Valor (R$)</span>
          <input
            class="input input-bordered"
            required
            inputmode="decimal"
            data-testid="manual-patrimony-amount"
            bind:value={amountBrl}
          />
        </label>
        <label class="form-control">
          <span class="label-text">Observações (opcional)</span>
          <textarea class="textarea textarea-bordered" rows="2" bind:value={notes}></textarea>
        </label>
        <div class="modal-action">
          <button type="button" class="btn btn-ghost" on:click={() => dispatch('close')}>
            Cancelar
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            disabled={saving}
            data-testid="manual-patrimony-save"
          >
            {saving ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button type="button" aria-label="Fechar" on:click={() => dispatch('close')}></button>
    </form>
  </dialog>
{/if}

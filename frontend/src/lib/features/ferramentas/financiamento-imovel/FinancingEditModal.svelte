<script lang="ts">
  import type { PropertyFinancing, PropertyType } from '$lib/api/propertyFinancings';
  import { createEventDispatcher } from 'svelte';

  import { PROPERTY_TYPE_OPTIONS } from './propertyTypeLabels';

  export let open = false;
  export let title = 'Imóvel';
  export let initial: PropertyFinancing | null = null;
  export let saving = false;
  export let error = '';

  const dispatch = createEventDispatcher<{
    close: void;
    save: {
      name: string;
      property_type: PropertyType;
      description: string;
    };
  }>();

  let name = '';
  let propertyType: PropertyType = 'apartamento';
  let description = '';
  let wasOpen = false;

  $: if (open && !wasOpen) {
    name = initial?.name ?? '';
    propertyType = initial?.property_type ?? 'apartamento';
    description = initial?.description ?? '';
    wasOpen = true;
  } else if (!open) {
    wasOpen = false;
  }

  function handleSubmit() {
    dispatch('save', {
      name: name.trim(),
      property_type: propertyType,
      description: description.trim()
    });
  }
</script>

{#if open}
  <dialog class="modal modal-open" aria-labelledby="financing-edit-title">
    <div class="modal-box max-w-lg">
      <h3 id="financing-edit-title" class="text-lg font-bold">{title}</h3>
      {#if error}
        <div class="alert alert-error mt-3 text-sm">{error}</div>
      {/if}
      <form class="mt-4 flex flex-col gap-3" on:submit|preventDefault={handleSubmit}>
        <label class="form-control">
          <span class="label-text">Nome</span>
          <input
            class="input input-bordered"
            required
            maxlength="120"
            data-testid="financing-edit-name"
            bind:value={name}
          />
        </label>
        <label class="form-control">
          <span class="label-text">Tipo do imóvel</span>
          <select
            class="select select-bordered"
            data-testid="financing-edit-type"
            bind:value={propertyType}
          >
            {#each PROPERTY_TYPE_OPTIONS as option}
              <option value={option.value}>{option.label}</option>
            {/each}
          </select>
        </label>
        <label class="form-control">
          <span class="label-text">Descrição (opcional)</span>
          <textarea class="textarea textarea-bordered" rows="2" bind:value={description}></textarea>
        </label>
        <div class="modal-action">
          <button type="button" class="btn btn-ghost" on:click={() => dispatch('close')}>
            Cancelar
          </button>
          <button type="submit" class="btn btn-primary" disabled={saving} data-testid="financing-edit-save">
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

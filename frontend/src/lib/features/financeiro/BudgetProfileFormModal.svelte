<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  import type { BudgetProfile } from '$lib/api/budget';
  import DismissibleAlert from '$lib/components/DismissibleAlert.svelte';

  export let open = false;
  export let initial: BudgetProfile | null = null;
  export let saving = false;
  export let error = '';

  const dispatch = createEventDispatcher<{
    close: void;
    save: { name: string; description: string | null };
  }>();

  let name = '';
  let description = '';
  let wasOpen = false;

  $: if (open && !wasOpen) {
    name = initial?.name ?? '';
    description = initial?.description ?? '';
    wasOpen = true;
  } else if (!open) {
    wasOpen = false;
  }

  function handleClose() {
    dispatch('close');
  }

  function handleSave() {
    if (!name.trim()) {
      return;
    }
    dispatch('save', {
      name: name.trim(),
      description: description.trim() || null
    });
  }
</script>

{#if open}
  <dialog class="modal modal-open" aria-labelledby="budget-profile-modal-title">
    <div class="modal-box max-w-lg">
      <h3 id="budget-profile-modal-title" class="text-lg font-bold">Editar perfil</h3>
      {#if error}
        <DismissibleAlert text={error} variant="error" />
      {/if}
      <form class="mt-4 space-y-3" on:submit|preventDefault={handleSave}>
        <label class="form-control w-full">
          <span class="label-text">Nome</span>
          <input
            class="input input-bordered w-full"
            bind:value={name}
            required
            data-testid="budget-profile-edit-name"
          />
        </label>
        <label class="form-control w-full">
          <span class="label-text">Descrição (opcional)</span>
          <textarea
            class="textarea textarea-bordered w-full"
            rows="2"
            bind:value={description}
            data-testid="budget-profile-edit-description"
          ></textarea>
        </label>
        <div class="modal-action">
          <button type="button" class="btn btn-ghost" disabled={saving} on:click={handleClose}>
            Cancelar
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            disabled={saving || !name.trim()}
            data-testid="budget-profile-edit-save"
          >
            {saving ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button type="button" aria-label="Fechar" on:click={handleClose}></button>
    </form>
  </dialog>
{/if}

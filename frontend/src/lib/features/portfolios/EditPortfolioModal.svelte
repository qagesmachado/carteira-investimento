<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  import type { Portfolio, PortfolioUpdate } from '$lib/api/portfolios';
  import PortfolioHubAllocationSummary from '$lib/features/portfolios/PortfolioHubAllocationSummary.svelte';

  export let open = false;
  export let portfolio: Portfolio | null = null;
  export let loading = false;
  export let onClose: () => void = () => undefined;
  export let onSave: (payload: PortfolioUpdate) => void | Promise<void> = () => undefined;

  const dispatch = createEventDispatcher<{ close: void }>();

  let name = '';
  let holder = '';
  let objective = '';
  let deleteLocked = false;
  let error = '';
  let saving = false;

  let prevOpen = false;
  let prevPortfolioId: number | null = null;

  $: if (open && portfolio && (!prevOpen || portfolio.id !== prevPortfolioId)) {
    name = portfolio.name;
    holder = portfolio.holder?.trim() ?? '';
    objective = portfolio.objective?.trim() ?? '';
    deleteLocked = portfolio.delete_locked ?? false;
    error = '';
    prevPortfolioId = portfolio.id;
    prevOpen = true;
  } else if (!open && prevOpen) {
    prevOpen = false;
    prevPortfolioId = null;
  }

  function handleClose() {
    open = false;
    dispatch('close');
    onClose();
  }

  async function handleSubmit() {
    if (!portfolio) {
      return;
    }
    const trimmedName = name.trim();
    if (!trimmedName) {
      error = 'Informe o nome da carteira.';
      return;
    }
    saving = true;
    error = '';
    try {
      await onSave({
        name: trimmedName,
        holder: holder.trim() || null,
        objective: objective.trim() || null,
        delete_locked: deleteLocked
      });
    } catch (err) {
      error = err instanceof Error ? err.message : 'Não foi possível salvar a carteira.';
    } finally {
      saving = false;
    }
  }
</script>

{#if open && portfolio}
  <div class="modal modal-open" data-testid="edit-portfolio-modal">
    <div class="modal-box max-w-2xl">
      <h3 class="text-lg font-bold">Editar carteira</h3>
      <p class="mt-1 text-sm text-base-content/70">
        Atualize nome, titular, objetivo e consulte o balanceamento sugerido.
      </p>

      <div class="mt-6">
        <PortfolioHubAllocationSummary
          allocationTargetsJson={portfolio.allocation_targets_json}
          variant="detailed"
        />
      </div>

      <div class="mt-6 grid gap-4">
        <label class="form-control">
          <span class="label-text">Nome da carteira</span>
          <input
            class="input input-bordered"
            bind:value={name}
            aria-label="Nome da carteira"
          />
        </label>
        <label class="form-control">
          <span class="label-text">Titular (opcional)</span>
          <input
            class="input input-bordered"
            bind:value={holder}
            placeholder="Ex.: Eu"
            aria-label="Titular"
          />
        </label>
        <label class="form-control">
          <span class="label-text">Objetivo (opcional)</span>
          <textarea
            class="textarea textarea-bordered min-h-[5rem]"
            bind:value={objective}
            placeholder="Descreva a finalidade desta carteira"
            aria-label="Objetivo"
          ></textarea>
        </label>
      </div>

      {#if error}
        <p class="mt-4 text-sm text-error" role="alert">{error}</p>
      {/if}

      <div class="modal-action flex w-full items-center justify-between gap-4">
        <label class="label cursor-pointer justify-start gap-2 py-0">
          <input
            class="checkbox checkbox-sm checkbox-primary"
            type="checkbox"
            bind:checked={deleteLocked}
            data-testid="edit-portfolio-delete-lock"
            aria-label="Bloquear exclusão desta carteira no hub"
          />
          <span class="label-text text-sm">Bloquear exclusão desta carteira</span>
        </label>
        <div class="flex shrink-0 gap-2">
          <button class="btn btn-ghost" type="button" disabled={saving || loading} on:click={handleClose}>
            Cancelar
          </button>
          <button
            class="btn btn-primary"
            type="button"
            disabled={saving || loading}
            data-testid="edit-portfolio-save"
            on:click={handleSubmit}
          >
            {saving ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
    <button class="modal-backdrop" type="button" aria-label="Fechar" on:click={handleClose}></button>
  </div>
{/if}

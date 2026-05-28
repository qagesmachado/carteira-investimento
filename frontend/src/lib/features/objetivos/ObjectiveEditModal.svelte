<script lang="ts">
  import type { Asset } from '$lib/api/assets';
  import type { ObjectiveMode } from '$lib/api/objetivos';
  import AssetPicker from '$lib/features/portfolios/AssetPicker.svelte';
  import { createEventDispatcher } from 'svelte';

  export let open = false;
  export let title = 'Objetivo';
  export let initialName = '';
  export let initialDescription = '';
  export let portfolioAssets: Asset[] = [];
  export let saving = false;
  export let error = '';

  const dispatch = createEventDispatcher<{
    close: void;
    save: {
      name: string;
      description: string;
      mode: ObjectiveMode;
      partitionAssetId: number | null;
    };
  }>();

  let name = '';
  let description = '';
  let mode: ObjectiveMode = 'multi_asset';
  let partitionAssetId: number | '' = '';

  $: if (open) {
    name = initialName;
    description = initialDescription;
    mode = 'multi_asset';
    partitionAssetId = '';
  }

  function handleSubmit(event: Event) {
    event.preventDefault();
    const assetId = partitionAssetId !== '' ? Number(partitionAssetId) : null;
    dispatch('save', {
      name: name.trim(),
      description: description.trim(),
      mode,
      partitionAssetId: mode === 'single_asset' ? assetId : null
    });
  }
</script>

{#if open}
  <dialog class="modal modal-open" data-testid="objetivo-edit-modal">
    <div class="modal-box max-w-xl overflow-visible">
      <h3 class="text-lg font-bold">{title}</h3>
      <form class="mt-4 space-y-3" on:submit={handleSubmit}>
        <label class="form-control w-full">
          <span class="label-text">Nome</span>
          <input
            class="input input-bordered w-full"
            bind:value={name}
            required
            data-testid="objetivo-name-input"
          />
        </label>
        <label class="form-control w-full">
          <span class="label-text">Descrição (opcional)</span>
          <textarea class="textarea textarea-bordered w-full" bind:value={description} rows="2" />
        </label>

        <fieldset class="space-y-2">
          <legend class="label-text font-medium">Modalidade</legend>
          <label class="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              class="radio radio-sm"
              value="multi_asset"
              bind:group={mode}
              data-testid="objetivo-mode-multi"
            />
            <span class="text-sm">Multi-ativo — vários ativos neste objetivo</span>
          </label>
          <label class="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              class="radio radio-sm"
              value="single_asset"
              bind:group={mode}
              data-testid="objetivo-mode-single"
            />
            <span class="text-sm">
              Um ativo — particione o mesmo ativo entre objetivos (visão unificada no Resumo)
            </span>
          </label>
        </fieldset>

        {#if mode === 'single_asset'}
          <div>
            <span class="label-text mb-1 block">Ativo a particionar</span>
            <p class="mb-2 text-xs opacity-70">
              Escolha o ativo uma vez; as fatias só pedem nome interno e cotas ou valor.
            </p>
            <AssetPicker
              assets={portfolioAssets}
              bind:value={partitionAssetId}
              disabled={saving}
            />
          </div>
        {/if}

        {#if error}
          <p class="text-sm text-error">{error}</p>
        {/if}
        <div class="modal-action">
          <button type="button" class="btn" on:click={() => dispatch('close')}>Cancelar</button>
          <button
            type="submit"
            class="btn btn-primary"
            disabled={saving ||
              !name.trim() ||
              (mode === 'single_asset' && partitionAssetId === '')}
          >
            Salvar
          </button>
        </div>
      </form>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button type="button" aria-label="Fechar" on:click={() => dispatch('close')}> </button>
    </form>
  </dialog>
{/if}

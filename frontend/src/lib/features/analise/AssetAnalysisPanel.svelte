<script lang="ts">
  import type { CriterionDefinition } from '$lib/api/analysis';
  import {
    VIABILIDADE_CODE,
    summarizeAnalysis
  } from '$lib/features/analise/computeAnalysis';
  import { scoreOptionDropdownLabel } from '$lib/features/analise/scoreLabels';
  import { formatDiagramScore } from '$lib/features/analise/viabilityBadge';
  import { formatAssetTypeForDisplay } from '$lib/assetLabels';
  import { formatTickerForDisplay } from '$lib/formatTickerForDisplay';

  export let open = false;
  export let symbol = '';
  export let name = '';
  export let assetType = '';
  export let criteria: CriterionDefinition[] = [];
  export let scores: Record<string, number | null> = {};
  export let loading = false;
  export let onSave: (scores: Record<string, number | null>) => void | Promise<void> = () => undefined;
  export let onClose: () => void = () => undefined;

  let dialog: HTMLDialogElement;
  let activeTab: 'fundamental' | 'diagrama' = 'fundamental';
  let draftScores: Record<string, number | null> = {};

  $: indicatorCriteria = criteria.filter(
    (c) => c.block === 'fundamental' && c.code !== VIABILIDADE_CODE
  );
  $: viabilidadeCriterion = criteria.find((c) => c.code === VIABILIDADE_CODE);
  $: diagramaCriteria = criteria.filter((c) => c.block === 'diagrama');
  $: preview = summarizeAnalysis(
    draftScores,
    criteria.map((c) => ({
      code: c.code,
      block: c.block as 'fundamental' | 'diagrama',
      label: c.label,
      help_text: c.help_text,
      weight: c.weight,
      sort_order: c.sort_order,
      input_type: c.input_type,
      score_options: c.score_options
    })),
    []
  );

  $: if (dialog) {
    if (open) {
      dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }

  $: if (open) {
    draftScores = { ...scores };
  }

  function handleDialogClose() {
    onClose();
  }

  function handleCancel() {
    onClose();
  }

  function setScore(code: string, raw: string) {
    draftScores = {
      ...draftScores,
      [code]: raw === '' ? null : Number(raw)
    };
  }

  async function handleSubmit() {
    await onSave(draftScores);
  }
</script>

<dialog class="modal" bind:this={dialog} aria-modal="true" on:close={handleDialogClose}>
  <div class="modal-box max-h-[90vh] max-w-3xl overflow-y-auto">
    {#if open}
      <h3 class="text-lg font-bold">Classificar — {formatTickerForDisplay(symbol)}</h3>
      <p class="mt-1 text-sm text-base-content/70">
        {name} · {formatAssetTypeForDisplay(assetType)}
      </p>

      <div role="tablist" class="tabs tabs-boxed mt-4">
        <button
          type="button"
          role="tab"
          class="tab"
          class:tab-active={activeTab === 'fundamental'}
          on:click={() => (activeTab = 'fundamental')}>Fundamental</button
        >
        <button
          type="button"
          role="tab"
          class="tab"
          class:tab-active={activeTab === 'diagrama'}
          on:click={() => (activeTab = 'diagrama')}>Diagrama do Cerrado</button
        >
      </div>

      {#if activeTab === 'fundamental'}
        <div class="mt-4 grid gap-3 sm:grid-cols-2">
          {#each indicatorCriteria as criterion (criterion.code)}
            <label class="form-control">
              <div class="label py-0">
                <span class="label-text font-medium" title={criterion.help_text}>{criterion.label}</span>
              </div>
              <select
                class="select select-bordered select-sm"
                value={draftScores[criterion.code] ?? ''}
                on:change={(event) => setScore(criterion.code, event.currentTarget.value)}
              >
                <option value="">Sem classificação</option>
                {#each criterion.score_options as option (option.value)}
                  <option value={option.value}>{scoreOptionDropdownLabel(option)}</option>
                {/each}
              </select>
            </label>
          {/each}
        </div>

        {#if viabilidadeCriterion}
          <div class="mt-6">
            <label class="form-control max-w-md">
              <div class="label py-0">
                <span class="label-text font-medium">Viabilidade</span>
              </div>
              <select
                class="select select-bordered select-sm"
                value={draftScores[VIABILIDADE_CODE] ?? ''}
                on:change={(event) => setScore(VIABILIDADE_CODE, event.currentTarget.value)}
              >
                <option value="">Sem classificação</option>
                {#each viabilidadeCriterion.score_options as option (option.value)}
                  <option value={option.value}>{option.value} - {option.seal ?? option.label}</option>
                {/each}
              </select>
            </label>
          </div>
        {/if}
      {:else}
        <div class="mt-4 space-y-4">
          {#each diagramaCriteria as criterion (criterion.code)}
            <fieldset class="rounded-lg border border-base-300 p-3">
              <legend class="px-1 text-sm font-medium">{criterion.label}</legend>
              <p class="mb-2 text-sm text-base-content/80">{criterion.help_text}</p>
              <div class="flex flex-wrap gap-4">
                <label class="label cursor-pointer gap-2">
                  <input
                    type="radio"
                    class="radio radio-sm"
                    name={`diagrama-${criterion.code}`}
                    aria-label="{criterion.label} — Sim (+1)"
                    checked={draftScores[criterion.code] === 1}
                    on:change={() => setScore(criterion.code, '1')}
                  />
                  <span class="label-text">Sim (+1)</span>
                </label>
                <label class="label cursor-pointer gap-2">
                  <input
                    type="radio"
                    class="radio radio-sm"
                    name={`diagrama-${criterion.code}`}
                    aria-label="{criterion.label} — Não (-1)"
                    checked={draftScores[criterion.code] === -1}
                    on:change={() => setScore(criterion.code, '-1')}
                  />
                  <span class="label-text">Não (-1)</span>
                </label>
                <label class="label cursor-pointer gap-2">
                  <input
                    type="radio"
                    class="radio radio-sm"
                    name={`diagrama-${criterion.code}`}
                    checked={draftScores[criterion.code] == null}
                    on:change={() => setScore(criterion.code, '')}
                  />
                  <span class="label-text">Sem resposta</span>
                </label>
              </div>
            </fieldset>
          {/each}
        </div>

        <div class="mt-4 rounded-lg bg-base-200 p-4 text-sm">
          <p class="font-medium">Pontuação do diagrama</p>
          <p class="mt-1 text-base-content/80">
            Soma das respostas: {formatDiagramScore(preview.diagrama.score)}
          </p>
        </div>
      {/if}

      <div class="modal-action">
        <button type="button" class="btn btn-ghost" on:click={handleCancel}>Cancelar</button>
        <button type="button" class="btn btn-primary" disabled={loading} on:click={handleSubmit}>
          {loading ? 'Salvando…' : 'Salvar classificação'}
        </button>
      </div>
    {/if}
  </div>
  <form method="dialog" class="modal-backdrop">
    <button type="submit" aria-label="Fechar">fechar</button>
  </form>
</dialog>

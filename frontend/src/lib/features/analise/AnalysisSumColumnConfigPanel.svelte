<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';

  import {
    type AnalysisConfig,
    type TableDisplaySettings
  } from '$lib/api/analysis';
  import { parseApiError } from '$lib/api/parseApiError';
  import DismissibleAlert from '$lib/components/DismissibleAlert.svelte';

  import AnalysisSumColumnConfigFields from './AnalysisSumColumnConfigFields.svelte';
  import { isTableScoreMethodologyValid } from './computeAnalysis';

  export let title = '';
  export let profile: 'stock_br' | 'fii_br' = 'stock_br';
  export let loadConfig: () => Promise<AnalysisConfig>;
  export let saveConfig: (payload: {
    criteria: AnalysisConfig['criteria'];
    rules: AnalysisConfig['rules'];
    table_display: TableDisplaySettings;
  }) => Promise<AnalysisConfig>;
  /** Quando true, renderiza sem card externo (dentro de modal). */
  export let embedded = false;
  /** Quando true, oculta rodapé interno (modal fornece Cancelar/Salvar). */
  export let footerless = false;

  const dispatch = createEventDispatcher<{
    saved: TableDisplaySettings;
  }>();

  let config: AnalysisConfig | null = null;
  let tableDisplay: TableDisplaySettings = {
    sum_column: {
      use_fundamental: true,
      use_diagram: true,
      label: 'Soma',
      diagram_multiplier: 2,
      viabilidade_weights: {
        azulim: 10,
        viavel: 3,
        atencao: -5,
        bomba: -10
      }
    }
  };
  let loading = true;
  let saving = false;
  let error = '';
  let message = '';

  $: canSave = !loading && !saving && isTableScoreMethodologyValid(tableDisplay.sum_column);

  async function reloadConfig() {
    loading = true;
    error = '';
    try {
      config = await loadConfig();
      tableDisplay = structuredClone(config.table_display);
    } catch (err) {
      config = null;
      error = parseApiError(err, 'Não foi possível carregar a configuração.');
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    void reloadConfig();
  });

  export async function save(): Promise<boolean> {
    if (!config) return false;
    if (!isTableScoreMethodologyValid(tableDisplay.sum_column)) {
      error = 'Ative Fundamental, Diagrama ou ambos para salvar.';
      return false;
    }
    tableDisplay.sum_column.label = 'Soma';
    saving = true;
    error = '';
    message = '';
    try {
      config = await saveConfig({
        criteria: config.criteria,
        rules: config.rules,
        table_display: tableDisplay
      });
      tableDisplay = structuredClone(config.table_display);
      message = 'Configuração salva.';
      dispatch('saved', tableDisplay);
      return true;
    } catch (err) {
      error = parseApiError(err, 'Não foi possível salvar a configuração.');
      return false;
    } finally {
      saving = false;
    }
  }

  async function handleSaveClick() {
    await save();
  }
</script>

{#if embedded}
  <div class="flex flex-col gap-3" data-testid="analysis-sum-config-panel">
    {#if message && footerless}
      <DismissibleAlert text={message} variant="success" on:dismiss={() => (message = '')} />
    {/if}
    {#if error}
      <DismissibleAlert text={error} variant="error" on:dismiss={() => (error = '')} />
    {/if}

    {#if loading}
      <p class="text-sm text-base-content/70">Carregando…</p>
    {:else}
      <AnalysisSumColumnConfigFields bind:tableDisplay {profile} />
    {/if}

    {#if !footerless}
      <div class="modal-action mt-2">
        <button
          type="button"
          class="btn btn-primary"
          disabled={!canSave}
          on:click={handleSaveClick}
        >
          {saving ? 'Salvando…' : 'Salvar configuração'}
        </button>
      </div>
    {/if}
  </div>
{:else}
  <section class="card bg-base-100 shadow">
    <div class="card-body gap-3">
      <h2 class="card-title">{title}</h2>

      {#if message}
        <DismissibleAlert text={message} variant="success" on:dismiss={() => (message = '')} />
      {/if}
      {#if error}
        <DismissibleAlert text={error} variant="error" on:dismiss={() => (error = '')} />
      {/if}

      {#if loading}
        <p class="text-sm text-base-content/70">Carregando…</p>
      {:else}
        <AnalysisSumColumnConfigFields bind:tableDisplay {profile} />
      {/if}

      <div class="modal-action mt-2">
        <button
          type="button"
          class="btn btn-primary"
          disabled={!canSave}
          on:click={handleSaveClick}
        >
          {saving ? 'Salvando…' : 'Salvar configuração'}
        </button>
      </div>
    </div>
  </section>
{/if}

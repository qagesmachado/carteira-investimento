<script lang="ts">
  import { onMount } from 'svelte';

  import {
    type AnalysisConfig,
    type TableDisplaySettings
  } from '$lib/api/analysis';
  import { parseApiError } from '$lib/api/parseApiError';
  import DismissibleAlert from '$lib/components/DismissibleAlert.svelte';

  export let title: string;
  export let formulaDescription: string;
  export let resetConfirmMessage: string;
  export let loadConfig: () => Promise<AnalysisConfig>;
  export let saveConfig: (payload: {
    criteria: AnalysisConfig['criteria'];
    rules: AnalysisConfig['rules'];
    table_display: TableDisplaySettings;
  }) => Promise<AnalysisConfig>;
  export let resetConfig: () => Promise<AnalysisConfig>;

  let config: AnalysisConfig | null = null;
  let tableDisplay: TableDisplaySettings = {
    sum_column: {
      enabled: true,
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

  async function handleSave() {
    if (!config) return;
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
    } catch (err) {
      error = parseApiError(err, 'Não foi possível salvar a configuração.');
    } finally {
      saving = false;
    }
  }

  async function handleReset() {
    if (!confirm(resetConfirmMessage)) return;
    saving = true;
    error = '';
    message = '';
    try {
      config = await resetConfig();
      tableDisplay = structuredClone(config.table_display);
      message = 'Configuração restaurada.';
    } catch (err) {
      error = parseApiError(err, 'Não foi possível restaurar a configuração.');
    } finally {
      saving = false;
    }
  }
</script>

<section class="card bg-base-100 shadow">
  <div class="card-body gap-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h2 class="card-title">{title}</h2>
      <div class="flex gap-2">
        <button type="button" class="btn btn-outline btn-sm" disabled={saving} on:click={handleReset}>
          Restaurar padrão
        </button>
        <button type="button" class="btn btn-primary btn-sm" disabled={saving || loading} on:click={handleSave}>
          {saving ? 'Salvando…' : 'Salvar configuração'}
        </button>
      </div>
    </div>

    {#if message}
      <DismissibleAlert text={message} variant="success" on:dismiss={() => (message = '')} />
    {/if}
    {#if error}
      <DismissibleAlert text={error} variant="error" on:dismiss={() => (error = '')} />
    {/if}

    {#if loading}
      <p class="text-sm text-base-content/70">Carregando…</p>
    {:else}
      <p class="text-sm text-base-content/70">{formulaDescription}</p>
      <div class="grid gap-4 rounded-lg border border-base-300 p-4 lg:max-w-xl">
        <label class="label cursor-pointer justify-start gap-3">
          <input
            type="checkbox"
            class="checkbox checkbox-sm"
            bind:checked={tableDisplay.sum_column.enabled}
          />
          <span class="label-text">Exibir coluna de soma</span>
        </label>
        <label class="form-control">
          <span class="label-text">Rótulo da coluna</span>
          <input
            class="input input-bordered input-sm"
            bind:value={tableDisplay.sum_column.label}
            disabled={!tableDisplay.sum_column.enabled}
          />
        </label>
        <label class="form-control">
          <span class="label-text">Multiplicador do diagrama</span>
          <input
            class="input input-bordered input-sm w-28"
            type="number"
            step="0.1"
            bind:value={tableDisplay.sum_column.diagram_multiplier}
            disabled={!tableDisplay.sum_column.enabled}
          />
        </label>
        <div class="grid gap-3 sm:grid-cols-2">
          <label class="form-control">
            <span class="label-text">Peso AZULIM</span>
            <input
              class="input input-bordered input-sm"
              type="number"
              step="0.1"
              bind:value={tableDisplay.sum_column.viabilidade_weights.azulim}
              disabled={!tableDisplay.sum_column.enabled}
            />
          </label>
          <label class="form-control">
            <span class="label-text">Peso VIÁVEL</span>
            <input
              class="input input-bordered input-sm"
              type="number"
              step="0.1"
              bind:value={tableDisplay.sum_column.viabilidade_weights.viavel}
              disabled={!tableDisplay.sum_column.enabled}
            />
          </label>
          <label class="form-control">
            <span class="label-text">Peso ATENÇÃO</span>
            <input
              class="input input-bordered input-sm"
              type="number"
              step="0.1"
              bind:value={tableDisplay.sum_column.viabilidade_weights.atencao}
              disabled={!tableDisplay.sum_column.enabled}
            />
          </label>
          <label class="form-control">
            <span class="label-text">Peso BOMBA</span>
            <input
              class="input input-bordered input-sm"
              type="number"
              step="0.1"
              bind:value={tableDisplay.sum_column.viabilidade_weights.bomba}
              disabled={!tableDisplay.sum_column.enabled}
            />
          </label>
        </div>
      </div>
    {/if}
  </div>
</section>

<script lang="ts">
  import type { TableDisplaySettings } from '$lib/api/analysis';
  import LucideIcon from '$lib/components/LucideIcon.svelte';
  import {
    ANALYSIS_DIAGRAM_COLUMN_LUCIDE_ICON,
    ANALYSIS_FUNDAMENTAL_COLUMN_LUCIDE_ICON
  } from '$lib/icons/lucideIconCatalog';

  import {
    buildCombinedScoreEquation,
    buildRebalanceMethodologyHint,
    buildSomaDescription,
    fundamentalTermsForProfile
  } from './analysisScoreEquation';
  import { isTableScoreMethodologyValid } from './computeAnalysis';

  export let tableDisplay: TableDisplaySettings;
  export let profile: 'stock_br' | 'fii_br' = 'stock_br';

  $: settings = tableDisplay.sum_column;
  $: bothActive = settings.use_fundamental && settings.use_diagram;
  $: showFundamentalOptions = settings.use_fundamental;
  $: methodologyValid = isTableScoreMethodologyValid(settings);
  $: combinedEquation = buildCombinedScoreEquation(profile, settings);
  $: rebalanceHint = buildRebalanceMethodologyHint(settings);
  $: somaDescription = buildSomaDescription(settings);
  $: activeColumnsLabel = [
    settings.use_fundamental ? 'Fundamental' : null,
    settings.use_diagram ? 'Diagrama' : null,
    'Soma'
  ]
    .filter(Boolean)
    .join(' + ');
</script>

<div class="grid gap-3 sm:grid-cols-2" data-testid="analysis-methodology-options">
  <label
    class="cursor-pointer rounded-xl border p-4 transition-colors
      {settings.use_fundamental
      ? 'border-primary bg-primary/5'
      : 'border-base-300 bg-base-100 hover:border-primary/40'}"
    data-testid="analysis-methodology-card-fundamental"
  >
    <div class="flex gap-3">
      <div
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg
          {settings.use_fundamental
          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
          : 'bg-base-200 text-base-content/60'}"
        aria-hidden="true"
      >
        <LucideIcon name={ANALYSIS_FUNDAMENTAL_COLUMN_LUCIDE_ICON} size="md" />
      </div>
      <div class="min-w-0 flex-1">
        <div class="flex items-start gap-2">
          <input
            type="checkbox"
            class="checkbox checkbox-primary checkbox-sm mt-0.5"
            data-testid="analysis-methodology-use-fundamental"
            bind:checked={tableDisplay.sum_column.use_fundamental}
          />
          <span class="font-semibold text-base-content">Fundamental</span>
        </div>
        <p class="mt-2 text-sm text-base-content/70">
          {fundamentalTermsForProfile(profile)}
        </p>
      </div>
    </div>
  </label>

  <label
    class="cursor-pointer rounded-xl border p-4 transition-colors
      {settings.use_diagram
      ? 'border-primary bg-primary/5'
      : 'border-base-300 bg-base-100 hover:border-primary/40'}"
    data-testid="analysis-methodology-card-diagram"
  >
    <div class="flex gap-3">
      <div
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg
          {settings.use_diagram
          ? 'bg-violet-500/15 text-violet-600 dark:text-violet-400'
          : 'bg-base-200 text-base-content/60'}"
        aria-hidden="true"
      >
        <LucideIcon name={ANALYSIS_DIAGRAM_COLUMN_LUCIDE_ICON} size="md" />
      </div>
      <div class="min-w-0 flex-1">
        <div class="flex items-start gap-2">
          <input
            type="checkbox"
            class="checkbox checkbox-primary checkbox-sm mt-0.5"
            data-testid="analysis-methodology-use-diagram"
            bind:checked={tableDisplay.sum_column.use_diagram}
          />
          <span class="font-semibold text-base-content">Diagrama</span>
        </div>
        <p class="mt-2 text-sm text-base-content/70">
          Soma das respostas (+1 / −1) do diagrama do cerrado.
        </p>
      </div>
    </div>
  </label>
</div>

{#if !methodologyValid}
  <p class="mt-3 text-sm text-error" role="alert">Ative Fundamental, Diagrama ou ambos.</p>
{/if}

<div
  class="mt-4 rounded-xl border border-base-300/80 bg-gradient-to-br from-base-200/80 to-base-100/40 p-4"
  data-testid="analysis-methodology-preview"
>
  <p class="text-xs font-semibold uppercase tracking-wide text-base-content/60">
    Metodologia ativa
  </p>
  <p class="mt-1 text-sm text-base-content/80">
    Colunas visíveis: <span class="font-semibold text-base-content">{activeColumnsLabel}</span>
  </p>
  <p class="mt-1 text-sm text-base-content/70">{rebalanceHint}</p>
  <p class="mt-2 text-sm text-base-content/70">
    <span class="font-medium text-base-content">Soma</span> — {somaDescription}
  </p>

  {#if bothActive}
    <div class="mt-3 rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
      <p class="font-medium text-base-content">Equação da Soma</p>
      <pre class="mt-2 whitespace-pre-wrap font-sans text-base-content/80">{combinedEquation}</pre>
    </div>

    <label class="form-control mt-3 max-w-xs">
      <span class="label-text">Multiplicador do Diagrama na Soma</span>
      <input
        class="input input-bordered input-sm w-28"
        type="number"
        step="0.1"
        data-testid="analysis-methodology-diagram-multiplier"
        bind:value={tableDisplay.sum_column.diagram_multiplier}
      />
    </label>
  {/if}

  {#if showFundamentalOptions}
    <div class="mt-4">
      <p class="text-xs font-semibold uppercase tracking-wide text-base-content/60">
        Pesos de viabilidade
      </p>
      <div class="mt-2 grid gap-3 sm:grid-cols-2">
        <label class="form-control">
          <span class="label-text">Peso AZULIM</span>
          <input
            class="input input-bordered input-sm"
            type="number"
            step="0.1"
            bind:value={tableDisplay.sum_column.viabilidade_weights.azulim}
          />
        </label>
        <label class="form-control">
          <span class="label-text">Peso VIÁVEL</span>
          <input
            class="input input-bordered input-sm"
            type="number"
            step="0.1"
            bind:value={tableDisplay.sum_column.viabilidade_weights.viavel}
          />
        </label>
        <label class="form-control">
          <span class="label-text">Peso ATENÇÃO</span>
          <input
            class="input input-bordered input-sm"
            type="number"
            step="0.1"
            bind:value={tableDisplay.sum_column.viabilidade_weights.atencao}
          />
        </label>
        <label class="form-control">
          <span class="label-text">Peso BOMBA</span>
          <input
            class="input input-bordered input-sm"
            type="number"
            step="0.1"
            bind:value={tableDisplay.sum_column.viabilidade_weights.bomba}
          />
        </label>
      </div>
    </div>
  {/if}
</div>

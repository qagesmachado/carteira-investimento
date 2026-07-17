<script lang="ts">
  import LucideIcon from '$lib/components/LucideIcon.svelte';
  import type { AnalysisMethodology, AnalysisProfileSlug } from '$lib/api/analysis';
  import {
    ANALYSIS_METHODOLOGY_OPTIONS,
    methodologyConfirmMessage
  } from './analysisMethodology';

  export let profileSlug: AnalysisProfileSlug;
  export let value: AnalysisMethodology = 'simples';
  export let disabled = false;
  export let onChange: (methodology: AnalysisMethodology) => void = () => undefined;

  $: options = ANALYSIS_METHODOLOGY_OPTIONS[profileSlug];

  function requestChange(next: AnalysisMethodology) {
    if (disabled || next === value) {
      return;
    }
    const option = options.find((item) => item.methodology === next);
    if (!option?.available) {
      return;
    }
    const message = methodologyConfirmMessage(value, next, profileSlug);
    if (message && !window.confirm(message)) {
      return;
    }
    onChange(next);
  }
</script>

<section
  class="rounded-xl border border-base-300/80 bg-gradient-to-br from-base-200/80 to-base-100/40 p-4"
  data-testid="analysis-methodology-selector"
>
  <p class="text-xs font-semibold uppercase tracking-wide text-base-content/60">
    Metodologia de análise
  </p>
  <p class="mt-1 text-sm text-base-content/70">
    Escolha como classificar e distribuir os ativos desta área na carteira ativa.
  </p>

  <div class="mt-4 grid gap-3 sm:grid-cols-2" data-testid="analysis-methodology-options">
    {#each options as option (option.methodology)}
      <button
        type="button"
        class="flex gap-3 rounded-xl border p-4 text-left transition-colors
          {value === option.methodology
          ? 'border-primary bg-primary/5'
          : 'border-base-300/80 bg-base-100/70 hover:border-primary/30'}
          {!option.available ? 'cursor-not-allowed opacity-50' : ''}"
        aria-pressed={value === option.methodology}
        disabled={disabled || !option.available}
        data-testid="analysis-methodology-option-{option.methodology}"
        title={option.available ? undefined : option.unavailableHint}
        on:click={() => requestChange(option.methodology)}
      >
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg
            {value === option.methodology ? 'bg-primary/15 text-primary' : 'bg-base-200 text-base-content/70'}"
          aria-hidden="true"
        >
          <LucideIcon name={option.methodology === 'auvp' ? 'Scale' : 'BadgePercent'} size="md" />
        </div>
        <div class="min-w-0">
          <p class="font-semibold text-base-content">{option.title}</p>
          <p class="mt-1 text-sm text-base-content/70">{option.description}</p>
          {#if !option.available && option.unavailableHint}
            <p class="mt-2 text-xs text-base-content/50">{option.unavailableHint}</p>
          {/if}
        </div>
      </button>
    {/each}
  </div>
</section>

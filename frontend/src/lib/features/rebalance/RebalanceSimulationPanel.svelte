<script lang="ts">
  import BrDecimalInput from '$lib/components/BrDecimalInput.svelte';
  import LucideIcon from '$lib/components/LucideIcon.svelte';
  import { formatBrl } from '$lib/features/rebalance/allocationTargets';
  import type { SimulationMode } from '$lib/features/rebalance/investmentAllocation';
  import {
    REBALANCE_CALCULATE_LUCIDE_ICON,
    REBALANCE_SETTINGS_LUCIDE_ICON,
    REBALANCE_SIMULATION_LUCIDE_ICON
  } from '$lib/icons/lucideIconCatalog';

  export let mode: SimulationMode = 'final_total';
  export let amountInput = 0;
  export let patrimonyBrl = 0;
  export let resolvedInvestmentBrl = 0;
  export let finalPatrimonyBrl: number | null = null;
  export let totalSuggestedContributionBrl: number | null = null;

  let amountField: BrDecimalInput;

  $: amountLabel =
    mode === 'final_total' ? 'Patrimônio final desejado' : 'Valor a investir';

  $: totalModeBelowPatrimony =
    mode === 'final_total' && amountInput > 0 && amountInput < patrimonyBrl;

  function setMode(nextMode: SimulationMode) {
    mode = nextMode;
  }

  function handleCalculate() {
    amountField?.flush();
  }
</script>

<div class="flex flex-col gap-4" data-testid="rebalance-simulation-panel">
  <div class="flex flex-wrap items-center justify-between gap-3">
    <div class="flex items-center gap-3">
      <div
        class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
        aria-hidden="true"
      >
        <LucideIcon name={REBALANCE_SIMULATION_LUCIDE_ICON} size="lg" />
      </div>
      <h2 class="text-lg font-semibold">Simular rebalanceamento</h2>
    </div>
    <a
      class="btn btn-ghost btn-sm gap-2"
      href="/rebalanceamento/configuracao"
      data-testid="rebalance-config-link"
    >
      <LucideIcon name={REBALANCE_SETTINGS_LUCIDE_ICON} size="md" />
      Configurar metas
    </a>
  </div>

  <div class="join w-fit" role="group" aria-label="Modo de simulação">
    <button
      type="button"
      class="btn btn-sm join-item"
      class:btn-primary={mode === 'final_total'}
      class:btn-outline={mode !== 'final_total'}
      data-testid="rebalance-simulation-mode-total"
      on:click={() => setMode('final_total')}
    >
      Por valor total
    </button>
    <button
      type="button"
      class="btn btn-sm join-item"
      class:btn-primary={mode === 'invest_amount'}
      class:btn-outline={mode !== 'invest_amount'}
      data-testid="rebalance-simulation-mode-invest"
      on:click={() => setMode('invest_amount')}
    >
      Por valor a investir
    </button>
  </div>

  <div class="flex flex-wrap items-end gap-3">
    <div class="min-w-[14rem] flex-1">
      <BrDecimalInput
        bind:this={amountField}
        bind:value={amountInput}
        label={amountLabel}
        inputClass="input input-bordered w-full max-w-xs text-right"
        testId="rebalance-simulation-amount"
      />
    </div>
    <button
      type="button"
      class="btn btn-primary gap-2"
      data-testid="rebalance-simulation-calculate"
      on:click={handleCalculate}
    >
      <LucideIcon name={REBALANCE_CALCULATE_LUCIDE_ICON} size="md" />
      Calcular aporte
    </button>
  </div>

  {#if totalModeBelowPatrimony}
    <p class="text-sm text-warning" data-testid="rebalance-simulation-total-warning">
      Patrimônio desejado menor que o atual — aporte calculado será R$ 0,00.
    </p>
  {/if}

  {#if resolvedInvestmentBrl > 0}
    <div class="flex flex-wrap gap-4 text-sm text-base-content/80">
      {#if mode === 'final_total'}
        <span data-testid="rebalance-simulation-resolved-investment">
          Aporte calculado: {formatBrl(resolvedInvestmentBrl)}
        </span>
      {/if}
      {#if finalPatrimonyBrl != null}
        <span data-testid="rebalance-simulation-final-patrimony">
          Patrimônio final: {formatBrl(finalPatrimonyBrl)}
        </span>
      {/if}
      {#if totalSuggestedContributionBrl != null}
        <span data-testid="rebalance-simulation-total-contribution">
          Aporte distribuído: {formatBrl(totalSuggestedContributionBrl)}
        </span>
      {/if}
    </div>
  {/if}
</div>

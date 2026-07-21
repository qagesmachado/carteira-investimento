<script lang="ts">
  import type { AssetPartition } from '$lib/api/objetivos';
  import { formatBrl } from '$lib/features/rebalance/allocationTargets';

  import {
    buildPurposeRows,
    computeExcludedRebalanceBrl,
    computeInvestmentValueBrl,
    hasPurposeBreakdown
  } from './positionPurpose';

  export let partition: AssetPartition | null = null;
  export let positionCurrentBrl: number | null = null;

  $: purposeRows = buildPurposeRows(partition ?? undefined);
  $: excludedBrl = computeExcludedRebalanceBrl(partition ?? undefined);
  $: investmentBrl = computeInvestmentValueBrl(positionCurrentBrl, excludedBrl);
  $: showSection = hasPurposeBreakdown(partition ?? undefined);
</script>

{#if showSection}
  <section
    class="min-w-0 border-y border-base-300/60 py-3"
    data-testid="position-purpose-section"
  >
    <div class="mb-2 flex flex-wrap items-baseline justify-between gap-2">
      <h3 class="text-xs font-semibold uppercase tracking-wide text-base-content/70">
        Finalidades
      </h3>
      <a class="link link-primary text-xs" href="/objetivos">Configurar em Objetivos</a>
    </div>

    {#if investmentBrl != null}
      <p class="mb-2 text-sm text-base-content/80">
        <span class="font-medium">No rebalanceamento:</span>
        {formatBrl(investmentBrl)}
        {#if excludedBrl > 0}
          <span class="text-base-content/60"> (excluído {formatBrl(excludedBrl)})</span>
        {/if}
      </p>
    {/if}

    <ul class="space-y-2">
      {#each purposeRows as row (`${row.objectiveId}-${row.sliceName}`)}
        <li class="flex flex-wrap items-baseline justify-between gap-2 rounded-md bg-base-200/30 px-3 py-2 text-sm">
          <div class="flex flex-wrap items-center gap-2">
            <span class="font-medium">{row.sliceName}</span>
            {#if row.excludeFromRebalance}
              <span class="badge badge-ghost badge-sm">Não investimento</span>
            {/if}
            {#if row.isEmergencyReserve}
              <span class="badge badge-ghost badge-sm">Reserva emergência</span>
            {/if}
          </div>
          <span class="tabular-nums">{formatBrl(row.currentValueBrl)}</span>
        </li>
      {/each}
    </ul>
  </section>
{/if}

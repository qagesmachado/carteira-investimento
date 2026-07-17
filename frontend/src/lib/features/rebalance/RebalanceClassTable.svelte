<script lang="ts">
  import type { ClassRebalanceRow } from '$lib/api/rebalance';
  import LucideIcon from '$lib/components/LucideIcon.svelte';
  import DismissibleAlert from '$lib/components/DismissibleAlert.svelte';
  import {
    displayClassIconFgClass,
    displayClassIconSurfaceClass,
    lucideIconForDisplayClass
  } from '$lib/features/dashboard/displayClassLucideIcons';
  import { formatBrl, formatPercent } from '$lib/features/rebalance/allocationTargets';
  import {
    sumClassRebalanceCurrentPercent,
    sumClassRebalanceCurrentValueBrl,
    sumClassRebalanceTargetPercent,
    sumClassRebalanceTargetValueBrl
  } from '$lib/features/rebalance/rebalanceVisibility';
  import { filterClassRebalanceRows } from '$lib/features/rebalance/filterRebalanceRows';
  import type { ClassAllocationRow } from '$lib/features/rebalance/investmentAllocation';
  import RebalanceTableFilter from '$lib/features/rebalance/RebalanceTableFilter.svelte';
  import {
    computePercentDeviation,
    computeValueDeviationBrl,
    deviationTone,
    formatSignedBrl,
    formatSignedPercent
  } from '$lib/features/rebalance/formatRebalanceDeviation';

  export let classes: ClassRebalanceRow[] = [];
  export let patrimonyBrl = 0;
  export let totalGapBrl = 0;
  export let includedClasses: Record<string, boolean> = {};
  export let includedClassCount = 0;
  export let allocationByClass: Map<string, ClassAllocationRow> = new Map();
  export let finalPatrimonyBrl: number | null = null;
  export let hasActiveSimulation = false;

  export let onClassInclusionChange: (displayClass: string, event: Event) => void = () => undefined;

  let filterText = '';

  $: filteredClasses = filterClassRebalanceRows(classes, filterText);
  $: totalTargetPercent = sumClassRebalanceTargetPercent(filteredClasses);
  $: totalCurrentPercent = sumClassRebalanceCurrentPercent(filteredClasses);
  $: totalCurrentValueBrl = sumClassRebalanceCurrentValueBrl(filteredClasses);
  $: totalTargetValueBrl = sumClassRebalanceTargetValueBrl(filteredClasses);
</script>

<div class="flex flex-col gap-4">
  <div class="flex flex-wrap items-end justify-between gap-3">
    <p class="text-sm text-base-content/70">
      Patrimônio (balanceamento): <span class="font-medium text-base-content">{formatBrl(patrimonyBrl)}</span>
      — previdência e outros excluídos da soma
    </p>
    <RebalanceTableFilter
      bind:value={filterText}
      label="Filtrar classe"
      placeholder="Nome da classe"
      testId="rebalance-class-filter"
    />
  </div>

  {#if hasActiveSimulation && includedClassCount === 0}
    <DismissibleAlert
      variant="warning"
      text="Selecione ao menos uma classe para distribuir o aporte."
    />
  {/if}

  <div
    class="w-full min-w-0 overflow-x-auto rounded-lg border border-base-300 bg-base-100 p-3 sm:px-4 sm:py-4"
    data-testid="rebalance-class-table"
  >
    <table class="table table-sm w-full min-w-[56rem]">
      <thead>
        <tr class="text-base-content/70">
          <th class="w-10">
            <span class="sr-only">Incluir no aporte</span>
          </th>
          <th>Classe</th>
          <th class="text-right">Meta %</th>
          <th class="text-right">% Atual</th>
          <th class="text-right">Desvio %</th>
          <th class="text-right">Valor atual</th>
          <th class="text-right">Valor alvo</th>
          <th class="text-right">Desvio R$</th>
          <th class="text-right">Faltando</th>
          <th class="text-right min-w-[10rem]">Deveria ter</th>
          <th class="text-right min-w-[10rem]">Aporte sugerido</th>
        </tr>
      </thead>
      <tbody>
        {#each filteredClasses as row (row.display_class)}
          {@const allocation = allocationByClass.get(row.display_class)}
          {@const deviationPercent = computePercentDeviation(row.current_percent, row.target_percent)}
          {@const deviationBrl = computeValueDeviationBrl(row.current_value_brl, row.target_value_brl)}
          {@const iconName = lucideIconForDisplayClass(row.display_class)}
          {@const iconFg = displayClassIconFgClass(row.display_class)}
          {@const iconBg = displayClassIconSurfaceClass(row.display_class)}
          <tr class="hover:bg-base-200/40">
            <td>
              <input
                type="checkbox"
                class="checkbox checkbox-sm checkbox-primary"
                checked={includedClasses[row.display_class] !== false}
                aria-label="Incluir {row.label} no aporte"
                disabled={includedClasses[row.display_class] !== false && includedClassCount <= 1}
                on:change={(event) => onClassInclusionChange(row.display_class, event)}
              />
            </td>
            <td>
              <div class="flex items-center gap-2.5">
                <span
                  class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg {iconBg}"
                  aria-hidden="true"
                >
                  <LucideIcon name={iconName} size="sm" class={iconFg} />
                </span>
                <span class="font-medium">{row.label}</span>
              </div>
            </td>
            <td class="text-right tabular-nums">{formatPercent(row.target_percent)}</td>
            <td class="text-right tabular-nums">{formatPercent(row.current_percent)}</td>
            <td class="text-right tabular-nums {deviationTone(deviationPercent)}">
              {formatSignedPercent(deviationPercent)}
            </td>
            <td class="text-right tabular-nums">{formatBrl(row.current_value_brl)}</td>
            <td class="text-right tabular-nums">{formatBrl(row.target_value_brl)}</td>
            <td class="text-right tabular-nums {deviationTone(deviationBrl)}">
              {formatSignedBrl(deviationBrl)}
            </td>
            <td class="text-right tabular-nums">{formatBrl(row.gap_brl)}</td>
            <td class="text-right tabular-nums">
              {formatBrl(allocation?.idealTargetBrl ?? null)}
            </td>
            <td class="text-right tabular-nums">
              {formatBrl(allocation?.suggestedContributionBrl ?? null)}
            </td>
          </tr>
        {:else}
          <tr>
            <td colspan="11" class="text-center text-sm text-base-content/60">
              Nenhuma classe corresponde ao filtro.
            </td>
          </tr>
        {/each}
        {#if filteredClasses.length > 0}
          <tr class="border-t-2 border-base-300 font-semibold">
            <td></td>
            <td>TOTAL</td>
            <td class="text-right tabular-nums">{formatPercent(totalTargetPercent)}</td>
            <td class="text-right tabular-nums">{formatPercent(totalCurrentPercent)}</td>
            <td class="text-right">—</td>
            <td class="text-right tabular-nums">{formatBrl(totalCurrentValueBrl)}</td>
            <td class="text-right tabular-nums">{formatBrl(totalTargetValueBrl)}</td>
            <td class="text-right">—</td>
            <td class="text-right tabular-nums">{formatBrl(totalGapBrl)}</td>
            <td class="text-right tabular-nums">
              {formatBrl(finalPatrimonyBrl)}
            </td>
            <td class="text-right">—</td>
          </tr>
        {/if}
      </tbody>
    </table>
  </div>
</div>

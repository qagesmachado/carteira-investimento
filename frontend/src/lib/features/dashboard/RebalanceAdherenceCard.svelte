<script lang="ts">
  import { formatGapBelowTarget, type RebalanceAdherenceInsight } from './rebalanceAdherence';

  export let insight: RebalanceAdherenceInsight;
  export let loading = false;

  const circumference = 2 * Math.PI * 36;

  $: strokeOffset = circumference - (insight.adherencePercent / 100) * circumference;
  $: ringColor =
    insight.adherencePercent >= 80
      ? 'text-success'
      : insight.adherencePercent >= 50
        ? 'text-warning'
        : 'text-error';
  $: rebalanceHref = insight.hasTargets ? '/rebalanceamento' : '/rebalanceamento/configuracao';
</script>

<div class="card bg-base-100 shadow" data-testid="dashboard-highlight-adherence">
  <div class="card-body flex-row items-center gap-4 p-4">
    <div class="relative h-20 w-20 shrink-0" aria-hidden="true">
      <svg class="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="36" class="stroke-base-200" stroke-width="8" fill="none" />
        <circle
          cx="40"
          cy="40"
          r="36"
          class="stroke-current {ringColor}"
          stroke-width="8"
          fill="none"
          stroke-linecap="round"
          stroke-dasharray={circumference}
          stroke-dashoffset={strokeOffset}
        />
      </svg>
      <span class="absolute inset-0 flex items-center justify-center text-lg font-bold {ringColor}">
        {#if loading}
          …
        {:else}
          {insight.adherencePercent}%
        {/if}
      </span>
    </div>
    <div class="min-w-0 flex-1">
      <p class="text-sm font-semibold">Aderência ao rebalanceamento</p>
      <div class="mt-1 flex items-center justify-between gap-3">
        <div class="min-w-0">
          {#if insight.statusMessage}
            <p class="text-sm text-base-content/70">{insight.statusMessage}</p>
          {:else if insight.belowTargetItems.length > 0}
            <table
              class="w-auto max-w-full border-collapse text-sm text-base-content/70"
              data-testid="dashboard-adherence-below-target"
            >
              <tbody>
                {#each insight.belowTargetItems as item (item.classLabel)}
                  <tr>
                    <td class="whitespace-nowrap pr-2 align-top">{item.classLabel}</td>
                    <td class="whitespace-nowrap pr-1 align-top text-right tabular-nums">
                      {formatGapBelowTarget(item.gapPercent)}
                    </td>
                    <td class="whitespace-nowrap align-top">abaixo da meta</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          {/if}
        </div>
        <a
          class="btn btn-outline btn-sm shrink-0"
          href={rebalanceHref}
          data-testid="dashboard-adherence-action"
        >
          Conferir rebalanceamento
        </a>
      </div>
    </div>
  </div>
</div>

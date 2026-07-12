<script lang="ts">
  import LucideIcon from '$lib/components/LucideIcon.svelte';
  import { FEATURED_CLASS_LUCIDE_ICON } from '$lib/icons/lucideIconCatalog';

  import {
    FEATURED_CLASS_MEDAL_ACCENTS,
    type ClassGrossReturnRow,
    featuredClassConsolidadaHref,
    formatGrossReturnPercent,
    grossReturnPercentClass
  } from './portfolioDashboard';

  export let rows: ClassGrossReturnRow[] = [];
</script>

<div class="card bg-base-100 shadow" data-testid="dashboard-highlight-class">
  <div class="card-body gap-3 p-5">
    <div>
      <p class="text-sm font-medium text-base-content/70">Classe em destaque</p>
      <p class="text-xs text-base-content/60">Maior rendimento bruto</p>
    </div>
    {#if rows.length > 0}
      <ul class="space-y-2" data-testid="dashboard-featured-class-list">
        {#each rows as row, index (row.displayClass)}
          {@const accent = FEATURED_CLASS_MEDAL_ACCENTS[index]}
          <li>
            <a
              class="flex items-center gap-3 rounded-lg transition hover:bg-base-200/60"
              href={featuredClassConsolidadaHref(row.displayClass)}
              data-testid="dashboard-featured-class-row-{index + 1}"
            >
              <div
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl {accent.bgClass} {accent.fgClass}"
                aria-hidden="true"
              >
                <LucideIcon name={FEATURED_CLASS_LUCIDE_ICON} size="md" class={accent.fgClass} />
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center justify-between gap-3">
                  <span class="truncate text-sm font-medium">{row.label}</span>
                  <span class="shrink-0 text-sm font-bold tabular-nums {grossReturnPercentClass(row.profitPercent)}">
                    {formatGrossReturnPercent(row.profitPercent)}
                  </span>
                </div>
              </div>
            </a>
          </li>
        {/each}
      </ul>
    {:else}
      <p class="text-sm text-base-content/60">Sem posições com rendimento calculável</p>
    {/if}
  </div>
</div>

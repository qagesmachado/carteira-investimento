<script lang="ts">
  import type { CriterionDefinition, SegmentCatalogEntry } from '$lib/api/analysis';
  import {
    buildFundamentalPreviewItems,
    isNeutralPreviewColor
  } from '$lib/features/analise/fundamentalPreview';

  export let indicatorCodes: readonly string[] = [];
  export let criteria: CriterionDefinition[] = [];
  export let scores: Record<string, number | null> = {};
  export let segments: SegmentCatalogEntry[] = [];
  export let scoreRefs: Record<string, string | null> = {};

  $: items = buildFundamentalPreviewItems(indicatorCodes, criteria, scores, {
    segments,
    scoreRefs
  });
</script>

<div class="mt-4 rounded-lg border border-base-300 bg-base-200/50 p-4" data-testid="fundamental-preview">
  <div class="grid gap-3 sm:grid-cols-2">
    {#each items as item (item.code)}
      <div class="rounded-lg border border-base-300 bg-base-100 p-3" data-testid={`preview-${item.code}`}>
        <div class="flex items-center gap-2">
          <span
            class="inline-block h-3 w-3 rounded-full"
            class:bg-success={item.color === 'viavel'}
            class:bg-warning={item.color === 'atencao'}
            class:bg-error={item.color === 'bomba'}
            class:bg-neutral={isNeutralPreviewColor(item.color)}
          ></span>
          <span class="text-xs font-bold uppercase tracking-wide">{item.label}</span>
        </div>
        <p class="mt-2 text-sm" data-testid={`preview-${item.code}-text`}>{item.characteristic}</p>
      </div>
    {/each}
  </div>
</div>

<script lang="ts">
  import LucideIcon from '$lib/components/LucideIcon.svelte';

  import { FEATURED_CLASS_MEDAL_ACCENTS } from './portfolioDashboard';

  export let rank: number;

  $: medalAccent = rank >= 1 && rank <= 3 ? FEATURED_CLASS_MEDAL_ACCENTS[rank - 1] : null;
</script>

{#if medalAccent}
  <div
    class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full {medalAccent.bgClass} {medalAccent.fgClass}"
    data-testid="dashboard-top-rank-{rank}"
    aria-label="Posição {rank}"
  >
    <LucideIcon name="Medal" size="sm" class={medalAccent.fgClass} />
  </div>
{:else}
  <span
    class="inline-flex h-7 w-7 shrink-0 items-center justify-center text-sm tabular-nums text-base-content/60"
    data-testid="dashboard-top-rank-{rank}"
    aria-label="Posição {rank}"
  >
    {rank}
  </span>
{/if}

<script lang="ts">
  import LucideIcon from '$lib/components/LucideIcon.svelte';
  import type { SortDirection } from '$lib/features/analise/sortAnalysisRows';

  export let active = false;
  export let direction: SortDirection = 'asc';
</script>

{#if active}
  <LucideIcon
    name={direction === 'asc' ? 'ArrowUp' : 'ArrowDown'}
    size="sm"
    class="opacity-90"
  />
{/if}

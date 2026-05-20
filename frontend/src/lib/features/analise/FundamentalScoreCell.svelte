<script lang="ts">
  import {
    formatFundamentalScoreValue,
    fundamentalScoreColorClass
  } from './fundamentalScoreCell';

  export let value: number | null | undefined = null;
</script>

{#if value == null}
  <span class="text-base-content/60">—</span>
{:else}
  <div
    class="mx-auto inline-flex h-7 min-w-[1.75rem] items-center justify-center rounded px-1 text-sm font-semibold {fundamentalScoreColorClass(
      value
    )}"
  >
    {formatFundamentalScoreValue(value)}
  </div>
{/if}

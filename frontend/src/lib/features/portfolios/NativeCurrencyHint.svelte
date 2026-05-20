<script lang="ts">
  import type { Asset } from '$lib/api/assets';
  import {
    nativeCurrencyHintLabel,
    shouldShowNativeCurrencyHint
  } from '$lib/features/portfolios/positionMetrics';

  export let asset: Asset;
  export let nativeValue: number | null;

  $: visible = shouldShowNativeCurrencyHint(asset, nativeValue);
  $: tip = visible && nativeValue != null ? nativeCurrencyHintLabel(asset, nativeValue) : '';
</script>

{#if visible && tip}
  <span class="group relative inline-flex shrink-0 align-middle">
    <button
      type="button"
      class="inline-flex h-5 w-5 cursor-help items-center justify-center rounded-full border-2 border-info bg-info/15 text-[10px] font-bold leading-none text-info"
      aria-label={tip}
      on:click|preventDefault|stopPropagation
    >$</button>
    <span
      role="tooltip"
      class="pointer-events-none invisible absolute bottom-full right-0 z-[200] mb-1 box-border w-max whitespace-nowrap rounded-md border border-base-300 bg-base-100 px-2.5 py-1.5 text-left text-xs font-normal normal-case leading-snug text-base-content opacity-0 shadow-lg group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
    >
      {tip}
    </span>
  </span>
{/if}

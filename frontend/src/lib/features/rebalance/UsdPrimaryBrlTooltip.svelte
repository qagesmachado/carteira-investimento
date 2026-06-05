<script lang="ts">
  import { formatMoneyAmount } from '$lib/assetLabels';

  import { brlToUsd } from './convertRebalanceMoney';

  /** Valor armazenado/calculado em BRL (API de rebalanceamento). */
  export let brlValue: number | null | undefined = null;
  export let usdBrlRate: number | null | undefined = null;

  $: usdValue = brlToUsd(brlValue, usdBrlRate);
  $: primaryLabel = usdValue != null ? formatMoneyAmount(usdValue, 'USD') : '—';
  $: brlLabel =
    brlValue != null && Number.isFinite(brlValue) ? formatMoneyAmount(brlValue, 'BRL') : '';
  $: showTooltip = usdValue != null && brlLabel !== '';
</script>

{#if showTooltip}
  <span class="group relative inline-block max-w-full">
    <span
      tabindex="0"
      class="cursor-help border-b border-dotted border-base-content/40"
      aria-label="{primaryLabel} — equivalente {brlLabel}"
    >
      {primaryLabel}
    </span>
    <span
      role="tooltip"
      class="pointer-events-none invisible absolute bottom-full right-0 z-[200] mb-1 box-border w-max max-w-[16rem] whitespace-nowrap rounded-md border border-base-300 bg-base-100 px-2.5 py-1.5 text-left text-xs font-normal normal-case leading-snug text-base-content opacity-0 shadow-lg group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
    >
      {brlLabel}
    </span>
  </span>
{:else}
  {primaryLabel}
{/if}

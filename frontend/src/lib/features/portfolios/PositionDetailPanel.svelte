<script lang="ts">
  import type { Asset } from '$lib/api/assets';
  import type { Position } from '$lib/api/portfolios';

  import { buildPositionDetailSections } from './positionDetail';

  export let position: Position;
  export let asset: Asset;
  export let usdBrlRate: number | null | undefined = undefined;
  export let panelId = 'position-detail-panel';
  /** Resumo de proventos do ativo (somente consolidada). */
  export let dividendsSummary: string | undefined = undefined;
  /** `portfolio`: /portfolios — sem hints BRL; `consolidated`: /portfolios/consolidada */
  export let variant: 'portfolio' | 'consolidated' = 'portfolio';

  $: sections = buildPositionDetailSections(position, asset, {
    usdBrlRate: variant === 'consolidated' ? usdBrlRate : undefined,
    showBrlEquivalentHints: variant === 'consolidated',
    dividendsSummary: variant === 'consolidated' ? dividendsSummary : undefined
  });

  $: isConsolidated = variant === 'consolidated';

  $: outerGridClass = isConsolidated
    ? 'grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-6 xl:grid-cols-[1.1fr_1.1fr_minmax(12rem,0.9fr)]'
    : 'grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3';

  $: metricsGridClass = isConsolidated
    ? 'grid grid-cols-1 gap-x-6 gap-y-3 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
    : 'flex flex-wrap gap-x-6 gap-y-4';

  $: metricItemClass = isConsolidated ? 'min-w-0' : 'min-w-[10.5rem] max-w-full flex-[1_1_10.5rem]';

  $: metaGridClass = isConsolidated
    ? 'grid grid-cols-1 gap-x-6 gap-y-3 min-[480px]:grid-cols-2 lg:grid-cols-3'
    : 'flex flex-wrap gap-x-6 gap-y-4';

  $: sectionDividerClass = isConsolidated
    ? 'lg:border-r lg:border-base-300/60 lg:pr-6'
    : '';
</script>

<div
  id={panelId}
  class="rounded-lg border border-base-300 bg-base-100 px-4 py-3 text-sm"
  role="region"
>
  <div class={outerGridClass}>
    {#if sections.pricing.length > 0}
      <section class="min-w-0 {sectionDividerClass}">
        <h3 class="mb-2 text-xs font-semibold uppercase tracking-wide text-base-content/70">
          Preços e quantidade
        </h3>
        <dl class={metricsGridClass}>
          {#each sections.pricing as item}
            <div class={metricItemClass}>
              <dt class="text-xs font-medium uppercase tracking-wide text-base-content/60">
                {item.label}
              </dt>
              <dd class="mt-0.5 break-words text-base font-medium tabular-nums text-base-content">
                {item.value}
              </dd>
              {#if item.hint}
                <dd class="mt-0.5 break-words text-xs leading-snug text-base-content/60">
                  {item.hint}
                </dd>
              {/if}
            </div>
          {/each}
        </dl>
      </section>
    {/if}

    {#if sections.totals.length > 0}
      <section
        class="min-w-0 {sectionDividerClass}"
        class:lg:border-r-0={isConsolidated && sections.metadata.length === 0}
      >
        <h3 class="mb-2 text-xs font-semibold uppercase tracking-wide text-base-content/70">
          Totais da posição
        </h3>
        <dl class={metricsGridClass}>
          {#each sections.totals as item}
            <div class={metricItemClass}>
              <dt class="text-xs font-medium uppercase tracking-wide text-base-content/60">
                {item.label}
              </dt>
              <dd class="mt-0.5 break-words text-base font-medium tabular-nums text-base-content">
                {item.value}
              </dd>
              {#if item.hint}
                <dd class="mt-0.5 break-words text-xs leading-snug text-base-content/60">
                  {item.hint}
                </dd>
              {/if}
            </div>
          {/each}
        </dl>
      </section>
    {/if}

    {#if sections.metadata.length > 0}
      <section
        class="min-w-0"
        class:md:col-span-2={!isConsolidated}
        class:xl:col-span-1={!isConsolidated}
      >
        <h3 class="mb-2 text-xs font-semibold uppercase tracking-wide text-base-content/70">
          Informações adicionais
        </h3>
        <dl class={metaGridClass}>
          {#each sections.metadata as item}
            <div class={metricItemClass}>
              <dt class="text-xs font-medium uppercase tracking-wide text-base-content/60">
                {item.label}
              </dt>
              <dd class="mt-0.5 break-words text-base font-medium text-base-content">{item.value}</dd>
            </div>
          {/each}
        </dl>
      </section>
    {/if}
  </div>

  <div class="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1 border-t border-base-300 pt-3">
    <h3 class="text-xs font-semibold uppercase tracking-wide text-base-content/70">Proventos</h3>
    <p class="text-base-content/70">
      <span class="font-medium">{sections.dividendsLabel}:</span>
      <span class="italic">{sections.dividendsValue}</span>
    </p>
  </div>
</div>

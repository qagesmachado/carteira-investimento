<script lang="ts">
  import LucideIcon from '$lib/components/LucideIcon.svelte';
  import {
    displayClassIconFgClass,
    lucideIconForDisplayClass
  } from '$lib/features/dashboard/displayClassLucideIcons';
  import { allocationBarClassForDisplayClass } from '$lib/features/dashboard/allocationChartColors';
  import { resolveSuggestedAllocation } from '$lib/features/portfolios/portfolioAllocationDisplay';

  export let allocationTargetsJson: string | null | undefined = null;
  /** compact: cards do hub; preview: modal Nova carteira; detailed: modal Editar */
  export let variant: 'compact' | 'preview' | 'detailed' = 'compact';
  /** Força rótulo do perfil (ex.: Personalizado no modal de criação). */
  export let profileLabelOverride: string | null = null;

  $: allocation = resolveSuggestedAllocation({ allocationTargetsJson });
  $: profileLabel = profileLabelOverride ?? allocation.profileLabel;
  $: showClassGrid = variant === 'preview' || variant === 'detailed';

  function iconSurfaceClass(displayClass: string): string {
    return `${allocationBarClassForDisplayClass(displayClass)}/15`;
  }
</script>

<section
  class="rounded-xl border border-base-300/80 bg-gradient-to-br from-base-200/80 to-base-100/40 p-4"
  data-testid="portfolio-hub-allocation"
  data-allocation-variant={variant}
>
  {#if variant === 'compact'}
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="min-w-0">
        <p class="text-xs font-semibold uppercase tracking-wide text-base-content/60">
          Balanceamento sugerido
        </p>
        <p class="mt-1 text-sm text-base-content/80">
          Perfil <span class="font-semibold text-base-content">{profileLabel}</span>
          {#if !allocation.hasStoredTargets}
            <span class="text-base-content/60"> (metas padrão)</span>
          {/if}
        </p>
      </div>
      <a
        class="btn btn-outline btn-sm shrink-0"
        href="/rebalanceamento"
        data-testid="portfolio-hub-rebalance-link"
      >
        Rebalanceamento
      </a>
    </div>
  {:else}
    <div>
      <p class="text-xs font-semibold uppercase tracking-wide text-base-content/60">
        Balanceamento sugerido
      </p>
      <p class="mt-1 text-sm text-base-content/80">
        Perfil <span class="font-semibold text-base-content">{profileLabel}</span>
        {#if !allocation.hasStoredTargets}
          <span class="text-base-content/60"> (metas padrão)</span>
        {/if}
      </p>
    </div>

    {#if showClassGrid}
      <div
        class="mt-4 grid gap-2 sm:grid-cols-2 {variant === 'preview'
          ? 'lg:grid-cols-3 xl:grid-cols-5'
          : ''}"
      >
        {#each allocation.classRows as row (row.key)}
          {@const iconName = lucideIconForDisplayClass(row.key)}
          {@const iconFg = displayClassIconFgClass(row.key)}
          {@const iconBg = iconSurfaceClass(row.key)}
          {@const barClass = allocationBarClassForDisplayClass(row.key)}
          <article
            class="rounded-lg border border-base-300/60 bg-base-100/70 p-3 shadow-sm"
            data-testid="portfolio-allocation-{row.key}"
          >
            <div class="flex items-start gap-2.5">
              <div
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg {iconBg}"
                aria-hidden="true"
              >
                <LucideIcon name={iconName} size="sm" class={iconFg} />
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate text-xs text-base-content/70">{row.label}</p>
                <p class="text-base font-semibold tabular-nums text-base-content">{row.percent}</p>
              </div>
            </div>
            <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-base-300/70" aria-hidden="true">
              <div class="h-full rounded-full {barClass}" style="width: {row.value}%"></div>
            </div>
          </article>
        {/each}
      </div>
    {/if}

    {#if variant === 'detailed'}
      <p class="mt-3 text-xs text-base-content/60">
        Para alterar percentuais ou a relação ETF/Ação, use Rebalanceamento → Configuração.
      </p>
      <a
        class="btn btn-outline btn-sm mt-2"
        href="/rebalanceamento"
        data-testid="portfolio-hub-rebalance-link"
      >
        Abrir rebalanceamento
      </a>
    {/if}
  {/if}
</section>

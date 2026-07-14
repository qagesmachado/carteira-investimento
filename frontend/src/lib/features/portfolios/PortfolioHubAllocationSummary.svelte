<script lang="ts">
  import LucideIcon from '$lib/components/LucideIcon.svelte';
  import {
    displayClassIconFgClass,
    lucideIconForDisplayClass
  } from '$lib/features/dashboard/displayClassLucideIcons';
  import { allocationBarClassForDisplayClass } from '$lib/features/dashboard/allocationChartColors';
  import { resolveSuggestedAllocation } from '$lib/features/portfolios/portfolioAllocationDisplay';

  export let allocationTargetsJson: string | null | undefined = null;
  /** compact: hub; preview: criar; detailed: editar; inlineMedium: posições; detailedCompact: legado; inline: legado */
  export let variant: 'compact' | 'preview' | 'detailed' | 'detailedCompact' | 'inlineMedium' | 'inline' = 'compact';
  export let profileLabelOverride: string | null = null;

  $: allocation = resolveSuggestedAllocation({ allocationTargetsJson });
  $: profileLabel = profileLabelOverride ?? allocation.profileLabel;
  $: showClassGrid =
    variant === 'preview' || variant === 'detailed' || variant === 'detailedCompact';
  $: isCompactGrid = variant === 'detailedCompact';

  function iconSurfaceClass(displayClass: string): string {
    return `${allocationBarClassForDisplayClass(displayClass)}/15`;
  }
</script>

<section
  class="rounded-xl border border-base-300/80 bg-gradient-to-br from-base-200/80 to-base-100/40 {variant ===
    'inline' || variant === 'inlineMedium'
    ? 'p-3'
    : isCompactGrid
      ? 'w-fit max-w-full p-2.5'
      : 'p-4'}"
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
  {:else if variant === 'inlineMedium'}
    <div class="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:gap-x-4">
      <div class="min-w-0 shrink-0">
        <p class="text-xs font-semibold uppercase tracking-wide text-base-content/60">
          Balanceamento sugerido
        </p>
        <p class="mt-0.5 text-sm text-base-content/80">
          Perfil <span class="font-semibold text-base-content">{profileLabel}</span>
          {#if !allocation.hasStoredTargets}
            <span class="text-base-content/60"> (metas padrão)</span>
          {/if}
        </p>
      </div>

      <div
        class="flex min-w-0 flex-1 flex-wrap items-center gap-2"
        data-testid="portfolio-allocation-inline-medium"
      >
        {#each allocation.classRows as row (row.key)}
          {@const iconName = lucideIconForDisplayClass(row.key)}
          {@const iconFg = displayClassIconFgClass(row.key)}
          {@const iconBg = iconSurfaceClass(row.key)}
          {@const barClass = allocationBarClassForDisplayClass(row.key)}
          <span
            class="inline-flex items-center gap-2 rounded-lg border border-base-300/60 bg-base-100/80 px-2.5 py-1.5 text-sm"
            data-testid="portfolio-allocation-{row.key}"
            title="{row.label}: {row.percent}"
          >
            <span
              class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md {iconBg}"
              aria-hidden="true"
            >
              <LucideIcon name={iconName} size="sm" class={iconFg} />
            </span>
            <span class="hidden max-w-[6.5rem] truncate text-base-content/70 md:inline">{row.label}</span>
            <span class="font-semibold tabular-nums text-base-content">{row.percent}</span>
            <span
              class="ml-0.5 h-1 w-10 overflow-hidden rounded-full bg-base-300/70"
              aria-hidden="true"
            >
              <span class="block h-full rounded-full {barClass}" style="width: {row.value}%"></span>
            </span>
          </span>
        {/each}
      </div>

      <a
        class="btn btn-outline btn-sm shrink-0 self-start lg:self-center"
        href="/rebalanceamento"
        data-testid="portfolio-hub-rebalance-link"
      >
        Abrir rebalanceamento
      </a>
    </div>
  {:else if variant === 'inline'}
    <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
      <div class="flex min-w-0 shrink-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <p class="text-xs font-semibold uppercase tracking-wide text-base-content/60">
          Balanceamento sugerido
        </p>
        <p class="text-sm text-base-content/80">
          Perfil <span class="font-semibold text-base-content">{profileLabel}</span>
          {#if !allocation.hasStoredTargets}
            <span class="text-base-content/60"> (metas padrão)</span>
          {/if}
        </p>
      </div>

      <div class="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
        {#each allocation.classRows as row (row.key)}
          {@const iconName = lucideIconForDisplayClass(row.key)}
          {@const iconFg = displayClassIconFgClass(row.key)}
          {@const iconBg = iconSurfaceClass(row.key)}
          {@const barClass = allocationBarClassForDisplayClass(row.key)}
          <span
            class="inline-flex items-center gap-1 rounded-md border border-base-300/60 bg-base-100/80 px-2 py-1 text-xs"
            data-testid="portfolio-allocation-{row.key}"
            title="{row.label}: {row.percent}"
          >
            <span
              class="flex h-5 w-5 shrink-0 items-center justify-center rounded {iconBg}"
              aria-hidden="true"
            >
              <LucideIcon name={iconName} size="sm" class={iconFg} />
            </span>
            <span class="hidden max-w-[5rem] truncate text-base-content/70 sm:inline">{row.label}</span>
            <span class="font-semibold tabular-nums text-base-content">{row.percent}</span>
            <span
              class="ml-0.5 h-1 w-6 overflow-hidden rounded-full bg-base-300/70"
              aria-hidden="true"
            >
              <span class="block h-full rounded-full {barClass}" style="width: {row.value}%"></span>
            </span>
          </span>
        {/each}
      </div>

      <a
        class="btn btn-outline btn-xs shrink-0"
        href="/rebalanceamento"
        data-testid="portfolio-hub-rebalance-link"
      >
        Abrir rebalanceamento
      </a>
    </div>
  {:else}
    {#if isCompactGrid}
      <div class="min-w-0">
        <p class="text-xs font-semibold uppercase tracking-wide text-base-content/60">
          Balanceamento sugerido
        </p>
        <p class="mt-0.5 text-xs text-base-content/80">
          Perfil <span class="font-semibold text-base-content">{profileLabel}</span>
          {#if !allocation.hasStoredTargets}
            <span class="text-base-content/60"> (metas padrão)</span>
          {/if}
        </p>
      </div>
    {:else}
      <div class="flex flex-wrap items-start justify-between gap-2">
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
      </div>
    {/if}

    {#if showClassGrid}
      <div
        class="{isCompactGrid
          ? 'mt-2 grid w-fit max-w-full grid-cols-3 gap-1.5'
          : variant === 'preview'
            ? 'mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'
            : 'mt-4 grid gap-2 sm:grid-cols-2'}"
        data-testid={isCompactGrid ? 'portfolio-allocation-compact-grid' : undefined}
      >
        {#each allocation.classRows as row (row.key)}
          {@const iconName = lucideIconForDisplayClass(row.key)}
          {@const iconFg = displayClassIconFgClass(row.key)}
          {@const iconBg = iconSurfaceClass(row.key)}
          {@const barClass = allocationBarClassForDisplayClass(row.key)}
          <article
            class="rounded-md border border-base-300/60 bg-base-100/70 shadow-sm {isCompactGrid
              ? 'w-[6.5rem] p-1.5'
              : 'rounded-lg p-3'}"
            data-testid="portfolio-allocation-{row.key}"
          >
            <div class="flex items-center gap-1">
              <div
                class="flex shrink-0 items-center justify-center rounded-md {iconBg} {isCompactGrid
                  ? 'h-5 w-5'
                  : 'h-9 w-9 rounded-lg'}"
                aria-hidden="true"
              >
                <LucideIcon name={iconName} size="sm" class={iconFg} />
              </div>
              <div class="min-w-0 flex-1">
                <p
                  class="truncate text-[10px] leading-tight text-base-content/70 {isCompactGrid
                    ? ''
                    : 'sm:text-xs'}"
                >
                  {row.label}
                </p>
                <p
                  class="font-semibold tabular-nums text-base-content {isCompactGrid
                    ? 'text-[11px]'
                    : 'text-base'}"
                >
                  {row.percent}
                </p>
              </div>
            </div>
            <div
              class="overflow-hidden rounded-full bg-base-300/70 {isCompactGrid
                ? 'mt-1 h-0.5'
                : 'mt-2 h-1.5'}"
              aria-hidden="true"
            >
              <div class="h-full rounded-full {barClass}" style="width: {row.value}%"></div>
            </div>
          </article>
        {/each}
        {#if isCompactGrid}
          <div
            class="flex w-[6.5rem] items-stretch"
            data-testid="portfolio-hub-rebalance-slot"
          >
            <a
              class="btn btn-outline btn-xs h-full min-h-[2.75rem] w-full whitespace-normal px-1.5 py-1 text-center text-[10px] leading-tight"
              href="/rebalanceamento"
              data-testid="portfolio-hub-rebalance-link"
            >
              Abrir rebalanceamento
            </a>
          </div>
        {/if}
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

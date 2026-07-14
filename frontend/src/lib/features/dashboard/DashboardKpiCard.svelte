<script lang="ts">
  import { hideMoneyValues } from '$lib/stores/hideMoneyValues';
  import LucideIcon from '$lib/components/LucideIcon.svelte';
  import type { LucideIconName } from '$lib/icons/lucideIconCatalog';

  import DashboardIcon from './DashboardIcon.svelte';
  import type { DashboardIconName } from './dashboardIcons';
  import DashboardPatrimonyFilterCheckboxes from './DashboardPatrimonyFilterCheckboxes.svelte';
  import type { DashboardPatrimonyFilterAvailability } from './dashboardPatrimonyScope';
  import { hasDashboardPatrimonyFilterOptions } from './dashboardPatrimonyScope';

  export let title: string;
  export let value: string;
  export let description = '';
  export let icon: DashboardIconName | undefined = undefined;
  export let lucideIcon: LucideIconName | undefined = undefined;
  export let iconBgClass = 'bg-primary/15';
  export let iconFgClass = 'text-primary';
  export let valueClass = '';
  export let badge = '';
  export let badgeClass = '';
  export let testId = '';
  export let maskValue = true;
  export let actionHref = '';
  export let actionLabel = '';
  export let actionTestId = '';
  export let filterAvailability: DashboardPatrimonyFilterAvailability | null = null;

  $: showPatrimonyFilters =
    filterAvailability != null && hasDashboardPatrimonyFilterOptions(filterAvailability);
</script>

<div
  class="card bg-base-100 shadow"
  data-testid={testId || undefined}
>
  <div class="card-body flex-row items-center gap-4 p-5">
    <div
      class="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl {iconBgClass} {iconFgClass}"
      aria-hidden="true"
    >
      {#if lucideIcon}
        <LucideIcon name={lucideIcon} size="xl" class={iconFgClass} />
      {:else if icon}
        <DashboardIcon name={icon} size="xl" />
      {/if}
    </div>
    <div class="min-w-0 flex-1">
      <p class="text-sm font-medium text-base-content/70">{title}</p>
      <div class="mt-1 inline-flex max-w-full flex-wrap items-baseline gap-1.5">
        <span class="text-3xl font-bold leading-tight {valueClass}">
          {#if maskValue && $hideMoneyValues && value.startsWith('R$')}
            R$ ••••••
          {:else}
            {value}
          {/if}
        </span>
        {#if badge}
          <span
            class="inline-flex shrink-0 items-center rounded-lg px-2.5 py-1 text-base font-semibold leading-none {badgeClass}"
            data-testid={testId ? `${testId}-badge` : undefined}
          >
            {badge}
          </span>
        {/if}
      </div>
      {#if description}
        <p class="mt-1 text-xs text-base-content/60">{@html description}</p>
      {/if}
      <slot name="extra" />
    </div>
    {#if showPatrimonyFilters && filterAvailability}
      <div class="shrink-0 self-center">
        <DashboardPatrimonyFilterCheckboxes {filterAvailability} />
      </div>
    {/if}
    {#if actionHref && actionLabel}
      <a
        class="btn btn-outline btn-sm shrink-0"
        href={actionHref}
        data-testid={actionTestId || (testId ? `${testId}-action` : undefined)}
      >
        {actionLabel}
      </a>
    {/if}
  </div>
</div>

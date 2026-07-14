<script lang="ts">
  import LucideIcon from '$lib/components/LucideIcon.svelte';
  import type { LucideIconName } from '$lib/icons/lucideIconCatalog';

  export let title = '';
  export let lucideIcon: LucideIconName = 'Wallet';
  export let borderClass = 'border-primary/35';
  export let gradientClass = 'from-primary/15';
  export let titleClass = 'text-primary/90';
  export let iconBgClass = 'bg-primary/15';
  export let iconFgClass = 'text-primary';
  export let testId = '';
  export let gridClass = '';
</script>

<div
  class="rounded-box border-2 {borderClass} bg-gradient-to-br {gradientClass} to-base-100 p-5 shadow-md {gridClass}"
  data-testid={testId || undefined}
>
  <div class="flex items-start gap-3">
    <div
      class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl {iconBgClass} {iconFgClass}"
      aria-hidden="true"
    >
      <LucideIcon name={lucideIcon} size="xl" class={iconFgClass} />
    </div>
    <div class="min-w-0 flex-1">
      <p class="text-xs font-bold uppercase tracking-wide {titleClass}">{title}</p>
      <slot />
    </div>
  </div>
</div>

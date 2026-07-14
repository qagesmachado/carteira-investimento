<script lang="ts">
  import LucideIcon from '$lib/components/LucideIcon.svelte';
  import { NAV_DROPDOWN_CHEVRON_LUCIDE_ICON } from '$lib/icons/lucideIconCatalog';

  export let label: string;
  export let active = false;
  export let panelClass = 'w-52';
</script>

<div class="dropdown dropdown-hover">
  <div
    tabindex="0"
    role="button"
    class="btn btn-ghost gap-1 px-3"
    class:btn-active={active}
    aria-haspopup="menu"
    data-testid="nav-menu-{label}"
  >
    <span>{label}</span>
    <LucideIcon name={NAV_DROPDOWN_CHEVRON_LUCIDE_ICON} size="sm" class="opacity-60" />
  </div>
  <ul
    class="dropdown-content menu z-50 rounded-box bg-base-100 p-2 shadow {panelClass} before:absolute before:-top-2 before:left-0 before:h-2 before:w-full before:content-['']"
    role="menu"
    aria-label={label}
  >
    <slot />
  </ul>
</div>

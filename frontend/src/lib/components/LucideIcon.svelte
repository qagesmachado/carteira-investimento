<script lang="ts">
  import {
    getLucideIconComponent,
    LUCIDE_ICON_SIZE_PX,
    type LucideIconName,
    type LucideIconSize
  } from '$lib/icons/lucideIconCatalog';

  export let name: LucideIconName;
  export let size: LucideIconSize = 'md';
  let className = '';
  export { className as class };

  $: Icon = getLucideIconComponent(name);
  $: pixelSize = LUCIDE_ICON_SIZE_PX[size];
</script>

<svelte:component
  this={Icon}
  size={pixelSize}
  strokeWidth={1.75}
  class="shrink-0 {className}"
  aria-hidden="true"
  data-testid="lucide-icon-{name}"
/>

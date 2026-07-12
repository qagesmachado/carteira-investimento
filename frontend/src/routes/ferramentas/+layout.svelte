<script lang="ts">
  import AppPageShell from '$lib/components/AppPageShell.svelte';
  import { PAGE_BACKGROUND_CLASS } from '$lib/layout/pageVisual';
</script>

<main class={PAGE_BACKGROUND_CLASS}>
  <AppPageShell paddingY="py-2-px-4" class="flex flex-col gap-3">
    <slot />
  </AppPageShell>
</main>

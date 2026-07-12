<script lang="ts">
  import { pageShellClass, type PageShellPaddingY } from '$lib/layout/pageShell';

  export let element: 'div' | 'main' = 'div';
  export let paddingY: PageShellPaddingY = 'py-4';
  let className = '';
  export { className as class };

  $: shellClass = pageShellClass(paddingY, className);
</script>

<svelte:element this={element} class={shellClass} data-testid="app-page-shell">
  <slot />
</svelte:element>

<script lang="ts">
  import { PAGE_SECTION_CLASS } from '$lib/layout/pageVisual';

  export let title = '';
  export let titleLevel: 'h2' | 'h3' = 'h2';
  export let testId = '';
  let className = '';
  export { className as class };
</script>

<svelte:element
  this={title ? 'section' : 'div'}
  class="{PAGE_SECTION_CLASS} {className}"
  data-testid={testId || undefined}
>
  <div class="card-body flex flex-col gap-4">
    {#if title}
      <svelte:element this={titleLevel} class="card-title text-lg">{title}</svelte:element>
    {/if}
    <slot />
  </div>
</svelte:element>

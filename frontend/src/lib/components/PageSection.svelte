<script lang="ts">
  import { PAGE_SECTION_CLASS } from '$lib/layout/pageVisual';

  export let title = '';
  export let titleLevel: 'h2' | 'h3' = 'h2';
  export let testId = '';
  export let actionsTestId = '';
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
      <div class="flex flex-wrap items-center justify-between gap-2">
        <svelte:element this={titleLevel} class="card-title mb-0 text-lg">{title}</svelte:element>
        {#if $$slots.actions}
          <div class="flex shrink-0 flex-wrap items-center gap-2" data-testid={actionsTestId || undefined}>
            <slot name="actions" />
          </div>
        {/if}
      </div>
    {/if}
    <slot />
  </div>
</svelte:element>

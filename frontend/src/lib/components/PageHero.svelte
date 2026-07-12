<script lang="ts">
  import {
    pageHeroClass,
    pageHeroSubtitleClass,
    type PageHeroVariant
  } from '$lib/layout/pageVisual';

  export let title: string;
  export let subtitle = '';
  export let variant: PageHeroVariant = 'primary';
  let className = '';
  export { className as class };
</script>

<section class="{pageHeroClass(variant)} {className}" data-testid="page-hero">
  <div class="flex flex-wrap items-center justify-between gap-4">
    <div class="min-w-0 flex-1">
      <h1 class="text-4xl font-bold">{title}</h1>
      {#if subtitle}
        <p class={pageHeroSubtitleClass(variant)}>{subtitle}</p>
      {/if}
    </div>
    {#if $$slots.actions}
      <div
        class="flex shrink-0 flex-wrap items-center justify-center gap-3"
        data-testid="page-hero-actions"
      >
        <slot name="actions" />
      </div>
    {/if}
  </div>
</section>

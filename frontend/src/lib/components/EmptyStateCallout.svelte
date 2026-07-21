<script lang="ts">
  import LucideIcon from '$lib/components/LucideIcon.svelte';
  import type { LucideIconName } from '$lib/icons/lucideIconCatalog';
  import { PAGE_SECTION_CLASS } from '$lib/layout/pageVisual';

  export let title: string;
  export let description = '';
  export let ctaLabel = '';
  export let ctaHref = '';
  export let icon: LucideIconName | '' = '';
  export let testId = '';
  /** Quando `true` (padrão) envolve o conteúdo num card. Use `false` para embutir dentro de outro card. */
  export let card = true;

  $: showCta = ctaLabel !== '' && ctaHref !== '';
  $: wrapperClass = card ? PAGE_SECTION_CLASS : '';
  $: bodyClass = card
    ? 'card-body items-center gap-4 py-10 text-center'
    : 'flex flex-col items-center gap-4 py-8 text-center';
</script>

<div class={wrapperClass} data-testid={testId || undefined}>
  <div class={bodyClass}>
    {#if icon}
      <div
        class="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"
      >
        <LucideIcon name={icon} size="xl" />
      </div>
    {/if}
    <h2 class="card-title text-lg" data-testid={testId ? `${testId}-title` : undefined}>{title}</h2>
    {#if description}
      <p class="max-w-md text-sm text-base-content/70">{description}</p>
    {/if}
    {#if showCta}
      <a
        class="btn btn-primary"
        href={ctaHref}
        data-testid={testId ? `${testId}-cta` : undefined}
      >
        {ctaLabel}
      </a>
    {/if}
  </div>
</div>

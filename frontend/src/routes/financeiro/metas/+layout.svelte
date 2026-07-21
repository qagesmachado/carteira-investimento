<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  import LucideIcon from '$lib/components/LucideIcon.svelte';
  import {
    FINANCEIRO_GOALS_HISTORY_LUCIDE_ICON,
    FINANCEIRO_GOALS_LUCIDE_ICON,
    FINANCEIRO_TAGS_LUCIDE_ICON
  } from '$lib/icons/lucideIconCatalog';

  $: pathname = $page.url.pathname;
  $: isTags = pathname.startsWith('/financeiro/metas/tags');
  $: isHistorico = pathname.startsWith('/financeiro/metas/historico');
  $: isMetas = !isTags && !isHistorico;

  const pillBase =
    'btn btn-sm gap-1.5 rounded-full border-0 px-3 font-normal normal-case shadow-none transition-colors';
  const pillActive = 'bg-primary text-primary-content hover:bg-primary';
  const pillIdle = 'bg-base-200/80 text-base-content/80 hover:bg-base-300/80';
</script>

<div class="flex flex-col gap-3">
  <div class="flex flex-wrap gap-2" role="tablist" aria-label="Seções de metas">
    <button
      type="button"
      role="tab"
      class="{pillBase} {isMetas ? pillActive : pillIdle}"
      aria-selected={isMetas}
      data-testid="budget-metas-metas-tab"
      on:click={() => goto('/financeiro/metas')}
    >
      <LucideIcon name={FINANCEIRO_GOALS_LUCIDE_ICON} size="sm" aria-hidden="true" />
      Metas
    </button>
    <button
      type="button"
      role="tab"
      class="{pillBase} {isHistorico ? pillActive : pillIdle}"
      aria-selected={isHistorico}
      data-testid="budget-metas-historico-tab"
      on:click={() => goto('/financeiro/metas/historico')}
    >
      <LucideIcon name={FINANCEIRO_GOALS_HISTORY_LUCIDE_ICON} size="sm" aria-hidden="true" />
      Histórico
    </button>
    <button
      type="button"
      role="tab"
      class="{pillBase} {isTags ? pillActive : pillIdle}"
      aria-selected={isTags}
      data-testid="budget-metas-tags-tab"
      on:click={() => goto('/financeiro/metas/tags')}
    >
      <LucideIcon name={FINANCEIRO_TAGS_LUCIDE_ICON} size="sm" aria-hidden="true" />
      Tags
    </button>
  </div>

  <slot />
</div>

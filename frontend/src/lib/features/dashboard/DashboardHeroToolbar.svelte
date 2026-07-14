<script lang="ts">
  import LucideIcon from '$lib/components/LucideIcon.svelte';
  import {
    DASHBOARD_FX_REFRESH_LUCIDE_ICON,
    DASHBOARD_QUOTES_REFRESH_LUCIDE_ICON
  } from '$lib/icons/lucideIconCatalog';
  import { PAGE_HERO_DASHBOARD_ACTION_BTN_CLASS } from '$lib/layout/pageVisual';

  export let refreshingQuotes = false;
  export let refreshingFx = false;
  export let loading = false;
  export let quotesDisabled = false;
  export let onRefreshQuotes: () => void = () => undefined;
  export let onRefreshFx: () => void = () => undefined;
</script>

<button
  type="button"
  class={PAGE_HERO_DASHBOARD_ACTION_BTN_CLASS}
  disabled={loading || quotesDisabled || refreshingQuotes}
  data-testid="dashboard-refresh-quotes"
  on:click={onRefreshQuotes}
>
  <LucideIcon name={DASHBOARD_QUOTES_REFRESH_LUCIDE_ICON} size="xl" class="text-white" />
  {refreshingQuotes ? 'Atualizando cotações…' : 'Atualizar cotações'}
</button>

<button
  type="button"
  class={PAGE_HERO_DASHBOARD_ACTION_BTN_CLASS}
  disabled={loading || refreshingFx}
  data-testid="dashboard-refresh-fx"
  on:click={onRefreshFx}
>
  <LucideIcon name={DASHBOARD_FX_REFRESH_LUCIDE_ICON} size="xl" class="text-white" />
  {refreshingFx ? 'Atualizando câmbio…' : 'Atualizar câmbio'}
</button>

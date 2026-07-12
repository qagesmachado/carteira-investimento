<script lang="ts">
  import LucideIcon from '$lib/components/LucideIcon.svelte';
  import {
    DASHBOARD_FX_REFRESH_LUCIDE_ICON,
    DASHBOARD_QUOTES_REFRESH_LUCIDE_ICON
  } from '$lib/icons/lucideIconCatalog';

  export let refreshingQuotes = false;
  export let refreshingFx = false;
  export let loading = false;
  export let quotesDisabled = false;
  export let onRefreshQuotes: () => void = () => undefined;
  export let onRefreshFx: () => void = () => undefined;

  const toolbarBtnClass =
    'btn btn-outline min-h-[2.75rem] gap-2.5 border-white/30 bg-white/10 px-5 text-[1.09375rem] text-white hover:border-white hover:bg-white/20';
</script>

<button
  type="button"
  class={toolbarBtnClass}
  disabled={loading || quotesDisabled || refreshingQuotes}
  data-testid="dashboard-refresh-quotes"
  on:click={onRefreshQuotes}
>
  <LucideIcon name={DASHBOARD_QUOTES_REFRESH_LUCIDE_ICON} size="xl" class="text-white" />
  {refreshingQuotes ? 'Atualizando cotações…' : 'Atualizar cotações'}
</button>

<button
  type="button"
  class={toolbarBtnClass}
  disabled={loading || refreshingFx}
  data-testid="dashboard-refresh-fx"
  on:click={onRefreshFx}
>
  <LucideIcon name={DASHBOARD_FX_REFRESH_LUCIDE_ICON} size="xl" class="text-white" />
  {refreshingFx ? 'Atualizando câmbio…' : 'Atualizar câmbio'}
</button>

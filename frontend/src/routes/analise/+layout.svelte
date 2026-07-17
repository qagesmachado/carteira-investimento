<script lang="ts">
  import { page } from '$app/stores';

  import AppPageShell from '$lib/components/AppPageShell.svelte';
  import PageHero from '$lib/components/PageHero.svelte';
  import AnalysisSectionTabs from '$lib/features/analise/AnalysisSectionTabs.svelte';
  import {
    analysisSectionSubtitle,
    resolveAnalysisSectionTab
  } from '$lib/features/analise/analysisSectionTabs';
  import { PAGE_BACKGROUND_CLASS } from '$lib/layout/pageVisual';

  $: pathname = $page.url.pathname;
  $: activeTab = resolveAnalysisSectionTab(pathname);
  $: subtitle = analysisSectionSubtitle(activeTab);
</script>

<main class={PAGE_BACKGROUND_CLASS}>
  <AppPageShell paddingY="py-4" class="flex flex-col gap-3">
    <PageHero title="Análise de ativos" {subtitle} variant="dashboard" />
    <AnalysisSectionTabs {activeTab} {pathname} />
    <slot />
  </AppPageShell>
</main>

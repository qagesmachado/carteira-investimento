<script lang="ts">
  import { onMount } from 'svelte';

  import { page } from '$app/stores';

  import AppPageShell from '$lib/components/AppPageShell.svelte';
  import DismissibleAlert from '$lib/components/DismissibleAlert.svelte';
  import PageHero from '$lib/components/PageHero.svelte';
  import ProventosSectionTabs from '$lib/features/proventos/ProventosSectionTabs.svelte';
  import {
    proventosSectionSubtitle,
    resolveProventosSectionTab
  } from '$lib/features/proventos/proventosSectionTabs';
  import { proventosStore } from '$lib/features/proventos/proventosStore';
  import PortfolioWorkspaceBarPanel from '$lib/features/portfolios/PortfolioWorkspaceBarPanel.svelte';
  import { PAGE_BACKGROUND_CLASS } from '$lib/layout/pageVisual';

  $: activeTab = resolveProventosSectionTab($page.url.pathname);
  $: subtitle = proventosSectionSubtitle(activeTab);

  $: selectedPortfolioId =
    typeof $proventosStore.portfolioFilter === 'number'
      ? $proventosStore.portfolioFilter
      : $proventosStore.activePortfolioId;
  $: activePortfolioName =
    $proventosStore.portfolios.find((portfolio) => portfolio.id === selectedPortfolioId)?.name ?? '';

  onMount(() => {
    void proventosStore.ensureLoaded();
  });
</script>

<svelte:head>
  <title>Proventos — Carteira de Investimentos</title>
</svelte:head>

<main class={PAGE_BACKGROUND_CLASS}>
  <AppPageShell paddingY="py-4" class="flex flex-col gap-3">
      <PageHero title="Proventos" {subtitle} variant="dashboard" />
      <ProventosSectionTabs {activeTab} />

      <PortfolioWorkspaceBarPanel
        portfolios={$proventosStore.portfolios}
        activeId={selectedPortfolioId}
        {activePortfolioName}
        showQuoteStatus={false}
        portfolioSelectTestId="proventos-portfolio-select"
        testId="proventos-portfolio-bar"
        on:select={(event) => void proventosStore.selectPortfolio(event.detail)}
      />

      {#if $proventosStore.message}
      <DismissibleAlert
        text={$proventosStore.message}
        variant="success"
        on:dismiss={() => proventosStore.setMessage('')}
      />
    {/if}
    {#if $proventosStore.error}
      <DismissibleAlert
        text={$proventosStore.error}
        variant="error"
        on:dismiss={() => proventosStore.setError('')}
      />
    {/if}
    {#if $proventosStore.assetsError}
      <DismissibleAlert
        text={$proventosStore.assetsError}
        variant="error"
        on:dismiss={() => proventosStore.setAssetsError('')}
      />
    {/if}
    {#if $proventosStore.paymentsError}
      <DismissibleAlert
        text={$proventosStore.paymentsError}
        variant="error"
        on:dismiss={() => proventosStore.setPaymentsError('')}
      />
    {/if}

    <slot />
  </AppPageShell>
</main>

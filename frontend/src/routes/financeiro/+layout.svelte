<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';

  import {
    getActiveBudgetProfileId,
    listBudgetProfiles,
    setActiveBudgetProfileId
  } from '$lib/api/budget';
  import AppPageShell from '$lib/components/AppPageShell.svelte';
  import DismissibleAlert from '$lib/components/DismissibleAlert.svelte';
  import PageHero from '$lib/components/PageHero.svelte';
  import BudgetMonthNav from '$lib/features/financeiro/BudgetMonthNav.svelte';
  import BudgetProfileBarPanel from '$lib/features/financeiro/BudgetProfileBarPanel.svelte';
  import FinanceiroSectionTabs from '$lib/features/financeiro/FinanceiroSectionTabs.svelte';
  import {
    createBudgetLayoutStores,
    setBudgetLayoutContext
  } from '$lib/features/financeiro/budgetLayoutContext';
  import {
    financeiroSectionSubtitle,
    resolveFinanceiroSectionTab
  } from '$lib/features/financeiro/financeiroSectionTabs';
  import { resolveActiveBudgetProfileId } from '$lib/features/financeiro/resolveActiveBudgetProfileId';
  import { PAGE_BACKGROUND_CLASS } from '$lib/layout/pageVisual';

  const ctx = createBudgetLayoutStores();
  setBudgetLayoutContext(ctx);
  const { profiles, activeProfileId } = ctx;

  let loadError = '';

  $: activeTab = resolveFinanceiroSectionTab($page.url.pathname);
  $: subtitle = financeiroSectionSubtitle(activeTab);
  // Painel, Orçamento, Despesas, Metas e Renda dependem do mês; Perfis não.
  $: showMonthNav = activeTab !== 'perfis';

  async function reloadProfiles() {
    const profiles = await listBudgetProfiles();
    ctx.profiles.set(profiles);
    const stored = await getActiveBudgetProfileId();
    const resolved = resolveActiveBudgetProfileId(profiles, stored);
    ctx.activeProfileId.set(resolved);
    if (resolved !== stored) {
      // Sincroniza a preferência ativa: grava o novo id ou limpa a referência órfã (null)
      // quando o perfil anterior deixou de existir (paridade com a carteira ativa).
      await setActiveBudgetProfileId(resolved);
    }
  }

  ctx.reloadProfiles = reloadProfiles;

  onMount(async () => {
    try {
      await reloadProfiles();
    } catch (error) {
      loadError = error instanceof Error ? error.message : 'Erro ao carregar perfis';
    }
  });

  async function handleProfileSelect(event: CustomEvent<number>) {
    await setActiveBudgetProfileId(event.detail);
    ctx.activeProfileId.set(event.detail);
  }
</script>

<svelte:head>
  <title>Financeiro — Carteira de Investimentos</title>
</svelte:head>

<main class={PAGE_BACKGROUND_CLASS}>
  <AppPageShell paddingY="py-4" class="flex flex-col gap-3">
    <PageHero title="Financeiro" {subtitle} variant="dashboard" />

    <FinanceiroSectionTabs {activeTab} />

    <BudgetProfileBarPanel
      profiles={$profiles}
      activeId={$activeProfileId}
      on:select={handleProfileSelect}
    />

    {#if showMonthNav}
      <BudgetMonthNav />
    {/if}

    {#if loadError}
      <DismissibleAlert text={loadError} variant="error" on:dismiss={() => (loadError = '')} />
    {/if}

    <slot />
  </AppPageShell>
</main>

<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';

  import {
    getActiveBudgetProfileId,
    listBudgetProfiles,
    setActiveBudgetProfileId
  } from '$lib/api/budget';
  import BudgetProfileSelect from '$lib/features/financeiro/BudgetProfileSelect.svelte';
  import AppPageShell from '$lib/components/AppPageShell.svelte';
  import { PAGE_BACKGROUND_CLASS } from '$lib/layout/pageVisual';
  import {
    createBudgetLayoutStores,
    setBudgetLayoutContext
  } from '$lib/features/financeiro/budgetLayoutContext';
  import {
    currentYearMonth,
    formatYearMonthLabel,
    shiftYearMonth
  } from '$lib/features/financeiro/budgetMonth';
  import { resolveActiveBudgetProfileId } from '$lib/features/financeiro/resolveActiveBudgetProfileId';

  const ctx = createBudgetLayoutStores();
  setBudgetLayoutContext(ctx);
  const { profiles, activeProfileId, yearMonth } = ctx;

  let loadError = '';

  $: pathname = $page.url.pathname;
  $: isPainel = pathname === '/financeiro' || pathname === '/financeiro/';
  $: isOrcamento = pathname.startsWith('/financeiro/orcamento');
  $: isDespesas = pathname.startsWith('/financeiro/despesas');
  $: isMetas = pathname.startsWith('/financeiro/metas');
  $: isRenda = pathname.startsWith('/financeiro/renda');
  $: isPerfis = pathname.startsWith('/financeiro/perfis');
  $: showMonthNav = isPainel || isOrcamento || isDespesas || isMetas || isRenda;

  async function reloadProfiles() {
    const profiles = await listBudgetProfiles();
    ctx.profiles.set(profiles);
    const stored = await getActiveBudgetProfileId();
    const resolved = resolveActiveBudgetProfileId(profiles, stored);
    ctx.activeProfileId.set(resolved);
    if (resolved != null && resolved !== stored) {
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

  function shiftMonth(delta: number) {
    const next = shiftYearMonth($yearMonth, delta);
    ctx.yearMonth.set(next);
    if (isOrcamento) {
      void goto(`/financeiro/orcamento/${next}`);
    } else if (isDespesas) {
      void goto(`/financeiro/despesas/${next}`);
    } else if (isRenda) {
      void goto(`/financeiro/renda/${next}`);
    }
  }
</script>

<main class={PAGE_BACKGROUND_CLASS}>
  <AppPageShell paddingY="py-2-px-4" class="flex flex-col gap-3">
  <div class="flex flex-wrap items-end justify-between gap-4">
    <div>
      <h1 class="text-2xl font-bold">Financeiro</h1>
      <p class="text-sm text-base-content/70">Controle orçamentário doméstico</p>
    </div>
    <BudgetProfileSelect
      profiles={$profiles}
      activeId={$activeProfileId}
      on:select={handleProfileSelect}
    />
  </div>

  {#if loadError}
    <div class="alert alert-error">{loadError}</div>
  {/if}

  <div class="flex flex-wrap items-center gap-2">
    <div role="tablist" class="tabs tabs-boxed" aria-label="Financeiro">
      <button type="button" role="tab" class="tab" class:tab-active={isPainel} on:click={() => goto('/financeiro')}>
        Painel
      </button>
      <button
        type="button"
        role="tab"
        class="tab"
        class:tab-active={isOrcamento}
        on:click={() => goto(`/financeiro/orcamento/${$yearMonth}`)}
      >
        Orçamento
      </button>
      <button
        type="button"
        role="tab"
        class="tab"
        class:tab-active={isDespesas}
        on:click={() => goto(`/financeiro/despesas/${$yearMonth}`)}
      >
        Despesas
      </button>
      <button type="button" role="tab" class="tab" class:tab-active={isMetas} on:click={() => goto('/financeiro/metas')}>
        Metas
      </button>
      <button
        type="button"
        role="tab"
        class="tab"
        class:tab-active={isRenda}
        on:click={() => goto(`/financeiro/renda/${$yearMonth}`)}
      >
        Renda
      </button>
      <button type="button" role="tab" class="tab" class:tab-active={isPerfis} on:click={() => goto('/financeiro/perfis')}>
        Perfis
      </button>
    </div>

    {#if showMonthNav}
      <div class="ml-auto flex items-center gap-2">
        <button type="button" class="btn btn-sm btn-ghost" on:click={() => shiftMonth(-1)} aria-label="Mês anterior">
          ‹
        </button>
        <span class="text-sm font-medium" data-testid="budget-month-label">
          {formatYearMonthLabel($yearMonth)}
        </span>
        <button type="button" class="btn btn-sm btn-ghost" on:click={() => shiftMonth(1)} aria-label="Próximo mês">
          ›
        </button>
      </div>
    {/if}
  </div>

  <slot />
  </AppPageShell>
</main>

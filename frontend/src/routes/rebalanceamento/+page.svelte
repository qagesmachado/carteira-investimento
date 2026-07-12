<script lang="ts">
  import { onMount } from 'svelte';

  import { parseApiError } from '$lib/api/parseApiError';
  import {
    getActivePortfolioId,
    listPortfolios,
    setActivePortfolioId,
    type Portfolio
  } from '$lib/api/portfolios';
  import { getPortfolioRebalance, type RebalanceSnapshot } from '$lib/api/rebalance';
  import DismissibleAlert from '$lib/components/DismissibleAlert.svelte';
  import AppPageShell from '$lib/components/AppPageShell.svelte';
  import PageHeader from '$lib/components/PageHeader.svelte';
  import PageSection from '$lib/components/PageSection.svelte';
  import {
    formatBrl,
    formatPercent
  } from '$lib/features/rebalance/allocationTargets';
  import {
    computeClassInvestmentAllocation,
    defaultIncludedClasses,
    getClassContributionFromPlan
  } from '$lib/features/rebalance/investmentAllocation';
  import BrDecimalInput from '$lib/components/BrDecimalInput.svelte';
  import AssetRebalanceTable from '$lib/features/rebalance/AssetRebalanceTable.svelte';
  import PortfolioSelect from '$lib/features/portfolios/PortfolioSelect.svelte';

  type AssetGroupTab = 'stocks' | 'international' | 'funds' | 'crypto';

  const ASSET_GROUP_TABS: { id: AssetGroupTab; label: string }[] = [
    { id: 'stocks', label: 'Ações/ETF BR' },
    { id: 'international', label: 'ETF internacional' },
    { id: 'funds', label: 'FII' },
    { id: 'crypto', label: 'Criptomoedas' }
  ];

  let portfolios: Portfolio[] = [];
  let activeId: number | null = null;
  let snapshot: RebalanceSnapshot | null = null;
  let loading = true;
  let error = '';
  /** Valor a investir (R$); 0 = não informado. */
  let investmentAmountInput = 0;
  let includedClasses: Record<string, boolean> = {};
  let assetGroupTab: AssetGroupTab = 'stocks';

  $: activeAssetRows =
    assetGroupTab === 'stocks'
      ? (snapshot?.stock_assets ?? [])
      : assetGroupTab === 'international'
        ? (snapshot?.international_assets ?? [])
        : assetGroupTab === 'crypto'
          ? (snapshot?.crypto_assets ?? [])
          : (snapshot?.fund_assets ?? []);
  $: activeAssetEmptyMessage =
    assetGroupTab === 'stocks'
      ? 'Nenhuma posição em Ações/ETF BR nesta carteira.'
      : assetGroupTab === 'international'
        ? 'Nenhuma posição em ETF internacional nesta carteira.'
        : assetGroupTab === 'crypto'
          ? 'Nenhuma posição na estratégia Criptomoeda nesta carteira.'
          : 'Nenhuma posição em FII nesta carteira.';

  $: investmentPlan =
    snapshot != null && investmentAmountInput > 0
      ? computeClassInvestmentAllocation(
          snapshot.classes,
          snapshot.patrimony_brl,
          investmentAmountInput,
          includedClasses
        )
      : null;

  $: includedClassCount = Object.values(includedClasses).filter(Boolean).length;

  $: allocationByClass = new Map(
    (investmentPlan?.rows ?? []).map((row) => [row.display_class, row])
  );

  $: activeClassContribution = getClassContributionFromPlan(
    investmentPlan,
    assetGroupTab === 'stocks'
      ? 'stocks'
      : assetGroupTab === 'international'
        ? 'international'
        : assetGroupTab === 'crypto'
          ? 'crypto'
          : 'funds'
  );

  function initializeIncludedClasses() {
    if (snapshot == null) {
      includedClasses = {};
      return;
    }
    includedClasses = defaultIncludedClasses(snapshot.classes);
  }

  function toggleClassInclusion(displayClass: string, checked: boolean) {
    if (!checked && includedClassCount <= 1) {
      return;
    }
    includedClasses = { ...includedClasses, [displayClass]: checked };
  }

  function handleClassInclusionChange(displayClass: string, event: Event) {
    const target = event.currentTarget;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }
    toggleClassInclusion(displayClass, target.checked);
  }

  async function loadSnapshot(portfolioId: number) {
    loading = true;
    error = '';
    try {
      snapshot = await getPortfolioRebalance(portfolioId);
      investmentAmountInput = 0;
      initializeIncludedClasses();
      assetGroupTab = 'stocks';
    } catch (err) {
      snapshot = null;
      error = parseApiError(err, 'Não foi possível carregar o rebalanceamento.');
    } finally {
      loading = false;
    }
  }

  async function loadPage() {
    loading = true;
    error = '';
    try {
      portfolios = await listPortfolios();
      activeId = await getActivePortfolioId();
      const id = activeId ?? portfolios[0]?.id ?? null;
      if (id != null) {
        activeId = id;
        await loadSnapshot(id);
      } else {
        snapshot = null;
        loading = false;
      }
    } catch (err) {
      error = parseApiError(err, 'Não foi possível carregar carteiras.');
      loading = false;
    }
  }

  onMount(() => {
    void loadPage();
  });

  async function handlePortfolioSelect(id: number) {
    if (id === activeId) return;
    activeId = id;
    try {
      await setActivePortfolioId(id);
      await loadSnapshot(id);
    } catch (err) {
      error = parseApiError(err, 'Não foi possível trocar a carteira.');
    }
  }
</script>

<svelte:head>
  <title>Rebalanceamento</title>
</svelte:head>

<main class="min-h-screen w-full bg-base-200">
<AppPageShell paddingY="py-2-px-4" class="flex flex-col gap-3">
  <PageHeader
    title="Rebalanceamento"
    subtitle="Compare alocação atual com metas da carteira e veja quanto falta por classe e por ativo."
  >
    <div slot="actions" class="flex flex-wrap items-center gap-2">
      {#if portfolios.length > 0}
        <PortfolioSelect
          {portfolios}
          {activeId}
          selectClass="select select-bordered select-sm"
          ariaLabel="Carteira"
          on:select={(event) => void handlePortfolioSelect(event.detail)}
        />
      {/if}
      <a class="btn btn-sm btn-outline" href="/rebalanceamento/configuracao">Configurar metas</a>
    </div>
  </PageHeader>

  {#if error}
    <DismissibleAlert variant="error" text={error} on:dismiss={() => (error = '')} />
  {/if}

  {#if loading}
    <p class="text-sm opacity-70">Carregando…</p>
  {:else if !snapshot}
    <p class="text-sm opacity-70">Nenhuma carteira selecionada.</p>
  {:else}
    <PageSection title="Balanceamento desejado">
      <p class="text-sm opacity-70">
        Patrimônio (balanceamento): {formatBrl(snapshot.patrimony_brl)} — previdência e outros
        excluídos da soma
        {#if investmentPlan != null}
          · Patrimônio final: {formatBrl(investmentPlan.finalPatrimonyBrl)}
        {/if}
        {#if snapshot.usd_brl_rate != null}
          · USD/BRL: {snapshot.usd_brl_rate.toLocaleString('pt-BR', {
            minimumFractionDigits: 4,
            maximumFractionDigits: 4
          })}
        {/if}
      </p>
      {#if investmentAmountInput > 0 && includedClassCount === 0}
        <DismissibleAlert
          variant="warning"
          text="Selecione ao menos uma classe para distribuir o aporte."
        />
      {/if}
      <div class="overflow-x-auto">
        <table class="table table-sm">
          <thead>
            <tr>
              <th class="w-10">
                <span class="sr-only">Incluir no aporte</span>
              </th>
              <th>Ativo</th>
              <th class="text-right">Valor (R$)</th>
              <th class="text-right">Porcentagem</th>
              <th class="text-right">Faltando</th>
              <th class="text-right min-w-[10rem]">Deveria ter</th>
              <th class="text-right min-w-[10rem]">Aporte sugerido</th>
            </tr>
          </thead>
          <tbody>
            {#each snapshot.classes as row (row.display_class)}
              {@const allocation = allocationByClass.get(row.display_class)}
              <tr>
                <td>
                  <input
                    type="checkbox"
                    class="checkbox checkbox-sm"
                    checked={includedClasses[row.display_class] !== false}
                    aria-label="Incluir {row.label} no aporte"
                    disabled={includedClasses[row.display_class] !== false && includedClassCount <= 1}
                    on:change={(event) => handleClassInclusionChange(row.display_class, event)}
                  />
                </td>
                <td>{row.label}</td>
                <td class="text-right">{formatBrl(row.current_value_brl)}</td>
                <td class="text-right">{formatPercent(row.target_percent)}</td>
                <td class="text-right">{formatBrl(row.gap_brl)}</td>
                <td class="text-right">
                  {formatBrl(allocation?.idealTargetBrl ?? null)}
                </td>
                <td class="text-right">
                  {formatBrl(allocation?.suggestedContributionBrl ?? null)}
                </td>
              </tr>
            {/each}
            <tr class="font-semibold">
              <td></td>
              <td>TOTAL</td>
              <td class="text-right">{formatBrl(snapshot.patrimony_brl)}</td>
              <td class="text-right">100,00%</td>
              <td class="text-right">{formatBrl(snapshot.total_gap_brl)}</td>
              <td class="text-right">
                {formatBrl(investmentPlan?.finalPatrimonyBrl ?? null)}
              </td>
              <td class="text-right">
                <div class="flex flex-col items-end gap-1">
                  <BrDecimalInput
                    bind:value={investmentAmountInput}
                    label="Valor a investir"
                    inputClass="input input-bordered input-sm w-full max-w-[11rem] text-right font-normal"
                  />
                  {#if investmentPlan != null}
                    <span class="text-xs font-normal opacity-70">
                      Aporte: {formatBrl(investmentPlan.totalSuggestedContributionBrl)}
                    </span>
                  {/if}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </PageSection>

    <PageSection title="Relação ETF / Ação">
      <p class="text-sm opacity-70">Sub-divisão dentro de Ações/ETF BR.</p>
      <div class="overflow-x-auto">
        <table class="table table-sm">
          <thead>
            <tr>
              <th>Tipo</th>
              <th class="text-right">Valor atual</th>
              <th class="text-right">Meta (% da classe)</th>
              <th class="text-right">Valor alvo</th>
              <th class="text-right">Faltando</th>
            </tr>
          </thead>
          <tbody>
            {#each snapshot.stocks_sub_types as row (row.sub_type)}
              <tr>
                <td>{row.label}</td>
                <td class="text-right">{formatBrl(row.current_value_brl)}</td>
                <td class="text-right">{formatPercent(row.target_percent_of_stocks)}</td>
                <td class="text-right">{formatBrl(row.target_value_brl)}</td>
                <td class="text-right">{formatBrl(row.gap_brl)}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </PageSection>

    <PageSection title="Por ativo">
      <div class="tabs tabs-boxed mb-4 w-fit" role="tablist" aria-label="Grupo de ativos">
        {#each ASSET_GROUP_TABS as tab (tab.id)}
          <button
            type="button"
            role="tab"
            class="tab"
            class:tab-active={assetGroupTab === tab.id}
            aria-selected={assetGroupTab === tab.id}
            on:click={() => (assetGroupTab = tab.id)}
          >
            {tab.label}
          </button>
        {/each}
      </div>
      {#if assetGroupTab === 'stocks' && snapshot.assets_without_score_count > 0}
        <DismissibleAlert
          variant="warning"
          text="Há {snapshot.assets_without_score_count} ativo(s) sem pontuação (Soma). Classifique em Análise de ativos (aba Ações/ETF BR) para calcular % desejada."
        />
      {/if}
      {#if assetGroupTab === 'funds' && snapshot.fund_assets_without_score_count > 0}
        <DismissibleAlert
          variant="warning"
          text="Há {snapshot.fund_assets_without_score_count} FII(s) sem pontuação (Soma). Classifique em Análise de ativos (aba FIIs) para calcular % desejada."
        />
      {/if}
      {#if assetGroupTab === 'crypto' && snapshot.crypto_assets_without_allocation_count > 0}
        <DismissibleAlert
          variant="warning"
          text="Há {snapshot.crypto_assets_without_allocation_count} ativo(s) sem alocação definida. Configure em Análise → Criptomoedas."
        />
      {/if}
      {#if assetGroupTab === 'international' && snapshot.usd_brl_rate == null}
        <DismissibleAlert
          variant="warning"
          text="Câmbio USD/BRL indisponível — valores monetários exibem «—» até atualizar a cotação."
        />
      {/if}
      <AssetRebalanceTable
        rows={activeAssetRows}
        emptyMessage={activeAssetEmptyMessage}
        showSumColumn={assetGroupTab === 'stocks' || assetGroupTab === 'funds'}
        showUsdPrimary={assetGroupTab === 'international'}
        usdBrlRate={snapshot.usd_brl_rate}
        currentPatrimonyBrl={snapshot.patrimony_brl}
        finalPatrimonyBrl={investmentPlan?.finalPatrimonyBrl ?? null}
        classContributionBrl={activeClassContribution}
      />
    </PageSection>
  {/if}
</AppPageShell>
</main>

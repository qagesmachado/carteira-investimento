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
  import {
    formatBrl,
    formatPercent
  } from '$lib/features/rebalance/allocationTargets';
  import {
    computeProjectedClassGap,
    computeProjectedTotalGap
  } from '$lib/features/rebalance/projectedRebalance';
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
  /** Patrimônio total após aporte (R$); 0 = não informado. */
  let finalPatrimonyInput = 0;
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

  $: projectedTotalGap =
    snapshot != null && finalPatrimonyInput > 0
      ? computeProjectedTotalGap(snapshot.classes, finalPatrimonyInput)
      : null;

  async function loadSnapshot(portfolioId: number) {
    loading = true;
    error = '';
    try {
      snapshot = await getPortfolioRebalance(portfolioId);
      finalPatrimonyInput = 0;
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

<main class="mx-auto max-w-6xl space-y-6 p-4">
  <div class="flex flex-wrap items-center justify-between gap-3">
    <div>
      <h1 class="text-2xl font-bold">Rebalanceamento</h1>
      <p class="text-sm opacity-70">
        Compare alocação atual com metas da carteira e veja quanto falta por classe e por ativo.
      </p>
    </div>
    <div class="flex flex-wrap items-center gap-2">
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
  </div>

  {#if error}
    <DismissibleAlert variant="error" text={error} on:dismiss={() => (error = '')} />
  {/if}

  {#if loading}
    <p class="text-sm opacity-70">Carregando…</p>
  {:else if !snapshot}
    <p class="text-sm opacity-70">Nenhuma carteira selecionada.</p>
  {:else}
    <section class="rounded-box bg-base-100 p-4 shadow-sm">
      <h2 class="mb-3 text-lg font-semibold">Balanceamento desejado</h2>
      <p class="mb-4 text-sm opacity-70">
        Patrimônio (balanceamento): {formatBrl(snapshot.patrimony_brl)} — previdência e outros
        excluídos da soma
        {#if snapshot.usd_brl_rate != null}
          · USD/BRL: {snapshot.usd_brl_rate.toLocaleString('pt-BR', {
            minimumFractionDigits: 4,
            maximumFractionDigits: 4
          })}
        {/if}
      </p>
      <div class="overflow-x-auto">
        <table class="table table-sm">
          <thead>
            <tr>
              <th>Ativo</th>
              <th class="text-right">Valor (R$)</th>
              <th class="text-right">Porcentagem</th>
              <th class="text-right">Faltando</th>
              <th class="text-right min-w-[10rem]">Faltando (patrimônio final)</th>
            </tr>
          </thead>
          <tbody>
            {#each snapshot.classes as row (row.display_class)}
              {@const projectedGap = computeProjectedClassGap(
                row.current_value_brl,
                row.target_percent,
                finalPatrimonyInput > 0 ? finalPatrimonyInput : null
              )}
              <tr>
                <td>{row.label}</td>
                <td class="text-right">{formatBrl(row.current_value_brl)}</td>
                <td class="text-right">{formatPercent(row.target_percent)}</td>
                <td class="text-right">{formatBrl(row.gap_brl)}</td>
                <td class="text-right">{formatBrl(projectedGap)}</td>
              </tr>
            {/each}
            <tr class="font-semibold">
              <td>TOTAL</td>
              <td class="text-right">{formatBrl(snapshot.patrimony_brl)}</td>
              <td class="text-right">100,00%</td>
              <td class="text-right">{formatBrl(snapshot.total_gap_brl)}</td>
              <td class="text-right">
                <div class="flex flex-col items-end gap-1">
                  <BrDecimalInput
                    bind:value={finalPatrimonyInput}
                    label="Patrimônio final"
                    inputClass="input input-bordered input-sm w-full max-w-[11rem] text-right font-normal"
                  />
                  {#if projectedTotalGap != null}
                    <span class="text-xs font-normal opacity-70">
                      Faltando: {formatBrl(projectedTotalGap)}
                    </span>
                  {/if}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="rounded-box bg-base-100 p-4 shadow-sm">
      <h2 class="mb-3 text-lg font-semibold">Relação ETF / Ação</h2>
      <p class="mb-4 text-sm opacity-70">Sub-divisão dentro de Ações/ETF BR.</p>
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
    </section>

    <section class="rounded-box bg-base-100 p-4 shadow-sm">
      <h2 class="mb-3 text-lg font-semibold">Por ativo</h2>
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
        finalPatrimonyBrl={finalPatrimonyInput > 0 ? finalPatrimonyInput : null}
      />
    </section>
  {/if}
</main>

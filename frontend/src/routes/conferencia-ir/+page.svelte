<script lang="ts">
  import { onMount } from 'svelte';

  import type { AssetMarket, AssetType } from '$lib/api/assets';
  import {
    createYearSnapshot,
    getAnnualIrReport,
    getAnnualIrReportCsvUrl,
    listYearSnapshots,
    type AnnualIrReport,
    type YearSnapshotSummary
  } from '$lib/api/annualIrReport';
  import { parseApiError } from '$lib/api/parseApiError';
  import { getActivePortfolioId, listPortfolios, setActivePortfolioId, type Portfolio } from '$lib/api/portfolios';
  import { formatAssetTypeForDisplay } from '$lib/assetLabels';
  import { formatMoneyAmount } from '$lib/assetLabels';
  import AppPageShell from '$lib/components/AppPageShell.svelte';
  import DismissibleAlert from '$lib/components/DismissibleAlert.svelte';
  import EmptyStateCallout from '$lib/components/EmptyStateCallout.svelte';
  import PageHero from '$lib/components/PageHero.svelte';
  import PageSection from '$lib/components/PageSection.svelte';
  import { NO_PORTFOLIO_EMPTY_STATE } from '$lib/features/onboarding/emptyStateCopy';
  import { PORTFOLIO_SELECT_HEADER_TEST_ID } from '$lib/features/ferramentas/headerPortfolioSelect';
  import PortfolioWorkspaceBarPanel from '$lib/features/portfolios/PortfolioWorkspaceBarPanel.svelte';
  import { resolveActivePortfolioId } from '$lib/features/portfolios/resolveActivePortfolioId';
  import {
    PAGE_BACKGROUND_CLASS,
    PAGE_HERO_DASHBOARD_ACTION_BTN_CLASS
  } from '$lib/layout/pageVisual';
  import { buildAnnualIrYearOptions } from '$lib/features/ir/annualIrYears';
  import {
    annualIrPositionInvestedAmount,
    excludeFixedIncomePositions,
    filterAnnualIrPayments,
    filterAnnualIrPositions,
    filterAnnualIrSummary,
    flattenAnnualIrSummary,
    sortAnnualIrPayments,
    sortAnnualIrPositions,
    sortAnnualIrSummaryRows,
    toggleSortDirection,
    type AnnualIrPaymentSortKey,
    type AnnualIrPositionSortKey,
    type AnnualIrSummarySortKey,
    type SortDirection
  } from '$lib/features/ir/annualIrTable';
  import { downloadAnnualIrExcel } from '$lib/features/ir/exportAnnualIrReport';
  import DividendTablePagination from '$lib/features/proventos/DividendTablePagination.svelte';
  import {
    DEFAULT_DIVIDEND_PAGE_SIZE,
    paginateList,
    type PageSizeOption
  } from '$lib/features/proventos/paginateList';
  import { formatQuantityForDisplay } from '$lib/features/portfolios/positionMetrics';
  import { formatTickerForDisplay } from '$lib/formatTickerForDisplay';
  import {
    formatMarketForDisplay,
    formatPaymentTypeForDisplay,
    paymentTypeOptions,
    type DividendPaymentType
  } from '$lib/proventoLabels';

  type TabId = 'detalhado' | 'resumo' | 'posicoes';

  const paymentTypes = paymentTypeOptions().map((option) => option.value);
  const yearOptions = buildAnnualIrYearOptions();
  const assetTypeOptions: { value: AssetType; label: string }[] = [
    'stock',
    'etf',
    'fii',
    'fixed_income',
    'crypto',
    'pension',
    'other'
  ].map((value) => ({
    value: value as AssetType,
    label: formatAssetTypeForDisplay(value as AssetType)
  }));

  let portfolios: Portfolio[] = [];
  let activePortfolioId: number | null = null;
  let selectedYear = new Date().getFullYear();
  let activeTab: TabId = 'detalhado';
  let report: AnnualIrReport | null = null;
  let snapshots: YearSnapshotSummary[] = [];
  let loading = false;
  let snapshotLoading = false;
  let error = '';
  let message = '';

  let filterAssetType: '' | AssetType = '';
  let filterPaymentType: '' | DividendPaymentType = '';
  let filterMarket: '' | AssetMarket = '';
  let currentPage = 1;
  let pageSize: PageSizeOption = DEFAULT_DIVIDEND_PAGE_SIZE;

  let paymentSortKey: AnnualIrPaymentSortKey = 'payment_date';
  let paymentSortDirection: SortDirection = 'desc';
  let summarySortKey: AnnualIrSummarySortKey = 'symbol';
  let summarySortDirection: SortDirection = 'asc';
  let positionSortKey: AnnualIrPositionSortKey = 'symbol';
  let positionSortDirection: SortDirection = 'asc';

  $: selectedPortfolio =
    portfolios.find((portfolio) => portfolio.id === activePortfolioId) ?? null;
  $: activePortfolioName = selectedPortfolio?.name ?? '';
  $: hasSnapshotForYear = snapshots.some((snapshot) => snapshot.year === selectedYear);

  $: filteredPayments =
    report == null
      ? []
      : filterAnnualIrPayments(report.payments, {
          assetType: filterAssetType,
          paymentType: filterPaymentType,
          market: filterMarket
        });
  $: sortedPayments = sortAnnualIrPayments(
    filteredPayments,
    paymentSortKey,
    paymentSortDirection
  );
  $: paymentPagination = paginateList(sortedPayments, { page: currentPage, pageSize });

  $: filteredSummary =
    report == null
      ? []
      : filterAnnualIrSummary(report.summary_by_asset, {
          assetType: filterAssetType,
          market: filterMarket
        });
  $: flattenedSummary = flattenAnnualIrSummary(filteredSummary);
  $: sortedSummary = sortAnnualIrSummaryRows(
    flattenedSummary,
    summarySortKey,
    summarySortDirection
  );
  $: summaryPagination = paginateList(sortedSummary, { page: currentPage, pageSize });

  $: eligiblePositions =
    report == null ? [] : excludeFixedIncomePositions(report.positions);
  $: filteredPositions = filterAnnualIrPositions(eligiblePositions, {
    assetType: filterAssetType,
    market: filterMarket
  });
  $: sortedPositions = sortAnnualIrPositions(
    filteredPositions,
    positionSortKey,
    positionSortDirection
  );
  $: positionPagination = paginateList(sortedPositions, { page: currentPage, pageSize });

  function resetPagination() {
    currentPage = 1;
  }

  function handleTabChange(tab: TabId) {
    activeTab = tab;
    resetPagination();
  }

  function handleFilterAssetTypeChange(event: Event) {
    filterAssetType = (event.currentTarget as HTMLSelectElement).value as '' | AssetType;
    resetPagination();
  }

  function handleFilterPaymentTypeChange(event: Event) {
    filterPaymentType = (event.currentTarget as HTMLSelectElement).value as '' | DividendPaymentType;
    resetPagination();
  }

  function handleFilterMarketChange(event: Event) {
    filterMarket = (event.currentTarget as HTMLSelectElement).value as '' | AssetMarket;
    resetPagination();
  }

  function handlePaymentSort(key: AnnualIrPaymentSortKey) {
    if (paymentSortKey === key) {
      paymentSortDirection = toggleSortDirection(paymentSortDirection);
    } else {
      paymentSortKey = key;
      paymentSortDirection = key === 'payment_date' || key === 'amount' ? 'desc' : 'asc';
    }
    resetPagination();
  }

  function handleSummarySort(key: AnnualIrSummarySortKey) {
    if (summarySortKey === key) {
      summarySortDirection = toggleSortDirection(summarySortDirection);
    } else {
      summarySortKey = key;
      summarySortDirection = key === 'total' ? 'desc' : 'asc';
    }
    resetPagination();
  }

  function handlePositionSort(key: AnnualIrPositionSortKey) {
    if (positionSortKey === key) {
      positionSortDirection = toggleSortDirection(positionSortDirection);
    } else {
      positionSortKey = key;
      positionSortDirection =
        key === 'quantity' || key === 'average_price' || key === 'invested_amount' ? 'desc' : 'asc';
    }
    resetPagination();
  }

  function sortIndicator(activeKey: string, key: string, direction: SortDirection): string {
    if (activeKey !== key) {
      return '';
    }
    return direction === 'asc' ? ' ↑' : ' ↓';
  }

  async function loadReport() {
    if (activePortfolioId == null) {
      report = null;
      snapshots = [];
      return;
    }
    loading = true;
    error = '';
    try {
      const [reportResult, snapshotList] = await Promise.all([
        getAnnualIrReport(activePortfolioId, selectedYear),
        listYearSnapshots(activePortfolioId)
      ]);
      report = reportResult;
      snapshots = snapshotList;
      resetPagination();
    } catch (err) {
      error = parseApiError(err);
      report = null;
    } finally {
      loading = false;
    }
  }

  async function handlePortfolioSelect(event: CustomEvent<number>) {
    const id = event.detail;
    if (id === activePortfolioId) {
      return;
    }
    activePortfolioId = id;
    try {
      await setActivePortfolioId(id);
      await loadReport();
    } catch (err) {
      error = parseApiError(err);
    }
  }

  async function handleYearChange(event: Event) {
    const target = event.currentTarget as HTMLSelectElement;
    selectedYear = Number(target.value);
    await loadReport();
  }

  async function handleFreezeSnapshot(replace = false) {
    if (activePortfolioId == null) {
      return;
    }
    if (hasSnapshotForYear && !replace) {
      const confirmed = window.confirm(
        `Já existe snapshot para ${selectedYear}. Deseja sobrescrever com as posições atuais?`
      );
      if (!confirmed) {
        return;
      }
      return handleFreezeSnapshot(true);
    }

    snapshotLoading = true;
    error = '';
    message = '';
    try {
      await createYearSnapshot(activePortfolioId, { year: selectedYear, replace });
      message = `Posições congeladas em 31/12/${selectedYear}.`;
      await loadReport();
      handleTabChange('posicoes');
    } catch (err) {
      error = parseApiError(err);
    } finally {
      snapshotLoading = false;
    }
  }

  function handleExportExcel() {
    if (!report || !selectedPortfolio) {
      return;
    }
    downloadAnnualIrExcel(report, selectedPortfolio.name);
  }

  function handleExportCsv() {
    if (activePortfolioId == null) {
      return;
    }
    window.open(getAnnualIrReportCsvUrl(activePortfolioId, selectedYear), '_blank');
  }

  onMount(async () => {
    error = '';
    try {
      const [portfoliosResult, activeResult] = await Promise.all([
        listPortfolios(),
        getActivePortfolioId()
      ]);
      portfolios = portfoliosResult;
      activePortfolioId = resolveActivePortfolioId(activeResult, portfoliosResult);
      await loadReport();
    } catch (err) {
      error = parseApiError(err);
    }
  });
</script>

<svelte:head>
  <title>Conferência anual de IR</title>
</svelte:head>

<main class={PAGE_BACKGROUND_CLASS}>
  <AppPageShell paddingY="py-4" class="flex flex-col gap-3">
  <PageHero
    title="Conferência anual de IR"
    subtitle="Proventos discriminados por ativo e tipo, resumo anual e posições congeladas em 31/12."
    variant="dashboard"
  >
    <div slot="actions" class="flex flex-wrap items-center gap-2">
      <button
        type="button"
        class={PAGE_HERO_DASHBOARD_ACTION_BTN_CLASS}
        data-testid="ir-freeze-snapshot-btn"
        disabled={activePortfolioId == null || snapshotLoading}
        on:click={() => handleFreezeSnapshot(false)}
      >
        {#if snapshotLoading}
          <span class="loading loading-spinner loading-xs"></span>
        {/if}
        Congelar posições em 31/12/{selectedYear}
      </button>
      <button
        type="button"
        class={PAGE_HERO_DASHBOARD_ACTION_BTN_CLASS}
        data-testid="ir-export-csv-btn"
        disabled={!report}
        on:click={handleExportCsv}
      >
        Exportar CSV
      </button>
      <button
        type="button"
        class={PAGE_HERO_DASHBOARD_ACTION_BTN_CLASS}
        data-testid="ir-export-excel-btn"
        disabled={!report}
        on:click={handleExportExcel}
      >
        Exportar Excel
      </button>
    </div>
  </PageHero>

  <PortfolioWorkspaceBarPanel
    {portfolios}
    activeId={activePortfolioId}
    {activePortfolioName}
    showQuoteStatus={false}
    portfolioSelectTestId={PORTFOLIO_SELECT_HEADER_TEST_ID}
    testId="conferencia-ir-portfolio-bar"
    on:select={handlePortfolioSelect}
  />

  {#if error}
    <DismissibleAlert variant="error" on:dismiss={() => (error = '')}>{error}</DismissibleAlert>
  {/if}
  {#if message}
    <DismissibleAlert variant="success" on:dismiss={() => (message = '')}>{message}</DismissibleAlert>
  {/if}

  <PageSection>
  <div class="flex flex-wrap items-end gap-4">
        <label class="form-control w-full max-w-[10rem]">
          <span class="label-text">Ano</span>
          <select
            class="select select-bordered select-sm w-full"
            data-testid="ir-year-select"
            value={String(selectedYear)}
            on:change={handleYearChange}
          >
            {#each yearOptions as year (year)}
              <option value={String(year)}>{year}</option>
            {/each}
          </select>
        </label>
      </div>

      {#if report && !report.has_position_snapshot}
        <div class="alert alert-warning mt-3 text-sm" data-testid="ir-no-snapshot-warning">
          <span>
            Não há snapshot de posições para {selectedYear}. Congele em 31/12 antes de alterar a
            carteira para conferir quantidade e preço médio no IR.
          </span>
        </div>
      {/if}
  </PageSection>

  <PageSection>
  <div role="tablist" class="tabs tabs-boxed w-fit">
    <button
      type="button"
      role="tab"
      class="tab"
      class:tab-active={activeTab === 'detalhado'}
      data-testid="ir-tab-detalhado"
      on:click={() => handleTabChange('detalhado')}
    >
      Detalhado
    </button>
    <button
      type="button"
      role="tab"
      class="tab"
      class:tab-active={activeTab === 'resumo'}
      data-testid="ir-tab-resumo"
      on:click={() => handleTabChange('resumo')}
    >
      Resumo
    </button>
    <button
      type="button"
      role="tab"
      class="tab"
      class:tab-active={activeTab === 'posicoes'}
      data-testid="ir-tab-posicoes"
      on:click={() => handleTabChange('posicoes')}
    >
      Posições
    </button>
  </div>

  {#if loading}
    <div class="flex justify-center py-12">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
  {:else if activePortfolioId == null}
    <EmptyStateCallout {...NO_PORTFOLIO_EMPTY_STATE} testId="conferencia-ir-sem-carteira" />
  {:else if !report}
    <p class="text-base-content/70">Selecione uma carteira para carregar o relatório.</p>
  {:else}
    <div
      class="flex flex-wrap items-end gap-3 rounded-box border border-base-300 bg-base-100 p-4"
      data-testid="ir-filters"
    >
      <label class="form-control w-full max-w-xs">
        <span class="label-text">Tipo de ativo</span>
        <select
          class="select select-bordered select-sm w-full"
          data-testid="ir-filter-asset-type"
          value={filterAssetType}
          on:change={handleFilterAssetTypeChange}
        >
          <option value="">Todos os tipos</option>
          {#each assetTypeOptions as option (option.value)}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
      </label>

      <label class="form-control w-full max-w-xs">
        <span class="label-text">Classe</span>
        <select
          class="select select-bordered select-sm w-full"
          data-testid="ir-filter-market"
          value={filterMarket}
          on:change={handleFilterMarketChange}
        >
          <option value="">Todas as classes</option>
          <option value="national">Nacional</option>
          <option value="international">Internacional</option>
        </select>
      </label>

      {#if activeTab === 'detalhado'}
        <label class="form-control w-full max-w-xs">
          <span class="label-text">Tipo de provento</span>
          <select
            class="select select-bordered select-sm w-full"
            data-testid="ir-filter-payment-type"
            value={filterPaymentType}
            on:change={handleFilterPaymentTypeChange}
          >
            <option value="">Todos os proventos</option>
            {#each paymentTypes as paymentType (paymentType)}
              <option value={paymentType}>{formatPaymentTypeForDisplay(paymentType)}</option>
            {/each}
          </select>
        </label>
      {/if}
    </div>

    {#if activeTab === 'detalhado'}
      <DividendTablePagination
        position="top"
        bind:page={currentPage}
        bind:pageSize
        totalPages={paymentPagination.totalPages}
        totalItems={paymentPagination.totalItems}
        rangeStart={paymentPagination.rangeStart}
        rangeEnd={paymentPagination.rangeEnd}
        ariaLabel="Paginação do detalhado de proventos"
        emptyRangeLabel="Nenhum provento na página"
      />
      <div class="overflow-x-auto rounded-box border border-base-300">
        <table class="table table-zebra table-sm" data-testid="ir-table-detalhado">
          <thead>
            <tr>
              <th>
                <button type="button" class="btn btn-ghost btn-xs" on:click={() => handlePaymentSort('symbol')}>
                  Ativo{sortIndicator(paymentSortKey, 'symbol', paymentSortDirection)}
                </button>
              </th>
              <th>
                <button type="button" class="btn btn-ghost btn-xs" on:click={() => handlePaymentSort('asset_type')}>
                  Tipo do ativo{sortIndicator(paymentSortKey, 'asset_type', paymentSortDirection)}
                </button>
              </th>
              <th>
                <button type="button" class="btn btn-ghost btn-xs" on:click={() => handlePaymentSort('market')}>
                  Classe{sortIndicator(paymentSortKey, 'market', paymentSortDirection)}
                </button>
              </th>
              <th>
                <button type="button" class="btn btn-ghost btn-xs" on:click={() => handlePaymentSort('payment_type')}>
                  Provento{sortIndicator(paymentSortKey, 'payment_type', paymentSortDirection)}
                </button>
              </th>
              <th>
                <button type="button" class="btn btn-ghost btn-xs" on:click={() => handlePaymentSort('payment_date')}>
                  Data{sortIndicator(paymentSortKey, 'payment_date', paymentSortDirection)}
                </button>
              </th>
              <th class="text-right">
                <button type="button" class="btn btn-ghost btn-xs" on:click={() => handlePaymentSort('amount')}>
                  Valor{sortIndicator(paymentSortKey, 'amount', paymentSortDirection)}
                </button>
              </th>
              <th>CNPJ empresa</th>
              <th>CNPJ fonte pagadora</th>
            </tr>
          </thead>
          <tbody>
            {#if paymentPagination.totalItems === 0}
              <tr>
                <td colspan="8" class="text-center text-base-content/60">
                  Nenhum provento em {selectedYear} com os filtros atuais.
                </td>
              </tr>
            {:else}
              {#each paymentPagination.items as payment (payment.payment_date + payment.symbol + payment.payment_type + payment.amount)}
                <tr>
                  <td>{formatTickerForDisplay(payment.symbol)}</td>
                  <td>{formatAssetTypeForDisplay(payment.asset_type)}</td>
                  <td>{formatMarketForDisplay(payment.market)}</td>
                  <td>{formatPaymentTypeForDisplay(payment.payment_type)}</td>
                  <td>{payment.payment_date}</td>
                  <td class="text-right">{formatMoneyAmount(payment.amount, payment.currency)}</td>
                  <td>{payment.company_cnpj ?? '—'}</td>
                  <td>{payment.payer_cnpj ?? '—'}</td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>
      <DividendTablePagination
        bind:page={currentPage}
        bind:pageSize
        totalPages={paymentPagination.totalPages}
        totalItems={paymentPagination.totalItems}
        rangeStart={paymentPagination.rangeStart}
        rangeEnd={paymentPagination.rangeEnd}
        ariaLabel="Paginação do detalhado de proventos"
        emptyRangeLabel="Nenhum provento na página"
      />
    {:else if activeTab === 'resumo'}
      <DividendTablePagination
        position="top"
        bind:page={currentPage}
        bind:pageSize
        totalPages={summaryPagination.totalPages}
        totalItems={summaryPagination.totalItems}
        rangeStart={summaryPagination.rangeStart}
        rangeEnd={summaryPagination.rangeEnd}
        ariaLabel="Paginação do resumo de proventos"
        emptyRangeLabel="Nenhum ativo na página"
      />
      <div class="overflow-x-auto rounded-box border border-base-300">
        <table class="table table-zebra table-sm" data-testid="ir-table-resumo">
          <thead>
            <tr>
              <th>
                <button type="button" class="btn btn-ghost btn-xs" on:click={() => handleSummarySort('symbol')}>
                  Ativo{sortIndicator(summarySortKey, 'symbol', summarySortDirection)}
                </button>
              </th>
              <th>
                <button type="button" class="btn btn-ghost btn-xs" on:click={() => handleSummarySort('asset_type')}>
                  Tipo do ativo{sortIndicator(summarySortKey, 'asset_type', summarySortDirection)}
                </button>
              </th>
              <th>
                <button type="button" class="btn btn-ghost btn-xs" on:click={() => handleSummarySort('market')}>
                  Classe{sortIndicator(summarySortKey, 'market', summarySortDirection)}
                </button>
              </th>
              {#each paymentTypes as paymentType (paymentType)}
                <th class="text-right">{formatPaymentTypeForDisplay(paymentType)}</th>
              {/each}
              <th class="text-right">
                <button type="button" class="btn btn-ghost btn-xs" on:click={() => handleSummarySort('total')}>
                  Total{sortIndicator(summarySortKey, 'total', summarySortDirection)}
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {#if summaryPagination.totalItems === 0}
              <tr>
                <td colspan={paymentTypes.length + 4} class="text-center text-base-content/60">
                  Nenhum provento em {selectedYear} com os filtros atuais.
                </td>
              </tr>
            {:else}
              {#each summaryPagination.items as row (row.asset_id + row.currency)}
                <tr>
                  <td>{formatTickerForDisplay(row.symbol)}</td>
                  <td>{formatAssetTypeForDisplay(row.asset_type)}</td>
                  <td>{formatMarketForDisplay(row.market)}</td>
                  {#each paymentTypes as paymentType (paymentType)}
                    <td class="text-right">
                      {formatMoneyAmount(row.totals_by_type[paymentType] ?? 0, row.currency)}
                    </td>
                  {/each}
                  <td class="text-right">{formatMoneyAmount(row.total, row.currency)}</td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>
      <DividendTablePagination
        bind:page={currentPage}
        bind:pageSize
        totalPages={summaryPagination.totalPages}
        totalItems={summaryPagination.totalItems}
        rangeStart={summaryPagination.rangeStart}
        rangeEnd={summaryPagination.rangeEnd}
        ariaLabel="Paginação do resumo de proventos"
        emptyRangeLabel="Nenhum ativo na página"
      />
    {:else if !report.has_position_snapshot}
      <p class="text-base-content/70" data-testid="ir-positions-empty">
        Congele o snapshot de 31/12/{selectedYear} para ver quantidade e preço médio.
      </p>
    {:else}
      <DividendTablePagination
        position="top"
        bind:page={currentPage}
        bind:pageSize
        totalPages={positionPagination.totalPages}
        totalItems={positionPagination.totalItems}
        rangeStart={positionPagination.rangeStart}
        rangeEnd={positionPagination.rangeEnd}
        ariaLabel="Paginação das posições"
        emptyRangeLabel="Nenhuma posição na página"
      />
      <div class="overflow-x-auto rounded-box border border-base-300">
        <table class="table table-zebra table-sm" data-testid="ir-table-posicoes">
          <thead>
            <tr>
              <th>
                <button type="button" class="btn btn-ghost btn-xs" on:click={() => handlePositionSort('symbol')}>
                  Ativo{sortIndicator(positionSortKey, 'symbol', positionSortDirection)}
                </button>
              </th>
              <th>
                <button type="button" class="btn btn-ghost btn-xs" on:click={() => handlePositionSort('asset_type')}>
                  Tipo do ativo{sortIndicator(positionSortKey, 'asset_type', positionSortDirection)}
                </button>
              </th>
              <th>
                <button type="button" class="btn btn-ghost btn-xs" on:click={() => handlePositionSort('market')}>
                  Classe{sortIndicator(positionSortKey, 'market', positionSortDirection)}
                </button>
              </th>
              <th class="text-right">
                <button type="button" class="btn btn-ghost btn-xs" on:click={() => handlePositionSort('quantity')}>
                  Quantidade{sortIndicator(positionSortKey, 'quantity', positionSortDirection)}
                </button>
              </th>
              <th class="text-right">
                <button type="button" class="btn btn-ghost btn-xs" on:click={() => handlePositionSort('average_price')}>
                  Preço médio{sortIndicator(positionSortKey, 'average_price', positionSortDirection)}
                </button>
              </th>
              <th class="text-right">
                <button
                  type="button"
                  class="btn btn-ghost btn-xs"
                  on:click={() => handlePositionSort('invested_amount')}
                >
                  Valor aplicado{sortIndicator(positionSortKey, 'invested_amount', positionSortDirection)}
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {#if positionPagination.totalItems === 0}
              <tr>
                <td colspan="6" class="text-center text-base-content/60">
                  Nenhuma posição em {selectedYear} com os filtros atuais.
                </td>
              </tr>
            {:else}
              {#each positionPagination.items as position (position.symbol)}
                <tr>
                  <td>{formatTickerForDisplay(position.symbol)}</td>
                  <td>{formatAssetTypeForDisplay(position.asset_type)}</td>
                  <td>{formatMarketForDisplay(position.market)}</td>
                  <td class="text-right">{formatQuantityForDisplay(position.quantity)}</td>
                  <td class="text-right">
                    {formatMoneyAmount(position.average_price, position.currency)}
                  </td>
                  <td class="text-right">
                    {formatMoneyAmount(
                      annualIrPositionInvestedAmount(position),
                      position.currency
                    )}
                  </td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>
      <DividendTablePagination
        bind:page={currentPage}
        bind:pageSize
        totalPages={positionPagination.totalPages}
        totalItems={positionPagination.totalItems}
        rangeStart={positionPagination.rangeStart}
        rangeEnd={positionPagination.rangeEnd}
        ariaLabel="Paginação das posições"
        emptyRangeLabel="Nenhuma posição na página"
      />
    {/if}
  {/if}
  </PageSection>
  </AppPageShell>
</main>

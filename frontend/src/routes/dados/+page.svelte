<script lang="ts">
  import { onMount } from 'svelte';

  import {
    downloadAssetsExport,
    downloadCsvText,
    downloadExportDocument,
    downloadFullBackup,
    exportAssets,
    exportDividendsCsv,
    exportFullBackup,
    exportPortfolio
  } from '$lib/api/data';
  import { parseApiError } from '$lib/api/parseApiError';
  import {
    getActivePortfolioId,
    listPortfolios,
    setActivePortfolioId,
    type Portfolio
  } from '$lib/api/portfolios';
  import DismissibleAlert from '$lib/components/DismissibleAlert.svelte';
  import AssetBulkImport from '$lib/features/assets/AssetBulkImport.svelte';
  import PortfolioImportWizard from '$lib/features/portfolios/PortfolioImportWizard.svelte';
  import PortfolioSelect from '$lib/features/portfolios/PortfolioSelect.svelte';
  import DividendBulkImport from '$lib/features/proventos/DividendBulkImport.svelte';

  let portfolios: Portfolio[] = [];
  let activeId: number | null = null;
  let dividendsExportId: number | null = null;
  let dividendsExportDefaultApplied = false;
  let message = '';
  let error = '';
  let exportingBackup = false;
  let exportingPortfolio = false;
  let exportingAssets = false;
  let exportingDividends = false;

  $: activePortfolio = portfolios.find((p) => p.id === activeId) ?? null;
  $: dividendsExportPortfolio = portfolios.find((p) => p.id === dividendsExportId) ?? null;

  $: if (
    !dividendsExportDefaultApplied &&
    dividendsExportId == null &&
    activeId != null &&
    portfolios.some((p) => p.id === activeId)
  ) {
    dividendsExportId = activeId;
    dividendsExportDefaultApplied = true;
  }

  async function refreshPortfolios() {
    portfolios = await listPortfolios();
    let serverActiveId = await getActivePortfolioId();
    if (serverActiveId != null && !portfolios.some((p) => p.id === serverActiveId)) {
      await setActivePortfolioId(null);
      serverActiveId = null;
    }
    activeId = serverActiveId ?? portfolios[0]?.id ?? null;
    if (activeId != null && serverActiveId !== activeId) {
      await setActivePortfolioId(activeId);
    }
  }

  async function loadPage() {
    error = '';
    try {
      await refreshPortfolios();
    } catch (err) {
      error = parseApiError(err, 'Não foi possível carregar carteiras.');
    }
  }

  onMount(() => {
    void loadPage();
  });

  async function handlePortfolioSelect(id: number) {
    if (id === activeId) {
      return;
    }
    activeId = id;
    try {
      await setActivePortfolioId(id);
      message = 'Carteira ativa atualizada.';
    } catch (err) {
      error = parseApiError(err, 'Não foi possível trocar a carteira ativa.');
    }
  }

  function handleDividendsExportSelect(event: Event) {
    const raw = (event.currentTarget as HTMLSelectElement).value;
    const id = raw === '' ? null : Number(raw);
    dividendsExportId = Number.isInteger(id) && id > 0 ? id : null;
  }

  async function handleExportFullBackup() {
    exportingBackup = true;
    error = '';
    try {
      const doc = await exportFullBackup();
      downloadFullBackup(doc);
      message = 'Backup completo baixado.';
    } catch (err) {
      error = parseApiError(err, 'Falha ao exportar backup completo.');
    } finally {
      exportingBackup = false;
    }
  }

  async function handleExportPortfolio() {
    if (activeId == null) {
      error = 'Selecione uma carteira para exportar.';
      return;
    }
    exportingPortfolio = true;
    error = '';
    try {
      const doc = await exportPortfolio(activeId);
      const safeName = (activePortfolio?.name ?? 'carteira').replace(/\s+/g, '-').toLowerCase();
      downloadExportDocument(doc, `${safeName}.carteira.json`);
      message = 'Carteira exportada.';
    } catch (err) {
      error = parseApiError(err, 'Falha ao exportar carteira.');
    } finally {
      exportingPortfolio = false;
    }
  }

  async function handleExportAssets() {
    exportingAssets = true;
    error = '';
    try {
      const doc = await exportAssets();
      downloadAssetsExport(doc);
      message = 'Catálogo de ativos exportado.';
    } catch (err) {
      error = parseApiError(err, 'Falha ao exportar catálogo de ativos.');
    } finally {
      exportingAssets = false;
    }
  }

  async function handleExportDividends() {
    if (dividendsExportId == null) {
      error = 'Selecione uma carteira para exportar proventos.';
      return;
    }
    exportingDividends = true;
    error = '';
    try {
      const csv = await exportDividendsCsv(dividendsExportId);
      const safeName = (dividendsExportPortfolio?.name ?? 'proventos')
        .replace(/\s+/g, '-')
        .toLowerCase();
      downloadCsvText(csv, `${safeName}.proventos.csv`);
      message = 'Proventos exportados em CSV.';
    } catch (err) {
      error = parseApiError(err, 'Falha ao exportar proventos.');
    } finally {
      exportingDividends = false;
    }
  }

  async function handleImported(portfolioId: number) {
    await setActivePortfolioId(portfolioId);
    dividendsExportDefaultApplied = false;
    dividendsExportId = null;
    await refreshPortfolios();
    message = 'Carteira importada com sucesso.';
  }
</script>

<svelte:head>
  <title>Dados — Carteira de Investimentos</title>
</svelte:head>

<main class="min-h-screen w-full bg-base-200">
  <div class="mx-auto flex w-full min-w-0 max-w-6xl flex-col gap-6 px-4 py-8">
    <section
      class="w-full min-w-0 rounded-box bg-gradient-to-r from-neutral to-base-300 px-6 py-10 text-neutral-content"
    >
      <h1 class="text-4xl font-bold">Dados</h1>
      <p class="mt-2 max-w-2xl text-neutral-content/80">
        Exportação e importação de backup completo, carteiras, catálogo de ativos e proventos.
      </p>
    </section>

    <DismissibleAlert text={message} variant="success" on:dismiss={() => (message = '')} />
    <DismissibleAlert text={error} variant="error" on:dismiss={() => (error = '')} />

    <section class="card bg-base-100 shadow" data-testid="dados-backup">
      <div class="card-body gap-4">
        <div>
          <p class="text-sm font-semibold uppercase tracking-wide text-primary">Backup</p>
          <h2 class="card-title">Backup completo</h2>
          <p class="text-sm text-base-content/70">
            Exporta todas as carteiras, posições, ativos, proventos e preferências em um único JSON.
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            class="btn btn-primary btn-sm"
            type="button"
            disabled={exportingBackup}
            on:click={handleExportFullBackup}
          >
            {exportingBackup ? 'Exportando…' : 'Exportar backup JSON'}
          </button>
        </div>
        <div class="rounded-box border border-dashed border-base-300 bg-base-200/50 p-4">
          <p class="text-sm font-medium">Importar backup completo</p>
          <p class="mt-1 text-sm text-base-content/60">
            Em breve — restauração de backup completo estará disponível nesta seção.
          </p>
        </div>
      </div>
    </section>

    <section class="card bg-base-100 shadow" data-testid="dados-carteira">
      <div class="card-body gap-4">
        <div>
          <p class="text-sm font-semibold uppercase tracking-wide text-primary">Carteira</p>
          <h2 class="card-title">Exportar e importar carteira</h2>
          <p class="text-sm text-base-content/70">
            JSON v2 com posições e proventos da carteira selecionada. A importação cria uma nova carteira.
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <span class="text-sm font-medium">Carteira ativa:</span>
          <PortfolioSelect
            {portfolios}
            activeId={activeId}
            disabled={portfolios.length === 0}
            on:select={(event) => handlePortfolioSelect(event.detail)}
          />
          <button
            class="btn btn-outline btn-sm"
            type="button"
            disabled={activeId == null || exportingPortfolio}
            on:click={handleExportPortfolio}
          >
            {exportingPortfolio ? 'Exportando…' : 'Exportar carteira JSON'}
          </button>
        </div>
        <PortfolioImportWizard onImported={handleImported} />
      </div>
    </section>

    <section class="card bg-base-100 shadow" data-testid="dados-ativos">
      <div class="card-body gap-4">
        <div>
          <p class="text-sm font-semibold uppercase tracking-wide text-primary">Ativos</p>
          <h2 class="card-title">Catálogo de ativos</h2>
          <p class="text-sm text-base-content/70">
            Exporte o catálogo global ou importe tickers em lote via yfinance.
          </p>
        </div>
        <button
          class="btn btn-outline btn-sm w-fit"
          type="button"
          disabled={exportingAssets}
          on:click={handleExportAssets}
        >
          {exportingAssets ? 'Exportando…' : 'Exportar catálogo JSON'}
        </button>
        <AssetBulkImport />
      </div>
    </section>

    <section class="card bg-base-100 shadow" data-testid="dados-proventos">
      <div class="card-body gap-4">
        <div>
          <p class="text-sm font-semibold uppercase tracking-wide text-primary">Proventos</p>
          <h2 class="card-title">Exportar e importar proventos</h2>
          <p class="text-sm text-base-content/70">
            Exporte proventos filtrados por carteira em CSV ou importe em lote.
          </p>
        </div>
        <div class="flex flex-wrap items-end gap-3">
          <label class="form-control">
            <span class="label-text">Carteira para exportação</span>
            <select
              class="select select-bordered select-sm w-full max-w-xs"
              value={dividendsExportId == null ? '' : String(dividendsExportId)}
              disabled={portfolios.length === 0}
              aria-label="Carteira para exportação de proventos"
              on:change={handleDividendsExportSelect}
            >
              {#if portfolios.length === 0}
                <option value="">Nenhuma carteira</option>
              {:else}
                {#each portfolios as portfolio (portfolio.id)}
                  <option value={String(portfolio.id)}>{portfolio.name}</option>
                {/each}
              {/if}
            </select>
          </label>
          <button
            class="btn btn-outline btn-sm"
            type="button"
            disabled={dividendsExportId == null || exportingDividends}
            on:click={handleExportDividends}
          >
            {exportingDividends ? 'Exportando…' : 'Exportar proventos CSV'}
          </button>
        </div>
        <DividendBulkImport {portfolios} activePortfolioId={activeId} />
      </div>
    </section>
  </div>
</main>

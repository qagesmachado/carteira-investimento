<script lang="ts">
  import {
    createBulkAssets,
    lookupToAssetCreate,
    previewBulkAssets,
    type AssetCreate,
    type BulkPreviewItem
  } from '$lib/api/assets';
  import {
    buildPreviewTableRows,
    canSelectPreviewItem,
    getPayloadForPreviewItem
  } from './bulkPreviewHelpers';
  import DismissibleAlert from '$lib/components/DismissibleAlert.svelte';
  import BulkPreviewEditModal from './BulkPreviewEditModal.svelte';
  import { parseSymbolListFromFileContent, parseSymbolListFromText, formatSymbolListForDisplay } from './parseSymbolList';

  export let onSaved: () => void | Promise<void> = () => undefined;

  let pasteText = '';
  let parsedSymbols: string[] = [];
  let previewItems: BulkPreviewItem[] = [];
  let draftBySymbol: Record<string, AssetCreate> = {};
  let selected = new Set<string>();
  let selectedFileName = '';
  let isDragging = false;
  let loadingPreview = false;
  let loadingSave = false;
  let message = '';
  let error = '';
  let warning = '';

  let modalOpen = false;
  let editingSymbol = '';
  let editingAsset: AssetCreate | null = null;

  $: previewTableRows = buildPreviewTableRows(previewItems, draftBySymbol);

  function duplicateMessage(duplicateCount: number): string {
    return duplicateCount > 0 ? ` ${duplicateCount} duplicata(s) removida(s).` : '';
  }

  function parseInput(): number {
    const originalText = pasteText;
    const fromText = parseSymbolListFromText(pasteText);
    parsedSymbols = fromText.symbols;
    previewItems = [];
    draftBySymbol = {};
    selected = new Set();
    if (parsedSymbols.length > 0) {
      pasteText = formatSymbolListForDisplay(parsedSymbols, originalText);
    }
    const dupNote = duplicateMessage(fromText.duplicateCount);
    message =
      parsedSymbols.length > 0
        ? `${parsedSymbols.length} ticker(s) identificado(s).${dupNote} Busque no yfinance para pré-visualizar.`
        : 'Nenhum ticker válido encontrado.';
    error = '';
    return fromText.duplicateCount;
  }

  async function processSelectedFile(file: File) {
    const content = await file.text();
    const parsed = parseSymbolListFromFileContent(content, file.name);
    parsedSymbols = parsed.symbols;
    pasteText = formatSymbolListForDisplay(parsedSymbols, content);
    previewItems = [];
    draftBySymbol = {};
    selected = new Set();
    selectedFileName = file.name;
    const dupNote = duplicateMessage(parsed.duplicateCount);
    message = `${parsedSymbols.length} ticker(s) no arquivo «${file.name}».${dupNote} Busque no yfinance para pré-visualizar.`;
    error = '';
  }

  async function handleFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    await processSelectedFile(file);
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    isDragging = true;
  }

  function handleDragLeave() {
    isDragging = false;
  }

  async function handleDrop(event: DragEvent) {
    event.preventDefault();
    isDragging = false;
    const file = event.dataTransfer?.files?.[0];
    if (!file) {
      return;
    }
    const lower = file.name.toLowerCase();
    if (!lower.endsWith('.csv') && !lower.endsWith('.txt')) {
      error = 'Envie um arquivo .csv ou .txt.';
      return;
    }
    await processSelectedFile(file);
  }

  async function fetchPreview() {
    const duplicateCount = parseInput();
    if (parsedSymbols.length === 0) {
      error = 'Informe ao menos uma linha válida para pré-visualizar.';
      message = '';
      return;
    }

    loadingPreview = true;
    error = '';
    warning = '';
    message = duplicateCount > 0 ? `${duplicateCount} duplicata(s) removida(s) antes da busca.` : '';

    try {
      const response = await previewBulkAssets(parsedSymbols);
      previewItems = response.items;
      draftBySymbol = {};
      selected = new Set(
        previewItems.filter((item) => canSelectPreviewItem(item, draftBySymbol)).map((item) => item.symbol)
      );
      const readyCount = previewItems.filter((item) => canSelectPreviewItem(item, draftBySymbol)).length;
      message = `Pré-visualização de ${previewItems.length} ticker(s) (${readyCount} prontos para importar).${
        duplicateCount > 0 ? ` (${duplicateCount} duplicata(s) removida(s) antes da busca.)` : ''
      }`;
      warning = (response.warnings ?? []).join(' ');
    } catch {
      error = 'Não foi possível buscar os ativos em lote.';
    } finally {
      loadingPreview = false;
    }
  }

  function toggleRow(symbol: string, checked: boolean) {
    if (checked) {
      selected.add(symbol);
    } else {
      selected.delete(symbol);
    }
    selected = new Set(selected);
  }

  function openEditModal(item: BulkPreviewItem) {
    const payload = getPayloadForPreviewItem(item, draftBySymbol);
    if (!payload) {
      return;
    }
    editingSymbol = item.symbol;
    editingAsset = { ...payload };
    modalOpen = true;
  }

  function closeEditModal() {
    modalOpen = false;
    editingSymbol = '';
    editingAsset = null;
  }

  function confirmDraftEdit(payload: AssetCreate) {
    const rowKey = editingSymbol;
    draftBySymbol = { ...draftBySymbol, [rowKey]: payload };
    const item = previewItems.find((row) => row.symbol === rowKey);
    if (item && canSelectPreviewItem(item, draftBySymbol)) {
      selected.add(rowKey);
      selected = new Set(selected);
    }
    closeEditModal();
  }

  async function saveSelected() {
    const payloads: AssetCreate[] = previewItems
      .filter((item) => selected.has(item.symbol))
      .map((item) => getPayloadForPreviewItem(item, draftBySymbol))
      .filter((payload): payload is AssetCreate => payload !== null);

    if (payloads.length === 0) {
      error = 'Selecione ao menos um ativo válido para salvar.';
      return;
    }

    loadingSave = true;
    error = '';
    message = '';

    try {
      const response = await createBulkAssets(payloads);
      const created = response.results.filter((r) => r.status === 'created').length;
      const skipped = response.results.filter((r) => r.status === 'skipped').length;
      const failed = response.results.filter((r) => r.status === 'error').length;
      message = `Importação concluída: ${created} criado(s), ${skipped} ignorado(s), ${failed} erro(s).`;
      previewItems = [];
      parsedSymbols = [];
      pasteText = '';
      draftBySymbol = {};
      selectedFileName = '';
      selected = new Set();
      await onSaved();
    } catch {
      error = 'Não foi possível salvar os ativos em lote.';
    } finally {
      loadingSave = false;
    }
  }

</script>

<section class="card bg-base-100 shadow-xl">
  <div class="card-body gap-4">
    <div>
      <p class="text-sm font-semibold uppercase tracking-wide text-primary">Importação</p>
      <h2 class="card-title">Cadastro em lote</h2>
      <p class="text-sm text-base-content/70">
        Cole tickers separados por vírgula, ponto-e-vírgula ou quebra de linha, ou envie arquivo .csv / .txt.
      </p>
    </div>

    <label class="form-control">
      <span class="label"><span class="label-text">Tickers</span></span>
      <textarea
        bind:value={pasteText}
        class="textarea textarea-bordered font-mono text-sm"
        rows="3"
        placeholder="PETR4, BBSE3, VALE3"
      />
    </label>

    <div
      class="rounded-box border-2 border-dashed p-6 text-center transition-colors"
      class:border-primary={isDragging}
      class:bg-base-200={isDragging}
      role="region"
      aria-label="Área para arrastar arquivo de tickers"
      on:dragover={handleDragOver}
      on:dragleave={handleDragLeave}
      on:drop={handleDrop}
    >
      <p class="text-sm text-base-content/80">Arraste um arquivo .csv ou .txt aqui</p>
      <p class="my-2 text-xs text-base-content/60">ou</p>
      <label class="btn btn-outline btn-sm cursor-pointer">
        Escolher arquivo
        <input
          class="hidden"
          type="file"
          accept=".csv,.txt,text/plain"
          on:change={handleFileChange}
        />
      </label>
      {#if selectedFileName}
        <p class="mt-3 text-sm">
          Arquivo selecionado: <span class="font-mono font-semibold">{selectedFileName}</span>
        </p>
      {/if}
    </div>

    <div class="flex flex-wrap gap-2">
      <button class="btn btn-outline" type="button" on:click={parseInput}>Analisar lista</button>
      <button class="btn btn-primary" type="button" disabled={loadingPreview} on:click={fetchPreview}>
        {loadingPreview ? 'Buscando...' : 'Buscar no yfinance'}
      </button>
      {#if previewItems.length > 0}
        <button class="btn btn-secondary" type="button" disabled={loadingSave || selected.size === 0} on:click={saveSelected}>
          {loadingSave ? 'Salvando...' : `Salvar selecionados (${selected.size})`}
        </button>
      {/if}
    </div>

    <DismissibleAlert text={message} variant="success" on:dismiss={() => (message = '')} />
    <DismissibleAlert text={warning} variant="warning" on:dismiss={() => (warning = '')} />
    <DismissibleAlert text={error} variant="error" on:dismiss={() => (error = '')} />

    {#if previewItems.length > 0}
      <div class="overflow-x-auto">
        <table class="table table-zebra table-sm">
          <thead>
            <tr>
              <th />
              <th>Ticker</th>
              <th>Nome</th>
              <th>Tipo</th>
              <th>Moeda</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {#each previewTableRows as row (row.rowKey)}
              <tr>
                <td>
                  <input
                    type="checkbox"
                    class="checkbox checkbox-sm"
                    checked={selected.has(row.item.symbol)}
                    disabled={!row.canSelect}
                    on:change={(e) => toggleRow(row.item.symbol, e.currentTarget.checked)}
                  />
                </td>
                <td class="font-semibold">{row.ticker}</td>
                <td>{row.name}</td>
                <td>{row.type}</td>
                <td>{row.currency}</td>
                <td>{row.status}</td>
                <td>
                  {#if row.canEdit}
                    <button class="btn btn-xs btn-ghost" type="button" on:click={() => openEditModal(row.item)}>
                      Editar
                    </button>
                  {/if}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</section>

<BulkPreviewEditModal
  open={modalOpen}
  asset={editingAsset}
  onConfirm={confirmDraftEdit}
  onClose={closeEditModal}
/>

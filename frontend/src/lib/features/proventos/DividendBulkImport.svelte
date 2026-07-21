<script lang="ts">
  import {
    confirmImportDividends,
    previewImportDividends,
    type BulkDividendPreviewItem,
    type DividendPaymentCreate
  } from '$lib/api/data';
  import DismissibleAlert from '$lib/components/DismissibleAlert.svelte';
  import LucideIcon from '$lib/components/LucideIcon.svelte';
  import { formatIsoDateToBr } from '$lib/brDate';
  import { PROVENTOS_BULK_IMPORT_LUCIDE_ICON } from '$lib/icons/lucideIconCatalog';
  import { PAGE_SECTION_CLASS } from '$lib/layout/pageVisual';
  import { formatPaymentTypeForDisplay } from '$lib/proventoLabels';
  import { formatTickerForDisplay } from '$lib/formatTickerForDisplay';

  import {
    parseDividendImportFromFile,
    parseDividendImportFromText,
    validParsedRows,
    type ParsedDividendImportRow
  } from './parseDividendImport';

  export let onSaved: () => void | Promise<void> = () => undefined;
  export let activePortfolioId: number | null = null;

  // A carteira de destino é sempre a carteira ativa (definida no painel do topo da seção).
  $: portfolioId = activePortfolioId ?? '';

  let pasteText = '';
  let parsedRows: ParsedDividendImportRow[] = [];
  let parseFormat: string = '';
  let previewItems: BulkDividendPreviewItem[] = [];
  let selected = new Set<number>();
  let selectedFileName = '';
  let isDragging = false;
  let loadingPreview = false;
  let loadingSave = false;
  let message = '';
  let error = '';
  let parseErrors: string[] = [];
  let sourceSheets: string[] = [];

  function statusLabel(item: BulkDividendPreviewItem): string {
    if (item.status === 'ready') {
      return 'Pronto';
    }
    if (item.status === 'duplicate') {
      return 'Duplicado';
    }
    if (item.status === 'error') {
      return item.detail?.includes('asset not found') ? 'Ativo não encontrado' : 'Erro';
    }
    return item.status;
  }

  function canSelectItem(item: BulkDividendPreviewItem): boolean {
    return item.status === 'ready' || item.status === 'duplicate';
  }

  async function parseInput() {
    parseErrors = [];
    previewItems = [];
    selected = new Set();
    const result = parseDividendImportFromText(pasteText);
    parseFormat = result.format;
    parseErrors = result.errors;
    sourceSheets = result.sourceSheets ?? [];
    parsedRows = result.rows;
    const validCount = validParsedRows(parsedRows).length;
    if (validCount > 0) {
      message = `${validCount} linha(s) válida(s) (${result.format}${sourceSheets.length ? ` · ${sourceSheets.join(', ')}` : ''}).`;
      error = parseErrors.length > 0 ? parseErrors.join(' ') : '';
    } else {
      message = '';
      error =
        parseErrors.length > 0
          ? parseErrors.join(' ')
          : 'Nenhuma linha válida encontrada.';
    }
  }

  async function processSelectedFile(file: File) {
    parseErrors = [];
    previewItems = [];
    selected = new Set();
    sourceSheets = [];
    const lower = file.name.toLowerCase();
    if (!lower.endsWith('.csv') && !lower.endsWith('.txt') && !lower.endsWith('.xlsx') && !lower.endsWith('.xls')) {
      error = 'Envie um arquivo .csv, .txt ou .xlsx.';
      return;
    }
    const result = await parseDividendImportFromFile(file);
    parseFormat = result.format;
    parseErrors = result.errors;
    sourceSheets = result.sourceSheets ?? [];
    parsedRows = result.rows;
    selectedFileName = file.name;
    pasteText = '';
    const validCount = validParsedRows(parsedRows).length;
    if (validCount > 0) {
      message = `${validCount} linha(s) válida(s) no arquivo «${file.name}» (${result.format}${sourceSheets.length ? ` · ${sourceSheets.join(', ')}` : ''}).`;
      error = parseErrors.length > 0 ? parseErrors.join(' ') : '';
    } else {
      message = '';
      error =
        parseErrors.length > 0
          ? parseErrors.join(' ')
          : `Nenhuma linha válida em «${file.name}».`;
    }
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
    await processSelectedFile(file);
  }

  async function fetchPreview() {
    if (parsedRows.length === 0) {
      await parseInput();
    }
    const rows = validParsedRows(parsedRows);
    if (rows.length === 0) {
      error = 'Informe ao menos uma linha válida para pré-visualizar.';
      return;
    }

    loadingPreview = true;
    error = '';
    message = '';

    try {
      const response = await previewImportDividends(
        rows.map((row) => ({
          row_index: row.rowIndex,
          symbol: row.symbol,
          payment_type: row.paymentType,
          payment_date: row.paymentDate,
          amount: row.amount,
          currency: row.currency,
          notes: row.notes,
          company_cnpj: row.companyCnpj,
          payer_cnpj: row.payerCnpj,
          payer_name: row.payerName
        })),
        { portfolio_id: portfolioId === '' ? null : Number(portfolioId) }
      );
      previewItems = response.items;
      selected = new Set(
        previewItems.filter((item) => canSelectItem(item)).map((item) => item.row_index)
      );
      message = `Pré-visualização de ${previewItems.length} linha(s).`;
    } catch {
      error = 'Não foi possível validar os proventos em lote.';
    } finally {
      loadingPreview = false;
    }
  }

  function toggleRow(rowIndex: number, checked: boolean) {
    if (checked) {
      selected.add(rowIndex);
    } else {
      selected.delete(rowIndex);
    }
    selected = new Set(selected);
  }

  async function saveSelected() {
    if (portfolioId === '') {
      error = 'Selecione uma carteira no painel do topo antes de importar.';
      return;
    }

    const payloads: DividendPaymentCreate[] = previewItems
      .filter((item) => selected.has(item.row_index) && item.payload)
      .map((item) => ({
        ...(item.payload as DividendPaymentCreate),
        portfolio_id: Number(portfolioId)
      }));

    if (payloads.length === 0) {
      error = 'Selecione ao menos um provento válido para importar.';
      return;
    }

    loadingSave = true;
    error = '';
    message = '';

    try {
      const response = await confirmImportDividends(payloads, {
        portfolio_id: Number(portfolioId)
      });
      const created = response.results.filter((r) => r.status === 'created').length;
      const skipped = response.results.filter((r) => r.status === 'skipped').length;
      const failed = response.results.filter((r) => r.status === 'error').length;
      message = `Importação concluída: ${created} criado(s), ${skipped} ignorado(s), ${failed} erro(s).`;
      previewItems = [];
      parsedRows = [];
      pasteText = '';
      selectedFileName = '';
      selected = new Set();
      await onSaved();
    } catch {
      error = 'Não foi possível importar os proventos em lote.';
    } finally {
      loadingSave = false;
    }
  }

  function handleRowToggle(rowIndex: number, event: Event) {
    toggleRow(rowIndex, (event.currentTarget as HTMLInputElement).checked);
  }
</script>

<section class={PAGE_SECTION_CLASS} data-testid="proventos-import-lote-section">
  <div class="card-body gap-4">
    <div>
      <p class="flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-primary">
        <LucideIcon name={PROVENTOS_BULK_IMPORT_LUCIDE_ICON} size="sm" aria-hidden="true" />
        Importação
      </p>
      <h2 class="card-title">Proventos em lote</h2>
      <p class="text-sm text-base-content/70">
        Cole CSV ou envie arquivo .csv / .txt / .xlsx. Suporta template
        (<code class="text-xs">ticker, data, valor, tipo…</code>) e layout legado (colunas Ativo, Data, Valor…).
        Os proventos são importados na <strong>carteira selecionada no topo</strong> da seção.
      </p>
    </div>

    <label class="form-control">
      <span class="label"><span class="label-text">Conteúdo CSV</span></span>
      <textarea
        bind:value={pasteText}
        class="textarea textarea-bordered font-mono text-sm"
        rows="4"
        placeholder="ticker,data,valor,tipo&#10;ITSA4,15/05/2024,100,dividend"
      />
    </label>

    <div
      class="rounded-box border-2 border-dashed p-6 text-center transition-colors"
      class:border-primary={isDragging}
      class:bg-base-200={isDragging}
      role="region"
      aria-label="Área para arrastar arquivo de proventos"
      on:dragover={handleDragOver}
      on:dragleave={handleDragLeave}
      on:drop={handleDrop}
    >
      <p class="text-sm text-base-content/80">Arraste um arquivo .csv, .txt ou .xlsx aqui</p>
      <p class="my-2 text-xs text-base-content/60">ou</p>
      <label class="btn btn-outline btn-sm cursor-pointer">
        Escolher arquivo
        <input
          class="hidden"
          type="file"
          accept=".csv,.txt,.xlsx,.xls,text/csv,text/plain,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          on:change={handleFileChange}
        />
      </label>
      {#if selectedFileName}
        <p class="mt-3 text-sm">
          Arquivo selecionado: <span class="font-mono font-semibold">{selectedFileName}</span>
          {#if parseFormat}
            · formato <span class="font-semibold">{parseFormat}</span>
          {/if}
        </p>
      {/if}
    </div>

    <div class="flex flex-wrap gap-2">
      <button class="btn btn-outline gap-2" type="button" on:click={parseInput}>
        <LucideIcon name="Search" size="sm" />
        Analisar conteúdo
      </button>
      <button class="btn btn-primary gap-2" type="button" disabled={loadingPreview} on:click={fetchPreview}>
        <LucideIcon name="Eye" size="sm" />
        {loadingPreview ? 'Validando…' : 'Pré-visualizar no servidor'}
      </button>
      {#if previewItems.length > 0}
        <button
          class="btn btn-secondary gap-2"
          type="button"
          disabled={loadingSave || selected.size === 0}
          on:click={saveSelected}
        >
          <LucideIcon name="Upload" size="sm" />
          {loadingSave ? 'Importando…' : `Importar selecionados (${selected.size})`}
        </button>
      {/if}
    </div>

    <DismissibleAlert text={message} variant="success" on:dismiss={() => (message = '')} />
    <DismissibleAlert text={error} variant="error" on:dismiss={() => (error = '')} />

    {#if previewItems.length > 0}
      <div class="overflow-x-auto">
        <table class="table table-zebra table-sm">
          <thead>
            <tr>
              <th />
              <th>Linha</th>
              <th>Ativo</th>
              <th>Data</th>
              <th>Tipo</th>
              <th class="text-end">Valor</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {#each previewItems as item (item.row_index)}
              <tr>
                <td>
                  <input
                    type="checkbox"
                    class="checkbox checkbox-sm"
                    checked={selected.has(item.row_index)}
                    disabled={!canSelectItem(item)}
                    on:change={(event) => handleRowToggle(item.row_index, event)}
                  />
                </td>
                <td class="tabular-nums">{item.row_index}</td>
                <td>
                  <span class="inline-flex rounded-md bg-base-200 px-2 py-0.5 font-mono text-xs font-semibold">
                    {formatTickerForDisplay(item.symbol)}
                  </span>
                </td>
                <td>
                  {item.payload?.payment_date
                    ? formatIsoDateToBr(item.payload.payment_date)
                    : '—'}
                </td>
                <td>
                  {item.payload?.payment_type
                    ? formatPaymentTypeForDisplay(item.payload.payment_type)
                    : '—'}
                </td>
                <td class="text-end tabular-nums">
                  {item.payload?.amount ?? '—'}
                  {item.payload?.currency ? ` ${item.payload.currency}` : ''}
                </td>
                <td>
                  <span
                    class="badge badge-sm"
                    class:badge-success={item.status === 'ready'}
                    class:badge-warning={item.status === 'duplicate'}
                    class:badge-error={item.status === 'error'}
                  >
                    {statusLabel(item)}
                  </span>
                  {#if item.detail}
                    <p class="mt-1 text-xs text-base-content/60">{item.detail}</p>
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

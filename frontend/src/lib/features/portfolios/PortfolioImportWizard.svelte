<script lang="ts">
  import {
    confirmPortfolioImport,
    previewPortfolioImport,
    type ImportAssetPreviewItem,
    type ImportConflictField,
    type PortfolioExportDocument
  } from '$lib/api/portfolios';
  import {
    buildResolutionsFromPreview,
    isPortfolioExportDocument,
    parsePortfolioExportJson
  } from './importResolutions';
  import DismissibleAlert from '$lib/components/DismissibleAlert.svelte';
  import { parseApiError } from '$lib/api/parseApiError';

  export let onImported: (portfolioId: number) => void | Promise<void> = () => undefined;

  let selectedFileName = '';
  let document: PortfolioExportDocument | null = null;
  let previewItems: ImportAssetPreviewItem[] = [];
  let fieldOverrides: Record<string, ImportConflictField[]> = {};
  let loadingPreview = false;
  let loadingConfirm = false;
  let message = '';
  let error = '';

  async function processFile(file: File) {
    selectedFileName = file.name;
    error = '';
    message = '';
    try {
      const parsed = parsePortfolioExportJson(await file.text());
      if (!isPortfolioExportDocument(parsed)) {
        error = 'Arquivo inválido: versão não suportada.';
        document = null;
        return;
      }
      document = parsed as PortfolioExportDocument;
      message = `Arquivo «${file.name}» carregado. Clique em Analisar importação.`;
    } catch {
      error = 'Não foi possível ler o JSON.';
      document = null;
    }
  }

  async function handleFileChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      await processFile(file);
    }
  }

  async function runPreview() {
    if (!document) {
      error = 'Selecione um arquivo .json exportado.';
      return;
    }
    loadingPreview = true;
    error = '';
    try {
      const preview = await previewPortfolioImport(document);
      previewItems = preview.assets;
      fieldOverrides = {};
      for (const item of previewItems) {
        if (item.status === 'conflict') {
          fieldOverrides[item.symbol] = item.fields.map((f) => ({ ...f }));
        }
      }
      message = `Pré-visualização: ${previewItems.length} ativo(s), ${preview.positions.length} posição(ões).`;
    } catch (err) {
      error = parseApiError(err, 'Falha na pré-visualização da importação.');
    } finally {
      loadingPreview = false;
    }
  }

  function setFieldResolution(
    symbol: string,
    field: string,
    resolution: ImportConflictField['resolution']
  ) {
    const fields = fieldOverrides[symbol];
    if (!fields) {
      return;
    }
    fieldOverrides = {
      ...fieldOverrides,
      [symbol]: fields.map((f) => (f.field === field ? { ...f, resolution } : f))
    };
  }

  function handleResolutionChange(
    event: Event,
    symbol: string,
    fieldName: string
  ) {
    const select = event.currentTarget as HTMLSelectElement;
    const resolution = select.value as ImportConflictField['resolution'];
    setFieldResolution(symbol, fieldName, resolution);
  }

  async function confirmImport() {
    if (!document) {
      return;
    }
    loadingConfirm = true;
    error = '';
    try {
      const resolutions = buildResolutionsFromPreview(previewItems, fieldOverrides);
      const result = await confirmPortfolioImport(document, resolutions, {
        createNewPortfolio: true
      });
      if (result.portfolio_name_adjusted) {
        message = `Carteira criada como «${result.portfolio_name}» — já existia uma com o mesmo nome no arquivo. ${result.positions_imported} posição(ões) importadas.`;
      } else {
        message = `Importação concluída: carteira «${result.portfolio_name}», ${result.positions_imported} posição(ões).`;
      }
      previewItems = [];
      document = null;
      selectedFileName = '';
      await onImported(result.portfolio_id);
    } catch (err) {
      error = parseApiError(err, 'Não foi possível confirmar a importação.');
    } finally {
      loadingConfirm = false;
    }
  }
</script>

<div class="card bg-base-100 shadow">
  <div class="card-body">
    <h2 class="card-title">Importar carteira</h2>
    <p class="text-sm text-base-content/70">
      Envie um arquivo JSON exportado pela aplicação. Ativos novos serão criados na base; conflitos podem ser resolvidos
      campo a campo.
    </p>

    <input
      type="file"
      accept=".json,application/json"
      class="file-input file-input-bordered w-full max-w-md"
      on:change={handleFileChange}
    />
    {#if selectedFileName}
      <p class="text-sm">Arquivo: {selectedFileName}</p>
    {/if}

    <div class="flex flex-wrap gap-2">
      <button class="btn btn-outline btn-sm" type="button" disabled={!document || loadingPreview} on:click={runPreview}>
        {loadingPreview ? 'Analisando…' : 'Analisar importação'}
      </button>
      <button
        class="btn btn-primary btn-sm"
        type="button"
        disabled={previewItems.length === 0 || loadingConfirm}
        on:click={confirmImport}
      >
        {loadingConfirm ? 'Importando…' : 'Confirmar importação'}
      </button>
    </div>

    {#if previewItems.some((i) => i.status === 'conflict')}
      <div class="overflow-x-auto">
        <table class="table table-zebra table-sm">
          <thead>
            <tr>
              <th>Ticker</th>
              <th>Campo</th>
              <th>Base</th>
              <th>Arquivo</th>
              <th>Resolução</th>
            </tr>
          </thead>
          <tbody>
            {#each previewItems.filter((i) => i.status === 'conflict') as item}
              {#each fieldOverrides[item.symbol] ?? [] as field}
                <tr>
                  <td>{item.symbol}</td>
                  <td>{field.field}</td>
                  <td class="max-w-[8rem] truncate" title={field.base_value ?? ''}>{field.base_value ?? '—'}</td>
                  <td class="max-w-[8rem] truncate" title={field.file_value ?? ''}>{field.file_value ?? '—'}</td>
                  <td>
                    <select
                      class="select select-bordered select-xs"
                      value={field.resolution}
                      on:change={(e) => handleResolutionChange(e, item.symbol, field.field)}
                    >
                      <option value="keep_base">Manter base</option>
                      <option value="use_file">Usar arquivo</option>
                    </select>
                  </td>
                </tr>
              {/each}
            {/each}
          </tbody>
        </table>
      </div>
    {/if}

    {#if previewItems.length > 0}
      <ul class="text-sm">
        {#each previewItems as item}
          <li>
            <span class="font-mono">{item.symbol}</span> —
            {#if item.status === 'missing'}
              <span class="badge badge-warning badge-sm">novo na base</span>
            {:else if item.status === 'conflict'}
              <span class="badge badge-error badge-sm">conflito</span>
            {:else}
              <span class="badge badge-success badge-sm">ok</span>
            {/if}
          </li>
        {/each}
      </ul>
    {/if}

    <DismissibleAlert text={message} variant="success" on:dismiss={() => (message = '')} />
    <DismissibleAlert text={error} variant="error" on:dismiss={() => (error = '')} />
  </div>
</div>

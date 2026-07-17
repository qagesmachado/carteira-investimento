<script lang="ts">
  import {
    getFiiBrConfig,
    getStockBrConfig,
    saveFiiBrConfig,
    saveStockBrConfig,
    type TableDisplaySettings
  } from '$lib/api/analysis';

  import AnalysisSumColumnConfigPanel from './AnalysisSumColumnConfigPanel.svelte';

  export let profile: 'stock_br' | 'fii_br' = 'stock_br';
  export let open = false;
  export let onClose: () => void = () => undefined;
  export let onSaved: (tableDisplay: TableDisplaySettings) => void = () => undefined;

  let panel: AnalysisSumColumnConfigPanel;

  $: stockProps = {
    loadConfig: getStockBrConfig,
    saveConfig: saveStockBrConfig
  };

  $: fiiProps = {
    loadConfig: getFiiBrConfig,
    saveConfig: saveFiiBrConfig
  };

  $: props = profile === 'fii_br' ? fiiProps : stockProps;

  function handleClose() {
    onClose();
  }

  async function handleSave() {
    const saved = await panel?.save();
    if (saved) {
      onClose();
    }
  }

  function handleSaved(event: CustomEvent<TableDisplaySettings>) {
    onSaved(event.detail);
  }
</script>

{#if open}
  <dialog class="modal modal-open" aria-modal="true" data-testid="analysis-sum-config-modal">
    <div class="modal-box max-w-2xl">
      <h3 class="text-lg font-bold">Configurar metodologia de análise</h3>
      <p class="mt-2 text-sm text-base-content/70">
        Escolha quais colunas entram no rebalanceamento e, quando usar ambas, ajuste a equação da
        Soma.
      </p>

      <div class="mt-4">
        <AnalysisSumColumnConfigPanel
          bind:this={panel}
          embedded
          footerless
          {profile}
          {...props}
          on:saved={handleSaved}
        />
      </div>

      <div class="modal-action">
        <button
          type="button"
          class="btn btn-ghost"
          data-testid="analysis-methodology-cancel"
          on:click={handleClose}
        >
          Cancelar
        </button>
        <button
          type="button"
          class="btn btn-primary"
          data-testid="analysis-methodology-save"
          on:click={handleSave}
        >
          Salvar
        </button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button type="button" aria-label="Fechar" on:click={handleClose}></button>
    </form>
  </dialog>
{/if}

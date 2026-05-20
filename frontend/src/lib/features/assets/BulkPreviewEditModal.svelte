<script lang="ts">
  import type { AssetCreate } from '$lib/api/assets';

  import AssetForm from './AssetForm.svelte';

  export let open = false;
  export let asset: AssetCreate | null = null;
  export let onConfirm: (payload: AssetCreate) => void = () => undefined;
  export let onClose: () => void = () => undefined;

  let dialog: HTMLDialogElement;

  $: if (dialog) {
    if (open) {
      dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }

  function handleConfirm(payload: AssetCreate) {
    onConfirm(payload);
    onClose();
  }

  function handleDialogClose() {
    onClose();
  }
</script>

<dialog class="modal" bind:this={dialog} on:close={handleDialogClose}>
  <div class="modal-box max-h-[90vh] max-w-4xl overflow-y-auto">
    <h3 class="mb-4 text-lg font-bold">Revisar ativo do lote</h3>
    <p class="mb-4 text-sm text-base-content/70">
      Alterações ficam na pré-visualização até você clicar em Salvar selecionados.
    </p>
    {#if asset && open}
      <AssetForm
        {asset}
        mode="create"
        submitLabel="Confirmar"
        cancelLabel="Cancelar"
        showCancelButton={true}
        onSave={handleConfirm}
        onCancel={onClose}
      />
    {/if}
  </div>
  <form method="dialog" class="modal-backdrop">
    <button type="submit" aria-label="Fechar">fechar</button>
  </form>
</dialog>

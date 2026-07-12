<script lang="ts">
  import type { FinancingEntryTemplate } from '$lib/api/propertyFinancings';

  export let open = false;
  export let template: FinancingEntryTemplate | null = null;
  export let saving = false;
  export let onConfirm: () => void = () => undefined;
  export let onClose: () => void = () => undefined;
</script>

{#if open && template}
  <dialog
    class="modal modal-open"
    aria-modal="true"
    data-testid="financing-entry-template-delete-confirm-modal"
  >
    <div class="modal-box max-w-lg">
      <h3 class="text-lg font-bold">Excluir padrão</h3>
      <p class="mt-3 text-sm">
        Excluir o padrão «{template.name}»? Lançamentos já registrados não serão alterados.
      </p>
      <div class="modal-action">
        <button
          type="button"
          class="btn btn-ghost"
          disabled={saving}
          data-testid="financing-entry-template-delete-cancel"
          on:click={onClose}
        >
          Cancelar
        </button>
        <button
          type="button"
          class="btn btn-error"
          disabled={saving}
          data-testid="financing-entry-template-delete-confirm"
          on:click={onConfirm}
        >
          {saving ? 'Excluindo…' : 'Excluir'}
        </button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button type="button" aria-label="Fechar" on:click={onClose}></button>
    </form>
  </dialog>
{/if}

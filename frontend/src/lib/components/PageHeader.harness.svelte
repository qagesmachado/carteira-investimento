<script lang="ts">
  import PageHeader from './PageHeader.svelte';

  export let showActions = true;
</script>

<PageHeader title="Título da página" subtitle="Descrição da ferramenta.">
  <div slot="actions">
    {#if showActions}
      <span data-testid="page-header-actions">Ações</span>
    {/if}
  </div>
</PageHeader>

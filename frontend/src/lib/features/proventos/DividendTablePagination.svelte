<script lang="ts">
  import {
    DIVIDEND_PAGE_SIZE_OPTIONS,
    type PageSizeOption
  } from './paginateList';

  export let page = 1;
  export let totalPages = 1;
  export let pageSize: PageSizeOption = 20;
  export let totalItems = 0;
  export let rangeStart = 0;
  export let rangeEnd = 0;
  /** `top` — abaixo dos filtros; `bottom` — após a tabela */
  export let position: 'top' | 'bottom' = 'bottom';

  function handlePageSizeChange(event: Event) {
    pageSize = Number((event.target as HTMLSelectElement).value) as PageSizeOption;
    page = 1;
  }
</script>

<div
  class="flex flex-col gap-3 border-base-300 py-3 sm:flex-row sm:items-center sm:justify-between"
  class:border-t={position === 'bottom'}
  class:border-b={position === 'top'}
  role="navigation"
  aria-label="Paginação da tabela de proventos"
>
  <p class="text-sm text-base-content/70">
    {#if totalItems === 0}
      Nenhum lançamento na página
    {:else}
      Mostrando <span class="font-medium text-base-content">{rangeStart}–{rangeEnd}</span>
      de <span class="font-medium text-base-content">{totalItems}</span>
    {/if}
  </p>

  <div class="flex flex-wrap items-center gap-2">
    <label class="flex items-center gap-2 text-sm">
      <span class="text-base-content/70">Por página</span>
      <select
        class="select select-bordered select-sm w-20"
        value={pageSize}
        on:change={handlePageSizeChange}
      >
        {#each DIVIDEND_PAGE_SIZE_OPTIONS as option}
          <option value={option}>{option}</option>
        {/each}
      </select>
    </label>

    <div class="join">
      <button
        class="btn btn-sm join-item"
        type="button"
        disabled={page <= 1 || totalItems === 0}
        on:click={() => (page = Math.max(1, page - 1))}
      >
        Anterior
      </button>
      <span class="btn btn-sm join-item btn-disabled no-animation font-normal">
        {page} / {totalPages}
      </span>
      <button
        class="btn btn-sm join-item"
        type="button"
        disabled={page >= totalPages || totalItems === 0}
        on:click={() => (page = Math.min(totalPages, page + 1))}
      >
        Próxima
      </button>
    </div>
  </div>
</div>

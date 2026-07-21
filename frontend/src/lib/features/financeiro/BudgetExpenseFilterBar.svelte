<script lang="ts">
  import {
    DEFAULT_BUDGET_EXPENSE_FILTER,
    type BudgetExpenseFilterState
  } from './budgetExpenseFilters';

  export let filters: BudgetExpenseFilterState;
  export let categoryOptions: string[] = [];
  export let tagOptions: string[] = [];
  export let testId: string | undefined = undefined;
  export let onChange: () => void = () => undefined;

  function reset() {
    filters = { ...DEFAULT_BUDGET_EXPENSE_FILTER };
    onChange();
  }
</script>

<div class="flex flex-wrap items-end gap-2 pt-2" data-testid={testId}>
  <label class="form-control w-full sm:w-56">
    <span class="label-text text-xs">Buscar descrição</span>
    <input
      type="text"
      class="input input-bordered input-sm"
      placeholder="Ex.: Aluguel"
      bind:value={filters.search}
      on:input={onChange}
      data-testid={testId ? `${testId}-search` : undefined}
    />
  </label>
  <label class="form-control">
    <span class="label-text text-xs">Meta</span>
    <select
      class="select select-bordered select-sm"
      bind:value={filters.categoryName}
      on:change={onChange}
      data-testid={testId ? `${testId}-category` : undefined}
    >
      <option value="">Todas</option>
      {#each categoryOptions as name}
        <option value={name}>{name}</option>
      {/each}
    </select>
  </label>
  <label class="form-control">
    <span class="label-text text-xs">Tag</span>
    <select
      class="select select-bordered select-sm"
      bind:value={filters.tagName}
      on:change={onChange}
      data-testid={testId ? `${testId}-tag` : undefined}
    >
      <option value="">Todas</option>
      {#each tagOptions as name}
        <option value={name}>{name}</option>
      {/each}
    </select>
  </label>
  <button
    type="button"
    class="btn btn-ghost btn-sm"
    on:click={reset}
    data-testid={testId ? `${testId}-reset` : undefined}
  >
    Limpar
  </button>
</div>

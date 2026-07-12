<script lang="ts">
  import { BR_MONTH_OPTIONS, composeYearMonthIso, parseYearMonthIso } from '$lib/brYearMonth';
  import { currentYearMonth } from '$lib/features/financeiro/budgetMonth';

  export let value = currentYearMonth();
  export let disabled = false;
  export let testId: string | undefined = undefined;
  /** Legenda do grupo (ex.: «Mês inicial»). */
  export let legend: string | undefined = undefined;
  /** Exibe rótulos «Mês» e «Ano» nos campos. */
  export let showFieldLabels = true;

  let month = '01';
  let year = new Date().getFullYear();
  let syncingFromValue = false;

  $: if (!syncingFromValue) {
    const parsed = parseYearMonthIso(value);
    if (parsed) {
      syncingFromValue = true;
      month = parsed.month;
      year = parsed.year;
      syncingFromValue = false;
    }
  }

  function handleMonthChange() {
    commitValue();
  }

  function handleYearChange() {
    commitValue();
  }

  function commitValue() {
    if (syncingFromValue) {
      return;
    }
    const next = composeYearMonthIso(year, month);
    if (next && next !== value) {
      value = next;
    }
  }
</script>

<div class="flex flex-wrap items-end gap-2" data-testid={testId}>
  {#if legend}
    <fieldset class="rounded-box border border-base-300 p-2">
      <legend class="px-1 text-xs font-medium">{legend}</legend>
      <div class="flex flex-wrap items-end gap-2">
        <label class="form-control">
          {#if showFieldLabels}
            <span class="label-text text-xs">Mês</span>
          {/if}
          <select
            class="select select-bordered select-sm min-w-[9rem]"
            bind:value={month}
            {disabled}
            aria-label={showFieldLabels ? undefined : `${legend} — mês`}
            data-testid={testId ? `${testId}-month` : undefined}
            on:change={handleMonthChange}
          >
            {#each BR_MONTH_OPTIONS as option (option.value)}
              <option value={option.value}>{option.label}</option>
            {/each}
          </select>
        </label>
        <label class="form-control">
          {#if showFieldLabels}
            <span class="label-text text-xs">Ano</span>
          {/if}
          <input
            type="number"
            class="input input-bordered input-sm w-24"
            bind:value={year}
            min="2000"
            max="2100"
            step="1"
            {disabled}
            aria-label={showFieldLabels ? undefined : `${legend} — ano`}
            data-testid={testId ? `${testId}-year` : undefined}
            on:input={handleYearChange}
          />
        </label>
      </div>
    </fieldset>
  {:else}
    <label class="form-control">
      {#if showFieldLabels}
        <span class="label-text text-xs">Mês</span>
      {/if}
      <select
        class="select select-bordered select-sm min-w-[9rem]"
        bind:value={month}
        {disabled}
        aria-label={showFieldLabels ? undefined : 'Mês'}
        data-testid={testId ? `${testId}-month` : undefined}
        on:change={handleMonthChange}
      >
        {#each BR_MONTH_OPTIONS as option (option.value)}
          <option value={option.value}>{option.label}</option>
        {/each}
      </select>
    </label>
    <label class="form-control">
      {#if showFieldLabels}
        <span class="label-text text-xs">Ano</span>
      {/if}
      <input
        type="number"
        class="input input-bordered input-sm w-24"
        bind:value={year}
        min="2000"
        max="2100"
        step="1"
        {disabled}
        aria-label={showFieldLabels ? undefined : 'Ano'}
        data-testid={testId ? `${testId}-year` : undefined}
        on:input={handleYearChange}
      />
    </label>
  {/if}
</div>

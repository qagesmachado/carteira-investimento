<script lang="ts">

  import type { BudgetCategoryKpi, BudgetRecurringExpense, BudgetTag, BudgetTransaction } from '$lib/api/budget';

  import { formatIsoDateToBr, parseBrDateToIso, sanitizeBrDateTyping } from '$lib/brDate';

  import BrDecimalInput from '$lib/components/BrDecimalInput.svelte';

  import BrYearMonthInput from '$lib/components/BrYearMonthInput.svelte';

  import DismissibleAlert from '$lib/components/DismissibleAlert.svelte';

  import LucideIcon from '$lib/components/LucideIcon.svelte';

  import { FINANCEIRO_EXPENSES_LUCIDE_ICON } from '$lib/icons/lucideIconCatalog';

  import { currentYearMonth } from '$lib/features/financeiro/budgetMonth';



  export let categories: BudgetCategoryKpi[] = [];

  export let tags: BudgetTag[] = [];

  export let editing: BudgetTransaction | null = null;

  export let editingRecurring: BudgetRecurringExpense | null = null;

  export let saving = false;

  export let onSubmit: (payload: {

    description: string;

    event_date: string;

    amount_brl: number;

    category_id: number;

    tag_id: number | null;

    recurring?: boolean;

    indefinite?: boolean;

    end_year_month?: string | null;

  }) => void = () => undefined;

  export let onCancel: () => void = () => undefined;

  export let embedded = false;

  export let testIdPrefix = 'budget-expense-';

  let description = '';

  let eventDateBr = formatIsoDateToBr(new Date().toISOString().slice(0, 10));

  let amountBrl = 0;

  let categoryId: number | null = null;

  let tagId: number | null = null;

  let recurring = false;

  let endMode: 'indefinite' | 'until' = 'indefinite';

  let endYearMonth = currentYearMonth();

  let formError = '';

  let amountInput: BrDecimalInput;

  let loadedEditingId: number | null = null;

  let loadedRecurringId: number | null = null;



  $: isEditingRecurring = Boolean(editingRecurring);



  $: if (editingRecurring && editingRecurring.id !== loadedRecurringId) {

    loadedRecurringId = editingRecurring.id;

    loadedEditingId = null;

    description = editingRecurring.description;

    eventDateBr = formatIsoDateToBr(

      `${editingRecurring.start_year_month}-${String(editingRecurring.day_of_month).padStart(2, '0')}`

    );

    amountBrl = editingRecurring.amount_brl;

    categoryId = editingRecurring.category_id;

    tagId = editingRecurring.tag_id;

    recurring = true;

    endMode = editingRecurring.indefinite ? 'indefinite' : 'until';

    endYearMonth = editingRecurring.end_year_month ?? currentYearMonth();

    formError = '';

  }



  $: if (editing && editing.id !== loadedEditingId && !editingRecurring) {

    loadedEditingId = editing.id;

    loadedRecurringId = null;

    description = editing.description;

    eventDateBr = formatIsoDateToBr(editing.event_date);

    amountBrl = editing.amount_brl;

    categoryId = editing.category_id;

    tagId = editing.tag_id;

    recurring = false;

    endMode = 'indefinite';

    formError = '';

  }



  $: if (!editing && !editingRecurring) {

    loadedEditingId = null;

    loadedRecurringId = null;

  }



  $: if (!editing && !editingRecurring && categoryId == null && categories.length > 0) {

    categoryId = categories[0].category_id;

  }



  function resetForm() {

    description = '';

    eventDateBr = formatIsoDateToBr(new Date().toISOString().slice(0, 10));

    amountBrl = 0;

    categoryId = categories[0]?.category_id ?? null;

    tagId = null;

    recurring = false;

    endMode = 'indefinite';

    endYearMonth = currentYearMonth();

    formError = '';

  }



  function handleSubmit() {

    formError = '';

    if (!amountInput?.flush()) {

      formError = 'Use vírgula para centavos (ex.: 1234,56).';

      return;

    }

    if (!description.trim()) {

      formError = 'Informe a descrição.';

      return;

    }

    const eventDate = parseBrDateToIso(eventDateBr);

    if (!eventDate) {

      formError = 'Data inválida.';

      return;

    }

    if (categoryId == null) {

      formError = 'Selecione a meta.';

      return;

    }

    if (amountBrl <= 0) {

      formError = 'Informe um valor válido.';

      return;

    }

    if (recurring && endMode === 'until' && !endYearMonth) {

      formError = 'Informe o mês final da recorrência.';

      return;

    }



    onSubmit({

      description: description.trim(),

      event_date: eventDate,

      amount_brl: amountBrl,

      category_id: categoryId,

      tag_id: tagId,

      recurring: recurring || isEditingRecurring,

      indefinite: endMode === 'indefinite',

      end_year_month: endMode === 'until' ? endYearMonth : null

    });

    if (!editing && !editingRecurring) {

      resetForm();

    }

  }

</script>



<div class="{embedded ? 'space-y-3' : 'card bg-base-100 shadow'}" data-testid="{testIdPrefix}form">
  <div class="{embedded ? '' : 'card-body gap-3'}">
    {#if !embedded}
      <div class="flex items-center gap-2">
        <span class="text-primary" aria-hidden="true">
          <LucideIcon name={FINANCEIRO_EXPENSES_LUCIDE_ICON} size="md" />
        </span>
        <h3 class="card-title text-base">
          {editingRecurring ? 'Editar despesa recorrente' : editing ? 'Editar despesa' : 'Nova despesa'}
        </h3>
      </div>
    {/if}

    {#if formError}
      <DismissibleAlert text={formError} variant="error" on:dismiss={() => (formError = '')} />
    {/if}

    <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">

      <label class="form-control w-full">

        <span class="label-text">Descrição</span>

        <input

          class="input input-bordered"

          bind:value={description}

          placeholder="Supermercado, aluguel…"

          data-testid="{testIdPrefix}description"

        />

      </label>

      <label class="form-control w-full">

        <span class="label-text">Data</span>

        <input

          class="input input-bordered"

          bind:value={eventDateBr}

          on:input={(event) => (eventDateBr = sanitizeBrDateTyping(event.currentTarget.value))}

          data-testid="{testIdPrefix}date"

        />

      </label>

      <BrDecimalInput

        bind:this={amountInput}

        bind:value={amountBrl}

        currency={true}

        label="Valor (R$)"

        testId="{testIdPrefix}amount"

      />

      <label class="form-control w-full">

        <span class="label-text">Meta</span>

        <select class="select select-bordered" bind:value={categoryId} data-testid="{testIdPrefix}category">

          {#each categories as category (category.category_id)}

            <option value={category.category_id}>{category.category_name}</option>

          {/each}

        </select>

      </label>

      <label class="form-control w-full">

        <span class="label-text">Tag (opcional)</span>

        <select class="select select-bordered" bind:value={tagId} data-testid="{testIdPrefix}tag">

          <option value={null}>Sem tag</option>

          {#each tags as tag (tag.id)}

            <option value={tag.id}>{tag.name}</option>

          {/each}

        </select>

      </label>

    </div>



    {#if !editing || isEditingRecurring}

      <label class="label cursor-pointer justify-start gap-2">

        <input

          type="checkbox"

          class="checkbox checkbox-sm"

          bind:checked={recurring}

          disabled={isEditingRecurring}

          data-testid="{testIdPrefix}recurring"

        />

        <span class="label-text">Despesa recorrente</span>

      </label>

    {/if}



    {#if recurring || isEditingRecurring}

      <fieldset class="space-y-2 rounded-box border border-base-300 p-3" data-testid="{testIdPrefix}recurrence-end">

        <legend class="px-1 text-sm font-medium">Vigência</legend>

        <label class="label cursor-pointer justify-start gap-2">

          <input

            type="radio"

            class="radio radio-sm"

            value="indefinite"

            bind:group={endMode}

            data-testid="{testIdPrefix}end-indefinite"

          />

          <span class="label-text">Indeterminado (12 meses)</span>

        </label>

        <div class="flex flex-wrap items-end gap-2">

          <label class="label cursor-pointer justify-start gap-2 pb-0">

            <input

              type="radio"

              class="radio radio-sm"

              value="until"

              bind:group={endMode}

              data-testid="{testIdPrefix}end-until"

            />

            <span class="label-text">Até</span>

          </label>

          <BrYearMonthInput

            bind:value={endYearMonth}

            disabled={endMode !== 'until'}

            testId="{testIdPrefix}end-month"

          />

        </div>

      </fieldset>

    {/if}



    <div class="flex flex-wrap gap-2">

      <button

        type="button"

        class="btn btn-primary gap-2"

        data-testid="{testIdPrefix}save"

        disabled={saving || categories.length === 0}

        on:click={handleSubmit}

      >

        <LucideIcon name={editing || editingRecurring ? 'CircleCheck' : 'Plus'} size="sm" aria-hidden="true" />

        {saving ? 'Salvando…' : editing || editingRecurring ? 'Atualizar' : 'Adicionar'}

      </button>

      {#if editing || editingRecurring}

        <button

          type="button"

          class="btn btn-ghost"

          disabled={saving}

          on:click={() => {

            resetForm();

            onCancel();

          }}

        >

          Cancelar

        </button>

      {/if}

    </div>

  </div>

</div>



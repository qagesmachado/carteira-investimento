<script lang="ts">
  import type {
    EntryType,
    EventCategory,
    FinancingEntry,
    FinancingEntryCreate
  } from '$lib/api/propertyFinancings';
  import {
    formatIsoDateToBr,
    parseBrDateToIso,
    sanitizeBrDateTyping
  } from '$lib/brDate';
  import BrDecimalInput from '$lib/components/BrDecimalInput.svelte';
  import { createEventDispatcher } from 'svelte';

  import {
    defaultEventCategoryForType,
    eventOptionsForType,
    normalizeEventCategoryForType
  } from './eventLabels';
  import {
    applyFinancingEntryTemplate,
    type FinancingEntryTemplateFields
  } from './financingEntryTemplateApply';
  import type { FinancingEntryTemplate } from '$lib/api/propertyFinancings';

  export let loading = false;

  const dispatch = createEventDispatcher<{ submit: FinancingEntryCreate }>();

  let entryType: EntryType = 'expense';
  let eventCategory: EventCategory = 'financiamento';
  let eventDateBr = '';
  let description = '';
  let amountValue = 0;
  let amountInput: BrDecimalInput;
  let formError = '';

  $: eventOptions = eventOptionsForType(entryType);

  $: if (!eventOptions.some((option) => option.value === eventCategory)) {
    eventCategory = defaultEventCategoryForType(entryType);
  }

  function handleDateInput(event: Event) {
    const target = event.currentTarget as HTMLInputElement;
    eventDateBr = sanitizeBrDateTyping(target.value);
    target.value = eventDateBr;
  }

  function handleSubmit() {
    formError = '';
    const eventDateIso = parseBrDateToIso(eventDateBr);
    if (!eventDateIso) {
      formError = 'Informe uma data válida (dd/mm/aaaa).';
      return;
    }
    if (!description.trim()) {
      formError = 'Informe a descrição.';
      return;
    }
    if (!amountInput?.flush()) {
      formError = 'Informe um valor válido.';
      return;
    }
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      formError = 'Informe um valor maior que zero.';
      return;
    }

    dispatch('submit', {
      event_date: eventDateIso,
      entry_type: entryType,
      event_category: eventCategory,
      description: description.trim(),
      amount_brl: amountValue
    });

    eventDateBr = '';
    description = '';
    amountValue = 0;
  }

  export function resetForm() {
    entryType = 'expense';
    eventCategory = 'financiamento';
    eventDateBr = '';
    description = '';
    amountValue = 0;
    formError = '';
  }

  export function applyTemplate(template: FinancingEntryTemplate | FinancingEntryTemplateFields) {
    const fields =
      'name' in template ? applyFinancingEntryTemplate(template) : template;
    entryType = fields.entry_type;
    eventCategory = fields.event_category;
    description = fields.description;
    amountValue = fields.amount_brl;
    formError = '';
  }

  export function getFormFieldsForTemplate() {
    if (!amountInput?.flush()) {
      return null;
    }
    return {
      entryType,
      eventCategory: normalizeEventCategoryForType(entryType, eventCategory),
      description,
      amountBrl: amountValue
    };
  }
</script>

<form
  class="rounded-box bg-base-100 p-4 shadow"
  data-testid="financing-event-form"
  on:submit|preventDefault={handleSubmit}
>
  <h3 class="mb-4 text-lg font-semibold">Registrar lançamento</h3>

  {#if formError}
    <p class="mb-3 text-sm text-error">{formError}</p>
  {/if}

  <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
    <label class="form-control">
      <span class="label-text">Data</span>
      <input
        class="input input-bordered"
        type="text"
        placeholder="dd/mm/aaaa"
        data-testid="financing-event-date"
        bind:value={eventDateBr}
        on:input={handleDateInput}
      />
    </label>

    <label class="form-control">
      <span class="label-text">Tipo do evento</span>
      <select
        class="select select-bordered"
        data-testid="financing-event-type"
        bind:value={entryType}
      >
        <option value="income">Receita</option>
        <option value="expense">Despesa</option>
      </select>
    </label>

    <label class="form-control">
      <span class="label-text">Evento</span>
      <select
        class="select select-bordered"
        data-testid="financing-event-category"
        bind:value={eventCategory}
      >
        {#each eventOptions as option}
          <option value={option.value}>{option.label}</option>
        {/each}
      </select>
    </label>

    <BrDecimalInput
      bind:this={amountInput}
      bind:value={amountValue}
      label="Valor (R$)"
      inputClass="input input-bordered w-full"
      testId="financing-event-amount"
    />

    <label class="form-control md:col-span-2 lg:col-span-2">
      <span class="label-text">Descrição</span>
      <input
        class="input input-bordered"
        type="text"
        data-testid="financing-event-description"
        bind:value={description}
      />
    </label>
  </div>

  <div class="mt-4">
    <button
      class="btn btn-primary"
      type="submit"
      disabled={loading}
      data-testid="financing-event-submit"
    >
      {loading ? 'Salvando…' : 'Salvar'}
    </button>
  </div>
</form>

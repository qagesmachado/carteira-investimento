<script lang="ts">
  import type {
    EntryType,
    EventCategory,
    FinancingEntryTemplate,
    FinancingEntryTemplateCreate
  } from '$lib/api/propertyFinancings';
  import BrDecimalInput from '$lib/components/BrDecimalInput.svelte';
  import { formatBrl } from '$lib/features/rebalance/allocationTargets';
  import { createEventDispatcher } from 'svelte';

  import {
    defaultEventCategoryForType,
    eventOptionsForType,
    formatEntryType,
    formatEventCategory,
    normalizeEventCategoryForType
  } from './eventLabels';

  export let open = false;
  export let mode: 'create' | 'manage' | 'edit' = 'manage';
  export let templates: FinancingEntryTemplate[] = [];
  export let initialFields: Omit<FinancingEntryTemplateCreate, 'name'> | null = null;
  export let editingTemplate: FinancingEntryTemplate | null = null;
  export let createSessionKey = 0;
  export let saving = false;
  export let error = '';

  const dispatch = createEventDispatcher<{
    close: void;
    back: void;
    create: FinancingEntryTemplateCreate;
    update: { templateId: number; payload: Partial<FinancingEntryTemplateCreate> };
    delete: FinancingEntryTemplate;
    edit: FinancingEntryTemplate;
  }>();

  let name = '';
  let entryType: EntryType = 'expense';
  let eventCategory: EventCategory = 'financiamento';
  let description = '';
  let amountValue = 0;
  let amountInput: BrDecimalInput;

  $: eventOptions = eventOptionsForType(entryType);
  $: if (!eventOptions.some((option) => option.value === eventCategory)) {
    eventCategory = defaultEventCategoryForType(entryType);
  }

  let lastCreateSessionKey = 0;

  function populateFromTemplate(template: FinancingEntryTemplate) {
    name = template.name;
    entryType = template.entry_type;
    eventCategory = normalizeEventCategoryForType(template.entry_type, template.event_category);
    description = template.description;
    amountValue = template.amount_brl;
  }

  function populateFromInitialFields(fields: Omit<FinancingEntryTemplateCreate, 'name'>) {
    name = '';
    entryType = fields.entry_type;
    eventCategory = normalizeEventCategoryForType(fields.entry_type, fields.event_category);
    description = fields.description;
    amountValue = fields.amount_brl;
  }

  function openEditForm(template: FinancingEntryTemplate) {
    populateFromTemplate(template);
    dispatch('edit', template);
  }

  $: if (
    open &&
    mode === 'create' &&
    initialFields &&
    createSessionKey > 0 &&
    createSessionKey !== lastCreateSessionKey
  ) {
    populateFromInitialFields(initialFields);
    lastCreateSessionKey = createSessionKey;
  }

  $: if (!open) {
    lastCreateSessionKey = 0;
  }

  function formKey(): string {
    if (mode === 'edit' && editingTemplate) {
      return `edit-${editingTemplate.id}`;
    }
    if (mode === 'create' && initialFields) {
      return `create-${initialFields.entry_type}-${initialFields.event_category}-${initialFields.description}-${initialFields.amount_brl}`;
    }
    return mode;
  }

  function handleCancel() {
    if (mode === 'edit') {
      dispatch('back');
      return;
    }
    dispatch('close');
  }

  function handleSubmit() {
    if (!name.trim()) {
      return;
    }
    if (!description.trim()) {
      return;
    }
    if (!amountInput?.flush() || amountValue <= 0) {
      return;
    }
    const payload = {
      name: name.trim(),
      entry_type: entryType,
      event_category: eventCategory,
      description: description.trim(),
      amount_brl: amountValue
    };
    if (mode === 'edit' && editingTemplate) {
      dispatch('update', { templateId: editingTemplate.id, payload });
    } else {
      dispatch('create', payload);
    }
  }
</script>

{#if open}
  <dialog class="modal modal-open" aria-modal="true" data-testid="financing-entry-template-modal">
    <div class="modal-box max-w-2xl">
      {#if mode === 'manage'}
        <h3 class="text-lg font-bold">Gerenciar padrões</h3>
        {#if error}
          <p class="mt-3 text-sm text-error">{error}</p>
        {/if}
        {#if templates.length === 0}
          <p class="mt-4 text-sm opacity-70">Nenhum padrão salvo para este imóvel.</p>
        {:else}
          <div class="mt-4 overflow-x-auto">
            <table class="table table-sm" data-testid="financing-entry-template-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Tipo</th>
                  <th>Evento</th>
                  <th>Descrição</th>
                  <th>Valor</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {#each templates as template (template.id)}
                  <tr data-testid={`financing-entry-template-row-${template.id}`}>
                    <td>{template.name}</td>
                    <td>{formatEntryType(template.entry_type)}</td>
                    <td>{formatEventCategory(template.event_category)}</td>
                    <td>{template.description}</td>
                    <td>{formatBrl(template.amount_brl)}</td>
                    <td>
                      <div class="flex gap-1">
                        <button
                          type="button"
                          class="btn btn-xs btn-ghost"
                          disabled={saving}
                          data-testid={`financing-entry-template-edit-${template.id}`}
                          on:click={() => openEditForm(template)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          class="btn btn-xs btn-ghost"
                          disabled={saving}
                          data-testid={`financing-entry-template-delete-${template.id}`}
                          on:click={() => dispatch('delete', template)}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}
        <div class="modal-action">
          <button
            type="button"
            class="btn"
            data-testid="financing-entry-template-modal-close"
            on:click={() => dispatch('close')}
          >
            Fechar
          </button>
        </div>
      {:else}
        <h3 class="text-lg font-bold">
          {mode === 'edit' ? 'Editar padrão' : 'Salvar como padrão'}
        </h3>
        {#if error}
          <p class="mt-3 text-sm text-error">{error}</p>
        {/if}
        <form
          class="mt-4 flex flex-col gap-3"
          data-testid="financing-entry-template-form"
          on:submit|preventDefault={handleSubmit}
        >
          {#key formKey()}
            <label class="form-control">
            <span class="label-text">Nome do padrão</span>
            <input
              class="input input-bordered"
              required
              maxlength="120"
              data-testid="financing-entry-template-name"
              bind:value={name}
            />
          </label>
          <div class="grid gap-3 md:grid-cols-2">
            <label class="form-control">
              <span class="label-text">Tipo do evento</span>
              <select
                class="select select-bordered"
                data-testid="financing-entry-template-type"
                bind:value={entryType}
              >
                <option value="income">Receita</option>
                <option value="expense">Despesa</option>
              </select>
            </label>
            <label class="form-control">
              <span class="label-text">Evento</span>
              {#key entryType}
                <select
                  class="select select-bordered"
                  data-testid="financing-entry-template-category"
                  bind:value={eventCategory}
                >
                  {#each eventOptions as option (option.value)}
                    <option value={option.value}>{option.label}</option>
                  {/each}
                </select>
              {/key}
            </label>
          </div>
          <BrDecimalInput
            bind:this={amountInput}
            bind:value={amountValue}
            label="Valor (R$)"
            inputClass="input input-bordered w-full"
            testId="financing-entry-template-amount"
          />
          <label class="form-control">
            <span class="label-text">Descrição</span>
            <input
              class="input input-bordered"
              required
              data-testid="financing-entry-template-description"
              bind:value={description}
            />
          </label>
          <div class="modal-action px-0">
            <button
              type="button"
              class="btn btn-ghost"
              disabled={saving}
              data-testid="financing-entry-template-cancel"
              on:click={handleCancel}
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              disabled={saving}
              data-testid="financing-entry-template-save"
            >
              {saving ? 'Salvando…' : 'Salvar padrão'}
            </button>
          </div>
          {/key}
        </form>
      {/if}
    </div>
    <form method="dialog" class="modal-backdrop">
      <button type="button" aria-label="Fechar" on:click={() => dispatch('close')}></button>
    </form>
  </dialog>
{/if}

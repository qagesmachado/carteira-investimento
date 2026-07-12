<script lang="ts">
  import type {
    FinancingEntryTemplate,
    FinancingEntryTemplateCreate
  } from '$lib/api/propertyFinancings';
  import { createEventDispatcher } from 'svelte';

  import { buildTemplateFromFormFields } from './financingEntryTemplateApply';
  import FinancingEntryTemplateDeleteConfirmModal from './FinancingEntryTemplateDeleteConfirmModal.svelte';
  import FinancingEntryTemplateModal from './FinancingEntryTemplateModal.svelte';
  import type FinancingEventForm from './FinancingEventForm.svelte';

  export let templates: FinancingEntryTemplate[] = [];
  export let eventForm: FinancingEventForm | undefined = undefined;
  export let saving = false;

  const dispatch = createEventDispatcher<{
    createTemplate: FinancingEntryTemplateCreate;
    updateTemplate: {
      templateId: number;
      payload: Partial<FinancingEntryTemplateCreate>;
    };
    deleteTemplate: number;
  }>();

  let selectedTemplateId = '';
  let templateModalOpen = false;
  let templateModalMode: 'create' | 'manage' | 'edit' = 'manage';
  let templateModalError = '';
  let initialTemplateFields: Omit<FinancingEntryTemplateCreate, 'name'> | null = null;
  let editingTemplate: FinancingEntryTemplate | null = null;
  let deleteConfirmOpen = false;
  let deleteTarget: FinancingEntryTemplate | null = null;
  let createSessionKey = 0;
  let barError = '';

  $: if (!templates.some((template) => String(template.id) === selectedTemplateId)) {
    selectedTemplateId = '';
  }

  function handleApplyTemplate() {
    barError = '';
    const template = templates.find((item) => String(item.id) === selectedTemplateId);
    if (!template) {
      barError = 'Selecione um padrão.';
      return;
    }
    eventForm?.applyTemplate(template);
  }

  function openSaveAsTemplate() {
    barError = '';
    templateModalError = '';
    const fields = eventForm?.getFormFieldsForTemplate();
    if (!fields) {
      barError = 'Preencha tipo, evento, valor e descrição antes de salvar o padrão.';
      return;
    }
    const result = buildTemplateFromFormFields(fields);
    if (!result.ok) {
      barError = result.error;
      return;
    }
    initialTemplateFields = result.fields;
    editingTemplate = null;
    templateModalMode = 'create';
    createSessionKey += 1;
    templateModalOpen = true;
  }

  function openManageTemplates() {
    templateModalError = '';
    editingTemplate = null;
    templateModalMode = 'manage';
    templateModalOpen = true;
  }

  function handleTemplateCreate(event: CustomEvent<FinancingEntryTemplateCreate>) {
    dispatch('createTemplate', event.detail);
  }

  function handleTemplateUpdate(
    event: CustomEvent<{
      templateId: number;
      payload: Partial<FinancingEntryTemplateCreate>;
    }>
  ) {
    dispatch('updateTemplate', event.detail);
  }

  function handleTemplateEdit(event: CustomEvent<FinancingEntryTemplate>) {
    templateModalError = '';
    editingTemplate = event.detail;
    templateModalMode = 'edit';
  }

  function handleTemplateModalBack() {
    templateModalError = '';
    editingTemplate = null;
    initialTemplateFields = null;
    templateModalMode = 'manage';
  }

  function handleTemplateDeleteRequest(event: CustomEvent<FinancingEntryTemplate>) {
    deleteTarget = event.detail;
    deleteConfirmOpen = true;
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    dispatch('deleteTemplate', deleteTarget.id);
  }

  export function closeTemplateModal() {
    templateModalOpen = false;
    templateModalError = '';
    editingTemplate = null;
    initialTemplateFields = null;
  }

  export function closeDeleteConfirm() {
    deleteConfirmOpen = false;
    deleteTarget = null;
  }

  export function setTemplateModalError(message: string) {
    templateModalError = message;
  }
</script>

<div
  class="mb-4 rounded-box bg-base-100 p-4 shadow"
  data-testid="financing-entry-template-bar"
>
  <h3 class="mb-3 text-lg font-semibold">Padrões de lançamento</h3>
  {#if barError}
    <p class="mb-3 text-sm text-error">{barError}</p>
  {/if}
  <div class="flex flex-wrap items-end gap-3">
    <label class="form-control min-w-[12rem] flex-1">
      <span class="label-text">Padrão salvo</span>
      <select
        class="select select-bordered"
        data-testid="financing-entry-template-select"
        bind:value={selectedTemplateId}
      >
        <option value="">Selecione um padrão</option>
        {#each templates as template (template.id)}
          <option value={String(template.id)}>{template.name}</option>
        {/each}
      </select>
    </label>
    <button
      type="button"
      class="btn btn-outline"
      disabled={saving || !selectedTemplateId}
      data-testid="financing-entry-template-apply"
      on:click={handleApplyTemplate}
    >
      Aplicar
    </button>
    <button
      type="button"
      class="btn btn-outline"
      disabled={saving}
      data-testid="financing-entry-template-save-from-form"
      on:click={openSaveAsTemplate}
    >
      Salvar como padrão
    </button>
    <button
      type="button"
      class="btn btn-ghost"
      disabled={saving}
      data-testid="financing-entry-template-manage"
      on:click={openManageTemplates}
    >
      Gerenciar padrões
    </button>
  </div>
</div>

<FinancingEntryTemplateModal
  open={templateModalOpen}
  mode={templateModalMode}
  {templates}
  initialFields={initialTemplateFields}
  {editingTemplate}
  {createSessionKey}
  {saving}
  error={templateModalError}
  on:close={closeTemplateModal}
  on:back={handleTemplateModalBack}
  on:create={handleTemplateCreate}
  on:update={handleTemplateUpdate}
  on:edit={handleTemplateEdit}
  on:delete={handleTemplateDeleteRequest}
/>

<FinancingEntryTemplateDeleteConfirmModal
  open={deleteConfirmOpen}
  template={deleteTarget}
  {saving}
  onConfirm={handleDeleteConfirm}
  onClose={closeDeleteConfirm}
/>

<script lang="ts">
  import {
    createTag,
    deleteTag,
    listTags,
    updateTag,
    type BudgetTag
  } from '$lib/api/budget';
  import { parseApiError } from '$lib/api/parseApiError';
  import DismissibleAlert from '$lib/components/DismissibleAlert.svelte';
  import EmptyStateCallout from '$lib/components/EmptyStateCallout.svelte';
  import LucideIcon from '$lib/components/LucideIcon.svelte';
  import PageSection from '$lib/components/PageSection.svelte';
  import { NO_BUDGET_PROFILE_EMPTY_STATE } from '$lib/features/onboarding/emptyStateCopy';
  import { getBudgetLayoutContext } from '$lib/features/financeiro/budgetLayoutContext';
  import {
    planUniqueTagColorUpdates,
    randomBudgetTagColor
  } from '$lib/features/financeiro/budgetTagColor';
  import {
    FINANCEIRO_TAGS_LUCIDE_ICON,
    PROVENTOS_EDIT_LUCIDE_ICON,
    PROVENTOS_REMOVE_LUCIDE_ICON
  } from '$lib/icons/lucideIconCatalog';

  const ctx = getBudgetLayoutContext();
  const { activeProfileId } = ctx;

  let tags: BudgetTag[] = [];
  let loading = true;
  let saving = false;
  let error = '';
  let message = '';
  let name = '';
  let color = randomBudgetTagColor();
  let editingTag: BudgetTag | null = null;
  let dedupingColors = false;

  $: profileId = $activeProfileId;

  function usedColorsExcludingEdit(): string[] {
    if (editingTag == null) {
      return tags.map((tag) => tag.color);
    }
    return tags.filter((tag) => tag.id !== editingTag.id).map((tag) => tag.color);
  }

  function pickUnusedFormColor(existing: BudgetTag[] = tags) {
    color = randomBudgetTagColor(
      Math.random,
      existing.map((tag) => tag.color)
    );
  }

  async function ensureUniqueTagColors(profile: number, loaded: BudgetTag[]): Promise<BudgetTag[]> {
    const updates = planUniqueTagColorUpdates(loaded);
    if (updates.length === 0 || dedupingColors) {
      return loaded;
    }
    dedupingColors = true;
    try {
      for (const update of updates) {
        await updateTag(profile, update.id, { color: update.color });
      }
      return await listTags(profile);
    } finally {
      dedupingColors = false;
    }
  }

  async function loadTags() {
    if (profileId == null) {
      tags = [];
      loading = false;
      return;
    }
    loading = true;
    error = '';
    try {
      let loaded = await listTags(profileId);
      loaded = await ensureUniqueTagColors(profileId, loaded);
      tags = loaded;
      if (editingTag == null) {
        pickUnusedFormColor(loaded);
      }
    } catch (err) {
      tags = [];
      error = parseApiError(err, 'Não foi possível carregar as tags.');
    } finally {
      loading = false;
    }
  }

  $: if (profileId != null) {
    void loadTags();
  }

  function resetForm() {
    name = '';
    editingTag = null;
    pickUnusedFormColor();
  }

  function applyRandomColor() {
    color = randomBudgetTagColor(Math.random, usedColorsExcludingEdit());
  }

  async function saveTag() {
    if (profileId == null || !name.trim()) {
      error = 'Informe o nome da tag.';
      return;
    }
    saving = true;
    error = '';
    try {
      const wasEditing = editingTag != null;
      if (editingTag) {
        await updateTag(profileId, editingTag.id, { name: name.trim(), color });
      } else {
        await createTag(profileId, { name: name.trim(), color });
      }
      resetForm();
      await loadTags();
      message = wasEditing ? 'Tag atualizada.' : 'Tag adicionada.';
    } catch (err) {
      error = parseApiError(err, 'Não foi possível salvar a tag.');
    } finally {
      saving = false;
    }
  }

  async function removeTag(tag: BudgetTag) {
    if (profileId == null) {
      return;
    }
    try {
      await deleteTag(profileId, tag.id);
      await loadTags();
      message = 'Tag excluída.';
    } catch (err) {
      error = parseApiError(err, 'Não foi possível excluir a tag.');
    }
  }
</script>

<svelte:head>
  <title>Tags — Financeiro</title>
</svelte:head>

<div class="flex flex-col gap-3">
{#if error}
  <DismissibleAlert text={error} variant="error" on:dismiss={() => (error = '')} />
{/if}
{#if message}
  <DismissibleAlert text={message} variant="success" on:dismiss={() => (message = '')} />
{/if}

{#if profileId == null}
  <PageSection testId="financeiro-tags-heading">
    <div class="flex items-center gap-2">
      <span class="text-primary" aria-hidden="true">
        <LucideIcon name={FINANCEIRO_TAGS_LUCIDE_ICON} size="lg" />
      </span>
      <h2 class="card-title text-lg">Tags</h2>
    </div>
    <EmptyStateCallout
      {...NO_BUDGET_PROFILE_EMPTY_STATE}
      card={false}
      testId="financeiro-tags-sem-perfil"
    />
  </PageSection>
{:else}
  <PageSection testId="financeiro-tags-heading">
    <div class="flex items-center gap-2">
      <span class="text-primary" aria-hidden="true">
        <LucideIcon name={FINANCEIRO_TAGS_LUCIDE_ICON} size="lg" />
      </span>
      <h2 class="card-title text-lg">Tags</h2>
    </div>

    <div class="flex flex-col gap-2">
      <h3 class="text-base font-medium">{editingTag ? 'Editar tag' : 'Nova tag'}</h3>
      <div class="flex flex-wrap gap-3">
        <input
          class="input input-bordered"
          bind:value={name}
          placeholder="Nome"
          data-testid="budget-tag-name"
        />
        <input
          type="color"
          class="h-12 w-16 cursor-pointer rounded border border-base-300"
          bind:value={color}
          data-testid="budget-tag-color"
        />
        <button
          type="button"
          class="btn btn-outline"
          data-testid="budget-tag-random-color"
          title="Cor aleatória"
          aria-label="Cor aleatória"
          on:click={applyRandomColor}
        >
          Cor aleatória
        </button>
        <button
          type="button"
          class="btn btn-primary"
          data-testid="budget-tag-save"
          disabled={saving}
          on:click={saveTag}
        >
          {saving ? 'Salvando…' : editingTag ? 'Atualizar' : 'Adicionar'}
        </button>
        {#if editingTag}
          <button type="button" class="btn btn-ghost" on:click={resetForm}>Cancelar</button>
        {/if}
      </div>
    </div>

    {#if loading}
      <span class="loading loading-spinner loading-md"></span>
    {:else}
      <div class="overflow-x-auto">
        <table class="table">
          <thead>
            <tr>
              <th>Cor</th>
              <th>Nome</th>
              <th>Uso</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {#each tags as tag (tag.id)}
              <tr data-testid="budget-tag-row-{tag.id}">
                <td><span class="inline-block h-4 w-4 rounded-full" style:background-color={tag.color}></span></td>
                <td>{tag.name}</td>
                <td>{tag.usage_count}</td>
                <td class="space-x-2 text-right">
                  <button
                    type="button"
                    class="btn btn-outline btn-xs gap-1"
                    on:click={() => {
                      editingTag = tag;
                      name = tag.name;
                      color = tag.color;
                    }}
                  >
                    <LucideIcon name={PROVENTOS_EDIT_LUCIDE_ICON} size="sm" aria-hidden="true" />
                    Editar
                  </button>
                  <button
                    type="button"
                    class="btn btn-outline btn-xs gap-1 text-error"
                    data-testid="budget-tag-delete-{tag.id}"
                    disabled={tag.usage_count > 0}
                    on:click={() => void removeTag(tag)}
                  >
                    <LucideIcon name={PROVENTOS_REMOVE_LUCIDE_ICON} size="sm" aria-hidden="true" />
                    Excluir
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </PageSection>
{/if}
</div>

<script lang="ts">
  import DismissibleAlert from '$lib/components/DismissibleAlert.svelte';
  import EmptyStateCallout from '$lib/components/EmptyStateCallout.svelte';
  import LucideIcon from '$lib/components/LucideIcon.svelte';
  import PageSection from '$lib/components/PageSection.svelte';
  import { NO_BUDGET_PROFILE_EMPTY_STATE } from '$lib/features/onboarding/emptyStateCopy';
  import {
    createCategory,
    deleteCategory,
    getMonthSnapshot,
    listCategories,
    removeTargetCategories,
    updateCategory,
    updateMonthTargets,
    type BudgetCategory,
    type BudgetCategoryScope,
    type BudgetMonthSnapshot
  } from '$lib/api/budget';
  import { parseApiError } from '$lib/api/parseApiError';
  import {
    FINANCEIRO_GOALS_LUCIDE_ICON,
    FINANCEIRO_GOAL_ADD_LUCIDE_ICON,
    PROVENTOS_EDIT_LUCIDE_ICON,
    PROVENTOS_REMOVE_LUCIDE_ICON
  } from '$lib/icons/lucideIconCatalog';
  import BudgetDistributionChart from '$lib/features/financeiro/BudgetDistributionChart.svelte';
  import { getBudgetLayoutContext } from '$lib/features/financeiro/budgetLayoutContext';
  import { normalizeTargetPercent, targetAmountFromPercent } from '$lib/features/financeiro/budgetMonth';
  import {
    categoriesAvailableToAdd,
    remainingTargetPercent,
    removeTargetFromDraft,
    targetsPayload,
    totalTargetPercent,
    validateTargetDrafts,
    type TargetDraft
  } from '$lib/features/financeiro/budgetTargetsForm';
  import { formatBrl } from '$lib/features/rebalance/allocationTargets';

  const ctx = getBudgetLayoutContext();
  const { activeProfileId, yearMonth: yearMonthStore } = ctx;

  let snapshot: BudgetMonthSnapshot | null = null;
  let categories: BudgetCategory[] = [];
  let targets: TargetDraft[] = [];
  let plannedIncome = 0;
  let targetsInherited = false;
  let loading = true;
  let saving = false;
  let error = '';
  let message = '';

  let addOpen = false;
  let addExistingId: number | '' = '';
  let newCategoryName = '';
  let newCategoryColor = '#64748b';
  let addApplyToFollowingMonths = true;
  let creatingCategory = false;
  /** Categorias adicionadas com "meses seguintes" — enviadas em propagate_category_ids ao salvar. */
  let propagateCategoryIds: number[] = [];

  let editing: TargetDraft | null = null;
  let editName = '';
  let editColor = '#64748b';
  let editScope: BudgetCategoryScope = 'all';
  let savingEdit = false;

  let removing: TargetDraft | null = null;
  let removingSaving = false;
  let removeApplyToFollowingMonths = true;

  let saveOpen = false;
  let saveApplyToFollowingMonths = true;

  $: profileId = $activeProfileId;
  $: yearMonth = $yearMonthStore;
  $: allocatedPercent = totalTargetPercent(targets);
  $: remainingPercent = remainingTargetPercent(targets);
  $: allocationOk = allocatedPercent === 100;
  $: availableCategories = categoriesAvailableToAdd(categories, targets);

  function derivePlannedIncome(snap: BudgetMonthSnapshot): number {
    for (const category of snap.categories) {
      if (category.percent > 0 && category.target_brl > 0) {
        return Math.round((category.target_brl / category.percent) * 100 * 100) / 100;
      }
    }
    return snap.income_total_brl;
  }

  function draftsFromSnapshot(snap: BudgetMonthSnapshot): TargetDraft[] {
    return snap.categories.map((category) => ({
      category_id: category.category_id,
      category_name: category.category_name,
      color: category.color,
      percent: normalizeTargetPercent(category.percent)
    }));
  }

  async function loadPage() {
    if (profileId == null) {
      snapshot = null;
      loading = false;
      return;
    }
    loading = true;
    error = '';
    try {
      const [snap, cats] = await Promise.all([
        getMonthSnapshot(profileId, yearMonth, 'targets'),
        listCategories(profileId)
      ]);
      snapshot = snap;
      categories = cats;
      plannedIncome = derivePlannedIncome(snap);
      targetsInherited = snap.targets_inherited;
      targets = draftsFromSnapshot(snap);
      propagateCategoryIds = [];
    } catch (err) {
      snapshot = null;
      error = parseApiError(err, 'Não foi possível carregar as metas.');
    } finally {
      loading = false;
    }
  }

  $: if (profileId != null && yearMonth) {
    void loadPage();
  }

  function updatePercent(categoryId: number, percent: number) {
    const normalized = normalizeTargetPercent(percent);
    targets = targets.map((target) =>
      target.category_id === categoryId ? { ...target, percent: normalized } : target
    );
  }

  function requestRemove(target: TargetDraft) {
    if (targets.length <= 1) {
      error = 'É necessário manter ao menos uma meta no mês.';
      return;
    }
    removeApplyToFollowingMonths = true;
    removing = target;
  }

  function closeRemoveConfirm() {
    if (removingSaving) {
      return;
    }
    removing = null;
  }

  async function confirmRemove() {
    if (profileId == null || removing == null) {
      return;
    }
    const next = removeTargetFromDraft(targets, removing.category_id);
    if (next === null) {
      error = 'É necessário manter ao menos uma meta no mês.';
      closeRemoveConfirm();
      return;
    }
    const removedId = removing.category_id;
    const nextPropagate = propagateCategoryIds.filter(
      (id) => id !== removedId && next.some((target) => target.category_id === id)
    );
    const applyFollowing = removeApplyToFollowingMonths;

    removingSaving = true;
    error = '';
    try {
      // Persiste a remoção (e bloqueia se houver despesa/recorrência no mês).
      await removeTargetCategories(profileId, yearMonth, {
        category_ids: [removedId],
        apply_to_current: true,
        apply_to_following_months: applyFollowing
      });

      if (totalTargetPercent(next) === 100) {
        snapshot = await updateMonthTargets(profileId, yearMonth, {
          targets: targetsPayload(next),
          propagate_category_ids: applyFollowing ? [] : nextPropagate,
          apply_to_following_months: applyFollowing
        });
        plannedIncome = derivePlannedIncome(snapshot);
        targetsInherited = snapshot.targets_inherited;
        targets = draftsFromSnapshot(snapshot);
        propagateCategoryIds = [];
      } else {
        targets = next;
        propagateCategoryIds = nextPropagate;
        targetsInherited = false;
      }
      removing = null;
      message = applyFollowing
        ? totalTargetPercent(targets) === 100
          ? 'Meta removida deste mês e dos meses seguintes.'
          : 'Meta removida deste mês e dos meses seguintes. Ajuste os percentuais para 100% e salve.'
        : totalTargetPercent(targets) === 100
          ? 'Meta removida deste mês.'
          : 'Meta removida deste mês. Ajuste os percentuais para 100% e salve.';
    } catch (err) {
      error = parseApiError(err, 'Não foi possível remover a meta.');
    } finally {
      removingSaving = false;
    }
  }

  function openSaveModal() {
    const validationError = validateTargetDrafts(targets);
    if (validationError) {
      error = validationError;
      return;
    }
    saveApplyToFollowingMonths = true;
    saveOpen = true;
  }

  function closeSaveModal() {
    if (saving) {
      return;
    }
    saveOpen = false;
  }

  async function confirmSaveTargets() {
    if (profileId == null) {
      return;
    }
    const validationError = validateTargetDrafts(targets);
    if (validationError) {
      error = validationError;
      return;
    }
    saving = true;
    error = '';
    try {
      const activeIds = new Set(targets.map((target) => target.category_id));
      const toPropagate = propagateCategoryIds.filter((id) => activeIds.has(id));
      const applyFollowing = saveApplyToFollowingMonths;
      snapshot = await updateMonthTargets(profileId, yearMonth, {
        targets: targetsPayload(targets),
        propagate_category_ids: applyFollowing ? [] : toPropagate,
        apply_to_following_months: applyFollowing
      });
      plannedIncome = derivePlannedIncome(snapshot);
      targetsInherited = snapshot.targets_inherited;
      targets = draftsFromSnapshot(snapshot);
      propagateCategoryIds = [];
      saveOpen = false;
      message = applyFollowing
        ? 'Metas salvas neste mês e nos meses seguintes.'
        : 'Metas salvas.';
    } catch (err) {
      error = parseApiError(err, 'Não foi possível salvar as metas.');
    } finally {
      saving = false;
    }
  }

  function rememberPropagate(categoryId: number) {
    if (!addApplyToFollowingMonths) {
      return;
    }
    if (!propagateCategoryIds.includes(categoryId)) {
      propagateCategoryIds = [...propagateCategoryIds, categoryId];
    }
  }

  function openAddModal() {
    addExistingId = '';
    newCategoryName = '';
    newCategoryColor = '#64748b';
    addApplyToFollowingMonths = true;
    addOpen = true;
  }

  function closeAddModal() {
    addOpen = false;
  }

  function addExistingCategory() {
    if (addExistingId === '') {
      return;
    }
    const category = categories.find((item) => item.id === addExistingId);
    if (!category) {
      return;
    }
    targets = [
      ...targets,
      {
        category_id: category.id,
        category_name: category.name,
        color: category.color,
        percent: 0
      }
    ];
    rememberPropagate(category.id);
    closeAddModal();
  }

  async function createNewCategory() {
    if (profileId == null || !newCategoryName.trim()) {
      error = 'Informe o nome da meta.';
      return;
    }
    creatingCategory = true;
    error = '';
    try {
      const created = await createCategory(profileId, {
        name: newCategoryName.trim(),
        color: newCategoryColor
      });
      categories = [...categories, created];
      targets = [
        ...targets,
        { category_id: created.id, category_name: created.name, color: created.color, percent: 0 }
      ];
      rememberPropagate(created.id);
      closeAddModal();
      message = 'Meta criada. Ajuste o percentual e salve as metas.';
    } catch (err) {
      error = parseApiError(err, 'Não foi possível criar a meta.');
    } finally {
      creatingCategory = false;
    }
  }

  function openEdit(target: TargetDraft) {
    editing = target;
    editName = target.category_name;
    editColor = target.color;
    editScope = 'all';
  }

  function closeEdit() {
    editing = null;
  }

  async function saveEdit() {
    if (profileId == null || editing == null || !editName.trim()) {
      error = 'Informe o nome da meta.';
      return;
    }
    savingEdit = true;
    error = '';
    try {
      await updateCategory(profileId, editing.category_id, {
        name: editName.trim(),
        color: editColor,
        scope: editScope,
        year_month: editScope === 'from_month' ? yearMonth : undefined
      });
      closeEdit();
      await loadPage();
      message = 'Meta atualizada.';
    } catch (err) {
      error = parseApiError(err, 'Não foi possível atualizar a meta.');
    } finally {
      savingEdit = false;
    }
  }

  async function deleteCurrentCategory() {
    if (profileId == null || editing == null) {
      return;
    }
    savingEdit = true;
    error = '';
    try {
      await deleteCategory(profileId, editing.category_id);
      closeEdit();
      await loadPage();
      message = 'Meta excluída.';
    } catch (err) {
      error = parseApiError(err, 'Não foi possível excluir a meta. Verifique se há despesas vinculadas.');
    } finally {
      savingEdit = false;
    }
  }

  $: donutSlices = targets.map((target) => ({
    id: target.category_id,
    name: target.category_name,
    color: target.color,
    amount_brl: targetAmountFromPercent(plannedIncome, target.percent),
    percent: target.percent
  }));
</script>

<svelte:head>
  <title>Metas — Financeiro</title>
</svelte:head>

<div class="flex flex-col gap-3">
{#if error}
  <DismissibleAlert text={error} variant="error" on:dismiss={() => (error = '')} />
{/if}
{#if message}
  <DismissibleAlert text={message} variant="success" on:dismiss={() => (message = '')} />
{/if}
{#if profileId == null}
  <PageSection testId="financeiro-metas-heading">
    <div class="flex items-center gap-2">
      <span class="text-primary" aria-hidden="true">
        <LucideIcon name={FINANCEIRO_GOALS_LUCIDE_ICON} size="lg" />
      </span>
      <h2 class="card-title text-lg">Metas financeiras</h2>
    </div>
    <EmptyStateCallout
      {...NO_BUDGET_PROFILE_EMPTY_STATE}
      card={false}
      testId="financeiro-metas-sem-perfil"
    />
  </PageSection>
{:else if loading}
  <span class="loading loading-spinner loading-md"></span>
{:else}
  <PageSection testId="financeiro-metas-heading">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <div class="flex items-center gap-2">
        <span class="text-primary" aria-hidden="true">
          <LucideIcon name={FINANCEIRO_GOALS_LUCIDE_ICON} size="lg" />
        </span>
        <h2 class="card-title text-lg">Metas financeiras</h2>
      </div>
      {#if targetsInherited}
        <span class="badge badge-outline badge-info gap-1" data-testid="budget-targets-inherited-badge">
          Herdado do mês anterior
        </span>
      {/if}
    </div>

    <div class="flex flex-wrap items-end justify-between gap-3">
      <div class="form-control w-full max-w-xs">
        <span class="label-text">Renda prevista do mês</span>
        <p
          class="input input-bordered flex items-center bg-base-200 text-base"
          data-testid="budget-planned-income"
        >
          {formatBrl(plannedIncome)}
        </p>
        <span class="label-text-alt mt-1 text-base-content/60">
          O previsto de cada meta é a renda prevista × percentual.
        </span>
      </div>
      <div
        class="min-w-[11rem] rounded-lg border px-4 py-3 text-right {allocationOk
          ? 'border-success/40 bg-success/10'
          : 'border-error/50 bg-error/10'}"
        data-testid="budget-allocated-percent"
        aria-live="polite"
      >
        <div class="text-xs font-medium uppercase tracking-wide text-base-content/60">Alocado</div>
        <div
          class="text-2xl font-semibold tabular-nums {allocationOk ? 'text-success' : 'text-error'}"
        >
          {allocatedPercent.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}%
          <span class="text-base font-medium text-base-content/50">/ 100%</span>
        </div>
        {#if !allocationOk}
          <div class="mt-1 text-sm font-semibold text-error" data-testid="budget-allocated-remaining">
            {#if remainingPercent > 0}
              Faltam {remainingPercent.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}%
            {:else}
              Excedeu {Math.abs(remainingPercent).toLocaleString('pt-BR', {
                maximumFractionDigits: 0
              })}%
            {/if}
          </div>
        {/if}
      </div>
    </div>

    <div class="grid grid-cols-1 gap-3 lg:grid-cols-2">
      {#each targets as target (target.category_id)}
        <div class="rounded border border-base-300 p-3" data-testid="budget-target-card-{target.category_id}">
          <div class="mb-2 flex items-center justify-between gap-2">
            <span class="flex items-center gap-2 font-medium">
              <span class="inline-block h-3 w-3 rounded-full" style:background-color={target.color}></span>
              {target.category_name}
            </span>
            <div class="flex items-center gap-1">
              <button
                type="button"
                class="btn btn-ghost btn-xs gap-1"
                data-testid="budget-target-edit-{target.category_id}"
                on:click={() => openEdit(target)}
              >
                <LucideIcon name={PROVENTOS_EDIT_LUCIDE_ICON} size="sm" aria-hidden="true" />
                Editar
              </button>
              <button
                type="button"
                class="btn btn-ghost btn-xs gap-1 text-error"
                data-testid="budget-target-remove-{target.category_id}"
                title="Remover deste mês"
                on:click={() => requestRemove(target)}
              >
                <LucideIcon name={PROVENTOS_REMOVE_LUCIDE_ICON} size="sm" aria-hidden="true" />
                Remover
              </button>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              class="range range-xs flex-1"
              value={target.percent}
              data-testid="budget-target-percent-{target.category_id}"
              on:input={(event) => updatePercent(target.category_id, Number(event.currentTarget.value))}
            />
            <input
              class="input input-bordered input-sm w-20 text-right"
              value={target.percent.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
              data-testid="budget-target-percent-input-{target.category_id}"
              on:change={(event) =>
                updatePercent(target.category_id, Number(event.currentTarget.value.replace(',', '.')))}
            />
            <span class="w-8 text-sm text-base-content/70">%</span>
          </div>
          <div class="mt-2 text-sm text-base-content/70">
            Previsto: {formatBrl(targetAmountFromPercent(plannedIncome, target.percent))}
          </div>
        </div>
      {/each}
    </div>

    <button
      type="button"
      class="btn btn-outline btn-sm w-fit gap-1"
      data-testid="budget-add-meta-btn"
      on:click={openAddModal}
    >
      <LucideIcon name={FINANCEIRO_GOAL_ADD_LUCIDE_ICON} size="sm" aria-hidden="true" />
      Adicionar meta
    </button>

    <div class="flex flex-wrap gap-2">
      <button
        type="button"
        class="btn btn-primary"
        data-testid="budget-save-targets-btn"
        disabled={saving || !allocationOk}
        on:click={openSaveModal}
      >
        Salvar metas
      </button>
      <button type="button" class="btn btn-ghost" on:click={() => void loadPage()}>Resetar</button>
    </div>
  </PageSection>

  <BudgetDistributionChart title="Distribuição das metas" slices={donutSlices} testId="budget-targets-donut" />
{/if}
</div>

{#if addOpen}
  <div class="modal modal-open" data-testid="budget-add-meta-modal">
    <div class="modal-box">
      <h3 class="text-lg font-medium">Adicionar meta</h3>
      <div class="mt-3 flex flex-col gap-4">
        {#if availableCategories.length > 0}
          <label class="form-control">
            <span class="label-text">Incluir meta existente</span>
            <div class="mt-1 flex flex-wrap gap-2">
              <select
                class="select select-bordered select-sm min-w-[12rem]"
                bind:value={addExistingId}
                data-testid="budget-add-meta-select"
              >
                <option value="">Selecione…</option>
                {#each availableCategories as category (category.id)}
                  <option value={category.id}>{category.name}</option>
                {/each}
              </select>
              <button
                type="button"
                class="btn btn-outline btn-sm"
                data-testid="budget-add-meta-existing-btn"
                disabled={addExistingId === ''}
                on:click={addExistingCategory}
              >
                Incluir
              </button>
            </div>
          </label>
        {/if}
        <label class="form-control">
          <span class="label-text">Criar nova meta</span>
          <div class="mt-1 flex flex-wrap gap-2">
            <input
              class="input input-bordered input-sm min-w-[12rem]"
              placeholder="Nome"
              bind:value={newCategoryName}
              data-testid="budget-new-category-name"
            />
            <input
              type="color"
              class="h-9 w-12 cursor-pointer rounded border border-base-300"
              bind:value={newCategoryColor}
              data-testid="budget-new-category-color"
            />
            <button
              type="button"
              class="btn btn-primary btn-sm"
              data-testid="budget-create-category-btn"
              disabled={creatingCategory || !newCategoryName.trim()}
              on:click={createNewCategory}
            >
              {creatingCategory ? 'Criando…' : 'Criar'}
            </button>
          </div>
        </label>
        <label class="label cursor-pointer justify-start gap-3">
          <input
            type="checkbox"
            class="checkbox checkbox-sm"
            bind:checked={addApplyToFollowingMonths}
            data-testid="budget-add-meta-following-months"
          />
          <span class="label-text">
            Aplicar também aos meses seguintes
            <span class="mt-0.5 block text-xs text-base-content/60">
              Desmarque para criar apenas neste mês. Meses anteriores nunca são alterados.
            </span>
          </span>
        </label>
      </div>
      <div class="modal-action">
        <button type="button" class="btn btn-ghost" data-testid="budget-add-meta-cancel" on:click={closeAddModal}>
          Cancelar
        </button>
      </div>
    </div>
    <button type="button" class="modal-backdrop" aria-label="Fechar" on:click={closeAddModal}></button>
  </div>
{/if}

{#if removing}
  <div class="modal modal-open" data-testid="budget-remove-target-modal">
    <div class="modal-box">
      <h3 class="text-lg font-medium">Remover meta?</h3>
      <p class="mt-3 text-sm">
        A meta <strong>{removing.category_name}</strong> será retirada do conjunto deste mês. O
        percentual dela fica livre para você redistribuir nas demais metas antes de salvar. Não é
        possível remover se houver despesa ou recorrência vinculada. Meses anteriores não são
        alterados.
      </p>
      <label class="label mt-4 cursor-pointer justify-start gap-3">
        <input
          type="checkbox"
          class="checkbox checkbox-sm"
          bind:checked={removeApplyToFollowingMonths}
          data-testid="budget-remove-target-following-months"
        />
        <span class="label-text">
          Remover também dos meses seguintes
          <span class="mt-0.5 block text-xs text-base-content/60">
            Desmarque para remover apenas deste mês.
          </span>
        </span>
      </label>
      <div class="modal-action">
        <button
          type="button"
          class="btn btn-ghost"
          data-testid="budget-remove-target-cancel"
          disabled={removingSaving}
          on:click={closeRemoveConfirm}
        >
          Cancelar
        </button>
        <button
          type="button"
          class="btn btn-error"
          data-testid="budget-remove-target-confirm"
          disabled={removingSaving}
          on:click={confirmRemove}
        >
          {removingSaving ? 'Removendo…' : 'Remover'}
        </button>
      </div>
    </div>
    <button
      type="button"
      class="modal-backdrop"
      aria-label="Fechar"
      on:click={closeRemoveConfirm}
    ></button>
  </div>
{/if}

{#if saveOpen}
  <div class="modal modal-open" data-testid="budget-save-targets-modal">
    <div class="modal-box">
      <h3 class="text-lg font-medium">Salvar metas</h3>
      <p class="mt-3 text-sm">
        Confirme se os percentuais deste mês devem valer só agora ou também para os meses
        seguintes que já tiverem metas próprias.
      </p>
      <label class="label mt-4 cursor-pointer justify-start gap-3">
        <input
          type="checkbox"
          class="checkbox checkbox-sm"
          bind:checked={saveApplyToFollowingMonths}
          data-testid="budget-save-targets-following-months"
        />
        <span class="label-text">
          Aplicar também aos meses seguintes
          <span class="mt-0.5 block text-xs text-base-content/60">
            Desmarque para salvar apenas neste mês. Meses anteriores nunca são alterados.
          </span>
        </span>
      </label>
      <div class="modal-action">
        <button
          type="button"
          class="btn btn-ghost"
          data-testid="budget-save-targets-cancel"
          disabled={saving}
          on:click={closeSaveModal}
        >
          Cancelar
        </button>
        <button
          type="button"
          class="btn btn-primary"
          data-testid="budget-save-targets-confirm"
          disabled={saving}
          on:click={confirmSaveTargets}
        >
          {saving ? 'Salvando…' : 'Salvar'}
        </button>
      </div>
    </div>
    <button type="button" class="modal-backdrop" aria-label="Fechar" on:click={closeSaveModal}></button>
  </div>
{/if}

{#if editing}
  <div class="modal modal-open" data-testid="budget-edit-category-modal">
    <div class="modal-box">
      <h3 class="text-lg font-medium">Editar meta</h3>
      <div class="mt-3 flex flex-col gap-3">
        <label class="form-control">
          <span class="label-text">Nome</span>
          <input
            class="input input-bordered"
            bind:value={editName}
            data-testid="budget-edit-category-name"
          />
        </label>
        <label class="form-control">
          <span class="label-text">Cor</span>
          <input
            type="color"
            class="h-10 w-16 cursor-pointer rounded border border-base-300"
            bind:value={editColor}
            data-testid="budget-edit-category-color"
          />
        </label>
        <div class="form-control">
          <span class="label-text">Aplicar em</span>
          <label class="label cursor-pointer justify-start gap-2">
            <input
              type="radio"
              class="radio radio-sm"
              value="all"
              bind:group={editScope}
              data-testid="budget-edit-scope-all"
            />
            <span class="label-text">Todos os meses</span>
          </label>
          <label class="label cursor-pointer justify-start gap-2">
            <input
              type="radio"
              class="radio radio-sm"
              value="from_month"
              bind:group={editScope}
              data-testid="budget-edit-scope-from-month"
            />
            <span class="label-text">A partir deste mês</span>
          </label>
        </div>
      </div>
      <div class="modal-action justify-between">
        <button
          type="button"
          class="btn btn-outline btn-error"
          data-testid="budget-delete-category-btn"
          disabled={savingEdit}
          on:click={deleteCurrentCategory}
        >
          Excluir meta
        </button>
        <div class="flex gap-2">
          <button type="button" class="btn btn-ghost" on:click={closeEdit}>Cancelar</button>
          <button
            type="button"
            class="btn btn-primary"
            data-testid="budget-edit-category-save"
            disabled={savingEdit || !editName.trim()}
            on:click={saveEdit}
          >
            {savingEdit ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
    <button type="button" class="modal-backdrop" aria-label="Fechar" on:click={closeEdit}></button>
  </div>
{/if}

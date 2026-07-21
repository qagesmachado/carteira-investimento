<script lang="ts">
  import {
    deleteCategory,
    deleteCategoryExpenses,
    getCategoryUsage,
    getMonthSnapshot,
    listCategoriesUsage,
    type BudgetCategoryUsageDetail,
    type BudgetCategoryUsageSummary
  } from '$lib/api/budget';
  import { parseApiError } from '$lib/api/parseApiError';
  import { formatIsoDateToBr } from '$lib/brDate';
  import DismissibleAlert from '$lib/components/DismissibleAlert.svelte';
  import EmptyStateCallout from '$lib/components/EmptyStateCallout.svelte';
  import LucideIcon from '$lib/components/LucideIcon.svelte';
  import PageSection from '$lib/components/PageSection.svelte';
  import { getBudgetLayoutContext } from '$lib/features/financeiro/budgetLayoutContext';
  import { formatBrl } from '$lib/features/rebalance/allocationTargets';
  import { NO_BUDGET_PROFILE_EMPTY_STATE } from '$lib/features/onboarding/emptyStateCopy';
  import {
    FINANCEIRO_GOALS_HISTORY_LUCIDE_ICON,
    PROVENTOS_REMOVE_LUCIDE_ICON
  } from '$lib/icons/lucideIconCatalog';

  const ctx = getBudgetLayoutContext();
  const { activeProfileId, yearMonth: yearMonthStore } = ctx;

  let rows: BudgetCategoryUsageSummary[] = [];
  let activeMonthCategoryIds = new Set<number>();
  let selected: BudgetCategoryUsageDetail | null = null;
  let loading = true;
  let loadingDetail = false;
  let clearing = false;
  let deleting = false;
  let error = '';
  let message = '';
  let confirmDeleteOpen = false;
  let confirmClearOpen = false;

  $: profileId = $activeProfileId;
  $: yearMonth = $yearMonthStore;

  async function loadList() {
    if (profileId == null) {
      rows = [];
      activeMonthCategoryIds = new Set();
      loading = false;
      return;
    }
    loading = true;
    error = '';
    try {
      const [usage, snapshot] = await Promise.all([
        listCategoriesUsage(profileId),
        getMonthSnapshot(profileId, yearMonth, 'targets')
      ]);
      rows = usage;
      activeMonthCategoryIds = new Set(snapshot.categories.map((c) => c.category_id));
    } catch (err) {
      rows = [];
      error = parseApiError(err, 'Não foi possível carregar o histórico de metas.');
    } finally {
      loading = false;
    }
  }

  async function openDetail(categoryId: number) {
    if (profileId == null) {
      return;
    }
    loadingDetail = true;
    error = '';
    try {
      selected = await getCategoryUsage(profileId, categoryId);
    } catch (err) {
      selected = null;
      error = parseApiError(err, 'Não foi possível carregar os registros da meta.');
    } finally {
      loadingDetail = false;
    }
  }

  function closeDetail() {
    selected = null;
    confirmDeleteOpen = false;
    confirmClearOpen = false;
  }

  async function clearExpenses() {
    if (profileId == null || selected == null) {
      return;
    }
    clearing = true;
    error = '';
    try {
      selected = await deleteCategoryExpenses(profileId, selected.id);
      await loadList();
      confirmClearOpen = false;
      message = 'Despesas da meta excluídas.';
    } catch (err) {
      error = parseApiError(err, 'Não foi possível excluir as despesas da meta.');
    } finally {
      clearing = false;
    }
  }

  async function deleteMeta() {
    if (profileId == null || selected == null || !selected.can_delete) {
      return;
    }
    deleting = true;
    error = '';
    try {
      await deleteCategory(profileId, selected.id);
      closeDetail();
      await loadList();
      message = 'Meta excluída em definitivo.';
    } catch (err) {
      error = parseApiError(err, 'Não foi possível excluir a meta.');
    } finally {
      deleting = false;
      confirmDeleteOpen = false;
    }
  }

  $: if (profileId != null && yearMonth) {
    void loadList();
  }
</script>

<svelte:head>
  <title>Histórico de metas — Financeiro</title>
</svelte:head>

<div class="flex flex-col gap-3">
  {#if error}
    <DismissibleAlert text={error} variant="error" on:dismiss={() => (error = '')} />
  {/if}
  {#if message}
    <DismissibleAlert text={message} variant="success" on:dismiss={() => (message = '')} />
  {/if}

  {#if profileId == null}
    <PageSection testId="financeiro-metas-historico-heading">
      <div class="flex items-center gap-2">
        <span class="text-primary" aria-hidden="true">
          <LucideIcon name={FINANCEIRO_GOALS_HISTORY_LUCIDE_ICON} size="lg" />
        </span>
        <h2 class="card-title text-lg">Histórico de metas</h2>
      </div>
      <EmptyStateCallout
        {...NO_BUDGET_PROFILE_EMPTY_STATE}
        card={false}
        testId="financeiro-metas-historico-sem-perfil"
      />
    </PageSection>
  {:else}
    <PageSection testId="financeiro-metas-historico-heading">
      <div class="flex items-center gap-2">
        <span class="text-primary" aria-hidden="true">
          <LucideIcon name={FINANCEIRO_GOALS_HISTORY_LUCIDE_ICON} size="lg" />
        </span>
        <h2 class="card-title text-lg">Histórico de metas</h2>
      </div>
      <p class="text-sm text-base-content/70">
        Catálogo completo do perfil. Metas com despesas ou recorrências só podem ser excluídas após
        limpar esses registros.
      </p>

      {#if loading}
        <span class="loading loading-spinner loading-md"></span>
      {:else}
        <div class="overflow-x-auto">
          <table class="table" data-testid="budget-metas-historico-table">
            <thead>
              <tr>
                <th>Meta</th>
                <th>Status</th>
                <th>Despesas</th>
                <th>Recorrentes</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {#each rows as row (row.id)}
                <tr data-testid="budget-metas-historico-row-{row.id}">
                  <td>
                    <span class="flex items-center gap-2 font-medium">
                      <span
                        class="inline-block h-3 w-3 rounded-full"
                        style:background-color={row.color}
                      ></span>
                      {row.name}
                    </span>
                  </td>
                  <td>
                    {#if activeMonthCategoryIds.has(row.id)}
                      <span class="badge badge-outline badge-info">Em uso no mês</span>
                    {:else}
                      <span class="badge badge-ghost">Só no catálogo</span>
                    {/if}
                    {#if row.can_delete}
                      <span class="badge badge-outline badge-success ml-1">Pode excluir</span>
                    {:else}
                      <span class="badge badge-outline badge-warning ml-1">Com registros</span>
                    {/if}
                  </td>
                  <td data-testid="budget-metas-historico-tx-count-{row.id}">
                    {row.transaction_count}
                  </td>
                  <td data-testid="budget-metas-historico-rec-count-{row.id}">
                    {row.recurring_count}
                  </td>
                  <td class="text-right">
                    <button
                      type="button"
                      class="btn btn-outline btn-xs"
                      data-testid="budget-metas-historico-open-{row.id}"
                      on:click={() => void openDetail(row.id)}
                    >
                      Ver registros
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

{#if selected}
  <div class="modal modal-open" data-testid="budget-metas-historico-detail-modal">
    <div class="modal-box max-w-2xl">
      <h3 class="flex items-center gap-2 text-lg font-medium">
        <span class="inline-block h-3 w-3 rounded-full" style:background-color={selected.color}></span>
        {selected.name}
      </h3>
      {#if loadingDetail}
        <span class="loading loading-spinner loading-md mt-4"></span>
      {:else}
        <div class="mt-3 flex flex-wrap gap-2 text-sm">
          <span class="badge badge-outline">{selected.transaction_count} despesa(s)</span>
          <span class="badge badge-outline">{selected.recurring_count} recorrente(s)</span>
          {#if selected.can_delete}
            <span class="badge badge-success badge-outline">Pode excluir</span>
          {/if}
        </div>

        <div class="mt-4">
          <h4 class="mb-2 font-medium">Despesas</h4>
          {#if selected.transactions.length === 0}
            <p class="text-sm text-base-content/60">Nenhuma despesa vinculada.</p>
          {:else}
            <div class="max-h-48 overflow-y-auto">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Descrição</th>
                    <th>Mês</th>
                    <th class="text-right">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {#each selected.transactions as tx (tx.id)}
                    <tr data-testid="budget-metas-historico-tx-{tx.id}">
                      <td>{formatIsoDateToBr(tx.event_date)}</td>
                      <td>
                        {tx.description}
                        {#if tx.recurring}
                          <span class="badge badge-ghost badge-sm ml-1">Recorrente</span>
                        {/if}
                      </td>
                      <td>{tx.year_month}</td>
                      <td class="text-right text-error">{formatBrl(tx.amount_brl)}</td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {/if}
        </div>

        <div class="mt-4">
          <h4 class="mb-2 font-medium">Recorrências</h4>
          {#if selected.recurring_expenses.length === 0}
            <p class="text-sm text-base-content/60">Nenhuma regra recorrente.</p>
          {:else}
            <ul class="space-y-1 text-sm">
              {#each selected.recurring_expenses as rule (rule.id)}
                <li data-testid="budget-metas-historico-rec-{rule.id}">
                  {rule.description} — {formatBrl(rule.amount_brl)}
                  <span class="text-base-content/60">
                    (desde {rule.start_year_month}{rule.end_year_month
                      ? ` até ${rule.end_year_month}`
                      : ', indefinida'})
                  </span>
                </li>
              {/each}
            </ul>
          {/if}
        </div>

        <div class="modal-action flex-wrap justify-between gap-2">
          <div class="flex flex-wrap gap-2">
            {#if !selected.can_delete}
              <button
                type="button"
                class="btn btn-outline btn-error gap-1"
                data-testid="budget-metas-historico-clear-expenses"
                disabled={clearing}
                on:click={() => (confirmClearOpen = true)}
              >
                <LucideIcon name={PROVENTOS_REMOVE_LUCIDE_ICON} size="sm" aria-hidden="true" />
                {clearing ? 'Excluindo…' : 'Excluir todas as despesas'}
              </button>
            {/if}
            <button
              type="button"
              class="btn btn-error gap-1"
              data-testid="budget-metas-historico-delete-category"
              disabled={!selected.can_delete || deleting}
              on:click={() => (confirmDeleteOpen = true)}
            >
              <LucideIcon name={PROVENTOS_REMOVE_LUCIDE_ICON} size="sm" aria-hidden="true" />
              {deleting ? 'Excluindo…' : 'Excluir meta em definitivo'}
            </button>
          </div>
          <button
            type="button"
            class="btn btn-ghost"
            data-testid="budget-metas-historico-detail-close"
            on:click={closeDetail}
          >
            Fechar
          </button>
        </div>
      {/if}
    </div>
    <button type="button" class="modal-backdrop" aria-label="Fechar" on:click={closeDetail}></button>
  </div>
{/if}

{#if confirmClearOpen && selected}
  <div class="modal modal-open" data-testid="budget-metas-historico-clear-confirm">
    <div class="modal-box">
      <h3 class="text-lg font-medium">Excluir todas as despesas?</h3>
      <p class="mt-3 text-sm">
        Isso remove todas as despesas e regras recorrentes da meta
        <strong>{selected.name}</strong> (passado e futuro). Depois disso será possível excluir a
        meta em definitivo.
      </p>
      <div class="modal-action">
        <button
          type="button"
          class="btn btn-ghost"
          disabled={clearing}
          on:click={() => (confirmClearOpen = false)}
        >
          Cancelar
        </button>
        <button
          type="button"
          class="btn btn-error"
          data-testid="budget-metas-historico-clear-confirm-btn"
          disabled={clearing}
          on:click={() => void clearExpenses()}
        >
          {clearing ? 'Excluindo…' : 'Excluir despesas'}
        </button>
      </div>
    </div>
    <button
      type="button"
      class="modal-backdrop"
      aria-label="Fechar"
      on:click={() => (confirmClearOpen = false)}
    ></button>
  </div>
{/if}

{#if confirmDeleteOpen && selected}
  <div class="modal modal-open" data-testid="budget-metas-historico-delete-confirm">
    <div class="modal-box">
      <h3 class="text-lg font-medium">Excluir meta em definitivo?</h3>
      <p class="mt-3 text-sm">
        A meta <strong>{selected.name}</strong> será removida do catálogo e deixará de aparecer em
        «Incluir meta existente».
      </p>
      <div class="modal-action">
        <button
          type="button"
          class="btn btn-ghost"
          disabled={deleting}
          on:click={() => (confirmDeleteOpen = false)}
        >
          Cancelar
        </button>
        <button
          type="button"
          class="btn btn-error"
          data-testid="budget-metas-historico-delete-confirm-btn"
          disabled={deleting}
          on:click={() => void deleteMeta()}
        >
          {deleting ? 'Excluindo…' : 'Excluir meta'}
        </button>
      </div>
    </div>
    <button
      type="button"
      class="modal-backdrop"
      aria-label="Fechar"
      on:click={() => (confirmDeleteOpen = false)}
    ></button>
  </div>
{/if}

<script lang="ts">
  import { onMount } from 'svelte';

  import {
    createBudgetProfile,
    deleteBudgetProfile,
    listBudgetProfiles,
    setActiveBudgetProfileId,
    updateBudgetProfile,
    type BudgetProfile
  } from '$lib/api/budget';
  import { parseApiError } from '$lib/api/parseApiError';
  import BudgetProfileFormModal from '$lib/features/financeiro/BudgetProfileFormModal.svelte';
  import { getBudgetLayoutContext } from '$lib/features/financeiro/budgetLayoutContext';

  const ctx = getBudgetLayoutContext();

  let profiles: BudgetProfile[] = [];
  let loading = true;
  let saving = false;
  let error = '';
  let modalError = '';
  let createName = '';
  let createDescription = '';
  let editOpen = false;
  let editingProfile: BudgetProfile | null = null;

  async function loadProfiles() {
    loading = true;
    error = '';
    try {
      profiles = await listBudgetProfiles();
      ctx.profiles.set(profiles);
    } catch (err) {
      profiles = [];
      error = parseApiError(err, 'Não foi possível carregar os perfis.');
    } finally {
      loading = false;
    }
  }

  async function createProfile() {
    if (!createName.trim()) {
      error = 'Informe o nome do perfil.';
      return;
    }
    saving = true;
    error = '';
    try {
      const created = await createBudgetProfile({
        name: createName.trim(),
        description: createDescription.trim() || null
      });
      await setActiveBudgetProfileId(created.id);
      ctx.activeProfileId.set(created.id);
      createName = '';
      createDescription = '';
      await ctx.reloadProfiles();
      await loadProfiles();
    } catch (err) {
      error = parseApiError(err, 'Não foi possível criar o perfil.');
    } finally {
      saving = false;
    }
  }

  function openEditModal(profile: BudgetProfile) {
    editingProfile = profile;
    modalError = '';
    editOpen = true;
  }

  function closeEditModal() {
    editOpen = false;
    editingProfile = null;
    modalError = '';
  }

  async function saveEditedProfile(
    event: CustomEvent<{ name: string; description: string | null }>
  ) {
    if (editingProfile == null) {
      return;
    }
    saving = true;
    modalError = '';
    try {
      await updateBudgetProfile(editingProfile.id, event.detail);
      closeEditModal();
      await ctx.reloadProfiles();
      await loadProfiles();
    } catch (err) {
      modalError = parseApiError(err, 'Não foi possível salvar o perfil.');
    } finally {
      saving = false;
    }
  }

  async function removeProfile(profile: BudgetProfile) {
    try {
      await deleteBudgetProfile(profile.id);
      await ctx.reloadProfiles();
      await loadProfiles();
    } catch (err) {
      error = parseApiError(err, 'Não foi possível excluir o perfil.');
    }
  }

  onMount(() => {
    void loadProfiles();
  });
</script>

<svelte:head>
  <title>Perfis — Financeiro</title>
</svelte:head>

<h2 class="text-xl font-semibold" data-testid="financeiro-perfis-heading">Perfis de orçamento</h2>

{#if error}
  <div class="alert alert-error">{error}</div>
{/if}

<div class="card bg-base-100 shadow">
  <div class="card-body gap-3">
    <h3 class="card-title text-base">Novo perfil</h3>
    <input
      class="input input-bordered"
      bind:value={createName}
      placeholder="Nome"
      data-testid="budget-profile-name"
    />
    <textarea
      class="textarea textarea-bordered"
      rows="2"
      bind:value={createDescription}
      placeholder="Descrição (opcional)"
      data-testid="budget-profile-description"
    ></textarea>
    <div>
      <button
        type="button"
        class="btn btn-primary"
        data-testid="budget-profile-save"
        disabled={saving}
        on:click={createProfile}
      >
        {saving ? 'Salvando…' : 'Criar perfil'}
      </button>
    </div>
  </div>
</div>

{#if loading}
  <span class="loading loading-spinner loading-md"></span>
{:else}
  <div class="overflow-x-auto">
    <table class="table">
      <thead>
        <tr>
          <th>Nome</th>
          <th>Descrição</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {#each profiles as profile (profile.id)}
          <tr data-testid="budget-profile-row-{profile.id}">
            <td>{profile.name}</td>
            <td>{profile.description ?? '—'}</td>
            <td class="space-x-2 text-right">
              <button
                type="button"
                class="btn btn-ghost btn-xs"
                data-testid="budget-profile-edit-{profile.id}"
                on:click={() => openEditModal(profile)}
              >
                Editar
              </button>
              <button
                type="button"
                class="btn btn-ghost btn-xs text-error"
                data-testid="budget-profile-delete-{profile.id}"
                on:click={() => void removeProfile(profile)}
              >
                Excluir
              </button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}

<BudgetProfileFormModal
  open={editOpen}
  initial={editingProfile}
  {saving}
  error={modalError}
  on:close={closeEditModal}
  on:save={saveEditedProfile}
/>

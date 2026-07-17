<script lang="ts">
  import PortfolioHubAllocationSummary from '$lib/features/portfolios/PortfolioHubAllocationSummary.svelte';
  import {
    PRESET_INVESTOR_PROFILES,
    type PresetInvestorProfileId,
    getInvestorProfile
  } from '$lib/features/portfolios/portfolioInvestorProfiles';
  import {
    cloneAllocationTargets,
    serializeAllocationTargets,
    type AllocationTargets
  } from '$lib/features/rebalance/allocationTargets';

  export let open = false;
  export let onClose: () => void = () => undefined;
  export let onApply: (targets: AllocationTargets) => void = () => undefined;

  let selectedId: PresetInvestorProfileId = 'moderate';

  $: previewAllocationJson = serializeAllocationTargets(
    getInvestorProfile(selectedId).targets
  );
  $: selectedProfile = getInvestorProfile(selectedId);

  function handleClose() {
    onClose();
  }

  function handleApply() {
    onApply(cloneAllocationTargets(selectedProfile.targets));
    onClose();
  }
</script>

{#if open}
  <dialog class="modal modal-open" aria-modal="true" data-testid="rebalance-profile-preset-modal">
    <div class="modal-box max-w-2xl">
      <h3 class="text-lg font-bold">Aplicar perfil predefinido</h3>
      <p class="mt-2 text-sm text-base-content/70">
        Escolha um perfil para preencher as metas. Confirme para aplicar no formulário — use
        «Salvar metas» para persistir na carteira.
      </p>

      <div class="mt-4 grid gap-3 sm:grid-cols-3" data-testid="rebalance-profile-preset-options">
        {#each PRESET_INVESTOR_PROFILES as profile (profile.id)}
          <label
            class="cursor-pointer rounded-xl border p-3 transition-colors
              {selectedId === profile.id
              ? 'border-primary bg-primary/5'
              : 'border-base-300 bg-base-100 hover:border-primary/40'}"
            data-testid="rebalance-profile-preset-{profile.id}"
          >
            <input
              class="radio radio-primary radio-sm"
              type="radio"
              name="rebalance-profile-preset"
              value={profile.id}
              bind:group={selectedId}
            />
            <span class="ml-2 font-medium">{profile.label}</span>
            <p class="mt-2 text-sm text-base-content/70">{profile.description}</p>
          </label>
        {/each}
      </div>

      <div class="mt-4">
        <PortfolioHubAllocationSummary
          allocationTargetsJson={previewAllocationJson}
          variant="preview"
          profileLabelOverride={selectedProfile.label}
        />
      </div>

      <div class="modal-action">
        <button
          type="button"
          class="btn btn-ghost"
          data-testid="rebalance-profile-preset-cancel"
          on:click={handleClose}
        >
          Cancelar
        </button>
        <button
          type="button"
          class="btn btn-primary"
          data-testid="rebalance-profile-preset-apply"
          on:click={handleApply}
        >
          Aplicar perfil
        </button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button type="button" aria-label="Fechar" on:click={handleClose}></button>
    </form>
  </dialog>
{/if}

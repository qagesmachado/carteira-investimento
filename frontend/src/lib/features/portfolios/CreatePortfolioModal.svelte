<script lang="ts">

  import { createEventDispatcher } from 'svelte';



  import type { PortfolioCreate } from '$lib/api/portfolios';

  import {

    allocationTargetsJsonForProfile,

    INVESTOR_PROFILES,

    type InvestorProfileId

  } from '$lib/features/portfolios/portfolioInvestorProfiles';

  import PortfolioCustomAllocationEditor from '$lib/features/portfolios/PortfolioCustomAllocationEditor.svelte';

  import PortfolioHubAllocationSummary from '$lib/features/portfolios/PortfolioHubAllocationSummary.svelte';

  import {

    buildPortfolioCreatePayload,

    getPortfolioTemplate,

    PORTFOLIO_TEMPLATES,

    type PortfolioTemplateId

  } from '$lib/features/portfolios/portfolioTemplates';

  import {

    defaultAllocationTargets,

    serializeAllocationTargets,

    validateAllocationTargets,

    type AllocationTargets

  } from '$lib/features/rebalance/allocationTargets';



  export let open = false;

  export let loading = false;

  export let onClose: () => void = () => undefined;

  export let onCreate: (payload: PortfolioCreate) => void | Promise<void> = () => undefined;



  const dispatch = createEventDispatcher<{ close: void }>();



  let profileId: InvestorProfileId = 'moderate';

  let templateId: PortfolioTemplateId = 'personal';

  let name = '';

  let holder = '';

  let error = '';

  let saving = false;

  let customTargets: AllocationTargets = defaultAllocationTargets();



  $: selectedTemplate = getPortfolioTemplate(templateId);

  $: previewAllocationJson = allocationTargetsJsonForProfile(profileId);

  $: customAllocationError =

    profileId === 'custom' ? validateAllocationTargets(customTargets) : null;

  $: canSubmitCustom = profileId !== 'custom' || customAllocationError === null;



  let prevOpen = false;

  let prevTemplateId: PortfolioTemplateId | null = null;

  let prevProfileId: InvestorProfileId = 'moderate';



  $: if (open && !prevOpen) {

    prevOpen = true;

    profileId = 'moderate';

    templateId = 'personal';

    prevTemplateId = null;

    prevProfileId = 'moderate';

    customTargets = defaultAllocationTargets();

    applyTemplateDefaults();

    error = '';

  } else if (!open && prevOpen) {

    prevOpen = false;

    prevTemplateId = null;

  }



  $: if (open && profileId === 'custom' && prevProfileId !== 'custom') {

    customTargets = defaultAllocationTargets();

  }

  $: if (open) {

    prevProfileId = profileId;

  }



  $: if (open && templateId !== prevTemplateId) {

    if (prevTemplateId != null) {

      applyTemplateDefaults();

    }

    prevTemplateId = templateId;

  }



  function applyTemplateDefaults() {

    name = getPortfolioTemplate(templateId).suggestedName;

    holder = '';

  }



  function handleClose() {

    open = false;

    dispatch('close');

    onClose();

  }



  async function handleSubmit() {

    if (!name.trim()) {

      error = 'Informe o nome da carteira.';

      return;

    }

    if (profileId === 'custom' && customAllocationError) {

      error = customAllocationError;

      return;

    }

    saving = true;

    error = '';

    try {

      const allocationTargetsJson =

        profileId === 'custom'

          ? serializeAllocationTargets(customTargets)

          : allocationTargetsJsonForProfile(profileId);

      const payload = buildPortfolioCreatePayload({

        name: name.trim(),

        templateId,

        holder: holder.trim() || undefined,

        allocationTargetsJson

      });

      await onCreate(payload);

    } catch (err) {

      error = err instanceof Error ? err.message : 'Não foi possível criar a carteira.';

    } finally {

      saving = false;

    }

  }

</script>



{#if open}

  <div class="modal modal-open" data-testid="create-portfolio-modal">

    <div class="modal-box max-w-4xl">

      <h3 class="text-lg font-bold">Nova carteira</h3>

      <p class="mt-1 text-sm text-base-content/70">

        Escolha o perfil de investidor e o tipo de carteira. Você poderá adicionar ativos na próxima

        etapa.

      </p>



      <div class="mt-6">

        <h4 class="text-sm font-semibold uppercase tracking-wide text-base-content/60">

          Perfil de investidor

        </h4>

        <div class="mt-3 grid gap-3 sm:grid-cols-2">

          {#each INVESTOR_PROFILES as profile (profile.id)}

            <label

              class="cursor-pointer rounded-xl border p-4 transition-colors {profileId === profile.id

                ? 'border-primary bg-primary/5'

                : 'border-base-300 bg-base-100'}"

              data-testid="investor-profile-{profile.id}"

            >

              <input

                class="radio radio-primary radio-sm"

                type="radio"

                name="investor-profile"

                value={profile.id}

                bind:group={profileId}

              />

              <span class="ml-2 font-medium">{profile.label}</span>

              <p class="mt-2 text-sm text-base-content/70">{profile.description}</p>

            </label>

          {/each}

        </div>

      </div>



      <div class="mt-4 space-y-4">

        {#if profileId === 'custom'}

          <PortfolioCustomAllocationEditor bind:targets={customTargets} />

        {:else}

          <PortfolioHubAllocationSummary

            allocationTargetsJson={previewAllocationJson}

            variant="preview"

          />

        {/if}

      </div>



      <div class="mt-6">

        <h4 class="text-sm font-semibold uppercase tracking-wide text-base-content/60">

          Tipo de carteira

        </h4>

        <div class="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">

          {#each PORTFOLIO_TEMPLATES as item (item.id)}

            <button

              type="button"

              class="rounded-xl border p-3 text-left transition-colors {templateId === item.id

                ? 'border-primary bg-primary/5'

                : 'border-base-300 bg-base-100 hover:border-primary/40'}"

              on:click={() => (templateId = item.id)}

            >

              <span class="font-medium">{item.label}</span>

              <p class="mt-1 text-xs text-base-content/70">{item.description}</p>

            </button>

          {/each}

        </div>

      </div>



      <div class="mt-6 grid gap-4 md:grid-cols-2">

        <label class="form-control">

          <span class="label-text">Nome da carteira</span>

          <input

            class="input input-bordered"

            bind:value={name}

            placeholder="Nome"

            aria-label="Nome da carteira"

          />

        </label>

        <label class="form-control">

          <span class="label-text">Titular (opcional)</span>

          <input

            class="input input-bordered"

            bind:value={holder}

            placeholder={selectedTemplate.holderPlaceholder}

          />

        </label>

      </div>



      {#if error}

        <p class="mt-4 text-sm text-error" role="alert">{error}</p>

      {/if}



      <div class="modal-action">

        <button class="btn btn-ghost" type="button" disabled={saving || loading} on:click={handleClose}>

          Cancelar

        </button>

        <button

          class="btn btn-primary"

          type="button"

          disabled={saving || loading || !canSubmitCustom}

          on:click={handleSubmit}

        >

          {saving ? 'Criando…' : 'Criar carteira'}

        </button>

      </div>

    </div>

    <button class="modal-backdrop" type="button" aria-label="Fechar" on:click={handleClose}></button>

  </div>

{/if}



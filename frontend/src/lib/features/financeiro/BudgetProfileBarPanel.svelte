<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  import type { BudgetProfile } from '$lib/api/budget';
  import LucideIcon from '$lib/components/LucideIcon.svelte';
  import PageSection from '$lib/components/PageSection.svelte';
  import { FINANCEIRO_PROFILES_LUCIDE_ICON } from '$lib/icons/lucideIconCatalog';

  import BudgetProfileSelect from './BudgetProfileSelect.svelte';

  export let profiles: BudgetProfile[] = [];
  export let activeId: number | null = null;
  export let disabled = false;
  export let profileSelectTestId = 'budget-profile-select';
  export let testId = 'budget-profile-bar';

  const dispatch = createEventDispatcher<{ select: number }>();

  $: activeName = profiles.find((profile) => profile.id === activeId)?.name ?? '';
  $: displayName = activeName.trim() || 'Nenhum perfil';
</script>

<PageSection {testId}>
  <div class="flex flex-wrap items-center justify-between gap-4" data-testid="budget-profile-bar-body">
    <div class="flex min-w-0 flex-1 items-center gap-4">
      <div
        class="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"
        aria-hidden="true"
      >
        <LucideIcon name={FINANCEIRO_PROFILES_LUCIDE_ICON} size="2xl" />
      </div>

      <div class="min-w-0">
        <p class="text-sm text-base-content/60">Perfil</p>
        <div class="relative mt-0.5 inline-flex min-h-[1.75rem] min-w-[10rem] max-w-full items-center">
          <div class="pointer-events-none flex items-center gap-2 pr-1">
            <span class="truncate text-lg font-bold text-base-content">{displayName}</span>
            <svg
              class="h-4 w-4 shrink-0 text-base-content/50"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <BudgetProfileSelect
            {profiles}
            {activeId}
            {disabled}
            selectClass="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            testId={profileSelectTestId}
            on:select={(event) => dispatch('select', event.detail)}
          />
        </div>
      </div>
    </div>
  </div>
</PageSection>

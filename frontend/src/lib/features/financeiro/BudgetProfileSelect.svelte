<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  import type { BudgetProfile } from '$lib/api/budget';

  export let profiles: BudgetProfile[] = [];
  export let activeId: number | null = null;
  export let disabled = false;
  export let selectClass = 'select select-bordered select-sm w-full max-w-xs';
  export let ariaLabel = 'Selecionar perfil de orçamento';
  export let testId: string | undefined = 'budget-profile-select';

  const dispatch = createEventDispatcher<{ select: number }>();

  $: selectValue = activeId != null ? String(activeId) : '';

  function handleChange(event: Event) {
    const target = event.currentTarget as HTMLSelectElement;
    const id = Number(target.value);
    if (!Number.isFinite(id) || id === activeId) {
      return;
    }
    dispatch('select', id);
  }
</script>

<select
  class={selectClass}
  {disabled}
  value={selectValue}
  data-testid={testId}
  on:change={handleChange}
  aria-label={ariaLabel}
>
  {#if profiles.length === 0}
    <option value="">Nenhum perfil</option>
  {:else}
    {#each profiles as profile (profile.id)}
      <option value={String(profile.id)}>{profile.name}</option>
    {/each}
  {/if}
</select>

<script lang="ts">
  import { updateAllocationPurpose } from '$lib/api/objetivos';
  import { createEventDispatcher } from 'svelte';

  export let portfolioId: number;
  export let objectiveId: number;
  export let allocationId: number;
  export let excludeFromRebalance = false;
  export let isEmergencyReserve = false;
  export let disabled = false;
  export let compact = false;

  const dispatch = createEventDispatcher<{ updated: void }>();

  let saving = false;
  let error = '';

  async function saveFlags(patch: {
    exclude_from_rebalance?: boolean;
    is_emergency_reserve?: boolean;
  }) {
    saving = true;
    error = '';
    try {
      await updateAllocationPurpose(portfolioId, objectiveId, allocationId, patch);
      dispatch('updated');
    } catch (err) {
      error = err instanceof Error ? err.message : 'Não foi possível salvar a finalidade.';
    } finally {
      saving = false;
    }
  }

  async function onExcludeChange(event: Event) {
    const checked = (event.currentTarget as HTMLInputElement).checked;
    await saveFlags({ exclude_from_rebalance: checked });
  }

  async function onEmergencyChange(event: Event) {
    const checked = (event.currentTarget as HTMLInputElement).checked;
    await saveFlags({ is_emergency_reserve: checked });
  }
</script>

<div class="space-y-1" data-testid={`allocation-purpose-${allocationId}`}>
  <label class="flex cursor-pointer items-center gap-1.5 text-xs">
    <input
      type="checkbox"
      class="checkbox checkbox-xs"
      checked={excludeFromRebalance}
      disabled={disabled || saving || isEmergencyReserve}
      data-testid={`exclude-rebalance-${allocationId}`}
      on:change={onExcludeChange}
    />
    <span>Não é investimento</span>
  </label>
  <label class="flex cursor-pointer items-center gap-1.5 text-xs">
    <input
      type="checkbox"
      class="checkbox checkbox-xs"
      checked={isEmergencyReserve}
      disabled={disabled || saving}
      data-testid={`emergency-reserve-${allocationId}`}
      on:change={onEmergencyChange}
    />
    <span>É reserva de emergência</span>
  </label>
  {#if error && !compact}
    <p class="text-xs text-error">{error}</p>
  {/if}
</div>

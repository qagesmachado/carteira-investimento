<script lang="ts">
  import RebalanceClassTargetsEditor from '$lib/features/rebalance/RebalanceClassTargetsEditor.svelte';
  import type { AllocationTargets } from '$lib/features/rebalance/allocationTargets';

  export let targets: AllocationTargets;
</script>

<RebalanceClassTargetsEditor bind:targets />

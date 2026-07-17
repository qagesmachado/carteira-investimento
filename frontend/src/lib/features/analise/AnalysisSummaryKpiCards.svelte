<script lang="ts">
  import LucideIcon from '$lib/components/LucideIcon.svelte';

  export let classifiedCount = 0;
  export let pendingCount = 0;
  export let onReviewPending: () => void = () => undefined;

  const cardClass =
    'flex min-w-[10rem] flex-1 items-center gap-3 rounded-box border border-base-300 bg-base-100 px-4 py-3';
</script>

<div class="grid gap-3 sm:grid-cols-2" data-testid="analysis-summary-kpi-cards">
  <div class={cardClass} data-testid="analysis-kpi-classified">
    <div
      class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
      aria-hidden="true"
    >
      <LucideIcon name="CircleCheck" size="md" />
    </div>
    <div class="min-w-0">
      <p class="text-xs text-base-content/60">Ativos classificados</p>
      <p class="truncate text-2xl font-semibold text-primary">{classifiedCount}</p>
    </div>
  </div>

  <div class={cardClass} data-testid="analysis-kpi-pending">
    <div
      class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning/10 text-warning"
      aria-hidden="true"
    >
      <LucideIcon name="CircleEllipsis" size="md" />
    </div>
    <div class="min-w-0 flex-1">
      <p class="text-xs text-base-content/60">Pendentes</p>
      <p class="truncate text-2xl font-semibold text-warning">{pendingCount}</p>
      <p class="text-xs text-base-content/50">Excluídos dos totais de alocação</p>
      {#if pendingCount > 0}
        <button
          type="button"
          class="btn btn-warning btn-xs mt-2"
          data-testid="analysis-kpi-pending-review"
          on:click={onReviewPending}
        >
          Conferir
        </button>
      {/if}
    </div>
  </div>
</div>

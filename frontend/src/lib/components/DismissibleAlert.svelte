<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let text = '';
  export let variant: 'success' | 'error' | 'warning' = 'success';

  $: alertClass =
    variant === 'success'
      ? 'alert-success'
      : variant === 'warning'
        ? 'alert-warning'
        : 'alert-error';

  const dispatch = createEventDispatcher<{ dismiss: void }>();
</script>

{#if text}
  <div
    role="alert"
    class="alert !flex w-full flex-row items-center justify-between gap-4 text-left {alertClass}"
  >
    <span class="min-w-0 flex-1">{text}</span>
    <button
      type="button"
      class="btn btn-ghost btn-sm btn-square shrink-0"
      aria-label="Fechar mensagem"
      on:click={() => dispatch('dismiss')}
    >
      <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path
          d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
        />
      </svg>
    </button>
  </div>
{/if}

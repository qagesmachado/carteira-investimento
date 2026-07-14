<script lang="ts">
  import { onDestroy } from 'svelte';

  import LucideIcon from '$lib/components/LucideIcon.svelte';
  import type { LucideIconName } from '$lib/icons/lucideIconCatalog';
  import {
    APP_TOAST_SUCCESS_AUTO_DISMISS_MS,
    type AppToastItem
  } from '$lib/stores/appToast';

  export let item: AppToastItem;
  export let alertClass = '';
  export let iconWrapClass = '';
  export let iconName: LucideIconName;
  export let onDismiss: (item: AppToastItem) => void;

  let autoDismissTimer: ReturnType<typeof setTimeout> | undefined;

  function clearAutoDismissTimer(): void {
    if (autoDismissTimer != null) {
      clearTimeout(autoDismissTimer);
      autoDismissTimer = undefined;
    }
  }

  function scheduleAutoDismiss(): void {
    clearAutoDismissTimer();
    if (item.variant !== 'success') {
      return;
    }
    autoDismissTimer = setTimeout(() => onDismiss(item), APP_TOAST_SUCCESS_AUTO_DISMISS_MS);
  }

  $: scheduleAutoDismiss(item.text, item.variant);

  onDestroy(clearAutoDismissTimer);
</script>

<div
  role="alert"
  class="alert pointer-events-auto flex items-start gap-3 rounded-xl border border-base-300/70 bg-base-100 p-3 shadow-lg {alertClass}"
  data-testid="app-toast-{item.variant}"
>
  <span
    class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg {iconWrapClass}"
    aria-hidden="true"
  >
    <LucideIcon name={iconName} size="md" />
  </span>
  <p class="min-w-0 flex-1 pt-1 text-sm leading-snug text-base-content">{item.text}</p>
  <button
    type="button"
    class="btn btn-sm btn-square shrink-0 border border-base-content/25 bg-base-content/10 text-base-content hover:border-base-content/40 hover:bg-base-content/15"
    aria-label="Fechar mensagem"
    data-testid="app-toast-close"
    on:click={() => onDismiss(item)}
  >
    <LucideIcon name="X" size="sm" />
  </button>
</div>

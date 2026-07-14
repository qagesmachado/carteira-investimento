<script lang="ts">
  import { onDestroy } from 'svelte';
  import { createEventDispatcher } from 'svelte';

  import { appToast } from '$lib/stores/appToast';

  export let text = '';
  /** Alias legado usado em algumas telas. */
  export let message = '';
  export let variant: 'success' | 'error' | 'warning' = 'success';

  let slotHost: HTMLSpanElement | undefined;
  let slotText = '';

  const dispatch = createEventDispatcher<{ dismiss: void }>();
  const toastId = crypto.randomUUID();

  $: slotText = slotHost?.textContent?.trim() ?? '';
  $: resolvedText = (text || message || slotText).trim();

  $: syncToast(resolvedText, variant);

  function syncToast(value: string, toastVariant: typeof variant): void {
    if (!value) {
      appToast.dismiss(toastId);
      return;
    }
    appToast.upsert({
      id: toastId,
      text: value,
      variant: toastVariant,
      onDismiss: () => dispatch('dismiss')
    });
  }

  onDestroy(() => {
    appToast.dismiss(toastId);
  });
</script>

<!-- Captura texto de slot legado ({error} dentro do componente). -->
<span bind:this={slotHost} class="hidden" aria-hidden="true"><slot /></span>

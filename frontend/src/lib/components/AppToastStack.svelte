<script lang="ts">
  import AppToastCard from '$lib/components/AppToastCard.svelte';
  import {
    APP_TOAST_ERROR_LUCIDE_ICON,
    APP_TOAST_SUCCESS_LUCIDE_ICON,
    APP_TOAST_WARNING_LUCIDE_ICON,
    type LucideIconName
  } from '$lib/icons/lucideIconCatalog';
  import { appToast, type AppToastItem, type AppToastVariant } from '$lib/stores/appToast';

  const VARIANT_STYLES: Record<
    AppToastVariant,
    { alertClass: string; iconWrap: string; icon: LucideIconName }
  > = {
    success: {
      alertClass: 'alert-success',
      iconWrap: 'bg-success/15 text-success',
      icon: APP_TOAST_SUCCESS_LUCIDE_ICON
    },
    error: {
      alertClass: 'alert-error',
      iconWrap: 'bg-error/15 text-error',
      icon: APP_TOAST_ERROR_LUCIDE_ICON
    },
    warning: {
      alertClass: 'alert-warning',
      iconWrap: 'bg-warning/15 text-warning',
      icon: APP_TOAST_WARNING_LUCIDE_ICON
    }
  };

  function dismissToast(item: AppToastItem): void {
    appToast.dismiss(item.id);
    item.onDismiss?.();
  }
</script>

<div
  class="pointer-events-none fixed bottom-4 right-4 z-[120] flex w-full max-w-sm flex-col gap-2 sm:max-w-md"
  aria-live="polite"
  aria-relevant="additions"
  data-testid="app-toast-stack"
>
  {#each $appToast as item (item.id)}
    {@const styles = VARIANT_STYLES[item.variant]}
    <AppToastCard
      {item}
      alertClass={styles.alertClass}
      iconWrapClass={styles.iconWrap}
      iconName={styles.icon}
      onDismiss={dismissToast}
    />
  {/each}
</div>

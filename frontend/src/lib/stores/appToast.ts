import { writable } from 'svelte/store';

export type AppToastVariant = 'success' | 'error' | 'warning';

/** Tempo até fechar automaticamente toasts de sucesso. */
export const APP_TOAST_SUCCESS_AUTO_DISMISS_MS = 10_000;

export type AppToastItem = {
  id: string;
  text: string;
  variant: AppToastVariant;
  onDismiss?: () => void;
};

function createAppToastStore() {
  const { subscribe, update } = writable<AppToastItem[]>([]);

  function upsert(item: AppToastItem): void {
    update((items) => {
      const index = items.findIndex((entry) => entry.id === item.id);
      if (index < 0) {
        return [...items, item];
      }
      const next = [...items];
      next[index] = item;
      return next;
    });
  }

  function dismiss(id: string): void {
    update((items) => items.filter((entry) => entry.id !== id));
  }

  function clear(): void {
    update(() => []);
  }

  return { subscribe, upsert, dismiss, clear };
}

export const appToast = createAppToastStore();

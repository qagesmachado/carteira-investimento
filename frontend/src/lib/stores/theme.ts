import { get, writable } from 'svelte/store';

import { applyThemeToDocument, type AppTheme } from '$lib/theme/applyTheme';

export const STORAGE_KEY = 'carteira.theme';

function canUseStorage(): boolean {
  return typeof localStorage !== 'undefined';
}

export function parseStoredTheme(raw: string | null): AppTheme {
  return raw === 'light' || raw === 'dim' ? raw : 'light';
}

function readStored(): AppTheme {
  if (!canUseStorage()) {
    return 'light';
  }
  try {
    return parseStoredTheme(localStorage.getItem(STORAGE_KEY));
  } catch {
    return 'light';
  }
}

function writeStored(value: AppTheme): void {
  if (!canUseStorage()) {
    return;
  }
  localStorage.setItem(STORAGE_KEY, value);
}

function applyTheme(value: AppTheme): void {
  applyThemeToDocument(value);
}

export const theme = writable<AppTheme>(readStored());

export function toggleTheme(): void {
  theme.update((current) => {
    const next: AppTheme = current === 'light' ? 'dim' : 'light';
    writeStored(next);
    applyTheme(next);
    return next;
  });
}

export function setTheme(value: AppTheme): void {
  theme.set(value);
  writeStored(value);
  applyTheme(value);
}

export function getTheme(): AppTheme {
  return get(theme);
}

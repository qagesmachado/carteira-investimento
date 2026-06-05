import { get, writable } from 'svelte/store';

export const STORAGE_KEY = 'carteira.hideMoneyValues';

function canUseStorage(): boolean {
  return typeof localStorage !== 'undefined';
}

function readStored(): boolean {
  if (!canUseStorage()) {
    return false;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      return false;
    }
    return JSON.parse(raw) === true;
  } catch {
    return false;
  }
}

function writeStored(value: boolean): void {
  if (!canUseStorage()) {
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

export const hideMoneyValues = writable(readStored());

export function toggleHideMoneyValues(): void {
  hideMoneyValues.update((current) => {
    const next = !current;
    writeStored(next);
    return next;
  });
}

export function setHideMoneyValues(value: boolean): void {
  hideMoneyValues.set(value);
  writeStored(value);
}

export function getHideMoneyValues(): boolean {
  return get(hideMoneyValues);
}

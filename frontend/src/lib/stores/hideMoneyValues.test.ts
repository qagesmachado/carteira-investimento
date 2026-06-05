import { get } from 'svelte/store';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  hideMoneyValues,
  setHideMoneyValues,
  STORAGE_KEY,
  toggleHideMoneyValues
} from './hideMoneyValues';

describe('hideMoneyValues store', () => {
  beforeEach(() => {
    localStorage.clear();
    setHideMoneyValues(false);
  });

  afterEach(() => {
    localStorage.clear();
    setHideMoneyValues(false);
  });

  it('inicia desligado quando localStorage vazio', () => {
    expect(get(hideMoneyValues)).toBe(false);
  });

  it('toggle alterna e persiste em localStorage', () => {
    toggleHideMoneyValues();
    expect(get(hideMoneyValues)).toBe(true);
    expect(localStorage.getItem(STORAGE_KEY)).toBe('true');

    toggleHideMoneyValues();
    expect(get(hideMoneyValues)).toBe(false);
    expect(localStorage.getItem(STORAGE_KEY)).toBe('false');
  });

  it('setHideMoneyValues grava preferência', () => {
    setHideMoneyValues(true);
    expect(get(hideMoneyValues)).toBe(true);
    expect(localStorage.getItem(STORAGE_KEY)).toBe('true');
  });
});

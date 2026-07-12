import { get } from 'svelte/store';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { getTheme, parseStoredTheme, setTheme, STORAGE_KEY, theme, toggleTheme } from './theme';

describe('theme store', () => {
  beforeEach(() => {
    localStorage.clear();
    setTheme('light');
  });

  afterEach(() => {
    localStorage.clear();
    setTheme('light');
  });

  it('inicia em light quando localStorage vazio', () => {
    expect(get(theme)).toBe('light');
  });

  it('toggle alterna entre light e dark e persiste em localStorage', () => {
    toggleTheme();
    expect(get(theme)).toBe('dark');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('dark');

    toggleTheme();
    expect(get(theme)).toBe('light');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('light');
  });

  it('setTheme grava preferência', () => {
    setTheme('dark');
    expect(get(theme)).toBe('dark');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('dark');
    expect(getTheme()).toBe('dark');
  });

  it('parseStoredTheme ignora valor inválido e usa light', () => {
    expect(parseStoredTheme('invalid')).toBe('light');
    expect(parseStoredTheme(null)).toBe('light');
    expect(parseStoredTheme('dark')).toBe('dark');
    expect(parseStoredTheme('dim')).toBe('dark');
  });
});

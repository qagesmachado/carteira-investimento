import { describe, expect, it } from 'vitest';

import {
  PAGE_SHELL_PADDING_X_CLASS,
  PAGE_SHELL_WIDTH_CLASS,
  pageShellClass,
  pageShellPaddingClass
} from './pageShell';

describe('pageShell', () => {
  it('exporta classes de largura padronizadas', () => {
    expect(PAGE_SHELL_WIDTH_CLASS).toBe('mx-auto w-full min-w-0 max-w-none 2xl:max-w-page');
    expect(PAGE_SHELL_PADDING_X_CLASS).toBe('px-4');
  });

  it('monta padding vertical com px-4 quando não é py-2-px-4', () => {
    expect(pageShellPaddingClass('py-4')).toBe('px-4 py-4');
    expect(pageShellPaddingClass('pb-4')).toBe('px-4 pb-4');
    expect(pageShellPaddingClass('none')).toBe('px-4');
  });

  it('usa py-2 px-4 uniforme sem duplicar px-4', () => {
    expect(pageShellPaddingClass('py-2-px-4')).toBe('py-2 px-4');
  });

  it('combina largura, padding e classes extras', () => {
    expect(pageShellClass('py-4', 'flex flex-col gap-3')).toBe(
      'mx-auto w-full min-w-0 max-w-none 2xl:max-w-page px-4 py-4 flex flex-col gap-3'
    );
  });
});

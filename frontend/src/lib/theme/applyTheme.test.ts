import { afterEach, describe, expect, it } from 'vitest';

import { applyThemeToDocument } from './applyTheme';

describe('applyThemeToDocument', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('data-theme');
  });

  it('define data-theme no elemento html', () => {
    applyThemeToDocument('dim');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dim');

    applyThemeToDocument('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });
});

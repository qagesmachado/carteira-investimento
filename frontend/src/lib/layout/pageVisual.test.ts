import { describe, expect, it } from 'vitest';

import {
  PAGE_BACKGROUND_CLASS,
  PAGE_CONTENT_GAP_CLASS,
  PAGE_SECTION_CLASS,
  pageHeroClass,
  pageHeroSubtitleClass
} from './pageVisual';

describe('pageVisual', () => {
  it('exporta constantes de layout visual', () => {
    expect(PAGE_BACKGROUND_CLASS).toBe('min-h-screen w-full bg-base-200');
    expect(PAGE_CONTENT_GAP_CLASS).toBe('flex flex-col gap-3');
    expect(PAGE_SECTION_CLASS).toBe('card bg-base-100 shadow');
  });

  it('monta classes do hero por variant', () => {
    expect(pageHeroClass('primary')).toContain('from-primary');
    expect(pageHeroClass('secondary')).toContain('from-secondary');
    expect(pageHeroClass('neutral')).toContain('from-neutral');
    expect(pageHeroClass('dashboard')).toContain('from-indigo-700');
    expect(pageHeroClass('dashboard')).toContain('to-teal-400');
    expect(pageHeroClass('dashboard')).toContain('text-white');
    expect(pageHeroSubtitleClass('primary')).toContain('text-primary-content/90');
    expect(pageHeroSubtitleClass('dashboard')).toContain('text-white/90');
  });
});

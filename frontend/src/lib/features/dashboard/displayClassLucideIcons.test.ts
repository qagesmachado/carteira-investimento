import { describe, expect, it } from 'vitest';

import type { DisplayClass } from '$lib/api/assets';

import {
  DISPLAY_CLASS_LUCIDE_ICON,
  displayClassIconFgClass,
  lucideIconForDisplayClass
} from './displayClassLucideIcons';

const ALL_DISPLAY_CLASSES: DisplayClass[] = [
  'stocks',
  'funds',
  'fixed_income',
  'international',
  'crypto',
  'pension',
  'other'
];

describe('displayClassLucideIcons', () => {
  it('mapeia todas as display_class para um icone Lucide', () => {
    for (const displayClass of ALL_DISPLAY_CLASSES) {
      expect(DISPLAY_CLASS_LUCIDE_ICON[displayClass]).toBeTruthy();
      expect(lucideIconForDisplayClass(displayClass)).toBe(DISPLAY_CLASS_LUCIDE_ICON[displayClass]);
    }
  });

  it('usa CircleEllipsis para classe desconhecida', () => {
    expect(lucideIconForDisplayClass('unknown')).toBe('CircleEllipsis');
  });

  it('converte cor de barra em classe de texto para icone', () => {
    expect(displayClassIconFgClass('stocks')).toBe('text-secondary');
    expect(displayClassIconFgClass('crypto')).toBe('text-warning');
  });
});

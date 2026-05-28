import { describe, expect, it } from 'vitest';

import type { SegmentCatalogEntry } from '$lib/api/analysis';

import { fiiSegmentCatalogValidationError } from './validateFiiSegmentCatalog';

function segment(overrides: Partial<SegmentCatalogEntry> = {}): SegmentCatalogEntry {
  return {
    slug: 'teste',
    name: 'Logística',
    score: 3,
    help_text: 'Texto explicativo.',
    color: 'atencao',
    sort_order: 1,
    ...overrides
  };
}

describe('fiiSegmentCatalogValidationError', () => {
  it('aceita catálogo com todos os campos preenchidos', () => {
    expect(fiiSegmentCatalogValidationError([segment()])).toBeNull();
  });

  it('rejeita nome vazio', () => {
    expect(fiiSegmentCatalogValidationError([segment({ name: '  ' })])).toMatch(/nome do segmento/i);
  });

  it('rejeita texto explicativo vazio', () => {
    expect(fiiSegmentCatalogValidationError([segment({ help_text: '' })])).toMatch(/texto explicativo/i);
  });
});

import { describe, expect, it } from 'vitest';

import {
  allAnalysisCriterionCodes,
  buildEmptyAnalysisDraft,
  hasUnsavedAnalysisDraft,
  refMapsEqual,
  scoreMapsEqual,
  segmentCriterionCodes
} from '$lib/features/analise/analysisDraft';

describe('analysisDraft', () => {
  it('detecta scores alterados', () => {
    expect(
      hasUnsavedAnalysisDraft({ lucros: 5 }, { lucros: 3 }, {}, {})
    ).toBe(true);
  });

  it('detecta refs de segmento alteradas', () => {
    expect(
      hasUnsavedAnalysisDraft(
        { segmento_fii: 5 },
        { segmento_fii: 5 },
        { segmento_fii: 'shoppings' },
        { segmento_fii: 'logistica' }
      )
    ).toBe(true);
  });

  it('considera iguais quando normaliza null e undefined', () => {
    expect(scoreMapsEqual({ lucros: null }, { lucros: undefined })).toBe(true);
    expect(refMapsEqual({ segmento_fii: null }, { segmento_fii: undefined })).toBe(true);
    expect(
      hasUnsavedAnalysisDraft(
        { lucros: 5, vacancia: null },
        { lucros: 5, vacancia: undefined },
        {},
        {}
      )
    ).toBe(false);
  });

  it('buildEmptyAnalysisDraft zera todos os critérios e refs de segmento', () => {
    const codes = ['lucros', 'segmento_fii', 'pvp_descarte'];
    const empty = buildEmptyAnalysisDraft(codes, ['segmento_fii']);
    expect(empty.scores).toEqual({
      lucros: null,
      segmento_fii: null,
      pvp_descarte: null
    });
    expect(empty.scoreRefs).toEqual({ segmento_fii: null });
    expect(allAnalysisCriterionCodes([{ code: 'a' }, { code: 'b' }])).toEqual(['a', 'b']);
    expect(
      segmentCriterionCodes([
        { code: 'vacancia', input_type: 'select' },
        { code: 'segmento_fii', input_type: 'segment' }
      ])
    ).toEqual(['segmento_fii']);
  });
});

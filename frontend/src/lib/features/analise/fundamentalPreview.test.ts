import { describe, expect, it } from 'vitest';

import type { CriterionDefinition } from '$lib/api/analysis';
import { SEGMENTO_FII_CODE } from '$lib/features/analise/computeAnalysis';
import { buildFundamentalPreviewItems } from '$lib/features/analise/fundamentalPreview';

const vacanciaCriterion: CriterionDefinition = {
  code: 'vacancia',
  block: 'fundamental',
  label: 'Vacância',
  score_options: [
    { value: 5, label: '5', characteristic: 'Vacância até 5%.', color: 'viavel' },
    { value: 3, label: '3', characteristic: 'Vacância maior que 5% e até 10%.', color: 'atencao' },
    { value: 2, label: '2', characteristic: 'Vacância maior que 10%.', color: 'bomba' }
  ]
};

describe('fundamentalPreview', () => {
  it('atualiza texto e cor conforme score selecionado', () => {
    const criteria = [vacanciaCriterion];
    const initial = buildFundamentalPreviewItems(['vacancia'], criteria, { vacancia: 2 });
    expect(initial[0]?.characteristic).toBe('Vacância maior que 10%.');
    expect(initial[0]?.color).toBe('bomba');

    const updated = buildFundamentalPreviewItems(['vacancia'], criteria, { vacancia: 3 });
    expect(updated[0]?.characteristic).toBe('Vacância maior que 5% e até 10%.');
    expect(updated[0]?.color).toBe('atencao');
  });

  it('usa nome do segmento no preview FII', () => {
    const criteria: CriterionDefinition[] = [
      {
        code: SEGMENTO_FII_CODE,
        block: 'fundamental',
        label: 'Segmento',
        input_type: 'segment',
        score_options: []
      }
    ];
    const items = buildFundamentalPreviewItems([SEGMENTO_FII_CODE], criteria, {
      [SEGMENTO_FII_CODE]: 5
    }, {
      segments: [
        {
          slug: 'shoppings',
          name: 'Shoppings',
          score: 5,
          weight: 1,
          help_text: '',
          color: 'viavel',
          sort_order: 0
        }
      ],
      scoreRefs: { [SEGMENTO_FII_CODE]: 'shoppings' }
    });

    expect(items[0]?.characteristic).toBe('Shoppings');
    expect(items[0]?.color).toBe('viavel');
  });
});

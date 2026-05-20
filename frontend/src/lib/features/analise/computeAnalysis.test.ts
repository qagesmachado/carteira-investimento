import { describe, expect, it } from 'vitest';

import {
  computeDiagramSumScore,
  computeTableSumScore,
  resolveManualViability,
  summarizeAnalysis,
  type CriterionDefinition
} from './computeAnalysis';

const fundamentalCriteria: CriterionDefinition[] = [
  {
    code: 'lucros',
    block: 'fundamental',
    label: 'Lucros',
    score_options: [{ value: 5, label: '5 - Em 100%', characteristic: 'Em 100%', seal: 'Viável' }]
  },
  {
    code: 'divida',
    block: 'fundamental',
    label: 'Dívida',
    score_options: [{ value: 2, label: '2 - Bomba', characteristic: 'Maior que 3', seal: 'Bomba' }]
  },
  {
    code: 'viabilidade',
    block: 'fundamental',
    label: 'Viabilidade',
    score_options: [
      { value: 2, label: '2 - VIÁVEL', seal: 'VIÁVEL', color: 'viavel' }
    ]
  }
];

describe('computeAnalysis', () => {
  it('sums diagram yes/no answers', () => {
    const criteria: CriterionDefinition[] = [
      { code: 'roe', block: 'diagrama', label: 'ROE', input_type: 'yes_no', score_options: [] },
      { code: 'cagr', block: 'diagrama', label: 'CAGR', input_type: 'yes_no', score_options: [] }
    ];
    expect(computeDiagramSumScore({ roe: 1, cagr: -1 }, criteria)).toBe(0);
  });

  it('resolves manual viabilidade', () => {
    const result = resolveManualViability(2, fundamentalCriteria[2]);
    expect(result?.label).toBe('2 - VIÁVEL');
    expect(result?.color).toBe('viavel');
  });

  it('summarizes fundamental min and manual viabilidade', () => {
    const criteria: CriterionDefinition[] = [
      ...fundamentalCriteria.slice(0, 2),
      fundamentalCriteria[2],
      { code: 'roe', block: 'diagrama', label: 'ROE', input_type: 'yes_no', score_options: [] }
    ];
    const summary = summarizeAnalysis(
      { lucros: 5, divida: 2, viabilidade: 2, roe: 1 },
      criteria,
      []
    );
    expect(summary.fundamental.score).toBe(2);
    expect(summary.viabilidade?.label).toBe('2 - VIÁVEL');
    expect(summary.diagrama.score).toBe(1);
  });

  it('calcula soma com critérios, peso de viabilidade e diagrama', () => {
    const criteria: CriterionDefinition[] = [
      ...fundamentalCriteria.slice(0, 2),
      {
        code: 'tag_along',
        block: 'fundamental',
        label: 'Tag along',
        score_options: [{ value: 5, label: '5 - 100%' }]
      },
      {
        code: 'segmento',
        block: 'fundamental',
        label: 'Segmento',
        score_options: [{ value: 3, label: '3 - Intermediário' }]
      },
      fundamentalCriteria[2],
      { code: 'roe', block: 'diagrama', label: 'ROE', input_type: 'yes_no', score_options: [] }
    ];
    const scores = {
      lucros: 5,
      divida: 2,
      tag_along: 5,
      segmento: 3,
      viabilidade: 3,
      roe: 1
    };
    const summary = summarizeAnalysis(scores, criteria, []);
    expect(
      computeTableSumScore(scores, summary, {
        enabled: true,
        label: 'Soma',
        diagram_multiplier: 2,
        viabilidade_weights: {
          azulim: 10,
          viavel: 3,
          atencao: -5,
          bomba: -10
        }
      })
    ).toBe(12);
  });
});

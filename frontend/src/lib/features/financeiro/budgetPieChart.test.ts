import { describe, expect, it } from 'vitest';

import {
  BUDGET_PIE_CHART_SIZE_CLASS,
  formatBudgetPieSliceTooltip,
  slicesToPieSegments
} from './budgetPieChart';

describe('slicesToPieSegments', () => {
  it('monta fatias proporcionais à soma 100%', () => {
    const segments = slicesToPieSegments([
      { id: 1, name: 'A', color: '#000', amount_brl: 60, percent: 60 },
      { id: 2, name: 'B', color: '#fff', amount_brl: 40, percent: 40 }
    ]);
    expect(segments).toHaveLength(2);
    expect(segments[0].endAngle - segments[0].startAngle).toBeCloseTo(216, 0);
    expect(segments[1].endAngle).toBeCloseTo(360, 0);
  });
});

describe('formatBudgetPieSliceTooltip', () => {
  it('formata nome, percentual e valor', () => {
    const text = formatBudgetPieSliceTooltip(
      { name: 'Custos fixos', percent: 60.7, amount_brl: 6536.91 },
      (v) => `R$ ${v.toFixed(2)}`
    );
    expect(text).toContain('Custos fixos');
    expect(text).toContain('60,7%');
    expect(text).toContain('6536.91');
  });
});

describe('BUDGET_PIE_CHART_SIZE_CLASS', () => {
  it('é 15% maior que h-44', () => {
    expect(BUDGET_PIE_CHART_SIZE_CLASS).toBe('h-[12.65rem] w-[12.65rem]');
  });
});

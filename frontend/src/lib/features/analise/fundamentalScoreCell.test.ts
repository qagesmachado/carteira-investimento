import { describe, expect, it } from 'vitest';

import { fundamentalScoreColorClass } from './fundamentalScoreCell';

describe('fundamentalScoreColorClass', () => {
  it('mapeia pesos 5/3/2/1 para verde, amarelo, vermelho e cinza', () => {
    expect(fundamentalScoreColorClass(5)).toContain('green');
    expect(fundamentalScoreColorClass(3)).toContain('amber');
    expect(fundamentalScoreColorClass(2)).toContain('red');
    expect(fundamentalScoreColorClass(1)).toContain('gray');
  });
});

import { describe, expect, it } from 'vitest';

import { formatProfitCell } from './formatAllocationProfit';

describe('formatProfitCell', () => {
  it('formata lucro positivo com percentual', () => {
    expect(formatProfitCell(500, 25)).toContain('500');
    expect(formatProfitCell(500, 25)).toContain('25');
  });

  it('retorna traço sem dados', () => {
    expect(formatProfitCell(null, null)).toBe('—');
  });
});

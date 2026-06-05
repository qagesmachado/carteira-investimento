import { describe, expect, it } from 'vitest';

import { sortPensionYears } from './sortPensionYears';

describe('sortPensionYears', () => {
  it('ordena do ano mais recente ao mais antigo', () => {
    const sorted = sortPensionYears([
      { plan_year: 2025, contributed_ytd_brl: 0 } as never,
      { plan_year: 2027, contributed_ytd_brl: 0 } as never,
      { plan_year: 2026, contributed_ytd_brl: 0 } as never
    ]);
    expect(sorted.map((row) => row.plan_year)).toEqual([2027, 2026, 2025]);
  });
});

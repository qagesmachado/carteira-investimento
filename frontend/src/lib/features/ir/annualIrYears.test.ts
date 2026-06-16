import { describe, expect, it } from 'vitest';

import { buildAnnualIrYearOptions } from './annualIrYears';

describe('buildAnnualIrYearOptions', () => {
  it('retorna 10 anos a partir do ano de referência', () => {
    expect(buildAnnualIrYearOptions(2025)).toEqual([
      2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016
    ]);
  });
});

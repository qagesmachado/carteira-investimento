import { describe, expect, it } from 'vitest';

import {
  ALLOCATION_BAR_CLASSES,
  ALLOCATION_FILL_STYLES,
  allocationBarClass,
  allocationFillStyle,
  buildAllocationConicGradient
} from './allocationChartColors';

describe('allocationChartColors', () => {
  it('bar e fill usam o mesmo indice de cor', () => {
    expect(ALLOCATION_BAR_CLASSES.length).toBe(ALLOCATION_FILL_STYLES.length);
    expect(allocationBarClass(0)).toBe('bg-primary');
    expect(allocationFillStyle(0)).toBe('oklch(var(--p) / 1)');
    expect(allocationBarClass(7)).toBe(allocationBarClass(0));
    expect(allocationFillStyle(7)).toBe(allocationFillStyle(0));
  });

  it('monta conic-gradient proporcional aos percentuais', () => {
    const gradient = buildAllocationConicGradient([
      { percent: 25 },
      { percent: 75 }
    ]);
    expect(gradient).toContain('oklch(var(--p) / 1) 0% 25%');
    expect(gradient).toContain('oklch(var(--s) / 1) 25% 100%');
  });
});

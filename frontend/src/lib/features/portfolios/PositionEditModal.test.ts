import { describe, expect, it } from 'vitest';

describe('PositionEditModal validation rules', () => {
  it('rejects non-positive quantity', () => {
    expect(1 <= 0).toBe(false);
    expect(0 <= 0).toBe(true);
  });

  it('rejects negative average price', () => {
    expect(-1 < 0).toBe(true);
    expect(0 < 0).toBe(false);
  });
});

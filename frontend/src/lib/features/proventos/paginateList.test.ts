import { describe, expect, it } from 'vitest';

import { paginateList } from './paginateList';

describe('paginateList', () => {
  it('returns slice for current page', () => {
    const items = [1, 2, 3, 4, 5];
    const result = paginateList(items, { page: 2, pageSize: 2 });
    expect(result.items).toEqual([3, 4]);
    expect(result.page).toBe(2);
    expect(result.totalPages).toBe(3);
    expect(result.totalItems).toBe(5);
    expect(result.rangeStart).toBe(3);
    expect(result.rangeEnd).toBe(4);
  });

  it('clamps page when out of range', () => {
    const result = paginateList([1, 2, 3], { page: 99, pageSize: 10 });
    expect(result.page).toBe(1);
    expect(result.items).toEqual([1, 2, 3]);
  });

  it('handles empty list', () => {
    const result = paginateList([], { page: 1, pageSize: 10 });
    expect(result.items).toEqual([]);
    expect(result.totalPages).toBe(1);
    expect(result.rangeStart).toBe(0);
    expect(result.rangeEnd).toBe(0);
  });
});

import { describe, expect, it } from 'vitest';

import {
  filterUserVisibleObjectives,
  isUserVisibleObjective,
  isUserVisiblePartitionSlice
} from './objectiveVisibility';

describe('objectiveVisibility', () => {
  it('oculta objetivo default Livre', () => {
    expect(isUserVisibleObjective({ is_default: true })).toBe(false);
    expect(isUserVisibleObjective({ is_default: false })).toBe(true);
  });

  it('filtra lista de objetivos visíveis', () => {
    const list = filterUserVisibleObjectives([
      { is_default: true, id: 1 },
      { is_default: false, id: 2 }
    ]);
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe(2);
  });

  it('oculta fatia do objetivo Livre na partição', () => {
    expect(isUserVisiblePartitionSlice({ is_default: true })).toBe(false);
    expect(isUserVisiblePartitionSlice({ is_default: false })).toBe(true);
  });
});

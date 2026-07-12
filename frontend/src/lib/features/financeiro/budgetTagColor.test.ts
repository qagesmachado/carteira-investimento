import { describe, expect, it } from 'vitest';

import {
  normalizeBudgetTagColor,
  planUniqueTagColorUpdates,
  randomBudgetTagColor
} from './budgetTagColor';

describe('normalizeBudgetTagColor', () => {
  it('normaliza hex para minúsculas sem espaços', () => {
    expect(normalizeBudgetTagColor(' #3B82F6 ')).toBe('#3b82f6');
  });
});

describe('randomBudgetTagColor', () => {
  it('retorna hex #RRGGBB', () => {
    expect(randomBudgetTagColor(() => 0.42)).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('usa random injetado para variar matiz', () => {
    const first = randomBudgetTagColor(() => 0.1);
    const second = randomBudgetTagColor(() => 0.9);
    expect(first).not.toBe(second);
  });

  it('evita cores já usadas', () => {
    let calls = 0;
    const sequence = [0.1, 0.1, 0.1, 0.9, 0.9, 0.9];
    const random = () => sequence[Math.min(calls++, sequence.length - 1)]!;
    const used = [randomBudgetTagColor(() => 0.1)];
    const next = randomBudgetTagColor(random, used);
    expect(normalizeBudgetTagColor(next)).not.toBe(normalizeBudgetTagColor(used[0]!));
  });

  it('compara cores usadas de forma case-insensitive', () => {
    let calls = 0;
    const sequence = [0.2, 0.2, 0.2, 0.8, 0.8, 0.8];
    const random = () => sequence[Math.min(calls++, sequence.length - 1)]!;
    const candidate = randomBudgetTagColor(() => 0.2);
    const next = randomBudgetTagColor(random, [candidate.toUpperCase()]);
    expect(normalizeBudgetTagColor(next)).not.toBe(normalizeBudgetTagColor(candidate));
  });
});

describe('planUniqueTagColorUpdates', () => {
  it('não altera tags com cores distintas', () => {
    const updates = planUniqueTagColorUpdates([
      { id: 1, color: '#111111' },
      { id: 2, color: '#222222' }
    ]);
    expect(updates).toEqual([]);
  });

  it('gera nova cor só para duplicatas, mantendo a primeira ocorrência', () => {
    let calls = 0;
    const sequence = [0.7, 0.7, 0.7];
    const random = () => sequence[Math.min(calls++, sequence.length - 1)]!;
    const updates = planUniqueTagColorUpdates(
      [
        { id: 1, color: '#aabbcc' },
        { id: 2, color: '#AABBCC' },
        { id: 3, color: '#112233' }
      ],
      random
    );
    expect(updates).toHaveLength(1);
    expect(updates[0]!.id).toBe(2);
    expect(normalizeBudgetTagColor(updates[0]!.color)).not.toBe('#aabbcc');
    expect(normalizeBudgetTagColor(updates[0]!.color)).not.toBe('#112233');
  });

  it('evita colidir com cores já atribuídas ao resolver várias duplicatas', () => {
    const used = new Set(['#ff0000', '#00ff00']);
    let n = 0;
    const random = () => {
      // força candidatos previsíveis via hue/sat/light derivados de n
      const values = [0, 0, 0, 0.33, 0.33, 0.33, 0.66, 0.66, 0.66];
      return values[Math.min(n++, values.length - 1)]!;
    };
    const updates = planUniqueTagColorUpdates(
      [
        { id: 1, color: '#ff0000' },
        { id: 2, color: '#ff0000' },
        { id: 3, color: '#ff0000' }
      ],
      random
    );
    expect(updates).toHaveLength(2);
    for (const update of updates) {
      const color = normalizeBudgetTagColor(update.color);
      expect(used.has(color)).toBe(false);
      used.add(color);
    }
    expect(new Set(updates.map((u) => normalizeBudgetTagColor(u.color))).size).toBe(2);
  });
});

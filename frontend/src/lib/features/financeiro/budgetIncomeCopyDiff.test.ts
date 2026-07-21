import { describe, expect, it } from 'vitest';

import { buildIncomeCopyDiff } from './budgetIncomeCopyDiff';

describe('buildIncomeCopyDiff', () => {
  it('marca itens só do mês anterior como entrando', () => {
    const diff = buildIncomeCopyDiff(
      [],
      [{ label: 'Salário', amount_brl: 5000, recurring: true }],
      '2026-06'
    );
    expect(diff.entering).toEqual([{ label: 'Salário', amount_brl: 5000, recurring: true }]);
    expect(diff.leaving).toEqual([]);
    expect(diff.unchanged).toEqual([]);
    expect(diff.hasChanges).toBe(true);
    expect(diff.previousYearMonth).toBe('2026-06');
  });

  it('marca itens só do mês atual como saindo', () => {
    const diff = buildIncomeCopyDiff(
      [{ label: 'Bônus', amount_brl: 800 }],
      [],
      '2026-06'
    );
    expect(diff.entering).toEqual([]);
    expect(diff.leaving).toEqual([{ label: 'Bônus', amount_brl: 800, recurring: false }]);
    expect(diff.hasChanges).toBe(true);
  });

  it('mantém iguais em unchanged e diferencia valor alterado', () => {
    const diff = buildIncomeCopyDiff(
      [
        { label: 'Salário', amount_brl: 5000, recurring: true },
        { label: 'Freelance', amount_brl: 1000 }
      ],
      [
        { label: 'Salário', amount_brl: 5000, recurring: true },
        { label: 'Freelance', amount_brl: 1500 }
      ],
      '2026-06'
    );
    expect(diff.unchanged).toEqual([{ label: 'Salário', amount_brl: 5000, recurring: true }]);
    expect(diff.leaving).toEqual([{ label: 'Freelance', amount_brl: 1000, recurring: false }]);
    expect(diff.entering).toEqual([{ label: 'Freelance', amount_brl: 1500, recurring: false }]);
    expect(diff.hasChanges).toBe(true);
  });

  it('sem diferenças quando as listas coincidem', () => {
    const items = [{ label: 'Salário', amount_brl: 5000, recurring: true }];
    const diff = buildIncomeCopyDiff(items, items, '2026-06');
    expect(diff.hasChanges).toBe(false);
    expect(diff.unchanged).toHaveLength(1);
    expect(diff.entering).toEqual([]);
    expect(diff.leaving).toEqual([]);
  });
});

import { describe, expect, it } from 'vitest';

import type { BudgetCategory } from '$lib/api/budget';
import {
  categoriesAvailableToAdd,
  remainingTargetPercent,
  removeTargetFromDraft,
  targetsPayload,
  totalTargetPercent,
  validateTargetDrafts,
  type TargetDraft
} from './budgetTargetsForm';

function draft(id: number, percent: number, name = `Meta ${id}`): TargetDraft {
  return { category_id: id, category_name: name, color: '#000000', percent };
}

function category(id: number, name = `Cat ${id}`): BudgetCategory {
  return { id, profile_id: 1, name, sort_order: id, color: '#111111' };
}

describe('budgetTargetsForm', () => {
  it('soma percentuais', () => {
    expect(totalTargetPercent([draft(1, 60), draft(2, 40)])).toBe(100);
  });

  it('valida conjunto vazio', () => {
    expect(validateTargetDrafts([])).toBe('Adicione ao menos uma meta.');
  });

  it('valida soma diferente de 100', () => {
    expect(validateTargetDrafts([draft(1, 60), draft(2, 30)])).toBe(
      'A soma das metas deve ser 100%.'
    );
  });

  it('aceita subconjunto que soma 100', () => {
    expect(validateTargetDrafts([draft(1, 50), draft(2, 50)])).toBeNull();
  });

  it('monta payload apenas com id e percentual', () => {
    expect(targetsPayload([draft(1, 70), draft(2, 30)])).toEqual([
      { category_id: 1, percent: 70 },
      { category_id: 2, percent: 30 }
    ]);
  });

  it('lista categorias ainda não usadas no mês', () => {
    const categories = [category(1), category(2), category(3)];
    const drafts = [draft(2, 100)];
    expect(categoriesAvailableToAdd(categories, drafts).map((c) => c.id)).toEqual([1, 3]);
  });

  it('remove meta sem redistribuir percentuais', () => {
    const next = removeTargetFromDraft([draft(1, 60), draft(2, 40)], 2);
    expect(next).toEqual([draft(1, 60)]);
    expect(totalTargetPercent(next!)).toBe(60);
    expect(remainingTargetPercent(next!)).toBe(40);
  });

  it('bloqueia remover a única meta do mês', () => {
    expect(removeTargetFromDraft([draft(1, 100)], 1)).toBeNull();
  });

  it('indica excesso quando soma passa de 100', () => {
    expect(remainingTargetPercent([draft(1, 70), draft(2, 40)])).toBe(-10);
  });
});

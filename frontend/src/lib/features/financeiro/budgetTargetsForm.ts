import type { BudgetCategory } from '$lib/api/budget';

export type TargetDraft = {
  category_id: number;
  category_name: string;
  color: string;
  percent: number;
};

/** Soma dos percentuais das metas, arredondada para inteiro. */
export function totalTargetPercent(drafts: { percent: number }[]): number {
  return Math.round(drafts.reduce((acc, draft) => acc + draft.percent, 0));
}

/** Retorna mensagem de erro de validação ou null quando o conjunto é válido. */
export function validateTargetDrafts(drafts: TargetDraft[]): string | null {
  if (drafts.length === 0) {
    return 'Adicione ao menos uma meta.';
  }
  if (totalTargetPercent(drafts) !== 100) {
    return 'A soma das metas deve ser 100%.';
  }
  return null;
}

/** Payload de metas (subconjunto) para enviar ao backend. */
export function targetsPayload(drafts: TargetDraft[]): { category_id: number; percent: number }[] {
  return drafts.map((draft) => ({ category_id: draft.category_id, percent: draft.percent }));
}

/** Categorias do catálogo ainda não presentes no conjunto do mês. */
export function categoriesAvailableToAdd(
  categories: BudgetCategory[],
  drafts: { category_id: number }[]
): BudgetCategory[] {
  const used = new Set(drafts.map((draft) => draft.category_id));
  return categories.filter((category) => !used.has(category.id));
}

/**
 * Remove uma meta do conjunto sem redistribuir percentuais.
 * Retorna null se for a única meta do mês.
 */
export function removeTargetFromDraft(
  drafts: TargetDraft[],
  categoryId: number
): TargetDraft[] | null {
  if (!drafts.some((draft) => draft.category_id === categoryId)) {
    return drafts;
  }
  const remaining = drafts.filter((draft) => draft.category_id !== categoryId);
  if (remaining.length === 0) {
    return null;
  }
  return remaining;
}

/** Quanto falta (positivo) ou excede (negativo) para fechar 100%. */
export function remainingTargetPercent(drafts: { percent: number }[]): number {
  return 100 - totalTargetPercent(drafts);
}

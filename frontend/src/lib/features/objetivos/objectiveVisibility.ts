/** Objetivo «Livre» (is_default) existe na API mas não é exibido na UI. */
export function isUserVisibleObjective(objective: { is_default: boolean }): boolean {
  return !objective.is_default;
}

export function filterUserVisibleObjectives<T extends { is_default: boolean }>(
  objectives: T[]
): T[] {
  return objectives.filter(isUserVisibleObjective);
}

export function isUserVisiblePartitionSlice(slice: { is_default: boolean }): boolean {
  return !slice.is_default;
}

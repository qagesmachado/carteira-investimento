import type { PensionContribution } from '$lib/api/objetivos';

/** Anos previdenciários sempre do mais recente ao mais antigo. */
export function sortPensionYears(years: PensionContribution[]): PensionContribution[] {
  return [...years].sort((a, b) => b.plan_year - a.plan_year);
}

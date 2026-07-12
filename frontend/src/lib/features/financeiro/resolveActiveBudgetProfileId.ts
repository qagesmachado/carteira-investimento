import type { BudgetProfile } from '$lib/api/budget';

export function resolveActiveBudgetProfileId(
  profiles: BudgetProfile[],
  storedId: number | null
): number | null {
  if (storedId != null && profileExists(profiles, storedId)) {
    return storedId;
  }
  return profiles[0]?.id ?? null;
}

function profileExists(profiles: BudgetProfile[], id: number): boolean {
  return profiles.some((profile) => profile.id === id);
}

export function normalizeScoreMap(
  scores: Record<string, number | null | undefined>
): Record<string, number | null> {
  const normalized: Record<string, number | null> = {};
  for (const [code, value] of Object.entries(scores)) {
    normalized[code] = value ?? null;
  }
  return normalized;
}

export function normalizeRefMap(
  refs: Record<string, string | null | undefined>
): Record<string, string | null> {
  const normalized: Record<string, string | null> = {};
  for (const [code, value] of Object.entries(refs)) {
    normalized[code] = value ?? null;
  }
  return normalized;
}

export function scoreMapsEqual(
  left: Record<string, number | null | undefined>,
  right: Record<string, number | null | undefined>
): boolean {
  const a = normalizeScoreMap(left);
  const b = normalizeScoreMap(right);
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const key of keys) {
    if ((a[key] ?? null) !== (b[key] ?? null)) {
      return false;
    }
  }
  return true;
}

export function refMapsEqual(
  left: Record<string, string | null | undefined>,
  right: Record<string, string | null | undefined>
): boolean {
  const a = normalizeRefMap(left);
  const b = normalizeRefMap(right);
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const key of keys) {
    if ((a[key] ?? null) !== (b[key] ?? null)) {
      return false;
    }
  }
  return true;
}

export function hasUnsavedAnalysisDraft(
  draftScores: Record<string, number | null | undefined>,
  savedScores: Record<string, number | null | undefined>,
  draftRefs: Record<string, string | null | undefined>,
  savedRefs: Record<string, string | null | undefined>,
  draftPending?: boolean,
  savedPending?: boolean
): boolean {
  const pendingChanged =
    draftPending != null && savedPending != null && draftPending !== savedPending;
  return (
    !scoreMapsEqual(draftScores, savedScores) ||
    !refMapsEqual(draftRefs, savedRefs) ||
    pendingChanged
  );
}

export function buildEmptyAnalysisDraft(
  criterionCodes: readonly string[],
  segmentCodes: readonly string[] = []
): {
  scores: Record<string, number | null>;
  scoreRefs: Record<string, string | null>;
} {
  const scores: Record<string, number | null> = {};
  for (const code of criterionCodes) {
    scores[code] = null;
  }
  const scoreRefs: Record<string, string | null> = {};
  for (const code of segmentCodes) {
    scoreRefs[code] = null;
  }
  return { scores, scoreRefs };
}

export function segmentCriterionCodes(
  criteria: { code: string; input_type?: string | null }[]
): string[] {
  return criteria.filter((criterion) => criterion.input_type === 'segment').map((c) => c.code);
}

export function allAnalysisCriterionCodes(
  criteria: { code: string; block?: string; input_type?: string | null }[]
): string[] {
  return criteria.map((criterion) => criterion.code);
}

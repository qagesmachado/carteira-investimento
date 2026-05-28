import type { CriterionDefinition, SegmentCatalogEntry } from '$lib/api/analysis';
import { SEGMENTO_FII_CODE } from '$lib/features/analise/computeAnalysis';
import { findScoreOption } from '$lib/features/analise/scoreLabels';

export type FundamentalPreviewItem = {
  code: string;
  label: string;
  characteristic: string;
  color: string;
};

export function scoreValueToDefaultColor(value: number | null | undefined): string {
  if (value == null) return 'sem_dados';
  if (value >= 5) return 'viavel';
  if (value === 3) return 'atencao';
  if (value === 2) return 'bomba';
  return 'sem_dados';
}

export function resolveIndicatorColor(
  criterion: CriterionDefinition | undefined,
  value: number | null | undefined,
  segmentColor?: string | null
): string {
  if (segmentColor) return segmentColor;
  const option = findScoreOption(criterion?.score_options ?? [], value ?? null);
  if (option?.color) return option.color;
  return scoreValueToDefaultColor(value);
}

export function resolveIndicatorCharacteristic(
  criterion: CriterionDefinition | undefined,
  value: number | null | undefined,
  segments: SegmentCatalogEntry[] = [],
  segmentSlug: string | null = null
): string {
  if (criterion?.code === SEGMENTO_FII_CODE) {
    if (!segmentSlug) return 'Sem segmento';
    const segment = segments.find((s) => s.slug === segmentSlug);
    return segment?.name ?? 'Sem segmento';
  }

  if (value == null) return 'Sem dados';
  const option = findScoreOption(criterion?.score_options ?? [], value);
  return option?.characteristic ?? option?.seal ?? String(value);
}

export function buildFundamentalPreviewItems(
  indicatorCodes: readonly string[],
  criteria: CriterionDefinition[],
  scores: Record<string, number | null | undefined>,
  options: {
    segments?: SegmentCatalogEntry[];
    scoreRefs?: Record<string, string | null | undefined>;
  } = {}
): FundamentalPreviewItem[] {
  const segments = options.segments ?? [];
  const scoreRefs = options.scoreRefs ?? {};

  return indicatorCodes.flatMap((code) => {
    const criterion = criteria.find((c) => c.code === code);
    if (!criterion) return [];

    const value = scores[code] ?? null;
    const segmentSlug =
      code === SEGMENTO_FII_CODE ? (scoreRefs[SEGMENTO_FII_CODE] ?? null) : null;
    const segment = segmentSlug ? segments.find((s) => s.slug === segmentSlug) : undefined;

    return [
      {
        code,
        label: criterion.label,
        characteristic: resolveIndicatorCharacteristic(
          criterion,
          value,
          segments,
          segmentSlug
        ),
        color: resolveIndicatorColor(criterion, value, segment?.color)
      }
    ];
  });
}

export function isNeutralPreviewColor(color: string): boolean {
  return color === 'sem_dados' || !['viavel', 'atencao', 'bomba'].includes(color);
}

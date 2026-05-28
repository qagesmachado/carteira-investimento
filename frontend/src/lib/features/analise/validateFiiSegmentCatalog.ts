import type { SegmentCatalogEntry } from '$lib/api/analysis';

export function fiiSegmentCatalogValidationError(segments: SegmentCatalogEntry[]): string | null {
  for (let index = 0; index < segments.length; index += 1) {
    const segment = segments[index];
    const label = segment.name.trim() || `segmento ${index + 1}`;

    if (!segment.name.trim()) {
      return `Preencha o nome do segmento ${index + 1}.`;
    }
    if (!segment.help_text.trim()) {
      return `Preencha o texto explicativo do segmento «${label}».`;
    }
  }

  return null;
}

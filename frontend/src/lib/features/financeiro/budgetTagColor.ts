function hslToHex(h: number, s: number, l: number): string {
  const saturation = s / 100;
  const lightness = l / 100;
  const chroma = saturation * Math.min(lightness, 1 - lightness);
  const component = (offset: number) => {
    const k = (offset + h / 30) % 12;
    const channel = lightness - chroma * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * channel)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${component(0)}${component(8)}${component(4)}`;
}

/** Normaliza hex de tag para comparação (#rrggbb). */
export function normalizeBudgetTagColor(color: string): string {
  return color.trim().toLowerCase();
}

const MAX_UNIQUE_COLOR_ATTEMPTS = 48;

/**
 * Gera uma cor hex visível e distinta para tags de orçamento.
 * Quando `usedColors` é informado, evita repetir cores já em uso.
 */
export function randomBudgetTagColor(
  random: () => number = Math.random,
  usedColors: readonly string[] = []
): string {
  const used = new Set(usedColors.map(normalizeBudgetTagColor));
  for (let attempt = 0; attempt < MAX_UNIQUE_COLOR_ATTEMPTS; attempt++) {
    const hue = Math.floor(random() * 360);
    const saturation = 55 + Math.floor(random() * 30);
    const lightness = 42 + Math.floor(random() * 18);
    const color = hslToHex(hue, saturation, lightness);
    if (!used.has(normalizeBudgetTagColor(color))) {
      return color;
    }
  }
  // Fallback: desloca matiz até achar slot livre (espaço de cores esgotado por azar).
  for (let hue = 0; hue < 360; hue += 7) {
    const color = hslToHex(hue, 70, 50);
    if (!used.has(normalizeBudgetTagColor(color))) {
      return color;
    }
  }
  return hslToHex(Math.floor(random() * 360), 70, 50);
}

export type TagColorRef = { id: number; color: string };

export type TagColorUpdate = { id: number; color: string };

/**
 * Para cada cor duplicada, mantém a primeira ocorrência e planeja nova cor
 * aleatória (única) para as demais.
 */
export function planUniqueTagColorUpdates(
  tags: readonly TagColorRef[],
  random: () => number = Math.random
): TagColorUpdate[] {
  const seen = new Set<string>();
  const reserved: string[] = [];
  const updates: TagColorUpdate[] = [];

  for (const tag of tags) {
    const normalized = normalizeBudgetTagColor(tag.color);
    if (!seen.has(normalized)) {
      seen.add(normalized);
      reserved.push(tag.color);
      continue;
    }
    const next = randomBudgetTagColor(random, reserved);
    updates.push({ id: tag.id, color: next });
    reserved.push(next);
    seen.add(normalizeBudgetTagColor(next));
  }

  return updates;
}

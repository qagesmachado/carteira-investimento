/** Mesmas cores das barras — classes Tailwind e equivalente para preenchimento (DaisyUI 4 = oklch). */
import type { DisplayClass } from '$lib/api/assets';

export const ALLOCATION_BAR_CLASSES = [
  'bg-primary',
  'bg-secondary',
  'bg-accent',
  'bg-info',
  'bg-success',
  'bg-warning',
  'bg-neutral'
] as const;

/** Tokens oklch alinhados às classes bg-* do DaisyUI. */
export const ALLOCATION_FILL_STYLES = [
  'oklch(var(--p) / 1)',
  'oklch(var(--s) / 1)',
  'oklch(var(--a) / 1)',
  'oklch(var(--in) / 1)',
  'oklch(var(--su) / 1)',
  'oklch(var(--wa) / 1)',
  'oklch(var(--n) / 1)'
] as const;

/** Classes CSS (escopo do componente) para fatias SVG da pizza. */
export const ALLOCATION_PIE_SLICE_CLASSES = [
  'allocation-pie-0',
  'allocation-pie-1',
  'allocation-pie-2',
  'allocation-pie-3',
  'allocation-pie-4',
  'allocation-pie-5',
  'allocation-pie-6'
] as const;

/** Cor fixa por classe de exibição (não depende da ordem nem dos filtros). */
export const ALLOCATION_DISPLAY_CLASS_COLOR_INDEX: Record<DisplayClass, number> = {
  fixed_income: 0,
  stocks: 1,
  pension: 2,
  international: 3,
  funds: 4,
  crypto: 5,
  other: 6
};

export function allocationColorIndexForDisplayClass(displayClass: DisplayClass | string): number {
  return ALLOCATION_DISPLAY_CLASS_COLOR_INDEX[displayClass as DisplayClass] ?? 6;
}

export function allocationColorIndex(index: number): number {
  return index % ALLOCATION_BAR_CLASSES.length;
}

export function allocationBarClass(index: number): string {
  return ALLOCATION_BAR_CLASSES[allocationColorIndex(index)];
}

export function allocationFillStyle(index: number): string {
  return ALLOCATION_FILL_STYLES[allocationColorIndex(index)];
}

export function allocationPieSliceClass(index: number): string {
  return ALLOCATION_PIE_SLICE_CLASSES[allocationColorIndex(index)];
}

export function allocationBarClassForDisplayClass(displayClass: DisplayClass | string): string {
  return allocationBarClass(allocationColorIndexForDisplayClass(displayClass));
}

export function allocationPieSliceClassForDisplayClass(displayClass: DisplayClass | string): string {
  return allocationPieSliceClass(allocationColorIndexForDisplayClass(displayClass));
}

export function allocationFillStyleForDisplayClass(displayClass: DisplayClass | string): string {
  return allocationFillStyle(allocationColorIndexForDisplayClass(displayClass));
}

/** Gradiente cônico para gráfico pizza com as mesmas cores das barras. */
export function buildAllocationConicGradient(
  rows: { percent: number; displayClass?: DisplayClass | string }[]
): string {
  if (rows.length === 0) {
    return '';
  }
  let cum = 0;
  const stops: string[] = [];
  for (let i = 0; i < rows.length; i++) {
    const start = cum;
    cum += rows[i].percent;
    const fill = rows[i].displayClass
      ? allocationFillStyleForDisplayClass(rows[i].displayClass!)
      : allocationFillStyle(i);
    stops.push(`${fill} ${start}% ${cum}%`);
  }
  return `conic-gradient(from 0deg, ${stops.join(', ')})`;
}

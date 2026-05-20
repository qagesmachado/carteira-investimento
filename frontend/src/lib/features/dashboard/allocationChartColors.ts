/** Mesmas cores das barras — classes Tailwind e equivalente para preenchimento (DaisyUI 4 = oklch). */
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

/** Gradiente cônico para gráfico pizza com as mesmas cores das barras. */
export function buildAllocationConicGradient(rows: { percent: number }[]): string {
  if (rows.length === 0) {
    return '';
  }
  let cum = 0;
  const stops: string[] = [];
  for (let i = 0; i < rows.length; i++) {
    const start = cum;
    cum += rows[i].percent;
    stops.push(`${allocationFillStyle(i)} ${start}% ${cum}%`);
  }
  return `conic-gradient(from 0deg, ${stops.join(', ')})`;
}

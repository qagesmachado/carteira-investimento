import type { ScoreOption } from '$lib/api/analysis';

export function scoreOptionDropdownLabel(option: ScoreOption): string {
  if (option.characteristic) {
    return `${option.value} - ${option.characteristic}`;
  }
  return option.label;
}

export function scoreOptionFullLabel(option: ScoreOption): string {
  if (option.seal && option.characteristic) {
    return `${option.value} - ${option.seal} - ${option.characteristic}`;
  }
  if (option.characteristic) {
    return `${option.value} - ${option.characteristic}`;
  }
  return option.label;
}

export function findScoreOption(
  options: ScoreOption[],
  value: number | null | undefined
): ScoreOption | undefined {
  if (value == null) return undefined;
  return options.find((option) => option.value === value);
}

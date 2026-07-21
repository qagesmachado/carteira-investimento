export function currentYearMonth(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function shiftYearMonth(yearMonth: string, deltaMonths: number): string {
  const [yearStr, monthStr] = yearMonth.split('-');
  const total = Number(yearStr) * 12 + (Number(monthStr) - 1) + deltaMonths;
  const year = Math.floor(total / 12);
  const month = (total % 12) + 1;
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}`;
}

export function compareYearMonths(left: string, right: string): number {
  const [ly, lm] = left.split('-').map(Number);
  const [ry, rm] = right.split('-').map(Number);
  return ly * 12 + (lm - 1) - (ry * 12 + (rm - 1));
}

/** Contagem inclusiva de meses entre início e fim (0 se intervalo inválido). */
export function countMonthsInclusive(fromYearMonth: string, toYearMonth: string): number {
  const delta = compareYearMonths(toYearMonth, fromYearMonth);
  if (delta < 0) {
    return 0;
  }
  return delta + 1;
}

export function formatYearMonthLabel(yearMonth: string): string {
  const [yearStr, monthStr] = yearMonth.split('-');
  const monthNames = [
    'janeiro',
    'fevereiro',
    'março',
    'abril',
    'maio',
    'junho',
    'julho',
    'agosto',
    'setembro',
    'outubro',
    'novembro',
    'dezembro'
  ];
  const monthIndex = Number(monthStr) - 1;
  return `${monthNames[monthIndex]}/${yearStr}`;
}

const MONTH_CHART_ABBREV = [
  'jan',
  'fev',
  'mar',
  'abr',
  'mai',
  'jun',
  'jul',
  'ago',
  'set',
  'out',
  'nov',
  'dez'
];

/** Rótulo curto para eixo de gráficos (ex.: jul/26). */
export function formatYearMonthChartLabel(yearMonth: string): string {
  const [yearStr, monthStr] = yearMonth.split('-');
  const monthIndex = Number(monthStr) - 1;
  return `${MONTH_CHART_ABBREV[monthIndex]}/${yearStr.slice(-2)}`;
}

export function sumTargetPercents(targets: { percent: number }[]): number {
  return Math.round(targets.reduce((acc, item) => acc + item.percent, 0));
}

export function normalizeTargetPercent(percent: number): number {
  return Math.min(100, Math.max(0, Math.round(percent)));
}

export function targetAmountFromPercent(plannedIncome: number | null, percent: number): number {
  if (plannedIncome == null || plannedIncome <= 0) {
    return 0;
  }
  return Math.round(plannedIncome * (percent / 100) * 100) / 100;
}

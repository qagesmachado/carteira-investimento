/** Mês/ano no formulário em português. API usa ISO YYYY-MM. */

export const BR_MONTH_NAMES = [
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
] as const;

export const BR_MONTH_OPTIONS = BR_MONTH_NAMES.map((label, index) => ({
  value: String(index + 1).padStart(2, '0'),
  label
}));

export function parseYearMonthIso(value: string | null | undefined): { year: number; month: string } | null {
  if (!value) {
    return null;
  }
  const match = value.trim().match(/^(\d{4})-(\d{2})$/);
  if (!match) {
    return null;
  }
  const year = Number(match[1]);
  const month = match[2];
  const monthNumber = Number(month);
  if (year < 2000 || year > 2100 || monthNumber < 1 || monthNumber > 12) {
    return null;
  }
  return { year, month };
}

export function composeYearMonthIso(year: number, month: string): string {
  const monthNumber = Number(month);
  if (year < 2000 || year > 2100 || monthNumber < 1 || monthNumber > 12) {
    return '';
  }
  return `${String(year).padStart(4, '0')}-${String(monthNumber).padStart(2, '0')}`;
}

export function formatYearMonthIsoToBr(value: string | null | undefined): string {
  const parsed = parseYearMonthIso(value);
  if (!parsed) {
    return '';
  }
  const monthName = BR_MONTH_NAMES[Number(parsed.month) - 1];
  return `${monthName}/${parsed.year}`;
}

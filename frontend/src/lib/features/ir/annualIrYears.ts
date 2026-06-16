export function buildAnnualIrYearOptions(referenceYear: number = new Date().getFullYear()): number[] {
  const years: number[] = [];
  for (let offset = 0; offset < 10; offset += 1) {
    years.push(referenceYear - offset);
  }
  return years;
}

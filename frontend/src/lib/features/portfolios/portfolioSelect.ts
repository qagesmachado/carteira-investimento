/** Lê o ID da carteira no evento `change` de um `<select>` (valor já atualizado no DOM). */
export function readPortfolioIdFromSelectEvent(event: Event): number | null {
  const raw = (event.currentTarget as HTMLSelectElement).value;
  const id = raw === '' ? NaN : Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

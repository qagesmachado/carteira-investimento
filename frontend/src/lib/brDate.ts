/**
 * Datas no formulário em DD/MM/AAAA (Brasil). API continua usando ISO YYYY-MM-DD.
 */

/** Converte YYYY-MM-DD da API para exibição DD/MM/AAAA. */
export function formatIsoDateToBr(iso: string | null | undefined): string {
  if (!iso) {
    return '';
  }
  const s = iso.trim().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    return '';
  }
  const [y, m, d] = s.split('-');
  return `${d}/${m}/${y}`;
}

/**
 * Aceita DD/MM/AAAA (d e m com 1 ou 2 dígitos), ou YYYY-MM-DD colado.
 * Retorna YYYY-MM-DD ou null se inválido/vazio.
 */
export function parseBrDateToIso(text: string): string | null {
  const t = text.trim();
  if (!t) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) {
    const [y, mo, d] = t.split('-').map(Number);
    const dt = new Date(Date.UTC(y, mo - 1, d));
    if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) {
      return null;
    }
    return t;
  }

  const normalized = t.replace(/\./g, '/');
  const m = normalized.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) {
    return null;
  }
  const day = Number(m[1]);
  const month = Number(m[2]);
  const year = Number(m[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }
  const dt = new Date(Date.UTC(year, month - 1, day));
  if (dt.getUTCFullYear() !== year || dt.getUTCMonth() !== month - 1 || dt.getUTCDate() !== day) {
    return null;
  }
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** Durante digitação/colar: normaliza caracteres e ISO colado vira trecho legível. */
export function sanitizeBrDateTyping(raw: string): string {
  let s = raw.replace(/[^\d./-]/g, '');
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    const iso = s.slice(0, 10);
    return formatIsoDateToBr(iso) || s.slice(0, 10);
  }
  s = s.replace(/\./g, '/');
  if (s.length > 10) {
    s = s.slice(0, 10);
  }
  return s;
}

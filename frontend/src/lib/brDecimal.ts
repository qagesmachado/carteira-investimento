const DISPLAY_FORMATTER = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 8
});

const BTC_DISPLAY_FORMATTER = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 8,
  maximumFractionDigits: 8
});

/** Remove caracteres inválidos durante a digitação (apenas dígitos e uma vírgula). */
export function sanitizeBrDecimalTyping(raw: string): string {
  let s = raw.replace(/[^\d,]/g, '');
  const commaIndex = s.indexOf(',');
  if (commaIndex >= 0) {
    const before = s.slice(0, commaIndex + 1);
    const after = s.slice(commaIndex + 1).replace(/,/g, '');
    s = before + after;
  }
  return s;
}

/**
 * Converte texto BR para número (API).
 * Digitação: `1234,56`. Colar: `1.234,56`. Rejeita ponto como decimal (`12.69`).
 */
export function parseBrDecimalInput(text: string): number | null {
  const trimmed = text.trim();
  if (!trimmed) {
    return null;
  }

  if (!trimmed.includes(',')) {
    if (trimmed.includes('.')) {
      return null;
    }
    if (!/^\d+$/.test(trimmed)) {
      return null;
    }
    const integer = Number(trimmed);
    return Number.isFinite(integer) ? integer : null;
  }

  if ((trimmed.match(/,/g) ?? []).length > 1) {
    return null;
  }

  const normalized = trimmed.replace(/\./g, '').replace(',', '.');
  if (!/^\d+(\.\d+)?$/.test(normalized)) {
    return null;
  }

  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

/** Exibição com milhar: `1234.56` → `1.234,56`. */
export function formatBrDecimalDisplay(value: number): string {
  if (!Number.isFinite(value)) {
    return '';
  }
  return DISPLAY_FORMATTER.format(value);
}

/** Forma para edição sem milhar: `1234.56` → `1234,56`. */
export function formatBrDecimalForEditing(value: number): string {
  if (!Number.isFinite(value)) {
    return '';
  }
  const str = String(value);
  if (!str.includes('.')) {
    return str;
  }
  const [intPart, decPart] = str.split('.');
  return `${intPart},${decPart}`;
}

/** Exibição BTC com 8 casas decimais fixas: `0.00003` → `0,00003000`. */
export function formatBtcDecimalDisplay(value: number): string {
  if (!Number.isFinite(value)) {
    return '';
  }
  return BTC_DISPLAY_FORMATTER.format(value);
}

/** Forma para edição BTC com 8 casas decimais: `0.00003` → `0,00003000`. */
export function formatBtcDecimalForEditing(value: number): string {
  if (!Number.isFinite(value)) {
    return '';
  }
  const fixed = value.toFixed(8);
  const [intPart, decPart] = fixed.split('.');
  return `${intPart},${decPart}`;
}

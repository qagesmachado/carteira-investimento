const TICKER_HEADER_NAMES = new Set(['symbol', 'ticker', 'codigo', 'código', 'ativo']);

export type ParseSymbolListResult = {
  symbols: string[];
  invalid: string[];
  duplicateCount: number;
};

function formatSymbolListForDisplay(symbols: string[], originalText: string): string {
  if (originalText.includes('\n') || originalText.includes('\r')) {
    return symbols.join('\n');
  }
  return symbols.join(', ');
}

function normalizeToken(raw: string): string | null {
  const token = raw.trim().toUpperCase();
  if (!token || token.startsWith('#')) {
    return null;
  }
  return token;
}

export function parseSymbolListFromText(text: string): ParseSymbolListResult {
  const symbols: string[] = [];
  const invalid: string[] = [];
  const seen = new Set<string>();
  let duplicateCount = 0;

  const parts = text.split(/[\s,;]+/);
  for (const part of parts) {
    const token = normalizeToken(part);
    if (!token) {
      continue;
    }
    if (seen.has(token)) {
      duplicateCount += 1;
      continue;
    }
    seen.add(token);
    symbols.push(token);
  }

  return { symbols, invalid, duplicateCount };
}

function addTokensFromParts(
  parts: string[],
  symbols: string[],
  invalid: string[],
  seen: Set<string>,
  duplicateCount: { value: number }
): void {
  for (const part of parts) {
    const token = normalizeToken(part);
    if (!token) {
      if (part.trim()) {
        invalid.push(part.trim());
      }
      continue;
    }
    if (seen.has(token)) {
      duplicateCount.value += 1;
      continue;
    }
    seen.add(token);
    symbols.push(token);
  }
}

export function parseSymbolListFromLines(text: string): ParseSymbolListResult {
  const symbols: string[] = [];
  const invalid: string[] = [];
  const seen = new Set<string>();
  const duplicateCount = { value: 0 };

  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    addTokensFromParts(trimmed.split(/[,;]+/), symbols, invalid, seen, duplicateCount);
  }

  return { symbols, invalid, duplicateCount: duplicateCount.value };
}

export function parseSymbolListFromCsv(text: string): ParseSymbolListResult {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length === 0) {
    return { symbols: [], invalid: [], duplicateCount: 0 };
  }

  const delimiter = lines[0].includes(';') ? ';' : ',';
  const headerCells = lines[0].split(delimiter).map((c) => c.trim().toLowerCase());
  let tickerIndex = headerCells.findIndex((h) => TICKER_HEADER_NAMES.has(h));

  const dataLines = lines.slice(1);
  if (tickerIndex < 0 && lines.length >= 1) {
    tickerIndex = 0;
    dataLines.unshift(lines[0]);
  }

  const symbols: string[] = [];
  const invalid: string[] = [];
  const seen = new Set<string>();
  let duplicateCount = 0;

  for (const line of dataLines) {
    const cells = line.split(delimiter);
    const raw = cells[tickerIndex]?.trim() ?? '';
    const token = normalizeToken(raw);
    if (!token) {
      if (raw) {
        invalid.push(raw);
      }
      continue;
    }
    if (seen.has(token)) {
      duplicateCount += 1;
      continue;
    }
    seen.add(token);
    symbols.push(token);
  }

  return { symbols, invalid, duplicateCount };
}

export function parseSymbolListFromFileContent(
  content: string,
  filename: string
): ParseSymbolListResult {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.csv')) {
    return parseSymbolListFromCsv(content);
  }
  if (lower.endsWith('.txt')) {
    return parseSymbolListFromLines(content);
  }
  return parseSymbolListFromText(content);
}

export { formatSymbolListForDisplay };

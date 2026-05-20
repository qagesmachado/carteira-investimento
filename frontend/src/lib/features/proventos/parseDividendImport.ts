import { read, utils, type WorkBook, type WorkSheet } from 'xlsx';

import { parseBrDateToIso } from '$lib/brDate';
import { parseBrDecimalInput } from '$lib/brDecimal';
import type { DividendPaymentType } from '$lib/proventoLabels';

import { parsePaymentType } from './parsePaymentType';

export type ParsedDividendImportRow = {
  rowIndex: number;
  symbol: string;
  paymentType: DividendPaymentType;
  paymentDate: string;
  amount: number;
  currency?: string | null;
  notes?: string | null;
  companyCnpj?: string | null;
  payerCnpj?: string | null;
  payerName?: string | null;
  parseError?: string;
};

export type ParseDividendImportResult = {
  format: 'template' | 'legacy' | 'unknown';
  rows: ParsedDividendImportRow[];
  errors: string[];
  sourceSheets?: string[];
};

type FieldKey =
  | 'symbol'
  | 'paymentType'
  | 'paymentDate'
  | 'amount'
  | 'currency'
  | 'notes'
  | 'companyCnpj'
  | 'payerCnpj'
  | 'payerName';

const LEGACY_HEADERS: Record<string, FieldKey> = {
  ativo: 'symbol',
  tipo_de_provento: 'paymentType',
  provento: 'paymentType',
  data: 'paymentDate',
  valor_em_reais: 'amount',
  valor_reais: 'amount',
  valor: 'amount',
  outros: 'notes',
  cnpj_da_empresa: 'companyCnpj',
  cnpj_empresa: 'companyCnpj',
  cnpj_da_fonte_pagadora: 'payerCnpj',
  cnpj_fonte_pagadora: 'payerCnpj',
  nome_da_fonte_pagadora: 'payerName'
};

const TEMPLATE_HEADERS: Record<string, FieldKey> = {
  ticker: 'symbol',
  ativo: 'symbol',
  symbol: 'symbol',
  data: 'paymentDate',
  payment_date: 'paymentDate',
  valor: 'amount',
  valor_reais: 'amount',
  amount: 'amount',
  tipo: 'paymentType',
  payment_type: 'paymentType',
  provento: 'paymentType',
  moeda: 'currency',
  currency: 'currency',
  observacoes: 'notes',
  notes: 'notes',
  outros: 'notes',
  cnpj_empresa: 'companyCnpj',
  cnpj_fonte: 'payerCnpj',
  nome_fonte: 'payerName'
};

function normalizeHeader(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/\(r\$\)/gi, '_reais')
    .replace(/[^\w]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_');
}

function detectDelimiter(line: string): string {
  const semicolons = (line.match(/;/g) ?? []).length;
  const commas = (line.match(/,/g) ?? []).length;
  return semicolons > commas ? ';' : ',';
}

function splitCsvLine(line: string, delimiter: string): string[] {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (!inQuotes && ch === delimiter) {
      cells.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  cells.push(current.trim());
  return cells.map((cell) => cell.replace(/^"|"$/g, ''));
}

function parseAmount(raw: string): number | null {
  let trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }
  trimmed = trimmed.replace(/^(R\$|US\$|\$|BRL|USD)\s*/gi, '').trim();

  const br = parseBrDecimalInput(trimmed);
  if (br != null) {
    return br;
  }

  const compact = trimmed.replace(/\s/g, '');
  if (/^\d+\.\d+$/.test(compact)) {
    const n = Number(compact);
    return Number.isFinite(n) ? n : null;
  }

  const normalized = compact.replace(',', '.');
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

function parseDateCell(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }
  if (/^\d+(\.\d+)?$/.test(trimmed)) {
    const serial = Number(trimmed);
    if (serial > 20000 && serial < 80000) {
      const epoch = new Date(Date.UTC(1899, 11, 30));
      epoch.setUTCDate(epoch.getUTCDate() + Math.floor(serial));
      const y = epoch.getUTCFullYear();
      const m = String(epoch.getUTCMonth() + 1).padStart(2, '0');
      const d = String(epoch.getUTCDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
  }
  return parseBrDateToIso(trimmed);
}

export function detectFormat(headers: string[]): 'template' | 'legacy' | 'unknown' {
  const normalized = headers.map(normalizeHeader);
  const hasAtivo = normalized.includes('ativo');
  const hasLegacyType =
    normalized.includes('tipo_de_provento') || normalized.includes('provento');
  if (hasAtivo && hasLegacyType) {
    return 'legacy';
  }
  if (
    normalized.some((h) => h === 'ticker' || h === 'symbol') &&
    normalized.some((h) => h === 'data' || h === 'payment_date') &&
    normalized.some((h) => h === 'valor' || h === 'amount' || h === 'valor_reais')
  ) {
    return 'template';
  }
  if (
    hasAtivo &&
    normalized.includes('data') &&
    normalized.some((h) => h === 'valor' || h === 'valor_reais' || h === 'amount')
  ) {
    return 'legacy';
  }
  return 'unknown';
}

function buildColumnMap(
  headers: string[],
  format: 'template' | 'legacy' | 'unknown'
): Map<number, FieldKey> {
  const map = new Map<number, FieldKey>();
  const dictionary =
    format === 'legacy'
      ? LEGACY_HEADERS
      : format === 'template'
        ? TEMPLATE_HEADERS
        : { ...TEMPLATE_HEADERS, ...LEGACY_HEADERS };

  headers.forEach((header, index) => {
    const key = dictionary[normalizeHeader(header)];
    if (key) {
      map.set(index, key);
    }
  });
  return map;
}

function shouldSkipRow(symbol: string, paymentTypeRaw?: string): boolean {
  const upper = symbol.trim().toUpperCase();
  if (!upper) {
    return true;
  }
  if (upper === 'SOMA' || upper.endsWith('SOMA')) {
    return true;
  }
  const paymentUpper = (paymentTypeRaw ?? '').trim().toUpperCase();
  if (paymentUpper === 'SOMA') {
    return true;
  }
  return false;
}

function parseDataRow(
  rowIndex: number,
  cells: string[],
  columnMap: Map<number, FieldKey>
): ParsedDividendImportRow {
  const values: Partial<Record<FieldKey, string>> = {};
  columnMap.forEach((field, colIndex) => {
    values[field] = (cells[colIndex] ?? '').trim();
  });

  const symbol = values.symbol ?? '';
  const paymentTypeRaw = values.paymentType ?? '';
  if (shouldSkipRow(symbol, paymentTypeRaw)) {
    return {
      rowIndex,
      symbol: '',
      paymentType: 'dividend',
      paymentDate: '',
      amount: 0,
      parseError: 'linha ignorada'
    };
  }

  const paymentDate = parseDateCell(values.paymentDate ?? '');
  const amount = parseAmount(values.amount ?? '');

  if (!paymentDate) {
    return {
      rowIndex,
      symbol,
      paymentType: parsePaymentType(paymentTypeRaw),
      paymentDate: '',
      amount: amount ?? 0,
      currency: values.currency || null,
      notes: values.notes || null,
      companyCnpj: values.companyCnpj || null,
      payerCnpj: values.payerCnpj || null,
      payerName: values.payerName || null,
      parseError: 'data inválida ou ausente'
    };
  }

  if (amount == null || amount <= 0) {
    return {
      rowIndex,
      symbol,
      paymentType: parsePaymentType(paymentTypeRaw),
      paymentDate,
      amount: amount ?? 0,
      currency: values.currency || null,
      notes: values.notes || null,
      companyCnpj: values.companyCnpj || null,
      payerCnpj: values.payerCnpj || null,
      payerName: values.payerName || null,
      parseError: 'valor inválido ou ausente'
    };
  }

  return {
    rowIndex,
    symbol,
    paymentType: parsePaymentType(paymentTypeRaw),
    paymentDate,
    amount,
    currency: values.currency || null,
    notes: values.notes || null,
    companyCnpj: values.companyCnpj || null,
    payerCnpj: values.payerCnpj || null,
    payerName: values.payerName || null
  };
}

export function parseRowsFromMatrix(matrix: string[][]): ParseDividendImportResult {
  const errors: string[] = [];
  const nonEmpty = matrix.filter((row) => row.some((cell) => String(cell ?? '').trim()));
  if (nonEmpty.length === 0) {
    return { format: 'unknown', rows: [], errors: ['Arquivo vazio.'] };
  }

  const headers = nonEmpty[0].map((cell) => String(cell ?? ''));
  const format = detectFormat(headers);
  if (format === 'unknown') {
    return {
      format,
      rows: [],
      errors: [
        'Cabeçalho não reconhecido. Use o template (ticker, data, valor…) ou as abas DB Proventos do Excel.'
      ]
    };
  }

  const columnMap = buildColumnMap(headers, format);
  if (![...columnMap.values()].includes('symbol')) {
    return { format, rows: [], errors: ['Coluna de ativo/ticker não encontrada.'] };
  }

  const rows: ParsedDividendImportRow[] = [];
  for (let i = 1; i < nonEmpty.length; i += 1) {
    const cells = nonEmpty[i].map((cell) => String(cell ?? ''));
    const parsed = parseDataRow(i + 1, cells, columnMap);
    if (parsed.parseError === 'linha ignorada') {
      continue;
    }
    rows.push(parsed);
  }

  if (validParsedRows(rows).length === 0) {
    errors.push('Nenhuma linha válida encontrada após o cabeçalho.');
  }

  return { format, rows, errors };
}

export function parseDividendImportFromText(content: string): ParseDividendImportResult {
  const lines = content.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length === 0) {
    return { format: 'unknown', rows: [], errors: ['Conteúdo vazio.'] };
  }
  const delimiter = detectDelimiter(lines[0]);
  const matrix = lines.map((line) => splitCsvLine(line, delimiter));
  return parseRowsFromMatrix(matrix);
}

function isDividendSheetName(name: string): boolean {
  return name.trim().toLowerCase().startsWith('db proventos');
}

function sheetToMatrix(sheet: WorkSheet): string[][] {
  const matrix = utils.sheet_to_json<(string | number | null)[]>(sheet, {
    header: 1,
    defval: '',
    raw: false
  });
  return matrix.map((row) => row.map((cell) => String(cell ?? '').trim()));
}

function findDividendSheetNames(workbook: WorkBook): string[] {
  const byName = workbook.SheetNames.filter(isDividendSheetName);
  if (byName.length > 0) {
    return byName;
  }
  return workbook.SheetNames.filter((name) => {
    const sheet = workbook.Sheets[name];
    if (!sheet) {
      return false;
    }
    const matrix = sheetToMatrix(sheet);
    if (matrix.length === 0) {
      return false;
    }
    return detectFormat(matrix[0].map(String)) !== 'unknown';
  });
}

function mergeSheetResults(
  results: ParseDividendImportResult[],
  sourceSheets: string[]
): ParseDividendImportResult {
  let format: ParseDividendImportResult['format'] = 'unknown';
  const errors: string[] = [];
  const rows: ParsedDividendImportRow[] = [];
  let rowIndex = 1;

  results.forEach((result, idx) => {
    const sheetName = sourceSheets[idx] ?? `aba ${idx + 1}`;
    if (result.format !== 'unknown') {
      format = result.format;
    }
    errors.push(...result.errors.map((err) => `${sheetName}: ${err}`));
    for (const row of result.rows) {
      rows.push({ ...row, rowIndex: rowIndex++ });
    }
  });

  const validCount = validParsedRows(rows).length;
  if (validCount === 0 && format === 'unknown') {
    errors.push(
      'Nenhuma aba com proventos reconhecida. Exporte «DB Proventos» ou use o template CSV.'
    );
  } else if (validCount === 0) {
    errors.push('Nenhuma linha válida encontrada nas abas analisadas.');
  }

  return { format, rows, errors, sourceSheets };
}

export async function parseDividendImportFromFile(file: File): Promise<ParseDividendImportResult> {
  const lower = file.name.toLowerCase();
  if (lower.endsWith('.xlsx') || lower.endsWith('.xls')) {
    const buffer = await file.arrayBuffer();
    const workbook = read(new Uint8Array(buffer), { type: 'array' });
    const sheetNames = findDividendSheetNames(workbook);

    if (sheetNames.length === 0) {
      return {
        format: 'unknown',
        rows: [],
        errors: [
          'Nenhuma aba «DB Proventos» encontrada. Selecione a aba correta ou exporte só essa aba como CSV.'
        ]
      };
    }

    const results = sheetNames.map((name) => parseRowsFromMatrix(sheetToMatrix(workbook.Sheets[name])));
    return mergeSheetResults(results, sheetNames);
  }

  const text = await file.text();
  return parseDividendImportFromText(text);
}

export function validParsedRows(rows: ParsedDividendImportRow[]): ParsedDividendImportRow[] {
  return rows.filter((row) => !row.parseError && row.symbol.trim());
}

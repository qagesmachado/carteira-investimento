import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import {
  parseSymbolListFromCsv,
  parseSymbolListFromFileContent,
  parseSymbolListFromLines,
  parseSymbolListFromText
} from './parseSymbolList';

const fixtureDir = join(dirname(fileURLToPath(import.meta.url)), 'fixtures');

describe('parseSymbolList', () => {
  it('parseia texto separado por vírgula', () => {
    const result = parseSymbolListFromText('petr4, bbse3, PETR4');
    expect(result.symbols).toEqual(['PETR4', 'BBSE3']);
    expect(result.duplicateCount).toBe(1);
  });

  it('conta duplicatas em lista multilinha', () => {
    const result = parseSymbolListFromText('HSML11\nHGRU11\nHSML11\nHGRU11\nKNRI11');
    expect(result.symbols).toEqual(['HSML11', 'HGRU11', 'KNRI11']);
    expect(result.duplicateCount).toBe(2);
  });

  it('parseia CSV com cabeçalho symbol', () => {
    const csv = 'symbol,name\nPETR4,Petrobras\nBBSE3,BB';
    expect(parseSymbolListFromCsv(csv).symbols).toEqual(['PETR4', 'BBSE3']);
  });

  it('parseia arquivo txt multilinha', () => {
    const content = 'PETR4\n# comentário\nBBSE3';
    expect(parseSymbolListFromFileContent(content, 'tickers.txt').symbols).toEqual([
      'PETR4',
      'BBSE3'
    ]);
  });

  it('parseia txt uma linha com vírgulas (fixture bulk-import-comma-line)', () => {
    const content = readFileSync(join(fixtureDir, 'bulk-import-comma-line.txt'), 'utf-8');
    expect(parseSymbolListFromFileContent(content, 'bulk-import-comma-line.txt').symbols).toEqual([
      'FESA4',
      'FLRY3',
      'ITSA4',
      'KLBN'
    ]);
  });

  it('parseia linha com vírgula e ponto-e-vírgula', () => {
    expect(parseSymbolListFromLines('A; B, C').symbols).toEqual(['A', 'B', 'C']);
  });
});

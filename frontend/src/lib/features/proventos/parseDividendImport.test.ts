import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  parseDividendImportFromText,
  parseRowsFromMatrix,
  validParsedRows
} from './parseDividendImport';
import { parseDividendImportFromFile } from './parseDividendImport';

describe('parseDividendImport', () => {
  it('parseia template CSV com ponto-e-vírgula', () => {
    const csv = `ticker;data;valor;tipo
ITSA4;15/05/2024;100,50;dividend
SOMA;;;`;

    const result = parseDividendImportFromText(csv);
    expect(result.format).toBe('template');
    expect(validParsedRows(result.rows)).toHaveLength(1);
    const row = validParsedRows(result.rows)[0];
    expect(row.symbol).toBe('ITSA4');
    expect(row.paymentDate).toBe('2024-05-15');
    expect(row.amount).toBeCloseTo(100.5);
    expect(row.paymentType).toBe('dividend');
  });

  it('parseia layout legado', () => {
    const matrix = [
      ['Ativo', 'Tipo de provento', 'Data', 'Valor em reais', 'OUTROS'],
      ['PETR4', 'Dividendo', '10/01/2024', '1.234,56', 'Obs'],
      ['SOMA', '', '', '', '']
    ];

    const result = parseRowsFromMatrix(matrix);
    expect(result.format).toBe('legacy');
    expect(validParsedRows(result.rows)).toHaveLength(1);
    const row = validParsedRows(result.rows)[0];
    expect(row.symbol).toBe('PETR4');
    expect(row.paymentType).toBe('dividend');
    expect(row.amount).toBeCloseTo(1234.56);
    expect(row.notes).toBe('Obs');
  });

  it('parseia cabeçalho do Investimento_controle.xlsx (DB Proventos)', () => {
    const matrix = [
      ['CÓDIGO', 'TIPO', 'SETOR', 'NOME', 'ATIVO', 'PROVENTO', 'DATA', 'VALOR (R$)', 'OUTROS', 'CNPJ EMPRESA'],
      ['X', 'AÇÃO', 'X', 'X', 'VILG11', 'SOMA', '31/12/2020', 'R$ 0.00', '', ''],
      ['Y', 'FII', 'X', 'X', 'VILG11', 'Dividendo', '31/12/2020', 'R$ 2.72', '', ''],
      ['Z', 'ETF US', 'X', 'X', 'VOO', 'Dividendo', '01/04/2025', '$0.12', '', '']
    ];

    const result = parseRowsFromMatrix(matrix);
    expect(result.format).toBe('legacy');
    expect(validParsedRows(result.rows)).toHaveLength(2);
    expect(validParsedRows(result.rows)[0].amount).toBeCloseTo(2.72);
    expect(validParsedRows(result.rows)[1].symbol).toBe('VOO');
    expect(validParsedRows(result.rows)[1].amount).toBeCloseTo(0.12);
  });

  it('rejeita cabeçalho desconhecido', () => {
    const result = parseDividendImportFromText('foo,bar,baz\n1,2,3');
    expect(result.format).toBe('unknown');
    expect(result.rows).toHaveLength(0);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('marca linha com data inválida', () => {
    const csv = `ticker,data,valor
ITSA4,invalid,10`;
    const result = parseDividendImportFromText(csv);
    expect(result.rows[0]?.parseError).toMatch(/data/i);
    expect(validParsedRows(result.rows)).toHaveLength(0);
  });

  it.skipIf(!existsSync(resolve(process.cwd(), '..', 'Investimento_controle.xlsx')))(
    'lê Investimento_controle.xlsx completo (abas DB Proventos)',
    async () => {
    const xlsxPath = resolve(process.cwd(), '..', 'Investimento_controle.xlsx');
    const buffer = readFileSync(xlsxPath);
    const file = {
      name: 'Investimento_controle.xlsx',
      arrayBuffer: async () =>
        buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
    } as File;
    const result = await parseDividendImportFromFile(file);
    expect(result.format).toBe('legacy');
    expect(result.sourceSheets).toEqual(
      expect.arrayContaining(['DB Proventos', 'DB Proventos internacional'])
    );
    const valid = validParsedRows(result.rows);
    expect(valid.length).toBeGreaterThan(100);
    expect(valid.some((r) => r.symbol === 'VILG11' && r.amount > 0)).toBe(true);
    expect(valid.some((r) => r.symbol === 'VOO')).toBe(true);
    }
  );
});

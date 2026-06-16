import { utils } from 'xlsx';
import { describe, expect, it } from 'vitest';

import type { AnnualIrReport } from '$lib/api/annualIrReport';

import { buildAnnualIrWorkbook } from './exportAnnualIrReport';

function sampleReport(): AnnualIrReport {
  return {
    year: 2024,
    portfolio_id: 1,
    has_position_snapshot: true,
    snapshot_date: '2024-12-31',
    payments: [
      {
        symbol: 'BBSE3.SA',
        asset_name: 'BB Seguridade',
        asset_type: 'stock',
        display_class: 'stocks',
        market: 'national',
        payment_type: 'dividend',
        payment_date: '2024-03-10',
        amount: 100,
        currency: 'BRL'
      }
    ],
    summary_by_asset: [
      {
        asset_id: 1,
        symbol: 'BBSE3.SA',
        asset_name: 'BB Seguridade',
        asset_type: 'stock',
        display_class: 'stocks',
        totals_by_type: { dividend: 100, jcp: 0, credit: 0, fraction: 0, redemption: 0, other: 0 },
        total_by_currency: { BRL: 100 }
      }
    ],
    positions: [
      {
        symbol: 'BBSE3.SA',
        asset_name: 'BB Seguridade',
        asset_type: 'stock',
        display_class: 'stocks',
        quantity: 80,
        average_price: 28,
        currency: 'BRL'
      }
    ],
    grand_totals_by_type: { dividend: { BRL: 100 } }
  };
}

describe('exportAnnualIrReport', () => {
  it('gera workbook com três abas', () => {
    const workbook = buildAnnualIrWorkbook(sampleReport());
    expect(workbook.SheetNames).toEqual(['Detalhado', 'Resumo', 'Posições']);
  });

  it('aba Detalhado contém lançamento do relatório', () => {
    const workbook = buildAnnualIrWorkbook(sampleReport());
    const buffer = utils.sheet_to_csv(workbook.Sheets.Detalhado);
    expect(buffer).toContain('BBSE3');
    expect(buffer).not.toContain('.SA');
    expect(buffer).toContain('Dividendo');
    expect(buffer).toContain('Ação');
  });

  it('aba Posições contém quantidade do snapshot', () => {
    const workbook = buildAnnualIrWorkbook(sampleReport());
    const csv = utils.sheet_to_csv(workbook.Sheets['Posições']);
    expect(csv).toContain('80');
  });

  it('aba Posições exporta valor aplicado como quantidade × preço médio', () => {
    const workbook = buildAnnualIrWorkbook(sampleReport());
    const csv = utils.sheet_to_csv(workbook.Sheets['Posições']);
    expect(csv).toContain('2240');
  });

  it('aba Resumo não exporta artefatos de float', () => {
    const workbook = buildAnnualIrWorkbook({
      ...sampleReport(),
      summary_by_asset: [
        {
          asset_id: 2,
          symbol: 'BBDC3',
          asset_name: 'Bradesco',
          asset_type: 'stock',
          display_class: 'stocks',
          totals_by_type: {
            dividend: 0,
            jcp: 38.17999999999999,
            credit: 0,
            fraction: 0,
            redemption: 0,
            other: 0
          },
          total_by_currency: { BRL: 38.17999999999999 }
        }
      ]
    });
    const csv = utils.sheet_to_csv(workbook.Sheets.Resumo);
    expect(csv).toContain('38.18');
    expect(csv).not.toContain('999999');
  });
});

import { utils, write } from 'xlsx';

import type { AnnualIrReport } from '$lib/api/annualIrReport';
import { formatAssetTypeForDisplay } from '$lib/assetLabels';
import { formatTickerForDisplay } from '$lib/formatTickerForDisplay';
import {
  formatMarketForDisplay,
  formatPaymentTypeForDisplay,
  paymentTypeOptions,
  type DividendPaymentType
} from '$lib/proventoLabels';

import { annualIrPositionInvestedAmount } from './annualIrTable';
import { roundMoneyForExport } from './roundMoneyForExport';

const PAYMENT_TYPES = paymentTypeOptions().map((option) => option.value);

function buildDetailedSheet(report: AnnualIrReport): string[][] {
  const rows: string[][] = [
    [
      'Ativo',
      'Nome',
      'Tipo do ativo',
      'Classe',
      'Tipo provento',
      'Data',
      'Valor',
      'Moeda',
      'CNPJ empresa',
      'CNPJ fonte pagadora',
      'Fonte pagadora'
    ]
  ];
  for (const payment of report.payments) {
    rows.push([
      formatTickerForDisplay(payment.symbol),
      payment.asset_name,
      formatAssetTypeForDisplay(payment.asset_type),
      formatMarketForDisplay(payment.market),
      formatPaymentTypeForDisplay(payment.payment_type),
      payment.payment_date,
      roundMoneyForExport(payment.amount),
      payment.currency,
      payment.company_cnpj ?? '',
      payment.payer_cnpj ?? '',
      payment.payer_name ?? ''
    ]);
  }
  return rows;
}

function buildSummarySheet(report: AnnualIrReport): string[][] {
  const header = [
    'Ativo',
    'Nome',
    'Tipo do ativo',
    'Classe',
    ...PAYMENT_TYPES.map((type) => formatPaymentTypeForDisplay(type)),
    'Total moeda',
    'Total'
  ];
  const rows: string[][] = [header];
  for (const row of report.summary_by_asset) {
    for (const [currency, total] of Object.entries(row.total_by_currency).sort(([a], [b]) =>
      a.localeCompare(b, 'pt-BR')
    )) {
      rows.push([
        formatTickerForDisplay(row.symbol),
        row.asset_name,
        formatAssetTypeForDisplay(row.asset_type),
        formatMarketForDisplay(row.market),
        ...PAYMENT_TYPES.map((type) =>
          roundMoneyForExport(row.totals_by_type[type as DividendPaymentType] ?? 0)
        ),
        currency,
        roundMoneyForExport(total)
      ]);
    }
  }
  return rows;
}

function buildPositionsSheet(report: AnnualIrReport): string[][] {
  const rows: string[][] = [
    ['Ativo', 'Nome', 'Tipo do ativo', 'Classe', 'Quantidade', 'Preço médio', 'Moeda', 'Valor aplicado']
  ];
  for (const position of report.positions) {
    rows.push([
      formatTickerForDisplay(position.symbol),
      position.asset_name,
      formatAssetTypeForDisplay(position.asset_type),
      formatMarketForDisplay(position.market),
      position.quantity,
      roundMoneyForExport(position.average_price),
      position.currency,
      roundMoneyForExport(annualIrPositionInvestedAmount(position))
    ]);
  }
  return rows;
}

export function buildAnnualIrWorkbook(report: AnnualIrReport) {
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, utils.aoa_to_sheet(buildDetailedSheet(report)), 'Detalhado');
  utils.book_append_sheet(workbook, utils.aoa_to_sheet(buildSummarySheet(report)), 'Resumo');
  utils.book_append_sheet(workbook, utils.aoa_to_sheet(buildPositionsSheet(report)), 'Posições');
  return workbook;
}

export function downloadAnnualIrExcel(report: AnnualIrReport, portfolioName: string): void {
  const workbook = buildAnnualIrWorkbook(report);
  const safeName = portfolioName.replace(/[^\w\-]+/g, '-').replace(/-+/g, '-');
  const filename = `conferencia-ir-${safeName}-${report.year}.xlsx`;
  const buffer = write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

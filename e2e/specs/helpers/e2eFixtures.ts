/** Tickers e identificadores estáveis para testes E2E com yfinance. */

export const E2E_PORTFOLIO_PRINCIPAL = 'E2E Principal';
export const E2E_PORTFOLIO_SECONDARY = 'E2E Secundária';
export const E2E_PORTFOLIO_AUX = 'E2E Aux';
export const E2E_PORTFOLIO_IMPORT = 'E2E Import Test';

export const TICKER_BBSE3 = 'BBSE3';
export const TICKER_INVALID = 'INVALIDO_XYZ';
export const TICKER_AUPO11 = 'AUPO11';
export const TICKER_AUVP11 = 'AUVP11';
export const TICKER_VOO = 'VOO';
export const TICKER_BTC_USD = 'BTC-USD';
export const TICKER_ABTC11 = 'ABTC11';
export const TICKER_ITSA4 = 'ITSA4';
export const TICKER_FLRY3 = 'FLRY3';
export const TICKER_FESA4 = 'FESA4';
export const TICKER_PETR4 = 'PETR4';
export const TICKER_HGLG11 = 'HGLG11';
export const TICKER_BTLG11 = 'BTLG11';
export const TICKER_KLBN = 'KLBN4';

export const E2E_CDB_IDENTIFIER = 'E2E-CDB-BTG-2028';
export const E2E_CDB_NAME = 'CDB Banco BTG — IPCA + 8,40% a.a. (E2E)';
export const E2E_PENSION_IDENTIFIER = 'E2E-PGBL-001';
export const E2E_PENSION_NAME = 'Plano PGBL E2E Teste';

export const LOOKUP_ERROR_MESSAGE = 'Não foi possível buscar esse ativo. Você pode tentar outro ticker.';
export const DUPLICATE_TICKER_MESSAGE = 'Já existe um ativo com este ticker na base.';

export const FAKE_LOOKUP_BY_SYMBOL: Record<
  string,
  {
    name: string;
    asset_type: string;
    market: string;
    country: string;
    currency: string;
    sector: string;
    tipoLabel: string;
    moedaLabel: string;
    classeLabel: string;
  }
> = {
  BBSE3: {
    name: 'BB Seguridade Participações S.A.',
    asset_type: 'stock',
    market: 'national',
    country: 'BR',
    currency: 'BRL',
    sector: 'Serviços financeiros',
    tipoLabel: 'Ação',
    moedaLabel: 'Real (BRL)',
    classeLabel: 'Ações e ETFs (Brasil)'
  },
  FESA4: {
    name: 'Fertilizantes Heringer S.A.',
    asset_type: 'stock',
    market: 'national',
    country: 'BR',
    currency: 'BRL',
    sector: 'Materiais básicos',
    tipoLabel: 'Ação',
    moedaLabel: 'Real (BRL)',
    classeLabel: 'Ações e ETFs (Brasil)'
  },
  FLRY3: {
    name: 'Fleury S.A.',
    asset_type: 'stock',
    market: 'national',
    country: 'BR',
    currency: 'BRL',
    sector: 'Saúde',
    tipoLabel: 'Ação',
    moedaLabel: 'Real (BRL)',
    classeLabel: 'Ações e ETFs (Brasil)'
  },
  ITSA4: {
    name: 'Itaúsa S.A.',
    asset_type: 'stock',
    market: 'national',
    country: 'BR',
    currency: 'BRL',
    sector: 'Serviços financeiros',
    tipoLabel: 'Ação',
    moedaLabel: 'Real (BRL)',
    classeLabel: 'Ações e ETFs (Brasil)'
  },
  PETR4: {
    name: 'Petrobras PN',
    asset_type: 'stock',
    market: 'national',
    country: 'BR',
    currency: 'BRL',
    sector: 'Energia',
    tipoLabel: 'Ação',
    moedaLabel: 'Real (BRL)',
    classeLabel: 'Ações e ETFs (Brasil)'
  },
  KLBN4: {
    name: 'Klabin S.A.',
    asset_type: 'stock',
    market: 'national',
    country: 'BR',
    currency: 'BRL',
    sector: 'Materiais básicos',
    tipoLabel: 'Ação',
    moedaLabel: 'Real (BRL)',
    classeLabel: 'Ações e ETFs (Brasil)'
  },
  AUPO11: {
    name: 'BTG Pactual Crédito Imobiliário',
    asset_type: 'etf',
    market: 'national',
    country: 'BR',
    currency: 'BRL',
    sector: 'Financeiro',
    tipoLabel: 'ETF',
    moedaLabel: 'Real (BRL)',
    classeLabel: 'Ações e ETFs (Brasil)'
  },
  AUVP11: {
    name: 'BTG Pactual Teva AUVP Ações Fundamentos',
    asset_type: 'etf',
    market: 'national',
    country: 'BR',
    currency: 'BRL',
    sector: 'Financeiro',
    tipoLabel: 'ETF',
    moedaLabel: 'Real (BRL)',
    classeLabel: 'Ações e ETFs (Brasil)'
  },
  VOO: {
    name: 'Vanguard S&P 500 ETF',
    asset_type: 'etf',
    market: 'international',
    country: 'US',
    currency: 'USD',
    sector: '',
    tipoLabel: 'ETF',
    moedaLabel: 'Dólar (USD)',
    classeLabel: 'Internacional'
  }
};

export const BULK_TICKERS_FAKE = ['FESA4', 'FLRY3', 'ITSA4'] as const;

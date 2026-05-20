import { FAKE_LOOKUP_BY_SYMBOL, TICKER_BBSE3 } from './e2eFixtures';

export { TICKER_BBSE3 };

export const BBSE3_FAKE_LOOKUP = {
  symbol: TICKER_BBSE3,
  name: FAKE_LOOKUP_BY_SYMBOL.BBSE3.name,
  asset_type: FAKE_LOOKUP_BY_SYMBOL.BBSE3.asset_type,
  market: FAKE_LOOKUP_BY_SYMBOL.BBSE3.market,
  country: FAKE_LOOKUP_BY_SYMBOL.BBSE3.country,
  currency: FAKE_LOOKUP_BY_SYMBOL.BBSE3.currency,
  sector: FAKE_LOOKUP_BY_SYMBOL.BBSE3.sector
} as const;

export const BBSE3_UI_LABELS = {
  tipo: FAKE_LOOKUP_BY_SYMBOL.BBSE3.tipoLabel,
  mercado: 'Nacional',
  pais: 'Brasil (BR)',
  moeda: FAKE_LOOKUP_BY_SYMBOL.BBSE3.moedaLabel,
  classe: FAKE_LOOKUP_BY_SYMBOL.BBSE3.classeLabel
} as const;

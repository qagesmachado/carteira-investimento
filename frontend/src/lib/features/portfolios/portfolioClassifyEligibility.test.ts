import { describe, expect, it } from 'vitest';

import type { Asset } from '$lib/api/assets';
import { PROFILE_FII_BR, PROFILE_STOCK_BR } from '$lib/api/analysis';

import {
  analysisProfileForDisplayClass,
  canClassifyPortfolioAsset,
  methodologyForProfile
} from './portfolioClassifyEligibility';

const stockAsset = { display_class: 'stocks' } as Pick<Asset, 'display_class'>;
const fiiAsset = { display_class: 'funds' } as Pick<Asset, 'display_class'>;
const cryptoAsset = { display_class: 'crypto' } as Pick<Asset, 'display_class'>;

describe('portfolioClassifyEligibility', () => {
  it('mapeia classe de exibição para perfil de análise', () => {
    expect(analysisProfileForDisplayClass('stocks')).toBe(PROFILE_STOCK_BR);
    expect(analysisProfileForDisplayClass('funds')).toBe(PROFILE_FII_BR);
    expect(analysisProfileForDisplayClass('crypto')).toBeNull();
  });

  it('habilita classificar apenas com metodologia AUVP', () => {
    const auvp = {
      [PROFILE_STOCK_BR]: 'auvp' as const,
      [PROFILE_FII_BR]: 'auvp' as const
    };
    const simples = {
      [PROFILE_STOCK_BR]: 'simples' as const,
      [PROFILE_FII_BR]: 'simples' as const
    };

    expect(canClassifyPortfolioAsset(stockAsset, auvp)).toBe(true);
    expect(canClassifyPortfolioAsset(fiiAsset, auvp)).toBe(true);
    expect(canClassifyPortfolioAsset(stockAsset, simples)).toBe(false);
    expect(canClassifyPortfolioAsset(fiiAsset, simples)).toBe(false);
    expect(canClassifyPortfolioAsset(cryptoAsset, auvp)).toBe(false);
  });

  it('mantem desabilitado ate metodologia carregar', () => {
    expect(canClassifyPortfolioAsset(stockAsset, {})).toBe(false);
  });

  it('usa legado como referencia de perfil sem metodologia', () => {
    expect(methodologyForProfile(PROFILE_STOCK_BR, {})).toBe('auvp');
  });
});

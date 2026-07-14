import { describe, expect, it } from 'vitest';

import { parseAllocationTargets } from '$lib/features/rebalance/allocationTargets';

import { allocationTargetsJsonForProfile } from './portfolioInvestorProfiles';
import {
  inferInvestorProfileId,
  resolveSuggestedAllocation
} from './portfolioAllocationDisplay';

describe('portfolioAllocationDisplay', () => {
  it('identifica perfil conservador pelas metas de classe', () => {
    const targets = parseAllocationTargets(allocationTargetsJsonForProfile('conservative'));
    expect(inferInvestorProfileId(targets)).toBe('conservative');
  });

  it('marca como personalizado quando metas foram alteradas', () => {
    const targets = parseAllocationTargets(allocationTargetsJsonForProfile('moderate'));
    targets.classes.fixed_income = 54;
    expect(inferInvestorProfileId(targets)).toBe('custom');
  });

  it('monta linhas de balanceamento sugerido para o hub', () => {
    const summary = resolveSuggestedAllocation({
      allocationTargetsJson: allocationTargetsJsonForProfile('bold')
    });

    expect(summary.profileLabel).toBe('Arrojado');
    expect(summary.classRows.map((row) => row.label)).toEqual([
      'Ações/ETF BR',
      'Fundos',
      'Internacional',
      'Renda fixa',
      'Criptomoeda'
    ]);
    expect(summary.classRows.find((row) => row.key === 'fixed_income')?.percent).toBe('30%');
    expect(summary.hasStoredTargets).toBe(true);
  });

  it('usa metas padrão quando carteira antiga não tem JSON salvo', () => {
    const summary = resolveSuggestedAllocation({ allocationTargetsJson: null });
    expect(summary.profileLabel).toBe('Moderado');
    expect(summary.hasStoredTargets).toBe(false);
  });
});

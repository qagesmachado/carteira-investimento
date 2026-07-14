import { describe, expect, it } from 'vitest';

import {
  INVESTOR_PROFILES,
  allocationTargetsJsonForProfile,
  getInvestorProfile
} from './portfolioInvestorProfiles';

describe('portfolioInvestorProfiles', () => {
  it('expõe exatamente quatro perfis na ordem esperada', () => {
    expect(INVESTOR_PROFILES.map((profile) => profile.id)).toEqual([
      'conservative',
      'moderate',
      'bold',
      'custom'
    ]);
    expect(INVESTOR_PROFILES.map((profile) => profile.label)).toEqual([
      'Conservador',
      'Moderado',
      'Arrojado',
      'Personalizado'
    ]);
  });

  it('presets de classes somam 100%', () => {
    for (const profile of INVESTOR_PROFILES) {
      const sum = Object.values(profile.targets.classes).reduce((acc, value) => acc + value, 0);
      expect(sum).toBe(100);
    }
  });

  it('arrojado difere de conservador', () => {
    const conservative = getInvestorProfile('conservative');
    const bold = getInvestorProfile('bold');
    expect(bold.targets.classes.fixed_income).toBeLessThan(
      conservative.targets.classes.fixed_income
    );
    expect(bold.targets.classes.stocks).toBeGreaterThan(conservative.targets.classes.stocks);
  });

  it('moderado usa metas 55/20/15/7/3', () => {
    const moderate = getInvestorProfile('moderate');
    expect(moderate.targets.classes).toEqual({
      stocks: 20,
      funds: 7,
      international: 15,
      fixed_income: 55,
      crypto: 3
    });
  });

  it('serializa allocation_targets_json para cada perfil', () => {
    const json = allocationTargetsJsonForProfile('moderate');
    expect(json).toContain('"stocks"');
    expect(json).toContain('"fixed_income"');
  });
});

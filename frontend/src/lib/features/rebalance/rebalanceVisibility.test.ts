import { describe, expect, it } from 'vitest';

import type { ClassRebalanceRow } from '$lib/api/rebalance';

import {
  filterConfiguredRebalanceClasses,
  isRebalanceTargetConfigured,
  resolveAssetGroupTab,
  sumClassRebalanceGapBrl,
  visibleAssetGroupTabs
} from './rebalanceVisibility';

function classRow(displayClass: string, targetPercent: number): ClassRebalanceRow {
  return {
    display_class: displayClass,
    label: displayClass,
    current_value_brl: 0,
    current_percent: 0,
    target_percent: targetPercent,
    target_value_brl: 0,
    gap_brl: 10
  };
}

describe('rebalanceVisibility', () => {
  it('considera meta configurada apenas a partir de 1%', () => {
    expect(isRebalanceTargetConfigured(1)).toBe(true);
    expect(isRebalanceTargetConfigured(0.99)).toBe(false);
    expect(isRebalanceTargetConfigured(0)).toBe(false);
  });

  it('filtra classes com meta abaixo de 1%', () => {
    const classes = [
      classRow('stocks', 30),
      classRow('funds', 0),
      classRow('crypto', 0.5)
    ];

    expect(filterConfiguredRebalanceClasses(classes).map((row) => row.display_class)).toEqual([
      'stocks'
    ]);
  });

  it('soma gap apenas das classes visíveis', () => {
    const classes = [classRow('stocks', 30), classRow('funds', 0)];

    expect(sumClassRebalanceGapBrl(classes)).toBe(10);
  });

  it('mostra abas por ativo somente para classes com meta >= 1%', () => {
    const classes = [
      classRow('stocks', 35),
      classRow('international', 25),
      classRow('funds', 0),
      classRow('crypto', 0)
    ];

    expect(visibleAssetGroupTabs(classes).map((tab) => tab.id)).toEqual(['stocks', 'international']);
  });

  it('resolve aba ativa para a primeira visível quando a preferida está oculta', () => {
    const classes = [classRow('stocks', 40), classRow('international', 60), classRow('funds', 0)];

    expect(resolveAssetGroupTab(classes, 'funds')).toBe('stocks');
    expect(resolveAssetGroupTab(classes, 'international')).toBe('international');
  });
});

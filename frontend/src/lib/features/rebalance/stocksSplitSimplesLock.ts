import type { AllocationTargets } from './allocationTargets';

export const STOCKS_SPLIT_SIMPLES_METHODOLOGY_LOCK_REASON =
  'Com a metodologia Simples em Ações/ETF BR, ETF e ação compartilham um único percentual desejado por ticker (soma 100% no grupo). A divisão por subtipo só faz sentido na metodologia AUVP (coluna Soma).';

export const STOCKS_SPLIT_SIMPLES_UNIFIED_NOTE =
  'ETF e ação competem pelo mesmo pool de 100% da meta Ações/ETF BR. O percentual desejado de cada ticker é definido na análise Simples.';

export function enforceStocksSplitUnifiedForSimples(targets: AllocationTargets): void {
  if (targets.stocks_split_mode !== 'unified') {
    targets.stocks_split_mode = 'unified';
  }
}

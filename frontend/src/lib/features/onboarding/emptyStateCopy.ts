import type { LucideIconName } from '$lib/icons/lucideIconCatalog';

export type EmptyStateCopy = {
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  icon: LucideIconName;
};

/** Estado vazio padrão quando não há carteira ativa/selecionável. CTA leva ao hub de carteiras. */
export const NO_PORTFOLIO_EMPTY_STATE: EmptyStateCopy = {
  title: 'Nenhuma carteira ainda',
  description:
    'Crie ou selecione uma carteira para começar. Depois você adiciona os ativos na tela de posições.',
  ctaLabel: 'Criar carteira',
  ctaHref: '/portfolios',
  icon: 'Wallet'
};

/** Estado vazio padrão quando não há perfil financeiro. CTA leva à aba de perfis. */
export const NO_BUDGET_PROFILE_EMPTY_STATE: EmptyStateCopy = {
  title: 'Nenhum perfil financeiro ainda',
  description: 'Crie um perfil de orçamento para começar a registrar receitas, despesas e metas.',
  ctaLabel: 'Criar perfil',
  ctaHref: '/financeiro/perfis',
  icon: 'PiggyBank'
};

import type { PortfolioCreate, PortfolioStatus } from '$lib/api/portfolios';

export type PortfolioTemplateId =
  | 'personal'
  | 'spouse'
  | 'children'
  | 'retirement'
  | 'emergency'
  | 'long_term'
  | 'simulation';

export type PortfolioTemplate = {
  id: PortfolioTemplateId;
  label: string;
  description: string;
  suggestedName: string;
  holderPlaceholder: string;
  objective: string;
  status: PortfolioStatus;
};

export const PORTFOLIO_TEMPLATES: PortfolioTemplate[] = [
  {
    id: 'personal',
    label: 'Pessoal',
    description: 'Investimentos do titular principal.',
    suggestedName: 'Carteira pessoal',
    holderPlaceholder: 'Ex.: Eu',
    objective: 'Patrimônio pessoal de longo prazo.',
    status: 'active'
  },
  {
    id: 'spouse',
    label: 'Cônjuge',
    description: 'Carteira separada para o cônjuge ou parceiro.',
    suggestedName: 'Carteira do cônjuge',
    holderPlaceholder: 'Ex.: Cônjuge',
    objective: 'Investimentos do cônjuge com metas próprias.',
    status: 'active'
  },
  {
    id: 'children',
    label: 'Filhos',
    description: 'Reserva ou investimentos para dependentes.',
    suggestedName: 'Carteira dos filhos',
    holderPlaceholder: 'Ex.: Filho(a)',
    objective: 'Formação de patrimônio para filhos.',
    status: 'active'
  },
  {
    id: 'retirement',
    label: 'Aposentadoria',
    description: 'Foco em acumulação para a aposentadoria.',
    suggestedName: 'Carteira aposentadoria',
    holderPlaceholder: 'Ex.: Eu',
    objective: 'Construir renda futura na aposentadoria.',
    status: 'active'
  },
  {
    id: 'emergency',
    label: 'Reserva de emergência',
    description: 'Liquidez e segurança para imprevistos.',
    suggestedName: 'Reserva de emergência',
    holderPlaceholder: 'Ex.: Eu',
    objective: 'Manter reserva financeira de curto prazo.',
    status: 'active'
  },
  {
    id: 'long_term',
    label: 'Longo prazo',
    description: 'Horizonte estendido, menos necessidade de liquidez.',
    suggestedName: 'Carteira longo prazo',
    holderPlaceholder: 'Ex.: Eu',
    objective: 'Crescimento patrimonial de longo prazo.',
    status: 'active'
  },
  {
    id: 'simulation',
    label: 'Simulação',
    description: 'Testes e cenários sem impacto na carteira real.',
    suggestedName: 'Carteira simulação',
    holderPlaceholder: 'Ex.: Testes',
    objective: 'Experimentar estratégias e alocações.',
    status: 'simulation'
  }
];

export function getPortfolioTemplate(id: PortfolioTemplateId): PortfolioTemplate {
  return PORTFOLIO_TEMPLATES.find((template) => template.id === id) ?? PORTFOLIO_TEMPLATES[0];
}

export function buildPortfolioCreatePayload(options: {
  name: string;
  templateId: PortfolioTemplateId;
  allocationTargetsJson: string;
  holder?: string;
}): PortfolioCreate {
  const template = getPortfolioTemplate(options.templateId);
  const trimmedName = options.name.trim();
  const trimmedHolder = options.holder?.trim();
  return {
    name: trimmedName,
    description: template.description,
    holder: trimmedHolder || null,
    objective: template.objective,
    base_currency: 'BRL',
    status: template.status,
    allocation_targets_json: options.allocationTargetsJson
  };
}

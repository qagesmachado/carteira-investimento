import type { FixedIncomeIndexer } from '$lib/api/assets';

export const FIXED_INCOME_INDEXER_OPTIONS: { value: FixedIncomeIndexer; label: string }[] = [
  { value: 'prefixed', label: 'Pré-fixado' },
  { value: 'ipca_plus', label: 'IPCA+' },
  { value: 'post_fixed', label: 'Pós fixado' }
];

/** Valores enviados à API em `fixed_income_title_type` quando não é «Outro». */
export const FIXED_INCOME_TITLE_OPTIONS: { value: string; label: string }[] = [
  { value: 'cdb', label: 'CDB' },
  { value: 'lci', label: 'LCI' },
  { value: 'lca', label: 'LCA' },
  { value: 'debenture', label: 'Debênture' },
  { value: 'tesouro_selic', label: 'Tesouro Selic' },
  { value: 'tesouro_ipca', label: 'Tesouro IPCA+' },
  { value: 'tesouro_prefixado', label: 'Tesouro Prefixado' },
  { value: 'other', label: 'Outro' }
];

const TITLE_PARTS: Record<string, string> = {
  cdb: 'CDB',
  lci: 'LCI',
  lca: 'LCA',
  debenture: 'Debênture',
  tesouro_selic: 'Selic',
  tesouro_ipca: 'Tesouro IPCA+',
  tesouro_prefixado: 'Tesouro Prefixado'
};

export const KNOWN_TITLE_TYPE_CODES = new Set(
  FIXED_INCOME_TITLE_OPTIONS.filter((o) => o.value !== 'other').map((o) => o.value)
);

export function titleTypeCodeToIdentifierPart(codeOrCustom: string): string {
  const t = codeOrCustom.trim();
  if (!t) {
    return '';
  }
  const lower = t.toLowerCase();
  return TITLE_PARTS[lower] ?? t;
}

export function indexerCodeToLabel(indexer: FixedIncomeIndexer): string {
  const opt = FIXED_INCOME_INDEXER_OPTIONS.find((o) => o.value === indexer);
  return opt?.label ?? indexer;
}

export function extractYearFromIsoDate(iso: string): string | null {
  const s = iso.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    return s.slice(0, 4);
  }
  return null;
}

export type BuildFixedIncomeIdentifierResult =
  | { ok: true; value: string }
  | { ok: false; reason: string };

/**
 * Padrão: `<tipo título> <rótulo indexador> <ano vencimento>`.
 */
export function buildFixedIncomeIdentifier(params: {
  titleTypeCode: string;
  titleTypeOther: string;
  indexer: FixedIncomeIndexer | '' | null;
  maturityDateIso: string;
}): BuildFixedIncomeIdentifierResult {
  const year = extractYearFromIsoDate(params.maturityDateIso);
  if (!year) {
    return { ok: false, reason: 'Informe a data de vencimento.' };
  }
  const rawTitle =
    params.titleTypeCode === 'other'
      ? params.titleTypeOther.trim()
      : titleTypeCodeToIdentifierPart(params.titleTypeCode);
  const title = rawTitle.trim();
  if (!title) {
    return { ok: false, reason: 'Informe o tipo de título (ou texto em «Outro»).' };
  }
  if (!params.indexer) {
    return { ok: false, reason: 'Selecione o indexador.' };
  }
  const idxLabel = indexerCodeToLabel(params.indexer);
  const value = `${title} ${idxLabel} ${year}`.replace(/\s+/g, ' ').trim();
  return { ok: true, value };
}

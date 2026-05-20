import type { AssetType, DisplayClass } from '$lib/api/assets';

/** Países comuns em cadastro de investimentos (ISO 3166-1 alfa-2). */
const COMMON_COUNTRY_CODES = [
  'AR',
  'AT',
  'AU',
  'BE',
  'BR',
  'CA',
  'CH',
  'CL',
  'CN',
  'CO',
  'CZ',
  'DE',
  'DK',
  'ES',
  'FI',
  'FR',
  'GB',
  'HK',
  'IE',
  'IN',
  'IT',
  'JP',
  'KR',
  'LU',
  'MX',
  'NL',
  'NO',
  'NZ',
  'PL',
  'PT',
  'SE',
  'SG',
  'US',
  'ZA'
] as const;

const COMMON_CURRENCY_CODES = ['BRL', 'USD', 'EUR', 'GBP', 'CHF', 'JPY', 'CNY', 'CAD', 'AUD'] as const;

const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  stock: 'Ação',
  etf: 'ETF',
  fii: 'Fundo imobiliário',
  fixed_income: 'Renda fixa',
  crypto: 'Criptoativo',
  pension: 'Previdência',
  other: 'Outro'
};

const DISPLAY_CLASS_LABELS: Record<DisplayClass, string> = {
  stocks: 'Ações e ETFs (Brasil)',
  funds: 'Fundos imobiliários',
  fixed_income: 'Renda fixa',
  international: 'Internacional',
  crypto: 'Criptoativos',
  pension: 'Previdência',
  other: 'Outros'
};

export function formatAssetTypeForDisplay(type: AssetType): string {
  return ASSET_TYPE_LABELS[type] ?? type;
}

export function formatDisplayClassForDisplay(displayClass: DisplayClass): string {
  return DISPLAY_CLASS_LABELS[displayClass] ?? displayClass;
}

/** Códigos ISO 4217 mais comuns; demais exibidos como código em maiúsculas. */
const CURRENCY_LABELS: Record<string, string> = {
  BRL: 'Real (BRL)',
  USD: 'Dólar (USD)',
  EUR: 'Euro (EUR)',
  GBP: 'Libra esterlina (GBP)',
  CHF: 'Franco suíço (CHF)',
  JPY: 'Iene (JPY)',
  CNY: 'Yuan (CNY)',
  CAD: 'Dólar canadense (CAD)',
  AUD: 'Dólar australiano (AUD)'
};

export function formatCurrencyCodeForDisplay(code: string): string {
  const key = code.trim().toUpperCase();
  return CURRENCY_LABELS[key] ?? key;
}

const MONEY_FORMAT_CURRENCIES = new Set(['BRL', 'USD', 'EUR', 'GBP']);

/** Valor monetário com código da moeda do ativo (ex.: 602,25 USD). */
export function formatMoneyAmount(value: number, currencyCode: string): string {
  const currency = currencyCode.trim().toUpperCase();
  if (!Number.isFinite(value)) {
    return '—';
  }
  if (MONEY_FORMAT_CURRENCIES.has(currency)) {
    try {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency
      }).format(value);
    } catch {
      /* fallback */
    }
  }
  return `${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} ${currency}`;
}

export const CURRENCY_SELECT_OPTIONS: { value: string; label: string }[] = [...COMMON_CURRENCY_CODES]
  .map((code) => ({ value: code, label: formatCurrencyCodeForDisplay(code) }))
  .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'));

/** Nome do país em português + código ISO (ex.: Brasil (BR)). */
export function formatCountryCodeForDisplay(code: string | null | undefined): string {
  if (!code?.trim()) {
    return '';
  }
  const upper = code.trim().toUpperCase();
  try {
    const dn = new Intl.DisplayNames(['pt-BR'], { type: 'region' });
    const name = dn.of(upper);
    if (name) {
      return `${name} (${upper})`;
    }
  } catch {
    /* código inválido */
  }
  return upper;
}

export const COUNTRY_SELECT_OPTIONS: { value: string; label: string }[] = [...COMMON_COUNTRY_CODES]
  .map((code) => ({ value: code, label: formatCountryCodeForDisplay(code) }))
  .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'));

/** Setores frequentes em inglês (yfinance / GICS); desconhecidos mantêm o texto original. */
const SECTOR_LABELS: Record<string, string> = {
  healthcare: 'Saúde',
  technology: 'Tecnologia',
  'financial services': 'Serviços financeiros',
  energy: 'Energia',
  'consumer cyclical': 'Consumo cíclico',
  'consumer defensive': 'Consumo não cíclico',
  industrials: 'Industrial',
  'basic materials': 'Materiais básicos',
  utilities: 'Utilidades públicas',
  'real estate': 'Imóveis',
  'communication services': 'Comunicações',
  software: 'Software',
  semiconductors: 'Semicondutores',
  banks: 'Bancos',
  'asset management': 'Gestão de ativos',
  'drug manufacturers—general': 'Farmacêuticas',
  'drug manufacturers-general': 'Farmacêuticas',
  biotechnology: 'Biotecnologia',
  insurance: 'Seguros',
  'credit services': 'Serviços de crédito',
  'internet content & information': 'Internet e conteúdo',
  'auto manufacturers': 'Fabricantes de veículos',
  airlines: 'Companhias aéreas',
  'aerospace & defense': 'Aeroespacial e defesa',
  'building materials': 'Materiais de construção',
  'specialty industrial machinery': 'Máquinas industriais',
  'metals & mining': 'Metais e mineração',
  chemicals: 'Químicos',
  'oil & gas integrated': 'Petróleo e gás integrado',
  'oil & gas': 'Petróleo e gás',
  'food & beverages': 'Alimentos e bebidas',
  retail: 'Varejo',
  apparel: 'Vestuário',
  entertainment: 'Entretenimento',
  media: 'Mídia',
  'travel lodging': 'Hotéis e hospedagem',
  restaurants: 'Restaurantes',
  'consumer electronics': 'Eletrônicos de consumo',
  'packaged foods': 'Alimentos industrializados',
  'discount stores': 'Lojas de desconto',
  'specialty retail': 'Varejo especializado',
  'capital markets': 'Mercados de capitais',
  'electronic components': 'Componentes eletrônicos',
  'medical devices': 'Dispositivos médicos',
  'medical care facilities': 'Serviços de saúde',
  'health care plans': 'Planos de saúde',
  'household & personal products': 'Produtos domésticos e pessoais',
  'waste management': 'Gestão de resíduos',
  'renewable utilities': 'Utilidades renováveis',
  'independent power producers': 'Geradoras de energia',
  'electrical equipment': 'Equipamentos elétricos',
  conglomerates: 'Conglomerados',
  'farm & heavy construction machinery': 'Máquinas agrícolas e de construção',
  'engineering & construction': 'Engenharia e construção',
  'steel': 'Siderurgia',
  'copper': 'Cobre',
  'gold': 'Ouro',
  'silver': 'Prata',
  'other industrial metals & mining': 'Outros metais e mineração',
  'thermal coal': 'Carvão térmico',
  'uranium': 'Urânio',
  'solar': 'Solar',
  'reit—retail': 'FIIs varejo',
  'reit—office': 'FIIs escritórios',
  'reit—industrial': 'FIIs industriais',
  'reit—healthcare facilities': 'FIIs saúde',
  'reit—residential': 'FIIs residenciais',
  'reit—specialty': 'FIIs especializados',
  'reit—diversified': 'FIIs diversificados',
  'reit—hotel & motel': 'FIIs hotéis',
  'reit—data center': 'FIIs data center'
};

function normalizeSectorKey(sector: string): string {
  return sector
    .trim()
    .toLowerCase()
    .replace(/[—–]/g, '-')
    .replace(/\s+/g, ' ');
}

export function formatSectorForDisplay(sector: string | null | undefined): string {
  if (!sector?.trim()) {
    return '';
  }
  const raw = sector.trim();
  const key = normalizeSectorKey(raw);
  return SECTOR_LABELS[key] ?? raw;
}

/** Formata número para exibição com vírgula decimal (pt-BR), sem separador de milhar. */
export function formatDecimalBR(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    useGrouping: false,
    maximumFractionDigits: 8
  }).format(value);
}

/** Interpreta valor digitado no padrão brasileiro (vírgula decimal; ponto como milhar opcional). */
export function parseDecimalBR(input: string): number | null {
  const t = input.trim().replace(/\s/g, '');
  if (!t) {
    return null;
  }
  let s = t;
  if (s.includes(',')) {
    s = s.replace(/\./g, '').replace(',', '.');
  }
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

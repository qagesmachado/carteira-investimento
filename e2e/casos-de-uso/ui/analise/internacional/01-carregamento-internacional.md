# Carregamento análise ETF internacional

## Metadados

- **ID:** `UI-ANL-014`
- **Status:** aprovado
- **Página:** `/analise/internacional`
- **Arquivo de teste:** `e2e/specs/analise/internacional/01-carregamento-internacional.spec.ts`

## Referência

- [classificacao-ativos-etf-intl.md](../../../../docs/produto/desenvolvido/classificacao-ativos-etf-intl.md)

## Cenário

**Como** investidor  
**Quero** abrir a análise de ETFs internacionais  
**Para** ver a listagem de ETFs da carteira ativa com colunas de alocação

### Pré-condições

- Carteira ativa com posição em ETF internacional (ex.: VOO).

### Passo a passo

1. Seed com VOO na carteira ativa.
2. Abro `/analise/internacional`.
3. Título e tabela com colunas Ticker, % atual, % desejado visíveis sem erro de API.
4. Rodapé exibe total % desejado.

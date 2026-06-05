# Salvar alocação ETF internacional

## Metadados

- **ID:** `UI-ANL-015`
- **Status:** aprovado
- **Página:** `/analise/internacional`
- **Arquivo de teste:** `e2e/specs/analise/internacional/02-salvar-alocacao.spec.ts`

## Referência

- [classificacao-ativos-etf-intl.md](../../../../docs/produto/desenvolvido/classificacao-ativos-etf-intl.md)

## Cenário

**Como** investidor  
**Quero** definir % desejado e link externo por ETF  
**Para** salvar minha alocação internacional (soma 100%)

### Pré-condições

- Carteira ativa com ETF internacional (VOO).

### Passo a passo

1. Abro `/analise/internacional`.
2. Preencho % desejado = 100 para VOO.
3. Preencho link de análise (URL válida).
4. Clico em **Salvar alocação**.
5. Mensagem de sucesso; total % = 100%.

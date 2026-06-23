# Salvar alocação criptomoedas

## Metadados

- **ID:** `UI-CRP-002`
- **Status:** aprovado
- **Página:** `/analise/criptomoedas`
- **Arquivo de teste:** `e2e/specs/analise/criptomoedas/02-salvar-alocacao.spec.ts`

## Referência

- [analise-criptomoedas.md](../../../../docs/produto/desenvolvido/analise-criptomoedas.md)

## Cenário

**Como** investidor  
**Quero** definir % desejado por ativo na estratégia cripto  
**Para** distribuir a meta da classe (ex.: 70% BTC-USD, 30% ABTC11)

### Pré-condições

- Carteira ativa com BTC-USD e ABTC11 (subtipo cripto).

### Passo a passo

1. Abro `/analise/criptomoedas`.
2. Preencho % desejado = 70 para BTC-USD e 30 para ABTC11.
3. Clico em **Salvar alocação**.
4. Mensagem de sucesso; total % = 100%.

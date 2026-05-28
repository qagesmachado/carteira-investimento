# Percentual desejado por ativo (score)

## Metadados

- **ID:** `UI-REB-004`
- **Status:** aprovado
- **Página:** `/rebalanceamento`
- **Arquivo de teste:** `e2e/specs/rebalanceamento/04-percentual-desejado-score.spec.ts`

## Cenário

**Como** investidor  
**Quero** que a % desejada por ação reflita a coluna Soma  
**Para** priorizar aportes conforme análise fundamental + diagrama

### Passo a passo

1. Duas ações na carteira com scores diferentes (seed API).
2. Abro `/rebalanceamento`.
3. Na tabela por ativo, a ação com maior Soma tem % desejada maior que a outra.

# Simulação por patrimônio final desejado

## Metadados

- **ID:** `UI-REB-011`
- **Status:** aprovado
- **Página:** `/rebalanceamento`
- **Arquivo de teste:** `e2e/specs/rebalanceamento/11-simulacao-por-valor-total.spec.ts`

## Cenário

**Como** investidor  
**Quero** informar o patrimônio final desejado  
**Para** que o sistema calcule automaticamente o aporte e projete o rebalanceamento

### Passo a passo

1. Carteira com posições em várias classes (seed mix).
2. Abro `/rebalanceamento`.
3. Seleciono o modo «Por valor total».
4. Informo um patrimônio final maior que o atual.
5. O painel exibe «Aporte calculado» e «Patrimônio final» coerentes.
6. A tabela por classe exibe «Deveria ter» e «Aporte sugerido» calculados.

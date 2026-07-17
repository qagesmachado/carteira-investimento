# Desvio por classe (% e R$)

## Metadados

- **ID:** `UI-REB-012`
- **Status:** aprovado
- **Página:** `/rebalanceamento`
- **Arquivo de teste:** `e2e/specs/rebalanceamento/12-desvio-por-classe.spec.ts`

## Cenário

**Como** investidor  
**Quero** ver meta %, % atual e desvios em pontos percentuais e reais  
**Para** entender rapidamente o que está acima ou abaixo da meta

### Passo a passo

1. Carteira com posições em várias classes (seed mix).
2. Abro `/rebalanceamento`.
3. A tabela «Balanceamento por classe» exibe colunas Meta %, % Atual, Desvio %, Valor alvo e Desvio R$.
4. Classes abaixo da meta exibem desvio % negativo; acima exibem positivo.
5. Os KPIs exibem contagem de classes acima e abaixo da meta.

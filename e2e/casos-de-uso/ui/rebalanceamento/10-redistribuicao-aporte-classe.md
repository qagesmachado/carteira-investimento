# Redistribuição de aporte ao excluir classe

## Metadados

- **ID:** `UI-REB-010`
- **Status:** aprovado
- **Página:** `/rebalanceamento`
- **Arquivo de teste:** `e2e/specs/rebalanceamento/10-redistribuicao-aporte-classe.spec.ts`

## Cenário

**Como** investidor  
**Quero** desmarcar uma classe do aporte  
**Para** que o valor que seria alocado a ela seja redistribuído entre as classes marcadas

### Passo a passo

1. Carteira com posições em várias classes (seed mix).
2. Abro `/rebalanceamento` e preencho «Valor a investir».
3. Desmarco o checkbox de uma classe com gap positivo (ex.: Internacional).
4. A classe desmarcada exibe aporte sugerido R$ 0,00.
5. A soma dos aportes sugeridos nas demais classes permanece igual ao valor investido.

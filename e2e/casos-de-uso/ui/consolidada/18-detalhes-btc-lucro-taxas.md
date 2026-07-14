# UI-CNS-018 — Detalhes BTC com lucro após taxas

- **ID:** `UI-CNS-018`
- **Status:** aprovado
- **Rota:** `/consolidada`
- **Funcionalidade:** painel de detalhes — lucro descontando taxas de movimentação
- **Depende de:** `UI-BTC-001`, `UI-CNS-016`
- **Arquivo de teste:** `e2e/specs/consolidada/17-detalhes-btc-lucro-taxas.spec.ts`

## História

**Como** investidor com posição em BTC e taxas registradas em `/ferramentas/bitcoin`  
**Quero** ver no detalhe da consolidada o lucro já descontando as taxas pagas  
**Para** comparar com o lucro bruto da posição na mesma tela.

## Cenário

**Dado** carteira ativa com posição `BTC-USD` e ao menos uma taxa cadastrada  
**Quando** abro «Detalhes» da linha BTC-USD  
**Então** o bloco «Totais da posição» exibe a coluna **Lucro − taxas** após **Lucro**, com valor e percentual coerentes com o snapshot Bitcoin.

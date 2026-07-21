# UI-BTC-002 — Conferência Ledger (soma Final BTC)

- **ID:** `UI-BTC-002`
- **Status:** aprovado
- **Rota:** `/taxas-cripto`
- **Funcionalidade:** card de conferência — soma Final (BTC) das transferências para Ledger
- **Depende de:** `UI-BTC-001`
- **Arquivo de teste:** `e2e/specs/taxas-cripto/02-conferencia-ledger-soma-final.spec.ts`

## História

**Como** investidor que registra transferências para a Ledger  
**Quero** ver no resumo a soma da coluna Final (BTC) só das linhas «Taxa transferência para Ledger»  
**Para** conferir se o total bate com o saldo esperado na hardware wallet.

## Cenário

**Dado** carteira com posição BTC e um lançamento `transfer` (movimentado `0.00083916`, taxa `0.00003`, final `0.00080916`)  
**Quando** abro `/taxas-cripto`  
**Então** o card **Conferência Ledger** exibe `0,00080916` e indica `1 transferência`.

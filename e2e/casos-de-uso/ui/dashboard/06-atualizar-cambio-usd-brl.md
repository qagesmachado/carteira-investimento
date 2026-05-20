# Atualizar câmbio USD/BRL no dashboard

## Metadados

- **ID:** `UI-DASH-006`
- **Status:** aprovado
- **Página:** `/dashboard`
- **Funcionalidade:** refresh da taxa USD/BRL
- **Depende de:** seed consolidada mínima
- **Arquivo de teste:** `e2e/specs/dashboard/06-atualizar-cambio-usd-brl.spec.ts`
- **Referência:** [dashboard-inicial.md](../../../docs/produto/desenvolvido/dashboard-inicial.md)

## Ambiente de teste

- **Lookup:** `yfinance`
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Refresh de câmbio

**Como** investidor  
**Quero** atualizar a taxa USD/BRL no dashboard  
**Para** converter posições em dólar para reais

### Passo a passo

1. Existe carteira ativa (seed API).
2. Abro `/dashboard`.
3. Clico «Atualizar câmbio (USD/BRL)».
4. Alerta de sucesso ou linha «USD/BRL:» atualizada fica visível.

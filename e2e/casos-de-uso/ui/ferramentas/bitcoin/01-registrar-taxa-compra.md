# Registrar taxa de compra BTC

## Metadados

- **ID:** `UI-BTC-001`
- **Status:** aprovado
- **Página:** `/taxas-cripto`
- **Funcionalidade:** cadastro de taxa e total no resumo
- **Depende de:** carteira com posição BTC-USD (seed API)
- **Arquivo de teste:** `e2e/specs/taxas-cripto/01-registrar-taxa-compra.spec.ts`
- **Referência:** [bitcoin-taxas.md](../../../../../docs/produto/desenvolvido/bitcoin-taxas.md)

## Cenário — Taxa de compra

**Como** investidor  
**Quero** registrar taxa de compra de BTC  
**Para** acompanhar custos de movimentação

### Passo a passo

1. Existe carteira ativa com posição em BTC-USD.
2. Abro `/taxas-cripto` — cards exibem posição e total de taxas.
3. Preencho formulário com taxa de compra (data, quantidades, cotação, câmbio).
4. Salvo — linha aparece na tabela e total de taxas atualiza.

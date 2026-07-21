# Cálculo manual de preço médio

## Metadados

- **ID:** `UI-FERR-008`
- **Status:** aprovado
- **Página:** `/calculo-preco-medio`
- **Funcionalidade:** média ponderada de dois lotes (modo manual)
- **Depende de:** nenhum
- **Arquivo de teste:** `e2e/specs/calculo-preco-medio/01-calculo-manual.spec.ts`
- **Referência:** [calculo-preco-medio.md](../../../../../docs/produto/desenvolvido/calculo-preco-medio.md)

## Cenário — Dois lotes manuais

**Como** investidor  
**Quero** informar quantidade e preço de dois lotes  
**Para** ver o preço médio ponderado resultante

### Passo a passo

1. Abro `/calculo-preco-medio` na aba **Manual**.
2. Informo Lote 1: 100 cotas a R$ 30,00.
3. Informo Lote 2: 50 cotas a R$ 35,00.
4. O resultado exibe **150** cotas e preço médio **R$ 31,67**.

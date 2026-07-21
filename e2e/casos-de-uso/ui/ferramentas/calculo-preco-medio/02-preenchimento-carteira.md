# Pré-preenchimento com posição da carteira

## Metadados

- **ID:** `UI-FERR-009`
- **Status:** aprovado
- **Página:** `/calculo-preco-medio`
- **Funcionalidade:** Lote 1 a partir de posição existente
- **Depende de:** carteira seed com BBSE3 (100 cotas @ R$ 32,50)
- **Arquivo de teste:** `e2e/specs/calculo-preco-medio/02-preenchimento-carteira.spec.ts`
- **Referência:** [calculo-preco-medio.md](../../../../../docs/produto/desenvolvido/calculo-preco-medio.md)

## Cenário — Posição + nova compra

**Como** investidor  
**Quero** usar minha posição atual como Lote 1  
**Para** calcular o preço médio após uma nova compra

### Passo a passo

1. Existe carteira ativa com 100 BBSE3 a R$ 32,50.
2. Abro `/calculo-preco-medio` na aba **Com posição da carteira**.
3. Seleciono a posição BBSE3 — Lote 1 pré-preenchido.
4. Informo Lote 2: 50 cotas a R$ 35,00.
5. Resultado: **150** cotas e preço médio **R$ 33,33** (aprox.).

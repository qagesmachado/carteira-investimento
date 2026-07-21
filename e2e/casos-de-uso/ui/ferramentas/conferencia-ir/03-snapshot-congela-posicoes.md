# Snapshot congela posições em 31/12

## Metadados

- **ID:** `UI-IR-003`
- **Status:** aprovado
- **Página:** `/conferencia-ir`
- **Funcionalidade:** congelar qty e preço médio; exibir na aba Posições
- **Depende de:** posição cadastrada na carteira
- **Arquivo de teste:** `e2e/specs/conferencia-ir/03-snapshot-congela-posicoes.spec.ts`
- **Referência:** [conferencia-ir-anual.md](../../../../../docs/produto/desenvolvido/conferencia-ir-anual.md)

## Cenário — congelamento manual

**Como** investidor  
**Quero** registrar a posição de 31/12 antes de alterar a carteira  
**Para** declarar IR com quantidade e preço médio corretos

### Passo a passo

1. Semear posição (qty 100, PM 32,50) e ano 2024.
2. Abrir conferência IR, selecionar 2024.
3. Clicar em congelar snapshot.
4. Na aba Posições, verificar qty 100 e PM 32,50.

## Notas para automação

- Alterar posição após snapshot; aba Posições deve manter valores congelados.

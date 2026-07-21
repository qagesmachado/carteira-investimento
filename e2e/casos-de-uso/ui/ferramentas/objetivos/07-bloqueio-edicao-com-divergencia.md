# Bloqueio de edição com divergência

## Metadados

- **ID:** `UI-OBJ-007`
- **Status:** aprovado
- **Página:** `/objetivos`
- **Funcionalidade:** bloqueio de edição até regularizar
- **Depende de:** `UI-OBJ-006`
- **Arquivo de teste:** `e2e/specs/objetivos/07-bloqueio-edicao-com-divergencia.spec.ts`
- **Referência:** [objetivos-financeiros.md](../../../../../docs/produto/desenvolvido/objetivos-financeiros.md)

## Cenário — bloqueio até reajustar

**Como** investidor  
**Quero** que edições do ativo divergente fiquem bloqueadas  
**Para** não piorar a inconsistência

### Passo a passo

1. PETR4 com divergência (alocado > total após venda).
2. Tento «Adicionar ativo» ou editar alocação de PETR4 em outro objetivo.
3. Ação bloqueada ou modal exibe mensagem de divergência.
4. Após reajustar alocações para ≤ 50 cotas, bloqueio some.

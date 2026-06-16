# Resumo agrupa por ativo e tipo

## Metadados

- **ID:** `UI-IR-002`
- **Status:** aprovado
- **Página:** `/ferramentas/conferencia-ir`
- **Funcionalidade:** aba Resumo com totais por tipo de provento por ativo
- **Depende de:** `UI-IR-001` (mesmo seed)
- **Arquivo de teste:** `e2e/specs/ferramentas/conferencia-ir/02-resumo-agrupa-ativo-tipo.spec.ts`
- **Referência:** [conferencia-ir-anual.md](../../../../../docs/produto/desenvolvido/conferencia-ir-anual.md)

## Cenário — pivot ativo × tipo

**Como** investidor  
**Quero** ver o total de cada tipo de provento por ativo  
**Para** comparar com informes de rendimentos

### Passo a passo

1. Semear BBSE3 com dividendo e JCP no mesmo ano.
2. Abrir conferência IR para esse ano.
3. Na aba Resumo, verificar linha do ativo com colunas Dividendo e JCP corretas.

## Notas para automação

- Assert em células da tabela resumo por `data-testid`.

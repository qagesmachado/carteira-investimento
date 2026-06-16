# Export Excel com três abas

## Metadados

- **ID:** `UI-IR-004`
- **Status:** aprovado
- **Página:** `/ferramentas/conferencia-ir`
- **Funcionalidade:** exportar relatório em Excel com Detalhado, Resumo e Posições
- **Depende de:** `UI-IR-003` (snapshot + proventos)
- **Arquivo de teste:** `e2e/specs/ferramentas/conferencia-ir/04-export-excel-tres-abas.spec.ts`
- **Referência:** [conferencia-ir-anual.md](../../../../../docs/produto/desenvolvido/conferencia-ir-anual.md)

## Cenário — download Excel

**Como** investidor  
**Quero** exportar o relatório anual para planilha  
**Para** conferir offline como na planilha antiga

### Passo a passo

1. Com relatório carregado, clicar Exportar Excel.
2. Verificar download com nome `conferencia-ir-*.xlsx`.
3. Ler arquivo e confirmar 3 abas: Detalhado, Resumo, Posições.

## Notas para automação

- Usar `xlsx` no teste para inspecionar sheet names do download.

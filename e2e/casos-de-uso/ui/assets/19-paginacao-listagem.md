# Paginação da listagem de ativos

## Metadados

- **ID:** `UI-AST-019`
- **Status:** aprovado
- **Página:** `/assets`
- **Arquivo de teste:** `e2e/specs/assets/19-paginacao-listagem.spec.ts`

## Cenário

**Como** investidor  
**Quero** paginar a tabela de ativos cadastrados  
**Para** navegar listas grandes sem sobrecarregar a tela

### Passo a passo

1. Mais de 20 ativos na base (seed API).
2. Abro `/assets`.
3. Vejo «Mostrando 1–20 de N» e apenas 20 linhas na tabela.
4. Clico em **Próxima** — a segunda página exibe os demais ativos.

# Carregamento análise ações BR

## Metadados

- **ID:** `UI-ANL-001`
- **Status:** aprovado
- **Página:** `/analise/acoes-br`
- **Arquivo de teste:** `e2e/specs/analise/01-carregamento-acoes-br.spec.ts`

## Cenário

**Como** investidor  
**Quero** abrir a análise de ações/ETF BR  
**Para** ver a listagem de ativos elegíveis

### Passo a passo

1. Base sem ativos elegíveis ou com seed mínimo.
2. Abro `/analise/acoes-br`.
3. Título e tabela (ou estado vazio) visíveis sem erro de API.

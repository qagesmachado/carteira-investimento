# Carregamento análise FIIs

## Metadados

- **ID:** `UI-ANL-007`
- **Status:** aprovado
- **Página:** `/analise/fiis`
- **Arquivo de teste:** `e2e/specs/analise/fiis/07-carregamento-fiis.spec.ts`

## Cenário

**Como** investidor  
**Quero** abrir a análise de FIIs  
**Para** ver a listagem de fundos elegíveis

### Passo a passo

1. Base sem ativos elegíveis ou com seed mínimo.
2. Abro `/analise/fiis`.
3. Título e tabela (ou estado vazio) visíveis sem erro de API.

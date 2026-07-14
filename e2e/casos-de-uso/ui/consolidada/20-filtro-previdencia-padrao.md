# Previdência excluída por padrão na consolidada

## Metadados

- **ID:** `UI-CNS-020`
- **Status:** implementado
- **Página:** `/consolidada`
- **Funcionalidade:** checkbox Previdência (mesma semântica do dashboard)
- **Depende de:** `UI-CNS-002`
- **Arquivo de teste:** `e2e/specs/consolidada/20-filtro-previdencia-padrao.spec.ts`

## Cenário — Previdência fora da grade até marcar o filtro

**Como** investidor  
**Quero** que previdência não polua a visão operacional por padrão  
**Para** focar em ativos de mercado e RF cotados

### Passo a passo

1. Seed com `BBSE3` e plano `E2E-PGBL-001`.
2. Abro `/consolidada`.
3. Bloco **consolidada-patrimony-filters** aparece com checkbox **Previdência** (carteira tem previdência).
4. Linha do PGBL **não** aparece com checkbox desmarcado.
5. Marco **Previdência** — linha do PGBL aparece na tabela.

# Flag P/VP > 1,5 descarta

## Metadados

- **ID:** `UI-ANL-010`
- **Status:** aprovado
- **Página:** `/analise/fiis`
- **Arquivo de teste:** `e2e/specs/analise/fiis/10-flag-pvp-descarte.spec.ts`

## Cenário

**Como** investidor  
**Quero** marcar P/VP acima de 1,5  
**Para** descartar o investimento (Soma `—`, badge DESCARTADO)

### Passo a passo

1. Seed com FII.
2. Abro Classificar, marco flag P/VP > 1,5.
3. Salvo.
4. Tabela exibe badge DESCARTADO e Soma `—`.

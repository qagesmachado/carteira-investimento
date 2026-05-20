# Adicionar posição manual de previdência

## Metadados

- **ID:** `UI-PRT-017`
- **Status:** implementado
- **Página:** `/portfolios`
- **Funcionalidade:** posição manual de previdência
- **Depende de:** `UI-AST-004`, `UI-PRT-002`
- **Arquivo de teste:** `e2e/specs/portfolios/17-adicionar-posicao-previdencia.spec.ts`

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db` (previdência)
- **Base de carteiras:** `backend/data/test/portfolios.db`
- **Lookup:** yfinance
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Lançar saldo de previdência

**Como** investidor  
**Quero** registrar saldo de previdência  
**Para** consolidar na visão da carteira

### Passo a passo

1. Ativo de previdência existe (`UI-AST-004`).
2. Carteira `E2E Principal` está ativa.
3. Adiciono posição manual do plano de previdência com valores aplicado/atual.
4. Salvo a posição.
5. Linha de previdência visível na tabela de posições.
6. Tipo aparece no resumo «Por tipo» (`UI-PRT-012`).

## Notas para automação (fase 2)

- Reutilizar plano criado em `UI-AST-004`.

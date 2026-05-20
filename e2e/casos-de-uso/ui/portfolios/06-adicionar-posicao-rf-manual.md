# Adicionar posição manual de renda fixa

## Metadados

- **ID:** `UI-PRT-006`
- **Status:** implementado
- **Página:** `/portfolios`
- **Funcionalidade:** posição manual RF com aplicado, atual e rendimento
- **Depende de:** `UI-AST-003`, `UI-PRT-002`
- **Arquivo de teste:** `e2e/specs/portfolios/06-adicionar-posicao-rf-manual.spec.ts`

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db` (RF manual)
- **Base de carteiras:** `backend/data/test/portfolios.db`
- **Lookup:** yfinance
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Lançar posição de RF manual

**Como** investidor  
**Quero** lançar valores de uma aplicação RF  
**Para** ver patrimônio manual na carteira

### Passo a passo

1. Ativo de RF manual existe (`UI-AST-003`).
2. Carteira `E2E Principal` está ativa.
3. Adiciono posição manual selecionando o ativo de RF.
4. Informo valor aplicado, valor atual e rendimento conforme formulário.
5. Salvo a posição.
6. A posição aparece na tabela com campos de mercado manual (sem cotação de mercado).
7. Valores persistem em `portfolios.db` após recarregar.

## Notas para automação (fase 2)

- Usar identificador fixo documentado no spec de `UI-AST-003`.

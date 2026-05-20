# Atualizar cotações

## Metadados

- **ID:** `UI-PRT-009`
- **Status:** implementado
- **Página:** `/portfolios`
- **Funcionalidade:** refresh de cotações da carteira ativa
- **Depende de:** `UI-PRT-005` (posições de mercado)
- **Arquivo de teste:** `e2e/specs/portfolios/09-atualizar-cotacoes.spec.ts`

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db`
- **Base de carteiras:** `backend/data/test/portfolios.db`
- **Lookup:** yfinance
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Atualizar cotações com sucesso

**Como** investidor  
**Quero** atualizar preços de mercado  
**Para** ver valores atuais na carteira

### Passo a passo

1. Carteira `E2E Principal` ativa com posição em `BBSE3`.
2. Clico em «Atualizar cotações» (ou equivalente).
3. Aguardo o fim da operação.
4. Vejo mensagem de resumo (atualizados / ignorados / falhas) conforme retorno do fake.
5. A coluna de valor atual ou preço reflete dados do modo fake.
6. Não há erro fatal na página.

## Notas para automação (fase 2)

- Repetir comportamento em `UI-CNS-004` na consolidada.

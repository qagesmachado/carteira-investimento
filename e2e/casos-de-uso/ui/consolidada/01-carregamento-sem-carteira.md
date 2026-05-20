# Carregamento sem carteira

## Metadados

- **ID:** `UI-CNS-001`
- **Status:** implementado
- **Página:** `/portfolios/consolidada`
- **Funcionalidade:** estado vazio e link para criar carteira
- **Depende de:** `portfolios.db` vazia (spec isolado)
- **Arquivo de teste:** `e2e/specs/consolidada/01-carregamento-sem-carteira.spec.ts`

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db`
- **Base de carteiras:** `backend/data/test/portfolios.db` (vazia)
- **Lookup:** não se aplica
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Nenhuma carteira disponível

**Como** investidor  
**Quero** ver orientação quando não há carteira  
**Para** ir criar uma em `/portfolios`

### Passo a passo

1. `portfolios.db` de teste não contém carteiras.
2. Navego para `http://127.0.0.1:5173/portfolios/consolidada`.
3. Vejo mensagem de ausência de carteira ou estado vazio.
4. Há link ou botão para ir a `/portfolios`.
5. Não são exibidos cartões de resumo nem tabela de posições preenchida.

## Notas para automação (fase 2)

- Spec pode rodar com `globalSetup` apenas, antes da suíte completa 1→2→3.

# Smoke — migração legado (banco único)

## Metadados

- **ID:** `UI-DAD-009`
- **Status:** aprovado
- **Página:** — (smoke via API; sem navegação obrigatória em `/dados`)
- **Funcionalidade:** validar que a migração de `portfolios.db` legado para `carteira.db` unificado conclui sem perda crítica
- **Depende de:** cenário isolado com `portfolios.db` legado + `carteira.db` pré-existente (arrange no spec ou script)
- **Arquivo de teste:** `e2e/specs/dados/09-migracao-legado-smoke.spec.ts`
- **Referência:** [persistencia-banco-unico.md](../../../../docs/produto/desenvolvido/persistencia-banco-unico.md) · `backend/tests/test_dividend_payments_migration.py`

## Ambiente de teste

- **Base:** `backend/data/test/carteira.db` (recriada no `pretest:ui`; banco único — carteiras, posições e proventos)
- **Lookup:** não se aplica
- **URLs:** API `http://127.0.0.1:8001` (requests Playwright `request` ou helper HTTP)

> Este caso **não** usa `portfolios.db` como base permanente do E2E; o spec monta temporariamente o par legado, dispara `init_db`/subida equivalente e asserta o estado unificado.

## Cenário — Migração unifica carteiras e backfill de proventos

**Como** mantenedor do sistema  
**Quero** um smoke da migração legado  
**Para** garantir que usuários com dois arquivos SQLite antigos migram para um banco só

### Passo a passo

1. **Arrange:** em diretório temporário de teste, crio `carteira.db` com tabela `dividendpayment` **sem** `portfolio_id` e ao menos um provento; crio `portfolios.db` com carteira **Controle investimento** (case-insensitive) e posições mínimas.
2. Disparo rotina de migração (`init_db` / startup da API de teste apontando para esse diretório, conforme implementação).
3. **Verifico:** existe apenas um banco efetivo de trabalho (`carteira.db`) com tabelas `portfolio`, `position`, `dividendpayment`.
4. **Verifico:** registros de `portfolio` do legado foram copiados.
5. **Verifico:** proventos legados receberam `portfolio_id` da carteira «Controle investimento».
6. **Verifico:** flag `apppreference.migration_unified_db = done` (ou equivalente).
7. **Verifico:** `portfolios.db` foi renomeado para `portfolios.db.migrated` (ou marcado como processado).
8. **Smoke API:** `GET /health` (ou `GET /portfolios`) retorna 200 após migração.

## Notas para automação

- Preferir `test.request` / `APIRequestContext` sem UI.
- Espelhar asserts de `test_dividend_payments_migration.py` em nível smoke (menos casos que a suíte pytest).
- Não interferir no `carteira.db` compartilhado dos demais specs na mesma worker: usar `test.describe.configure` isolado ou reinicializar DB só neste arquivo.

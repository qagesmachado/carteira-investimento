# Remover posição mantém proventos no dashboard e consolidada

## Metadados

- **ID:** `UI-DAD-008`
- **Status:** aprovado
- **Página:** `/portfolios` (ação) · `/dashboard` e `/portfolios/consolidada` (verificação)
- **Funcionalidade:** ao remover posição, proventos da carteira + ativo permanecem e continuam nos totais
- **Depende de:** carteira ativa com posição e provento do mesmo ticker (regra do banco único)
- **Arquivo de teste:** `e2e/specs/dados/08-remover-posicao-proventos-persistem.spec.ts`
- **Referência:** [persistencia-banco-unico.md](../../../../docs/produto/desenvolvido/persistencia-banco-unico.md)

## Ambiente de teste

- **Base:** `backend/data/test/carteira.db` (recriada no `pretest:ui`; banco único — carteiras, posições e proventos)
- **Lookup:** não se aplica
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Proventos permanecem após exclusão da posição

**Como** investidor  
**Quero** remover uma posição sem perder o histórico de proventos  
**Para** manter dividendos recebidos no dashboard e na visão consolidada

### Passo a passo

1. Via seed API: carteira ativa com posição em `KLBN` (ou ticker descartável) e um provento de `KLBN` vinculado à mesma carteira (ex.: R$ 25,00).
2. Em `/portfolios/consolidada`, com a carteira ativa, expando detalhes de `KLBN` (se ainda listado) ou verifico totais de proventos no painel/resumo global.
3. Anoto o total de **Dividendos recebidos** associado a `KLBN` (ou contagem de lançamentos).
4. Navego para `/portfolios`, removo a posição de `KLBN` e confirmo o diálogo.
5. **Verifico:** a linha da posição desaparece da tabela de `/portfolios`.
6. Em `/proventos`, o lançamento de `KLBN` (R$ 25,00) **permanece** na listagem da carteira ativa.
7. Em `/portfolios/consolidada`, `KLBN` não aparece mais como posição aberta; o resumo de proventos da carteira (ou do ativo no histórico, conforme UI) **ainda reflete** R$ 25,00 ou equivalente documentado.
8. Em `/dashboard`, widgets que somam proventos da carteira ativa **ainda incluem** o valor seed (sem zerar após remover a posição).

## Notas para automação

- Stub `window.confirm` na remoção.
- Não remover `BBSE3`/`VOO` se outros specs da mesma run dependem deles; usar ticker dedicado `KLBN`.
- Regra de negócio: exclusão de posição ≠ exclusão de proventos ([persistencia-banco-unico.md](../../../../docs/produto/desenvolvido/persistencia-banco-unico.md)).

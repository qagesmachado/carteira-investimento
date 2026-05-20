# Excluir carteira

## Metadados

- **ID:** `UI-PRT-014`
- **Status:** implementado
- **Página:** `/portfolios`
- **Funcionalidade:** excluir carteira com confirmação
- **Depende de:** `UI-PRT-003` (`E2E Aux Renomeada`)
- **Arquivo de teste:** `e2e/specs/portfolios/14-excluir-carteira.spec.ts`

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db`
- **Base de carteiras:** `backend/data/test/portfolios.db`
- **Lookup:** não se aplica
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Excluir carteira auxiliar

**Como** investidor  
**Quero** excluir uma carteira não usada  
**Para** limpar a base de teste

### Passo a passo

1. Existe carteira `E2E Aux Renomeada` sem dependência dos casos consolidada.
2. Solicito exclusão da carteira.
3. Confirmo o diálogo.
4. A carteira não aparece mais na lista.
5. Não existe em `portfolios.db` após recarregar.

## Notas para automação (fase 2)

- Não excluir `E2E Principal` usada em `UI-PRT-005` em diante.
- Stub de `window.confirm`.

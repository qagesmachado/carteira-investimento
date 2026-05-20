# Excluir ativo pela lista

## Metadados

- **ID:** `UI-AST-008`
- **Status:** implementado
- **Nível:** `ambos`
- **Página:** `/assets`
- **Funcionalidade:** excluir ativo com confirmação
- **Depende de:** ativo `ITSA4` cadastrado (ex.: via lote)
- **Arquivo de teste:** `e2e/specs/assets/08-excluir-ativo-lista.spec.ts`

- **Referência:** exclusão na tabela em `/assets`

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db`
- **Base de carteiras:** `backend/data/test/portfolios.db` (não usada)
- **Lookup:** `ASSET_LOOKUP_MODE=fake`
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Excluir ativo após confirmação

**Como** investidor  
**Quero** remover um ativo do catálogo  
**Para** manter a base de teste limpa

### Passo a passo

1. Existe o ativo `ITSA4` cadastrado na base de teste (via lookup ou lote).
2. Estou em `/assets` com a linha de `ITSA4` visível.
3. Clico em «Excluir» na linha de `ITSA4`.
4. Confirmo o diálogo de confirmação do navegador.
5. Aguardo a atualização da lista.
6. A linha de `ITSA4` não aparece mais na tabela.
7. Após recarregar `/assets`, `ITSA4` não está em `data/test/carteira.db`.

## Notas para automação (fase 2)

- Stub de `window.confirm` para aceitar.
- Preferir ticker do lote (`UI-AST-009`) para não afetar `BBSE3` usado em portfolios.

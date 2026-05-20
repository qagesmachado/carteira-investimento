# Cancelar exclusão de ativo

## Metadados

- **ID:** `UI-AST-016`
- **Status:** implementado
- **Nível:** `ambos`
- **Página:** `/assets`
- **Funcionalidade:** cancelar diálogo de exclusão
- **Depende de:** ativo `FLRY3` na base
- **Arquivo de teste:** `e2e/specs/assets/16-excluir-cancelar.spec.ts`

- **Referência:** exclusão na tabela em `/assets`

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db`
- **Base de carteiras:** `backend/data/test/portfolios.db` (não usada)
- **Lookup:** `ASSET_LOOKUP_MODE=fake`
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Cancelar exclusão mantém ativo

**Como** investidor  
**Quero** cancelar a exclusão  
**Para** não remover o ativo por engano

### Passo a passo

1. Existe ativo `FLRY3` na base de teste.
2. Estou na linha de `FLRY3` em `/assets`.
3. Clico em «Excluir».
4. Cancelo o diálogo de confirmação.
5. A linha de `FLRY3` permanece na tabela.
6. O ativo continua na base após recarregar.

## Notas para automação (fase 2)

- Stub de `window.confirm` retornando `false`.

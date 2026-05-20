# Renomear carteira

## Metadados

- **ID:** `UI-PRT-003`
- **Status:** implementado
- **Página:** `/portfolios`
- **Funcionalidade:** alterar nome da carteira
- **Depende de:** carteira auxiliar `E2E Aux` criada para teste
- **Arquivo de teste:** `e2e/specs/portfolios/03-renomear-carteira.spec.ts`

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db`
- **Base de carteiras:** `backend/data/test/portfolios.db`
- **Lookup:** não se aplica
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Renomear E2E Aux

**Como** investidor  
**Quero** alterar o nome de uma carteira  
**Para** organizar melhor

### Passo a passo

1. Existe carteira `E2E Aux` criada para teste (sem posições críticas).
2. Inicio renomeação para `E2E Aux Renomeada`.
3. Salvo o novo nome.
4. A lista exibe `E2E Aux Renomeada`.
5. O nome persiste após recarregar em `portfolios.db`.

## Notas para automação (fase 2)

- Criar `E2E Aux` no `beforeAll` se necessário.

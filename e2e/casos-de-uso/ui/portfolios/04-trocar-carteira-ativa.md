# Trocar carteira ativa

## Metadados

- **ID:** `UI-PRT-004`
- **Status:** implementado
- **Página:** `/portfolios`
- **Funcionalidade:** definir carteira ativa e recarregar posições
- **Depende de:** `UI-PRT-002` e carteira `E2E Secundária`
- **Arquivo de teste:** `e2e/specs/portfolios/04-trocar-carteira-ativa.spec.ts`

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db`
- **Base de carteiras:** `backend/data/test/portfolios.db` (duas carteiras)
- **Lookup:** não se aplica
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Ativar segunda carteira

**Como** investidor  
**Quero** trocar a carteira ativa  
**Para** ver posições da outra carteira

### Passo a passo

1. Carteira `E2E Principal` está ativa com posição em `BBSE3`.
2. Carteira `E2E Secundária` existe sem posições (ou com outro ativo).
3. Defino `E2E Secundária` como carteira ativa.
4. O badge de ativa aparece em `E2E Secundária`.
5. A tabela de posições reflete apenas dados da carteira secundária.
6. Volto `E2E Principal` como ativa.
7. A posição em `BBSE3` reaparece na tabela.

## Notas para automação (fase 2)

- Criar `E2E Secundária` no `beforeAll` se necessário.

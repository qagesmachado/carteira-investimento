# Criar carteira E2E Principal

## Metadados

- **ID:** `UI-PRT-002`
- **Status:** implementado
- **Página:** `/portfolios`
- **Funcionalidade:** criar carteira e torná-la ativa
- **Depende de:** `UI-PRT-001`
- **Arquivo de teste:** `e2e/specs/portfolios/02-criar-carteira.spec.ts`

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db` (com ativos)
- **Base de carteiras:** `backend/data/test/portfolios.db` (vazia no início)
- **Lookup:** não se aplica
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Criar carteira E2E Principal

**Como** investidor  
**Quero** criar uma carteira  
**Para** adicionar posições na base de teste

### Passo a passo

1. Estou em `/portfolios` sem carteira «E2E Principal».
2. Informo o nome `E2E Principal`.
3. Confirmo a criação da carteira.
4. A carteira aparece na lista.
5. A carteira fica marcada como ativa (badge ou indicador).
6. Após recarregar, a carteira persiste em `data/test/portfolios.db`.

## Notas para automação (fase 2)

- Nome fixo `E2E Principal` usado em toda a suíte consolidada.

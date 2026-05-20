# Remover posição

## Metadados

- **ID:** `UI-PRT-008`
- **Status:** implementado
- **Página:** `/portfolios`
- **Funcionalidade:** remover posição com confirmação
- **Depende de:** posição descartável (ex.: `KLBN`)
- **Arquivo de teste:** `e2e/specs/portfolios/08-remover-posicao.spec.ts`

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db`
- **Base de carteiras:** `backend/data/test/portfolios.db`
- **Lookup:** yfinance
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Remover posição após confirmação

**Como** investidor  
**Quero** remover uma posição  
**Para** atualizar a carteira de teste

### Passo a passo

1. Existe posição extra criada só para exclusão (ex.: ticker `KLBN`).
2. Clico em remover na linha.
3. Confirmo o diálogo.
4. A linha desaparece da tabela.
5. Não há registro da posição em `portfolios.db` após recarregar.

## Notas para automação (fase 2)

- Stub `window.confirm`.
- Não remover `BBSE3` nem `VOO` se a suíte consolidada seguir na mesma run.

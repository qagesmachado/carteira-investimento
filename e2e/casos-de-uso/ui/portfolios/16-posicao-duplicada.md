# Impedir posição duplicada

## Metadados

- **ID:** `UI-PRT-016`
- **Status:** implementado
- **Página:** `/portfolios`
- **Funcionalidade:** erro ao adicionar mesmo ativo duas vezes
- **Depende de:** `UI-PRT-005` (posição em `BBSE3`)
- **Arquivo de teste:** `e2e/specs/portfolios/16-posicao-duplicada.spec.ts`

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db`
- **Base de carteiras:** `backend/data/test/portfolios.db`
- **Lookup:** yfinance
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Não permitir segunda posição em BBSE3

**Como** investidor  
**Quero** ser avisado ao duplicar posição  
**Para** não ter duas linhas do mesmo ticker

### Passo a passo

1. Já existe posição em `BBSE3` na carteira ativa.
2. Tento adicionar novamente `BBSE3`.
3. Vejo erro de duplicata ou o fluxo impede salvar.
4. Continua existindo apenas uma linha de `BBSE3`.

## Notas para automação (fase 2)

- Assertar mensagem de erro da API ou validação na UI.

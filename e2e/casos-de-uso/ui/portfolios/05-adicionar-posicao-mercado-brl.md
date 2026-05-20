# Adicionar posição de mercado BRL

## Metadados

- **ID:** `UI-PRT-005`
- **Status:** implementado
- **Página:** `/portfolios`
- **Funcionalidade:** AssetPicker, quantidade e preço com decimal BR
- **Depende de:** `UI-PRT-002`, `UI-AST-002` (`BBSE3`)
- **Arquivo de teste:** `e2e/specs/portfolios/05-adicionar-posicao-mercado-brl.spec.ts`

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db` (contém `BBSE3`)
- **Base de carteiras:** `backend/data/test/portfolios.db` (carteira `E2E Principal` ativa)
- **Lookup:** yfinance
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Posição em BBSE3 com preço brasileiro

**Como** investidor  
**Quero** registrar quantidade e preço de uma ação  
**Para** compor a carteira de teste

### Passo a passo

1. Carteira `E2E Principal` está ativa.
2. Não existe posição em `BBSE3` nesta carteira.
3. Abro adicionar posição de mercado.
4. Seleciono ativo `BBSE3` no seletor.
5. Informo quantidade `100` e preço médio `32,50` (formato BR).
6. Salvo a posição.
7. A linha de `BBSE3` aparece na tabela de posições.
8. Valores exibidos refletem quantidade e preço informados.
9. Persistem em `portfolios.db` após recarregar.

## Notas para automação (fase 2)

- Pré-requisito para casos consolidada com posição BRL.

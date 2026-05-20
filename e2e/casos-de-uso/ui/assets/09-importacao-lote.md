# Importar múltiplos tickers em lote

## Metadados

- **ID:** `UI-AST-009`
- **Status:** implementado
- **Nível:** `ambos`
- **Página:** `/assets`
- **Funcionalidade:** colar lista, pré-visualizar e salvar tickers válidos
- **Depende de:** tickers do lote ainda não cadastrados (ou base vazia)
- **Arquivo de teste:** `e2e/specs/assets/09-importacao-lote.spec.ts`

- **Referência:** cadastro em lote em `/assets`

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db`
- **Base de carteiras:** `backend/data/test/portfolios.db` (não usada)
- **Lookup:** `ASSET_LOOKUP_MODE=fake`
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Importar FESA4, FLRY3 e ITSA4

**Como** investidor  
**Quero** cadastrar vários ativos de uma vez  
**Para** popular o catálogo rapidamente na base de teste

### Passo a passo

1. Estou em `/assets` na seção de cadastro em lote.
2. Os tickers `FESA4`, `FLRY3`, `ITSA4` não estão todos cadastrados (ou a base está vazia).
3. Colo no campo de texto a lista: `FESA4`, `FLRY3`, `ITSA4` (formato conforme a UI).
4. Clico em buscar/pré-visualizar no yfinance (fake).
5. Aguardo a tabela de pré-visualização.
6. Seleciono todas as linhas elegíveis.
7. Clico em salvar selecionados.
8. A pré-visualização mostra status de sucesso para os tickers válidos.
9. Após salvar, as três linhas aparecem na tabela de cadastrados.
10. Os registros persistem em `data/test/carteira.db` após recarregar.

## Notas para automação (fase 2)

- Fixture de texto: `FESA4\nFLRY3\nITSA4`.

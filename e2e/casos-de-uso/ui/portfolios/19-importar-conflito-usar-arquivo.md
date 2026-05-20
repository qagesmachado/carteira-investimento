# Importar carteira resolvendo conflito

## Metadados

- **ID:** `UI-PRT-019`
- **Status:** implementado
- **Página:** `/portfolios`
- **Funcionalidade:** resolução «Usar arquivo» em conflito de importação
- **Depende de:** pré-visualização com linha em `conflito`
- **Arquivo de teste:** `e2e/specs/portfolios/19-importar-conflito-usar-arquivo.spec.ts`

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db`
- **Base de carteiras:** `backend/data/test/portfolios.db`
- **Lookup:** yfinance
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Usar dados do arquivo no conflito

**Como** investidor  
**Quero** escolher a versão do arquivo em caso de conflito  
**Para** sobrescrever valores locais na importação

### Passo a passo

1. A pré-visualização marca um ativo como `conflito` (dados diferentes dos locais).
2. Na linha em conflito, escolho resolução «Usar arquivo» (ou equivalente).
3. Confirmo a importação.
4. Após importar, os valores na carteira destino correspondem ao JSON.
5. Não permanece estado inconsistente na UI.

## Notas para automação (fase 2)

- Pode exigir alterar posição local antes de reimportar o mesmo JSON.

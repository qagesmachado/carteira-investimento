# Importar carteira como nova

## Metadados

- **ID:** `UI-PRT-011`
- **Status:** implementado
- **Página:** `/portfolios`
- **Funcionalidade:** importar JSON como nova carteira
- **Depende de:** `UI-PRT-010` ou fixture `.carteira.json`
- **Arquivo de teste:** `e2e/specs/portfolios/11-importar-carteira-json.spec.ts`

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db`
- **Base de carteiras:** `backend/data/test/portfolios.db`
- **Lookup:** yfinance
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Importar como nova carteira

**Como** investidor  
**Quero** importar um arquivo de carteira  
**Para** duplicar a estrutura na base de teste

### Passo a passo

1. Tenho arquivo `.carteira.json` exportado de `UI-PRT-010` (ou fixture).
2. Os ativos do JSON existem em `carteira.db` de teste.
3. Abro o fluxo de importação em `/portfolios`.
4. Seleciono o arquivo JSON.
5. Aguardo pré-visualização com status por ativo (`ok` / `novo` / `conflito`).
6. Escolho criar como nova carteira e confirmo a importação.
7. A nova carteira aparece na lista.
8. Posso defini-la como ativa.
9. As posições importadas aparecem na tabela e persistem em `portfolios.db`.

## Notas para automação (fase 2)

- `setInputFiles` no input de upload.

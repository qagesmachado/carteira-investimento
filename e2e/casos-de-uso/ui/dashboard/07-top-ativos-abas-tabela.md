# Top ativos — abas e tabela

## Metadados

- **ID:** `UI-DASH-007`
- **Status:** aprovado
- **Página:** `/dashboard`
- **Funcionalidade:** ranking de ativos com abas e colunas da tabela
- **Depende de:** seed consolidada com posições
- **Arquivo de teste:** `e2e/specs/dashboard/07-top-ativos-abas-tabela.spec.ts`
- **Referência:** [dashboard-inicial.md](../../../docs/produto/desenvolvido/dashboard-inicial.md)

## Ambiente de teste

- **Lookup:** `yfinance` (opcional — posições seedadas bastam para ranking)
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Abas e colunas do ranking

**Como** investidor  
**Quero** ver top ativos por diferentes critérios em tabela  
**Para** comparar desempenho e exposição

### Passo a passo

1. Existe carteira ativa com posições (seed API).
2. Abro `/dashboard`.
3. Painel «Top ativos» exibe abas: Maior lucro (%), Maior posição, Proventos (total), Retorno bruto.
4. Tabela exibe colunas Ticker, Nome do ativo, Tipo e métrica.
5. Ticker aparece sem sufixo `.SA` (ex.: BBSE3).
6. Na aba «Maior lucro (%)», a métrica inclui percentual e valor nominal entre parênteses.
7. Tabela exibe colunas #, Evolução 12M e barras proporcionais.
8. Link «Ver todos os ativos →» aponta para `/portfolios/consolidada`.

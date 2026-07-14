# Ordenação de colunas na tabela

## Metadados

- **ID:** `UI-CNS-008`
- **Status:** implementado
- **Página:** `/consolidada`
- **Funcionalidade:** ordenar colunas asc/desc
- **Depende de:** múltiplas linhas na tabela
- **Arquivo de teste:** `e2e/specs/consolidada/08-tabela-ordenacao-colunas.spec.ts`

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db`
- **Base de carteiras:** `backend/data/test/portfolios.db`
- **Lookup:** yfinance (ou «não se aplica» nos casos sem rede)
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Ordenar por coluna Ativo

**Como** investidor  
**Quero** ordenar a tabela por ticker  
**Para** localizar ativos em ordem alfabética

### Passo a passo

1. Tabela consolidada com pelo menos 3 linhas visíveis.
2. Clico no cabeçalho da coluna «Ativo».
3. Linhas aparecem em ordem crescente de ticker (indicador ▲ ou equivalente).
4. Clico novamente no cabeçalho.
5. Linhas aparecem em ordem decrescente (indicador ▼).
6. A ordem na UI corresponde ao critério escolhido.

## Notas para automação (fase 2)

- Testar também coluna numérica (Valor) se clicável.

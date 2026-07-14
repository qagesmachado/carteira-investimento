# Cartões de resumo BRL, USD e consolidado

## Metadados

- **ID:** `UI-CNS-007`
- **Status:** implementado
- **Página:** `/consolidada`
- **Funcionalidade:** cartões de patrimônio e total em reais
- **Depende de:** `UI-CNS-003`, `UI-PRT-012`
- **Arquivo de teste:** `e2e/specs/consolidada/07-cartoes-resumo-brl-usd-consolidado.spec.ts`

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db`
- **Base de carteiras:** `backend/data/test/portfolios.db`
- **Lookup:** yfinance (ou «não se aplica» nos casos sem rede)
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Exibir cartões com patrimônio filtrado

**Como** investidor  
**Quero** ver resumo por moeda e total em BRL  
**Para** entender o patrimônio consolidado

### Passo a passo

1. Carteira ativa com posições BRL (`BBSE3`) e USD (`VOO`).
2. Taxa USD/BRL carregada na página.
3. Nenhum filtro restritivo aplicado (linhas visíveis na tabela).
4. Visualizo a área de cartões acima da tabela.
5. Vejo cartões de patrimônio BRL, USD e consolidado total em **reais**.
6. O consolidado considera conversão das posições USD pela taxa exibida.

## Notas para automação (fase 2)

- Após filtro sem linhas (`UI-CNS-011`), cartões não devem aparecer.

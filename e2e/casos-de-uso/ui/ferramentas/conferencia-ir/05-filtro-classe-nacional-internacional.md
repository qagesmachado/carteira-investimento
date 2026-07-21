# Filtro e coluna Classe (nacional/internacional)

## Metadados

- **ID:** `UI-IR-005`
- **Status:** implementado
- **Página:** `/conferencia-ir`
- **Funcionalidade:** coluna Classe e filtro nacional/internacional nas abas Detalhado, Resumo e Posições; ordenação por Classe
- **Depende de:** base de teste com provento nacional e internacional no mesmo ano
- **Arquivo de teste:** `e2e/specs/conferencia-ir/05-filtro-classe-nacional-internacional.spec.ts`
- **Referência:** [conferencia-ir-anual.md](../../../../../docs/produto/desenvolvido/conferencia-ir-anual.md)

## Ambiente de teste

- **Base de dados:** `backend/data/test/carteira-{N}.db`
- **Lookup:** não se aplica
- **URLs:** frontend worker · API worker (ver `e2e/worker-env.js`)

## Cenário — filtrar e ver classe internacional

**Como** investidor  
**Quero** ver e filtrar por classe (nacional/internacional) e ordenar as colunas  
**Para** separar proventos e posições do exterior na conferência do IR

### Passo a passo

1. Semear carteira com provento nacional (ex. BBSE3) e internacional (ex. VOO) em 2024; posição de ambos; congelar snapshot.
2. Abrir `/conferencia-ir` e selecionar 2024.
3. Na aba Detalhado, verificar coluna Classe com Nacional e Internacional; filtrar por Internacional e ver só VOO; ordenar por Classe.
4. Na aba Resumo, filtrar por Internacional e ver só VOO com coluna Classe.
5. Na aba Posições, filtrar por Internacional e ver só VOO com coluna Classe.

## Notas para automação

- Usar `data-testid` `ir-filter-market`, `ir-table-detalhado`, `ir-table-resumo`, `ir-table-posicoes`.
- Seed sem lookup yfinance (criar ativos via API com `market` explícito).

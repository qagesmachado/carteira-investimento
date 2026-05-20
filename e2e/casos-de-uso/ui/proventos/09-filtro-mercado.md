# Filtrar por mercado

## Metadados

- **ID:** `UI-PRV-009`
- **Status:** aprovado
- **Pagina:** `/proventos`
- **Funcionalidade:** filtro nacional/internacional
- **Depende de:** UI-PRV-002 e UI-PRV-003
- **Arquivo de teste:** `e2e/specs/proventos/09-filtro-mercado.spec.ts` 
- **Referencia:** [cadastro-proventos.md](../../../docs/produto/desenvolvido/cadastro-proventos.md)

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db`
- **Base de carteiras:** nao usada
- **Lookup:** nao se aplica
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenario — Filtrar por mercado

**Como** investidor  
**Quero** filtro nacional/internacional  
**Para** controlar proventos recebidos na aplicacao

### Passo a passo

1. Filtro mercado Nacional.
2. Somente ativos nacionais aparecem.
3. Filtro Internacional mostra VOO ou equivalente.

## Notas para automacao 

- Seed via API: criar ativos e proventos no `beforeEach` (`seedProventos*`).
- Page object futuro: `e2e/helpers/proventosPage.ts`.

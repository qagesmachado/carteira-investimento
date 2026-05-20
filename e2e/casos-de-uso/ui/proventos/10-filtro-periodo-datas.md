# Filtrar por periodo

## Metadados

- **ID:** `UI-PRV-010`
- **Status:** aprovado
- **Pagina:** `/proventos`
- **Funcionalidade:** filtro data inicial/final
- **Depende de:** proventos em meses distintos
- **Arquivo de teste:** `e2e/specs/proventos/10-filtro-periodo-datas.spec.ts` 
- **Referencia:** [cadastro-proventos.md](../../../docs/produto/desenvolvido/cadastro-proventos.md)

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db`
- **Base de carteiras:** nao usada
- **Lookup:** nao se aplica
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenario — Filtrar por periodo

**Como** investidor  
**Quero** filtro data inicial/final  
**Para** controlar proventos recebidos na aplicacao

### Passo a passo

1. Defino data inicial e final.
2. A tabela lista apenas lancamentos no intervalo.

## Notas para automacao 

- Seed via API: criar ativos e proventos no `beforeEach` (`seedProventos*`).
- Page object futuro: `e2e/helpers/proventosPage.ts`.

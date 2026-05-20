# Listagem vazia apos filtro

## Metadados

- **ID:** `UI-PRV-012`
- **Status:** aprovado
- **Pagina:** `/proventos`
- **Funcionalidade:** estado vazio com filtros
- **Depende de:** UI-PRV-007
- **Arquivo de teste:** `e2e/specs/proventos/12-listagem-vazia-apos-filtro.spec.ts` 
- **Referencia:** [cadastro-proventos.md](../../../docs/produto/desenvolvido/cadastro-proventos.md)

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db`
- **Base de carteiras:** nao usada
- **Lookup:** nao se aplica
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenario — Listagem vazia apos filtro

**Como** investidor  
**Quero** estado vazio com filtros  
**Para** controlar proventos recebidos na aplicacao

### Passo a passo

1. Aplico filtro que nao corresponde a nenhum lancamento.
2. Mensagem informa que nenhum provento corresponde aos filtros.

## Notas para automacao 

- Seed via API: criar ativos e proventos no `beforeEach` (`seedProventos*`).
- Page object futuro: `e2e/helpers/proventosPage.ts`.

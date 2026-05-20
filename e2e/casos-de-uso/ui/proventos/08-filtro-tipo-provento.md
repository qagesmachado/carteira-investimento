# Filtrar por tipo de provento

## Metadados

- **ID:** `UI-PRV-008`
- **Status:** aprovado
- **Pagina:** `/proventos`
- **Funcionalidade:** filtro select tipo
- **Depende de:** proventos com tipos diferentes
- **Arquivo de teste:** `e2e/specs/proventos/08-filtro-tipo-provento.spec.ts` 
- **Referencia:** [cadastro-proventos.md](../../../docs/produto/desenvolvido/cadastro-proventos.md)

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db`
- **Base de carteiras:** nao usada
- **Lookup:** nao se aplica
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenario — Filtrar por tipo de provento

**Como** investidor  
**Quero** filtro select tipo  
**Para** controlar proventos recebidos na aplicacao

### Passo a passo

1. Seleciono tipo JCP no filtro.
2. Somente lancamentos JCP aparecem.
3. Rotulo exibido em portugues.

## Notas para automacao 

- Seed via API: criar ativos e proventos no `beforeEach` (`seedProventos*`).
- Page object futuro: `e2e/helpers/proventosPage.ts`.

# Filtrar por ticker ou nome

## Metadados

- **ID:** `UI-PRV-007`
- **Status:** aprovado
- **Pagina:** `/proventos`
- **Funcionalidade:** busca textual na tabela
- **Depende de:** >=2 proventos em ativos distintos
- **Arquivo de teste:** `e2e/specs/proventos/07-filtro-texto-ticker.spec.ts` 
- **Referencia:** [cadastro-proventos.md](../../../docs/produto/desenvolvido/cadastro-proventos.md)

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db`
- **Base de carteiras:** nao usada
- **Lookup:** nao se aplica
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenario — Filtrar por ticker ou nome

**Como** investidor  
**Quero** busca textual na tabela  
**Para** controlar proventos recebidos na aplicacao

### Passo a passo

1. Digito parte do ticker no campo de busca.
2. Apenas linhas correspondentes permanecem.
3. O contador de resultados atualiza.

## Notas para automacao 

- Seed via API: criar ativos e proventos no `beforeEach` (`seedProventos*`).
- Page object futuro: `e2e/helpers/proventosPage.ts`.

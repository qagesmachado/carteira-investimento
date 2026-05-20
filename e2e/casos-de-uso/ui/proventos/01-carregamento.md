# Carregamento da pagina de proventos

## Metadados

- **ID:** `UI-PRV-001`
- **Status:** aprovado
- **Pagina:** `/proventos`
- **Funcionalidade:** carregamento inicial
- **Depende de:** base de teste sem proventos
- **Arquivo de teste:** `e2e/specs/proventos/01-carregamento.spec.ts` 
- **Referencia:** [cadastro-proventos.md](../../../docs/produto/desenvolvido/cadastro-proventos.md)

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db`
- **Base de carteiras:** nao usada
- **Lookup:** nao se aplica
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenario — Carregamento da pagina de proventos

**Como** investidor  
**Quero** carregamento inicial  
**Para** controlar proventos recebidos na aplicacao

### Passo a passo

1. Abro `/proventos`.
2. A pagina exibe titulo e formulario de novo provento.
3. A tabela de lancamentos esta vazia com mensagem adequada.
4. Nao ha erros de API visiveis.

## Notas para automacao 

- Seed via API: criar ativos e proventos no `beforeEach` (`seedProventos*`).
- Page object futuro: `e2e/helpers/proventosPage.ts`.

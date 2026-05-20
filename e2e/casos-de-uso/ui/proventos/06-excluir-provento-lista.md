# Excluir provento na lista

## Metadados

- **ID:** `UI-PRV-006`
- **Status:** aprovado
- **Pagina:** `/proventos`
- **Funcionalidade:** remocao de lancamento
- **Depende de:** UI-PRV-002
- **Arquivo de teste:** `e2e/specs/proventos/06-excluir-provento-lista.spec.ts` 
- **Referencia:** [cadastro-proventos.md](../../../docs/produto/desenvolvido/cadastro-proventos.md)

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db`
- **Base de carteiras:** nao usada
- **Lookup:** nao se aplica
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenario — Excluir provento na lista

**Como** investidor  
**Quero** remocao de lancamento  
**Para** controlar proventos recebidos na aplicacao

### Passo a passo

1. Clico Remover e confirmo.
2. A linha desaparece da tabela.
3. Recarregar a pagina mantem a exclusao.

## Notas para automacao 

- Seed via API: criar ativos e proventos no `beforeEach` (`seedProventos*`).
- Page object futuro: `e2e/helpers/proventosPage.ts`.

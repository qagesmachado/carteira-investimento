# Editar provento na lista

## Metadados

- **ID:** `UI-PRV-005`
- **Status:** aprovado
- **Pagina:** `/proventos`
- **Funcionalidade:** edicao de lancamento
- **Depende de:** UI-PRV-002
- **Arquivo de teste:** `e2e/specs/proventos/05-editar-provento-lista.spec.ts` 
- **Referencia:** [cadastro-proventos.md](../../../docs/produto/desenvolvido/cadastro-proventos.md)

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db`
- **Base de carteiras:** nao usada
- **Lookup:** nao se aplica
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenario — Editar provento na lista

**Como** investidor  
**Quero** edicao de lancamento  
**Para** controlar proventos recebidos na aplicacao

### Passo a passo

1. Existe provento cadastrado.
2. Clico Editar na linha.
3. Altero valor ou data e salvo.
4. A tabela reflete os novos dados.

## Notas para automacao 

- Seed via API: criar ativos e proventos no `beforeEach` (`seedProventos*`).
- Page object futuro: `e2e/helpers/proventosPage.ts`.

# Cadastrar provento internacional

## Metadados

- **ID:** `UI-PRV-003`
- **Status:** aprovado
- **Pagina:** `/proventos`
- **Funcionalidade:** cadastro em ativo USD
- **Depende de:** ativo VOO internacional
- **Arquivo de teste:** `e2e/specs/proventos/03-cadastrar-provento-internacional.spec.ts` 
- **Referencia:** [cadastro-proventos.md](../../../docs/produto/desenvolvido/cadastro-proventos.md)

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db`
- **Base de carteiras:** nao usada
- **Lookup:** nao se aplica
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenario — Cadastrar provento internacional

**Como** investidor  
**Quero** cadastro em ativo USD  
**Para** controlar proventos recebidos na aplicacao

### Passo a passo

1. Existe ativo `VOO` (internacional) na base.
2. Cadastro provento tipo Dividendo em USD.
3. A tabela exibe mercado Internacional.

## Notas para automacao 

- Seed via API: criar ativos e proventos no `beforeEach` (`seedProventos*`).
- Page object futuro: `e2e/helpers/proventosPage.ts`.

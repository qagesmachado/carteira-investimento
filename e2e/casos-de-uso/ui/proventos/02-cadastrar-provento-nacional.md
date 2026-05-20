# Cadastrar provento nacional

## Metadados

- **ID:** `UI-PRV-002`
- **Status:** aprovado
- **Pagina:** `/proventos`
- **Funcionalidade:** cadastro de dividendo em ativo BRL
- **Depende de:** ativo BBSE3 em carteira.db
- **Arquivo de teste:** `e2e/specs/proventos/02-cadastrar-provento-nacional.spec.ts` 
- **Referencia:** [cadastro-proventos.md](../../../docs/produto/desenvolvido/cadastro-proventos.md)

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db`
- **Base de carteiras:** nao usada
- **Lookup:** nao se aplica
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenario — Cadastrar provento nacional

**Como** investidor  
**Quero** cadastro de dividendo em ativo BRL  
**Para** controlar proventos recebidos na aplicacao

### Passo a passo

1. Existe ativo `BBSE3` na base de teste.
2. Em `/proventos`, seleciono ativo BBSE3.
3. Preencho tipo Dividendo, data e valor positivo em BRL.
4. Salvo o lancamento.
5. A linha aparece na tabela com ticker BBSE3 e tipo em portugues.

## Notas para automacao 

- Seed via API: criar ativos e proventos no `beforeEach` (`seedProventos*`).
- Page object futuro: `e2e/helpers/proventosPage.ts`.

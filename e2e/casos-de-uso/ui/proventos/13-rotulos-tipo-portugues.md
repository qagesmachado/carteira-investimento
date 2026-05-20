# Rotulos de tipo em portugues

## Metadados

- **ID:** `UI-PRV-013`
- **Status:** aprovado
- **Pagina:** `/proventos`
- **Funcionalidade:** i18n da coluna tipo
- **Depende de:** UI-PRV-002
- **Arquivo de teste:** `e2e/specs/proventos/13-rotulos-tipo-portugues.spec.ts` 
- **Referencia:** [cadastro-proventos.md](../../../docs/produto/desenvolvido/cadastro-proventos.md)

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db`
- **Base de carteiras:** nao usada
- **Lookup:** nao se aplica
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenario — Rotulos de tipo em portugues

**Como** investidor  
**Quero** i18n da coluna tipo  
**Para** controlar proventos recebidos na aplicacao

### Passo a passo

1. Cadastro ou listo provento tipo dividend.
2. A coluna Tipo mostra Dividendo, nao `dividend`.
3. Tipo JCP mostra JCP, nao `jcp` cru sem contexto.

## Notas para automacao 

- Seed via API: criar ativos e proventos no `beforeEach` (`seedProventos*`).
- Page object futuro: `e2e/helpers/proventosPage.ts`.

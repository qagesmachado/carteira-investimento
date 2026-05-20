# Ordenar colunas da tabela

## Metadados

- **ID:** `UI-PRV-011`
- **Status:** aprovado
- **Pagina:** `/proventos`
- **Funcionalidade:** ordenacao clicavel
- **Depende de:** >=3 lancamentos
- **Arquivo de teste:** `e2e/specs/proventos/11-ordenacao-colunas.spec.ts` 
- **Referencia:** [cadastro-proventos.md](../../../docs/produto/desenvolvido/cadastro-proventos.md)

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db`
- **Base de carteiras:** nao usada
- **Lookup:** nao se aplica
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenario — Ordenar colunas da tabela

**Como** investidor  
**Quero** ordenacao clicavel  
**Para** controlar proventos recebidos na aplicacao

### Passo a passo

1. Clico cabecalho Data para alternar ordem.
2. Clico cabecalho Valor e Ativo.
3. A ordem das linhas muda conforme esperado.

## Notas para automacao 

- Seed via API: criar ativos e proventos no `beforeEach` (`seedProventos*`).
- Page object futuro: `e2e/helpers/proventosPage.ts`.

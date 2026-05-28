# Filtro por carteira na listagem de proventos

## Metadados

- **ID:** `UI-PRV-016`
- **Status:** aprovado
- **Pagina:** `/proventos`
- **Funcionalidade:** filtro de carteira na tabela de proventos, com default na carteira ativa, coluna "Carteira" visivel
- **Depende de:** duas carteiras com proventos distintos
- **Arquivo de teste:** `e2e/specs/proventos/16-filtro-carteira-listagem.spec.ts`
- **Referencia:** [cadastro-proventos.md](../../../../docs/produto/desenvolvido/cadastro-proventos.md)

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db`
- **Base de carteiras:** `backend/data/test/portfolios.db` (carteiras `Carteira A` e `Carteira B`)
- **Lookup:** nao se aplica
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenario — Listagem filtra por carteira

**Como** investidor com mais de uma carteira  
**Quero** filtrar a tabela de proventos por carteira  
**Para** revisar lancamentos de cada carteira separadamente

### Passo a passo

1. Existem proventos cadastrados nas duas carteiras (R$ 50,00 em BBSE3 carteira A; R$ 12,00 em BBSE3 carteira B).
2. Acesso `/proventos` com `Carteira A` definida como ativa.
3. **Verifico:** tabela exibe apenas o lancamento de R$ 50,00 (carteira A) na coluna "Carteira" igual a "Carteira A".
4. Mudo o filtro "Carteira" para `Carteira B`.
5. **Verifico:** tabela passa a exibir apenas o lancamento de R$ 12,00 (carteira B).
6. Mudo o filtro para "Todas as carteiras".
7. **Verifico:** tabela mostra os dois lancamentos.

## Notas para automacao

- Seed via API: criar duas carteiras + dois proventos.
- Reusar helper `setActivePortfolio(portfolioId)`.

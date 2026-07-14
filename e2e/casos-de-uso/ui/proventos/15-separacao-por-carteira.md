# Separacao de proventos por carteira

## Metadados

- **ID:** `UI-PRV-015`
- **Status:** aprovado
- **Pagina:** `/proventos` e `/consolidada`
- **Funcionalidade:** vincular cada provento a uma carteira; visao consolidada e dashboard so somam proventos da carteira ativa
- **Depende de:** duas carteiras criadas (`Carteira A`, `Carteira B`) com posicoes no mesmo ticker BBSE3
- **Arquivo de teste:** `e2e/specs/proventos/15-separacao-por-carteira.spec.ts`
- **Referencia:** [cadastro-proventos.md](../../../../docs/produto/desenvolvido/cadastro-proventos.md)

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db`
- **Base de carteiras:** `backend/data/test/portfolios.db` (duas carteiras com mesmo ativo)
- **Lookup:** nao se aplica
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenario — Provento cadastrado em uma carteira nao aparece em outra

**Como** investidor com mais de uma carteira  
**Quero** que cada provento fique vinculado a uma carteira especifica  
**Para** que os totais por ativo na visao consolidada nao misturem proventos entre carteiras

### Passo a passo

1. Existem duas carteiras `Carteira A` (id `A`) e `Carteira B` (id `B`), ambas com posicao do ativo BBSE3.
2. Em `/proventos`, troco a carteira ativa para `Carteira A` e cadastro um provento de BBSE3 no valor de R$ 50,00.
3. Volto a `/proventos` e troco a carteira ativa para `Carteira B`; cadastro outro provento de BBSE3 no valor de R$ 12,00.
4. Em `/consolidada` com `Carteira A` ativa, expando os detalhes de BBSE3.
5. **Verifico:** o resumo de "Dividendos recebidos" mostra R$ 50,00 (1 lancamento) — apenas o provento da carteira A.
6. Troco a carteira ativa para `Carteira B` em `/consolidada` e expando BBSE3 novamente.
7. **Verifico:** o resumo de "Dividendos recebidos" mostra R$ 12,00 (1 lancamento) — apenas o provento da carteira B.

## Notas para automacao

- Seed via API: criar duas carteiras + posicoes do mesmo ativo + um provento por carteira (helpers em `e2e/specs/helpers/seedProventos.ts` ou novo `seedProventosPorCarteira`).
- Selecionar a carteira ativa via `PUT /portfolios/active` antes de navegar.

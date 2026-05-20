# Proventos no detalhe da posição

## Metadados

- **ID:** `UI-CNS-017`
- **Status:** rascunho
- **Página:** `/portfolios/consolidada`
- **Funcionalidade:** total de proventos do ativo no painel Detalhes
- **Depende de:** `UI-CNS-016`, proventos cadastrados em `/proventos`
- **Referência:** `dividendSummary.ts`, `PositionDetailPanel.svelte`

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db`
- **Proventos:** lançamentos em `/dividend-payments` vinculados ao ativo da linha
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Total de dividendos recebidos

**Como** investidor  
**Quero** ver o total de proventos do ativo no painel expandido  
**Para** acompanhar renda passiva sem sair da visão consolidada

### Passo a passo

1. Existe provento cadastrado para o ativo `CAML3` (ou ticker equivalente no seed).
2. Abro `/portfolios/consolidada` e expando **Detalhes** da linha desse ativo.
3. Na seção **Proventos**, o rótulo «Dividendos recebidos» exibe valor formatado (ex.: `R$ 150,50`) em vez de «Em breve».
4. Se houver mais de um lançamento, o texto inclui a contagem (ex.: `(2 lançamentos)`).
5. Para ativo sem proventos, exibe «Nenhum provento cadastrado».

## Notas para automação (fase 2)

- Seed via API: criar `POST /dividend-payments` antes do teste.
- Expandir linha com botão «Detalhes»; assert no `#position-detail-{id}`.

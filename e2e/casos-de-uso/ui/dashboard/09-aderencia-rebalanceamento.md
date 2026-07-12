# Aderência ao rebalanceamento

## Metadados

- **ID:** `UI-DASH-009`
- **Status:** aprovado
- **Página:** `/dashboard`
- **Funcionalidade:** card de aderência com anel percentual e até 3 classes abaixo da meta
- **Depende de:** seed consolidada com metas de rebalanceamento configuradas
- **Arquivo de teste:** `e2e/specs/dashboard/09-aderencia-rebalanceamento.spec.ts`
- **Referência:** [dashboard-inicial.md](../../../docs/produto/desenvolvido/dashboard-inicial.md)

## Ambiente de teste

- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Card de aderência

**Como** investidor  
**Quero** ver o quanto minha carteira está aderente às metas de rebalanceamento  
**Para** saber se preciso rebalancear

### Passo a passo

1. Existe carteira ativa com posições e metas % configuradas (seed).
2. Abro `/dashboard`.
3. Na faixa de destaques, o card «Aderência ao rebalanceamento» exibe percentual no anel.
4. Quando houver classes abaixo da meta, o card lista até 3 itens alinhados em tabela (classe, gap em `%`, «abaixo da meta»).
5. O botão «Conferir rebalanceamento» linka para `/rebalanceamento` ou configuração de metas (o painel em si não redireciona).

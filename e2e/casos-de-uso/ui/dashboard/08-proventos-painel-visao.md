# Proventos no dashboard — Gráfico do ano corrente

## Metadados

- **ID:** `UI-DASH-008`
- **Status:** aprovado
- **Página:** `/dashboard`
- **Funcionalidade:** gráfico jan–dez do ano corrente com eixo Y, grade tracejada, tooltip e comparativo com ano anterior
- **Depende de:** seed consolidada com proventos em anos anteriores e corrente
- **Arquivo de teste:** `e2e/specs/dashboard/08-proventos-painel-visao.spec.ts`
- **Referência:** [dashboard-inicial.md](../../../docs/produto/desenvolvido/dashboard-inicial.md)

## Ambiente de teste

- **Base de dados:** `backend/data/test/carteira.db`
- **Lookup:** `yfinance`
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Barras do ano corrente

**Como** investidor  
**Quero** ver proventos mês a mês de janeiro a dezembro do ano atual  
**Para** comparar com o ano anterior e analisar a evolução anual

### Passo a passo

1. Existe carteira ativa com proventos cadastrados (seed).
2. Abro `/dashboard`.
3. Na seção «Proventos no ano {atual}», as barras de Jan a Dez aparecem com eixo Y e linhas tracejadas.
4. Ao passar o mouse, o valor do mês é exibido.
5. Embaixo aparecem o total do ano até o mês corrente, o total do **mesmo período** no ano anterior e a variação percentual.
6. O botão «Ver proventos» linka para `/proventos`.

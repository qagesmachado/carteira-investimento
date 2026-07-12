# Destaques — classe em destaque e proventos recentes

## Metadados

- **ID:** `UI-DASH-010`
- **Status:** aprovado
- **Página:** `/dashboard`
- **Funcionalidade:** top 3 classes por rendimento bruto (%) e até 3 proventos recentes
- **Depende de:** seed consolidada com posições e proventos
- **Arquivo de teste:** `e2e/specs/dashboard/10-destaques-classe-provento.spec.ts`
- **Referência:** [dashboard-inicial.md](../../../docs/produto/desenvolvido/dashboard-inicial.md)

## Ambiente de teste

- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Classe e proventos recentes

**Como** investidor  
**Quero** ver rapidamente quais classes mais renderam e os últimos proventos recebidos  
**Para** ter contexto imediato da carteira

### Passo a passo

1. Existe carteira ativa com posições e proventos (seed).
2. Abro `/dashboard`.
3. O card «Classe em destaque» lista até 3 classes com maior rendimento bruto (%), ícone [ChartPie](https://lucide.dev/icons/chart-pie) em cores ouro/prata/bronze e link por linha para consolidada filtrada.
4. O card «Proventos recentes» lista até 3 lançamentos (ticker, valor, data) com ícone [HandCoins](https://lucide.dev/icons/hand-coins).
5. O botão «Ver proventos» fica no painel «Proventos no ano {atual}» abaixo.

# Cards de resumo com carteira seed

## Metadados

- **ID:** `UI-DASH-002`
- **Status:** aprovado
- **Página:** `/dashboard`
- **Funcionalidade:** cards patrimônio e alocação
- **Depende de:** seed consolidada mínima (BBSE3 + posição)
- **Referência:** [dashboard-inicial.md](../../../docs/produto/desenvolvido/dashboard-inicial.md)

## Cenário — Indicadores visíveis

**Como** investidor  
**Quero** ver patrimônio e alocação na carteira ativa  
**Para** acompanhar a carteira sem abrir a consolidada

### Passo a passo

1. Existe carteira ativa com posição em BBSE3 (seed API).
2. Abro `/dashboard`.
3. Cards exibem patrimônio total, valor investido e posições ativas.
4. Seção «Alocação por classe» lista pelo menos uma classe com barra.
5. Painel «Top ativos» exibe abas de ranking (ex.: «Maior lucro (%)»).

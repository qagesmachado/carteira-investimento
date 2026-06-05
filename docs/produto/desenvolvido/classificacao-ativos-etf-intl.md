# Classificação de ativos — ETF internacional

## Objetivo

Definir a alocação percentual desejada por ETF internacional e referência externa de análise — equivalente à aba `Análise etf` da planilha.

## Escopo MVP

- Perfil **`etf_intl`**: ativos com `display_class = international` (ETF + mercado internacional).
- Página **`/analise/internacional`**: tabela com % desejado editável inline, valores calculados e link externo.
- API **`/analysis/profiles/etf-intl/config`**, **`/analysis/assets?profile=etf_intl`**, **`PUT /analysis/profiles/etf-intl/allocations`** (salvar em lote).
- **Sem** métricas fundamental/diagrama, coluna Soma ou aba Configuração.
- Integração com **`/rebalanceamento`**: aba ETF internacional passa a exibir % desejada, valor desejável e faltando por ativo.

## Fora do escopo

- Scores 1–5, DIAGRAMA ou viabilidade para internacional.
- Sugestão automática de % (Tier 4).
- Ativos internacionais sem posição na carteira ativa.

## Campos por ativo

| Campo | Origem | Descrição |
|-------|--------|-----------|
| Ticker / Nome / Tipo | Cadastro | Leitura |
| % atual | Calculado | Posição do ativo ÷ total do grupo internacional na carteira |
| % desejado | Manual | Percentual dentro do grupo internacional (soma 100%) |
| Valor desejável (R$) | Calculado | Patrimônio × meta classe `international` × % desejado / 100 |
| Valor desejável (US$) | Calculado | Valor em R$ ÷ câmbio USD/BRL |
| Link de análise | Manual | URL externa opcional |

## Validação

- Ao salvar alocação (`PUT /analysis/profiles/etf-intl/allocations`), a soma dos `target_percent` enviados deve ser **100%** (tolerância 0,01 p.p.).
- Resposta **422** se a soma for inválida ou se algum `asset_id` não for ETF internacional.

## Fórmulas (rebalanceamento)

Dentro da classe **Internacional** (`international`):

```
pct_no_grupo = target_percent manual (soma 100% entre ETFs com alocação)
pct_carteira = pct_no_grupo × meta_international / 100
valor_desejável = patrimônio × pct_carteira / 100
faltando = max(0, valor_desejável − valor_atual)
```

## API

| Método | Rota | Uso |
|--------|------|-----|
| GET | `/analysis/profiles/etf-intl/config` | Critérios (`target_percent`, `analysis_link`) |
| GET | `/analysis/assets?profile=etf_intl` | ETFs elegíveis + refs persistidas |
| PUT | `/analysis/profiles/etf-intl/allocations` | Salvar alocação em lote |

Corpo do bulk save:

```json
{
  "allocations": [
    { "asset_id": 1, "target_percent": 60, "analysis_link": "https://example.com/voo" },
    { "asset_id": 2, "target_percent": 40, "analysis_link": null }
  ]
}
```

## Integração rebalance

| Classe rebalance | Perfil análise | Onde definir % |
| ---------------- | -------------- | --------------- |
| Internacional | `etf_intl` | `/analise/internacional` |

## Referências

- [abas.md — Análise etf](../../planilha/abas.md)
- [rebalanceamento.md](rebalanceamento.md)
- Casos E2E: [e2e/casos-de-uso/ui/analise/internacional/](../../../e2e/casos-de-uso/ui/analise/internacional/README.md)

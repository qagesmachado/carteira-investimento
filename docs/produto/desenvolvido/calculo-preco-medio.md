# Cálculo de preço médio

## Objetivo

Calculadora em **Ferramentas** para obter **preço médio ponderado** ao combinar dois lotes do **mesmo ativo de mercado**, sem alterar posições na carteira.

## Fórmula

```
quantidadeTotal = q1 + q2
valorInvestido  = q1 × p1 + q2 × p2
precoMedio      = valorInvestido / quantidadeTotal
```

## Escopo MVP

- Rota **`/ferramentas/calculo-preco-medio`** (menu Ferramentas → Cálculo de preço médio).
- **Modo manual:** informar quantidade e preço médio de Lote 1 e Lote 2 (mesmo ativo; seletor de ativo para contexto e moeda).
- **Modo carteira:** selecionar carteira e posição de mercado existente → pré-preenche Lote 1; usuário informa Lote 2.
- Resultado reativo: quantidade total, preço médio e valor investido total (moeda do ativo).
- Posições RF/previdência **excluídas** do pré-preenchimento.

## Fora de escopo

- Persistir resultado na posição da carteira.
- Mais de dois lotes.
- Conversão automática BRL↔USD entre lotes.
- Backend / API dedicada.

## Rotas e componentes

| Rota | Componentes |
| ---- | ----------- |
| `/ferramentas/calculo-preco-medio` | `AveragePriceCalculator`, `ManualLotsForm`, `PortfolioLotForm`, `AveragePriceResult` |

Lógica: `computeWeightedAveragePrice.ts`, `filterMarketPositions.ts`.

## Casos de uso E2E

- `UI-FERR-008` — modo manual
- `UI-FERR-009` — pré-preenchimento com posição da carteira

Ver `e2e/casos-de-uso/ui/ferramentas/calculo-preco-medio/`.

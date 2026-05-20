# Classificação de ativos — Ações e ETF nacional (RV)

## Objetivo

Avaliar ações e ETFs brasileiros de renda variável com critérios fundamentais e questionário DIAGRAMA AÇÕES, calcular viabilidade e pontuação — equivalente às abas `Análise de açõesetf br` e `DIAGRAMA AÇÕES` da planilha.

## Escopo MVP

- Perfil **`stock_br`**: ativos com `display_class = stocks` (ações + ETF RV nacional).
- Páginas **`/analise/acoes-br`** (listagem + classificação) e **`/analise/configuracao`** (pesos, faixas, textos).
- API **`/analysis/profiles/stock-br/config`**, **`/analysis/assets`**, scores por ativo.
- Motor configurável: pesos e regras de viabilidade **editáveis na UI** (seed = planilha).
- Atalho **Classificar** em `/portfolios` (somente `display_class = stocks`).

## Fora do escopo (fases posteriores)

- FIIs + DIAGRAMA FIIS (`/analise/fiis`).
- ETF internacional (% desejado, link).
- Renda fixa, previdência, crypto.
- % desejado, preço teto, rebalanceamento.

## Critérios fundamentais (scores 1–5)

| Critério | 5 | 3 | 2 | 1 |
|----------|---|---|---|---|
| **Lucros** | Viável — 100% dos anos nos últimos 10 | Requer atenção — >80% ou IPO 5–9 anos com 100% | Bomba — IPO &lt;5 anos ou nenhum critério anterior | Sem dados |
| **Dívida Líq/EBITDA** | Viável — até 2 nos últimos 5 anos | Requer atenção — até 3 | Bomba — &gt;3 ou IPO &lt;5 anos | Sem dados |
| **Tag along** | 100% | 80% | &lt;80% | Sem dados |
| **Segmento** | Perene | Intermediário | Instável | Sem dados |

## DIAGRAMA AÇÕES

Questionário qualitativo (ROE, crescimento, dividendos, governança, endividamento, etc.) — critérios seedados editáveis em configuração.

## Viabilidade (default seed)

- Bloco fundamental: método **`min`** (pior critério manda).
- Faixas default: 5→Viável, 3→Atenção, 2→Bomba, 1→Sem dados.
- Usuário altera pesos, método e faixas em `/analise/configuracao`.

## API

| Método | Rota | Uso |
|--------|------|-----|
| GET | `/analysis/profiles/stock-br/config` | Critérios + regras |
| PUT | `/analysis/profiles/stock-br/config` | Salvar config |
| POST | `/analysis/profiles/stock-br/config/reset` | Restaurar seed planilha |
| GET | `/analysis/assets?profile=stock_br` | Ativos elegíveis + scores + viabilidade |
| GET | `/analysis/assets/{id}` | Ficha |
| PUT | `/analysis/assets/{id}/scores` | Salvar scores |

## Referências

- [abas.md — Análise de açõesetf br](../../planilha/abas.md)
- [abas.md — DIAGRAMA AÇÕES](../../planilha/abas.md)
- Casos E2E: [e2e/casos-de-uso/ui/analise/](../../../e2e/casos-de-uso/ui/analise/README.md)

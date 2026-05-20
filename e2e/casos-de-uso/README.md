# Casos de uso — testes de integração (Playwright)

Especificações em Markdown **antes** de implementar os arquivos `.spec.ts` em `e2e/api/` e `e2e/specs/`.

Formato padrão: **um cenário por arquivo** — BDD (**Como / Quero / Para**) no início do cenário; **Passo a passo** numerado (fluxo contínuo, sem blocos Dado/Quando/Então). Ver [`_template.md`](_template.md) e [`dependencias.md`](dependencias.md).

## Status

| Status | Significado |
| ------ | ----------- |
| `rascunho` | Em elaboração; não implementar teste ainda |
| `aprovado` | Pronto para virar spec Playwright (fase 2) |
| `implementado` | Spec criado e passando no CI |

## Fluxo

1. Copiar [`_template.md`](_template.md) para `api/` ou `ui/<página>/`.
2. Preencher metadados, ambiente de teste e cenários BDD.
3. Marcar `aprovado` após revisão.
4. Implementar o teste referenciado em **Arquivo de teste (fase 2)**.
5. Marcar `implementado`.

## Páginas UI (ordem 1 → 2 → 3)

| # | Rota | Pasta de casos | Casos (`.md`) |
| - | ---- | -------------- | ------------- |
| 1 | `/assets` | [`ui/assets/`](ui/assets/README.md) | 18 |
| 2 | `/portfolios` | [`ui/portfolios/`](ui/portfolios/README.md) | 23 |
| 3 | `/portfolios/consolidada` | [`ui/consolidada/`](ui/consolidada/README.md) | 16 |

**Total UI documentado:** 57 arquivos de caso + 3 READMEs de índice.

Dependências e bases de teste: [`dependencias.md`](dependencias.md).

**Estratégia E2E UI (cenário real):** [`estrategia-e2e-ui.md`](estrategia-e2e-ui.md)

| Comando | Projeto | Pastas de specs |
| ------- | ------- | --------------- |
| `npm run test:ui` | `ui` | `e2e/specs/assets/`, `e2e/specs/portfolios/`, `e2e/specs/consolidada/` |

Lookup: **yfinance** (rede). Ver [`../README.md`](../README.md) para execução.

## Pastas

- [`api/`](api/) — contrato HTTP (`request`, sem browser)
- [`ui/assets/`](ui/assets/) — cadastro de ativos
- [`ui/portfolios/`](ui/portfolios/) — carteiras e posições
- [`ui/consolidada/`](ui/consolidada/) — visão consolidada
- [`ui/health-home.md`](ui/health-home.md) — smoke home/health (isolado)

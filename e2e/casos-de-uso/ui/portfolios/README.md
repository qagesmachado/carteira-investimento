# Casos E2E — Carteiras e posições (`/portfolios`)

**Rota:** `http://127.0.0.1:5174/portfolios`  
**Prefixo de ID:** `UI-PRT-`

**Formato:** um cenário por arquivo — BDD no início; **Passo a passo** numerado.

Cada spec em `e2e/specs/portfolios/` é **autocontido** (`beforeEach` com seed via API). Não é necessário executar a suíte `assets` na mesma run.

| ID | Arquivo | Spec Playwright |
| -- | ------- | --------------- |
| `UI-PRT-001` | [01-carregamento-carteiras.md](01-carregamento-carteiras.md) | `e2e/specs/portfolios/01-carregamento-carteiras.spec.ts` |
| `UI-PRT-002` | [02-criar-carteira.md](02-criar-carteira.md) | `e2e/specs/portfolios/02-criar-carteira.spec.ts` |
| `UI-PRT-013` | [13-criar-carteira-nome-obrigatorio.md](13-criar-carteira-nome-obrigatorio.md) | `e2e/specs/portfolios/13-criar-carteira-nome-obrigatorio.spec.ts` |
| `UI-PRT-003` | [03-renomear-carteira.md](03-renomear-carteira.md) | `e2e/specs/portfolios/03-renomear-carteira.spec.ts` |
| `UI-PRT-014` | [14-excluir-carteira.md](14-excluir-carteira.md) | `e2e/specs/portfolios/14-excluir-carteira.spec.ts` |
| `UI-PRT-004` | [04-trocar-carteira-ativa.md](04-trocar-carteira-ativa.md) | `e2e/specs/portfolios/04-trocar-carteira-ativa.spec.ts` |
| `UI-PRT-005` | [05-adicionar-posicao-mercado-brl.md](05-adicionar-posicao-mercado-brl.md) | `e2e/specs/portfolios/05-adicionar-posicao-mercado-brl.spec.ts` |
| `UI-PRT-015` | [15-adicionar-posicao-voo-usd.md](15-adicionar-posicao-voo-usd.md) | `e2e/specs/portfolios/15-adicionar-posicao-voo-usd.spec.ts` |
| `UI-PRT-016` | [16-posicao-duplicada.md](16-posicao-duplicada.md) | `e2e/specs/portfolios/16-posicao-duplicada.spec.ts` |
| `UI-PRT-006` | [06-adicionar-posicao-rf-manual.md](06-adicionar-posicao-rf-manual.md) | `e2e/specs/portfolios/06-adicionar-posicao-rf-manual.spec.ts` |
| `UI-PRT-017` | [17-adicionar-posicao-previdencia.md](17-adicionar-posicao-previdencia.md) | `e2e/specs/portfolios/17-adicionar-posicao-previdencia.spec.ts` |
| `UI-PRT-007` | [07-editar-posicao-mercado.md](07-editar-posicao-mercado.md) | `e2e/specs/portfolios/07-editar-posicao-mercado.spec.ts` |
| `UI-PRT-018` | [18-editar-posicao-manual.md](18-editar-posicao-manual.md) | `e2e/specs/portfolios/18-editar-posicao-manual.spec.ts` |
| `UI-PRT-008` | [08-remover-posicao.md](08-remover-posicao.md) | `e2e/specs/portfolios/08-remover-posicao.spec.ts` |
| `UI-PRT-009` | [09-atualizar-cotacoes.md](09-atualizar-cotacoes.md) | `e2e/specs/portfolios/09-atualizar-cotacoes.spec.ts` |
| `UI-PRT-010` | [10-exportar-carteira-json.md](10-exportar-carteira-json.md) | `e2e/specs/portfolios/10-exportar-carteira-json.spec.ts` |
| `UI-PRT-011` | [11-importar-carteira-json.md](11-importar-carteira-json.md) | `e2e/specs/portfolios/11-importar-carteira-json.spec.ts` |
| `UI-PRT-019` | [19-importar-conflito-usar-arquivo.md](19-importar-conflito-usar-arquivo.md) | `e2e/specs/portfolios/19-importar-conflito-usar-arquivo.spec.ts` |
| `UI-PRT-012` | [12-resumo-por-tipo.md](12-resumo-por-tipo.md) | `e2e/specs/portfolios/12-resumo-por-tipo.spec.ts` |
| `UI-PRT-020` | [20-resumo-totais-moeda.md](20-resumo-totais-moeda.md) | `e2e/specs/portfolios/20-resumo-totais-moeda.spec.ts` |
| `UI-PRT-021` | [21-filtro-texto-posicoes.md](21-filtro-texto-posicoes.md) | `e2e/specs/portfolios/21-filtro-texto-posicoes.spec.ts` |
| `UI-PRT-022` | [22-ordenacao-colunas-posicoes.md](22-ordenacao-colunas-posicoes.md) | `e2e/specs/portfolios/22-ordenacao-colunas-posicoes.spec.ts` |
| `UI-PRT-023` | [23-detalhes-posicao-precos.md](23-detalhes-posicao-precos.md) | `e2e/specs/portfolios/23-detalhes-posicao-precos.spec.ts` |
| `UI-PRT-024` | [24-validacao-rf-modal-unificado.md](24-validacao-rf-modal-unificado.md) | `e2e/specs/portfolios/24-validacao-rf-modal-unificado.spec.ts` |
| `UI-PRT-025` | [25-hub-cards-metricas.md](25-hub-cards-metricas.md) | `e2e/specs/portfolios/25-hub-cards-metricas.spec.ts` |
| `UI-PRT-026` | [26-criar-carteira-modal.md](26-criar-carteira-modal.md) | `e2e/specs/portfolios/26-criar-carteira-modal.spec.ts` |
| `UI-PRT-027` | [27-editar-carteira-hub.md](27-editar-carteira-hub.md) | `e2e/specs/portfolios/27-editar-carteira-hub.spec.ts` |
| `UI-PRT-028` | [28-criar-carteira-perfil-personalizado.md](28-criar-carteira-perfil-personalizado.md) | `e2e/specs/portfolios/28-criar-carteira-perfil-personalizado.spec.ts` |
| `UI-PRT-029` | [29-excluir-carteira-hub.md](29-excluir-carteira-hub.md) | `e2e/specs/portfolios/29-excluir-carteira-hub.spec.ts` |

Cadastro unificado de renda fixa/previdência: `UI-PRT-006` (renda fixa), `UI-PRT-017` (previdência), `UI-PRT-018` (edição) e `UI-PRT-024` (validação) usam o modal **Adicionar ativo à carteira** (produto + posição numa ação). Ver [doc](../../../../docs/produto/desenvolvido/cadastro-rf-previdencia-na-carteira.md).

**Total:** 29 casos · **Comando:** `npm run test:ui -- specs/portfolios` · **Próxima página:** [`../consolidada/README.md`](../consolidada/README.md)

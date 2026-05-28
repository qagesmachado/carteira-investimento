# Casos E2E — Cadastro de ativos (`/assets`)

**Rota:** `http://127.0.0.1:5174/assets` (E2E)  
**Prefixo de ID:** `UI-AST-`

**Formato:** um cenário por arquivo — BDD (**Como / Quero / Para**) no início; **Passo a passo** numerado em seguida.

**Estratégia:** [`../../estrategia-e2e-ui.md`](../../estrategia-e2e-ui.md) — cenário real (yfinance + rede). Comando: `npm run test:ui -- specs/assets`.

| ID | Arquivo | Status | Spec |
| -- | ------- | ------ | ---- |
| `UI-AST-001` | [01-carregamento.md](01-carregamento.md) | implementado | `e2e/specs/assets/01-carregamento.spec.ts` |
| `UI-AST-002` | [02-busca-lookup-individual.md](02-busca-lookup-individual.md) | implementado | `e2e/specs/assets/02-busca-lookup-individual.spec.ts` |
| `UI-AST-003` | [03-cadastro-manual-renda-fixa.md](03-cadastro-manual-renda-fixa.md) | implementado | `03-cadastro-manual-renda-fixa.spec.ts` |
| `UI-AST-004` | [04-cadastro-manual-previdencia.md](04-cadastro-manual-previdencia.md) | implementado | `04-cadastro-manual-previdencia.spec.ts` |
| `UI-AST-005` | [05-salvar-etf-nacional-subtipo-rf.md](05-salvar-etf-nacional-subtipo-rf.md) | implementado | `05-salvar-etf-nacional-subtipo-rf.spec.ts` |
| `UI-AST-006` | [06-listagem-busca-filtro.md](06-listagem-busca-filtro.md) | implementado | `06-listagem-busca-filtro.spec.ts` |
| `UI-AST-007` | [07-editar-ativo-lista.md](07-editar-ativo-lista.md) | implementado | `07-editar-ativo-lista.spec.ts` |
| `UI-AST-008` | [08-excluir-ativo-lista.md](08-excluir-ativo-lista.md) | implementado | `08-excluir-ativo-lista.spec.ts` |
| `UI-AST-009` | [09-importacao-lote.md](09-importacao-lote.md) | implementado | `09-importacao-lote.spec.ts` |
| `UI-AST-010` | [10-fluxo-completo-lookup-ate-lista.md](10-fluxo-completo-lookup-ate-lista.md) | implementado | `10-fluxo-completo-lookup-ate-lista.spec.ts` |
| `UI-AST-011` | [11-dispensar-alerta.md](11-dispensar-alerta.md) | implementado | `11-dispensar-alerta.spec.ts` |
| `UI-AST-012` | [12-lookup-erro-ticker-invalido.md](12-lookup-erro-ticker-invalido.md) | implementado | `12-lookup-erro-ticker-invalido.spec.ts` |
| `UI-AST-013` | [13-rf-validacao-campos-obrigatorios.md](13-rf-validacao-campos-obrigatorios.md) | implementado | `13-rf-validacao-campos-obrigatorios.spec.ts` |
| `UI-AST-014` | [14-ticker-duplicado.md](14-ticker-duplicado.md) | implementado | `14-ticker-duplicado.spec.ts` |
| `UI-AST-015` | [15-listagem-limpar-busca.md](15-listagem-limpar-busca.md) | implementado | `15-listagem-limpar-busca.spec.ts` |
| `UI-AST-016` | [16-excluir-cancelar.md](16-excluir-cancelar.md) | implementado | `16-excluir-cancelar.spec.ts` |
| `UI-AST-017` | [17-importacao-lote-ja-cadastrado.md](17-importacao-lote-ja-cadastrado.md) | implementado | `17-importacao-lote-ja-cadastrado.spec.ts` |
| `UI-AST-018` | [18-importacao-lote-etf-subtipo.md](18-importacao-lote-etf-subtipo.md) | implementado | `18-importacao-lote-etf-subtipo.spec.ts` |
| `UI-AST-019` | [19-paginacao-listagem.md](19-paginacao-listagem.md) | implementado | `19-paginacao-listagem.spec.ts` |

Caminho completo: `e2e/specs/assets/`.

**Total:** 19 casos · **19 specs** · **Próxima página:** [`../portfolios/README.md`](../portfolios/README.md)

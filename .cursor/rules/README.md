# Regras Cursor — Carteira de Investimentos

Regras do agente em `.mdc` (YAML frontmatter + Markdown). O Cursor aplica por `alwaysApply` ou `globs` em cada arquivo.

## Estrutura

```
.cursor/rules/
├── README.md                 ← este índice
├── app/                      ← frontend, UI, locale, ícones, layout
│   ├── locale-br-ui.mdc      ← valores e datas pt-BR (alwaysApply)
│   ├── page-layout.mdc       ← shell, Hub/Ferramenta, espaçamento
│   └── lucide-icons.mdc      ← ícones Lucide obrigatórios
└── testes/                   ← TDD, E2E, smoke, fluxo doc → spec
    ├── testes.mdc            ← suítes, comandos, Definition of Done (alwaysApply)
    ├── desenvolvimento-guiado-testes.mdc  ← ordem doc → caso → teste → código (alwaysApply)
    ├── e2e-paralelo.mdc      ← workers Playwright, isolamento DB/porta (alwaysApply)
    └── smoke-executavel.mdc  ← smoke @smoke por rota (globs: routes + smoke specs)
```

## Quando consultar

| Pasta | Use quando… |
| --- | --- |
| **app/** | Nova rota, formulário, KPI, ícone, layout, exibição BRL/data |
| **testes/** | Escrever/rodar testes, E2E, caso de uso, entrega com `test:all` |

## Regras com `alwaysApply: true`

Aplicam-se em **toda** conversa:

- `app/locale-br-ui.mdc`
- `testes/testes.mdc`
- `testes/desenvolvimento-guiado-testes.mdc`
- `testes/e2e-paralelo.mdc`

## Adicionar regra nova

1. Escolher pasta: `app/` (produto/UI) ou `testes/` (qualidade).
2. Criar `nome-descritivo.mdc` com frontmatter (`description`, `globs` ou `alwaysApply`).
3. Atualizar este README.
4. Linkar regras relacionadas com caminho relativo (ex.: `../app/page-layout.mdc`).

## Links no repositório

Código e docs que citam regras devem usar o caminho completo, ex.: `.cursor/rules/app/lucide-icons.mdc`.

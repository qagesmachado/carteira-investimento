# Relatórios de testes

Cada execução completa (`npm run test:all` ou `npm run test:report`) cria uma pasta datada:

```
test-reports/
  YYYY-MM-DD_HHmmss/
    summary.md              # resumo legível
    summary.json            # agregado para automação
    backend-unit.junit.xml  # pytest — um testcase por teste
    frontend-unit.json      # Vitest — resultados individuais
    e2e-ui.json             # Playwright UI — specs e falhas
```

## Comandos

| Comando | Escopo |
| ------- | ------ |
| `npm run test:unit` | pytest + vitest (sem E2E, sem relatório) |
| `npm run test:integration` | só Playwright UI |
| `npm run test:report` | 3 níveis + pasta datada |
| `npm run test:all` | igual a `test:report` |

Gerado por [`scripts/test-report.ps1`](../scripts/test-report.ps1).

Os relatórios são versionados no repositório para histórico de execuções.

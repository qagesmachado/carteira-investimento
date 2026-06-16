# Modo dark persiste entre páginas

## Metadados

- **ID:** `UI-NAV-003`
- **Status:** aprovado
- **Página:** navbar global (`/dashboard`, `/ferramentas/objetivos`, …)
- **Funcionalidade:** toggle de tema claro/escuro (light / dim)
- **Depende de:** nenhum seed obrigatório (comportamento visual global)
- **Arquivo de teste:** `e2e/specs/nav/03-modo-dark-persiste.spec.ts`
- **Referência:** [modo-dark.md](../../../docs/produto/desenvolvido/modo-dark.md)

## Ambiente de teste

- **Base de dados:** `backend/data/test/carteira.db` (recriada no `pretest:ui`)
- **Lookup:** `yfinance` (seed de ativos)
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Preferência persiste

**Como** investidor  
**Quero** alternar entre tema claro e escuro  
**Para** usar o app com conforto visual em diferentes ambientes

### Passo a passo

1. Abro `/dashboard` — tema padrão é `light` (`data-theme="light"` no `<html>`).
2. Clico no botão de lua no canto superior direito da navbar (à esquerda do olho).
3. O documento passa a `data-theme="dim"`.
4. Navego para `/ferramentas/objetivos` — tema permanece `dim`.
5. Recarrego a página — preferência permanece (localStorage).
6. Clico no botão de sol — tema volta a `light`.

## Notas para automação

- Botão tema: `data-testid="toggle-theme-btn"`
- Chave localStorage: `carteira.theme` (valores: `light` ou `dim`)
- Assert DOM: `document.documentElement.getAttribute('data-theme')`

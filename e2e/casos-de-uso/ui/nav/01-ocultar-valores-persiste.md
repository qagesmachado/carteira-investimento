# Ocultar valores persiste entre páginas

## Metadados

- **ID:** `UI-NAV-001`
- **Status:** aprovado
- **Página:** navbar global (`/dashboard`, `/ferramentas/objetivos`, …)
- **Funcionalidade:** toggle de privacidade para ocultar valores monetários
- **Depende de:** seed consolidada mínima (carteira com patrimônio visível)
- **Arquivo de teste:** `e2e/specs/nav/01-ocultar-valores-persiste.spec.ts`
- **Referência:** [ocultar-valores.md](../../../docs/produto/desenvolvido/ocultar-valores.md)

## Ambiente de teste

- **Base de dados:** `backend/data/test/carteira.db` (recriada no `pretest:ui`)
- **Lookup:** `yfinance` (seed de ativos)
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Preferência persiste

**Como** investidor  
**Quero** ocultar valores monetários em todas as telas  
**Para** usar o app em público sem expor patrimônio

### Passo a passo

1. Existe carteira ativa com patrimônio (seed consolidada).
2. Abro `/dashboard` — cards exibem valores em reais.
3. Clico no botão de olho no canto superior direito da navbar.
4. Valores monetários passam a exibir máscara (`R$ ••••••`).
5. Navego para `/ferramentas/objetivos` — valores continuam mascarados.
6. Recarrego a página — preferência permanece (localStorage).
7. Clico no toggle novamente — valores voltam a ser exibidos.

## Notas para automação

- Botão: `data-testid="toggle-hide-money-btn"`
- Chave localStorage: `carteira.hideMoneyValues`
- Percentuais e cotas permanecem visíveis (fora do escopo da máscara)

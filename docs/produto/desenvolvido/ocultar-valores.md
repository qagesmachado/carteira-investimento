# Ocultar valores monetários

## Objetivo

Permitir ocultar valores monetários em **todas as telas** da aplicação, útil para uso em ambientes públicos ou compartilhados (privacidade visual).

## Escopo

- Toggle global no **canto superior direito** da navbar (ícone olho aberto / olho riscado).
- Preferência persistida em **`localStorage`** (`carteira.hideMoneyValues`) — mantida ao trocar de página e recarregar o navegador.
- Mascaramento via formatadores centrais (`formatBrl`, `formatMoneyAmount`): exibe prefixo de moeda + `••••••` (ex.: `R$ ••••••`, `US$ ••••••`).

## Regras

| Situação | Comportamento |
| -------- | ------------- |
| Valores em tabelas, cards, badges | Mascarados quando toggle ativo |
| Campos bloqueados (`BrDecimalInput` disabled) | Mascarados |
| Campos em **modo edição** | Valor real visível |
| Percentuais e cotas | Continuam visíveis |
| Quantidades BTC (Bitcoin) | Mascaradas (`••••••`) junto com R$/US$ na página `/ferramentas/bitcoin` |
| Sincronização entre dispositivos | Fora de escopo (apenas localStorage) |

## Onde aparece

Dashboard, carteiras, consolidada, proventos, objetivos, previdência, rebalanceamento, análise internacional — qualquer tela que use os formatadores centrais de moeda.

## Implementação técnica

- Store: `frontend/src/lib/stores/hideMoneyValues.ts`
- Helpers: `frontend/src/lib/moneyDisplay.ts`
- Toggle: `frontend/src/lib/components/AppNavbar.svelte`

## Casos de uso E2E

- `UI-NAV-001` — toggle, persistência entre rotas e reload

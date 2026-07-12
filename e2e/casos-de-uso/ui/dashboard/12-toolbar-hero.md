# Toolbar do hero

## Metadados

- **ID:** `UI-DASH-012`
- **Status:** aprovado
- **Página:** `/dashboard`
- **Funcionalidade:** ações de atualizar cotações e câmbio no canto direito do hero
- **Depende de:** seed consolidada com carteira ativa
- **Arquivo de teste:** `e2e/specs/dashboard/12-toolbar-hero.spec.ts`
- **Referência:** [dashboard-inicial.md](../../../docs/produto/desenvolvido/dashboard-inicial.md)

## Ambiente de teste

- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Ações no hero

**Como** investidor  
**Quero** atualizar cotações e câmbio diretamente no topo do dashboard  
**Para** manter a visão atualizada

### Passo a passo

1. Existe carteira ativa (seed).
2. Abro `/dashboard`.
3. A toolbar exibe botões «Atualizar cotações» e «Atualizar câmbio» lado a lado no canto direito do hero.
4. O subtítulo do hero indica quando os dados foram atualizados.

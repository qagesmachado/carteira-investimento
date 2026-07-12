# Atalhos inferiores

## Metadados

- **ID:** `UI-DASH-011`
- **Status:** aprovado
- **Página:** `/dashboard`
- **Funcionalidade:** barra com quatro atalhos para áreas principais
- **Depende de:** seed consolidada com carteira ativa
- **Arquivo de teste:** `e2e/specs/dashboard/11-atalhos-inferiores.spec.ts`
- **Referência:** [dashboard-inicial.md](../../../docs/produto/desenvolvido/dashboard-inicial.md)

## Ambiente de teste

- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Quatro atalhos

**Como** investidor  
**Quero** acessar rapidamente consolidada, rebalanceamento, proventos e objetivos  
**Para** navegar sem usar o menu principal

### Passo a passo

1. Existe carteira ativa (seed).
2. Abro `/dashboard`.
3. A barra inferior exibe quatro atalhos com links corretos.

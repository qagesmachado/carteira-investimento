# Sumário da análise

## Metadados

- **ID:** `UI-ANL-017`
- **Status:** implementado
- **Página:** `/analise/sumario`
- **Arquivo de teste:** `e2e/specs/analise/17-hub-configuracao.spec.ts`

## Cenário — entrada pelo menu e navegação pelo hub

1. Abrir menu **Carteira → Análise de ativos**.
2. Verificar URL `/analise/sumario` e aba **Sumário** ativa.
3. Verificar barra de carteira, KPIs (classificados/pendentes), cards de atalho e orientações.
4. Confirmar que não há editor da coluna Soma nesta tela.
5. Navegar para Ações/ETF BR via card ou pill e verificar tabela de análise.

## Redirect legado

- `/analise/configuracao` → `/analise/sumario`

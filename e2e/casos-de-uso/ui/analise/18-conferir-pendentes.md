# Conferir ativos pendentes no sumário

## Metadados

- **ID:** `UI-ANL-018`
- **Status:** implementado
- **Página:** `/analise/sumario`
- **Arquivo de teste:** `e2e/specs/analise/18-conferir-pendentes.spec.ts`

## Cenário — modal com pendentes agrupados por tipo

1. Seed com BBSE3 na carteira ativa marcado como **pendente**.
2. Abrir `/analise/sumario`.
3. Verificar KPI **Pendentes** com contagem > 0 e botão **Conferir** visível.
4. Clicar em **Conferir**.
5. Verificar modal com grupo **Ações/ETF BR** listando BBSE3.
6. Fechar modal.

## Cenário — sem pendentes

1. Seed padrão sem pendentes.
2. Abrir sumário.
3. Verificar ausência do botão **Conferir** quando contagem de pendentes é zero.

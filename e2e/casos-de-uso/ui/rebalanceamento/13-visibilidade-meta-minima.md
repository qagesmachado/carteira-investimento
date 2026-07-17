# Visibilidade por meta mínima

## Metadados

- **ID:** `UI-REB-013`
- **Status:** aprovado
- **Página:** `/rebalanceamento`
- **Funcionalidade:** ocultar classes e abas por ativo quando meta < 1%
- **Depende de:** `UI-REB-002`
- **Arquivo de teste:** `e2e/specs/rebalanceamento/13-visibilidade-meta-minima.spec.ts`
- **Referência:** `docs/produto/desenvolvido/rebalanceamento.md`

## Ambiente de teste

- **Base de dados:** worker isolado (`carteira-{N}.db`)
- **Lookup:** não se aplica
- **URLs:** frontend worker · API worker (ver `e2e-paralelo.mdc`)

## Cenário — classes e abas com meta abaixo de 1%

**Como** investidor  
**Quero** ver na tela de rebalanceamento apenas classes e grupos de ativos com meta ≥ 1%  
**Para** focar no que realmente faz parte da estratégia configurada

### Passo a passo

1. Configurar metas com `Fundos = 0%` e `Criptomoeda = 0%`, mantendo soma 100%.
2. Abrir `/rebalanceamento`.
3. Verificar que as linhas **Fundos** e **Criptomoeda** não aparecem em **Balanceamento por classe**.
4. Verificar que as abas **FII** e **Criptomoedas** não aparecem em **Por ativo**.

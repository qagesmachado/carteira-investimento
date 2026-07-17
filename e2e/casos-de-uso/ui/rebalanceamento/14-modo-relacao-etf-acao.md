# Modo de relação ETF/Ação

## Metadados

- **ID:** `UI-REB-014`
- **Status:** implementado
- **Página:** `/rebalanceamento/configuracao`
- **Arquivo de teste:** `e2e/specs/rebalanceamento/14-modo-relacao-etf-acao.spec.ts`

## Cenário — padrão conjunto único e primeira abertura por subtipo 50/50

1. Abrir configuração de metas com meta Ações/ETF BR ≥ 1% (carteira nova).
2. Verificar modo **Conjunto único** ativo e sliders ETF/Ação ocultos.
3. Selecionar «Por subtipo (ETF e Ação)» e confirmar.
4. Verificar sliders ETF/Ação em **50% / 50%**.
5. Alternar de volta para «Conjunto único», confirmar e salvar metas.

# Config Soma FII independente

## Metadados

- **ID:** `UI-ANL-011`
- **Status:** aprovado
- **Página:** `/analise/configuracao?perfil=fiis`
- **Arquivo de teste:** `e2e/specs/analise/fiis/11-config-soma-fii.spec.ts`

## Cenário

**Como** investidor  
**Quero** configurar a coluna Soma do perfil FII  
**Para** alterar multiplicador do diagrama sem afetar ações

### Passo a passo

1. Abro `/analise/configuracao?perfil=fiis` (aba FIIs).
2. Altero multiplicador do diagrama e salvo.
3. Config persiste via API `fii-br/config`.

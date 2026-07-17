# Config Soma FII independente

## Metadados

- **ID:** `UI-ANL-011`
- **Status:** aprovado
- **Página:** `/analise/fiis` (modal Coluna Soma, metodologia AUVP)
- **Arquivo de teste:** `e2e/specs/analise/fiis/11-config-soma-fii.spec.ts`

## Cenário

**Como** investidor  
**Quero** configurar a coluna Soma do perfil FII  
**Para** alterar multiplicador do diagrama sem afetar ações

### Passo a passo

1. Abro `/analise/fiis` (sem carteira ou com AUVP).
2. Clico em **Configurar coluna Soma** e abro o modal.
3. Altero multiplicador do diagrama e salvo.
4. Config persiste via API `fii-br/config`.

# Classificar FII — viabilidade

## Metadados

- **ID:** `UI-ANL-008`
- **Status:** aprovado
- **Página:** `/analise/fiis`
- **Arquivo de teste:** `e2e/specs/analise/fiis/08-classificar-fii-viabilidade.spec.ts`

## Cenário

**Como** investidor  
**Quero** classificar indicadores de viabilidade de um FII  
**Para** registrar vacância, qtd de ativos, alavancagem, segmento e viabilidade geral

### Passo a passo

1. Seed com FII (ex. HGLG11) na carteira.
2. Abro `/analise/fiis` e clico **Classificar** na linha do FII.
3. Preencho os 4 indicadores e viabilidade manual.
4. Salvo e verifico badges/scores na tabela.

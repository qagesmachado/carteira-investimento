# Classificar critérios fundamentais BBSE3

## Metadados

- **ID:** `UI-ANL-002`
- **Status:** aprovado
- **Página:** `/analise/acoes-br`
- **Depende de:** ativo BBSE3 (`display_class=stocks`)
- **Arquivo de teste:** `e2e/specs/analise/02-classificar-fundamental-bbse3.spec.ts`

## Cenário

**Como** investidor  
**Quero** classificar lucros, dívida, tag along e segmento  
**Para** ver a viabilidade calculada

### Passo a passo

1. Existe BBSE3 no catálogo.
2. Abro análise e clico Classificar em BBSE3.
3. Preencho os 4 critérios e salvo.
4. Tabela exibe scores e badge de viabilidade.

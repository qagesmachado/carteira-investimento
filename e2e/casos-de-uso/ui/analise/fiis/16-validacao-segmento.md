# Validação ao salvar segmento FII

## Metadados

- **ID:** `UI-ANL-016`
- **Status:** aprovado
- **Página:** `/analise/fiis/segmentos`
- **Arquivo de teste:** `e2e/specs/analise/fiis/16-validacao-segmento.spec.ts`

## Cenário

**Como** investidor  
**Quero** ser impedido de salvar segmento incompleto  
**Para** manter o catálogo consistente

### Passo a passo

1. Abro `/analise/fiis/segmentos`.
2. Clico em «Adicionar» sem preencher os campos.
3. Clico em «Salvar».
4. Vejo mensagem de erro e o catálogo não é persistido.

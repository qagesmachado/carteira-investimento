# Pendente como rascunho no modal AUVP

## Metadados

- **ID:** `UI-ANL-020`
- **Status:** aprovado
- **Página:** `/analise/acoes-br`
- **Funcionalidade:** marcar ativo como pendente só após salvar classificação
- **Depende de:** seed BBSE3 com metodologia AUVP
- **Arquivo de teste:** `e2e/specs/analise/20-pendente-rascunho-auvp.spec.ts`

## Cenário — cancelar não aplica pendente

1. Abrir classificação de BBSE3 na carteira ativa (AUVP).
2. Marcar **Marcar como pendente** no modal.
3. Verificar alerta de alterações não salvas e ausência do badge **Pendente** na linha da tabela.
4. Clicar **Cancelar**.
5. Verificar que a linha continua sem badge **Pendente**.

## Cenário — salvar aplica pendente

1. Reabrir classificação do mesmo ativo.
2. Marcar **Marcar como pendente**.
3. Clicar **Salvar classificação**.
4. Verificar badge **Pendente** na linha da tabela.

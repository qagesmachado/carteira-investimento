# Configuração altera viabilidade

## Metadados

- **ID:** `UI-ANL-004`
- **Status:** aprovado
- **Página:** `/analise/acoes-br` (modal Coluna Soma, metodologia AUVP)
- **Arquivo de teste:** `e2e/specs/analise/04-config-altera-viabilidade.spec.ts`

## Cenário

**Como** investidor  
**Quero** alterar pesos na configuração  
**Para** que o preview de viabilidade reflita a mudança

### Passo a passo

1. Abro `/analise/acoes-br` (metodologia AUVP).
2. Clico em **Configurar coluna Soma** e abro o modal.
3. Altero peso de um critério fundamental.
4. Salvo configuração.
5. Preview ou mensagem de sucesso confirma persistência.

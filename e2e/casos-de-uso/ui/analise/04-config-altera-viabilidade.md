# Configuração altera viabilidade

## Metadados

- **ID:** `UI-ANL-004`
- **Status:** aprovado
- **Página:** `/analise/configuracao` (aba Ações/ETF BR; mesma tela com sub-aba FIIs)
- **Arquivo de teste:** `e2e/specs/analise/04-config-altera-viabilidade.spec.ts`

## Cenário

**Como** investidor  
**Quero** alterar pesos na configuração  
**Para** que o preview de viabilidade reflita a mudança

### Passo a passo

1. Abro `/analise/configuracao`.
2. Altero peso de um critério fundamental.
3. Salvo configuração.
4. Preview ou mensagem de sucesso confirma persistência.

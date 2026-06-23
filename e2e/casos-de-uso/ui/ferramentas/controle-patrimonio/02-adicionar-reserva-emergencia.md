# Adicionar reserva de emergência

## Metadados

- **ID:** `UI-PAT-002`
- **Status:** aprovado
- **Página:** `/ferramentas/controle-patrimonio`
- **Funcionalidade:** cadastrar reserva com localização
- **Depende de:** `UI-PAT-001`
- **Arquivo de teste:** `e2e/specs/ferramentas/controle-patrimonio/02-adicionar-reserva-emergencia.spec.ts`
- **Referência:** [controle-patrimonio.md](../../../../../docs/produto/desenvolvido/controle-patrimonio.md)

## Cenário — reserva com onde está

**Como** investidor  
**Quero** registrar minha reserva de emergência informando onde está  
**Para** controlar liquidez fora da carteira investida

### Passo a passo

1. Abro a página com carteira seed.
2. Na seção «Reserva de emergência», clico em «Adicionar».
3. Informo nome «Conta Nubank», valor R$ 5.000 e localização «Banco».
4. Salvo e vejo a linha na tabela com nome, localização e valor.
5. O card «Reserva de emergência» mostra R$ 5.000,00.

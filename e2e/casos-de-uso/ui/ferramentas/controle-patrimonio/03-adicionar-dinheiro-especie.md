# Adicionar dinheiro em espécie na reserva

## Metadados

- **ID:** `UI-PAT-003`
- **Status:** aprovado
- **Página:** `/controle-patrimonio`
- **Funcionalidade:** cadastrar dinheiro em espécie como reserva de emergência
- **Depende de:** `UI-PAT-001`
- **Arquivo de teste:** `e2e/specs/controle-patrimonio/03-adicionar-dinheiro-especie.spec.ts`
- **Referência:** [controle-patrimonio.md](../../../../../docs/produto/desenvolvido/controle-patrimonio.md)

## Cenário — espécie via localização na reserva

**Como** investidor  
**Quero** registrar dinheiro em espécie na reserva de emergência  
**Para** incluir caixa físico no meu patrimônio total

### Passo a passo

1. Abro a página com carteira seed.
2. Na seção «Reserva de emergência», clico em «Adicionar».
3. Informo nome «Cofre casa», localização «Dinheiro em espécie» e valor R$ 500.
4. Salvo e vejo a linha na tabela de reserva.
5. O card «Reserva de emergência» mostra R$ 500,00.

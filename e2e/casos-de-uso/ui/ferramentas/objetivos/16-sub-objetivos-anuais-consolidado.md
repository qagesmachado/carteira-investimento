# Sub-objetivos anuais previdência com consolidado

## Metadados

- **ID:** `UI-OBJ-016`
- **Status:** aprovado
- **Página:** `/objetivos`
- **Funcionalidade:** múltiplos anos no mesmo objetivo previdência com visão consolidada
- **Depende de:** `UI-OBJ-014`
- **Arquivo de teste:** `e2e/specs/objetivos/16-sub-objetivos-anuais-consolidado.spec.ts`
- **Referência:** [controle-aporte-previdencia.md](../../../../../docs/produto/desenvolvido/controle-aporte-previdencia.md)

## Cenário — dois anos e consolidado

**Como** investidor  
**Quero** registrar aportes de anos diferentes no mesmo objetivo previdência  
**Para** ver quanto investi em cada ano e o total consolidado

### Passo a passo

1. Abro `/objetivos` com carteira seed.
2. Crio objetivo previdência para o ano corrente (renda R$ 120.000).
3. Adiciono sub-objetivo do ano anterior (renda R$ 100.000).
4. Seleciono aba do ano anterior e informo aporte R$ 12.000.
5. Volto ao ano corrente e informo aporte R$ 6.000.

### Resultado esperado

- Tabela consolidada lista os dois anos com aportes e metas.
- Texto «Total aportado (todos os anos)» exibe R$ 18.000,00.
- Abas permitem alternar entre os anos sem perder dados.

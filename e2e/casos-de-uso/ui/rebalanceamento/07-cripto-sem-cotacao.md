# Rebalanceamento — cripto sem cotação na lista

## Metadados

- **ID:** `UI-PRT-007`
- **Status:** aprovado
- **Página:** `/rebalanceamento`
- **Arquivo de teste:** `e2e/specs/rebalanceamento/07-cripto-sem-cotacao.spec.ts`

## Referência

- [analise-criptomoedas.md](../../../../docs/produto/desenvolvido/analise-criptomoedas.md)

## Cenário

**Como** investidor  
**Quero** ver ativos cripto na aba Criptomoedas do rebalanceamento mesmo sem cotação de mercado  
**Para** acompanhar a alocação desejada enquanto a cotação ainda não está disponível (ex.: ETF recém-listado)

### Pré-condições

- Ativo cripto cadastrado com `current_quote` ausente.
- Posição na carteira ativa e alocação salva em Análise → Criptomoedas.

### Passo a passo

1. Abro `/rebalanceamento`.
2. Seleciono a aba **Criptomoedas**.
3. Vejo o ativo sem cotação na tabela.
4. Colunas **Valor atual** e **% atual** exibem **—**.
5. Coluna **% desejada** reflete a alocação salva.

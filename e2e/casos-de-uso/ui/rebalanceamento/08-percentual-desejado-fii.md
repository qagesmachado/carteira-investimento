# % desejada por FII proporcional ao score

## Metadados

- **ID:** `UI-REB-008`
- **Status:** aprovado
- **Página:** `/rebalanceamento` (aba FII)
- **Depende de:** FIIs classificados em `/analise/fiis` (coluna Soma)
- **Arquivo de teste:** `e2e/specs/rebalanceamento/08-percentual-desejado-fii.spec.ts`

## Cenário

**Como** investidor  
**Quero** ver % desejada por FII no rebalanceamento  
**Para** distribuir aportes na classe Fundos conforme a Soma da análise

### Passo a passo

1. Carteira com dois FIIs classificados (Somas diferentes).
2. Abro `/rebalanceamento` e seleciono a aba **FII**.
3. A tabela exibe coluna **Soma** e **% desejada** preenchidas.
4. O FII com maior Soma tem % desejada maior que o outro.

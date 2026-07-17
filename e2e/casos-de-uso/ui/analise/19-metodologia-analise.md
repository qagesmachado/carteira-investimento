# Metodologia Simples / AUVP

## Metadados

- **ID:** `UI-ANL-019`
- **Status:** aprovado
- **Página:** `/analise/acoes-br`, `/analise/internacional`
- **Arquivo de teste:** `e2e/specs/analise/19-metodologia-analise.spec.ts`

## Cenário 1 — Nova carteira inicia em Simples

**Como** investidor com carteira recém-criada  
**Quero** ver alocação percentual por padrão  
**Para** definir % desejado sem classificação AUVP

### Passo a passo

1. Seed cria carteira nova com posição em ação BR (metodologia padrão Simples).
2. Abro `/analise/acoes-br`.
3. Seletor de metodologia exibe **Simples** selecionado.
4. Painel de alocação % está visível; tabela AUVP não.

## Cenário 2 — Trocar para AUVP

**Como** investidor  
**Quero** alternar para AUVP na mesma carteira  
**Para** usar classificação fundamental e coluna Soma

### Passo a passo

1. Na mesma tela, confirmo troca para **AUVP**.
2. Tabela de classificação aparece com botão **Classificar**.
3. Botão **Configurar coluna Soma** fica disponível.

## Cenário 3 — Internacional com AUVP indisponível

**Como** investidor  
**Quero** ver opção AUVP desabilitada em internacional  
**Para** entender que só Simples está disponível hoje

### Passo a passo

1. Abro `/analise/internacional` com carteira ativa.
2. Seletor exibe **Simples** ativo.
3. Opção **AUVP** está desabilitada com hint "Em breve".

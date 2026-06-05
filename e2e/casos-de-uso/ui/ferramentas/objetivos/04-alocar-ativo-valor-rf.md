# Alocar ativo de renda fixa por valor

## Metadados

- **ID:** `UI-OBJ-004`
- **Status:** aprovado
- **Página:** `/ferramentas/objetivos`
- **Funcionalidade:** divisão por valor (RF)
- **Depende de:** seed com CDB e dois objetivos
- **Arquivo de teste:** `e2e/specs/ferramentas/objetivos/04-alocar-ativo-valor-rf.spec.ts`
- **Referência:** [objetivos-financeiros.md](../../../../../docs/produto/desenvolvido/objetivos-financeiros.md)

## Cenário — alocar CDB por valor

**Como** investidor  
**Quero** dividir R$ 100k de CDB entre dois objetivos  
**Para** controlar R$ 50k para cada finalidade

### Passo a passo

1. Carteira com CDB R$ 100k e objetivos «Objetivo 1» e «Objetivo 2».
2. Aloco R$ 50k do CDB em «Objetivo 1».
3. Aloco R$ 50k do CDB em «Objetivo 2».
4. Livre não exibe o CDB (100% alocado).

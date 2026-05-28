# Carregamento objetivos — Resumo sem Livre na UI

## Metadados

- **ID:** `UI-OBJ-001`
- **Status:** aprovado
- **Página:** `/objetivos`
- **Funcionalidade:** carregamento inicial em Resumo (Livre só na API)
- **Depende de:** seed API (`seedObjetivosEmpty`)
- **Arquivo de teste:** `e2e/specs/objetivos/01-carregamento-livre-default.spec.ts`
- **Referência:** [objetivos-financeiros.md](../../../../docs/produto/desenvolvido/objetivos-financeiros.md)

## Cenário — carregamento Livre

**Como** investidor  
**Quero** abrir a tela de objetivos  
**Para** ver o resumo e criar objetivos custom sem a tela «Livre»

### Passo a passo

1. Carteira ativa com posições (seed).
2. Abro `/objetivos`.
3. A aba «Resumo» está ativa por padrão.
4. Não há aba/card «Livre» nem linha «Livre» na tabela do resumo.
5. O restante não alocado continua calculado na API (verificação via snapshot).

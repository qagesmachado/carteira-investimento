# Cadastro manual de previdência

> **DEPRECADO.** O cadastro de previdência saiu de `/assets`. Agora é feito no modal
> **Adicionar ativo à carteira** em `/portfolios` (produto + posição numa ação). Ver
> [`UI-PRT-017`](../portfolios/17-adicionar-posicao-previdencia.md) e
> [Cadastro unificado de renda fixa e previdência na carteira](../../../../docs/produto/desenvolvido/cadastro-rf-previdencia-na-carteira.md).

## Metadados

- **ID:** `UI-AST-004`
- **Status:** removido (migrado para `UI-PRT-017`)
- **Nível:** `ambos`
- **Página:** `/assets`
- **Funcionalidade:** cadastrar ativo de previdência manualmente
- **Depende de:** nenhum
- **Arquivo de teste:** `e2e/specs/assets/04-cadastro-manual-previdencia.spec.ts`

- **Referência:** fluxo «Nova previdência» em `/assets`

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db`
- **Base de carteiras:** `backend/data/test/portfolios.db` (não usada)
- **Lookup:** `ASSET_LOOKUP_MODE=fake`
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Cadastrar plano de previdência manual

**Como** investidor  
**Quero** cadastrar um plano de previdência  
**Para** vincular posições manuais depois na carteira

### Passo a passo

1. Estou em `/assets`.
2. Não existe previdência com o mesmo nome/identificador do caso de teste.
3. Abro o cadastro manual de previdência.
4. Preencho nome do plano, instituição e campos obrigatórios.
5. Salvo o ativo.
6. Mensagem de sucesso é exibida.
7. A tabela mostra linha com tipo Previdência (ou equivalente na UI).
8. O registro persiste após recarregar (`data/test/carteira.db`).

## Notas para automação (fase 2)

- Reutilizar em `UI-PRT-017` junto com RF manual (`UI-AST-003`).

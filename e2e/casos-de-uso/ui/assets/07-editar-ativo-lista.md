# Editar ativo pela lista

## Metadados

- **ID:** `UI-AST-007`
- **Status:** implementado
- **Nível:** `ambos`
- **Página:** `/assets`
- **Funcionalidade:** editar ativo existente a partir da tabela
- **Depende de:** `UI-AST-002` (`BBSE3` cadastrado)
- **Arquivo de teste:** `e2e/specs/assets/07-editar-ativo-lista.spec.ts`

- **Referência:** ações da tabela em `/assets`

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db` (contém `BBSE3`)
- **Base de carteiras:** `backend/data/test/portfolios.db` (não usada)
- **Lookup:** `ASSET_LOOKUP_MODE=fake`
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Atualizar nome do ativo

**Como** investidor  
**Quero** corrigir o nome exibido de um ativo  
**Para** refletir minha nomenclatura

### Passo a passo

1. O ativo `BBSE3` está cadastrado em `data/test/carteira.db` (caso `UI-AST-002`).
2. Estou em `/assets` e vejo a linha de `BBSE3` na tabela.
3. Clico em «Editar» (ou ícone equivalente) na linha de `BBSE3`.
4. Altero o campo nome para `BBSE3 E2E Editado`.
5. Salvo as alterações.
6. Mensagem de sucesso é exibida.
7. A tabela mostra `BBSE3` com o nome `BBSE3 E2E Editado`.
8. Após recarregar a página, o nome permanece atualizado na base de teste.

## Notas para automação (fase 2)

- Não excluir o ativo neste spec; exclusão em `UI-AST-008` e `UI-AST-016`.

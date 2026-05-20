# Editar posição de mercado

## Metadados

- **ID:** `UI-PRT-007`
- **Status:** implementado
- **Página:** `/portfolios`
- **Funcionalidade:** editar quantidade no modal de posição de mercado
- **Depende de:** `UI-PRT-005`
- **Arquivo de teste:** `e2e/specs/portfolios/07-editar-posicao-mercado.spec.ts`

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db`
- **Base de carteiras:** `backend/data/test/portfolios.db`
- **Lookup:** yfinance
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Alterar quantidade de BBSE3

**Como** investidor  
**Quero** ajustar a quantidade de uma ação  
**Para** corrigir meu lançamento

### Passo a passo

1. Existe posição em `BBSE3` com quantidade `100` na carteira ativa.
2. Abro o modal de edição da linha `BBSE3`.
3. Altero quantidade para `150`.
4. Salvo o modal.
5. A tabela exibe quantidade `150`.
6. O valor persiste em `portfolios.db` após recarregar.

## Notas para automação (fase 2)

- Assertar campos de mercado (qtd/preço), não campos de manual.

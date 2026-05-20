# Editar posição manual

## Metadados

- **ID:** `UI-PRT-018`
- **Status:** implementado
- **Página:** `/portfolios`
- **Funcionalidade:** editar valores de posição RF manual
- **Depende de:** `UI-PRT-006`
- **Arquivo de teste:** `e2e/specs/portfolios/18-editar-posicao-manual.spec.ts`

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db`
- **Base de carteiras:** `backend/data/test/portfolios.db`
- **Lookup:** yfinance
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Atualizar valor atual da RF

**Como** investidor  
**Quero** atualizar valor atual da RF  
**Para** refletir o saldo do dia

### Passo a passo

1. Existe posição manual de RF na carteira ativa.
2. Abro edição da posição manual.
3. Altero valor atual e rendimento.
4. Salvo o modal.
5. A linha exibe os novos valores.
6. Campos específicos de manual permanecem (sem preço de mercado).

## Notas para automação (fase 2)

- Diferenciar modal de mercado (`UI-PRT-007`) vs manual neste spec.

# Editar carteira no hub

## Metadados

- **ID:** `UI-PRT-027`
- **Status:** implementado
- **Página:** `/portfolios`
- **Funcionalidade:** editar nome, titular e objetivo pelo card do hub
- **Depende de:** carteira auxiliar sem metadados
- **Arquivo de teste:** `e2e/specs/portfolios/27-editar-carteira-hub.spec.ts`

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db`
- **Base de carteiras:** `backend/data/test/portfolios.db`
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Completar metadados de carteira antiga

**Como** investidor  
**Quero** editar titular e objetivo no hub  
**Para** alinhar carteiras antigas ao cadastro novo

### Passo a passo

1. Existe carteira `E2E Aux` sem titular/objetivo.
2. Navego para `/portfolios`.
3. Clico **Editar** no card da carteira.
4. Preencho titular `Gabriel` e objetivo `Reserva pessoal.`
5. Salvo.
6. O card exibe titular e objetivo atualizados.

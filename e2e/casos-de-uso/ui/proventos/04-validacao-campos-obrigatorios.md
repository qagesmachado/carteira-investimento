# Validacao de campos obrigatorios

## Metadados

- **ID:** `UI-PRV-004`
- **Status:** aprovado
- **Pagina:** `/proventos`
- **Funcionalidade:** impedir salvar incompleto
- **Depende de:** UI-PRV-001
- **Arquivo de teste:** `e2e/specs/proventos/04-validacao-campos-obrigatorios.spec.ts` 
- **Referencia:** [cadastro-proventos.md](../../../docs/produto/desenvolvido/cadastro-proventos.md)

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db`
- **Base de carteiras:** nao usada
- **Lookup:** nao se aplica
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenario — Validacao de campos obrigatorios

**Como** investidor  
**Quero** impedir salvar incompleto  
**Para** controlar proventos recebidos na aplicacao

### Passo a passo

1. Tento salvar sem ativo, data ou valor.
2. O lancamento nao e criado.
3. Mensagem ou validacao do formulario impede envio.

## Notas para automacao 

- Seed via API: criar ativos e proventos no `beforeEach` (`seedProventos*`).
- Page object futuro: `e2e/helpers/proventosPage.ts`.

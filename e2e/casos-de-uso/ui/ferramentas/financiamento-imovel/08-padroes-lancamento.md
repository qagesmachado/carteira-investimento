# Padrões de lançamento — financiamento imóvel

## Metadados

- **ID:** `UI-FERR-008`
- **Status:** aprovado
- **Página:** `/financeiro/financiamento-imovel`
- **Funcionalidade:** salvar, editar, excluir e aplicar padrões de pré-preenchimento no formulário «Registrar lançamento»
- **Depende de:** `UI-FERR-002` (criar financiamento)
- **Arquivo de teste:** `e2e/specs/financeiro/financiamento-imovel/08-padroes-lancamento.spec.ts`
- **Referência:** [controle-financiamento-imovel.md](../../../../docs/produto/desenvolvido/controle-financiamento-imovel.md)

## Ambiente de teste

- **Base de dados:** `backend/data/test/carteira-{N}.db` (worker isolado)
- **Lookup:** não se aplica
- **URLs:** frontend worker 0 `http://127.0.0.1:5174` · API worker 0 `http://127.0.0.1:8001`

## Cenário — CRUD e aplicação de padrão

**Como** investidor com lançamentos recorrentes no mesmo imóvel  
**Quero** salvar padrões de pré-preenchimento (tipo, evento, valor, descrição)  
**Para** registrar parcelas e aluguéis mais rápido sem afetar lançamentos já salvos

### Passo a passo

1. Abrir `/financeiro/financiamento-imovel` e selecionar um imóvel.
2. Preencher o formulário (sem data obrigatória para salvar padrão): Despesa, Financiamento, valor `3.000,00`, descrição «Parcela financiamento».
3. Clicar em «Salvar como padrão», informar nome «Parcela financiamento» e confirmar.
4. Limpar o formulário; selecionar o padrão no select e clicar «Aplicar».
5. Verificar que tipo, evento, valor (vírgula decimal) e descrição foram preenchidos; data permanece vazia.
6. Informar data, ajustar valor para `3.100,00` e salvar lançamento.
7. Abrir «Gerenciar padrões», editar o padrão (novo valor/descrição), aplicar de novo e confirmar campos atualizados.
8. Excluir o padrão e verificar que some do select.
9. Criar segundo imóvel; confirmar que padrão do primeiro não aparece no segundo.

## Notas para automação

- Usar `fillBrDecimalTestInput` para campos `BrDecimalInput`.
- Assert de valor com vírgula após aplicar padrão.
- Isolamento: dois imóveis na mesma carteira, padrão só no imóvel A.

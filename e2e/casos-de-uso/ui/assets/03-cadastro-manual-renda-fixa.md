# Cadastro manual de renda fixa

> **DEPRECADO.** O cadastro de renda fixa tradicional saiu de `/assets`. Agora é
> feito no modal **Adicionar ativo à carteira** em `/portfolios` (produto + posição
> numa ação). Ver [`UI-PRT-006`](../portfolios/06-adicionar-posicao-rf-manual.md) e
> [Cadastro unificado de renda fixa e previdência na carteira](../../../../docs/produto/desenvolvido/cadastro-rf-previdencia-na-carteira.md).

## Metadados

- **ID:** `UI-AST-003`
- **Status:** removido (migrado para `UI-PRT-006`)
- **Nível:** `ambos`
- **Página:** `/assets`
- **Funcionalidade:** cadastrar ativo de renda fixa manualmente
- **Depende de:** nenhum
- **Arquivo de teste:** `e2e/specs/assets/03-cadastro-manual-renda-fixa.spec.ts`

- **Referência:** fluxo «Nova renda fixa» em `/assets`

## Ambiente de teste

- **Base de ativos:** `backend/data/test/carteira.db`
- **Base de carteiras:** `backend/data/test/portfolios.db` (não usada)
- **Lookup:** `ASSET_LOOKUP_MODE=fake`
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Cadastrar CDB manual com identificador gerado

**Como** investidor  
**Quero** cadastrar uma aplicação de renda fixa manualmente  
**Para** acompanhar posições sem ticker de mercado

### Passo a passo

1. Estou em `/assets`.
2. Não existe ativo de RF manual com o mesmo identificador que vou criar.
3. Abro o fluxo de cadastro manual de renda fixa.
4. Preencho instituição, produto e demais campos obrigatórios.
5. Uso «Gerar identificador» (se disponível) ou informo identificador único.
6. Informo datas de aplicação e vencimento válidas.
7. Salvo o ativo.
8. Mensagem de sucesso é exibida.
9. A tabela lista o ativo de tipo Renda fixa com o identificador informado.
10. Após recarregar a página, o ativo permanece em `data/test/carteira.db`.

## Notas para automação (fase 2)

- Ativo RF manual será reutilizado em `UI-PRT-006`.
- Documentar identificador fixo no spec (ex.: prefixo `E2E-CDB-`).

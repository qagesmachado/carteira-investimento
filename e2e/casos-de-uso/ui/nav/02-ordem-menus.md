# Ordem e hierarquia dos menus

## Metadados

- **ID:** `UI-NAV-002`
- **Status:** aprovado
- **Página:** navbar global
- **Funcionalidade:** ordem e agrupamento dos menus principais
- **Depende de:** nenhuma (navbar sempre presente)
- **Arquivo de teste:** `e2e/specs/nav/02-ordem-menus.spec.ts`
- **Referência:** [funcionalidades.md](../../../../docs/produto/funcionalidades.md)

## Ambiente de teste

- **Base de dados:** `backend/data/test/carteira.db` (recriada no `pretest:ui`)
- **URLs:** frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`

## Cenário — Ordem dos menus principais

**Como** investidor  
**Quero** uma navegação organizada por finalidade  
**Para** encontrar rapidamente cada área do app

### Passo a passo

1. Abro qualquer página do app.
2. Os menus principais aparecem na ordem: **Dashboard**, **Visão consolidada**, **Carteira**, **Banco de dados**, **Ferramentas**, **Financeiro**.

## Cenário — Agrupamento Carteira

1. Abro o menu **Carteira** (passar o mouse sobre o item).
2. Contém **Carteiras**, **Rebalanceamento**, **Análise de ativos** e **Proventos**.
3. Não contém «Gerenciamento de objetivos» nem «Taxas cripto» (estes ficam em Ferramentas).

## Cenário — Agrupamento Banco de dados

1. Abro o menu **Banco de dados** (passar o mouse sobre o item).
2. Contém **Ativos** e **Dados**.

## Cenário — Agrupamento Ferramentas

1. Abro o menu **Ferramentas**.
2. Contém **Gerenciamento de objetivos**, **Taxas bitcoin**, **Financiamento imóvel** e **Cálculo de preço médio**.
3. «Gerenciamento de objetivos» abre `/ferramentas/objetivos`.
4. «Taxas bitcoin» abre `/ferramentas/bitcoin`.

## Notas para automação

- Ordem verificada por posição horizontal (`boundingBox().x`) dos gatilhos de menu.
- Itens de dropdown ficam visíveis após passar o mouse sobre o gatilho do menu (`dropdown-hover`).

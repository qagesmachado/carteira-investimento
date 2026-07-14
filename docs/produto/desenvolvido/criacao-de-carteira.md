# Criação de Carteira

## Objetivo

Permitir que o usuário crie e gerencie múltiplas carteiras dentro do mesmo aplicativo.

Uma carteira representa um agrupamento de posições com finalidade própria. Ela pode ser usada para separar pessoas, objetivos, estratégias ou contextos diferentes.

## Exemplos de carteiras

- Carteira pessoal.
- Carteira do cônjuge.
- Carteira dos filhos.
- Carteira de aposentadoria.
- Carteira de reserva de emergência.
- Carteira de longo prazo.
- Carteira de testes ou simulações.

## Por que isso é necessário

A planilha atual representa uma única visão consolidada. Na aplicação, é importante suportar mais de uma carteira para:

- Controlar investimentos de pessoas diferentes.
- Separar objetivos diferentes.
- Manter estratégias independentes.
- Exibir dashboards filtrados por carteira.
- Calcular rebalanceamento por carteira.
- Consolidar ou separar patrimônio conforme o contexto.

## Dados da carteira

Campos sugeridos:

- Nome da carteira.
- Descrição.
- Pessoa ou titular associado.
- Objetivo da carteira.
- Moeda base.
- Status: ativa, arquivada ou simulação.
- Data de criação.
- Observações.

## Interface web (implementado)

### Hub (`/portfolios`)

- Lista carteiras em **cards** com total aplicado, total atual, lucro (BRL) e **perfil de balanceamento** (texto + link para Rebalanceamento).
- Detalhe das metas por classe (com ícones) aparece no modal **Editar**; sub-divisão ETF/Ação só em Rebalanceamento → Configuração.
- A carteira **em uso** no app (dashboard, consolidada, etc.) aparece com **borda destacada** no card — sem badge «Ativa» repetido.
- Carteiras de **simulação** ou **arquivadas** exibem badge de status.
- Botão **Nova carteira** abre modal guiado:
  - **Perfil de investidor:** Conservador, Moderado, Arrojado, Personalizado (define `allocation_targets_json`).
  - **Personalizado:** sliders editáveis por classe (soma deve ser 100%); ponto de partida = metas Moderado (55/20/15/7/3); split ETF/Ação permanece 70/30 (padrão) e só é ajustável em Rebalanceamento → Configuração.
  - **Demais perfis:** preview com ícones e barras estáticas conforme o preset escolhido.
  - **Tipo de carteira:** Pessoal, Cônjuge, Filhos, Aposentadoria, Reserva de emergência, Longo prazo, Simulação.
- **Gerenciar posições** abre `/portfolios/{id}` e define a carteira como ativa.
- **Editar** no card abre modal para atualizar nome, titular, objetivo e **trava de exclusão** (útil em carteiras antigas sem metadados).
- **Excluir** no card pede confirmação («Excluir carteira … e todas as posições?») e remove a carteira com cascade (posições e proventos vinculados), salvo se a trava estiver ativa.

### Posições (`/portfolios/{id}`)

- Conferir e gerenciar posições da carteira (tabela, modais, resumos).
- **Alterar o nome** no card «Carteira ativa» → **Salvar** (`PATCH /portfolios/{id}`). Nomes únicos; conflito → 409.
- Seletor de carteira + link «Todas as carteiras» de volta ao hub.

## Configurações da carteira

Cada carteira pode ter configurações próprias:

- Classes de ativo permitidas.
- Percentual alvo por classe.
- Moeda base de visualização.
- Preferência de consolidação no dashboard.
- Se entra ou não no patrimônio total consolidado.

## Relação com ativos

Uma carteira não cadastra o ativo na base global. Ela apenas usa ativos já existentes no banco de dados.

Fluxo esperado:

1. Criar carteira.
2. Buscar ativo na base de dados.
3. Adicionar ativo à carteira com dados da posição.

O mesmo ativo pode aparecer em várias carteiras com quantidades, preços médios e objetivos diferentes.

## Relação com dashboard

O dashboard inicial deve permitir selecionar a carteira ativa.

Comportamento esperado:

- Dropdown para selecionar uma carteira.
- Opção futura para visão consolidada de todas as carteiras, se fizer sentido.
- Indicadores, gráficos, proventos e rebalanceamento devem respeitar a carteira selecionada.
- Ao trocar a carteira, todos os blocos do dashboard devem ser recalculados para aquela carteira.

## Regras funcionais

- Deve ser possível criar mais de uma carteira.
- Cada carteira deve ter nome único dentro do contexto do usuário.
- Cada carteira pode ter metas de alocação próprias.
- Uma posição pertence a uma carteira específica.
- O mesmo ativo da base pode ser usado em múltiplas carteiras.
- Dashboard e rebalanceamento devem sempre considerar a carteira selecionada.

## Fora de escopo inicial

- Permissões entre usuários.
- Compartilhamento de carteira.
- Consolidação familiar avançada.
- Auditoria de alterações por usuário.

## Persistência local

Carteiras e posições **não** são versionadas no Git. Ficam no banco unificado `carteira.db` (ver [Persistência — banco único](persistencia-banco-unico.md)).

A base de ativos (`carteira.db` / `DATABASE_URL`) é o catálogo compartilhado do aplicativo; ver [Cadastro de ativos no banco de dados](desenvolvido/cadastro-ativos-banco-de-dados.md).

## Exportação e importação

- **Exportar:** gera arquivo JSON (`.carteira.json`) com metadados da carteira, snapshot dos ativos usados e posições (referência por ticker).
- **Importar:** envia o JSON; ativos ausentes na base podem ser criados (com lookup); divergências exibem tabela de conferência campo a campo (manter base / usar arquivo).
- Detalhes da API: [Carteiras, posições e import/export](desenvolvido/carteiras-posicoes-import-export.md).

## Interface web

- **Hub:** `/portfolios` — cards, modal de criação, `GET /portfolios/summaries`.
- **Posições:** `/portfolios/{id}` — listar posições, renomear/excluir carteira, import/export (ver [Carteiras, posições e import/export](desenvolvido/carteiras-posicoes-import-export.md)).
- Carteira ativa: `PUT /portfolios/active`.

## Critérios de aceite

- O usuário consegue criar uma carteira com nome e objetivo.
- O usuário consegue visualizar uma lista de carteiras.
- O usuário consegue selecionar uma carteira ativa.
- O usuário consegue exportar e importar uma carteira em JSON.
- O dashboard consegue filtrar os dados pela carteira selecionada (futuro).
- O rebalanceamento pode ser calculado por carteira (futuro).

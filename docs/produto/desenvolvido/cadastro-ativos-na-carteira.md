# Cadastro de Ativos na Carteira

## Objetivo

Registrar que uma carteira possui determinado ativo, informando os dados pessoais da posição.

Essa funcionalidade não cria o ativo na base global. Ela vincula um ativo já existente no banco de dados a uma carteira específica.

## Diferença para cadastro na base

Cadastro na base:

- Define o que é o ativo.
- Pode ser preenchido por API.
- Guarda tipo, país, moeda, CNPJ, setor, fonte de cotação e classificação.

Cadastro na carteira:

- Define que uma carteira possui aquele ativo.
- Guarda dados pessoais da posição.
- Pode variar entre carteiras para o mesmo ativo.

## Fluxo principal

O botão **Adicionar ativo à carteira** abre um modal que pergunta o tipo:
**Bolsa**, **Renda fixa** ou **Previdência** (Bolsa = tudo que não é renda fixa
tradicional nem previdência).

Para **bolsa** (ação, ETF, FII, cripto, etc.):

1. Usuário seleciona a carteira ativa.
2. Usuário busca um ativo já existente na base de dados.
3. Usuário informa quantidade e preço médio.
4. Sistema passa a considerar o ativo nos cálculos daquela carteira.

Para **renda fixa tradicional e previdência**, o cadastro é unificado: o produto e
a posição são criados na mesma tela, sem passar por `/assets`. Ver
[Cadastro unificado de renda fixa e previdência na carteira](cadastro-rf-previdencia-na-carteira.md).

## Dados da posição

Campos sugeridos:

- Carteira.
- Ativo.
- Quantidade.
- Preço médio.
- Data de entrada ou primeira compra.
- Custódia do usuário.
- Objetivo vinculado, quando aplicável.
- Observações pessoais.
- Status da posição: ativa, encerrada ou acompanhada.

Para ativos de renda fixa tradicional (CDB, LCI, LCA, Tesouro Selic etc.) e previdência privada, a posição usa campos manuais em vez do modelo de quantidade e preço médio, informados junto do cadastro do produto:

- Valor aplicado.
- Valor atual, atualizado manualmente.
- Rendimento contratado, inicialmente como texto livre.

Esses campos pertencem à posição porque podem variar por carteira, aporte, vencimento ou contrato.

## Cálculos derivados

A partir dos dados da posição e do cadastro do ativo, a aplicação pode calcular:

- Valor aplicado.
- Valor atual.
- Valorização.
- Retorno total.
- Percentual dentro da carteira.
- Valor faltante ou excedente em relação ao rebalanceamento.

Para renda fixa/previdência manual, o valor aplicado e o valor atual são informados diretamente na posição. A valorização e o retorno total são calculados pela diferença entre esses dois valores.

## Classificação na carteira

A posição deve usar a classificação definida no cadastro do ativo.

Exemplos:

- ETF nacional de renda variável aparece em ações/ETFs BR.
- ETF nacional de renda fixa aparece em renda fixa.
- ETF internacional aparece em internacional.
- Bitcoin aparece em criptoativos.

Essa regra evita que o mesmo ativo seja classificado manualmente de formas diferentes em cada carteira.

## Objetivos financeiros

Uma posição pode ser vinculada a um objetivo financeiro.

Exemplo:

- Carteira: `Pessoal`.
- Ativo: `AUPO11`.
- Classificação do ativo: ETF nacional de renda fixa.
- Objetivo: reserva de emergência.

Mesmo vinculado a um objetivo, o valor continua compondo renda fixa na carteira e no rebalanceamento.

## Atualização de cotação

Para **ações, ETFs, FIIs e cripto**, o valor atual da posição **não** é gravado na posição. Ele é calculado na exibição:

- **Valor aplicado** = quantidade × preço médio
- **Valor atual** = quantidade × `current_quote` do ativo na base global (`Asset`)

A cotação em `Asset` é atualizada pelo botão **Atualizar cotações** na carteira ativa (`POST /portfolios/{id}/quotes/refresh`), que consulta o provedor (yfinance) para cada ativo da carteira com mercado. Renda fixa e previdência são ignoradas nesse fluxo.

Para **renda fixa/previdência**, valor aplicado e valor atual continuam manuais na posição.

Comportamentos esperados (evolução futura):

- Atualização de cotação por ativo no detalhe da posição.
- Indicação de data/hora da última atualização por ativo.
- Uso de cotação fixa/manual quando necessário.

## Regras funcionais

- Uma posição sempre pertence a uma carteira.
- Uma posição sempre referencia um ativo da base.
- O mesmo ativo pode estar em múltiplas carteiras.
- Quantidade e preço médio são dados da carteira, não da base global do ativo.
- A classificação da posição vem do cadastro do ativo.
- Objetivo financeiro não altera a classe do ativo.
- Dashboard e rebalanceamento devem considerar apenas posições da carteira selecionada.

## Persistência

Posições ficam no banco unificado (`carteira.db`), não no repositório Git. Cada posição referencia `asset_id` da base global de ativos.

## Importação de carteira

Ao importar um arquivo `.carteira.json`:

1. Ativos do pacote são comparados com a base global.
2. Se o ticker não existir, o fluxo permite criá-lo (lookup + revisão, alinhado ao cadastro em lote).
3. Se existir com campos diferentes, o usuário escolhe por campo: manter base ou usar valor do arquivo.
4. Após resolver ativos, as posições são gravadas na carteira importada ou criada.
5. Se o **nome da carteira** no JSON já existir localmente, o sistema cria com sufixo automático: `Nome (2)`, `Nome (3)`, etc., e informa na mensagem de sucesso.
6. Erros da API (ex.: conflito de ativo) aparecem na tela com texto legível, não mensagem genérica.

Ver [Carteiras, posições e import/export](desenvolvido/carteiras-posicoes-import-export.md).

## Interface web (`/portfolios`)

- **Renomear carteira ativa:** no card «Carteira ativa», clicar em **Editar**, alterar o campo Nome e clicar em **Salvar**; a confirmação é obrigatória e o campo volta a ficar bloqueado após salvar.
- Adicionar posição: botão **Adicionar ativo à carteira** abre um modal com seletor de tipo (**Bolsa / Renda fixa / Previdência**).
- **Bolsa:** selecionar ativo da base com **busca por ticker ou nome** e informar **quantidade** (notação BR, ex.: `1,88637`) e preço médio (rótulo e tabela mostram a **moeda** do ativo: BRL, USD, etc.). O seletor de ativos não lista renda fixa tradicional nem previdência.
- **Quantidade fracionária (notação BR):** digitar `1,88637`; a interface exibe `1,88637`; a API grava `1.88637`.
- **Renda fixa / Previdência:** preencher os dados do produto (identificador, descrição, tipo de título, indexador, rentabilidade, datas, emissor) e os valores **Valor aplicado** e **Valor atual** na mesma tela; o sistema cria produto + posição numa única ação.
- **Preço médio (notação BR):** digitar `1234,56`; a interface exibe `1.234,56`; a API grava `1234.56` (float com ponto).
- **Valores manuais (notação BR):** digitar `1234,56`; a interface exibe `1.234,56`; a API grava `1234.56` (float com ponto).
- Botão **Atualizar cotações** no card Posições: atualiza `current_quote` na base para ativos com mercado da carteira ativa; mensagem com quantidade atualizada, ignorada e falhas.
- Tabela com colunas: Ativo, **Tipo**, Moeda, Qtd, Valor aplicado, Valor atual, Rendimento e Lucro.
- **Busca** na tabela de posições já adicionadas: filtra por ticker ou nome do ativo (campo «Buscar» acima da grade).
- **Ordenação** por coluna: clique no cabeçalho alterna ascendente/descendente (indicador ▲/▼ na coluna ativa); coluna de ações (Detalhes/Editar/Remover) não é ordenável.
- **Detalhes** por posição: botão «Detalhes» abre uma segunda linha na tabela com painel expansível exibindo preço médio de compra, preço atual (cotação unitária), quantidade, totais aplicado/atual/lucro e metadados da posição (custódia, data de entrada, objetivo, notas, setor) quando preenchidos. Para renda fixa e previdência, o painel mostra valores manuais e indica que preço unitário não se aplica. **Proventos** (dividendos recebidos) aparecem como funcionalidade futura («Em breve»).
- **Lucro** (todos os tipos com valores conhecidos): `valor atual − valor aplicado` e percentual sobre o aplicado; exibe `—` se faltar cotação (ativos negociados) ou valores manuais incompletos.
- **Resumo** abaixo da tabela: contagem por tipo de ativo (ex.: `Ação: 7 · ETF: 4`) e totais por moeda (aplicado, atual e lucro), sem conversão cambial entre moedas. O resumo reflete **apenas as linhas visíveis** após busca ou filtro.
- **Editar** posição: para renda fixa/previdência reabre o formulário completo (produto + valores) e salva produto e posição juntos; para os demais edita quantidade e preço médio. **Remover** posição.
- Uma posição por par (carteira, ativo).
- Menu **Carteira** no cabeçalho: Carteiras; catálogo global de ativos em **Banco de dados → Ativos**.

## Critérios de aceite

- O usuário consegue adicionar um ativo da base a uma carteira.
- O usuário consegue informar quantidade, preço médio e custódia da posição.
- O usuário consegue informar valor aplicado, valor atual e rendimento contratado para renda fixa tradicional e previdência.
- O mesmo ativo pode ser adicionado em carteiras diferentes com dados diferentes.
- Um ETF nacional de renda fixa adicionado à carteira aparece em renda fixa.
- Uma posição vinculada a objetivo continua entrando na classe correta da carteira.
- Na importação de carteira, conflitos de metadados do ativo na base são resolvidos em tabela de conferência.

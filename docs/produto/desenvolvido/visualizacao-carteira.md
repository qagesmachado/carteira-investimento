# Visualização da carteira (consolidada)

## Objetivo

Oferecer uma **visão operacional** da carteira selecionada em que **todas as posições** aparecem numa **única tabela**, equivalente à união do que hoje está espalhado em **várias abas** na planilha. O usuário deve conseguir comparar aplicado e atual, moeda, classe e desempenho sem trocar de contexto, com leitura rápida e totais coerentes.

Esta especificação descreve o comportamento desejado do produto; não inclui decisão de stack, contratos de API ou datas de entrega.

## Referências na planilha

Na planilha, posições e análises costumam aparecer **separadas por abas**, por exemplo:

- `Ações`
- `Fundos`
- `Internacional`
- `Bitcoin`
- `Renda Fixa`
- `Previdência`
- E fluxos especiais (ex.: `AUPO11AREA11` para ETFs de renda fixa por objetivo)

Na aplicação, **não** se reproduz a mesma segmentação por abas como estrutura principal. Em vez disso, há **uma grade única**; o recorte “como na planilha” é obtido por **filtros** (tipo de ativo, classe de exibição, moeda, texto no ticker/nome, etc.).

## Relação com o que já existe no app

A visão consolidada complementa a tela atual de **posições por carteira** ([cadastro na carteira](desenvolvido/cadastro-ativos-na-carteira.md)):

- **Cadastro global** do ativo define tipo, moeda e classificação.
- **Posição** traz quantidade, preço médio ou valores manuais (renda fixa/previdência).
- **Valor atual** de ativos cotados segue a lógica já descrita na documentação de posições (cotação no ativo × quantidade, etc.).

A nova tela organiza esses mesmos dados num formato de **exploração** (filtro, ordenação, colunas de conversão), não substitui obrigatoriamente o fluxo de edição de posições.

## O que a tela deve entregar (produto)

### Tabela única

- Todas as posições da **carteira ativa** numa única listagem.
- Colunas de referência (mínimo conceitual — nomes finais podem variar na UI):

  | Conceito | Conteúdo esperado |
  | -------- | ----------------- |
  | Identificação | Ticker ou identificador do ativo, nome quando útil |
  | Classificação | Tipo e/ou classe de exibição conforme cadastro (`display_class`, tipo de ativo) |
  | Moeda da posição | Moeda do ativo (BRL, USD, …) |
  | Quantidade / campos específicos | Quantidade × preço onde aplicável; campos manuais para RF/previdência conforme regra atual |
  | Valor aplicado | Na moeda da posição |
  | Valor atual | Na moeda da posição, quando calculável |
  | Lucro ou variação | Onde fizer sentido (regras alinhadas ao que já existe na carteira) |

- **Totalização** no rodapé ou painel complementar: somas na moeda original por agrupamento e, quando a conversão estiver ativa (ver abaixo), **totais em BRL** (e opcionalmente outra visualização, a decidir).

### Filtros

- Busca por **texto** (ticker, parte do nome do ativo ou identificador manuais).
- Filtro por **tipo de ativo** ou **classe de exibição** (alinhar aos campos já usados no cadastro).
- Filtro por **moeda** do ativo (ex.: só USD, só BRL).
- Filtros adicionais podem evoluir (ex.: apenas com cotação, apenas renda fixa).

### Ordenação

- **Ordenação por coluna** na tabela: clique no cabeçalho com alternância ascendente/descendente.
- Coluna de ações (Detalhes) não é ordenável.

### Detalhes por posição

- Botão **Detalhes** na última coluna abre painel expansível na linha seguinte, com preço médio de compra, preço atual (cotação unitária), quantidade, totais e metadados (custódia, data de entrada, objetivo, notas, setor) quando preenchidos — mesma lógica da tela `/portfolios`.
- Em ativos USD, o painel pode exibir equivalente em BRL quando a taxa USD/BRL estiver disponível.
- **Proventos** (dividendos recebidos) listados como funcionalidade futura («Em breve»).

### Botões de atualização

A visão em tabela única deve oferecer **dois** comandos explícitos (por exemplo numa barra ao lado do título ou acima da grade), para o usuário não depender de outra tela:

1. **Atualizar cotações** — **mesma função** já prevista no card **Posições** da carteira: atualiza as cotações dos ativos da carteira ativa na base (fluxo `POST /portfolios/{id}/quotes/refresh`, provedor tipo yfinance; ignora renda fixa e previdência). Após sucesso, a tabela consolidada reflete novos **valores atuais** nas moedas originais. Ver [Cadastro de ativos na carteira](desenvolvido/cadastro-ativos-na-carteira.md).

2. **Atualizar câmbio (USD/BRL)** — **ação manual** dedicada à **taxa real/dólar** usada apenas para **conversão apresentacional** (colunas em reais e totais em BRL). Dispara uma nova busca da taxa na fonte configurada, atualiza o valor armazenado ou em cache da aplicação e o **timestamp** mostrado ao usuário; em seguida **recalcula** equivalentes em reais na grade. Não altera cadastro de ativos nem posições.

Comportamento esperado do par de botões:

- Podem ser acionados em qualquer ordem; o usuário pode atualizar só cotações, só câmbio ou ambos.
- Estados de carregamento e mensagens de sucesso/erro devem ser **independentes** (ex.: cotações ok e câmbio falhou continua mostrando a última taxa válida com aviso).

### Moeda original e conversão para real

- **Valores na moeda da posição** permanecem visíveis (transparência para quem comprou em dólar).
- **Coluna(s) ou modo de exibição** com **equivalente em BRL** para posições cuja moeda não seja BRL, usando uma **taxa USD→BRL** (para a primeira versão, foco em **dólar**; outras moedas na seção de pendências).
- A interface deve mostrar **de forma explícita** qual **cotação de câmbio** foi usada e **quando** foi obtida (data e, se aplicável, hora), para o usuário julgar se o número é “de fechamento”, “intraday”, etc.

Conversão é **apresentacional e analítica** para esta visão: não altera a gravação da posição nem substitui a moeda do ativo no cadastro.

## Câmbio (USD em BRL)

### Necessidade

Para somar internacional (e outros ativos em USD) com o restante da carteira em **um patrimônio em reais**, é necessário um **preço de referência** do par **USD/BRL** (ou equivalente aceito pelo produto).

### Fonte de dados

- Deve ser possível obter a taxa de uma **fonte pública ou serviço confiável** (ex.: séries do Banco Central, provedor de mercado, API agregadora).
- **Não** se fixa neste documento qual API será usada; a escolha envolve disponibilidade, termos de uso, limite de requisições e formato dos dados.

### Frequência de atualização

O produto menciona **atualização diária** ou **a cada hora**. Trade-offs típicos:

| Frequência | Vantagem | Desvantagem |
| ---------- | -------- | ------------- |
| Diária | Menos chamadas à API, mais estável para “visão patrimonial” do dia | Menos aderência a movimentação intraday do dólar |
| Horária | Números mais próximos do mercado durante o pregão | Mais carga, mais limites de API, necessidade de fila/cache |

A decisão entre **diária** e **horária** (ou outra periodicidade) fica como **decisão de produto e engenharia** na implementação, podendo haver configuração futura.

### Requisito mínimo

- Guardar ou exibir **timestamp** da última **taxa USD/BRL** utilizada na conversão (separado do timestamp das cotações de ativos).
- Oferecer **atualização manual** da taxa pelo botão **Atualizar câmbio (USD/BRL)** descrito acima, além de qualquer rotina automática (diária/horária) definida na implementação.
- A atualização de **cotações dos ativos** continua responsabilidade do botão **Atualizar cotações** (não confundir os dois fluxos).

## Fora de escopo da primeira versão desta tela (documento de produto)

Os itens abaixo podem ser desejáveis depois; não fazem parte do núcleo acima:

- Gráficos ou dashboards analíticos profundos (ficam no [Dashboard inicial](dashboard-inicial.md) ou telas dedicadas).
- Exportação para Excel/CSV (pode vir em iter seguinte).
- Edição em massa de posições direto na grade.
- Conversão fiscal ou histórico de câmbio por competência (ex.: para IR).
- Consolidado automático de **todas** as carteiras numa única tabela (a visão descrita aqui parte da **carteira selecionada**, alinhada ao restante do app).

## Perguntas em aberto

Antes de implementar, vale fechar:

1. **Par e convenção**: apenas **USD/BRL** na v1 ou já prever **EUR**, **cripto** em moeda de cotação separada?
2. **Totais**: além do equivalente em BRL por linha, exibir um **patrimônio total só em USD** para quem prefere acompanhar a carteira internacional na moeda original agregada?
3. **Precisão**: arredondamento por posição vs arredondar só o total (impacta reconciliação com planilha).
4. **Fonte de câmbio**: critérios legais ou preferência institucional (ex.: PTAX vs fechamento vs spot)?
5. **Momento da taxa**: mesmo horário para todas as linhas na tabela ou permitir “última conhecida” por sessão?

## Ligação com outros documentos

- [Funcionalidades candidatas](funcionalidades.md) — seção «Carteira de investimentos»: referência cruzada à visão consolidada.
- [Cadastro de ativos na carteira](desenvolvido/cadastro-ativos-na-carteira.md) — base de dados por posição.
- [Dashboard inicial](dashboard-inicial.md) — visão executiva; a tabela consolidada é complementar e mais detalhada por linha.

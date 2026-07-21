# Funcionalidades Candidatas

Este documento traduz a planilha em módulos e telas possíveis para uma aplicação. As funcionalidades abaixo ainda não representam escopo fechado de desenvolvimento; elas servem para organizar o produto antes de discutir stack ou implementação.

## Mapa de navegação (menus do app)

A barra de navegação organiza as áreas implementadas nesta ordem e hierarquia:

| Ordem | Menu | Itens | Rotas |
| ----- | ---- | ----- | ----- |
| 1 | Dashboard | — | `/dashboard` |
| 2 | Visão consolidada | — | `/consolidada` |
| 3 | Carteira | Carteiras · Rebalanceamento · Análise de ativos · Proventos | `/portfolios` · `/rebalanceamento` · `/analise` · `/proventos` |
| 4 | Banco de dados | Ativos · Dados | `/assets` · `/dados` |
| 5 | Ferramentas | Gerenciamento de objetivos · Taxas cripto · Financiamento imóvel · Cálculo de preço médio · Conferência anual de IR · Controle de patrimônio | `/ferramentas/objetivos` · `/ferramentas/criptomoedas` · `/ferramentas/financiamento-imovel` · `/ferramentas/calculo-preco-medio` · `/ferramentas/conferencia-ir` · `/ferramentas/controle-patrimonio` |
| 6 | **Financeiro** | Painel · Orçamento · Despesas · Controle · Metas (+ Tags) · Renda · Perfis | `/financeiro` · `/financeiro/orcamento` · `/financeiro/despesas` · `/financeiro/controle` · `/financeiro/metas` · `/financeiro/renda` · `/financeiro/perfis` |

As seções numeradas a seguir descrevem os módulos por domínio (origem na planilha) e podem ser lidas independentemente da posição no menu.

## 1. Dashboard inicial

Detalhamento: [Dashboard inicial](dashboard-inicial.md) · **Implementado (Tier 1+2):** [desenvolvido/dashboard-inicial.md](desenvolvido/dashboard-inicial.md) · **Futuro:** [candidato/dashboard-tier-3.md](candidato/dashboard-tier-3.md)

**Status:** parcial — rota `/dashboard` com patrimônio, alocação, proventos agregados, aderência ao rebalanceamento, gráfico 12 meses e drill-down. Evolução patrimonial e widget de objetivos permanecem candidatos (Tier 3).

Origem na planilha:

- `RESUMO`
- `BALANCEAMENTO`
- `PATRIMÔNIO TOTAL`
- `Proventos Cálculos`
- `Proventos Cálculos internaciona`

Objetivo: apresentar uma visão executiva da carteira, respondendo quanto tenho, como está distribuído, quanto recebi de proventos, como evoluiu meu patrimônio e onde devo aportar.

Funcionalidades:

- Exibir patrimônio total.
- Exibir divisão da carteira por classe de ativo.
- Exibir proventos por mês, ano ou período customizado usando filtros sobre a mesma base de dados.
- Exibir comparação entre alocação atual e desejada.
- Exibir evolução patrimonial anual, com filtros por ano, intervalo de anos, valor absoluto e percentual de valorização.
- Destacar classes ou ativos que precisam de aporte para rebalanceamento.
- Somar ETFs de renda fixa por objetivo, como `AUPO11AREA11`, dentro da classe renda fixa para carteira e rebalanceamento.

Possíveis telas:

- Visão geral.
- Proventos do ano.
- Alocação por classe.
- Evolução patrimonial.

## 2. Cadastro de ativos e carteiras

Detalhamento:

- [Cadastro de ativos e carteiras](cadastro-de-ativos.md)
- [Cadastro de ativos no banco de dados](cadastro-ativos-banco-de-dados.md)
- [Criação de carteira](criacao-de-carteira.md)
- [Cadastro de ativos na carteira](cadastro-ativos-na-carteira.md)
- [Cadastro unificado de renda fixa e previdência na carteira](desenvolvido/cadastro-rf-previdencia-na-carteira.md)

Origem na planilha:

- `DB Ativos`
- `Análise de açõesetf br`
- `Análise etf`
- `Análise de fundos`

Objetivo: separar dados globais dos ativos, criação de carteiras e cadastro de posições dentro de cada carteira. Isso permite controlar carteiras de pessoas diferentes ou com objetivos diferentes no mesmo aplicativo.

Funcionalidades:

- Buscar ativo por ticker, nome ou identificador e preencher dados públicos via API de terceiros sempre que possível.
- Cadastrar ativo na base por fluxo guiado: tipo do ativo, local nacional ou internacional, país quando aplicável e dados específicos.
- Classificar ativo por tipo, mercado, moeda e classe de exibição na carteira.
- Exigir subtipo para ETF nacional: renda variável ou renda fixa.
- Permitir salvar o ativo apenas na base de dados, mesmo sem estar em carteira.
- Exportar e importar carteira em JSON, criando ativos ausentes na base e resolvendo conflitos de metadados em tabela de conferência.
- Editar ou excluir um ativo já persistido na base (ex.: `PATCH` e `DELETE` na API local).
- Na interface de cadastro, exibir tickers da B3 **sem** sufixo `.SA`, mesmo quando a fonte externa ou o banco usem o formato Yahoo (`PETR4.SA`).
- Permitir criar múltiplas carteiras.
- Permitir adicionar um ativo da base a uma carteira específica, informando quantidade, preço médio, custódia e dados pessoais da posição.
- Registrar fonte ou estratégia de cotação, permitindo integração com fonte pública, atualização automática, atualização manual ou cotação fixa/manual.
- Registrar links ou fontes de consulta.
- Registrar dados fiscais do ativo.
- Persistir os dados em banco de dados a ser definido.

Campos fiscais importantes:

- CNPJ da empresa ou fundo.
- CNPJ da fonte pagadora.
- Nome da fonte pagadora.
- Custódia.

Observação: o cadastro deve permitir que o CNPJ do ativo e o CNPJ da fonte pagadora sejam diferentes.

Regra importante: a classificação definida na base de ativos determina onde o ativo aparece em qualquer carteira e no rebalanceamento. Se um ETF nacional for marcado como renda fixa, ele deve compor renda fixa. Dados públicos devem vir de API quando possível; dados pessoais da posição pertencem ao cadastro do ativo na carteira.

## 3. Carteira de investimentos

Origem na planilha:

- `Ações`
- `Fundos`
- `Internacional`
- `Bitcoin`
- `Renda Fixa`
- `Previdência`
- `AUPO11AREA11`, como origem de posições de ETF de renda fixa divididas por objetivo.

Objetivo: controlar posições atuais e desempenho por carteira, usando a classificação definida no cadastro do ativo.

Detalhamento da **visão consolidada em tabela única** (filtros, ordenação, conversão USD→BRL para totais): [Visualização da carteira (consolidada)](visualizacao-carteira.md).

Funcionalidades:

- Registrar quantidade e preço médio.
- Calcular valor aplicado.
- Calcular valor atual.
- Calcular valorização.
- Calcular retorno total incluindo proventos.
- Exibir percentual da posição na carteira.
- Comparar percentual atual com percentual desejado.
- Mostrar valor faltante ou excedente por ativo.
- Exibir ativos na classe correta conforme cadastro, incluindo ETFs nacionais de renda fixa dentro de renda fixa.
- Permitir atualização de cotações por rotina externa, periodicidade configurável ou botão de atualização na visão de carteira/detalhe do ativo.
- Permitir alternar entre carteiras para controlar pessoas ou objetivos diferentes.
- Visualizar todas as posições da carteira ativa numa **única tabela**, com filtros e ordenação por colunas, valores na moeda do ativo e equivalente em reais usando cotação de câmbio atualizável (ver [visualização consolidada](visualizacao-carteira.md)).

Possíveis telas:

- **Carteira consolidada (tabela única)** — visão analítica unificada; substitui na prática a navegação por abas separadas da planilha (detalhes em [visualizacao-carteira.md](visualizacao-carteira.md)).
- Carteira por classe (legado / planilha): seletor de carteira; telas ou filtros equivalentes a ações, fundos, internacional, cripto, renda fixa e previdência.
- Seletor de carteira.
- Ações e ETFs brasileiros.
- Fundos imobiliários.
- Internacional.
- Criptoativos.
- Renda fixa.
- Previdência.

## 5. Rebalanceamento

Detalhamento: **[desenvolvido/rebalanceamento.md](desenvolvido/rebalanceamento.md)** (implementado — MVP) · **Mockups (candidato):** [candidato/mockups/](candidato/mockups/) — variantes Hub e híbrido alinhadas ao Dashboard/Consolidada.

**Status:** parcial — `/rebalanceamento` com metas por classe, sub-divisão ETF/Ação, % desejada por ativo em **Ações/ETF BR** e **FIIs** (via Soma). Internacional/crypto permanecem só nível de classe. Redesign visual proposto em mockups (aguardando validação).

Origem na planilha:

- `BALANCEAMENTO`
- `Ações`
- `Fundos`
- `Internacional`
- `Bitcoin`
- `Renda Fixa`
- `AUPO11AREA11`, compondo a classe renda fixa por meio dos objetivos vinculados.

Objetivo: orientar aportes conforme a alocação desejada.

Funcionalidades:

- Definir percentual alvo por classe.
- Calcular valor alvo por classe.
- Calcular valor atual por classe.
- Calcular valor faltante.
- Exibir classes abaixo ou acima do alvo.
- Sugerir onde aportar primeiro.
- Considerar cotação do dólar para investimentos internacionais.
- Considerar cotação do bitcoin para cripto.
- Considerar ETFs de renda fixa por objetivo como parte da alocação de renda fixa.

Possíveis telas:

- Configuração de metas.
- Comparativo atual x desejado.
- Sugestão de aporte.

## 6. Objetivos financeiros

Detalhamento: **[desenvolvido/objetivos-financeiros.md](desenvolvido/objetivos-financeiros.md)** (implementado — MVP).

**Status:** parcial — `/ferramentas/objetivos` com alocação parcial por objetivo e modalidade **controle de aporte previdenciário** (meta 12% PGBL). Meta de valor alvo genérica e dashboard por objetivo permanecem candidatos. Ver [desenvolvido/controle-aporte-previdencia.md](desenvolvido/controle-aporte-previdencia.md).

Origem na planilha:

- `AUPO11AREA11`
- `Renda Fixa` (caixinhas por finalidade)

Objetivo: controlar **partes de uma mesma posição** para finalidades diferentes (reserva, viagem, aposentadoria), sem duplicar cadastro de ativo.

Funcionalidades:

- Criar objetivos por carteira (exceto «Livre», automático).
- Alocar ativo já em carteira: **cotas** para ações/ETF/FII/crypto; **valor (R$)** para RF e previdência.
- Objetivo «Livre» recebe o restante (sempre 100% da posição contabilizado).
- Visualizar posições por objetivo e valor agregado.
- Detectar divergência quando posição muda em outra tela (venda/aporte) e exigir reajuste manual.
- Excluir objetivo devolve alocações ao Livre.
- Modalidade **previdência**: informar renda bruta anual, total aportado no ano; calcular meta (12%), faltante e aporte mensal necessário.

Possíveis telas:

- Lista de objetivos da carteira.
- Detalhe por objetivo com alocações.
- Modal de alocação por ativo (cotas ou valor).

## 7. Proventos e renda passiva

Origem na planilha:

- `DB Proventos`
- `DB Proventos internacional`
- `Proventos Cálculos`
- `Proventos Cálculos internaciona`
- `RESUMO`

Objetivo: registrar e analisar proventos nacionais e internacionais.

Funcionalidades:

- Registrar provento por ativo.
- Registrar tipo de provento.
- Registrar data e valor.
- Classificar por mês e ano.
- Consolidar por ativo, classe e período.
- Separar proventos nacionais e internacionais.
- Exibir total mensal.
- Exibir total anual.
- Exibir histórico por classe: ações, FIIs, ETFs e total.

Possíveis telas:

- Lançamento de proventos.
- Calendário ou histórico de recebimentos.
- Relatório mensal.
- Relatório anual.
- Comparativo por classe de ativo.

## 8. Apoio à declaração de Imposto de Renda

Origem na planilha:

- `DB Ativos`
- `DB Proventos`
- `DB Proventos internacional`

Objetivo: facilitar conferência e organização das informações usadas na declaração de IR.

Funcionalidades:

- Manter dados fiscais por ativo.
- Manter dados fiscais por fonte pagadora.
- Relacionar proventos com fonte pagadora.
- Permitir divergência entre CNPJ do ativo/fundo e CNPJ da fonte pagadora.
- Gerar visão anual por ativo.
- Gerar visão anual por fonte pagadora.
- Apoiar conferência com informes de rendimentos.

Possíveis telas:

- Cadastro fiscal do ativo.
- Fontes pagadoras.
- Proventos para IR.
- Relatório anual de rendimentos.

## 9. Análise de ativos

**Status:** parcialmente implementado — [classificacao-ativos-acoes-br.md](desenvolvido/classificacao-ativos-acoes-br.md) (Ações/ETF BR), [classificacao-ativos-fiis.md](desenvolvido/classificacao-ativos-fiis.md) (FIIs) e [classificacao-ativos-etf-intl.md](desenvolvido/classificacao-ativos-etf-intl.md) (ETF internacional). **Mockup Ações/ETF BR (candidato):** [candidato/mockups/analise-acoes-br-hub.png](candidato/mockups/analise-acoes-br-hub.png) — layout no estilo Consolidada.

Origem na planilha:

- `Análise de açõesetf br` — **MVP**
- `DIAGRAMA AÇÕES` — **MVP**
- `Análise de fundos`, `DIAGRAMA FIIS` — **MVP FIIs**
- `Análise etf` — **MVP ETF internacional**
- `Perguntas` — candidato

Objetivo: apoiar decisão de investimento com critérios e pontuações.

Funcionalidades (MVP entregue):

- Critérios fundamentais (lucros, dívida, tag along, segmento) com scores 1–5.
- Questionário DIAGRAMA AÇÕES configurável.
- Viabilidade calculada por motor editável (pesos e faixas na UI).
- Telas `/analise/acoes-br`, `/analise/configuracao`.
- Atalho Classificar em carteiras.

Funcionalidades FIIs (entregue):

- Indicadores de viabilidade (vacância, qtd ativos, alavancagem, segmento) e viabilidade manual.
- Questionário DIAGRAMA FIIS (6 perguntas + flag P/VP > 1,5).
- Catálogo editável de segmentos.
- Telas `/analise/fiis`, `/analise/configuracao?perfil=fiis`, `/analise/fiis/segmentos`.
- Atalho Classificar para FIIs em carteiras.
- **% desejado por FII** no rebalanceamento (aba FII, via Soma).

Funcionalidades ETF internacional (entregue):

- Alocação manual por % desejado (soma 100% no grupo) e link externo opcional.
- Tela `/analise/internacional`.
- **% desejado por ETF** no rebalanceamento (aba ETF internacional).

Funcionalidades (fases posteriores):

- Preço teto por FII, ranking global.

## 10. Renda fixa

Origem na planilha:

- `Renda Fixa`
- `AUPO11AREA11`

Objetivo: acompanhar aplicações de renda fixa, vencimentos, liquidez e rentabilidade.

> Renda fixa tradicional (CDB, LCI, LCA, Tesouro etc.) e previdência têm cadastro
> **unificado** na carteira (`/portfolios`): produto e posição numa única ação, sem
> passar por `/assets`. Ver [Cadastro unificado de renda fixa e previdência na carteira](desenvolvido/cadastro-rf-previdencia-na-carteira.md).

Funcionalidades:

- Registrar descrição, tipo e indexador.
- Registrar local ou custódia.
- Registrar valor aplicado e valor atual.
- Registrar rendimento contratado ou observado.
- Calcular lucro líquido.
- Controlar liquidez.
- Controlar vencimento.
- Diferenciar CDB, LCI, ETF de renda fixa e outros tipos.
- Integrar ETFs de renda fixa com objetivos financeiros quando necessário.
- Mostrar ETFs de renda fixa por objetivo junto dos demais ativos de renda fixa, preservando a visão de caixinhas em uma tela própria.

Possíveis telas:

- Lista de renda fixa.
- Detalhe da aplicação.
- Vencimentos.
- Rentabilidade por indexador.
- Objetivos vinculados a ETFs de renda fixa.

## 11. Criptoativos e taxas

Origem na planilha:

- `Bitcoin`
- `Bitcoin taxas`

**Status:** parcial — `/ferramentas/criptomoedas` com posição, taxas CRUD e snapshot multi-ativo; ver [criptomoedas.md](desenvolvido/criptomoedas.md) e [analise-criptomoedas.md](desenvolvido/analise-criptomoedas.md).

Objetivo: acompanhar posição em BTC e custos de movimentação.

Funcionalidades:

- Registrar quantidade de BTC.
- Registrar preço médio em reais e dólar.
- Registrar cotação atual em reais e dólar.
- Calcular valor atual.
- Registrar taxas de compra.
- Registrar taxas de transferência.
- Calcular quantidade final após taxas.
- Calcular custo das taxas em reais e dólar.
- Calcular percentual de taxa.

Possíveis telas:

- Posição em BTC.
- Histórico de taxas.
- Rentabilidade de cripto.

## 12. Simulações e planejamento

Origem na planilha:

- `Simulação de dividendos`
- `Previdência`
- `PATRIMÔNIO TOTAL`

Objetivo: simular futuro financeiro e metas de longo prazo.

Funcionalidades:

- Definir capital inicial.
- Definir aporte mensal.
- Definir aporte extra.
- Definir saque.
- Definir valorização anual.
- Definir reajuste de aporte.
- Projetar capital futuro.
- Projetar renda passiva.
- Projetar evolução anual.
- Simular previdência com base em renda e meta de aporte.

Possíveis telas:

- Simulador de dividendos.
- Simulador de patrimônio.
- Planejamento de previdência.
- Cenários de independência financeira.

## 13. Relatórios

Objetivo: consolidar informações para análise e acompanhamento.

Relatórios candidatos:

- Patrimônio por ano.
- Evolução percentual por ano.
- Alocação atual por classe.
- Alocação desejada por classe.
- Proventos mensais.
- Proventos anuais.
- Proventos por fonte pagadora.
- Posições por custódia.
- Renda fixa por vencimento.
- Objetivos financeiros por valor atual.
- Ativos com recomendação de compra.

## 10. Privacidade visual — ocultar valores

Detalhamento: **[desenvolvido/ocultar-valores.md](desenvolvido/ocultar-valores.md)** (implementado).

**Status:** implementado — toggle na navbar oculta valores monetários em todas as telas; preferência em `localStorage`.

Funcionalidades:

- Botão olho no canto superior direito da navbar.
- Mascaramento global via formatadores de moeda (`R$ ••••••`, etc.).
- Persistência ao navegar entre páginas e recarregar o browser.
- Campos em edição continuam exibindo valor real.

## 11. Ícones de UI (Lucide)

Detalhamento: **[desenvolvido/icones-ui.md](desenvolvido/icones-ui.md)** (implementado).

**Status:** implementado — ícones decorativos e de ação no frontend usam [Lucide](https://lucide.dev/icons/) via `LucideIcon` e registro em `lucideIconCatalog.ts`. Galeria interna em `/dev/icones-lucide`.

## 14. Ferramentas — financiamento imóvel

Detalhamento: **[desenvolvido/controle-financiamento-imovel.md](desenvolvido/controle-financiamento-imovel.md)** (implementado).

**Status:** implementado — `/ferramentas/financiamento-imovel` com controle mensal por imóvel, KPIs bolso vs aluguel, gráficos e lançamentos extras por carteira.

Funcionalidades:

- Cadastrar múltiplos financiamentos por carteira (tipo de imóvel, parcela, aluguel).
- Lançamentos mensais com despesas/rendimentos extras e chamada de capital.
- Resumo consolidado e detalhe por imóvel (padrão Objetivos).
- Gráfico mensal/anual: gasto do bolso vs coberto pelo aluguel.

## 15. Ferramentas — cálculo de preço médio

Detalhamento: **[desenvolvido/calculo-preco-medio.md](desenvolvido/calculo-preco-medio.md)** (implementado).

**Status:** implementado — `/ferramentas/calculo-preco-medio` com calculadora de preço médio ponderado (modo manual e pré-preenchimento com posição da carteira).

Funcionalidades:

- Informar dois lotes (quantidade + preço médio) e ver quantidade total, preço médio e valor investido.
- Pré-preencher Lote 1 a partir de posição de mercado da carteira ativa.
- Sem persistência — resultado para uso manual na edição de posição.

## 16. Ferramentas — controle de patrimônio

Detalhamento: **[desenvolvido/controle-patrimonio.md](desenvolvido/controle-patrimonio.md)** (implementado).

**Status:** implementado — `/ferramentas/controle-patrimonio` com patrimônio investido automático e cadastro manual de reserva de emergência (banco, corretora ou dinheiro em espécie) por carteira.

Funcionalidades:

- Exibir patrimônio investido (todas as posições) e total geral (investido + manual).
- CRUD de reserva de emergência com localização (Banco, Dinheiro em espécie, Corretora).
- Cards de resumo por categoria.

## Mockups candidatos (redesign visual)

Propostas de layout para telas já funcionais, alinhadas ao padrão Hub do Dashboard e Consolidada. **Não implementados** — servem para validação antes de PR de redesign.

| Tela | Mockups | Pasta |
| ---- | ------- | ----- |
| Rebalanceamento | Hub completo e híbrido | [candidato/mockups/](candidato/mockups/) |
| Análise Sumário | Hub com KPIs e atalhos | [candidato/mockups/analise-sumario-hub.png](candidato/mockups/analise-sumario-hub.png) |
| Análise Ações/ETF BR | Filha modernizada (tabs mantidas) | [candidato/mockups/analise-acoes-br-hub.png](candidato/mockups/analise-acoes-br-hub.png) |

Índice e comparativo de variantes: [candidato/mockups/README.md](candidato/mockups/README.md).

## Priorização inicial sugerida

Uma possível ordem de construção futura, ainda sem compromisso técnico:

1. Cadastro de ativos e dados fiscais.
2. Carteira de posições.
3. Proventos.
4. Dashboard inicial.
5. Rebalanceamento.
6. Objetivos financeiros.
7. Análise de ativos.
8. Simulações.
9. Relatórios avançados para IR.

Essa ordem prioriza primeiro os dados-base que alimentam o restante da aplicação.

# Documentação da Carteira de Investimentos

Esta documentação registra o funcionamento atual da planilha `Investimento_controle.xlsx` e traduz suas abas para conceitos de uma futura aplicação.

Neste momento não há decisão de stack, banco de dados, framework ou arquitetura técnica de implementação. O foco é entender o produto: quais informações existem, quais cálculos são feitos, como as abas se relacionam e como isso pode virar módulos de aplicação.

## Documentos

- [Visão geral da planilha](planilha/visao-geral.md): agrupamento das abas, papéis funcionais e fluxo principal de informações.
- [Análise aba a aba](planilha/abas.md): objetivo, campos principais, dependências e possível representação de cada aba em uma aplicação.
- [Arquitetura funcional](arquitetura/arquitetura-funcional.md): domínios, entidades conceituais e fluxos funcionais observados.
- [Funcionalidades candidatas](produto/funcionalidades.md): módulos, telas e capacidades que a aplicação pode oferecer.

### Funcionalidades implementadas (por menu do app)

**Dashboard**

- [Dashboard inicial (Tier 1+2)](produto/desenvolvido/dashboard-inicial.md): visão executiva em `/dashboard` (implementado).

**Visão consolidada**

- [Visualização da carteira](produto/desenvolvido/visualizacao-carteira.md): visão consolidada de posições (implementado).

**Alocação**

- [Rebalanceamento](produto/desenvolvido/rebalanceamento.md): metas por classe, ETF/Ação e score por ativo (implementado).
- [Classificação de ativos — Ações/ETF BR](produto/desenvolvido/classificacao-ativos-acoes-br.md): análise fundamentalista e diagrama (implementado).
- [Classificação de ativos — FIIs](produto/desenvolvido/classificacao-ativos-fiis.md): viabilidade, diagrama FIIs e catálogo de segmentos (implementado).
- [Análise — Criptomoedas](produto/desenvolvido/analise-criptomoedas.md): alocação percentual por ativo na classe Criptomoeda (implementado).

**Cadastro**

- [Cadastro de ativos](produto/desenvolvido/cadastro-de-ativos.md): catálogo de mercado e posições por carteira (implementado).
- [Cadastro unificado de renda fixa e previdência na carteira](produto/desenvolvido/cadastro-rf-previdencia-na-carteira.md): CDB, LCI, LCA, Tesouro, previdência — produto + posição numa ação (implementado).
- [Cadastro de proventos](produto/desenvolvido/cadastro-proventos.md): lançamentos de dividendos e proventos por ativo (implementado).
- [Página Dados](produto/desenvolvido/pagina-dados.md): export/import centralizado em `/dados` (implementado).
- [Persistência — banco único](produto/desenvolvido/persistencia-banco-unico.md): SQLite unificado, FKs e migração legado (implementado).

**Ferramentas**

- [Objetivos financeiros](produto/desenvolvido/objetivos-financeiros.md): alocação parcial por objetivo em `/ferramentas/objetivos` (implementado).
- [Controle de aporte previdenciário](produto/desenvolvido/controle-aporte-previdencia.md): meta anual PGBL na modalidade de objetivo (implementado).
- [Criptomoedas — estratégia e taxas](produto/desenvolvido/criptomoedas.md): classificação, taxas e snapshot em `/ferramentas/criptomoedas` (implementado).
- [Controle de financiamento imóvel](produto/desenvolvido/controle-financiamento-imovel.md): ferramenta por carteira para bolso vs aluguel (implementado).
- [Cálculo de preço médio](produto/desenvolvido/calculo-preco-medio.md): calculadora ponderada em Ferramentas (implementado).
- [Controle de patrimônio](produto/desenvolvido/controle-patrimonio.md): patrimônio investido + reserva/espécie manual por carteira (implementado).

**Transversal**

- [Ícones de UI (Lucide)](produto/desenvolvido/icones-ui.md): padrão de ícones no frontend (implementado).
- [Ocultar valores monetários](produto/desenvolvido/ocultar-valores.md): privacidade visual global via navbar (implementado).

### Candidatos (não implementados)

- [Dashboard Tier 3 (candidato)](produto/candidato/dashboard-tier-3.md): evolução patrimonial e widget de objetivos (parcial — aderência e gráfico 12 meses já entregues).
- [Módulos Tier 4 (candidato)](produto/candidato/modulos-tier-4.md): simulações, IR e extensões de análise (parcial).

## Princípios da documentação

- Registrar primeiro o comportamento atual da planilha.
- Separar entrada manual, base auxiliar, cálculo e visualização.
- Evitar copiar a estrutura da planilha diretamente para a aplicação.
- Tratar dados fiscais como requisitos funcionais, principalmente para declaração de Imposto de Renda.
- Representar ativos híbridos, como ETFs de renda fixa usados por objetivo, sem perder suas duas naturezas.

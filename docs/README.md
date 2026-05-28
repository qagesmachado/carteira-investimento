# Documentação da Carteira de Investimentos

Esta documentação registra o funcionamento atual da planilha `Investimento_controle.xlsx` e traduz suas abas para conceitos de uma futura aplicação.

Neste momento não há decisão de stack, banco de dados, framework ou arquitetura técnica de implementação. O foco é entender o produto: quais informações existem, quais cálculos são feitos, como as abas se relacionam e como isso pode virar módulos de aplicação.

## Documentos

- [Visão geral da planilha](planilha/visao-geral.md): agrupamento das abas, papéis funcionais e fluxo principal de informações.
- [Análise aba a aba](planilha/abas.md): objetivo, campos principais, dependências e possível representação de cada aba em uma aplicação.
- [Arquitetura funcional](arquitetura/arquitetura-funcional.md): domínios, entidades conceituais e fluxos funcionais observados.
- [Funcionalidades candidatas](produto/funcionalidades.md): módulos, telas e capacidades que a aplicação pode oferecer.
- [Cadastro de proventos](produto/desenvolvido/cadastro-proventos.md): lançamentos de dividendos e proventos por ativo (implementado).
- [Dashboard inicial (Tier 1+2)](produto/desenvolvido/dashboard-inicial.md): visão executiva em `/dashboard` (implementado).
- [Classificação de ativos — Ações/ETF BR](produto/desenvolvido/classificacao-ativos-acoes-br.md): análise fundamentalista e diagrama (implementado).
- [Classificação de ativos — FIIs](produto/desenvolvido/classificacao-ativos-fiis.md): viabilidade, diagrama FIIs e catálogo de segmentos (implementado).
- [Rebalanceamento](produto/desenvolvido/rebalanceamento.md): metas por classe, ETF/Ação e score por ativo (implementado).
- [Objetivos financeiros](produto/desenvolvido/objetivos-financeiros.md): alocação parcial de posições por objetivo (implementado).
- [Persistência — banco único](produto/desenvolvido/persistencia-banco-unico.md): SQLite unificado, FKs e migração legado (implementado).
- [Página Dados](produto/desenvolvido/pagina-dados.md): export/import centralizado em `/dados` (implementado).
- [Dashboard Tier 3 (candidato)](produto/candidato/dashboard-tier-3.md): aderência no dashboard, evolução patrimonial, multi-carteira (não implementado).
- [Módulos Tier 4 (candidato)](produto/candidato/modulos-tier-4.md): simulações, IR e extensões de análise (parcial).

## Princípios da documentação

- Registrar primeiro o comportamento atual da planilha.
- Separar entrada manual, base auxiliar, cálculo e visualização.
- Evitar copiar a estrutura da planilha diretamente para a aplicação.
- Tratar dados fiscais como requisitos funcionais, principalmente para declaração de Imposto de Renda.
- Representar ativos híbridos, como ETFs de renda fixa usados por objetivo, sem perder suas duas naturezas.

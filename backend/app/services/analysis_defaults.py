from pydantic import BaseModel

from app.services.analysis_engine import (
    VIABILIDADE_CODE,
    AnalysisBlock,
    CriterionDefinition,
    TableDisplaySettings,
    ViabilityRule,
    build_score_option,
)


PROFILE_STOCK_BR = "stock_br"
PROFILE_FII_BR = "fii_br"
PROFILE_ETF_INTL = "etf_intl"

TARGET_PERCENT_CODE = "target_percent"
ANALYSIS_LINK_CODE = "analysis_link"


def _fundamental_options(
    options: list[tuple[int, str, str]],
) -> list:
    return [build_score_option(value, seal, characteristic) for value, seal, characteristic in options]


def default_stock_br_criteria() -> list[CriterionDefinition]:
    return [
        CriterionDefinition(
            code="lucros",
            block=AnalysisBlock.FUNDAMENTAL,
            label="Lucros",
            help_text="Lucro consistente nos últimos anos.",
            weight=1.0,
            sort_order=1,
            score_options=_fundamental_options(
                [
                    (5, "Viável", "Em 100% dos anos nos últimos 10 anos"),
                    (
                        3,
                        "Requer atenção",
                        "Acima de 80% anos nos últimos 10 anos ou em 100% dos anos se IPO foi feito entre 5 a 9 anos",
                    ),
                    (
                        2,
                        "Bomba",
                        "IPO há menos de 5 anos ou se nenhum critério anterior for atendido",
                    ),
                    (1, "Sem dados", "Sem dados"),
                ]
            ),
        ),
        CriterionDefinition(
            code="divida",
            block=AnalysisBlock.FUNDAMENTAL,
            label="Dívida Líq/EBITDA",
            help_text="Endividamento nos últimos 5 anos.",
            weight=1.0,
            sort_order=2,
            score_options=_fundamental_options(
                [
                    (5, "Viável", "Até 2 nos últimos 5 anos"),
                    (3, "Requer atenção", "Até 3 nos últimos 5 anos"),
                    (2, "Bomba", "Maior que 3 nos últimos 5 anos ou IPO há menos de 5 anos"),
                    (1, "Sem dados", "Sem dados"),
                ]
            ),
        ),
        CriterionDefinition(
            code="tag_along",
            block=AnalysisBlock.FUNDAMENTAL,
            label="Tag along",
            help_text="Percentual de tag along.",
            weight=1.0,
            sort_order=3,
            score_options=_fundamental_options(
                [
                    (5, "100%", "100%"),
                    (3, "80%", "80%"),
                    (2, "menor que 80%", "menor que 80%"),
                    (1, "sem dados", "sem dados"),
                ]
            ),
        ),
        CriterionDefinition(
            code="segmento",
            block=AnalysisBlock.FUNDAMENTAL,
            label="Segmento",
            help_text="Perenidade do segmento de atuação.",
            weight=1.0,
            sort_order=4,
            score_options=_fundamental_options(
                [
                    (5, "Perene", "Perene"),
                    (3, "Intermediário", "Intermediário"),
                    (2, "Instável", "Instável"),
                    (1, "Sem dados", "Sem dados"),
                ]
            ),
        ),
        CriterionDefinition(
            code=VIABILIDADE_CODE,
            block=AnalysisBlock.FUNDAMENTAL,
            label="Viabilidade",
            help_text="Classificação manual de viabilidade do ativo.",
            weight=1.0,
            sort_order=5,
            score_options=[
                build_score_option(1, "AZULIM", "AZULIM", "azulim"),
                build_score_option(2, "VIÁVEL", "VIÁVEL", "viavel"),
                build_score_option(3, "ATENÇÃO", "ATENÇÃO", "atencao"),
                build_score_option(4, "BOMBA", "BOMBA", "bomba"),
            ],
        ),
        CriterionDefinition(
            code="roe",
            block=AnalysisBlock.DIAGRAMA,
            label="ROE",
            help_text="ROE historicamente maior que 10%? (Considere anos anteriores).",
            weight=1.0,
            sort_order=1,
            input_type="yes_no",
        ),
        CriterionDefinition(
            code="cagr",
            block=AnalysisBlock.DIAGRAMA,
            label="CAGR",
            help_text=(
                "Tem um crescimento de receitas (Ou lucro) superior a 5% nos últimos 5 anos? (CAGR Líquido)"
            ),
            weight=1.0,
            sort_order=2,
            input_type="yes_no",
        ),
        CriterionDefinition(
            code="dividendos",
            block=AnalysisBlock.DIAGRAMA,
            label="DIVIDENDOS",
            help_text="A empresa tem um histórico de pagamento de dividendos?",
            weight=1.0,
            sort_order=3,
            input_type="yes_no",
        ),
        CriterionDefinition(
            code="tecnologia",
            block=AnalysisBlock.DIAGRAMA,
            label="TECNOLOGIA",
            help_text=(
                "A empresa investe amplamente em pesquisa e inovação? Setor Obsoleto = SEMPRE NÃO"
            ),
            weight=1.0,
            sort_order=4,
            input_type="yes_no",
        ),
        CriterionDefinition(
            code="tempo",
            block=AnalysisBlock.DIAGRAMA,
            label="TEMPO",
            help_text="Tem mais de 30 anos de mercado? (Fundação)",
            weight=1.0,
            sort_order=5,
            input_type="yes_no",
        ),
        CriterionDefinition(
            code="vantagem_competitiva",
            block=AnalysisBlock.DIAGRAMA,
            label="VANTAGEM COMPETITIVA",
            help_text=(
                "É líder nacional ou mundial no setor em que atua? (Só considera se for LÍDER, primeira colocada)"
            ),
            weight=1.0,
            sort_order=6,
            input_type="yes_no",
        ),
        CriterionDefinition(
            code="perenidade",
            block=AnalysisBlock.DIAGRAMA,
            label="PERENIDADE",
            help_text="O setor em que a empresa atua tem mais de 100 anos?",
            weight=1.0,
            sort_order=7,
            input_type="yes_no",
        ),
        CriterionDefinition(
            code="tamanho",
            block=AnalysisBlock.DIAGRAMA,
            label="TAMANHO",
            help_text="A empresa é uma BLUE CHIP (50 bilhões de reais)?",
            weight=1.0,
            sort_order=8,
            input_type="yes_no",
        ),
        CriterionDefinition(
            code="governanca",
            block=AnalysisBlock.DIAGRAMA,
            label="GOVERNANÇA",
            help_text="A empresa tem uma boa gestão? Histórico de corrupção = SEMPRE NÃO",
            weight=1.0,
            sort_order=9,
            input_type="yes_no",
        ),
        CriterionDefinition(
            code="independencia",
            block=AnalysisBlock.DIAGRAMA,
            label="INDEPENDÊNCIA",
            help_text="É livre de controle ESTATAL ou concentração em cliente único?",
            weight=1.0,
            sort_order=10,
            input_type="yes_no",
        ),
        CriterionDefinition(
            code="endividamento",
            block=AnalysisBlock.DIAGRAMA,
            label="ENDIVIDAMENTO",
            help_text="Div. Líquida/EBITDA é menor que 2 nos últimos 5 anos?",
            weight=1.0,
            sort_order=11,
            input_type="yes_no",
        ),
    ]


def default_stock_br_viability_rules() -> list[ViabilityRule]:
    return []


def default_stock_br_table_display() -> TableDisplaySettings:
    return TableDisplaySettings()


PROFILE_FII_BR = "fii_br"


def _viability_band_options(
    options: list[tuple[int, str, str, str]],
) -> list:
    return [
        build_score_option(value, seal, characteristic, color)
        for value, seal, characteristic, color in options
    ]


def default_fii_br_criteria() -> list[CriterionDefinition]:
    return [
        CriterionDefinition(
            code="vacancia",
            block=AnalysisBlock.FUNDAMENTAL,
            label="Vacância",
            help_text="Taxa de vacância do fundo.",
            weight=1.0,
            sort_order=1,
            score_options=_viability_band_options(
                [
                    (5, "Viável", "Vacância até 5%.", "viavel"),
                    (3, "Requer atenção", "Vacância maior que 5% e até 10%.", "atencao"),
                    (2, "Bomba", "Vacância maior que 10%.", "bomba"),
                    (1, "Sem dados", "Sem dados", "sem_dados"),
                ]
            ),
        ),
        CriterionDefinition(
            code="qtd_ativos",
            block=AnalysisBlock.FUNDAMENTAL,
            label="Qtd de Ativos",
            help_text="Quantidade de imóveis ou ativos na carteira.",
            weight=1.0,
            sort_order=2,
            score_options=_viability_band_options(
                [
                    (5, "Viável", "10 ativos ou mais.", "viavel"),
                    (3, "Requer atenção", "Entre 5 e 9 ativos.", "atencao"),
                    (2, "Bomba", "Menos de 5 ativos.", "bomba"),
                    (1, "Sem dados", "Sem dados", "sem_dados"),
                ]
            ),
        ),
        CriterionDefinition(
            code="alavancagem",
            block=AnalysisBlock.FUNDAMENTAL,
            label="Alavancagem Financeira",
            help_text="Endividamento do fundo.",
            weight=1.0,
            sort_order=3,
            score_options=_viability_band_options(
                [
                    (5, "Viável", "Alavancagem até 15%.", "viavel"),
                    (3, "Requer atenção", "Alavancagem maior que 15% e até 25%.", "atencao"),
                    (2, "Bomba", "Alavancagem maior que 25%.", "bomba"),
                    (1, "Sem dados", "Sem dados", "sem_dados"),
                ]
            ),
        ),
        CriterionDefinition(
            code="segmento_fii",
            block=AnalysisBlock.FUNDAMENTAL,
            label="Segmento",
            help_text="Segmento principal do fundo (catálogo editável).",
            weight=1.0,
            sort_order=4,
            input_type="segment",
            score_options=[],
        ),
        CriterionDefinition(
            code=VIABILIDADE_CODE,
            block=AnalysisBlock.FUNDAMENTAL,
            label="Viabilidade",
            help_text="Classificação manual de viabilidade do fundo.",
            weight=1.0,
            sort_order=5,
            score_options=[
                build_score_option(1, "AZULIM", "AZULIM", "azulim"),
                build_score_option(2, "VIÁVEL", "VIÁVEL", "viavel"),
                build_score_option(3, "ATENÇÃO", "ATENÇÃO", "atencao"),
                build_score_option(4, "BOMBA", "BOMBA", "bomba"),
            ],
        ),
        CriterionDefinition(
            code="localizacao",
            block=AnalysisBlock.DIAGRAMA,
            label="Localização",
            help_text="Os imóveis desse Fundo Imobiliário estão localizados em regiões nobres?",
            weight=1.0,
            sort_order=1,
            input_type="yes_no",
        ),
        CriterionDefinition(
            code="propriedades",
            block=AnalysisBlock.DIAGRAMA,
            label="Propriedades",
            help_text="As propriedades são novas e não consomem manutenção excessiva?",
            weight=1.0,
            sort_order=2,
            input_type="yes_no",
        ),
        CriterionDefinition(
            code="pvp",
            block=AnalysisBlock.DIAGRAMA,
            label="P/VP",
            help_text="O fundo imobiliário está negociado abaixo do P/VP 1?",
            weight=1.0,
            sort_order=3,
            input_type="yes_no",
        ),
        CriterionDefinition(
            code="dividendos_fii",
            block=AnalysisBlock.DIAGRAMA,
            label="Dividendos",
            help_text="Distribui dividendos a mais de 4 anos consistentemente?",
            weight=1.0,
            sort_order=4,
            input_type="yes_no",
        ),
        CriterionDefinition(
            code="dependencia",
            block=AnalysisBlock.DIAGRAMA,
            label="Dependência",
            help_text="Não é dependente de um único inquilino ou imóvel?",
            weight=1.0,
            sort_order=5,
            input_type="yes_no",
        ),
        CriterionDefinition(
            code="setor_yield",
            block=AnalysisBlock.DIAGRAMA,
            label="Setor",
            help_text="O Yield está dentro ou acima da média para fundos imobiliários do mesmo tipo?",
            weight=1.0,
            sort_order=6,
            input_type="yes_no",
        ),
        CriterionDefinition(
            code="pvp_descarte",
            block=AnalysisBlock.DIAGRAMA,
            label="P/VP > 1,5",
            help_text="Acima de 1,5, descarto o investimento em qualquer hipótese.",
            weight=1.0,
            sort_order=7,
            input_type="flag",
            score_options=[],
        ),
    ]


def default_fii_br_viability_rules() -> list[ViabilityRule]:
    return []


def default_fii_br_table_display() -> TableDisplaySettings:
    return TableDisplaySettings()


def default_etf_intl_criteria() -> list[CriterionDefinition]:
    return [
        CriterionDefinition(
            code=TARGET_PERCENT_CODE,
            block=AnalysisBlock.ALLOCATION,
            label="% desejado",
            help_text="Percentual desejado dentro do grupo de ETFs internacionais (soma 100%).",
            weight=1.0,
            sort_order=1,
            input_type="percent",
            score_options=[],
        ),
        CriterionDefinition(
            code=ANALYSIS_LINK_CODE,
            block=AnalysisBlock.ALLOCATION,
            label="Link de análise",
            help_text="Referência externa para análise do ETF.",
            weight=1.0,
            sort_order=2,
            input_type="url",
            score_options=[],
        ),
    ]


def default_etf_intl_table_display() -> TableDisplaySettings:
    settings = TableDisplaySettings()
    settings.sum_column.enabled = False
    return settings


class SegmentCatalogEntry(BaseModel):
    slug: str
    name: str
    score: int
    weight: float = 1.0
    help_text: str = ""
    color: str | None = None
    sort_order: int = 0


def default_fii_br_segments() -> list[SegmentCatalogEntry]:
    return [
        SegmentCatalogEntry(
            slug="shoppings",
            name="Shoppings",
            score=5,
            weight=1.0,
            help_text=(
                "Recebeu classificação Viável porque shoppings consolidados mantêm fluxo "
                "consistente de visitantes e contam com gestão ativa, garantindo resiliência "
                "e desempenho estável."
            ),
            color="viavel",
            sort_order=1,
        ),
        SegmentCatalogEntry(
            slug="multicategoria",
            name="Multicategoria",
            score=3,
            weight=1.0,
            help_text=(
                "Recebeu classificação Requer atenção porque reúne ativos de diferentes "
                "segmentos, ampliando a diversificação, mas exigindo gestão disciplinada e "
                "acompanhamento constante da alocação para manter estabilidade e equilíbrio "
                "de riscos."
            ),
            color="atencao",
            sort_order=2,
        ),
    ]

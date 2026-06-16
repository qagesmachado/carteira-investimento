from app.core.release_notes import parse_changelog, release_notes_for

SAMPLE = """# Changelog

## [Unreleased]

### Added

- Mudança ainda não lançada.

## [0.2.0] - 2026-07-01

### Added

- Nova ferramenta de simulação.
- Suporte a multimoeda
  com conversão automática.

### Fixed

- Corrige cálculo de preço médio.

## [0.1.0] - 2026-06-16

### Added

- Primeira versão.
"""


def test_parse_changelog_returns_sections_in_order() -> None:
    sections = parse_changelog(SAMPLE)

    versions = [s.version for s in sections]
    assert versions == ["Unreleased", "0.2.0", "0.1.0"]
    assert sections[0].released_at is None
    assert sections[1].released_at == "2026-07-01"


def test_parse_changelog_collects_bullets_joining_continuation() -> None:
    sections = parse_changelog(SAMPLE)
    v020 = next(s for s in sections if s.version == "0.2.0")

    assert v020.notes == [
        "Nova ferramenta de simulação.",
        "Suporte a multimoeda com conversão automática.",
        "Corrige cálculo de preço médio.",
    ]


def test_release_notes_for_matches_exact_version() -> None:
    notes = release_notes_for("0.1.0", SAMPLE)

    assert notes is not None
    assert notes.version == "0.1.0"
    assert notes.released_at == "2026-06-16"
    assert notes.notes == ["Primeira versão."]


def test_release_notes_for_unknown_version_falls_back_to_latest_released() -> None:
    notes = release_notes_for("9.9.9", SAMPLE)

    assert notes is not None
    assert notes.version == "0.2.0"


def test_release_notes_for_handles_empty_changelog() -> None:
    assert release_notes_for("0.1.0", "") is None

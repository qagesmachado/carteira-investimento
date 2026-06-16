"""Leitura das notas de versão (release notes) a partir do CHANGELOG.md.

A fonte é o `CHANGELOG.md` da raiz do repositório. No app empacotado
(PyInstaller) o arquivo é incluído via `--add-data` e resolvido a partir de
`sys._MEIPASS`.
"""

from __future__ import annotations

import re
import sys
from dataclasses import dataclass, field
from pathlib import Path

_HEADER = re.compile(r"^##\s+\[(?P<version>[^\]]+)\]\s*(?:-\s*(?P<date>\S+))?\s*$")
_SUBSECTION = re.compile(r"^#{3,}\s+\S")
_BULLET = re.compile(r"^\s*[-*]\s+(?P<text>.+?)\s*$")


@dataclass
class ReleaseSection:
    version: str
    released_at: str | None
    notes: list[str] = field(default_factory=list)


def changelog_path() -> Path:
    """Caminho do CHANGELOG.md (app empacotado ou repositório em dev)."""
    if getattr(sys, "frozen", False):
        base = Path(getattr(sys, "_MEIPASS"))
        return base / "CHANGELOG.md"
    # Este arquivo está em backend/app/core/release_notes.py → raiz = parents[3].
    return Path(__file__).resolve().parents[3] / "CHANGELOG.md"


def read_changelog() -> str | None:
    path = changelog_path()
    if not path.is_file():
        return None
    return path.read_text(encoding="utf-8")


def parse_changelog(text: str) -> list[ReleaseSection]:
    """Extrai as seções `## [versão] - data` na ordem do arquivo."""
    sections: list[ReleaseSection] = []
    current: ReleaseSection | None = None
    pending: str | None = None

    def flush() -> None:
        nonlocal pending
        if current is not None and pending is not None:
            current.notes.append(pending)
        pending = None

    for line in text.splitlines():
        header = _HEADER.match(line)
        if header:
            flush()
            current = ReleaseSection(
                version=header.group("version").strip(),
                released_at=(header.group("date") or None),
            )
            sections.append(current)
            continue

        if current is None:
            continue

        if _SUBSECTION.match(line):
            flush()
            continue

        bullet = _BULLET.match(line)
        if bullet:
            flush()
            pending = bullet.group("text").strip()
            continue

        # Continuação de um bullet em várias linhas.
        stripped = line.strip()
        if pending is not None and stripped:
            pending = f"{pending} {stripped}"
        elif not stripped:
            flush()

    flush()
    return sections


def release_notes_for(version: str, text: str | None = None) -> ReleaseSection | None:
    """Notas da `version`; se não houver, a seção lançada (com data) mais recente."""
    if text is None:
        text = read_changelog()
    if not text:
        return None
    sections = parse_changelog(text)
    if not sections:
        return None
    for section in sections:
        if section.version.lower() == version.lower():
            return section
    for section in sections:
        if section.released_at:
            return section
    return None

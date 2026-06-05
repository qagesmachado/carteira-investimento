"""Entrypoint do executável desktop (PyInstaller).

Sobe o servidor local (FastAPI servindo SPA + API) numa porta livre e abre o
navegador padrão apontando para ela.
"""

from __future__ import annotations

import os
import socket
import threading
import webbrowser

import uvicorn

from app.desktop import app

HOST = "127.0.0.1"
PREFERRED_PORT = 8000


def _truthy(value: str | None) -> bool:
    return bool(value) and value.strip().lower() not in {"", "0", "false", "no"}


def _find_free_port() -> int:
    """Tenta a porta preferida; se ocupada, deixa o SO escolher uma livre."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        try:
            sock.bind((HOST, PREFERRED_PORT))
            return PREFERRED_PORT
        except OSError:
            pass
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind((HOST, 0))
        return sock.getsockname()[1]


def _resolve_port() -> int:
    """Porta fixa via CARTEIRA_DESKTOP_PORT (testes) ou automática (uso normal)."""
    forced = os.getenv("CARTEIRA_DESKTOP_PORT", "").strip()
    if forced:
        return int(forced)
    return _find_free_port()


def main() -> None:
    port = _resolve_port()
    url = f"http://{HOST}:{port}"
    if not _truthy(os.getenv("CARTEIRA_DESKTOP_NO_BROWSER")):
        threading.Timer(1.2, lambda: webbrowser.open(url)).start()
    uvicorn.run(app, host=HOST, port=port, log_level="info")


if __name__ == "__main__":
    main()

import argparse
import sys
from pathlib import Path

from app.seed.loader import default_local_seed_path, default_seed_path
from app.seed.runner import export_assets_file, seed_assets


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Seed do catálogo de ativos (carteira.db) a partir de JSON.",
    )
    parser.add_argument(
        "--file",
        type=str,
        default=None,
        help="JSON único (ignora assets.local.json); padrão: seed/assets.json + opcional assets.local.json",
    )
    parser.add_argument(
        "--fresh",
        action="store_true",
        help="Apaga todos os ativos do catálogo e recria só a partir dos JSON carregados",
    )
    parser.add_argument(
        "--export",
        action="store_true",
        help="Exporta o catálogo atual do banco para JSON (padrão: seed/assets.local.json)",
    )
    parser.add_argument(
        "--export-public",
        action="store_true",
        help="Com --export, grava em seed/assets.json em vez de assets.local.json",
    )
    parser.add_argument(
        "--no-local",
        action="store_true",
        help="Não mesclar assets.local.json no seed",
    )
    args = parser.parse_args(argv)

    if args.export and args.fresh:
        print("Use --export ou --fresh, não ambos.", file=sys.stderr)
        return 1

    if args.export:
        if args.file is not None:
            export_path = Path(args.file)
        elif args.export_public:
            export_path = default_seed_path()
        else:
            export_path = default_local_seed_path()
        count = export_assets_file(export_path)
        print(f"Exportados {count} ativos para {export_path}")
        return 0

    if args.file is not None:
        stats, _ = seed_assets(
            base_path=Path(args.file),
            fresh=args.fresh,
            include_local=False,
        )
        sources = [Path(args.file)]
    else:
        stats, sources = seed_assets(
            fresh=args.fresh,
            include_local=not args.no_local,
        )

    mode = "fresh" if args.fresh else "upsert"
    source_names = ", ".join(p.name for p in sources)
    print(
        f"Seed ({mode}) de [{source_names}]: {stats.created} criados, "
        f"{stats.updated} atualizados."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

from __future__ import annotations

try:
    import typer
except ImportError:  # pragma: no cover - typer optional for tests
    typer = None  # type: ignore[assignment]

from app.cli.import_opportunities import import_opportunities

if typer:
    app = typer.Typer(help="Management commands for Vocatio.")
    app.command("import-opportunities")(import_opportunities)

    def main() -> None:
        app()

else:  # pragma: no cover - triggered only when typer missing
    app = None

    def main() -> None:
        raise RuntimeError("Typer is required to run CLI commands.")


__all__ = ["app", "main"]

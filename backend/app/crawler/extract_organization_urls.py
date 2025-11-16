from __future__ import annotations

import csv
import json
from pathlib import Path
from typing import Any, Iterable

BASE_DIR = Path(__file__).resolve().parent
DATA_FILES = [
    BASE_DIR / "miami_service.json",
    BASE_DIR / "nyc_service.json",
]
OUTPUT_FILE = BASE_DIR / "organization_urls.csv"


def load_records(file_path: Path) -> list[dict[str, Any]]:
    with file_path.open("r", encoding="utf-8") as json_file:
        data = json.load(json_file)
    if not isinstance(data, list):
        raise ValueError(f"Expected list in {file_path}, got {type(data).__name__}")
    return data


def extract_urls(data_files: Iterable[Path]) -> list[str]:
    urls: list[str] = []
    for file_path in data_files:
        for record in load_records(file_path):
            if not isinstance(record, dict):
                continue
            url = record.get("organization_url")
            if url:
                urls.append(str(url))
    return urls


def write_csv(urls: Iterable[str], output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", newline="", encoding="utf-8") as csv_file:
        writer = csv.writer(csv_file)
        writer.writerow(["organization_url"])
        for url in urls:
            writer.writerow([url])


def main() -> None:
    urls = extract_urls(DATA_FILES)
    write_csv(urls, OUTPUT_FILE)


if __name__ == "__main__":
    main()

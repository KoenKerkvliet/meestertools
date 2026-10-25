#!/usr/bin/env python3
"""Downloadt alle afbeeldingen van Wikimedia Commons naar img/ en laat de site
daarna naar die lokale bestanden verwijzen.

Gebruik (vanuit de hoofdmap van het project):
    python3 scripts/download_afbeeldingen.py

Het script is veilig om opnieuw te draaien: bestanden die al bestaan worden
overgeslagen, en links die al lokaal zijn blijven ongemoeid.
Er zijn geen extra pakketten nodig (alleen de standaardbibliotheek van Python 3).
"""
import hashlib
import re
import sys
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
IMG = ROOT / "img"
JS_FILES = sorted((ROOT / "js").glob("images-*.js"))
# Wikimedia vraagt om een herkenbare User-Agent.
UA = "TijdlijnVanNederland/1.0 (https://github.com/KoenKerkvliet/timeline)"
SRC_RE = re.compile(r'"src":\s*"(https://upload\.wikimedia\.org/[^"]+)"')


def local_name(url: str) -> str:
    """Maak een korte, veilige bestandsnaam op basis van de originele naam."""
    last = urllib.parse.unquote(url.rsplit("/", 1)[-1])
    last = re.sub(r"^\d+px-", "", last)
    stem, dot, ext = last.rpartition(".")
    ext = ext.lower()
    if ext == "jpeg":
        ext = "jpg"
    stem = unicodedata.normalize("NFKD", stem).encode("ascii", "ignore").decode()
    stem = re.sub(r"[^A-Za-z0-9]+", "-", stem).strip("-").lower()[:60] or "afbeelding"
    short = hashlib.md5(url.encode()).hexdigest()[:6]
    return f"{stem}-{short}.{ext}"


def download(url: str, dest: Path) -> bool:
    for attempt in range(5):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=60) as r:
                data = r.read()
            dest.write_bytes(data)
            return True
        except urllib.error.HTTPError as e:
            wait = 5 * (attempt + 1)
            if e.code in (429, 500, 502, 503, 504):
                print(f"  {e.code}, opnieuw over {wait} s …")
                time.sleep(wait)
                continue
            print(f"  FOUT {e.code}: {url}")
            return False
        except Exception as e:  # netwerkfout
            wait = 5 * (attempt + 1)
            print(f"  {e}, opnieuw over {wait} s …")
            time.sleep(wait)
    return False


def main() -> int:
    IMG.mkdir(exist_ok=True)
    urls = []
    for f in JS_FILES:
        urls += SRC_RE.findall(f.read_text(encoding="utf-8"))
    urls = list(dict.fromkeys(urls))
    print(f"{len(urls)} afbeeldingen gevonden in {len(JS_FILES)} bestanden")

    mapping, failed = {}, []
    for n, url in enumerate(urls, 1):
        name = local_name(url)
        dest = IMG / name
        if dest.exists() and dest.stat().st_size > 0:
            mapping[url] = f"img/{name}"
            continue
        print(f"[{n}/{len(urls)}] {name}")
        if download(url, dest):
            mapping[url] = f"img/{name}"
            time.sleep(0.3)  # vriendelijk voor de servers van Wikimedia
        else:
            failed.append(url)

    for f in JS_FILES:
        text = f.read_text(encoding="utf-8")
        for url, local in mapping.items():
            text = text.replace(f'"{url}"', f'"{local}"')
        f.write_text(text, encoding="utf-8")

    total = sum(p.stat().st_size for p in IMG.glob("*") if p.is_file())
    print(f"\nKlaar: {len(mapping)} lokaal, {len(failed)} mislukt, {total/1e6:.1f} MB in img/")
    if failed:
        print("Deze bleven een externe link (draai het script later opnieuw):")
        for u in failed:
            print("  " + u)
    return 0


if __name__ == "__main__":
    sys.exit(main())

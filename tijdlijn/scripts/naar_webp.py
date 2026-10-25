#!/usr/bin/env python3
"""Zet de afbeeldingen in img/ om naar WebP en laat js/images-*.js ernaar verwijzen.

- De langste zijde wordt hooguit 1600 px (de grootste weergave is ongeveer 1000 px breed; zo blijft het scherp op een retina-scherm).
- Kwaliteit 80; een PNG met echte transparantie houdt zijn transparantie.
- Het origineel (jpg/png) wordt verwijderd zodra de WebP er staat.

Gebruik (draait ook in .github/workflows/tijdlijn-bouwen.yml, na download_afbeeldingen.py):
    python3 tijdlijn/scripts/naar_webp.py

Veilig om opnieuw te draaien: alleen jpg/png in img/ worden opgepakt. Nodig: Pillow (pip install pillow).
"""
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
IMG = ROOT / "img"
JS_FILES = sorted((ROOT / "js").glob("images-*.js"))
MAX = 1600
QUALITY = 80


def convert(src: Path) -> Path:
    out = src.with_suffix(".webp")
    with Image.open(src) as im:
        im = ImageOps.exif_transpose(im)
        if im.mode in ("P", "LA", "PA"):
            im = im.convert("RGBA")
        elif im.mode not in ("RGB", "RGBA"):
            im = im.convert("RGB")
        if im.mode == "RGBA" and im.getchannel("A").getextrema() == (255, 255):
            im = im.convert("RGB")  # volledig dekkend: alfakanaal is overbodig
        im.thumbnail((MAX, MAX), Image.LANCZOS)
        im.save(out, "WEBP", quality=QUALITY, method=6)
    return out


def main() -> int:
    mapping, before, after = {}, 0, 0
    for src in sorted(IMG.iterdir()):
        if src.suffix.lower() not in (".jpg", ".jpeg", ".png"):
            continue
        out = convert(src)
        before += src.stat().st_size
        after += out.stat().st_size
        mapping[f"img/{src.name}"] = f"img/{out.name}"
        src.unlink()

    for f in JS_FILES:
        text = f.read_text(encoding="utf-8")
        new = text
        for old, webp in mapping.items():
            new = new.replace(old, webp)
        if new != text:
            f.write_text(new, encoding="utf-8")

    if mapping:
        print(f"{len(mapping)} afbeeldingen omgezet: {before / 1e6:.1f} MB -> {after / 1e6:.1f} MB")
    else:
        print("Geen jpg/png meer in img/, niets te doen.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

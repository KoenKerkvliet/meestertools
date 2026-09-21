#!/usr/bin/env python3
"""
MEESTERTOOLS - 10-minuten-didactiek: les + werkblad overnemen

Zet een losse les (HTML) en het bijbehorende werkblad (pdf) uit Koens
lesmap om naar de site, zodat elke les op dezelfde manier binnenkomt:

  les-html:
    - noindex + favicon
    - #stage{flex:none} (anders krimpt de 1600px-dia mee in een smal
      venster en loopt de rechterkolom over de knoppenbalk)
    - Meestertools-logo i.p.v. het schoollogo, terug-knop in de kop
    - timer links naast "Laat zien"
    - namen uit de actieve klas (js/tien-minuten-les.js) i.p.v. namen.js

  werkblad-pdf:
    - schoollogo-afbeelding (2297x735) vervangen door het Meestertools-logo
    - tekstblokken met "Schatgraver" (voettekst) eruit

Gebruik:
  python scripts/tien-minuten-les.py <les.html> <werkblad.pdf> <slug>

Daarna nog met de hand: kaart in lesmateriaal/10-minuten-didactiek.html.
Vereist: pypdf, Pillow.
"""

import re
import sys
from pathlib import Path

from PIL import Image
from pypdf import PdfReader, PdfWriter
from pypdf.generic import ContentStream

ROOT = Path(__file__).resolve().parent.parent
LESMAP = ROOT / 'lesmateriaal' / '10-minuten-didactiek'
LOGO = ROOT / 'assets' / 'logo-meestertools.png'
VERSION = re.search(r"const VERSION = 'v([^']+)'", (ROOT / 'js' / 'template.js').read_text(encoding='utf-8')).group(1)


def vervang(s, oud, nieuw, regex=False):
    n = len(re.findall(oud, s)) if regex else s.count(oud)
    if n == 0:
        raise SystemExit('Niet gevonden in de les: ' + oud[:80])
    return re.sub(oud, lambda m: nieuw, s) if regex else s.replace(oud, nieuw)


def les(src, slug):
    s = Path(src).read_text(encoding='utf-8')
    s = vervang(s, '<meta name="viewport" content="width=device-width, initial-scale=1">',
                '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
                '<meta name="robots" content="noindex">\n'
                '<link rel="icon" type="image/svg+xml" href="/favicon.svg">')
    s = vervang(s, '#stage{width:1600px;', '#stage{flex:none;width:1600px;')
    s = vervang(s, '  header img{height:58px}',
                '  header img{height:58px}\n'
                '  header .terug{font-weight:900;font-size:20px;color:var(--zacht);text-decoration:none;background:#fff;border-radius:14px;padding:8px 16px;box-shadow:0 4px 0 var(--lijn)}\n'
                '  header .terug:hover{color:var(--inkt)}')
    s = vervang(s, '<header>\n  <img',
                '<header>\n  <a class="terug" href="../10-minuten-didactiek" title="Terug naar de lessen">&larr; Lessen</a>\n  <img')
    s = vervang(s, 'alt="Logo de Schatgraver"', 'alt="Meestertools"')
    s = vervang(s, '../logo-schatgraver.png', '/assets/logo-meestertools.png')

    # Timer van rechts (bij Beurt) naar links, direct na "Laat zien".
    timer = re.search(r'  <button class="knop" id="timer".*?</button>\n', s, re.S).group(0)
    s = s.replace(timer, '')
    s = vervang(s, '  <div class="stippen" id="stippen"></div>\n', timer + '  <div class="stippen" id="stippen"></div>\n')

    s = vervang(s, r'<!-- De namen komen uit namen\.js.*?-->\s*<script src="\.\./namen\.js"></script>',
                '<!-- MeesterTools: inlogcontrole + namen uit de actieve klas (js/tien-minuten-les.js). -->\n'
                '<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.1/dist/umd/supabase.min.js"></script>\n'
                f'<script src="/js/supabase-config.js?v={VERSION}"></script>\n'
                f'<script src="/js/tien-minuten-les.js?v={VERSION}"></script>', regex=True)
    s = vervang(s, r'const NAMEN=\(window\.NAMEN\|\|""\)[^\n]*\n',
                'let NAMEN=[], KLAS=null;\nMTLes.namen.then(n=>{NAMEN=n;});\nMTLes.klas.then(k=>{KLAS=k;});\n', regex=True)
    s = vervang(s, r'info\.textContent="Zet de voornamen in namen\.js[^"]*";',
                'info.textContent=KLAS?`Er staan nog geen leerlingen in ${KLAS}.`:"Kies eerst een klas in MeesterTools.";', regex=True)
    s = vervang(s, 'info.textContent=pot.length?`Nog', 'info.textContent=(KLAS?KLAS+" · ":"")+(pot.length?`Nog')
    s = vervang(s, '"Iedereen is geweest. De volgende ronde begint opnieuw.";}',
                '"Iedereen is geweest. De volgende ronde begint opnieuw.");}')

    if 'chatgraver' in s.lower().replace('alt="meestertools"', ''):
        print('LET OP: "Schatgraver" staat nog ergens in de les, even nakijken.')
    uit = LESMAP / (slug + '.html')
    uit.write_text(s, encoding='utf-8', newline='\n')
    print('les  ->', uit.relative_to(ROOT))


def werkblad(src, slug):
    w = PdfWriter(clone_from=src)

    wit = Image.new('RGB', (2297, 735), 'white')
    logo = Image.open(LOGO).convert('RGBA').resize((2297, 735))
    wit.paste(logo, (0, 0), logo)

    for p in w.pages:
        for im in p.images:
            if im.image.size == (2297, 735):
                im.replace(wit, quality=92)

    for pi, p in enumerate(w.pages):
        # Waar staat de schoolnaam? Het tekstblok zelf eruit, niet afdekken.
        plekken = set()
        def zoek(text, cm, tm, fd, fs):
            if 'chatgraver' in text:
                plekken.add((round(float(tm[4]), 2), round(float(tm[5]), 2)))
        p.extract_text(visitor_text=zoek)
        if not plekken:
            continue
        cs = ContentStream(p.get_contents(), w)
        ops, out, i, weg = cs.operations, [], 0, 0
        while i < len(ops):
            if ops[i][1] == b'BT':
                j = i
                while ops[j][1] != b'ET':
                    j += 1
                tm = [o for o, op in ops[i:j] if op == b'Tm']
                if tm and (round(float(tm[0][4]), 2), round(float(tm[0][5]), 2)) in plekken:
                    weg += 1
                    i = j + 1
                    continue
            out.append(ops[i])
            i += 1
        cs.operations = out
        p.replace_contents(cs)
        print(f'pdf  pagina {pi + 1}: {weg} tekstblok(ken) met de schoolnaam weg')

    for p in w.pages:
        p.compress_content_streams()
    w.compress_identical_objects(remove_duplicates=True, remove_unreferenced=True)
    uit = LESMAP / 'werkbladen' / (slug + '.pdf')
    uit.parent.mkdir(exist_ok=True)
    w.write(uit)

    r = PdfReader(uit)
    rest = [i + 1 for i, p in enumerate(r.pages) if 'chatgraver' in (p.extract_text() or '')]
    if rest:
        print('LET OP: nog "Schatgraver" op pagina', rest)
    print('pdf  ->', uit.relative_to(ROOT))


if __name__ == '__main__':
    if len(sys.argv) != 4:
        raise SystemExit(__doc__)
    les(sys.argv[1], sys.argv[3])
    werkblad(sys.argv[2], sys.argv[3])

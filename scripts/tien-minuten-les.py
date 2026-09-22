#!/usr/bin/env python3
"""
MEESTERTOOLS - 10-minuten-didactiek: les + werkblad overnemen

Zet een losse les (HTML) en het bijbehorende werkblad (pdf) uit Koens
lesmap om naar de site, zodat elke les op dezelfde manier binnenkomt:

  les-html, format "dia" (vaste 1600x900-dia, eigen beurtenkiezer/timer):
    - noindex + favicon
    - #stage{flex:none} (anders krimpt de 1600px-dia mee in een smal
      venster en loopt de rechterkolom over de knoppenbalk)
    - Meestertools-logo i.p.v. het schoollogo, terug-knop in de kop
    - timer links naast "Laat zien"
    - doeldia: concept- en vaardigheidsvak verschijnen pas met Volgende
    - "10 minuten rekenen · onderwerp" in de kop alleen op de titeldia
    - denkstappen iets strakker, zodat 5-6 stappen boven de knoppenbalk blijven
    - namen uit de actieve klas (js/tien-minuten-les.js) i.p.v. namen.js

  les-html, format "app" (responsive, Voordoen/Samen/Zelf, geen eigen
  beurtenkiezer/timer) - wordt automatisch herkend:
    - noindex + favicon, "← Lessen" + Meestertools-logo in de kop
    - lestitel in de kop alleen op het eerste scherm
    - Timer + Beurt in de voet via js/tien-minuten-beurt.js (B / T)
    - inlogcontrole + namen uit de actieve klas (js/tien-minuten-les.js)

  werkblad-pdf:
    - schoollogo-afbeelding (2297x735) vervangen door het Meestertools-logo
    - tekstblokken met "Schatgraver" (voettekst) eruit

Gebruik:
  python scripts/tien-minuten-les.py <les.html> <werkblad.pdf> <vak> <slug>

  vak = rekenen, spelling, taal, ... (map onder lesmateriaal/10-minuten-didactiek/)

Daarna nog met de hand: kaart in lesmateriaal/10-minuten-didactiek/<vak>.html.
Eerste les van een nieuw vak? Kopieer rekenen.html naar <vak>.html (titel
en kaarten aanpassen) en maak de vakkaart in
lesmateriaal/10-minuten-didactiek.html klikbaar (is-soon eraf, <a href>).
Vereist: pypdf, Pillow.
"""

import re
import sys
from pathlib import Path

from PIL import Image
from pypdf import PdfReader, PdfWriter
from pypdf.generic import ContentStream

ROOT = Path(__file__).resolve().parent.parent
DIDACTIEK = ROOT / 'lesmateriaal' / '10-minuten-didactiek'
LOGO = ROOT / 'assets' / 'logo-meestertools.png'
VERSION = re.search(r"const VERSION = 'v([^']+)'", (ROOT / 'js' / 'template.js').read_text(encoding='utf-8')).group(1)


def vervang(s, oud, nieuw, regex=False):
    n = len(re.findall(oud, s)) if regex else s.count(oud)
    if n == 0:
        raise SystemExit('Niet gevonden in de les: ' + oud[:80])
    return re.sub(oud, lambda m: nieuw, s) if regex else s.replace(oud, nieuw)


def doel_stapsgewijs(s):
    """Op de doeldia eerst alleen de doelzin; concept en vaardigheid
    (de twee kaarten in .twee) komen één voor één met Volgende."""
    blok = re.search(r'<div class="twee">.*?\n  </div>\n', s, re.S)
    if not blok:
        raise SystemExit('Geen <div class="twee"> (doeldia) gevonden in de les')
    nieuw = blok.group(0).replace('<div class="kaart" ', '<div class="kaart step" ')
    if nieuw.count('kaart step') != 2:
        raise SystemExit('Doeldia heeft niet precies twee uitlegvakken, even nakijken')
    return s.replace(blok.group(0), nieuw)


def titel_alleen_eerste_dia(s):
    """"10 minuten rekenen · <onderwerp>" in de kop alleen op de titeldia;
    daarna minder afleiding. visibility (niet display), zodat de fase-badge
    rechts blijft staan."""
    s = vervang(s, '  header .titel{font-weight:800;font-size:22px;color:var(--zacht);flex:1}',
                '  header .titel{font-weight:800;font-size:22px;color:var(--zacht);flex:1}\n'
                '  body:not(.eerste-dia) header .titel{visibility:hidden}')
    return vervang(s, '  nu=i; onthuld=0;\n',
                   '  nu=i; onthuld=0;\n  document.body.classList.toggle("eerste-dia",nu===0);\n')


def denkstappen_compacter(s):
    """Denkstappen iets strakker (padding 12->9, tussenruimte 10->8). Bij 5-6
    stappen liep de kolom anders tot ~40px over de knoppenbalk. Lettergrootte
    blijft gelijk."""
    s = vervang(s, '.denk{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:10px}',
                '.denk{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:8px}')
    return vervang(s, 'border-radius:18px;padding:12px 18px;border-left:8px solid var(--oranje)}',
                   'border-radius:18px;padding:9px 18px;border-left:8px solid var(--oranje)}')


def les_app(s, vak):
    """Het tweede lesformat: responsive "app" (Voordoen/Samen/Zelf, schermen
    via render()). Geen vaste dia, geen eigen beurtenkiezer of timer; die
    komen uit js/tien-minuten-beurt.js."""
    s = vervang(s, '<meta name="viewport" content="width=device-width, initial-scale=1">',
                '<meta name="viewport" content="width=device-width, initial-scale=1">'
                '<meta name="robots" content="noindex">'
                '<link rel="icon" type="image/svg+xml" href="/favicon.svg">')
    s = vervang(s, '</style>',
                '  /* MeesterTools */\n'
                '  .mt-kop{display:flex;align-items:center;gap:14px}\n'
                '  .mt-kop .terug{font-weight:700;font-size:.95rem;color:var(--ink-soft);text-decoration:none;background:var(--card);border:2px solid var(--line);border-radius:10px;padding:6px 12px}\n'
                '  .mt-kop .terug:hover{color:var(--ink);border-color:var(--ink)}\n'
                '  .mt-kop img{height:46px;display:block;margin:-6px 0}\n'
                '  body:not(.eerste-dia) .brand{visibility:hidden}\n'
                '</style>')
    s = vervang(s, '<header>\n    <div class="brand">',
                '<header>\n    <div class="mt-kop"><a class="terug" href="/lesmateriaal/10-minuten-didactiek/' + vak
                + '" title="Terug naar de lessen">&larr; Lessen</a><img src="/assets/logo-meestertools.png" alt="Meestertools"></div>\n'
                '    <div class="brand">')
    # Titel alleen op het eerste scherm (zelfde wens als bij het dia-format).
    s = vervang(s, '  renderPhases();\n}\n',
                '  renderPhases();\n  document.body.classList.toggle("eerste-dia",cur===0);\n}\n')
    # Timer en Beurt in de voet, links naast Vorige.
    s = vervang(s, '<button class="btn" id="prev" type="button">← Vorige</button>',
                '<span class="actions"><button class="btn" id="prev" type="button">← Vorige</button>'
                '<button class="btn" id="mtTimer" type="button" title="Timer 2 minuten (T). Dubbelklik of Shift+T = opnieuw.">⏱ 2:00</button>'
                '<button class="btn primary" id="mtBeurt" type="button" title="Kies een naam (B)">🎲 Beurt</button></span>')
    s = vervang(s, 'Z = grafiek groot</span>', 'Z = grafiek groot · B = beurt · T = timer</span>')
    s = vervang(s, '<script>\nconst INTRO',
                '<!-- MeesterTools: inlogcontrole, namen uit de actieve klas, beurtenkiezer + timer. -->\n'
                '<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.1/dist/umd/supabase.min.js"></script>\n'
                f'<script src="/js/supabase-config.js?v={VERSION}"></script>\n'
                f'<script src="/js/tien-minuten-les.js?v={VERSION}"></script>\n'
                f'<script src="/js/tien-minuten-beurt.js?v={VERSION}"></script>\n'
                '<script>\nconst INTRO')
    return s


def les_dia(s, vak):
    """Het eerste lesformat: vaste 1600x900-dia met eigen beurtenkiezer/timer."""
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
                '<header>\n  <a class="terug" href="/lesmateriaal/10-minuten-didactiek/' + vak + '" title="Terug naar de lessen">&larr; Lessen</a>\n  <img')
    s = doel_stapsgewijs(s)
    s = titel_alleen_eerste_dia(s)
    s = denkstappen_compacter(s)
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
    return s


def les(src, vak, slug):
    s = Path(src).read_text(encoding='utf-8')
    if '#stage{width:1600px;' in s:
        print('les  format: dia (1600x900)')
        s = les_dia(s, vak)
    elif 'class="app"' in s and 'const ITEMS' in s and 'function render()' in s:
        print('les  format: app (Voordoen/Samen/Zelf)')
        s = les_app(s, vak)
    else:
        raise SystemExit('Onbekend lesformat: geen 1600px-dia en geen app-format. Met de hand bekijken.')

    if 'chatgraver' in s.lower().replace('alt="meestertools"', ''):
        print('LET OP: "Schatgraver" staat nog ergens in de les, even nakijken.')
    uit = DIDACTIEK / vak / (slug + '.html')
    uit.parent.mkdir(exist_ok=True)
    uit.write_text(s, encoding='utf-8', newline='\n')
    print('les  ->', uit.relative_to(ROOT))


def werkblad(src, vak, slug):
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
    uit = DIDACTIEK / vak / 'werkbladen' / (slug + '.pdf')
    uit.parent.mkdir(parents=True, exist_ok=True)
    w.write(uit)

    r = PdfReader(uit)
    rest = [i + 1 for i, p in enumerate(r.pages) if 'chatgraver' in (p.extract_text() or '')]
    if rest:
        print('LET OP: nog "Schatgraver" op pagina', rest)
    print('pdf  ->', uit.relative_to(ROOT))


if __name__ == '__main__':
    if len(sys.argv) != 5:
        raise SystemExit(__doc__)
    les(sys.argv[1], sys.argv[3], sys.argv[4])
    werkblad(sys.argv[2], sys.argv[3], sys.argv[4])

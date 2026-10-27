#!/usr/bin/env node
/* ============================================
   MEESTERTOOLS - Topografie: basiskaart Nederland bouwen

   Maakt assets/topografie/nederland.json: een lege kaart (zonder namen)
   met provincies, rivieren, plaatsen en gebieden, al omgerekend naar
   SVG-coördinaten. De browser hoeft dus niets te projecteren.

   De ruwe bronbestanden staan NIET in de repo (ruim 20 MB). Haal ze op in
   een eigen map en geef die map mee:

     curl -o prov.json "https://service.pdok.nl/cbs/gebiedsindelingen/2024/wfs/v1_0?request=GetFeature&service=WFS&version=2.0.0&typeName=gebiedsindelingen:provincie_gegeneraliseerd&outputFormat=json&srsName=EPSG:4326"
     curl -o ne_countries.geojson https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_0_countries.geojson
     curl -o ne_rivers.geojson    https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_rivers_lake_centerlines.geojson
     curl -o ne_rivers_eu.geojson https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_rivers_europe.geojson
     curl -o NL.zip https://download.geonames.org/export/dump/NL.zip && unzip NL.zip

     node scripts/topografie-nederland.js <map-met-bronnen>

   Bronnen en licenties (staan ook als bronvermelding onder de kaart):
   - provincies: CBS / Kadaster via PDOK (CC BY 4.0)
   - buurlanden en rivieren: Natural Earth (publiek domein)
   - plaatsen: GeoNames (CC BY 4.0)

   Ids van kaart-items mogen nooit veranderen: opgeslagen kaarten van
   leerkrachten verwijzen ernaar.
   ============================================ */

'use strict';

const fs = require('fs');
const path = require('path');

const SRC = process.argv[2];
if (!SRC) {
    console.error('Gebruik: node scripts/topografie-nederland.js <map-met-bronnen>');
    process.exit(1);
}
const OUT = path.resolve(__dirname, '..', 'assets', 'topografie', 'nederland.json');

// ---------- Projectie ----------
// Equirectangulair met cos(breedtegraad) als correctie: voor een land zo
// klein als Nederland niet van een "echte" kaartprojectie te onderscheiden.
const LON_MIN = 3.15, LON_MAX = 7.35, LAT_MIN = 50.70, LAT_MAX = 53.62;
const LAT0 = (LAT_MIN + LAT_MAX) / 2;
const KX = Math.cos(LAT0 * Math.PI / 180);
const W = 1000;
const SCALE = W / ((LON_MAX - LON_MIN) * KX);
const H = Math.round((LAT_MAX - LAT_MIN) * SCALE);

function proj(c) {
    return [(c[0] - LON_MIN) * KX * SCALE, (LAT_MAX - c[1]) * SCALE];
}

const r1 = (n) => Math.round(n * 10) / 10;

// ---------- Geometrie-hulpjes ----------
function sqSegDist(p, a, b) {
    let x = a[0], y = a[1], dx = b[0] - x, dy = b[1] - y;
    if (dx !== 0 || dy !== 0) {
        const t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);
        if (t > 1) { x = b[0]; y = b[1]; } else if (t > 0) { x += dx * t; y += dy * t; }
    }
    dx = p[0] - x; dy = p[1] - y;
    return dx * dx + dy * dy;
}

// Douglas-Peucker, iteratief (diepe recursie op lange kustlijnen loopt anders vast)
function simplify(pts, tol) {
    if (pts.length < 3) return pts;
    const sq = tol * tol, keep = new Uint8Array(pts.length);
    keep[0] = keep[pts.length - 1] = 1;
    const stack = [[0, pts.length - 1]];
    while (stack.length) {
        const [f, l] = stack.pop();
        let max = 0, idx = -1;
        for (let i = f + 1; i < l; i++) {
            const d = sqSegDist(pts[i], pts[f], pts[l]);
            if (d > max) { max = d; idx = i; }
        }
        if (max > sq) { keep[idx] = 1; stack.push([f, idx], [idx, l]); }
    }
    return pts.filter((_, i) => keep[i]);
}

// Sutherland-Hodgman: ring knippen op een rechthoek (buurlanden zijn veel
// groter dan de kaart; alles buiten beeld is alleen maar ballast).
function clipRing(ring, x0, y0, x1, y1) {
    const edges = [
        (p) => p[0] >= x0, (p) => p[0] <= x1, (p) => p[1] >= y0, (p) => p[1] <= y1
    ];
    const isect = [
        (a, b) => [x0, a[1] + (b[1] - a[1]) * (x0 - a[0]) / (b[0] - a[0])],
        (a, b) => [x1, a[1] + (b[1] - a[1]) * (x1 - a[0]) / (b[0] - a[0])],
        (a, b) => [a[0] + (b[0] - a[0]) * (y0 - a[1]) / (b[1] - a[1]), y0],
        (a, b) => [a[0] + (b[0] - a[0]) * (y1 - a[1]) / (b[1] - a[1]), y1]
    ];
    let out = ring;
    for (let e = 0; e < 4; e++) {
        const inp = out; out = [];
        if (!inp.length) break;
        let prev = inp[inp.length - 1];
        for (const cur of inp) {
            const cIn = edges[e](cur), pIn = edges[e](prev);
            if (cIn) { if (!pIn) out.push(isect[e](prev, cur)); out.push(cur); }
            else if (pIn) out.push(isect[e](prev, cur));
            prev = cur;
        }
    }
    return out;
}

// Lijn knippen op een rechthoek: alleen punten binnen (met één punt marge)
function clipLine(line, x0, y0, x1, y1) {
    const inside = (p) => p[0] >= x0 && p[0] <= x1 && p[1] >= y0 && p[1] <= y1;
    const parts = []; let cur = [];
    line.forEach((p, i) => {
        const keepIt = inside(p) || (line[i - 1] && inside(line[i - 1])) || (line[i + 1] && inside(line[i + 1]));
        if (keepIt) cur.push(p); else if (cur.length) { parts.push(cur); cur = []; }
    });
    if (cur.length) parts.push(cur);
    return parts.filter((p) => p.length > 1);
}

function ringArea(r) {
    let a = 0;
    for (let i = 0, j = r.length - 1; i < r.length; j = i++) a += (r[j][0] + r[i][0]) * (r[j][1] - r[i][1]);
    return Math.abs(a / 2);
}

function pathFromRings(rings) {
    return rings.map((r) => 'M' + r.map((p) => r1(p[0]) + ',' + r1(p[1])).join('L') + 'Z').join('');
}
function pathFromLines(lines) {
    return lines.map((l) => 'M' + l.map((p) => r1(p[0]) + ',' + r1(p[1])).join('L')).join('');
}

function polygonsOf(geom) {
    if (geom.type === 'Polygon') return [geom.coordinates];
    if (geom.type === 'MultiPolygon') return geom.coordinates;
    return [];
}

function pointInRing(p, ring) {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const xi = ring[i][0], yi = ring[i][1], xj = ring[j][0], yj = ring[j][1];
        if ((yi > p[1]) !== (yj > p[1]) && p[0] < (xj - xi) * (p[1] - yi) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
}

// Labelpunt: het punt binnen de grootste ring dat het verst van de rand ligt
// (grove versie van "polylabel"). Een zwaartepunt valt bij Zeeland in zee.
function labelPoint(rings) {
    const ring = rings.slice().sort((a, b) => ringArea(b) - ringArea(a))[0];
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    ring.forEach((p) => { minX = Math.min(minX, p[0]); minY = Math.min(minY, p[1]); maxX = Math.max(maxX, p[0]); maxY = Math.max(maxY, p[1]); });
    let best = null, bestD = -1;
    const step = Math.max(maxX - minX, maxY - minY) / 60;
    for (let x = minX; x <= maxX; x += step) {
        for (let y = minY; y <= maxY; y += step) {
            if (!pointInRing([x, y], ring)) continue;
            let d = Infinity;
            for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) d = Math.min(d, sqSegDist([x, y], ring[j], ring[i]));
            if (d > bestD) { bestD = d; best = [x, y]; }
        }
    }
    return best;
}

// ---------- Provincies ----------
const PROV_NAAM = { 'Fryslân': 'Friesland' };
const provSrc = JSON.parse(fs.readFileSync(path.join(SRC, 'prov.json'), 'utf8'));
const provincies = provSrc.features.map((f) => {
    const naam = PROV_NAAM[f.properties.statnaam] || f.properties.statnaam;
    const rings = [];
    polygonsOf(f.geometry).forEach((poly) => poly.forEach((ring) => {
        const r = simplify(ring.map(proj), 0.5);
        if (r.length >= 4 && ringArea(r) > 4) rings.push(r);
    }));
    const lp = labelPoint(rings);
    return { id: f.properties.statcode, naam, d: pathFromRings(rings), lx: r1(lp[0]), ly: r1(lp[1]) };
}).sort((a, b) => a.naam.localeCompare(b.naam, 'nl'));

// ---------- Buurlanden (achtergrond) ----------
// Ruim uitknippen: op een breed scherm is links en rechts van Nederland
// veel meer te zien dan de kaart zelf breed is.
const BX0 = -W * 0.8, BX1 = W * 1.8, BY0 = -H * 0.3, BY1 = H * 1.3;
const countries = JSON.parse(fs.readFileSync(path.join(SRC, 'ne_countries.geojson'), 'utf8'));
const buurRings = [];
countries.features.forEach((f) => {
    if (f.properties.ADM0_A3 === 'NLD') return;
    polygonsOf(f.geometry).forEach((poly) => {
        const outer = poly[0];
        const anyNear = outer.some((c) => c[0] > LON_MIN - 5 && c[0] < LON_MAX + 5 && c[1] > LAT_MIN - 2 && c[1] < LAT_MAX + 2);
        if (!anyNear) return;
        poly.forEach((ring) => {
            let r = clipRing(ring.map(proj), BX0, BY0, BX1, BY1);
            r = simplify(r, 0.7);
            if (r.length >= 4 && ringArea(r) > 4) buurRings.push(r);
        });
    });
});

// ---------- Rivieren ----------
const RIVIER_NAAM = { Rhine: 'Rijn', Ems: 'Eems', Maas: 'Maas', Waal: 'Waal', Nederrijn: 'Nederrijn', Lek: 'Lek', IJssel: 'IJssel', Schelde: 'Schelde' };
const RIVIER_EU = { 'Overijsselse Vecht': 'Overijsselse Vecht', 'Vecht': 'Utrechtse Vecht', 'Berkel': 'Berkel' };
const rivLines = {};
function addRiver(naam, geom) {
    const lines = geom.type === 'LineString' ? [geom.coordinates] : geom.coordinates;
    lines.forEach((l) => clipLine(l.map(proj), BX0, BY0, BX1, BY1).forEach((part) => {
        (rivLines[naam] = rivLines[naam] || []).push(simplify(part, 0.6));
    }));
}
JSON.parse(fs.readFileSync(path.join(SRC, 'ne_rivers.geojson'), 'utf8')).features.forEach((f) => {
    const naam = RIVIER_NAAM[f.properties.name];
    if (naam) addRiver(naam, f.geometry);
});
JSON.parse(fs.readFileSync(path.join(SRC, 'ne_rivers_eu.geojson'), 'utf8')).features.forEach((f) => {
    const naam = RIVIER_EU[f.properties.name_nl];
    if (naam) addRiver(naam, f.geometry);
});
const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
// Labelpunt: het middelste punt van de rivier dat binnen Nederland ligt
// (het begin ligt bij de Maas en de Rijn ver in het buitenland).
const provRings = [];
provincies.forEach((p) => p.d.split('Z').filter(Boolean).forEach((ring) => {
    provRings.push(ring.replace(/^M/, '').split('L').map((xy) => xy.split(',').map(Number)));
}));
const inNederland = (pt) => provRings.some((r) => pointInRing(pt, r));
const rivieren = Object.keys(rivLines).sort((a, b) => a.localeCompare(b, 'nl')).map((naam) => {
    const binnen = [];
    rivLines[naam].forEach((l) => l.forEach((pt) => { if (inNederland(pt)) binnen.push(pt); }));
    // Grensrivieren (Eems, Westerschelde) lopen door water en raken geen
    // provincie: neem dan het punt in beeld dat het dichtst bij Nederland ligt.
    let lp = binnen.length ? binnen[Math.floor(binnen.length / 2)] : null;
    if (!lp) {
        let bestD = Infinity;
        rivLines[naam].forEach((l) => l.forEach((pt) => {
            if (pt[0] < 0 || pt[0] > W || pt[1] < 0 || pt[1] > H) return;
            provRings.forEach((r) => r.forEach((q) => {
                const d = (q[0] - pt[0]) ** 2 + (q[1] - pt[1]) ** 2;
                if (d < bestD) { bestD = d; lp = pt; }
            }));
        }));
    }
    return { id: 'r-' + slug(naam), naam, d: pathFromLines(rivLines[naam]), lx: r1(lp[0]), ly: r1(lp[1]) };
});

// ---------- Plaatsen (GeoNames) ----------
// Alleen echte woonplaatsen (geen wijken: PPLX), vanaf 2500 inwoners, plus
// alle gemeentehoofdplaatsen. Engelse hoofdnamen corrigeren we hier.
const PLAATS_NAAM = { 'The Hague': 'Den Haag', 'Almere Stad': 'Almere' };
const PROV_HOOFDSTAD = ['Groningen', 'Leeuwarden', 'Assen', 'Zwolle', 'Lelystad', 'Arnhem', 'Utrecht', 'Haarlem', 'Den Haag', 'Middelburg', "'s-Hertogenbosch", 'Maastricht'];
const OK_CODES = new Set(['PPL', 'PPLA', 'PPLA2', 'PPLC', 'PPLG']);
const rows = fs.readFileSync(path.join(SRC, 'NL.txt'), 'utf8').split('\n').map((l) => l.split('\t')).filter((r) => r.length > 14);
const gezien = {};
const plaatsen = [];
rows.forEach((r) => {
    if (r[6] !== 'P' || !OK_CODES.has(r[7])) return;
    const pop = +r[14] || 0;
    if (pop < 2500 && r[7] === 'PPL') return;
    const naam = PLAATS_NAAM[r[1]] || r[1];
    const lat = +r[4], lon = +r[5];
    if (lon < LON_MIN || lon > LON_MAX || lat < LAT_MIN || lat > LAT_MAX) return;
    // Dubbele namen (twee Bergen's) mogen, maar niet twee keer dezelfde plek
    const key = naam + '|' + Math.round(lat * 20) + '|' + Math.round(lon * 20);
    if (gezien[key]) return;
    gezien[key] = 1;
    const p = proj([lon, lat]);
    plaatsen.push({ id: 'g' + r[0], naam, x: r1(p[0]), y: r1(p[1]), pop });
});
plaatsen.sort((a, b) => b.pop - a.pop);
const hoofdsteden = PROV_HOOFDSTAD.map((n) => {
    const p = plaatsen.find((x) => x.naam === n);
    if (!p) { console.error('Provinciehoofdstad niet gevonden: ' + n); process.exit(1); }
    return p.id;
});
plaatsen.forEach((p) => {
    p.prov = hoofdsteden.indexOf(p.id) !== -1 ? 1 : 0;
    p.hs = p.naam === 'Amsterdam' ? 1 : 0;
});

// ---------- Gebieden, wateren en eilanden (handmatig) ----------
// Lijst van wat in de topografie van de basisschool steeds terugkomt.
// [id, naam, soort, lon, lat]
const GEBIEDEN = [
    ['w-noordzee', 'Noordzee', 'water', 3.75, 52.6],
    ['w-waddenzee', 'Waddenzee', 'water', 5.3, 53.2],
    ['w-ijsselmeer', 'IJsselmeer', 'water', 5.3, 52.83],
    ['w-markermeer', 'Markermeer', 'water', 5.22, 52.55],
    ['w-oosterschelde', 'Oosterschelde', 'water', 3.98, 51.6],
    ['w-westerschelde', 'Westerschelde', 'water', 3.8, 51.41],
    ['w-haringvliet', 'Haringvliet', 'water', 4.2, 51.81],
    ['w-lauwersmeer', 'Lauwersmeer', 'water', 6.2, 53.37],
    ['w-noordzeekanaal', 'Noordzeekanaal', 'water', 4.72, 52.45],
    ['e-texel', 'Texel', 'eiland', 4.8, 53.08],
    ['e-vlieland', 'Vlieland', 'eiland', 4.99, 53.27],
    ['e-terschelling', 'Terschelling', 'eiland', 5.35, 53.4],
    ['e-ameland', 'Ameland', 'eiland', 5.77, 53.45],
    ['e-schiermonnikoog', 'Schiermonnikoog', 'eiland', 6.2, 53.48],
    ['e-walcheren', 'Walcheren', 'gebied', 3.58, 51.53],
    ['e-schouwen', 'Schouwen-Duiveland', 'gebied', 3.85, 51.69],
    ['e-goeree', 'Goeree-Overflakkee', 'gebied', 4.15, 51.75],
    ['e-zuid-beveland', 'Zuid-Beveland', 'gebied', 3.95, 51.47],
    ['e-noord-beveland', 'Noord-Beveland', 'gebied', 3.75, 51.58],
    ['e-tholen', 'Tholen', 'gebied', 4.12, 51.55],
    ['e-zeeuws-vlaanderen', 'Zeeuws-Vlaanderen', 'gebied', 3.85, 51.29],
    ['a-veluwe', 'Veluwe', 'gebied', 5.8, 52.18],
    ['a-twente', 'Twente', 'gebied', 6.75, 52.3],
    ['a-achterhoek', 'Achterhoek', 'gebied', 6.5, 52.0],
    ['a-betuwe', 'Betuwe', 'gebied', 5.55, 51.9],
    ['a-salland', 'Salland', 'gebied', 6.25, 52.35],
    ['a-gooi', 'Het Gooi', 'gebied', 5.2, 52.25],
    ['a-biesbosch', 'Biesbosch', 'gebied', 4.8, 51.74],
    ['a-peel', 'De Peel', 'gebied', 5.85, 51.4],
    ['a-kempen', 'De Kempen', 'gebied', 5.25, 51.35],
    ['a-zuid-limburg', 'Zuid-Limburg', 'gebied', 5.85, 50.87],
    ['a-noordoostpolder', 'Noordoostpolder', 'gebied', 5.75, 52.7],
    ['a-westland', 'Westland', 'gebied', 4.22, 52.0],
    ['a-hoeksche-waard', 'Hoeksche Waard', 'gebied', 4.45, 51.77],
    ['a-utrechtse-heuvelrug', 'Utrechtse Heuvelrug', 'gebied', 5.4, 52.05],
    ['a-vaalserberg', 'Vaalserberg', 'gebied', 6.02, 50.755],
    ['a-afsluitdijk', 'Afsluitdijk', 'gebied', 5.17, 53.0]
];
const gebieden = GEBIEDEN.map(([id, naam, soort, lon, lat]) => {
    const p = proj([lon, lat]);
    return { id, naam, soort, x: r1(p[0]), y: r1(p[1]) };
});

// ---------- Wegschrijven ----------
const out = {
    basis: 'nederland',
    naam: 'Nederland',
    w: W,
    h: H,
    bron: 'Kaartdata: CBS/Kadaster (PDOK), Natural Earth, GeoNames',
    buurlanden: pathFromRings(buurRings),
    provincies,
    rivieren,
    gebieden,
    // Plaatsen compact als arrays: [id, naam, x, y, inwoners, provinciehoofdstad, hoofdstad]
    plaatsen: plaatsen.map((p) => [p.id, p.naam, p.x, p.y, p.pop, p.prov, p.hs])
};
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(out), 'utf8');
console.log('Geschreven: ' + OUT + ' (' + Math.round(fs.statSync(OUT).size / 1024) + ' kB)');
console.log('  ' + provincies.length + ' provincies, ' + rivieren.length + ' rivieren, ' + gebieden.length + ' gebieden, ' + plaatsen.length + ' plaatsen');

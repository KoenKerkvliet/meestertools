#!/usr/bin/env node
/* ============================================
   MEESTERTOOLS - Topografie: basiskaart Europa bouwen

   Maakt assets/topografie/europa.json, in dezelfde vorm als nederland.json.
   De vlakken heten in het bestand 'provincies' (zo leest de kaartcode ze),
   maar zijn hier landen: elk vlak heeft soort 'land'.

   Bronnen (niet in de repo, haal ze op in een eigen map):

     B=https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson
     curl -o ne_countries.geojson $B/ne_10m_admin_0_countries.geojson
     curl -o ne_rivers.geojson    $B/ne_10m_rivers_lake_centerlines.geojson
     curl -o ne_lakes.geojson     $B/ne_10m_lakes.geojson
     curl -o ne_places.geojson    $B/ne_10m_populated_places.geojson

     node scripts/topografie-europa.js <map-met-bronnen>

   Alles van Natural Earth (publiek domein), inclusief de Nederlandse namen
   van landen en steden. Rivieren, wateren en gebieden krijgen hier hun
   Nederlandse naam.

   Ids van kaart-items mogen nooit veranderen: opgeslagen kaarten van
   leerkrachten verwijzen ernaar.
   ============================================ */

'use strict';

const fs = require('fs');
const path = require('path');
const {
    r1, simplify, clipRing, clipLine, ringArea, pathFromRings, pathFromLines,
    polygonsOf, pointInRing, labelPoint
} = require('./topografie-geo');

const SRC = process.argv[2];
if (!SRC) {
    console.error('Gebruik: node scripts/topografie-europa.js <map-met-bronnen>');
    process.exit(1);
}
const OUT = path.resolve(__dirname, '..', 'assets', 'topografie', 'europa.json');
const lees = (f) => JSON.parse(fs.readFileSync(path.join(SRC, f), 'utf8'));

// ---------- Projectie ----------
// Lambert azimutaal oppervlaktegetrouw rond 10°O 52°N: de standaard
// Europakaart (ETRS89-LAEA). Landen houden hun echte verhouding in grootte.
const RAD = Math.PI / 180;
const LON0 = 10 * RAD, LAT0 = 52 * RAD;
function laea(c) {
    const l = c[0] * RAD - LON0, f = c[1] * RAD;
    const k = Math.sqrt(2 / (1 + Math.sin(LAT0) * Math.sin(f) + Math.cos(LAT0) * Math.cos(f) * Math.cos(l)));
    return [k * Math.cos(f) * Math.sin(l), k * (Math.cos(LAT0) * Math.sin(f) - Math.sin(LAT0) * Math.cos(f) * Math.cos(l))];
}

// Uitsnede: van IJsland tot de Oeral, van Kreta tot de Noordkaap.
const randPunten = [[-25, 64], [-25, 66.5], [-18, 47], [-10, 36], [60, 58], [58, 66], [51, 40], [10, 71.8], [30, 71.5], [41, 72], [-6, 34.6], [18, 34.3], [36, 34.6]];
const xs = randPunten.map((c) => laea(c)[0]), ys = randPunten.map((c) => laea(c)[1]);
const XMIN = Math.min(...xs), XMAX = Math.max(...xs), YMIN = Math.min(...ys), YMAX = Math.max(...ys);
const W = 1000;
const SCALE = W / (XMAX - XMIN);
const H = Math.round((YMAX - YMIN) * SCALE);

function proj(c) {
    const p = laea(c);
    return [(p[0] - XMIN) * SCALE, (YMAX - p[1]) * SCALE];
}

// Ruim knippen: op een breed scherm zie je meer dan de kaart zelf
const BX0 = -W * 0.6, BX1 = W * 1.6, BY0 = -H * 0.3, BY1 = H * 1.3;
const binnenBeeld = (p) => p[0] >= 0 && p[0] <= W && p[1] >= 0 && p[1] <= H;

function ringenVan(geom, tol, minOpp) {
    const rings = [];
    polygonsOf(geom).forEach((poly) => poly.forEach((ring) => {
        let r = clipRing(ring.map(proj), BX0, BY0, BX1, BY1);
        r = simplify(r, tol);
        if (r.length >= 4 && ringArea(r) > minOpp) rings.push(r);
    }));
    return rings;
}

// ---------- Landen ----------
// Wat bij Europa hoort (Natural Earth zet Cyprus en de Kaukasus bij Azië,
// maar ze staan in de atlas wel op de Europakaart).
const LANDEN = 'ALB AND ARM AUT AZE BEL BGR BIH BLR CHE CYP CZE DEU DNK ESP EST FIN FRA GBR GEO GRC HRV HUN IRL ISL ITA KOS LIE LTU LUX LVA MCO MDA MKD MLT MNE NLD NOR POL PRT ROU RUS SMR SRB SVK SVN SWE TUR UKR VAT'.split(' ');
const LAND_NAAM = { BLR: 'Belarus', GBR: 'Verenigd Koninkrijk', CZE: 'Tsjechië' };
// Gebieden die bij een land horen maar als los vlak in de bron staan
const HOORT_BIJ = { ALD: 'FIN' };

const countries = lees('ne_countries.geojson');
const landGeom = {};
const achtergrond = [];
countries.features.forEach((f) => {
    const a3 = HOORT_BIJ[f.properties.ADM0_A3] || f.properties.ADM0_A3;
    const nabij = JSON.stringify(f.geometry.coordinates).match(/-?\d+(\.\d+)?,-?\d+(\.\d+)?/g)
        .some((xy) => { const [lon, lat] = xy.split(',').map(Number); return lon > -40 && lon < 80 && lat > 20 && lat < 85; });
    if (!nabij) return;
    if (LANDEN.indexOf(a3) !== -1) {
        // Vaticaanstad en Monaco zijn kleiner dan één kaarteenheid: dan
        // zonder vereenvoudigen, anders blijft er niets van over.
        let rings = ringenVan(f.geometry, 0.45, 0.3);
        if (!rings.length) rings = ringenVan(f.geometry, 0, 0);
        (landGeom[a3] = landGeom[a3] || { naam: LAND_NAAM[a3] || f.properties.NAME_NL, rings: [] })
            .rings.push(...rings);
    } else {
        achtergrond.push(...ringenVan(f.geometry, 0.6, 0.6));
    }
});

const provincies = Object.keys(landGeom).map((a3) => {
    const l = landGeom[a3];
    // Labelpunt alleen zoeken in het deel dat in beeld is (Rusland loopt tot
    // ver achter de rand door; Siberië zou het label naar buiten trekken)
    const inBeeld = l.rings.map((r) => clipRing(r, 0, 0, W, H)).filter((r) => r.length >= 4 && ringArea(r) > 0);
    const lp = labelPoint(inBeeld.length ? inBeeld : l.rings);
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    l.rings.forEach((r) => r.forEach((p) => { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); }));
    const item = { id: a3, naam: l.naam, soort: 'land', d: pathFromRings(l.rings), lx: r1(lp[0]), ly: r1(lp[1]) };
    // Dwergstaten zijn op deze schaal een paar pixels: ze krijgen een stip
    // als klikdoel en herkenningsteken.
    if (Math.hypot(x1 - x0, y1 - y0) < 20) item.stip = 1;
    return item;
}).sort((a, b) => a.naam.localeCompare(b.naam, 'nl'));

// ---------- Meren (achtergrond) ----------
const meren = [];
lees('ne_lakes.geojson').features.forEach((f) => {
    if (f.properties.scalerank > 5) return;
    ringenVan(f.geometry, 0.5, 1.5).forEach((r) => { if (r.some(binnenBeeld)) meren.push(r); });
});

// ---------- Rivieren ----------
const RIVIER_NAAM = {
    Volga: 'Wolga', Danube: 'Donau', Donau: 'Donau', Dniester: 'Dnjestr', Don: 'Don',
    Dnipro: 'Dnjepr', Dnepre: 'Dnjepr', Elbe: 'Elbe', Vistula: 'Weichsel', Oder: 'Oder',
    Seine: 'Seine', Loire: 'Loire', Ebro: 'Ebro', Duero: 'Duero', Po: 'Po',
    Rhine: 'Rijn', Rhin: 'Rijn', Rhein: 'Rijn', Waal: 'Rijn', 'Rhône': 'Rhône',
    'Severnaya Dvina': 'Noordelijke Dvina', Tajo: 'Taag', Tejo: 'Taag', Thames: 'Theems',
    Garonne: 'Garonne', Tisa: 'Tisza', Daugava: 'Daugava', Maas: 'Maas', Meuse: 'Maas', Ural: 'Oeral'
};
const rivLines = {};
lees('ne_rivers.geojson').features.forEach((f) => {
    if (f.properties.featurecla === 'Lake Centerline') return;
    const naam = RIVIER_NAAM[f.properties.name];
    if (!naam) return;
    const lines = f.geometry.type === 'LineString' ? [f.geometry.coordinates] : f.geometry.coordinates;
    lines.forEach((l) => clipLine(l.map(proj), BX0, BY0, BX1, BY1).forEach((part) => {
        (rivLines[naam] = rivLines[naam] || []).push(simplify(part, 0.5));
    }));
});
const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const rivieren = Object.keys(rivLines).sort((a, b) => a.localeCompare(b, 'nl')).map((naam) => {
    // Labelpunt: het middelste punt in beeld
    const pts = [];
    rivLines[naam].forEach((l) => l.forEach((p) => { if (binnenBeeld(p)) pts.push(p); }));
    const lp = pts.length ? pts[Math.floor(pts.length / 2)] : rivLines[naam][0][0];
    return { id: 'r-' + slug(naam), naam, d: pathFromLines(rivLines[naam]), lx: r1(lp[0]), ly: r1(lp[1]) };
}).filter((r) => r.d.length > 0);

// ---------- Steden ----------
// Alle hoofdsteden plus steden vanaf 300.000 inwoners, binnen beeld.
const plaatsen = [];
lees('ne_places.geojson').features.forEach((f) => {
    const q = f.properties;
    if (LANDEN.indexOf(q.ADM0_A3) === -1) return;
    const hoofd = q.ADM0CAP == 1;
    if (!hoofd && q.POP_MAX < 300000) return;
    const p = proj(f.geometry.coordinates);
    if (!binnenBeeld(p)) return;
    plaatsen.push({ id: 'n' + (q.GEONAMESID > 0 ? q.GEONAMESID : q.NE_ID), naam: q.NAME_NL || q.NAME, x: r1(p[0]), y: r1(p[1]), pop: q.POP_MAX || 0, hs: hoofd ? 1 : 0 });
});
plaatsen.sort((a, b) => b.pop - a.pop);
const dubbel = {};
plaatsen.forEach((p) => {
    if (dubbel[p.id]) { console.error('Dubbel id: ' + p.id + ' ' + p.naam); process.exit(1); }
    dubbel[p.id] = 1;
});

// ---------- Wateren, gebergten en eilanden (handmatig) ----------
// [id, naam, soort, lon, lat]
const GEBIEDEN = [
    ['w-atlantische-oceaan', 'Atlantische Oceaan', 'water', -17, 48],
    ['w-noordzee', 'Noordzee', 'water', 3.5, 56],
    ['w-oostzee', 'Oostzee', 'water', 19, 56.3],
    ['w-middellandse-zee', 'Middellandse Zee', 'water', 18, 34.9],
    ['w-zwarte-zee', 'Zwarte Zee', 'water', 34, 43.3],
    ['w-kaspische-zee', 'Kaspische Zee', 'water', 50.5, 42.5],
    ['w-noorse-zee', 'Noorse Zee', 'water', 2, 67],
    ['w-barentszzee', 'Barentszzee', 'water', 40, 71.3],
    ['w-witte-zee', 'Witte Zee', 'water', 38, 65.8],
    ['w-golf-van-biskaje', 'Golf van Biskaje', 'water', -4, 45.5],
    ['w-het-kanaal', 'Het Kanaal', 'water', -2.5, 50.1],
    ['w-ierse-zee', 'Ierse Zee', 'water', -4.8, 53.8],
    ['w-adriatische-zee', 'Adriatische Zee', 'water', 15.5, 43],
    ['w-egeische-zee', 'Egeïsche Zee', 'water', 25, 39],
    ['w-tyrreense-zee', 'Tyrreense Zee', 'water', 12, 40],
    ['w-ionische-zee', 'Ionische Zee', 'water', 18.5, 38.3],
    ['w-botnische-golf', 'Botnische Golf', 'water', 20.5, 63],
    ['w-finse-golf', 'Finse Golf', 'water', 26.5, 59.8],
    ['w-skagerrak', 'Skagerrak', 'water', 9, 57.9],
    ['w-kattegat', 'Kattegat', 'water', 11.4, 56.9],
    ['w-azovse-zee', 'Azovse Zee', 'water', 36.5, 46.1],
    ['w-straat-van-gibraltar', 'Straat van Gibraltar', 'water', -5.6, 35.95],
    ['w-bosporus', 'Bosporus', 'water', 29.05, 41.12],
    ['w-ladogameer', 'Ladogameer', 'water', 31.5, 60.8],
    ['w-onegameer', 'Onegameer', 'water', 35.4, 61.7],
    ['w-meer-van-geneve', 'Meer van Genève', 'water', 6.5, 46.43],
    ['w-bodenmeer', 'Bodenmeer', 'water', 9.4, 47.6],
    ['w-balatonmeer', 'Balatonmeer', 'water', 17.7, 46.83],
    ['w-gardameer', 'Gardameer', 'water', 10.65, 45.65],
    ['w-vanermeer', 'Vänermeer', 'water', 13.2, 58.9],
    ['a-alpen', 'Alpen', 'gebergte', 10.5, 46.6],
    ['a-pyreneeen', 'Pyreneeën', 'gebergte', 0.8, 42.7],
    ['a-karpaten', 'Karpaten', 'gebergte', 24.5, 47.5],
    ['a-apennijnen', 'Apennijnen', 'gebergte', 13.5, 42.5],
    ['a-oeralgebergte', 'Oeralgebergte', 'gebergte', 59.3, 59],
    ['a-kaukasus', 'Kaukasus', 'gebergte', 44, 42.8],
    ['a-scandinavisch-hoogland', 'Scandinavisch Hoogland', 'gebergte', 14.5, 65],
    ['a-balkangebergte', 'Balkangebergte', 'gebergte', 25, 42.75],
    ['a-schotse-hooglanden', 'Schotse Hooglanden', 'gebergte', -4.5, 57.2],
    ['e-groot-brittannie', 'Groot-Brittannië', 'eiland', -1.8, 53.2],
    ['e-sicilie', 'Sicilië', 'eiland', 14.2, 37.5],
    ['e-sardinie', 'Sardinië', 'eiland', 9.0, 40.1],
    ['e-corsica', 'Corsica', 'eiland', 9.1, 42.15],
    ['e-kreta', 'Kreta', 'eiland', 24.9, 35.25],
    ['e-mallorca', 'Mallorca', 'eiland', 3.0, 39.6],
    ['e-gotland', 'Gotland', 'eiland', 18.5, 57.5],
    ['e-faeroer', 'Faeröer', 'eiland', -6.9, 62.0],
    ['g-iberisch-schiereiland', 'Iberisch Schiereiland', 'gebied', -4.5, 40.5],
    ['g-scandinavisch-schiereiland', 'Scandinavisch Schiereiland', 'gebied', 16, 62],
    ['g-balkan', 'Balkan', 'gebied', 21.5, 42.5],
    ['g-jutland', 'Jutland', 'gebied', 9.1, 56.2],
    ['g-krim', 'Krim', 'gebied', 34.2, 45.2],
    ['g-kola', 'Kola', 'gebied', 35, 67.8]
];
const gebieden = GEBIEDEN.map(([id, naam, soort, lon, lat]) => {
    const p = proj([lon, lat]);
    if (!binnenBeeld(p)) console.warn('Buiten beeld: ' + naam);
    return { id, naam, soort, x: r1(p[0]), y: r1(p[1]) };
});

// ---------- Wegschrijven ----------
const out = {
    basis: 'europa',
    naam: 'Europa',
    w: W,
    h: H,
    bron: 'Kaartdata: Natural Earth',
    // Teksten voor de editor; de vlakken zijn hier landen
    teksten: { vlakken: 'Landen', vlak: 'land', hoofdsteden: 'Hoofdsteden' },
    buurlanden: pathFromRings(achtergrond),
    meren: pathFromRings(meren),
    provincies,
    rivieren,
    gebieden,
    // [id, naam, x, y, inwoners, provinciehoofdstad, hoofdstad]
    plaatsen: plaatsen.map((p) => [p.id, p.naam, p.x, p.y, p.pop, 0, p.hs])
};
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(out), 'utf8');
console.log('Geschreven: ' + OUT + ' (' + Math.round(fs.statSync(OUT).size / 1024) + ' kB), ' + W + 'x' + H);
console.log('  ' + provincies.length + ' landen (' + provincies.filter((p) => p.stip).map((p) => p.naam).join(', ') + ' met stip), ' +
    rivieren.length + ' rivieren, ' + gebieden.length + ' gebieden, ' + plaatsen.length + ' steden, ' + meren.length + ' meren');

#!/usr/bin/env node
/* ============================================
   MEESTERTOOLS - Topografie: basiskaart Wereld bouwen

   Maakt assets/topografie/wereld.json, in dezelfde vorm als europa.json
   (landen in het veld 'provincies' met soort 'land').

   Bronnen: dezelfde Natural Earth-bestanden als scripts/topografie-europa.js
   (ne_countries, ne_rivers, ne_lakes, ne_places), in een eigen map:

     node scripts/topografie-wereld.js <map-met-bronnen>

   Ids van kaart-items mogen nooit veranderen: opgeslagen kaarten van
   leerkrachten verwijzen ernaar.
   ============================================ */

'use strict';

const fs = require('fs');
const path = require('path');
const {
    r1, simplify, clipRing, clipLine, ringArea, pathFromRings, pathFromLines,
    polygonsOf, labelPoint
} = require('./topografie-geo');
const { voegZonesToe } = require('./topografie-zones');

const SRC = process.argv[2];
if (!SRC) {
    console.error('Gebruik: node scripts/topografie-wereld.js <map-met-bronnen>');
    process.exit(1);
}
const OUT = path.resolve(__dirname, '..', 'assets', 'topografie', 'wereld.json');
const lees = (f) => JSON.parse(fs.readFileSync(path.join(SRC, f), 'utf8'));

// ---------- Projectie ----------
// Equal Earth (2018): oppervlaktegetrouw, zodat Afrika niet kleiner lijkt dan
// Groenland, en met een vertrouwde vorm. Midden op Greenwich: Natural Earth
// knipt de landen al op de datumgrens, dus niets hoeft omgeklapt te worden.
const A1 = 1.340264, A2 = -0.081106, A3 = 0.000893, A4 = 0.003796, MM = Math.sqrt(3) / 2;
function equalEarth(c) {
    const l = c[0] * Math.PI / 180, f = c[1] * Math.PI / 180;
    const t = Math.asin(MM * Math.sin(f)), t2 = t * t, t6 = t2 * t2 * t2;
    const x = 2 * Math.sqrt(3) * l * Math.cos(t) / (3 * (9 * A4 * t6 * t2 + 7 * A3 * t6 + 3 * A2 * t2 + A1));
    const y = t * (A4 * t6 * t2 + A3 * t6 + A2 * t2 + A1);
    return [x, y];
}
const XMAX = equalEarth([180, 0])[0], YMAX = equalEarth([0, 90])[1];
const W = 1000;
const SCALE = W / (2 * XMAX);
const H = Math.round(2 * YMAX * SCALE);
function proj(c) {
    const p = equalEarth([Math.max(-180, Math.min(180, c[0])), c[1]]);
    return [(p[0] + XMAX) * SCALE, (YMAX - p[1]) * SCALE];
}
const binnenBeeld = (p) => p[0] >= 0 && p[0] <= W && p[1] >= 0 && p[1] <= H;

function ringenVan(geom, tol, minOpp) {
    const rings = [];
    polygonsOf(geom).forEach((poly) => poly.forEach((ring) => {
        let r = simplify(ring.map(proj), tol);
        if (r.length >= 4 && ringArea(r) > minOpp) rings.push(r);
    }));
    return rings;
}

// ---------- Landen ----------
// Alle soevereine landen plus wat in de atlas als land telt (Groenland,
// Palestina, Westelijke Sahara, Kosovo). Afgesplitste stukjes gaan terug
// naar hun land; overzeese gebiedsdelen en Antarctica zijn achtergrond.
const EXTRA = ['CHN', 'FRA', 'FIN', 'DNK', 'GBR', 'NLD', 'USA', 'AUS', 'NZL', 'GRL', 'ISR', 'KOS', 'PSX', 'SAH'];
// Bajkonoer en Guantánamo Bay zijn verpacht, maar liggen in Kazachstan en Cuba
const HOORT_BIJ = { ALD: 'FIN', CYN: 'CYP', SOL: 'SOM', CNM: 'CYP', KAB: 'KAZ', USG: 'CUB' };
const LAND_NAAM = {
    CHN: 'China', USA: 'Verenigde Staten', SWZ: 'Eswatini', CZE: 'Tsjechië',
    BLR: 'Belarus', GBR: 'Verenigd Koninkrijk', COD: 'Congo-Kinshasa', COG: 'Congo-Brazzaville'
};

const landGeom = {};
const achtergrond = [];
lees('ne_countries.geojson').features.forEach((f) => {
    const q = f.properties;
    const a3 = HOORT_BIJ[q.ADM0_A3] || q.ADM0_A3;
    // 'Sovereignty' is een soeverein land met een verpacht stuk (Kazachstan, Cuba)
    const isLand = HOORT_BIJ[q.ADM0_A3] || q.TYPE === 'Sovereign country' || q.TYPE === 'Sovereignty' || EXTRA.indexOf(a3) !== -1;
    if (isLand && a3 !== 'ATA') {
        let rings = ringenVan(f.geometry, 0.3, 0.25);
        if (!rings.length) rings = ringenVan(f.geometry, 0, 0);
        const l = (landGeom[a3] = landGeom[a3] || { naam: null, rings: [] });
        if (!HOORT_BIJ[q.ADM0_A3]) l.naam = LAND_NAAM[a3] || q.NAME_NL || q.NAME;
        l.rings.push(...rings);
    } else {
        achtergrond.push(...ringenVan(f.geometry, 0.3, 0.3));
    }
});

const provincies = Object.keys(landGeom).map((a3) => {
    const l = landGeom[a3];
    const lp = labelPoint(l.rings);
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    // Alleen de grootste ring telt voor "is het klein": Frankrijk is niet
    // klein omdat Frans-Guyana ver weg ligt, Malta wel.
    const groot = l.rings.slice().sort((a, b) => ringArea(b) - ringArea(a))[0];
    groot.forEach((p) => { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); });
    const item = { id: a3, naam: l.naam, soort: 'land', d: pathFromRings(l.rings), lx: r1(lp[0]), ly: r1(lp[1]) };
    if (Math.hypot(x1 - x0, y1 - y0) < 7) item.stip = 1;
    return item;
}).filter((p) => p.naam).sort((a, b) => a.naam.localeCompare(b.naam, 'nl'));

// ---------- Meren (achtergrond) ----------
const meren = [];
lees('ne_lakes.geojson').features.forEach((f) => {
    if (f.properties.scalerank > 2) return;
    meren.push(...ringenVan(f.geometry, 0.25, 0.4));
});

// ---------- Breedtecirkels ----------
// Evenaar, keerkringen en poolcirkels als dunne stippellijnen (geen items).
function breedte(lat) {
    const pts = [];
    for (let lon = -180; lon <= 180; lon += 2) pts.push(proj([lon, lat]));
    return pts;
}
const lijnen = pathFromLines([0, 23.44, -23.44, 66.56, -66.56].map(breedte));

// ---------- Rivieren ----------
const RIVIER_NAAM = {
    Nile: 'Nijl', 'Bahr el Jebel': 'Nijl', 'El Bahr el Abyad': 'Nijl', 'Victoria Nile': 'Nijl', 'Albert Nile': 'Nijl',
    'Rosetta Branch': 'Nijl', 'Damietta Branch': 'Nijl', 'El Bahr el Azraq': 'Nijl', Abay: 'Nijl',
    Amazonas: 'Amazone', Ucayali: 'Amazone',
    Mississippi: 'Mississippi', Missouri: 'Missouri',
    'Chang Jiang': 'Jangtsekiang', Yangtze: 'Jangtsekiang', Jinsha: 'Jangtsekiang', Tongtian: 'Jangtsekiang', Tuotuo: 'Jangtsekiang',
    Huang: 'Gele Rivier', Ganges: 'Ganges', Brahmaputra: 'Brahmaputra', Yarlung: 'Brahmaputra', Dihang: 'Brahmaputra',
    Indus: 'Indus', Mekong: 'Mekong', Lancang: 'Mekong',
    Congo: 'Kongo', Lualaba: 'Kongo', Niger: 'Niger', Zambezi: 'Zambezi',
    Volga: 'Wolga', Danube: 'Donau', Donau: 'Donau', Rhine: 'Rijn', Rhein: 'Rijn', Rhin: 'Rijn', Waal: 'Rijn',
    Ob: 'Ob', Lena: 'Lena', Yenisey: 'Jenisej', Amur: 'Amoer', 'Heilong Jiang': 'Amoer',
    Murray: 'Murray', 'Paraná': 'Paraná', Orinoco: 'Orinoco', Mackenzie: 'Mackenzie', Yukon: 'Yukon',
    'St. Lawrence': 'Sint-Laurensrivier', Colorado: 'Colorado',
    Euphrates: 'Eufraat', Firat: 'Eufraat', 'Al Furat': 'Eufraat', Tigris: 'Tigris', Dicle: 'Tigris'
};
// Namen die op meer plekken voorkomen: alleen dit stuk van de wereld telt
const RIVIER_GEBIED = { Colorado: [-120, -105, 28, 42], Niger: [-12, 10, 3, 18], Murray: [138, 150, -38, -32], Mackenzie: [-140, -110, 55, 70] };
const rivLines = {};
lees('ne_rivers.geojson').features.forEach((f) => {
    const q = f.properties;
    // Ook de stukken door een meer (de Nijl door het Nassermeer), anders zit
    // er een gat in de rivier
    const naam = RIVIER_NAAM[q.name];
    if (!naam) return;
    const lines = f.geometry.type === 'LineString' ? [f.geometry.coordinates] : f.geometry.coordinates;
    const g = RIVIER_GEBIED[q.name];
    if (g && !lines.some((l) => l.some((c) => c[0] >= g[0] && c[0] <= g[1] && c[1] >= g[2] && c[1] <= g[3]))) return;
    lines.forEach((l) => clipLine(l.map(proj), 0, 0, W, H).forEach((part) => {
        (rivLines[naam] = rivLines[naam] || []).push(simplify(part, 0.3));
    }));
});
const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const rivieren = Object.keys(rivLines).sort((a, b) => a.localeCompare(b, 'nl')).map((naam) => {
    // Labelpunt: midden van het langste stuk
    const deel = rivLines[naam].slice().sort((a, b) => b.length - a.length)[0];
    const lp = deel[Math.floor(deel.length / 2)];
    return { id: 'r-' + slug(naam), naam, d: pathFromLines(rivLines[naam]), lx: r1(lp[0]), ly: r1(lp[1]) };
});

// ---------- Steden ----------
// Hoofdsteden van alle landen hierboven plus steden vanaf 3 miljoen inwoners.
// Natural Earth heeft hier en daar een verouderde Nederlandse naam
const PLAATS_NAAM = { Bombay: 'Mumbai', Calcutta: 'Kolkata', Haiderabad: 'Hyderabad', Poona: 'Pune', Madras: 'Chennai', 'Nur-Sultan': 'Astana' };
const plaatsen = [];
const gezien = {};
lees('ne_places.geojson').features.forEach((f) => {
    const q = f.properties;
    const a3 = HOORT_BIJ[q.ADM0_A3] || q.ADM0_A3;
    if (!landGeom[a3]) return;
    const hoofd = q.ADM0CAP == 1;
    if (!hoofd && q.POP_MAX < 3000000) return;
    const id = 'n' + (q.GEONAMESID > 0 ? q.GEONAMESID : q.NE_ID);
    if (gezien[id]) return;
    gezien[id] = 1;
    const p = proj(f.geometry.coordinates);
    const naam = q.NAME_NL || q.NAME;
    plaatsen.push({ id, naam: PLAATS_NAAM[naam] || naam, x: r1(p[0]), y: r1(p[1]), pop: q.POP_MAX || 0, hs: hoofd ? 1 : 0 });
});
plaatsen.sort((a, b) => b.pop - a.pop);

// ---------- Werelddelen, wateren, gebergten, woestijnen en eilanden ----------
// [id, naam, soort, lon, lat]
const GEBIEDEN = [
    ['c-afrika', 'Afrika', 'werelddeel', 20, 6],
    ['c-azie', 'Azië', 'werelddeel', 92, 47],
    ['c-europa', 'Europa', 'werelddeel', 22, 54],
    ['c-noord-amerika', 'Noord-Amerika', 'werelddeel', -108, 57],
    ['c-zuid-amerika', 'Zuid-Amerika', 'werelddeel', -66, -27],
    ['c-oceanie', 'Oceanië', 'werelddeel', 134, -25],
    ['c-antarctica', 'Antarctica', 'werelddeel', 40, -77],
    ['w-atlantische-oceaan', 'Atlantische Oceaan', 'water', -32, 15],
    ['w-stille-oceaan', 'Stille Oceaan', 'water', -140, 0],
    ['w-indische-oceaan', 'Indische Oceaan', 'water', 78, -22],
    ['w-noordelijke-ijszee', 'Noordelijke IJszee', 'water', 160, 76],
    ['w-zuidelijke-oceaan', 'Zuidelijke Oceaan', 'water', 20, -58],
    ['w-middellandse-zee', 'Middellandse Zee', 'water', 18, 34.9],
    ['w-rode-zee', 'Rode Zee', 'water', 38, 21],
    ['w-caribische-zee', 'Caribische Zee', 'water', -75, 15],
    ['w-golf-van-mexico', 'Golf van Mexico', 'water', -90, 25],
    ['w-perzische-golf', 'Perzische Golf', 'water', 51, 27],
    ['w-arabische-zee', 'Arabische Zee', 'water', 64, 15],
    ['w-golf-van-bengalen', 'Golf van Bengalen', 'water', 88, 15],
    ['w-zuid-chinese-zee', 'Zuid-Chinese Zee', 'water', 114, 13],
    ['w-japanse-zee', 'Japanse Zee', 'water', 135, 40],
    ['w-beringzee', 'Beringzee', 'water', -178, 58],
    ['w-zwarte-zee', 'Zwarte Zee', 'water', 34, 43.3],
    ['w-kaspische-zee', 'Kaspische Zee', 'water', 50.5, 42],
    ['w-noordzee', 'Noordzee', 'water', 3.5, 56],
    ['w-oostzee', 'Oostzee', 'water', 19, 56.3],
    ['w-hudsonbaai', 'Hudsonbaai', 'water', -85, 60],
    ['w-tasmanzee', 'Tasmanzee', 'water', 160, -38],
    ['w-golf-van-guinee', 'Golf van Guinee', 'water', 2, 2],
    ['w-straat-van-gibraltar', 'Straat van Gibraltar', 'water', -5.6, 35.95],
    ['w-suezkanaal', 'Suezkanaal', 'water', 32.35, 30.5],
    ['w-panamakanaal', 'Panamakanaal', 'water', -79.7, 9.1],
    ['w-straat-van-malakka', 'Straat Malakka', 'water', 100.5, 3.5],
    ['w-beringstraat', 'Beringstraat', 'water', -169, 65.8],
    ['w-victoriameer', 'Victoriameer', 'water', 33, -1],
    ['w-baikalmeer', 'Baikalmeer', 'water', 108, 53.5],
    ['w-grote-meren', 'Grote Meren', 'water', -84, 45],
    ['w-titicacameer', 'Titicacameer', 'water', -69.3, -15.8],
    ['a-himalaya', 'Himalaya', 'gebergte', 84, 28.5],
    ['a-andes', 'Andes', 'gebergte', -70, -20],
    ['a-rocky-mountains', 'Rocky Mountains', 'gebergte', -110, 43],
    ['a-alpen', 'Alpen', 'gebergte', 10.5, 46.6],
    ['a-oeralgebergte', 'Oeralgebergte', 'gebergte', 59.3, 59],
    ['a-atlasgebergte', 'Atlasgebergte', 'gebergte', -4, 32],
    ['a-kaukasus', 'Kaukasus', 'gebergte', 44, 42.8],
    ['a-appalachen', 'Appalachen', 'gebergte', -80, 37.5],
    ['g-sahara', 'Sahara', 'gebied', 10, 23],
    ['g-gobi', 'Gobiwoestijn', 'gebied', 105, 43],
    ['g-kalahari', 'Kalahari', 'gebied', 22, -23],
    ['g-atacama', 'Atacamawoestijn', 'gebied', -69.5, -24],
    ['g-amazonegebied', 'Amazonegebied', 'gebied', -62, -4],
    ['g-siberie', 'Siberië', 'gebied', 100, 62],
    ['g-patagonie', 'Patagonië', 'gebied', -69, -46],
    ['g-kaap-de-goede-hoop', 'Kaap de Goede Hoop', 'gebied', 18.47, -34.36],
    ['g-kaap-hoorn', 'Kaap Hoorn', 'gebied', -67.27, -55.98],
    ['e-borneo', 'Borneo', 'eiland', 114, 0.5],
    ['e-sumatra', 'Sumatra', 'eiland', 101.5, -0.5],
    ['e-java', 'Java', 'eiland', 110, -7.4],
    ['e-nieuw-guinea', 'Nieuw-Guinea', 'eiland', 141, -5],
    ['e-tasmanie', 'Tasmanië', 'eiland', 146.6, -42],
    ['e-hawaii', 'Hawaï', 'eiland', -155.5, 19.6],
    ['e-groot-brittannie', 'Groot-Brittannië', 'eiland', -1.8, 53.2],
    ['e-vuurland', 'Vuurland', 'eiland', -68.5, -54],
    ['e-spitsbergen', 'Spitsbergen', 'eiland', 17, 78.5]
];
const gebieden = GEBIEDEN.map(([id, naam, soort, lon, lat]) => {
    const p = proj([lon, lat]);
    return { id, naam, soort, x: r1(p[0]), y: r1(p[1]) };
});
// Gebergten en grote gebieden krijgen hun omtrek (scripts/topografie-zones.js)
voegZonesToe(SRC, gebieden, proj, { tol: 0.3 });

// ---------- Wegschrijven ----------
const out = {
    basis: 'wereld',
    naam: 'Wereld',
    w: W,
    h: H,
    maxZoom: 40,
    bron: 'Kaartdata: Natural Earth',
    teksten: { vlakken: 'Landen', vlak: 'land', hoofdsteden: 'Hoofdsteden' },
    buurlanden: pathFromRings(achtergrond),
    meren: pathFromRings(meren),
    lijnen,
    provincies,
    rivieren,
    gebieden,
    // [id, naam, x, y, inwoners, provinciehoofdstad, hoofdstad]
    plaatsen: plaatsen.map((p) => [p.id, p.naam, p.x, p.y, p.pop, 0, p.hs])
};
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(out), 'utf8');
console.log('Geschreven: ' + OUT + ' (' + Math.round(fs.statSync(OUT).size / 1024) + ' kB), ' + W + 'x' + H);
console.log('  ' + provincies.length + ' landen (' + provincies.filter((p) => p.stip).length + ' met stip), ' +
    rivieren.length + ' rivieren, ' + gebieden.length + ' gebieden, ' + plaatsen.length + ' steden (' +
    plaatsen.filter((p) => p.hs).length + ' hoofdsteden), ' + meren.length + ' meren');

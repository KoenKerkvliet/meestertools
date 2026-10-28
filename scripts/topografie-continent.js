#!/usr/bin/env node
/* ============================================
   MEESTERTOOLS - Topografie: basiskaarten van werelddelen bouwen

   Maakt assets/topografie/noordamerika.json en zuidamerika.json, in dezelfde
   vorm als europa.json (landen in het veld 'provincies' met soort 'land').
   Per werelddeel staat hieronder een blok instellingen; een nieuw werelddeel
   is een nieuw blok.

   Bronnen: dezelfde Natural Earth-bestanden als scripts/topografie-europa.js
   (ne_countries, ne_rivers, ne_lakes, ne_places), in een eigen map:

     node scripts/topografie-continent.js <map-met-bronnen> [noordamerika|zuidamerika]

   Zonder tweede argument worden ze allebei gebouwd.

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

const SRC = process.argv[2];
if (!SRC) {
    console.error('Gebruik: node scripts/topografie-continent.js <map-met-bronnen> [noordamerika|zuidamerika]');
    process.exit(1);
}
const lees = (() => {
    const cache = {};
    return (f) => cache[f] || (cache[f] = JSON.parse(fs.readFileSync(path.join(SRC, f), 'utf8')));
})();

// ---------- Instellingen per werelddeel ----------
// midden: middelpunt van de Lambert-projectie; rand: punten die in beeld
// moeten vallen; landen: wat een klikbaar land is (de rest is achtergrond);
// splits: een stuk van een land dat hier een eigen item is (Frans-Guyana).
const WERELDDELEN = {
    noordamerika: {
        naam: 'Noord-Amerika',
        midden: [-95, 45],
        rand: [[-168, 66], [-168, 54], [-135, 57], [-125, 30], [-118, 22], [-92, 13], [-77, 7.2], [-60, 10], [-77, 12], [-52, 30],
            [-58, 47], [-22, 70], [-30, 83.5], [-75, 83], [-120, 77], [-160, 71]],
        landen: 'CAN USA MEX GRL GTM BLZ SLV HND NIC CRI PAN CUB JAM HTI DOM BHS TTO BRB ATG KNA DMA LCA VCT GRD ABW CUW SXM',
        landNaam: { USA: 'Verenigde Staten', GRL: 'Groenland', DOM: 'Dominicaanse Republiek' },
        // Hoofdsteden die Natural Earth niet als landshoofdstad kent
        extraPlaatsen: [
            ['x-willemstad', 'Willemstad', -68.93, 12.11, 140000, 1],
            ['x-oranjestad', 'Oranjestad', -70.03, 12.52, 30000, 1],
            ['x-philipsburg', 'Philipsburg', -63.05, 18.03, 1300, 1],
            ['x-kralendijk', 'Kralendijk', -68.27, 12.15, 3000, 0]
        ],
        minInwoners: 1000000,
        // Het Canadese poolgebied is een doolhof van eilandjes en meertjes:
        // grover vereenvoudigen, en alleen de grotere meren
        tol: 0.6, minOpp: 0.6, meerRang: 2,
        rivieren: {
            Mississippi: 'Mississippi', Missouri: 'Missouri', Ohio: 'Ohio', Arkansas: 'Arkansas',
            'Rio Grande': 'Rio Grande', Colorado: 'Colorado', Columbia: 'Columbia', Yukon: 'Yukon',
            Mackenzie: 'Mackenzie', 'St. Lawrence': 'Sint-Laurensrivier', Nelson: 'Nelson',
            Saskatchewan: 'Saskatchewan', Hudson: 'Hudson'
        },
        rivierGebied: { Colorado: [-120, -105, 28, 42], Mackenzie: [-140, -110, 55, 70] },
        gebieden: [
            ['w-atlantische-oceaan', 'Atlantische Oceaan', 'water', -55, 32],
            ['w-stille-oceaan', 'Stille Oceaan', 'water', -132, 30],
            ['w-noordelijke-ijszee', 'Noordelijke IJszee', 'water', -140, 74],
            ['w-golf-van-mexico', 'Golf van Mexico', 'water', -90, 25],
            ['w-caribische-zee', 'Caribische Zee', 'water', -75, 15],
            ['w-hudsonbaai', 'Hudsonbaai', 'water', -85, 60],
            ['w-baffinbaai', 'Baffinbaai', 'water', -66, 73],
            ['w-labradorzee', 'Labradorzee', 'water', -55, 58],
            ['w-beringzee', 'Beringzee', 'water', -175, 58],
            ['w-beringstraat', 'Beringstraat', 'water', -169, 65.8],
            ['w-golf-van-alaska', 'Golf van Alaska', 'water', -145, 57],
            ['w-golf-van-californie', 'Golf van Californië', 'water', -110.5, 27],
            ['w-panamakanaal', 'Panamakanaal', 'water', -79.7, 9.1],
            ['w-bovenmeer', 'Bovenmeer', 'water', -87.5, 47.7],
            ['w-michiganmeer', 'Michiganmeer', 'water', -87, 44],
            ['w-huronmeer', 'Huronmeer', 'water', -82.3, 44.8],
            ['w-eriemeer', 'Eriemeer', 'water', -81.2, 42.2],
            ['w-ontariomeer', 'Ontariomeer', 'water', -77.8, 43.6],
            ['w-groot-berenmeer', 'Groot Berenmeer', 'water', -121, 66],
            ['w-groot-slavenmeer', 'Groot Slavenmeer', 'water', -114, 61.5],
            ['w-winnipegmeer', 'Winnipegmeer', 'water', -97.5, 52.5],
            ['a-rocky-mountains', 'Rocky Mountains', 'gebergte', -110, 45],
            ['a-appalachen', 'Appalachen', 'gebergte', -80, 37.5],
            ['a-sierra-madre', 'Sierra Madre', 'gebergte', -105.5, 25],
            ['a-sierra-nevada', 'Sierra Nevada', 'gebergte', -119.3, 37.5],
            ['g-grote-vlakten', 'Grote Vlakten', 'gebied', -101, 41],
            ['g-grand-canyon', 'Grand Canyon', 'gebied', -112.1, 36.1],
            ['g-niagarawatervallen', 'Niagarawatervallen', 'gebied', -79.07, 43.08],
            ['g-alaska', 'Alaska', 'gebied', -152, 64],
            ['g-florida', 'Florida', 'gebied', -81.6, 28],
            ['g-baja-california', 'Baja California', 'gebied', -113.5, 28.5],
            ['g-yucatan', 'Yucatán', 'gebied', -89, 19.8],
            ['g-labrador', 'Labrador', 'gebied', -62, 54],
            ['g-grote-antillen', 'Grote Antillen', 'gebied', -76, 20.5],
            ['g-kleine-antillen', 'Kleine Antillen', 'gebied', -61.3, 15.5],
            ['e-newfoundland', 'Newfoundland', 'eiland', -56, 48.8],
            ['e-baffineiland', 'Baffineiland', 'eiland', -72, 69],
            ['e-vancouvereiland', 'Vancouvereiland', 'eiland', -125.8, 49.6],
            ['e-puerto-rico', 'Puerto Rico', 'eiland', -66.5, 18.2],
            ['e-bonaire', 'Bonaire', 'eiland', -68.27, 12.2],
            ['e-sint-eustatius', 'Sint Eustatius', 'eiland', -62.97, 17.49],
            ['e-saba', 'Saba', 'eiland', -63.23, 17.63]
        ]
    },
    zuidamerika: {
        naam: 'Zuid-Amerika',
        midden: [-60, -20],
        rand: [[-81.5, 12.5], [-74, 14.5], [-60, 13], [-34.5, -7], [-34, -28], [-48, -28], [-75, -56], [-63, -56], [-92, -1.5], [-81.5, -6]],
        landen: 'ARG BOL BRA CHL COL ECU GUY PRY PER SUR URY VEN FLK',
        landNaam: { FLK: 'Falklandeilanden' },
        splits: { GUF: { bron: 'FRA', box: [-55, -51, 2, 6.5], naam: 'Frans-Guyana' } },
        extraPlaatsen: [['x-cayenne', 'Cayenne', -52.33, 4.94, 60000, 1]],
        minInwoners: 1000000,
        rivieren: {
            Amazonas: 'Amazone', Ucayali: 'Amazone', 'Marañón': 'Amazone', 'Paraná': 'Paraná', Orinoco: 'Orinoco',
            'São  Francisco': 'São Francisco', 'São Francisco': 'São Francisco', Negro: 'Rio Negro', Madeira: 'Madeira',
            Paraguay: 'Paraguay', Uruguay: 'Uruguay', Magdalena: 'Magdalena', Tocantins: 'Tocantins', Xingu: 'Xingu'
        },
        rivierGebied: { Negro: [-70, -58, -4, 3] },
        gebieden: [
            ['w-atlantische-oceaan', 'Atlantische Oceaan', 'water', -37, -25],
            ['w-stille-oceaan', 'Stille Oceaan', 'water', -90, -25],
            ['w-caribische-zee', 'Caribische Zee', 'water', -73, 13.5],
            ['w-titicacameer', 'Titicacameer', 'water', -69.3, -15.8],
            ['w-rio-de-la-plata', 'Río de la Plata', 'water', -57, -35.2],
            ['w-straat-magellaan', 'Straat Magellaan', 'water', -70.5, -53.4],
            ['w-meer-van-maracaibo', 'Meer van Maracaibo', 'water', -71.6, 9.8],
            ['a-andes', 'Andes', 'gebergte', -69.5, -24],
            ['a-braziliaans-hoogland', 'Braziliaans Hoogland', 'gebergte', -46, -16],
            ['a-guyana-hoogland', 'Hoogland van Guyana', 'gebergte', -62, 5],
            ['g-amazonegebied', 'Amazonegebied', 'gebied', -62, -4],
            ['g-patagonie', 'Patagonië', 'gebied', -69, -46],
            ['g-atacamawoestijn', 'Atacamawoestijn', 'gebied', -69.5, -24],
            ['g-pampa', 'Pampa', 'gebied', -62.5, -36],
            ['g-gran-chaco', 'Gran Chaco', 'gebied', -61, -23],
            ['g-pantanal', 'Pantanal', 'gebied', -57, -18],
            ['g-iguazu-watervallen', 'Iguazú-watervallen', 'gebied', -54.44, -25.69],
            ['g-angelwaterval', 'Angelwaterval', 'gebied', -62.54, 5.97],
            ['g-kaap-hoorn', 'Kaap Hoorn', 'gebied', -67.27, -55.98],
            ['e-vuurland', 'Vuurland', 'eiland', -68.5, -54],
            ['e-galapagoseilanden', 'Galápagoseilanden', 'eiland', -90.5, -0.6],
            ['e-chiloe', 'Chiloé', 'eiland', -73.9, -42.6]
        ]
    }
};

function bouw(basis, cfg) {
    const OUT = path.resolve(__dirname, '..', 'assets', 'topografie', basis + '.json');

    // Lambert azimutaal oppervlaktegetrouw rond het midden van het werelddeel
    const RAD = Math.PI / 180, LON0 = cfg.midden[0] * RAD, LAT0 = cfg.midden[1] * RAD;
    const laea = (c) => {
        const l = c[0] * RAD - LON0, f = c[1] * RAD;
        const k = Math.sqrt(2 / (1 + Math.sin(LAT0) * Math.sin(f) + Math.cos(LAT0) * Math.cos(f) * Math.cos(l)));
        return [k * Math.cos(f) * Math.sin(l), k * (Math.cos(LAT0) * Math.sin(f) - Math.sin(LAT0) * Math.cos(f) * Math.cos(l))];
    };
    const xs = cfg.rand.map((c) => laea(c)[0]), ys = cfg.rand.map((c) => laea(c)[1]);
    const XMIN = Math.min(...xs), XMAX = Math.max(...xs), YMIN = Math.min(...ys), YMAX = Math.max(...ys);
    const W = 1000, SCALE = W / (XMAX - XMIN), H = Math.round((YMAX - YMIN) * SCALE);
    const proj = (c) => { const p = laea(c); return [(p[0] - XMIN) * SCALE, (YMAX - p[1]) * SCALE]; };
    const BX0 = -W * 0.6, BX1 = W * 1.6, BY0 = -H * 0.4, BY1 = H * 1.4;
    const binnenBeeld = (p) => p[0] >= 0 && p[0] <= W && p[1] >= 0 && p[1] <= H;
    // Alleen wat aan deze kant van de aarde ligt (de achterkant projecteert
    // in een Lambert-kaart naar de rand en geeft rommel)
    const zichtbaar = (c) => {
        const l = c[0] * RAD - LON0, f = c[1] * RAD;
        return Math.sin(LAT0) * Math.sin(f) + Math.cos(LAT0) * Math.cos(f) * Math.cos(l) > 0.05;
    };

    function ringen(polys, tol, minOpp) {
        const out = [];
        polys.forEach((poly) => poly.forEach((ring) => {
            if (!ring.every(zichtbaar)) return;
            let r = simplify(clipRing(ring.map(proj), BX0, BY0, BX1, BY1), tol);
            if (r.length >= 4 && ringArea(r) > minOpp) out.push(r);
        }));
        return out;
    }

    // ---------- Landen ----------
    const landen = cfg.landen.split(' ');
    const splits = cfg.splits || {};
    const landGeom = {}, achtergrond = [];
    function voegToe(a3, naam, polys) {
        let rs = ringen(polys, cfg.tol || 0.4, cfg.minOpp || 0.25);
        if (!rs.length) rs = ringen(polys, 0, 0);   // eilandstaatjes
        const l = (landGeom[a3] = landGeom[a3] || { naam, rings: [] });
        l.rings.push(...rs);
    }
    lees('ne_countries.geojson').features.forEach((f) => {
        const q = f.properties, a3 = q.ADM0_A3, polys = polygonsOf(f.geometry);
        const split = Object.keys(splits).filter((k) => splits[k].bron === a3)[0];
        if (split) {
            const b = splits[split].box;
            const inBox = (poly) => poly[0].some((c) => c[0] >= b[0] && c[0] <= b[1] && c[1] >= b[2] && c[1] <= b[3]);
            voegToe(split, splits[split].naam, polys.filter(inBox));
            achtergrond.push(...ringen(polys.filter((p) => !inBox(p)), 0.5, 0.5));
        } else if (landen.indexOf(a3) !== -1) {
            voegToe(a3, (cfg.landNaam || {})[a3] || q.NAME_NL || q.NAME, polys);
        } else {
            achtergrond.push(...ringen(polys, 0.5, 0.5));
        }
    });
    const provincies = Object.keys(landGeom).filter((a3) => landGeom[a3].rings.length).map((a3) => {
        const l = landGeom[a3];
        const inBeeld = l.rings.map((r) => clipRing(r, 0, 0, W, H)).filter((r) => r.length >= 4 && ringArea(r) > 0);
        const lp = labelPoint(inBeeld.length ? inBeeld : l.rings);
        const groot = l.rings.slice().sort((a, b) => ringArea(b) - ringArea(a))[0];
        let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
        groot.forEach((p) => { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); });
        const item = { id: a3, naam: l.naam, soort: 'land', d: pathFromRings(l.rings), lx: r1(lp[0]), ly: r1(lp[1]) };
        if (Math.hypot(x1 - x0, y1 - y0) < 15) item.stip = 1;
        return item;
    }).sort((a, b) => a.naam.localeCompare(b.naam, 'nl'));

    // ---------- Meren ----------
    const meren = [];
    lees('ne_lakes.geojson').features.forEach((f) => {
        if (f.properties.scalerank > (cfg.meerRang || 4)) return;
        ringen(polygonsOf(f.geometry), 0.4, 1).forEach((r) => { if (r.some(binnenBeeld)) meren.push(r); });
    });

    // ---------- Rivieren ----------
    const rivLines = {};
    lees('ne_rivers.geojson').features.forEach((f) => {
        const q = f.properties, naam = cfg.rivieren[q.name];
        if (!naam) return;
        const lines = f.geometry.type === 'LineString' ? [f.geometry.coordinates] : f.geometry.coordinates;
        const g = (cfg.rivierGebied || {})[q.name];
        if (g && !lines.some((l) => l.some((c) => c[0] >= g[0] && c[0] <= g[1] && c[1] >= g[2] && c[1] <= g[3]))) return;
        lines.forEach((l) => clipLine(l.filter(zichtbaar).map(proj), BX0, BY0, BX1, BY1).forEach((part) => {
            (rivLines[naam] = rivLines[naam] || []).push(simplify(part, 0.4));
        }));
    });
    const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const rivieren = Object.keys(rivLines).sort((a, b) => a.localeCompare(b, 'nl')).map((naam) => {
        const pts = [];
        rivLines[naam].forEach((l) => l.forEach((p) => { if (binnenBeeld(p)) pts.push(p); }));
        const lp = pts.length ? pts[Math.floor(pts.length / 2)] : rivLines[naam][0][0];
        return { id: 'r-' + slug(naam), naam, d: pathFromLines(rivLines[naam]), lx: r1(lp[0]), ly: r1(lp[1]) };
    });

    // ---------- Steden ----------
    const plaatsen = [], gezien = {};
    const regioHoofdstad = (q) => q.FEATURECLA === 'Admin-0 region capital';
    lees('ne_places.geojson').features.forEach((f) => {
        const q = f.properties;
        if (!landGeom[q.ADM0_A3] && !(splits[q.ADM0_A3])) return;
        const hoofd = q.ADM0CAP == 1 || (regioHoofdstad(q) && landen.indexOf(q.ADM0_A3) !== -1);
        if (!hoofd && q.POP_MAX < cfg.minInwoners) return;
        const p = proj(f.geometry.coordinates);
        if (!binnenBeeld(p)) return;
        const id = 'n' + (q.GEONAMESID > 0 ? q.GEONAMESID : q.NE_ID);
        if (gezien[id]) return;
        gezien[id] = 1;
        // Natural Earth heeft soms dezelfde stad twee keer (Vila Velha)
        const naam = q.NAME_NL || q.NAME;
        if (plaatsen.some((x) => x.naam === naam && Math.hypot(x.x - p[0], x.y - p[1]) < 15)) return;
        plaatsen.push({ id, naam, x: r1(p[0]), y: r1(p[1]), pop: q.POP_MAX || 0, hs: hoofd ? 1 : 0 });
    });
    (cfg.extraPlaatsen || []).forEach(([id, naam, lon, lat, pop, hs]) => {
        if (gezien[id] || plaatsen.some((p) => p.naam === naam)) return;
        const p = proj([lon, lat]);
        plaatsen.push({ id, naam, x: r1(p[0]), y: r1(p[1]), pop, hs });
    });
    plaatsen.sort((a, b) => b.pop - a.pop);

    // ---------- Gebieden ----------
    const gebieden = cfg.gebieden.map(([id, naam, soort, lon, lat]) => {
        const p = proj([lon, lat]);
        if (!binnenBeeld(p)) console.warn('  buiten beeld: ' + naam);
        return { id, naam, soort, x: r1(p[0]), y: r1(p[1]) };
    });

    const out = {
        basis, naam: cfg.naam, w: W, h: H,
        bron: 'Kaartdata: Natural Earth',
        teksten: { vlakken: 'Landen', vlak: 'land', hoofdsteden: 'Hoofdsteden', gebiedenKop: 'Wateren, gebergten en gebieden', gebiedGroep: 'Gebieden' },
        buurlanden: pathFromRings(achtergrond),
        meren: pathFromRings(meren),
        provincies, rivieren, gebieden,
        // [id, naam, x, y, inwoners, provinciehoofdstad, hoofdstad]
        plaatsen: plaatsen.map((p) => [p.id, p.naam, p.x, p.y, p.pop, 0, p.hs])
    };
    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.writeFileSync(OUT, JSON.stringify(out), 'utf8');
    console.log('Geschreven: ' + OUT + ' (' + Math.round(fs.statSync(OUT).size / 1024) + ' kB), ' + W + 'x' + H);
    console.log('  ' + provincies.length + ' landen (' + provincies.filter((p) => p.stip).map((p) => p.naam).join(', ') + ' met stip), ' +
        rivieren.length + ' rivieren, ' + gebieden.length + ' gebieden, ' + plaatsen.length + ' steden (' +
        plaatsen.filter((p) => p.hs).length + ' hoofdsteden), ' + meren.length + ' meren');
}

const welke = process.argv[3] ? [process.argv[3]] : Object.keys(WERELDDELEN);
welke.forEach((b) => {
    if (!WERELDDELEN[b]) { console.error('Onbekend werelddeel: ' + b); process.exit(1); }
    bouw(b, WERELDDELEN[b]);
});

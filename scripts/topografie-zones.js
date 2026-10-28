/* ============================================
   MEESTERTOOLS - Topografie: gebieden als zone

   Een gebergte of woestijn is geen stip maar een gebied. Dit koppelt de
   gebieden uit de bouwscripts aan een omtrek uit Natural Earth
   (ne_10m_geography_regions_polys.geojson). Op de kaart wordt dat een
   vaag gekleurde zone; de stip zelf blijft de plek van het label.

   Niet alles heeft een omtrek (Kilimanjaro, Kaap Hoorn, de Nederlandse
   streken): die blijven een stip.

   Gebruikt door scripts/topografie-europa.js, -wereld.js en -continent.js.
   Bron ophalen:
     curl -o ne_regions.geojson https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_geography_regions_polys.geojson
   ============================================ */

'use strict';

const fs = require('fs');
const path = require('path');
const { simplify, clipRing, ringArea, pathFromRings, polygonsOf } = require('./topografie-geo');

// Item-id -> naam (of namen) in Natural Earth. Meer namen: samen één zone.
const ZONES = {
    'a-alpen': ['ALPS'],
    'a-pyreneeen': ['PYRENEES'],
    'a-karpaten': ['CARPATHIAN MOUNTAINS', 'Transylvanian Alps'],
    'a-apennijnen': ['APPENNINI'],
    'a-oeralgebergte': ['URAL MOUNTAINS'],
    'a-kaukasus': ['CAUCASUS MTS.'],
    'a-scandinavisch-hoogland': ['KJØLEN MOUNTAINS'],
    'a-balkangebergte': ['Balkan Mts.'],
    'a-schotse-hooglanden': ['Grampian Mts.'],
    'a-himalaya': ['HIMALAYAS'],
    'a-hindoekoesj': ['HINDU KUSH'],
    'a-tiensjan': ['TIAN SHAN'],
    'a-altaj': ['ALTAY MOUNTAINS'],
    'a-zagrosgebergte': ['ZAGROS MOUNTAINS'],
    'a-andes': ['ANDES'],
    'a-rocky-mountains': ['ROCKY MOUNTAINS'],
    'a-appalachen': ['APPALACHIAN MTS.'],
    'a-sierra-madre': ['SIERRA MADRE OCCIDENTAL', 'SIERRA MADRE ORIENTAL', 'Sierra Madre del Sur'],
    'a-sierra-nevada': ['SIERRA NEVADA'],
    'a-braziliaans-hoogland': ['BRAZILIAN HIGHLANDS'],
    'a-guyana-hoogland': ['GUIANA HIGHLANDS'],
    'a-atlasgebergte': ['ATLAS MOUNTAINS'],
    'a-drakensbergen': ['DRAKENSBERG'],
    'a-ethiopisch-hoogland': ['ETHIOPIAN HIGHLANDS'],
    'a-great-dividing-range': ['GREAT DIVIDING RANGE'],
    'a-zuidelijke-alpen': ['SOUTHERN ALPS'],
    'g-sahara': ['SAHARA'],
    'g-sahel': ['SAHEL'],
    'g-kalahari': ['KALAHARI DESERT'],
    'g-namibwoestijn': ['NAMIB DESERT'],
    'g-gobi': ['GOBI DESERT'],
    'g-gobiwoestijn': ['GOBI DESERT'],
    'g-taklamakan': ['TAKLIMAKAN DESERT'],
    'g-atacama': ['DESIERTO DE ATACAMA'],
    'g-atacamawoestijn': ['DESIERTO DE ATACAMA'],
    'g-grote-victoriawoestijn': ['GREAT VICTORIA DESERT'],
    'g-tibet': ['PLATEAU OF TIBET'],
    'g-dekan': ['DECCAN PLATEAU'],
    'g-pampa': ['PAMPAS'],
    'g-gran-chaco': ['GRAN CHACO'],
    'g-grote-vlakten': ['GREAT PLAINS'],
    'g-amazonegebied': ['AMAZON BASIN'],
    'g-kongobekken': ['CONGO BASIN'],
    'g-serengeti': ['Serengeti Plains'],
    'g-iberisch-schiereiland': ['PENÍNSULA IBÉRICA']
};

let cache = null;
function regios(src) {
    if (!cache) {
        const f = path.join(src, 'ne_regions.geojson');
        if (!fs.existsSync(f)) { console.warn('  geen ne_regions.geojson: gebieden blijven een stip'); cache = []; }
        else cache = JSON.parse(fs.readFileSync(f, 'utf8')).features;
    }
    return cache;
}

// Zet g.z (een SVG-pad) bij elk gebied waarvoor een omtrek bestaat.
// proj: [lon, lat] -> [x, y]; zichtbaar (optioneel): of een punt aan deze
// kant van de aarde ligt (Lambert-kaarten); rand: [x0, y0, x1, y1] om op te knippen.
function voegZonesToe(src, gebieden, proj, opts) {
    opts = opts || {};
    const tol = opts.tol || 0.5;
    const r = opts.rand;
    const bron = regios(src);
    const norm = (s) => String(s || '').trim().toUpperCase();
    gebieden.forEach((g) => {
        const namen = ZONES[g.id];
        if (!namen) return;
        const rings = [];
        namen.forEach((naam) => {
            bron.filter((f) => norm(f.properties.NAME) === norm(naam)).forEach((f) => {
                polygonsOf(f.geometry).forEach((poly) => {
                    const ring = poly[0];
                    if (opts.zichtbaar && !ring.every(opts.zichtbaar)) return;
                    let p = ring.map(proj);
                    if (r) p = clipRing(p, r[0], r[1], r[2], r[3]);
                    p = simplify(p, tol);
                    if (p.length >= 4 && ringArea(p) > tol * tol * 4) rings.push(p);
                });
            });
        });
        if (rings.length) g.z = pathFromRings(rings);
        else console.warn('  geen omtrek gevonden voor ' + g.naam);
    });
}

module.exports = { voegZonesToe, ZONES };

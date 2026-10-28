#!/usr/bin/env node
/* ============================================
   MEESTERTOOLS - Topografie: voorbeeldkaartjes voor banner en homepage

   Maakt assets/topografie/voorbeeld-<basis>.svg: een klein, licht
   kaartje met gekleurde provincies of landen, zonder namen. Gebouwd uit de
   kaartbestanden zelf (assets/topografie/<basis>.json), sterk vereenvoudigd
   zodat elk plaatje maar een paar kilobyte is.

     node scripts/topografie-voorbeelden.js
   ============================================ */

'use strict';

const fs = require('fs');
const path = require('path');
const { simplify, ringArea, pathFromRings } = require('./topografie-geo');

const DIR = path.resolve(__dirname, '..', 'assets', 'topografie');
const KLEUREN = ['#FFE7A3', '#B9E3C6', '#F7C4B0', '#CFC6F5', '#A8DCEB', '#F5D0E3', '#E2EBA8'];

// basis -> [uitsnede x, y, w, h] in kaarteenheden, tolerantie
const KAARTEN = {
    nederland: { tol: 2.5 },
    europa: { uitsnede: [120, 120, 640, 560], tol: 3 },
    wereld: { uitsnede: [0, 20, 1000, 400], tol: 1.8 }
};

function ringen(d) {
    return d.split('Z').filter((r) => r.indexOf('M') !== -1).map((r) =>
        r.replace(/^[^M]*M/, '').split(/[LM]/).map((xy) => xy.split(',').map(Number)));
}

// Hele getallen zijn op dit formaat nauwkeurig genoeg en halveren de grootte
function vereenvoudig(d, tol) {
    return pathFromRings(ringen(d).map((r) => simplify(r, tol)).filter((r) => r.length >= 4 && ringArea(r) > tol * tol * 2))
        .replace(/-?\d+\.\d+/g, (n) => String(Math.round(+n)));
}

Object.keys(KAARTEN).forEach((basis) => {
    const cfg = KAARTEN[basis];
    const map = JSON.parse(fs.readFileSync(path.join(DIR, basis + '.json'), 'utf8'));
    const vb = cfg.uitsnede || [0, 0, map.w, map.h];
    const h = [];
    h.push('<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + vb.join(' ') + '">');
    h.push('<rect x="-500" y="-500" width="' + (map.w + 1000) + '" height="' + (map.h + 1000) + '" fill="#D7ECF8"/>');
    h.push('<path d="' + vereenvoudig(map.buurlanden, cfg.tol) + '" fill="#EFEDE6"/>');
    map.provincies.forEach((p, i) => {
        h.push('<path d="' + vereenvoudig(p.d, cfg.tol) + '" fill="' + KLEUREN[i % KLEUREN.length] + '" stroke="#fff" stroke-width="' + (cfg.tol * 0.8).toFixed(1) + '" stroke-linejoin="round"/>');
    });
    h.push('</svg>');
    const uit = path.join(DIR, 'voorbeeld-' + basis + '.svg');
    fs.writeFileSync(uit, h.join(''), 'utf8');
    console.log('Geschreven: ' + uit + ' (' + Math.round(fs.statSync(uit).size / 1024) + ' kB)');
});

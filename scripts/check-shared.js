#!/usr/bin/env node
/* ============================================
   MEESTERTOOLS - Controle op js/mt-shared.js

   De gedeelde helpers (window.MT) zitten in js/mt-shared.js. Elke pagina die
   een tool laadt die MT gebruikt, moet dat bestand ervoor inladen - anders
   klapt de tool eruit met "MT is not defined", en dat merk je pas in de klas.

   Dit script controleert:
     1. elke pagina die een MT-gebruiker laadt, laadt ook mt-shared.js;
     2. mt-shared.js staat vóór die gebruikers;
     3. niemand heeft stiekem weer een eigen kopie van een gedeelde helper.

   Draait in de GitHub Action 'Controle'. Handmatig: node scripts/check-shared.js
   ============================================ */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SHARED = 'mt-shared.js';
const SKIP_DIRS = new Set(['.git', '.github', 'node_modules', 'scripts', 'supabase']);

// Helpers die alleen nog in mt-shared.js een echte implementatie mogen hebben.
// Elders is een doorverwijzing (`return MT.x(...)`) prima.
const GEDEELD = ['escapeHtml', 'hashStr', 'monsterHash', 'assignMonsters', 'genCode'];

function walk(dir, ext, out = []) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        if (e.isDirectory()) {
            if (!SKIP_DIRS.has(e.name)) walk(path.join(dir, e.name), ext, out);
        } else if (e.name.endsWith(ext)) {
            out.push(path.join(dir, e.name));
        }
    }
    return out;
}

const problemen = [];

// --- Welke tool-scripts gebruiken MT? ---
const gebruikers = new Set();
for (const p of walk(path.join(ROOT, 'js'), '.js')) {
    const naam = path.basename(p);
    if (naam === SHARED) continue;
    const src = fs.readFileSync(p, 'utf8');
    if (/\bMT\./.test(src)) gebruikers.add(naam);

    // --- Eigen kopie van een gedeelde helper? ---
    for (const fn of GEDEELD) {
        const m = src.match(new RegExp('function\\s+' + fn + '\\s*\\([^)]*\\)\\s*\\{([^}]*)\\}'));
        if (m && !/return MT\./.test(m[1])) {
            problemen.push(`js/${naam}: eigen ${fn}() in plaats van MT.${fn} — zie js/${SHARED}`);
        }
    }
}

// --- Laadvolgorde per pagina ---
const SCRIPT_RE = /<script src="(?!https?:)([^"]+)"/g;
let paginas = 0;
for (const p of walk(ROOT, '.html')) {
    const src = fs.readFileSync(p, 'utf8');
    const volgorde = [...src.matchAll(SCRIPT_RE)].map((m) => path.basename(m[1].split('?')[0]));
    const gebruikt = volgorde.filter((f) => gebruikers.has(f));
    if (!gebruikt.length) continue;

    const rel = path.relative(ROOT, p).split(path.sep).join('/');
    const i = volgorde.indexOf(SHARED);
    if (i === -1) {
        problemen.push(`${rel}: laadt ${gebruikt.join(', ')} maar niet ${SHARED}`);
        continue;
    }
    const telaat = gebruikt.filter((f) => volgorde.indexOf(f) < i);
    if (telaat.length) {
        problemen.push(`${rel}: ${SHARED} staat ná ${telaat.join(', ')}`);
    } else {
        paginas++;
    }
}

console.log(`${gebruikers.size} tool-scripts gebruiken MT, ${paginas} pagina's laden ${SHARED} in de juiste volgorde.`);

if (problemen.length) {
    console.error('\nProblemen (' + problemen.length + '):');
    problemen.forEach((x) => console.error('  ' + x));
    process.exit(1);
}

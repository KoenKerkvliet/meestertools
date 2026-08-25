#!/usr/bin/env node
/* ============================================
   MEESTERTOOLS - Versie zetten + cache-busting

   Eén bron van waarheid: de VERSION in js/template.js. Dit script zet die
   versie ook achter elke eigen css/js-verwijzing in de HTML, als ?v=1.46.1.

   Waarom: GitHub Pages serveert alles met max-age=600. Zonder ?v kunnen de
   HTML en de JS onafhankelijk van elkaar verlopen, en dan draait iemand
   nieuwe HTML met oude JS (of oude JS die naar verwijderde plaatjes wijst).
   Met ?v horen ze bij elkaar: ververst de HTML, dan ververst de rest mee.

   Gebruik:
     node scripts/set-version.js            # sync HTML met de huidige versie
     node scripts/set-version.js 1.47.0     # versie ophogen én syncen
     node scripts/set-version.js --check    # niets wijzigen, alleen melden
                                            # (exit 1 als er iets niet klopt)
   ============================================ */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TEMPLATE = path.join(ROOT, 'js', 'template.js');
const VERSION_RE = /const VERSION = 'v([^']+)';/;

// Mappen die we nooit doorzoeken.
const SKIP_DIRS = new Set(['.git', '.github', 'node_modules', 'scripts', 'supabase']);

function readVersion() {
    const m = fs.readFileSync(TEMPLATE, 'utf8').match(VERSION_RE);
    if (!m) {
        console.error('Kan VERSION niet vinden in js/template.js');
        process.exit(1);
    }
    return m[1];
}

function writeVersion(v) {
    const src = fs.readFileSync(TEMPLATE, 'utf8');
    fs.writeFileSync(TEMPLATE, src.replace(VERSION_RE, "const VERSION = 'v" + v + "';"), 'utf8');
}

function htmlFiles(dir, out) {
    out = out || [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory()) {
            if (!SKIP_DIRS.has(entry.name)) htmlFiles(path.join(dir, entry.name), out);
        } else if (entry.name.endsWith('.html')) {
            out.push(path.join(dir, entry.name));
        }
    }
    return out;
}

// href/src naar een eigen .css of .js. Externe bestanden (CDN) blijven ongemoeid:
// die hebben hun eigen versienummer al in het pad staan.
const ASSET_RE = /\b(href|src)="([^"]+?\.(?:css|js))(\?v=[^"]*)?"/g;

function isLocal(url) {
    return !/^(?:https?:)?\/\//.test(url);
}

function main() {
    const args = process.argv.slice(2);
    const check = args.includes('--check');
    const bump = args.find((a) => !a.startsWith('-'));

    if (bump) {
        if (!/^\d+\.\d+\.\d+$/.test(bump)) {
            console.error('Geef de versie als 1.47.0 (zonder de v).');
            process.exit(1);
        }
        if (check) {
            console.error('--check en een versienummer gaan niet samen.');
            process.exit(1);
        }
        writeVersion(bump);
        console.log('Versie gezet op v' + bump + ' in js/template.js');
    }

    const version = readVersion();
    const files = htmlFiles(ROOT);
    let changed = 0;
    let refs = 0;
    const stale = [];

    for (const file of files) {
        const src = fs.readFileSync(file, 'utf8');
        const out = src.replace(ASSET_RE, (match, attr, url, current) => {
            if (!isLocal(url)) return match;
            refs++;
            const want = attr + '="' + url + '?v=' + version + '"';
            if (match !== want) stale.push(path.relative(ROOT, file) + ' -> ' + url);
            return want;
        });
        if (out !== src) {
            changed++;
            if (!check) fs.writeFileSync(file, out, 'utf8');
        }
    }

    console.log(
        (check ? 'Gecontroleerd: ' : 'Bijgewerkt: ') +
        files.length + ' HTML-bestanden, ' + refs + ' eigen css/js-verwijzingen, ' +
        'versie v' + version
    );

    if (check && stale.length) {
        console.error('\nNiet in sync (' + stale.length + '):');
        stale.slice(0, 20).forEach((s) => console.error('  ' + s));
        if (stale.length > 20) console.error('  ... en nog ' + (stale.length - 20));
        console.error('\nDraai: node scripts/set-version.js');
        process.exit(1);
    }
    if (!check) console.log(changed + ' bestand(en) gewijzigd.');
}

main();

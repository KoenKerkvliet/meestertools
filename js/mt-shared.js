/* ============================================
   MEESTERTOOLS - Gedeelde helpers (window.MT)

   Deze functies stonden tot v1.48.0 in tientallen bestanden los van elkaar:
   escapeHtml 29x (in 10 varianten), assignMonsters 13x, hashStr 7x, genCode 5x.
   Ze moeten allemaal hetzelfde doen - het monster-algoritme zelfs identiek aan
   de kant van de edge functions, anders ziet een kind in de ene tool een ander
   monstertje dan in de andere.

   Laadt als eerste eigen script op elke pagina die het nodig heeft.
   De serverkant staat in supabase/functions/_shared/monsters.ts en moet
   gelijk blijven met assignMonsters/hashStr/monsterPath hieronder.
   ============================================ */

(function (global) {
    'use strict';

    var MONSTER_COUNT = 36;

    // Escapet ook " en ' - nodig zodra een waarde in een attribuut belandt.
    // De oude div.textContent-truc deed dat niet, waardoor een aanhalingsteken
    // in bijvoorbeeld een groepsnaam uit zijn attribuut kon breken.
    var ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    function escapeHtml(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ESC[c]; });
    }

    function normName(s) {
        return String(s == null ? '' : s).trim().toLowerCase();
    }

    // Stabiele hash over een id. Bewust simpel en niet-cryptografisch: hij moet
    // alleen elke keer hetzelfde getal geven, ook in Deno op de server.
    function hashStr(key) {
        var h = 0;
        key = String(key || '');
        for (var i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
        return h;
    }

    // Elk kind in een groep krijgt een vast, binnen de klas uniek monstertje.
    // Sorteren op id maakt de uitkomst onafhankelijk van de volgorde waarin de
    // lijst binnenkomt; bij een botsing schuiven we door naar het volgende vrije.
    function assignMonsters(list) {
        var map = {}, used = {};
        (list || []).slice().sort(function (a, b) {
            var ai = String(a.id), bi = String(b.id);
            return ai < bi ? -1 : ai > bi ? 1 : 0;
        }).forEach(function (s) {
            var n = hashStr(s.id) % MONSTER_COUNT, tries = 0;
            while (used[n] && tries < MONSTER_COUNT) { n = (n + 1) % MONSTER_COUNT; tries++; }
            used[n] = true;
            map[s.id] = n + 1;
        });
        return map;
    }

    // prefix is het pad naar de root vanaf de pagina ('', '../', '../../').
    function monsterPath(n, prefix) {
        var nn = n < 10 ? '0' + n : String(n);
        return (prefix || '') + 'assets/avatars/monsters/monster-' + nn + '.webp';
    }

    // Sessiecode voor op het bord. Zonder I, O, 0, 1 en L, want die worden
    // door kinderen structureel verkeerd overgetypt.
    function genCode(len) {
        var ALPH = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
        var arr = new Uint32Array(len);
        crypto.getRandomValues(arr);
        var s = '';
        for (var i = 0; i < len; i++) s += ALPH[arr[i] % ALPH.length];
        return s;
    }

    global.MT = {
        MONSTER_COUNT: MONSTER_COUNT,
        escapeHtml: escapeHtml,
        normName: normName,
        hashStr: hashStr,
        assignMonsters: assignMonsters,
        monsterPath: monsterPath,
        genCode: genCode
    };
})(window);

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

    // ---------- Scholen op naam herkennen ----------
    // "BS de Schatgraver", "obs Schatgraver" en "de Schatgraver" zijn dezelfde
    // school, maar als losse tekst zijn het drie verschillende namen. Zonder
    // deze normalisatie maakt elke collega die zijn eigen schrijfwijze intikt
    // een nieuw schoolrecord aan.
    //
    // De sleutel is bewust grof: schoolsoort en lidwoorden eraf, accenten en
    // leestekens weg, spaties dicht. Twee scholen kunnen daardoor op dezelfde
    // sleutel uitkomen ("Het Talent" en "Talent"), en daarom is een gelijke
    // sleutel nooit genoeg om ze samen te voegen - de gebruiker bevestigt het,
    // en het moet bovendien dezelfde plaats zijn. Zie cityKey hieronder.
    var SCHOOL_WORDS = [
        'basisschool', 'bassisschool', 'basis', 'school',
        'rkbs', 'pcbs', 'obs', 'kbs', 'ibs', 'sbo', 'vso', 'bs', 'so',
        'de', 'het', 'een', 't'
    ].sort(function (a, b) { return b.length - a.length; });

    function stripAccents(t) {
        return t.normalize ? t.normalize('NFD').replace(/[̀-ͯ]/g, '') : t;
    }

    function schoolKey(s) {
        var t = stripAccents(String(s == null ? '' : s).toLowerCase());
        t = t.replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();

        // Voorvoegsels er net zolang afhalen als er nog iets overblijft:
        // "bs de schatgraver" -> "de schatgraver" -> "schatgraver".
        var verder = true;
        while (verder) {
            verder = false;
            for (var i = 0; i < SCHOOL_WORDS.length; i++) {
                var w = SCHOOL_WORDS[i];
                if (t === w) continue;                    // niets overhouden mag niet
                if (t.indexOf(w + ' ') === 0) {
                    t = t.slice(w.length + 1);
                    verder = true;
                    break;
                }
            }
        }
        return t.replace(/\s+/g, '');
    }

    // Plaatsen vergelijken we alleen op schrijfwijze, niet op betekenis:
    // "Den Haag" en "'s-Gravenhage" blijven verschillend. Dat is de veilige
    // kant op - twee scholen ten onrechte gescheiden houden is een dubbeling,
    // ten onrechte samenvoegen is gegevens van een andere school binnenhalen.
    function cityKey(s) {
        var t = stripAccents(String(s == null ? '' : s).toLowerCase());
        return t.replace(/[^a-z0-9]+/g, '');
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
        genCode: genCode,
        schoolKey: schoolKey,
        cityKey: cityKey
    };
})(window);

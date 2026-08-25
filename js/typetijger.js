/* ============================================
   MEESTERTOOLS - Typetijger (typcursus)

   Een touch-type-cursus voor leerlingen van 10-12 jaar.
   - Lessen bouwen rij voor rij op (thuisrij -> toprij -> onderrij ->
     hoofdletters -> cijfers -> woorden & zinnen).
   - Een on-screen toetsenbord wijst de volgende toets aan en kleurt
     elke toets op vingerkleur (welke vinger hoort erbij).
   - Live statistieken: tijd, aanslagen per minuut, nauwkeurigheid.
   - Voortgang (beste score + afgerond) wordt per browser bewaard in
     localStorage zodat een kind de volgende keer verdergaat.

   Geen DB-afhankelijkheid: werkt volledig client-side.
   ============================================ */

(function () {
    'use strict';

    var STORE_KEY = 'mt_typetijger_v1';

    // ---------- Vinger-indeling (QWERTY) ----------
    // Elke toets hoort bij één vinger. De kleur komt uit de CSS-klasse.
    var FINGERS = {
        lp: { naam: 'linkerpink',      kl: 'f-lp' },
        lr: { naam: 'linkerringvinger', kl: 'f-lr' },
        lm: { naam: 'linkermiddelvinger', kl: 'f-lm' },
        li: { naam: 'linkerwijsvinger', kl: 'f-li' },
        ri: { naam: 'rechterwijsvinger', kl: 'f-ri' },
        rm: { naam: 'rechtermiddelvinger', kl: 'f-rm' },
        rr: { naam: 'rechterringvinger', kl: 'f-rr' },
        rp: { naam: 'rechterpink',     kl: 'f-rp' },
        th: { naam: 'duim',            kl: 'f-th' }
    };

    // Welke vinger hoort bij welke (kleine-letter) toets.
    var KEY_FINGER = {
        '1': 'lp', '2': 'lr', '3': 'lm', '4': 'li', '5': 'li',
        '6': 'ri', '7': 'ri', '8': 'rm', '9': 'rr', '0': 'rp',
        'q': 'lp', 'w': 'lr', 'e': 'lm', 'r': 'li', 't': 'li',
        'y': 'ri', 'u': 'ri', 'i': 'rm', 'o': 'rr', 'p': 'rp',
        'a': 'lp', 's': 'lr', 'd': 'lm', 'f': 'li', 'g': 'li',
        'h': 'ri', 'j': 'ri', 'k': 'rm', 'l': 'rr', ';': 'rp',
        'z': 'lp', 'x': 'lr', 'c': 'lm', 'v': 'li', 'b': 'li',
        'n': 'ri', 'm': 'ri', ',': 'rm', '.': 'rr', '/': 'rp',
        '`': 'lp', '-': 'rp', '=': 'rp', '[': 'rp', ']': 'rp', '\\': 'rp', '\'': 'rp',
        ' ': 'th'
    };

    // Toetsenbord-layout (zoals een echt toetsenbord), met de natuurlijke
    // "stagger": de breedte van Tab/Caps Lock/Shift schuift elke rij iets op,
    // zodat de M netjes tussen de J en de K valt.
    // Per toets: key = te typen teken (krijgt data-key + vingerkleur),
    // sub = teken-met-shift (klein erboven), label = vaste opdruk (Tab, Shift),
    // w = breedte in toets-eenheden, mod = data-mod, cls = extra klasse.
    var KB_LAYOUT = [
        // Cijferrij
        { keys: [
            { key: '`', sub: '~' }, { key: '1', sub: '!' }, { key: '2', sub: '@' },
            { key: '3', sub: '#' }, { key: '4', sub: '$' }, { key: '5', sub: '%' },
            { key: '6', sub: '^' }, { key: '7', sub: '&' }, { key: '8', sub: '*' },
            { key: '9', sub: '(' }, { key: '0', sub: ')' }, { key: '-', sub: '_' },
            { key: '=', sub: '+' }, { label: '&#9003;', w: 2, mod: 'backspace', cls: 'tc-key-mod' }
        ] },
        // Toprij
        { keys: [
            { label: 'Tab', w: 1.5, mod: 'tab', cls: 'tc-key-mod' },
            { key: 'q' }, { key: 'w' }, { key: 'e' }, { key: 'r' }, { key: 't' },
            { key: 'y' }, { key: 'u' }, { key: 'i' }, { key: 'o' }, { key: 'p' },
            { key: '[', sub: '{' }, { key: ']', sub: '}' }, { key: '\\', sub: '|', w: 1.5 }
        ] },
        // Thuisrij
        { keys: [
            { label: 'Caps Lock', w: 1.75, mod: 'caps', cls: 'tc-key-mod' },
            { key: 'a' }, { key: 's' }, { key: 'd' }, { key: 'f' }, { key: 'g' },
            { key: 'h' }, { key: 'j' }, { key: 'k' }, { key: 'l' },
            { key: ';', sub: ':' }, { key: '\'', sub: '"' },
            { label: '&#9166;', w: 2.25, mod: 'enter', cls: 'tc-key-mod' }
        ] },
        // Onderrij
        { keys: [
            { label: 'Shift', w: 2.25, mod: 'shift-l', cls: 'tc-key-mod' },
            { key: 'z' }, { key: 'x' }, { key: 'c' }, { key: 'v' }, { key: 'b' },
            { key: 'n' }, { key: 'm' }, { key: ',', sub: '<' }, { key: '.', sub: '>' },
            { key: '/', sub: '?' }, { label: 'Shift', w: 2.75, mod: 'shift-r', cls: 'tc-key-mod' }
        ] },
        // Spatierij
        { keys: [
            { label: 'Ctrl', w: 1.4, cls: 'tc-key-mod' },
            { label: '', w: 1.1, cls: 'tc-key-deco tc-key-pink' },
            { label: 'Alt', w: 1.25, cls: 'tc-key-mod' },
            { key: ' ', w: 6.4, space: true },
            { label: 'Alt Gr', w: 1.25, cls: 'tc-key-mod' },
            { label: '', w: 1.1, cls: 'tc-key-deco tc-key-pink' },
            { label: '', w: 1.1, cls: 'tc-key-deco tc-key-purple' },
            { label: 'Ctrl', w: 1.4, cls: 'tc-key-mod' }
        ] }
    ];

    // Een hoofdletter / leesteken-met-shift typ je met de SHIFT aan de
    // tegenovergestelde hand. Voor de cijfers gebruiken we de gewone toets.
    function shiftHandFor(baseFinger) {
        // toets met linkerhand -> rechter shift, en andersom
        if (baseFinger && baseFinger.charAt(0) === 'l') return 'rp';
        return 'lp';
    }

    // ---------- Lessen ----------
    // Elke les: { id, niveau, titel, intro, nieuw:[toetsen], caps:bool,
    //             oefeningen:[regels] }
    var LESSONS = [
        // ---- Thuisrij ----
        {
            id: 'thuis-1', niveau: 'Thuisrij', titel: 'Start: f en j',
            intro: 'Leg je wijsvingers op de F en de J. Voel je de bobbeltjes? Daar begint alles.',
            nieuw: ['f', 'j'],
            oefeningen: [
                'fff jjj fff jjj fff jjj',
                'fj fj jf jf fj jf fjfj',
                'ffj jjf fjf jfj ffjj jjff',
                'fj jf ff jj fjf jfj fj jf'
            ]
        },
        {
            id: 'thuis-2', niveau: 'Thuisrij', titel: 'Erbij: d en k',
            intro: 'Je middelvingers pakken de D (links) en de K (rechts). Blijf met je wijsvingers op F en J liggen.',
            nieuw: ['d', 'k'],
            oefeningen: [
                'ddd kkk ddd kkk dkdk kdkd',
                'dk kd dd kk dkd kdk dkkd',
                'fd jk df kj fdk jkd fjdk',
                'dkfj jkfd fkdj kdjf dk fj'
            ]
        },
        {
            id: 'thuis-3', niveau: 'Thuisrij', titel: 'Erbij: s en l',
            intro: 'De ringvingers doen de S (links) en de L (rechts). Rustig en netjes, niet zo snel.',
            nieuw: ['s', 'l'],
            oefeningen: [
                'sss lll sss lll slsl lsls',
                'sl ls ss ll sld lks sl ls',
                'als als sla sla lds skl',
                'salk klas dals slak ls sl'
            ]
        },
        {
            id: 'thuis-4', niveau: 'Thuisrij', titel: 'De pinken: a en ;',
            intro: 'De pinken zijn klein maar dapper: links de A, rechts de ; (puntkomma).',
            nieuw: ['a', ';'],
            oefeningen: [
                'aaa ;;; aaa ;;; a;a; ;a;a',
                'as la ka da; sa; fa; ja;',
                'aas laa kaa das saal;',
                'la;s da;k sa;l ka;d a; ;a'
            ]
        },
        {
            id: 'thuis-5', niveau: 'Thuisrij', titel: 'Naar het midden: g en h',
            intro: 'Strek je wijsvingers naar binnen: links de G, rechts de H. Dan is de hele thuisrij compleet!',
            nieuw: ['g', 'h'],
            oefeningen: [
                'ggg hhh ggg hhh ghgh hghg',
                'gh hg gas had lag hal gah',
                'gala hals dahl gaaf hagel',
                'sjaal galg dahlia hagel; gh'
            ]
        },
        {
            id: 'thuis-6', niveau: 'Thuisrij', titel: 'Woorden van de thuisrij',
            intro: 'Alle thuisrij-toetsen samen. Kijk niet naar je handen — voel waar de toetsen zitten.',
            nieuw: [],
            oefeningen: [
                'als dag gas had lag sla sjaal',
                'glas hals klad slag dahl flask',
                'jakhals galgje hagedis salade',
                'de slang lag als gas had glas'
            ]
        },
        // ---- Toprij ----
        {
            id: 'top-1', niveau: 'Toprij', titel: 'Toprij: e en i',
            intro: 'Til je middelvingers omhoog: links de E, rechts de I. Daarna terug naar de thuisrij.',
            nieuw: ['e', 'i'],
            oefeningen: [
                'eee iii eee iii eiei ieie',
                'ei ie de ki le ji se li',
                'die fee lie kei eik geel',
                'lief diesel ideale jakhals'
            ]
        },
        {
            id: 'top-2', niveau: 'Toprij', titel: 'Toprij: r en u',
            intro: 'De wijsvingers omhoog: links de R, rechts de U. Strek even en kom weer terug.',
            nieuw: ['r', 'u'],
            oefeningen: [
                'rrr uuu rrr uuu ruru urur',
                'ru ur ar ru de ur fri jul',
                'rood uur duur rust ruig erbij',
                'rugzak kruier ruziede ridder'
            ]
        },
        {
            id: 'top-3', niveau: 'Toprij', titel: 'Toprij: w en o',
            intro: 'Ringvingers omhoog: links de W, rechts de O. Blijf rustig ademen.',
            nieuw: ['w', 'o'],
            oefeningen: [
                'www ooo www ooo wowo owow',
                'wo ow law wol koe wow doolhof',
                'wow woud koud oase weide kool',
                'wolkje wortel kwadraat woorden'
            ]
        },
        {
            id: 'top-4', niveau: 'Toprij', titel: 'Toprij: q, t, y en p',
            intro: 'De laatste toprij-toetsen: Q (linkerpink), T (linkerwijs), Y (rechterwijs) en P (rechterpink).',
            nieuw: ['q', 't', 'y', 'p'],
            oefeningen: [
                'ttt yyy ppp qqq tyqp pqty',
                'ty pt qy tp top typ quote',
                'pop tante type quiz party',
                'piraat troep poetst typt quasi'
            ]
        },
        {
            id: 'top-5', niveau: 'Toprij', titel: 'Woorden met de hele toprij',
            intro: 'Thuisrij én toprij door elkaar. Lekkere woorden om soepel te worden.',
            nieuw: [],
            oefeningen: [
                'water tafel groep poort straat',
                'lekker fiets ouder paard tijger',
                'de tijger drinkt water uit de poort',
                'wij typen rustig elke dag wat sneller'
            ]
        },
        // ---- Onderrij ----
        {
            id: 'onder-1', niveau: 'Onderrij', titel: 'Onderrij: v en n',
            intro: 'Naar beneden met de wijsvingers: links de V, rechts de N. Kort tikje, weer terug.',
            nieuw: ['v', 'n'],
            oefeningen: [
                'vvv nnn vvv nnn vnvn nvnv',
                'vn nv van nen vin nuf van',
                'van vin nul vlag noen venijn',
                'november venijnig vlinder vangnet'
            ]
        },
        {
            id: 'onder-2', niveau: 'Onderrij', titel: 'Onderrij: c en m',
            intro: 'Middelvinger links de C, rechterwijsvinger de M. Let op je houding!',
            nieuw: ['c', 'm'],
            oefeningen: [
                'ccc mmm ccc mmm cmcm mcmc',
                'cm mc cma mac com mic cam',
                'macht muziek camera commando',
                'maximum cement microscoop machine'
            ]
        },
        {
            id: 'onder-3', niveau: 'Onderrij', titel: 'Onderrij: b, x, z en ,',
            intro: 'De rest van de onderrij: B en de pink-toetsen X, Z en de komma (,).',
            nieuw: ['b', 'x', 'z', ','],
            oefeningen: [
                'bbb zzz xxx ,,, bzx, zbx,',
                'bz xz bo, za, box biz buzz',
                'zebra bijzon examen buizen,',
                'zaterdag, bizon, exotisch, bezem'
            ]
        },
        {
            id: 'onder-4', niveau: 'Onderrij', titel: 'Punt en alle letters',
            intro: 'De punt (.) doe je met je rechterringvinger. Nu kun je alle letters!',
            nieuw: ['.'],
            oefeningen: [
                'de kat zat op de mat.',
                'wij gaan naar buiten spelen.',
                'een tijger is snel en sterk.',
                'ik typ nu met al mijn vingers.'
            ]
        },
        // ---- Hoofdletters ----
        {
            id: 'caps-1', niveau: 'Hoofdletters', titel: 'Hoofdletters met Shift', caps: true,
            intro: 'Houd de Shift met je pink van de ANDERE hand vast en typ dan de letter. Zo maak je een hoofdletter.',
            nieuw: [],
            oefeningen: [
                'Aap Beer Cijfer Draak Egel',
                'Fiets Giraf Huis Iglo Jas',
                'De Tijger Rent Door Het Bos.',
                'Mijn Naam Is Een Echte Typetijger.'
            ]
        },
        // ---- Cijfers ----
        {
            id: 'cijfer-1', niveau: 'Cijfers', titel: 'Cijferrij 1 2 3 4 5',
            intro: 'De cijfers staan bovenaan. Strek vanuit de thuisrij omhoog en kom weer terug.',
            nieuw: ['1', '2', '3', '4', '5'],
            oefeningen: [
                '111 222 333 444 555 123 45',
                '12 34 51 23 45 13 24 15 32',
                '12 appels 3 peren 45 noten',
                'groep 4 telt 25 leerlingen in 1 klas'
            ]
        },
        {
            id: 'cijfer-2', niveau: 'Cijfers', titel: 'Cijferrij 6 7 8 9 0',
            intro: 'De rechterhand pakt 6 7 8 9 en de pink de 0. Nu kun je alle cijfers typen.',
            nieuw: ['6', '7', '8', '9', '0'],
            oefeningen: [
                '666 777 888 999 000 67 890',
                '60 78 90 67 89 70 80 96 07',
                'het is 8 uur 30 op 7 oktober',
                'ik tel van 0 1 2 3 4 5 6 7 8 9 terug'
            ]
        },
        // ---- Woorden & zinnen ----
        {
            id: 'zin-1', niveau: 'Woorden & zinnen', titel: 'Korte zinnen',
            intro: 'Nu alles bij elkaar. Typ rustig door en kijk niet naar je handen.',
            nieuw: [],
            oefeningen: [
                'De zon schijnt fel op het schoolplein.',
                'Wij rennen hard tijdens de gymles.',
                'Een goede typist kijkt naar het scherm.',
                'Oefen elke dag een klein beetje.'
            ]
        },
        {
            id: 'zin-2', niveau: 'Woorden & zinnen', titel: 'Langere zinnen',
            intro: 'De eindbaas! Wie deze zinnen vlot typt, is een echte Typetijger.',
            nieuw: [],
            oefeningen: [
                'De jonge tijger sloop stil door het hoge gras.',
                'Met tien vingers typen gaat eerst langzaam, daarna razendsnel.',
                'Groep 7 oefent elke ochtend vijftien minuten lang.',
                'Wie blijft oefenen, wordt vanzelf een kampioen achter het toetsenbord.'
            ]
        }
    ];

    // ---------- Niveaus (afgeleid uit LESSONS) ----------
    function slug(s) {
        return String(s).toLowerCase()
            .replace(/&/g, 'en').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }
    var NIVEAUS = (function () {
        var out = [], byName = {};
        LESSONS.forEach(function (l) {
            if (!byName[l.niveau]) {
                byName[l.niveau] = { name: l.niveau, key: slug(l.niveau), lessons: [] };
                out.push(byName[l.niveau]);
            }
            byName[l.niveau].lessons.push(l);
        });
        return out;
    })();

    // Woordenpool voor het eindspel van een niveau: echte woorden (met klinker,
    // 3-9 letters) uit dit niveau én alle eerdere — zo bouwt het cumulatief op.
    function buildWordPool(niveauIndex) {
        var seen = {}, pool = [];
        for (var n = 0; n <= niveauIndex && n < NIVEAUS.length; n++) {
            NIVEAUS[n].lessons.forEach(function (l) {
                (l.oefeningen || []).forEach(function (line) {
                    String(line).toLowerCase().split(/\s+/).forEach(function (tok) {
                        var w = tok.replace(/[^a-z]/g, '');
                        if (w.length >= 3 && w.length <= 9 && /[aeiou]/.test(w) && !seen[w]) {
                            seen[w] = 1; pool.push(w);
                        }
                    });
                });
            });
        }
        return pool;
    }

    // ---------- Configuratie ----------
    // Standaard = de leerkracht-tool (localStorage, vrije monsterkeuze, geen
    // vergrendeling). De leerlingpagina overschrijft dit via Typetijger.start():
    // dan komt de voortgang van de server, het monster ligt vast en de niveaus
    // gaan pas open als het vorige niveau met 3 sterren per level af is.
    var MONSTER_COUNT = 36;
    var AVATAR_KEY = 'mt_typetijger_avatar';

    function defaultLoadProgress() {
        try {
            var raw = localStorage.getItem(STORE_KEY);
            var obj = raw ? JSON.parse(raw) : {};
            return (obj && typeof obj === 'object') ? obj : {};
        } catch (e) { return {}; }
    }
    function defaultSaveProgress(p) {
        try { localStorage.setItem(STORE_KEY, JSON.stringify(p)); } catch (e) {}
    }

    // ---------- Oefendagen / week-streak ----------
    // Leerkracht-modus houdt de oefendagen lokaal bij; de leerlingpagina laat
    // de server dit doen (via de edge function) en levert de dagen aan.
    var ACTIVITY_KEY = 'mt_typetijger_activity';
    function todayStr() {
        var d = new Date();
        var m = ('0' + (d.getMonth() + 1)).slice(-2);
        var day = ('0' + d.getDate()).slice(-2);
        return d.getFullYear() + '-' + m + '-' + day;
    }
    function defaultLoadActivity() {
        var dates = [];
        try { dates = JSON.parse(localStorage.getItem(ACTIVITY_KEY)) || []; } catch (e) { dates = []; }
        return { dates: dates, today: todayStr() };
    }
    function defaultRecordActivity() {
        var dates = [];
        try { dates = JSON.parse(localStorage.getItem(ACTIVITY_KEY)) || []; } catch (e) { dates = []; }
        var t = todayStr();
        if (dates.indexOf(t) === -1) {
            dates.push(t);
            try { localStorage.setItem(ACTIVITY_KEY, JSON.stringify(dates.slice(-400))); } catch (e) {}
        }
    }

    // Eindspel-scores (leerkracht-modus: lokaal; geen klasgenoten).
    var GAME_KEY = 'mt_typetijger_gamescores';
    function readGameScores() {
        try { return JSON.parse(localStorage.getItem(GAME_KEY)) || {}; } catch (e) { return {}; }
    }
    function defaultSaveGameScore(niveauKey, score) {
        var m = readGameScores();
        var best = Math.max(score, m[niveauKey] || 0);
        m[niveauKey] = best;
        try { localStorage.setItem(GAME_KEY, JSON.stringify(m)); } catch (e) {}
        return Promise.resolve({ best: best, leaderboard: best > 0 ? [{ name: 'Jij', score: best, isMe: true }] : [] });
    }
    function defaultLoadLeaderboard(niveauKey) {
        var best = readGameScores()[niveauKey] || 0;
        return Promise.resolve({ best: best, leaderboard: best > 0 ? [{ name: 'Jij', score: best, isMe: true }] : [] });
    }

    // Datum-rekenwerk op 12:00 UTC, zodat zomertijd de datum niet verschuift.
    function mondayOf(dateStr) {
        var d = new Date(dateStr + 'T12:00:00Z');
        var dow = d.getUTCDay();               // 0=zo .. 6=za
        d.setUTCDate(d.getUTCDate() + (dow === 0 ? -6 : 1 - dow));
        return d.toISOString().slice(0, 10);
    }
    function addDaysStr(dateStr, n) {
        var d = new Date(dateStr + 'T12:00:00Z');
        d.setUTCDate(d.getUTCDate() + n);
        return d.toISOString().slice(0, 10);
    }
    function computeStreak(set, today) {
        var streak = 0, isFirst = true;
        var d = new Date(today + 'T12:00:00Z');
        for (var i = 0; i < 400; i++) {
            var ds = d.toISOString().slice(0, 10);
            var dow = d.getUTCDay();
            var weekend = (dow === 0 || dow === 6);
            if (set[ds]) {
                streak++;
            } else if (!weekend) {
                // Niet-geoefende schooldag breekt de streak, behalve als het
                // vandaag is (die dag kan nog).
                if (!(isFirst && ds === today)) break;
            }
            // Weekend zonder oefening is "transparant" en breekt niets.
            isFirst = false;
            d.setUTCDate(d.getUTCDate() - 1);
        }
        return streak;
    }
    var DAY_LABELS = ['ma', 'di', 'wo', 'do', 'vr'];
    function activityFromDates(dates, today) {
        var set = {};
        (dates || []).forEach(function (x) { set[x] = true; });
        var monday = mondayOf(today);
        var week = [];
        for (var i = 0; i < 5; i++) {
            var ds = addDaysStr(monday, i);
            week.push({ label: DAY_LABELS[i], done: !!set[ds], isToday: ds === today });
        }
        var doneCount = 0;
        week.forEach(function (w) { if (w.done) doneCount++; });
        return { week: week, streak: computeStreak(set, today), doneCount: doneCount, today: today, todayDone: !!set[today] };
    }

    var cfg = {
        assetPrefix: '../',        // pad-prefix naar /assets (tool zit in een submap)
        avatarFixed: null,         // vaste monster-URL (leerling); null = kiezer aan
        lockLevels: false,         // niveau pas open na 3 sterren op het vorige
        loadProgress: defaultLoadProgress,
        saveProgress: defaultSaveProgress,  // (progressObj, lessonId, entry)
        loadActivity: defaultLoadActivity,  // -> { dates:[...], today:'YYYY-MM-DD' } (of Promise)
        recordActivity: defaultRecordActivity,
        saveGameScore: defaultSaveGameScore,   // (niveauKey, score) -> Promise<{best, leaderboard}>
        loadLeaderboard: defaultLoadLeaderboard // (niveauKey) -> Promise<{best, leaderboard}>
    };

    var progress = {};
    var activityRaw = null;   // { dates:[...], today:'YYYY-MM-DD' }
    var activity = null;      // afgeleid: { week, streak, doneCount, today, todayDone }

    function setActivity(raw) {
        if (!raw) { activityRaw = null; activity = null; return; }
        var dates = raw.dates || raw.activityDates || [];
        var today = raw.today || todayStr();
        activityRaw = { dates: dates, today: today };
        activity = activityFromDates(dates, today);
    }

    // ---------- Avatar (het monstertje) ----------
    function loadAvatar() {
        var n = parseInt(localStorage.getItem(AVATAR_KEY), 10);
        return (n >= 1 && n <= MONSTER_COUNT) ? n : 13;
    }
    function saveAvatar(n) { try { localStorage.setItem(AVATAR_KEY, String(n)); } catch (e) {} }
    var avatarNum = loadAvatar();
    function avatarSrc(n) {
        n = n || avatarNum;
        return cfg.assetPrefix + 'assets/avatars/monsters/monster-' + (n < 10 ? '0' + n : n) + '.webp';
    }
    function currentAvatarSrc() { return cfg.avatarFixed || avatarSrc(avatarNum); }

    // ---------- State ----------
    var state = {
        lesson: null,        // huidige les
        exIndex: 0,          // index oefening binnen de les
        target: '',          // huidige doel-tekst
        pos: 0,              // cursorpositie
        correct: 0,          // goede aanslagen (deze les)
        total: 0,            // totale aanslagen (deze les, incl. fouten)
        startTime: 0,        // ms van eerste aanslag
        running: false,
        timerId: null,
        charSpans: []        // span-elementen van de doeltekst
    };

    // ---------- DOM refs ----------
    var el = {};

    function $(id) { return document.getElementById(id); }

    // ---------- Route / speelveld renderen (Duolingo-stijl) ----------
    var SECTION_COLORS = ['s-groen', 's-paars', 's-blauw', 's-oranje', 's-roze', 's-cyaan'];

    function lessonStars(l) {
        var pr = progress[l.id];
        if (!pr || !pr.done) return 0;
        return pr.stars || 1;
    }

    // Niveaus in volgorde van voorkomen.
    function niveauOrder() {
        var seen = {}, order = [];
        LESSONS.forEach(function (l) { if (!seen[l.niveau]) { seen[l.niveau] = 1; order.push(l.niveau); } });
        return order;
    }
    // Heeft elk level in dit niveau 3 sterren?
    function niveauFully3(niveau) {
        return LESSONS.filter(function (l) { return l.niveau === niveau; })
            .every(function (l) { return lessonStars(l) >= 3; });
    }
    // Een niveau is open als vergrendeling uit staat, of als het 't eerste niveau is,
    // of als het vorige niveau met 3 sterren per level is uitgespeeld.
    function isNiveauUnlocked(niveau) {
        if (!cfg.lockLevels) return true;
        var order = niveauOrder();
        var idx = order.indexOf(niveau);
        if (idx <= 0) return true;
        return niveauFully3(order[idx - 1]);
    }
    function isLessonLocked(l) { return !isNiveauUnlocked(l.niveau); }

    // Het level waar het monstertje staat: het eerste speelbare level dat nog
    // niet "af" is (af = 3 sterren bij vergrendeling, anders: al gespeeld).
    function currentLessonIndex() {
        var goal = cfg.lockLevels ? 3 : 1;
        for (var i = 0; i < LESSONS.length; i++) {
            if (isLessonLocked(LESSONS[i])) continue;
            if (lessonStars(LESSONS[i]) < goal) return i;
        }
        // alles gehaald: zet 'm op het laatste speelbare level
        for (var j = LESSONS.length - 1; j >= 0; j--) {
            if (!isLessonLocked(LESSONS[j])) return j;
        }
        return 0;
    }

    function starPips(n) {
        var out = '<span class="tc-node-stars">';
        for (var i = 0; i < 3; i++) out += '<i class="' + (i < n ? 'on' : '') + '">&#9733;</i>';
        return out + '</span>';
    }

    // ---------- Week-streak strip ----------
    // Wordt lui boven de route ingevoegd, zodat beide pagina's (leerkracht +
    // leerling) 'm krijgen zonder eigen HTML.
    function ensureWeekEl() {
        if (el.week && el.week.parentNode) return el.week;
        if (!el.path || !el.path.parentNode) return null;
        var w = document.createElement('div');
        w.id = 'tcWeek';
        w.className = 'tc-week';
        el.path.parentNode.insertBefore(w, el.path);
        el.week = w;
        return w;
    }

    function renderWeek() {
        var w = ensureWeekEl();
        if (!w) return;
        if (!activity) { w.style.display = 'none'; return; }
        w.style.display = '';

        var daysHtml = '';
        activity.week.forEach(function (d) {
            var cls = 'tc-week-day' + (d.done ? ' done' : '') + (d.isToday ? ' today' : '');
            var mark = d.done ? '&#10004;' : (d.isToday ? '&#9733;' : '');
            daysHtml += '<span class="' + cls + '"><i class="tc-week-daylbl">' + d.label + '</i>' +
                '<span class="tc-week-dot">' + mark + '</span></span>';
        });

        var complete = activity.doneCount >= 5;
        var streak = activity.streak;
        var title = complete
            ? 'Top! Je hebt deze week 5 dagen geoefend! &#127881;'
            : (activity.todayDone
                ? 'Goed bezig &mdash; kom morgen weer oefenen!'
                : 'Oefen vandaag even om je streak vast te houden!');

        w.className = 'tc-week' + (complete ? ' is-complete' : '');
        w.innerHTML =
            '<div class="tc-week-flamebox" title="Aantal schooldagen op rij geoefend">' +
                '<span class="tc-week-flame">&#128293;</span>' +
                '<span class="tc-week-streaknum">' + streak + '</span>' +
                '<span class="tc-week-streaklbl">op rij</span>' +
            '</div>' +
            '<div class="tc-week-mid">' +
                '<div class="tc-week-title">' + title + '</div>' +
                '<div class="tc-week-days">' + daysHtml + '</div>' +
            '</div>' +
            '<div class="tc-week-goal">' +
                '<span class="tc-week-goalnum">' + activity.doneCount + '/5</span>' +
                '<span class="tc-week-goallbl">dagen</span>' +
            '</div>';
    }

    // Vandaag als oefendag markeren (bij het afronden van een level).
    function markPracticedToday() {
        try { if (cfg.recordActivity) cfg.recordActivity(); } catch (e) {}
        var today = (activityRaw && activityRaw.today) || todayStr();
        var dates = (activityRaw && activityRaw.dates ? activityRaw.dates.slice() : []);
        if (dates.indexOf(today) === -1) dates.push(today);
        setActivity({ dates: dates, today: today });
        renderWeek();
    }

    function renderMap() {
        if (!el.path) return;

        var totalStars = 0;
        LESSONS.forEach(function (l) { totalStars += lessonStars(l); });
        if (el.starsTotal) el.starsTotal.textContent = totalStars;
        if (el.starsMax) el.starsMax.textContent = LESSONS.length * 3;
        if (el.avatarImg) el.avatarImg.src = currentAvatarSrc();

        var curIdx = currentLessonIndex();
        var curLesson = LESSONS[curIdx];
        var html = '';

        NIVEAUS.forEach(function (niv, sectionIdx) {
            var nivLocked = isLessonLocked(niv.lessons[0]);
            html += '<div class="tc-section ' + SECTION_COLORS[sectionIdx % SECTION_COLORS.length] +
                (nivLocked ? ' is-locked' : '') + '">' +
                '<span class="tc-section-label">Niveau ' + (sectionIdx + 1) +
                (nivLocked ? ' &#128274;' : '') + '</span>' +
                '<span class="tc-section-name">' + esc(niv.name) + '</span></div>';
            html += '<div class="tc-section-nodes">';

            niv.lessons.forEach(function (l) {
                var stars = lessonStars(l);
                var done = stars > 0;
                var locked = isLessonLocked(l);
                var isCur = (curLesson && l.id === curLesson.id);
                var stateCls = locked ? 'locked' : (done ? 'done' : (isCur ? 'current' : 'todo'));
                var icon = locked ? '&#128274;' : (done ? '&#10004;' : '&#9733;');

                html += '<div class="tc-node-wrap' + (isCur && !locked ? ' is-current' : '') + '">';
                if (isCur && !locked) {
                    html += '<span class="tc-node-start">START</span>';
                    html += '<img class="tc-node-avatar" src="' + currentAvatarSrc() + '" alt="">';
                }
                html += '<button type="button" class="tc-node ' + stateCls + '" data-id="' + l.id + '"' +
                    (locked ? ' disabled aria-disabled="true"' : '') + '>' +
                    '<span class="tc-node-circle"><span class="tc-node-icon">' + icon + '</span></span></button>';
                html += done ? starPips(stars) : '<span class="tc-node-stars"></span>';
                html += '<span class="tc-node-label">' + esc(l.titel) + '</span>';
                html += '</div>';
            });

            // Eindspel-node: open zodra alle lessen van dit niveau gedaan zijn.
            var allDone = niv.lessons.every(function (l) { return lessonStars(l) > 0; });
            var gameLocked = nivLocked || !allDone;
            html += '<div class="tc-node-wrap tc-node-game">';
            html += '<button type="button" class="tc-node game ' + (gameLocked ? 'locked' : 'ready') +
                '" data-game="' + sectionIdx + '"' + (gameLocked ? ' disabled aria-disabled="true"' : '') + '>' +
                '<span class="tc-node-circle"><span class="tc-node-icon">' +
                (gameLocked ? '&#128274;' : '&#127918;') + '</span></span></button>';
            html += '<span class="tc-node-stars"></span>';
            html += '<span class="tc-node-label">Speelhoek</span>';
            html += '</div>';

            html += '</div>';
        });

        el.path.innerHTML = html;

        Array.prototype.forEach.call(el.path.querySelectorAll('.tc-node:not([disabled])'), function (btn) {
            btn.addEventListener('click', function () {
                var gi = btn.getAttribute('data-game');
                if (gi !== null) { openGamePicker(NIVEAUS[parseInt(gi, 10)], parseInt(gi, 10)); return; }
                var l = findLesson(btn.getAttribute('data-id'));
                if (l) startLesson(l);
            });
        });

        renderWeek();
    }

    // ---------- Eindspellen (speelhoek) ----------
    var GAME_LIVES = 3;
    var GAME = null;
    var GAMES = {
        woordenregen: { name: 'Woordenregen', emoji: '&#127783;&#65039;',
            desc: 'Typ de woorden voordat ze de bodem raken.', unit: ['woord', 'woorden'] },
        mol: { name: 'Toetsen-mol', emoji: '&#128063;',
            desc: 'Sla de mol door de juiste letter te typen.', unit: ['mol', 'mollen'] },
        runner: { name: 'Monster-renner', emoji: '&#127939;',
            desc: 'Typ de woorden zodat je monster over de hindernissen springt.', unit: ['sprong', 'sprongen'] }
    };

    // Letters die tot en met dit niveau geleerd zijn (voor de mol).
    function learnedLetters(index) {
        var set = {}, out = [];
        for (var n = 0; n <= index && n < NIVEAUS.length; n++) {
            NIVEAUS[n].lessons.forEach(function (l) {
                (l.nieuw || []).forEach(function (k) {
                    var c = String(k).toLowerCase();
                    if (c >= 'a' && c <= 'z' && !set[c]) { set[c] = 1; out.push(c); }
                });
            });
        }
        if (out.length < 4) {
            buildWordPool(index).join('').split('').forEach(function (c) {
                if (c >= 'a' && c <= 'z' && !set[c]) { set[c] = 1; out.push(c); }
            });
        }
        return out.length ? out : ['f', 'j', 'd', 'k'];
    }

    function ensureGameEl() {
        if (el.game && el.game.parentNode) return el.game;
        if (!el.map || !el.map.parentNode) return null;
        var g = document.createElement('div');
        g.id = 'tcGame';
        g.className = 'tc-game';
        g.style.display = 'none';
        g.innerHTML =
            '<div class="tc-game-top">' +
                '<button type="button" class="tc-back-btn" id="tcGameBack">&larr; Terug naar de route</button>' +
                '<div class="tc-game-hud">' +
                    '<span class="tc-game-scorebox">Score <b id="tcGameScore">0</b></span>' +
                    '<span class="tc-game-lives" id="tcGameLives"></span>' +
                '</div>' +
            '</div>' +
            '<div class="tc-game-field" id="tcGameField">' +
                '<div class="tc-game-overlay" id="tcGameOverlay"></div>' +
            '</div>' +
            '<input class="tc-game-capture" id="tcGameCapture" autocomplete="off" ' +
                'autocorrect="off" autocapitalize="none" spellcheck="false" aria-hidden="true">' +
            '<div class="tc-game-foot">Typ elk woord voordat het de bodem raakt.</div>';
        el.map.parentNode.insertBefore(g, el.map.nextSibling);
        el.game = g;
        el.gameField = g.querySelector('#tcGameField');
        el.gameScore = g.querySelector('#tcGameScore');
        el.gameLives = g.querySelector('#tcGameLives');
        el.gameOverlay = g.querySelector('#tcGameOverlay');
        el.gameCapture = g.querySelector('#tcGameCapture');
        g.querySelector('#tcGameBack').onclick = exitGame;
        g.addEventListener('mousedown', function (e) {
            if (e.target.closest && e.target.closest('button')) return;
            setTimeout(focusGameArea, 0);
        });
        return g;
    }

    function focusGameArea() {
        if (el.gameCapture) { try { el.gameCapture.focus({ preventScroll: true }); } catch (e) {} }
    }
    function clearField() {
        if (!el.gameField) return;
        Array.prototype.slice.call(el.gameField.children).forEach(function (n) {
            if (n !== el.gameOverlay) n.remove();
        });
    }
    function showGameOverlay(html) {
        if (!el.gameOverlay) return;
        el.gameOverlay.innerHTML = '<div class="tc-go-card">' + html + '</div>';
        el.gameOverlay.classList.add('show');
    }
    function hideGameOverlay() {
        if (el.gameOverlay) { el.gameOverlay.classList.remove('show'); el.gameOverlay.innerHTML = ''; }
    }
    function updateGameHud() {
        if (!GAME) return;
        if (el.gameScore) el.gameScore.textContent = GAME.score;
        if (el.gameLives) {
            var h = '';
            for (var i = 0; i < GAME_LIVES; i++) h += '<span class="' + (i < GAME.lives ? 'on' : 'off') + '">&#10084;</span>';
            el.gameLives.innerHTML = h;
        }
    }

    // Keuzemenu: welk spel wil je spelen?
    function openGamePicker(niveau, niveauIndex) {
        ensureGameEl();
        GAME = null;
        clearField();
        if (el.gameScore) el.gameScore.textContent = '0';
        if (el.gameLives) el.gameLives.innerHTML = '';
        showGameScreen();
        var btns = Object.keys(GAMES).map(function (m) {
            return '<button type="button" class="tc-go-game" data-mode="' + m + '">' +
                '<span class="tc-go-game-emoji">' + GAMES[m].emoji + '</span>' +
                '<span class="tc-go-game-txt"><b>' + GAMES[m].name + '</b>' +
                '<span>' + GAMES[m].desc + '</span></span></button>';
        }).join('');
        showGameOverlay(
            '<div class="tc-go-emoji">&#127918;</div>' +
            '<h2>Speelhoek &mdash; ' + esc(niveau.name) + '</h2>' +
            '<p>Kies een spel om je typen te oefenen.</p>' +
            '<div class="tc-go-games">' + btns + '</div>' +
            '<div class="tc-go-btns"><button type="button" class="tc-go-btn" id="tcGoCancel">Terug naar de route</button></div>'
        );
        Array.prototype.forEach.call(el.gameOverlay.querySelectorAll('.tc-go-game'), function (b) {
            b.onclick = function () { startGame(niveau, niveauIndex, b.getAttribute('data-mode')); };
        });
        var c = document.getElementById('tcGoCancel'); if (c) c.onclick = exitGame;
    }

    function startGame(niveau, niveauIndex, mode) {
        ensureGameEl();
        mode = GAMES[mode] ? mode : 'woordenregen';
        GAME = {
            mode: mode, niveau: niveau, niveauIndex: niveauIndex,
            gameKey: mode === 'woordenregen' ? niveau.key : niveau.key + ':' + mode,
            score: 0, lives: GAME_LIVES, running: false, raf: null,
            lastTime: 0, fieldH: 0, fieldW: 0
        };
        clearField();
        updateGameHud();
        showGameScreen();
        var g = GAMES[mode];
        showGameOverlay(
            '<div class="tc-go-emoji">' + g.emoji + '</div>' +
            '<h2>' + g.name + '</h2>' +
            '<p>' + g.desc + ' Je hebt <b>3 levens</b>.</p>' +
            '<div class="tc-go-btns">' +
                '<button type="button" class="tc-go-btn primary" id="tcGoStart">Start!</button>' +
                '<button type="button" class="tc-go-btn" id="tcGoCancel">Terug</button>' +
            '</div>'
        );
        var s = document.getElementById('tcGoStart'); if (s) s.onclick = beginRun;
        var c = document.getElementById('tcGoCancel'); if (c) c.onclick = function () { openGamePicker(niveau, niveauIndex); };
        focusGameArea();
    }

    function beginRun() {
        if (!GAME) return;
        hideGameOverlay();
        var r = el.gameField.getBoundingClientRect();
        GAME.fieldH = r.height; GAME.fieldW = r.width;
        GAME.score = 0; GAME.lives = GAME_LIVES;
        clearField(); updateGameHud();
        if (GAME.mode === 'mol') initMol();
        else if (GAME.mode === 'runner') initRunner();
        else initWoordenregen();
        GAME.running = true;
        GAME.lastTime = 0;
        GAME.raf = requestAnimationFrame(gameTick);
        focusGameArea();
    }

    function gameTick(ts) {
        if (!GAME || !GAME.running) return;
        if (!GAME.lastTime) GAME.lastTime = ts;
        var dt = Math.min(64, ts - GAME.lastTime);
        GAME.lastTime = ts;
        if (GAME.mode === 'mol') tickMol(dt);
        else if (GAME.mode === 'runner') tickRunner(dt);
        else tickWoordenregen(dt);
        if (GAME && GAME.running) GAME.raf = requestAnimationFrame(gameTick);
    }

    function onGameKey(e) {
        if (!GAME || !GAME.running) return;
        if (!el.game || el.game.style.display === 'none') return;
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        var key = e.key;
        if (!key || key.length !== 1) return;
        var ch = key.toLowerCase();
        if (ch < 'a' || ch > 'z') return;
        e.preventDefault();
        if (GAME.mode === 'mol') keyMol(ch);
        else if (GAME.mode === 'runner') keyRunner(ch);
        else keyWoordenregen(ch);
    }

    // ===== Spel 1: Woordenregen =====
    function initWoordenregen() {
        GAME.pool = buildWordPool(GAME.niveauIndex);
        if (GAME.pool.length < 4) GAME.pool = ['dag', 'als', 'sla', 'gas'];
        GAME.words = [];
        GAME.spawnTimer = 1e9;
        GAME.lastWord = '';
    }
    function tickWoordenregen(dt) {
        var lvl = GAME.score;
        var fall = (GAME.fieldH / 9) * (1 + lvl * 0.06);
        fall = Math.min(fall, GAME.fieldH / 3);
        var spawnInterval = Math.max(1400, 3200 - lvl * 120);
        var maxWords = lvl < 3 ? 1 : (lvl < 8 ? 2 : 3);
        for (var i = GAME.words.length - 1; i >= 0; i--) {
            var w = GAME.words[i];
            w.y += fall * (dt / 1000);
            w.el.style.transform = 'translate(' + w.x + 'px,' + Math.round(w.y) + 'px)';
            if (w.y >= GAME.fieldH - 6) missWord(w, i);
        }
        if (!GAME.running) return;
        updateFocus();
        GAME.spawnTimer += dt;
        var need = GAME.words.length === 0 ? 250 : spawnInterval;
        if (GAME.words.length < maxWords && GAME.spawnTimer >= need) {
            GAME.spawnTimer = 0;
            spawnWord();
        }
    }
    function keyWoordenregen(ch) {
        var f = focusWord();
        if (!f) return;
        if (ch === f.text.charAt(f.typed)) {
            f.letters[f.typed].classList.add('correct');
            f.typed++;
            if (f.typed >= f.text.length) completeWord(f);
            else updateFocus();
        } else if (f.el) {
            f.el.classList.remove('tc-word-bad'); void f.el.offsetWidth; f.el.classList.add('tc-word-bad');
        }
    }

    function spawnWord() {
        var word, tries = 0;
        do { word = GAME.pool[Math.floor(Math.random() * GAME.pool.length)]; tries++; }
        while (word === GAME.lastWord && tries < 10 && GAME.pool.length > 1);
        GAME.lastWord = word;

        var wEl = document.createElement('div');
        wEl.className = 'tc-word';
        var inner = '';
        for (var i = 0; i < word.length; i++) inner += '<span class="tc-word-l">' + word.charAt(i) + '</span>';
        wEl.innerHTML = inner;
        el.gameField.appendChild(wEl);

        var ww = wEl.offsetWidth || 80;
        var maxX = Math.max(4, GAME.fieldW - ww - 8);
        var x = Math.floor(Math.random() * maxX);
        wEl.style.transform = 'translate(' + x + 'px,-34px)';
        GAME.words.push({ text: word, typed: 0, x: x, y: -34, el: wEl, letters: wEl.querySelectorAll('.tc-word-l') });
    }

    function focusWord() {
        if (!GAME || !GAME.words.length) return null;
        var typing = null, lowest = null;
        GAME.words.forEach(function (w) {
            if (w.typed > 0) typing = w;
            if (!lowest || w.y > lowest.y) lowest = w;
        });
        return typing || lowest;
    }
    function updateFocus() {
        var f = focusWord();
        GAME.words.forEach(function (w) { if (w.el) w.el.classList.toggle('is-focus', w === f); });
    }

    function completeWord(w) {
        var idx = GAME.words.indexOf(w);
        if (idx >= 0) GAME.words.splice(idx, 1);
        if (w.el) {
            var node = w.el;
            node.classList.remove('is-focus'); // geen border terwijl 'ie wegploft
            node.classList.add('tc-word-done');
            setTimeout(function () { if (node.parentNode) node.remove(); }, 180);
        }
        GAME.score++;
        updateGameHud();
        updateFocus();
    }
    function missWord(w, idx) {
        if (idx == null) idx = GAME.words.indexOf(w);
        if (idx >= 0) GAME.words.splice(idx, 1);
        if (w.el) {
            var node = w.el;
            node.classList.remove('is-focus');
            node.classList.add('tc-word-miss');
            setTimeout(function () { if (node.parentNode) node.remove(); }, 220);
        }
        GAME.lives--;
        updateGameHud();
        updateFocus();
        if (GAME.lives <= 0) endGame();
    }

    // ===== Spel 2: Toetsen-mol =====
    function initMol() {
        var grid = document.createElement('div');
        grid.className = 'tc-mol-grid';
        for (var i = 0; i < 6; i++) {
            var hole = document.createElement('div');
            hole.className = 'tc-mol-hole';
            grid.appendChild(hole);
        }
        el.gameField.appendChild(grid);
        GAME.holes = Array.prototype.slice.call(grid.children);
        GAME.moles = [];
        GAME.molSpawnTimer = 1e9;
        GAME.letters = learnedLetters(GAME.niveauIndex);
        GAME.lastMolLetter = '';
    }
    function spawnMole(showMs) {
        var used = {};
        GAME.moles.forEach(function (m) { used[m.hole] = 1; });
        var free = [];
        for (var i = 0; i < GAME.holes.length; i++) if (!used[i]) free.push(i);
        if (!free.length) return;
        var holeIdx = free[Math.floor(Math.random() * free.length)];
        var letter, tries = 0;
        do { letter = GAME.letters[Math.floor(Math.random() * GAME.letters.length)]; tries++; }
        while (letter === GAME.lastMolLetter && tries < 8 && GAME.letters.length > 1);
        GAME.lastMolLetter = letter;
        var fin = KEY_FINGER[letter];
        var molEl = document.createElement('div');
        molEl.className = 'tc-mol' + (fin ? ' ' + FINGERS[fin].kl : '');
        molEl.textContent = letter;
        GAME.holes[holeIdx].appendChild(molEl);
        GAME.moles.push({ hole: holeIdx, letter: letter, el: molEl, life: showMs });
    }
    function removeMole(m, idx, cls) {
        if (idx == null) idx = GAME.moles.indexOf(m);
        if (idx >= 0) GAME.moles.splice(idx, 1);
        if (m.el) {
            var n = m.el; n.classList.add(cls);
            setTimeout(function () { if (n.parentNode) n.remove(); }, 160);
        }
    }
    function tickMol(dt) {
        for (var i = GAME.moles.length - 1; i >= 0; i--) {
            var m = GAME.moles[i];
            m.life -= dt;
            if (m.life <= 0) {
                removeMole(m, i, 'gone');
                GAME.lives--;
                updateGameHud();
                if (GAME.lives <= 0) { endGame(); return; }
            }
        }
        if (!GAME.running) return;
        var target = GAME.score < 6 ? 1 : (GAME.score < 15 ? 2 : 3);
        var showMs = Math.max(950, 2200 - GAME.score * 70);
        var gap = Math.max(450, 1300 - GAME.score * 45);
        GAME.molSpawnTimer += dt;
        if (GAME.moles.length < target && GAME.molSpawnTimer >= (GAME.moles.length === 0 ? 300 : gap)) {
            GAME.molSpawnTimer = 0;
            spawnMole(showMs);
        }
    }
    function keyMol(ch) {
        var best = -1, bestLife = Infinity;
        for (var i = 0; i < GAME.moles.length; i++) {
            if (GAME.moles[i].letter === ch && GAME.moles[i].life < bestLife) { best = i; bestLife = GAME.moles[i].life; }
        }
        if (best >= 0) {
            removeMole(GAME.moles[best], best, 'whacked');
            GAME.score++;
            updateGameHud();
        }
        // geen match -> mild negeren
    }

    // ===== Spel 3: Monster-renner =====
    function initRunner() {
        GAME.pool = buildWordPool(GAME.niveauIndex);
        if (GAME.pool.length < 4) GAME.pool = ['dag', 'als', 'sla', 'gas'];
        var track = document.createElement('div');
        track.className = 'tc-run-track';
        var monster = document.createElement('div');
        monster.className = 'tc-run-monster';
        if (cfg.avatarFixed) {
            var img = document.createElement('img');
            img.src = cfg.avatarFixed; img.alt = '';
            monster.appendChild(img);
        } else {
            monster.textContent = '🦖'; // dino
        }
        track.appendChild(monster);
        el.gameField.appendChild(track);
        GAME.track = track; GAME.monsterEl = monster;
        GAME.obstacles = [];
        GAME.spawnTimer = 1e9;
        GAME.lastWord = '';
        GAME.monsterX = 76;
    }
    function spawnObstacle() {
        var word, tries = 0;
        do { word = GAME.pool[Math.floor(Math.random() * GAME.pool.length)]; tries++; }
        while (word === GAME.lastWord && tries < 10 && GAME.pool.length > 1);
        GAME.lastWord = word;
        var o = document.createElement('div');
        o.className = 'tc-run-ob';
        var wl = document.createElement('div'); wl.className = 'tc-run-word';
        var inner = '';
        for (var i = 0; i < word.length; i++) inner += '<span class="tc-word-l">' + word.charAt(i) + '</span>';
        wl.innerHTML = inner;
        var rock = document.createElement('div'); rock.className = 'tc-run-rock'; rock.textContent = '🌵';
        o.appendChild(wl); o.appendChild(rock);
        o.style.transform = 'translateX(' + Math.round(GAME.fieldW) + 'px)';
        GAME.track.appendChild(o);
        GAME.obstacles.push({ word: word, typed: 0, x: GAME.fieldW, el: o, letters: wl.querySelectorAll('.tc-word-l') });
    }
    function runFocus() {
        var typing = null, nearest = null;
        GAME.obstacles.forEach(function (o) {
            if (o.typed > 0) typing = o;
            if (o.x > GAME.monsterX && (!nearest || o.x < nearest.x)) nearest = o;
        });
        return typing || nearest || (GAME.obstacles.length ? GAME.obstacles[0] : null);
    }
    function updateRunFocus() {
        var f = runFocus();
        GAME.obstacles.forEach(function (o) { if (o.el) o.el.classList.toggle('is-focus', o === f); });
    }
    function bumpMonster(cls) {
        if (!GAME.monsterEl) return;
        GAME.monsterEl.classList.remove(cls); void GAME.monsterEl.offsetWidth; GAME.monsterEl.classList.add(cls);
    }
    function tickRunner(dt) {
        var speed = (GAME.fieldW / 5) * (1 + GAME.score * 0.05);
        speed = Math.min(speed, GAME.fieldW / 2);
        for (var i = GAME.obstacles.length - 1; i >= 0; i--) {
            var o = GAME.obstacles[i];
            o.x -= speed * (dt / 1000);
            o.el.style.transform = 'translateX(' + Math.round(o.x) + 'px)';
            if (o.x <= GAME.monsterX) {
                GAME.obstacles.splice(i, 1);
                var n = o.el; n.classList.add('bumped');
                setTimeout(function () { if (n.parentNode) n.remove(); }, 220);
                GAME.lives--; updateGameHud(); bumpMonster('hit');
                if (GAME.lives <= 0) { endGame(); return; }
            }
        }
        if (!GAME.running) return;
        updateRunFocus();
        var gap = Math.max(1100, 2600 - GAME.score * 90);
        var maxOb = GAME.score < 4 ? 1 : 2;
        GAME.spawnTimer += dt;
        if (GAME.obstacles.length < maxOb && GAME.spawnTimer >= (GAME.obstacles.length === 0 ? 400 : gap)) {
            GAME.spawnTimer = 0;
            spawnObstacle();
        }
    }
    function keyRunner(ch) {
        var f = runFocus();
        if (!f) return;
        if (ch === f.word.charAt(f.typed)) {
            f.letters[f.typed].classList.add('correct');
            f.typed++;
            if (f.typed >= f.word.length) {
                var idx = GAME.obstacles.indexOf(f);
                if (idx >= 0) GAME.obstacles.splice(idx, 1);
                if (f.el) { var n = f.el; n.classList.add('cleared'); setTimeout(function () { if (n.parentNode) n.remove(); }, 220); }
                GAME.score++; updateGameHud(); bumpMonster('jump'); updateRunFocus();
            } else {
                updateRunFocus();
            }
        } else if (f.el) {
            f.el.classList.remove('tc-run-bad'); void f.el.offsetWidth; f.el.classList.add('tc-run-bad');
        }
    }

    function stopGameLoop() {
        if (GAME && GAME.raf) { cancelAnimationFrame(GAME.raf); GAME.raf = null; }
        if (GAME) GAME.running = false;
    }

    function endGame() {
        stopGameLoop();
        var score = GAME.score, niveau = GAME.niveau, niveauIndex = GAME.niveauIndex,
            gameKey = GAME.gameKey, mode = GAME.mode;
        var unit = GAMES[mode].unit;
        showGameOverlay(
            '<div class="tc-go-emoji">&#127937;</div>' +
            '<h2>Game over!</h2>' +
            '<p class="tc-go-score">Je score: <b>' + score + '</b> ' + (score === 1 ? unit[0] : unit[1]) + '</p>' +
            '<div class="tc-go-board" id="tcGoBoard"><div class="tc-go-loading">Ranglijst laden&hellip;</div></div>' +
            '<div class="tc-go-btns">' +
                '<button type="button" class="tc-go-btn primary" id="tcGoRetry">Opnieuw</button>' +
                '<button type="button" class="tc-go-btn" id="tcGoOther">Ander spel</button>' +
                '<button type="button" class="tc-go-btn" id="tcGoBack">Naar de route</button>' +
            '</div>'
        );
        var r = document.getElementById('tcGoRetry'); if (r) r.onclick = function () { startGame(niveau, niveauIndex, mode); };
        var o = document.getElementById('tcGoOther'); if (o) o.onclick = function () { openGamePicker(niveau, niveauIndex); };
        var b = document.getElementById('tcGoBack'); if (b) b.onclick = exitGame;

        Promise.resolve(cfg.saveGameScore ? cfg.saveGameScore(gameKey, score) : null)
            .then(function (res) { renderLeaderboard(niveau, mode, res); })
            .catch(function () { renderLeaderboard(niveau, mode, null); });
    }

    function renderLeaderboard(niveau, mode, res) {
        var board = document.getElementById('tcGoBoard');
        if (!board) return;
        var list = (res && res.leaderboard) || [];
        if (!list.length) {
            board.innerHTML = '<div class="tc-go-empty">Speel om als eerste op de ranglijst te komen!</div>';
            return;
        }
        var html = '<div class="tc-go-title">Ranglijst &mdash; ' + esc(GAMES[mode].name) +
            ' <span class="tc-go-subtitle">(' + esc(niveau.name) + ')</span></div><ol class="tc-go-list">';
        list.forEach(function (e, i) {
            var medal = i === 0 ? '&#129351;' : i === 1 ? '&#129352;' : i === 2 ? '&#129353;' : (i + 1);
            html += '<li class="' + (e.isMe ? 'me' : '') + '">' +
                '<span class="tc-go-rank">' + medal + '</span>' +
                '<span class="tc-go-name">' + esc(e.name) +
                    (e.isMe && String(e.name).toLowerCase() !== 'jij' ? ' (jij)' : '') + '</span>' +
                '<span class="tc-go-pts">' + e.score + '</span></li>';
        });
        html += '</ol>';
        board.innerHTML = html;
    }

    function showGameScreen() {
        ensureGameEl();
        if (el.map) el.map.style.display = 'none';
        if (el.workspace) el.workspace.style.display = 'none';
        if (el.game) el.game.style.display = '';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    function exitGame() {
        stopGameLoop();
        GAME = null;
        if (el.game) el.game.style.display = 'none';
        showMap();
    }

    // ---------- Avatar-kiezer ----------
    function buildAvatarGrid() {
        if (!el.avatarGrid) return;
        var html = '';
        for (var n = 1; n <= MONSTER_COUNT; n++) {
            html += '<button type="button" class="tc-avatar-opt' + (n === avatarNum ? ' active' : '') +
                '" data-n="' + n + '"><img src="' + avatarSrc(n) + '" alt="Monster ' + n + '"></button>';
        }
        el.avatarGrid.innerHTML = html;
        Array.prototype.forEach.call(el.avatarGrid.querySelectorAll('.tc-avatar-opt'), function (b) {
            b.addEventListener('click', function () {
                avatarNum = parseInt(b.getAttribute('data-n'), 10) || avatarNum;
                saveAvatar(avatarNum);
                renderMap();
                closeAvatarPicker();
            });
        });
    }
    function openAvatarPicker() { buildAvatarGrid(); if (el.avatarModal) el.avatarModal.classList.add('open'); }
    function closeAvatarPicker() { if (el.avatarModal) el.avatarModal.classList.remove('open'); }

    function findLesson(id) {
        for (var i = 0; i < LESSONS.length; i++) if (LESSONS[i].id === id) return LESSONS[i];
        return null;
    }

    // ---------- Een les / oefening starten ----------
    function startLesson(lesson) {
        state.lesson = lesson;
        state.exIndex = 0;
        state.correct = 0;
        state.total = 0;
        if (el.map) el.map.style.display = 'none';
        el.workspace.style.display = '';
        el.lessonIntro.textContent = lesson.intro;
        el.lessonTitle.textContent = lesson.titel;
        loadExercise();
        window.scrollTo({ top: 0, behavior: 'auto' });
        focusCapture();
    }

    // Terug naar het speelveld / de route.
    function showMap() {
        stopTimer();
        state.running = false;
        if (GAME) { stopGameLoop(); GAME = null; }
        el.workspace.style.display = 'none';
        if (el.game) el.game.style.display = 'none';
        if (el.map) el.map.style.display = '';
        renderMap();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function loadExercise() {
        stopTimer();
        state.running = false;
        state.startTime = 0;
        state.pos = 0;
        state.target = state.lesson.oefeningen[state.exIndex];

        // Doeltekst opbouwen als losse spans
        el.prompt.innerHTML = '';
        state.charSpans = [];
        for (var i = 0; i < state.target.length; i++) {
            var ch = state.target.charAt(i);
            var s = document.createElement('span');
            s.className = 'tc-char';
            if (ch === ' ') s.classList.add('tc-space');
            s.textContent = ch;
            el.prompt.appendChild(s);
            state.charSpans.push(s);
        }
        updateCursor();
        el.exCounter.textContent = 'Oefening ' + (state.exIndex + 1) + ' / ' + state.lesson.oefeningen.length;
        updateStats();
        buildKeyboard();
        highlightNext();
    }

    // ---------- Toetsenbord renderen ----------
    function buildKeyboard() {
        var html = '';
        KB_LAYOUT.forEach(function (row) {
            html += '<div class="tc-kb-row' + (row.fn ? ' tc-kb-fn' : '') + '">';
            row.keys.forEach(function (k) {
                if (k.spacer) {
                    html += '<span class="tc-kb-spacer" style="width:calc(var(--tcu) * ' + k.spacer + ')"></span>';
                    return;
                }
                var w = k.w || 1;
                var cls = 'tc-key';
                if (k.key != null) {
                    var fin = KEY_FINGER[k.key];
                    if (fin) cls += ' ' + FINGERS[fin].kl;
                }
                if (k.cls) cls += ' ' + k.cls;
                else if (row.fn) cls += ' tc-key-fkey';
                if (k.space) cls += ' tc-key-space';
                if (k.key === 'f' || k.key === 'j') cls += ' tc-key-home';

                var attrs = '';
                if (k.key != null) attrs += ' data-key="' + k.key + '"';
                if (k.mod) attrs += ' data-mod="' + k.mod + '"';

                var inner;
                if (k.space) inner = 'spatie';
                else if (k.sub != null) inner = '<span class="tc-key-sub">' + esc(k.sub) + '</span><span class="tc-key-main">' + esc(k.key) + '</span>';
                else if (k.key != null) inner = '<span class="tc-key-main">' + esc(k.key) + '</span>';
                else inner = k.label || '';

                html += '<span class="' + cls + '" style="width:calc(var(--tcu) * ' + w + ' - var(--tcgap))"' + attrs + '>' + inner + '</span>';
            });
            html += '</div>';
        });
        el.keyboard.innerHTML = html;
    }

    // Markeer de volgende te typen toets + geef de vinger-hint.
    function highlightNext() {
        // wis oude markeringen
        Array.prototype.forEach.call(el.keyboard.querySelectorAll('.tc-key'), function (k) {
            k.classList.remove('next', 'next-mod');
        });

        if (state.pos >= state.target.length) { el.hint.innerHTML = ''; return; }

        var ch = state.target.charAt(state.pos);
        var base = ch.toLowerCase();
        var needShift = (ch !== base && ch.toUpperCase() === ch && ch.toLowerCase() !== ch);
        var keyChar = base;

        var keyEl = el.keyboard.querySelector('.tc-key[data-key="' + cssEscape(keyChar) + '"]');
        if (keyEl) keyEl.classList.add('next');

        var fin = KEY_FINGER[keyChar];
        var hintLabel = ch === ' ' ? 'spatie' : ch;
        var vinger = fin ? FINGERS[fin].naam : '';

        if (needShift) {
            var shiftSel = shiftHandFor(fin) === 'lp' ? '[data-mod="shift-l"]' : '[data-mod="shift-r"]';
            var shiftEl = el.keyboard.querySelector('.tc-key' + shiftSel);
            if (shiftEl) shiftEl.classList.add('next-mod');
            el.hint.innerHTML = 'Typ <strong>' + esc(hintLabel) + '</strong> &middot; ' +
                'Shift (' + (shiftHandFor(fin) === 'lp' ? 'links' : 'rechts') + ') + ' + esc(vinger);
        } else {
            el.hint.innerHTML = 'Typ <strong>' + esc(hintLabel) + '</strong> &middot; ' + esc(vinger);
        }
    }

    function updateCursor() {
        for (var i = 0; i < state.charSpans.length; i++) {
            state.charSpans[i].classList.toggle('current', i === state.pos);
        }
    }

    // ---------- Toetsaanslagen verwerken ----------
    function onKeyDown(e) {
        if (!state.lesson || !el.workspace || el.workspace.style.display === 'none') return;
        // niet reageren als de werkruimte (via een verborgen scherm) onzichtbaar is
        if (el.workspace.offsetParent === null) return;
        // modaltoetsen negeren
        if (e.ctrlKey || e.metaKey || e.altKey) return;

        var key = e.key;

        if (key === 'Backspace') {
            e.preventDefault();
            if (state.pos > 0) {
                state.pos--;
                var sp = state.charSpans[state.pos];
                sp.classList.remove('correct', 'wrong');
                updateCursor();
                highlightNext();
            }
            return;
        }

        // alleen echte tekens (lengte 1) afhandelen
        if (key.length !== 1) return;
        e.preventDefault();

        if (state.pos >= state.target.length) return;

        // timer start bij de eerste aanslag
        if (!state.running) startTimer();

        var expected = state.target.charAt(state.pos);
        var caseSensitive = !!state.lesson.caps;
        var match = caseSensitive ? (key === expected)
            : (key.toLowerCase() === expected.toLowerCase());

        state.total++;
        var span = state.charSpans[state.pos];

        if (match) {
            state.correct++;
            span.classList.remove('wrong');
            span.classList.add('correct');
            state.pos++;
            updateCursor();
            highlightNext();
            updateStats();
            if (state.pos >= state.target.length) finishExercise();
        } else {
            span.classList.add('wrong');
            // korte schud-feedback
            span.classList.remove('shake');
            void span.offsetWidth;
            span.classList.add('shake');
            updateStats();
        }
    }

    // ---------- Timer & statistieken ----------
    function startTimer() {
        state.running = true;
        state.startTime = Date.now();
        state.timerId = setInterval(updateStats, 250);
    }
    function stopTimer() {
        if (state.timerId) { clearInterval(state.timerId); state.timerId = null; }
    }

    function elapsedMinutes() {
        if (!state.startTime) return 0;
        return (Date.now() - state.startTime) / 60000;
    }

    function currentApm() {
        var m = elapsedMinutes();
        if (m <= 0) return 0;
        // begrens tegen onrealistische pieken bij heel korte oefeningen
        return Math.min(999, Math.round(state.correct / m));
    }
    function currentAccuracy() {
        if (state.total === 0) return 100;
        return Math.round((state.correct / state.total) * 100);
    }

    function updateStats() {
        var secs = state.startTime ? Math.floor((Date.now() - state.startTime) / 1000) : 0;
        var mm = Math.floor(secs / 60), ss = secs % 60;
        el.statTime.textContent = mm + ':' + (ss < 10 ? '0' : '') + ss;
        el.statApm.textContent = currentApm();
        el.statAcc.textContent = currentAccuracy() + '%';
        var pct = state.target.length ? Math.round((state.pos / state.target.length) * 100) : 0;
        el.progressBar.style.width = pct + '%';
    }

    // ---------- Oefening / les afronden ----------
    function finishExercise() {
        stopTimer();
        state.running = false;

        var laatste = state.exIndex >= state.lesson.oefeningen.length - 1;
        if (!laatste) {
            // korte pauze, dan volgende oefening
            el.hint.innerHTML = '&#127881; Goed gedaan! Volgende oefening...';
            setTimeout(function () {
                state.exIndex++;
                loadExercise();
                focusCapture();
            }, 900);
        } else {
            finishLesson();
        }
    }

    function finishLesson() {
        var apm = currentApm();
        var acc = currentAccuracy();
        var sterren = scoreToStars(apm, acc);

        // voortgang bewaren (beste score + beste sterren)
        var pr = progress[state.lesson.id] || {};
        pr.done = true;
        if (!pr.bestApm || apm > pr.bestApm) pr.bestApm = apm;
        if (!pr.bestAcc || acc > pr.bestAcc) pr.bestAcc = acc;
        if (!pr.stars || sterren > pr.stars) pr.stars = sterren;
        progress[state.lesson.id] = pr;
        try {
            cfg.saveProgress(progress, state.lesson.id, { stars: pr.stars, apm: apm, acc: acc });
        } catch (e) {}

        // Vandaag telt als oefendag (voor de week-streak).
        markPracticedToday();

        el.resApm.textContent = apm;
        el.resAcc.textContent = acc + '%';
        el.resStars.innerHTML = starHtml(sterren);
        el.resTitle.textContent = state.lesson.titel + ' afgerond!';

        renderMap();

        // volgende speelbare les bepalen (respecteert vergrendeling)
        var nextIdx = currentLessonIndex();
        var next = LESSONS[nextIdx];
        if (next && next.id !== state.lesson.id && !isLessonLocked(next)) {
            el.resNext.style.display = '';
            el.resNext.innerHTML = 'Volgende les: ' + esc(next.titel) + ' &rarr;';
            el.resNext.onclick = function () { hideResult(); startLesson(next); };
        } else {
            el.resNext.style.display = 'none';
        }
        showResult();
    }

    function scoreToStars(apm, acc) {
        var s = 1;
        if (acc >= 90) s++;
        if (apm >= 100 && acc >= 85) s++;
        return Math.min(3, s);
    }
    function starHtml(n) {
        var out = '';
        for (var i = 0; i < 3; i++) out += '<span class="tc-star' + (i < n ? ' on' : '') + '">&#9733;</span>';
        return out;
    }

    function showResult() { el.resultModal.classList.add('open'); }
    function hideResult() { el.resultModal.classList.remove('open'); }

    // ---------- Focus-vanger ----------
    // Een onzichtbaar invoerveld houdt de focus zodat toetsaanslagen
    // altijd binnenkomen (ook op tablets met fysiek toetsenbord).
    function focusCapture() {
        if (el.capture) { try { el.capture.focus(); } catch (e) {} }
    }

    // ---------- Helpers ----------
    function esc(str) {
        var d = document.createElement('div');
        d.textContent = str == null ? '' : str;
        return d.innerHTML;
    }
    function cssEscape(ch) {
        // data-key selector veilig maken voor speciale tekens
        return ch.replace(/["\\]/g, '\\$&');
    }

    // ---------- Init ----------
    function cacheRefs() {
        el.map = $('tcMap');
        el.path = $('tcPath');
        el.starsTotal = $('tcStarsTotal');
        el.starsMax = $('tcStarsMax');
        el.avatarImg = $('tcAvatarImg');
        el.avatarBadge = $('tcAvatarBadge');
        el.avatarModal = $('tcAvatarModal');
        el.avatarGrid = $('tcAvatarGrid');
        el.workspace = $('tcWorkspace');
        el.lessonTitle = $('tcLessonTitle');
        el.lessonIntro = $('tcLessonIntro');
        el.exCounter = $('tcExCounter');
        el.prompt = $('tcPrompt');
        el.hint = $('tcHint');
        el.keyboard = $('tcKeyboard');
        el.statTime = $('tcStatTime');
        el.statApm = $('tcStatApm');
        el.statAcc = $('tcStatAcc');
        el.progressBar = $('tcProgressBar');
        el.capture = $('tcCapture');
        el.resultModal = $('tcResultModal');
        el.resTitle = $('tcResTitle');
        el.resApm = $('tcResApm');
        el.resAcc = $('tcResAcc');
        el.resStars = $('tcResStars');
        el.resNext = $('tcResNext');
    }

    var bound = false;
    function bindOnce() {
        if (bound) return;
        bound = true;

        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keydown', onGameKey);
        // focus terug naar de vanger als je in de werkruimte klikt
        if (el.workspace) {
            el.workspace.addEventListener('mousedown', function (e) {
                if (e.target.closest && e.target.closest('button')) return;
                setTimeout(focusCapture, 0);
            });
        }

        // avatar-kiezer (alleen als er geen vast monster is opgelegd)
        if (!cfg.avatarFixed && el.avatarBadge) {
            el.avatarBadge.addEventListener('click', openAvatarPicker);
            var avatarClose = $('tcAvatarClose');
            if (avatarClose) avatarClose.onclick = closeAvatarPicker;
            if (el.avatarModal) el.avatarModal.addEventListener('click', function (e) {
                if (e.target === el.avatarModal) closeAvatarPicker();
            });
        }

        // terug naar de route
        var back = $('tcBackToMap');
        if (back) back.onclick = showMap;

        var btnRetry = $('tcResRetry');
        if (btnRetry) btnRetry.onclick = function () { hideResult(); startLesson(state.lesson); };
        var btnClose = $('tcResClose');
        if (btnClose) btnClose.onclick = function () { hideResult(); showMap(); };
    }

    function boot() {
        cacheRefs();
        if (!el.path) return;

        if (cfg.avatarFixed && el.avatarBadge) el.avatarBadge.classList.add('tc-avatar-fixed');

        bindOnce();
        renderMap();

        // begin altijd op het speelveld, niet in een les
        if (el.workspace) el.workspace.style.display = 'none';
        if (el.map) el.map.style.display = '';

        if (window.hidePageLoader) window.hidePageLoader();
    }

    // Publieke API: de leerlingpagina roept Typetijger.start({...}) aan met een
    // vast monster, server-voortgang en niveau-vergrendeling.
    function start(options) {
        if (options) { for (var k in options) if (options.hasOwnProperty(k)) cfg[k] = options[k]; }
        Promise.resolve()
            .then(function () { return cfg.loadProgress(); })
            .then(function (p) {
                progress = (p && typeof p === 'object') ? p : {};
                return cfg.loadActivity ? cfg.loadActivity() : null;
            })
            .then(function (act) { setActivity(act); boot(); })
            .catch(function () { progress = progress || {}; setActivity(null); boot(); });
    }

    window.Typetijger = {
        start: start,
        showMap: function () { showMap(); },
        render: function () { renderMap(); }
    };

    // Auto-start voor de leerkracht-tool. De leerlingpagina zet
    // window.TT_NO_AUTOSTART = true en stuurt zelf Typetijger.start(...).
    if (!window.TT_NO_AUTOSTART) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function () { start(); });
        } else {
            start();
        }
    }
})();

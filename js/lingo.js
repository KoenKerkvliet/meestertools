/* ============================================
   MEESTERTOOLS - Lingo
   Versie: v1.0.0

   Raad het woord van 5 of 6 letters. De eerste letter is gegeven (zoals bij
   Lingo). Per beurt kleuren de letters:
   - groen  (correct)  : juiste letter op de juiste plaats
   - oranje (present)  : letter zit in het woord, maar op een andere plaats
   - grijs  (absent)   : letter zit niet in het woord

   Met een schermtoetsenbord (fijn voor digibord/touch) dat meekleurt.
   Aantal letters instelbaar (5/6); voorkeur in localStorage.
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    var LEN_KEY = 'mt_lingo_len';
    var ATTEMPTS = 6;

    // ---------- Woordenlijsten (zonder leestekens) ----------
    var WORDS5 = [
        'AARDE', 'ADRES', 'AKKER', 'ANKER', 'APPEL', 'AVOND', 'BAARD', 'BAARS', 'BANJO', 'BEELD',
        'BEKER', 'BEVER', 'BEZEM', 'BLAUW', 'BLOEM', 'BOCHT', 'BODEM', 'BOTER', 'BRAAM', 'BRAND',
        'BRIEF', 'BROEK', 'BROOD', 'BRUIN', 'BUREN', 'BUURT', 'CAVIA', 'CLOWN', 'DEKEN', 'DELEN',
        'DORST', 'DOZEN', 'DRAAD', 'DRAAK', 'DRUIF', 'DWERG', 'EMMER', 'FEEST', 'FIETS', 'FLITS',
        'FLUIT', 'FOREL', 'FRUIT', 'GEBIT', 'GELUK', 'GEZIN', 'GRAAN', 'GRIEP', 'GROEN', 'GROEP',
        'HAAST', 'HALTE', 'HAMER', 'HAVEN', 'HEMEL', 'HOOFD', 'HOORN', 'HOTEL', 'HUMOR', 'JAGER',
        'KAARS', 'KAART', 'KABEL', 'KAMER', 'KASSA', 'KETEL', 'KLOMP', 'KNOOP', 'KOALA', 'KOKEN',
        'KORST', 'KRAAN', 'KRANT', 'KRIJT', 'KROON', 'KRUID', 'KRUIK', 'KUDDE', 'LAARS', 'LADEN',
        'LAKEN', 'LEEUW', 'LENTE', 'LEPEL', 'LEREN', 'LEZEN', 'LICHT', 'LIJST', 'LITER', 'LUCHT',
        'MAAND', 'MANGO', 'MARKT', 'MEEUW', 'METER', 'MOLEN', 'MOTOR', 'NAALD', 'NACHT', 'NEGEN',
        'NOTEN', 'PAARD', 'PAARS', 'PADEN', 'PANDA', 'PAREL', 'PAUZE', 'PEPER', 'PIANO', 'PIZZA',
        'PLAAT', 'PLANT', 'PLEIN', 'PLOEG', 'POORT', 'PRIJS', 'PRINS', 'PRUIM', 'RADIO', 'RAKET',
        'REGEN', 'ROBOT', 'ROUTE', 'RUZIE', 'SCHAT', 'SCHIP', 'SCHOP', 'SJAAL', 'SLANG', 'SLOOT',
        'SMAAK', 'SNOEK', 'SNOEP', 'SPELD', 'SPIER', 'SPOOK', 'SPOOR', 'SPORT', 'STEEN', 'STIER',
        'STIFT', 'STOEL', 'STOEP', 'STORM', 'STRIK', 'TAART', 'TAFEL', 'TANTE', 'TEGEL', 'TITEL',
        'TOETS', 'TOREN', 'TREIN', 'TROTS', 'UILEN', 'VAREN', 'VIOOL', 'VLIEG', 'VLOER', 'VOGEL',
        'VREDE', 'VUREN', 'WAFEL', 'WAGEN', 'WATER', 'WEIDE', 'WEZEL', 'WORST', 'ZADEL', 'ZEBRA',
        'ZOMER', 'ZUSJE', 'ZWAAN', 'ZWART'
    ];
    var WORDS6 = [
        'AGENDA', 'ANANAS', 'APPELS', 'AUGURK', 'BAKKER', 'BALLEN', 'BALLON', 'BANAAN', 'BEZOEK', 'BOEKEN',
        'BORDEN', 'BOSSEN', 'BROERS', 'BUREAU', 'CIRCUS', 'CLOWNS', 'DANSEN', 'DAPPER', 'DEKENS', 'DIEREN',
        'DOKTER', 'DONDER', 'DONKER', 'DOUCHE', 'DRAKEN', 'DUINEN', 'EENDEN', 'EIEREN', 'EILAND', 'EKSTER',
        'EMMERS', 'GITAAR', 'GOLVEN', 'GRAPJE', 'GYMLES', 'HAMERS', 'HANDEN', 'HEKSEN', 'HELDEN', 'HERFST',
        'HEUVEL', 'HOCKEY', 'HONING', 'HUIZEN', 'JASSEN', 'JUWEEL', 'KAMEEL', 'KAPPER', 'KASTEN', 'KATTEN',
        'KERSEN', 'KEUKEN', 'KIKKER', 'KOEIEN', 'KOEKJE', 'KOFFER', 'KOMEET', 'KOMPAS', 'KONIJN', 'KONING',
        'KORAAL', 'KREEFT', 'KUSSEN', 'LACHEN', 'LAMPEN', 'LEPELS', 'LERAAR', 'LIEDJE', 'MANTEL', 'MASKER',
        'MELOEN', 'MIDDAG', 'MIEREN', 'MUIZEN', 'MUZIEK', 'OCEAAN', 'PALEIS', 'PANNEN', 'PANTER', 'PIRAAT',
        'POEDEL', 'POPPEN', 'PUZZEL', 'PYJAMA', 'RENNEN', 'REUZEN', 'RIDDER', 'RIVIER', 'ROBOTS', 'ROEIEN',
        'RUGZAK', 'RUIMTE', 'SALADE', 'SCHAAP', 'SCHELP', 'SCHERM', 'SCHILD', 'SCHOOL', 'SCHUUR', 'SLAGER',
        'SNEEUW', 'SOMMEN', 'SPECHT', 'SPELEN', 'SPOKEN', 'STAART', 'STEDEN', 'STRAAT', 'STRAND', 'STRUIK',
        'SUIKER', 'TAKKEN', 'TANDEN', 'TENNIS', 'TENTEN', 'TIJGER', 'TOMAAT', 'TUINEN', 'TURNEN', 'VELDEN',
        'VIJVER', 'VINGER', 'VISSEN', 'VOETEN', 'VOGELS', 'VOSSEN', 'VRIEND', 'WAAIER', 'WALVIS', 'WANGEN',
        'WERELD', 'WINKEL', 'WINTER', 'WOLKEN', 'WOLKJE', 'WOLVEN', 'WORTEL', 'ZEILEN', 'ZINGEN', 'ZOLDER',
        'ZUSSEN', 'ZWAARD', 'ZWALUW', 'ZWANEN'
    ];

    var KEY_ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];

    // ---------- State ----------
    var wordLength = 5;
    var answer = '';
    var rows = [];        // [{ guess:'APPEL', eval:['correct',...] }]
    var current = '';     // huidige rij incl. gegeven eerste letter
    var state = 'playing';
    var keyState = {};    // letter -> 'correct'|'present'|'absent'
    var revealing = false;

    var $ = function (id) { return document.getElementById(id); };
    var boardEl = $('lingoBoard');
    var keyboardEl = $('lingoKeyboard');
    var messageEl = $('lingoMessage');
    var lenLabel = $('lingoLenLabel');
    var newBtn = $('lingoNew');

    var settingsModal = $('lingoSettingsModal');
    var settingsBtn = $('lingoBtnSettings');
    var settingsClose = $('lingoSettingsClose');
    var settingsDone = $('lingoSettingsDone');
    var lenSeg = $('lingoLenSeg');

    // ---------- Helpers ----------
    function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
    function rank(s) { return s === 'correct' ? 3 : s === 'present' ? 2 : s === 'absent' ? 1 : 0; }

    function evaluate(guess, ans) {
        var n = guess.length;
        var res = [];
        var counts = {};
        var i;
        for (i = 0; i < n; i++) res.push('absent');
        for (i = 0; i < n; i++) counts[ans[i]] = (counts[ans[i]] || 0) + 1;
        for (i = 0; i < n; i++) {
            if (guess[i] === ans[i]) { res[i] = 'correct'; counts[guess[i]]--; }
        }
        for (i = 0; i < n; i++) {
            if (res[i] === 'correct') continue;
            var c = guess[i];
            if (counts[c] > 0) { res[i] = 'present'; counts[c]--; }
        }
        return res;
    }

    // ---------- Render: bord ----------
    function renderBoard() {
        var html = '';
        for (var r = 0; r < ATTEMPTS; r++) {
            html += '<div class="lingo-row" style="grid-template-columns:repeat(' + wordLength + ',1fr)">';
            var played = rows[r];
            var isActive = (r === rows.length && state === 'playing');
            for (var c = 0; c < wordLength; c++) {
                if (played) {
                    var st = played.eval[c];
                    html += '<div class="lingo-tile lingo-' + st + ' is-revealed" style="animation-delay:' + (c * 0.18) + 's">' +
                        played.guess[c] + '</div>';
                } else if (isActive) {
                    var ch = current[c] || '';
                    var given = (c === 0) ? ' lingo-given' : '';
                    var filled = ch ? ' is-filled' : '';
                    var cursor = (c === current.length && current.length < wordLength) ? ' is-cursor' : '';
                    html += '<div class="lingo-tile' + given + filled + cursor + '">' + ch + '</div>';
                } else {
                    // toekomstige rij: toon de gegeven eerste letter vaag
                    var g = (c === 0 && answer) ? answer[0] : '';
                    html += '<div class="lingo-tile lingo-future' + (c === 0 ? ' lingo-given' : '') + '">' + g + '</div>';
                }
            }
            html += '</div>';
        }
        boardEl.innerHTML = html;
    }

    // ---------- Render: toetsenbord ----------
    function renderKeyboard() {
        var html = '';
        KEY_ROWS.forEach(function (row, idx) {
            html += '<div class="lingo-kb-row">';
            if (idx === 2) html += '<button class="lingo-key lingo-key-wide" data-key="ENTER">Enter</button>';
            row.split('').forEach(function (ch) {
                var st = keyState[ch] ? ' lingo-' + keyState[ch] : '';
                html += '<button class="lingo-key' + st + '" data-key="' + ch + '">' + ch + '</button>';
            });
            if (idx === 2) html += '<button class="lingo-key lingo-key-wide" data-key="BACK">&#9003;</button>';
            html += '</div>';
        });
        keyboardEl.innerHTML = html;
    }

    function setMessage(msg, type) {
        messageEl.textContent = msg || ' ';
        messageEl.className = 'lingo-message' + (type ? ' lingo-msg-' + type : '');
    }

    // ---------- Spel ----------
    function newGame() {
        answer = pick(wordLength === 6 ? WORDS6 : WORDS5);
        rows = [];
        current = answer[0];
        state = 'playing';
        keyState = {};
        lenLabel.textContent = wordLength + ' letters';
        setMessage('', '');
        renderBoard();
        renderKeyboard();
    }

    function addLetter(ch) {
        if (state !== 'playing' || revealing) return;
        if (current.length >= wordLength) return;
        current += ch;
        renderBoard();
    }
    function removeLetter() {
        if (state !== 'playing' || revealing) return;
        if (current.length <= 1) return;   // eerste letter blijft staan
        current = current.slice(0, -1);
        renderBoard();
    }
    function submit() {
        if (state !== 'playing' || revealing) return;
        if (current.length < wordLength) {
            setMessage('Vul eerst het hele woord in.', 'warn');
            shakeActiveRow();
            return;
        }
        var ev = evaluate(current, answer);
        var guess = current;
        rows.push({ guess: guess, eval: ev });

        // toetsenbord-kleuren bijwerken
        for (var i = 0; i < guess.length; i++) {
            var c = guess[i];
            if (rank(ev[i]) > rank(keyState[c])) keyState[c] = ev[i];
        }

        revealing = true;
        renderBoard();
        renderKeyboard();

        var revealMs = wordLength * 180 + 280;
        setTimeout(function () {
            revealing = false;
            if (guess === answer) {
                state = 'won';
                setMessage('🎉 Knap gedaan! Het woord was ' + answer + '.', 'win');
            } else if (rows.length >= ATTEMPTS) {
                state = 'lost';
                setMessage('Helaas! Het woord was ' + answer + '.', 'lose');
            } else {
                current = answer[0];
            }
            renderBoard();
        }, revealMs);
    }

    function shakeActiveRow() {
        var rowEls = boardEl.querySelectorAll('.lingo-row');
        var el = rowEls[rows.length];
        if (!el) return;
        el.classList.remove('lingo-shake');
        void el.offsetWidth;
        el.classList.add('lingo-shake');
    }

    // ---------- Invoer ----------
    function handleKey(k) {
        if (k === 'ENTER') submit();
        else if (k === 'BACK') removeLetter();
        else if (/^[A-Z]$/.test(k)) addLetter(k);
    }
    keyboardEl.addEventListener('click', function (e) {
        var btn = e.target.closest('.lingo-key');
        if (btn) handleKey(btn.getAttribute('data-key'));
    });
    document.addEventListener('keydown', function (e) {
        if (settingsModal.classList.contains('active')) {
            if (e.key === 'Escape') closeSettings();
            return;
        }
        if (e.key === 'Enter') { e.preventDefault(); handleKey('ENTER'); }
        else if (e.key === 'Backspace') { e.preventDefault(); handleKey('BACK'); }
        else {
            var ch = (e.key || '').toUpperCase();
            if (ch.length === 1 && ch >= 'A' && ch <= 'Z') handleKey(ch);
        }
    });

    newBtn.addEventListener('click', newGame);

    // ---------- Instellingen ----------
    function setLength(len) {
        wordLength = (len === 6) ? 6 : 5;
        try { localStorage.setItem(LEN_KEY, String(wordLength)); } catch (e) {}
        Array.prototype.forEach.call(lenSeg.querySelectorAll('.lingo-seg-btn'), function (b) {
            b.classList.toggle('is-active', parseInt(b.getAttribute('data-len'), 10) === wordLength);
        });
    }
    lenSeg.addEventListener('click', function (e) {
        var b = e.target.closest('.lingo-seg-btn');
        if (!b) return;
        var len = parseInt(b.getAttribute('data-len'), 10);
        if (len === wordLength) return;
        setLength(len);
        newGame();
    });

    function openSettings() { settingsModal.classList.add('active'); }
    function closeSettings() { settingsModal.classList.remove('active'); }
    settingsBtn.addEventListener('click', openSettings);
    settingsClose.addEventListener('click', closeSettings);
    settingsDone.addEventListener('click', closeSettings);
    settingsModal.addEventListener('click', function (e) { if (e.target === settingsModal) closeSettings(); });

    // ---------- Init ----------
    (function init() {
        var saved = 5;
        try { saved = parseInt(localStorage.getItem(LEN_KEY), 10) || 5; } catch (e) {}
        setLength(saved);
        newGame();
        if (window.hidePageLoader) window.hidePageLoader();
    })();
});

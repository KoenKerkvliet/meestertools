/* ============================================
   MEESTERTOOLS - Meedoen: Typrace (kind-kant)

   Kind logt in met code (+ voornaam), wacht in de lobby en typt tijdens de race
   zoveel mogelijk woorden. Status wordt gepolld bij de edge function; de score
   wordt daar gemeld zodat de leerkracht een live-ranglijst ziet.
   ============================================ */

(function () {
    'use strict';

    // ---------- Woordenlijst (algemeen, basisschool) ----------
    var WORDS = (
        'appel water brood huis boom fiets school meester juf klas boek tafel stoel raam deur ' +
        'vloer muur bord krijt tas jas schoen sok hand voet hoofd haar neus mond oor arm been ' +
        'hond kat vis vogel koe paard schaap kip muis konijn tijger leeuw olifant aap beer slang ' +
        'kikker bij mier spin zon maan ster wolk regen sneeuw wind storm zomer winter lente herfst ' +
        'dag nacht ochtend avond week maand jaar groen rood blauw geel paars roze bruin zwart wit ' +
        'oranje rennen springen lopen zwemmen fietsen spelen lezen schrijven tekenen zingen dansen ' +
        'lachen slapen eten drinken koken wassen helpen delen denken dromen blij boos bang sterk ' +
        'snel groot klein mooi lief grappig slim dapper banaan aardbei tomaat wortel patat kaas ' +
        'melk taart koekje strand bloem gras tak blad vlinder rups slak egel bever otter zeehond ' +
        'raket planeet ruimte trein bus auto boot vliegtuig brug straat plein winkel bakker markt'
    ).split(/\s+/);

    // ---------- State ----------
    var code = '', name = '', participantId = '', displayName = '', monster = '';
    var duration = 90, startedAt = null;
    var pollTimer = null, gameTimer = null, reportTimer = null;
    var score = 0, current = '', typed = 0, endsAt = 0, phase = 'join';

    function $(id) { return document.getElementById(id); }
    function esc(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : s; return d.innerHTML; }
    function showErr(el, msg) { if (el) { el.textContent = msg; el.classList.add('show'); } }
    function hideErr(el) { if (el) el.classList.remove('show'); }

    function show(screen) {
        phase = screen;
        ['Join', 'Wait', 'Game', 'Done'].forEach(function (s) {
            var el = $('screen' + s); if (el) el.classList.toggle('active', s.toLowerCase() === screen);
        });
    }

    // ---------- Edge-call ----------
    async function call(action, extra) {
        var body = Object.assign({ action: action, code: code }, extra || {});
        try {
            var res = await supabase.functions.invoke('typrace-sessie', { body: body });
            if (res.error) {
                var parsed = null;
                try { if (res.error.context && res.error.context.json) parsed = await res.error.context.json(); } catch (e) {}
                return parsed || { ok: false, error: 'Er ging iets mis.' };
            }
            return res.data || { ok: false, error: 'Er ging iets mis.' };
        } catch (e) { return { ok: false, error: 'Er ging iets mis.' }; }
    }

    // ---------- Aanmelden ----------
    async function doJoin() {
        hideErr($('joinError'));
        name = ($('nameInput').value || '').trim();
        code = ($('codeInput').value || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (!code) { showErr($('joinError'), 'Vul de code van het bord in.'); return; }
        if (!name) { showErr($('joinError'), 'Vul je voornaam in.'); return; }

        var btn = $('joinBtn'); btn.disabled = true; btn.textContent = 'Even kijken…';
        var res = await call('join', { name: name });
        btn.disabled = false; btn.innerHTML = 'Doe mee &rarr;';

        if (!res.ok) { showErr($('joinError'), res.error || 'Er ging iets mis.'); return; }
        if (!res.exists) { showErr($('joinError'), 'Deze code klopt niet. Kijk nog eens goed.'); return; }
        participantId = res.participantId; displayName = res.displayName || name; monster = res.monster || '';
        duration = res.duration || 90;
        applyMonster();
        if (res.status === 'playing') { startGame(res.startedAt); }
        else if (res.status === 'closed') { show('done'); $('doneText').textContent = 'Deze race is al afgelopen.'; }
        else { show('wait'); startPoll(); }
    }

    function applyMonster() {
        $('waitHi').textContent = 'Hoi ' + displayName + '!';
        var m = $('waitMonster'); if (m && monster) m.src = '/' + monster.replace(/^\/+/, '');
    }

    // ---------- Poll (wachten op start / einde) ----------
    function startPoll() { stopPoll(); pollTimer = setInterval(pollStatus, 2000); }
    function stopPoll() { if (pollTimer) { clearInterval(pollTimer); pollTimer = null; } }
    async function pollStatus() {
        var res = await call('status');
        if (!res.ok || !res.exists) return;
        if (res.status === 'playing' && phase === 'wait') { startGame(res.startedAt); }
        else if (res.status === 'closed' && phase === 'wait') { stopPoll(); show('done'); $('doneText').textContent = 'De race is gestopt.'; }
    }

    // ---------- Spel ----------
    function pickWord() {
        var w;
        do { w = WORDS[Math.floor(Math.random() * WORDS.length)]; } while (w === current && WORDS.length > 1);
        return w;
    }
    function renderWord() {
        var html = '';
        for (var i = 0; i < current.length; i++) {
            html += '<span class="tr-l' + (i < typed ? ' ok' : '') + '">' + current.charAt(i) + '</span>';
        }
        $('trWord').innerHTML = html;
    }
    function nextWord() { current = pickWord(); typed = 0; renderWord(); }

    function startGame(started) {
        stopPoll();
        startedAt = started ? new Date(started).getTime() : Date.now();
        endsAt = startedAt + duration * 1000;
        score = 0; typed = 0;
        show('game');
        nextWord();
        updateHud();
        focusCapture();
        gameTimer = setInterval(tick, 200);
        reportTimer = setInterval(reportScore, 2500);
    }
    function tick() {
        var rem = Math.max(0, Math.round((endsAt - Date.now()) / 1000));
        $('trTimer').textContent = fmt(rem);
        if (Date.now() >= endsAt) finishGame();
    }
    function fmt(s) { var m = Math.floor(s / 60); return m + ':' + ('0' + (s % 60)).slice(-2); }
    function updateHud() { $('trScore').textContent = score; }

    function handleChar(ch) {
        if (phase !== 'game') return;
        ch = ch.toLowerCase();
        if (ch < 'a' || ch > 'z') return;
        if (ch === current.charAt(typed)) {
            typed++;
            renderWord();
            if (typed >= current.length) { score++; updateHud(); nextWord(); }
        } else {
            var w = $('trWord'); w.classList.remove('bad'); void w.offsetWidth; w.classList.add('bad');
        }
    }

    async function reportScore() { if (participantId) await call('progress', { participantId: participantId, score: score }); }

    async function finishGame() {
        if (gameTimer) { clearInterval(gameTimer); gameTimer = null; }
        if (reportTimer) { clearInterval(reportTimer); reportTimer = null; }
        await reportScore();
        show('done');
        $('doneScore').textContent = score;
        $('doneText').textContent = 'Goed getypt! Kijk op het bord voor de ranglijst.';
    }

    function focusCapture() { var c = $('trCapture'); if (c) { try { c.focus({ preventScroll: true }); } catch (e) {} } }

    // ---------- Init ----------
    function init() {
        $('joinBtn').addEventListener('click', doJoin);
        $('nameInput').addEventListener('keydown', function (e) { if (e.key === 'Enter') doJoin(); });
        $('codeInput').addEventListener('keydown', function (e) { if (e.key === 'Enter') doJoin(); });
        $('codeInput').addEventListener('input', function () {
            $('codeInput').value = $('codeInput').value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        });

        document.addEventListener('keydown', function (e) {
            if (phase !== 'game') return;
            if (e.ctrlKey || e.metaKey || e.altKey) return;
            if (!e.key || e.key.length !== 1) return;
            e.preventDefault();
            handleChar(e.key);
        });
        // tik op het speelveld -> focus (mobiel toetsenbord)
        var game = $('screenGame');
        if (game) game.addEventListener('click', focusCapture);

        // code uit de URL voorvullen
        var params = new URLSearchParams(window.location.search);
        var urlCode = (params.get('code') || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (urlCode) $('codeInput').value = urlCode;
        var urlName = (params.get('naam') || '').trim();
        if (urlName) $('nameInput').value = urlName;
        show('join');
        (urlName ? $('joinBtn') : ($('nameInput'))).focus();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();

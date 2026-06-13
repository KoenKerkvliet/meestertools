/* ============================================
   MEEDOEN - REKENRACE (publieke leerlingkant)

   Geen account nodig. Aanmelden en stats-opslag lopen via de Edge Function
   'rekenrace-sessie' (service-role). De sommen worden HIER client-side
   gegenereerd én nagekeken (via MTRekenrace.generateSum), zodat de loop
   som -> Enter -> volgende geen netwerklatentie heeft. Voortgang wordt af en
   toe naar de server gepusht voor het live leerkracht-dashboard.
   ============================================ */

(function () {
    const POLL_MS = 2500;
    const PROGRESS_EVERY = 3;     // elke 3 sommen stats pushen
    const PROGRESS_MAX_GAP = 4000; // of minstens elke 4s

    // ---------- State ----------
    let code = '';
    let participantId = null;
    let name = '';
    let displayName = '';
    let monster = '';
    let status = '';
    let pollTimer = null;
    let busy = false;

    // sessie-config
    let blockId = '';
    let blockLabel = '';
    let mode = 'tijd';
    let durationSeconds = 0;
    let targetCount = 0;
    let startedAtMs = null;
    let serverOffset = 0; // serverNow - clientNow

    // spel
    let playing = false;
    let current = null;        // { prompt, answer }
    let sumShownAt = 0;
    let answered = 0;
    let correct = 0;
    let totalMs = 0;
    let lastPushAt = 0;
    let lastPushAnswered = 0;
    let gameTimer = null;
    let locking = false;       // korte feedback-pauze na fout antwoord

    // ---------- DOM ----------
    const screens = {
        join: document.getElementById('screenJoin'),
        welcome: document.getElementById('screenWelcome'),
        play: document.getElementById('screenPlay'),
        end: document.getElementById('screenEnd'),
        closed: document.getElementById('screenClosed')
    };
    const codeInput = document.getElementById('codeInput');
    const nameInput = document.getElementById('nameInput');
    const joinBtn = document.getElementById('joinBtn');
    const joinError = document.getElementById('joinError');

    const welcomeMonster = document.getElementById('welcomeMonster');
    const welcomeHi = document.getElementById('welcomeHi');
    const welcomeBlock = document.getElementById('welcomeBlock');

    const playMonster = document.getElementById('playMonster');
    const playName = document.getElementById('playName');
    const playMeter = document.getElementById('playMeter');
    const playSum = document.getElementById('playSum');
    const answerInput = document.getElementById('answerInput');

    const endMonster = document.getElementById('endMonster');
    const endTitle = document.getElementById('endTitle');
    const endLead = document.getElementById('endLead');
    const endSpeed = document.getElementById('endSpeed');
    const endAcc = document.getElementById('endAcc');
    const endAccLabel = document.getElementById('endAccLabel');

    const STORE_KEY = 'mt_meedoen_rekenrace';

    // ---------- Helpers ----------
    function showScreen(key) {
        Object.keys(screens).forEach(k => screens[k].classList.toggle('active', k === key));
    }
    function showErr(msg) { joinError.textContent = msg; joinError.classList.add('show'); }
    function hideErr() { joinError.classList.remove('show'); }
    function save() {
        try { sessionStorage.setItem(STORE_KEY, JSON.stringify({ code, participantId, name, monster, displayName })); } catch (e) {}
    }
    function restore() {
        try { const raw = sessionStorage.getItem(STORE_KEY); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
    }
    function clearStore() { try { sessionStorage.removeItem(STORE_KEY); } catch (e) {} }
    function monsterUrl(p) { return '/' + String(p || '').replace(/^\/+/, ''); }
    function serverNow() { return Date.now() + serverOffset; }

    async function call(action, extra) {
        const body = Object.assign({ action: action, code: code }, extra || {});
        const { data, error } = await supabase.functions.invoke('rekenrace-sessie', { body: body });
        if (error) {
            let parsed = null;
            try { if (error.context && error.context.json) parsed = await error.context.json(); } catch (e) {}
            return parsed || { ok: false, error: 'Er ging iets mis. Probeer het opnieuw.' };
        }
        return data || { ok: false, error: 'Er ging iets mis.' };
    }

    function applyPub(res) {
        if (!res) return;
        if (res.blockId) blockId = res.blockId;
        if (res.blockLabel != null) blockLabel = res.blockLabel;
        if (res.mode) mode = res.mode;
        if (res.durationSeconds != null) durationSeconds = res.durationSeconds || 0;
        if (res.targetCount != null) targetCount = res.targetCount || 0;
        if (res.startedAtMs != null) startedAtMs = res.startedAtMs;
        if (typeof res.nowMs === 'number') serverOffset = res.nowMs - Date.now();
    }

    // ---------- Routing op status ----------
    function routeByStatus(st) {
        const prev = status;
        status = st;
        if (st === 'closed') {
            stopPolling();
            if (playing) { endGame(true); }
            else showScreen('closed');
            return;
        }
        if (st === 'playing') {
            if (!playing) startGame();
            return;
        }
        // lobby
        renderWelcome();
        showScreen('welcome');
    }

    function renderWelcome() {
        welcomeMonster.src = monsterUrl(monster);
        welcomeHi.textContent = 'Hoi ' + (displayName || name) + '! 🎉';
        welcomeBlock.textContent = blockLabel || '';
    }

    // ---------- Polling ----------
    function startPolling() {
        stopPolling();
        pollTimer = setInterval(async () => {
            const res = await call('status');
            if (!res || !res.ok) return;
            if (!res.exists) { stopPolling(); return; }
            applyPub(res);
            if (res.status && res.status !== status) routeByStatus(res.status);
        }, POLL_MS);
    }
    function stopPolling() { if (pollTimer) { clearInterval(pollTimer); pollTimer = null; } }

    // ---------- Aanmelden ----------
    async function doJoin() {
        if (busy) return;
        hideErr();
        code = (codeInput.value || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
        name = (nameInput.value || '').trim();
        if (code.length < 4) { showErr('Vul de code van het bord in.'); return; }
        if (!name) { showErr('Vul je voornaam in.'); return; }

        busy = true; joinBtn.disabled = true; joinBtn.textContent = 'Even kijken…';
        const res = await call('join', { name: name });
        busy = false; joinBtn.disabled = false; joinBtn.innerHTML = 'Doe mee &rarr;';

        if (!res.ok) { showErr(res.error || 'Er ging iets mis.'); return; }
        if (!res.exists) { showErr('Deze code klopt niet. Kijk nog eens op het bord.'); return; }
        if (res.status === 'closed') { applyPub(res); routeByStatus('closed'); return; }
        if (!res.participantId) { showErr('Aanmelden lukte niet. Probeer opnieuw.'); return; }

        participantId = res.participantId;
        displayName = res.displayName || name;
        monster = res.monster || '';
        applyPub(res);
        save();
        startPolling();
        routeByStatus(res.status || 'lobby');
    }

    // ---------- Spel ----------
    function startGame() {
        if (playing) return;
        playing = true;
        answered = 0; correct = 0; totalMs = 0; lastPushAt = Date.now(); lastPushAnswered = 0;
        playMonster.src = monsterUrl(monster);
        playName.textContent = displayName || name;
        showScreen('play');
        nextSum();
        startGameTimer();
        setTimeout(() => answerInput.focus(), 50);
    }

    function nextSum() {
        if (!window.MTRekenrace || !MTRekenrace.hasGenerator(blockId)) {
            // Onbekend blok: niets te doen -> netjes afronden.
            endGame(false);
            return;
        }
        current = MTRekenrace.generateSum(blockId);
        playSum.textContent = current.prompt;
        answerInput.value = '';
        answerInput.className = 'md-answer';
        sumShownAt = Date.now();
        answerInput.focus();
    }

    function submitAnswer() {
        if (!playing || locking || !current) return;
        const raw = (answerInput.value || '').trim();
        if (raw === '') return; // niets ingevuld -> negeer Enter
        const val = parseInt(raw, 10);
        const ok = Number.isFinite(val) && val === current.answer;

        answered++;
        totalMs += Math.max(0, Date.now() - sumShownAt);
        if (ok) correct++;

        maybePushProgress(false);

        // einde bij aantal-modus?
        if (mode === 'aantal' && targetCount && answered >= targetCount) {
            answerInput.className = 'md-answer ' + (ok ? 'is-good' : 'is-bad');
            updateMeter();
            endGame(false);
            return;
        }

        if (ok) {
            // direct door
            answerInput.className = 'md-answer is-good';
            updateMeter();
            nextSum();
        } else {
            // korte fout-feedback, dan door (antwoord telt al als fout)
            locking = true;
            answerInput.className = 'md-answer is-bad';
            updateMeter();
            setTimeout(() => { locking = false; if (playing) nextSum(); }, 450);
        }
    }

    function updateMeter() {
        if (mode === 'aantal') {
            playMeter.textContent = answered + ' / ' + targetCount;
            playMeter.classList.remove('is-low');
        }
    }

    function startGameTimer() {
        stopGameTimer();
        if (mode === 'aantal') { playMeter.textContent = '0 / ' + targetCount; return; }
        // tijdmodus
        const tick = () => {
            const endMs = (startedAtMs || serverNow()) + durationSeconds * 1000;
            const left = Math.max(0, Math.round((endMs - serverNow()) / 1000));
            const m = Math.floor(left / 60), s = left % 60;
            playMeter.textContent = m + ':' + (s < 10 ? '0' + s : s);
            playMeter.classList.toggle('is-low', left <= 10);
            if (left <= 0) endGame(false);
        };
        tick();
        gameTimer = setInterval(tick, 250);
    }
    function stopGameTimer() { if (gameTimer) { clearInterval(gameTimer); gameTimer = null; } }

    // ---------- Voortgang pushen ----------
    function maybePushProgress(finished) {
        const now = Date.now();
        const due = finished ||
            (answered - lastPushAnswered) >= PROGRESS_EVERY ||
            (now - lastPushAt) >= PROGRESS_MAX_GAP;
        if (!due) return;
        lastPushAt = now; lastPushAnswered = answered;
        // fire-and-forget; loop niet blokkeren
        call('progress', { participantId, answered, correct, totalMs, finished: !!finished });
    }

    function endGame(closedByTeacher) {
        if (!playing) {
            if (closedByTeacher) showScreen('closed');
            return;
        }
        playing = false;
        stopGameTimer();
        maybePushProgress(true);

        const minutes = totalMs > 0 ? (totalMs / 60000) : 0;
        const perMin = (answered > 0 && minutes > 0) ? Math.round(answered / minutes) : 0;
        const pct = answered > 0 ? Math.round((correct / answered) * 100) : 0;

        endMonster.src = monsterUrl(monster);
        endTitle.textContent = praise(pct, answered) + ', ' + (displayName || name) + '!';
        endLead.textContent = answered === 0
            ? 'Je hebt geen sommen gemaakt deze keer.'
            : 'Je hebt ' + answered + ' ' + (answered === 1 ? 'som' : 'sommen') + ' gemaakt.';
        endSpeed.textContent = perMin || '0';
        endAcc.textContent = correct + '/' + answered;
        endAccLabel.textContent = pct + '% goed';
        showScreen('end');
    }

    function praise(pct, n) {
        if (n === 0) return 'Tot de volgende keer';
        if (pct >= 90) return 'Geweldig gedaan';
        if (pct >= 70) return 'Goed gedaan';
        if (pct >= 50) return 'Lekker bezig';
        return 'Goed geoefend';
    }

    // ---------- Init ----------
    function init() {
        const params = new URLSearchParams(location.search);
        const urlCode = (params.get('code') || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
        const urlName = (params.get('naam') || params.get('name') || '').trim();
        if (urlCode) codeInput.value = urlCode;
        if (urlName) nameInput.value = urlName;

        codeInput.addEventListener('input', () => {
            codeInput.value = codeInput.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        });
        joinBtn.addEventListener('click', doJoin);
        nameInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') doJoin(); });
        answerInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); submitAnswer(); } });
        // alleen cijfers (en evt. minteken) toelaten
        answerInput.addEventListener('input', () => {
            answerInput.value = answerInput.value.replace(/[^0-9-]/g, '');
        });

        // Eerder aangemeld in deze sessie? (refresh)
        const saved = restore();
        if (saved && saved.participantId && (!urlCode || urlCode === saved.code)) {
            code = saved.code; participantId = saved.participantId; name = saved.name || '';
            displayName = saved.displayName || name; monster = saved.monster || '';
            call('status').then(res => {
                if (res && res.ok && res.exists) {
                    applyPub(res);
                    if (res.status === 'closed') { routeByStatus('closed'); }
                    else { startPolling(); routeByStatus(res.status); }
                } else { clearStore(); }
            });
        } else if (urlCode && urlName) {
            // direct meedoen vanaf de QR-doorstuur
            doJoin();
        } else if (urlCode) {
            nameInput.focus();
        }
    }

    init();
})();

/* ============================================
   MEEDOEN ESCAPE ROOM - publieke teamkant
   Versie: v1.14.0

   Teams (alleen of als groepje rond één device) spelen een escape
   room-sessie die de leerkracht host. Geen account nodig: alle acties
   lopen via de Edge Function 'escaperoom-sessie' (service-role).

   Belangrijk verschil met de leerkracht-speelpagina: de ANTWOORDEN
   komen nooit naar deze browser. Vragen komen zonder antwoord binnen
   (sloten kennen alleen de lengte) en elke controle gebeurt server-side.

   De leerkracht beheert de tijd: de timer start centraal en telt hier
   alleen mee (met server-klokcorrectie). De pagina pollt de status
   zodat het scherm meebeweegt (lobby -> spelen -> gestopt).
   ============================================ */

(function () {
    const POLL_MS = 2500;
    const GOLD_NEEDED = 2;
    const COOLDOWN_MS = 60000;
    const STORE_KEY = 'mt_meedoen_er';

    // ---------- State ----------
    let code = '';
    let teamId = null;
    let teamName = '';
    let status = '';
    let questions = null;      // [{position, question, question_type, answer_len, options, ...}]
    let normals = [];
    let finale = null;
    let answered = new Set();
    let unlocked = new Set();  // betaalde unlocks (posities > 2)
    let finaleUnlocked = false;
    let finished = false;
    let prevSilverGranted = 0; // voor de sleutel-animatie (zilver of goud?)
    const cooldowns = {};
    const puzzles = {};
    let currentPuzzle = null;
    const findits = {};        // pos -> { found:Set } Find it-voortgang
    let currentFindit = null;  // { q, card } van de open Find it-popup
    let busy = false;
    let pollTimer = null;

    // Timer (leerkracht beheert; wij tellen alleen mee)
    let timeLimitMin = null;
    let startedAtMs = null;
    let serverOffsetMs = 0;    // serverNow - clientNow
    let clockTimer = null;
    let timeUpShown = false;

    // ---------- DOM ----------
    const screens = {
        join: document.getElementById('screenJoin'),
        lobby: document.getElementById('screenLobby'),
        closed: document.getElementById('screenClosed')
    };
    const joinCard = document.getElementById('erJoinCard');
    const gameEl = document.getElementById('erGame');
    const codeInput = document.getElementById('codeInput');
    const nameInput = document.getElementById('nameInput');
    const joinBtn = document.getElementById('joinBtn');
    const joinError = document.getElementById('joinError');
    const lobbyHi = document.getElementById('lobbyHi');
    const lobbyRoom = document.getElementById('lobbyRoom');

    const heroTitle = document.getElementById('erHeroTitle');
    const heroTeam = document.getElementById('erHeroTeam');
    const statusbar = document.getElementById('erStatusbar');
    const keyCountEl = document.getElementById('erKeyCount');
    const goldCountEl = document.getElementById('erGoldCount');
    const answerCountEl = document.getElementById('erAnswerCount');
    const totalCountEl = document.getElementById('erTotalCount');
    const grid = document.getElementById('erPlayGrid');
    const finaleSection = document.getElementById('erFinaleSection');
    const victory = document.getElementById('erVictory');
    const victoryTime = document.getElementById('erVictoryTime');
    const timesUpEl = document.getElementById('erTimesUp');
    const stoppedEl = document.getElementById('erStopped');
    const puzzleModal = document.getElementById('erPuzzleModal');
    const puzzleTitle = document.getElementById('erPuzzleTitle');
    const puzzleBoard = document.getElementById('erPuzzleBoard');
    const puzzleStatus = document.getElementById('erPuzzleStatus');
    const finditModal = document.getElementById('erFindItModal');
    const finditTitle = document.getElementById('erFindItTitle');
    const finditLeft = document.getElementById('erFindItLeft');
    const finditRight = document.getElementById('erFindItRight');
    const finditStatus = document.getElementById('erFindItStatus');

    // ---------- Helpers ----------
    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str == null ? '' : String(str);
        return div.innerHTML;
    }
    function attrUrl(url) { return String(url || '').replace(/"/g, '%22'); }
    function showErr(el, msg) { el.textContent = msg; el.classList.add('show'); }
    function hideErr(el) { el.classList.remove('show'); }
    function showScreen(key) {
        joinCard.style.display = '';
        gameEl.style.display = 'none';
        Object.keys(screens).forEach(k => screens[k].classList.toggle('active', k === key));
    }
    function showGame() {
        joinCard.style.display = 'none';
        gameEl.style.display = '';
    }
    function save() {
        try { sessionStorage.setItem(STORE_KEY, JSON.stringify({ code, teamId, teamName })); } catch (e) {}
    }
    function restore() {
        try { return JSON.parse(sessionStorage.getItem(STORE_KEY) || 'null'); } catch (e) { return null; }
    }
    function clearStore() { try { sessionStorage.removeItem(STORE_KEY); } catch (e) {} }

    async function call(action, extra) {
        const body = Object.assign({ action: action, code: code, teamId: teamId }, extra || {});
        const { data, error } = await supabase.functions.invoke('escaperoom-sessie', { body: body });
        if (error) {
            let parsed = null;
            try { if (error.context && error.context.json) parsed = await error.context.json(); } catch (e) {}
            return parsed || { ok: false, error: 'Er ging iets mis. Probeer het opnieuw.' };
        }
        return data || { ok: false, error: 'Er ging iets mis.' };
    }

    function syncSessionInfo(res) {
        if (res.timeLimitMinutes !== undefined) timeLimitMin = res.timeLimitMinutes;
        if (res.startedAtMs !== undefined) startedAtMs = res.startedAtMs;
        if (res.nowMs) serverOffsetMs = res.nowMs - Date.now();
        if (res.roomTitle) {
            heroTitle.textContent = res.roomTitle;
            document.title = 'Meestertools - ' + res.roomTitle;
        }
        if (res.theme && res.theme !== 'standaard') {
            document.body.classList.add('er-theme-' + res.theme);
        }
    }

    function syncTeamState(res) {
        if (Array.isArray(res.answered)) answered = new Set(res.answered);
        if (Array.isArray(res.unlocked)) unlocked = new Set(res.unlocked);
        if (res.finaleUnlocked !== undefined) finaleUnlocked = !!res.finaleUnlocked;
        if (res.finished !== undefined) finished = !!res.finished;
    }

    // ---------- Sleutels (zelfde regels als de leerkracht-pagina, afgeleid) ----------
    function silverNeededTotal() { return Math.max(0, normals.length - 2); }
    function answeredNormals() {
        let n = 0;
        normals.forEach(q => { if (answered.has(q.position)) n++; });
        return n;
    }
    function silverGranted() { return Math.min(answeredNormals(), silverNeededTotal()); }
    function goldGranted() { return Math.max(0, answeredNormals() - silverNeededTotal()); }
    function silverKeys() { return silverGranted() - unlocked.size; }
    function goldKeys() { return goldGranted() - (finaleUnlocked ? GOLD_NEEDED : 0); }
    function isUnlocked(pos) { return pos <= 2 || unlocked.has(pos); }

    function updateStatus() {
        keyCountEl.textContent = silverKeys();
        goldCountEl.textContent = goldKeys();
        answerCountEl.textContent = answered.size;
        totalCountEl.textContent = normals.length + (finale ? 1 : 0);
    }

    // ---------- Geluid ----------
    let audioCtx = null;
    function playNotes(freqs, volume) {
        try {
            audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
            freqs.forEach((f, i) => {
                const o = audioCtx.createOscillator();
                const g = audioCtx.createGain();
                o.type = 'sine';
                o.frequency.value = f;
                const t = audioCtx.currentTime + i * 0.1;
                g.gain.setValueAtTime(0.0001, t);
                g.gain.exponentialRampToValueAtTime(volume, t + 0.02);
                g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
                o.connect(g);
                g.connect(audioCtx.destination);
                o.start(t);
                o.stop(t + 0.45);
            });
        } catch (e) { /* geluid is een extraatje */ }
    }
    function pling() { playNotes([880, 1318.5], 0.15); }
    function victoryChime() { playNotes([523.25, 659.25, 783.99, 1046.5], 0.18); }
    function dialTick() { playNotes([1567.98], 0.07); }

    // ---------- Confetti ----------
    function launchConfetti() {
        const colors = ['#6C63FF', '#FF6B6B', '#F5B941', '#7BE495', '#4FC3F7', '#FF8AC2'];
        const wrap = document.createElement('div');
        wrap.className = 'er-confetti';
        for (let i = 0; i < 130; i++) {
            const p = document.createElement('span');
            p.style.left = (Math.random() * 100) + 'vw';
            p.style.background = colors[i % colors.length];
            p.style.width = (6 + Math.random() * 7) + 'px';
            p.style.height = (8 + Math.random() * 8) + 'px';
            p.style.animationDuration = (2.4 + Math.random() * 2.2) + 's';
            p.style.animationDelay = (Math.random() * 0.9) + 's';
            if (Math.random() < 0.4) p.style.borderRadius = '50%';
            wrap.appendChild(p);
        }
        document.body.appendChild(wrap);
        setTimeout(() => wrap.remove(), 6000);
    }

    // ---------- Sleutel-animatie ----------
    function grantKeyAnim(fromEl) {
        const type = silverGranted() > prevSilverGranted ? 'silver' : 'gold';
        prevSilverGranted = silverGranted();
        const target = document.querySelector(type === 'gold' ? '.er-status-gold' : '.er-status-keys');
        pling();
        updateStatus();
        if (!target || !fromEl) return;
        const from = fromEl.getBoundingClientRect();
        const to = target.getBoundingClientRect();
        const key = document.createElement('div');
        key.className = 'er-key-fly' + (type === 'gold' ? ' er-key-gold' : '');
        key.textContent = type === 'gold' ? '\u{1F511}' : '\u{1F5DD}️';
        key.style.left = (from.left + from.width / 2 - 20) + 'px';
        key.style.top = (from.top + from.height / 2 - 20) + 'px';
        document.body.appendChild(key);
        const dx = (to.left + to.width / 2) - (from.left + from.width / 2);
        const dy = (to.top + to.height / 2) - (from.top + from.height / 2);
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                key.style.transform = 'translate(' + dx + 'px, ' + dy + 'px) scale(0.4) rotate(360deg)';
                key.style.opacity = '0';
            });
        });
        setTimeout(() => {
            key.remove();
            target.classList.add('er-key-pulse');
            setTimeout(() => target.classList.remove('er-key-pulse'), 450);
        }, 800);
    }

    // ---------- Timer (meeloop-klok) ----------
    function serverNow() { return Date.now() + serverOffsetMs; }
    function fmt(t) {
        const m = Math.floor(t / 60);
        const s = t % 60;
        return (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
    }
    function remainingSec() {
        if (!startedAtMs || !timeLimitMin) return null;
        return Math.max(0, Math.round((startedAtMs + timeLimitMin * 60000 - serverNow()) / 1000));
    }
    function elapsedSec() {
        if (!startedAtMs) return 0;
        return Math.max(0, Math.round((serverNow() - startedAtMs) / 1000));
    }
    function updateClock() {
        const d = document.getElementById('erTimerDisplay');
        if (!d) return;
        if (timeLimitMin) {
            const rem = remainingSec();
            d.textContent = fmt(rem);
            d.classList.toggle('er-timer-low', rem <= 60);
            if (rem <= 0) onTimeUp();
        } else {
            d.textContent = fmt(elapsedSec());
        }
    }
    function startClock() {
        stopClock();
        clockTimer = setInterval(updateClock, 1000);
        updateClock();
    }
    function stopClock() { if (clockTimer) { clearInterval(clockTimer); clockTimer = null; } }

    function onTimeUp() {
        if (timeUpShown || finished) return;
        timeUpShown = true;
        stopClock();
        closePuzzle();
        timesUpEl.classList.add('active');
    }
    function onStopped() {
        stopPolling();
        stopClock();
        closePuzzle();
        if (!finished && !timeUpShown) stoppedEl.classList.add('active');
    }

    // ---------- Polling ----------
    function startPolling() {
        stopPolling();
        pollTimer = setInterval(async () => {
            const res = await call('status');
            if (!res || !res.ok || !res.exists) return;
            syncSessionInfo(res);
            if (res.status === 'closed') { status = 'closed'; onStopped(); return; }
            if (res.status === 'playing' && status !== 'playing') {
                status = 'playing';
                await enterGame();
            }
            if (res.timeUp) onTimeUp();
        }, POLL_MS);
    }
    function stopPolling() { if (pollTimer) { clearInterval(pollTimer); pollTimer = null; } }

    // ---------- Server-check ----------
    async function serverCheck(q, answer) {
        const res = await call('check', { position: q.position, answer: answer });
        if (!res.ok) {
            if (res.timeUp) { onTimeUp(); return null; }
            if (res.status === 'closed') { onStopped(); return null; }
            return null;
        }
        if (res.correct) syncTeamState(res);
        return !!res.correct;
    }

    // ---------- Draaisloten (cijfers en letters) ----------
    const LOCK_CHARSETS = {
        cijferslot: '0123456789',
        letterslot: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    };

    function lockHtml(len, charset) {
        let html = '<div class="er-lock">';
        for (let i = 0; i < len; i++) {
            html += '<div class="er-lock-col" data-charset="' + charset + '">' +
                '<button type="button" class="er-lock-up" aria-label="Hoger">&#9650;</button>' +
                '<div class="er-lock-digit">' + LOCK_CHARSETS[charset][0] + '</div>' +
                '<button type="button" class="er-lock-down" aria-label="Lager">&#9660;</button>' +
            '</div>';
        }
        html += '</div>';
        return html;
    }

    function wireLock(container) {
        container.querySelectorAll('.er-lock-col').forEach(col => {
            const digitEl = col.querySelector('.er-lock-digit');
            const chars = LOCK_CHARSETS[col.dataset.charset] || LOCK_CHARSETS.cijferslot;
            const step = (d) => {
                const idx = (chars.indexOf(digitEl.textContent) + d + chars.length) % chars.length;
                digitEl.textContent = chars[idx];
                digitEl.classList.remove('er-lock-tick');
                void digitEl.offsetWidth;
                digitEl.classList.add('er-lock-tick');
            };
            col.querySelector('.er-lock-up').addEventListener('click', () => step(1));
            col.querySelector('.er-lock-down').addEventListener('click', () => step(-1));
        });
    }

    function lockValue(container) {
        return Array.prototype.map.call(
            container.querySelectorAll('.er-lock-digit'),
            d => d.textContent
        ).join('');
    }

    function isLockType(t) {
        return t === 'cijferslot' || t === 'letterslot';
    }

    // ---------- Kluis-draaislot ----------
    const DIAL_DWELL_MS = 900;

    function dialHtml(len) {
        let nums = '';
        for (let d = 0; d <= 9; d++) {
            nums += '<div class="er-dial-num" data-num="' + d + '" style="--a:' + (d * 36) + 'deg">' + d + '</div>';
        }
        let slots = '';
        for (let i = 0; i < len; i++) slots += '<span class="er-dial-slot">&ndash;</span>';
        return '<div class="er-dial-wrap">' +
            '<div class="er-dial">' + nums + '<div class="er-dial-knob"></div></div>' +
            '<div class="er-dial-row">' +
                '<div class="er-dial-display">' + slots + '</div>' +
                '<button type="button" class="er-btn er-btn-secondary er-dial-clear">Wis</button>' +
            '</div>' +
            '<div class="er-dial-hint">Draai de knop en houd de pijl even stil op een cijfer om het in te voeren.</div>' +
        '</div>';
    }

    // onFull mag een Promise teruggeven (server-check); het slot blijft
    // bevroren tot de uitkomst binnen is.
    function wireDial(root, len, onFull) {
        const dial = root.querySelector('.er-dial');
        const knob = root.querySelector('.er-dial-knob');
        const nums = dial.querySelectorAll('.er-dial-num');
        const slots = root.querySelectorAll('.er-dial-slot');

        let rot = 0;
        let entered = [];
        let started = false;
        let lastRegistered = null;
        let downAngle = null;
        let lastAngle = 0;
        let movedTotal = 0;
        let dwellInterval = null;
        let restTimeout = null;
        let locked = false;

        function digitAt(r) { return ((Math.round(r / 36) % 10) + 10) % 10; }
        function numEl(d) { return dial.querySelector('.er-dial-num[data-num="' + d + '"]'); }
        function setKnob(animate) {
            knob.style.transition = animate ? 'transform 0.25s ease' : 'none';
            knob.style.transform = 'rotate(' + rot + 'deg)';
        }
        function highlight() {
            const d = digitAt(rot);
            nums.forEach(n => n.classList.toggle('er-dial-active', parseInt(n.dataset.num, 10) === d));
        }
        function updateDisplay() {
            slots.forEach((s, i) => {
                s.textContent = entered[i] != null ? entered[i] : '–';
                s.classList.toggle('filled', entered[i] != null);
            });
        }
        function clearDwell() {
            if (dwellInterval) clearInterval(dwellInterval);
            if (restTimeout) clearTimeout(restTimeout);
            dwellInterval = restTimeout = null;
            nums.forEach(n => {
                n.classList.remove('er-dial-charging');
                n.style.removeProperty('--p');
            });
        }
        function register(d) {
            clearDwell();
            lastRegistered = d;
            entered.push(String(d));
            updateDisplay();
            dialTick();
            if (entered.length >= len) {
                locked = true;
                setTimeout(() => {
                    Promise.resolve(onFull(entered.join(''))).then(ok => {
                        locked = false;
                        if (!ok) {
                            entered = [];
                            updateDisplay();
                        }
                    });
                }, 300);
            }
        }
        function startDwell() {
            clearDwell();
            if (!started || locked || downAngle !== null) return;
            if (entered.length >= len) return;
            const d = digitAt(rot);
            if (d === lastRegistered) return;
            const el = numEl(d);
            el.classList.add('er-dial-charging');
            const t0 = performance.now();
            dwellInterval = setInterval(() => {
                const p = (performance.now() - t0) / DIAL_DWELL_MS;
                if (p >= 1) {
                    register(d);
                } else {
                    el.style.setProperty('--p', String(Math.round(p * 100)));
                }
            }, 50);
        }
        function onRest() {
            highlight();
            if (digitAt(rot) !== lastRegistered) lastRegistered = null;
            startDwell();
        }
        function pointerAngle(e) {
            const r = dial.getBoundingClientRect();
            const dx = e.clientX - (r.left + r.width / 2);
            const dy = e.clientY - (r.top + r.height / 2);
            return Math.atan2(dx, -dy) * 180 / Math.PI;
        }
        function rotateToDigit(d) {
            const diff = (((d * 36 - rot) % 360) + 540) % 360 - 180;
            rot += diff;
            setKnob(true);
            restTimeout = setTimeout(onRest, 280);
        }

        dial.addEventListener('pointerdown', (e) => {
            if (locked) return;
            e.preventDefault();
            try { dial.setPointerCapture(e.pointerId); } catch (err) { /* niet kritisch */ }
            started = true;
            downAngle = lastAngle = pointerAngle(e);
            movedTotal = 0;
            clearDwell();
        });
        dial.addEventListener('pointermove', (e) => {
            if (downAngle === null) return;
            const a = pointerAngle(e);
            let delta = a - lastAngle;
            if (delta > 180) delta -= 360;
            if (delta < -180) delta += 360;
            lastAngle = a;
            movedTotal += Math.abs(delta);
            rot += delta;
            setKnob(false);
            highlight();
        });
        const endDrag = (e) => {
            if (downAngle === null) return;
            downAngle = null;
            const clickedNum = movedTotal < 8 && e.target && e.target.closest && e.target.closest('.er-dial-num');
            if (clickedNum) {
                rotateToDigit(parseInt(clickedNum.dataset.num, 10));
            } else {
                rot = Math.round(rot / 36) * 36;
                setKnob(true);
                restTimeout = setTimeout(onRest, 280);
            }
        };
        dial.addEventListener('pointerup', endDrag);
        dial.addEventListener('pointercancel', endDrag);

        root.querySelector('.er-dial-clear').addEventListener('click', () => {
            if (locked) return;
            entered = [];
            lastRegistered = digitAt(rot);
            clearDwell();
            updateDisplay();
        });

        highlight();
        updateDisplay();
    }

    // ---------- Datum ----------
    const MONTHS_NL = ['januari', 'februari', 'maart', 'april', 'mei', 'juni',
        'juli', 'augustus', 'september', 'oktober', 'november', 'december'];

    function isDateType(t) { return t === 'datum' || t === 'datum_jaar'; }
    function pad2(n) { return (n < 10 ? '0' : '') + n; }

    function dateHtml(type, btnLabel, extraClass) {
        let days = '<option value="">Dag</option>';
        for (let d = 1; d <= 31; d++) days += '<option value="' + d + '">' + d + '</option>';
        let months = '<option value="">Maand</option>';
        MONTHS_NL.forEach((m, i) => { months += '<option value="' + (i + 1) + '">' + m + '</option>'; });
        return '<div class="er-q-answer er-date-row' + (extraClass ? ' ' + extraClass : '') + '">' +
            '<select class="er-date-day">' + days + '</select>' +
            '<select class="er-date-month">' + months + '</select>' +
            (type === 'datum_jaar' ? '<input type="number" class="er-date-year" placeholder="Jaar" min="1" max="2999" autocomplete="off">' : '') +
            '<button class="er-btn">' + btnLabel + '</button>' +
        '</div>';
    }

    function dateValue(container, type) {
        const d = parseInt(container.querySelector('.er-date-day').value, 10);
        const m = parseInt(container.querySelector('.er-date-month').value, 10);
        if (!d || !m) return '';
        if (type === 'datum_jaar') {
            const y = parseInt(container.querySelector('.er-date-year').value, 10);
            if (!y) return '';
            return pad2(d) + '-' + pad2(m) + '-' + y;
        }
        return pad2(d) + '-' + pad2(m);
    }

    // ---------- Schuifpuzzel ----------
    function puzzleNeighbors(idx, size) {
        const r = Math.floor(idx / size), c = idx % size, out = [];
        if (r > 0) out.push(idx - size);
        if (r < size - 1) out.push(idx + size);
        if (c > 0) out.push(idx - 1);
        if (c < size - 1) out.push(idx + 1);
        return out;
    }

    const PUZZLE_LEVEL_MOVES = { 1: 3, 2: 5, 3: 8 };

    function newPuzzleBoard(size, level) {
        const n = size * size;
        let board, emptyCell;
        do {
            board = [];
            for (let i = 0; i < n; i++) board.push(i);
            emptyCell = size - 1;
            let prev = -1;
            const moves = PUZZLE_LEVEL_MOVES[level] || PUZZLE_LEVEL_MOVES[2];
            for (let m = 0; m < moves; m++) {
                const nb = puzzleNeighbors(emptyCell, size).filter(x => x !== prev);
                const pick = nb[Math.floor(Math.random() * nb.length)];
                board[emptyCell] = board[pick];
                board[pick] = size - 1;
                prev = emptyCell;
                emptyCell = pick;
            }
            while (Math.floor(emptyCell / size) > 0) {
                const up = emptyCell - size;
                board[emptyCell] = board[up]; board[up] = size - 1; emptyCell = up;
            }
            while (emptyCell % size < size - 1) {
                const right = emptyCell + 1;
                board[emptyCell] = board[right]; board[right] = size - 1; emptyCell = right;
            }
        } while (board.every((v, i) => v === i));
        return board;
    }

    function puzzleSolved(board) {
        return board.every((v, i) => v === i);
    }

    function openPuzzle(q, card) {
        const size = q.puzzle_size === 4 ? 4 : 3;
        if (!puzzles[q.position]) puzzles[q.position] = { size: size, board: newPuzzleBoard(size, q.puzzle_level || 2) };
        currentPuzzle = { q: q, card: card };
        puzzleTitle.textContent = q.question;
        puzzleStatus.textContent = '';
        renderPuzzleBoard();
        puzzleModal.classList.add('active');
    }

    function closePuzzle() {
        currentPuzzle = null;
        puzzleModal.classList.remove('active');
    }

    function renderPuzzleBoard() {
        if (!currentPuzzle) return;
        const q = currentPuzzle.q;
        const p = puzzles[q.position];
        const size = p.size;
        const emptyTile = size - 1;

        puzzleBoard.style.gridTemplateColumns = 'repeat(' + size + ', 1fr)';
        puzzleBoard.innerHTML = '';

        p.board.forEach((tile, cell) => {
            const el = document.createElement('div');
            el.dataset.tile = tile;
            if (tile === emptyTile) {
                el.className = 'er-puzzle-empty';
            } else {
                el.className = 'er-puzzle-tile';
                const tr = Math.floor(tile / size), tc = tile % size;
                el.style.backgroundImage = 'url("' + attrUrl(q.image_url) + '")';
                el.style.backgroundSize = (size * 100) + '% ' + (size * 100) + '%';
                el.style.backgroundPosition =
                    (tc * 100 / (size - 1)) + '% ' + (tr * 100 / (size - 1)) + '%';
                el.addEventListener('click', () => {
                    const emptyCell = p.board.indexOf(emptyTile);
                    if (puzzleNeighbors(cell, size).indexOf(emptyCell) === -1) return;
                    p.board[emptyCell] = tile;
                    p.board[cell] = emptyTile;
                    renderPuzzleBoard();
                    if (puzzleSolved(p.board)) onPuzzleSolved();
                });
            }
            puzzleBoard.appendChild(el);
        });
    }

    async function onPuzzleSolved() {
        if (!currentPuzzle) return;
        const q = currentPuzzle.q;
        const card = currentPuzzle.card;
        puzzleStatus.textContent = 'Opgelost! \u{1F389}';
        puzzleBoard.classList.add('er-puzzle-win');
        const ok = await serverCheck(q, '');
        setTimeout(() => {
            puzzleBoard.classList.remove('er-puzzle-win');
            closePuzzle();
            if (ok) onCorrect(q, card);
        }, 900);
    }

    document.getElementById('erPuzzleClose')?.addEventListener('click', closePuzzle);
    puzzleModal?.addEventListener('click', (e) => { if (e.target === puzzleModal) closePuzzle(); });

    // ---------- Find it (zoek de verschillen) ----------
    function finditBoxes(q) {
        return Array.isArray(q.findit_boxes) ? q.findit_boxes : [];
    }

    function openFindIt(q, card) {
        if (!findits[q.position]) findits[q.position] = { found: new Set() };
        currentFindit = { q: q, card: card };
        if (finditTitle) finditTitle.textContent = q.question;
        renderFinditHalves();
        updateFinditStatus();
        finditModal.classList.add('active');
    }

    function closeFindIt() {
        currentFindit = null;
        finditModal.classList.remove('active');
    }

    function renderFinditHalves() {
        if (!currentFindit) return;
        const q = currentFindit.q;
        const st = findits[q.position];
        [[finditLeft, '0%'], [finditRight, '100%']].forEach(([el, posX]) => {
            if (!el) return;
            el.style.backgroundImage = 'url("' + attrUrl(q.image_url) + '")';
            el.style.backgroundSize = '200% 100%';
            el.style.backgroundPosition = posX + ' 0';
            el.innerHTML = '';
            finditBoxes(q).forEach((b, idx) => {
                if (!st.found.has(idx)) return;
                const box = document.createElement('div');
                box.className = 'er-fi-box';
                box.style.left = (b.x * 100) + '%';
                box.style.top = (b.y * 100) + '%';
                box.style.width = (b.w * 100) + '%';
                box.style.height = (b.h * 100) + '%';
                el.appendChild(box);
            });
        });
    }

    function updateFinditStatus() {
        if (!currentFindit || !finditStatus) return;
        const q = currentFindit.q;
        finditStatus.textContent = findits[q.position].found.size + ' / ' + finditBoxes(q).length + ' gevonden';
    }

    function finditClick(e, side) {
        if (!currentFindit) return;
        const q = currentFindit.q;
        const st = findits[q.position];
        const el = side === 'left' ? finditLeft : finditRight;
        const r = el.getBoundingClientRect();
        const fx = (e.clientX - r.left) / r.width, fy = (e.clientY - r.top) / r.height;
        const boxes = finditBoxes(q);
        let hitIdx = -1;
        for (let k = 0; k < boxes.length; k++) {
            if (st.found.has(k)) continue;
            const b = boxes[k];
            if (fx >= b.x && fx <= b.x + b.w && fy >= b.y && fy <= b.y + b.h) { hitIdx = k; break; }
        }
        if (hitIdx >= 0) {
            st.found.add(hitIdx);
            renderFinditHalves();
            updateFinditStatus();
            if (st.found.size >= boxes.length) onFinditSolved();
        } else {
            const dot = document.createElement('div');
            dot.className = 'er-fi-miss';
            dot.style.left = (fx * 100) + '%';
            dot.style.top = (fy * 100) + '%';
            dot.textContent = '✗';
            el.appendChild(dot);
            setTimeout(() => dot.remove(), 600);
        }
    }

    async function onFinditSolved() {
        if (!currentFindit) return;
        const q = currentFindit.q;
        const card = currentFindit.card;
        if (finditStatus) finditStatus.textContent = 'Alle verschillen gevonden! \u{1F389}';
        const ok = await serverCheck(q, '');
        setTimeout(() => {
            closeFindIt();
            if (ok) onCorrect(q, card);
        }, 900);
    }

    document.getElementById('erFindItClose')?.addEventListener('click', closeFindIt);
    finditModal?.addEventListener('click', (e) => { if (e.target === finditModal) closeFindIt(); });
    finditLeft?.addEventListener('click', (e) => finditClick(e, 'left'));
    finditRight?.addEventListener('click', (e) => finditClick(e, 'right'));

    // ---------- Goed antwoord verwerken ----------
    function onCorrect(q, card) {
        answered.add(q.position);
        renderQuestionCard(card, q);
        grantKeyAnim(card);
        refreshLockedCards();
        renderFinaleSection();
    }

    // ---------- Vraagkaarten ----------
    function renderQuestionCard(card, q) {
        const pos = q.position;
        card.dataset.position = pos;
        card.className = 'er-play-card';

        if (answered.has(pos)) {
            card.classList.add('er-answered');
            card.innerHTML =
                '<div class="er-card-label">Vraag ' + pos + '</div>' +
                '<div class="er-q-text">' + escapeHtml(q.question) + '</div>' +
                '<div class="er-q-done">&#9989; Goed beantwoord!</div>';
            return;
        }

        if (!isUnlocked(pos)) {
            card.classList.add('er-locked');
            card.innerHTML =
                '<div class="er-card-label">Vraag ' + pos + '</div>' +
                '<div class="er-locked-icon">&#128274;</div>' +
                '<div class="er-locked-text">Deze kaart zit op slot.</div>' +
                '<button class="er-btn er-unlock-btn"' + (silverKeys() < 1 ? ' disabled' : '') + '>' +
                    '&#128477;&#65039; Open met zilveren sleutel' +
                '</button>';

            card.querySelector('.er-unlock-btn').addEventListener('click', async () => {
                if (silverKeys() < 1 || busy) return;
                busy = true;
                const res = await call('unlock', { position: pos });
                busy = false;
                if (!res.ok) { if (res.timeUp) onTimeUp(); return; }
                syncTeamState(res);
                updateStatus();
                renderQuestionCard(card, q);
                refreshLockedCards();
            });
            return;
        }

        if (cooldowns[pos] && cooldowns[pos] > Date.now()) {
            card.classList.add('er-locked', 'er-cooldown');
            card.innerHTML =
                '<div class="er-card-label">Vraag ' + pos + '</div>' +
                '<div class="er-locked-icon">&#9940;</div>' +
                '<div class="er-locked-text">Foute gok! Nog <strong class="er-cooldown-left"></strong> op slot.</div>';
            const leftEl = card.querySelector('.er-cooldown-left');
            const update = () => {
                const left = Math.max(0, Math.ceil((cooldowns[pos] - Date.now()) / 1000));
                leftEl.textContent = left + ' sec';
                if (left <= 0) {
                    clearInterval(iv);
                    delete cooldowns[pos];
                    renderQuestionCard(card, q);
                }
            };
            const iv = setInterval(update, 500);
            update();
            return;
        }

        const type = q.question_type || 'text';
        const label = '<div class="er-card-label">Vraag ' + pos +
            (isLockType(type) || type === 'draaislot' ? ' &middot; &#128272;'
                : isDateType(type) ? ' &middot; &#128197;'
                : type === 'meerkeuze' ? ' &middot; A/B/C'
                : type === 'schuifpuzzel' ? ' &middot; &#129513;'
                : type === 'findit' ? ' &middot; &#128269;' : '') +
            '</div>';
        const qtext = '<div class="er-q-text">' + escapeHtml(q.question) + '</div>';

        if (type === 'meerkeuze') {
            card.innerHTML = label + qtext +
                '<div class="er-mc-options">' +
                (q.options || []).map(c => '<button class="er-mc-btn">' + escapeHtml(c) + '</button>').join('') +
                '</div>' +
                '<div class="er-q-feedback"></div>';
            card.querySelectorAll('.er-mc-btn').forEach(btn => {
                btn.addEventListener('click', async () => {
                    if (busy) return;
                    busy = true;
                    const ok = await serverCheck(q, btn.textContent);
                    busy = false;
                    if (ok === null) return;
                    if (ok) {
                        onCorrect(q, card);
                    } else {
                        cooldowns[pos] = Date.now() + COOLDOWN_MS;
                        card.classList.add('er-wrong');
                        setTimeout(() => renderQuestionCard(card, q), 450);
                    }
                });
            });
            return;
        }

        if (type === 'schuifpuzzel') {
            card.innerHTML = label + qtext +
                (q.image_url ? '<img class="er-puzzle-thumb" src="' + attrUrl(q.image_url) + '" alt="">' : '') +
                '<div class="er-q-answer"><button class="er-btn">&#129513; Speel de schuifpuzzel</button></div>';
            card.querySelector('.er-btn').addEventListener('click', () => openPuzzle(q, card));
            return;
        }

        if (type === 'findit') {
            card.innerHTML = label + qtext +
                (q.image_url ? '<img class="er-puzzle-thumb" src="' + attrUrl(q.image_url) + '" alt="">' : '') +
                '<div class="er-q-answer"><button class="er-btn">&#128269; Zoek de verschillen</button></div>';
            card.querySelector('.er-btn').addEventListener('click', () => openFindIt(q, card));
            return;
        }

        if (type === 'draaislot') {
            card.innerHTML = label + qtext + dialHtml(q.answer_len || 4) +
                '<div class="er-q-feedback"></div>';
            const feedback = card.querySelector('.er-q-feedback');
            wireDial(card, q.answer_len || 4, async (val) => {
                const ok = await serverCheck(q, val);
                if (ok === null) return false;
                if (ok) { onCorrect(q, card); return true; }
                feedback.textContent = 'Helaas, probeer het nog eens!';
                card.classList.add('er-wrong');
                setTimeout(() => card.classList.remove('er-wrong'), 600);
                return false;
            });
            return;
        }

        const isLock = isLockType(type);
        card.innerHTML = label + qtext +
            (isLock
                ? lockHtml(q.answer_len || 4, type) +
                  '<div class="er-q-answer er-q-lock-row"><button class="er-btn">Controleer</button></div>'
                : isDateType(type)
                ? dateHtml(type, 'Controleer')
                : '<div class="er-q-answer">' +
                      '<input type="text" placeholder="Jullie antwoord..." autocomplete="off">' +
                      '<button class="er-btn">Controleer</button>' +
                  '</div>') +
            '<div class="er-q-feedback"></div>';

        if (isLock) wireLock(card);
        const input = card.querySelector('input[type="text"]');
        const checkBtn = card.querySelector('.er-q-answer .er-btn');
        const feedback = card.querySelector('.er-q-feedback');

        async function check() {
            if (busy) return;
            const value = isLock ? lockValue(card)
                : isDateType(type) ? dateValue(card, type)
                : (input ? input.value : '');
            busy = true;
            checkBtn.disabled = true;
            const ok = await serverCheck(q, value);
            busy = false;
            checkBtn.disabled = false;
            if (ok === null) return;
            if (ok) {
                onCorrect(q, card);
            } else {
                feedback.textContent = 'Helaas, probeer het nog eens!';
                card.classList.add('er-wrong');
                setTimeout(() => card.classList.remove('er-wrong'), 600);
            }
        }
        checkBtn.addEventListener('click', check);
        if (input) input.addEventListener('keydown', (e) => { if (e.key === 'Enter') check(); });
    }

    function refreshLockedCards() {
        grid.querySelectorAll('.er-play-card.er-locked:not(.er-cooldown)').forEach(card => {
            const pos = parseInt(card.dataset.position, 10);
            const q = normals.find(x => x.position === pos);
            if (q && !isUnlocked(pos) && !answered.has(pos)) renderQuestionCard(card, q);
        });
    }

    // ---------- Finale ----------
    function goldSlotsHtml() {
        let html = '<div class="er-finale-slots">';
        for (let i = 1; i <= GOLD_NEEDED; i++) {
            html += '<span class="er-finale-slot' + (goldKeys() >= i ? ' filled' : '') + '">\u{1F511}</span>';
        }
        html += '</div>';
        return html;
    }

    function renderFinaleSection() {
        if (!finale) { finaleSection.style.display = 'none'; return; }
        finaleSection.style.display = '';

        if (answered.has(finale.position)) {
            finaleSection.className = 'er-finale-section er-finale-done';
            finaleSection.innerHTML =
                '<div class="er-finale-label">&#127942; DE FINALE</div>' +
                '<div class="er-finale-q">' + escapeHtml(finale.question) + '</div>' +
                '<div class="er-finale-done-text">&#127881; Gekraakt — de room is uitgespeeld!</div>';
            return;
        }

        if (!finaleUnlocked) {
            const canOpen = goldKeys() >= GOLD_NEEDED;
            finaleSection.className = 'er-finale-section er-finale-locked';
            finaleSection.innerHTML =
                '<div class="er-finale-label">&#127942; DE FINALE</div>' +
                '<div class="er-finale-locked-row">' +
                    '<span class="er-finale-lock">&#128274;</span>' +
                    '<div class="er-finale-locked-text">' +
                        '<strong>De grote finale zit op slot.</strong>' +
                        '<span>De laatste twee goede antwoorden leveren gouden sleutels op &mdash; verzamel er ' + GOLD_NEEDED + ' om de finale te openen.</span>' +
                    '</div>' +
                    goldSlotsHtml() +
                    '<button class="er-btn er-finale-open-btn"' + (canOpen ? '' : ' disabled') + '>&#128273; Open de finale</button>' +
                '</div>';

            finaleSection.querySelector('.er-finale-open-btn').addEventListener('click', async () => {
                if (goldKeys() < GOLD_NEEDED || busy) return;
                busy = true;
                const res = await call('unlock', { position: 'finale' });
                busy = false;
                if (!res.ok) { if (res.timeUp) onTimeUp(); return; }
                syncTeamState(res);
                updateStatus();
                renderFinaleSection();
            });
            return;
        }

        finaleSection.className = 'er-finale-section er-finale-open';
        const ftype = finale.question_type || 'text';

        if (ftype === 'draaislot') {
            finaleSection.innerHTML =
                '<div class="er-finale-label">&#127942; DE FINALE</div>' +
                '<div class="er-finale-q">' + escapeHtml(finale.question) + '</div>' +
                dialHtml(finale.answer_len || 4) +
                '<div class="er-q-feedback"></div>';
            const dialFeedback = finaleSection.querySelector('.er-q-feedback');
            wireDial(finaleSection, finale.answer_len || 4, async (val) => {
                const ok = await serverCheck(finale, val);
                if (ok === null) return false;
                if (ok) { onFinaleCracked(); return true; }
                dialFeedback.textContent = 'Helaas, probeer het nog eens!';
                finaleSection.classList.add('er-wrong');
                setTimeout(() => finaleSection.classList.remove('er-wrong'), 600);
                return false;
            });
            return;
        }

        const isLock = isLockType(ftype);
        finaleSection.innerHTML =
            '<div class="er-finale-label">&#127942; DE FINALE</div>' +
            '<div class="er-finale-q">' + escapeHtml(finale.question) + '</div>' +
            (isLock
                ? lockHtml(finale.answer_len || 4, ftype) +
                  '<div class="er-q-answer er-finale-answer er-q-lock-row"><button class="er-btn">Kraak de finale</button></div>'
                : isDateType(ftype)
                ? dateHtml(ftype, 'Kraak de finale', 'er-finale-answer')
                : '<div class="er-q-answer er-finale-answer">' +
                      '<input type="text" placeholder="Jullie antwoord op de finale..." autocomplete="off">' +
                      '<button class="er-btn">Kraak de finale</button>' +
                  '</div>') +
            '<div class="er-q-feedback"></div>';

        if (isLock) wireLock(finaleSection);
        const input = finaleSection.querySelector('input[type="text"]');
        const btn = finaleSection.querySelector('.er-q-answer .er-btn');
        const feedback = finaleSection.querySelector('.er-q-feedback');

        async function check() {
            if (busy) return;
            const value = isLock ? lockValue(finaleSection)
                : isDateType(ftype) ? dateValue(finaleSection, ftype)
                : (input ? input.value : '');
            busy = true;
            btn.disabled = true;
            const ok = await serverCheck(finale, value);
            busy = false;
            btn.disabled = false;
            if (ok === null) return;
            if (ok) {
                onFinaleCracked();
            } else {
                feedback.textContent = 'Helaas, probeer het nog eens!';
                finaleSection.classList.add('er-wrong');
                setTimeout(() => finaleSection.classList.remove('er-wrong'), 600);
            }
        }
        btn.addEventListener('click', check);
        if (input) input.addEventListener('keydown', (e) => { if (e.key === 'Enter') check(); });
    }

    function onFinaleCracked() {
        answered.add(finale.position);
        finished = true;
        stopClock();
        updateStatus();
        renderFinaleSection();
        victoryTime.textContent = startedAtMs
            ? 'Jullie tijd: ' + fmt(elapsedSec())
            : 'Alle vragen goed beantwoord — knap gedaan!';
        victory.classList.add('active');
        launchConfetti();
        victoryChime();
    }

    // ---------- Grid opbouwen ----------
    function renderTimerCard(card) {
        card.innerHTML =
            '<div class="er-card-label">&#9201;&#65039; Timer' +
                (timeLimitMin ? ' &middot; ' + timeLimitMin + ' min' : '') +
            '</div>' +
            '<div class="er-timer-display" id="erTimerDisplay">--:--</div>' +
            '<div class="er-timer-hint">De juf of meester beheert de tijd.</div>';
        updateClock();
    }

    function buildGrid() {
        grid.innerHTML = '';
        const cells = [];
        const q1 = normals.find(q => q.position === 1);
        const q2 = normals.find(q => q.position === 2);
        if (q1) cells.push({ type: 'q', q: q1 });
        cells.push({ type: 'timer' });
        if (q2) cells.push({ type: 'q', q: q2 });
        normals.filter(q => q.position > 2).forEach(q => cells.push({ type: 'q', q: q }));

        cells.forEach(cell => {
            const card = document.createElement('div');
            card.className = 'er-play-card';
            if (cell.type === 'timer') {
                card.classList.add('er-timer-card');
                renderTimerCard(card);
            } else {
                renderQuestionCard(card, cell.q);
            }
            grid.appendChild(card);
        });

        renderFinaleSection();
    }

    // ---------- Spel binnengaan (vragen ophalen) ----------
    async function enterGame() {
        const res = await call('questions');
        if (!res.ok) return;
        syncSessionInfo(res);
        syncTeamState(res);
        if (!res.questions) return; // nog niet aan het spelen

        questions = res.questions;
        const finalePos = Math.max.apply(null, questions.map(q => q.position));
        finale = questions.find(q => q.position === finalePos) || null;
        normals = questions.filter(q => q.position !== finalePos);
        prevSilverGranted = silverGranted();

        heroTeam.textContent = 'Team: ' + teamName;
        statusbar.style.display = '';
        updateStatus();
        showGame();
        buildGrid();
        startClock();

        if (res.timeUp && !finished) onTimeUp();
        if (finished) {
            victoryTime.textContent = 'Jullie hebben de room al uitgespeeld!';
            victory.classList.add('active');
        }
    }

    // ---------- Aanmelden ----------
    async function doJoin() {
        if (busy) return;
        hideErr(joinError);
        code = (codeInput.value || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
        teamName = (nameInput.value || '').trim();
        if (code.length < 4) { showErr(joinError, 'Vul de code van het bord in.'); return; }
        if (!teamName) { showErr(joinError, 'Vul een teamnaam in.'); return; }

        busy = true; joinBtn.disabled = true; joinBtn.textContent = 'Even kijken…';
        const res = await call('join', { teamName: teamName });
        busy = false; joinBtn.disabled = false; joinBtn.innerHTML = 'Doe mee &rarr;';

        if (!res.ok) { showErr(joinError, res.error || 'Er ging iets mis.'); return; }
        if (!res.exists) { showErr(joinError, 'Deze code klopt niet. Kijk nog eens op het bord.'); return; }
        if (res.status === 'closed') { showScreen('closed'); return; }
        if (!res.teamId) { showErr(joinError, 'Aanmelden lukte niet. Probeer opnieuw.'); return; }

        teamId = res.teamId;
        syncSessionInfo(res);
        save();
        status = res.status;
        startPolling();

        if (res.status === 'playing') {
            await enterGame();
        } else {
            lobbyHi.textContent = 'Jullie doen mee, ' + teamName + '!';
            lobbyRoom.textContent = res.roomTitle ? 'Escape room: ' + res.roomTitle : '';
            showScreen('lobby');
        }
    }

    // ---------- Init ----------
    function init() {
        const params = new URLSearchParams(location.search);
        const urlCode = (params.get('code') || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
        const urlName = (params.get('naam') || '').trim();
        if (urlCode) codeInput.value = urlCode;
        if (urlName) nameInput.value = urlName;

        codeInput.addEventListener('input', () => {
            codeInput.value = codeInput.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        });
        joinBtn.addEventListener('click', doJoin);
        nameInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') doJoin(); });

        // Eerder aangemeld in deze sessie? (refresh)
        const saved = restore();
        if (saved && saved.teamId && (!urlCode || urlCode === saved.code)) {
            code = saved.code; teamId = saved.teamId; teamName = saved.teamName || '';
            call('status').then(async res => {
                if (res && res.ok && res.exists && res.status !== 'closed') {
                    syncSessionInfo(res);
                    status = res.status;
                    startPolling();
                    if (res.status === 'playing') {
                        await enterGame();
                    } else {
                        lobbyHi.textContent = 'Jullie doen mee, ' + teamName + '!';
                        lobbyRoom.textContent = res.roomTitle ? 'Escape room: ' + res.roomTitle : '';
                        showScreen('lobby');
                    }
                } else if (res && res.exists && res.status === 'closed') {
                    showScreen('closed');
                    clearStore();
                } else {
                    clearStore();
                }
            });
        } else if (urlCode && urlName) {
            // Doorgestuurd vanaf /meedoen: meteen aanmelden
            doJoin();
        } else if (urlCode) {
            nameInput.focus();
        }
    }

    init();
})();

/* ============================================
   ESCAPE ROOMS - Speelpagina (room-template)
   Versie: v0.0.4

   Opbouw: hero, 3x5 grid (vraag 1, timer, vraag 2, rest gelockt)
   en de finale als volle-breedte sectie.

   Vraagtypes:
   - text (open vraag): antwoord typen
   - cijferslot: draaiwielen 0-9, start op 0000...
   - letterslot: draaiwielen A-Z, start op AAAA...
   - meerkeuze: knoppen; fout gekozen = kaart 1 minuut op slot (straf)
   - schuifpuzzel: afbeelding in 3x3/4x4 tegels schuiven (in een popup);
     oplossen = goed antwoord. Gehusseld met geldige zetten, dus altijd
     oplosbaar; het lege vak start rechtsboven.

   Spelregels:
   - Vragen zijn pas speelbaar zodra de timer loopt; pauze zet ze weer
     op slot. Met tijdslimiet telt de timer af; 00:00 = spel voorbij.
   - Eerste 12 goede antwoorden geven zilver (precies genoeg voor de
     gelockte kaarten), de laatste twee goud; finale opent met 2 goud.
   - Goed antwoord: sleutel-animatie + pingeltje; uitspelen = confetti.
   - Het kleurthema van de room (standaard/halloween/kerst/ruimte)
     kleurt hero, timerkaart en finale mee.
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('erPlayGrid');
    if (!grid) return;

    const hero = document.getElementById('erHero');
    const heroTitle = document.getElementById('erHeroTitle');
    const heroDesc = document.getElementById('erHeroDesc');
    const heroMeta = document.getElementById('erHeroMeta');
    const pageTitle = document.getElementById('erPageTitle');
    const statusbar = document.getElementById('erStatusbar');
    const keyCountEl = document.getElementById('erKeyCount');
    const goldCountEl = document.getElementById('erGoldCount');
    const answerCountEl = document.getElementById('erAnswerCount');
    const totalCountEl = document.getElementById('erTotalCount');
    const finaleSection = document.getElementById('erFinaleSection');
    const victory = document.getElementById('erVictory');
    const victoryTime = document.getElementById('erVictoryTime');
    const reviewStars = document.getElementById('erReviewStars');
    const reviewThanks = document.getElementById('erReviewThanks');
    const puzzleModal = document.getElementById('erPuzzleModal');
    const puzzleTitle = document.getElementById('erPuzzleTitle');
    const puzzleBoard = document.getElementById('erPuzzleBoard');
    const puzzleStatus = document.getElementById('erPuzzleStatus');

    const GOLD_NEEDED = 2;
    const COOLDOWN_MS = 60000; // strafminuut bij foute meerkeuze-gok

    // ---------- State ----------
    let room = null;
    let normals = [];
    let finale = null;
    let silverKeys = 0;
    let goldKeys = 0;
    let silverGranted = 0;
    let finaleUnlocked = false;
    const unlocked = new Set();
    const answered = new Set();
    const cooldowns = {};     // pos -> timestamp (ms) tot wanneer op slot
    const choiceCache = {};   // pos -> gehusselde meerkeuze-opties
    const puzzles = {};       // pos -> { size, board } schuifpuzzel-state
    let currentPuzzle = null; // { q, card } van de open puzzel-popup

    // Timer
    let timerInterval = null;
    let timerSeconds = 0;
    let timerRunning = false;
    let timerStarted = false;
    let timeLimitSec = null;

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str == null ? '' : String(str);
        return div.innerHTML;
    }

    function attrUrl(url) {
        return String(url || '').replace(/"/g, '%22');
    }

    function normalize(s) {
        return String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');
    }

    function groupLabel(g) {
        return g ? 'Groep ' + g : '';
    }

    function silverNeededTotal() {
        return Math.max(0, normals.length - 2);
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

    // ---------- Status ----------
    function updateStatus() {
        keyCountEl.textContent = silverKeys;
        goldCountEl.textContent = goldKeys;
        answerCountEl.textContent = answered.size;
        totalCountEl.textContent = normals.length + (finale ? 1 : 0);
    }

    // ---------- Timer ----------
    function timerText() {
        const t = Math.max(0, timerSeconds);
        const m = Math.floor(t / 60);
        const s = t % 60;
        return (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
    }

    function elapsedText() {
        const elapsed = timeLimitSec !== null ? timeLimitSec - Math.max(0, timerSeconds) : timerSeconds;
        const m = Math.floor(elapsed / 60);
        const s = elapsed % 60;
        return (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
    }

    function updateTimerDisplay() {
        const d = document.getElementById('erTimerDisplay');
        if (!d) return;
        d.textContent = timerText();
        d.classList.toggle('er-timer-low', timeLimitSec !== null && timerSeconds <= 60);
    }

    function tick() {
        if (timeLimitSec !== null) {
            timerSeconds--;
            updateTimerDisplay();
            if (timerSeconds <= 0) timesUp();
        } else {
            timerSeconds++;
            updateTimerDisplay();
        }
    }

    function startTimer() {
        if (timerRunning) return;
        timerRunning = true;
        timerStarted = true;
        timerInterval = setInterval(tick, 1000);
        refreshAll();
    }

    function pauseTimer() {
        timerRunning = false;
        clearInterval(timerInterval);
        closePuzzle();
        refreshAll();
    }

    function stopTimer() {
        timerRunning = false;
        timerStarted = false;
        clearInterval(timerInterval);
        timerSeconds = timeLimitSec !== null ? timeLimitSec : 0;
        closePuzzle();
        refreshAll();
    }

    function timesUp() {
        timerRunning = false;
        clearInterval(timerInterval);
        timerSeconds = 0;
        updateTimerDisplay();
        closePuzzle();
        document.getElementById('erTimesUp').classList.add('active');
    }

    function renderTimerCard(card) {
        card.innerHTML =
            '<div class="er-card-label">&#9201;&#65039; Timer' +
                (timeLimitSec !== null ? ' &middot; ' + Math.round(timeLimitSec / 60) + ' min' : '') +
            '</div>' +
            '<div class="er-timer-display" id="erTimerDisplay">' + timerText() + '</div>' +
            '<div class="er-timer-controls">' +
            (timerRunning
                ? '<button class="er-btn er-btn-secondary" id="erTimerPause">&#9208;&#65039; Pauze</button>' +
                  '<button class="er-btn er-btn-secondary" id="erTimerStop">&#9209;&#65039; Stop</button>'
                : '<button class="er-btn" id="erTimerStart">&#9654;&#65039; ' + (timerStarted ? 'Verder' : 'Start') + '</button>' +
                  (timerStarted ? '<button class="er-btn er-btn-secondary" id="erTimerStop">&#9209;&#65039; Stop</button>' : '')) +
            '</div>' +
            (!timerStarted ? '<div class="er-timer-hint">De vragen gaan open zodra de timer loopt.</div>' : '');

        updateTimerDisplay();
        const startBtn = card.querySelector('#erTimerStart');
        const pauseBtn = card.querySelector('#erTimerPause');
        const stopBtn = card.querySelector('#erTimerStop');
        if (startBtn) startBtn.addEventListener('click', startTimer);
        if (pauseBtn) pauseBtn.addEventListener('click', pauseTimer);
        if (stopBtn) stopBtn.addEventListener('click', stopTimer);
    }

    // ---------- Sleutels ----------
    function grantKey(fromEl) {
        if (silverGranted < silverNeededTotal()) {
            silverGranted++;
            silverKeys++;
            flyKey(fromEl, 'silver');
        } else {
            goldKeys++;
            flyKey(fromEl, 'gold');
        }
        pling();
        updateStatus();
    }

    function flyKey(fromEl, type) {
        const target = document.querySelector(type === 'gold' ? '.er-status-gold' : '.er-status-keys');
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

    function lockAnswer(q) {
        return String(q.answer).trim().toUpperCase();
    }

    // ---------- Meerkeuze ----------
    function choicesFor(q) {
        if (!choiceCache[q.position]) {
            const all = [String(q.answer)].concat(Array.isArray(q.options) ? q.options.map(String) : []);
            for (let i = all.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                const tmp = all[i]; all[i] = all[j]; all[j] = tmp;
            }
            choiceCache[q.position] = all;
        }
        return choiceCache[q.position];
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

    // board[cel] = tegel-id; tegel (size-1) is het lege vak (rechtsboven
    // in de opgeloste stand). Husselen met geldige zetten = altijd oplosbaar.
    function newPuzzleBoard(size) {
        const n = size * size;
        let board, emptyCell;
        do {
            board = [];
            for (let i = 0; i < n; i++) board.push(i);
            emptyCell = size - 1;
            let prev = -1;
            const moves = size === 4 ? 180 : 90;
            for (let m = 0; m < moves; m++) {
                const nb = puzzleNeighbors(emptyCell, size).filter(x => x !== prev);
                const pick = nb[Math.floor(Math.random() * nb.length)];
                board[emptyCell] = board[pick];
                board[pick] = size - 1;
                prev = emptyCell;
                emptyCell = pick;
            }
            // Leeg vak terug naar rechtsboven (ook met geldige zetten)
            while (Math.floor(emptyCell / size) > 0) {
                const up = emptyCell - size;
                board[emptyCell] = board[up]; board[up] = size - 1; emptyCell = up;
            }
            while (emptyCell % size < size - 1) {
                const right = emptyCell + 1;
                board[emptyCell] = board[right]; board[right] = size - 1; emptyCell = right;
            }
        } while (board.every((v, i) => v === i)); // per ongeluk al opgelost? opnieuw
        return board;
    }

    function puzzleSolved(board) {
        return board.every((v, i) => v === i);
    }

    function openPuzzle(q, card) {
        const size = q.puzzle_size === 4 ? 4 : 3;
        if (!puzzles[q.position]) puzzles[q.position] = { size: size, board: newPuzzleBoard(size) };
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

    function onPuzzleSolved() {
        if (!currentPuzzle) return;
        const q = currentPuzzle.q;
        const card = currentPuzzle.card;
        puzzleStatus.textContent = 'Opgelost! \u{1F389}';
        puzzleBoard.classList.add('er-puzzle-win');
        setTimeout(() => {
            puzzleBoard.classList.remove('er-puzzle-win');
            closePuzzle();
            answered.add(q.position);
            renderQuestionCard(card, q);
            grantKey(card);
            refreshLockedCards();
            renderFinaleSection();
        }, 900);
    }

    document.getElementById('erPuzzleClose')?.addEventListener('click', closePuzzle);
    puzzleModal?.addEventListener('click', (e) => { if (e.target === puzzleModal) closePuzzle(); });

    // ---------- Antwoord-controle ----------
    function isCorrect(q, container) {
        if (isLockType(q.question_type)) return lockValue(container) === lockAnswer(q);
        const input = container.querySelector('input');
        return normalize(input ? input.value : '') === normalize(q.answer);
    }

    // ---------- Normale vraagkaarten ----------
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

        if (!timerRunning && unlocked.has(pos)) {
            card.classList.add('er-locked');
            card.innerHTML =
                '<div class="er-card-label">Vraag ' + pos + '</div>' +
                '<div class="er-locked-icon">&#9203;</div>' +
                '<div class="er-locked-text">' +
                    (timerStarted ? 'De timer staat stil — druk op verder.' : 'Start de timer om te beginnen!') +
                '</div>';
            return;
        }

        if (!unlocked.has(pos)) {
            card.classList.add('er-locked');
            card.innerHTML =
                '<div class="er-card-label">Vraag ' + pos + '</div>' +
                '<div class="er-locked-icon">&#128274;</div>' +
                '<div class="er-locked-text">Deze kaart zit op slot.</div>' +
                '<button class="er-btn er-unlock-btn"' + ((silverKeys < 1 || !timerRunning) ? ' disabled' : '') + '>' +
                    '&#128477;&#65039; Open met zilveren sleutel' +
                '</button>';

            card.querySelector('.er-unlock-btn').addEventListener('click', () => {
                if (silverKeys < 1 || !timerRunning) return;
                silverKeys--;
                unlocked.add(pos);
                updateStatus();
                renderQuestionCard(card, q);
                refreshLockedCards();
            });
            return;
        }

        // Strafminuut na een foute meerkeuze-gok
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

        // Speelbare vraag: weergave per vraagtype
        const type = q.question_type || 'text';
        const label = '<div class="er-card-label">Vraag ' + pos +
            (isLockType(type) ? ' &middot; &#128272;' : type === 'meerkeuze' ? ' &middot; A/B/C' : type === 'schuifpuzzel' ? ' &middot; &#129513;' : '') +
            '</div>';
        const qtext = '<div class="er-q-text">' + escapeHtml(q.question) + '</div>';

        if (type === 'meerkeuze') {
            card.innerHTML = label + qtext +
                '<div class="er-mc-options">' +
                choicesFor(q).map(c => '<button class="er-mc-btn">' + escapeHtml(c) + '</button>').join('') +
                '</div>' +
                '<div class="er-q-feedback"></div>';
            card.querySelectorAll('.er-mc-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    if (normalize(btn.textContent) === normalize(q.answer)) {
                        answered.add(pos);
                        renderQuestionCard(card, q);
                        grantKey(card);
                        refreshLockedCards();
                        renderFinaleSection();
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

        const isLock = isLockType(type);
        card.innerHTML = label + qtext +
            (isLock
                ? lockHtml(lockAnswer(q).length, type) +
                  '<div class="er-q-answer er-q-lock-row"><button class="er-btn">Controleer</button></div>'
                : '<div class="er-q-answer">' +
                      '<input type="text" placeholder="Jouw antwoord..." autocomplete="off">' +
                      '<button class="er-btn">Controleer</button>' +
                  '</div>') +
            '<div class="er-q-feedback"></div>';

        if (isLock) wireLock(card);
        const input = card.querySelector('input');
        const checkBtn = card.querySelector('.er-q-answer .er-btn');
        const feedback = card.querySelector('.er-q-feedback');

        function check() {
            if (isCorrect(q, card)) {
                answered.add(pos);
                renderQuestionCard(card, q);
                grantKey(card);
                refreshLockedCards();
                renderFinaleSection();
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
            if (q && !unlocked.has(pos) && !answered.has(pos)) renderQuestionCard(card, q);
        });
    }

    function refreshAll() {
        grid.querySelectorAll('.er-play-card').forEach(card => {
            if (card.classList.contains('er-timer-card')) {
                renderTimerCard(card);
            } else {
                const pos = parseInt(card.dataset.position, 10);
                const q = normals.find(x => x.position === pos);
                if (q) renderQuestionCard(card, q);
            }
        });
        renderFinaleSection();
    }

    // ---------- Finale (volle breedte) ----------
    function goldSlotsHtml() {
        let html = '<div class="er-finale-slots">';
        for (let i = 1; i <= GOLD_NEEDED; i++) {
            html += '<span class="er-finale-slot' + (goldKeys >= i ? ' filled' : '') + '">\u{1F511}</span>';
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
            const canOpen = goldKeys >= GOLD_NEEDED && timerRunning;
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

            finaleSection.querySelector('.er-finale-open-btn').addEventListener('click', () => {
                if (goldKeys < GOLD_NEEDED || !timerRunning) return;
                goldKeys -= GOLD_NEEDED;
                finaleUnlocked = true;
                updateStatus();
                renderFinaleSection();
                const inp = finaleSection.querySelector('input');
                if (inp) inp.focus();
            });
            return;
        }

        if (!timerRunning) {
            finaleSection.className = 'er-finale-section er-finale-locked';
            finaleSection.innerHTML =
                '<div class="er-finale-label">&#127942; DE FINALE</div>' +
                '<div class="er-finale-locked-row">' +
                    '<span class="er-finale-lock">&#9203;</span>' +
                    '<div class="er-finale-locked-text"><strong>' +
                        (timerStarted ? 'De timer staat stil — druk op verder.' : 'Start de timer om te beginnen!') +
                    '</strong></div>' +
                '</div>';
            return;
        }

        finaleSection.className = 'er-finale-section er-finale-open';
        const isLock = isLockType(finale.question_type);
        finaleSection.innerHTML =
            '<div class="er-finale-label">&#127942; DE FINALE</div>' +
            '<div class="er-finale-q">' + escapeHtml(finale.question) + '</div>' +
            (isLock
                ? lockHtml(lockAnswer(finale).length, finale.question_type) +
                  '<div class="er-q-answer er-finale-answer er-q-lock-row"><button class="er-btn">Kraak de finale</button></div>'
                : '<div class="er-q-answer er-finale-answer">' +
                      '<input type="text" placeholder="Jullie antwoord op de finale..." autocomplete="off">' +
                      '<button class="er-btn">Kraak de finale</button>' +
                  '</div>') +
            '<div class="er-q-feedback"></div>';

        if (isLock) wireLock(finaleSection);
        const input = finaleSection.querySelector('input');
        const btn = finaleSection.querySelector('.er-q-answer .er-btn');
        const feedback = finaleSection.querySelector('.er-q-feedback');

        function check() {
            if (isCorrect(finale, finaleSection)) {
                answered.add(finale.position);
                updateStatus();
                renderFinaleSection();
                showVictory();
            } else {
                feedback.textContent = 'Helaas, probeer het nog eens!';
                finaleSection.classList.add('er-wrong');
                setTimeout(() => finaleSection.classList.remove('er-wrong'), 600);
            }
        }
        btn.addEventListener('click', check);
        if (input) input.addEventListener('keydown', (e) => { if (e.key === 'Enter') check(); });
    }

    // ---------- Victory ----------
    function showVictory() {
        if (timerRunning) {
            clearInterval(timerInterval);
            timerRunning = false;
        }
        victoryTime.textContent = timerStarted
            ? 'Jullie tijd: ' + elapsedText()
            : 'Alle vragen goed beantwoord — knap gedaan!';
        victory.classList.add('active');
        launchConfetti();
        victoryChime();
    }

    reviewStars.addEventListener('click', async (e) => {
        const btn = e.target.closest('button[data-star]');
        if (!btn) return;
        const rating = parseInt(btn.dataset.star, 10);

        reviewStars.querySelectorAll('button').forEach(b => {
            b.innerHTML = parseInt(b.dataset.star, 10) <= rating ? '&#9733;' : '&#9734;';
            b.classList.toggle('filled', parseInt(b.dataset.star, 10) <= rating);
        });

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session || !room) return;
            await supabase
                .from('escaperoom_reviews')
                .upsert({ room_id: room.id, user_id: session.user.id, rating: rating }, { onConflict: 'room_id,user_id' });
            reviewThanks.style.display = 'block';
        } catch (err) {
            console.error('Review opslaan mislukt:', err);
        }
    });

    // ---------- Grid opbouwen ----------
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

    // ---------- Laden ----------
    async function load() {
        const roomId = new URLSearchParams(window.location.search).get('room');
        if (!roomId) {
            heroTitle.textContent = 'Geen room gekozen';
            heroDesc.textContent = 'Ga terug naar het overzicht en kies een escape room.';
            return;
        }

        try {
            const [roomRes, qRes] = await Promise.all([
                supabase.from('escaperooms')
                    .select('id, title, description, image_url, category, suitable_for, time_limit_minutes, theme')
                    .eq('id', roomId)
                    .single(),
                supabase.from('escaperoom_questions')
                    .select('id, position, question, answer, question_type, options, image_url, puzzle_size')
                    .eq('room_id', roomId)
                    .order('position')
            ]);

            if (!roomRes.data) throw new Error('Room niet gevonden');
            room = roomRes.data;
            const questions = qRes.data || [];

            if (!questions.length) {
                heroTitle.textContent = room.title;
                heroDesc.textContent = 'Deze room heeft nog geen vragen.';
                return;
            }

            // Kleurthema van de room
            if (room.theme && room.theme !== 'standaard') {
                document.body.classList.add('er-theme-' + room.theme);
            }

            const finalePos = Math.max.apply(null, questions.map(q => q.position));
            finale = questions.find(q => q.position === finalePos) || null;
            normals = questions.filter(q => q.position !== finalePos);

            if (room.time_limit_minutes > 0) {
                timeLimitSec = room.time_limit_minutes * 60;
                timerSeconds = timeLimitSec;
            }

            unlocked.add(1);
            unlocked.add(2);

            pageTitle.textContent = room.title;
            document.title = 'Meestertools - ' + room.title;
            heroTitle.textContent = room.title;
            heroDesc.textContent = room.description || '';
            heroMeta.innerHTML =
                (room.category ? '<span class="er-badge er-badge-cat">' + escapeHtml(room.category) + '</span>' : '') +
                (room.suitable_for ? '<span class="er-badge er-badge-group">' + groupLabel(room.suitable_for) + '</span>' : '');
            if (room.image_url) {
                hero.style.backgroundImage = 'url("' + attrUrl(room.image_url) + '")';
            }

            statusbar.style.display = '';
            updateStatus();
            buildGrid();
        } catch (err) {
            console.error('Escape room laden mislukt:', err);
            heroTitle.textContent = 'Room niet gevonden';
            heroDesc.textContent = 'Deze escape room bestaat niet (meer) of is niet gepubliceerd.';
        }
    }

    load();
});

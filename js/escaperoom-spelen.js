/* ============================================
   ESCAPE ROOMS - Speelpagina (room-template)
   Versie: v0.0.3

   Elke room heeft dezelfde opbouw:
   - Hero met afbeelding en titel/omschrijving-overlay.
   - 3x5 grid: kaart 1 = vraag 1, kaart 2 = timer, kaart 3 = vraag 2,
     daarna de overige normale vragen (gelockt).
   - Daaronder de FINALE als sectie over de volle breedte.

   Spelregels:
   - Vragen zijn pas speelbaar zodra de timer loopt (geen stiekem
     voorlezen); pauzeren zet de vragen ook weer op slot.
   - Met een tijdslimiet (instelbaar per room) telt de timer af;
     op 00:00 is het spel voorbij. Zonder limiet is het een stopwatch.
   - Een goed antwoord op een normale vraag levert een ZILVEREN sleutel
     op (🗝️) waarmee je een gelockte normale kaart opent. De economie
     klopt precies: de eerste (aantal gelockte kaarten) goede antwoorden
     geven zilver, daarna is zilver niet meer nodig.
   - De laatste twee goede antwoorden leveren elk een GOUDEN sleutel
     op (🔑); met 2 gouden sleutels open je de finale.
   - Finale goed beantwoord = room uitgespeeld (+ review van 1-5 sterren).
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

    const GOLD_NEEDED = 2;

    // ---------- State ----------
    let room = null;
    let normals = [];            // normale vragen (gesorteerd op position)
    let finale = null;           // de finalevraag (hoogste position)
    let silverKeys = 0;
    let goldKeys = 0;
    let silverGranted = 0;       // totaal uitgereikte zilveren sleutels
    let finaleUnlocked = false;
    const unlocked = new Set();  // posities van normale vragen die open zijn
    const answered = new Set();  // posities die goed beantwoord zijn (incl. finale)

    // Timer
    let timerInterval = null;
    let timerSeconds = 0;        // resterend (aftellen) of verstreken (stopwatch)
    let timerRunning = false;
    let timerStarted = false;
    let timeLimitSec = null;

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str == null ? '' : String(str);
        return div.innerHTML;
    }

    function normalize(s) {
        return String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');
    }

    function groupLabel(g) {
        return g ? 'Groep ' + g : '';
    }

    // Zoveel zilveren sleutels zijn er in totaal nodig (= gelockte kaarten);
    // daarna leveren goede antwoorden goud op.
    function silverNeededTotal() {
        return Math.max(0, normals.length - 2);
    }

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
        refreshAll();
    }

    function stopTimer() {
        timerRunning = false;
        timerStarted = false;
        clearInterval(timerInterval);
        timerSeconds = timeLimitSec !== null ? timeLimitSec : 0;
        refreshAll();
    }

    function timesUp() {
        timerRunning = false;
        clearInterval(timerInterval);
        timerSeconds = 0;
        updateTimerDisplay();
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
    // Goed antwoord op een normale vraag: zilver zolang er zilver nodig is,
    // daarna goud (de laatste twee antwoorden).
    function grantKey(fromEl) {
        if (silverGranted < silverNeededTotal()) {
            silverGranted++;
            silverKeys++;
            flyKey(fromEl, 'silver');
        } else {
            goldKeys++;
            flyKey(fromEl, 'gold');
        }
        updateStatus();
    }

    // Sleutel-animatie: vliegt van de kaart naar de juiste teller in de
    // statusbalk en vervaagt daar.
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

        // Timer loopt niet: onbeantwoorde open vragen zijn gefaded
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

        // Open vraag: tekst + antwoordveld + controleknop
        card.innerHTML =
            '<div class="er-card-label">Vraag ' + pos + '</div>' +
            '<div class="er-q-text">' + escapeHtml(q.question) + '</div>' +
            '<div class="er-q-answer">' +
                '<input type="text" placeholder="Jouw antwoord..." autocomplete="off">' +
                '<button class="er-btn">Controleer</button>' +
            '</div>' +
            '<div class="er-q-feedback"></div>';

        const input = card.querySelector('input');
        const checkBtn = card.querySelector('.er-q-answer .er-btn');
        const feedback = card.querySelector('.er-q-feedback');

        function check() {
            if (normalize(input.value) === normalize(q.answer)) {
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
        input.addEventListener('keydown', (e) => { if (e.key === 'Enter') check(); });
    }

    function refreshLockedCards() {
        grid.querySelectorAll('.er-play-card.er-locked').forEach(card => {
            const pos = parseInt(card.dataset.position, 10);
            const q = normals.find(x => x.position === pos);
            if (q && !unlocked.has(pos) && !answered.has(pos)) renderQuestionCard(card, q);
        });
    }

    // Alles opnieuw opbouwen (na start/pauze/stop van de timer)
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

        // Finale open, timer moet wel lopen
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
        finaleSection.innerHTML =
            '<div class="er-finale-label">&#127942; DE FINALE</div>' +
            '<div class="er-finale-q">' + escapeHtml(finale.question) + '</div>' +
            '<div class="er-q-answer er-finale-answer">' +
                '<input type="text" placeholder="Jullie antwoord op de finale..." autocomplete="off">' +
                '<button class="er-btn">Kraak de finale</button>' +
            '</div>' +
            '<div class="er-q-feedback"></div>';

        const input = finaleSection.querySelector('input');
        const btn = finaleSection.querySelector('.er-q-answer .er-btn');
        const feedback = finaleSection.querySelector('.er-q-feedback');

        function check() {
            if (normalize(input.value) === normalize(finale.answer)) {
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
        input.addEventListener('keydown', (e) => { if (e.key === 'Enter') check(); });
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

        // Gridvolgorde: vraag 1, timer, vraag 2, dan de rest (zonder finale)
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
                    .select('id, title, description, image_url, category, suitable_for, time_limit_minutes')
                    .eq('id', roomId)
                    .single(),
                supabase.from('escaperoom_questions')
                    .select('id, position, question, answer, question_type')
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

            // Hoogste positie = finale; de rest zijn normale vragen
            const finalePos = Math.max.apply(null, questions.map(q => q.position));
            finale = questions.find(q => q.position === finalePos) || null;
            normals = questions.filter(q => q.position !== finalePos);

            // Tijdslimiet: timer telt af; zonder limiet is het een stopwatch
            if (room.time_limit_minutes > 0) {
                timeLimitSec = room.time_limit_minutes * 60;
                timerSeconds = timeLimitSec;
            }

            // Vraag 1 en 2 zijn vrij (geen sleutel nodig), maar pas
            // leesbaar zodra de timer loopt
            unlocked.add(1);
            unlocked.add(2);

            // Hero vullen
            pageTitle.textContent = room.title;
            document.title = 'Meestertools - ' + room.title;
            heroTitle.textContent = room.title;
            heroDesc.textContent = room.description || '';
            heroMeta.innerHTML =
                (room.category ? '<span class="er-badge er-badge-cat">' + escapeHtml(room.category) + '</span>' : '') +
                (room.suitable_for ? '<span class="er-badge er-badge-group">' + groupLabel(room.suitable_for) + '</span>' : '');
            if (room.image_url) {
                hero.style.backgroundImage = 'url("' + String(room.image_url).replace(/"/g, '%22') + '")';
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

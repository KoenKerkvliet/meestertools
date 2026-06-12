/* ============================================
   ESCAPE ROOMS - Speelpagina (room-template)
   Versie: v0.0.1

   Elke room heeft dezelfde opbouw:
   - Hero met afbeelding en titel/omschrijving-overlay.
   - 3x5 grid: kaart 1 = vraag 1, kaart 2 = timer, kaart 3 = vraag 2,
     daarna 12 gelockte vraagkaarten (waarvan de laatste de finale is).

   Spelregels:
   - Vragen zijn pas speelbaar zodra de timer loopt (geen stiekem
     voorlezen); pauzeren zet de vragen ook weer op slot.
   - Met een tijdslimiet (instelbaar per room) telt de timer af;
     op 00:00 is het spel voorbij. Zonder limiet is het een stopwatch.
   - Een goed antwoord levert een sleutel op (🗝️) die met een animatie
     naar de sleutelteller vliegt.
   - Met een sleutel open je een gelockte kaart en komt de vraag vrij.
   - De finale gaat pas open als alle andere vragen beantwoord zijn.
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
    const answerCountEl = document.getElementById('erAnswerCount');
    const totalCountEl = document.getElementById('erTotalCount');
    const playError = document.getElementById('erPlayError');
    const victory = document.getElementById('erVictory');
    const victoryTime = document.getElementById('erVictoryTime');
    const reviewStars = document.getElementById('erReviewStars');
    const reviewThanks = document.getElementById('erReviewThanks');

    // ---------- State ----------
    let room = null;
    let questions = [];          // gesorteerd op position
    let finalePos = null;        // hoogste position = finale
    let keys = 0;
    const unlocked = new Set();  // posities die open zijn
    const answered = new Set();  // posities die goed beantwoord zijn

    // Timer
    let timerInterval = null;
    let timerSeconds = 0;      // resterend (aftellen) of verstreken (stopwatch)
    let timerRunning = false;
    let timerStarted = false;  // ooit gestart sinds laatste reset
    let timeLimitSec = null;   // null = stopwatch, anders aftellen vanaf dit aantal

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

    // ---------- Status ----------
    function updateStatus() {
        keyCountEl.textContent = keys;
        answerCountEl.textContent = answered.size;
        totalCountEl.textContent = questions.length;
    }

    // ---------- Timer ----------
    function timerText() {
        const t = Math.max(0, timerSeconds);
        const m = Math.floor(t / 60);
        const s = t % 60;
        return (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
    }

    // Verstreken speeltijd (voor de victory-tekst)
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
        refreshGrid();
    }

    function pauseTimer() {
        timerRunning = false;
        clearInterval(timerInterval);
        refreshGrid();
    }

    function stopTimer() {
        timerRunning = false;
        timerStarted = false;
        clearInterval(timerInterval);
        timerSeconds = timeLimitSec !== null ? timeLimitSec : 0;
        refreshGrid();
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

    // ---------- Vraagkaarten ----------
    function isFinale(pos) {
        return pos === finalePos;
    }

    function othersAnswered() {
        return questions.every(q => isFinale(q.position) || answered.has(q.position));
    }

    function renderQuestionCard(card, q) {
        const pos = q.position;
        card.dataset.position = pos;
        card.className = 'er-play-card' + (isFinale(pos) ? ' er-finale' : '');

        if (answered.has(pos)) {
            card.classList.add('er-answered');
            card.innerHTML =
                '<div class="er-card-label">' + (isFinale(pos) ? '&#127942; Finale' : 'Vraag ' + pos) + '</div>' +
                '<div class="er-q-text">' + escapeHtml(q.question) + '</div>' +
                '<div class="er-q-done">&#9989; Goed beantwoord!</div>';
            return;
        }

        // Timer loopt niet: alle onbeantwoorde vragen (ook 1 en 2) zijn
        // gefaded, zodat niemand alvast kan meelezen of nadenken.
        if (!timerRunning && unlocked.has(pos)) {
            card.classList.add('er-locked');
            card.innerHTML =
                '<div class="er-card-label">' + (isFinale(pos) ? '&#127942; Finale' : 'Vraag ' + pos) + '</div>' +
                '<div class="er-locked-icon">&#9203;</div>' +
                '<div class="er-locked-text">' +
                    (timerStarted ? 'De timer staat stil — druk op verder.' : 'Start de timer om te beginnen!') +
                '</div>';
            return;
        }

        if (!unlocked.has(pos)) {
            card.classList.add('er-locked');
            const finaleGate = isFinale(pos) && !othersAnswered();
            card.innerHTML =
                '<div class="er-card-label">' + (isFinale(pos) ? '&#127942; Finale' : 'Vraag ' + pos) + '</div>' +
                '<div class="er-locked-icon">' + (isFinale(pos) ? '&#127942;' : '&#128274;') + '</div>' +
                '<div class="er-locked-text">' +
                    (finaleGate
                        ? 'Beantwoord eerst alle andere vragen.'
                        : 'Deze kaart zit op slot.') +
                '</div>' +
                '<button class="er-btn er-unlock-btn"' + ((keys < 1 || finaleGate || !timerRunning) ? ' disabled' : '') + '>' +
                    '&#128477;&#65039; Open met sleutel' +
                '</button>';

            card.querySelector('.er-unlock-btn').addEventListener('click', () => {
                if (keys < 1 || !timerRunning || (isFinale(pos) && !othersAnswered())) return;
                keys--;
                unlocked.add(pos);
                updateStatus();
                renderQuestionCard(card, q);
                refreshLockedCards();
            });
            return;
        }

        // Open vraag: tekst + antwoordveld + controleknop
        card.innerHTML =
            '<div class="er-card-label">' + (isFinale(pos) ? '&#127942; Finale' : 'Vraag ' + pos) + '</div>' +
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
                if (!isFinale(pos)) keys++;
                updateStatus();
                renderQuestionCard(card, q);
                refreshLockedCards();
                if (isFinale(pos)) {
                    showVictory();
                } else {
                    flyKey(card);
                }
            } else {
                feedback.textContent = 'Helaas, probeer het nog eens!';
                card.classList.add('er-wrong');
                setTimeout(() => card.classList.remove('er-wrong'), 600);
            }
        }
        checkBtn.addEventListener('click', check);
        input.addEventListener('keydown', (e) => { if (e.key === 'Enter') check(); });
    }

    // Unlock-knoppen en finale-tekst bijwerken zonder open vragen te verstoren
    function refreshLockedCards() {
        grid.querySelectorAll('.er-play-card.er-locked').forEach(card => {
            const pos = parseInt(card.dataset.position, 10);
            const q = questions.find(x => x.position === pos);
            if (q && !unlocked.has(pos) && !answered.has(pos)) renderQuestionCard(card, q);
        });
    }

    // Alle kaarten opnieuw opbouwen (na start/pauze/stop van de timer)
    function refreshGrid() {
        grid.querySelectorAll('.er-play-card').forEach(card => {
            if (card.classList.contains('er-timer-card')) {
                renderTimerCard(card);
            } else {
                const pos = parseInt(card.dataset.position, 10);
                const q = questions.find(x => x.position === pos);
                if (q) renderQuestionCard(card, q);
            }
        });
    }

    // ---------- Sleutel-animatie ----------
    // Bij een goed antwoord vliegt een sleutel van de kaart naar de
    // sleutelteller in de statusbalk en vervaagt daar.
    function flyKey(fromCard) {
        const target = document.querySelector('.er-status-keys');
        if (!target || !fromCard) return;
        const from = fromCard.getBoundingClientRect();
        const to = target.getBoundingClientRect();

        const key = document.createElement('div');
        key.className = 'er-key-fly';
        key.textContent = '\u{1F5DD}️';
        key.style.left = (from.left + from.width / 2 - 20) + 'px';
        key.style.top = (from.top + from.height / 2 - 20) + 'px';
        document.body.appendChild(key);

        const dx = (to.left + to.width / 2) - (from.left + from.width / 2);
        const dy = (to.top + to.height / 2) - (from.top + from.height / 2);

        // Twee frames wachten zodat de starttoestand gerenderd is
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                key.style.transform = 'translate(' + dx + 'px, ' + dy + 'px) scale(0.4) rotate(360deg)';
                key.style.opacity = '0';
            });
        });

        setTimeout(() => {
            key.remove();
            const counter = document.querySelector('.er-status-keys');
            if (counter) {
                counter.classList.add('er-key-pulse');
                setTimeout(() => counter.classList.remove('er-key-pulse'), 450);
            }
        }, 800);
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

        // Posities in gridvolgorde: vraag 1, timer, vraag 2, dan de rest
        const cells = [];
        const q1 = questions.find(q => q.position === 1);
        const q2 = questions.find(q => q.position === 2);
        if (q1) cells.push({ type: 'q', q: q1 });
        cells.push({ type: 'timer' });
        if (q2) cells.push({ type: 'q', q: q2 });
        questions.filter(q => q.position > 2).forEach(q => cells.push({ type: 'q', q: q }));

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
            questions = qRes.data || [];

            if (!questions.length) {
                heroTitle.textContent = room.title;
                heroDesc.textContent = 'Deze room heeft nog geen vragen.';
                return;
            }

            finalePos = Math.max.apply(null, questions.map(q => q.position));

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

/* ============================================
   ESCAPE ROOMS - Speelpagina (room-template)
   Versie: v0.0.1

   Elke room heeft dezelfde opbouw:
   - Hero met afbeelding en titel/omschrijving-overlay.
   - 3x5 grid: kaart 1 = vraag 1, kaart 2 = timer, kaart 3 = vraag 2,
     daarna 12 gelockte vraagkaarten (waarvan de laatste de finale is).

   Spelregels:
   - Vraag 1 en 2 zijn meteen speelbaar.
   - Een goed antwoord levert een sleutel op (🗝️).
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
    let timerSeconds = 0;
    let timerRunning = false;

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
        const m = Math.floor(timerSeconds / 60);
        const s = timerSeconds % 60;
        return (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
    }

    function renderTimerCard(card) {
        card.innerHTML =
            '<div class="er-card-label">&#9201;&#65039; Timer</div>' +
            '<div class="er-timer-display" id="erTimerDisplay">' + timerText() + '</div>' +
            '<div class="er-timer-controls">' +
            (timerRunning
                ? '<button class="er-btn er-btn-secondary" id="erTimerPause">&#9208;&#65039; Pauze</button>' +
                  '<button class="er-btn er-btn-secondary" id="erTimerStop">&#9209;&#65039; Stop</button>'
                : '<button class="er-btn" id="erTimerStart">&#9654;&#65039; Start</button>' +
                  (timerSeconds > 0 ? '<button class="er-btn er-btn-secondary" id="erTimerStop">&#9209;&#65039; Stop</button>' : '')) +
            '</div>';

        const startBtn = card.querySelector('#erTimerStart');
        const pauseBtn = card.querySelector('#erTimerPause');
        const stopBtn = card.querySelector('#erTimerStop');

        if (startBtn) startBtn.addEventListener('click', () => {
            timerRunning = true;
            timerInterval = setInterval(() => {
                timerSeconds++;
                const d = document.getElementById('erTimerDisplay');
                if (d) d.textContent = timerText();
            }, 1000);
            renderTimerCard(card);
        });
        if (pauseBtn) pauseBtn.addEventListener('click', () => {
            timerRunning = false;
            clearInterval(timerInterval);
            renderTimerCard(card);
        });
        if (stopBtn) stopBtn.addEventListener('click', () => {
            timerRunning = false;
            clearInterval(timerInterval);
            timerSeconds = 0;
            renderTimerCard(card);
        });
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
                '<button class="er-btn er-unlock-btn"' + ((keys < 1 || finaleGate) ? ' disabled' : '') + '>' +
                    '&#128477;&#65039; Open met sleutel' +
                '</button>';

            card.querySelector('.er-unlock-btn').addEventListener('click', () => {
                if (keys < 1 || (isFinale(pos) && !othersAnswered())) return;
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
                if (isFinale(pos)) showVictory();
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

    // ---------- Victory ----------
    function showVictory() {
        if (timerRunning) {
            clearInterval(timerInterval);
            timerRunning = false;
        }
        victoryTime.textContent = timerSeconds > 0
            ? 'Jullie tijd: ' + timerText()
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
                    .select('id, title, description, image_url, category, suitable_for')
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

            // Vraag 1 en 2 zijn meteen open
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

/* ============================================
   ESCAPE ROOMS - Klassikaal spelen (host)
   Versie: v1.13.0

   De leerkracht host een sessie van een escape room (zoals de
   complimentenmuur): code + QR op het bord, teams melden zich aan via
   /meedoen (zonder account), de leerkracht start en stopt het spel en
   volgt de voortgang live in een dashboard met ranglijst.

   De leerlingkant raakt de database nooit aan (Edge Function
   'escaperoom-sessie'); deze host-pagina leest de teams gewoon via
   RLS (eigenaar van de sessie) met polling.
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    const POLL_MS = 2500;
    const GOLD_NEEDED = 2;

    // ---------- State ----------
    let currentUser = null;
    let room = null;
    let session = null;
    let teams = [];
    let totalQuestions = 0;   // aantal vragen incl. finale
    let pollTimer = null;
    let clockTimer = null;

    // ---------- DOM ----------
    const pageTitle = document.getElementById('erPageTitle');
    const hostBar = document.getElementById('erHostBar');
    const roomTitleEl = document.getElementById('erHostRoomTitle');
    const pill = document.getElementById('erHostPill');
    const startBtn = document.getElementById('erHostStartBtn');
    const stopBtn = document.getElementById('erHostStopBtn');
    const newBtn = document.getElementById('erHostNewBtn');
    const joinBox = document.getElementById('erHostJoin');
    const codeEl = document.getElementById('erHostCode');
    const qrEl = document.getElementById('erHostQr');
    const timerBox = document.getElementById('erHostTimer');
    const timerDisplay = document.getElementById('erHostTimerDisplay');
    const teamsHead = document.getElementById('erHostTeamsHead');
    const teamCountEl = document.getElementById('erHostTeamCount');
    const hintEl = document.getElementById('erHostHint');
    const teamsEl = document.getElementById('erHostTeams');
    const errorEl = document.getElementById('erHostError');

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str == null ? '' : String(str);
        return div.innerHTML;
    }

    function showError(msg) {
        errorEl.textContent = msg;
        errorEl.style.display = '';
    }

    function fmt(t) {
        const m = Math.floor(t / 60);
        const s = t % 60;
        return (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
    }

    // ---------- Sessie-lifecycle ----------
    function genCode(len) {
        const ALPH = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // zonder I,O,0,1,L
        const arr = new Uint32Array(len);
        crypto.getRandomValues(arr);
        let s = '';
        for (let i = 0; i < len; i++) s += ALPH[arr[i] % ALPH.length];
        return s;
    }

    async function findOpenSession() {
        const { data } = await supabase
            .from('escaperoom_sessions').select('*')
            .eq('room_id', room.id)
            .eq('user_id', currentUser.id)
            .in('status', ['lobby', 'playing'])
            .order('created_at', { ascending: false })
            .limit(1).maybeSingle();
        return data || null;
    }

    async function createSession() {
        let created = null, lastErr = null;
        for (let attempt = 0; attempt < 6 && !created; attempt++) {
            const { data, error } = await supabase.from('escaperoom_sessions').insert({
                user_id: currentUser.id,
                room_id: room.id,
                code: genCode(5),
                status: 'lobby',
                time_limit_minutes: room.time_limit_minutes || null
            }).select().single();
            if (!error) { created = data; break; }
            lastErr = error;
            if (error.code !== '23505') break; // geen dubbele-code-botsing -> stoppen
        }
        if (!created) {
            console.error('createSession error:', lastErr);
            showError('Sessie starten lukte niet. Probeer de pagina te verversen.');
            return null;
        }
        return created;
    }

    async function startGame() {
        if (!session) return;
        startBtn.disabled = true;
        const { error } = await supabase.from('escaperoom_sessions')
            .update({ status: 'playing', started_at: new Date().toISOString() })
            .eq('id', session.id);
        if (error) { startBtn.disabled = false; showError('Starten lukte niet.'); return; }
        session.status = 'playing';
        session.started_at = new Date().toISOString();
        render();
    }

    async function stopGame() {
        if (!session) return;
        if (!confirm('Sessie stoppen? Teams kunnen daarna niet verder spelen.')) return;
        const { error } = await supabase.from('escaperoom_sessions')
            .update({ status: 'closed', closed_at: new Date().toISOString() })
            .eq('id', session.id);
        if (error) { showError('Stoppen lukte niet.'); return; }
        session.status = 'closed';
        render();
    }

    async function newSession() {
        newBtn.disabled = true;
        const created = await createSession();
        newBtn.disabled = false;
        if (!created) return;
        session = created;
        teams = [];
        render();
    }

    // ---------- Data ----------
    async function loadTeams() {
        if (!session) return;
        const { data } = await supabase
            .from('escaperoom_session_teams')
            .select('id, name, answered, finale_unlocked, finished_at, created_at')
            .eq('session_id', session.id)
            .order('created_at');
        teams = data || [];
    }

    function startPolling() {
        stopPolling();
        pollTimer = setInterval(async () => {
            await loadTeams();
            renderTeams();
        }, POLL_MS);
    }
    function stopPolling() { if (pollTimer) { clearInterval(pollTimer); pollTimer = null; } }

    // ---------- Timer ----------
    function updateClock() {
        if (!session || !session.started_at) { timerDisplay.textContent = '--:--'; return; }
        const startMs = new Date(session.started_at).getTime();
        if (session.time_limit_minutes) {
            const rem = Math.max(0, Math.round((startMs + session.time_limit_minutes * 60000 - Date.now()) / 1000));
            timerDisplay.textContent = fmt(rem);
            timerDisplay.classList.toggle('er-timer-low', rem <= 60);
            if (rem <= 0 && session.status === 'playing') {
                pill.textContent = 'De tijd is om!';
            }
        } else {
            timerDisplay.textContent = fmt(Math.max(0, Math.round((Date.now() - startMs) / 1000)));
        }
    }
    function startClock() {
        stopClock();
        clockTimer = setInterval(updateClock, 1000);
        updateClock();
    }
    function stopClock() { if (clockTimer) { clearInterval(clockTimer); clockTimer = null; } }

    // ---------- Rendering ----------
    function buildJoin() {
        const url = location.origin + '/meedoen?code=' + session.code;
        codeEl.textContent = session.code;
        qrEl.innerHTML = '';
        if (typeof qrcode !== 'undefined') {
            try {
                const qr = qrcode(0, 'M');
                qr.addData(url);
                qr.make();
                qrEl.innerHTML = qr.createImgTag(5, 8);
            } catch (e) { /* qr optioneel */ }
        }
    }

    function teamProgress(t) {
        const answered = Array.isArray(t.answered) ? t.answered.length : 0;
        return { answered: answered, total: totalQuestions, finished: !!t.finished_at };
    }

    function teamTime(t) {
        if (!t.finished_at || !session.started_at) return '';
        const sec = Math.max(0, Math.round((new Date(t.finished_at) - new Date(session.started_at)) / 1000));
        return fmt(sec);
    }

    function sortedTeams() {
        return teams.slice().sort((a, b) => {
            if (a.finished_at && b.finished_at) return new Date(a.finished_at) - new Date(b.finished_at);
            if (a.finished_at) return -1;
            if (b.finished_at) return 1;
            const pa = teamProgress(a).answered, pb = teamProgress(b).answered;
            if (pb !== pa) return pb - pa;
            return new Date(a.created_at) - new Date(b.created_at);
        });
    }

    function renderTeams() {
        teamCountEl.textContent = teams.length;
        const st = session ? session.status : 'lobby';

        if (st === 'lobby') {
            hintEl.style.display = teams.length ? 'none' : '';
            startBtn.disabled = teams.length === 0;
            teamsEl.className = 'er-host-teams er-host-teams-lobby';
            teamsEl.innerHTML = teams.map(t =>
                '<span class="er-host-chip">' + escapeHtml(t.name) + '</span>'
            ).join('');
            return;
        }

        hintEl.style.display = 'none';
        teamsEl.className = 'er-host-teams er-host-teams-board';
        const ranked = sortedTeams();
        teamsEl.innerHTML = ranked.map((t, i) => {
            const p = teamProgress(t);
            const pct = p.total ? Math.round(p.answered / p.total * 100) : 0;
            const rankBadge = p.finished
                ? (i === 0 ? '&#129351;' : i === 1 ? '&#129352;' : i === 2 ? '&#129353;' : '&#127942;')
                : (i + 1) + '.';
            return '<div class="er-host-team' + (p.finished ? ' is-finished' : '') + '">' +
                '<div class="er-host-team-rank">' + rankBadge + '</div>' +
                '<div class="er-host-team-main">' +
                    '<div class="er-host-team-name">' + escapeHtml(t.name) + '</div>' +
                    '<div class="er-host-progressbar"><div class="er-host-progressfill" style="width:' + pct + '%"></div></div>' +
                '</div>' +
                '<div class="er-host-team-meta">' +
                    (p.finished
                        ? '<span class="er-host-team-done">&#128275; ' + teamTime(t) + '</span>'
                        : '<span>' + p.answered + '/' + p.total + '</span>' +
                          (t.finale_unlocked ? ' <span title="Finale geopend">&#127942;</span>' : '')) +
                '</div>' +
            '</div>';
        }).join('') || '<p class="er-host-hint">Nog geen teams.</p>';
    }

    function render() {
        const st = session.status;
        roomTitleEl.textContent = room.title;
        pill.className = 'er-host-pill is-' + st;
        pill.textContent = st === 'lobby' ? 'Lobby — teams melden zich aan'
            : st === 'playing' ? 'Bezig — teams spelen'
            : 'Afgesloten';

        hostBar.style.display = '';
        teamsHead.style.display = '';
        joinBox.style.display = st === 'closed' ? 'none' : '';
        timerBox.style.display = (st === 'playing' || st === 'closed') && session.started_at ? '' : 'none';
        startBtn.style.display = st === 'lobby' ? '' : 'none';
        stopBtn.style.display = st === 'playing' ? '' : 'none';
        newBtn.style.display = st === 'closed' ? '' : 'none';

        if (st !== 'closed') buildJoin();
        if (st === 'playing') startClock();
        else { stopClock(); if (st === 'closed') updateClock(); }
        if (st === 'closed') stopPolling(); else startPolling();

        renderTeams();
    }

    // ---------- Init ----------
    async function init() {
        const s = await supabase.auth.getSession();
        currentUser = (s.data.session && s.data.session.user) || null;
        if (!currentUser) return; // app.js stuurt door naar login

        const roomId = new URLSearchParams(window.location.search).get('room');
        if (!roomId) {
            showError('Geen escape room gekozen. Ga terug naar het overzicht en kies een room.');
            return;
        }

        const [roomRes, qRes] = await Promise.all([
            supabase.from('escaperooms')
                .select('id, title, theme, time_limit_minutes')
                .eq('id', roomId).single(),
            supabase.from('escaperoom_questions')
                .select('id', { count: 'exact', head: true })
                .eq('room_id', roomId)
        ]);

        if (!roomRes.data) {
            showError('Deze escape room bestaat niet (meer).');
            return;
        }
        room = roomRes.data;
        totalQuestions = qRes.count || 0;

        if (totalQuestions < 4) {
            showError('Deze escape room heeft te weinig vragen om klassikaal te spelen.');
            return;
        }

        pageTitle.textContent = room.title + ' — met de klas';
        document.title = 'Meestertools - ' + room.title + ' met de klas';
        if (room.theme && room.theme !== 'standaard') {
            document.body.classList.add('er-theme-' + room.theme);
        }

        session = await findOpenSession();
        if (!session) session = await createSession();
        if (!session) return;

        await loadTeams();
        render();

        startBtn.addEventListener('click', startGame);
        stopBtn.addEventListener('click', stopGame);
        newBtn.addEventListener('click', newSession);

        if (window.hidePageLoader) window.hidePageLoader();
    }

    init();
});

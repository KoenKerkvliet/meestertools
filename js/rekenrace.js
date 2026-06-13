/* ============================================
   REKENRACE - leerkracht-tool

   Klassikale rekensprint op de rekenmuur (à la 99math, maar Nederlands):
   - leerkracht kiest een blokje van de rekenmuur + tijd/aantal -> code + QR op het bord
   - kinderen melden zich aan via /meedoen (publieke pagina + Edge Function)
   - leerkracht opent de race; kinderen maken in hoog tempo sommen
   - live dashboard: per kind snelheid, aantal gemaakte sommen en fouten

   De sommen worden client-side gegenereerd en nagekeken (0 latentie). De
   Edge Function 'rekenrace-sessie' doet alleen join (naam->klas + monster) en
   progress (geaggregeerde stats). Live updates lopen via Supabase Realtime.
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    const BASE = '../'; // pad naar /assets en /css vanaf /educatieve-games/

    // ---------- State ----------
    let currentUser = null;
    let groups = [];
    let students = [];
    let selectedGroupId = '';
    let selectedBlockId = '';
    let cfg = { mode: 'tijd', durationSeconds: 120, targetCount: 20 };
    let session = null;
    let participants = [];
    let channel = null;
    let timerInt = null;

    // ---------- DOM ----------
    const groupSelect = document.getElementById('rrGroupSelect');
    const noGroup = document.getElementById('rrNoGroup');
    const main = document.getElementById('rrMain');

    const setupEl = document.getElementById('rrSetup');
    const wallEl = document.getElementById('rrWall');
    const configEl = document.getElementById('rrConfig');
    const configChip = document.getElementById('rrConfigChip');
    const configSub = document.getElementById('rrConfigSub');
    const modeSeg = document.getElementById('rrModeSeg');
    const tijdField = document.getElementById('rrTijdField');
    const aantalField = document.getElementById('rrAantalField');
    const durationChips = document.getElementById('rrDurationChips');
    const countChips = document.getElementById('rrCountChips');
    const startSessionBtn = document.getElementById('rrStartSessionBtn');

    const sessionEl = document.getElementById('rrSession');
    const blockChipSum = document.getElementById('rrBlockChipSum');
    const blockChipMeta = document.getElementById('rrBlockChipMeta');
    const statusPill = document.getElementById('rrStatusPill');
    const closeBtn = document.getElementById('rrCloseBtn');
    const newBtn = document.getElementById('rrNewBtn');
    const deleteBtn = document.getElementById('rrDeleteBtn');

    const joinBox = document.getElementById('rrJoinBox');
    const joinUrlEl = document.getElementById('rrJoinUrl');
    const codeBig = document.getElementById('rrCodeBig');
    const qrEl = document.getElementById('rrQr');

    const lobbyEl = document.getElementById('rrLobby');
    const participantCount = document.getElementById('rrParticipantCount');
    const lobbyHint = document.getElementById('rrLobbyHint');
    const participantsEl = document.getElementById('rrParticipants');
    const startRaceBtn = document.getElementById('rrStartRaceBtn');

    const dashEl = document.getElementById('rrDash');
    const timerEl = document.getElementById('rrTimer');
    const timerValue = document.getElementById('rrTimerValue');
    const rankCount = document.getElementById('rrRankCount');
    const rankEl = document.getElementById('rrRank');
    const dashEmpty = document.getElementById('rrDashEmpty');

    // ---------- Helpers ----------
    function escapeHtml(str) {
        const d = document.createElement('div');
        d.textContent = String(str == null ? '' : str);
        return d.innerHTML;
    }
    async function getUser() {
        const s = await supabase.auth.getSession();
        return (s.data.session && s.data.session.user) || null;
    }
    function toast(msg) {
        let t = document.getElementById('rrToast');
        if (!t) {
            t = document.createElement('div');
            t.id = 'rrToast';
            t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#2D3436;color:#fff;padding:12px 20px;border-radius:10px;font-size:14px;z-index:5000;box-shadow:0 6px 18px rgba(0,0,0,.25);opacity:0;transition:opacity .2s ease;';
            document.body.appendChild(t);
        }
        t.textContent = msg;
        t.style.opacity = '1';
        clearTimeout(t._timer);
        t._timer = setTimeout(() => { t.style.opacity = '0'; }, 2600);
    }
    function blockMeta(id) {
        const blocks = window.MT_REKENRACE_BLOCKS || [];
        for (const f of blocks) {
            for (const row of f.rows) {
                for (const c of row) {
                    if (c.id === id) return { cell: c, fase: f.label };
                }
            }
        }
        return null;
    }

    // ---------- Data loading ----------
    async function loadGroups() {
        const { data } = await supabase
            .from('groups').select('id, name')
            .eq('user_id', currentUser.id).eq('archived', false).order('name');
        groups = data || [];
    }
    async function loadStudents() {
        students = [];
        if (!selectedGroupId) return;
        const { data } = await supabase
            .from('students').select('id, first_name, last_name, student_number')
            .eq('group_id', selectedGroupId).eq('archived', false).order('student_number');
        students = data || [];
    }
    async function loadOpenSession() {
        session = null;
        const { data } = await supabase
            .from('rekenrace_sessions').select('*')
            .eq('group_id', selectedGroupId).in('status', ['lobby', 'playing'])
            .order('created_at', { ascending: false }).limit(1).maybeSingle();
        session = data || null;
    }
    async function loadParticipants() {
        participants = [];
        if (!session) return;
        const { data } = await supabase
            .from('rekenrace_participants')
            .select('id, name, student_id, display_name, monster, answered_count, correct_count, total_ms, finished, finished_at, created_at')
            .eq('session_id', session.id).order('created_at');
        participants = data || [];
    }

    // ---------- Realtime ----------
    async function setRealtimeAuth() {
        try {
            const { data } = await supabase.auth.getSession();
            if (data.session) supabase.realtime.setAuth(data.session.access_token);
        } catch (e) { /* niet fataal */ }
    }
    function detachRealtime() {
        if (channel) { try { supabase.removeChannel(channel); } catch (e) {} channel = null; }
    }
    function attachRealtime() {
        detachRealtime();
        if (!session) return;
        const filt = 'session_id=eq.' + session.id;
        channel = supabase.channel('rr-' + session.id)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'rekenrace_participants', filter: filt }, handleParticipant)
            .subscribe();
    }
    function handleParticipant(payload) {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const idx = participants.findIndex(p => p.id === payload.new.id);
            if (idx >= 0) participants[idx] = payload.new; else participants.push(payload.new);
        } else if (payload.eventType === 'DELETE') {
            participants = participants.filter(p => p.id !== payload.old.id);
        }
        if (session && session.status === 'lobby') renderLobby();
        else renderDash();
    }

    // ---------- Setup: rekenmuur ----------
    function renderWall() {
        const blocks = window.MT_REKENRACE_BLOCKS || [];
        wallEl.innerHTML = blocks.map(f => {
            const rows = f.rows.map(row =>
                '<div class="rr-wall-row">' + row.map(c => {
                    const cls = ['rr-cell', 'rr-cell-' + c.kind];
                    if (c.active) cls.push('is-playable');
                    else cls.push('is-locked');
                    if (c.id === selectedBlockId) cls.push('is-selected');
                    const badge = c.active ? '' : '<span class="rr-cell-soon">binnenkort</span>';
                    return '<button type="button" class="' + cls.join(' ') + '" data-block="' + c.id + '"' +
                        (c.active ? '' : ' disabled') + '>' +
                        '<span class="rr-cell-label">' + escapeHtml(c.label) + '</span>' + badge +
                        '</button>';
                }).join('') + '</div>'
            ).join('');
            return '<div class="rr-fase">' +
                '<div class="rr-fase-label">' + escapeHtml(f.label) + '</div>' +
                '<div class="rr-fase-rows">' + rows + '</div>' +
                '</div>';
        }).join('');
    }
    function selectBlock(id) {
        const meta = blockMeta(id);
        if (!meta || !meta.cell.active) return;
        selectedBlockId = id;
        renderWall();
        configChip.textContent = meta.cell.label;
        configSub.textContent = 'Blokje ' + meta.cell.label + ' (' + meta.fase + '). Stel in hoe lang of hoeveel sommen de kinderen maken.';
        configEl.style.display = '';
        configEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function applyMode() {
        modeSeg.querySelectorAll('.rr-seg-btn').forEach(b =>
            b.classList.toggle('is-active', b.getAttribute('data-mode') === cfg.mode));
        tijdField.style.display = cfg.mode === 'tijd' ? '' : 'none';
        aantalField.style.display = cfg.mode === 'aantal' ? '' : 'none';
    }

    // ---------- Sessie-lifecycle ----------
    function genCode(len) {
        const ALPH = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
        const arr = new Uint32Array(len);
        crypto.getRandomValues(arr);
        let s = '';
        for (let i = 0; i < len; i++) s += ALPH[arr[i] % ALPH.length];
        return s;
    }
    async function createSession() {
        if (!selectedBlockId) { toast('Kies eerst een blokje.'); return; }
        const meta = blockMeta(selectedBlockId);
        if (!meta) return;

        startSessionBtn.disabled = true;
        const payload = {
            user_id: currentUser.id,
            group_id: selectedGroupId,
            block_id: selectedBlockId,
            block_label: meta.cell.label,
            mode: cfg.mode,
            duration_seconds: cfg.mode === 'tijd' ? cfg.durationSeconds : null,
            target_count: cfg.mode === 'aantal' ? cfg.targetCount : null,
            status: 'lobby'
        };
        let created = null, lastErr = null;
        for (let attempt = 0; attempt < 6 && !created; attempt++) {
            const { data, error } = await supabase.from('rekenrace_sessions')
                .insert(Object.assign({ code: genCode(5) }, payload)).select().single();
            if (!error) { created = data; break; }
            lastErr = error;
            if (error.code !== '23505') break;
        }
        startSessionBtn.disabled = false;

        if (!created) {
            console.error('createSession error:', lastErr);
            toast('Race starten lukte niet. Probeer opnieuw.');
            return;
        }
        session = created; participants = [];
        attachRealtime();
        showSession();
    }
    async function startRace() {
        if (!session) return;
        const { error } = await supabase.from('rekenrace_sessions')
            .update({ status: 'playing', started_at: new Date().toISOString() }).eq('id', session.id);
        if (error) { toast('Kon de race niet starten.'); return; }
        session.status = 'playing';
        session.started_at = new Date().toISOString();
        renderSession();
    }
    async function closeSession() {
        if (!session) return;
        if (!confirm('Race stoppen? Kinderen kunnen daarna geen sommen meer maken.')) return;
        const { error } = await supabase.from('rekenrace_sessions')
            .update({ status: 'closed', closed_at: new Date().toISOString() }).eq('id', session.id);
        if (error) { toast('Stoppen lukte niet.'); return; }
        session.status = 'closed';
        renderSession();
    }
    function newSession() {
        detachRealtime(); stopTimer();
        session = null; participants = [];
        showSetup();
    }
    async function deleteCurrent() {
        if (!session) return;
        if (!confirm('Deze rekenrace definitief verwijderen? Alle resultaten gaan ook weg.')) return;
        const { error } = await supabase.from('rekenrace_sessions').delete().eq('id', session.id);
        if (error) { toast('Verwijderen lukte niet.'); return; }
        toast('Rekenrace verwijderd.');
        newSession();
    }

    // ---------- Rendering ----------
    function fillGroupSelect() {
        groupSelect.innerHTML = '<option value="">Kies een klas...</option>' +
            groups.map(g => '<option value="' + g.id + '">' + escapeHtml(g.name) + '</option>').join('');
        groupSelect.value = selectedGroupId || '';
    }
    function showSetup() {
        setupEl.style.display = '';
        sessionEl.style.display = 'none';
        configEl.style.display = selectedBlockId ? '' : 'none';
        renderWall();
        applyMode();
    }
    function showSession() {
        setupEl.style.display = 'none';
        sessionEl.style.display = '';
        const meta = blockMeta(session.block_id);
        blockChipSum.textContent = session.block_label || (meta && meta.cell.label) || '';
        blockChipMeta.textContent = (meta ? meta.fase : 'Rekenrace') +
            ' · ' + (session.mode === 'tijd'
                ? Math.round((session.duration_seconds || 0) / 60) + ' min'
                : (session.target_count || 0) + ' sommen');
        buildJoin();
        renderSession();
    }
    function buildJoin() {
        const url = location.origin + '/meedoen?code=' + session.code;
        joinUrlEl.textContent = location.host + '/meedoen';
        codeBig.textContent = session.code;
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
    function renderSession() {
        const st = session ? session.status : 'lobby';
        statusPill.className = 'rr-status-pill is-' + st;
        statusPill.textContent = st === 'lobby' ? 'Lobby — kinderen melden zich aan'
            : st === 'playing' ? 'Bezig — de race loopt'
            : 'Afgesloten';

        const isClosed = st === 'closed';
        joinBox.style.display = st === 'lobby' ? '' : 'none';
        lobbyEl.style.display = st === 'lobby' ? '' : 'none';
        dashEl.style.display = st === 'lobby' ? 'none' : '';
        closeBtn.style.display = isClosed ? 'none' : '';
        newBtn.style.display = isClosed ? '' : 'none';
        deleteBtn.style.display = isClosed ? '' : 'none';

        if (st === 'lobby') { stopTimer(); renderLobby(); }
        else { renderDash(); if (st === 'playing') startTimer(); else stopTimer(); }
    }
    function renderLobby() {
        participantCount.textContent = participants.length;
        lobbyHint.style.display = participants.length ? 'none' : '';
        startRaceBtn.disabled = participants.length === 0;
        participantsEl.innerHTML = participants.map(p =>
            '<span class="rr-chip">' +
                '<img class="rr-chip-monster" src="' + BASE + escapeHtml(p.monster || '') + '" alt="">' +
                escapeHtml(p.display_name || p.name) +
                (p.student_id ? '' : '<span class="rr-chip-unknown" title="Niet herkend in de klas">?</span>') +
            '</span>').join('');
    }
    function tempoLabel(p) {
        const a = p.answered_count || 0;
        if (!a || !p.total_ms) return '—';
        const perMin = a / (p.total_ms / 60000);
        return perMin.toFixed(0) + '/min';
    }
    function renderDash() {
        const list = participants.slice().sort((a, b) => {
            const ac = (b.answered_count || 0) - (a.answered_count || 0);
            if (ac !== 0) return ac;
            return (b.correct_count || 0) - (a.correct_count || 0);
        });
        rankCount.textContent = list.length;
        dashEmpty.style.display = list.length ? 'none' : '';
        const medals = ['🥇', '🥈', '🥉'];
        rankEl.innerHTML = list.map((p, i) => {
            const answered = p.answered_count || 0;
            const fouten = Math.max(0, answered - (p.correct_count || 0));
            const rankBadge = i < 3 ? medals[i] : (i + 1) + '.';
            const fin = p.finished ? '<span class="rr-rank-fin" title="Klaar">✅</span>' : '';
            const unknown = p.student_id ? '' : '<span class="rr-chip-unknown" title="Niet herkend in de klas">?</span>';
            return '<div class="rr-rank-row">' +
                '<span class="rr-rank-pos">' + rankBadge + '</span>' +
                '<img class="rr-rank-monster" src="' + BASE + escapeHtml(p.monster || '') + '" alt="">' +
                '<span class="rr-rank-name">' + escapeHtml(p.display_name || p.name) + unknown + fin + '</span>' +
                '<span class="rr-rank-stat"><strong>' + answered + '</strong><small>gemaakt</small></span>' +
                '<span class="rr-rank-stat rr-rank-stat-bad"><strong>' + fouten + '</strong><small>fout</small></span>' +
                '<span class="rr-rank-stat"><strong>' + tempoLabel(p) + '</strong><small>tempo</small></span>' +
                '</div>';
        }).join('');
    }

    // ---------- Timer (tijdmodus) ----------
    function stopTimer() {
        if (timerInt) { clearInterval(timerInt); timerInt = null; }
        timerEl.style.display = 'none';
    }
    function startTimer() {
        stopTimer();
        if (!session || session.mode !== 'tijd' || !session.duration_seconds || !session.started_at) return;
        timerEl.style.display = '';
        const endMs = new Date(session.started_at).getTime() + session.duration_seconds * 1000;
        const tick = () => {
            const left = Math.max(0, Math.round((endMs - Date.now()) / 1000));
            const m = Math.floor(left / 60), s = left % 60;
            timerValue.textContent = m + ':' + (s < 10 ? '0' + s : s);
            timerEl.classList.toggle('is-up', left === 0);
            if (left === 0) stopTimer();
        };
        tick();
        timerInt = setInterval(tick, 500);
    }

    // ---------- Klaswissel ----------
    async function onGroupChange() {
        detachRealtime(); stopTimer();
        session = null; participants = []; selectedBlockId = '';

        if (!selectedGroupId) {
            noGroup.style.display = '';
            main.style.display = 'none';
            return;
        }
        noGroup.style.display = 'none';
        main.style.display = '';

        await loadStudents();
        await loadOpenSession();

        if (session) {
            await loadParticipants();
            attachRealtime();
            showSession();
        } else {
            configEl.style.display = 'none';
            showSetup();
        }
    }

    // ---------- Init ----------
    async function init() {
        currentUser = await getUser();
        if (!currentUser) return;

        await setRealtimeAuth();
        await loadGroups();

        try { await MTActiveClass.ready; } catch (e) {}
        selectedGroupId = MTActiveClass.resolveDefault('', groups);

        fillGroupSelect();
        applyMode();

        // Listeners
        groupSelect.addEventListener('change', () => {
            selectedGroupId = groupSelect.value;
            MTActiveClass.setId(selectedGroupId);
            onGroupChange();
        });
        wallEl.addEventListener('click', (e) => {
            const btn = e.target.closest('.rr-cell.is-playable');
            if (btn) selectBlock(btn.getAttribute('data-block'));
        });
        modeSeg.addEventListener('click', (e) => {
            const btn = e.target.closest('.rr-seg-btn');
            if (!btn) return;
            cfg.mode = btn.getAttribute('data-mode');
            applyMode();
        });
        durationChips.addEventListener('click', (e) => {
            const btn = e.target.closest('.rr-choice');
            if (!btn) return;
            cfg.durationSeconds = parseInt(btn.getAttribute('data-sec'), 10);
            durationChips.querySelectorAll('.rr-choice').forEach(b => b.classList.toggle('is-active', b === btn));
        });
        countChips.addEventListener('click', (e) => {
            const btn = e.target.closest('.rr-choice');
            if (!btn) return;
            cfg.targetCount = parseInt(btn.getAttribute('data-count'), 10);
            countChips.querySelectorAll('.rr-choice').forEach(b => b.classList.toggle('is-active', b === btn));
        });
        startSessionBtn.addEventListener('click', createSession);
        startRaceBtn.addEventListener('click', startRace);
        closeBtn.addEventListener('click', closeSession);
        newBtn.addEventListener('click', newSession);
        deleteBtn.addEventListener('click', deleteCurrent);

        await onGroupChange();

        if (window.hidePageLoader) window.hidePageLoader();
    }

    init();
});

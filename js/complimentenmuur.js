/* ============================================
   COMPLIMENTENMUUR - leerkracht-tool

   Sessie-gebaseerd (zoals Mentimeter):
   - leerkracht kiest een focus-kind en start een sessie -> code + QR op het bord
   - kinderen melden zich aan via /meedoen (publieke pagina + Edge Function)
   - leerkracht ziet live de lobby, opent het invullen, keurt complimenten goed
   - goedgekeurde complimenten verschijnen live op het bord
   - presenteren (fullscreen) en printen (mooi A4-blad met monstertje)

   Live updates lopen via Supabase Realtime op de eigen sessie. De
   leerlingkant raakt de database nooit rechtstreeks aan; die loopt via
   de Edge Function 'complimentenmuur'.
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    // Pad naar /assets vanaf deze pagina (/groepsvorming/...)
    const BASE = '../';
    const FUNCTION_URL = SUPABASE_URL + '/functions/v1/complimentenmuur';

    // Pastelkleuren voor de briefjes op de muur
    const NOTE_COLORS = ['#FFE9A8', '#C9F0D6', '#CFE3FF', '#FFD6E0', '#E6D6FF', '#FFE0C2', '#D7F5F0'];

    // ---------- State ----------
    let currentUser = null;
    let groups = [];
    let students = [];
    let selectedGroupId = '';
    let session = null;            // huidige sessie-object of null
    let participants = [];         // [{id, name, created_at}]
    let compliments = [];          // [{id, author_name, text, status, created_at}]
    let channel = null;            // realtime channel
    let presentOpen = false;

    // ---------- DOM ----------
    const groupSelect = document.getElementById('cmGroupSelect');
    const noGroup = document.getElementById('cmNoGroup');
    const main = document.getElementById('cmMain');

    const setupEl = document.getElementById('cmSetup');
    const focusSelect = document.getElementById('cmFocusSelect');
    const focusPreview = document.getElementById('cmFocusPreview');
    const optModeration = document.getElementById('cmOptModeration');
    const optAuthor = document.getElementById('cmOptAuthor');
    const startSessionBtn = document.getElementById('cmStartSessionBtn');
    const historyEl = document.getElementById('cmHistory');
    const historyList = document.getElementById('cmHistoryList');

    const sessionEl = document.getElementById('cmSession');
    const focusChipMonster = document.getElementById('cmFocusChipMonster');
    const focusChipName = document.getElementById('cmFocusChipName');
    const statusPill = document.getElementById('cmStatusPill');
    const checkBtn = document.getElementById('cmCheckBtn');
    const presentBtn = document.getElementById('cmPresentBtn');
    const printBtn = document.getElementById('cmPrintBtn');
    const closeBtn = document.getElementById('cmCloseBtn');
    const newBtn = document.getElementById('cmNewBtn');
    const deleteBtn = document.getElementById('cmDeleteBtn');

    const joinBox = document.getElementById('cmJoinBox');
    const joinUrlEl = document.getElementById('cmJoinUrl');
    const codeBig = document.getElementById('cmCodeBig');
    const qrEl = document.getElementById('cmQr');

    const lobbyEl = document.getElementById('cmLobby');
    const participantCount = document.getElementById('cmParticipantCount');
    const lobbyHint = document.getElementById('cmLobbyHint');
    const participantsEl = document.getElementById('cmParticipants');
    const startCollectBtn = document.getElementById('cmStartCollectBtn');

    const boardEl = document.getElementById('cmBoard');
    const queueWrap = document.getElementById('cmQueueWrap');
    const queueCount = document.getElementById('cmQueueCount');
    const queueEl = document.getElementById('cmQueue');
    const queueEmpty = document.getElementById('cmQueueEmpty');
    const wallCount = document.getElementById('cmWallCount');
    const wallEl = document.getElementById('cmWall');
    const wallEmpty = document.getElementById('cmWallEmpty');

    const presentEl = document.getElementById('cmPresent');
    const presentClose = document.getElementById('cmPresentClose');
    const presentMonster = document.getElementById('cmPresentMonster');
    const presentTitle = document.getElementById('cmPresentTitle');
    const presentWall = document.getElementById('cmPresentWall');

    const checkModal = document.getElementById('cmCheckModal');
    const checkClose = document.getElementById('cmCheckClose');
    const checkSummary = document.getElementById('cmCheckSummary');
    const checkDone = document.getElementById('cmCheckDone');
    const checkDoneCount = document.getElementById('cmCheckDoneCount');
    const checkTodo = document.getElementById('cmCheckTodo');
    const checkTodoCount = document.getElementById('cmCheckTodoCount');
    const checkUnmatched = document.getElementById('cmCheckUnmatched');
    const checkUnmatchedList = document.getElementById('cmCheckUnmatchedList');
    let checkOpen = false;

    // ---------- Helpers ----------
    function escapeHtml(str) {
        const d = document.createElement('div');
        d.textContent = String(str == null ? '' : str);
        return d.innerHTML;
    }
    function studentName(s) {
        if (!s) return '?';
        return ((s.first_name || '') + ' ' + (s.last_name || '')).trim() || '?';
    }
    function hashStr(key) {
        let h = 0;
        key = String(key || '');
        for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
        return h;
    }
    const MONSTER_COUNT = 36;
    function monsterForStudent(s) {
        // Zelfde deterministische keuze als Klasseprestatie/Klassendienst,
        // zodat een leerling overal hetzelfde monstertje houdt.
        const n = (hashStr((s && s.id) || '') % MONSTER_COUNT) + 1;
        return 'assets/avatars/monsters/monster-' + (n < 10 ? '0' + n : n) + '.png';
    }
    async function getUser() {
        const s = await supabase.auth.getSession();
        return (s.data.session && s.data.session.user) || null;
    }
    function pending() { return compliments.filter(c => c.status === 'pending'); }
    function approved() {
        return compliments.filter(c => c.status === 'approved')
            .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }
    function toast(msg) {
        let t = document.getElementById('cmToast');
        if (!t) {
            t = document.createElement('div');
            t.id = 'cmToast';
            t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#2D3436;color:#fff;padding:12px 20px;border-radius:10px;font-size:14px;z-index:5000;box-shadow:0 6px 18px rgba(0,0,0,.25);opacity:0;transition:opacity .2s ease;';
            document.body.appendChild(t);
        }
        t.textContent = msg;
        t.style.opacity = '1';
        clearTimeout(t._timer);
        t._timer = setTimeout(() => { t.style.opacity = '0'; }, 2600);
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
            .from('compliment_sessions').select('*')
            .eq('group_id', selectedGroupId).in('status', ['lobby', 'collecting'])
            .order('created_at', { ascending: false }).limit(1).maybeSingle();
        session = data || null;
    }
    async function loadSessionData() {
        participants = []; compliments = [];
        if (!session) return;
        const [pRes, cRes] = await Promise.all([
            supabase.from('compliment_participants').select('id, name, created_at')
                .eq('session_id', session.id).order('created_at'),
            supabase.from('compliments').select('id, author_name, text, status, created_at')
                .eq('session_id', session.id).order('created_at')
        ]);
        participants = pRes.data || [];
        compliments = cRes.data || [];
    }
    async function loadHistory() {
        const { data } = await supabase
            .from('compliment_sessions').select('*')
            .eq('group_id', selectedGroupId).eq('status', 'closed')
            .order('created_at', { ascending: false }).limit(8);
        renderHistory(data || []);
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
        channel = supabase.channel('cm-' + session.id)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'compliment_participants', filter: filt }, handleParticipant)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'compliments', filter: filt }, handleCompliment)
            .subscribe();
    }
    function handleParticipant(payload) {
        if (payload.eventType === 'INSERT') {
            if (!participants.some(p => p.id === payload.new.id)) participants.push(payload.new);
        } else if (payload.eventType === 'DELETE') {
            participants = participants.filter(p => p.id !== payload.old.id);
        }
        renderLobby();
    }
    function handleCompliment(payload) {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const idx = compliments.findIndex(c => c.id === payload.new.id);
            if (idx >= 0) compliments[idx] = payload.new; else compliments.push(payload.new);
        } else if (payload.eventType === 'DELETE') {
            compliments = compliments.filter(c => c.id !== payload.old.id);
        }
        renderBoard();
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
    async function createSession() {
        const focus = students.find(s => s.id === focusSelect.value);
        if (!focus) { toast('Kies eerst een leerling.'); return; }

        startSessionBtn.disabled = true;
        const monster = monsterForStudent(focus);
        let created = null, lastErr = null;
        for (let attempt = 0; attempt < 6 && !created; attempt++) {
            const { data, error } = await supabase.from('compliment_sessions').insert({
                user_id: currentUser.id,
                group_id: selectedGroupId,
                focus_student_id: focus.id,
                focus_student_name: focus.first_name || studentName(focus),
                focus_monster: monster,
                code: genCode(5),
                status: 'lobby',
                moderation: !!optModeration.checked,
                show_author: !!optAuthor.checked
            }).select().single();
            if (!error) { created = data; break; }
            lastErr = error;
            if (error.code !== '23505') break; // geen dubbele-code-botsing -> stoppen
        }
        startSessionBtn.disabled = false;

        if (!created) {
            console.error('createSession error:', lastErr);
            toast('Sessie starten lukte niet. Probeer opnieuw.');
            return;
        }
        session = created; participants = []; compliments = [];
        attachRealtime();
        showSession();
    }
    async function startCollecting() {
        if (!session) return;
        const { error } = await supabase.from('compliment_sessions')
            .update({ status: 'collecting' }).eq('id', session.id);
        if (error) { toast('Kon het invullen niet openen.'); return; }
        session.status = 'collecting';
        renderSession();
    }
    async function closeSession() {
        if (!session) return;
        if (!confirm('Sessie sluiten? Kinderen kunnen daarna niets meer insturen. Je kunt nog wel presenteren en printen.')) return;
        const { error } = await supabase.from('compliment_sessions')
            .update({ status: 'closed', closed_at: new Date().toISOString() }).eq('id', session.id);
        if (error) { toast('Sluiten lukte niet.'); return; }
        session.status = 'closed';
        renderSession();
    }
    function newSession() {
        detachRealtime();
        session = null; participants = []; compliments = [];
        showSetup();
        loadHistory();
    }
    async function deleteSession(id, name) {
        if (!confirm('Complimentenmuur' + (name ? ' voor ' + name : '') + ' definitief verwijderen? Alle complimenten gaan ook weg. Dit kan niet ongedaan worden gemaakt.')) return false;
        const { error } = await supabase.from('compliment_sessions').delete().eq('id', id);
        if (error) { toast('Verwijderen lukte niet.'); return false; }
        toast('Complimentenmuur verwijderd.');
        return true;
    }
    async function deleteCurrent() {
        if (!session) return;
        const ok = await deleteSession(session.id, session.focus_student_name);
        if (ok) newSession();
    }

    // ---------- Moderatie ----------
    async function setStatus(id, status) {
        const c = compliments.find(x => x.id === id);
        if (c) c.status = status;        // optimistisch
        renderBoard();
        const { error } = await supabase.from('compliments').update({ status }).eq('id', id);
        if (error) { toast('Bijwerken lukte niet.'); loadSessionData().then(renderBoard); }
    }

    // ---------- Rendering ----------
    function fillGroupSelect() {
        groupSelect.innerHTML = '<option value="">Kies een klas...</option>' +
            groups.map(g => '<option value="' + g.id + '">' + escapeHtml(g.name) + '</option>').join('');
        groupSelect.value = selectedGroupId || '';
    }
    function fillFocusSelect() {
        focusSelect.innerHTML = '<option value="">Kies een leerling...</option>' +
            students.map(s => '<option value="' + s.id + '">' + escapeHtml(studentName(s)) + '</option>').join('');
        focusSelect.value = '';
        renderFocusPreview();
    }
    function renderFocusPreview() {
        const s = students.find(x => x.id === focusSelect.value);
        startSessionBtn.disabled = !s;
        if (!s) { focusPreview.classList.add('is-empty'); focusPreview.innerHTML = ''; return; }
        focusPreview.classList.remove('is-empty');
        focusPreview.innerHTML = '<img src="' + BASE + monsterForStudent(s) + '" alt="">';
    }

    function showSetup() {
        setupEl.style.display = '';
        sessionEl.style.display = 'none';
        fillFocusSelect();
    }
    function showSession() {
        setupEl.style.display = 'none';
        sessionEl.style.display = '';
        focusChipMonster.src = BASE + (session.focus_monster || '');
        focusChipName.textContent = session.focus_student_name || '';
        presentTitle.textContent = 'Complimenten voor ' + (session.focus_student_name || '');
        presentMonster.src = BASE + (session.focus_monster || '');
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
        statusPill.className = 'cm-status-pill is-' + st;
        statusPill.textContent = st === 'lobby' ? 'Lobby — kinderen melden zich aan'
            : st === 'collecting' ? 'Open — kinderen vullen in'
            : 'Afgesloten';

        const isClosed = st === 'closed';
        joinBox.style.display = isClosed ? 'none' : '';
        lobbyEl.style.display = st === 'lobby' ? '' : 'none';
        boardEl.style.display = st === 'lobby' ? 'none' : '';
        closeBtn.style.display = isClosed ? 'none' : '';
        newBtn.style.display = isClosed ? '' : 'none';
        deleteBtn.style.display = isClosed ? '' : 'none';

        // Wachtrij alleen tonen bij moderatie én tijdens verzamelen
        queueWrap.style.display = (session && session.moderation && st === 'collecting') ? '' : 'none';

        if (st === 'lobby') renderLobby();
        else renderBoard();
    }
    function renderLobby() {
        participantCount.textContent = participants.length;
        lobbyHint.style.display = participants.length ? 'none' : '';
        startCollectBtn.disabled = participants.length === 0;
        participantsEl.innerHTML = participants
            .map(p => '<span class="cm-chip">' + escapeHtml(p.name) + '</span>').join('');
        // ook de teller in de bord-weergave kan al kloppen
    }
    function noteHtml(c, opts) {
        opts = opts || {};
        const h = hashStr(c.id);
        const color = NOTE_COLORS[h % NOTE_COLORS.length];
        const rot = (h % 5) - 2; // -2..2 graden
        const author = (session && session.show_author && c.author_name)
            ? '<div class="cm-note-author">van ' + escapeHtml(c.author_name) + '</div>' : '';
        const remove = opts.removable
            ? '<button class="cm-note-remove" data-id="' + c.id + '" title="Van het bord halen">&#10005;</button>' : '';
        return '<div class="cm-note" style="background:' + color + ';--rot:' + rot + 'deg;">' +
            remove +
            '<div class="cm-note-text">' + escapeHtml(c.text) + '</div>' + author +
            '</div>';
    }
    function renderBoard() {
        // Wachtrij
        const pend = pending();
        queueCount.textContent = pend.length;
        queueEmpty.style.display = pend.length ? 'none' : '';
        queueEl.innerHTML = pend.map(c =>
            '<div class="cm-q-item">' +
                '<div class="cm-q-text">' + escapeHtml(c.text) + '</div>' +
                '<div class="cm-q-author">van ' + escapeHtml(c.author_name) + '</div>' +
                '<div class="cm-q-actions">' +
                    '<button class="cm-q-btn cm-q-approve" data-id="' + c.id + '" title="Goedkeuren">&#10003;</button>' +
                    '<button class="cm-q-btn cm-q-reject" data-id="' + c.id + '" title="Afwijzen">&#10005;</button>' +
                '</div>' +
            '</div>'
        ).join('');

        // Muur
        const appr = approved();
        wallCount.textContent = appr.length;
        wallEmpty.style.display = appr.length ? 'none' : '';
        wallEl.innerHTML = appr.map(c => noteHtml(c, { removable: true })).join('');

        if (presentOpen) renderPresent();
        if (checkOpen) renderCheck();
    }
    function renderPresent() {
        const appr = approved();
        presentWall.innerHTML = appr.length
            ? appr.map(c => noteHtml(c, { removable: false })).join('')
            : '<div class="cm-present-empty">Nog geen complimenten op het bord.</div>';
    }
    function renderHistory(list) {
        if (!list.length) { historyEl.style.display = 'none'; return; }
        historyEl.style.display = '';
        historyList.innerHTML = list.map(s => {
            const d = new Date(s.created_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
            return '<div class="cm-history-item">' +
                '<img src="' + BASE + (s.focus_monster || '') + '" alt="">' +
                '<div class="cm-hi-text">' +
                    '<div class="cm-hi-name">' + escapeHtml(s.focus_student_name) + '</div>' +
                    '<div class="cm-hi-meta">' + d + '</div>' +
                '</div>' +
                '<button class="cm-btn cm-btn-ghost" data-open="' + s.id + '">Bekijk</button>' +
                '<button class="cm-btn cm-btn-danger-soft cm-hi-del" data-del="' + s.id + '" title="Verwijderen">&#128465;&#65039;</button>' +
            '</div>';
        }).join('');
        historyList.querySelectorAll('[data-open]').forEach(b => {
            b.addEventListener('click', () => openHistory(b.getAttribute('data-open')));
        });
        historyList.querySelectorAll('[data-del]').forEach(b => {
            b.addEventListener('click', async () => {
                const id = b.getAttribute('data-del');
                const item = list.find(x => x.id === id);
                const ok = await deleteSession(id, item ? item.focus_student_name : '');
                if (ok) loadHistory();
            });
        });
    }
    async function openHistory(id) {
        const { data } = await supabase.from('compliment_sessions').select('*').eq('id', id).maybeSingle();
        if (!data) { toast('Kon deze muur niet openen.'); return; }
        detachRealtime();
        session = data;
        await loadSessionData();
        showSession();
    }

    // ---------- Presenteren ----------
    function openPresent() {
        presentOpen = true;
        renderPresent();
        presentEl.style.display = '';
        document.body.classList.add('cm-presenting');
    }
    function closePresent() {
        presentOpen = false;
        presentEl.style.display = 'none';
        document.body.classList.remove('cm-presenting');
    }

    // ---------- Wie heeft ingevuld? ----------
    function normName(s) { return String(s == null ? '' : s).trim().toLowerCase(); }
    function renderCheck() {
        // Genormaliseerde ingestuurde namen -> originele schrijfwijze (eerste voorkomen)
        const submittedMap = {};
        compliments.forEach(c => {
            const n = normName(c.author_name);
            if (n && !submittedMap[n]) submittedMap[n] = c.author_name;
        });
        const focusId = session ? session.focus_student_id : '';
        const roster = students.filter(s => s.id !== focusId); // focus-kind schrijft niet over zichzelf

        const done = [], todo = [];
        roster.forEach(s => {
            const fn = normName(s.first_name);
            if (fn && submittedMap[fn]) done.push(s); else todo.push(s);
        });

        // Bekende namen = klassenlijst + focus-kind, zodat een terechte naam niet als 'onbekend' telt
        const known = new Set(roster.map(s => normName(s.first_name)));
        if (session && session.focus_student_name) known.add(normName(session.focus_student_name));
        const unmatched = Object.keys(submittedMap).filter(n => !known.has(n)).map(n => submittedMap[n]);

        checkSummary.textContent = roster.length
            ? done.length + ' van de ' + roster.length + ' kinderen hebben minstens één compliment ingestuurd.'
            : 'Deze klas heeft nog geen leerlingen. Voeg ze toe via Instellingen → Mijn klas.';

        checkDoneCount.textContent = done.length;
        checkTodoCount.textContent = todo.length;
        checkDone.innerHTML = done.length
            ? done.map(s => '<span class="cm-name-pill is-done">' + escapeHtml(studentName(s)) + '</span>').join('')
            : '<div class="cm-check-empty">Nog niemand.</div>';
        checkTodo.innerHTML = todo.length
            ? todo.map(s => '<span class="cm-name-pill is-todo">' + escapeHtml(studentName(s)) + '</span>').join('')
            : '<div class="cm-check-empty">Iedereen heeft ingevuld! 🎉</div>';

        if (unmatched.length) {
            checkUnmatched.style.display = '';
            checkUnmatchedList.innerHTML = unmatched
                .map(n => '<span class="cm-name-pill is-unmatched">' + escapeHtml(n) + '</span>').join('');
        } else {
            checkUnmatched.style.display = 'none';
        }
    }
    function openCheck() { checkOpen = true; renderCheck(); checkModal.style.display = ''; }
    function closeCheck() { checkOpen = false; checkModal.style.display = 'none'; }

    // ---------- Printen ----------
    function printSheet() {
        const appr = approved();
        if (!appr.length) { toast('Er staan nog geen complimenten op het bord om te printen.'); return; }
        const name = session.focus_student_name || '';
        const monsterAbs = location.origin + '/' + (session.focus_monster || '');

        const cards = appr.map((c, i) => {
            const color = NOTE_COLORS[hashStr(c.id) % NOTE_COLORS.length];
            const rot = (hashStr(c.id) % 5) - 2;
            const author = (session.show_author && c.author_name)
                ? '<div class="p-author">van ' + escapeHtml(c.author_name) + '</div>' : '';
            return '<div class="p-note" style="background:' + color + ';transform:rotate(' + rot + 'deg);">' +
                '<div class="p-text">' + escapeHtml(c.text) + '</div>' + author + '</div>';
        }).join('');

        const html = '<!DOCTYPE html><html lang="nl"><head><meta charset="UTF-8">' +
            '<title>Complimenten voor ' + escapeHtml(name) + '</title><style>' +
            // print-color-adjust:exact dwingt de browser om achtergrondkleuren
            // mee te printen (anders wordt de PDF kleurloos).
            '*{margin:0;padding:0;box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact;color-adjust:exact;}' +
            'html,body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}' +
            'body{font-family:"Segoe UI",system-ui,Arial,sans-serif;background:#EEEDF8;padding:24px 14px 48px;}' +
            '.page{background:#fff;width:210mm;max-width:100%;min-height:297mm;margin:0 auto;border-radius:20px;overflow:hidden;box-shadow:0 12px 48px rgba(108,99,255,.18);}' +
            '.head{background:#6C63FF;background:linear-gradient(135deg,#6C63FF 0%,#9B87FF 55%,#FF7AA8 110%);color:#fff;padding:34px 36px 30px;text-align:center;}' +
            '.head img{width:104px;height:104px;object-fit:contain;filter:drop-shadow(0 4px 10px rgba(0,0,0,.22));}' +
            '.head .lead{font-size:16px;opacity:.92;margin-top:8px;letter-spacing:.04em;text-transform:uppercase;}' +
            '.head h1{font-size:40px;margin-top:2px;}' +
            '.notes{padding:30px 30px 16px;display:grid;grid-template-columns:1fr 1fr;gap:18px;}' +
            '.p-note{border-radius:14px;padding:18px 18px 16px;border:1px solid rgba(0,0,0,.08);box-shadow:0 3px 8px rgba(0,0,0,.08);break-inside:avoid;min-height:96px;display:flex;flex-direction:column;justify-content:center;}' +
            '.p-text{font-size:17px;line-height:1.45;color:#333;}' +
            '.p-author{margin-top:10px;font-size:13px;font-weight:700;color:rgba(0,0,0,.55);}' +
            '.foot{text-align:center;color:#9A96B8;font-size:12px;padding:14px 0 26px;}' +
            '@page{margin:12mm;}' +
            '@media print{body{background:#fff;padding:0;}.page{box-shadow:none;border-radius:0;width:auto;min-height:auto;}}' +
            '</style></head><body><div class="page">' +
            '<div class="head"><img src="' + monsterAbs + '" alt=""><div class="lead">Complimenten voor</div><h1>' + escapeHtml(name) + '</h1></div>' +
            '<div class="notes">' + cards + '</div>' +
            '<div class="foot">Gemaakt met Meestertools &middot; Complimentenmuur</div>' +
            '</div>' +
            '<script>window.onload=function(){setTimeout(function(){window.print();},350);};<\/script>' +
            '</body></html>';

        const w = window.open('', '_blank');
        if (!w) { toast('Sta pop-ups toe om te kunnen printen.'); return; }
        w.document.open();
        w.document.write(html);
        w.document.close();
    }

    // ---------- Klaswissel ----------
    async function onGroupChange() {
        detachRealtime();
        session = null; participants = []; compliments = [];
        if (presentOpen) closePresent();

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
            await loadSessionData();
            attachRealtime();
            showSession();
        } else {
            showSetup();
            await loadHistory();
        }
    }

    // ---------- Init ----------
    async function init() {
        currentUser = await getUser();
        if (!currentUser) return; // app.js stuurt door naar login

        await setRealtimeAuth();
        await loadGroups();

        try { await MTActiveClass.ready; } catch (e) {}
        selectedGroupId = MTActiveClass.resolveDefault('', groups);

        fillGroupSelect();

        // Event listeners
        groupSelect.addEventListener('change', () => {
            selectedGroupId = groupSelect.value;
            MTActiveClass.setId(selectedGroupId);
            onGroupChange();
        });
        focusSelect.addEventListener('change', renderFocusPreview);
        startSessionBtn.addEventListener('click', createSession);
        startCollectBtn.addEventListener('click', startCollecting);
        closeBtn.addEventListener('click', closeSession);
        newBtn.addEventListener('click', newSession);
        presentBtn.addEventListener('click', openPresent);
        presentClose.addEventListener('click', closePresent);
        printBtn.addEventListener('click', printSheet);
        deleteBtn.addEventListener('click', deleteCurrent);
        checkBtn.addEventListener('click', openCheck);
        checkClose.addEventListener('click', closeCheck);
        checkModal.addEventListener('click', (e) => { if (e.target === checkModal) closeCheck(); });
        document.addEventListener('keydown', (e) => {
            if (e.key !== 'Escape') return;
            if (presentOpen) closePresent();
            else if (checkOpen) closeCheck();
        });

        // Goedkeuren/afwijzen + van het bord halen (event-delegatie)
        queueEl.addEventListener('click', (e) => {
            const ap = e.target.closest('.cm-q-approve');
            const rj = e.target.closest('.cm-q-reject');
            if (ap) setStatus(ap.getAttribute('data-id'), 'approved');
            else if (rj) setStatus(rj.getAttribute('data-id'), 'rejected');
        });
        wallEl.addEventListener('click', (e) => {
            const rm = e.target.closest('.cm-note-remove');
            if (rm) setStatus(rm.getAttribute('data-id'), 'rejected');
        });

        await onGroupChange();

        if (window.hidePageLoader) window.hidePageLoader();
    }

    init();
});

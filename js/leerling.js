/* ============================================
   LEERLINGPAGINA (/leerling)

   Publiek, geen account. Inloggen met voornaam + persoonlijke code
   (3 letters + 3 cijfers). Alles loopt via de Edge Function 'leerling'.
   v1: tegel "Mijn muurtje" -> eigen rekenmuurtje (read-only).
   ============================================ */

(function () {
    let name = '';
    let code = '';
    let displayName = '';
    let monster = '';
    let sessionsPoll = null;   // live verversen van de "Doe nu mee!"-balk

    const screens = {
        login: document.getElementById('screenLogin'),
        hub: document.getElementById('screenHub'),
        wall: document.getElementById('screenWall'),
        sociogram: document.getElementById('screenSociogram'),
        typetijger: document.getElementById('screenTypetijger')
    };
    const topLogout = document.getElementById('topLogout');

    const nameInput = document.getElementById('nameInput');
    const codeInput = document.getElementById('codeInput');
    const loginBtn = document.getElementById('loginBtn');
    const loginError = document.getElementById('loginError');

    const hubMonster = document.getElementById('hubMonster');
    const hubHi = document.getElementById('hubHi');
    const tileWall = document.getElementById('tileWall');
    const tileTypetijger = document.getElementById('tileTypetijger');
    const ttHubBack = document.getElementById('ttHubBack');
    const activeSessions = document.getElementById('activeSessions');
    const activeSessionsGrid = document.getElementById('activeSessionsGrid');
    const mineTitle = document.getElementById('mineTitle');

    const wallTitle = document.getElementById('wallTitle');
    const wallEl = document.getElementById('wall');
    const wallError = document.getElementById('wallError');
    const wallBack = document.getElementById('wallBack');

    // Sociogram invullen
    const socioTitle = document.getElementById('socioTitle');
    const socioPosTitle = document.getElementById('socioPosTitle');
    const socioNegTitle = document.getElementById('socioNegTitle');
    const socioPos = document.getElementById('socioPos');
    const socioNeg = document.getElementById('socioNeg');
    const socioError = document.getElementById('socioError');
    const socioForm = document.getElementById('socioForm');
    const socioDone = document.getElementById('socioDone');
    const socioSend = document.getElementById('socioSend');
    const socioBack = document.getElementById('socioBack');
    const socioDoneBack = document.getElementById('socioDoneBack');
    let currentSocio = null; // { sessionCode, classmates:[{id,name}], type }

    const STORE_KEY = 'mt_leerling';
    let busy = false;

    // ---------- Helpers ----------
    function showScreen(key) {
        Object.keys(screens).forEach(k => screens[k].classList.toggle('active', k === key));
        topLogout.style.display = (key === 'login') ? 'none' : '';
        if (key !== 'hub') stopSessionsPoll();
    }
    function escapeHtml(str) {
        const d = document.createElement('div');
        d.textContent = String(str == null ? '' : str);
        return d.innerHTML;
    }
    function showErr(el, msg) { el.textContent = msg; el.classList.add('show'); }
    function hideErr(el) { el.classList.remove('show'); }
    function monsterUrl(p) { return '/' + String(p || '').replace(/^\/+/, ''); }
    function save() { try { sessionStorage.setItem(STORE_KEY, JSON.stringify({ name, code, displayName, monster })); } catch (e) {} }
    function restore() { try { const r = sessionStorage.getItem(STORE_KEY); return r ? JSON.parse(r) : null; } catch (e) { return null; } }
    function clearStore() { try { sessionStorage.removeItem(STORE_KEY); } catch (e) {} }

    async function call(action, extra) {
        const body = Object.assign({ action: action }, extra || {});
        const { data, error } = await supabase.functions.invoke('leerling', { body: body });
        if (error) {
            let parsed = null;
            try { if (error.context && error.context.json) parsed = await error.context.json(); } catch (e) {}
            return parsed || { ok: false, error: 'Er ging iets mis. Probeer het opnieuw.' };
        }
        return data || { ok: false, error: 'Er ging iets mis.' };
    }

    function wallMap(wallArr) {
        const m = {};
        (wallArr || []).forEach(w => {
            m[w.block_id] = { best_per_min: w.best_per_min, best_accuracy: w.best_accuracy, regressed: w.regressed };
        });
        return m;
    }

    // ---------- Inloggen ----------
    async function doLogin() {
        if (busy) return;
        hideErr(loginError);
        name = (nameInput.value || '').trim();
        code = (codeInput.value || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (!name) { showErr(loginError, 'Vul je voornaam in.'); return; }
        if (code.length < 6) { showErr(loginError, 'Vul je code in (3 letters en 3 cijfers).'); return; }

        busy = true; loginBtn.disabled = true; loginBtn.textContent = 'Even kijken…';
        const res = await call('login', { name: name, code: code });
        busy = false; loginBtn.disabled = false; loginBtn.innerHTML = 'Inloggen &rarr;';

        if (!res.ok) { showErr(loginError, res.error || 'Er ging iets mis.'); return; }
        if (!res.matched) { showErr(loginError, 'Je naam of code klopt niet. Kijk nog eens goed.'); return; }

        displayName = res.displayName || name;
        monster = res.monster || '';
        save();
        showHub();
    }

    function showHub() {
        hubMonster.src = monsterUrl(monster);
        hubHi.textContent = 'Hoi ' + (displayName || name) + '!';
        showScreen('hub');
        loadSessions();
        startSessionsPoll();
    }

    // ---------- Actieve sessies ("Doe nu mee!") ----------
    function stopSessionsPoll() { if (sessionsPoll) { clearInterval(sessionsPoll); sessionsPoll = null; } }
    function startSessionsPoll() { stopSessionsPoll(); sessionsPoll = setInterval(loadSessions, 6000); }
    async function loadSessions() {
        if (!code) return;
        const res = await call('sessions', { code: code });
        renderSessions((res && res.ok && res.sessions) || []);
    }
    function renderSessions(list) {
        if (!list.length) {
            activeSessions.style.display = 'none';
            mineTitle.style.display = 'none';
            activeSessionsGrid.innerHTML = '';
            return;
        }
        activeSessionsGrid.innerHTML = list.map(s => {
            // Sociogram wordt op deze pagina zelf ingevuld (geen aparte link).
            if (s.type === 'sociogram') {
                const done = !!s.submitted;
                return '<div class="tool-card ll-session ll-socio-card' + (done ? ' is-done' : '') + '" ' +
                        'role="button" tabindex="0" data-socio="' + escapeHtml(s.sessionCode || '') + '">' +
                    '<span class="card-icon">' + (s.icon || '🧑‍🤝‍🧑') + '</span>' +
                    '<h3>' + escapeHtml(s.label || 'Sociogram') + '</h3>' +
                    '<p>' + (done ? 'Je hebt dit al ingevuld &#10003;' : 'Vul het in!') + '</p>' +
                    (done ? '' : '<span class="ll-live">&#9679; live</span>') +
                '</div>';
            }
            return '<a class="tool-card ll-session" href="' + escapeHtml(s.joinUrl || '#') + '">' +
                '<span class="card-icon">' + (s.icon || '🎯') + '</span>' +
                '<h3>' + escapeHtml(s.label || 'Sessie') + '</h3>' +
                '<p>Doe mee!</p>' +
                '<span class="ll-live">&#9679; live</span>' +
            '</a>';
        }).join('');

        // Klik op een sociogram-kaart -> invulscherm
        activeSessionsGrid.querySelectorAll('[data-socio]').forEach(el => {
            const open = () => openSociogram(el.getAttribute('data-socio'));
            el.addEventListener('click', open);
            el.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
            });
        });

        activeSessions.style.display = '';
        mineTitle.style.display = '';
    }

    // ---------- Sociogram invullen ----------
    function socioQuestionText(type, kind) {
        const speel = type === 'spelen';
        if (kind === 'pos') return speel ? 'Met deze kinderen speel ik graag' : 'Met deze kinderen werk ik graag samen';
        return speel ? 'Met deze kinderen speel ik liever niet' : 'Met deze kinderen werk ik liever niet';
    }
    function buildSocioSelects(container, mates) {
        let html = '';
        for (let i = 1; i <= 3; i++) {
            html += '<select data-rank="' + i + '"><option value="">&mdash; kies ' + i + ' &mdash;</option>' +
                mates.map(m => '<option value="' + escapeHtml(m.id) + '">' + escapeHtml(m.name) + '</option>').join('') +
                '</select>';
        }
        container.innerHTML = html;
    }
    async function openSociogram(sessionCode) {
        if (!sessionCode) return;
        hideErr(socioError);
        const res = await call('socio_load', { code: code, sessionCode: sessionCode });
        if (!res || !res.ok || !res.found) {
            // Sessie niet (meer) open — ververs de lijst.
            loadSessions();
            return;
        }
        if (res.submitted) {
            currentSocio = { sessionCode: sessionCode, classmates: [], type: res.type };
            showSocioDone();
            return;
        }
        currentSocio = { sessionCode: sessionCode, classmates: res.classmates || [], type: res.type };
        socioTitle.textContent = 'Sociogram invullen';
        socioPosTitle.textContent = socioQuestionText(res.type, 'pos');
        socioNegTitle.textContent = socioQuestionText(res.type, 'neg');
        buildSocioSelects(socioPos, currentSocio.classmates);
        buildSocioSelects(socioNeg, currentSocio.classmates);
        socioForm.style.display = '';
        socioDone.style.display = 'none';
        showScreen('sociogram');
    }
    function collectPicks(container) {
        const out = [];
        container.querySelectorAll('select').forEach(sel => {
            const v = sel.value;
            if (v && out.indexOf(v) === -1) out.push(v);
        });
        return out;
    }
    function hasDuplicate(container) {
        const seen = {};
        let dup = false;
        container.querySelectorAll('select').forEach(sel => {
            if (!sel.value) return;
            if (seen[sel.value]) dup = true;
            seen[sel.value] = true;
        });
        return dup;
    }
    async function sendSocio() {
        if (!currentSocio) return;
        hideErr(socioError);
        if (hasDuplicate(socioPos) || hasDuplicate(socioNeg)) {
            showErr(socioError, 'Je hebt een kind twee keer gekozen. Kies elk kind maar één keer.');
            return;
        }
        const positief = collectPicks(socioPos);
        const negatief = collectPicks(socioNeg);
        if (positief.some(id => negatief.indexOf(id) !== -1)) {
            showErr(socioError, 'Een kind kan niet bij allebei staan. Kies anders.');
            return;
        }
        if (!positief.length && !negatief.length) {
            showErr(socioError, 'Kies eerst minstens één kind.');
            return;
        }
        socioSend.disabled = true; socioSend.textContent = 'Versturen…';
        const res = await call('socio_save', {
            code: code, sessionCode: currentSocio.sessionCode,
            positief: positief, negatief: negatief
        });
        socioSend.disabled = false; socioSend.textContent = 'Klaar! Versturen';
        if (!res || !res.ok) {
            showErr(socioError, (res && res.error) || 'Versturen lukte niet. Probeer opnieuw.');
            return;
        }
        showSocioDone();
    }
    function showSocioDone() {
        socioForm.style.display = 'none';
        socioDone.style.display = '';
        showScreen('sociogram');
    }

    async function showWall() {
        wallTitle.textContent = 'Het muurtje van ' + (displayName || name);
        wallError.classList.remove('show');
        wallEl.innerHTML = '';
        showScreen('wall');
        const res = await call('wall', { code: code });
        if (!res || !res.ok) { showErr(wallError, 'Kon je muurtje niet laden.'); return; }
        if (!res.matched) { showErr(wallError, 'Er is nog geen muurtje voor jou.'); return; }
        wallEl.innerHTML = MTRekenrace.wallHtml(wallMap(res.wall), {});
    }

    // ---------- Typetijger (typcursus) ----------
    // Voortgang loopt per leerling via de edge function; het monster ligt vast
    // en de niveaus gaan pas open na 3 sterren per level op het vorige niveau.
    async function ttLoad() {
        const res = await call('typetijger_load', { code: code });
        return (res && res.ok && res.progress) ? res.progress : {};
    }
    function ttSave(_progress, lessonId, entry) {
        // fire-and-forget; de server bewaart alleen de beste score
        call('typetijger_save', {
            code: code, lessonId: lessonId,
            stars: entry && entry.stars, apm: entry && entry.apm, acc: entry && entry.acc
        });
    }
    function showTypetijger() {
        if (!window.Typetijger) return;
        showScreen('typetijger');
        window.Typetijger.start({
            assetPrefix: '/',
            avatarFixed: monsterUrl(monster),
            lockLevels: true,
            loadProgress: ttLoad,
            saveProgress: ttSave
        });
    }

    function logout() {
        clearStore();
        name = ''; code = ''; displayName = ''; monster = '';
        codeInput.value = ''; nameInput.value = '';
        showScreen('login');
        nameInput.focus();
    }

    // ---------- Init ----------
    function init() {
        codeInput.addEventListener('input', () => {
            codeInput.value = codeInput.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        });
        loginBtn.addEventListener('click', doLogin);
        nameInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') codeInput.focus(); });
        codeInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') doLogin(); });
        tileWall.addEventListener('click', showWall);
        tileWall.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showWall(); } });
        wallBack.addEventListener('click', showHub);
        if (tileTypetijger) {
            tileTypetijger.addEventListener('click', showTypetijger);
            tileTypetijger.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showTypetijger(); } });
        }
        if (ttHubBack) ttHubBack.addEventListener('click', () => {
            if (window.Typetijger) window.Typetijger.showMap();
            showHub();
        });
        socioSend.addEventListener('click', sendSocio);
        socioBack.addEventListener('click', showHub);
        socioDoneBack.addEventListener('click', showHub);
        topLogout.addEventListener('click', logout);

        const saved = restore();
        if (saved && saved.code && saved.name) {
            name = saved.name; code = saved.code; displayName = saved.displayName || saved.name; monster = saved.monster || '';
            showHub();
        } else {
            nameInput.focus();
        }
    }

    init();
})();

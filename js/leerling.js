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

    const screens = {
        login: document.getElementById('screenLogin'),
        hub: document.getElementById('screenHub'),
        wall: document.getElementById('screenWall')
    };
    const wrapEl = document.querySelector('.md-wrap');

    const nameInput = document.getElementById('nameInput');
    const codeInput = document.getElementById('codeInput');
    const loginBtn = document.getElementById('loginBtn');
    const loginError = document.getElementById('loginError');

    const hubMonster = document.getElementById('hubMonster');
    const hubHi = document.getElementById('hubHi');
    const tileWall = document.getElementById('tileWall');
    const hubLogout = document.getElementById('hubLogout');

    const wallTitle = document.getElementById('wallTitle');
    const wallEl = document.getElementById('wall');
    const wallError = document.getElementById('wallError');
    const wallBack = document.getElementById('wallBack');

    const STORE_KEY = 'mt_leerling';
    let busy = false;

    // ---------- Helpers ----------
    function showScreen(key) {
        Object.keys(screens).forEach(k => screens[k].classList.toggle('active', k === key));
        if (wrapEl) wrapEl.classList.toggle('is-wide', key === 'wall');
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
        wallBack.addEventListener('click', showHub);
        hubLogout.addEventListener('click', logout);

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

/* ============================================
   MEEDOEN - publieke leerlingkant van sessie-tools

   Geen account nodig. Alle acties lopen via de Edge Function
   'complimentenmuur' (supabase.functions.invoke stuurt automatisch
   de anon-key mee als geldige JWT). De pagina pollt de status zodat
   het scherm meebeweegt met wat de leerkracht doet (lobby -> invullen
   -> afgesloten).
   ============================================ */

(function () {
    const POLL_MS = 2500;

    // ---------- State ----------
    let code = '';
    let participantId = null;
    let name = '';
    let focusName = '';
    let status = '';
    let sentCount = 0;
    let pollTimer = null;
    let busy = false;

    // ---------- DOM ----------
    const screens = {
        join: document.getElementById('screenJoin'),
        wait: document.getElementById('screenWait'),
        write: document.getElementById('screenWrite'),
        closed: document.getElementById('screenClosed')
    };
    const codeInput = document.getElementById('codeInput');
    const nameInput = document.getElementById('nameInput');
    const joinBtn = document.getElementById('joinBtn');
    const joinError = document.getElementById('joinError');

    const waitHi = document.getElementById('waitHi');
    const waitFocus = document.getElementById('waitFocus');

    const writeFocus = document.getElementById('writeFocus');
    const writeSuccess = document.getElementById('writeSuccess');
    const writeError = document.getElementById('writeError');
    const textInput = document.getElementById('textInput');
    const charCount = document.getElementById('charCount');
    const sendBtn = document.getElementById('sendBtn');
    const sentCountEl = document.getElementById('sentCount');

    const STORE_KEY = 'mt_meedoen';

    // ---------- Helpers ----------
    function showScreen(key) {
        Object.keys(screens).forEach(k => screens[k].classList.toggle('active', k === key));
    }
    function showErr(el, msg) { el.textContent = msg; el.classList.add('show'); }
    function hideErr(el) { el.classList.remove('show'); }
    function save() {
        try { sessionStorage.setItem(STORE_KEY, JSON.stringify({ code, participantId, name })); } catch (e) {}
    }
    function restore() {
        try {
            const raw = sessionStorage.getItem(STORE_KEY);
            if (!raw) return null;
            return JSON.parse(raw);
        } catch (e) { return null; }
    }
    function clearStore() { try { sessionStorage.removeItem(STORE_KEY); } catch (e) {} }

    async function call(action, extra) {
        return callOther('complimentenmuur', action, extra);
    }

    async function callOther(fn, action, extra) {
        const body = Object.assign({ action: action, code: code }, extra || {});
        const { data, error } = await supabase.functions.invoke(fn, { body: body });
        if (error) {
            // Edge Function-fouten (4xx/5xx) komen ook hier binnen; probeer body te lezen
            let parsed = null;
            try { if (error.context && error.context.json) parsed = await error.context.json(); } catch (e) {}
            return parsed || { ok: false, error: 'Er ging iets mis. Probeer het opnieuw.' };
        }
        return data || { ok: false, error: 'Er ging iets mis.' };
    }

    // ---------- Routing op status ----------
    function routeByStatus(st) {
        status = st;
        if (st === 'closed') { showScreen('closed'); stopPolling(); return; }
        if (st === 'collecting') {
            writeFocus.innerHTML = 'Voor <strong>' + escapeHtml(focusName) + '</strong>';
            showScreen('write');
            textInput.focus();
            return;
        }
        // lobby
        waitHi.textContent = 'Je doet mee, ' + name + '!';
        waitFocus.innerHTML = focusName
            ? 'Zo ga je een compliment schrijven voor <strong>' + escapeHtml(focusName) + '</strong>.'
            : '';
        showScreen('wait');
    }

    function escapeHtml(str) {
        const d = document.createElement('div');
        d.textContent = String(str == null ? '' : str);
        return d.innerHTML;
    }

    // ---------- Polling ----------
    function startPolling() {
        stopPolling();
        pollTimer = setInterval(async () => {
            const res = await call('status');
            if (!res || !res.ok) return;
            if (!res.exists) { stopPolling(); return; }
            if (res.focusName) focusName = res.focusName;
            if (res.status && res.status !== status) routeByStatus(res.status);
        }, POLL_MS);
    }
    function stopPolling() { if (pollTimer) { clearInterval(pollTimer); pollTimer = null; } }

    // ---------- Aanmelden ----------
    async function doJoin() {
        if (busy) return;
        hideErr(joinError);
        code = (codeInput.value || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
        name = (nameInput.value || '').trim();
        if (code.length < 4) { showErr(joinError, 'Vul de code van het bord in.'); return; }
        if (!name) { showErr(joinError, 'Vul je voornaam in.'); return; }

        busy = true; joinBtn.disabled = true; joinBtn.textContent = 'Even kijken…';
        const res = await call('join', { name: name });

        if (res.ok && !res.exists) {
            // Geen complimentenmuur met deze code — misschien een escape
            // room-sessie? Dan doorsturen naar de escape room-spelpagina.
            const er = await callOther('escaperoom-sessie', 'status');
            if (er && er.ok && er.exists) {
                window.location.href = 'meedoen-escaperoom?code=' + encodeURIComponent(code) +
                    '&naam=' + encodeURIComponent(name);
                return;
            }
        }
        busy = false; joinBtn.disabled = false; joinBtn.innerHTML = 'Doe mee &rarr;';

        if (!res.ok) { showErr(joinError, res.error || 'Er ging iets mis.'); return; }
        if (!res.exists) { showErr(joinError, 'Deze code klopt niet. Kijk nog eens op het bord.'); return; }
        if (res.status === 'closed') { routeByStatus('closed'); return; }
        if (!res.participantId) { showErr(joinError, 'Aanmelden lukte niet. Probeer opnieuw.'); return; }

        participantId = res.participantId;
        focusName = res.focusName || '';
        save();
        startPolling();
        routeByStatus(res.status || 'lobby');
    }

    // ---------- Compliment versturen ----------
    async function doSend() {
        if (busy) return;
        hideErr(writeError); writeSuccess.classList.remove('show');
        const text = (textInput.value || '').trim();
        if (!text) { showErr(writeError, 'Typ eerst een compliment.'); return; }

        busy = true; sendBtn.disabled = true; sendBtn.textContent = 'Versturen…';
        const res = await call('submit', { participantId: participantId, text: text });
        busy = false; sendBtn.disabled = false; sendBtn.textContent = 'Versturen';

        if (!res.ok) {
            // Status kan intussen veranderd zijn (gesloten / nog niet open)
            if (res.status && res.status !== 'collecting') { routeByStatus(res.status); return; }
            showErr(writeError, res.error || 'Versturen lukte niet.');
            return;
        }
        sentCount++;
        textInput.value = '';
        charCount.textContent = '0';
        writeSuccess.textContent = res.moderated
            ? 'Verstuurd! De juf of meester kijkt er even naar. Je mag er nog meer schrijven ✨'
            : 'Verstuurd — staat op het bord! Schrijf gerust nog een compliment ✨';
        writeSuccess.classList.add('show');
        sentCountEl.textContent = sentCount === 1
            ? 'Je hebt 1 compliment verstuurd.'
            : 'Je hebt ' + sentCount + ' complimenten verstuurd. Top!';
        textInput.focus();
    }

    // ---------- Init ----------
    function init() {
        // Code uit de URL (?code=...) — bijv. via de QR-code
        const params = new URLSearchParams(location.search);
        const urlCode = (params.get('code') || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (urlCode) codeInput.value = urlCode;

        codeInput.addEventListener('input', () => {
            codeInput.value = codeInput.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        });
        joinBtn.addEventListener('click', doJoin);
        nameInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') doJoin(); });
        sendBtn.addEventListener('click', doSend);
        textInput.addEventListener('input', () => { charCount.textContent = textInput.value.length; });

        // Eerder aangemeld in deze sessie? (refresh / per ongeluk weggeklikt)
        const saved = restore();
        if (saved && saved.participantId && (!urlCode || urlCode === saved.code)) {
            code = saved.code; participantId = saved.participantId; name = saved.name || '';
            call('status').then(res => {
                if (res && res.ok && res.exists && res.status !== 'closed') {
                    focusName = res.focusName || '';
                    startPolling();
                    routeByStatus(res.status);
                } else if (res && res.exists && res.status === 'closed') {
                    routeByStatus('closed');
                } else {
                    clearStore(); // sessie bestaat niet meer
                }
            });
        } else if (urlCode) {
            nameInput.focus();
        }
    }

    init();
})();

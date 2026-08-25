/* ============================================
   MEESTERTOOLS - Typrace (leerkracht / host)

   De leerkracht start een klassikale typrace: code + QR op het bord, kinderen
   doen mee via /meedoen-typrace, en de leerkracht ziet een live-ranglijst
   (realtime op typrace_participants). Volgt het Rekenrace-sessiepatroon.
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {
    if (typeof supabase === 'undefined') return;

    var userId = null, groupId = null;
    var session = null;         // { id, code, status, duration_s, started_at }
    var participants = [];
    var channel = null;
    var clockTimer = null;

    function $(id) { return document.getElementById(id); }
    function esc(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : s; return d.innerHTML; }
    function fmt(s) { var m = Math.floor(s / 60); return m + ':' + ('0' + (s % 60)).slice(-2); }

    // ---------- Sessie-lifecycle ----------
    function genCode(len) { return MT.genCode(len); }
    async function findOpenSession() {
        if (!groupId) return null;
        var res = await supabase.from('typrace_sessions').select('*')
            .eq('user_id', userId).eq('group_id', groupId).in('status', ['lobby', 'playing'])
            .order('created_at', { ascending: false }).limit(1).maybeSingle();
        return res.data || null;
    }
    async function createSession() {
        var created = null, lastErr = null;
        for (var attempt = 0; attempt < 6 && !created; attempt++) {
            var res = await supabase.from('typrace_sessions').insert({
                user_id: userId, group_id: groupId, code: genCode(5), status: 'lobby', duration_s: 90
            }).select().single();
            if (!res.error) { created = res.data; break; }
            lastErr = res.error;
            if (res.error.code !== '23505') break;
        }
        if (!created) { console.error('createSession', lastErr); showError('Een race starten lukte niet. Ververs de pagina.'); return null; }
        return created;
    }
    async function loadParticipants() {
        if (!session) return;
        var res = await supabase.from('typrace_participants')
            .select('id, display_name, monster, score, created_at')
            .eq('session_id', session.id).order('created_at');
        participants = res.data || [];
    }
    function subscribe() {
        if (channel) { try { supabase.removeChannel(channel); } catch (e) {} channel = null; }
        if (!session) return;
        channel = supabase.channel('tr-' + session.id)
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'typrace_participants', filter: 'session_id=eq.' + session.id },
                async function () { await loadParticipants(); render(); })
            .subscribe();
    }

    async function startRace() {
        if (!session) return;
        var dur = parseInt(($('trqDuration') || {}).value, 10) || 90;
        $('trqStartBtn').disabled = true;
        var res = await supabase.from('typrace_sessions')
            .update({ status: 'playing', duration_s: dur, started_at: new Date().toISOString() })
            .eq('id', session.id);
        if (res.error) { $('trqStartBtn').disabled = false; showError('Starten lukte niet.'); return; }
        session.status = 'playing'; session.duration_s = dur; session.started_at = new Date().toISOString();
        render();
    }
    async function stopRace() {
        if (!session) return;
        await supabase.from('typrace_sessions').update({ status: 'closed', closed_at: new Date().toISOString() }).eq('id', session.id);
        session.status = 'closed';
        stopClock();
        render();
    }
    async function newRace() {
        stopClock();
        var created = await createSession();
        if (!created) return;
        session = created; participants = [];
        subscribe();
        render();
    }

    // ---------- Klok ----------
    function startClock() {
        stopClock();
        clockTimer = setInterval(function () {
            if (!session || !session.started_at) return;
            var rem = Math.max(0, Math.round((new Date(session.started_at).getTime() + session.duration_s * 1000 - Date.now()) / 1000));
            var t = $('trqTimer'); if (t) t.textContent = fmt(rem);
            if (rem <= 0) { stopClock(); stopRace(); }
        }, 250);
    }
    function stopClock() { if (clockTimer) { clearInterval(clockTimer); clockTimer = null; } }

    // ---------- Render ----------
    function sorted() {
        return participants.slice().sort(function (a, b) {
            if (b.score !== a.score) return b.score - a.score;
            return new Date(a.created_at) - new Date(b.created_at);
        });
    }
    function joinUrl() { return location.origin + '/meedoen-typrace?code=' + (session ? session.code : ''); }

    function render() {
        var st = session ? session.status : 'lobby';
        if (st === 'lobby') renderLobby();
        else renderRace(st);
    }

    function renderLobby() {
        $('trqRoot').innerHTML =
            '<div class="trq-lobby">' +
                '<div class="trq-join">' +
                    '<div class="trq-join-label">Ga naar <b>' + esc(location.host) + '/meedoen-typrace</b> en typ de code:</div>' +
                    '<div class="trq-code" id="trqCode">' + esc(session.code) + '</div>' +
                    '<div class="trq-qr" id="trqQr"></div>' +
                '</div>' +
                '<div class="trq-lobbyright">' +
                    '<div class="trq-count"><span id="trqCount">' + participants.length + '</span> kinderen doen mee</div>' +
                    '<div class="trq-chips" id="trqChips"></div>' +
                    '<div class="trq-controls">' +
                        '<label class="trq-dur">Tijd: <select id="trqDuration">' +
                            '<option value="60">1 min</option>' +
                            '<option value="90" selected>1½ min</option>' +
                            '<option value="120">2 min</option>' +
                        '</select></label>' +
                        '<button class="trq-btn primary" id="trqStartBtn"' + (participants.length ? '' : ' disabled') + '>Start de race!</button>' +
                    '</div>' +
                '</div>' +
            '</div>';
        renderQr();
        renderChips();
        $('trqStartBtn').onclick = startRace;
    }
    function renderChips() {
        var chips = $('trqChips'); if (!chips) return;
        chips.innerHTML = participants.map(function (p) {
            return '<span class="trq-chip"><img src="/' + esc((p.monster || '').replace(/^\/+/, '')) + '" alt="">' + esc(p.display_name) + '</span>';
        }).join('') || '<span class="trq-empty">Nog niemand… deel de code!</span>';
    }
    function renderQr() {
        var box = $('trqQr'); if (!box || typeof qrcode === 'undefined') return;
        try { var qr = qrcode(0, 'M'); qr.addData(joinUrl()); qr.make(); box.innerHTML = qr.createImgTag(5, 8); } catch (e) {}
    }

    function renderRace(st) {
        var closed = st === 'closed';
        var rows = sorted();
        var board = rows.map(function (p, i) {
            var medal = i === 0 ? '&#129351;' : i === 1 ? '&#129352;' : i === 2 ? '&#129353;' : (i + 1) + '.';
            var pct = rows[0] && rows[0].score ? Math.round(p.score / rows[0].score * 100) : 0;
            return '<div class="trq-row' + (i < 3 ? ' top' : '') + '">' +
                '<span class="trq-rank">' + medal + '</span>' +
                '<img class="trq-av" src="/' + esc((p.monster || '').replace(/^\/+/, '')) + '" alt="">' +
                '<span class="trq-name">' + esc(p.display_name) + '</span>' +
                '<span class="trq-bar"><span style="width:' + pct + '%"></span></span>' +
                '<span class="trq-score">' + p.score + '</span>' +
            '</div>';
        }).join('') || '<div class="trq-empty">Nog geen scores…</div>';

        $('trqRoot').innerHTML =
            '<div class="trq-race">' +
                '<div class="trq-racehead">' +
                    '<span class="trq-pill ' + (closed ? 'done' : 'live') + '">' + (closed ? 'Afgelopen' : '&#9679; Live') + '</span>' +
                    (closed ? '' : '<span class="trq-timer" id="trqTimer">' + fmt(session.duration_s) + '</span>') +
                    '<div class="trq-racebtns">' +
                        (closed
                            ? '<button class="trq-btn primary" id="trqNew">Nieuwe race</button>'
                            : '<button class="trq-btn ghost" id="trqStop">Stop</button>') +
                    '</div>' +
                '</div>' +
                (closed ? '<div class="trq-winner">' + (rows[0] ? '&#127942; ' + esc(rows[0].display_name) + ' wint met ' + rows[0].score + ' woorden!' : 'Geen deelnemers.') + '</div>' : '') +
                '<div class="trq-board">' + board + '</div>' +
            '</div>';

        if (closed) { var nb = $('trqNew'); if (nb) nb.onclick = newRace; }
        else { var sb = $('trqStop'); if (sb) sb.onclick = stopRace; startClock(); }
    }

    function showError(msg) {
        var r = $('trqRoot'); if (r) r.innerHTML = '<div class="trq-fatal">' + esc(msg) + '</div>';
    }

    // ---------- Init ----------
    async function init() {
        var sres = await supabase.auth.getSession();
        var s = sres && sres.data ? sres.data.session : null;
        if (!s) return; // app.js stuurt door naar login
        userId = s.user.id;
        try { supabase.realtime.setAuth(s.access_token); } catch (e) {}

        try {
            if (window.MTActiveClass && window.MTActiveClass.ready) await window.MTActiveClass.ready;
            groupId = (window.MTActiveClass && window.MTActiveClass.getId && window.MTActiveClass.getId()) || null;
        } catch (e) {}
        if (!groupId) {
            var g = await supabase.from('groups').select('id').eq('user_id', userId).eq('archived', false).order('name').limit(1).maybeSingle();
            groupId = g.data ? g.data.id : null;
        }
        if (!groupId) { showError('Stel eerst een klas in via Instellingen → Mijn klas.'); if (window.hidePageLoader) window.hidePageLoader(); return; }

        session = await findOpenSession();
        if (!session) session = await createSession();
        if (!session) { if (window.hidePageLoader) window.hidePageLoader(); return; }
        await loadParticipants();
        subscribe();
        render();

        // wisselt de leerkracht van klas -> nieuwe race in die klas
        if (window.MTActiveClass && window.MTActiveClass.onChange) {
            window.MTActiveClass.onChange(async function (id) {
                if (!id || id === groupId) return;
                groupId = id; stopClock();
                if (channel) { try { supabase.removeChannel(channel); } catch (e) {} channel = null; }
                session = await findOpenSession(); if (!session) session = await createSession();
                if (session) { await loadParticipants(); subscribe(); render(); }
            });
        }

        if (window.hidePageLoader) window.hidePageLoader();
    }

    init();
});

/* ============================================
   MEESTERTOOLS - Live sessies (header-badge)

   Toont in de header een knopje met een badge: hoeveel sessies staan er
   nu live voor je leerlingen? Dezelfde bronnen die de leerling op zijn
   eigen pagina onder "Doe nu mee!" ziet:
     - Rekenrace (lobby/playing)
     - Escape room (lobby/playing)
     - Complimentenmuur (lobby/collecting)
     - Sociogram (open)

   Zo zie je in één oogopslag wat er actief is, zonder de tools te openen.
   Klik op het knopje voor de lijst; elk item linkt naar de bijbehorende tool.

   Laadt na supabase-config.js + app.js + active-class.js (voor de groepsnamen).
   ============================================ */

(function () {
    var POLL_MS = 20000;

    var TYPES = {
        rekenrace:  { icon: '&#129518;',              url: '/lesmateriaal/rekenrace' },
        escaperoom: { icon: '&#128477;&#65039;',      url: '/educatieve-games/escaperooms' },
        compliment: { icon: '&#128155;',              url: '/groepsvorming/complimentenmuur' },
        sociogram:  { icon: '&#129309;',              url: '/groepsvorming/sociogram' }
    };

    var wrap, btn, panel, list, badge;
    var pollTimer = null;
    var userId = null;
    var groupNames = {};

    function $(id) { return document.getElementById(id); }
    function esc(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : s; return d.innerHTML; }

    // ---------- Header-widget ----------
    function build(header) {
        if ($('mtLive')) return;
        wrap = document.createElement('div');
        wrap.className = 'mt-live';
        wrap.id = 'mtLive';
        wrap.innerHTML =
            '<button class="mt-live-btn" id="mtLiveBtn" title="Live sessies voor je klas" aria-label="Live sessies">' +
                '<span class="mt-live-icon">&#128225;</span>' +
                '<span class="mt-live-badge" id="mtLiveBadge" hidden>0</span>' +
            '</button>' +
            '<div class="mt-live-panel" id="mtLivePanel">' +
                '<div class="mt-live-head">Live voor je klas</div>' +
                '<div class="mt-live-list" id="mtLiveList"></div>' +
            '</div>';

        var anchor = header.querySelector('.mt-class-switcher') || header.querySelector('.header-profile');
        if (anchor) header.insertBefore(wrap, anchor);
        else header.appendChild(wrap);

        btn = $('mtLiveBtn'); panel = $('mtLivePanel'); list = $('mtLiveList'); badge = $('mtLiveBadge');

        btn.addEventListener('click', function (e) { e.stopPropagation(); panel.classList.toggle('open'); });
        document.addEventListener('click', function (e) { if (wrap && !wrap.contains(e.target)) panel.classList.remove('open'); });
    }

    function chip(status) {
        if (status === 'lobby') return '<span class="mt-live-chip wacht">wachtkamer</span>';
        return '<span class="mt-live-chip live">&#9679; live</span>';
    }

    function render(items) {
        if (!wrap) return;
        var n = items.length;
        wrap.classList.toggle('has-live', n > 0);
        if (n > 0) { badge.hidden = false; badge.textContent = n > 9 ? '9+' : String(n); }
        else { badge.hidden = true; }

        if (!n) {
            list.innerHTML = '<div class="mt-live-empty">Niets actief nu.<br>Start een sessie vanuit een tool &mdash; je leerlingen zien hem dan meteen op hun eigen pagina.</div>';
            return;
        }

        var multiClass = Object.keys(groupNames).length > 1;
        list.innerHTML = items.map(function (it) {
            var sub = (multiClass && it.groupName) ? esc(it.groupName) : esc(it.sub);
            return '<a class="mt-live-item" href="' + TYPES[it.type].url + '">' +
                '<span class="mt-live-item-icon">' + TYPES[it.type].icon + '</span>' +
                '<span class="mt-live-item-main">' +
                    '<span class="mt-live-item-title">' + esc(it.title) + '</span>' +
                    '<span class="mt-live-item-sub">' + sub + '</span>' +
                '</span>' + chip(it.status) + '</a>';
        }).join('');
    }

    // ---------- Sessies ophalen ----------
    async function load() {
        if (typeof supabase === 'undefined' || !userId) return;
        try {
            var res = await Promise.all([
                supabase.from('rekenrace_sessions')
                    .select('block_label, status, group_id')
                    .eq('user_id', userId).eq('purpose', 'race').in('status', ['lobby', 'playing']),
                supabase.from('escaperoom_sessions')
                    .select('status, group_id, escaperooms(title)')
                    .eq('user_id', userId).in('status', ['lobby', 'playing']),
                supabase.from('compliment_sessions')
                    .select('status, group_id, focus_student_name')
                    .eq('user_id', userId).in('status', ['lobby', 'collecting']),
                supabase.from('sociogram_sessions')
                    .select('status, type, group_id')
                    .eq('user_id', userId).eq('status', 'open')
            ]);

            var items = [];
            (res[0].data || []).forEach(function (s) {
                items.push({ type: 'rekenrace', status: s.status, groupName: groupNames[s.group_id],
                    sub: 'Rekenrace', title: 'Rekenrace' + (s.block_label ? ' · ' + s.block_label : '') });
            });
            (res[1].data || []).forEach(function (s) {
                var t = s.escaperooms && s.escaperooms.title;
                items.push({ type: 'escaperoom', status: s.status, groupName: groupNames[s.group_id],
                    sub: 'Escape room', title: 'Escape room' + (t ? ' · ' + t : '') });
            });
            (res[2].data || []).forEach(function (s) {
                items.push({ type: 'compliment', status: s.status, groupName: groupNames[s.group_id],
                    sub: 'Complimentenmuur', title: 'Complimentenmuur' + (s.focus_student_name ? ' · ' + s.focus_student_name : '') });
            });
            (res[3].data || []).forEach(function (s) {
                var tl = s.type === 'werken' ? 'samen werken' : s.type === 'spelen' ? 'samen spelen' : '';
                items.push({ type: 'sociogram', status: 'open', groupName: groupNames[s.group_id],
                    sub: 'Sociogram', title: 'Sociogram' + (tl ? ' · ' + tl : '') });
            });

            render(items);
        } catch (e) { /* stil falen — badge blijft staan zoals 'ie was */ }
    }

    function startPoll() { stopPoll(); pollTimer = setInterval(load, POLL_MS); }
    function stopPoll() { if (pollTimer) { clearInterval(pollTimer); pollTimer = null; } }

    // ---------- Init ----------
    async function init() {
        var header = document.querySelector('.app-header');
        if (!header || typeof supabase === 'undefined') return;

        try {
            var sres = await supabase.auth.getSession();
            var session = sres && sres.data ? sres.data.session : null;
            if (!session) return;
            userId = session.user.id;
        } catch (e) { return; }

        // Groepsnamen voor het geval er meerdere klassen live zijn.
        try {
            if (window.MTActiveClass && window.MTActiveClass.ready) await window.MTActiveClass.ready;
            (window.MTActiveClass ? window.MTActiveClass.getGroups() : []).forEach(function (g) {
                groupNames[g.id] = g.name;
            });
        } catch (e) { /* groepsnamen zijn optioneel */ }

        build(header);
        load();
        startPoll();

        window.addEventListener('mt:activeclass', load);
        document.addEventListener('visibilitychange', function () { if (!document.hidden) load(); });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

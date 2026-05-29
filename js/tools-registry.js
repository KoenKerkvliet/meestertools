/* ============================================
   MEESTERTOOLS - Tools register + Favorieten/Laatst gebruikt

   - Centrale lijst van alle losse tools (window.MTTools).
   - Zet een sterretje op elke tool-kaart waarmee je de tool favoriet
     maakt (favorieten worden gesynct naar je account).
   - Houdt bij welke tools je laatst gebruikt hebt (klik op een
     tool-kaart) in localStorage, gesynct naar je account.
   - Toont op het dashboard een compacte favorieten- en
     "laatst gebruikt"-balk.

   Wordt geladen op het dashboard en op de categoriepagina's.
   ============================================ */

(function () {
    var RECENT_KEY = 'mt_recent_tools';
    var FAV_KEY = 'mt_favorites';
    var RECENT_MAX = 8;

    // ---------- Tool-register ----------
    var TOOLS = [
        // Digibordtools
        { id: 'dobbelstenen', name: 'Dobbelstenen', url: 'digibord/dobbelstenen', icon: '&#127922;' },
        { id: 'draairad', name: 'Draairad', url: 'digibord/draairad', icon: '&#127920;' },
        { id: 'geluidsmeter', name: 'Geluidsmeter', url: 'digibord/geluidsmeter', icon: '&#128266;' },
        { id: 'groepjesmaker', name: 'Groepjesmaker', url: 'digibord/groepjesmaker', icon: '&#128101;' },
        { id: 'namenkiezer', name: 'Namenkiezer', url: 'digibord/namenkiezer', icon: '&#9997;&#65039;' },
        { id: 'podium', name: 'Podium', url: 'digibord/podium', icon: '&#127942;' },
        { id: 'stoplicht', name: 'Stoplicht', url: 'digibord/stoplicht', icon: '&#128678;' },
        { id: 'timetimer', name: 'Time Timer', url: 'digibord/timetimer', icon: '&#9202;' },
        // Educatieve games
        { id: '24game', name: '24 Game', url: 'educatieve-games/24game', icon: '&#127922;' },
        { id: 'potje1000', name: 'Potje 1000', url: 'educatieve-games/potje1000', icon: '&#127919;' },
        // Klasseprestatie
        { id: 'klasseprestatie', name: 'Klasseprestatie', url: 'klasseprestatie', icon: '&#127942;' },
        // Lesmateriaal
        { id: 'vraagvandedag', name: 'Vraag van de Dag', url: 'lesmateriaal/vraagvandedag', icon: '&#10067;' },
        { id: 'woordenflitsen', name: 'Woorden Flitsen', url: 'lesmateriaal/woordenflitsen', icon: '&#9889;' },
        { id: 'werkbladen', name: 'Werkbladen', url: 'lesmateriaal/werkbladen', icon: '&#128196;' },
        // Ontspanning
        { id: 'naamkleurplaat', name: 'Naamkleurplaat', url: 'ontspanning/naamkleurplaat', icon: '&#127912;' },
        // SEO
        { id: 'checkin', name: 'Check-in', url: 'seo/checkin', icon: '&#128522;' },
        { id: 'gedragspatroon', name: 'Gedragspatroon', url: 'seo/gedragspatroon', icon: '&#128202;' },
        { id: 'sociogram', name: 'Sociogram', url: 'seo/sociogram', icon: '&#129309;' },
        // Organisatie
        { id: 'klassendienst', name: 'Klassendienst', url: 'organisatie/klassendienst', icon: '&#129529;' }
    ];

    var byId = {};
    var byUrl = {};
    TOOLS.forEach(function (t) { byId[t.id] = t; byUrl[t.url] = t; });

    function normalizeHref(href) {
        if (!href) return '';
        var path = href;
        try {
            var u = new URL(href, window.location.href);
            path = u.pathname;
        } catch (e) { /* relatief pad zonder origin */ }
        path = path.split('?')[0].split('#')[0];
        path = path.replace(/^\/+/, '').replace(/\.html$/, '').replace(/\/+$/, '');
        return path;
    }

    function findByHref(href) {
        return byUrl[normalizeHref(href)] || null;
    }

    // ---------- localStorage ----------
    function readArr(key) {
        try {
            var raw = localStorage.getItem(key);
            var arr = raw ? JSON.parse(raw) : [];
            return Array.isArray(arr) ? arr.filter(function (id) { return byId[id]; }) : [];
        } catch (e) { return []; }
    }
    function writeArr(key, arr, cap) {
        try { localStorage.setItem(key, JSON.stringify(cap ? arr.slice(0, cap) : arr)); } catch (e) {}
    }
    function recordLocal(id) {
        if (!byId[id]) return;
        var arr = readArr(RECENT_KEY).filter(function (x) { return x !== id; });
        arr.unshift(id);
        writeArr(RECENT_KEY, arr, RECENT_MAX);
    }

    // ---------- DB prefs ----------
    var state = { favorites: [], recent: [], user: null };

    async function getUser() {
        try {
            if (typeof supabase === 'undefined') return null;
            var res = await supabase.auth.getSession();
            return res && res.data && res.data.session ? res.data.session.user : null;
        } catch (e) { return null; }
    }

    async function loadPrefs(user) {
        var prefs = { favorites: [], recent: [] };
        var res = await supabase
            .from('tool_settings')
            .select('settings')
            .eq('user_id', user.id)
            .eq('tool_name', 'dashboard_prefs')
            .maybeSingle();
        if (res.data && res.data.settings) {
            var s = res.data.settings;
            if (Array.isArray(s.favorites)) prefs.favorites = s.favorites.filter(function (id) { return byId[id]; });
            if (Array.isArray(s.recent)) prefs.recent = s.recent.filter(function (id) { return byId[id]; });
        }
        return prefs;
    }

    async function savePrefs() {
        if (!state.user) return;
        try {
            await supabase
                .from('tool_settings')
                .upsert({
                    user_id: state.user.id,
                    tool_name: 'dashboard_prefs',
                    settings: { favorites: state.favorites, recent: state.recent },
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id,tool_name' });
        } catch (e) { /* stil falen */ }
    }

    // ---------- Publieke API ----------
    window.MTTools = {
        list: TOOLS,
        byId: byId,
        findByHref: findByHref,
        recordLocal: recordLocal
    };

    // ---------- Klik-registratie ----------
    document.addEventListener('click', function (e) {
        var a = e.target.closest ? e.target.closest('a[href]') : null;
        if (!a) return;
        var tool = findByHref(a.getAttribute('href'));
        if (tool) recordLocal(tool.id);
    });

    // ---------- Sterretje op tool-kaarten ----------
    function toggleFavorite(id) {
        if (!byId[id]) return;
        var idx = state.favorites.indexOf(id);
        if (idx === -1) state.favorites.unshift(id);
        else state.favorites.splice(idx, 1);
        writeArr(FAV_KEY, state.favorites);
        decorateCards();
        renderDashboard();
        savePrefs();
    }

    function decorateCards() {
        var cards = document.querySelectorAll('a.tool-card');
        cards.forEach(function (a) {
            var tool = findByHref(a.getAttribute('href'));
            if (!tool) return;
            var btn = a.querySelector('.mt-card-fav');
            if (!btn) {
                btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'mt-card-fav';
                btn.setAttribute('aria-label', 'Favoriet');
                a.appendChild(btn);
                btn.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleFavorite(tool.id);
                });
            }
            var fav = state.favorites.indexOf(tool.id) !== -1;
            btn.classList.toggle('active', fav);
            btn.innerHTML = fav ? '&#9733;' : '&#9734;';
            btn.title = fav ? 'Verwijder uit favorieten' : 'Voeg toe aan favorieten';
        });
    }

    // ---------- Dashboard render (compact) ----------
    function escapeHtml(str) {
        var div = document.createElement('div');
        div.textContent = str == null ? '' : str;
        return div.innerHTML;
    }

    function pillHtml(tool) {
        return '<a class="mt-pill" href="' + tool.url + '">' +
            '<span class="mt-pill-icon">' + tool.icon + '</span>' +
            '<span class="mt-pill-name">' + escapeHtml(tool.name) + '</span>' +
            '</a>';
    }

    function rowHtml(labelIcon, label, ids) {
        return '<div class="mt-quick-row">' +
            '<span class="mt-quick-label"><span class="mt-quick-label-icon">' + labelIcon + '</span>' + label + '</span>' +
            '<div class="mt-pill-group">' + ids.map(function (id) { return pillHtml(byId[id]); }).join('') + '</div>' +
            '</div>';
    }

    function renderDashboard() {
        var mount = document.getElementById('dashboardExtras');
        if (!mount) return;

        var favIds = state.favorites.filter(function (id) { return byId[id]; });
        var recentIds = state.recent.filter(function (id) { return favIds.indexOf(id) === -1; }).slice(0, 6);

        var html = '';
        if (favIds.length) html += rowHtml('&#11088;', 'Favorieten', favIds);
        if (recentIds.length) html += rowHtml('&#128339;', 'Laatst gebruikt', recentIds);
        mount.innerHTML = html;
    }

    // ---------- Init ----------
    async function init() {
        // 1) Direct met lokale data tonen (snel, geen flikkering)
        state.favorites = readArr(FAV_KEY);
        state.recent = readArr(RECENT_KEY);
        decorateCards();
        renderDashboard();

        // 2) Account-data ophalen en synchroniseren
        var user = await getUser();
        if (!user) return;
        state.user = user;

        var prefs = await loadPrefs(user);

        // Favorieten: account is leidend
        state.favorites = prefs.favorites;
        writeArr(FAV_KEY, state.favorites);

        // Recent: lokaal + account samenvoegen (lokaal = recenter)
        var merged = [];
        readArr(RECENT_KEY).concat(prefs.recent).forEach(function (id) {
            if (byId[id] && merged.indexOf(id) === -1) merged.push(id);
        });
        merged = merged.slice(0, RECENT_MAX);
        state.recent = merged;
        writeArr(RECENT_KEY, merged, RECENT_MAX);

        decorateCards();
        renderDashboard();

        // Eventuele samengevoegde recent terugschrijven
        if (JSON.stringify(merged) !== JSON.stringify(prefs.recent)) savePrefs();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

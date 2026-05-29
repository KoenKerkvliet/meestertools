/* ============================================
   MEESTERTOOLS - Tools register + Favorieten/Laatst gebruikt

   - Centrale lijst van alle losse tools (window.MTTools).
   - Houdt bij welke tools je laatst gebruikt hebt (klikken op een
     tool-kaart) in localStorage, gesynct naar je account.
   - Rendert op het dashboard een favorietenbalk + "Laatst gebruikt".

   Wordt geladen op het dashboard en op de categoriepagina's, zodat
   kliks op tool-kaarten overal geregistreerd worden.
   ============================================ */

(function () {
    var RECENT_KEY = 'mt_recent_tools';
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
        // absolute of relative -> alleen het pad
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

    // ---------- localStorage recent ----------
    function readLocalRecent() {
        try {
            var raw = localStorage.getItem(RECENT_KEY);
            var arr = raw ? JSON.parse(raw) : [];
            return Array.isArray(arr) ? arr.filter(function (id) { return byId[id]; }) : [];
        } catch (e) { return []; }
    }
    function writeLocalRecent(arr) {
        try { localStorage.setItem(RECENT_KEY, JSON.stringify(arr.slice(0, RECENT_MAX))); } catch (e) {}
    }
    function recordLocal(id) {
        if (!byId[id]) return;
        var arr = readLocalRecent();
        arr = arr.filter(function (x) { return x !== id; });
        arr.unshift(id);
        writeLocalRecent(arr);
    }

    // ---------- DB prefs ----------
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

    async function savePrefs(user, prefs) {
        await supabase
            .from('tool_settings')
            .upsert({
                user_id: user.id,
                tool_name: 'dashboard_prefs',
                settings: { favorites: prefs.favorites, recent: prefs.recent },
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id,tool_name' });
    }

    // ---------- Publieke API ----------
    window.MTTools = {
        list: TOOLS,
        byId: byId,
        findByHref: findByHref,
        recordLocal: recordLocal
    };

    // ---------- Klik-registratie (overal waar dit script geladen is) ----------
    document.addEventListener('click', function (e) {
        var a = e.target.closest ? e.target.closest('a[href]') : null;
        if (!a) return;
        var tool = findByHref(a.getAttribute('href'));
        if (tool) recordLocal(tool.id);
    });

    // ---------- Dashboard render ----------
    function escapeHtml(str) {
        var div = document.createElement('div');
        div.textContent = str == null ? '' : str;
        return div.innerHTML;
    }

    var state = { favorites: [], recent: [], user: null };

    function cardHtml(tool, isFav) {
        return '<div class="mt-quick-card">' +
            '<a class="mt-quick-link" href="' + tool.url + '">' +
            '<span class="mt-quick-icon">' + tool.icon + '</span>' +
            '<span class="mt-quick-name">' + escapeHtml(tool.name) + '</span>' +
            '</a>' +
            '<button class="mt-fav-btn' + (isFav ? ' active' : '') + '" data-id="' + tool.id + '" ' +
            'title="' + (isFav ? 'Verwijder uit favorieten' : 'Voeg toe aan favorieten') + '" ' +
            'aria-label="Favoriet">' + (isFav ? '&#9733;' : '&#9734;') + '</button>' +
            '</div>';
    }

    function render(mount) {
        var favIds = state.favorites.filter(function (id) { return byId[id]; });
        var recentIds = state.recent.filter(function (id) { return favIds.indexOf(id) === -1; }).slice(0, 6);

        var html = '';
        if (favIds.length) {
            html += '<section class="mt-quick-section">' +
                '<h2 class="mt-quick-title"><span class="mt-quick-title-icon">&#11088;</span> Favorieten</h2>' +
                '<div class="mt-quick-grid">' +
                favIds.map(function (id) { return cardHtml(byId[id], true); }).join('') +
                '</div></section>';
        }
        if (recentIds.length) {
            html += '<section class="mt-quick-section">' +
                '<h2 class="mt-quick-title"><span class="mt-quick-title-icon">&#128339;</span> Laatst gebruikt</h2>' +
                '<div class="mt-quick-grid">' +
                recentIds.map(function (id) { return cardHtml(byId[id], false); }).join('') +
                '</div></section>';
        }
        mount.innerHTML = html;

        mount.querySelectorAll('.mt-fav-btn').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                toggleFavorite(btn.dataset.id, mount);
            });
        });
    }

    async function toggleFavorite(id, mount) {
        if (!byId[id]) return;
        var idx = state.favorites.indexOf(id);
        if (idx === -1) state.favorites.unshift(id);
        else state.favorites.splice(idx, 1);
        render(mount);
        if (state.user) {
            try { await savePrefs(state.user, state); } catch (e) {}
        }
    }

    async function initDashboard() {
        var mount = document.getElementById('dashboardExtras');
        if (!mount) return;

        var user = await getUser();
        if (!user) return;
        state.user = user;

        var prefs = await loadPrefs(user);

        // localStorage recent samenvoegen met opgeslagen recent (lokaal = recenter)
        var local = readLocalRecent();
        var merged = [];
        local.concat(prefs.recent).forEach(function (id) {
            if (byId[id] && merged.indexOf(id) === -1) merged.push(id);
        });
        merged = merged.slice(0, RECENT_MAX);

        state.favorites = prefs.favorites;
        state.recent = merged;

        // Sync terug
        writeLocalRecent(merged);
        var changed = JSON.stringify(merged) !== JSON.stringify(prefs.recent);
        if (changed) {
            try { await savePrefs(user, state); } catch (e) {}
        }

        render(mount);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDashboard);
    } else {
        initDashboard();
    }
})();

/* ============================================
   MEESTERTOOLS - Favorieten

   - Zet een sterretje op elke tool-kaart waarmee je de tool favoriet
     maakt (favorieten worden gesynct naar je account).
   - Toont op het dashboard een compacte favorietenbalk.

   De centrale tool-lijst staat in template.js (window.MT_ALL_TOOLS).
   Wordt geladen op het dashboard en op de categoriepagina's.
   ============================================ */

(function () {
    var FAV_KEY = 'mt_favorites';

    var TOOLS = window.MT_ALL_TOOLS || [];
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
    function readFav() {
        try {
            var raw = localStorage.getItem(FAV_KEY);
            var arr = raw ? JSON.parse(raw) : [];
            return Array.isArray(arr) ? arr.filter(function (id) { return byId[id]; }) : [];
        } catch (e) { return []; }
    }
    function writeFav(arr) {
        try { localStorage.setItem(FAV_KEY, JSON.stringify(arr)); } catch (e) {}
    }

    // ---------- DB prefs ----------
    var state = { favorites: [], user: null };

    async function getUser() {
        try {
            if (typeof supabase === 'undefined') return null;
            var res = await supabase.auth.getSession();
            return res && res.data && res.data.session ? res.data.session.user : null;
        } catch (e) { return null; }
    }

    async function loadFavorites(user) {
        var res = await supabase
            .from('tool_settings')
            .select('settings')
            .eq('user_id', user.id)
            .eq('tool_name', 'dashboard_prefs')
            .maybeSingle();
        if (res.data && res.data.settings && Array.isArray(res.data.settings.favorites)) {
            return res.data.settings.favorites.filter(function (id) { return byId[id]; });
        }
        return [];
    }

    async function saveFavorites() {
        if (!state.user) return;
        try {
            await supabase
                .from('tool_settings')
                .upsert({
                    user_id: state.user.id,
                    tool_name: 'dashboard_prefs',
                    settings: { favorites: state.favorites },
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id,tool_name' });
        } catch (e) { /* stil falen */ }
    }

    // ---------- Sterretje op tool-kaarten ----------
    function toggleFavorite(id) {
        if (!byId[id]) return;
        var idx = state.favorites.indexOf(id);
        if (idx === -1) state.favorites.unshift(id);
        else state.favorites.splice(idx, 1);
        writeFav(state.favorites);
        decorateCards();
        renderDashboard();
        if (window.renderHeaderFavs) window.renderHeaderFavs();
        saveFavorites();
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

    function renderDashboard() {
        var mount = document.getElementById('dashboardExtras');
        if (!mount) return;

        var favIds = state.favorites.filter(function (id) { return byId[id]; });
        if (!favIds.length) { mount.innerHTML = ''; return; }

        mount.innerHTML = '<div class="mt-quick-row">' +
            '<span class="mt-quick-label"><span class="mt-quick-label-icon">&#11088;</span>Favorieten</span>' +
            '<div class="mt-pill-group">' + favIds.map(function (id) { return pillHtml(byId[id]); }).join('') + '</div>' +
            '</div>';
    }

    // ---------- Init ----------
    async function init() {
        // 1) Direct met lokale data tonen (snel, geen flikkering)
        state.favorites = readFav();
        decorateCards();
        renderDashboard();

        // 2) Account-data ophalen (leidend) en synchroniseren
        var user = await getUser();
        if (!user) return;
        state.user = user;

        state.favorites = await loadFavorites(user);
        writeFav(state.favorites);
        decorateCards();
        renderDashboard();
        if (window.renderHeaderFavs) window.renderHeaderFavs();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

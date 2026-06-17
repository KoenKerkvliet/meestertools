/* ============================================
   MEESTERTOOLS - Template Injector
   Versie: v1.26.1

   Inject reusable header and footer into every page that has
   <header id="app-header-slot"></header> and
   <footer id="app-footer-slot"></footer> placeholders.

   Bevat ook:
   - de centrale tool-lijst (window.MT_ALL_TOOLS), gebruikt door de
     zoekbalk in de header en door de favorieten op het dashboard.
   - een zoekbalk in de header waarmee je elke tool snel vindt.

   Uses absolute paths (/dashboard, /changelog, /favicon.svg)
   zodat 'ie vanuit elke nesting-diepte hetzelfde werkt.

   Runs synchronously — script tag staat na de placeholders maar
   vóór app.js zodat #profileBtn enz. bestaan voor app.js.
   ============================================ */

(function () {
    const VERSION = 'v1.26.1';

    // ---------- Centrale tool-lijst (absolute urls voor gebruik overal) ----------
    const MT_ALL_TOOLS = [
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
        { id: 'lingo', name: 'Lingo', url: 'educatieve-games/lingo', icon: '&#128221;', uc: true },
        { id: 'escaperooms', name: 'Escape rooms', url: 'educatieve-games/escaperooms', icon: '&#128477;&#65039;', uc: true },
        // Klasseprestatie
        { id: 'klasseprestatie', name: 'Klasseprestatie', url: 'klasseprestatie', icon: '&#127942;' },
        // Lesmateriaal
        { id: 'rekenrace', name: 'Rekenrace', url: 'lesmateriaal/rekenrace', icon: '&#129518;' },
        { id: 'vraagvandedag', name: 'Vraag van de Dag', url: 'lesmateriaal/vraagvandedag', icon: '&#10067;' },
        { id: 'woordenflitsen', name: 'Woorden Flitsen', url: 'lesmateriaal/woordenflitsen', icon: '&#9889;' },
        { id: 'werkbladen', name: 'Werkbladen', url: 'lesmateriaal/werkbladen', icon: '&#128196;' },
        // Ontspanning
        { id: 'naamkleurplaat', name: 'Naamkleurplaat', url: 'ontspanning/naamkleurplaat', icon: '&#127912;' },
        // Groepsvorming
        { id: 'groepsfase', name: 'Groepsfase-tracker', url: 'groepsvorming/groepsfase', icon: '&#128506;&#65039;' },
        { id: 'klimaatmonitor', name: 'Klimaat-monitor', url: 'groepsvorming/klimaatmonitor', icon: '&#10084;&#65039;' },
        { id: 'sfeercijfer', name: 'Sfeercijfer', url: 'groepsvorming/sfeercijfer', icon: '&#127777;&#65039;' },
        { id: 'checkin', name: 'Check-in', url: 'groepsvorming/checkin', icon: '&#128522;' },
        { id: 'gedragspatroon', name: 'Gedragspatroon', url: 'groepsvorming/gedragspatroon', icon: '&#128202;' },
        { id: 'sociogram', name: 'Sociogram', url: 'groepsvorming/sociogram', icon: '&#129309;' },
        { id: 'complimentenmuur', name: 'Complimentenmuur', url: 'groepsvorming/complimentenmuur', icon: '&#128140;' },
        { id: 'rolverdeler', name: 'Rolverdeler', url: 'groepsvorming/rolverdeler', icon: '&#127917;' },
        { id: 'conflict-stappenplan', name: 'Conflict-stappenplan', url: 'groepsvorming/conflict-stappenplan', icon: '&#129309;' },
        { id: 'dilemmakaarten', name: 'Dilemmakaarten', url: 'groepsvorming/dilemmakaarten', icon: '&#9878;&#65039;' },
        { id: 'gesprekskaarten', name: 'Gesprekskaarten', url: 'groepsvorming/gesprekskaarten', icon: '&#128488;&#65039;' },
        { id: 'routines', name: 'Routines', url: 'groepsvorming/routines', icon: '&#128203;' },
        // Organisatie
        { id: 'klassendienst', name: 'Klassendienst', url: 'organisatie/klassendienst', icon: '&#129529;' },
        { id: 'huiswerk', name: 'Huiswerk controleren', url: 'organisatie/huiswerk', icon: '&#128218;' },
        { id: 'plattegrond', name: 'Plattegrond', url: 'organisatie/plattegrond', icon: '&#128205;' },
        { id: 'naamkaarten', name: 'Naamkaarten', url: 'organisatie/naamkaarten', icon: '&#128219;' },
        { id: 'visiespel', name: 'Visiespel digitale geletterdheid', url: 'organisatie/visiespel', icon: '&#129461;' }
    ];
    window.MT_ALL_TOOLS = MT_ALL_TOOLS;

    // ---------- Under construction ----------
    // Tools met uc:true zijn alleen toegankelijk voor super admins.
    // Kaarten en zoekresultaten tonen een badge; voor andere gebruikers
    // is klikken geblokkeerd en stuurt de toolpagina zelf terug (app.js).
    function normalizePath(href) {
        if (!href) return '';
        var path = href;
        try { path = new URL(href, window.location.href).pathname; } catch (e) {}
        return path.split('?')[0].split('#')[0].replace(/^\/+/, '').replace(/\.html$/, '').replace(/\/+$/, '');
    }

    function ucToolForHref(href) {
        var path = normalizePath(href);
        if (!path) return null;
        for (var i = 0; i < MT_ALL_TOOLS.length; i++) {
            var t = MT_ALL_TOOLS[i];
            if (t.uc && (path === t.url || path.indexOf(t.url + '/') === 0)) return t;
        }
        return null;
    }
    window.MT_UC_TOOL_FOR_PATH = ucToolForHref;

    // Body-class waarmee CSS de kaarten voor super admins weer activeert
    window.addEventListener('userRoleReady', function (e) {
        if (e.detail && e.detail.role === 'super_admin') {
            document.body.classList.add('mt-uc-admin');
        }
    });

    // Globale klik-blokkade: vangt tool-kaarten, zoekresultaten en
    // favorieten-pills in één keer af.
    document.addEventListener('click', function (e) {
        var a = e.target && e.target.closest ? e.target.closest('a') : null;
        if (!a) return;
        if (!ucToolForHref(a.getAttribute('href'))) return;
        if (window.userRole === 'super_admin') return;
        e.preventDefault();
        e.stopPropagation();
    }, true);

    const headerHtml = `
<header class="app-header">
    <a href="/dashboard" class="header-logo">
        <span class="logo-icon">&#127891;</span>
        Meestertools
    </a>
    <div class="header-favs" id="headerFavs"></div>
    <div class="header-search" id="headerSearch">
        <button type="button" class="header-search-btn" id="headerSearchBtn" title="Zoek een tool" aria-label="Zoek een tool">&#128269;</button>
        <div class="header-search-panel" id="headerSearchPanel">
            <input type="text" class="header-search-input" id="headerSearchInput" placeholder="Zoek een tool..." autocomplete="off" aria-label="Zoek een tool">
            <div class="header-search-results" id="headerSearchResults"></div>
        </div>
    </div>
    <div class="header-profile">
        <button class="profile-btn" id="profileBtn" title="Profiel">?</button>
        <div class="profile-dropdown" id="profileDropdown">
            <div class="dropdown-header">
                <div class="name">Laden...</div>
                <div class="email"></div>
            </div>
            <div class="dropdown-item" onclick="openInstellingen()">
                &#9881;&#65039; Instellingen
            </div>
            <div class="dropdown-item" onclick="openInstellingen('profiel')">
                &#128100; Mijn profiel
            </div>
            <div class="dropdown-item logout">
                &#128682; Uitloggen
            </div>
        </div>
    </div>
</header>`;

    const footerHtml = `
<footer class="app-footer">
    <div class="footer-inner">
        <span class="footer-left">&copy; <span id="footerYear"></span> Meestertools &middot; Design by <a href="https://designpixels.nl" target="_blank" rel="noopener">Design Pixels</a></span>
        <a href="/changelog" class="version">${VERSION}</a>
    </div>
</footer>`;

    function escapeHtml(str) {
        var div = document.createElement('div');
        div.textContent = str == null ? '' : str;
        return div.innerHTML;
    }

    // ---------- Favorieten in de header ----------
    function renderHeaderFavs() {
        var mount = document.getElementById('headerFavs');
        if (!mount) return;
        var ids = [];
        try {
            var raw = localStorage.getItem('mt_favorites');
            ids = raw ? JSON.parse(raw) : [];
        } catch (e) { ids = []; }
        if (!Array.isArray(ids)) ids = [];

        var byId = {};
        MT_ALL_TOOLS.forEach(function (t) { byId[t.id] = t; });

        var tools = ids.map(function (id) { return byId[id]; })
            .filter(Boolean)
            .slice(0, 5);

        mount.innerHTML = tools.map(function (t) {
            return '<a class="header-fav-pill" href="/' + t.url + '" title="' + escapeHtml(t.name) + '">' +
                escapeHtml(t.name) + '</a>';
        }).join('');
    }
    window.renderHeaderFavs = renderHeaderFavs;

    // ---------- Zoekbalk ----------
    function setupSearch() {
        var box = document.getElementById('headerSearch');
        if (!box) return;
        var btn = document.getElementById('headerSearchBtn');
        var input = document.getElementById('headerSearchInput');
        var results = document.getElementById('headerSearchResults');
        var matches = [];
        var activeIdx = -1;

        function openPanel() {
            box.classList.add('open');
            setTimeout(function () { input.focus(); }, 0);
        }
        function closePanel() {
            box.classList.remove('open');
            input.value = '';
            close();
        }
        function togglePanel() {
            if (box.classList.contains('open')) closePanel();
            else openPanel();
        }

        function close() {
            results.classList.remove('open');
            results.innerHTML = '';
            matches = [];
            activeIdx = -1;
        }

        function highlight() {
            var items = results.querySelectorAll('.hs-item');
            items.forEach(function (it, i) { it.classList.toggle('active', i === activeIdx); });
        }

        function go(tool) {
            if (!tool) return;
            if (tool.uc && window.userRole !== 'super_admin') return;
            window.location.href = '/' + tool.url;
        }

        function search(q) {
            q = (q || '').trim().toLowerCase();
            if (!q) { close(); return; }
            matches = MT_ALL_TOOLS.filter(function (t) {
                return t.name.toLowerCase().indexOf(q) !== -1;
            }).slice(0, 8);
            activeIdx = -1;
            if (!matches.length) {
                results.innerHTML = '<div class="hs-empty">Geen tool gevonden</div>';
                results.classList.add('open');
                return;
            }
            results.innerHTML = matches.map(function (t) {
                return '<a class="hs-item" href="/' + t.url + '">' +
                    '<span class="hs-item-icon">' + t.icon + '</span>' +
                    escapeHtml(t.name) +
                    (t.uc ? '<span class="hs-uc">Under construction</span>' : '') + '</a>';
            }).join('');
            results.classList.add('open');
        }

        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            togglePanel();
        });

        input.addEventListener('input', function () { search(input.value); });
        input.addEventListener('focus', function () { if (input.value.trim()) search(input.value); });
        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                go(activeIdx >= 0 ? matches[activeIdx] : matches[0]);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (matches.length) { activeIdx = Math.min(matches.length - 1, activeIdx + 1); highlight(); }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (matches.length) { activeIdx = Math.max(0, activeIdx - 1); highlight(); }
            } else if (e.key === 'Escape') {
                closePanel();
                btn.focus();
            }
        });

        document.addEventListener('click', function (e) {
            if (!box.contains(e.target)) closePanel();
        });
    }

    function inject() {
        const headerSlot = document.getElementById('app-header-slot');
        if (headerSlot) {
            headerSlot.outerHTML = headerHtml;
            setupSearch();
            renderHeaderFavs();
        }
        const footerSlot = document.getElementById('app-footer-slot');
        if (footerSlot) {
            footerSlot.outerHTML = footerHtml;
        }
    }

    // Sync injection als de slots al in DOM staan; anders wachten op DOMContentLoaded.
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inject);
    } else {
        inject();
    }

    // ---------- Page loader ----------
    // Pagina's met <div class="mt-page-loader"> tonen een spinner tot de pagina
    // klaar is. Roep window.hidePageLoader() aan zodra alles gerenderd is.
    var loaderFallback = null;
    window.hidePageLoader = function () {
        var loader = document.getElementById('mtPageLoader');
        if (!loader) return;
        loader.classList.add('mt-hidden');
        if (loaderFallback) clearTimeout(loaderFallback);
        setTimeout(function () {
            if (loader.parentNode) loader.parentNode.removeChild(loader);
        }, 350);
    };
    // Veiligheidsnet: nooit eindeloos blijven hangen als een pagina vergeet te verbergen.
    loaderFallback = setTimeout(window.hidePageLoader, 12000);
})();

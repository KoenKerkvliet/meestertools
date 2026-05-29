/* ============================================
   MEESTERTOOLS - Template Injector
   Versie: v1.0.0

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
    const VERSION = 'v1.0.0';

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
    window.MT_ALL_TOOLS = MT_ALL_TOOLS;

    const headerHtml = `
<header class="app-header">
    <a href="/dashboard" class="header-logo">
        <span class="logo-icon">&#127891;</span>
        Meestertools
    </a>
    <div class="header-search" id="headerSearch">
        <span class="header-search-icon">&#128269;</span>
        <input type="text" class="header-search-input" id="headerSearchInput" placeholder="Zoek een tool..." autocomplete="off" aria-label="Zoek een tool">
        <div class="header-search-results" id="headerSearchResults"></div>
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

    // ---------- Zoekbalk ----------
    function setupSearch() {
        var box = document.getElementById('headerSearch');
        if (!box) return;
        var input = document.getElementById('headerSearchInput');
        var results = document.getElementById('headerSearchResults');
        var matches = [];
        var activeIdx = -1;

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
            if (tool) window.location.href = '/' + tool.url;
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
                    escapeHtml(t.name) + '</a>';
            }).join('');
            results.classList.add('open');
        }

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
                input.value = '';
                close();
                input.blur();
            }
        });

        document.addEventListener('click', function (e) {
            if (!box.contains(e.target)) close();
        });
    }

    function inject() {
        const headerSlot = document.getElementById('app-header-slot');
        if (headerSlot) {
            headerSlot.outerHTML = headerHtml;
            setupSearch();
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

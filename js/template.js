/* ============================================
   MEESTERTOOLS - Template Injector
   Versie: v0.0.2

   Inject reusable header and footer into every page that has
   <header id="app-header-slot"></header> and
   <footer id="app-footer-slot"></footer> placeholders.

   Uses absolute paths (/dashboard, /changelog, /favicon.svg)
   zodat 'ie vanuit elke nesting-diepte hetzelfde werkt.

   Runs synchronously — script tag staat na de placeholders maar
   vóór app.js zodat #profileBtn enz. bestaan voor app.js.
   ============================================ */

(function () {
    const VERSION = 'v0.0.2';

    const headerHtml = `
<header class="app-header">
    <a href="/dashboard" class="header-logo">
        <span class="logo-icon">&#127891;</span>
        Meestertools
    </a>
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

    function inject() {
        const headerSlot = document.getElementById('app-header-slot');
        if (headerSlot) {
            headerSlot.outerHTML = headerHtml;
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

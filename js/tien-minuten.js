/* ============================================
   MEESTERTOOLS - 10-minuten-didactiek (overzicht)
   Drie-puntjes-menu op de leskaarten.
   ============================================ */

(function () {
    function sluitAlles(behalve) {
        document.querySelectorAll('.les-menu.open').forEach(function (m) {
            if (m === behalve) return;
            m.classList.remove('open');
            var btn = m.parentNode.querySelector('.les-menu-btn');
            if (btn) btn.setAttribute('aria-expanded', 'false');
        });
    }

    document.addEventListener('click', function (e) {
        var btn = e.target.closest('.les-menu-btn');
        if (btn) {
            var menu = btn.parentNode.querySelector('.les-menu');
            sluitAlles(menu);
            var open = menu.classList.toggle('open');
            btn.setAttribute('aria-expanded', open ? 'true' : 'false');
            return;
        }
        // Klik op een menu-item of ergens anders: menu dicht.
        sluitAlles(null);
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') sluitAlles(null);
    });
})();

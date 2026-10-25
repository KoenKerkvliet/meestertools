/* ============================================
   MEESTERTOOLS - Banner "Nieuw" op het dashboard

   Licht een nieuwe tool uit met de banner #nieuwBanner in dashboard.html.
   - Na data-tot (JJJJ-MM-DD) verschijnt hij niet meer.
   - Wegklikken wordt per browser onthouden, per data-id. Voor een volgende
     nieuwe tool: de inhoud van de banner aanpassen en een nieuwe data-id
     geven, dan ziet iedereen hem weer.
   ============================================ */

(function () {
    var banner = document.getElementById('nieuwBanner');
    if (!banner) return;

    var key = 'mt_nieuw_weg_' + banner.dataset.id;
    var tot = new Date(banner.dataset.tot + 'T23:59:59');
    try {
        if (new Date() > tot || localStorage.getItem(key)) return;
    } catch (e) { /* geen localStorage: banner gewoon tonen */ }

    banner.hidden = false;
    banner.querySelector('.nieuw-banner-sluit').addEventListener('click', function () {
        banner.classList.add('hiding');
        setTimeout(function () { banner.remove(); }, 250);
        try { localStorage.setItem(key, '1'); } catch (e) {}
    });
})();

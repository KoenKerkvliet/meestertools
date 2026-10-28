/* ============================================
   MEESTERTOOLS - Banners "Nieuw" op het dashboard

   Lichten nieuwe tools uit met de banners (.nieuw-banner) in dashboard.html.
   Twee tegelijk staan naast elkaar, elk de helft van de breedte; wordt er één
   weggeklikt of is hij verlopen, dan neemt de andere de hele breedte.
   - Na data-tot (JJJJ-MM-DD) verschijnt een banner niet meer.
   - Wegklikken wordt per browser onthouden, per data-id. Voor een volgende
     nieuwe tool: een banner met een nieuwe data-id, dan ziet iedereen hem.
   ============================================ */

(function () {
    var banners = document.querySelectorAll('.nieuw-banner');
    if (!banners.length) return;

    Array.prototype.forEach.call(banners, function (banner) {
        var key = 'mt_nieuw_weg_' + banner.dataset.id;
        var tot = new Date(banner.dataset.tot + 'T23:59:59');
        try {
            if (new Date() > tot || localStorage.getItem(key)) { banner.remove(); return; }
        } catch (e) { /* geen localStorage: banner gewoon tonen */ }

        banner.hidden = false;
        banner.querySelector('.nieuw-banner-sluit').addEventListener('click', function () {
            banner.classList.add('hiding');
            setTimeout(function () { banner.remove(); }, 250);
            try { localStorage.setItem(key, '1'); } catch (e) {}
        });
    });
})();

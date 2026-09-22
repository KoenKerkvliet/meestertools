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

    // ---------- Categorieën + filter ----------
    // Elke .les-card heeft data-categorie. De chips worden daaruit opgebouwd,
    // dus een nieuwe les = alleen het attribuut invullen. De gekozen filter
    // wordt per vak-pagina onthouden.
    var filters = document.getElementById('lesFilters');
    var kaarten = [].slice.call(document.querySelectorAll('.les-card'));
    if (!filters || !kaarten.length) return;

    // Vaste volgorde, ongeacht de volgorde in de HTML: eerst op categorie,
    // binnen een categorie op onderwerp (de titel), allebei alfabetisch.
    function titel(k) {
        var h = k.querySelector('.tool-card h3');
        return h ? h.textContent.trim() : '';
    }
    kaarten.sort(function (a, b) {
        return (a.dataset.categorie || 'Overig').localeCompare(b.dataset.categorie || 'Overig', 'nl')
            || titel(a).localeCompare(titel(b), 'nl');
    });
    kaarten.forEach(function (k) { k.parentNode.appendChild(k); });

    var tellers = {};
    kaarten.forEach(function (k) {
        var cat = k.dataset.categorie || 'Overig';
        tellers[cat] = (tellers[cat] || 0) + 1;
        // Label op de kaart, onder de titel.
        var h3 = k.querySelector('.tool-card h3');
        if (h3 && !k.querySelector('.les-cat')) {
            var lbl = document.createElement('span');
            lbl.className = 'les-cat';
            lbl.textContent = cat;
            h3.insertAdjacentElement('afterend', lbl);
        }
    });

    var KEY = 'mt_10min_filter:' + location.pathname.replace(/\.html$/, '');
    var gekozen = 'alles';
    try { gekozen = localStorage.getItem(KEY) || 'alles'; } catch (e) {}
    if (gekozen !== 'alles' && !tellers[gekozen]) gekozen = 'alles';

    function chip(waarde, tekst) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'les-filter';
        b.dataset.waarde = waarde;
        b.textContent = tekst;
        filters.appendChild(b);
    }
    chip('alles', 'Alles (' + kaarten.length + ')');
    Object.keys(tellers).sort(function (a, b) { return a.localeCompare(b, 'nl'); })
        .forEach(function (cat) { chip(cat, cat + ' (' + tellers[cat] + ')'); });

    function pasToe() {
        kaarten.forEach(function (k) {
            k.hidden = gekozen !== 'alles' && (k.dataset.categorie || 'Overig') !== gekozen;
        });
        [].forEach.call(filters.children, function (b) {
            var aan = b.dataset.waarde === gekozen;
            b.classList.toggle('active', aan);
            b.setAttribute('aria-pressed', aan ? 'true' : 'false');
        });
    }

    filters.addEventListener('click', function (e) {
        var b = e.target.closest('.les-filter');
        if (!b) return;
        gekozen = b.dataset.waarde;
        try { localStorage.setItem(KEY, gekozen); } catch (err) {}
        pasToe();
    });
    pasToe();
})();

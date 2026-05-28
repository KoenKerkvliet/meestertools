/* ============================================
   MEESTERTOOLS - Globale actieve klas
   Versie: v0.0.2

   Eén gedeelde "actieve klas" die over alle tools heen onthouden wordt,
   zodat je je groep niet in elke tool opnieuw hoeft te kiezen.

   - Toont een klas-kiezer in de header (naast je profiel).
   - Bewaart de keuze in localStorage (mt_active_group).
   - Tools lezen de actieve klas als standaard via MTActiveClass.getId()
     en schrijven hun keuze terug via MTActiveClass.setId().

   Laadt na supabase-config.js + app.js, vóór de tool-specifieke scripts,
   zodat window.MTActiveClass bestaat zodra de tool initialiseert.
   ============================================ */

(function () {
    var KEY = 'mt_active_group';
    var KEY_NAME = 'mt_active_group_name';

    var groups = [];
    var listeners = [];
    var headerSelect = null;
    var readyResolve;
    var ready = new Promise(function (r) { readyResolve = r; });

    // ---------- Storage ----------
    function getId() {
        try { return localStorage.getItem(KEY) || ''; } catch (e) { return ''; }
    }
    function getName() {
        try { return localStorage.getItem(KEY_NAME) || ''; } catch (e) { return ''; }
    }
    function lookupName(id) {
        for (var i = 0; i < groups.length; i++) {
            if (groups[i].id === id) return groups[i].name;
        }
        return '';
    }

    function setId(id, name) {
        id = id || '';
        if (id === getId()) return; // geen wijziging -> geen event-lus

        try {
            if (id) {
                localStorage.setItem(KEY, id);
                localStorage.setItem(KEY_NAME, name || lookupName(id) || '');
            } else {
                localStorage.removeItem(KEY);
                localStorage.removeItem(KEY_NAME);
            }
        } catch (e) { /* localStorage kan geblokkeerd zijn */ }

        // Header-kiezer synchroniseren (zonder zijn change opnieuw te triggeren)
        if (headerSelect && headerSelect.value !== id) headerSelect.value = id;

        var nm = getName();
        listeners.forEach(function (cb) { try { cb(id, nm); } catch (e) {} });
        try {
            window.dispatchEvent(new CustomEvent('mt:activeclass', { detail: { id: id, name: nm } }));
        } catch (e) {}
    }

    // ---------- API ----------
    window.MTActiveClass = {
        ready: ready,
        getId: getId,
        getName: getName,
        getGroups: function () { return groups.slice(); },
        setId: function (id, name) { setId(id, name); },
        onChange: function (cb) { if (typeof cb === 'function') listeners.push(cb); },
        // Geef de groep-id terug die een tool als standaard moet gebruiken:
        // de globale actieve klas heeft voorrang (mits die bestaat in de lijst),
        // anders valt de tool terug op zijn eigen opgeslagen keuze.
        resolveDefault: function (currentId, availableGroups) {
            var list = availableGroups || groups;
            var active = getId();
            if (active) {
                for (var i = 0; i < list.length; i++) {
                    if (list[i].id === active) return active;
                }
            }
            return currentId || '';
        }
    };

    // ---------- Header-kiezer ----------
    function buildWidget(header) {
        if (document.getElementById('mtActiveClassSelect')) return;

        var wrap = document.createElement('div');
        wrap.className = 'mt-class-switcher';
        wrap.title = 'Actieve klas — geldt voor al je tools';

        var icon = document.createElement('span');
        icon.className = 'mt-cs-icon';
        icon.innerHTML = '&#128106;'; // 👪

        var select = document.createElement('select');
        select.className = 'mt-cs-select';
        select.id = 'mtActiveClassSelect';

        var ph = document.createElement('option');
        ph.value = '';
        ph.textContent = 'Geen actieve klas';
        select.appendChild(ph);

        var active = getId();
        groups.forEach(function (g) {
            var opt = document.createElement('option');
            opt.value = g.id;
            opt.textContent = g.name;
            if (g.id === active) opt.selected = true;
            select.appendChild(opt);
        });

        select.addEventListener('change', function () {
            var txt = select.options[select.selectedIndex] ? select.options[select.selectedIndex].text : '';
            setId(select.value, select.value ? txt : '');
            // Op een tool-pagina: herlaad zodat de nieuwe actieve klas overal toegepast wordt.
            if (document.querySelector('.tool-page-content')) {
                window.location.reload();
            }
        });

        wrap.appendChild(icon);
        wrap.appendChild(select);

        var profile = header.querySelector('.header-profile');
        if (profile) header.insertBefore(wrap, profile);
        else header.appendChild(wrap);

        headerSelect = select;
    }

    // ---------- Init ----------
    async function init() {
        var header = document.querySelector('.app-header');
        if (!header || typeof supabase === 'undefined') { readyResolve(); return; }

        try {
            var sessionRes = await supabase.auth.getSession();
            var session = sessionRes && sessionRes.data ? sessionRes.data.session : null;
            if (!session) { readyResolve(); return; }

            var res = await supabase
                .from('groups')
                .select('id, name')
                .eq('user_id', session.user.id)
                .eq('archived', false)
                .order('name');
            groups = res.data || [];
        } catch (e) {
            groups = [];
        }

        // Opgeslagen actieve klas opschonen als die niet meer bestaat
        var active = getId();
        if (active && !lookupName(active)) {
            // groep bestaat niet meer (of is gearchiveerd) -> stilletjes wissen
            try { localStorage.removeItem(KEY); localStorage.removeItem(KEY_NAME); } catch (e) {}
        }

        if (groups.length) buildWidget(header);
        readyResolve();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

/* ============================================
   MEESTERTOOLS - Typetijger klas-overzicht (leerkracht)

   Op de leerkracht-typetijgerpagina komt een knop "Klas-overzicht" die per
   leerling toont: hoeveel dagen deze week geoefend (ma-vr), de sterren-
   voortgang van de cursus en de beste spel-score. Leest rechtstreeks uit
   Supabase; de RLS-policies staan de eigenaar-leerkracht leestoegang toe.
   ============================================ */

(function () {
    if (typeof supabase === 'undefined') return;

    var overlay = null, selectEl = null, bodyEl = null;
    var groups = [];

    document.addEventListener('DOMContentLoaded', init);
    if (document.readyState !== 'loading') init();

    var inited = false;
    function init() {
        if (inited) return;
        if (!document.getElementById('tcMap')) return; // alleen op de typetijgerpagina
        inited = true;
        addButton();
    }

    function addButton() {
        var head = document.querySelector('.tool-inline-header');
        if (!head) return;
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'tt-ov-btn';
        btn.innerHTML = '&#128101; Klas-overzicht';
        btn.addEventListener('click', open);
        head.appendChild(btn);
    }

    // ---------- Datumhulp (schoolweek ma-vr) ----------
    function iso(d) {
        return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
    }
    function weekDates() {
        var d = new Date();
        var dow = d.getDay();
        d.setDate(d.getDate() + (dow === 0 ? -6 : 1 - dow)); // maandag
        var out = [];
        for (var i = 0; i < 5; i++) { out.push(iso(d)); d.setDate(d.getDate() + 1); }
        return out;
    }
    var DAY_LABELS = ['ma', 'di', 'wo', 'do', 'vr'];

    function esc(s) { var x = document.createElement('div'); x.textContent = s == null ? '' : s; return x.innerHTML; }

    // ---------- Modal ----------
    function build() {
        overlay = document.createElement('div');
        overlay.className = 'modal-overlay tt-ov-overlay';
        overlay.innerHTML =
            '<div class="modal tt-ov-modal">' +
                '<div class="modal-header">' +
                    '<h2>&#128101; Klas-overzicht Typetijger</h2>' +
                    '<button class="modal-close" id="ttOvClose">&times;</button>' +
                '</div>' +
                '<div class="modal-body">' +
                    '<div class="tt-ov-toolbar">' +
                        '<label>Klas: <select id="ttOvSelect"></select></label>' +
                        '<span class="tt-ov-hint">Deze week (ma&ndash;vr) &middot; sterren &middot; beste spel-score</span>' +
                    '</div>' +
                    '<div class="tt-ov-body" id="ttOvBody"></div>' +
                '</div>' +
            '</div>';
        document.body.appendChild(overlay);
        selectEl = overlay.querySelector('#ttOvSelect');
        bodyEl = overlay.querySelector('#ttOvBody');
        overlay.querySelector('#ttOvClose').addEventListener('click', close);
        overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
        selectEl.addEventListener('change', function () { loadClass(selectEl.value); });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && overlay.classList.contains('active')) close();
        });
    }

    function close() { if (overlay) overlay.classList.remove('active'); }

    async function open() {
        if (!overlay) build();
        overlay.classList.add('active');
        bodyEl.innerHTML = '<div class="tt-ov-loading">Laden&hellip;</div>';
        try {
            var user = await getUser();
            if (!user) { bodyEl.innerHTML = '<div class="tt-ov-empty">Log in om het overzicht te zien.</div>'; return; }
            var res = await supabase.from('groups').select('id, name')
                .eq('user_id', user.id).eq('archived', false).order('name');
            groups = res.data || [];
            if (!groups.length) {
                selectEl.innerHTML = '';
                bodyEl.innerHTML = '<div class="tt-ov-empty">Je hebt nog geen klas. Voeg er een toe via Instellingen &rarr; Mijn klas.</div>';
                return;
            }
            var activeId = '';
            try { activeId = (window.MTActiveClass && window.MTActiveClass.getId && window.MTActiveClass.getId()) || ''; } catch (e) {}
            selectEl.innerHTML = groups.map(function (g) {
                return '<option value="' + g.id + '"' + (g.id === activeId ? ' selected' : '') + '>' + esc(g.name) + '</option>';
            }).join('');
            loadClass(selectEl.value || groups[0].id);
        } catch (e) {
            bodyEl.innerHTML = '<div class="tt-ov-empty">Het overzicht kon niet laden.</div>';
        }
    }

    async function getUser() {
        try { var s = await supabase.auth.getSession(); return (s.data.session && s.data.session.user) || null; }
        catch (e) { return null; }
    }

    async function loadClass(groupId) {
        if (!groupId) return;
        bodyEl.innerHTML = '<div class="tt-ov-loading">Laden&hellip;</div>';
        try {
            var user = await getUser();
            var sres = await supabase.from('students')
                .select('id, first_name, last_name')
                .eq('user_id', user.id).eq('group_id', groupId).eq('archived', false)
                .order('first_name');
            var students = sres.data || [];
            if (!students.length) { bodyEl.innerHTML = '<div class="tt-ov-empty">Nog geen leerlingen in deze klas.</div>'; return; }
            var ids = students.map(function (s) { return s.id; });
            var week = weekDates();
            var monday = week[0];

            var results = await Promise.all([
                supabase.from('typetijger_activity').select('student_id, activity_date').in('student_id', ids).gte('activity_date', monday),
                supabase.from('typetijger_game_scores').select('student_id, best_score').in('student_id', ids),
                supabase.from('typetijger_progress').select('student_id, stars').in('student_id', ids)
            ]);
            var actRows = results[0].data || [];
            var scoreRows = results[1].data || [];
            var progRows = results[2].data || [];

            // aggregeren per leerling
            var actMap = {}, bestMap = {}, starMap = {};
            actRows.forEach(function (r) { (actMap[r.student_id] = actMap[r.student_id] || {})[r.activity_date] = 1; });
            scoreRows.forEach(function (r) { bestMap[r.student_id] = Math.max(bestMap[r.student_id] || 0, r.best_score || 0); });
            progRows.forEach(function (r) { starMap[r.student_id] = (starMap[r.student_id] || 0) + (r.stars || 0); });

            render(students, week, actMap, bestMap, starMap);
        } catch (e) {
            bodyEl.innerHTML = '<div class="tt-ov-empty">Het overzicht kon niet laden.</div>';
        }
    }

    function render(students, week, actMap, bestMap, starMap) {
        var head =
            '<div class="tt-ov-row tt-ov-head">' +
                '<span class="tt-ov-name">Leerling</span>' +
                '<span class="tt-ov-week">Deze week' +
                    '<span class="tt-ov-daylabels">' + DAY_LABELS.map(function (d) { return '<i>' + d + '</i>'; }).join('') + '</span>' +
                '</span>' +
                '<span class="tt-ov-num">&#11088;</span>' +
                '<span class="tt-ov-num">&#127942;</span>' +
            '</div>';
        var rows = students.map(function (s) {
            var days = actMap[s.id] || {};
            var doneCount = 0;
            var dots = week.map(function (dt) {
                var on = !!days[dt]; if (on) doneCount++;
                return '<span class="tt-ov-dot' + (on ? ' on' : '') + '"></span>';
            }).join('');
            var stars = starMap[s.id] || 0;
            var best = bestMap[s.id] || 0;
            var lag = doneCount === 0;
            return '<div class="tt-ov-row' + (lag ? ' is-lag' : '') + '">' +
                '<span class="tt-ov-name">' + esc(s.first_name) + '</span>' +
                '<span class="tt-ov-week"><span class="tt-ov-dots">' + dots + '</span>' +
                    '<b class="tt-ov-weeknum">' + doneCount + '/5</b></span>' +
                '<span class="tt-ov-num">' + stars + '</span>' +
                '<span class="tt-ov-num">' + (best || '&ndash;') + '</span>' +
            '</div>';
        }).join('');

        // samenvatting
        var geoefend = students.filter(function (s) { return Object.keys(actMap[s.id] || {}).length > 0; }).length;
        var summary = '<div class="tt-ov-summary">' + geoefend + ' van ' + students.length +
            ' leerlingen oefende deze week.</div>';

        bodyEl.innerHTML = summary + '<div class="tt-ov-table">' + head + rows + '</div>';
    }
})();

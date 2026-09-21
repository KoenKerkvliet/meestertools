/* ============================================
   MEESTERTOOLS - 10-minuten-didactiek: gedeelde lesmotor
   Versie: v0.0.1

   Een les is een los, volledig-scherm HTML-bestand (zonder sitekop). Dit
   script doet het deel dat anders app.js + active-class.js doen:
   - niet ingelogd -> naar /inloggen
   - geen super admin -> naar /dashboard (tool staat nog "under construction")
   - namen van de leerlingen uit de actieve klas ophalen

   De les leest de namen via: MTLes.namen.then(function (lijst) { ... })
   en de klasnaam via MTLes.klas.then(...).

   Laadt na supabase-config.js.
   ============================================ */

(function () {
    var KEY = 'mt_active_group';

    // Tot de controle rond is, niets tonen (voorkomt een flits van de les).
    document.documentElement.style.visibility = 'hidden';

    function naar(pad) { window.location.replace(pad); }

    var klasResolve, namenResolve;
    var klas = new Promise(function (r) { klasResolve = r; });
    var namen = new Promise(function (r) { namenResolve = r; });

    window.MTLes = { klas: klas, namen: namen };

    async function init() {
        var sessionRes = await supabase.auth.getSession();
        var session = sessionRes && sessionRes.data ? sessionRes.data.session : null;
        if (!session) { naar('/inloggen'); return; }

        var prof = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
        if (!prof.data || prof.data.role !== 'super_admin') { naar('/dashboard'); return; }

        document.documentElement.style.visibility = '';

        var gr = await supabase
            .from('groups')
            .select('id, name')
            .eq('archived', false)
            .order('created_at', { ascending: true });
        var groups = gr.data || [];

        // Zelfde regel als MTActiveClass: de actieve klas, anders de eerste.
        var actief = '';
        try { actief = localStorage.getItem(KEY) || ''; } catch (e) {}
        var groep = groups.filter(function (g) { return g.id === actief; })[0] || groups[0];
        if (!groep) { klasResolve(null); namenResolve([]); return; }
        klasResolve(groep.name);

        var st = await supabase
            .from('students')
            .select('first_name, name_suffix')
            .eq('group_id', groep.id)
            .eq('archived', false)
            .order('student_number', { ascending: true });

        namenResolve((st.data || []).map(function (s) {
            return s.name_suffix ? s.first_name + ' ' + s.name_suffix + '.' : s.first_name;
        }));
    }

    init().catch(function (e) {
        console.error('10-minuten-les:', e);
        document.documentElement.style.visibility = '';
        klasResolve(null);
        namenResolve([]);
    });
})();

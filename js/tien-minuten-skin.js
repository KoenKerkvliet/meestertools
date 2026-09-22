/* ============================================
   MEESTERTOOLS - 10-minuten-didactiek: nieuwe lesstijl (skin)
   Versie: v0.0.1

   Hoort bij css/tien-minuten-skin.css en laat de les zelf ongemoeid:
   dezelfde dia's, dezelfde stappen, dezelfde toetsen. Dit script zet er
   alleen een rustiger jasje omheen:

   - dia schaalt naar 1920x1080 (eigen resize-listener, loopt ná die van de les)
   - titeldia: vak-regel, onderwerp en haak uit elkaar, en Ik/Wij/Jullie/Jij
     als vier routekaartjes met uitleg
   - fase-label in de kop krijgt de uitleg erbij (IK · ik doe het voor)
   - voortgang per fase onderin, in plaats van een stip per dia
   - denkstappen: geweest = vinkje, huidige = oranje balk
   - knoptekst: "Start les" op dia 1, daarna "Volgende stap" / "Volgende"

   Alles wat de les zelf verandert (stap tonen, dia wisselen) wordt met een
   MutationObserver opgepikt, zodat we niets in de les hoeven te patchen.
   ============================================ */

(function () {
    var W = 1920, H = 1080;
    var ROUTE = {
        ik: ['IK', 'ik doe het voor'],
        wij: ['WIJ', 'we doen het samen'],
        jullie: ['JULLIE', 'jullie doen het in tweetallen'],
        jij: ['JIJ', 'jij doet het zelf'],
        doel: ['DOEL', '']
    };
    var FASE_KLEUR = {
        start: '#8A8599', doel: '#6B4FBB', ik: '#E8690B',
        wij: '#86A90B', jullie: '#1F7BC4', jij: '#C8177F', klaar: '#8A8599'
    };
    var FASE_NAAM = { start: 'Start', doel: 'Doel', ik: 'Ik', wij: 'Wij', jullie: 'Jullie', jij: 'Jij', klaar: 'Klaar' };

    var stage = document.getElementById('stage');
    var dias = [].slice.call(document.querySelectorAll('.slide'));
    if (!stage || !dias.length) return;

    // ---------- Schalen naar 1920x1080 ----------
    // De les schaalt zelf naar 1600x900; onze listener staat later in de rij
    // en zet de juiste schaal er daarna overheen.
    function schaal() {
        var s = Math.min(window.innerWidth / W, window.innerHeight / H);
        stage.style.transform = 'scale(' + s + ')';
    }
    window.addEventListener('resize', schaal);

    // ---------- Titeldia: vak, onderwerp, haak ----------
    function titeldia() {
        var td = document.querySelector('.titeldia');
        if (!td || td.dataset.mtKlaar) return;
        var h1 = td.querySelector('h1'), sub = td.querySelector('.sub');
        if (!h1) return;
        var tekst = h1.textContent.replace(/\s+/g, ' ').trim();
        var deel = tekst.split(':');
        var onderwerp = deel.length > 1 ? deel.shift().trim() : tekst;
        var haak = deel.length ? deel.join(':').trim() : '';

        var vak = document.createElement('div');
        vak.className = 'mt-vak';
        vak.textContent = sub ? sub.textContent.trim() : '';
        var o = document.createElement('div');
        o.className = 'mt-onderwerp';
        o.textContent = onderwerp;
        var hk = document.createElement('div');
        hk.className = 'mt-haak';
        hk.textContent = haak;

        h1.textContent = '';
        h1.appendChild(vak);
        h1.appendChild(o);
        if (haak) h1.appendChild(hk);

        // Ik/Wij/Jullie/Jij als routekaartjes met uitleg.
        [].forEach.call(td.querySelectorAll('.badge-rij span'), function (sp) {
            var naam = sp.textContent.trim(), sleutel = naam.toLowerCase();
            var kleur = sp.style.background || '';
            var bol = document.createElement('span');
            bol.className = 'mt-bol';
            bol.textContent = naam;
            bol.style.background = kleur;
            sp.textContent = '';
            sp.style.background = '';
            sp.appendChild(bol);
            sp.appendChild(document.createTextNode((ROUTE[sleutel] || ['', ''])[1] || ''));
        });
        td.dataset.mtKlaar = '1';
    }

    // ---------- Voortgang per fase ----------
    // Opeenvolgende dia's met dezelfde fase worden één blokje. De eerste dia
    // heet Start, een reeks doel-dia's aan het eind heet Klaar.
    var groepen = [];
    dias.forEach(function (d, i) {
        var f = d.dataset.fase || 'start';
        if (i === 0) f = 'start';
        var laatste = groepen[groepen.length - 1];
        if (laatste && laatste.fase === f) laatste.dias.push(i);
        else groepen.push({ fase: f, dias: [i] });
    });
    if (groepen.length > 1 && groepen[groepen.length - 1].fase === 'doel') {
        groepen[groepen.length - 1].fase = 'klaar';
    }

    var balk = document.createElement('div');
    balk.className = 'mt-voortgang';
    var stippen = document.getElementById('stippen');
    if (stippen && stippen.parentNode) stippen.parentNode.insertBefore(balk, stippen);

    groepen.forEach(function (g) {
        var groep = document.createElement('div');
        groep.className = 'mt-fase-groep';
        var rij = document.createElement('div');
        rij.className = 'mt-fase-stippen';
        g.dias.forEach(function (i) {
            var s = document.createElement('i');
            s.title = 'Dia ' + (i + 1);
            s.onclick = function () { if (stippen && stippen.children[i]) stippen.children[i].click(); };
            rij.appendChild(s);
        });
        var label = document.createElement('div');
        label.className = 'mt-fase-label';
        label.textContent = FASE_NAAM[g.fase] || g.fase;
        groep.appendChild(rij);
        groep.appendChild(label);
        g.el = groep;
        balk.appendChild(groep);
    });

    function nuDia() {
        for (var i = 0; i < dias.length; i++) if (dias[i].classList.contains('actief')) return i;
        return 0;
    }

    function voortgang(nu) {
        groepen.forEach(function (g) {
            var kleur = FASE_KLEUR[g.fase] || '#8A8599';
            var actief = g.dias.indexOf(nu) !== -1;
            g.el.classList.toggle('nu', actief);
            g.el.querySelector('.mt-fase-label').style.color = actief ? kleur : '';
            [].forEach.call(g.el.querySelectorAll('.mt-fase-stippen i'), function (s, k) {
                var i = g.dias[k];
                s.style.background = i < nu ? kleur + '66' : i === nu ? kleur : '';
            });
        });
    }

    // ---------- Fase-label met uitleg ----------
    function faseLabel(d) {
        var fb = document.getElementById('fase');
        if (!fb) return;
        var f = d.dataset.fase, r = ROUTE[f];
        if (r) fb.textContent = r[1] ? r[0] + ' · ' + r[1] : r[0];
    }

    // ---------- Denkstappen: geweest / nu ----------
    function stappen(d) {
        var getoond = [].slice.call(d.querySelectorAll('.step.shown'));
        var lis = [].slice.call(d.querySelectorAll('.denk li'));
        lis.forEach(function (li) { li.classList.remove('mt-af', 'mt-nu'); });
        if (!getoond.length) return;
        var huidig = getoond[getoond.length - 1].closest('li');
        getoond.forEach(function (s) {
            var li = s.closest('li');
            if (li && li !== huidig) li.classList.add('mt-af');
        });
        if (huidig) huidig.classList.add('mt-nu');
    }

    // ---------- Knoptekst ----------
    var knopTekst = document.getElementById('volgendeTekst');
    function knop(d) {
        if (!knopTekst) return;
        var nu = nuDia();
        var rest = d.querySelectorAll('.step').length - d.querySelectorAll('.step.shown').length;
        var t = nu === 0 ? 'Start les' : rest > 0 ? 'Volgende stap' : (nu === dias.length - 1 ? 'Einde' : 'Volgende');
        if (knopTekst.textContent !== t) knopTekst.textContent = t;
    }

    // ---------- Bijwerken ----------
    // Tijdens het bijwerken zetten we zelf classes (mt-af/mt-nu); daarom
    // luisteren we even niet mee, anders roept dat zichzelf op.
    var obs = new MutationObserver(werkBij);
    function luister() {
        obs.observe(stage, { subtree: true, attributes: true, attributeFilter: ['class'], childList: true });
    }

    function werkBij() {
        obs.disconnect();
        var nu = nuDia(), d = dias[nu];
        document.body.classList.toggle('eerste-dia', nu === 0);
        titeldia();
        faseLabel(d);
        stappen(d);
        voortgang(nu);
        knop(d);
        obs.takeRecords();
        luister();
    }

    luister();

    schaal();
    werkBij();
})();

/* ============================================
   TOPOGRAFIE - Oefenpagina voor leerlingen (/topografie?k=CODE)
   Versie: v1.1.0

   Openbaar, zonder account. Haalt de kaart op via de RPC
   public.topografie_kaart(code) en bewaart niets over wie er oefent.

   Drie oefenvormen:
   - Leren:     kaart met alle namen; tik op iets om de naam te zien.
   - Aanwijzen: "Waar ligt ...?" en de leerling klikt op de kaart.
   - Benoemen:  een plek licht op en de leerling kiest uit vier namen.

   Een fout antwoord komt achteraan de rij terug, tot alles een keer goed is.
   De score telt alleen wat in één keer goed was.

   Test jezelf: elk onderdeel één keer (bij een hele grote kaart een
   steekproef van TEST_MAX), willekeurig als aanwijzen of benoemen, zonder
   hulp en zonder herkansing. Daarna een cijfer met 80%-normering
   (80% goed = 6, elke 5% erboven een punt erbij, eronder lineair naar 1).
   Het cijfer staat alleen op het scherm; er wordt niets bewaard.
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    var $ = function (id) { return document.getElementById(id); };
    var esc = function (s) { return MT.escapeHtml(s); };

    var kaartData = null;   // { titel, basis, items }
    var map = null;
    var view = null;
    var objs = [];          // alle kaartobjecten van deze kaart

    var modus = '';
    var rij = [];           // nog te doen
    var huidige = null;
    var totaal = 0;
    var klaarKeys = {};     // key -> true zodra goed beantwoord
    var foutKeys = {};      // key -> true als ooit fout
    var eersteKeerGoed = 0;
    var wacht = false;      // tijdens feedback geen nieuwe klikken
    var laatsteRonde = [];  // objecten van de laatste ronde (voor "nog een keer")
    var meldingTimer = null;

    var TEST_MAX = 50;      // meer onderdelen? dan een steekproef van zoveel vragen
    var testVorm = {};      // key -> 'aanwijzen' of 'benoemen' (alleen in de test)
    var testFout = [];      // [{ o, gegeven }] wat in de test fout ging

    // ---------- Schermen ----------
    function toon(id) {
        document.querySelectorAll('.to-screen').forEach(function (s) { s.classList.toggle('active', s.id === id); });
        $('toWrap').classList.toggle('is-wide', id === 'toSpel');
        window.scrollTo(0, 0);
    }

    function meld(tekst, soort, ms) {
        var m = $('toMelding');
        m.textContent = tekst;
        m.className = 'to-melding show' + (soort ? ' ' + soort : '');
        clearTimeout(meldingTimer);
        meldingTimer = setTimeout(function () { m.classList.remove('show'); }, ms || 1400);
    }

    function schud(a) {
        a = a.slice();
        for (var i = a.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var t = a[i]; a[i] = a[j]; a[j] = t;
        }
        return a;
    }

    // ---------- Kaart ophalen ----------
    async function openCode(code) {
        code = String(code || '').trim().toUpperCase();
        toon('toLaden');
        var res = await supabase.rpc('topografie_kaart', { p_code: code });
        if (res.error || !res.data) {
            toonCode(res.error ? 'De kaart kon niet geladen worden. Controleer je internet en probeer het opnieuw.' : 'Deze kaart bestaat niet (meer). Klopt de code?');
            return;
        }
        try { history.replaceState(null, '', location.pathname + '?k=' + encodeURIComponent(code)); } catch (e) {}
        await toonKaart(res.data);
    }

    // Voorbeeldkaarten voor de homepage (/topografie?voorbeeld=provincies)
    // staan als vast bestand in assets/topografie/voorbeelden.json en niet in
    // de database: dan kunnen ze nooit per ongeluk weggegooid worden.
    async function openVoorbeeld(naam) {
        toon('toLaden');
        var data = null;
        try {
            var r = await fetch('/assets/topografie/voorbeelden.json?v=1');
            if (r.ok) data = (await r.json())[naam] || null;
        } catch (e) { /* hieronder netjes melden */ }
        if (!data) { toonCode('Dit voorbeeld bestaat niet (meer). Typ de code van je juf of meester.'); return; }
        await toonKaart(data);
    }

    async function toonKaart(data) {
        kaartData = data;
        try {
            map = await TopoKaart.laad(kaartData.basis);
        } catch (e) {
            toonCode('De kaart kon niet geladen worden. Probeer het opnieuw.');
            return;
        }
        objs = TopoKaart.resolveAll(map, kaartData.items);

        $('toTitel').textContent = kaartData.titel;
        document.title = kaartData.titel + ' - Topografie';
        if (!objs.length) {
            $('toAantal').textContent = 'Op deze kaart staat nog niets. Vraag je juf of meester om de kaart aan te vullen.';
            document.querySelector('.to-modi').hidden = true;
        } else {
            $('toAantal').textContent = map.naam + ' · ' + objs.length + (objs.length === 1 ? ' onderdeel' : ' onderdelen');
            document.querySelector('.to-modi').hidden = false;
            var n = objs.length;
            $('toTestUitleg').textContent = (n > TEST_MAX ? TEST_MAX + ' vragen uit deze kaart'
                : n === 1 ? 'Eén vraag' : 'Alle ' + n + ' onderdelen') + ', zonder hulp. Je krijgt een cijfer.';
        }
        toon('toStart');
    }

    function toonCode(fout) {
        var f = $('toCodeFout');
        f.textContent = fout || '';
        f.classList.toggle('show', !!fout);
        toon('toCode');
        $('toCodeInvoer').focus();
    }

    $('toCodeForm').addEventListener('submit', function (e) {
        e.preventDefault();
        var c = $('toCodeInvoer').value.replace(/\s+/g, '');
        if (c.length < 4) { toonCode('Typ de code van 8 tekens.'); return; }
        openCode(c);
    });

    // ---------- Start ----------
    document.querySelector('.to-modi').addEventListener('click', function (e) {
        var b = e.target.closest('[data-modus]');
        if (b) start(b.dataset.modus, objs);
    });

    function zorgVoorKaart() {
        if (!view) view = TopoKaart.maak($('toKaart'), map, { onKlik: kaartKlik });
        view.setItems(objs);
        view.wisMarkeringen();
        view.passend();
    }

    function start(m, lijst) {
        modus = m;
        toon('toSpel');
        zorgVoorKaart();
        $('toKeuzes').innerHTML = '';
        if (m === 'verkennen') {
            view.toonLabels(true);
            view.setModus('');
            $('toTeller').hidden = true;
            $('toVraag').innerHTML = '<span class="soort">Leren</span><div class="tekst">Bekijk de kaart</div>';
            $('toKeuzes').innerHTML = '<div class="to-verkennen-balk">' +
                '<button type="button" class="to-btn licht" id="toNamenWissel">Namen verbergen</button>' +
                '<button type="button" class="to-btn" id="toNaarAanwijzen">Ik ben er klaar voor!</button></div>';
            return;
        }
        view.toonLabels(false);
        view.setModus('');
        $('toTeller').hidden = false;
        if (m === 'test' && lijst.length > TEST_MAX) lijst = schud(lijst).slice(0, TEST_MAX);
        laatsteRonde = lijst.slice();
        rij = schud(lijst);
        totaal = lijst.length;
        klaarKeys = {}; foutKeys = {}; eersteKeerGoed = 0;
        testVorm = {}; testFout = [];
        if (m === 'test') {
            // Half aanwijzen, half benoemen, door elkaar. Benoemen heeft
            // minstens drie namen nodig om uit te kiezen.
            var vormen = schud(rij.map(function (o, i) { return i % 2 && objs.length >= 3 ? 'benoemen' : 'aanwijzen'; }));
            rij.forEach(function (o, i) { testVorm[o.key] = vormen[i]; });
        }
        volgende();
    }

    // Welke vraagvorm hoort bij de huidige vraag
    function vraagModus() {
        return modus === 'test' ? (huidige && testVorm[huidige.key]) : modus;
    }

    $('toKeuzes').addEventListener('click', function (e) {
        if (e.target.id === 'toNamenWissel') {
            var aan = !$('toKaart').classList.contains('labels-aan');
            view.toonLabels(aan);
            e.target.textContent = aan ? 'Namen verbergen' : 'Namen tonen';
            return;
        }
        if (e.target.id === 'toNaarAanwijzen') { start('aanwijzen', objs); return; }
        if (e.target.id === 'toTerugCijfer') { toon('toKlaar'); return; }
        if (e.target.id === 'toFoutenOefen') { start('aanwijzen', foutObjs()); return; }
        var b = e.target.closest('.to-keuze');
        if (b && !b.disabled) kiesNaam(b);
    });

    // ---------- Vragen ----------
    var WAAR = { rivier: 'Waar stroomt de ', vlak: 'Waar ligt ' };
    var HOE = {
        provincie: 'Hoe heet deze provincie?', land: 'Hoe heet dit land?', werelddeel: 'Hoe heet dit werelddeel?', gebergte: 'Hoe heet dit gebergte?', plaats: 'Hoe heet deze plaats?', hoofdstad: 'Hoe heet deze plaats?',
        provhoofdstad: 'Hoe heet deze plaats?', rivier: 'Hoe heet deze rivier?', water: 'Hoe heet dit water?',
        eiland: 'Hoe heet dit eiland?', gebied: 'Hoe heet dit gebied?', eigen: 'Hoe heet deze plek?'
    };
    // Landen met een lidwoord: "Waar ligt het Verenigd Koninkrijk?",
    // "Waar liggen de Filipijnen?"
    var LIDWOORD = {
        'Verenigd Koninkrijk': 'het', 'Centraal-Afrikaanse Republiek': 'de', 'Dominicaanse Republiek': 'de'
    };
    var MEERVOUD = {
        'Verenigde Staten': 1, 'Verenigde Arabische Emiraten': 1, 'Filipijnen': 1, "Bahama's": 1,
        'Comoren': 1, 'Maldiven': 1, 'Seychellen': 1, 'Salomonseilanden': 1, 'Marshalleilanden': 1,
        'Federale Staten van Micronesia': 1
    };
    var GROEP = { provincie: 'p', land: 'p', rivier: 'r', water: 'w', eiland: 'g', gebied: 'g', gebergte: 'b', werelddeel: 'c' };
    function groep(o) { return GROEP[o.soort] || 'plaats'; }

    function teller() {
        var n = Object.keys(klaarKeys).length;
        $('toTeller').textContent = modus === 'test'
            ? 'Vraag ' + Math.min(n + 1, totaal) + ' / ' + totaal
            : n + ' / ' + totaal;
    }

    function volgende() {
        wacht = false;
        view.wisMarkeringen();
        teller();
        if (!rij.length) { klaar(); return; }
        huidige = rij.shift();
        var soort = TopoKaart.SOORT_LABEL[huidige.soort] || '';

        if (vraagModus() === 'aanwijzen') {
            // "Waar ligt Noordzee?" of "Waar ligt Alpen?" loopt niet (de, het):
            // bij wateren, gebergten en gebieden een kale opdracht
            var kaal = huidige.soort === 'water' || huidige.soort === 'gebergte' || huidige.soort === 'gebied';
            var tekst = kaal ? 'Wijs aan: ' + huidige.naam
                : MEERVOUD[huidige.naam] || /eilanden$/.test(huidige.naam) ? 'Waar liggen de ' + huidige.naam + '?'
                : LIDWOORD[huidige.naam] ? 'Waar ligt ' + LIDWOORD[huidige.naam] + ' ' + huidige.naam + '?'
                : (huidige.soort === 'rivier' ? WAAR.rivier : WAAR.vlak) + huidige.naam + '?';
            $('toVraag').innerHTML = '<span class="soort">' + esc(soort) + '</span><div class="tekst">' + esc(tekst) + '</div>';
            $('toKeuzes').innerHTML = '';
            view.setModus(huidige.vorm === 'vlak' ? 'vlak' : '');
        } else {
            $('toVraag').innerHTML = '<span class="soort">' + esc(soort) + '</span><div class="tekst">' + esc(HOE[huidige.soort] || 'Hoe heet dit?') + '</div>';
            view.setModus('stil');
            view.markeer(huidige.key, 'doel');
            view.inBeeld(huidige.key);
            toonKeuzes();
        }
    }

    // Drie foute namen erbij, liefst van dezelfde soort (provincie bij provincie)
    function toonKeuzes() {
        var namen = {};
        namen[huidige.naam] = 1;
        var zelfde = schud(objs.filter(function (o) { return groep(o) === groep(huidige) && !namen[o.naam]; }));
        var rest = schud(objs.filter(function (o) { return groep(o) !== groep(huidige); }));
        var opties = [huidige.naam];
        zelfde.concat(rest).forEach(function (o) {
            if (opties.length < 4 && !namen[o.naam]) { namen[o.naam] = 1; opties.push(o.naam); }
        });
        $('toKeuzes').innerHTML = schud(opties).map(function (n) {
            return '<button type="button" class="to-keuze" data-naam="' + esc(n) + '">' + esc(n) + '</button>';
        }).join('');
    }

    function goed() {
        if (!foutKeys[huidige.key] && !klaarKeys[huidige.key]) eersteKeerGoed++;
        klaarKeys[huidige.key] = true;
        view.markeer(huidige.key, 'goed');
        view.toonLabel(huidige.key, true);
        teller();
        meld(schud(['Goed!', 'Super!', 'Knap!', 'Top!'])[0], 'goed', 900);
        wacht = true;
        setTimeout(volgende, 950);
    }

    function fout(tekst) {
        foutKeys[huidige.key] = true;
        // Komt terug, maar niet meteen als volgende vraag
        var plek = Math.min(rij.length, 2 + Math.floor(Math.random() * 3));
        rij.splice(plek, 0, huidige);
        view.markeer(huidige.key, 'doel');
        view.toonLabel(huidige.key, true);
        view.inBeeld(huidige.key);
        meld(tekst, 'fout', 2300);
        wacht = true;
        setTimeout(volgende, 2400);
    }

    // Test: geen goed/fout tonen, geen herkansing; alleen onthouden en door
    function beantwoord(ok, gegeven) {
        klaarKeys[huidige.key] = true;
        if (ok) eersteKeerGoed++;
        else { foutKeys[huidige.key] = true; testFout.push({ o: huidige, gegeven: gegeven }); }
        wacht = true;
        setTimeout(volgende, 450);
    }

    function kiesNaam(b) {
        if (wacht) return;
        var knoppen = $('toKeuzes').querySelectorAll('.to-keuze');
        if (modus === 'test') {
            knoppen.forEach(function (k) { k.disabled = true; });
            b.classList.add('is-gekozen');
            beantwoord(b.dataset.naam === huidige.naam, 'Jij koos ' + b.dataset.naam + '.');
            return;
        }
        knoppen.forEach(function (k) {
            k.disabled = true;
            if (k.dataset.naam === huidige.naam) k.classList.add('is-goed');
        });
        if (b.dataset.naam === huidige.naam) goed();
        else {
            b.classList.add('is-fout');
            fout('Het is ' + huidige.naam + '.');
        }
    }

    function kaartKlik(obj, p) {
        if (modus === 'verkennen') {
            if (obj) {
                view.toonLabel(obj.key, true);
                meld(obj.naam, '', 1600);
            }
            return;
        }
        if (modus === 'nakijken') {
            if (!obj) return;
            var f = testFout.filter(function (x) { return x.o.key === obj.key; })[0];
            view.toonLabel(obj.key, true);
            meld(f ? 'Dit is ' + obj.naam + '. ' + f.gegeven : obj.naam, f ? 'fout' : '', 2600);
            return;
        }
        if (wacht || !huidige || vraagModus() !== 'aanwijzen') return;

        // Net naast een stip geklikt telt als die stip
        if ((!obj || obj.vorm === 'vlak' || obj.vorm === 'zone') && huidige.vorm === 'punt') obj = view.dichtstbijPunt(p, 26) || null;
        if (!obj || (huidige.vorm !== 'vlak' && obj.vorm === 'vlak')) {
            meld(huidige.vorm === 'punt' ? 'Klik op een stip' : huidige.vorm === 'lijn' ? 'Klik op een rivier'
                : huidige.vorm === 'zone' ? 'Klik op een gekleurd gebied' : 'Klik op een ' + (map.teksten.vlak || 'provincie'), '', 1200);
            return;
        }
        if (modus === 'test') {
            view.markeer(obj.key, 'gekozen');
            beantwoord(obj.key === huidige.key, 'Jij klikte op ' + obj.naam + '.');
            return;
        }
        if (obj.key === huidige.key) { goed(); return; }
        view.markeer(obj.key, 'fout');
        view.toonLabel(obj.key, true);
        fout('Dat is ' + obj.naam + '. ' + huidige.naam + ' ligt hier.');
    }

    $('toStop').addEventListener('click', function () {
        wacht = false;
        toon('toStart');
    });

    // ---------- Volledig scherm ----------
    // Blijft aan tot de leerling hem zelf uitzet (knop of Esc), ook tussen
    // de rondes door: dan hoeft een kind niet elke keer opnieuw te klikken.
    // Met de Fullscreen-API waar die er is; op een iPhone (die heeft hem niet)
    // vult de kaart dan in elk geval het hele browservenster.
    var root = document.documentElement;
    var kanApi = !!(root.requestFullscreen || root.webkitRequestFullscreen);
    function isApiVol() { return !!(document.fullscreenElement || document.webkitFullscreenElement); }

    function zetVol(aan) {
        document.body.classList.toggle('is-vol', aan);
        $('toVol').innerHTML = aan ? '&#x2715;' : '&#x26F6;';
        $('toVol').title = aan ? 'Volledig scherm sluiten' : 'Volledig scherm';
        $('toVol').setAttribute('aria-label', $('toVol').title);
        if (kanApi) {
            try {
                var r = null;
                if (aan && !isApiVol()) r = (root.requestFullscreen || root.webkitRequestFullscreen).call(root);
                if (!aan && isApiVol()) r = (document.exitFullscreen || document.webkitExitFullscreen).call(document);
                if (r && r.catch) r.catch(function () {});
            } catch (e) { /* dan blijft het bij de CSS-stand */ }
        }
    }

    $('toVol').addEventListener('click', function () {
        zetVol(!document.body.classList.contains('is-vol'));
    });
    // Esc of de knop van de browser: ook onze stand weer uit
    ['fullscreenchange', 'webkitfullscreenchange'].forEach(function (ev) {
        document.addEventListener(ev, function () {
            if (!isApiVol() && document.body.classList.contains('is-vol')) zetVol(false);
        });
    });

    // ---------- Klaar ----------
    // 80%-normering: 80% goed = 6; daarboven elke 5% een punt (100% = 10),
    // daaronder gelijkmatig naar een 1 bij 0%. Op één decimaal; onder de 80%
    // nooit afgerond naar een 6.
    function cijfer(goed, n) {
        var p = n ? goed / n * 100 : 0;
        var c = p >= 80 ? 6 + (p - 80) / 5 : 1 + p / 16;
        c = Math.round(c * 10) / 10;
        if (p < 80 && c >= 6) c = 5.9;
        return c;
    }

    function foutObjs() { return testFout.map(function (f) { return f.o; }); }

    function klaarTest() {
        var c = cijfer(eersteKeerGoed, totaal);
        // Op één decimaal, zodat 87,5% en een 7,5 bij elkaar passen
        var pct = String(Math.round(eersteKeerGoed / totaal * 1000) / 10).replace('.', ',');
        var voldoende = c >= 6;
        $('toKlaarTitel').textContent = 'Je cijfer';
        $('toKlaarIcoon').innerHTML = c >= 8 ? '&#127942;' : voldoende ? '&#127881;' : '&#128170;';
        $('toScore').textContent = String(c).replace('.', ',');
        $('toScore').className = 'to-score is-cijfer' + (voldoende ? '' : ' is-onvoldoende');
        $('toScoreSub').innerHTML = '<strong>' + eersteKeerGoed + ' van de ' + totaal + ' goed</strong> (' + pct + '%)<br>' +
            (c === 10 ? 'Alles goed, knap!' : voldoende ? 'Voldoende, goed gedaan!' : 'Nog niet voldoende. Oefen je fouten en probeer het nog eens.') +
            '<span class="to-norm">80% goed is een 6</span>';
        var f = $('toFouten');
        if (testFout.length) {
            f.innerHTML = '<strong>Hier ging het mis:</strong>' + testFout.map(function (x) { return esc(x.o.naam); }).join(', ');
            f.hidden = false;
        } else {
            f.hidden = true;
        }
        $('toFoutenKaart').hidden = !testFout.length;
        $('toFoutenOpnieuw').hidden = !testFout.length;
        $('toFoutenOpnieuw').textContent = 'Oefen je fouten';
        $('toFoutenOpnieuw').className = 'to-btn licht';
        $('toFoutenOpnieuw').onclick = function () { start('aanwijzen', foutObjs()); };
        $('toOpnieuw').textContent = 'Doe de test nog een keer';
        $('toOpnieuw').className = testFout.length ? 'to-btn licht' : 'to-btn';
        $('toOpnieuw').onclick = function () { start('test', objs); };
        toon('toKlaar');
    }

    // De kaart met wat er fout ging in het rood, met de naam erbij
    function toonFoutenKaart() {
        modus = 'nakijken';
        huidige = null;
        toon('toSpel');
        zorgVoorKaart();
        view.toonLabels(false);
        view.setModus('');
        $('toTeller').hidden = true;
        testFout.forEach(function (x) {
            view.markeer(x.o.key, 'fout');
            view.toonLabel(x.o.key, true);
        });
        $('toVraag').innerHTML = '<span class="soort">Test jezelf</span><div class="tekst">Hier ging het mis</div>';
        $('toKeuzes').innerHTML = '<div class="to-verkennen-balk">' +
            '<button type="button" class="to-btn licht" id="toTerugCijfer">&larr; Terug naar je cijfer</button>' +
            '<button type="button" class="to-btn" id="toFoutenOefen">Oefen je fouten</button></div>';
        meld('Tik op een rode plek om te zien wat je antwoordde', '', 2600);
    }
    $('toFoutenKaart').addEventListener('click', toonFoutenKaart);

    function klaar() {
        if (modus === 'test') { klaarTest(); return; }
        $('toKlaarTitel').textContent = 'Klaar!';
        $('toScore').className = 'to-score';
        $('toFoutenKaart').hidden = true;
        $('toFoutenOpnieuw').textContent = 'Oefen je fouten nog een keer';
        $('toFoutenOpnieuw').className = 'to-btn';
        $('toOpnieuw').textContent = 'Nog een keer';
        $('toOpnieuw').className = 'to-btn';
        var pct = totaal ? Math.round(eersteKeerGoed / totaal * 100) : 0;
        $('toScore').textContent = eersteKeerGoed + ' / ' + totaal;
        $('toScoreSub').textContent = pct === 100 ? 'Alles in één keer goed!' : 'in één keer goed (' + pct + '%)';
        $('toKlaarIcoon').innerHTML = pct === 100 ? '&#127942;' : pct >= 70 ? '&#127881;' : '&#128170;';
        var fouten = laatsteRonde.filter(function (o) { return foutKeys[o.key]; });
        var f = $('toFouten');
        if (fouten.length) {
            f.innerHTML = '<strong>Hier ging het mis:</strong>' + fouten.map(function (o) { return esc(o.naam); }).join(', ');
            f.hidden = false;
        } else {
            f.hidden = true;
        }
        $('toFoutenOpnieuw').hidden = !fouten.length;
        $('toFoutenOpnieuw').onclick = function () { start(modus, fouten); };
        $('toOpnieuw').onclick = function () { start(modus, objs); };
        toon('toKlaar');
    }

    $('toAnders').addEventListener('click', function () { toon('toStart'); });

    // ---------- Start ----------
    var m = /[?&]k=([^&]+)/.exec(location.search);
    var v = /[?&]voorbeeld=([a-z-]+)/.exec(location.search);
    if (m) openCode(decodeURIComponent(m[1]));
    else if (v) openVoorbeeld(v[1]);
    else toonCode('');
});

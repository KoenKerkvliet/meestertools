/* ============================================
   TOPOGRAFIE - Oefenpagina voor leerlingen (/topografie?k=CODE)
   Versie: v1.0.0

   Openbaar, zonder account. Haalt de kaart op via de RPC
   public.topografie_kaart(code) en bewaart niets over wie er oefent.

   Drie oefenvormen:
   - Leren:     kaart met alle namen; tik op iets om de naam te zien.
   - Aanwijzen: "Waar ligt ...?" en de leerling klikt op de kaart.
   - Benoemen:  een plek licht op en de leerling kiest uit vier namen.

   Een fout antwoord komt achteraan de rij terug, tot alles een keer goed is.
   De score telt alleen wat in één keer goed was.
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
        kaartData = res.data;
        try {
            map = await TopoKaart.laad(kaartData.basis);
        } catch (e) {
            toonCode('De kaart kon niet geladen worden. Probeer het opnieuw.');
            return;
        }
        objs = TopoKaart.resolveAll(map, kaartData.items);
        try { history.replaceState(null, '', location.pathname + '?k=' + encodeURIComponent(code)); } catch (e) {}

        $('toTitel').textContent = kaartData.titel;
        document.title = kaartData.titel + ' - Topografie';
        if (!objs.length) {
            $('toAantal').textContent = 'Op deze kaart staat nog niets. Vraag je juf of meester om de kaart aan te vullen.';
            document.querySelector('.to-modi').hidden = true;
        } else {
            $('toAantal').textContent = map.naam + ' · ' + objs.length + (objs.length === 1 ? ' onderdeel' : ' onderdelen');
            document.querySelector('.to-modi').hidden = false;
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
        $('toTeller').hidden = false;
        laatsteRonde = lijst.slice();
        rij = schud(lijst);
        totaal = lijst.length;
        klaarKeys = {}; foutKeys = {}; eersteKeerGoed = 0;
        volgende();
    }

    $('toKeuzes').addEventListener('click', function (e) {
        if (e.target.id === 'toNamenWissel') {
            var aan = !$('toKaart').classList.contains('labels-aan');
            view.toonLabels(aan);
            e.target.textContent = aan ? 'Namen verbergen' : 'Namen tonen';
            return;
        }
        if (e.target.id === 'toNaarAanwijzen') { start('aanwijzen', objs); return; }
        var b = e.target.closest('.to-keuze');
        if (b && !b.disabled) kiesNaam(b);
    });

    // ---------- Vragen ----------
    var WAAR = { rivier: 'Waar stroomt de ', vlak: 'Waar ligt ' };
    var HOE = {
        provincie: 'Hoe heet deze provincie?', land: 'Hoe heet dit land?', gebergte: 'Hoe heet dit gebergte?', plaats: 'Hoe heet deze plaats?', hoofdstad: 'Hoe heet deze plaats?',
        provhoofdstad: 'Hoe heet deze plaats?', rivier: 'Hoe heet deze rivier?', water: 'Hoe heet dit water?',
        eiland: 'Hoe heet dit eiland?', gebied: 'Hoe heet dit gebied?', eigen: 'Hoe heet deze plek?'
    };
    var GROEP = { provincie: 'p', land: 'p', rivier: 'r', water: 'w', eiland: 'g', gebied: 'g', gebergte: 'b' };
    function groep(o) { return GROEP[o.soort] || 'plaats'; }

    function teller() {
        $('toTeller').textContent = Object.keys(klaarKeys).length + ' / ' + totaal;
    }

    function volgende() {
        wacht = false;
        view.wisMarkeringen();
        teller();
        if (!rij.length) { klaar(); return; }
        huidige = rij.shift();
        var soort = TopoKaart.SOORT_LABEL[huidige.soort] || '';

        if (modus === 'aanwijzen') {
            // "Waar ligt Noordzee?" of "Waar ligt Alpen?" loopt niet (de, het):
            // bij wateren, gebergten en gebieden een kale opdracht
            var kaal = huidige.soort === 'water' || huidige.soort === 'gebergte' || huidige.soort === 'gebied';
            var tekst = kaal ? 'Wijs aan: ' + huidige.naam
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

    function kiesNaam(b) {
        if (wacht) return;
        var knoppen = $('toKeuzes').querySelectorAll('.to-keuze');
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
        if (modus !== 'aanwijzen' || wacht || !huidige) return;

        // Net naast een stip geklikt telt als die stip
        if ((!obj || obj.vorm === 'vlak') && huidige.vorm === 'punt') obj = view.dichtstbijPunt(p, 26) || null;
        if (!obj || (huidige.vorm !== 'vlak' && obj.vorm === 'vlak')) {
            meld(huidige.vorm === 'punt' ? 'Klik op een stip' : huidige.vorm === 'lijn' ? 'Klik op een rivier' : 'Klik op een provincie', '', 1200);
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

    // ---------- Klaar ----------
    function klaar() {
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
    if (m) openCode(decodeURIComponent(m[1]));
    else toonCode('');
});

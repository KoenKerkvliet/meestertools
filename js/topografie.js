/* ============================================
   TOPOGRAFIE - Editor voor de leerkracht
   Versie: v1.0.0

   - Mijn kaarten: lijst met eigen kaarten (bewerken, delen, verwijderen).
   - Bewerken: provincies, provinciehoofdsteden, plaatsen, rivieren,
     wateren/gebieden en eigen punten aan- en uitzetten. Wijzigingen worden
     vanzelf opgeslagen.
   - Delen: link + QR-code naar /topografie?k=CODE. Leerlingen oefenen
     daar zonder account (zie js/topografie-oefenen.js).
   - Afdrukken: oefenblad of toets op A4 (zie js/topografie-print.js).

   Tabel: public.topografie_kaarten (alleen je eigen kaarten, via RLS).
   Basiskaart en item-ids: js/topografie-kaart.js en assets/topografie/.
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    var $ = function (id) { return document.getElementById(id); };
    var esc = function (s) { return MT.escapeHtml(s); };

    var lijstScherm = $('topoLijstScherm');
    var bewerkScherm = $('topoBewerkScherm');
    var kaartenEl = $('topoKaarten');

    var kaarten = [];
    var huidig = null;          // { id, titel, basis, items, code }
    var map = null;             // basiskaart (TopoKaart.laad)
    var view = null;            // kaartweergave
    var gekozen = {};           // key -> item
    var volgorde = [];          // keys in volgorde van toevoegen
    var eigenPunt = null;       // { x, y } tijdens het plaatsen van een eigen punt
    var eigenModus = false;
    var viewBasis = '';         // voor welke basiskaart de weergave gemaakt is
    var opslaanTimer = null;
    var bezigMetOpslaan = false;

    // Per basiskaart: naam en voorbeelden in de invoervelden
    var BASIS = {
        nederland: { naam: 'Nederland', titel: 'bijv. Provincies en hoofdsteden', zoek: 'bijv. Den Helder' },
        europa: { naam: 'Europa', titel: 'bijv. Landen en hoofdsteden van Europa', zoek: 'bijv. Barcelona' },
        wereld: { naam: 'Wereld', titel: 'bijv. Werelddelen en oceanen', zoek: 'bijv. New York' },
        noordamerika: { naam: 'Noord-Amerika', titel: 'bijv. Landen van Midden-Amerika', zoek: 'bijv. Chicago' },
        zuidamerika: { naam: 'Zuid-Amerika', titel: 'bijv. Landen en hoofdsteden van Zuid-Amerika', zoek: 'bijv. Rio de Janeiro' },
        afrika: { naam: 'Afrika', titel: 'bijv. Landen van Afrika', zoek: 'bijv. Lagos' },
        azie: { naam: 'Azië', titel: 'bijv. Landen en hoofdsteden van Azië', zoek: 'bijv. Shanghai' },
        oceanie: { naam: 'Oceanië', titel: 'bijv. Australië en de eilanden', zoek: 'bijv. Sydney' }
    };
    function basisNaam(b) { return (BASIS[b] || {}).naam || b; }

    // ---------- Hulpjes ----------
    function key(it) { return it.t + ':' + it.id; }

    function oefenUrl(code) { return location.origin + '/topografie?k=' + encodeURIComponent(code); }

    function datumTekst(iso) {
        try {
            return new Date(iso).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
        } catch (e) { return ''; }
    }

    function normaal(s) {
        return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/['’]/g, '');
    }

    // ---------- Mijn kaarten ----------
    async function laadLijst() {
        var res = await supabase
            .from('topografie_kaarten')
            .select('id, titel, basis, items, code, updated_at')
            .order('updated_at', { ascending: false });
        if (res.error) {
            kaartenEl.innerHTML = '<p class="topo-hint">Je kaarten konden niet geladen worden. Ververs de pagina en probeer het opnieuw.</p>';
            return;
        }
        kaarten = res.data || [];
        renderLijst();
    }

    function renderLijst() {
        if (!kaarten.length) {
            kaartenEl.innerHTML = '<div class="topo-leeg"><span class="icoon">&#128506;&#65039;</span>' +
                '<p>Je hebt nog geen kaarten. Maak er een en kies wat je klas moet kennen.</p></div>';
            return;
        }
        kaartenEl.innerHTML = '<div class="topo-kaarten">' + kaarten.map(function (k) {
            var n = (k.items || []).length;
            return '<div class="topo-kaartje" data-id="' + esc(k.id) + '">' +
                '<h3>' + esc(k.titel) + '</h3>' +
                '<div class="meta">' + esc(basisNaam(k.basis)) + ' &middot; ' + n + (n === 1 ? ' onderdeel' : ' onderdelen') +
                ' &middot; ' + esc(datumTekst(k.updated_at)) + '</div>' +
                '<div class="acties">' +
                '<button type="button" class="topo-knop klein" data-actie="bewerk">Bewerken</button>' +
                '<button type="button" class="topo-knop licht klein" data-actie="deel">Delen</button>' +
                '<button type="button" class="topo-knop licht klein" data-actie="print">Afdrukken</button>' +
                '<button type="button" class="topo-knop gevaar klein" data-actie="verwijder">Verwijderen</button>' +
                '</div></div>';
        }).join('') + '</div>';
    }

    kaartenEl.addEventListener('click', function (e) {
        var b = e.target.closest('[data-actie]');
        if (!b) return;
        var id = b.closest('.topo-kaartje').dataset.id;
        var k = kaarten.filter(function (x) { return x.id === id; })[0];
        if (!k) return;
        if (b.dataset.actie === 'bewerk') openKaart(k);
        else if (b.dataset.actie === 'deel') toonDelen(k);
        else if (b.dataset.actie === 'print') toonAfdrukken(k);
        else if (b.dataset.actie === 'verwijder') verwijder(k);
    });

    var nieuwModal = $('topoNieuwModal');
    $('topoNieuw').addEventListener('click', function () { nieuwModal.hidden = false; });
    $('topoNieuwSluit').addEventListener('click', function () { nieuwModal.hidden = true; });
    nieuwModal.addEventListener('click', function (e) {
        if (e.target === nieuwModal) { nieuwModal.hidden = true; return; }
        var b = e.target.closest('[data-basis]');
        if (b && !b.disabled) maakKaart(b.dataset.basis, b);
    });

    async function maakKaart(basis, knop) {
        knop.disabled = true;
        var res = await supabase
            .from('topografie_kaarten')
            .insert({ titel: 'Nieuwe kaart', basis: basis, items: [] })
            .select('id, titel, basis, items, code, updated_at')
            .single();
        knop.disabled = false;
        nieuwModal.hidden = true;
        if (res.error || !res.data) {
            alert('De kaart kon niet aangemaakt worden. Probeer het opnieuw.');
            return;
        }
        kaarten.unshift(res.data);
        await openKaart(res.data);
        $('topoTitel').select();
    }

    async function verwijder(k) {
        if (!confirm('"' + k.titel + '" verwijderen? De link werkt daarna niet meer voor je leerlingen.')) return;
        var res = await supabase.from('topografie_kaarten').delete().eq('id', k.id);
        if (res.error) { alert('Verwijderen lukte niet. Probeer het opnieuw.'); return; }
        kaarten = kaarten.filter(function (x) { return x.id !== k.id; });
        renderLijst();
    }

    // ---------- Bewerken ----------
    async function openKaart(k) {
        huidig = { id: k.id, titel: k.titel, basis: k.basis, items: (k.items || []).slice(), code: k.code };
        lijstScherm.hidden = true;
        bewerkScherm.hidden = false;
        $('topoTitel').value = huidig.titel;
        $('topoProbeer').href = oefenUrl(huidig.code);
        zetStatus('');
        try { history.replaceState(null, '', '?kaart=' + encodeURIComponent(k.id)); } catch (e) {}

        try {
            map = await TopoKaart.laad(huidig.basis);
        } catch (e) {
            alert('De kaart kon niet geladen worden. Ververs de pagina en probeer het opnieuw.');
            return;
        }

        gekozen = {}; volgorde = [];
        huidig.items.forEach(function (it) {
            if (!TopoKaart.resolve(map, it)) return;   // verdwenen item: niet meenemen
            gekozen[key(it)] = it;
            volgorde.push(key(it));
        });

        // Andere basiskaart dan de vorige keer: weergave opnieuw opbouwen
        if (!view || viewBasis !== huidig.basis) {
            view = TopoKaart.maak($('topoKaart'), map, { onKlik: kaartKlik });
            view.toonLabels(true);
            viewBasis = huidig.basis;
            tip = null;
        }
        zetTeksten();
        bouwChips();
        render();
    }

    function naarLijst() {
        flushOpslaan();
        stopEigen();
        huidig = null;
        bewerkScherm.hidden = true;
        lijstScherm.hidden = false;
        try { history.replaceState(null, '', location.pathname); } catch (e) {}
        renderLijst();
    }

    $('topoTerug').addEventListener('click', function (e) {
        if (!huidig) return;
        e.preventDefault();
        naarLijst();
    });

    function heeft(k) { return !!gekozen[k]; }

    function zet(it, aan) {
        var k = key(it);
        if (aan && !gekozen[k]) { gekozen[k] = it; volgorde.push(k); }
        else if (!aan && gekozen[k]) {
            delete gekozen[k];
            volgorde = volgorde.filter(function (x) { return x !== k; });
        }
    }

    function wissel(it) {
        zet(it, !heeft(key(it)));
        gewijzigd();
    }

    function gewijzigd() {
        huidig.items = volgorde.map(function (k) { return gekozen[k]; });
        render();
        planOpslaan();
    }

    // ---------- Chips ----------
    function hoofdsteden() {
        return map.hoofdsteden.slice().sort(function (a, b) { return a.naam.localeCompare(b.naam, 'nl'); });
    }

    function zetTeksten() {
        var t = map.teksten, b = BASIS[huidig.basis] || {};
        $('topoTekstVlakken').textContent = t.vlakken;
        $('topoTekstKlik').textContent = 'Je kunt ook op een ' + t.vlak + ' in de kaart klikken.';
        $('topoTekstHoofd').textContent = t.hoofdsteden;
        $('topoAlleP').textContent = 'Alle ' + map.provincies.length;
        $('topoAlleH').textContent = 'Alle ' + map.hoofdsteden.length;
        $('topoTekstGebieden').textContent = {
            nederland: 'Wateren, eilanden en gebieden',
            europa: 'Wateren, gebergten en eilanden',
            wereld: 'Werelddelen, wateren en gebieden'
        }[huidig.basis] || t.gebiedenKop || 'Wateren en gebieden';
        $('topoTitel').placeholder = 'Naam van de kaart, ' + (b.titel || '');
        $('topoZoek').placeholder = 'Zoek een plaats, ' + (b.zoek || '');
    }

    function chipHtml(t, id, naam) {
        return '<button type="button" class="topo-chip" data-t="' + t + '" data-id="' + esc(id) + '">' + esc(naam) + '</button>';
    }

    function bouwChips() {
        $('chipsP').innerHTML = map.provincies.map(function (p) { return chipHtml('p', p.id, p.naam); }).join('');
        $('chipsH').innerHTML = hoofdsteden().map(function (s) { return chipHtml('s', s.id, s.naam); }).join('');
        $('chipsR').innerHTML = map.rivieren.map(function (r) { return chipHtml('r', r.id, r.naam); }).join('');
        var nl = huidig.basis === 'nederland';
        var groepen = [['werelddeel', 'Werelddelen'], ['water', 'Water'], ['gebergte', 'Gebergten'],
            ['eiland', nl ? 'Waddeneilanden' : 'Eilanden'],
            ['gebied', map.teksten.gebiedGroep || (nl ? 'Gebieden en streken' : huidig.basis === 'wereld' ? 'Woestijnen en gebieden' : 'Schiereilanden en gebieden')]];
        $('chipsG').innerHTML = groepen.map(function (g) {
            var lijst = map.gebieden.filter(function (x) { return x.soort === g[0]; })
                .sort(function (a, b) { return a.naam.localeCompare(b.naam, 'nl'); });
            if (!lijst.length) return '';
            return '<div class="topo-chip-groep">' + g[1] + '</div><div class="topo-chips">' +
                lijst.map(function (x) { return chipHtml('g', x.id, x.naam); }).join('') + '</div>';
        }).join('');
    }

    bewerkScherm.addEventListener('click', function (e) {
        var chip = e.target.closest('.topo-chip');
        if (chip) {
            wissel({ t: chip.dataset.t, id: chip.dataset.id });
            return;
        }
        var alle = e.target.closest('[data-alle]'), geen = e.target.closest('[data-geen]');
        if (alle || geen) {
            var soort = (alle || geen).dataset.alle || (geen && geen.dataset.geen);
            var lijst = soort === 'p'
                ? map.provincies.map(function (p) { return { t: 'p', id: p.id }; })
                : hoofdsteden().map(function (s) { return { t: 's', id: s.id }; });
            lijst.forEach(function (it) { zet(it, !!alle); });
            gewijzigd();
        }
    });

    // ---------- Plaatsen zoeken ----------
    var zoekInvoer = $('topoZoek');
    var suggestiesEl = $('topoSuggesties');
    var suggesties = [];
    var actief = 0;

    function zoek() {
        var q = normaal(zoekInvoer.value.trim());
        if (!q || !map) { suggesties = []; suggestiesEl.innerHTML = ''; return; }
        var begin = [], midden = [];
        map.plaatsen.forEach(function (s) {
            var n = normaal(s.naam);
            if (n.indexOf(q) === 0) begin.push(s);
            else if (n.indexOf(q) > 0) midden.push(s);
        });
        suggesties = begin.concat(midden).slice(0, 8);   // al op inwonertal gesorteerd
        // Enter pakt de eerste die nog niet op de kaart staat
        actief = Math.max(0, suggesties.findIndex(function (s) { return !heeft('s:' + s.id); }));
        if (!suggesties.length) {
            suggestiesEl.innerHTML = '<p class="topo-hint" style="margin:4px 2px 0;">Niet gevonden. Gebruik een eigen punt.</p>';
            return;
        }
        suggestiesEl.innerHTML = suggesties.map(function (s, i) {
            var al = heeft('s:' + s.id);
            var info = al ? 'staat erop' : (s.pop ? s.pop.toLocaleString('nl-NL') + ' inw.' : '');
            return '<button type="button" class="topo-suggestie' + (al ? ' al' : '') + (i === actief ? ' actief' : '') +
                '" data-i="' + i + '">' + esc(s.naam) + ' <small>' + info + '</small></button>';
        }).join('');
    }

    function kiesSuggestie(i) {
        var s = suggesties[i];
        if (!s || heeft('s:' + s.id)) return;
        zet({ t: 's', id: s.id }, true);
        gewijzigd();
        view.inBeeld('s:' + s.id);
        zoekInvoer.value = '';
        zoek();
        zoekInvoer.focus();
    }

    zoekInvoer.addEventListener('input', zoek);
    zoekInvoer.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); kiesSuggestie(actief); }
        else if (e.key === 'ArrowDown' && suggesties.length) { e.preventDefault(); actief = Math.min(suggesties.length - 1, actief + 1); markeerSuggestie(); }
        else if (e.key === 'ArrowUp' && suggesties.length) { e.preventDefault(); actief = Math.max(0, actief - 1); markeerSuggestie(); }
        else if (e.key === 'Escape') { zoekInvoer.value = ''; zoek(); }
    });
    function markeerSuggestie() {
        suggestiesEl.querySelectorAll('.topo-suggestie').forEach(function (b, i) { b.classList.toggle('actief', i === actief); });
    }
    suggestiesEl.addEventListener('click', function (e) {
        var b = e.target.closest('.topo-suggestie');
        if (b) kiesSuggestie(+b.dataset.i);
    });

    function voegGrootsteToe(n) {
        map.plaatsen.slice(0, n).forEach(function (s) { zet({ t: 's', id: s.id }, true); });
        gewijzigd();
    }
    $('topoGroot10').addEventListener('click', function () { voegGrootsteToe(10); });
    $('topoGroot25').addEventListener('click', function () { voegGrootsteToe(25); });

    // ---------- Eigen punt ----------
    var tip = null;
    function startEigen() {
        eigenModus = true;
        eigenPunt = null;
        $('topoKaart').classList.add('plaats-modus');
        $('topoEigenStart').hidden = true;
        if (!tip) {
            tip = document.createElement('div');
            tip.className = 'topo-plaats-tip';
            $('topoKaart').appendChild(tip);
        }
        tip.textContent = 'Klik op de plek in de kaart';
        tip.hidden = false;
    }
    function stopEigen() {
        eigenModus = false;
        eigenPunt = null;
        $('topoKaart').classList.remove('plaats-modus');
        $('topoEigenStart').hidden = false;
        $('topoEigenForm').hidden = true;
        $('topoEigenNaam').value = '';
        if (tip) tip.hidden = true;
        if (huidig) render();
    }
    $('topoEigenStart').addEventListener('click', startEigen);
    $('topoEigenAnnuleer').addEventListener('click', stopEigen);
    $('topoEigenForm').addEventListener('submit', function (e) {
        e.preventDefault();
        var naam = $('topoEigenNaam').value.trim().slice(0, 60);
        if (!naam || !eigenPunt) { $('topoEigenNaam').focus(); return; }
        var it = { t: 'e', id: 'e' + Date.now().toString(36), naam: naam, x: eigenPunt.x, y: eigenPunt.y };
        stopEigen();
        zet(it, true);
        gewijzigd();
    });

    function kaartKlik(obj, p, e) {
        if (eigenModus) {
            eigenPunt = { x: Math.round(p.x * 10) / 10, y: Math.round(p.y * 10) / 10 };
            tip.textContent = 'Geef de plek een naam (of klik ergens anders)';
            $('topoEigenForm').hidden = false;
            render();
            $('topoEigenNaam').focus();
            return;
        }
        // Klik op een provincie zet hem aan of uit
        if (obj && obj.t === 'p') { wissel({ t: 'p', id: obj.id }); return; }
        var basis = e && e.target && e.target.getAttribute && e.target.getAttribute('data-prov');
        if (!obj && basis) wissel({ t: 'p', id: basis });
    }

    // ---------- Tekenen ----------
    function render() {
        var objs = TopoKaart.resolveAll(map, huidig.items);
        if (eigenPunt) objs.push({ key: 'nieuw', t: 'e', naam: '?', soort: 'eigen', vorm: 'punt', x: eigenPunt.x, y: eigenPunt.y });
        view.setItems(objs);
        if (eigenPunt) view.markeer('nieuw', 'doel');

        bewerkScherm.querySelectorAll('.topo-chip').forEach(function (c) {
            c.classList.toggle('aan', heeft(c.dataset.t + ':' + c.dataset.id));
        });

        var tel = { p: 0, h: 0, s: 0, r: 0, g: 0, e: 0 };
        var hoofdIds = {};
        map.hoofdsteden.forEach(function (s) { hoofdIds[s.id] = 1; });
        objs.forEach(function (o) {
            if (o.key === 'nieuw') return;
            if (o.t === 's' && hoofdIds[o.id]) tel.h++;
            else tel[o.t]++;
        });
        $('tellerP').textContent = tel.p;
        $('tellerH').textContent = tel.h;
        $('tellerS').textContent = tel.s;
        $('tellerR').textContent = tel.r;
        $('tellerG').textContent = tel.g;
        $('tellerE').textContent = tel.e;
        var totaal = objs.filter(function (o) { return o.key !== 'nieuw'; });
        $('tellerTotaal').textContent = totaal.length;

        $('topoGekozen').innerHTML = totaal.length ? totaal.map(function (o) {
            return '<div class="topo-gekozen-item">' + esc(o.naam) +
                '<span class="soort">' + esc(TopoKaart.SOORT_LABEL[o.soort] || '') + '</span>' +
                '<button type="button" data-weg="' + esc(o.key) + '" aria-label="' + esc(o.naam) + ' weghalen" title="Weghalen">&times;</button></div>';
        }).join('') : '<p class="topo-hint">Nog niets gekozen. Begin bijvoorbeeld met de provincies.</p>';

        // Gekozen plaatsen en eigen punten in hun eigen blok, om weg te klikken
        $('topoGekozenS').innerHTML = wegLijst(totaal.filter(function (o) { return o.t === 's' && !hoofdIds[o.id]; }), 'plaatsen');
        $('topoGekozenE').innerHTML = wegLijst(totaal.filter(function (o) { return o.t === 'e'; }), 'eigen punten');

        if (suggesties.length) zoek();
    }

    function wegLijst(lijst, wat) {
        if (!lijst.length) return '';
        return '<div class="topo-weglijst-kop"><span>Op je kaart (klik om weg te halen)</span>' +
            (lijst.length > 1 ? '<button type="button" data-alles-weg="' + lijst.map(function (o) { return esc(o.key); }).join(' ') +
                '">Alle ' + wat + ' weg</button>' : '') + '</div>' +
            '<div class="topo-chips">' + lijst.map(function (o) {
                return '<button type="button" class="topo-wegchip" data-weg="' + esc(o.key) + '" title="' + esc(o.naam) + ' weghalen">' +
                    esc(o.naam) + '<span class="kruis" aria-hidden="true">&times;</span></button>';
            }).join('') + '</div>';
    }

    function wegKlik(e) {
        var b = e.target.closest('[data-weg]'), alles = e.target.closest('[data-alles-weg]');
        var keys = b ? [b.dataset.weg] : alles ? alles.dataset.allesWeg.split(' ') : [];
        if (!keys.length) return;
        keys.forEach(function (k) { if (gekozen[k]) zet(gekozen[k], false); });
        gewijzigd();
    }
    ['topoGekozen', 'topoGekozenS', 'topoGekozenE'].forEach(function (id) { $(id).addEventListener('click', wegKlik); });

    // ---------- Opslaan ----------
    $('topoTitel').addEventListener('input', function () {
        if (!huidig) return;
        huidig.titel = this.value;
        planOpslaan();
    });

    function zetStatus(t) { $('topoStatus').textContent = t; }

    function planOpslaan() {
        zetStatus('Opslaan...');
        clearTimeout(opslaanTimer);
        opslaanTimer = setTimeout(opslaan, 700);
    }

    function flushOpslaan() {
        if (opslaanTimer) { clearTimeout(opslaanTimer); opslaan(); }
    }

    async function opslaan() {
        opslaanTimer = null;
        if (!huidig) return;
        bezigMetOpslaan = true;
        var titel = (huidig.titel || '').trim().slice(0, 80) || 'Naamloze kaart';
        var nu = new Date().toISOString();
        var data = { titel: titel, items: huidig.items, updated_at: nu };
        var id = huidig.id;
        var res = await supabase.from('topografie_kaarten').update(data).eq('id', id);
        bezigMetOpslaan = false;
        if (res.error) {
            zetStatus('Niet opgeslagen');
            opslaanTimer = setTimeout(opslaan, 4000);
            return;
        }
        kaarten.forEach(function (k) {
            if (k.id === id) { k.titel = titel; k.items = data.items; k.updated_at = nu; }
        });
        kaarten.sort(function (a, b) { return a.updated_at < b.updated_at ? 1 : -1; });
        if (huidig && huidig.id === id && !opslaanTimer) zetStatus('Opgeslagen ✓');
    }

    window.addEventListener('beforeunload', function (e) {
        if (opslaanTimer || bezigMetOpslaan) {
            flushOpslaan();
            e.preventDefault();
            e.returnValue = '';
        }
    });

    // ---------- Delen ----------
    var modal = $('topoDeelModal');

    function toonDelen(k) {
        var url = oefenUrl(k.code);
        $('topoDeelTitel').textContent = k.titel;
        $('topoLink').value = url;
        var qrEl = $('topoQr');
        qrEl.innerHTML = '';
        if (typeof qrcode !== 'undefined') {
            try {
                var qr = qrcode(0, 'M');
                qr.addData(url);
                qr.make();
                qrEl.innerHTML = qr.createImgTag(6, 8);
            } catch (e) { /* qr optioneel */ }
        }
        modal.classList.remove('is-groot');
        $('topoGroot').textContent = 'Toon groot op het bord';
        modal.hidden = false;
    }

    $('topoDeel').addEventListener('click', function () {
        if (!huidig) return;
        flushOpslaan();
        toonDelen({ titel: (huidig.titel || '').trim() || 'Naamloze kaart', code: huidig.code });
    });
    $('topoDeelSluit').addEventListener('click', function () { modal.hidden = true; });
    modal.addEventListener('click', function (e) { if (e.target === modal) modal.hidden = true; });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !modal.hidden) modal.hidden = true; });

    $('topoKopieer').addEventListener('click', function () {
        var btn = this, url = $('topoLink').value;
        function klaar(ok) {
            btn.textContent = ok ? 'Gekopieerd!' : 'Kopiëren lukte niet';
            setTimeout(function () { btn.textContent = 'Kopieer link'; }, 1800);
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(function () { klaar(true); }, function () { klaar(false); });
        } else {
            $('topoLink').select();
            try { klaar(document.execCommand('copy')); } catch (e) { klaar(false); }
        }
    });

    $('topoGroot').addEventListener('click', function () {
        var groot = modal.classList.toggle('is-groot');
        this.textContent = groot ? 'Kleiner' : 'Toon groot op het bord';
    });

    // ---------- Afdrukken ----------
    var printModal = $('topoPrintModal');
    var printKaart = null;   // { titel, map, objs }

    async function toonAfdrukken(k) {
        var basis;
        try { basis = await TopoKaart.laad(k.basis); } catch (e) {
            alert('De kaart kon niet geladen worden. Probeer het opnieuw.');
            return;
        }
        var objs = TopoKaart.resolveAll(basis, k.items || []);
        printKaart = { id: k.id, titel: k.titel, map: basis, objs: objs };
        laadToetsKeuze();
        $('topoPrintTitel').textContent = k.titel + ' afdrukken';
        $('topoPrintInfo').textContent = objs.length
            ? 'Maak van deze kaart een oefenblad of een toets op A4 (' + objs.length + (objs.length === 1 ? ' onderdeel).' : ' onderdelen).')
            : 'Er staat nog niets op deze kaart. Kies eerst wat erop moet.';
        $('topoPrintOefen').disabled = $('topoPrintToets').disabled = !objs.length;
        // Europa naast de antwoordlijnen wordt te klein: daar standaard de grote kaart
        var layout = k.basis === 'nederland' ? 'naast' : 'achterkant';
        printModal.querySelector('input[name="topoPrintLayout"][value="' + layout + '"]').checked = true;
        printModal.hidden = false;
    }

    // ---------- Toets: welke onderdelen erop komen ----------
    // Een kaart met 30 onderdelen hoeft geen toets met 30 vragen te worden.
    // De keuze wordt per kaart op dit apparaat onthouden (browseropslag),
    // zodat een tweede druk voor een parallelgroep dezelfde toets geeft.
    var toetsKeuze = {};

    function keuzeSleutel() { return 'mt-topo-toets-' + printKaart.id; }

    function laadToetsKeuze() {
        toetsKeuze = {};
        var bewaard = null;
        try { bewaard = JSON.parse(localStorage.getItem(keuzeSleutel()) || 'null'); } catch (e) {}
        printKaart.objs.forEach(function (o) {
            toetsKeuze[o.key] = Array.isArray(bewaard) ? bewaard.indexOf(o.key) !== -1 : true;
        });
        // Bewaarde keuze zonder één bestaand onderdeel (kaart flink veranderd): alles
        if (!printKaart.objs.some(function (o) { return toetsKeuze[o.key]; })) {
            printKaart.objs.forEach(function (o) { toetsKeuze[o.key] = true; });
        }
        $('topoToetsKeuze').open = false;
        $('topoToetsN').value = Math.min(20, printKaart.objs.length) || 1;
        $('topoToetsN').max = printKaart.objs.length;
        bouwToetsLijst();
    }

    function bouwToetsLijst() {
        var c = TopoPrint.codes(printKaart.objs);
        var titels = { cijfer: 'Plaatsen', hoofd: 'Wateren', klein: 'Gebieden' };
        $('topoToetsLijst').innerHTML = ['cijfer', 'hoofd', 'klein'].filter(function (g) { return c.groepen[g].length; }).map(function (g) {
            return '<div class="groep"><div class="groep-titel">' + titels[g] + '</div>' +
                c.groepen[g].slice().sort(function (a, b) { return a.naam.localeCompare(b.naam, 'nl'); }).map(function (o) {
                    return '<label><input type="checkbox" data-key="' + esc(o.key) + '"' + (toetsKeuze[o.key] ? ' checked' : '') + '> ' + esc(o.naam) + '</label>';
                }).join('') + '</div>';
        }).join('');
        werkToetsAantalBij();
    }

    function werkToetsAantalBij() {
        var n = printKaart.objs.filter(function (o) { return toetsKeuze[o.key]; }).length, tot = printKaart.objs.length;
        $('topoToetsAantal').textContent = n === tot ? 'Alle ' + tot + ' onderdelen op de toets' : n + ' van de ' + tot + ' onderdelen op de toets';
        try {
            localStorage.setItem(keuzeSleutel(), JSON.stringify(Object.keys(toetsKeuze).filter(function (k) { return toetsKeuze[k]; })));
        } catch (e) {}
    }

    $('topoToetsLijst').addEventListener('change', function (e) {
        var cb = e.target.closest('input[data-key]');
        if (!cb) return;
        toetsKeuze[cb.dataset.key] = cb.checked;
        werkToetsAantalBij();
    });

    $('topoToetsKeuze').addEventListener('click', function (e) {
        var b = e.target.closest('[data-keuze]');
        if (!b) return;
        var keys = printKaart.objs.map(function (o) { return o.key; });
        if (b.dataset.keuze === 'alles' || b.dataset.keuze === 'niets') {
            keys.forEach(function (k) { toetsKeuze[k] = b.dataset.keuze === 'alles'; });
        } else {
            var n = Math.max(1, Math.min(keys.length, parseInt($('topoToetsN').value, 10) || 1));
            for (var i = keys.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1)), t = keys[i]; keys[i] = keys[j]; keys[j] = t;
            }
            keys.forEach(function (k, i) { toetsKeuze[k] = i < n; });
        }
        bouwToetsLijst();
    });

    function drukAf(soort) {
        if (!printKaart || !printKaart.objs.length) return;
        var objs = printKaart.objs;
        if (soort === 'toets') {
            objs = objs.filter(function (o) { return toetsKeuze[o.key]; });
            if (!objs.length) { alert('Kies minstens één onderdeel voor de toets.'); return; }
        }
        var layout = (printModal.querySelector('input[name="topoPrintLayout"]:checked') || {}).value || 'naast';
        var inhoud = TopoPrint.html(printKaart.map, objs, printKaart.titel, soort, {
            naam: $('topoPrintOefenNaam').checked,
            layout: layout,
            nakijk: $('topoPrintNakijk').checked
        });
        printModal.hidden = true;
        TopoPrint.afdrukken(inhoud);
    }

    $('topoPrintOefen').addEventListener('click', function () { drukAf('oefenblad'); });
    $('topoPrintToets').addEventListener('click', function () { drukAf('toets'); });
    $('topoPrintSluit').addEventListener('click', function () { printModal.hidden = true; });
    printModal.addEventListener('click', function (e) { if (e.target === printModal) printModal.hidden = true; });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !printModal.hidden) printModal.hidden = true; });

    // ---------- Start ----------
    (async function start() {
        await laadLijst();
        var m = /[?&]kaart=([^&]+)/.exec(location.search);
        if (m) {
            var k = kaarten.filter(function (x) { return x.id === decodeURIComponent(m[1]); })[0];
            if (k) await openKaart(k);
        }
        if (window.hidePageLoader) window.hidePageLoader();
    })();
});

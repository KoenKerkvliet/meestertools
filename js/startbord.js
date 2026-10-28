/* ============================================
   STARTBORD - eigen borden voor het digibord
   Versie: v1.0.0

   - Mijn borden: overzicht in volgorde, met bewerken, presenteren,
     kopiëren, verwijderen en een plek opschuiven.
   - Bewerken: indeling (1 tot 4 vakken), kleur, en per vak een blok:
     tekst (titel + opgemaakte tekst), datum en klok, takenlijst of een tool.
     Wijzigingen worden vanzelf opgeslagen.
   - Presenteren: schermvullend, met de pijltjestoetsen door alle borden.

   Een bord is 1600 x 900 en wordt als geheel geschaald (zie css/startbord.css):
   het voorbeeld in de editor is daardoor precies wat er op het digibord staat.
   Tools staan in een iframe in de ingebedde stand (?ingebed=1, js/template.js).

   Tabel: public.startborden (alleen je eigen borden).
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    var $ = function (id) { return document.getElementById(id); };
    var esc = function (s) { return MT.escapeHtml(s); };

    var BREED = 1600, HOOG = 900;
    var VAKKEN = { een: 1, twee: 2, 'groot-twee': 3, vier: 4 };
    var INDELINGEN = [
        ['een', 'Eén groot vak'], ['twee', 'Twee naast elkaar'],
        ['groot-twee', 'Groot vak met twee kleine'], ['vier', 'Vier vakken']
    ];
    var KLEUREN = [
        ['lavendel', '#EEEAFE', 'Lavendel'], ['zon', '#FFF2CF', 'Zon'], ['mint', '#DDF3E6', 'Mint'],
        ['lucht', '#DCEEFA', 'Lucht'], ['roze', '#FCE4EE', 'Roze'], ['nacht', '#2B2A45', 'Nacht']
    ];
    var SOORTEN = [
        ['tekst', '&#128221;', 'Tekst'], ['klok', '&#128339;', 'Datum en klok'],
        ['taken', '&#9989;', 'Takenlijst'], ['tool', '&#129520;', 'Tool'], ['leeg', '&#9675;', 'Leeg']
    ];
    var TOOLS = {
        timetimer: { naam: 'Time Timer', em: '&#9202;', url: '/digibord/timetimer.html' },
        stoplicht: { naam: 'Stoplicht', em: '&#128678;', url: '/digibord/stoplicht.html' },
        geluidsmeter: { naam: 'Geluidsmeter', em: '&#128266;', url: '/digibord/geluidsmeter.html' },
        namenkiezer: { naam: 'Namenkiezer', em: '&#9997;&#65039;', url: '/digibord/namenkiezer.html' }
    };

    var borden = [];
    var huidig = null;      // bord dat bewerkt wordt
    var gekozenVak = 0;
    var opslaanTimer = null;

    // ---------- Opgemaakte tekst schoonhouden ----------
    // Alleen vet, cursief, onderstreept, alinea's, regels en opsommingen.
    // Al het andere (stijlen, links, plaatjes, scripts) gaat eruit, maar de
    // tekst erin blijft staan.
    var TOEGESTAAN = { B: 'b', STRONG: 'b', I: 'i', EM: 'i', U: 'u', BR: 'br', DIV: 'div', P: 'div', UL: 'ul', OL: 'ol', LI: 'li' };
    function schoon(html) {
        var bron = document.createElement('template');
        bron.innerHTML = String(html || '').slice(0, 8000);
        var uit = document.createElement('div');
        (function kopieer(van, naar) {
            Array.prototype.forEach.call(van.childNodes, function (n) {
                if (n.nodeType === 3) { naar.appendChild(document.createTextNode(n.nodeValue)); return; }
                if (n.nodeType !== 1) return;
                var tag = TOEGESTAAN[n.tagName];
                if (n.tagName === 'SCRIPT' || n.tagName === 'STYLE') return;
                if (!tag) { kopieer(n, naar); return; }
                var nieuw = document.createElement(tag);
                naar.appendChild(nieuw);
                if (tag !== 'br') kopieer(n, nieuw);
            });
        })(bron.content, uit);
        return uit.innerHTML;
    }

    // ---------- Blokken ----------
    function standaardBlok(soort) {
        if (soort === 'tekst') return { type: 'tekst', titel: '', html: '', grootte: 'normaal' };
        if (soort === 'klok') return { type: 'klok', klok: true, datum: true, groet: 'Goedemorgen!' };
        if (soort === 'taken') return { type: 'taken', titel: 'Bij binnenkomst', taken: ['Jas ophangen', 'Agenda pakken', 'Lezen in je boek'] };
        if (soort === 'tool') return { type: 'tool', tool: 'timetimer' };
        return { type: 'leeg' };
    }

    function passend(blokken, indeling) {
        var n = VAKKEN[indeling] || 1, uit = (blokken || []).slice(0, n);
        while (uit.length < n) uit.push({ type: 'leeg' });
        return uit;
    }

    function nu() {
        var d = new Date();
        return {
            dag: d.toLocaleDateString('nl-NL', { weekday: 'long' }),
            datum: d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' }),
            tijd: d.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })
        };
    }

    // modus: 'bewerk' (klikbare vakken, tools als plaatshouder),
    // 'klein' (kaartje in de lijst) of 'presenteer' (tools echt, taken afvinkbaar)
    function blokHtml(b, modus) {
        if (b.type === 'tekst') {
            return '<div class="sb-blok sb-tekst">' +
                (b.titel ? '<h2 class="sb-titel">' + esc(b.titel) + '</h2>' : '') +
                '<div class="sb-inhoud grootte-' + esc(b.grootte || 'normaal') + '">' + schoon(b.html) + '</div></div>';
        }
        if (b.type === 'klok') {
            var t = nu();
            return '<div class="sb-blok sb-klok">' +
                (b.groet ? '<div class="sb-groet">' + esc(b.groet) + '</div>' : '') +
                (b.datum !== false ? '<div class="sb-dag" data-klok="dag">' + esc(t.dag) + '</div><div class="sb-datum" data-klok="datum">' + esc(t.datum) + '</div>' : '') +
                (b.klok !== false ? '<div class="sb-tijd" data-klok="tijd">' + esc(t.tijd) + '</div>' : '') + '</div>';
        }
        if (b.type === 'taken') {
            return '<div class="sb-blok sb-taken">' +
                (b.titel ? '<h2 class="sb-titel">' + esc(b.titel) + '</h2>' : '') +
                '<ol>' + (b.taken || []).map(function (taak) { return '<li>' + esc(taak) + '</li>'; }).join('') + '</ol></div>';
        }
        if (b.type === 'tool') {
            var tool = TOOLS[b.tool] || TOOLS.timetimer;
            if (modus === 'presenteer') {
                return '<div class="sb-toolvak"><iframe src="' + tool.url + '?ingebed=1" title="' + esc(tool.naam) + '" allow="microphone; fullscreen"></iframe></div>';
            }
            return '<div class="sb-plek"><span class="em">' + tool.em + '</span>' + esc(tool.naam) + '<small>werkt bij Presenteren</small></div>';
        }
        return modus === 'bewerk' ? '<div class="sb-plek"><span class="em">+</span>Kies wat hier komt</div>' : '';
    }

    // Tekent het bord in een .sb-schaal-container en schaalt het passend
    function tekenBord(container, bord, modus) {
        var blokken = passend(bord.blokken, bord.indeling);
        container.innerHTML = '<div class="sb-bord ind-' + esc(bord.indeling) + ' kleur-' + esc(bord.kleur) +
            (modus === 'bewerk' ? ' sb-bewerkmodus' : modus === 'presenteer' ? ' sb-presenteer' : '') + '">' +
            blokken.map(function (b, i) {
                // Kleine vakken (2x2, en de twee rechts bij groot + twee) krijgen kleinere letters
                var klein = bord.indeling === 'vier' || (bord.indeling === 'groot-twee' && i > 0);
                return '<div class="sb-vak' + (klein ? ' vak-klein' : '') + (b.type === 'leeg' ? ' is-leeg' : '') +
                    (modus === 'bewerk' && i === gekozenVak ? ' gekozen' : '') + '" data-vak="' + i + '">' + blokHtml(b, modus) + '</div>';
            }).join('') + '</div>';
        var kleur = KLEUREN.filter(function (k) { return k[0] === bord.kleur; })[0];
        container.style.background = kleur ? kleur[1] : '';
        if (ro) ro.observe(container);
        schaal(container);
    }

    function schaal(container) {
        var bord = container.querySelector('.sb-bord');
        if (!bord) return;
        var s = Math.min(container.clientWidth / BREED, container.clientHeight / HOOG) || 0;
        bord.style.transform = 'scale(' + s + ')';
        bord.style.left = ((container.clientWidth - BREED * s) / 2) + 'px';
        bord.style.top = ((container.clientHeight - HOOG * s) / 2) + 'px';
    }

    // Elke bordcontainer schaalt mee met zijn eigen grootte
    var ro = window.ResizeObserver ? new ResizeObserver(function (items) {
        items.forEach(function (it) { schaal(it.target); });
    }) : null;
    window.addEventListener('resize', function () {
        document.querySelectorAll('.sb-schaal').forEach(schaal);
    });

    // Klok bijhouden op alles wat in beeld is
    setInterval(function () {
        var t = nu();
        document.querySelectorAll('[data-klok]').forEach(function (el) {
            var v = t[el.getAttribute('data-klok')];
            if (el.textContent !== v) el.textContent = v;
        });
    }, 1000);

    // ---------- Mijn borden ----------
    async function laadBorden() {
        var res = await supabase.from('startborden')
            .select('id, titel, volgorde, indeling, kleur, blokken, updated_at')
            .order('volgorde', { ascending: true })
            .order('created_at', { ascending: true });
        if (res.error) {
            $('sbBorden').innerHTML = '<p class="sb-hint">Je borden konden niet geladen worden. Ververs de pagina en probeer het opnieuw.</p>';
            return;
        }
        borden = res.data || [];
        renderLijst();
    }

    function renderLijst() {
        var el = $('sbBorden');
        if (!borden.length) {
            el.innerHTML = '<div class="sb-leeg"><span class="icoon">&#128444;&#65039;</span>' +
                '<p>Je hebt nog geen borden. Maak er een, bijvoorbeeld voor de inloop.</p></div>';
            return;
        }
        el.innerHTML = '<div class="sb-borden">' + borden.map(function (b, i) {
            return '<div class="sb-kaartje" data-id="' + esc(b.id) + '">' +
                '<div class="sb-schaal" data-actie="bewerk" title="Bewerken"></div>' +
                '<div class="sb-kaartje-info">' +
                '<div class="sb-kaartje-kop"><span class="sb-nummer">' + (i + 1) + '</span><h3>' + esc(b.titel) + '</h3>' +
                '<span class="sb-verplaats">' +
                '<button type="button" data-actie="eerder" title="Eerder" aria-label="Eerder"' + (i === 0 ? ' disabled' : '') + '>&#8592;</button>' +
                '<button type="button" data-actie="later" title="Later" aria-label="Later"' + (i === borden.length - 1 ? ' disabled' : '') + '>&#8594;</button>' +
                '</span></div>' +
                '<div class="sb-acties">' +
                '<button type="button" class="sb-knop klein" data-actie="presenteer">&#9654; Presenteren</button>' +
                '<button type="button" class="sb-knop licht klein" data-actie="bewerk">Bewerken</button>' +
                '<button type="button" class="sb-knop licht klein" data-actie="kopieer">Kopiëren</button>' +
                '<button type="button" class="sb-knop gevaar klein" data-actie="verwijder">Verwijderen</button>' +
                '</div></div></div>';
        }).join('') + '</div>';
        el.querySelectorAll('.sb-kaartje').forEach(function (k, i) {
            tekenBord(k.querySelector('.sb-schaal'), borden[i], 'klein');
        });
    }

    $('sbBorden').addEventListener('click', async function (e) {
        var b = e.target.closest('[data-actie]');
        if (!b || b.disabled) return;
        var id = b.closest('.sb-kaartje').dataset.id;
        var i = borden.findIndex(function (x) { return x.id === id; });
        if (i < 0) return;
        var actie = b.dataset.actie;
        if (actie === 'bewerk') openBord(borden[i]);
        else if (actie === 'presenteer') presenteer(i);
        else if (actie === 'kopieer') kopieer(borden[i]);
        else if (actie === 'verwijder') verwijder(borden[i]);
        else if (actie === 'eerder' || actie === 'later') verplaats(i, actie === 'eerder' ? -1 : 1);
    });

    $('sbNieuw').addEventListener('click', async function () {
        this.disabled = true;
        var volgorde = borden.length ? Math.max.apply(null, borden.map(function (b) { return b.volgorde; })) + 1 : 0;
        var nieuw = {
            titel: 'Nieuw bord', volgorde: volgorde, indeling: 'groot-twee', kleur: 'lavendel',
            blokken: [
                { type: 'tekst', titel: 'Welkom!', html: 'Pak je leesboek en lees <b>15 minuten</b>.', grootte: 'groot' },
                standaardBlok('klok'),
                standaardBlok('tool')
            ]
        };
        var res = await supabase.from('startborden').insert(nieuw)
            .select('id, titel, volgorde, indeling, kleur, blokken, updated_at').single();
        this.disabled = false;
        if (res.error || !res.data) { alert('Het bord kon niet aangemaakt worden. Probeer het opnieuw.'); return; }
        borden.push(res.data);
        openBord(res.data);
        $('sbTitel').select();
    });

    async function kopieer(b) {
        var volgorde = Math.max.apply(null, borden.map(function (x) { return x.volgorde; })) + 1;
        var res = await supabase.from('startborden').insert({
            titel: (b.titel + ' (kopie)').slice(0, 80), volgorde: volgorde, indeling: b.indeling, kleur: b.kleur, blokken: b.blokken
        }).select('id, titel, volgorde, indeling, kleur, blokken, updated_at').single();
        if (res.error || !res.data) { alert('Kopiëren lukte niet. Probeer het opnieuw.'); return; }
        borden.push(res.data);
        renderLijst();
    }

    async function verwijder(b) {
        if (!confirm('"' + b.titel + '" verwijderen?')) return;
        var res = await supabase.from('startborden').delete().eq('id', b.id);
        if (res.error) { alert('Verwijderen lukte niet. Probeer het opnieuw.'); return; }
        borden = borden.filter(function (x) { return x.id !== b.id; });
        renderLijst();
    }

    // Een plek opschuiven: de twee buren wisselen van volgorde
    async function verplaats(i, stap) {
        var j = i + stap;
        if (j < 0 || j >= borden.length) return;
        var a = borden[i], b = borden[j];
        var va = a.volgorde, vb = b.volgorde;
        if (va === vb) { vb = va + stap; }
        a.volgorde = vb; b.volgorde = va;
        borden[i] = b; borden[j] = a;
        renderLijst();
        await Promise.all([
            supabase.from('startborden').update({ volgorde: a.volgorde }).eq('id', a.id),
            supabase.from('startborden').update({ volgorde: b.volgorde }).eq('id', b.id)
        ]);
    }

    // ---------- Bewerken ----------
    function openBord(b) {
        huidig = b;
        huidig.blokken = passend(b.blokken, b.indeling);
        gekozenVak = 0;
        $('sbLijstScherm').hidden = true;
        $('sbBewerkScherm').hidden = false;
        $('sbTitel').value = b.titel;
        zetStatus('');
        try { history.replaceState(null, '', '?bord=' + encodeURIComponent(b.id)); } catch (e) {}
        renderInstellingen();
        renderVoorbeeld();
        renderPaneel();
    }

    function naarLijst() {
        flushOpslaan();
        huidig = null;
        $('sbBewerkScherm').hidden = true;
        $('sbLijstScherm').hidden = false;
        try { history.replaceState(null, '', location.pathname); } catch (e) {}
        renderLijst();
    }

    $('sbTerug').addEventListener('click', function (e) {
        if (!huidig) return;
        e.preventDefault();
        naarLijst();
    });

    function renderInstellingen() {
        $('sbIndelingen').innerHTML = INDELINGEN.map(function (ind) {
            var n = VAKKEN[ind[0]], vakjes = '';
            for (var i = 0; i < n; i++) vakjes += '<i></i>';
            return '<button type="button" class="sb-indeling ind-' + ind[0] + (huidig.indeling === ind[0] ? ' aan' : '') +
                '" data-indeling="' + ind[0] + '" title="' + ind[1] + '" aria-label="' + ind[1] + '">' + vakjes + '</button>';
        }).join('');
        $('sbKleuren').innerHTML = KLEUREN.map(function (k) {
            return '<button type="button" class="sb-kleur' + (huidig.kleur === k[0] ? ' aan' : '') + '" data-kleur="' + k[0] +
                '" style="background:' + k[1] + '" title="' + k[2] + '" aria-label="' + k[2] + '"></button>';
        }).join('');
    }

    $('sbIndelingen').addEventListener('click', function (e) {
        var b = e.target.closest('[data-indeling]');
        if (!b) return;
        huidig.indeling = b.dataset.indeling;
        huidig.blokken = passend(huidig.blokken, huidig.indeling);
        gekozenVak = Math.min(gekozenVak, huidig.blokken.length - 1);
        gewijzigd(true);
    });
    $('sbKleuren').addEventListener('click', function (e) {
        var b = e.target.closest('[data-kleur]');
        if (!b) return;
        huidig.kleur = b.dataset.kleur;
        gewijzigd(false);
    });

    function renderVoorbeeld() {
        tekenBord($('sbVoorbeeld'), huidig, 'bewerk');
        renderInstellingen();
    }

    $('sbVoorbeeld').addEventListener('click', function (e) {
        var vak = e.target.closest('[data-vak]');
        if (!vak) return;
        gekozenVak = +vak.dataset.vak;
        renderVoorbeeld();
        renderPaneel();
    });

    // ---------- Paneel voor het gekozen vak ----------
    function renderPaneel() {
        var b = huidig.blokken[gekozenVak];
        var h = '<h3>Vak ' + (gekozenVak + 1) + ' van ' + huidig.blokken.length + '</h3>' +
            '<div class="sb-soorten">' + SOORTEN.map(function (s) {
                return '<button type="button" class="sb-soort' + (b.type === s[0] ? ' aan' : '') + '" data-soort="' + s[0] + '">' + s[1] + ' ' + s[2] + '</button>';
            }).join('') + '</div>';

        if (b.type === 'tekst') {
            h += '<label class="sb-veld"><span>Titel</span><input type="text" data-veld="titel" maxlength="80" value="' + esc(b.titel || '') + '" placeholder="Bijv. Welkom!"></label>' +
                '<div class="sb-veld"><span>Tekst</span>' +
                '<div class="sb-opmaak" id="sbOpmaak">' +
                '<button type="button" data-cmd="bold" title="Vet (Ctrl+B)"><b>B</b></button>' +
                '<button type="button" data-cmd="italic" title="Cursief (Ctrl+I)"><i>I</i></button>' +
                '<button type="button" data-cmd="underline" title="Onderstreept (Ctrl+U)"><u>U</u></button>' +
                '<button type="button" data-cmd="insertUnorderedList" title="Opsomming">&#8226; Lijst</button>' +
                '<select data-veld="grootte" aria-label="Lettergrootte">' +
                [['normaal', 'Normaal'], ['groot', 'Groot'], ['heelgroot', 'Heel groot']].map(function (g) {
                    return '<option value="' + g[0] + '"' + ((b.grootte || 'normaal') === g[0] ? ' selected' : '') + '>' + g[1] + '</option>';
                }).join('') + '</select></div>' +
                '<div class="sb-editor" id="sbEditor" contenteditable="true" data-leeg="Typ hier je tekst..."></div></div>';
        } else if (b.type === 'klok') {
            h += '<label class="sb-veld"><span>Begroeting</span><input type="text" data-veld="groet" maxlength="60" value="' + esc(b.groet || '') + '" placeholder="Bijv. Goedemorgen groep 6!"></label>' +
                '<label class="sb-vinkje"><input type="checkbox" data-veld="datum"' + (b.datum !== false ? ' checked' : '') + '> Dag en datum tonen</label>' +
                '<label class="sb-vinkje"><input type="checkbox" data-veld="klok"' + (b.klok !== false ? ' checked' : '') + '> Klok tonen</label>';
        } else if (b.type === 'taken') {
            h += '<label class="sb-veld"><span>Titel</span><input type="text" data-veld="titel" maxlength="80" value="' + esc(b.titel || '') + '" placeholder="Bijv. Bij binnenkomst"></label>' +
                '<label class="sb-veld"><span>Taken (één per regel)</span><textarea data-veld="taken" maxlength="1200">' + esc((b.taken || []).join('\n')) + '</textarea></label>' +
                '<p class="sb-hint">Bij Presenteren tikt een leerling een taak aan om hem af te vinken.</p>';
        } else if (b.type === 'tool') {
            h += '<div class="sb-tools">' + Object.keys(TOOLS).map(function (k) {
                return '<button type="button" class="sb-tool' + (b.tool === k ? ' aan' : '') + '" data-tool="' + k + '"><span class="em">' + TOOLS[k].em + '</span>' + TOOLS[k].naam + '</button>';
            }).join('') + '</div>' +
                '<p class="sb-hint">De tool werkt zoals je hem kent. Instellingen (zoals je klas bij de namenkiezer) kies je in de tool zelf.</p>';
        } else {
            h += '<p class="sb-hint">Dit vak blijft leeg. Kies hierboven wat erin moet.</p>';
        }
        $('sbPaneel').innerHTML = h;

        var editor = $('sbEditor');
        if (editor) {
            editor.innerHTML = schoon(b.html);
            try { document.execCommand('defaultParagraphSeparator', false, 'div'); } catch (e) {}
        }
    }

    var paneel = $('sbPaneel');

    paneel.addEventListener('click', function (e) {
        var s = e.target.closest('[data-soort]');
        if (s) {
            var b = huidig.blokken[gekozenVak];
            if (b.type !== s.dataset.soort) {
                huidig.blokken[gekozenVak] = standaardBlok(s.dataset.soort);
                gewijzigd(true);
                renderPaneel();
            }
            return;
        }
        var t = e.target.closest('[data-tool]');
        if (t) {
            huidig.blokken[gekozenVak].tool = t.dataset.tool;
            gewijzigd(true);
            renderPaneel();
        }
    });

    // Opmaakknoppen: mousedown voorkomen, anders verliest het tekstvak zijn selectie
    paneel.addEventListener('mousedown', function (e) {
        if (e.target.closest('[data-cmd]')) e.preventDefault();
    });
    paneel.addEventListener('click', function (e) {
        var c = e.target.closest('[data-cmd]');
        if (!c) return;
        $('sbEditor').focus();
        document.execCommand(c.dataset.cmd, false, null);
        tekstGewijzigd();
    });

    function werkOpmaakknoppenBij() {
        var balk = $('sbOpmaak');
        if (!balk) return;
        balk.querySelectorAll('[data-cmd]').forEach(function (b) {
            var aan = false;
            try { aan = document.queryCommandState(b.dataset.cmd); } catch (e) {}
            b.classList.toggle('aan', aan);
        });
    }
    document.addEventListener('selectionchange', function () {
        var ed = $('sbEditor');
        if (ed && ed.contains(document.getSelection().anchorNode)) werkOpmaakknoppenBij();
    });

    function tekstGewijzigd() {
        var ed = $('sbEditor');
        if (!ed) return;
        huidig.blokken[gekozenVak].html = schoon(ed.innerHTML);
        werkOpmaakknoppenBij();
        gewijzigd(false);
    }

    paneel.addEventListener('input', function (e) {
        if (e.target.id === 'sbEditor') { tekstGewijzigd(); return; }
        var veld = e.target.getAttribute('data-veld');
        if (!veld || e.target.type === 'checkbox') return;
        var b = huidig.blokken[gekozenVak];
        if (veld === 'taken') {
            b.taken = e.target.value.split('\n').map(function (r) { return r.trim(); }).filter(Boolean).slice(0, 12);
        } else {
            b[veld] = e.target.value;
        }
        gewijzigd(false);
    });
    paneel.addEventListener('change', function (e) {
        var veld = e.target.getAttribute('data-veld');
        if (!veld) return;
        var b = huidig.blokken[gekozenVak];
        if (e.target.type === 'checkbox') b[veld] = e.target.checked;
        else b[veld] = e.target.value;
        gewijzigd(false);
    });

    // Plakken en slepen: alleen de tekst, niet de opmaak (of plaatjes) van een
    // website of Word
    ['paste', 'drop'].forEach(function (ev) {
        paneel.addEventListener(ev, function (e) {
            if (e.target.id !== 'sbEditor' && !(e.target.closest && e.target.closest('#sbEditor'))) return;
            e.preventDefault();
            var data = ev === 'paste' ? (e.clipboardData || window.clipboardData) : e.dataTransfer;
            var tekst = data ? data.getData('text/plain') : '';
            if (tekst) document.execCommand('insertText', false, tekst);
        });
    });

    // ---------- Opslaan ----------
    $('sbTitel').addEventListener('input', function () {
        if (!huidig) return;
        huidig.titel = this.value;
        planOpslaan();
    });

    var voorbeeldTimer = null;
    function gewijzigd(meteen) {
        clearTimeout(voorbeeldTimer);
        if (meteen) renderVoorbeeld();
        else voorbeeldTimer = setTimeout(renderVoorbeeld, 250);
        planOpslaan();
    }

    function zetStatus(t) { $('sbStatus').textContent = t; }

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
        var b = huidig;
        b.titel = (b.titel || '').trim().slice(0, 80) || 'Naamloos bord';
        var res = await supabase.from('startborden').update({
            titel: b.titel, indeling: b.indeling, kleur: b.kleur, blokken: b.blokken, updated_at: new Date().toISOString()
        }).eq('id', b.id);
        if (res.error) {
            zetStatus('Niet opgeslagen');
            opslaanTimer = setTimeout(opslaan, 4000);
            return;
        }
        if (huidig === b && !opslaanTimer) zetStatus('Opgeslagen ✓');
    }

    window.addEventListener('beforeunload', function (e) {
        if (opslaanTimer) { flushOpslaan(); e.preventDefault(); e.returnValue = ''; }
    });

    // ---------- Presenteren ----------
    var pres = $('sbPresentatie');
    var presIndex = 0;
    var balkTimer = null;

    function presenteer(i) {
        flushOpslaan();
        if (!borden.length) return;
        presIndex = Math.max(0, Math.min(borden.length - 1, i));
        pres.hidden = false;
        document.body.style.overflow = 'hidden';
        var el = document.documentElement;
        var r = null;
        try { r = (el.requestFullscreen || el.webkitRequestFullscreen || function () {}).call(el); } catch (e) {}
        if (r && r.catch) r.catch(function () {});
        toonPresBord();
        toonBalk();
    }

    function toonPresBord() {
        var b = borden[presIndex];
        tekenBord($('sbPresentatieBord'), b, 'presenteer');
        $('sbBalkTitel').textContent = b.titel + '  ·  ' + (presIndex + 1) + ' / ' + borden.length;
        $('sbVorige').disabled = presIndex === 0;
        $('sbVolgende').disabled = presIndex === borden.length - 1;
    }

    function stopPresentatie() {
        pres.hidden = true;
        $('sbPresentatieBord').innerHTML = '';   // iframes (geluidsmeter!) echt uit
        document.body.style.overflow = '';
        if (document.fullscreenElement || document.webkitFullscreenElement) {
            var r = null;
            try { r = (document.exitFullscreen || document.webkitExitFullscreen).call(document); } catch (e) {}
            if (r && r.catch) r.catch(function () {});
        }
    }

    function stap(n) {
        var j = presIndex + n;
        if (j < 0 || j >= borden.length) return;
        presIndex = j;
        toonPresBord();
        toonBalk();
    }

    // Het balkje verdwijnt na een paar seconden, en komt terug bij bewegen
    function toonBalk() {
        $('sbBalk').classList.remove('verborgen');
        clearTimeout(balkTimer);
        balkTimer = setTimeout(function () { $('sbBalk').classList.add('verborgen'); }, 3000);
    }

    $('sbVorige').addEventListener('click', function () { stap(-1); });
    $('sbVolgende').addEventListener('click', function () { stap(1); });
    $('sbSluit').addEventListener('click', stopPresentatie);
    pres.addEventListener('mousemove', toonBalk);

    $('sbPresentatieBord').addEventListener('click', function (e) {
        var taak = e.target.closest('.sb-taken li');
        if (taak) taak.classList.toggle('klaar');
    });

    document.addEventListener('keydown', function (e) {
        if (pres.hidden) return;
        if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); stap(1); }
        else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); stap(-1); }
        else if (e.key === 'Escape') stopPresentatie();
    });
    // Esc in volledig scherm sluit eerst alleen dat; dan ook de presentatie
    ['fullscreenchange', 'webkitfullscreenchange'].forEach(function (ev) {
        document.addEventListener(ev, function () {
            if (!document.fullscreenElement && !document.webkitFullscreenElement && !pres.hidden) stopPresentatie();
        });
    });

    $('sbPresenteer').addEventListener('click', function () {
        if (!huidig) return;
        var i = borden.findIndex(function (b) { return b.id === huidig.id; });
        presenteer(i < 0 ? 0 : i);
    });

    // ---------- Start ----------
    (async function start() {
        await laadBorden();
        var m = /[?&]bord=([^&]+)/.exec(location.search);
        if (m) {
            var b = borden.filter(function (x) { return x.id === decodeURIComponent(m[1]); })[0];
            if (b) openBord(b);
        }
        if (window.hidePageLoader) window.hidePageLoader();
    })();
});

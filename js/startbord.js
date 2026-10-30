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
    var MAX_BORDEN = 5;   // ook afgedwongen in de database (trigger startborden_max)
    var VAKKEN = { een: 1, twee: 2, drie: 3, 'groot-twee': 3, vier: 4, 'groot-vier': 5, 'boven-vier': 5, zes: 6, acht: 8 };
    var INDELINGEN = [
        ['een', 'Eén groot vak'], ['twee', 'Twee naast elkaar'], ['drie', 'Drie naast elkaar'],
        ['groot-twee', 'Groot vak met twee kleine'], ['vier', 'Vier vakken'],
        ['groot-vier', 'Groot vak met vier kleine'], ['boven-vier', 'Breed vak met vier kleine eronder'],
        ['zes', 'Zes vakken'], ['acht', 'Acht kleine vakken']
    ];
    var KLEUREN = [
        ['lavendel', '#EEEAFE', 'Lavendel'], ['zon', '#FFF2CF', 'Zon'], ['mint', '#DDF3E6', 'Mint'],
        ['lucht', '#DCEEFA', 'Lucht'], ['roze', '#FCE4EE', 'Roze'], ['nacht', '#2B2A45', 'Nacht']
    ];
    var SOORTEN = [
        ['tekst', '&#128221;', 'Tekst'], ['klok', '&#128339;', 'Datum en klok'],
        ['taken', '&#9989;', 'Takenlijst'], ['tool', '&#129520;', 'Tool'],
        ['beeld', '&#128444;&#65039;', 'Afbeelding'], ['video', '&#127916;', 'Video'], ['leeg', '&#9675;', 'Leeg']
    ];
    var TOOLS = {
        timetimer: { naam: 'Time Timer', em: '&#9202;', url: '/digibord/timetimer.html' },
        stoplicht: { naam: 'Stoplicht', em: '&#128678;', url: '/digibord/stoplicht.html' },
        geluidsmeter: { naam: 'Geluidsmeter', em: '&#128266;', url: '/digibord/geluidsmeter.html' },
        namenkiezer: { naam: 'Namenkiezer', em: '&#9997;&#65039;', url: '/digibord/namenkiezer.html' },
        klassendienst: { naam: 'Klassendienst', em: '&#129529;', url: '/organisatie/klassendienst.html' }
    };

    var borden = [];
    var huidig = null;      // bord dat bewerkt wordt
    var gekozenVak = 0;
    var opslaanTimer = null;

    // ---------- Opgemaakte tekst schoonhouden ----------
    // Alleen vet, cursief, onderstreept, markeren, alinea's, regels en
    // opsommingen. Al het andere (stijlen, links, plaatjes, scripts) gaat
    // eruit, maar de tekst erin blijft staan.
    var TOEGESTAAN = { B: 'b', STRONG: 'b', I: 'i', EM: 'i', U: 'u', MARK: 'mark', BR: 'br', DIV: 'div', P: 'div', UL: 'ul', OL: 'ol', LI: 'li' };
    // Markeren in de editor geeft een achtergrondkleur (op een <span> of op
    // bijv. een bestaande <b>); bij het schoonmaken wordt dat een <mark>
    function isMarkering(n) {
        if (n.tagName === 'MARK') return true;
        var bg = (n.style && n.style.backgroundColor) || '';
        return !!bg && bg !== 'transparent' && !/rgba\(.*,\s*0\)$/.test(bg);
    }
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
                var doel = naar;
                if (tag !== 'mark' && isMarkering(n)) {
                    doel = document.createElement('mark');
                    naar.appendChild(doel);
                }
                if (!tag) { kopieer(n, doel); return; }
                var nieuw = document.createElement(tag);
                doel.appendChild(nieuw);
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
        if (soort === 'beeld') return { type: 'beeld', sleutel: '', onderschrift: '', vullen: false };
        if (soort === 'video') return { type: 'video', id: '', herhaal: true, geluid: false, vullen: false };
        return { type: 'leeg' };
    }

    // ---------- YouTube ----------
    // In het bord staat alleen het video-id (11 tekens), nooit een link of
    // een stukje code. Het filmpje wordt pas bij Presenteren opgehaald, via
    // youtube-nocookie.com.
    function videoId(tekst) {
        var t = String(tekst || '').trim();
        if (/^[A-Za-z0-9_-]{11}$/.test(t)) return t;
        var m = t.match(/^(?:https?:\/\/)?(?:www\.|m\.|music\.)?(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})(?![A-Za-z0-9_-])/i);
        return m ? m[1] : '';
    }
    function videoSrc(b) {
        var id = videoId(b.id);
        if (!id) return '';
        return 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&mute=' + (b.geluid ? '0' : '1') +
            (b.herhaal !== false ? '&loop=1&playlist=' + id : '') + '&rel=0&playsinline=1&iv_load_policy=3';
    }

    // Taken staan altijd als lijst in de database. Tekst (één taak per regel)
    // wordt hier omgezet; zo blijft ook een ouder bord met tekst werken.
    function takenLijst(taken) {
        var lijst = Array.isArray(taken) ? taken : String(taken || '').split('\n');
        return lijst.map(function (r) { return String(r).trim(); }).filter(Boolean).slice(0, 12);
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

    var UITLIJNINGEN = ['links', 'midden', 'rechts'];
    function uitlijning(b) { return UITLIJNINGEN.indexOf(b.uitlijning) >= 0 ? b.uitlijning : 'links'; }

    // modus: 'bewerk' (klikbare vakken, tools als plaatshouder),
    // 'klein' (kaartje in de lijst) of 'presenteer' (tools echt, taken afvinkbaar)
    function blokHtml(b, modus) {
        if (b.type === 'tekst') {
            return '<div class="sb-blok sb-tekst uitlijn-' + uitlijning(b) + '">' +
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
                '<ol>' + takenLijst(b.taken).map(function (taak) { return '<li>' + esc(taak) + '</li>'; }).join('') + '</ol></div>';
        }
        if (b.type === 'tool') {
            var tool = TOOLS[b.tool] || TOOLS.timetimer;
            if (modus === 'presenteer') {
                return '<div class="sb-toolvak"><iframe src="' + tool.url + '?ingebed=1" title="' + esc(tool.naam) + '" allow="microphone; fullscreen"></iframe></div>';
            }
            return '<div class="sb-plek"><span class="em">' + tool.em + '</span>' + esc(tool.naam) + '<small>werkt bij Presenteren</small></div>';
        }
        if (b.type === 'beeld') {
            if (!b.sleutel) {
                return modus === 'presenteer' ? '' : '<div class="sb-plek"><span class="em">&#128444;&#65039;</span>Kies een afbeelding</div>';
            }
            return '<div class="sb-beeld' + (b.vullen ? ' vullen' : '') + '"><img data-beeld="' + esc(b.sleutel) + '" alt="">' +
                (b.onderschrift ? '<div class="sb-beeld-onderschrift">' + esc(b.onderschrift) + '</div>' : '') + '</div>';
        }
        if (b.type === 'video') {
            var src = videoSrc(b);
            if (!src) return modus === 'presenteer' ? '' : '<div class="sb-plek"><span class="em">&#127916;</span>Plak een YouTube-link</div>';
            if (modus === 'presenteer') {
                return '<div class="sb-video' + (b.vullen ? ' vullen' : '') + '"><iframe src="' + esc(src) + '" title="Video" ' +
                    'allow="autoplay; fullscreen; encrypted-media" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>';
            }
            return '<div class="sb-plek"><span class="em">&#127916;</span>Video<small>speelt bij Presenteren</small></div>';
        }
        return modus === 'bewerk' ? '<div class="sb-plek"><span class="em">+</span>Kies wat hier komt</div>' : '';
    }

    // Gaat er in één vak iets mis (bijv. een oud of beschadigd blok), dan
    // blijft dat vak leeg en de rest van het bord gewoon zichtbaar
    function veiligBlokHtml(b, modus) {
        try { return blokHtml(b || { type: 'leeg' }, modus); }
        catch (e) {
            if (window.console) console.warn('Startbord: blok kon niet getoond worden', b, e);
            return modus === 'bewerk' ? '<div class="sb-plek"><span class="em">?</span>Dit vak kon niet getoond worden<small>Kies opnieuw wat hier komt</small></div>' : '';
        }
    }

    // Tekent het bord in een .sb-schaal-container en schaalt het passend
    function tekenBord(container, bord, modus) {
        var blokken = passend(bord.blokken, bord.indeling);
        container.innerHTML = '<div class="sb-bord ind-' + esc(bord.indeling) + ' kleur-' + esc(bord.kleur) +
            (modus === 'bewerk' ? ' sb-bewerkmodus' : modus === 'presenteer' ? ' sb-presenteer' : '') + '">' +
            blokken.map(function (b, i) {
                // Een afbeeldingsvak zonder afbeelding telt als leeg
                var leeg = b.type === 'leeg' || (b.type === 'beeld' && !b.sleutel) || (b.type === 'video' && !videoId(b.id));
                return '<div class="sb-vak' + (leeg ? ' is-leeg' : '') +
                    (modus === 'bewerk' && i === gekozenVak ? ' gekozen' : '') + '" data-vak="' + i + '">' + veiligBlokHtml(b, modus) + '</div>';
            }).join('') + '</div>';
        var kleur = KLEUREN.filter(function (k) { return k[0] === bord.kleur; })[0];
        container.style.background = kleur ? kleur[1] : '';
        if (ro) ro.observe(container);
        schaal(container);
        pasTekstIn(container);
        laadBeelden(container);
    }

    // Past de inhoud van een blok niet in zijn vak (lange tekst, klein vak),
    // dan wordt alles erin stap voor stap kleiner (--s, zie css/startbord.css)
    function pasTekstIn(container) {
        container.querySelectorAll('.sb-blok').forEach(function (blok) {
            var s = 1;
            blok.style.setProperty('--s', '1');
            var past = function () {
                return blok.scrollHeight <= blok.clientHeight + 1 && blok.scrollWidth <= blok.clientWidth + 1;
            };
            while (!past() && s > 0.3) {
                s = Math.round((s - 0.05) * 100) / 100;
                blok.style.setProperty('--s', String(s));
            }
        });
    }

    // ---------- Afbeeldingen: alleen in deze browser (IndexedDB) ----------
    // In de database staat alleen een sleutel. Het plaatje zelf gaat nooit
    // naar de server; op een ander apparaat of in een andere browser is het er
    // dus niet, en dat zeggen we dan ook.
    var beeldDb = null;
    var beeldUrls = {};
    function opdb() {
        if (!beeldDb) {
            beeldDb = new Promise(function (ok, fout) {
                var req = indexedDB.open('mt-startbord', 1);
                req.onupgradeneeded = function () { req.result.createObjectStore('beelden'); };
                req.onsuccess = function () { ok(req.result); };
                req.onerror = function () { fout(req.error); };
            });
        }
        return beeldDb;
    }
    function beeldActie(modus, fn) {
        return opdb().then(function (db) {
            return new Promise(function (ok, fout) {
                var tx = db.transaction('beelden', modus);
                var req = fn(tx.objectStore('beelden'));
                tx.oncomplete = function () { ok(req && req.result); };
                tx.onerror = function () { fout(tx.error); };
            });
        });
    }
    function beeldBewaar(blob) {
        var sleutel = 'beeld-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
        return beeldActie('readwrite', function (st) { return st.put(blob, sleutel); }).then(function () { return sleutel; });
    }
    function beeldHaal(sleutel) { return beeldActie('readonly', function (st) { return st.get(sleutel); }); }
    function beeldWeg(sleutel) {
        if (!sleutel) return Promise.resolve();
        if (beeldUrls[sleutel]) { URL.revokeObjectURL(beeldUrls[sleutel]); delete beeldUrls[sleutel]; }
        return beeldActie('readwrite', function (st) { return st.delete(sleutel); }).catch(function () {});
    }
    function beeldKopie(sleutel) {
        return beeldHaal(sleutel).then(function (blob) { return blob ? beeldBewaar(blob) : ''; }).catch(function () { return ''; });
    }

    function laadBeelden(container) {
        container.querySelectorAll('img[data-beeld]').forEach(function (img) {
            var sleutel = img.getAttribute('data-beeld');
            if (beeldUrls[sleutel]) { img.src = beeldUrls[sleutel]; return; }
            beeldHaal(sleutel).then(function (blob) {
                if (!blob) throw new Error('weg');
                beeldUrls[sleutel] = beeldUrls[sleutel] || URL.createObjectURL(blob);
                img.src = beeldUrls[sleutel];
            }).catch(function () {
                var plek = document.createElement('div');
                plek.className = 'sb-plek sb-beeld-mist';
                plek.innerHTML = '<span class="em">&#128444;&#65039;</span>Deze afbeelding staat op een ander apparaat<small>Afbeeldingen worden alleen in de browser bewaard waarin je ze toevoegde.</small>';
                img.replaceWith(plek);
            });
        });
    }

    // Verkleinen voor het bord: hooguit 1600 x 900, zodat de browseropslag niet volloopt
    function verklein(bestand) {
        return new Promise(function (ok, fout) {
            var url = URL.createObjectURL(bestand);
            var img = new Image();
            img.onload = function () {
                var f = Math.min(1, 1600 / img.width, 900 / img.height);
                var c = document.createElement('canvas');
                c.width = Math.round(img.width * f);
                c.height = Math.round(img.height * f);
                c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
                URL.revokeObjectURL(url);
                var type = /png|gif|webp/.test(bestand.type) ? 'image/png' : 'image/jpeg';
                c.toBlob(function (blob) { blob ? ok(blob) : fout(new Error('leeg')); }, type, 0.86);
            };
            img.onerror = function () { URL.revokeObjectURL(url); fout(new Error('geen afbeelding')); };
            img.src = url;
        });
    }

    function beeldenVan(bord) {
        return (bord.blokken || []).filter(function (b) { return b.type === 'beeld' && b.sleutel; }).map(function (b) { return b.sleutel; });
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
        var vol = borden.length >= MAX_BORDEN;
        $('sbNieuw').disabled = vol;
        $('sbNieuw').title = vol ? 'Je hebt al ' + MAX_BORDEN + ' borden. Verwijder er een of pas een bestaand bord aan.' : '';
        $('sbTeller').textContent = borden.length + ' van de ' + MAX_BORDEN + ' borden' +
            (vol ? ' — het maximum. Verwijder er een of pas een bestaand bord aan.' : '');
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
                '<button type="button" class="sb-knop licht klein" data-actie="kopieer"' + (vol ? ' disabled title="Je hebt al ' + MAX_BORDEN + ' borden"' : '') + '>Kopiëren</button>' +
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
        if (res.error || !res.data) {
            alert(res.error && /maximaal/.test(res.error.message) ? 'Je kunt maximaal ' + MAX_BORDEN + ' borden bewaren.' : 'Het bord kon niet aangemaakt worden. Probeer het opnieuw.');
            return;
        }
        borden.push(res.data);
        openBord(res.data);
        $('sbTitel').select();
    });

    async function kopieer(b) {
        if (borden.length >= MAX_BORDEN) return;
        var volgorde = Math.max.apply(null, borden.map(function (x) { return x.volgorde; })) + 1;
        // Een kopie krijgt eigen afbeeldingen, anders gooit het weghalen van
        // het ene bord ook de plaatjes van het andere weg
        var blokken = JSON.parse(JSON.stringify(b.blokken || []));
        for (var i = 0; i < blokken.length; i++) {
            if (blokken[i].type === 'beeld' && blokken[i].sleutel) blokken[i].sleutel = await beeldKopie(blokken[i].sleutel);
        }
        var res = await supabase.from('startborden').insert({
            titel: (b.titel + ' (kopie)').slice(0, 80), volgorde: volgorde, indeling: b.indeling, kleur: b.kleur, blokken: blokken
        }).select('id, titel, volgorde, indeling, kleur, blokken, updated_at').single();
        if (res.error || !res.data) {
            alert(res.error && /maximaal/.test(res.error.message) ? 'Je kunt maximaal ' + MAX_BORDEN + ' borden bewaren.' : 'Kopiëren lukte niet. Probeer het opnieuw.');
            return;
        }
        borden.push(res.data);
        renderLijst();
    }

    async function verwijder(b) {
        if (!confirm('"' + b.titel + '" verwijderen?')) return;
        var res = await supabase.from('startborden').delete().eq('id', b.id);
        if (res.error) { alert('Verwijderen lukte niet. Probeer het opnieuw.'); return; }
        beeldenVan(b).forEach(beeldWeg);
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
        renderPaneel();
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
                '<button type="button" data-cmd="markeer" title="Markeren" class="sb-markeer-knop"><mark>M</mark></button>' +
                '<button type="button" data-cmd="insertUnorderedList" title="Opsomming">&#8226; Lijst</button>' +
                '<span class="sb-opmaak-groep">' + UITLIJNINGEN.map(function (u) {
                    return '<button type="button" data-uitlijn="' + u + '" title="' + { links: 'Links uitlijnen', midden: 'Midden (ook in de hoogte)', rechts: 'Rechts uitlijnen' }[u] + '"' +
                        (uitlijning(b) === u ? ' class="aan"' : '') + '>' + UITLIJN_ICOON[u] + '</button>';
                }).join('') + '</span>' +
                '<select data-veld="grootte" aria-label="Lettergrootte">' +
                [['normaal', 'Normaal'], ['groot', 'Groot'], ['heelgroot', 'Heel groot']].map(function (g) {
                    return '<option value="' + g[0] + '"' + ((b.grootte || 'normaal') === g[0] ? ' selected' : '') + '>' + g[1] + '</option>';
                }).join('') + '</select></div>' +
                '<div class="sb-editor uitlijn-' + uitlijning(b) + '" id="sbEditor" contenteditable="true" data-leeg="Typ hier je tekst..."></div></div>';
        } else if (b.type === 'klok') {
            h += '<label class="sb-veld"><span>Begroeting</span><input type="text" data-veld="groet" maxlength="60" value="' + esc(b.groet || '') + '" placeholder="Bijv. Goedemorgen groep 6!"></label>' +
                '<label class="sb-vinkje"><input type="checkbox" data-veld="datum"' + (b.datum !== false ? ' checked' : '') + '> Dag en datum tonen</label>' +
                '<label class="sb-vinkje"><input type="checkbox" data-veld="klok"' + (b.klok !== false ? ' checked' : '') + '> Klok tonen</label>';
        } else if (b.type === 'taken') {
            h += '<label class="sb-veld"><span>Titel</span><input type="text" data-veld="titel" maxlength="80" value="' + esc(b.titel || '') + '" placeholder="Bijv. Bij binnenkomst"></label>' +
                '<label class="sb-veld"><span>Taken (één per regel)</span><textarea data-veld="taken" maxlength="1200">' + esc(takenLijst(b.taken).join('\n')) + '</textarea></label>' +
                '<p class="sb-hint">Bij Presenteren tikt een leerling een taak aan om hem af te vinken.</p>';
        } else if (b.type === 'tool') {
            h += '<div class="sb-tools">' + Object.keys(TOOLS).map(function (k) {
                return '<button type="button" class="sb-tool' + (b.tool === k ? ' aan' : '') + '" data-tool="' + k + '"><span class="em">' + TOOLS[k].em + '</span>' + TOOLS[k].naam + '</button>';
            }).join('') + '</div>' +
                '<p class="sb-hint">De tool werkt zoals je hem kent. Instellingen (zoals je klas bij de namenkiezer) kies je in de tool zelf.</p>';
        } else if (b.type === 'beeld') {
            h += '<label class="sb-veld"><span>' + (b.sleutel ? 'Andere afbeelding kiezen' : 'Afbeelding kiezen') + '</span>' +
                '<input type="file" id="sbBeeldKies" accept="image/*"></label>' +
                '<label class="sb-veld"><span>Onderschrift (mag leeg)</span><input type="text" data-veld="onderschrift" maxlength="80" value="' + esc(b.onderschrift || '') + '"></label>' +
                '<label class="sb-vinkje"><input type="checkbox" data-veld="vullen"' + (b.vullen ? ' checked' : '') + '> Het hele vak vullen (randen vallen weg)</label>' +
                '<p class="sb-hint">De afbeelding wordt alleen in deze browser bewaard, niet online. Op een ander apparaat of in een andere browser zie je hem niet: voeg hem daar dan opnieuw toe.</p>';
        } else if (b.type === 'video') {
            h += '<label class="sb-veld"><span>YouTube-link</span>' +
                '<input type="text" data-veld="link" maxlength="200" value="' + (videoId(b.id) ? 'https://www.youtube.com/watch?v=' + esc(videoId(b.id)) : '') + '" placeholder="Plak hier de link van het filmpje"></label>' +
                '<p class="sb-hint" id="sbVideoMelding">' + (videoId(b.id) ? 'Filmpje herkend.' : 'Kopieer de link uit de adresbalk van YouTube of via Delen.') + '</p>' +
                '<label class="sb-vinkje"><input type="checkbox" data-veld="herhaal"' + (b.herhaal !== false ? ' checked' : '') + '> Herhalen (blijft doorspelen)</label>' +
                '<label class="sb-vinkje"><input type="checkbox" data-veld="geluid"' + (b.geluid ? ' checked' : '') + '> Met geluid starten</label>' +
                '<label class="sb-vinkje"><input type="checkbox" data-veld="vullen"' + (b.vullen ? ' checked' : '') + '> Het hele vak vullen (randen van de video vallen weg)</label>' +
                '<p class="sb-hint">Het filmpje wordt pas bij Presenteren van YouTube opgehaald, niet in deze editor. Niet elk filmpje mag worden ingesloten en YouTube kan reclame tonen. ' +
                'Met geluid starten wordt door sommige browsers geblokkeerd: dan klik je één keer op het filmpje.</p>';
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

    function lijnen(x1s, x2s) {
        return '<svg viewBox="0 0 16 14" width="16" height="14" aria-hidden="true">' + [1, 5, 9, 13].map(function (y, i) {
            return '<line x1="' + x1s[i] + '" y1="' + y + '" x2="' + x2s[i] + '" y2="' + y + '" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>';
        }).join('') + '</svg>';
    }
    var UITLIJN_ICOON = {
        links: lijnen([1, 1, 1, 1], [15, 10, 13, 8]),
        midden: lijnen([1, 4, 2, 5], [15, 12, 14, 11]),
        rechts: lijnen([1, 6, 3, 8], [15, 15, 15, 15])
    };

    paneel.addEventListener('click', function (e) {
        var s = e.target.closest('[data-soort]');
        if (s) {
            var b = huidig.blokken[gekozenVak];
            if (b.type !== s.dataset.soort) {
                if (b.type === 'beeld') beeldWeg(b.sleutel);
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
        if (e.target.closest('[data-cmd]') || e.target.closest('[data-uitlijn]')) e.preventDefault();
    });
    paneel.addEventListener('click', function (e) {
        var u = e.target.closest('[data-uitlijn]');
        if (u) {
            huidig.blokken[gekozenVak].uitlijning = u.dataset.uitlijn;
            $('sbOpmaak').querySelectorAll('[data-uitlijn]').forEach(function (k) { k.classList.toggle('aan', k === u); });
            var ed = $('sbEditor');
            UITLIJNINGEN.forEach(function (w) { ed.classList.toggle('uitlijn-' + w, w === u.dataset.uitlijn); });
            gewijzigd(true);
            return;
        }
        var c = e.target.closest('[data-cmd]');
        if (!c) return;
        $('sbEditor').focus();
        if (c.dataset.cmd === 'markeer') markeer();
        else document.execCommand(c.dataset.cmd, false, null);
        tekstGewijzigd();
    });

    // De markering waar de cursor in staat (of null)
    function huidigeMarkering() {
        var ed = $('sbEditor'), sel = document.getSelection();
        if (!ed || !sel || !sel.anchorNode) return null;
        for (var n = sel.anchorNode; n && n !== ed; n = n.parentNode) {
            if (n.nodeType === 1 && isMarkering(n)) return n;
        }
        return null;
    }
    // Aan/uit: staat de cursor in een markering, dan gaat die eraf; anders
    // wordt de geselecteerde tekst gemarkeerd
    function markeer() {
        var m = huidigeMarkering();
        if (m && (m.tagName === 'MARK' || m.tagName === 'SPAN' || m.tagName === 'FONT')) {
            while (m.firstChild) m.parentNode.insertBefore(m.firstChild, m);
            m.parentNode.removeChild(m);
            return;
        }
        if (m) {
            // Bijv. een <b> met een achtergrond: vet blijft, de kleur gaat eraf
            m.style.backgroundColor = '';
            if (!m.getAttribute('style')) m.removeAttribute('style');
            return;
        }
        var sel = document.getSelection();
        if (!sel || sel.isCollapsed) return;
        try {
            document.execCommand('styleWithCSS', false, true);
            document.execCommand('hiliteColor', false, '#FFE066');
        } finally {
            document.execCommand('styleWithCSS', false, false);
        }
    }

    function werkOpmaakknoppenBij() {
        var balk = $('sbOpmaak');
        if (!balk) return;
        balk.querySelectorAll('[data-cmd]').forEach(function (b) {
            var aan = false;
            if (b.dataset.cmd === 'markeer') aan = !!huidigeMarkering();
            else try { aan = document.queryCommandState(b.dataset.cmd); } catch (e) {}
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
        if (veld === 'link') {
            var id = videoId(e.target.value), melding = $('sbVideoMelding');
            b.id = id;
            if (melding) melding.textContent = id ? 'Filmpje herkend.' : (e.target.value.trim() ? 'Dit lijkt geen YouTube-link. Kopieer de link uit de adresbalk of via Delen.' : '');
            gewijzigd(true);
            return;
        }
        if (veld === 'taken') {
            b.taken = takenLijst(e.target.value);
        } else {
            b[veld] = e.target.value;
        }
        gewijzigd(false);
    });
    paneel.addEventListener('change', function (e) {
        var veld = e.target.getAttribute('data-veld');
        if (!veld || veld === 'link') return;
        var b = huidig.blokken[gekozenVak];
        if (e.target.type === 'checkbox') b[veld] = e.target.checked;
        else if (veld === 'taken') b.taken = takenLijst(e.target.value);
        else b[veld] = e.target.value;
        gewijzigd(false);
    });

    paneel.addEventListener('change', async function (e) {
        if (e.target.id !== 'sbBeeldKies' || !e.target.files || !e.target.files[0]) return;
        var b = huidig.blokken[gekozenVak];
        zetStatus('Afbeelding verwerken...');
        try {
            var blob = await verklein(e.target.files[0]);
            var sleutel = await beeldBewaar(blob);
            if (b.sleutel) beeldWeg(b.sleutel);
            b.sleutel = sleutel;
            gewijzigd(true);
            renderPaneel();
        } catch (err) {
            zetStatus('');
            alert('Deze afbeelding kon niet worden toegevoegd. Probeer een jpg- of png-bestand.');
        }
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

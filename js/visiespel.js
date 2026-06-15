/* ============================================
   MEESTERTOOLS - Visiespel digitale geletterdheid
   Versie: v1.0.0

   Digitale versie van het SLO-visiespel (po, 2024). 9 taartpunten, elk met
   een titel, een vraagzin en een set stellingen. Per punt prioriteert het
   team de stellingen: in de taartpunt leggen (max 4), parkeren of wegleggen.

   - De gekozen stellingen (in de punt) kunnen gesleept en verwijderd worden.
   - Geparkeerde en weggelegde stellingen zijn later opnieuw te bekijken.
   - Eigen stellingen kunnen per punt worden toegevoegd (bewaard in
     tool_settings 'visiespel').
   - Een volledig spel is op te slaan als 'traject' (tabel visiespel_sessions)
     en later weer te openen.
   - Werk-voortgang wordt ook lokaal bewaard (localStorage) zodat verversen
     niets verloren laat gaan.
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    var TOOL_NAME = 'visiespel';
    var LS_KEY = 'mt_visiespel_work';

    // ---------- De 9 taartpunten (volgorde = speelbord/wiel) ----------
    var PUNTEN = [
        {
            key: 'tijd', titel: 'Tijd', kleur: '#F8992C',
            vraag: 'Hoeveel tijd wordt besteed aan digitale geletterdheid?',
            stellingen: [
                'Digitale geletterdheid vraagt om goede planning en management in school en klas',
                'Er is voldoende tijd om aan de doelen van digitale geletterdheid te werken',
                'In de klas wordt iedere dag structureel tijd besteed aan digitale geletterdheid',
                'Voor digitale geletterdheid wordt in de school gewerkt met flexibele leerroutes',
                'De hoeveelheid tijd die aan digitale geletterdheid wordt besteed, zorgt voor de juiste kwaliteit',
                'Voor digitale geletterdheid is geen aparte tijd ingeroosterd in het leerplan',
                'Voor digitale geletterdheid is wel aparte tijd ingeroosterd in het leerplan',
                'Met het aanbieden van onderwijs voor digitale geletterdheid wordt pas begonnen in de middenbouw',
                'Er wordt tijd gereserveerd voor deskundigheidsbevordering van de leerkrachten'
            ]
        },
        {
            key: 'observeren', titel: 'Observeren en evalueren', kleur: '#EC174A',
            vraag: 'Hoe wordt de ontwikkeling van digitale geletterdheid gemonitord?',
            stellingen: [
                'De vordering in digitale geletterdheid wordt met toetsen bijgehouden',
                'Leerkrachten weten wat de leerlingen moeten kunnen en kennen rond digitale geletterdheid',
                'De leerkracht is in staat de digitale vaardigheden van de kinderen te volgen en in kaart te brengen',
                'De ontwikkeling van digitale geletterdheid van kinderen wordt zowel op product als proces geëvalueerd',
                'De leerkracht gebruikt rubrics om de ontwikkeling in digitale geletterdheid van kinderen te volgen',
                'Digitale geletterdheid wordt niet met cijfers beoordeeld',
                'Er is een goed beeld over wat goed gaat en wat niet goed gaat rond digitale geletterdheid op school',
                'Het schoolteam bespreekt met elkaar de ontwikkeling van digitale geletterdheid van de kinderen',
                'Een digitaal portfolio wordt als evaluatie-instrument gebruikt: kinderen laten met eigen werk/producten zien hoe zij aan vooraf gestelde doelen bij digitale geletterdheid hebben gewerkt',
                'Monitoring van de ontwikkeling in digitale geletterdheid vindt plaats door observaties en/of gesprekken met kinderen',
                'De digitale vaardigheden van de kinderen worden gevolgd en (digitaal) in kaart gebracht'
            ]
        },
        {
            key: 'doelen', titel: 'Doelen', kleur: '#B41E8E',
            vraag: 'Waarom is onderwijs in digitale geletterdheid belangrijk?',
            stellingen: [
                'Alle leerlingen zijn op een basisniveau digitaal geletterd als ze van school komen',
                'Digitale technologie is overal in de samenleving, dus moeten leerlingen digitaal geletterd worden',
                'Onderwijs in digitale geletterdheid past bij de pedagogische visie op onderwijs van de school',
                'Leerlingen moeten kritisch en actief kunnen functioneren in een mediarijke wereld',
                'Ouders verwachten van school dat kinderen digitaal geletterd worden',
                'Kinderen moeten geholpen worden om hun talenten op digitaal gebied te ontplooien',
                'Aan het eind van het po weten leerlingen wat de impact is van digitale technologieën',
                'Lang niet alle leerlingen krijgen digitale vaardigheden en kennis van huis uit mee, de rol van de school is onmisbaar',
                'Leerlingen met goed ontwikkelde digitale vaardigheden hebben later een betere kans van slagen op de arbeidsmarkt',
                'Leerlingen moeten zo vertrouwd worden met digitale technologieën alsof het een pen, een rekenmachine of een schaar is',
                'Digitale geletterdheid in de basisschoolperiode is een ‘must’',
                'Kinderen leren in het po hoe ze zich met name ethisch en veilig tot digitale technologie kunnen verhouden',
                'Leerlingen leren hoe digitale technologie werkt: begripsvorming',
                'Kinderen leren hoe ze digitale technologie kunnen toepassen: ontwikkeling van vaardigheden',
                'Het is goed om kinderen al op jonge leeftijd kennis te laten maken met digitale geletterdheid',
                'Implementeren van digitale geletterdheid is een kerntaak van de school en een langdurig proces',
                'Digitale geletterdheid is ook verrijkend voor het persoonlijk leven en leren van kinderen'
            ]
        },
        {
            key: 'inhoud', titel: 'Inhoud', kleur: '#552F64',
            vraag: 'Wat komt aan bod bij onderwijs in digitale geletterdheid?',
            stellingen: [
                'Onderwijs in digitale geletterdheid gaat over ict-basisvaardigheden, mediawijsheid, computational thinking én informatievaardigheden',
                'Kinderen weten wat programmeren is en leren de basisprincipes',
                'Leerlingen moeten kennis hebben van verschillende digitale apparaten en programmatuur voor deze apparaten',
                'Kinderen moeten zowel weten wat de mogelijkheden als de gevaren zijn van digitale technologie',
                'Digitale geletterdheid gaat ook over ethisch handelen zoals regels voor informatiebeveiliging en privacy',
                'Programmeren staat centraal in het onderwijs bij digitale geletterdheid',
                'Kinderen hebben geen moeite om op internet te zoeken en online informatie op waarde in te schatten',
                'Digitale geletterdheid is een kwestie van computational thinking in het onderwijs',
                'Ict-basisvaardigheden hoeven niet apart aan bod te komen, deze leren kinderen gaandeweg ‘vanzelf’',
                'Het gesprek over digitale media is de normaalste zaak van de wereld',
                'Eerst moeten ict-basisvaardigheden en informatievaardigheden op orde zijn en dan pas kunnen leerlingen gaan leren programmeren',
                'De school besteedt ook aandacht aan ‘digitaal burgerschap’',
                'Online geletterdheid is niet hetzelfde als digitale informatievaardigheden',
                'Inhouden rond digitale geletterdheid worden afgestemd met het voortgezet onderwijs'
            ]
        },
        {
            key: 'leeractiviteiten', titel: 'Leeractiviteiten', kleur: '#0074BB',
            vraag: 'Hoe krijgt digitale geletterdheid een plek in het onderwijs?',
            stellingen: [
                'Digitale geletterdheid moet geïntegreerd worden in andere vakken/leergebieden',
                'Onderwijs in digitale geletterdheid vraagt om geïntegreerde lessen én aparte lessen',
                'Digitale geletterdheid zit in al onze losse spel- en leeractiviteiten verweven',
                'Digitale geletterdheid is een apart vak op school',
                'Onderwijs in digitale geletterdheid vindt plaats in een doorlopende leerlijn',
                'In alle vakken/lessen/projecten wordt aandacht besteed aan digitale geletterdheid',
                'Digitale geletterdheid wordt ook gekoppeld aan digitale expressie en cultuureducatie',
                'Digitale geletterdheid heeft een structurele plek/aanpak in onze school',
                'De visie op digitale geletterdheid is zichtbaar in het alledaags handelen van leerkrachten en leerlingen',
                'Digitale geletterdheid wordt centraal en structureel aangeboden in onze school',
                'Een eerste stap tot implementeren is digitale geletterdheid inzetten bij projectonderwijs',
                'Passend bij het profiel van de school worden accenten gelegd binnen digitale geletterdheid',
                'Onderwijs in digitale geletterdheid vraagt om een flexibel curriculum – de inhoud verandert snel',
                'Integrale aanpak digitale geletterdheid is: kennis en vaardigheden verwerven en toepassen in andere situaties, leren omgaan met anderen en jezelf vormen als persoon'
            ]
        },
        {
            key: 'rol', titel: 'Rol van de leerkracht', kleur: '#00BDD6',
            vraag: 'Welke rol heeft de leerkracht bij onderwijs in digitale geletterdheid?',
            stellingen: [
                'Alle leerkrachten moeten zelf digitaal geletterd zijn om onderwijs in digitale geletterdheid te kunnen geven',
                'Leerkrachten maken (didactisch) beredeneerd een keuze in het gebruik van ict in hun onderwijs',
                'De leerkracht weet welke digitale technologie wanneer geschikt is bij het verzorgen van het onderwijs',
                '‘Practice what you preach!’ Leerkrachten moeten zelf het goede voorbeeld geven op school (en daarbuiten)',
                'De leerkracht heeft kennis van de digitale vaardigheden die kinderen zich eigen moeten maken',
                'De leerkracht heeft kennis van de vier algemene gebieden binnen digitale geletterdheid: ict-basisvaardigheden, computational thinking, mediawijsheid en informatievaardigheden',
                'Binnen het team is draagvlak om digitale geletterdheid naar een hoger niveau te brengen',
                'Digitale geletterdheid in het po vraagt om deskundigheidsbevordering van het hele team als je het structureel wilt inbedden',
                'Leerkrachten die zichzelf ‘bewust bekwaam’ vinden zijn soms in werkelijkheid ‘onbewust onbekwaam’',
                'Het T-pack model helpt bij een zorgvuldige afstemming tussen vakinhoud, didactiek en mogelijkheden van ict',
                'De leerkracht vervult een coachende rol als het gaat om de ontwikkeling van digitale geletterdheid van de kinderen',
                'De leerkracht is de instructeur als het gaat om onderwijs in digitale geletterdheid',
                'De coördinator digitale geletterdheid neemt de lessen digitale geletterdheid voor zijn/haar rekening'
            ]
        },
        {
            key: 'bronnen', titel: 'Bronnen en materialen', kleur: '#3EBC97',
            vraag: 'Welke bronnen en materialen worden bij digitale geletterdheid gebruikt?',
            stellingen: [
                'Bij het onderwijs aan kinderen wordt zoveel mogelijk gebruik gemaakt van digitale middelen',
                'Voor digitale geletterdheid wordt één methode/lessenserie/platform gebruikt waardoor alle onderdelen aan bod komen',
                'De school werkt met leermiddelen die digitale geletterdheid ondersteunen en stimuleren',
                'Digitale geletterdheid vraagt ook om het invliegen van experts van buiten de school zoals bepaalde ouders en personen uit het bedrijfsleven',
                'De school doet in het kader van digitale geletterdheid mee aan activiteiten zoals ‘mediamasters’',
                'Leerlingen leren al spelend werken met verschillende soorten robots',
                'De school ontwikkelt eigen bronnen en materialen voor digitale geletterdheid (of heeft deze ontwikkeld)'
            ]
        },
        {
            key: 'groepering', titel: 'Groeperingsvorm', kleur: '#C4CA46',
            vraag: 'Welke groeperingsvormen worden gehanteerd bij onderwijs in digitale geletterdheid?',
            stellingen: [
                'Onderwijs in digitale geletterdheid vraagt om een gedifferentieerde aanpak op eigen niveau voor alle kinderen',
                'Onderwijs in digitale geletterdheid kenmerkt zich door individuele leerroutes van leerlingen en leerlinggestuurd werken',
                'Kinderen met bijzondere interesse in digitale geletterdheid krijgen de ruimte om zich te verdiepen in bijv. programmeren/informatica',
                'Samenwerken bij digitale geletterdheid is niet mogelijk',
                'Kinderen die al meer digitaal geletterd zijn, kunnen ‘incidenteel of structureel’ hun vaardigheden en kennis overdragen aan klasgenoten',
                'Kinderen kunnen veel zelfstandig aan de slag om hun digitale geletterdheid te ontwikkelen'
            ]
        },
        {
            key: 'leeromgeving', titel: 'Leeromgeving', kleur: '#FFCA27',
            vraag: 'Welke voorwaarden worden gesteld aan de leeromgeving bij digitale geletterdheid?',
            stellingen: [
                'De beschikbaarheid van apparaten en programmatuur (hardware en software) is niet het belangrijkst voor goed onderwijs in digitale geletterdheid',
                'Onderwijs in digitale geletterdheid kan alleen als er een (draadloos) netwerk in school is dat voldoende capaciteit heeft',
                'Alle leerlingen moeten de beschikking hebben over hun eigen ‘device’ (in eigendom van school)',
                'Gebruik van het digitaal schoolbord is een goed voorbeeld van digitale geletterdheid',
                'Een goede invoering van digitale geletterdheid kan niet zonder een flinke financiële investering',
                'Online veiligheid is een essentieel onderdeel van de leeromgeving',
                'In elke klas zijn voldoende ‘devices’ beschikbaar die als onderdeel van de les dagelijks worden gebruikt',
                'De speel-/leeromgeving van de school straalt de visie op digitale geletterdheid uit',
                'Kinderen lezen slecht als ze van een beeldscherm lezen',
                'Kinderen leren makkelijker als ze de leerstof ook in een filmpje zien',
                'Onderwijs in digitale geletterdheid kan niet zonder het betrekken van de buitenwereld zoals bedrijven, ouders en bibliotheken'
            ]
        }
    ];

    var TARGET_PUNT = 4; // bedoeld aantal plekken; meer mag, maar krijgt een rode rand

    // Een "plek" in de taartpunt bevat 1 of meer stellingen die naast elkaar
    // liggen (omdat ze sterk op elkaar lijken). Intern is w.punt dus een lijst
    // van groepen: [[id], [id, id], [id], ...]. Ouder formaat (platte lijst van
    // ids) wordt bij het laden omgezet via normalizeGroups().
    function normalizeGroups(arr) {
        if (!Array.isArray(arr)) return [];
        return arr.map(function (g) { return Array.isArray(g) ? g.slice() : [g]; });
    }
    function puntFlat(w) {
        var out = [];
        (w.punt || []).forEach(function (g) { (g || []).forEach(function (id) { out.push(id); }); });
        return out;
    }

    // Geef elke ingebouwde stelling een stabiel id
    var PUNT_BY_KEY = {};
    PUNTEN.forEach(function (p) {
        p.items = p.stellingen.map(function (tekst, i) {
            return { id: 'b_' + p.key + '_' + (i + 1), tekst: tekst, custom: false };
        });
        PUNT_BY_KEY[p.key] = p;
    });

    // ---------- State ----------
    var currentUser = null;
    var customByPunt = {};     // { puntKey: [ {id, tekst} ] }  -> eigen stellingen (per user)
    var work = {};             // { puntKey: { punt:[], parkeer:[], weg:[], cur:0 } }
    var currentPuntKey = null;
    var loadedTraject = null;  // { id, name } indien een opgeslagen traject geopend is

    // ---------- DOM helpers ----------
    var $ = function (id) { return document.getElementById(id); };
    function esc(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
    function toast(msg) {
        var t = $('vsToast');
        t.textContent = msg; t.classList.add('visible');
        clearTimeout(toast._t);
        toast._t = setTimeout(function () { t.classList.remove('visible'); }, 2200);
    }
    function openModal(id) { $(id).classList.add('active'); }
    function closeModal(id) { $(id).classList.remove('active'); }

    // ---------- Work-state helpers ----------
    function blankPunt() { return { punt: [], parkeer: [], weg: [], cur: 0 }; }
    function ensureWork() {
        PUNTEN.forEach(function (p) {
            var w = work[p.key];
            if (!w) { work[p.key] = blankPunt(); return; }
            w.punt = normalizeGroups(w.punt);
            if (!Array.isArray(w.parkeer)) w.parkeer = [];
            if (!Array.isArray(w.weg)) w.weg = [];
            if (typeof w.cur !== 'number') w.cur = 0;
        });
    }
    function itemsFor(key) {
        var p = PUNT_BY_KEY[key];
        var custom = (customByPunt[key] || []).map(function (c) {
            return { id: c.id, tekst: c.tekst, custom: true };
        });
        return p.items.concat(custom);
    }
    function itemById(key, id) {
        var all = itemsFor(key);
        for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i];
        return null;
    }
    // De "stapel" = stellingen die nog niet behandeld zijn (niet in punt/parkeer/weg)
    function deckFor(key) {
        var w = work[key];
        var placed = {};
        puntFlat(w).concat(w.parkeer, w.weg).forEach(function (id) { placed[id] = true; });
        return itemsFor(key).filter(function (it) { return !placed[it.id]; });
    }

    // ---------- Persistentie ----------
    function saveLocal() {
        try {
            localStorage.setItem(LS_KEY, JSON.stringify({
                work: work, loaded: loadedTraject
            }));
        } catch (e) { /* negeer */ }
    }
    function loadLocal() {
        try {
            var raw = localStorage.getItem(LS_KEY);
            if (!raw) return;
            var data = JSON.parse(raw);
            if (data && data.work) work = data.work;
            if (data && data.loaded) loadedTraject = data.loaded;
        } catch (e) { /* negeer */ }
    }

    async function getUser() {
        try {
            var s = await supabase.auth.getSession();
            return (s.data.session && s.data.session.user) || null;
        } catch (e) { return null; }
    }
    async function loadCustom() {
        if (!currentUser) return;
        var res = await supabase.from('tool_settings').select('settings')
            .eq('user_id', currentUser.id).eq('tool_name', TOOL_NAME).maybeSingle();
        var s = (res.data && res.data.settings) ? res.data.settings : {};
        customByPunt = (s && typeof s.custom === 'object' && s.custom) ? s.custom : {};
    }
    function persistCustom() {
        if (!currentUser) return;
        supabase.from('tool_settings').upsert({
            user_id: currentUser.id, tool_name: TOOL_NAME,
            settings: { custom: customByPunt },
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,tool_name' }).then(function (res) {
            if (res.error) console.error('visiespel custom opslaan:', res.error.message);
        });
    }

    // ---------- Wiel (SVG) ----------
    function polar(cx, cy, r, deg) {
        var rad = (deg - 90) * Math.PI / 180;
        return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
    }
    function renderWheel() {
        var cx = 200, cy = 200, r = 180;
        var n = PUNTEN.length, step = 360 / n;
        var html = '';
        PUNTEN.forEach(function (p, i) {
            var a0 = i * step, a1 = (i + 1) * step;
            var s = polar(cx, cy, r, a0), e = polar(cx, cy, r, a1);
            var large = (a1 - a0) > 180 ? 1 : 0;
            var d = 'M' + cx + ',' + cy + ' L' + s.x.toFixed(2) + ',' + s.y.toFixed(2) +
                ' A' + r + ',' + r + ' 0 ' + large + ' 1 ' + e.x.toFixed(2) + ',' + e.y.toFixed(2) + ' Z';
            var mid = polar(cx, cy, r * 0.62, (a0 + a1) / 2);
            var w = work[p.key] || blankPunt();
            var full = (w.punt || []).length >= TARGET_PUNT;
            html += '<g class="vs-seg' + (full ? ' is-full' : '') + '" data-key="' + p.key + '">' +
                '<path d="' + d + '" fill="' + p.kleur + '"></path>' +
                '<text class="vs-seg-num" x="' + mid.x.toFixed(1) + '" y="' + (mid.y + 6).toFixed(1) + '" text-anchor="middle">' +
                (full ? '✓' : (i + 1)) + '</text>' +
                '</g>';
        });
        html += '<circle cx="200" cy="200" r="30" fill="#fff"></circle>' +
            '<text x="200" y="205" text-anchor="middle" font-size="13" font-weight="700" fill="#555">visie</text>';
        $('vsWheel').innerHTML = html;
    }

    // ---------- Punt-kaarten (grid) ----------
    function renderGrid() {
        var html = PUNTEN.map(function (p, i) {
            var w = work[p.key] || blankPunt();
            var plekken = (w.punt || []).length;
            var totaal = itemsFor(p.key).length;
            var behandeld = puntFlat(w).length + w.parkeer.length + w.weg.length;
            var done = behandeld >= totaal;
            return '<button class="vs-punt-card" data-key="' + p.key + '">' +
                '<div class="vs-pc-bar" style="background:' + p.kleur + '"></div>' +
                '<div class="vs-pc-body">' +
                    '<div class="vs-pc-top">' +
                        '<span class="vs-pc-badge" style="background:' + p.kleur + '">' + (i + 1) + '</span>' +
                        '<h3>' + esc(p.titel) + '</h3>' +
                    '</div>' +
                    '<p class="vs-pc-vraag">' + esc(p.vraag) + '</p>' +
                    '<div class="vs-pc-stats">' +
                        '<span class="vs-pc-pill' + (plekken >= TARGET_PUNT ? ' is-done' : '') + (plekken > TARGET_PUNT ? ' is-over' : '') + '">In de punt: ' + plekken + '/' + TARGET_PUNT + (plekken > TARGET_PUNT ? ' (te veel)' : '') + '</span>' +
                        '<span class="vs-pc-pill' + (done ? ' is-done' : '') + '">Behandeld: ' + behandeld + '/' + totaal + '</span>' +
                    '</div>' +
                '</div>' +
            '</button>';
        }).join('');
        $('vsGrid').innerHTML = html;
    }

    function refreshHome() {
        renderWheel();
        renderGrid();
        var label = $('vsTrajectNaam');
        if (loadedTraject) label.innerHTML = 'Traject: <strong>' + esc(loadedTraject.name) + '</strong>';
        else label.innerHTML = '<em>Niet opgeslagen werkversie</em>';
    }

    // ---------- Punt-werkblad ----------
    function openPunt(key) {
        currentPuntKey = key;
        var p = PUNT_BY_KEY[key];
        $('vsHome').style.display = 'none';
        $('vsPunt').classList.add('active');
        $('vsPuntHead').style.background = p.kleur;
        $('vsPuntNum').textContent = (PUNTEN.indexOf(p) + 1);
        $('vsPuntTitel').textContent = p.titel;
        $('vsPuntVraag').textContent = p.vraag;
        window.scrollTo(0, 0);
        renderPunt();
    }
    function closePunt() {
        currentPuntKey = null;
        $('vsPunt').classList.remove('active');
        $('vsHome').style.display = '';
        refreshHome();
    }

    function renderPunt() {
        var key = currentPuntKey;
        var p = PUNT_BY_KEY[key];
        var w = work[key];
        var deck = deckFor(key);
        var totaal = itemsFor(key).length;
        var plekken = w.punt.length;
        var behandeld = puntFlat(w).length + w.parkeer.length + w.weg.length;

        // Voortgang
        $('vsProgress').textContent = 'Behandeld: ' + behandeld + ' van ' + totaal +
            '  ·  In de punt: ' + plekken + '/' + TARGET_PUNT + (plekken > TARGET_PUNT ? ' (te veel!)' : '') +
            '  ·  Geparkeerd: ' + w.parkeer.length + '  ·  Weggelegd: ' + w.weg.length;

        // Kaart of "klaar"-scherm
        var slot = $('vsCardSlot');
        if (deck.length === 0) {
            slot.innerHTML = renderDone(w);
        } else {
            if (w.cur >= deck.length) w.cur = 0;
            var card = deck[w.cur];
            var small = card.tekst.length > 150 ? ' is-small' : '';
            slot.innerHTML =
                '<div class="vs-card" style="border-top-color:' + p.kleur + '">' +
                    '<span class="vs-card-tag" style="background:' + p.kleur + '">Stelling ' + (w.cur + 1) + ' / ' + deck.length + '</span>' +
                    '<p class="vs-card-text' + small + '">' + esc(card.tekst) + '</p>' +
                '</div>' +
                '<div class="vs-actions">' +
                    '<button class="vs-act vs-act-punt" data-act="punt">' +
                        '<span class="vs-act-ico">⭐</span>In de taartpunt</button>' +
                    '<button class="vs-act vs-act-parkeer" data-act="parkeer"><span class="vs-act-ico">🛍️</span>Parkeren</button>' +
                    '<button class="vs-act vs-act-weg" data-act="weg"><span class="vs-act-ico">🗑️</span>Wegleggen</button>' +
                '</div>' +
                '<div style="margin-top:12px; display:flex; gap:8px;">' +
                    '<button class="vs-mini-btn" data-act="prev"' + (deck.length < 2 ? ' disabled' : '') + '>&larr; Vorige</button>' +
                    '<button class="vs-mini-btn" data-act="next"' + (deck.length < 2 ? ' disabled' : '') + '>Volgende &rarr;</button>' +
                '</div>';
        }

        renderSlots();
        var cntEl = $('vsPuntCount');
        cntEl.textContent = plekken + '/' + TARGET_PUNT;
        cntEl.classList.toggle('vs-over', plekken > TARGET_PUNT);
        $('vsCntParkeer').textContent = w.parkeer.length;
        $('vsCntWeg').textContent = w.weg.length;
        saveLocal();
    }

    function renderDone(w) {
        return '<div class="vs-done">' +
            '<div class="vs-done-ico">🎉</div>' +
            '<h3>Alle stellingen zijn behandeld</h3>' +
            '<p>Je legde ' + puntFlat(w).length + ' stelling(en) in de taartpunt. ' +
                'Bekijk de stapels die je niet koos nog eens &mdash; misschien wil je nog wisselen.</p>' +
            '<div class="vs-done-btns">' +
                '<button class="btn btn-secondary" data-act="review-parkeer">🛍️ Geparkeerd (' + w.parkeer.length + ')</button>' +
                '<button class="btn btn-secondary" data-act="review-weg">🗑️ Weggelegd (' + w.weg.length + ')</button>' +
            '</div>' +
        '</div>';
    }

    function renderSlots() {
        var key = currentPuntKey;
        var p = PUNT_BY_KEY[key];
        var w = work[key];
        var groups = w.punt;
        var rows = Math.max(TARGET_PUNT, groups.length); // altijd minstens 4 plekken tonen
        var html = '';
        for (var i = 0; i < rows; i++) {
            var group = groups[i];
            var overflow = i >= TARGET_PUNT; // plek 5, 6, ... = te veel
            if (group && group.length) {
                var cards = group.map(function (id) {
                    var it = itemById(key, id);
                    var tekst = it ? it.tekst : '(verwijderd)';
                    return '<div class="vs-slot-card" data-id="' + id + '">' +
                        '<span class="vs-slot-text">' + esc(tekst) + '</span>' +
                        (group.length > 1 ? '<button class="vs-slot-split" data-split="' + id + '" title="Losmaken (apart leggen)">&#10573;</button>' : '') +
                        '<button class="vs-slot-del" data-del="' + id + '" title="Terug naar de stapel">&times;</button>' +
                    '</div>';
                }).join('<span class="vs-slot-link-ico" title="lijken op elkaar">&asymp;</span>');
                html += '<div class="vs-slot is-filled' + (overflow ? ' is-overflow' : '') + '" draggable="true" data-pos="' + i + '">' +
                    '<span class="vs-slot-grip" title="Sleep om te ordenen">&#9776;</span>' +
                    '<span class="vs-slot-num" style="background:' + (overflow ? '#d23' : p.kleur) + '">' + (i + 1) + '</span>' +
                    '<div class="vs-slot-cards">' + cards + '</div>' +
                    (i > 0 ? '<button class="vs-slot-pair" data-pair="' + i + '" title="Naast de vorige plek leggen (lijken op elkaar)">&#128279;</button>' : '') +
                '</div>';
            } else {
                html += '<div class="vs-slot is-empty" data-pos="' + i + '">leeg</div>';
            }
        }
        $('vsSlots').innerHTML = html;
    }

    // ---------- Acties op de huidige kaart ----------
    function placeCurrent(target) {
        var key = currentPuntKey;
        var w = work[key];
        var deck = deckFor(key);
        if (!deck.length) return;
        var card = deck[w.cur];
        if (target === 'punt') {
            w.punt.push([card.id]); // nieuwe plek; meer dan 4 mag (krijgt rode rand)
            if (w.punt.length > TARGET_PUNT) toast('Let op: meer dan ' + TARGET_PUNT + ' in de taartpunt (rode rand).');
        } else if (target === 'parkeer') {
            w.parkeer.push(card.id);
        } else if (target === 'weg') {
            w.weg.push(card.id);
        }
        // cur blijft staan -> wijst nu naar de volgende kaart in de gekrompen stapel
        var newDeck = deckFor(key);
        if (w.cur >= newDeck.length) w.cur = newDeck.length ? newDeck.length - 1 : 0;
        renderPunt();
    }
    function moveCard(delta) {
        var key = currentPuntKey;
        var w = work[key];
        var deck = deckFor(key);
        if (deck.length < 2) return;
        w.cur = (w.cur + delta + deck.length) % deck.length;
        renderPunt();
    }
    function removeFromPunt(id) {
        var w = work[currentPuntKey];
        // haal de stelling uit zijn plek; lege plekken vervallen
        w.punt = w.punt.map(function (g) { return g.filter(function (x) { return x !== id; }); })
                       .filter(function (g) { return g.length > 0; });
        // gaat terug naar de stapel (verschijnt weer tussen de te behandelen stellingen)
        renderPunt();
        toast('Stelling terug naar de stapel');
    }
    // Plek i naast de vorige plek leggen (samenvoegen omdat ze op elkaar lijken)
    function pairGroup(i) {
        var w = work[currentPuntKey];
        if (i <= 0 || i >= w.punt.length) return;
        w.punt[i - 1] = w.punt[i - 1].concat(w.punt[i]);
        w.punt.splice(i, 1);
        renderPunt();
        toast('Naast elkaar gelegd');
    }
    // Een gekoppelde stelling weer losmaken tot een eigen plek
    function splitFromGroup(id) {
        var w = work[currentPuntKey];
        for (var i = 0; i < w.punt.length; i++) {
            var idx = w.punt[i].indexOf(id);
            if (idx >= 0) {
                w.punt[i].splice(idx, 1);
                w.punt.splice(i + 1, 0, [id]);
                if (w.punt[i].length === 0) w.punt.splice(i, 1);
                break;
            }
        }
        renderPunt();
        toast('Losgemaakt');
    }

    // ---------- Slepen in de taartpunt (plekken ordenen) ----------
    var dragPos = null;
    function setupDrag() {
        var container = $('vsSlots');
        container.addEventListener('dragstart', function (e) {
            var el = e.target.closest('.vs-slot.is-filled');
            if (!el) return;
            dragPos = parseInt(el.getAttribute('data-pos'), 10);
            el.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });
        container.addEventListener('dragend', function () {
            dragPos = null;
            Array.prototype.forEach.call(container.querySelectorAll('.vs-slot'), function (s) {
                s.classList.remove('dragging', 'drag-over');
            });
        });
        container.addEventListener('dragover', function (e) {
            e.preventDefault();
            var el = e.target.closest('.vs-slot');
            Array.prototype.forEach.call(container.querySelectorAll('.vs-slot'), function (s) { s.classList.remove('drag-over'); });
            if (el) el.classList.add('drag-over');
        });
        container.addEventListener('drop', function (e) {
            e.preventDefault();
            if (dragPos === null) return;
            var el = e.target.closest('.vs-slot');
            if (!el) return;
            var w = work[currentPuntKey];
            var pos = parseInt(el.getAttribute('data-pos'), 10);
            if (isNaN(pos) || pos === dragPos) return;
            var group = w.punt[dragPos];
            if (!group) return;
            w.punt.splice(dragPos, 1);
            if (pos > w.punt.length) pos = w.punt.length; // doel kan een lege plek voorbij de lijst zijn
            w.punt.splice(pos, 0, group);
            renderPunt();
        });
    }

    // ---------- Review (geparkeerd / weggelegd) ----------
    function openReview(which) {
        var key = currentPuntKey;
        var w = work[key];
        var ids = which === 'parkeer' ? w.parkeer : w.weg;
        $('vsReviewTitle').textContent = which === 'parkeer' ? 'Geparkeerde stellingen' : 'Weggelegde stellingen';
        var list = $('vsReviewList');
        if (!ids.length) {
            list.innerHTML = '<p class="vs-empty-note">Geen stellingen in deze stapel.</p>';
        } else {
            list.innerHTML = ids.map(function (id) {
                var it = itemById(key, id);
                return '<div class="vs-review-item" data-id="' + id + '">' +
                    '<span class="vs-ri-text">' + esc(it ? it.tekst : '') + '</span>' +
                    '<span class="vs-ri-actions">' +
                        '<button class="vs-mini-btn" data-rev="punt" data-from="' + which + '">⭐ In de punt</button>' +
                        '<button class="vs-mini-btn" data-rev="stapel" data-from="' + which + '">↺ Terug op stapel</button>' +
                    '</span>' +
                '</div>';
            }).join('');
        }
        openModal('vsReviewModal');
    }
    function reviewAction(id, action, from) {
        var w = work[currentPuntKey];
        // verwijder uit bronstapel
        if (from === 'parkeer') w.parkeer = w.parkeer.filter(function (x) { return x !== id; });
        else w.weg = w.weg.filter(function (x) { return x !== id; });
        if (action === 'punt') {
            w.punt.push([id]); // nieuwe plek; meer dan 4 mag (rode rand)
            toast(w.punt.length > TARGET_PUNT ? 'In de taartpunt (let op: meer dan ' + TARGET_PUNT + ')' : 'In de taartpunt gelegd');
        } else {
            toast('Terug op de stapel');
        }
        renderPunt();
        openReview(from); // herteken de lijst
    }

    // ---------- Eigen stellingen ----------
    function openCustom() {
        var key = currentPuntKey;
        var p = PUNT_BY_KEY[key];
        $('vsCustomPuntLabel').textContent = 'Taartpunt: ' + p.titel;
        $('vsCustomText').value = '';
        renderCustomList();
        openModal('vsCustomModal');
    }
    function renderCustomList() {
        var key = currentPuntKey;
        var list = customByPunt[key] || [];
        var el = $('vsCustomList');
        if (!list.length) {
            el.innerHTML = '<p class="vs-empty-note">Nog geen eigen stellingen voor deze taartpunt.</p>';
            return;
        }
        el.innerHTML = list.map(function (c) {
            return '<div class="vs-list-item">' +
                '<div class="vs-li-main"><div class="vs-li-name" style="font-weight:500">' + esc(c.tekst) + '</div></div>' +
                '<div class="vs-li-actions"><button class="vs-slot-del" data-cdel="' + c.id + '" title="Verwijderen">&#128465;&#65039;</button></div>' +
            '</div>';
        }).join('');
    }
    function addCustom() {
        if (!currentUser) { toast('Log in om eigen stellingen te bewaren.'); return; }
        var key = currentPuntKey;
        var txt = $('vsCustomText').value.trim();
        if (!txt) { toast('Typ eerst een stelling.'); return; }
        if (!customByPunt[key]) customByPunt[key] = [];
        customByPunt[key].push({ id: 'c_' + Date.now().toString(36) + Math.floor(Math.random() * 1000), tekst: txt });
        persistCustom();
        $('vsCustomText').value = '';
        renderCustomList();
        renderPunt();
        toast('Eigen stelling toegevoegd');
    }
    function deleteCustom(id) {
        var key = currentPuntKey;
        customByPunt[key] = (customByPunt[key] || []).filter(function (c) { return c.id !== id; });
        // ook uit eventuele plaatsing halen
        var w = work[key];
        ['punt', 'parkeer', 'weg'].forEach(function (b) { w[b] = w[b].filter(function (x) { return x !== id; }); });
        persistCustom();
        renderCustomList();
        renderPunt();
        toast('Eigen stelling verwijderd');
    }

    // ---------- Trajecten (opslaan / openen) ----------
    function gatherState() {
        var punten = {};
        PUNTEN.forEach(function (p) {
            var w = work[p.key] || blankPunt();
            punten[p.key] = {
                punt: w.punt.map(function (g) { return g.slice(); }),
                parkeer: w.parkeer.slice(), weg: w.weg.slice(), cur: w.cur || 0
            };
        });
        return { v: 1, punten: punten };
    }
    function applyState(state) {
        work = {};
        ensureWork();
        if (state && state.punten) {
            PUNTEN.forEach(function (p) {
                var s = state.punten[p.key];
                if (s) work[p.key] = { punt: normalizeGroups(s.punt), parkeer: s.parkeer || [], weg: s.weg || [], cur: s.cur || 0 };
            });
        }
        saveLocal();
    }

    async function saveTraject() {
        if (!currentUser) { toast('Log in om een traject te bewaren.'); return; }
        var suggestie = loadedTraject ? loadedTraject.name : 'Visie ' + new Date().toLocaleDateString('nl-NL');
        var naam = window.prompt('Naam voor dit traject:', suggestie);
        if (naam === null) return;
        naam = naam.trim();
        if (!naam) { toast('Geef een naam op.'); return; }
        var state = gatherState();
        var now = new Date().toISOString();
        if (loadedTraject && loadedTraject.name === naam) {
            // bestaand traject bijwerken
            var up = await supabase.from('visiespel_sessions')
                .update({ name: naam, state: state, updated_at: now })
                .eq('id', loadedTraject.id).eq('user_id', currentUser.id).select().maybeSingle();
            if (up.error) { toast('Opslaan mislukt'); console.error(up.error.message); return; }
            toast('Traject bijgewerkt');
        } else {
            var ins = await supabase.from('visiespel_sessions')
                .insert({ user_id: currentUser.id, name: naam, state: state })
                .select().maybeSingle();
            if (ins.error) { toast('Opslaan mislukt'); console.error(ins.error.message); return; }
            loadedTraject = { id: ins.data.id, name: ins.data.name };
        }
        refreshHome();
        saveLocal();
        toast('Traject opgeslagen');
    }

    async function openTrajectModal() {
        if (!currentUser) { toast('Log in om opgeslagen trajecten te zien.'); return; }
        var list = $('vsTrajectList');
        list.innerHTML = '<p class="vs-empty-note">Laden…</p>';
        openModal('vsTrajectModal');
        var res = await supabase.from('visiespel_sessions')
            .select('id,name,updated_at,state').eq('user_id', currentUser.id)
            .order('updated_at', { ascending: false });
        if (res.error) { list.innerHTML = '<p class="vs-empty-note">Kon trajecten niet laden.</p>'; return; }
        var rows = res.data || [];
        if (!rows.length) { list.innerHTML = '<p class="vs-empty-note">Je hebt nog geen opgeslagen trajecten.</p>'; return; }
        list.innerHTML = rows.map(function (r) {
            var d = new Date(r.updated_at);
            return '<div class="vs-list-item">' +
                '<div class="vs-li-main">' +
                    '<div class="vs-li-name">' + esc(r.name) + '</div>' +
                    '<div class="vs-li-meta">Bijgewerkt: ' + d.toLocaleDateString('nl-NL') + ' ' + d.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }) + '</div>' +
                '</div>' +
                '<div class="vs-li-actions">' +
                    '<button class="vs-mini-btn" data-open="' + r.id + '">Openen</button>' +
                    '<button class="vs-slot-del" data-tdel="' + r.id + '" title="Verwijderen">&#128465;&#65039;</button>' +
                '</div>' +
            '</div>';
        }).join('');
        // cache rows op het element voor openen
        list._rows = rows;
    }
    function openTraject(id) {
        var rows = $('vsTrajectList')._rows || [];
        var row = rows.filter(function (r) { return r.id === id; })[0];
        if (!row) return;
        applyState(row.state);
        loadedTraject = { id: row.id, name: row.name };
        closeModal('vsTrajectModal');
        refreshHome();
        toast('Traject “' + row.name + '” geopend');
    }
    async function deleteTraject(id) {
        if (!window.confirm('Dit traject definitief verwijderen?')) return;
        var res = await supabase.from('visiespel_sessions').delete().eq('id', id).eq('user_id', currentUser.id);
        if (res.error) { toast('Verwijderen mislukt'); return; }
        if (loadedTraject && loadedTraject.id === id) { loadedTraject = null; }
        refreshHome();
        openTrajectModal();
        toast('Traject verwijderd');
    }

    function resetAll() {
        if (!window.confirm('Opnieuw beginnen? Alle keuzes in de huidige werkversie worden gewist. (Opgeslagen trajecten blijven bestaan.)')) return;
        work = {}; ensureWork();
        loadedTraject = null;
        saveLocal();
        refreshHome();
        toast('Opnieuw begonnen');
    }

    // ---------- Events ----------
    // Home: wiel + kaarten
    $('vsWheel').addEventListener('click', function (e) {
        var g = e.target.closest('.vs-seg');
        if (g) openPunt(g.getAttribute('data-key'));
    });
    $('vsGrid').addEventListener('click', function (e) {
        var c = e.target.closest('.vs-punt-card');
        if (c) openPunt(c.getAttribute('data-key'));
    });
    $('vsPuntBack').addEventListener('click', closePunt);

    // Kaart-acties (delegatie)
    $('vsCardSlot').addEventListener('click', function (e) {
        var b = e.target.closest('[data-act]');
        if (!b) return;
        var act = b.getAttribute('data-act');
        if (act === 'punt' || act === 'parkeer' || act === 'weg') placeCurrent(act);
        else if (act === 'next') moveCard(1);
        else if (act === 'prev') moveCard(-1);
        else if (act === 'review-parkeer') openReview('parkeer');
        else if (act === 'review-weg') openReview('weg');
    });

    // Slots: verwijderen
    $('vsSlots').addEventListener('click', function (e) {
        var del = e.target.closest('[data-del]');
        var pair = e.target.closest('[data-pair]');
        var split = e.target.closest('[data-split]');
        if (del) removeFromPunt(del.getAttribute('data-del'));
        else if (pair) pairGroup(parseInt(pair.getAttribute('data-pair'), 10));
        else if (split) splitFromGroup(split.getAttribute('data-split'));
    });
    setupDrag();

    // Taart-foot
    $('vsBtnParkeer').addEventListener('click', function () { openReview('parkeer'); });
    $('vsBtnWeg').addEventListener('click', function () { openReview('weg'); });
    $('vsBtnCustom').addEventListener('click', openCustom);

    // Review-modal
    $('vsReviewClose').addEventListener('click', function () { closeModal('vsReviewModal'); });
    $('vsReviewList').addEventListener('click', function (e) {
        var b = e.target.closest('[data-rev]');
        if (!b) return;
        var item = b.closest('.vs-review-item');
        reviewAction(item.getAttribute('data-id'), b.getAttribute('data-rev'), b.getAttribute('data-from'));
    });

    // Custom-modal
    $('vsCustomClose').addEventListener('click', function () { closeModal('vsCustomModal'); });
    $('vsCustomAdd').addEventListener('click', addCustom);
    $('vsCustomList').addEventListener('click', function (e) {
        var d = e.target.closest('[data-cdel]');
        if (d) deleteCustom(d.getAttribute('data-cdel'));
    });

    // Trajecten
    $('vsBtnOpen').addEventListener('click', openTrajectModal);
    $('vsBtnSave').addEventListener('click', saveTraject);
    $('vsBtnReset').addEventListener('click', resetAll);
    $('vsTrajectClose').addEventListener('click', function () { closeModal('vsTrajectModal'); });
    $('vsTrajectList').addEventListener('click', function (e) {
        var o = e.target.closest('[data-open]');
        var d = e.target.closest('[data-tdel]');
        if (o) openTraject(o.getAttribute('data-open'));
        else if (d) deleteTraject(d.getAttribute('data-tdel'));
    });

    // Modals sluiten bij klik op achtergrond
    ['vsTrajectModal', 'vsReviewModal', 'vsCustomModal'].forEach(function (id) {
        $(id).addEventListener('click', function (e) { if (e.target === $(id)) closeModal(id); });
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') ['vsTrajectModal', 'vsReviewModal', 'vsCustomModal'].forEach(function (id) { closeModal(id); });
    });

    // ---------- Init ----------
    (async function init() {
        loadLocal();
        ensureWork();
        refreshHome();
        if (window.hidePageLoader) window.hidePageLoader();

        currentUser = await getUser();
        if (currentUser) {
            await loadCustom();
            refreshHome();
        }
    })();
});

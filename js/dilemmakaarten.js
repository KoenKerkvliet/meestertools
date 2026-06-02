/* ============================================
   MEESTERTOOLS - Dilemmakaarten
   Versie: v1.0.0

   Bespreek lastige sociale situaties op het bord en oefen samen met keuzes
   maken. Twee soorten kaarten:
   - bespreken : een situatie + open vraag, met optionele doorpraat-vragen
   - stelling  : een stelling waar je klassikaal over stemt (eens / oneens)

   De ingebouwde set is ~75% bespreken / ~25% stelling. Leerkrachten kunnen
   eigen kaarten toevoegen; die worden per gebruiker bewaard in tool_settings
   ('dilemmakaarten') en verschijnen tussen de ingebouwde kaarten.
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    var TOOL_NAME = 'dilemmakaarten';

    // ---------- Categorieën ----------
    var CATS = [
        { key: 'vriendschap', label: 'Vriendschap', icon: '&#129309;', accent: 'blue' },   // 🤝
        { key: 'eerlijk',     label: 'Eerlijk',     icon: '&#128270;', accent: 'green' },  // 🔍
        { key: 'pesten',      label: 'Opkomen voor elkaar', icon: '&#128737;&#65039;', accent: 'orange' }, // 🛡️
        { key: 'samenwerken', label: 'Samenwerken', icon: '&#129513;', accent: 'purple' }, // 🧩
        { key: 'online',      label: 'Online',      icon: '&#128241;', accent: 'cyan' },   // 📱
        { key: 'gevoelens',   label: 'Gevoelens',   icon: '&#128548;', accent: 'red' }     // 😤
    ];
    var CAT_BY_KEY = {};
    CATS.forEach(function (c) { CAT_BY_KEY[c.key] = c; });

    // ---------- Ingebouwde kaarten (~75% bespreken / ~25% stelling) ----------
    var BUILTIN = [
        // --- Vriendschap ---
        { id: 'b1', type: 'bespreken', cat: 'vriendschap', text: 'Je beste vriend(in) wil tijdens de pauze alleen met iemand anders spelen. Wat doe je?', prompts: ['Hoe voelt dat voor jou?', 'Kun je ook samen met z’n drieën spelen?'] },
        { id: 'b2', type: 'bespreken', cat: 'vriendschap', text: 'Er is een nieuw kind in de klas dat nog niemand kent. Wat doe jij?', prompts: ['Hoe zou jij je voelen als jij nieuw was?'] },
        { id: 'b3', type: 'bespreken', cat: 'vriendschap', text: 'Twee vrienden van jou hebben ruzie en willen allebei dat jij hun kant kiest. Wat doe je?', prompts: ['Moet je per se een kant kiezen?'] },
        { id: 'b4', type: 'bespreken', cat: 'vriendschap', text: 'Je bent uitgenodigd voor een feestje, maar je beste vriend(in) niet. Wat doe je?', prompts: ['Wat zou jij fijn vinden als het andersom was?'] },
        { id: 'b5', type: 'bespreken', cat: 'vriendschap', text: 'Iemand vraagt of hij of zij mag meedoen, maar het spel is eigenlijk vol. Wat doe je?', prompts: ['Hoe zeg je “nee” zonder iemand te kwetsen?'] },

        // --- Eerlijk ---
        { id: 'b6', type: 'bespreken', cat: 'eerlijk', text: 'Je vindt 5 euro op het schoolplein. Niemand heeft het gezien. Wat doe je?', prompts: ['Maakt het uit van wie het geld is?'] },
        { id: 'b7', type: 'bespreken', cat: 'eerlijk', text: 'Je hebt per ongeluk iets van een ander kapotgemaakt. Niemand weet het. Wat doe je?', prompts: ['Wat gebeurt er als je het wel of niet vertelt?'] },

        // --- Opkomen voor elkaar / pesten ---
        { id: 'b8', type: 'bespreken', cat: 'pesten', text: 'Je ziet dat een klasgenoot steeds buiten de groep wordt gelaten. Wat doe je?', prompts: ['Hoe voelt diegene zich denk je?', 'Wat zou je kunnen zeggen of doen?'] },
        { id: 'b9', type: 'bespreken', cat: 'pesten', text: 'Iemand maakt steeds “grapjes” over een klasgenoot en de klas lacht mee. Wat doe je?', prompts: ['Is het nog een grapje als de ander het niet leuk vindt?'] },
        { id: 'b10', type: 'bespreken', cat: 'pesten', text: 'Je merkt dat jij zelf iets gemeens hebt gezegd tegen iemand. Hoe maak je het goed?', prompts: ['Wat heb je nodig om sorry te zeggen?'] },

        // --- Samenwerken ---
        { id: 'b11', type: 'bespreken', cat: 'samenwerken', text: 'In je groepje doet één kind niks mee. Wat doe je?', prompts: ['Hoe vraag je dat zonder ruzie te maken?'] },
        { id: 'b12', type: 'bespreken', cat: 'samenwerken', text: 'Jij en een klasgenoot willen allebei dezelfde taak doen. Wat doe je?', prompts: ['Wat is hier een eerlijke oplossing?'] },

        // --- Online ---
        { id: 'b13', type: 'bespreken', cat: 'online', text: 'Iemand stuurt in de klassenapp een gemeen berichtje over een ander. Wat doe je?', prompts: ['Zou je dit ook in het echt zo zeggen?'] },
        { id: 'b14', type: 'bespreken', cat: 'online', text: 'Een vriend wil een foto van jou doorsturen die jij niet leuk vindt. Wat doe je?', prompts: ['Mag iemand een foto van jou delen zonder te vragen?'] },
        { id: 'b15', type: 'bespreken', cat: 'online', text: 'Je krijgt een filmpje doorgestuurd dat eigenlijk niet voor kinderen is. Wat doe je?', prompts: ['Aan welke volwassene zou je het kunnen vertellen?'] },

        // --- Gevoelens ---
        { id: 'b16', type: 'bespreken', cat: 'gevoelens', text: 'Je bent heel boos omdat je verloren hebt met een spel. Wat doe je met die boosheid?', prompts: ['Wat helpt jou om weer af te koelen?'] },
        { id: 'b17', type: 'bespreken', cat: 'gevoelens', text: 'Een klasgenoot is verdrietig, maar zegt “er is niks”. Wat doe je?', prompts: ['Hoe laat je merken dat je er voor iemand bent?'] },
        { id: 'b18', type: 'bespreken', cat: 'gevoelens', text: 'De juf of meester geeft jou de schuld van iets dat je niet hebt gedaan. Wat doe je?', prompts: ['Hoe leg je rustig uit wat er echt gebeurd is?'] },

        // --- Stellingen (stemmen: eens / oneens) ~25% ---
        { id: 's1', type: 'stelling', cat: 'eerlijk',     text: 'Een kleine leugen om iemand niet te kwetsen, mag.' },
        { id: 's2', type: 'stelling', cat: 'vriendschap', text: 'Je mag maar één beste vriend(in) hebben.' },
        { id: 's3', type: 'stelling', cat: 'pesten',      text: 'Toekijken bij pesten is net zo erg als zelf pesten.' },
        { id: 's4', type: 'stelling', cat: 'samenwerken', text: 'In een groepje moet iedereen evenveel doen.' },
        { id: 's5', type: 'stelling', cat: 'online',      text: 'Een grappig filmpje van een klasgenoot mag je doorsturen, ook zonder te vragen.' },
        { id: 's6', type: 'stelling', cat: 'gevoelens',   text: 'Jongens mogen net zo goed huilen op school als meisjes.' }
    ];

    // ---------- State ----------
    var currentUser = null;
    var customCards = [];          // eigen kaarten van de gebruiker
    var activeCats = new Set();    // leeg = alle categorieën
    var deck = [];                 // huidige (gefilterde, evt. geschudde) kaarten
    var index = 0;
    var votes = {};                // cardId -> { eens, oneens } (sessie)
    var revealed = new Set();      // cardId's waarvan doorpraat-vragen open staan
    var presentOpen = false;
    var formType = 'bespreken';

    // ---------- DOM ----------
    var $ = function (id) { return document.getElementById(id); };
    var catsEl = $('dkCats');
    var viewer = $('dkViewer');
    var cardEl = $('dkCard');
    var progressEl = $('dkProgress');
    var prevBtn = $('dkPrev');
    var nextBtn = $('dkNext');
    var shuffleBtn = $('dkShuffle');
    var stageHome = $('dkStageHome');
    var presentOverlay = $('dkPresentOverlay');
    var presentSlot = $('dkPresentSlot');
    var presentBtn = $('dkPresent');
    var presentClose = $('dkPresentClose');
    var toastEl = $('dkToast');

    // Manage modal
    var manageModal = $('dkManageModal');
    var manageBtn = $('dkManage');
    var manageClose = $('dkManageClose');
    var form = $('dkForm');
    var editIdInput = $('dkEditId');
    var typeSeg = $('dkTypeSeg');
    var catSelect = $('dkCat');
    var textArea = $('dkText');
    var textLabel = $('dkTextLabel');
    var promptsWrap = $('dkPromptsWrap');
    var promptsArea = $('dkPrompts');
    var formCancel = $('dkFormCancel');
    var formSubmit = $('dkFormSubmit');
    var myList = $('dkMyList');
    var myCount = $('dkMyCount');

    // ---------- Helpers ----------
    function esc(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }
    function toast(msg) {
        toastEl.textContent = msg;
        toastEl.classList.add('visible');
        clearTimeout(toast._t);
        toast._t = setTimeout(function () { toastEl.classList.remove('visible'); }, 2400);
    }
    function allCards() { return BUILTIN.concat(customCards); }

    // ---------- Supabase ----------
    async function getUser() {
        var s = await supabase.auth.getSession();
        return (s.data.session && s.data.session.user) || null;
    }
    async function loadStore() {
        if (!currentUser) return;
        var res = await supabase.from('tool_settings').select('settings')
            .eq('user_id', currentUser.id).eq('tool_name', TOOL_NAME).maybeSingle();
        var settings = (res.data && res.data.settings) ? res.data.settings : {};
        customCards = Array.isArray(settings.custom) ? settings.custom : [];
    }
    function persist() {
        if (!currentUser) return;
        supabase.from('tool_settings').upsert({
            user_id: currentUser.id, tool_name: TOOL_NAME,
            settings: { custom: customCards },
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,tool_name' }).then(function (res) {
            if (res.error) console.error('dilemmakaarten opslaan:', res.error.message);
        });
    }

    // ---------- Deck ----------
    function rebuildDeck(keepCurrentId) {
        var keepId = keepCurrentId && deck[index] ? deck[index].id : null;
        deck = allCards().filter(function (c) {
            return activeCats.size === 0 || activeCats.has(c.cat);
        });
        if (keepId) {
            var i = deck.findIndex(function (c) { return c.id === keepId; });
            index = i >= 0 ? i : 0;
        } else {
            index = 0;
        }
        if (index >= deck.length) index = 0;
        render();
    }
    function shuffle() {
        for (var i = deck.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var t = deck[i]; deck[i] = deck[j]; deck[j] = t;
        }
        index = 0;
        render();
        toast('Kaarten geschud');
    }
    function go(delta) {
        if (!deck.length) return;
        index = (index + delta + deck.length) % deck.length;
        render();
    }

    // ---------- Renderen ----------
    function render() {
        if (!deck.length) {
            viewer.classList.remove('dk-accent-blue', 'dk-accent-green', 'dk-accent-orange', 'dk-accent-purple', 'dk-accent-cyan', 'dk-accent-red');
            cardEl.innerHTML = '<div class="dk-empty">Geen kaarten in deze selectie. Kies een andere categorie of voeg een eigen kaart toe.</div>';
            progressEl.textContent = '0 / 0';
            prevBtn.disabled = true; nextBtn.disabled = true; shuffleBtn.disabled = true;
            return;
        }
        prevBtn.disabled = false; nextBtn.disabled = false; shuffleBtn.disabled = false;

        var card = deck[index];
        var cat = CAT_BY_KEY[card.cat] || { label: '', icon: '', accent: 'blue' };

        viewer.className = 'dk-viewer dk-accent-' + cat.accent;
        progressEl.textContent = (index + 1) + ' / ' + deck.length;

        var typeLabel = card.type === 'stelling' ? 'Stelling' : 'Bespreken';
        var html = '' +
            '<div class="dk-card-top">' +
                '<span class="dk-type dk-type-' + card.type + '">' + typeLabel + '</span>' +
                '<span class="dk-chip"><span class="dk-chip-icon">' + cat.icon + '</span>' + esc(cat.label) + '</span>' +
            '</div>' +
            '<p class="dk-card-text">' + esc(card.text) + '</p>';

        if (card.type === 'stelling') {
            html += renderVote(card);
        } else if (card.prompts && card.prompts.length) {
            var open = revealed.has(card.id);
            html += '<button class="dk-reveal" data-action="reveal">' +
                (open ? '&#9650; Verberg doorpraat-vragen' : '&#9660; Doorpraat-vragen') + '</button>';
            if (open) {
                html += '<ul class="dk-prompts">' + card.prompts.map(function (p) {
                    return '<li>' + esc(p) + '</li>';
                }).join('') + '</ul>';
            }
        }

        cardEl.innerHTML = html;
    }

    function renderVote(card) {
        var v = votes[card.id] || { eens: 0, oneens: 0 };
        var total = v.eens + v.oneens;
        var pe = total ? Math.round((v.eens / total) * 100) : 0;
        var po = total ? 100 - pe : 0;
        return '' +
            '<div class="dk-vote">' +
                '<div class="dk-vote-btns">' +
                    '<button class="dk-vote-btn dk-vote-eens" data-action="vote" data-v="eens">' +
                        '&#128077; Eens <span class="dk-vote-num">' + v.eens + '</span></button>' +
                    '<button class="dk-vote-btn dk-vote-oneens" data-action="vote" data-v="oneens">' +
                        '&#128078; Oneens <span class="dk-vote-num">' + v.oneens + '</span></button>' +
                '</div>' +
                '<div class="dk-bar" title="' + pe + '% eens">' +
                    '<div class="dk-bar-eens" style="width:' + pe + '%"></div>' +
                    '<div class="dk-bar-oneens" style="width:' + po + '%"></div>' +
                '</div>' +
                '<div class="dk-vote-foot">' +
                    '<span>' + (total ? pe + '% eens · ' + po + '% oneens' : 'Steek je hand op en tel mee') + '</span>' +
                    (total ? '<button class="dk-vote-reset" data-action="reset-votes">Opnieuw</button>' : '') +
                '</div>' +
            '</div>';
    }

    // Klikken binnen een kaart (delegatie): reveal + stemmen
    cardEl.addEventListener('click', function (e) {
        var el = e.target.closest('[data-action]');
        if (!el || !deck.length) return;
        var card = deck[index];
        var action = el.getAttribute('data-action');
        if (action === 'reveal') {
            if (revealed.has(card.id)) revealed.delete(card.id); else revealed.add(card.id);
            render();
        } else if (action === 'vote') {
            if (!votes[card.id]) votes[card.id] = { eens: 0, oneens: 0 };
            votes[card.id][el.getAttribute('data-v')]++;
            render();
        } else if (action === 'reset-votes') {
            votes[card.id] = { eens: 0, oneens: 0 };
            render();
        }
    });

    // ---------- Categorie-filter ----------
    function renderCats() {
        var html = '<button class="dk-cat' + (activeCats.size === 0 ? ' is-active' : '') + '" data-cat="">Alles</button>';
        html += CATS.map(function (c) {
            return '<button class="dk-cat dk-cat-' + c.accent + (activeCats.has(c.key) ? ' is-active' : '') +
                '" data-cat="' + c.key + '"><span class="dk-cat-icon">' + c.icon + '</span>' + esc(c.label) + '</button>';
        }).join('');
        catsEl.innerHTML = html;
    }
    catsEl.addEventListener('click', function (e) {
        var btn = e.target.closest('.dk-cat');
        if (!btn) return;
        var key = btn.getAttribute('data-cat');
        if (!key) activeCats.clear();
        else if (activeCats.has(key)) activeCats.delete(key);
        else activeCats.add(key);
        renderCats();
        rebuildDeck(true);
    });

    // ---------- Presenteren ----------
    function openPresent() {
        if (presentOpen) return;
        presentSlot.appendChild(viewer);
        presentOverlay.style.display = 'flex';
        document.body.classList.add('dk-presenting');
        presentOpen = true;
    }
    function closePresent() {
        if (!presentOpen) return;
        stageHome.appendChild(viewer);
        presentOverlay.style.display = 'none';
        document.body.classList.remove('dk-presenting');
        presentOpen = false;
    }

    // ---------- Eigen kaarten beheren ----------
    function fillCatSelect() {
        catSelect.innerHTML = CATS.map(function (c) {
            return '<option value="' + c.key + '">' + esc(c.label) + '</option>';
        }).join('');
    }
    function setFormType(type) {
        formType = type;
        Array.prototype.forEach.call(typeSeg.querySelectorAll('.dk-seg-btn'), function (b) {
            b.classList.toggle('is-active', b.getAttribute('data-type') === type);
        });
        var stelling = type === 'stelling';
        textLabel.textContent = stelling ? 'De stelling' : 'Situatie & vraag';
        textArea.placeholder = stelling
            ? 'Bijv. Toekijken bij pesten is net zo erg als zelf pesten.'
            : 'Bijv. Je ziet dat een klasgenoot buiten de groep wordt gelaten. Wat doe je?';
        promptsWrap.style.display = stelling ? 'none' : '';
    }
    function resetForm() {
        editIdInput.value = '';
        textArea.value = '';
        promptsArea.value = '';
        setFormType('bespreken');
        catSelect.value = CATS[0].key;
        formSubmit.textContent = 'Kaart toevoegen';
        formCancel.style.display = 'none';
    }
    function renderMyList() {
        myCount.textContent = customCards.length;
        if (!customCards.length) {
            myList.innerHTML = '<p class="dk-my-empty">Je hebt nog geen eigen kaarten. Voeg er hierboven een toe.</p>';
            return;
        }
        myList.innerHTML = customCards.map(function (c) {
            var cat = CAT_BY_KEY[c.cat] || { label: '', icon: '' };
            return '<div class="dk-my-item">' +
                '<div class="dk-my-info">' +
                    '<span class="dk-type dk-type-' + c.type + '">' + (c.type === 'stelling' ? 'Stelling' : 'Bespreken') + '</span> ' +
                    '<span class="dk-my-cat">' + cat.icon + ' ' + esc(cat.label) + '</span>' +
                    '<p class="dk-my-text">' + esc(c.text) + '</p>' +
                '</div>' +
                '<div class="dk-my-actions">' +
                    '<button class="dk-icon-btn" data-edit="' + c.id + '" title="Bewerken">&#9998;</button>' +
                    '<button class="dk-icon-btn dk-icon-del" data-del="' + c.id + '" title="Verwijderen">&#128465;&#65039;</button>' +
                '</div>' +
            '</div>';
        }).join('');
    }
    myList.addEventListener('click', function (e) {
        var ed = e.target.closest('[data-edit]');
        var del = e.target.closest('[data-del]');
        if (ed) {
            var card = customCards.find(function (c) { return c.id === ed.getAttribute('data-edit'); });
            if (!card) return;
            editIdInput.value = card.id;
            setFormType(card.type);
            catSelect.value = card.cat;
            textArea.value = card.text;
            promptsArea.value = (card.prompts || []).join('\n');
            formSubmit.textContent = 'Wijziging opslaan';
            formCancel.style.display = '';
            textArea.focus();
        } else if (del) {
            var id = del.getAttribute('data-del');
            customCards = customCards.filter(function (c) { return c.id !== id; });
            persist();
            renderMyList();
            rebuildDeck(true);
            if (editIdInput.value === id) resetForm();
            toast('Kaart verwijderd');
        }
    });

    typeSeg.addEventListener('click', function (e) {
        var b = e.target.closest('.dk-seg-btn');
        if (b) setFormType(b.getAttribute('data-type'));
    });
    formCancel.addEventListener('click', resetForm);
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        var text = textArea.value.trim();
        if (!text) { toast('Vul eerst een tekst in'); textArea.focus(); return; }
        var prompts = formType === 'bespreken'
            ? promptsArea.value.split('\n').map(function (s) { return s.trim(); }).filter(Boolean)
            : [];
        var editId = editIdInput.value;
        if (editId) {
            var card = customCards.find(function (c) { return c.id === editId; });
            if (card) { card.type = formType; card.cat = catSelect.value; card.text = text; card.prompts = prompts; }
            toast('Kaart opgeslagen');
        } else {
            customCards.push({
                id: 'u' + Date.now().toString(36) + Math.floor(Math.random() * 1000),
                type: formType, cat: catSelect.value, text: text, prompts: prompts
            });
            toast('Kaart toegevoegd');
        }
        persist();
        renderMyList();
        rebuildDeck(true);
        resetForm();
    });

    function openManage() { renderMyList(); manageModal.classList.add('active'); }
    function closeManage() { manageModal.classList.remove('active'); }

    // ---------- Events ----------
    prevBtn.addEventListener('click', function () { go(-1); });
    nextBtn.addEventListener('click', function () { go(1); });
    shuffleBtn.addEventListener('click', shuffle);
    presentBtn.addEventListener('click', openPresent);
    presentClose.addEventListener('click', closePresent);
    manageBtn.addEventListener('click', openManage);
    manageClose.addEventListener('click', closeManage);
    manageModal.addEventListener('click', function (e) { if (e.target === manageModal) closeManage(); });

    document.addEventListener('keydown', function (e) {
        if (manageModal.classList.contains('active')) {
            if (e.key === 'Escape') closeManage();
            return;
        }
        if (e.key === 'ArrowRight') go(1);
        else if (e.key === 'ArrowLeft') go(-1);
        else if (e.key === 'Escape' && presentOpen) closePresent();
    });

    // ---------- Init ----------
    (async function init() {
        renderCats();
        fillCatSelect();
        resetForm();
        rebuildDeck(false);            // toon meteen de ingebouwde set
        if (window.hidePageLoader) window.hidePageLoader();

        currentUser = await getUser();
        if (currentUser) {
            await loadStore();
            renderMyList();
            rebuildDeck(true);         // eigen kaarten ertussen
        }
    })();
});

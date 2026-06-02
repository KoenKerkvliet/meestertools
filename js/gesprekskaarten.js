/* ============================================
   MEESTERTOOLS - Gesprekskaarten
   Versie: v1.0.0

   Gespreksstarters voor in de kring. Eén open vraag per kaart, groot op het
   bord. Filter op thema en op diepte-niveau (luchtig / persoonlijk / diep),
   trek een willekeurige kaart of blader er doorheen.

   Subtiel: met een actieve klas kun je met één knop kiezen wie er begint
   (willekeurige leerling) en de beurt doorgeven. Werkt ook prima zonder klas.

   Eigen kaarten worden per gebruiker bewaard in tool_settings
   ('gesprekskaarten') en verschijnen tussen de ingebouwde kaarten.
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    var TOOL_NAME = 'gesprekskaarten';

    // ---------- Thema's ----------
    var THEMES = [
        { key: 'ijsbrekers',  label: 'IJsbrekers',  icon: '&#128512;' }, // 😀
        { key: 'overjou',     label: 'Over jou',    icon: '&#128587;' }, // 🙋
        { key: 'verbeelding', label: 'Verbeelding', icon: '&#129668;' }, // 🪄
        { key: 'gevoelens',   label: 'Gevoelens',   icon: '&#10084;&#65039;' }, // ❤️
        { key: 'samen',       label: 'Samen',       icon: '&#129309;' }, // 🤝
        { key: 'terugblik',   label: 'Terugblik',   icon: '&#128257;' }  // 🔁
    ];
    var THEME_BY_KEY = {};
    THEMES.forEach(function (t) { THEME_BY_KEY[t.key] = t; });

    // ---------- Diepte-niveaus ----------
    var NIVEAUS = [
        { n: 1, label: 'Luchtig',     accent: 'green' },
        { n: 2, label: 'Persoonlijk', accent: 'orange' },
        { n: 3, label: 'Diep',        accent: 'purple' }
    ];
    var NIVEAU_BY_N = {};
    NIVEAUS.forEach(function (x) { NIVEAU_BY_N[x.n] = x; });

    // ---------- Ingebouwde kaarten ----------
    var BUILTIN = [
        // IJsbrekers (luchtig)
        { id: 'g1', theme: 'ijsbrekers', niveau: 1, text: 'Hond of kat — en waarom?' },
        { id: 'g2', theme: 'ijsbrekers', niveau: 1, text: 'Wat zou je doen met een miljoen euro?' },
        { id: 'g3', theme: 'ijsbrekers', niveau: 1, text: 'Zoet of hartig? Wat kies jij?' },
        { id: 'g4', theme: 'ijsbrekers', niveau: 1, text: 'Wat is het lekkerste wat je ooit hebt gegeten?' },
        { id: 'g5', theme: 'ijsbrekers', niveau: 1, text: 'Zomer of winter? Waarom?' },

        // Over jou (persoonlijk)
        { id: 'g6', theme: 'overjou', niveau: 2, text: 'Waar word jij blij van?' },
        { id: 'g7', theme: 'overjou', niveau: 2, text: 'Wat kun jij heel goed?' },
        { id: 'g8', theme: 'overjou', niveau: 2, text: 'Wat is je leukste hobby en waarom?' },
        { id: 'g9', theme: 'overjou', niveau: 2, text: 'Wat is je mooiste herinnering van dit schooljaar?' },
        { id: 'g10', theme: 'overjou', niveau: 2, text: 'Welk dier zou jij willen zijn en waarom?' },

        // Verbeelding (wat-als)
        { id: 'g11', theme: 'verbeelding', niveau: 1, text: 'Als je één dag onzichtbaar was, wat zou je doen?' },
        { id: 'g12', theme: 'verbeelding', niveau: 1, text: 'Welke superkracht zou jij willen hebben?' },
        { id: 'g13', theme: 'verbeelding', niveau: 1, text: 'Als dieren konden praten, met welk dier zou jij kletsen?' },
        { id: 'g14', theme: 'verbeelding', niveau: 2, text: 'Je mag één dag de juf of meester zijn. Wat doe je dan?' },
        { id: 'g15', theme: 'verbeelding', niveau: 2, text: 'Als jij een eigen land mocht maken, welke regel komt er zeker in?' },

        // Gevoelens (diep)
        { id: 'g16', theme: 'gevoelens', niveau: 3, text: 'Wanneer voel jij je trots?' },
        { id: 'g17', theme: 'gevoelens', niveau: 3, text: 'Wat maakt jou weleens verdrietig?' },
        { id: 'g18', theme: 'gevoelens', niveau: 3, text: 'Wat doe jij als een vriend verdrietig is?' },
        { id: 'g19', theme: 'gevoelens', niveau: 3, text: 'Waar ben je weleens een beetje bang voor?' },
        { id: 'g20', theme: 'gevoelens', niveau: 3, text: 'Wat heb jij nodig om je fijn te voelen in de klas?' },

        // Samen (over de groep)
        { id: 'g21', theme: 'samen', niveau: 2, text: 'Wat vind jij een fijne vriend?' },
        { id: 'g22', theme: 'samen', niveau: 2, text: 'Wat zou onze klas nog leuker maken?' },
        { id: 'g23', theme: 'samen', niveau: 3, text: 'Hoe help jij iemand die zich alleen voelt?' },
        { id: 'g24', theme: 'samen', niveau: 2, text: 'Wat kun jij doen om een ander blij te maken?' },

        // Terugblik (reflectie)
        { id: 'g25', theme: 'terugblik', niveau: 2, text: 'Wat ging vandaag goed?' },
        { id: 'g26', theme: 'terugblik', niveau: 2, text: 'Waar wil je morgen beter in worden?' },
        { id: 'g27', theme: 'terugblik', niveau: 2, text: 'Wie wil je een complimentje geven en waarom?' },
        { id: 'g28', theme: 'terugblik', niveau: 1, text: 'Waar heb je deze week van genoten?' },
        { id: 'g29', theme: 'terugblik', niveau: 2, text: 'Wat heb je deze week geleerd?' }
    ];

    // ---------- State ----------
    var currentUser = null;
    var customCards = [];
    var activeThemes = new Set();
    var activeNiveaus = new Set();
    var deck = [];
    var index = 0;

    var students = [];            // namen van de actieve klas
    var lastTurnName = '';
    var presentOpen = false;

    // ---------- DOM ----------
    var $ = function (id) { return document.getElementById(id); };
    var niveausEl = $('gkNiveaus');
    var themesEl = $('gkThemes');
    var viewer = $('gkViewer');
    var cardEl = $('gkCard');
    var progressEl = $('gkProgress');
    var prevBtn = $('gkPrev');
    var nextBtn = $('gkNext');
    var drawBtn = $('gkDraw');
    var stageHome = $('gkStageHome');
    var presentOverlay = $('gkPresentOverlay');
    var presentSlot = $('gkPresentSlot');
    var presentBtn = $('gkPresent');
    var presentClose = $('gkPresentClose');
    var toastEl = $('gkToast');

    var turnBar = $('gkTurnBar');
    var turnBtn = $('gkTurnBtn');
    var turnResult = $('gkTurnResult');
    var turnName = $('gkTurnName');
    var turnNext = $('gkTurnNext');
    var turnHide = $('gkTurnHide');

    // Manage modal
    var manageModal = $('gkManageModal');
    var manageBtn = $('gkManage');
    var manageClose = $('gkManageClose');
    var form = $('gkForm');
    var editIdInput = $('gkEditId');
    var textArea = $('gkText');
    var themeSelect = $('gkTheme');
    var niveauSelect = $('gkNiveau');
    var formCancel = $('gkFormCancel');
    var formSubmit = $('gkFormSubmit');
    var myList = $('gkMyList');
    var myCount = $('gkMyCount');

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
            if (res.error) console.error('gesprekskaarten opslaan:', res.error.message);
        });
    }
    async function loadStudents(groupId) {
        students = [];
        if (!groupId) return;
        var res = await supabase.from('students').select('first_name, last_name')
            .eq('group_id', groupId).eq('archived', false).order('first_name');
        students = (res.data || []).map(function (s) {
            return (s.first_name || '').trim() || (s.last_name || '').trim();
        }).filter(Boolean);
    }

    // ---------- Deck ----------
    function rebuildDeck(keepCurrentId) {
        var keepId = keepCurrentId && deck[index] ? deck[index].id : null;
        deck = allCards().filter(function (c) {
            var okTheme = activeThemes.size === 0 || activeThemes.has(c.theme);
            var okNiveau = activeNiveaus.size === 0 || activeNiveaus.has(c.niveau);
            return okTheme && okNiveau;
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
    function draw() {
        if (deck.length <= 1) { render(); return; }
        var next;
        do { next = Math.floor(Math.random() * deck.length); } while (next === index);
        index = next;
        render();
    }
    function go(delta) {
        if (!deck.length) return;
        index = (index + delta + deck.length) % deck.length;
        render();
    }

    // ---------- Renderen ----------
    function render() {
        if (!deck.length) {
            viewer.className = 'gk-viewer';
            cardEl.innerHTML = '<div class="gk-empty">Geen kaarten in deze selectie. Kies een ander thema of een andere diepte, of voeg een eigen kaart toe.</div>';
            progressEl.textContent = '0 / 0';
            prevBtn.disabled = true; nextBtn.disabled = true; drawBtn.disabled = true;
            return;
        }
        prevBtn.disabled = false; nextBtn.disabled = false; drawBtn.disabled = false;

        var card = deck[index];
        var theme = THEME_BY_KEY[card.theme] || { label: '', icon: '' };
        var niv = NIVEAU_BY_N[card.niveau] || { label: '', accent: 'green' };

        viewer.className = 'gk-viewer gk-accent-' + niv.accent;
        progressEl.textContent = (index + 1) + ' / ' + deck.length;

        cardEl.innerHTML = '' +
            '<div class="gk-card-top">' +
                '<span class="gk-chip"><span class="gk-chip-icon">' + theme.icon + '</span>' + esc(theme.label) + '</span>' +
                '<span class="gk-niveau-badge">' + esc(niv.label) + '</span>' +
            '</div>' +
            '<p class="gk-card-text">' + esc(card.text) + '</p>';
    }

    // ---------- Filters ----------
    function renderNiveaus() {
        niveausEl.innerHTML = NIVEAUS.map(function (x) {
            return '<button class="gk-niveau gk-niveau-' + x.accent + (activeNiveaus.has(x.n) ? ' is-active' : '') +
                '" data-niveau="' + x.n + '">' + esc(x.label) + '</button>';
        }).join('');
    }
    function renderThemes() {
        var html = '<button class="gk-theme' + (activeThemes.size === 0 ? ' is-active' : '') + '" data-theme="">Alle thema’s</button>';
        html += THEMES.map(function (t) {
            return '<button class="gk-theme' + (activeThemes.has(t.key) ? ' is-active' : '') +
                '" data-theme="' + t.key + '"><span class="gk-theme-icon">' + t.icon + '</span>' + esc(t.label) + '</button>';
        }).join('');
        themesEl.innerHTML = html;
    }
    niveausEl.addEventListener('click', function (e) {
        var btn = e.target.closest('.gk-niveau');
        if (!btn) return;
        var n = parseInt(btn.getAttribute('data-niveau'), 10);
        if (activeNiveaus.has(n)) activeNiveaus.delete(n); else activeNiveaus.add(n);
        renderNiveaus();
        rebuildDeck(true);
    });
    themesEl.addEventListener('click', function (e) {
        var btn = e.target.closest('.gk-theme');
        if (!btn) return;
        var key = btn.getAttribute('data-theme');
        if (!key) activeThemes.clear();
        else if (activeThemes.has(key)) activeThemes.delete(key);
        else activeThemes.add(key);
        renderThemes();
        rebuildDeck(true);
    });

    // ---------- Wie begint? ----------
    function pickTurn() {
        if (!students.length) return;
        var name = students[Math.floor(Math.random() * students.length)];
        if (students.length > 1) {
            var guard = 0;
            while (name === lastTurnName && guard < 10) {
                name = students[Math.floor(Math.random() * students.length)];
                guard++;
            }
        }
        lastTurnName = name;
        turnName.textContent = name;
        turnBtn.style.display = 'none';
        turnResult.style.display = '';
    }
    function resetTurn() {
        turnResult.style.display = 'none';
        turnBtn.style.display = '';
    }
    turnBtn.addEventListener('click', pickTurn);
    turnNext.addEventListener('click', pickTurn);
    turnHide.addEventListener('click', resetTurn);

    // ---------- Presenteren ----------
    function openPresent() {
        if (presentOpen) return;
        presentSlot.appendChild(viewer);
        presentOverlay.style.display = 'flex';
        document.body.classList.add('gk-presenting');
        presentOpen = true;
    }
    function closePresent() {
        if (!presentOpen) return;
        stageHome.appendChild(viewer);
        presentOverlay.style.display = 'none';
        document.body.classList.remove('gk-presenting');
        presentOpen = false;
    }

    // ---------- Eigen kaarten ----------
    function fillSelects() {
        themeSelect.innerHTML = THEMES.map(function (t) {
            return '<option value="' + t.key + '">' + esc(t.label) + '</option>';
        }).join('');
        niveauSelect.innerHTML = NIVEAUS.map(function (x) {
            return '<option value="' + x.n + '">' + esc(x.label) + '</option>';
        }).join('');
    }
    function resetForm() {
        editIdInput.value = '';
        textArea.value = '';
        themeSelect.value = THEMES[0].key;
        niveauSelect.value = '1';
        formSubmit.textContent = 'Kaart toevoegen';
        formCancel.style.display = 'none';
    }
    function renderMyList() {
        myCount.textContent = customCards.length;
        if (!customCards.length) {
            myList.innerHTML = '<p class="gk-my-empty">Je hebt nog geen eigen kaarten. Voeg er hierboven een toe.</p>';
            return;
        }
        myList.innerHTML = customCards.map(function (c) {
            var theme = THEME_BY_KEY[c.theme] || { label: '', icon: '' };
            var niv = NIVEAU_BY_N[c.niveau] || { label: '' };
            return '<div class="gk-my-item">' +
                '<div class="gk-my-info">' +
                    '<span class="gk-my-meta">' + theme.icon + ' ' + esc(theme.label) + ' · ' + esc(niv.label) + '</span>' +
                    '<p class="gk-my-text">' + esc(c.text) + '</p>' +
                '</div>' +
                '<div class="gk-my-actions">' +
                    '<button class="gk-icon-btn" data-edit="' + c.id + '" title="Bewerken">&#9998;</button>' +
                    '<button class="gk-icon-btn gk-icon-del" data-del="' + c.id + '" title="Verwijderen">&#128465;&#65039;</button>' +
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
            textArea.value = card.text;
            themeSelect.value = card.theme;
            niveauSelect.value = String(card.niveau);
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
    formCancel.addEventListener('click', resetForm);
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        var text = textArea.value.trim();
        if (!text) { toast('Vul eerst een vraag in'); textArea.focus(); return; }
        var editId = editIdInput.value;
        if (editId) {
            var card = customCards.find(function (c) { return c.id === editId; });
            if (card) { card.text = text; card.theme = themeSelect.value; card.niveau = parseInt(niveauSelect.value, 10); }
            toast('Kaart opgeslagen');
        } else {
            customCards.push({
                id: 'u' + Date.now().toString(36) + Math.floor(Math.random() * 1000),
                theme: themeSelect.value, niveau: parseInt(niveauSelect.value, 10), text: text
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
    drawBtn.addEventListener('click', draw);
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
        renderNiveaus();
        renderThemes();
        fillSelects();
        resetForm();
        rebuildDeck(false);
        if (window.hidePageLoader) window.hidePageLoader();

        currentUser = await getUser();
        if (currentUser) {
            await loadStore();
            renderMyList();
            rebuildDeck(true);
        }

        // Subtiele 'wie begint?' op basis van de actieve klas
        try {
            if (window.MTActiveClass) {
                await window.MTActiveClass.ready;
                var gid = window.MTActiveClass.getId();
                if (gid) {
                    await loadStudents(gid);
                    if (students.length) turnBar.style.display = '';
                }
            }
        } catch (e) { /* geen klas -> geen beurt-knop */ }
    })();
});

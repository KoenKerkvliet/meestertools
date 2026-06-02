/* ============================================
   MEESTERTOOLS - Routines
   Versie: v1.0.0

   Persoonlijke checklist om bij te houden welke klasroutines je hebt
   uitgelegd. Twee bijzonderheden:
   - De vinkjes starten elke dag weer leeg (een item is "vandaag gevinkt"
     als zijn checkedOn-datum gelijk is aan vandaag).
   - Achter elk item staat een teller: hoe vaak je die routine al hebt
     uitgelegd (telt op bij vinken, telt af als je dezelfde dag weer uitvinkt).

   Opslag per gebruiker in tool_settings ('routines'):
     { items: [ { id, label, count, checkedOn } ] }

   Sorteren (slepen + A-Z), toevoegen, aanpassen en verwijderen in de
   instellingen.
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    var TOOL_NAME = 'routines';

    // ---------- Standaardlijst (eerste keer) ----------
    var DEFAULTS = [
        'welkomstgroet', 'na binnenkomst ga je…', 'jassen en tassen', 'toiletgebruik',
        'huishoudelijke taken', 'huiswerk', 'tijdens het voorlezen', 'eten en drinken',
        'naar buiten gaan', 'na het buitenspelen', 'materialen van huis', 'mobiel in de klas',
        'schrijven in schriften', 'schrijven op wisbordjes', 'water drinken',
        'wisselen van groepjes', 'openen ramen', 'stemgebruik', 'naar het bureau gaan',
        'maatjesrij/brandrij', 'leerplein', 'naar de gym/in kleedkamer', 'materialen',
        'kwijtraken spullen', 'naar huis gaan', 'stilte-teken', 'stoplicht',
        'vraagteken-blokje', 'ICT-gedrag'
    ];

    // ---------- State ----------
    var currentUser = null;
    var items = [];
    var loaded = false;

    var $ = function (id) { return document.getElementById(id); };
    var dateEl = $('rtDate');
    var listEl = $('rtList');
    var emptyEl = $('rtEmpty');
    var progressFill = $('rtProgressFill');
    var progressText = $('rtProgressText');
    var toastEl = $('rtToast');

    var btnSettings = $('rtBtnSettings');
    var settingsModal = $('rtSettingsModal');
    var settingsClose = $('rtSettingsClose');
    var settingsDone = $('rtSettingsDone');
    var editList = $('rtEditList');
    var newItemInput = $('rtNewItem');
    var addBtn = $('rtAddBtn');
    var sortAzBtn = $('rtSortAz');

    // ---------- Helpers ----------
    function todayStr() {
        var d = new Date();
        var m = String(d.getMonth() + 1).padStart(2, '0');
        var day = String(d.getDate()).padStart(2, '0');
        return d.getFullYear() + '-' + m + '-' + day;
    }
    function uid() {
        return 'r' + Date.now().toString(36) + Math.floor(Math.random() * 1000).toString(36);
    }
    function esc(s) {
        var div = document.createElement('div');
        div.textContent = s == null ? '' : s;
        return div.innerHTML;
    }
    function isCheckedToday(it) { return it.checkedOn === todayStr(); }

    function toast(msg) {
        toastEl.textContent = msg;
        toastEl.classList.add('visible');
        clearTimeout(toast._t);
        toast._t = setTimeout(function () { toastEl.classList.remove('visible'); }, 2200);
    }

    // ---------- Supabase ----------
    async function getUser() {
        var s = await supabase.auth.getSession();
        return (s.data.session && s.data.session.user) || null;
    }
    async function loadStore() {
        var res = await supabase.from('tool_settings').select('settings')
            .eq('user_id', currentUser.id).eq('tool_name', TOOL_NAME).maybeSingle();
        var settings = (res.data && res.data.settings) ? res.data.settings : null;
        if (settings && Array.isArray(settings.items)) {
            items = settings.items.map(function (it) {
                return { id: it.id || uid(), label: String(it.label || ''), count: it.count || 0, checkedOn: it.checkedOn || '' };
            });
        } else {
            // Eerste keer: standaardlijst opbouwen
            items = DEFAULTS.map(function (label) {
                return { id: uid(), label: label, count: 0, checkedOn: '' };
            });
        }
        loaded = true;
    }
    function persist() {
        if (!currentUser) return;
        supabase.from('tool_settings').upsert({
            user_id: currentUser.id, tool_name: TOOL_NAME,
            settings: { items: items },
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,tool_name' }).then(function (res) {
            if (res.error) console.error('routines opslaan:', res.error.message);
        });
    }

    // ---------- Checklist renderen ----------
    function itemHtml(it) {
        var checked = isCheckedToday(it);
        var badge = (it.count > 0)
            ? '<span class="rt-count" title="' + it.count + ' keer uitgelegd">' + it.count + '</span>'
            : '';
        return '<button type="button" class="rt-item' + (checked ? ' is-checked' : '') + '" ' +
            'data-id="' + it.id + '" aria-pressed="' + (checked ? 'true' : 'false') + '">' +
                '<span class="rt-check"></span>' +
                '<span class="rt-label">' + esc(it.label) + '</span>' +
                badge +
            '</button>';
    }

    function renderList() {
        if (!items.length) {
            listEl.innerHTML = '';
            listEl.style.display = 'none';
            emptyEl.style.display = '';
        } else {
            emptyEl.style.display = 'none';
            listEl.style.display = '';
            listEl.innerHTML = items.map(itemHtml).join('');
        }
        updateProgress();
    }

    function updateProgress() {
        var done = items.filter(isCheckedToday).length;
        var total = items.length;
        var pct = total ? Math.round((done / total) * 100) : 0;
        progressFill.style.width = pct + '%';
        progressText.textContent = done + ' van ' + total + ' vandaag uitgelegd';
    }

    function toggle(id) {
        var it = items.find(function (x) { return x.id === id; });
        if (!it) return;
        if (isCheckedToday(it)) {
            it.checkedOn = '';
            it.count = Math.max(0, (it.count || 0) - 1);
        } else {
            it.checkedOn = todayStr();
            it.count = (it.count || 0) + 1;
        }
        // Alleen het betreffende item bijwerken (zodat de vink-animatie soepel is)
        var el = listEl.querySelector('.rt-item[data-id="' + id + '"]');
        if (el) {
            var checked = isCheckedToday(it);
            el.classList.toggle('is-checked', checked);
            el.setAttribute('aria-pressed', checked ? 'true' : 'false');
            var badge = el.querySelector('.rt-count');
            if (it.count > 0) {
                if (!badge) {
                    badge = document.createElement('span');
                    badge.className = 'rt-count';
                    el.appendChild(badge);
                }
                badge.textContent = it.count;
                badge.title = it.count + ' keer uitgelegd';
            } else if (badge) {
                badge.remove();
            }
        }
        updateProgress();
        persist();
    }

    listEl.addEventListener('click', function (e) {
        var btn = e.target.closest('.rt-item');
        if (btn) toggle(btn.getAttribute('data-id'));
    });

    // ---------- Instellingen: beheren ----------
    function editRowHtml(it) {
        var badge = (it.count > 0) ? '<span class="rt-edit-count" title="' + it.count + ' keer uitgelegd">' + it.count + '&times;</span>' : '';
        return '<div class="rt-edit-row" data-id="' + it.id + '">' +
            '<span class="rt-grip" draggable="true" title="Sleep om te sorteren">&#8942;&#8942;</span>' +
            '<input type="text" class="rt-edit-input rt-text" maxlength="60" value="' + esc(it.label) + '">' +
            badge +
            '<button type="button" class="rt-edit-del" title="Verwijderen">&#128465;&#65039;</button>' +
        '</div>';
    }
    function renderEditList() {
        editList.innerHTML = items.map(editRowHtml).join('');
    }

    // label aanpassen
    editList.addEventListener('input', function (e) {
        var input = e.target.closest('.rt-edit-input');
        if (!input) return;
        var row = input.closest('.rt-edit-row');
        var it = items.find(function (x) { return x.id === row.getAttribute('data-id'); });
        if (it) it.label = input.value;
    });
    editList.addEventListener('change', function (e) {
        if (e.target.closest('.rt-edit-input')) persist();
    });
    // verwijderen
    editList.addEventListener('click', function (e) {
        var del = e.target.closest('.rt-edit-del');
        if (!del) return;
        var row = del.closest('.rt-edit-row');
        var id = row.getAttribute('data-id');
        items = items.filter(function (x) { return x.id !== id; });
        renderEditList();
        persist();
    });

    // toevoegen
    function addItem() {
        var label = newItemInput.value.trim();
        if (!label) { newItemInput.focus(); return; }
        items.push({ id: uid(), label: label, count: 0, checkedOn: '' });
        newItemInput.value = '';
        renderEditList();
        persist();
        newItemInput.focus();
        editList.scrollTop = editList.scrollHeight;
    }
    addBtn.addEventListener('click', addItem);
    newItemInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); addItem(); }
    });

    // A-Z sorteren
    sortAzBtn.addEventListener('click', function () {
        items.sort(function (a, b) { return a.label.localeCompare(b.label, 'nl', { sensitivity: 'base' }); });
        renderEditList();
        persist();
        toast('Gesorteerd op alfabet');
    });

    // ---------- Slepen om te sorteren ----------
    var dragId = null;
    editList.addEventListener('dragstart', function (e) {
        var grip = e.target.closest('.rt-grip');
        if (!grip) return;
        var row = grip.closest('.rt-edit-row');
        dragId = row.getAttribute('data-id');
        row.classList.add('rt-dragging');
        try {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', dragId);
            e.dataTransfer.setDragImage(row, 20, 20);
        } catch (err) {}
    });
    editList.addEventListener('dragend', function () {
        var d = editList.querySelector('.rt-dragging');
        if (d) d.classList.remove('rt-dragging');
        dragId = null;
    });
    function rowAfter(y) {
        var rows = Array.prototype.slice.call(editList.querySelectorAll('.rt-edit-row:not(.rt-dragging)'));
        var closest = null, closestOffset = -Infinity;
        rows.forEach(function (row) {
            var box = row.getBoundingClientRect();
            var offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closestOffset) { closestOffset = offset; closest = row; }
        });
        return closest;
    }
    editList.addEventListener('dragover', function (e) {
        if (!dragId) return;
        e.preventDefault();
        var dragging = editList.querySelector('.rt-dragging');
        if (!dragging) return;
        var after = rowAfter(e.clientY);
        if (after == null) editList.appendChild(dragging);
        else editList.insertBefore(dragging, after);
    });
    editList.addEventListener('drop', function (e) {
        if (!dragId) return;
        e.preventDefault();
        // Nieuwe volgorde uit de DOM lezen
        var order = Array.prototype.map.call(editList.querySelectorAll('.rt-edit-row'),
            function (r) { return r.getAttribute('data-id'); });
        items.sort(function (a, b) { return order.indexOf(a.id) - order.indexOf(b.id); });
        persist();
    });

    // ---------- Modal open/dicht ----------
    function openSettings() { renderEditList(); settingsModal.classList.add('active'); }
    function closeSettings() {
        settingsModal.classList.remove('active');
        renderList();   // hoofd-lijst bijwerken met nieuwe volgorde/teksten
    }
    btnSettings.addEventListener('click', openSettings);
    settingsClose.addEventListener('click', closeSettings);
    settingsDone.addEventListener('click', closeSettings);
    settingsModal.addEventListener('click', function (e) { if (e.target === settingsModal) closeSettings(); });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && settingsModal.classList.contains('active')) closeSettings();
    });

    // ---------- Init ----------
    (async function init() {
        dateEl.textContent = new Date().toLocaleDateString('nl-NL',
            { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

        currentUser = await getUser();
        if (currentUser) {
            await loadStore();
        } else {
            items = DEFAULTS.map(function (label) { return { id: uid(), label: label, count: 0, checkedOn: '' }; });
        }
        renderList();
        if (window.hidePageLoader) window.hidePageLoader();
    })();
});

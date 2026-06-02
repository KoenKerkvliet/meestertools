/* ============================================
   MEESTERTOOLS - Huiswerk
   Versie: v1.0.0

   Houd per leerling bij hoe vaak het huiswerk niet is gemaakt.
   - Leerlingen als kaartjes (actieve klas, monster-avatars).
   - Knop "Controleren" -> selecteer leerlingen -> knop wordt "Vergeten" ->
     de aangeklikte leerlingen krijgen +1 op hun teller (en een logregel).
   - Bij het drempelaantal (standaard 3) is het "prijs": de leerling draait
     aan de prijzenknop (de prijzen flitsen voorbij en eentje blijft staan).
     Bij 2+ winnaars komen ze om de beurt aan de knop.
   - Logboek: welke leerling wanneer het huiswerk niet had (en welke prijs).

   Opslag per gebruiker in tool_settings ('huiswerk'):
     { prizes:[...], threshold:3, byGroup:{ [groupId]: { counts:{}, log:[] } } }
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    var TOOL_NAME = 'huiswerk';
    var BASE = '../';
    var MONSTER_COUNT = 36;

    var DEFAULT_PRIZES = [
        'Het bord schoonmaken',
        'De prullenbakken legen',
        'De klas vegen',
        'De planten water geven',
        'De boekenkast opruimen',
        'De stoelen op de tafels zetten',
        'De gangkast netjes maken',
        'De whiteboard-stiften sorteren'
    ];

    // ---------- State ----------
    var currentUser = null;
    var groups = [];
    var selectedGroupId = '';
    var students = [];
    var monsterByStudentId = {};

    var settings = { prizes: [], threshold: 3, byGroup: {} };

    var selectMode = false;
    var selected = {};            // { studentId: true }

    // prijzen-overlay
    var queue = [];               // leerlingen die prijs hebben
    var qIndex = 0;
    var spinning = false;

    // ---------- DOM ----------
    var $ = function (id) { return document.getElementById(id); };
    var noGroup = $('hwNoGroup');
    var main = $('hwMain');
    var statusEl = $('hwStatus');
    var grid = $('hwGrid');
    var btnCheck = $('hwBtnCheck');
    var btnCancel = $('hwBtnCancel');
    var btnLog = $('hwBtnLog');
    var btnSettings = $('hwBtnSettings');
    var toastEl = $('hwToast');

    // prize overlay
    var prizeOverlay = $('hwPrize');
    var prizeClose = $('hwPrizeClose');
    var queueEl = $('hwQueue');
    var prizeSub = $('hwPrizeSub');
    var prizeName = $('hwPrizeName');
    var reelEl = $('hwReel');
    var spinBtn = $('hwSpin');
    var nextBtn = $('hwNext');

    // log
    var logModal = $('hwLogModal');
    var logList = $('hwLogList');
    var logClose = $('hwLogClose');
    var logDone = $('hwLogDone');
    var logClear = $('hwLogClear');

    // settings
    var settingsModal = $('hwSettingsModal');
    var settingsClose = $('hwSettingsClose');
    var settingsDone = $('hwSettingsDone');
    var prizeList = $('hwPrizeList');
    var newPrizeInput = $('hwNewPrize');
    var addPrizeBtn = $('hwAddPrize');
    var thresholdInput = $('hwThreshold');
    var resetCountsBtn = $('hwResetCounts');

    // ---------- Helpers ----------
    function esc(s) {
        var d = document.createElement('div');
        d.textContent = s == null ? '' : s;
        return d.innerHTML;
    }
    function studentName(s) {
        if (!s) return '?';
        return ((s.first_name || '') + ' ' + (s.last_name || '')).trim() || '?';
    }
    function firstName(s) { return (s && s.first_name) || studentName(s); }
    function toast(msg) {
        toastEl.textContent = msg;
        toastEl.classList.add('visible');
        clearTimeout(toast._t);
        toast._t = setTimeout(function () { toastEl.classList.remove('visible'); }, 2300);
    }

    function monsterHash(key) {
        key = String(key || '');
        var h = 0;
        for (var i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
        return h;
    }
    function assignMonsters(list) {
        var map = {}, used = {};
        (list || []).slice().sort(function (a, b) {
            var ai = String(a.id), bi = String(b.id);
            return ai < bi ? -1 : ai > bi ? 1 : 0;
        }).forEach(function (s) {
            var n = monsterHash(s.id) % MONSTER_COUNT, tries = 0;
            while (used[n] && tries < MONSTER_COUNT) { n = (n + 1) % MONSTER_COUNT; tries++; }
            used[n] = true;
            map[s.id] = n + 1;
        });
        return map;
    }
    function monsterForStudent(s) {
        var id = (s && s.id) || '';
        var n = monsterByStudentId[id] || ((monsterHash(id) % MONSTER_COUNT) + 1);
        return BASE + 'assets/avatars/monsters/monster-' + (n < 10 ? '0' + n : n) + '.png';
    }

    // ---------- Supabase ----------
    async function getUser() {
        var s = await supabase.auth.getSession();
        return (s.data.session && s.data.session.user) || null;
    }
    async function loadGroups() {
        var res = await supabase.from('groups').select('id, name')
            .eq('user_id', currentUser.id).eq('archived', false).order('name');
        groups = res.data || [];
    }
    async function loadStudents() {
        students = []; monsterByStudentId = {};
        if (!selectedGroupId) return;
        var res = await supabase.from('students').select('id, first_name, last_name, student_number')
            .eq('group_id', selectedGroupId).eq('archived', false).order('student_number');
        students = res.data || [];
        monsterByStudentId = assignMonsters(students);
    }
    async function loadStore() {
        var res = await supabase.from('tool_settings').select('settings')
            .eq('user_id', currentUser.id).eq('tool_name', TOOL_NAME).maybeSingle();
        var s = (res.data && res.data.settings) ? res.data.settings : {};
        settings.prizes = Array.isArray(s.prizes) ? s.prizes : DEFAULT_PRIZES.slice();
        settings.threshold = s.threshold && s.threshold > 0 ? s.threshold : 3;
        settings.byGroup = s.byGroup || {};
    }
    function persist() {
        if (!currentUser) return;
        supabase.from('tool_settings').upsert({
            user_id: currentUser.id, tool_name: TOOL_NAME,
            settings: settings,
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,tool_name' }).then(function (res) {
            if (res.error) console.error('huiswerk opslaan:', res.error.message);
        });
    }

    function gd() {
        if (!settings.byGroup[selectedGroupId]) settings.byGroup[selectedGroupId] = { counts: {}, log: [] };
        var g = settings.byGroup[selectedGroupId];
        if (!g.counts) g.counts = {};
        if (!g.log) g.log = [];
        return g;
    }
    function countFor(id) { return gd().counts[id] || 0; }

    // ---------- Render kaartjes ----------
    function cardHtml(s) {
        var c = countFor(s.id);
        var isPrize = c >= settings.threshold;
        var sel = selected[s.id];
        var lvl = c === 1 ? ' hw-c-green' : (c === 2 ? ' hw-c-orange' : ' hw-c-red');
        var badge = (c > 0)
            ? '<span class="hw-count' + lvl + '">' + c + '</span>'
            : '';
        return '<button type="button" class="hw-card' +
            (sel ? ' is-selected' : '') +
            (isPrize ? ' is-prize' : '') + '" data-id="' + s.id + '">' +
                '<img class="hw-monster" src="' + monsterForStudent(s) + '" alt="" loading="lazy">' +
                '<span class="hw-name">' + esc(firstName(s)) + '</span>' +
                badge +
            '</button>';
    }
    function renderGrid() {
        grid.innerHTML = students.map(cardHtml).join('');
    }
    function updateStatus() {
        if (selectMode) {
            var n = Object.keys(selected).length;
            statusEl.innerHTML = '<strong>Wie heeft het huiswerk niet gemaakt?</strong> ' +
                'Klik de leerlingen aan' + (n ? ' (' + n + ' geselecteerd)' : '') + ' en klik op <em>Vergeten</em>.';
        } else {
            var prizeCount = students.filter(function (s) { return countFor(s.id) >= settings.threshold; }).length;
            var base = students.length + ' leerlingen in deze klas.';
            statusEl.innerHTML = prizeCount
                ? base + ' <span class="hw-status-prize">&#127873; ' + prizeCount + ' met prijs &mdash; klik op de kaart om te draaien.</span>'
                : base + ' Klik op <em>Controleren</em> om af te vinken wie het vergat.';
        }
    }
    function render() {
        if (!selectedGroupId || !students.length) {
            noGroup.style.display = '';
            main.style.display = 'none';
            return;
        }
        noGroup.style.display = 'none';
        main.style.display = '';
        renderGrid();
        updateStatus();
    }

    // ---------- Controleren / Vergeten ----------
    function enterSelect() {
        selectMode = true;
        selected = {};
        btnCheck.innerHTML = '&#10060; Vergeten';
        btnCheck.classList.add('hw-btn-commit');
        btnCancel.style.display = '';
        document.body.classList.add('hw-selecting');
        renderGrid();
        updateStatus();
    }
    function exitSelect() {
        selectMode = false;
        selected = {};
        btnCheck.innerHTML = '&#9989; Controleren';
        btnCheck.classList.remove('hw-btn-commit');
        btnCancel.style.display = 'none';
        document.body.classList.remove('hw-selecting');
        renderGrid();
        updateStatus();
    }
    function commitForgotten() {
        var ids = Object.keys(selected);
        if (!ids.length) { exitSelect(); toast('Niemand geselecteerd'); return; }

        var g = gd();
        var now = new Date().toISOString();
        ids.forEach(function (id) {
            g.counts[id] = (g.counts[id] || 0) + 1;
            var s = students.find(function (x) { return x.id === id; });
            g.log.unshift({ t: now, name: studentName(s), type: 'vergeten', count: g.counts[id] });
        });
        persist();

        // winnaars bepalen (op of boven de drempel)
        var winners = ids
            .filter(function (id) { return (g.counts[id] || 0) >= settings.threshold; })
            .map(function (id) { return students.find(function (x) { return x.id === id; }); })
            .filter(Boolean);

        exitSelect();

        if (winners.length) openPrize(winners);
        else toast(ids.length + (ids.length === 1 ? ' leerling' : ' leerlingen') + ' genoteerd');
    }

    grid.addEventListener('click', function (e) {
        var card = e.target.closest('.hw-card');
        if (!card) return;
        var id = card.getAttribute('data-id');
        if (selectMode) {
            if (selected[id]) delete selected[id]; else selected[id] = true;
            card.classList.toggle('is-selected', !!selected[id]);
            updateStatus();
        } else if (countFor(id) >= settings.threshold) {
            var s = students.find(function (x) { return x.id === id; });
            if (s) openPrize([s]);
        }
    });

    btnCheck.addEventListener('click', function () {
        if (selectMode) commitForgotten();
        else enterSelect();
    });
    btnCancel.addEventListener('click', exitSelect);

    // ---------- Prijzen-overlay ----------
    function openPrize(winners) {
        queue = winners.slice();
        qIndex = 0;
        prizeOverlay.style.display = 'flex';
        document.body.classList.add('hw-prizing');
        renderPrizeStep();
    }
    function closePrize() {
        prizeOverlay.style.display = 'none';
        document.body.classList.remove('hw-prizing');
        spinning = false;
        render();
    }
    function renderPrizeStep() {
        var s = queue[qIndex];
        spinning = false;
        nextBtn.style.display = 'none';
        reelEl.classList.remove('is-final');
        reelEl.innerHTML = '&#127873;';

        // beurtindicator bij meerdere winnaars
        if (queue.length > 1) {
            queueEl.style.display = '';
            queueEl.innerHTML = queue.map(function (q, i) {
                return '<span class="hw-queue-name' + (i === qIndex ? ' is-current' : '') +
                    (i < qIndex ? ' is-done' : '') + '">' + esc(firstName(q)) + '</span>';
            }).join('');
            prizeSub.textContent = 'Aan de beurt (' + (qIndex + 1) + ' van ' + queue.length + ')';
        } else {
            queueEl.style.display = 'none';
            prizeSub.textContent = 'Prijs gewonnen voor het vergeten van het huiswerk';
        }
        prizeName.textContent = studentName(s);

        if (!settings.prizes.length) {
            spinBtn.disabled = true;
            spinBtn.innerHTML = 'Stel eerst prijzen in &#9881;&#65039;';
        } else {
            spinBtn.disabled = false;
            spinBtn.innerHTML = '&#127873; Kies je prijs';
        }
    }
    function spin() {
        if (spinning || !settings.prizes.length) return;
        spinning = true;
        spinBtn.disabled = true;

        var prizes = settings.prizes;
        var finalIdx = Math.floor(Math.random() * prizes.length);
        var ticks = 22 + Math.floor(Math.random() * prizes.length);
        var i = 0;

        function tick() {
            reelEl.textContent = prizes[(finalIdx + i) % prizes.length];
            i++;
            if (i < ticks) {
                var p = i / ticks;
                var delay = 45 + p * p * p * 260;   // langzaam uitlopen
                setTimeout(tick, delay);
            } else {
                reelEl.textContent = prizes[finalIdx];
                reelEl.classList.add('is-final');
                finishSpin(prizes[finalIdx]);
            }
        }
        tick();
    }
    function finishSpin(prize) {
        var s = queue[qIndex];
        var g = gd();
        g.log.unshift({ t: new Date().toISOString(), name: studentName(s), type: 'prijs', prize: prize });
        // Teller blijft staan: ook bij de 4e, 5e keer enz. is het opnieuw prijs.
        persist();
        spinning = false;
        nextBtn.style.display = '';
        nextBtn.innerHTML = (qIndex < queue.length - 1) ? 'Volgende &rarr;' : 'Klaar';
    }
    spinBtn.addEventListener('click', spin);
    nextBtn.addEventListener('click', function () {
        if (qIndex < queue.length - 1) { qIndex++; renderPrizeStep(); }
        else closePrize();
    });
    prizeClose.addEventListener('click', closePrize);

    // ---------- Logboek ----------
    function fmtTime(iso) {
        try {
            var d = new Date(iso);
            return d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' }) + ' &middot; ' +
                d.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
        } catch (e) { return ''; }
    }
    function renderLog() {
        var log = gd().log;
        if (!log.length) {
            logList.innerHTML = '<p class="hw-log-empty">Nog niets gelogd.</p>';
            return;
        }
        logList.innerHTML = log.map(function (e) {
            if (e.type === 'prijs') {
                return '<div class="hw-log-item hw-log-prize">' +
                    '<span class="hw-log-ic">&#127873;</span>' +
                    '<span class="hw-log-text"><strong>' + esc(e.name) + '</strong> draaide prijs: ' + esc(e.prize || '') + '</span>' +
                    '<span class="hw-log-time">' + fmtTime(e.t) + '</span>' +
                '</div>';
            }
            return '<div class="hw-log-item">' +
                '<span class="hw-log-ic">&#10060;</span>' +
                '<span class="hw-log-text"><strong>' + esc(e.name) + '</strong> huiswerk vergeten' +
                    (e.count ? ' <span class="hw-log-count">(' + e.count + 'e keer)</span>' : '') + '</span>' +
                '<span class="hw-log-time">' + fmtTime(e.t) + '</span>' +
            '</div>';
        }).join('');
    }
    function openLog() { renderLog(); logModal.classList.add('active'); }
    function closeLog() { logModal.classList.remove('active'); }
    btnLog.addEventListener('click', openLog);
    logClose.addEventListener('click', closeLog);
    logDone.addEventListener('click', closeLog);
    logModal.addEventListener('click', function (e) { if (e.target === logModal) closeLog(); });
    logClear.addEventListener('click', function () {
        if (!gd().log.length) return;
        if (!window.confirm('Het hele logboek van deze klas wissen?')) return;
        gd().log = [];
        persist();
        renderLog();
        toast('Logboek gewist');
    });

    // ---------- Instellingen: prijzen beheren ----------
    function prizeRowHtml(label, idx) {
        return '<div class="hw-edit-row" data-idx="' + idx + '">' +
            '<span class="hw-grip" draggable="true" title="Sleep om te sorteren">&#8942;&#8942;</span>' +
            '<input type="text" class="hw-edit-input hw-text" maxlength="60" value="' + esc(label) + '">' +
            '<button type="button" class="hw-edit-del" title="Verwijderen">&#128465;&#65039;</button>' +
        '</div>';
    }
    function renderPrizeList() {
        prizeList.innerHTML = settings.prizes.map(prizeRowHtml).join('');
    }
    prizeList.addEventListener('input', function (e) {
        var input = e.target.closest('.hw-edit-input');
        if (!input) return;
        var idx = parseInt(input.closest('.hw-edit-row').getAttribute('data-idx'), 10);
        if (!isNaN(idx)) settings.prizes[idx] = input.value;
    });
    prizeList.addEventListener('change', function (e) {
        if (e.target.closest('.hw-edit-input')) {
            settings.prizes = settings.prizes.map(function (p) { return String(p).trim(); }).filter(Boolean);
            persist();
            renderPrizeList();
        }
    });
    prizeList.addEventListener('click', function (e) {
        var del = e.target.closest('.hw-edit-del');
        if (!del) return;
        var idx = parseInt(del.closest('.hw-edit-row').getAttribute('data-idx'), 10);
        if (!isNaN(idx)) {
            settings.prizes.splice(idx, 1);
            renderPrizeList();
            persist();
        }
    });
    function addPrize() {
        var v = newPrizeInput.value.trim();
        if (!v) { newPrizeInput.focus(); return; }
        settings.prizes.push(v);
        newPrizeInput.value = '';
        renderPrizeList();
        persist();
        newPrizeInput.focus();
    }
    addPrizeBtn.addEventListener('click', addPrize);
    newPrizeInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); addPrize(); }
    });

    // slepen om te sorteren
    var dragIdx = null;
    prizeList.addEventListener('dragstart', function (e) {
        var grip = e.target.closest('.hw-grip');
        if (!grip) return;
        var row = grip.closest('.hw-edit-row');
        dragIdx = row.getAttribute('data-idx');
        row.classList.add('hw-dragging');
        try { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setDragImage(row, 20, 20); } catch (err) {}
    });
    prizeList.addEventListener('dragend', function () {
        var d = prizeList.querySelector('.hw-dragging');
        if (d) d.classList.remove('hw-dragging');
        dragIdx = null;
    });
    function rowAfter(y) {
        var rows = Array.prototype.slice.call(prizeList.querySelectorAll('.hw-edit-row:not(.hw-dragging)'));
        var closest = null, closestOffset = -Infinity;
        rows.forEach(function (row) {
            var box = row.getBoundingClientRect();
            var offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closestOffset) { closestOffset = offset; closest = row; }
        });
        return closest;
    }
    prizeList.addEventListener('dragover', function (e) {
        if (dragIdx === null) return;
        e.preventDefault();
        var dragging = prizeList.querySelector('.hw-dragging');
        if (!dragging) return;
        var after = rowAfter(e.clientY);
        if (after == null) prizeList.appendChild(dragging);
        else prizeList.insertBefore(dragging, after);
    });
    prizeList.addEventListener('drop', function (e) {
        if (dragIdx === null) return;
        e.preventDefault();
        var order = Array.prototype.map.call(prizeList.querySelectorAll('.hw-edit-row'),
            function (r) { return parseInt(r.getAttribute('data-idx'), 10); });
        settings.prizes = order.map(function (i) { return settings.prizes[i]; });
        renderPrizeList();   // data-idx opnieuw zetten
        persist();
    });

    // drempel
    thresholdInput.addEventListener('change', function () {
        var v = parseInt(thresholdInput.value, 10);
        if (isNaN(v) || v < 1) v = 1;
        if (v > 10) v = 10;
        thresholdInput.value = v;
        settings.threshold = v;
        persist();
        if (!settingsModal.classList.contains('active')) render();
    });

    // tellers resetten
    resetCountsBtn.addEventListener('click', function () {
        if (!window.confirm('Alle tellers van deze klas op 0 zetten? Het logboek blijft staan.')) return;
        gd().counts = {};
        persist();
        render();
        toast('Tellers op 0 gezet');
    });

    // ---------- Modal open/dicht ----------
    function openSettings() {
        renderPrizeList();
        thresholdInput.value = settings.threshold;
        settingsModal.classList.add('active');
    }
    function closeSettings() {
        settings.prizes = settings.prizes.map(function (p) { return String(p).trim(); }).filter(Boolean);
        persist();
        settingsModal.classList.remove('active');
        render();
    }
    btnSettings.addEventListener('click', openSettings);
    settingsClose.addEventListener('click', closeSettings);
    settingsDone.addEventListener('click', closeSettings);
    settingsModal.addEventListener('click', function (e) { if (e.target === settingsModal) closeSettings(); });

    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;
        if (settingsModal.classList.contains('active')) closeSettings();
        else if (logModal.classList.contains('active')) closeLog();
        else if (prizeOverlay.style.display !== 'none' && !spinning) closePrize();
        else if (selectMode) exitSelect();
    });

    // ---------- Init ----------
    (async function init() {
        currentUser = await getUser();
        if (!currentUser) { if (window.hidePageLoader) window.hidePageLoader(); return; }

        await loadGroups();
        try { await MTActiveClass.ready; } catch (e) {}
        selectedGroupId = (window.MTActiveClass ? MTActiveClass.resolveDefault('', groups) : '') || '';

        await loadStore();
        if (selectedGroupId) await loadStudents();

        render();
        if (window.hidePageLoader) window.hidePageLoader();
    })();
});

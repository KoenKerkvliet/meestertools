/* ============================================
   PLATTEGROND - JavaScript

   Klasopstelling voor het digibord. Drie layouts:
   - rijen      : rijen met X plekken naast elkaar (rijen passen zich aan de klas aan)
   - groepjes   : groepstafels geplaatst in een 4x4-grid
   - mix        : rijtafels én groepstafels door elkaar in het 4x4-grid

   Leerlingen van de actieve klas worden op de plekken gezet (automatisch op
   volgorde of gehusseld) en zijn handmatig te wisselen (tik-om-te-plaatsen).
   Opslag in tool_settings ('plattegrond') per klas. Presenteren + printen.
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {
    var TOOL_NAME = 'plattegrond';
    var BASE = '../';
    var MONSTER_COUNT = 36;
    var RIJ_SEATS = 2; // plekken per rijtafel in het grid (mix)

    // ---------- State ----------
    var currentUser = null;
    var groups = [];
    var students = [];
    var selectedGroupId = '';
    var store = { byGroup: {} };
    var layout = { type: 'rijen', columns: 3, perDesk: 2, rowsPerColumn: 5, tableSeats: 4, grid: emptyGrid() };
    var placement = [];          // [studentId|null, ...] per seat-index
    var selected = null;         // { kind:'pool', id } | { kind:'seat', index }
    var monsterByStudentId = {};
    var presentOpen = false;
    var editLayout = null;       // werk-kopie tijdens instellingen

    // ---------- DOM ----------
    var noGroup = document.getElementById('pgNoGroup');
    var main = document.getElementById('pgMain');
    var statusEl = document.getElementById('pgStatus');
    var hint = document.getElementById('pgHint');
    var poolEl = document.getElementById('pgPool');
    var poolCount = document.getElementById('pgPoolCount');
    var roomEl = document.getElementById('pgRoom');

    var btnFill = document.getElementById('pgBtnFill');
    var btnShuffle = document.getElementById('pgBtnShuffle');
    var btnClearSeats = document.getElementById('pgBtnClearSeats');
    var btnSettings = document.getElementById('pgBtnSettings');
    var btnSettings2 = document.getElementById('pgBtnSettings2');
    var btnPresent = document.getElementById('pgBtnPresent');
    var btnPrint = document.getElementById('pgBtnPrint');

    var settingsModal = document.getElementById('pgSettingsModal');
    var settingsClose = document.getElementById('pgSettingsClose');
    var settingsSave = document.getElementById('pgSettingsSave');
    var typeSeg = document.getElementById('pgTypeSeg');
    var setRijen = document.getElementById('pgSetRijen');
    var setGrid = document.getElementById('pgSetGrid');
    var columnsInput = document.getElementById('pgColumns');
    var perDeskInput = document.getElementById('pgPerDesk');
    var rowsPerColInput = document.getElementById('pgRowsPerCol');
    var tableSeatsInput = document.getElementById('pgTableSeats');
    var gridEditor = document.getElementById('pgGridEditor');
    var gridHint = document.getElementById('pgGridHint');

    var presentEl = document.getElementById('pgPresent');
    var presentClose = document.getElementById('pgPresentClose');
    var presentRoom = document.getElementById('pgPresentRoom');
    var toastEl = document.getElementById('pgToast');

    // ---------- Helpers ----------
    function emptyGrid() {
        var g = [];
        for (var r = 0; r < 4; r++) { g.push([null, null, null, null]); }
        return g;
    }
    function cloneGrid(g) { return g.map(function (row) { return row.slice(); }); }
    function escapeHtml(str) {
        var d = document.createElement('div');
        d.textContent = str == null ? '' : str;
        return d.innerHTML;
    }
    function studentName(s) { return s ? (((s.first_name || '') + ' ' + (s.last_name || '')).trim() || '?') : '?'; }
    function firstName(s) { return (s && (s.first_name || studentName(s))) || '?'; }
    function initials(s) {
        if (!s) return '?';
        var f = (s.first_name || '').charAt(0).toUpperCase();
        var l = (s.last_name || '').charAt(0).toUpperCase();
        return f + (l || '');
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
    function monsterUrl(s, abs) {
        var id = (s && s.id) || '';
        var n = monsterByStudentId[id] || ((monsterHash(id) % MONSTER_COUNT) + 1);
        var path = 'assets/avatars/monsters/monster-' + (n < 10 ? '0' + n : n) + '.png';
        return abs ? (location.origin + '/' + path) : (BASE + path);
    }
    function studentById(id) { return students.find(function (s) { return s.id === id; }); }
    function shuffle(arr) {
        var a = arr.slice();
        for (var i = a.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var t = a[i]; a[i] = a[j]; a[j] = t;
        }
        return a;
    }
    function toast(msg) {
        if (!toastEl) return;
        toastEl.innerHTML = msg;
        toastEl.classList.add('visible');
        clearTimeout(toast._t);
        toast._t = setTimeout(function () { toastEl.classList.remove('visible'); }, 2600);
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
        store = (res.data && res.data.settings) ? res.data.settings : {};
        if (!store.byGroup) store.byGroup = {};
    }
    function persist() {
        if (!store.byGroup) store.byGroup = {};
        if (selectedGroupId) {
            store.byGroup[selectedGroupId] = { layout: layout, placement: placement };
        }
        supabase.from('tool_settings').upsert({
            user_id: currentUser.id, tool_name: TOOL_NAME, settings: store,
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,tool_name' }).then(function (res) {
            if (res.error) console.error('plattegrond opslaan:', res.error.message);
        });
    }
    function restoreForGroup() {
        layout = { type: 'rijen', columns: 3, perDesk: 2, rowsPerColumn: 5, tableSeats: 4, grid: emptyGrid() };
        placement = [];
        var g = store.byGroup ? store.byGroup[selectedGroupId] : null;
        if (g && g.layout) {
            var L = g.layout;
            layout.type = (L.type === 'groepjes' || L.type === 'mix') ? L.type : 'rijen';
            layout.columns = clampInt(L.columns, 1, 8, 3);
            layout.perDesk = clampInt(L.perDesk, 1, 4, 2);
            layout.rowsPerColumn = clampInt(L.rowsPerColumn, 1, 8, 5);
            layout.tableSeats = clampInt(L.tableSeats, 2, 6, 4);
            layout.grid = (Array.isArray(L.grid) && L.grid.length === 4) ? L.grid.map(function (row) {
                return [0, 1, 2, 3].map(function (c) {
                    var v = row && row[c];
                    return (v === 'groep' || v === 'rij') ? v : null;
                });
            }) : emptyGrid();
        }
        var sc = computeSeats().seatCount;
        var prev = (g && Array.isArray(g.placement)) ? g.placement : [];
        var valid = {};
        students.forEach(function (s) { valid[s.id] = true; });
        placement = [];
        for (var i = 0; i < sc; i++) {
            var sid = prev[i];
            placement.push(valid[sid] ? sid : null);
        }
        // dubbele plaatsingen voorkomen (na klaswijziging)
        var seen = {};
        for (var k = 0; k < placement.length; k++) {
            if (placement[k] && seen[placement[k]]) placement[k] = null;
            else if (placement[k]) seen[placement[k]] = true;
        }
    }
    function clampInt(v, min, max, def) {
        v = parseInt(v, 10);
        if (isNaN(v)) return def;
        return Math.max(min, Math.min(max, v));
    }

    // ---------- Seat-berekening ----------
    function computeSeats() {
        if (layout.type === 'rijen') {
            var cols = clampInt(layout.columns, 1, 8, 3);
            var perDesk = clampInt(layout.perDesk, 1, 4, 2);
            var rpc = clampInt(layout.rowsPerColumn, 1, 8, 5);
            return { kind: 'columns', columns: cols, perDesk: perDesk, rowsPerColumn: rpc, seatCount: cols * rpc * perDesk };
        }
        var cells = [], idx = 0;
        for (var r = 0; r < 4; r++) {
            for (var c = 0; c < 4; c++) {
                var t = layout.grid[r][c];
                if (t) {
                    var seatsN = t === 'groep' ? clampInt(layout.tableSeats, 2, 6, 4) : RIJ_SEATS;
                    cells.push({ r: r, c: c, type: t, start: idx, seats: seatsN });
                    idx += seatsN;
                }
            }
        }
        return { kind: 'grid', cells: cells, seatCount: idx };
    }

    function placedCount() {
        return placement.filter(function (x) { return !!x; }).length;
    }
    function poolStudents() {
        var inSeat = {};
        placement.forEach(function (id) { if (id) inSeat[id] = true; });
        return students.filter(function (s) { return !inSeat[s.id]; });
    }

    // ---------- Acties ----------
    function ensurePlacementSize() {
        var sc = computeSeats().seatCount;
        if (placement.length > sc) placement = placement.slice(0, sc);
        while (placement.length < sc) placement.push(null);
    }
    function autoFill(order) {
        ensurePlacementSize();
        var sc = placement.length;
        for (var i = 0; i < sc; i++) placement[i] = order[i] ? order[i].id : null;
        selected = null;
        persist(); render();
    }
    function fillInOrder() {
        if (!students.length) { toast('Geen leerlingen in deze klas.'); return; }
        autoFill(students.slice());
    }
    function shuffleFill() {
        if (!students.length) { toast('Geen leerlingen in deze klas.'); return; }
        autoFill(shuffle(students));
    }
    function clearSeats() {
        if (!placedCount()) return;
        for (var i = 0; i < placement.length; i++) placement[i] = null;
        selected = null;
        persist(); render();
    }
    function pickPool(id) {
        selected = (selected && selected.kind === 'pool' && selected.id === id) ? null : { kind: 'pool', id: id };
        render();
    }
    function clickSeat(index) {
        if (selected) {
            if (selected.kind === 'pool') {
                placement[index] = selected.id; // verdrongen leerling wordt vanzelf 'niet geplaatst'
            } else if (selected.kind === 'seat') {
                var t = placement[selected.index];
                placement[selected.index] = placement[index];
                placement[index] = t;
            }
            selected = null;
            persist(); render();
            return;
        }
        // niets geselecteerd: alleen een bezette plek kun je oppakken
        if (placement[index]) { selected = { kind: 'seat', index: index }; render(); }
    }
    function unplaceSelected() {
        if (selected && selected.kind === 'seat') {
            placement[selected.index] = null;
            selected = null;
            persist(); render();
        }
    }

    // ---------- Render ----------
    function seatHtml(index, opts) {
        opts = opts || {};
        var sid = placement[index];
        var s = sid ? studentById(sid) : null;
        var selCls = (!opts.forPrint && selected && selected.kind === 'seat' && selected.index === index) ? ' is-selected' : '';
        var dataAttr = opts.interactive ? ' data-seat="' + index + '"' : '';
        if (s) {
            var src = opts.forPrint ? monsterUrl(s, true) : monsterUrl(s, false);
            return '<div class="pg-seat is-occupied' + selCls + '"' + dataAttr + '>' +
                '<img class="pg-seat-monster" src="' + src + '" alt="" ' +
                    'onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">' +
                '<span class="pg-seat-initials">' + escapeHtml(initials(s)) + '</span>' +
                '<span class="pg-seat-name">' + escapeHtml(firstName(s)) + '</span>' +
                '</div>';
        }
        var plus = opts.interactive ? '<span class="pg-seat-plus">+</span>' : '';
        return '<div class="pg-seat is-empty"' + dataAttr + '>' + plus + '</div>';
    }

    function roomHtml(opts) {
        opts = opts || {};
        var info = computeSeats();
        if (info.seatCount === 0) {
            return '<div class="pg-room-empty">Nog geen plekken. Open <strong>Opstelling</strong> en plaats tafels in het grid.</div>';
        }
        if (info.kind === 'columns') {
            var html = '<div class="pg-cols">';
            var idx = 0;
            for (var col = 0; col < info.columns; col++) {
                html += '<div class="pg-col">';
                for (var row = 0; row < info.rowsPerColumn; row++) {
                    html += '<div class="pg-desk">';
                    for (var d = 0; d < info.perDesk; d++) { html += seatHtml(idx, opts); idx++; }
                    html += '</div>';
                }
                html += '</div>';
            }
            html += '</div>';
            return html;
        }
        // grid (groepjes / mix): 4x4
        var byPos = {};
        info.cells.forEach(function (cell) { byPos[cell.r + '-' + cell.c] = cell; });
        var g = '<div class="pg-grid-room">';
        for (var rr = 0; rr < 4; rr++) {
            for (var cc = 0; cc < 4; cc++) {
                var cell = byPos[rr + '-' + cc];
                if (!cell) { g += '<div class="pg-cell-empty"></div>'; continue; }
                var seatsHtml = '';
                for (var i = 0; i < cell.seats; i++) seatsHtml += seatHtml(cell.start + i, opts);
                g += '<div class="pg-table pg-table-' + cell.type + '">' + seatsHtml + '</div>';
            }
        }
        g += '</div>';
        return g;
    }

    function chipHtml(s) {
        var sel = (selected && selected.kind === 'pool' && selected.id === s.id) ? ' is-selected' : '';
        return '<div class="pg-chip' + sel + '" data-pick="' + s.id + '">' +
            '<img class="pg-chip-monster" src="' + monsterUrl(s, false) + '" alt="" ' +
                'onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">' +
            '<span class="pg-chip-initials">' + escapeHtml(initials(s)) + '</span>' +
            '<span class="pg-chip-name">' + escapeHtml(firstName(s)) + '</span>' +
            '</div>';
    }

    function render() {
        if (!selectedGroupId) { noGroup.style.display = ''; main.style.display = 'none'; return; }
        noGroup.style.display = 'none'; main.style.display = '';

        ensurePlacementSize();
        var info = computeSeats();

        statusEl.textContent = placedCount() + ' van ' + students.length + ' geplaatst · ' + info.seatCount + ' plekken';

        if (selected) {
            var who = selected.kind === 'pool' ? firstName(studentById(selected.id)) : firstName(studentById(placement[selected.index]));
            hint.innerHTML = '<strong>' + escapeHtml(who) + '</strong> opgepakt — tik op een plek om te zetten of te wisselen' +
                (selected.kind === 'seat' ? ', of tik op "Nog niet geplaatst" om weg te halen.' : '.');
        } else {
            hint.textContent = 'Tip: tik op een leerling en daarna op een plek. Tik op twee plekken om ze te wisselen.';
        }

        var pool = poolStudents();
        poolCount.textContent = pool.length;
        poolEl.classList.toggle('is-droptarget', !!(selected && selected.kind === 'seat'));
        poolEl.innerHTML = pool.length
            ? pool.map(chipHtml).join('')
            : '<p class="pg-pool-empty">Iedereen heeft een plek 🎉</p>';

        roomEl.innerHTML = roomHtml({ interactive: true });

        if (presentOpen) presentRoom.innerHTML = roomHtml({});
    }

    // ---------- Instellingen ----------
    function openSettings() {
        editLayout = { type: layout.type, columns: layout.columns, perDesk: layout.perDesk, rowsPerColumn: layout.rowsPerColumn, tableSeats: layout.tableSeats, grid: cloneGrid(layout.grid) };
        columnsInput.value = clampInt(layout.columns, 1, 8, 3);
        perDeskInput.value = clampInt(layout.perDesk, 1, 4, 2);
        rowsPerColInput.value = clampInt(layout.rowsPerColumn, 1, 8, 5);
        tableSeatsInput.value = editLayout.tableSeats;
        setSegActive(editLayout.type);
        renderGridEditor();
        settingsModal.classList.add('active');
    }
    function closeSettings() { settingsModal.classList.remove('active'); }
    function setSegActive(type) {
        editLayout.type = type;
        typeSeg.querySelectorAll('button').forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-type') === type); });
        setRijen.style.display = type === 'rijen' ? '' : 'none';
        setGrid.style.display = type === 'rijen' ? 'none' : '';
        if (type !== 'rijen') {
            gridHint.textContent = type === 'groepjes'
                ? 'Tik op een vak om er een groepstafel neer te zetten (of weg te halen).'
                : 'Tik op een vak om te wisselen: leeg → groepstafel → rijtje → leeg.';
            renderGridEditor();
        }
    }
    function renderGridEditor() {
        var html = '';
        for (var r = 0; r < 4; r++) {
            for (var c = 0; c < 4; c++) {
                var t = editLayout.grid[r][c];
                var label = t === 'groep' ? '&#9783;' : (t === 'rij' ? '&#9776;' : '');
                var cls = 'pg-ge-cell' + (t ? ' pg-ge-' + t : '');
                html += '<button type="button" class="' + cls + '" data-r="' + r + '" data-c="' + c + '">' + label + '</button>';
            }
        }
        gridEditor.innerHTML = html;
    }
    typeSeg.addEventListener('click', function (e) {
        var b = e.target.closest('button[data-type]');
        if (b) setSegActive(b.getAttribute('data-type'));
    });
    gridEditor.addEventListener('click', function (e) {
        var cell = e.target.closest('.pg-ge-cell');
        if (!cell) return;
        var r = parseInt(cell.getAttribute('data-r'), 10);
        var c = parseInt(cell.getAttribute('data-c'), 10);
        var cur = editLayout.grid[r][c];
        if (editLayout.type === 'groepjes') {
            editLayout.grid[r][c] = cur === 'groep' ? null : 'groep';
        } else { // mix: cycle
            editLayout.grid[r][c] = cur === null ? 'groep' : (cur === 'groep' ? 'rij' : null);
        }
        renderGridEditor();
    });
    function saveSettings() {
        editLayout.columns = clampInt(columnsInput.value, 1, 8, 3);
        editLayout.perDesk = clampInt(perDeskInput.value, 1, 4, 2);
        editLayout.rowsPerColumn = clampInt(rowsPerColInput.value, 1, 8, 5);
        editLayout.tableSeats = clampInt(tableSeatsInput.value, 2, 6, 4);
        layout = { type: editLayout.type, columns: editLayout.columns, perDesk: editLayout.perDesk, rowsPerColumn: editLayout.rowsPerColumn, tableSeats: editLayout.tableSeats, grid: cloneGrid(editLayout.grid) };
        ensurePlacementSize();
        selected = null;
        persist();
        closeSettings();
        render();
    }

    // ---------- Presenteren ----------
    function openPresent() {
        if (computeSeats().seatCount === 0) { toast('Stel eerst een opstelling in.'); return; }
        presentOpen = true;
        presentRoom.innerHTML = roomHtml({});
        presentEl.style.display = '';
        document.body.classList.add('pg-presenting');
    }
    function closePresent() {
        presentOpen = false;
        presentEl.style.display = 'none';
        document.body.classList.remove('pg-presenting');
    }

    // ---------- Printen ----------
    function printSheet() {
        if (computeSeats().seatCount === 0) { toast('Stel eerst een opstelling in.'); return; }
        var groupName = '';
        var g = groups.find(function (x) { return x.id === selectedGroupId; });
        if (g) groupName = g.name;

        var room = roomHtml({ forPrint: true });
        var css =
            '*{margin:0;padding:0;box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact;}' +
            'body{font-family:"Segoe UI",system-ui,Arial,sans-serif;color:#2D3436;padding:18px;}' +
            'h1{font-size:22px;color:#6C63FF;}' +
            '.sub{color:#777;font-size:12px;margin:2px 0 14px;}' +
            '.pg-front{background:#EEEDF8;color:#6C63FF;text-align:center;font-weight:700;font-size:13px;border-radius:8px;padding:6px;margin-bottom:14px;}' +
            '.pg-cols{display:flex;gap:24px;justify-content:center;align-items:flex-start;}' +
            '.pg-col{display:flex;flex-direction:column;gap:10px;}' +
            '.pg-desk{display:flex;gap:6px;}' +
            '.pg-grid-room{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;}' +
            '.pg-cell-empty{min-height:10px;}' +
            '.pg-table{display:grid;grid-template-columns:1fr 1fr;gap:6px;border:1px solid #E5E3F2;border-radius:12px;padding:8px;background:#FAFAFE;}' +
            '.pg-table-rij{grid-template-columns:repeat(2,1fr);}' +
            '.pg-seat{border:1px solid #E5E3F2;border-radius:10px;padding:6px 4px;display:flex;flex-direction:column;align-items:center;gap:2px;min-width:74px;background:#fff;}' +
            '.pg-seat.is-empty{background:#F6F6FB;min-height:60px;}' +
            '.pg-seat-monster{width:34px;height:34px;object-fit:contain;}' +
            '.pg-seat-initials{display:none;}' +
            '.pg-seat-name{font-size:12px;font-weight:600;text-align:center;}' +
            '.pg-seat-plus{display:none;}' +
            '@page{margin:12mm;}';

        var html = '<!DOCTYPE html><html lang="nl"><head><meta charset="UTF-8">' +
            '<title>Plattegrond' + (groupName ? ' — ' + escapeHtml(groupName) : '') + '</title><style>' + css + '</style></head><body>' +
            '<h1>Plattegrond</h1><div class="sub">' + (groupName ? escapeHtml(groupName) + ' · ' : '') + 'Meestertools</div>' +
            room +
            '<div class="pg-front" style="margin:14px 0 0;">Voorkant · digibord</div>' +
            '<script>window.onload=function(){setTimeout(function(){window.print();},400);};<\/script>' +
            '</body></html>';
        var w = window.open('', '_blank');
        if (!w) { toast('Sta pop-ups toe om te kunnen printen.'); return; }
        w.document.open(); w.document.write(html); w.document.close();
    }

    // ---------- Events ----------
    main.addEventListener('click', function (e) {
        var seat = e.target.closest('[data-seat]');
        if (seat) { clickSeat(parseInt(seat.getAttribute('data-seat'), 10)); return; }
        var chip = e.target.closest('[data-pick]');
        if (chip) { pickPool(chip.getAttribute('data-pick')); return; }
        // klik op de pool-achtergrond met een opgepakte plek -> weghalen
        if (selected && selected.kind === 'seat' && e.target.closest('#pgPoolSection')) { unplaceSelected(); }
    });

    btnFill.addEventListener('click', fillInOrder);
    btnShuffle.addEventListener('click', shuffleFill);
    btnClearSeats.addEventListener('click', clearSeats);
    btnSettings.addEventListener('click', openSettings);
    btnSettings2.addEventListener('click', openSettings);
    settingsClose.addEventListener('click', closeSettings);
    settingsSave.addEventListener('click', saveSettings);
    settingsModal.addEventListener('click', function (e) { if (e.target === settingsModal) closeSettings(); });
    btnPresent.addEventListener('click', openPresent);
    presentClose.addEventListener('click', closePresent);
    btnPrint.addEventListener('click', printSheet);
    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;
        if (presentOpen) { closePresent(); return; }
        if (settingsModal.classList.contains('active')) { closeSettings(); return; }
        if (selected) { selected = null; render(); }
    });

    // ---------- Init ----------
    async function init() {
        currentUser = await getUser();
        if (!currentUser) return;

        await loadStore();
        await loadGroups();
        try { await MTActiveClass.ready; } catch (e) {}
        selectedGroupId = MTActiveClass.resolveDefault('', groups);

        if (selectedGroupId) {
            await loadStudents();
            restoreForGroup();
        }
        render();
        if (window.hidePageLoader) window.hidePageLoader();
    }

    init();
});

/* ============================================
   ROLVERDELER - JavaScript

   Maakt groepjes (handmatig + snel willekeurig + opslaan/hergebruiken)
   en verdeelt rollen (willekeurig met 1 klik, daarna handmatig bij te
   stellen). Werkt op de globale actieve klas (MTActiveClass).

   Opslag in tool_settings ('rolverdeler'):
   {
     roles: [{id, icon, label, desc}],
     byGroup: { [groupId]: {
        work: { groups: [[studentId,...], ...], assignments: { studentId: roleId } },
        sets: [{ id, name, groups: [[studentId,...], ...] }]
     } }
   }
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {
    var TOOL_NAME = 'rolverdeler';
    var BASE = '../';
    var MONSTER_COUNT = 36;

    var DEFAULT_ROLES = [
        { icon: '🗣️', label: 'Voorzitter', desc: 'Leidt het overleg en zorgt dat iedereen meedoet.' },
        { icon: '⏱️', label: 'Tijdbewaker', desc: 'Houdt de tijd in de gaten.' },
        { icon: '✏️', label: 'Schrijver', desc: 'Schrijft de ideeën en antwoorden op.' },
        { icon: '📦', label: 'Materiaalbaas', desc: 'Haalt en regelt de spullen.' },
        { icon: '📢', label: 'Woordvoerder', desc: 'Vertelt straks wat het groepje heeft bedacht.' }
    ];

    // ---------- State ----------
    var currentUser = null;
    var groups = [];
    var students = [];
    var selectedGroupId = '';
    var store = { roles: [], byGroup: {} };  // volledige tool_settings-inhoud
    var roles = [];
    var workGroups = [];                       // [[studentId,...], ...]
    var assignments = {};                      // { studentId: roleId }
    var sets = [];                             // [{id,name,groups}]
    var selectedStudentId = '';                // tik-om-te-verplaatsen
    var monsterByStudentId = {};
    var presentOpen = false;
    var editingRoleId = null;

    // ---------- DOM ----------
    var noGroup = document.getElementById('rvNoGroup');
    var main = document.getElementById('rvMain');
    var splitMethod = document.getElementById('rvSplitMethod');
    var splitNumber = document.getElementById('rvSplitNumber');
    var btnRandom = document.getElementById('rvBtnRandom');
    var btnAddGroup = document.getElementById('rvBtnAddGroup');
    var btnAssignRoles = document.getElementById('rvBtnAssignRoles');
    var btnClear = document.getElementById('rvBtnClear');
    var btnSaveSet = document.getElementById('rvBtnSaveSet');
    var setSelect = document.getElementById('rvSetSelect');
    var btnDeleteSet = document.getElementById('rvBtnDeleteSet');
    var btnPresent = document.getElementById('rvBtnPresent');
    var btnPrint = document.getElementById('rvBtnPrint');
    var hint = document.getElementById('rvHint');
    var poolEl = document.getElementById('rvPool');
    var poolCount = document.getElementById('rvPoolCount');
    var groupsEl = document.getElementById('rvGroups');

    var btnSettings = document.getElementById('rvBtnSettings');
    var settingsModal = document.getElementById('rvSettingsModal');
    var settingsClose = document.getElementById('rvSettingsClose');
    var settingsSave = document.getElementById('rvSettingsSave');
    var rolesEdit = document.getElementById('rvRolesEdit');
    var btnAddRole = document.getElementById('rvBtnAddRole');

    var saveModal = document.getElementById('rvSaveModal');
    var saveClose = document.getElementById('rvSaveClose');
    var saveCancel = document.getElementById('rvSaveCancel');
    var saveConfirm = document.getElementById('rvSaveConfirm');
    var saveName = document.getElementById('rvSaveName');

    var presentEl = document.getElementById('rvPresent');
    var presentClose = document.getElementById('rvPresentClose');
    var presentGroups = document.getElementById('rvPresentGroups');
    var toastEl = document.getElementById('rvToast');

    // ---------- Helpers ----------
    function escapeHtml(str) {
        var d = document.createElement('div');
        d.textContent = str == null ? '' : str;
        return d.innerHTML;
    }
    function uid(prefix) {
        return (prefix || 'id') + '-' + Date.now().toString(36) + '-' + Math.floor(Math.random() * 1e6).toString(36);
    }
    function studentName(s) {
        if (!s) return '?';
        return ((s.first_name || '') + ' ' + (s.last_name || '')).trim() || '?';
    }
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
    function monsterForStudent(s) {
        var id = (s && s.id) || '';
        var n = monsterByStudentId[id] || ((monsterHash(id) % MONSTER_COUNT) + 1);
        return BASE + 'assets/avatars/monsters/monster-' + (n < 10 ? '0' + n : n) + '.png';
    }
    function studentById(id) { return students.find(function (s) { return s.id === id; }); }
    function roleById(id) { return roles.find(function (r) { return r.id === id; }); }
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
        toast._t = setTimeout(function () { toastEl.classList.remove('visible'); }, 2800);
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
        roles = Array.isArray(store.roles) ? store.roles : [];
        if (!roles.length) {
            roles = DEFAULT_ROLES.map(function (r) { return { id: uid('role'), icon: r.icon, label: r.label, desc: r.desc }; });
            store.roles = roles;
        }
    }
    function persist() {
        store.roles = roles;
        if (!store.byGroup) store.byGroup = {};
        if (selectedGroupId) {
            store.byGroup[selectedGroupId] = {
                work: { groups: workGroups, assignments: assignments },
                sets: sets
            };
        }
        supabase.from('tool_settings').upsert({
            user_id: currentUser.id, tool_name: TOOL_NAME, settings: store,
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,tool_name' }).then(function (res) {
            if (res.error) console.error('rolverdeler opslaan:', res.error.message);
        });
    }

    // ---------- Groep-state ----------
    function restoreForGroup() {
        workGroups = []; assignments = {}; sets = [];
        var g = store.byGroup ? store.byGroup[selectedGroupId] : null;
        if (g) {
            if (g.work && Array.isArray(g.work.groups)) {
                // Filter naar nog bestaande leerlingen
                var valid = {};
                students.forEach(function (s) { valid[s.id] = true; });
                workGroups = g.work.groups.map(function (grp) {
                    return (grp || []).filter(function (id) { return valid[id]; });
                });
                assignments = {};
                if (g.work.assignments) {
                    Object.keys(g.work.assignments).forEach(function (sid) {
                        if (valid[sid]) assignments[sid] = g.work.assignments[sid];
                    });
                }
            }
            if (Array.isArray(g.sets)) sets = g.sets;
        }
    }
    function inAnyGroup(id) {
        return workGroups.some(function (grp) { return grp.indexOf(id) !== -1; });
    }
    function poolStudents() {
        return students.filter(function (s) { return !inAnyGroup(s.id); });
    }
    function removeFromGroups(id) {
        workGroups.forEach(function (grp) {
            var i = grp.indexOf(id);
            if (i !== -1) grp.splice(i, 1);
        });
    }

    // ---------- Acties ----------
    function moveTo(id, target) {
        removeFromGroups(id);
        if (target === 'pool') {
            delete assignments[id];
        } else {
            var idx = parseInt(target, 10);
            if (workGroups[idx]) workGroups[idx].push(id);
        }
        selectedStudentId = '';
        persist();
        render();
    }
    function pick(id) {
        selectedStudentId = (selectedStudentId === id) ? '' : id;
        render();
    }
    function addEmptyGroup() {
        workGroups.push([]);
        persist();
        render();
    }
    function removeGroup(idx) {
        if (!workGroups[idx]) return;
        workGroups[idx].forEach(function (id) { delete assignments[id]; });
        workGroups.splice(idx, 1);
        persist();
        render();
    }
    function randomGroups() {
        if (!students.length) { toast('Geen leerlingen in deze klas.'); return; }
        var num = Math.max(2, Math.min(20, parseInt(splitNumber.value, 10) || 2));
        var total = students.length;
        var groupCount;
        if (splitMethod.value === 'size') {
            groupCount = Math.max(1, Math.ceil(total / num));
        } else {
            groupCount = Math.max(1, Math.min(num, total));
        }
        var shuffled = shuffle(students.map(function (s) { return s.id; }));
        workGroups = [];
        for (var g = 0; g < groupCount; g++) workGroups.push([]);
        shuffled.forEach(function (id, i) { workGroups[i % groupCount].push(id); });
        assignments = {};
        selectedStudentId = '';
        persist();
        render();
    }
    function clearAll() {
        if (!workGroups.length && !Object.keys(assignments).length) return;
        if (!confirm('De huidige indeling en rolverdeling wissen? De leerlingen gaan terug naar "nog niet ingedeeld".')) return;
        workGroups = []; assignments = {}; selectedStudentId = '';
        persist();
        render();
    }
    function assignRoles() {
        if (!roles.length) { toast('Voeg eerst rollen toe via het tandwiel.'); return; }
        if (!workGroups.length) { toast('Maak eerst groepjes.'); return; }
        workGroups.forEach(function (grp) {
            var members = shuffle(grp);
            var rs = shuffle(roles);
            members.forEach(function (sid, i) {
                assignments[sid] = i < rs.length ? rs[i].id : null;
            });
        });
        persist();
        render();
        toast('🎲 Rollen verdeeld.');
    }

    // ---------- Render ----------
    function chipHtml(s, opts) {
        opts = opts || {};
        var sel = selectedStudentId === s.id ? ' is-selected' : '';
        var roleChip = '';
        if (opts.withRole) {
            var optsHtml = '<option value="">— geen rol —</option>' + roles.map(function (r) {
                var selAttr = assignments[s.id] === r.id ? ' selected' : '';
                return '<option value="' + r.id + '"' + selAttr + '>' + escapeHtml(r.icon + ' ' + r.label) + '</option>';
            }).join('');
            roleChip = '<select class="rv-role-select" data-id="' + s.id + '">' + optsHtml + '</select>';
        }
        return '<div class="rv-chip' + sel + '" data-act="pick" data-id="' + s.id + '">' +
            '<img class="rv-chip-monster" src="' + monsterForStudent(s) + '" alt="" ' +
                'onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">' +
            '<span class="rv-chip-initials">' + escapeHtml(initials(s)) + '</span>' +
            '<span class="rv-chip-name">' + escapeHtml(firstName(s)) + '</span>' +
            roleChip +
            '</div>';
    }

    function render() {
        if (!selectedGroupId) { noGroup.style.display = ''; main.style.display = 'none'; return; }
        noGroup.style.display = 'none'; main.style.display = '';

        hint.style.display = selectedStudentId ? 'none' : '';
        if (selectedStudentId) {
            var s = studentById(selectedStudentId);
            hint.style.display = '';
            hint.innerHTML = '<strong>' + escapeHtml(firstName(s)) + '</strong> opgepakt — tik op een groepje of op "Nog niet ingedeeld" om te plaatsen.';
        } else {
            hint.textContent = 'Tip: tik op een kind en daarna op een groepje om het te verplaatsen. Tik nogmaals om te annuleren.';
        }

        // Pool
        var pool = poolStudents();
        poolCount.textContent = pool.length;
        poolEl.classList.toggle('is-droptarget', !!selectedStudentId);
        poolEl.innerHTML = pool.length
            ? pool.map(function (s) { return chipHtml(s, {}); }).join('')
            : '<p class="rv-pool-empty">Iedereen is ingedeeld 🎉</p>';

        // Groepjes
        if (!workGroups.length) {
            groupsEl.innerHTML = '<div class="rv-groups-empty">Nog geen groepjes. Verdeel willekeurig of voeg een leeg groepje toe.</div>';
        } else {
            groupsEl.innerHTML = workGroups.map(function (grp, idx) {
                var members = grp.map(studentById).filter(Boolean);
                var body = members.length
                    ? members.map(function (s) { return chipHtml(s, { withRole: true }); }).join('')
                    : '<p class="rv-group-empty">Leeg — tik hier nadat je een kind hebt opgepakt.</p>';
                return '<div class="rv-group' + (selectedStudentId ? ' is-droptarget' : '') + '" data-drop="' + idx + '">' +
                    '<div class="rv-group-head">' +
                        '<span class="rv-group-title">Groepje ' + (idx + 1) + '</span>' +
                        '<span class="rv-group-count">' + members.length + '</span>' +
                        '<button class="rv-group-del" data-act="removegroup" data-idx="' + idx + '" title="Groepje verwijderen">&times;</button>' +
                    '</div>' +
                    '<div class="rv-group-body">' + body + '</div>' +
                    '</div>';
            }).join('');
        }

        renderSetSelect();
        if (presentOpen) renderPresent();
    }

    function renderSetSelect() {
        var cur = setSelect.value;
        setSelect.innerHTML = '<option value="">Opgeslagen sets…</option>' +
            sets.map(function (st) { return '<option value="' + st.id + '">' + escapeHtml(st.name) + '</option>'; }).join('');
        // selectie behouden indien nog bestaand
        if (sets.some(function (st) { return st.id === cur; })) setSelect.value = cur;
        btnDeleteSet.style.display = setSelect.value ? '' : 'none';
    }

    // ---------- Rollen beheren ----------
    function openSettings() { renderRolesEdit(); settingsModal.classList.add('active'); }
    function closeSettings() { settingsModal.classList.remove('active'); editingRoleId = null; }
    function renderRolesEdit() {
        if (!roles.length) {
            rolesEdit.innerHTML = '<p class="rv-pool-empty">Nog geen rollen. Voeg er een toe.</p>';
            return;
        }
        rolesEdit.innerHTML = roles.map(function (r) {
            return '<div class="rv-role-row" data-id="' + r.id + '">' +
                '<input class="rv-role-icon" data-id="' + r.id + '" value="' + escapeHtml(r.icon) + '" maxlength="3" title="Icoon/emoji">' +
                '<div class="rv-role-fields">' +
                    '<input class="rv-role-label" data-id="' + r.id + '" value="' + escapeHtml(r.label) + '" placeholder="Naam van de rol" maxlength="30">' +
                    '<input class="rv-role-desc" data-id="' + r.id + '" value="' + escapeHtml(r.desc || '') + '" placeholder="Korte uitleg (optioneel)" maxlength="80">' +
                '</div>' +
                '<button class="rv-role-del" data-act="delrole" data-id="' + r.id + '" title="Verwijderen">&#128465;&#65039;</button>' +
                '</div>';
        }).join('');
    }
    function collectRoles() {
        var rows = rolesEdit.querySelectorAll('.rv-role-row');
        var out = [];
        rows.forEach(function (row) {
            var id = row.getAttribute('data-id');
            var icon = (row.querySelector('.rv-role-icon').value || '').trim();
            var label = (row.querySelector('.rv-role-label').value || '').trim();
            var desc = (row.querySelector('.rv-role-desc').value || '').trim();
            if (label) out.push({ id: id, icon: icon || '🎯', label: label, desc: desc });
        });
        return out;
    }
    function addRole() {
        roles = collectRoles();
        roles.push({ id: uid('role'), icon: '🎯', label: '', desc: '' });
        renderRolesEdit();
        var labels = rolesEdit.querySelectorAll('.rv-role-label');
        if (labels.length) labels[labels.length - 1].focus();
    }
    function deleteRole(id) {
        roles = collectRoles().filter(function (r) { return r.id !== id; });
        // ook uit toewijzingen halen
        Object.keys(assignments).forEach(function (sid) { if (assignments[sid] === id) delete assignments[sid]; });
        renderRolesEdit();
    }
    function saveRolesAndClose() {
        roles = collectRoles();
        persist();
        closeSettings();
        render();
    }

    // ---------- Sets ----------
    function openSaveModal() {
        if (!workGroups.length) { toast('Maak eerst groepjes om op te slaan.'); return; }
        saveName.value = '';
        saveModal.classList.add('active');
        saveName.focus();
    }
    function closeSaveModal() { saveModal.classList.remove('active'); }
    function confirmSaveSet() {
        var name = (saveName.value || '').trim();
        if (!name) { saveName.focus(); return; }
        sets.push({
            id: uid('set'), name: name,
            groups: workGroups.map(function (grp) { return grp.slice(); })
        });
        persist();
        closeSaveModal();
        renderSetSelect();
        setSelect.value = sets[sets.length - 1].id;
        btnDeleteSet.style.display = '';
        toast('💾 Indeling "' + name + '" opgeslagen.');
    }
    function loadSet(id) {
        var st = sets.find(function (x) { return x.id === id; });
        if (!st) return;
        var valid = {};
        students.forEach(function (s) { valid[s.id] = true; });
        workGroups = st.groups.map(function (grp) { return (grp || []).filter(function (sid) { return valid[sid]; }); });
        assignments = {};
        selectedStudentId = '';
        persist();
        render();
        toast('Indeling "' + st.name + '" geladen. Nieuwe leerlingen staan bij "nog niet ingedeeld".');
    }
    function deleteSet(id) {
        var st = sets.find(function (x) { return x.id === id; });
        if (!st) return;
        if (!confirm('Opgeslagen indeling "' + st.name + '" verwijderen?')) return;
        sets = sets.filter(function (x) { return x.id !== id; });
        persist();
        setSelect.value = '';
        renderSetSelect();
    }

    // ---------- Presenteren ----------
    function presentGroupsHtml(forPrint) {
        if (!workGroups.length) {
            return forPrint ? '' : '<div class="rv-present-empty">Nog geen groepjes om te tonen.</div>';
        }
        return workGroups.map(function (grp, idx) {
            var members = grp.map(studentById).filter(Boolean);
            var rows = members.map(function (s) {
                var r = roleById(assignments[s.id]);
                var roleHtml = r
                    ? '<span class="rv-pr-role">' + escapeHtml(r.icon + ' ' + r.label) + '</span>'
                    : '<span class="rv-pr-role rv-pr-norole">geen rol</span>';
                var mon = forPrint
                    ? (location.origin + '/' + monsterForStudent(s).replace(/^\.\.\//, ''))
                    : monsterForStudent(s);
                return '<div class="rv-pr-member">' +
                    '<img class="rv-pr-monster" src="' + mon + '" alt="">' +
                    '<span class="rv-pr-name">' + escapeHtml(firstName(s)) + '</span>' +
                    roleHtml +
                    '</div>';
            }).join('');
            return '<div class="rv-pr-group">' +
                '<div class="rv-pr-group-title">Groepje ' + (idx + 1) + '</div>' +
                rows +
                '</div>';
        }).join('');
    }
    function renderPresent() { presentGroups.innerHTML = presentGroupsHtml(false); }
    function openPresent() {
        if (!workGroups.length) { toast('Maak eerst groepjes.'); return; }
        presentOpen = true;
        renderPresent();
        presentEl.style.display = '';
        document.body.classList.add('rv-presenting');
    }
    function closePresent() {
        presentOpen = false;
        presentEl.style.display = 'none';
        document.body.classList.remove('rv-presenting');
    }

    // ---------- Printen ----------
    function printSheet() {
        if (!workGroups.length) { toast('Maak eerst groepjes.'); return; }
        var groupName = '';
        var g = groups.find(function (x) { return x.id === selectedGroupId; });
        if (g) groupName = g.name;

        var cards = workGroups.map(function (grp, idx) {
            var members = grp.map(studentById).filter(Boolean);
            var rows = members.map(function (s) {
                var r = roleById(assignments[s.id]);
                var role = r ? escapeHtml(r.icon + ' ' + r.label) : '<span class="norole">—</span>';
                return '<tr><td class="nm">' + escapeHtml(firstName(s)) + '</td><td class="rl">' + role + '</td></tr>';
            }).join('');
            return '<div class="grp"><h2>Groepje ' + (idx + 1) + '</h2>' +
                '<table>' + rows + '</table></div>';
        }).join('');

        var html = '<!DOCTYPE html><html lang="nl"><head><meta charset="UTF-8">' +
            '<title>Rolverdeler' + (groupName ? ' — ' + escapeHtml(groupName) : '') + '</title><style>' +
            '*{margin:0;padding:0;box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact;}' +
            'body{font-family:"Segoe UI",system-ui,Arial,sans-serif;background:#fff;color:#2D3436;padding:24px;}' +
            'h1{font-size:24px;color:#6C63FF;margin-bottom:4px;}' +
            '.sub{color:#777;font-size:13px;margin-bottom:20px;}' +
            '.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;}' +
            '.grp{border:1px solid #E5E3F2;border-radius:12px;padding:14px 16px;break-inside:avoid;}' +
            '.grp h2{font-size:16px;color:#6C63FF;margin-bottom:8px;}' +
            'table{width:100%;border-collapse:collapse;}' +
            'td{padding:6px 4px;border-bottom:1px solid #F0EFF8;font-size:14px;}' +
            'td.nm{font-weight:600;}' +
            'td.rl{text-align:right;color:#444;}' +
            '.norole{color:#bbb;}' +
            '@page{margin:14mm;}' +
            '</style></head><body>' +
            '<h1>Groepjes &amp; rollen</h1>' +
            '<div class="sub">' + (groupName ? escapeHtml(groupName) + ' · ' : '') + 'Meestertools · Rolverdeler</div>' +
            '<div class="grid">' + cards + '</div>' +
            '<script>window.onload=function(){setTimeout(function(){window.print();},350);};<\/script>' +
            '</body></html>';

        var w = window.open('', '_blank');
        if (!w) { toast('Sta pop-ups toe om te kunnen printen.'); return; }
        w.document.open(); w.document.write(html); w.document.close();
    }

    // ---------- Event-delegatie op het hoofdveld ----------
    main.addEventListener('click', function (e) {
        if (e.target.closest('.rv-role-select')) return; // rol-dropdown: eigen change-handler
        var del = e.target.closest('[data-act="removegroup"]');
        if (del) { e.stopPropagation(); removeGroup(parseInt(del.getAttribute('data-idx'), 10)); return; }
        var chip = e.target.closest('[data-act="pick"]');
        if (chip) { pick(chip.getAttribute('data-id')); return; }
        // Klik op een drop-zone (groep of pool) terwijl er een kind is opgepakt
        if (selectedStudentId) {
            var drop = e.target.closest('[data-drop]');
            if (drop) { moveTo(selectedStudentId, drop.getAttribute('data-drop')); return; }
        }
    });
    main.addEventListener('change', function (e) {
        var sel = e.target.closest('.rv-role-select');
        if (!sel) return;
        var id = sel.getAttribute('data-id');
        assignments[id] = sel.value || null;
        if (!sel.value) delete assignments[id];
        persist();
        if (presentOpen) renderPresent();
    });

    // ---------- Overige bindings ----------
    btnRandom.addEventListener('click', randomGroups);
    btnAddGroup.addEventListener('click', addEmptyGroup);
    btnAssignRoles.addEventListener('click', assignRoles);
    btnClear.addEventListener('click', clearAll);
    btnPresent.addEventListener('click', openPresent);
    btnPrint.addEventListener('click', printSheet);
    presentClose.addEventListener('click', closePresent);

    btnSettings.addEventListener('click', openSettings);
    settingsClose.addEventListener('click', saveRolesAndClose);
    settingsSave.addEventListener('click', saveRolesAndClose);
    settingsModal.addEventListener('click', function (e) { if (e.target === settingsModal) saveRolesAndClose(); });
    btnAddRole.addEventListener('click', addRole);
    rolesEdit.addEventListener('click', function (e) {
        var d = e.target.closest('[data-act="delrole"]');
        if (d) deleteRole(d.getAttribute('data-id'));
    });

    btnSaveSet.addEventListener('click', openSaveModal);
    saveClose.addEventListener('click', closeSaveModal);
    saveCancel.addEventListener('click', closeSaveModal);
    saveModal.addEventListener('click', function (e) { if (e.target === saveModal) closeSaveModal(); });
    saveConfirm.addEventListener('click', confirmSaveSet);
    saveName.addEventListener('keydown', function (e) { if (e.key === 'Enter') confirmSaveSet(); });

    setSelect.addEventListener('change', function () {
        btnDeleteSet.style.display = setSelect.value ? '' : 'none';
        if (setSelect.value) loadSet(setSelect.value);
    });
    btnDeleteSet.addEventListener('click', function () { if (setSelect.value) deleteSet(setSelect.value); });

    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;
        if (presentOpen) { closePresent(); return; }
        if (saveModal.classList.contains('active')) { closeSaveModal(); return; }
        if (settingsModal.classList.contains('active')) { saveRolesAndClose(); return; }
        if (selectedStudentId) { selectedStudentId = ''; render(); }
    });

    // ---------- Init ----------
    async function init() {
        currentUser = await getUser();
        if (!currentUser) return;

        await loadStore();
        await loadGroups();
        try { await MTActiveClass.ready; } catch (e) {}
        selectedGroupId = MTActiveClass.resolveDefault('', groups);

        if (!selectedGroupId) {
            render();
            if (window.hidePageLoader) window.hidePageLoader();
            return;
        }

        await loadStudents();
        restoreForGroup();
        render();
        if (window.hidePageLoader) window.hidePageLoader();
    }

    init();
});

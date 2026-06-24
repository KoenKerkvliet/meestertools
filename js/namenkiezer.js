/* ============================================
   NAMENKIEZER - JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {
    var TOOL_NAME = 'namenkiezer';

    // Elements
    var container = document.getElementById('namenkiezerContainer');
    var btnSettings = document.getElementById('btnSettings');
    var settingsModal = document.getElementById('settingsModal');
    var btnCloseSettings = document.getElementById('btnCloseSettings');
    var btnSaveSettings = document.getElementById('btnSaveSettings');
    var selectGroup = document.getElementById('selectGroup');
    var chkUniqueMode = document.getElementById('chkUniqueMode');
    var chkOrderMode = document.getElementById('chkOrderMode');
    var orderEditorGroup = document.getElementById('orderEditorGroup');
    var orderList = document.getElementById('orderList');

    // State
    var selectedGroupId = null;
    var uniqueMode = false; // default: allow repeats
    var orderMode = false;  // when true: draw students in a fixed order instead of random
    var orderByGroup = {};  // { groupId: [names in chosen order] }
    var customOrder = [];   // reconciled order for the active group
    var groups = [];
    var studentNames = [];
    var pickedNames = [];
    var isPicking = false;

    // Modal-only editing state for the order list
    var editOrder = [];
    var editGroupId = null;

    // ---------- Supabase ----------
    async function getSessionUser() {
        var result = await supabase.auth.getSession();
        return result.data.session ? result.data.session.user : null;
    }

    async function loadSettings() {
        var user = await getSessionUser();
        if (!user) return;

        var result = await supabase
            .from('tool_settings')
            .select('settings')
            .eq('user_id', user.id)
            .eq('tool_name', TOOL_NAME)
            .single();

        if (result.data && result.data.settings) {
            var s = result.data.settings;
            if (s.selectedGroupId) selectedGroupId = s.selectedGroupId;
            if (s.uniqueMode === true) uniqueMode = true;
            if (s.orderMode === true) orderMode = true;
            if (s.orderByGroup && typeof s.orderByGroup === 'object') orderByGroup = s.orderByGroup;
        }

        await loadGroups(user.id);
        await loadStudents(user.id);
        syncCustomOrder();
        render();
    }

    async function loadGroups(userId) {
        var result = await supabase
            .from('groups')
            .select('id, name')
            .eq('user_id', userId)
            .eq('archived', false)
            .order('created_at', { ascending: true });

        groups = result.data || [];

        if (window.MTActiveClass) {
            selectedGroupId = window.MTActiveClass.resolveDefault(selectedGroupId, groups);
        }

        if (groups.length > 0 && !groups.find(function (g) { return g.id === selectedGroupId; })) {
            selectedGroupId = groups[0].id;
        }
    }

    async function fetchStudentNames(userId, groupId) {
        if (!groupId) return [];

        var result = await supabase
            .from('students')
            .select('first_name, last_name')
            .eq('group_id', groupId)
            .eq('user_id', userId)
            .eq('archived', false)
            .order('student_number', { ascending: true });

        return (result.data || []).map(function (s) {
            return s.last_name ? s.first_name + ' ' + s.last_name : s.first_name;
        });
    }

    async function loadStudents(userId) {
        studentNames = await fetchStudentNames(userId, selectedGroupId);
    }

    // Build the effective draw-order for the active group: saved order minus
    // removed students, plus any students that aren't in the saved order yet.
    function reconcileOrder(saved, names) {
        saved = saved || [];
        var out = [];
        for (var i = 0; i < saved.length; i++) {
            if (names.indexOf(saved[i]) !== -1 && out.indexOf(saved[i]) === -1) out.push(saved[i]);
        }
        for (var j = 0; j < names.length; j++) {
            if (out.indexOf(names[j]) === -1) out.push(names[j]);
        }
        return out;
    }

    function syncCustomOrder() {
        customOrder = reconcileOrder(orderByGroup[selectedGroupId], studentNames);
    }

    function getOrderedNames() {
        return customOrder.length ? customOrder : studentNames;
    }

    // How many names count toward the "X / N" tally, and whether the run is finished.
    function getTotalCount() {
        return orderMode ? getOrderedNames().length : studentNames.length;
    }

    function showCount() {
        return uniqueMode || orderMode;
    }

    function isAllDone() {
        if (orderMode) return getOrderedNames().length > 0 && pickedNames.length >= getOrderedNames().length;
        if (uniqueMode) return studentNames.length > 0 && getRemainingNames().length === 0;
        return false;
    }

    async function saveSettingsToDb() {
        var user = await getSessionUser();
        if (!user) return;

        if (window.MTActiveClass && selectedGroupId) window.MTActiveClass.setId(selectedGroupId);

        await supabase
            .from('tool_settings')
            .upsert({
                user_id: user.id,
                tool_name: TOOL_NAME,
                settings: { selectedGroupId: selectedGroupId, uniqueMode: uniqueMode, orderMode: orderMode, orderByGroup: orderByGroup },
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id,tool_name' });
    }

    // ---------- Render ----------
    function render() {
        if (groups.length === 0) {
            container.innerHTML =
                '<div class="namenkiezer-empty">' +
                '    <span class="empty-icon">&#9997;&#65039;</span>' +
                '    <p>Je hebt nog geen groepen met leerlingen.<br>' +
                '    Voeg eerst leerlingen toe via Instellingen.</p>' +
                '    <button class="btn-open-settings" id="btnGoToKlas">Ga naar Mijn klas</button>' +
                '</div>';
            bindGoToKlas();
            return;
        }

        if (studentNames.length === 0) {
            container.innerHTML =
                '<div class="namenkiezer-empty">' +
                '    <span class="empty-icon">&#9997;&#65039;</span>' +
                '    <p>Deze groep heeft nog geen leerlingen.<br>' +
                '    Voeg leerlingen toe via Instellingen of kies een andere groep.</p>' +
                '    <button class="btn-open-settings" id="btnGoToKlas">Ga naar Mijn klas</button>' +
                '</div>';
            bindGoToKlas();
            return;
        }

        var allDone = isAllDone();

        var html = '';
        html += '<div class="name-display" id="nameDisplay">';
        html += '<span class="name-display-text placeholder-text" id="nameText">Klik op de knop om een naam te kiezen</span>';
        html += '</div>';

        if (allDone) {
            html += '<div class="all-done">&#9989; Alle leerlingen zijn gekozen!</div>';
        }

        html += '<button class="tool-action-btn name-pick-btn" id="btnPick"' + (allDone ? ' disabled' : '') + '>&#127919; Kies een naam</button>';

        html += '<div class="name-status">';
        if (showCount()) {
            html += '<span class="status-count">' + pickedNames.length + ' / ' + getTotalCount() + ' gekozen</span>';
        }
        if (pickedNames.length > 0) {
            html += '<button class="btn-reset" id="btnReset">Reset</button>';
        }
        html += '</div>';

        if (pickedNames.length > 0) {
            html += '<div class="picked-names" id="pickedNames">';
            for (var i = 0; i < pickedNames.length; i++) {
                var isLatest = i === pickedNames.length - 1;
                var delay = 0;
                html += '<span class="picked-name-tag' + (isLatest ? ' latest' : '') + '" style="animation-delay: ' + delay + 'ms">';
                html += escapeHtml(pickedNames[i]);
                html += '</span>';
            }
            html += '</div>';
        }

        container.innerHTML = html;

        // Bind events
        var btnPick = document.getElementById('btnPick');
        if (btnPick) btnPick.addEventListener('click', pickName);

        var btnReset = document.getElementById('btnReset');
        if (btnReset) btnReset.addEventListener('click', resetPicked);
    }

    function bindGoToKlas() {
        var btn = document.getElementById('btnGoToKlas');
        if (btn) {
            btn.addEventListener('click', function () {
                if (typeof openInstellingen === 'function') openInstellingen('mijnklas');
            });
        }
    }

    // ---------- Pick Logic ----------
    function getRemainingNames() {
        return studentNames.filter(function (name) {
            return pickedNames.indexOf(name) === -1;
        });
    }

    async function pickName() {
        if (isPicking) return;

        // Decide which name lands. In order mode we take the next one in the
        // fixed order; otherwise we pick randomly (optionally without repeats).
        var finalName;
        if (orderMode) {
            var ordered = getOrderedNames();
            if (pickedNames.length >= ordered.length) return;
            finalName = ordered[pickedNames.length];
        } else {
            var pool = uniqueMode ? getRemainingNames() : studentNames;
            if (pool.length === 0) return;
            finalName = pool[Math.floor(Math.random() * pool.length)];
        }

        isPicking = true;
        var btnPick = document.getElementById('btnPick');
        var nameDisplay = document.getElementById('nameDisplay');
        var nameText = document.getElementById('nameText');

        btnPick.disabled = true;

        // Start spinning animation
        nameDisplay.className = 'name-display spinning';
        nameText.className = 'name-display-text';

        // Spin through names - start fast, slow down
        var spinDuration = 1500;
        var startTime = Date.now();
        var allNames = studentNames.slice();

        function spinStep() {
            var elapsed = Date.now() - startTime;
            var progress = Math.min(elapsed / spinDuration, 1);

            if (progress < 1) {
                // Easing: interval gets longer as we slow down
                var interval = 50 + (progress * progress * 200);
                var randomName = allNames[Math.floor(Math.random() * allNames.length)];
                nameText.textContent = randomName;

                setTimeout(spinStep, interval);
            } else {
                // Landing: show final name with animation
                nameDisplay.className = 'name-display chosen';
                nameText.className = 'name-display-text';
                nameText.textContent = finalName;

                // Add to picked list
                pickedNames.push(finalName);

                // Re-render status and picked list after a short delay
                setTimeout(function () {
                    updateStatus();
                    isPicking = false;
                    btnPick.disabled = false;

                    // Check if all done (unique mode or fixed-order mode)
                    if (isAllDone()) {
                        btnPick.disabled = true;
                        var statusArea = document.querySelector('.name-status');
                        if (statusArea) {
                            var doneEl = document.createElement('div');
                            doneEl.className = 'all-done';
                            doneEl.innerHTML = '&#9989; Alle leerlingen zijn gekozen!';
                            statusArea.parentNode.insertBefore(doneEl, statusArea);
                        }
                    }
                }, 300);
            }
        }

        spinStep();
    }

    function updateStatus() {
        // Update count (unique mode or fixed-order mode)
        var countEl = container.querySelector('.status-count');
        if (countEl && showCount()) {
            countEl.textContent = pickedNames.length + ' / ' + getTotalCount() + ' gekozen';
        }

        // Add reset button if not present
        var statusEl = container.querySelector('.name-status');
        if (statusEl && !container.querySelector('#btnReset') && pickedNames.length > 0) {
            var resetBtn = document.createElement('button');
            resetBtn.className = 'btn-reset';
            resetBtn.id = 'btnReset';
            resetBtn.textContent = 'Reset';
            resetBtn.addEventListener('click', resetPicked);
            statusEl.appendChild(resetBtn);
        }

        // Update picked names list
        var pickedEl = container.querySelector('#pickedNames');
        if (!pickedEl && pickedNames.length > 0) {
            pickedEl = document.createElement('div');
            pickedEl.className = 'picked-names';
            pickedEl.id = 'pickedNames';
            container.appendChild(pickedEl);
        }

        if (pickedEl) {
            // Add the latest tag
            var latestName = pickedNames[pickedNames.length - 1];

            // Remove 'latest' class from previous tags
            var prevLatest = pickedEl.querySelectorAll('.latest');
            for (var i = 0; i < prevLatest.length; i++) {
                prevLatest[i].classList.remove('latest');
            }

            var tag = document.createElement('span');
            tag.className = 'picked-name-tag latest';
            tag.textContent = latestName;
            pickedEl.appendChild(tag);
        }
    }

    function resetPicked() {
        pickedNames = [];
        render();
    }

    // Spacebar to pick
    document.addEventListener('keydown', function (e) {
        if (e.code === 'Space' && !settingsModal.classList.contains('active')) {
            e.preventDefault();
            pickName();
        }
    });

    // ---------- Settings Modal ----------
    btnSettings.addEventListener('click', function () {
        // Populate group dropdown
        var options = '';
        for (var i = 0; i < groups.length; i++) {
            var g = groups[i];
            var selected = g.id === selectedGroupId ? ' selected' : '';
            options += '<option value="' + g.id + '"' + selected + '>' + escapeHtml(g.name) + '</option>';
        }

        if (groups.length === 0) {
            selectGroup.innerHTML = '<option value="">Geen groepen beschikbaar</option>';
        } else {
            selectGroup.innerHTML = options;
        }

        chkUniqueMode.checked = uniqueMode;
        chkOrderMode.checked = orderMode;
        chkUniqueMode.disabled = orderMode;
        orderEditorGroup.style.display = orderMode ? '' : 'none';
        editOrder = [];
        editGroupId = null;
        if (orderMode) buildOrderEditor();

        settingsModal.classList.add('active');
    });

    // ---------- Order editor ----------
    async function buildOrderEditor() {
        var user = await getSessionUser();
        if (!user) return;
        var gid = selectGroup.value;
        editGroupId = gid;
        var names = await fetchStudentNames(user.id, gid);
        editOrder = reconcileOrder(orderByGroup[gid], names);
        renderOrderEditor();
    }

    function renderOrderEditor() {
        if (editOrder.length === 0) {
            orderList.innerHTML = '<p class="order-empty">Deze groep heeft nog geen leerlingen.</p>';
            return;
        }
        var html = '';
        for (var i = 0; i < editOrder.length; i++) {
            html += '<div class="order-item">';
            html += '<span class="order-pos">' + (i + 1) + '</span>';
            html += '<span class="order-name">' + escapeHtml(editOrder[i]) + '</span>';
            html += '<span class="order-actions">';
            html += '<button type="button" class="order-btn order-up" data-index="' + i + '"' + (i === 0 ? ' disabled' : '') + ' title="Omhoog">&#9650;</button>';
            html += '<button type="button" class="order-btn order-down" data-index="' + i + '"' + (i === editOrder.length - 1 ? ' disabled' : '') + ' title="Omlaag">&#9660;</button>';
            html += '</span>';
            html += '</div>';
        }
        orderList.innerHTML = html;
    }

    function moveOrder(from, to) {
        if (to < 0 || to >= editOrder.length) return;
        var item = editOrder.splice(from, 1)[0];
        editOrder.splice(to, 0, item);
        renderOrderEditor();
    }

    orderList.addEventListener('click', function (e) {
        var up = e.target.closest('.order-up');
        var down = e.target.closest('.order-down');
        if (up) {
            var i = parseInt(up.getAttribute('data-index'), 10);
            moveOrder(i, i - 1);
        } else if (down) {
            var j = parseInt(down.getAttribute('data-index'), 10);
            moveOrder(j, j + 1);
        }
    });

    chkOrderMode.addEventListener('change', function () {
        var on = chkOrderMode.checked;
        orderEditorGroup.style.display = on ? '' : 'none';
        chkUniqueMode.disabled = on;
        if (on) {
            chkUniqueMode.checked = false;
            buildOrderEditor();
        }
    });

    selectGroup.addEventListener('change', function () {
        if (chkOrderMode.checked) buildOrderEditor();
    });

    btnCloseSettings.addEventListener('click', closeModal);

    settingsModal.addEventListener('click', function (e) {
        if (e.target === settingsModal) closeModal();
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && settingsModal.classList.contains('active')) {
            closeModal();
        }
    });

    function closeModal() {
        settingsModal.classList.remove('active');
    }

    btnSaveSettings.addEventListener('click', async function () {
        var newGroupId = selectGroup.value;
        var newOrderMode = chkOrderMode.checked;
        var newUniqueMode = newOrderMode ? false : chkUniqueMode.checked;

        // Persist the order that's currently being edited (for its group).
        if (editGroupId) orderByGroup[editGroupId] = editOrder.slice();

        var groupChanged = newGroupId !== selectedGroupId;
        var modeChanged = newOrderMode !== orderMode || newUniqueMode !== uniqueMode;
        var prevOrder = customOrder.join('|');

        selectedGroupId = newGroupId;
        orderMode = newOrderMode;
        uniqueMode = newUniqueMode;

        if (groupChanged) {
            var user = await getSessionUser();
            if (user) await loadStudents(user.id);
        }
        syncCustomOrder();

        // Reset the run if anything that affects the draw changed.
        if (groupChanged || modeChanged || customOrder.join('|') !== prevOrder) {
            pickedNames = [];
        }

        await saveSettingsToDb();
        closeModal();
        render();
    });

    // ---------- Utility ----------
    function escapeHtml(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ---------- Init ----------
    loadSettings();
});

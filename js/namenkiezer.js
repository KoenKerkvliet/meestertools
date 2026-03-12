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

    // State
    var selectedGroupId = null;
    var groups = [];
    var studentNames = [];
    var pickedNames = [];
    var isPicking = false;

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
            if (result.data.settings.selectedGroupId) selectedGroupId = result.data.settings.selectedGroupId;
        }

        await loadGroups(user.id);
        await loadStudents(user.id);
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

        if (groups.length > 0 && !groups.find(function (g) { return g.id === selectedGroupId; })) {
            selectedGroupId = groups[0].id;
        }
    }

    async function loadStudents(userId) {
        if (!selectedGroupId) {
            studentNames = [];
            return;
        }

        var result = await supabase
            .from('students')
            .select('first_name, last_name')
            .eq('group_id', selectedGroupId)
            .eq('user_id', userId)
            .eq('archived', false)
            .order('student_number', { ascending: true });

        studentNames = (result.data || []).map(function (s) {
            return s.last_name ? s.first_name + ' ' + s.last_name : s.first_name;
        });
    }

    async function saveSettingsToDb() {
        var user = await getSessionUser();
        if (!user) return;

        await supabase
            .from('tool_settings')
            .upsert({
                user_id: user.id,
                tool_name: TOOL_NAME,
                settings: { selectedGroupId: selectedGroupId },
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

        var remaining = getRemainingNames();
        var allDone = remaining.length === 0;

        var html = '';
        html += '<div class="name-display" id="nameDisplay">';
        html += '<span class="name-display-text placeholder-text" id="nameText">Klik op de knop om een naam te kiezen</span>';
        html += '</div>';

        if (allDone) {
            html += '<div class="all-done">&#9989; Alle leerlingen zijn gekozen!</div>';
        }

        html += '<button class="tool-action-btn name-pick-btn" id="btnPick"' + (allDone ? ' disabled' : '') + '>&#127919; Kies een naam</button>';

        html += '<div class="name-status">';
        html += '<span class="status-count">' + pickedNames.length + ' / ' + studentNames.length + ' gekozen</span>';
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
        var remaining = getRemainingNames();
        if (remaining.length === 0) return;

        isPicking = true;
        var btnPick = document.getElementById('btnPick');
        var nameDisplay = document.getElementById('nameDisplay');
        var nameText = document.getElementById('nameText');

        btnPick.disabled = true;

        // Choose the final name
        var finalIndex = Math.floor(Math.random() * remaining.length);
        var finalName = remaining[finalIndex];

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

                    // Check if all done
                    if (getRemainingNames().length === 0) {
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
        // Update count
        var countEl = container.querySelector('.status-count');
        if (countEl) {
            countEl.textContent = pickedNames.length + ' / ' + studentNames.length + ' gekozen';
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

        settingsModal.classList.add('active');
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

        if (newGroupId !== selectedGroupId) {
            selectedGroupId = newGroupId;
            pickedNames = [];
            var user = await getSessionUser();
            if (user) await loadStudents(user.id);
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

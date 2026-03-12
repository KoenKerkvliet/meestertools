/* ============================================
   MINUTENSPEL - JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {
    var TOOL_NAME = 'minutenspel';

    // Elements
    var container = document.getElementById('minutenspelContainer');
    var btnSettings = document.getElementById('btnSettings');
    var settingsModal = document.getElementById('settingsModal');
    var btnCloseSettings = document.getElementById('btnCloseSettings');
    var btnSaveSettings = document.getElementById('btnSaveSettings');
    var selectGroup = document.getElementById('selectGroup');
    var tasksList = document.getElementById('tasksList');
    var newTaskInput = document.getElementById('newTaskInput');
    var btnAddTask = document.getElementById('btnAddTask');

    // State
    var selectedGroupId = null;
    var groups = [];
    var studentNames = [];
    var tasks = [];
    var badges = {};          // { studentIndex: roundNumber }
    var roundNumber = 0;
    var roundTimer = null;
    var roundTimeout = 3000;  // 3 seconds
    var chosenTask = null;
    var chosenStudents = [];
    var timerInterval = null;
    var gamePhase = 'picking'; // picking | taskRevealed | timerRunning | done

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
            if (Array.isArray(result.data.settings.tasks)) tasks = result.data.settings.tasks;
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
                settings: { selectedGroupId: selectedGroupId, tasks: tasks },
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id,tool_name' });
    }

    // ---------- Render ----------
    function render() {
        if (groups.length === 0) {
            container.innerHTML =
                '<div class="minutenspel-empty">' +
                '    <span class="empty-icon">&#127919;</span>' +
                '    <p>Je hebt nog geen groepen met leerlingen.<br>' +
                '    Voeg eerst leerlingen toe via Instellingen.</p>' +
                '    <button class="btn-open-settings" id="btnGoToKlas">Ga naar Mijn klas</button>' +
                '</div>';
            bindGoToKlas();
            return;
        }

        if (studentNames.length === 0) {
            container.innerHTML =
                '<div class="minutenspel-empty">' +
                '    <span class="empty-icon">&#127919;</span>' +
                '    <p>Deze groep heeft nog geen leerlingen.<br>' +
                '    Voeg leerlingen toe via Instellingen of kies een andere groep.</p>' +
                '    <button class="btn-open-settings" id="btnGoToKlas">Ga naar Mijn klas</button>' +
                '</div>';
            bindGoToKlas();
            return;
        }

        if (tasks.length === 0) {
            container.innerHTML =
                '<div class="minutenspel-empty">' +
                '    <span class="empty-icon">&#128221;</span>' +
                '    <p>Je hebt nog geen taakjes ingesteld.<br>' +
                '    Voeg taakjes toe via de instellingen.</p>' +
                '    <button class="btn-open-settings" id="btnOpenSettings">Open instellingen</button>' +
                '</div>';
            var openBtn = document.getElementById('btnOpenSettings');
            if (openBtn) openBtn.addEventListener('click', function() { openSettingsModal(); });
            return;
        }

        var html = '';

        // Student grid
        html += '<div class="student-grid" id="studentGrid">';
        for (var i = 0; i < studentNames.length; i++) {
            var hasBadge = badges[i] !== undefined;
            html += '<div class="student-card' + (hasBadge ? ' has-badge' : '') + '" data-index="' + i + '">';
            html += '<span class="student-name">' + escapeHtml(studentNames[i]) + '</span>';
            if (hasBadge) {
                html += '<span class="student-badge">' + badges[i] + '</span>';
            }
            html += '</div>';
        }
        html += '</div>';

        // Task reveal area (shown after task is chosen)
        if (gamePhase === 'taskRevealed' || gamePhase === 'timerRunning' || gamePhase === 'done') {
            html += '<div class="task-reveal chosen" id="taskReveal">';
            html += '<span class="task-reveal-text">' + escapeHtml(chosenTask) + '</span>';
            html += '<span class="task-reveal-student">' + escapeHtml(chosenStudents.join(', ')) + '</span>';
            html += '</div>';
        }

        // Action button
        if (gamePhase === 'picking') {
            var hasBadges = Object.keys(badges).length > 0;
            html += '<button class="tool-action-btn" id="btnAction"' + (hasBadges ? '' : ' disabled') + '>&#127922; Kies een taakje</button>';
        } else if (gamePhase === 'taskRevealed') {
            var minutes = getHighestBadge();
            html += '<button class="tool-action-btn" id="btnAction">&#9654; Start timer (' + minutes + ' min)</button>';
        }

        // Reset button
        if (Object.keys(badges).length > 0 || gamePhase !== 'picking') {
            html += '<button class="minutenspel-reset" id="btnReset">&#128260; Reset</button>';
        }

        container.innerHTML = html;

        // Bind events
        bindStudentClicks();
        var btnAction = document.getElementById('btnAction');
        if (btnAction) {
            if (gamePhase === 'picking') {
                btnAction.addEventListener('click', assignTask);
            } else if (gamePhase === 'taskRevealed') {
                btnAction.addEventListener('click', function() { startTimer(getHighestBadge()); });
            }
        }
        var btnReset = document.getElementById('btnReset');
        if (btnReset) btnReset.addEventListener('click', resetGame);
    }

    function bindGoToKlas() {
        var btn = document.getElementById('btnGoToKlas');
        if (btn) {
            btn.addEventListener('click', function () {
                if (typeof openInstellingen === 'function') openInstellingen('mijnklas');
            });
        }
    }

    function bindStudentClicks() {
        var cards = container.querySelectorAll('.student-card');
        cards.forEach(function(card) {
            card.addEventListener('click', function() {
                if (gamePhase !== 'picking') return;
                var index = parseInt(card.getAttribute('data-index'));
                onStudentClick(index);
            });
        });
    }

    // ---------- Game Logic ----------
    function onStudentClick(index) {
        if (gamePhase !== 'picking') return;

        // If timer is active (within 3s of last click), same round
        if (roundTimer) {
            clearTimeout(roundTimer);
            badges[index] = roundNumber;
        } else {
            // New round - clear all previous badges
            roundNumber++;
            badges = {};
            badges[index] = roundNumber;
        }

        // Start/restart 3-second timer
        roundTimer = setTimeout(function() {
            roundTimer = null;
        }, roundTimeout);

        renderStudentGrid();
    }

    function renderStudentGrid() {
        var grid = document.getElementById('studentGrid');
        if (!grid) { render(); return; }

        grid.innerHTML = '';
        for (var i = 0; i < studentNames.length; i++) {
            var hasBadge = badges[i] !== undefined;
            var card = document.createElement('div');
            card.className = 'student-card' + (hasBadge ? ' has-badge' : '');
            card.setAttribute('data-index', i);

            var nameSpan = document.createElement('span');
            nameSpan.className = 'student-name';
            nameSpan.textContent = studentNames[i];
            card.appendChild(nameSpan);

            if (hasBadge) {
                var badge = document.createElement('span');
                badge.className = 'student-badge';
                badge.textContent = badges[i];
                card.appendChild(badge);
            }

            grid.appendChild(card);
        }
        bindStudentClicks();

        // Update action button state
        var btnAction = document.getElementById('btnAction');
        if (btnAction && gamePhase === 'picking') {
            btnAction.disabled = Object.keys(badges).length === 0;
        }

        // Show reset button if needed
        var btnReset = document.getElementById('btnReset');
        if (!btnReset && Object.keys(badges).length > 0) {
            var resetBtn = document.createElement('button');
            resetBtn.className = 'minutenspel-reset';
            resetBtn.id = 'btnReset';
            resetBtn.innerHTML = '&#128260; Reset';
            resetBtn.addEventListener('click', resetGame);
            container.appendChild(resetBtn);
        }
    }

    function getHighestBadge() {
        var max = 0;
        for (var key in badges) {
            if (badges[key] > max) max = badges[key];
        }
        return max;
    }

    function getStudentsWithHighestBadge() {
        var highest = getHighestBadge();
        var result = [];
        for (var key in badges) {
            if (badges[key] === highest) {
                result.push(parseInt(key));
            }
        }
        return result;
    }

    // ---------- Task Assignment ----------
    function assignTask() {
        if (gamePhase !== 'picking' || tasks.length === 0) return;
        if (Object.keys(badges).length === 0) return;

        // Clear round timer
        if (roundTimer) { clearTimeout(roundTimer); roundTimer = null; }

        var studentIndices = getStudentsWithHighestBadge();
        chosenStudents = studentIndices.map(function(i) { return studentNames[i]; });

        // Pick random task
        var finalTask = tasks[Math.floor(Math.random() * tasks.length)];
        chosenTask = finalTask;

        // Create task reveal area with spin animation
        var revealDiv = document.createElement('div');
        revealDiv.className = 'task-reveal spinning';
        revealDiv.id = 'taskReveal';
        revealDiv.innerHTML = '<span class="task-reveal-text" id="taskText">' + escapeHtml(tasks[0]) + '</span>' +
                              '<span class="task-reveal-student">' + escapeHtml(chosenStudents.join(', ')) + '</span>';

        // Insert after student grid
        var grid = document.getElementById('studentGrid');
        if (grid && grid.nextSibling) {
            container.insertBefore(revealDiv, grid.nextSibling);
        } else {
            container.appendChild(revealDiv);
        }

        // Disable action button during spin
        var btnAction = document.getElementById('btnAction');
        if (btnAction) btnAction.disabled = true;

        // Spin through tasks
        var spinDuration = 1500;
        var startTime = Date.now();
        var taskText = document.getElementById('taskText');

        function spinStep() {
            var elapsed = Date.now() - startTime;
            var progress = Math.min(elapsed / spinDuration, 1);

            if (progress < 1) {
                var interval = 50 + (progress * progress * 200);
                var randomTask = tasks[Math.floor(Math.random() * tasks.length)];
                if (taskText) taskText.textContent = randomTask;
                setTimeout(spinStep, interval);
            } else {
                // Show final task
                revealDiv.className = 'task-reveal chosen';
                if (taskText) taskText.textContent = finalTask;

                gamePhase = 'taskRevealed';

                // Update action button to timer button
                setTimeout(function() {
                    var minutes = getHighestBadge();
                    if (btnAction) {
                        btnAction.innerHTML = '&#9654; Start timer (' + minutes + ' min)';
                        btnAction.disabled = false;
                        btnAction.onclick = function() { startTimer(minutes); };
                    }
                }, 400);
            }
        }

        spinStep();
    }

    // ---------- Timer ----------
    function startTimer(minutes) {
        if (gamePhase !== 'taskRevealed') return;
        gamePhase = 'timerRunning';

        var totalSeconds = minutes * 60;
        var remaining = totalSeconds;

        // Create timer overlay
        var overlay = document.createElement('div');
        overlay.className = 'timer-overlay';
        overlay.id = 'timerOverlay';

        var modal = document.createElement('div');
        modal.className = 'timer-modal';

        var closeBtn = document.createElement('button');
        closeBtn.className = 'timer-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', function() { stopTimer(); });

        var timeDisplay = document.createElement('div');
        timeDisplay.className = 'timer-time';
        timeDisplay.id = 'timerTime';
        timeDisplay.textContent = formatTime(remaining);

        var progressDiv = document.createElement('div');
        progressDiv.className = 'timer-progress';
        var progressBar = document.createElement('div');
        progressBar.className = 'timer-progress-bar';
        progressBar.id = 'timerProgressBar';
        progressBar.style.width = '100%';
        progressDiv.appendChild(progressBar);

        var taskDiv = document.createElement('div');
        taskDiv.className = 'timer-task';
        taskDiv.textContent = chosenTask;

        var studentDiv = document.createElement('div');
        studentDiv.className = 'timer-student';
        studentDiv.textContent = chosenStudents.join(', ');

        modal.appendChild(closeBtn);
        modal.appendChild(timeDisplay);
        modal.appendChild(progressDiv);
        modal.appendChild(taskDiv);
        modal.appendChild(studentDiv);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Start countdown
        timerInterval = setInterval(function() {
            remaining--;

            if (remaining <= 0) {
                clearInterval(timerInterval);
                timerInterval = null;
                timerDone(overlay, modal);
                return;
            }

            timeDisplay.textContent = formatTime(remaining);
            var pct = (remaining / totalSeconds) * 100;
            progressBar.style.width = pct + '%';

            // Warning at 25%
            if (pct <= 25 && pct > 10) {
                timeDisplay.className = 'timer-time warning';
                progressBar.className = 'timer-progress-bar warning';
            } else if (pct <= 10) {
                timeDisplay.className = 'timer-time danger';
                progressBar.className = 'timer-progress-bar danger';
            }
        }, 1000);
    }

    function formatTime(seconds) {
        var m = Math.floor(seconds / 60);
        var s = seconds % 60;
        return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
    }

    function stopTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        var overlay = document.getElementById('timerOverlay');
        if (overlay) overlay.remove();
        gamePhase = 'taskRevealed';
        render();
    }

    function timerDone(overlay, modal) {
        gamePhase = 'done';

        // Show confetti
        showConfetti();

        // Replace modal content with done state
        modal.innerHTML = '';

        var closeBtn = document.createElement('button');
        closeBtn.className = 'timer-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', function() {
            overlay.remove();
            render();
        });

        var icon = document.createElement('span');
        icon.className = 'timer-done-icon';
        icon.innerHTML = '&#127881;';

        var doneText = document.createElement('div');
        doneText.className = 'timer-done-text';
        doneText.textContent = 'Klaar!';

        var taskDiv = document.createElement('div');
        taskDiv.className = 'timer-task';
        taskDiv.textContent = chosenTask;

        var studentDiv = document.createElement('div');
        studentDiv.className = 'timer-student';
        studentDiv.textContent = chosenStudents.join(', ');

        var doneBtn = document.createElement('button');
        doneBtn.className = 'timer-done-btn';
        doneBtn.textContent = 'Sluiten';
        doneBtn.addEventListener('click', function() {
            overlay.remove();
            resetGame();
        });

        modal.appendChild(closeBtn);
        modal.appendChild(icon);
        modal.appendChild(doneText);
        modal.appendChild(taskDiv);
        modal.appendChild(studentDiv);
        modal.appendChild(doneBtn);
    }

    // ---------- Confetti ----------
    function showConfetti() {
        var confettiContainer = document.createElement('div');
        confettiContainer.className = 'confetti-container';
        document.body.appendChild(confettiContainer);

        var colors = ['#6C63FF', '#FF6B6B', '#51CF66', '#FFA94D', '#22B8CF', '#F06595', '#FFD43B'];
        var shapes = ['square', 'circle'];

        for (var i = 0; i < 60; i++) {
            var piece = document.createElement('div');
            piece.className = 'confetti-piece';
            var color = colors[Math.floor(Math.random() * colors.length)];
            var shape = shapes[Math.floor(Math.random() * shapes.length)];
            var size = 6 + Math.random() * 8;
            var left = Math.random() * 100;
            var duration = 1.5 + Math.random() * 2;
            var delay = Math.random() * 0.8;

            piece.style.width = size + 'px';
            piece.style.height = size + 'px';
            piece.style.background = color;
            piece.style.left = left + '%';
            piece.style.borderRadius = shape === 'circle' ? '50%' : '2px';
            piece.style.animationDuration = duration + 's';
            piece.style.animationDelay = delay + 's';

            confettiContainer.appendChild(piece);
        }

        // Remove confetti after animation
        setTimeout(function() {
            confettiContainer.remove();
        }, 4000);
    }

    // ---------- Reset ----------
    function resetGame() {
        badges = {};
        roundNumber = 0;
        chosenTask = null;
        chosenStudents = [];
        gamePhase = 'picking';
        if (roundTimer) { clearTimeout(roundTimer); roundTimer = null; }
        if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
        var overlay = document.getElementById('timerOverlay');
        if (overlay) overlay.remove();
        render();
    }

    // ---------- Settings Modal ----------
    function openSettingsModal() {
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

        // Render tasks list
        renderTasksList();

        settingsModal.classList.add('active');
    }

    function renderTasksList() {
        tasksList.innerHTML = '';
        for (var i = 0; i < tasks.length; i++) {
            (function(idx) {
                var item = document.createElement('div');
                item.className = 'task-item';

                var textSpan = document.createElement('span');
                textSpan.className = 'task-text';
                textSpan.textContent = tasks[idx];

                var editBtn = document.createElement('button');
                editBtn.className = 'btn-small btn-edit';
                editBtn.innerHTML = '&#9998;';
                editBtn.title = 'Bewerken';
                editBtn.addEventListener('click', function() { editTask(idx); });

                var deleteBtn = document.createElement('button');
                deleteBtn.className = 'btn-small btn-delete';
                deleteBtn.innerHTML = '&times;';
                deleteBtn.title = 'Verwijderen';
                deleteBtn.addEventListener('click', function() { deleteTask(idx); });

                item.appendChild(textSpan);
                item.appendChild(editBtn);
                item.appendChild(deleteBtn);
                tasksList.appendChild(item);
            })(i);
        }
    }

    function editTask(index) {
        var items = tasksList.querySelectorAll('.task-item');
        var item = items[index];
        if (!item) return;

        var currentText = tasks[index];
        item.innerHTML = '';

        var input = document.createElement('input');
        input.type = 'text';
        input.className = 'task-edit-input';
        input.value = currentText;
        input.maxLength = 60;

        var saveBtn = document.createElement('button');
        saveBtn.className = 'btn-small btn-save';
        saveBtn.innerHTML = '&#10003;';
        saveBtn.title = 'Opslaan';

        var cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn-small btn-delete';
        cancelBtn.innerHTML = '&times;';
        cancelBtn.title = 'Annuleren';

        function save() {
            var val = input.value.trim();
            if (val) {
                tasks[index] = val;
            }
            renderTasksList();
        }

        saveBtn.addEventListener('click', save);
        cancelBtn.addEventListener('click', function() { renderTasksList(); });
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') save();
            if (e.key === 'Escape') renderTasksList();
        });

        item.appendChild(input);
        item.appendChild(saveBtn);
        item.appendChild(cancelBtn);
        input.focus();
    }

    function deleteTask(index) {
        tasks.splice(index, 1);
        renderTasksList();
    }

    function addTask() {
        var val = newTaskInput.value.trim();
        if (!val) return;
        tasks.push(val);
        newTaskInput.value = '';
        renderTasksList();
        newTaskInput.focus();
    }

    btnSettings.addEventListener('click', function () { openSettingsModal(); });

    btnAddTask.addEventListener('click', addTask);
    newTaskInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') addTask();
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
            resetGame();
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

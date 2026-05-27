/* ============================================
   MEESTERTOOLS - Klasseprestatie
   ClassDojo-stijl beloningssysteem
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    var TOOL_NAME = 'klasseprestatie';

    // Voorgedefinieerde icoonset
    var ICON_SET = [
        // Positieve / beloning
        '🌟', '⭐', '🏆', '🥇', '🎖️', '💎', '💪', '🤝',
        '🙌', '✋', '👍', '👏', '🎯', '📚', '✏️', '📝',
        '🎨', '🤗', '😊', '💡', '🧠', '🔥', '🎉', '🚀',
        '✅', '💯', '🏅', '🌈',
        // Aandachtspunten
        '🤐', '😴', '⏰', '📵', '🚫', '❌', '😤', '🙊',
        '🛑', '🗣️', '👎', '🤔', '⚠️', '🐢'
    ];

    // ---------- DOM ----------
    var container = document.getElementById('kprContainer');
    var btnSettings = document.getElementById('kprBtnSettings');
    var taskOverlay = document.getElementById('kprTaskOverlay');
    var taskModal = document.getElementById('kprTaskModal');
    var taskText = document.getElementById('kprTaskText');
    var taskStudents = document.getElementById('kprTaskStudents');
    var taskActions = document.getElementById('kprTaskActions');
    var btnTaskClose = document.getElementById('kprBtnTaskClose');
    var btnTaskReroll = document.getElementById('kprBtnTaskReroll');
    var btnTaskStart = document.getElementById('kprBtnTaskStart');

    var rewardModal = document.getElementById('kprRewardModal');
    var rewardTitle = document.getElementById('kprRewardTitle');
    var rewardGrid = document.getElementById('kprRewardGrid');
    var rewardTabs = rewardModal.querySelectorAll('.kpr-reward-tab');
    var btnCloseReward = document.getElementById('kprBtnCloseReward');

    var settingsModal = document.getElementById('kprSettingsModal');
    var selectGroup = document.getElementById('kprSelectGroup');
    var settingsTabs = settingsModal.querySelectorAll('.kpr-settings-tab');
    var settingsList = document.getElementById('kprSettingsList');
    var btnAddReward = document.getElementById('kprBtnAddReward');
    var btnCloseSettings = document.getElementById('kprBtnCloseSettings');
    var tasksList = document.getElementById('kprTasksList');
    var newTaskInput = document.getElementById('kprNewTaskInput');
    var btnAddTask = document.getElementById('kprBtnAddTask');

    var editModal = document.getElementById('kprEditModal');
    var editTitle = document.getElementById('kprEditTitle');
    var iconPicker = document.getElementById('kprIconPicker');
    var editLabel = document.getElementById('kprEditLabel');
    var editPoints = document.getElementById('kprEditPoints');
    var editError = document.getElementById('kprEditError');
    var btnSaveEdit = document.getElementById('kprBtnSaveEdit');
    var btnCancelEdit = document.getElementById('kprBtnCancelEdit');
    var btnCloseEdit = document.getElementById('kprBtnCloseEdit');

    // ---------- State ----------
    var currentUser = null;
    var selectedGroupId = null;
    var groups = [];
    var students = [];               // {id, first_name, last_name}
    var rewardTypes = [];            // alle reward types van user
    var pointsByStudent = {};        // {student_id: total}
    var attendanceToday = {};        // {student_id: is_absent (boolean)}
    var pendingAttendance = {};      // tijdens aanwezigheid-modus: in-memory wijzigingen voor save

    var mode = 'default';            // 'default' | 'aanwezigheid' | 'selecteer' | 'minutenspel'
    var selectedStudentIds = new Set(); // voor 'selecteer' modus
    var activeRewardTab = 'positief';
    var activeSettingsTab = 'positief';
    var editingRewardType = null;    // null = nieuw, anders het reward_type object
    var pendingTargetStudentIds = []; // welke leerlingen krijgen de toegekende beloning

    // ---------- Minutenspel state ----------
    var tasks = [];                  // string array, opgeslagen in tool_settings.klasseprestatie.tasks
    var msBadges = {};               // {student_id: roundNumber}
    var msRoundNumber = 0;
    var msRoundTimer = null;         // 3-sec timer voor ronde-grouping
    var msRoundTimeout = 3000;
    var msPhase = 'picking';         // 'picking' | 'taskRevealed' | 'timerRunning' | 'done'
    var msChosenTask = null;
    var msChosenStudentNames = [];
    var msCountdownInterval = null;

    // ---------- Helpers ----------
    function studentName(s) {
        if (!s) return '?';
        var f = s.first_name || '', l = s.last_name || '';
        return (f + ' ' + l).trim() || '?';
    }
    function initials(s) {
        if (!s) return '?';
        var f = (s.first_name || '').trim();
        var l = (s.last_name || '').trim();
        var fi = f.charAt(0).toUpperCase();
        var li = l.charAt(0).toUpperCase();
        return fi + (li || '');
    }
    function escapeHtml(str) {
        var d = document.createElement('div');
        d.textContent = String(str || '');
        return d.innerHTML;
    }
    function today() {
        return new Date().toISOString().slice(0, 10);
    }

    async function getUser() {
        var s = await supabase.auth.getSession();
        return s.data.session?.user || null;
    }

    // ---------- Data loading ----------
    async function loadGroups() {
        var { data } = await supabase
            .from('groups')
            .select('id, name')
            .eq('user_id', currentUser.id)
            .eq('archived', false)
            .order('name');
        groups = data || [];
    }

    async function loadStudents() {
        if (!selectedGroupId) { students = []; return; }
        var { data } = await supabase
            .from('students')
            .select('id, first_name, last_name, student_number')
            .eq('group_id', selectedGroupId)
            .eq('archived', false)
            .order('student_number');
        students = data || [];
    }

    async function loadRewardTypes() {
        var { data } = await supabase
            .from('klasseprestatie_reward_types')
            .select('*')
            .eq('user_id', currentUser.id)
            .eq('archived', false)
            .order('type')
            .order('sort_order');
        rewardTypes = data || [];

        // Eerste keer: seed defaults
        if (rewardTypes.length === 0) {
            await supabase.rpc('seed_klasseprestatie_defaults');
            var { data: d2 } = await supabase
                .from('klasseprestatie_reward_types')
                .select('*')
                .eq('user_id', currentUser.id)
                .eq('archived', false)
                .order('type')
                .order('sort_order');
            rewardTypes = d2 || [];
        }
    }

    async function loadPointTotals() {
        if (!students.length) { pointsByStudent = {}; return; }
        var ids = students.map(function (s) { return s.id; });
        var { data } = await supabase
            .from('klasseprestatie_points')
            .select('student_id, points')
            .in('student_id', ids);
        pointsByStudent = {};
        students.forEach(function (s) { pointsByStudent[s.id] = 0; });
        (data || []).forEach(function (p) {
            pointsByStudent[p.student_id] = (pointsByStudent[p.student_id] || 0) + p.points;
        });
    }

    async function loadAttendanceToday() {
        attendanceToday = {};
        if (!students.length) return;
        var ids = students.map(function (s) { return s.id; });
        var { data } = await supabase
            .from('klasseprestatie_attendance')
            .select('student_id, is_absent')
            .in('student_id', ids)
            .eq('date', today());
        (data || []).forEach(function (r) { attendanceToday[r.student_id] = r.is_absent; });
    }

    async function loadSettings() {
        var { data } = await supabase
            .from('tool_settings')
            .select('settings')
            .eq('user_id', currentUser.id)
            .eq('tool_name', TOOL_NAME)
            .single();
        if (data && data.settings) {
            if (data.settings.selectedGroupId) selectedGroupId = data.settings.selectedGroupId;
            if (Array.isArray(data.settings.tasks)) tasks = data.settings.tasks;
        }

        // Eenmalige import: als tasks leeg en oude minutenspel-tool tasks heeft, kopieer
        if (tasks.length === 0) {
            var { data: msData } = await supabase
                .from('tool_settings')
                .select('settings')
                .eq('user_id', currentUser.id)
                .eq('tool_name', 'minutenspel')
                .single();
            if (msData && msData.settings && Array.isArray(msData.settings.tasks) && msData.settings.tasks.length > 0) {
                tasks = msData.settings.tasks.slice();
                await saveSettings();
            }
        }
    }

    async function saveSettings() {
        await supabase
            .from('tool_settings')
            .upsert({
                user_id: currentUser.id,
                tool_name: TOOL_NAME,
                settings: { selectedGroupId: selectedGroupId, tasks: tasks },
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id,tool_name' });
    }

    // ---------- Render student grid + bottom controls ----------
    function render() {
        if (groups.length === 0) {
            container.innerHTML = '<div class="kpr-empty">' +
                '<span class="kpr-empty-icon">&#128101;</span>' +
                '<p>Je hebt nog geen klassen. Voeg eerst een klas en leerlingen toe via <a href="#" id="kprGoToKlas">Instellingen</a>.</p>' +
                '</div>';
            document.getElementById('kprGoToKlas')?.addEventListener('click', function (e) {
                e.preventDefault();
                if (typeof openInstellingen === 'function') openInstellingen('mijnklas');
            });
            return;
        }
        if (students.length === 0) {
            container.innerHTML = '<div class="kpr-empty">' +
                '<span class="kpr-empty-icon">&#128101;</span>' +
                '<p>Geen leerlingen in deze klas. Voeg leerlingen toe via Instellingen of kies een andere klas via &#9881;&#65039; rechtsboven.</p>' +
                '</div>';
            return;
        }

        var html = '<div class="kpr-grid' + (mode === 'minutenspel' ? ' kpr-mode-minutenspel' : '') + '" id="kprStudentGrid">';
        students.forEach(function (s) {
            html += renderStudentCard(s);
        });
        html += '</div>';

        // Bottom action bar (sticky)
        html += '<div class="kpr-actionbar">';
        html += '<div class="kpr-actionbar-left">';
        if (mode === 'selecteer' && selectedStudentIds.size > 0) {
            html += '<span class="kpr-selected-count">' + selectedStudentIds.size + ' leerling' + (selectedStudentIds.size === 1 ? '' : 'en') + ' geselecteerd</span>';
            html += '<button class="kpr-btn kpr-btn-primary" id="kprBtnRewardSelected">&#127942; Beloning geven</button>';
        }
        if (mode === 'aanwezigheid' && Object.keys(pendingAttendance).length > 0) {
            html += '<span class="kpr-pending-count">' + Object.keys(pendingAttendance).length + ' wijziging' + (Object.keys(pendingAttendance).length === 1 ? '' : 'en') + ' onopgeslagen</span>';
            html += '<button class="kpr-btn kpr-btn-primary" id="kprBtnSaveAttendance">&#128190; Opslaan</button>';
        }
        // Minutenspel game controls
        if (mode === 'minutenspel') {
            var hasBadges = Object.keys(msBadges).length > 0;
            if (msPhase === 'picking') {
                html += '<button class="kpr-btn kpr-btn-primary" id="kprBtnMsTask"' + (hasBadges ? '' : ' disabled') + '>&#127922; Kies een taakje</button>';
            }
            // taskRevealed actie zit nu in de overlay-popup zelf (Start timer / Andere taak)
            if (hasBadges || msPhase !== 'picking') {
                html += '<button class="kpr-btn" id="kprBtnMsReset">&#128260; Reset</button>';
            }
        }
        html += '</div>';
        html += '<div class="kpr-actionbar-right">';
        var disableOther = mode === 'minutenspel' ? ' disabled' : '';
        html += '<button class="kpr-btn ' + (mode === 'aanwezigheid' ? 'kpr-btn-active' : '') + '" id="kprBtnAttendance"' + disableOther + '>&#128100; Aanwezigheid</button>';
        html += '<button class="kpr-btn ' + (mode === 'selecteer' ? 'kpr-btn-active' : '') + '" id="kprBtnSelect"' + disableOther + '>&#9745;&#65039; Selecteer</button>';
        html += '<button class="kpr-btn ' + (mode === 'minutenspel' ? 'kpr-btn-active' : '') + '" id="kprBtnMinutenspel">&#127922; Minutenspel</button>';
        html += '</div>';
        html += '</div>';

        container.innerHTML = html;

        // Wire up
        document.querySelectorAll('.kpr-student-card').forEach(function (card) {
            card.addEventListener('click', function () { onStudentClick(card.dataset.studentId); });
        });
        document.getElementById('kprBtnAttendance').addEventListener('click', toggleAttendanceMode);
        document.getElementById('kprBtnSelect').addEventListener('click', toggleSelectMode);
        document.getElementById('kprBtnMinutenspel').addEventListener('click', toggleMinutenspelMode);

        var btnSave = document.getElementById('kprBtnSaveAttendance');
        if (btnSave) btnSave.addEventListener('click', saveAttendance);
        var btnRwSel = document.getElementById('kprBtnRewardSelected');
        if (btnRwSel) btnRwSel.addEventListener('click', openRewardForSelected);

        // Minutenspel buttons
        var btnMsTask = document.getElementById('kprBtnMsTask');
        if (btnMsTask) btnMsTask.addEventListener('click', msAssignTask);
        var btnMsReset = document.getElementById('kprBtnMsReset');
        if (btnMsReset) btnMsReset.addEventListener('click', msResetGame);
    }

    function renderStudentCard(s) {
        // In aanwezigheid-modus: pending changes overwriten DB-state voor visual
        var isAbsent;
        if (mode === 'aanwezigheid' && pendingAttendance.hasOwnProperty(s.id)) {
            isAbsent = pendingAttendance[s.id];
        } else {
            isAbsent = !!attendanceToday[s.id];
        }
        var isSelected = selectedStudentIds.has(s.id);
        var pts = pointsByStudent[s.id] || 0;
        var ptsBadgeClass = pts > 0 ? 'kpr-pts-pos' : pts < 0 ? 'kpr-pts-neg' : 'kpr-pts-zero';
        var msRound = msBadges[s.id]; // undefined of een nummer
        var hasMsBadge = mode === 'minutenspel' && msRound !== undefined;

        var classes = ['kpr-student-card'];
        if (isAbsent) classes.push('kpr-absent');
        if (isSelected) classes.push('kpr-selected');
        if (mode === 'default' && isAbsent) classes.push('kpr-blocked');
        if (hasMsBadge) classes.push('kpr-has-ms-badge');
        if (mode === 'minutenspel' && msPhase !== 'picking') classes.push('kpr-ms-frozen');

        var html = '<div class="' + classes.join(' ') + '" data-student-id="' + s.id + '">';
        // Punten badge alleen tonen buiten minutenspel-modus
        if (mode !== 'minutenspel') {
            html += '<div class="kpr-pts-badge ' + ptsBadgeClass + '">' + (pts > 0 ? '+' : '') + pts + '</div>';
        }
        // In minutenspel-modus met badge: groot rondenummer in plaats van avatar
        if (hasMsBadge) {
            html += '<div class="kpr-ms-number">' + msRound + '</div>';
        } else {
            html += '<div class="kpr-avatar">' + escapeHtml(initials(s)) + '</div>';
        }
        html += '<div class="kpr-name">' + escapeHtml(studentName(s)) + '</div>';
        if (isAbsent) html += '<div class="kpr-absent-label">afwezig</div>';
        html += '</div>';
        return html;
    }

    // ---------- Click handler op leerlingkaart ----------
    function onStudentClick(studentId) {
        if (mode === 'aanwezigheid') {
            // Toggle pending state
            var currentDbState = !!attendanceToday[studentId];
            var currentPending = pendingAttendance.hasOwnProperty(studentId)
                ? pendingAttendance[studentId]
                : currentDbState;
            var newState = !currentPending;

            if (newState === currentDbState) {
                delete pendingAttendance[studentId];
            } else {
                pendingAttendance[studentId] = newState;
            }
            render();
        } else if (mode === 'selecteer') {
            if (selectedStudentIds.has(studentId)) selectedStudentIds.delete(studentId);
            else selectedStudentIds.add(studentId);
            render();
        } else if (mode === 'minutenspel') {
            if (msPhase !== 'picking') return;  // geen klik na taak gekozen
            if (attendanceToday[studentId]) return;
            msHandleStudentClick(studentId);
        } else {
            // default modus: open beloningspopup voor deze leerling
            if (attendanceToday[studentId]) return; // afwezig = geen punten
            openRewardModal([studentId]);
        }
    }

    // ---------- Modus toggles ----------
    function toggleAttendanceMode() {
        if (mode === 'minutenspel') return; // disabled tijdens minutenspel
        if (mode === 'aanwezigheid') {
            if (Object.keys(pendingAttendance).length > 0) {
                if (!confirm('Onopgeslagen wijzigingen verwerpen?')) return;
            }
            pendingAttendance = {};
            mode = 'default';
        } else {
            mode = 'aanwezigheid';
            selectedStudentIds.clear();
            pendingAttendance = {};
        }
        render();
    }

    function toggleSelectMode() {
        if (mode === 'minutenspel') return; // disabled tijdens minutenspel
        if (mode === 'selecteer') {
            mode = 'default';
            selectedStudentIds.clear();
        } else {
            mode = 'selecteer';
            pendingAttendance = {};
        }
        render();
    }

    function toggleMinutenspelMode() {
        if (mode === 'minutenspel') {
            // Deactiveren
            msResetGame(true); // silent
            mode = 'default';
        } else {
            // Activeren
            if (tasks.length === 0) {
                alert('Er zijn nog geen taakjes ingesteld voor het minutenspel. Voeg er eerst toe via Instellingen (⚙️ rechtsboven).');
                return;
            }
            mode = 'minutenspel';
            selectedStudentIds.clear();
            pendingAttendance = {};
            msBadges = {};
            msRoundNumber = 0;
            msPhase = 'picking';
            msChosenTask = null;
            msChosenStudentNames = [];
        }
        render();
    }

    // ============================================
    // MINUTENSPEL game logic
    // ============================================

    function msHandleStudentClick(studentId) {
        // Zelfde 3-sec ronde logica als originele minutenspel:
        // - Klik binnen 3 sec van vorige klik: zelfde rondenummer
        // - Klik na 3 sec timeout: nieuwe ronde, reset badges, nieuw nummer
        if (msRoundTimer) {
            // Binnen 3 sec van vorige klik: voeg toe aan huidige ronde
            clearTimeout(msRoundTimer);
            msBadges[studentId] = msRoundNumber;
        } else {
            // Nieuwe ronde: reset badges, increment nummer
            msRoundNumber++;
            msBadges = {};
            msBadges[studentId] = msRoundNumber;
        }
        msRoundTimer = setTimeout(function () { msRoundTimer = null; }, msRoundTimeout);
        render();
    }

    function msGetHighestBadge() {
        var max = 0;
        Object.keys(msBadges).forEach(function (k) {
            if (msBadges[k] > max) max = msBadges[k];
        });
        return max;
    }

    function msGetStudentsWithHighestBadge() {
        var highest = msGetHighestBadge();
        return Object.keys(msBadges).filter(function (k) { return msBadges[k] === highest; });
    }

    function msAssignTask() {
        if (mode !== 'minutenspel') return;
        if (msPhase !== 'picking' && msPhase !== 'taskRevealed') return;
        if (Object.keys(msBadges).length === 0 || tasks.length === 0) return;

        // Stop ronde timer
        if (msRoundTimer) { clearTimeout(msRoundTimer); msRoundTimer = null; }

        var winnerIds = msGetStudentsWithHighestBadge();
        msChosenStudentNames = winnerIds.map(function (sid) {
            var s = students.find(function (x) { return x.id === sid; });
            return s ? studentName(s) : '?';
        });

        var finalTask = tasks[Math.floor(Math.random() * tasks.length)];
        msChosenTask = finalTask;

        // Open task overlay popup
        taskOverlay.style.display = 'flex';
        // Trigger reflow voor animatie
        void taskOverlay.offsetWidth;
        taskOverlay.classList.add('active');
        taskModal.classList.remove('chosen');
        taskModal.classList.add('spinning');
        taskStudents.textContent = msChosenStudentNames.join(', ');
        taskActions.style.display = 'none';

        // Spin-animatie
        var spinDuration = 1500;
        var startTime = Date.now();
        function spinStep() {
            var elapsed = Date.now() - startTime;
            var progress = Math.min(elapsed / spinDuration, 1);
            if (progress < 1) {
                var interval = 50 + (progress * progress * 200);
                taskText.textContent = tasks[Math.floor(Math.random() * tasks.length)];
                setTimeout(spinStep, interval);
            } else {
                taskText.textContent = finalTask;
                taskModal.classList.remove('spinning');
                taskModal.classList.add('chosen');
                // Update Start-knop met aantal minuten
                var minutes = msGetHighestBadge();
                btnTaskStart.innerHTML = '&#9654; Start timer (' + minutes + ' min)';
                taskActions.style.display = 'flex';
                msPhase = 'taskRevealed';
            }
        }
        spinStep();

        // Disable Kies-knop tijdens spin
        var btn = document.getElementById('kprBtnMsTask');
        if (btn) btn.disabled = true;
    }

    function msCloseTaskOverlay() {
        taskOverlay.classList.remove('active');
        // Wacht op transition voor display none
        setTimeout(function () {
            taskOverlay.style.display = 'none';
            taskModal.classList.remove('chosen', 'spinning');
        }, 200);
        msPhase = 'picking';
        render();
    }

    // Wire up popup buttons (één keer)
    btnTaskClose.addEventListener('click', msCloseTaskOverlay);
    taskOverlay.addEventListener('click', function (e) {
        if (e.target === taskOverlay) msCloseTaskOverlay();
    });
    btnTaskReroll.addEventListener('click', function () {
        // Spin opnieuw met dezelfde leerlingen
        if (msPhase !== 'taskRevealed') return;
        msPhase = 'picking'; // tijdelijk om de check in msAssignTask te omzeilen
        msAssignTask();
    });
    btnTaskStart.addEventListener('click', function () {
        if (msPhase !== 'taskRevealed') return;
        var minutes = msGetHighestBadge();
        taskOverlay.classList.remove('active');
        setTimeout(function () {
            taskOverlay.style.display = 'none';
            taskModal.classList.remove('chosen', 'spinning');
        }, 200);
        msStartTimer(minutes);
    });

    function msStartTimer(minutes) {
        if (mode !== 'minutenspel' || msPhase !== 'taskRevealed') return;
        msPhase = 'timerRunning';

        var totalSeconds = minutes * 60;
        var remaining = totalSeconds;

        // Fullscreen overlay
        var overlay = document.createElement('div');
        overlay.className = 'kpr-timer-overlay';
        overlay.id = 'kprTimerOverlay';

        var modal = document.createElement('div');
        modal.className = 'kpr-timer-modal';

        var closeBtn = document.createElement('button');
        closeBtn.className = 'kpr-timer-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', msStopTimer);

        var timeDisplay = document.createElement('div');
        timeDisplay.className = 'kpr-timer-time';
        timeDisplay.textContent = msFormatTime(remaining);

        var progressDiv = document.createElement('div');
        progressDiv.className = 'kpr-timer-progress';
        var progressBar = document.createElement('div');
        progressBar.className = 'kpr-timer-progress-bar';
        progressBar.style.width = '100%';
        progressDiv.appendChild(progressBar);

        var taskDiv = document.createElement('div');
        taskDiv.className = 'kpr-timer-task';
        taskDiv.textContent = msChosenTask;

        var studentDiv = document.createElement('div');
        studentDiv.className = 'kpr-timer-students';
        studentDiv.textContent = msChosenStudentNames.join(', ');

        modal.appendChild(closeBtn);
        modal.appendChild(timeDisplay);
        modal.appendChild(progressDiv);
        modal.appendChild(taskDiv);
        modal.appendChild(studentDiv);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        msCountdownInterval = setInterval(function () {
            remaining--;
            if (remaining <= 0) {
                clearInterval(msCountdownInterval);
                msCountdownInterval = null;
                msTimerDone(overlay, modal);
                return;
            }
            timeDisplay.textContent = msFormatTime(remaining);
            var pct = (remaining / totalSeconds) * 100;
            progressBar.style.width = pct + '%';
            if (pct <= 25 && pct > 10) {
                timeDisplay.classList.add('kpr-timer-warning');
                progressBar.classList.add('kpr-timer-warning');
            } else if (pct <= 10) {
                timeDisplay.classList.remove('kpr-timer-warning');
                progressBar.classList.remove('kpr-timer-warning');
                timeDisplay.classList.add('kpr-timer-danger');
                progressBar.classList.add('kpr-timer-danger');
            }
        }, 1000);
    }

    function msFormatTime(seconds) {
        var m = Math.floor(seconds / 60);
        var s = seconds % 60;
        return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
    }

    function msStopTimer() {
        if (msCountdownInterval) {
            clearInterval(msCountdownInterval);
            msCountdownInterval = null;
        }
        var overlay = document.getElementById('kprTimerOverlay');
        if (overlay) overlay.remove();
        msPhase = 'taskRevealed';
        render();
    }

    function msTimerDone(overlay, modal) {
        msPhase = 'done';
        msShowConfetti();

        modal.innerHTML = '';
        var closeBtn = document.createElement('button');
        closeBtn.className = 'kpr-timer-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', function () {
            overlay.remove();
            render();
        });

        var icon = document.createElement('span');
        icon.className = 'kpr-timer-done-icon';
        icon.innerHTML = '&#127881;';
        var doneText = document.createElement('div');
        doneText.className = 'kpr-timer-done-text';
        doneText.textContent = 'Klaar!';
        var taskDiv = document.createElement('div');
        taskDiv.className = 'kpr-timer-task';
        taskDiv.textContent = msChosenTask;
        var studentDiv = document.createElement('div');
        studentDiv.className = 'kpr-timer-students';
        studentDiv.textContent = msChosenStudentNames.join(', ');
        var doneBtn = document.createElement('button');
        doneBtn.className = 'kpr-timer-done-btn';
        doneBtn.textContent = 'Sluiten';
        doneBtn.addEventListener('click', function () {
            overlay.remove();
            msResetGame();
        });

        modal.appendChild(closeBtn);
        modal.appendChild(icon);
        modal.appendChild(doneText);
        modal.appendChild(taskDiv);
        modal.appendChild(studentDiv);
        modal.appendChild(doneBtn);
    }

    function msShowConfetti() {
        var confettiContainer = document.createElement('div');
        confettiContainer.className = 'kpr-confetti-container';
        document.body.appendChild(confettiContainer);
        var colors = ['#6C63FF', '#FF6B6B', '#51CF66', '#FFA94D', '#22B8CF', '#F06595', '#FFD43B'];
        for (var i = 0; i < 60; i++) {
            var piece = document.createElement('div');
            piece.className = 'kpr-confetti-piece';
            var color = colors[Math.floor(Math.random() * colors.length)];
            var size = 6 + Math.random() * 8;
            var left = Math.random() * 100;
            var duration = 1.5 + Math.random() * 2;
            var delay = Math.random() * 0.8;
            piece.style.width = size + 'px';
            piece.style.height = size + 'px';
            piece.style.background = color;
            piece.style.left = left + '%';
            piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
            piece.style.animationDuration = duration + 's';
            piece.style.animationDelay = delay + 's';
            confettiContainer.appendChild(piece);
        }
        setTimeout(function () { confettiContainer.remove(); }, 4000);
    }

    function msResetGame(silent) {
        msBadges = {};
        msRoundNumber = 0;
        msChosenTask = null;
        msChosenStudentNames = [];
        msPhase = 'picking';
        if (msRoundTimer) { clearTimeout(msRoundTimer); msRoundTimer = null; }
        if (msCountdownInterval) { clearInterval(msCountdownInterval); msCountdownInterval = null; }
        var overlay = document.getElementById('kprTimerOverlay');
        if (overlay) overlay.remove();
        // Sluit task-popup als open
        taskOverlay.classList.remove('active');
        taskOverlay.style.display = 'none';
        taskModal.classList.remove('chosen', 'spinning');
        if (!silent) render();
    }

    // ---------- Aanwezigheid opslaan ----------
    async function saveAttendance() {
        var rowsToUpsert = [];
        var rowsToDelete = [];
        Object.keys(pendingAttendance).forEach(function (studentId) {
            var newAbsent = pendingAttendance[studentId];
            if (newAbsent) {
                rowsToUpsert.push({
                    user_id: currentUser.id,
                    student_id: studentId,
                    date: today(),
                    is_absent: true,
                });
            } else {
                rowsToDelete.push(studentId);
            }
        });

        if (rowsToUpsert.length > 0) {
            await supabase
                .from('klasseprestatie_attendance')
                .upsert(rowsToUpsert, { onConflict: 'student_id,date' });
        }
        if (rowsToDelete.length > 0) {
            await supabase
                .from('klasseprestatie_attendance')
                .delete()
                .in('student_id', rowsToDelete)
                .eq('date', today());
        }

        pendingAttendance = {};
        mode = 'default';
        await loadAttendanceToday();
        render();
    }

    // ---------- Beloningspopup ----------
    function openRewardForSelected() {
        if (selectedStudentIds.size === 0) return;
        openRewardModal(Array.from(selectedStudentIds));
    }

    function openRewardModal(studentIds) {
        pendingTargetStudentIds = studentIds;
        if (studentIds.length === 1) {
            var s = students.find(function (x) { return x.id === studentIds[0]; });
            rewardTitle.textContent = 'Beloning voor ' + studentName(s);
        } else {
            rewardTitle.textContent = 'Beloning voor ' + studentIds.length + ' leerlingen';
        }
        activeRewardTab = 'positief';
        renderRewardGrid();
        rewardModal.classList.add('active');
    }

    function closeRewardModal() {
        rewardModal.classList.remove('active');
        pendingTargetStudentIds = [];
    }

    function renderRewardGrid() {
        rewardTabs.forEach(function (t) {
            t.classList.toggle('active', t.dataset.tab === activeRewardTab);
        });
        var filtered = rewardTypes.filter(function (r) { return r.type === activeRewardTab; });
        var html = '';
        if (!filtered.length) {
            html = '<p class="kpr-empty-msg">Geen ' + activeRewardTab + ' beloningen. Voeg toe via &#9881;&#65039; instellingen.</p>';
        } else {
            filtered.forEach(function (r) {
                var sign = r.type === 'positief' ? '+' : '-';
                var typeClass = r.type === 'positief' ? 'kpr-reward-pos' : 'kpr-reward-neg';
                html += '<button class="kpr-reward-card ' + typeClass + '" data-reward-id="' + r.id + '">' +
                    '<div class="kpr-reward-icon">' + escapeHtml(r.icon) + '</div>' +
                    '<div class="kpr-reward-label">' + escapeHtml(r.label) + '</div>' +
                    '<div class="kpr-reward-value">' + sign + r.points + '</div>' +
                '</button>';
            });
        }
        rewardGrid.innerHTML = html;
        rewardGrid.querySelectorAll('.kpr-reward-card').forEach(function (b) {
            b.addEventListener('click', function () { applyReward(b.dataset.rewardId); });
        });
    }

    rewardTabs.forEach(function (t) {
        t.addEventListener('click', function () {
            activeRewardTab = t.dataset.tab;
            renderRewardGrid();
        });
    });

    btnCloseReward.addEventListener('click', closeRewardModal);
    rewardModal.addEventListener('click', function (e) {
        if (e.target === rewardModal) closeRewardModal();
    });

    async function applyReward(rewardTypeId) {
        var rt = rewardTypes.find(function (r) { return r.id === rewardTypeId; });
        if (!rt || !pendingTargetStudentIds.length) return;

        var signed = rt.type === 'positief' ? rt.points : -rt.points;
        var rows = pendingTargetStudentIds.map(function (sid) {
            return {
                user_id: currentUser.id,
                student_id: sid,
                reward_type_id: rt.id,
                points: signed,
            };
        });
        var { error } = await supabase.from('klasseprestatie_points').insert(rows);
        if (error) {
            alert('Opslaan mislukt: ' + error.message);
            return;
        }

        // Update lokale totals
        pendingTargetStudentIds.forEach(function (sid) {
            pointsByStudent[sid] = (pointsByStudent[sid] || 0) + signed;
        });

        // Korte visuele bevestiging
        flashCards(pendingTargetStudentIds, signed > 0);

        // Verlaten selectie-modus na bulk reward
        if (mode === 'selecteer') {
            selectedStudentIds.clear();
            mode = 'default';
        }

        closeRewardModal();
        render();
    }

    function flashCards(studentIds, isPositive) {
        // Snelle visuele bevestiging via class toggle
        studentIds.forEach(function (sid) {
            var card = document.querySelector('.kpr-student-card[data-student-id="' + sid + '"]');
            if (!card) return;
            card.classList.add(isPositive ? 'kpr-flash-pos' : 'kpr-flash-neg');
            setTimeout(function () {
                card.classList.remove('kpr-flash-pos', 'kpr-flash-neg');
            }, 600);
        });
    }

    // ---------- Settings modal ----------
    btnSettings.addEventListener('click', openSettings);
    btnCloseSettings.addEventListener('click', function () { settingsModal.classList.remove('active'); });
    settingsModal.addEventListener('click', function (e) {
        if (e.target === settingsModal) settingsModal.classList.remove('active');
    });

    function openSettings() {
        // Vul groep dropdown
        selectGroup.innerHTML = '';
        if (!groups.length) {
            selectGroup.innerHTML = '<option value="">Geen klassen beschikbaar</option>';
        } else {
            groups.forEach(function (g) {
                var opt = document.createElement('option');
                opt.value = g.id;
                opt.textContent = g.name;
                if (g.id === selectedGroupId) opt.selected = true;
                selectGroup.appendChild(opt);
            });
        }
        renderSettingsList();
        renderTasksList();
        settingsModal.classList.add('active');
    }

    function renderTasksList() {
        tasksList.innerHTML = '';
        if (tasks.length === 0) {
            tasksList.innerHTML = '<p class="kpr-empty-msg" style="padding:14px;font-size:13px;">Geen taakjes. Voeg hieronder een taakje toe.</p>';
            return;
        }
        tasks.forEach(function (t, idx) {
            var item = document.createElement('div');
            item.className = 'kpr-task-item';

            var text = document.createElement('span');
            text.className = 'kpr-task-text';
            text.textContent = t;

            var editBtn = document.createElement('button');
            editBtn.className = 'kpr-set-btn';
            editBtn.innerHTML = '&#9998;';
            editBtn.title = 'Bewerken';
            editBtn.addEventListener('click', function () { editTaskInline(idx); });

            var delBtn = document.createElement('button');
            delBtn.className = 'kpr-set-btn kpr-set-delete';
            delBtn.innerHTML = '&times;';
            delBtn.title = 'Verwijderen';
            delBtn.addEventListener('click', async function () {
                tasks.splice(idx, 1);
                await saveSettings();
                renderTasksList();
            });

            item.appendChild(text);
            item.appendChild(editBtn);
            item.appendChild(delBtn);
            tasksList.appendChild(item);
        });
    }

    function editTaskInline(idx) {
        var items = tasksList.querySelectorAll('.kpr-task-item');
        var item = items[idx];
        if (!item) return;
        var oldText = tasks[idx];
        item.innerHTML = '';
        var input = document.createElement('input');
        input.type = 'text';
        input.value = oldText;
        input.maxLength = 60;
        input.className = 'kpr-task-edit-input';
        var saveBtn = document.createElement('button');
        saveBtn.className = 'kpr-set-btn';
        saveBtn.innerHTML = '&#10003;';
        var cancelBtn = document.createElement('button');
        cancelBtn.className = 'kpr-set-btn kpr-set-delete';
        cancelBtn.innerHTML = '&times;';

        async function save() {
            var v = input.value.trim();
            if (v) {
                tasks[idx] = v;
                await saveSettings();
            }
            renderTasksList();
        }
        saveBtn.addEventListener('click', save);
        cancelBtn.addEventListener('click', renderTasksList);
        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') save();
            if (e.key === 'Escape') renderTasksList();
        });

        item.appendChild(input);
        item.appendChild(saveBtn);
        item.appendChild(cancelBtn);
        input.focus();
    }

    async function addTask() {
        var v = newTaskInput.value.trim();
        if (!v) return;
        tasks.push(v);
        await saveSettings();
        newTaskInput.value = '';
        renderTasksList();
        newTaskInput.focus();
    }

    btnAddTask.addEventListener('click', addTask);
    newTaskInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') addTask();
    });

    selectGroup.addEventListener('change', async function () {
        selectedGroupId = selectGroup.value;
        await saveSettings();
        await loadStudents();
        await loadPointTotals();
        await loadAttendanceToday();
        render();
    });

    settingsTabs.forEach(function (t) {
        t.addEventListener('click', function () {
            settingsTabs.forEach(function (x) { x.classList.toggle('active', x === t); });
            activeSettingsTab = t.dataset.tab;
            renderSettingsList();
        });
    });

    function renderSettingsList() {
        var filtered = rewardTypes.filter(function (r) { return r.type === activeSettingsTab; });
        var html = '';
        if (!filtered.length) {
            html = '<p class="kpr-empty-msg">Geen ' + activeSettingsTab + ' beloningen. Klik op "Nieuwe toevoegen" hieronder.</p>';
        } else {
            filtered.forEach(function (r) {
                var sign = r.type === 'positief' ? '+' : '-';
                var pillClass = r.type === 'positief' ? 'kpr-set-pos' : 'kpr-set-neg';
                html += '<div class="kpr-settings-item ' + pillClass + '" data-id="' + r.id + '">' +
                    '<div class="kpr-set-icon">' + escapeHtml(r.icon) + '</div>' +
                    '<div class="kpr-set-label">' + escapeHtml(r.label) + '</div>' +
                    '<div class="kpr-set-pts">' + sign + r.points + '</div>' +
                    '<button class="kpr-set-btn kpr-set-edit" data-id="' + r.id + '" title="Bewerken">&#9998;</button>' +
                    '<button class="kpr-set-btn kpr-set-delete" data-id="' + r.id + '" title="Verwijderen">&#128465;&#65039;</button>' +
                '</div>';
            });
        }
        settingsList.innerHTML = html;
        settingsList.querySelectorAll('.kpr-set-edit').forEach(function (b) {
            b.addEventListener('click', function () { openEditModal(b.dataset.id); });
        });
        settingsList.querySelectorAll('.kpr-set-delete').forEach(function (b) {
            b.addEventListener('click', function () { deleteRewardType(b.dataset.id); });
        });
    }

    btnAddReward.addEventListener('click', function () { openEditModal(null); });

    function openEditModal(rewardTypeId) {
        editingRewardType = rewardTypeId
            ? rewardTypes.find(function (r) { return r.id === rewardTypeId; }) || null
            : null;
        editTitle.textContent = editingRewardType ? 'Beloning bewerken' : 'Beloning toevoegen';
        editLabel.value = editingRewardType ? editingRewardType.label : '';
        editPoints.value = editingRewardType ? editingRewardType.points : 1;
        editError.style.display = 'none';
        renderIconPicker(editingRewardType ? editingRewardType.icon : ICON_SET[0]);
        editModal.classList.add('active');
    }

    function renderIconPicker(selectedIcon) {
        iconPicker.innerHTML = '';
        ICON_SET.forEach(function (icon) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'kpr-icon-btn' + (icon === selectedIcon ? ' active' : '');
            btn.dataset.icon = icon;
            btn.textContent = icon;
            btn.addEventListener('click', function () {
                iconPicker.querySelectorAll('.kpr-icon-btn').forEach(function (b) { b.classList.remove('active'); });
                btn.classList.add('active');
            });
            iconPicker.appendChild(btn);
        });
    }

    btnCloseEdit.addEventListener('click', closeEditModal);
    btnCancelEdit.addEventListener('click', closeEditModal);
    editModal.addEventListener('click', function (e) {
        if (e.target === editModal) closeEditModal();
    });

    function closeEditModal() {
        editModal.classList.remove('active');
        editingRewardType = null;
    }

    btnSaveEdit.addEventListener('click', async function () {
        var selectedBtn = iconPicker.querySelector('.kpr-icon-btn.active');
        var icon = selectedBtn ? selectedBtn.dataset.icon : ICON_SET[0];
        var label = editLabel.value.trim();
        var points = parseInt(editPoints.value);

        if (!label) {
            editError.textContent = 'Vul een tekst in.';
            editError.style.display = 'block';
            return;
        }
        if (!(points >= 1 && points <= 20)) {
            editError.textContent = 'Waarde moet tussen 1 en 20 zijn.';
            editError.style.display = 'block';
            return;
        }

        if (editingRewardType) {
            var { error } = await supabase
                .from('klasseprestatie_reward_types')
                .update({ icon: icon, label: label, points: points })
                .eq('id', editingRewardType.id);
            if (error) { editError.textContent = error.message; editError.style.display = 'block'; return; }
        } else {
            var { error } = await supabase
                .from('klasseprestatie_reward_types')
                .insert({
                    user_id: currentUser.id,
                    type: activeSettingsTab,
                    icon: icon,
                    label: label,
                    points: points,
                    sort_order: rewardTypes.filter(function (r) { return r.type === activeSettingsTab; }).length + 1,
                });
            if (error) { editError.textContent = error.message; editError.style.display = 'block'; return; }
        }

        await loadRewardTypes();
        renderSettingsList();
        closeEditModal();
    });

    async function deleteRewardType(rewardTypeId) {
        if (!confirm('Deze beloning verwijderen? Eerder toegekende punten blijven behouden.')) return;
        // Soft delete (archived) zodat punten-historie referenties houdt
        await supabase
            .from('klasseprestatie_reward_types')
            .update({ archived: true })
            .eq('id', rewardTypeId);
        await loadRewardTypes();
        renderSettingsList();
    }

    // ---------- Init ----------
    (async function init() {
        currentUser = await getUser();
        if (!currentUser) return;
        await loadSettings();
        await loadGroups();
        if (!selectedGroupId && groups.length > 0) selectedGroupId = groups[0].id;
        await loadStudents();
        await loadRewardTypes();
        await loadPointTotals();
        await loadAttendanceToday();
        render();
    })();
});

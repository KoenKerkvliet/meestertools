/* ============================================
   VRAAG VAN DE DAG - JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {
    var TOOL_NAME = 'vraagvandedag';

    // Elements
    var container = document.getElementById('vraagContainer');
    var btnSettings = document.getElementById('btnSettings');
    var settingsModal = document.getElementById('settingsModal');
    var btnCloseSettings = document.getElementById('btnCloseSettings');
    var btnSaveSettings = document.getElementById('btnSaveSettings');
    var selectGroup = document.getElementById('selectGroup');

    // State
    var selectedGroupId = null;
    var groups = [];
    var studentNames = [];
    var questions = [];
    var selectedTheme = '';
    var currentQuestion = null;
    var usedQuestionIds = [];
    var isPicking = false;
    var answerRevealed = false;

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
            if (result.data.settings.selectedTheme) selectedTheme = result.data.settings.selectedTheme;
        }

        await loadGroups(user.id);
        await loadStudents(user.id);
        await loadQuestions(user.id);
        render();
    }

    async function saveSettingsToDb() {
        var user = await getSessionUser();
        if (!user) return;

        await supabase
            .from('tool_settings')
            .upsert({
                user_id: user.id,
                tool_name: TOOL_NAME,
                settings: { selectedGroupId: selectedGroupId, selectedTheme: selectedTheme },
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id,tool_name' });
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
        if (!selectedGroupId) { studentNames = []; return; }

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

    async function loadQuestions(userId) {
        var result = await supabase
            .from('daily_questions')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        questions = result.data || [];
    }

    // ---------- Helpers ----------
    function getUniqueThemes() {
        var themes = [];
        for (var i = 0; i < questions.length; i++) {
            if (questions[i].theme && themes.indexOf(questions[i].theme) === -1) {
                themes.push(questions[i].theme);
            }
        }
        return themes.sort();
    }

    function getFilteredQuestions() {
        if (!selectedTheme) return questions;
        return questions.filter(function (q) { return q.theme === selectedTheme; });
    }

    function escapeHtml(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ---------- Render ----------
    function render() {
        if (questions.length === 0) {
            container.innerHTML =
                '<div class="vvdd-empty">' +
                '    <span class="empty-icon">&#10067;</span>' +
                '    <p>Je hebt nog geen vragen toegevoegd.<br>Voeg vragen toe via Instellingen.</p>' +
                '    <button class="btn-open-settings" id="btnGoSettings">Instellingen openen</button>' +
                '</div>';
            var btnGo = document.getElementById('btnGoSettings');
            if (btnGo) btnGo.addEventListener('click', openSettings);
            return;
        }

        var themes = getUniqueThemes();
        var filtered = getFilteredQuestions();
        var html = '';

        // Theme filter
        if (themes.length > 0) {
            html += '<div class="vvdd-theme-filter">';
            html += '<label>Thema:</label>';
            html += '<select id="themeFilter">';
            html += '<option value="">Alle thema\'s (' + questions.length + ')</option>';
            for (var i = 0; i < themes.length; i++) {
                var count = questions.filter(function (q) { return q.theme === themes[i]; }).length;
                var sel = themes[i] === selectedTheme ? ' selected' : '';
                html += '<option value="' + escapeHtml(themes[i]) + '"' + sel + '>' + escapeHtml(themes[i]) + ' (' + count + ')</option>';
            }
            html += '</select>';
            html += '</div>';
        }

        // Question display
        html += '<div class="vvdd-question-display" id="questionDisplay">';
        if (currentQuestion) {
            html += '<span class="vvdd-question-text animate">' + escapeHtml(currentQuestion.question) + '</span>';
        } else {
            html += '<span class="vvdd-question-text placeholder">Druk op de knop om een vraag te tonen</span>';
        }
        html += '</div>';

        // Action buttons
        html += '<div class="vvdd-actions">';
        html += '<button class="vvdd-btn vvdd-btn-question" id="btnNextQuestion">&#10067; ' + (currentQuestion ? 'Volgende vraag' : 'Toon een vraag') + '</button>';
        if (currentQuestion && studentNames.length > 0) {
            html += '<button class="vvdd-btn vvdd-btn-student" id="btnPickStudent">&#127919; Kies een leerling</button>';
        }
        if (currentQuestion) {
            html += '<button class="vvdd-btn vvdd-btn-answer" id="btnRevealAnswer"' + (answerRevealed ? ' disabled' : '') + '>&#128161; Toon antwoord</button>';
        }
        html += '</div>';

        // Student display (if picking)
        if (currentQuestion && studentNames.length > 0) {
            html += '<div class="vvdd-student-display" id="studentDisplay" style="display:none;">';
            html += '<span class="vvdd-student-text" id="studentText"></span>';
            html += '</div>';
        }

        // Answer display
        if (answerRevealed && currentQuestion) {
            html += '<div class="vvdd-answer-display animate">';
            html += '<div class="vvdd-answer-label">Antwoord</div>';
            html += '<div class="vvdd-answer-text">' + escapeHtml(currentQuestion.answer) + '</div>';
            html += '</div>';
        }

        if (filtered.length === 0 && selectedTheme) {
            html += '<p style="color:var(--text-light);text-align:center;font-size:14px;">Geen vragen voor dit thema.</p>';
        }

        container.innerHTML = html;

        // Bind events
        var themeFilter = document.getElementById('themeFilter');
        if (themeFilter) {
            themeFilter.addEventListener('change', function () {
                selectedTheme = this.value;
                currentQuestion = null;
                answerRevealed = false;
                usedQuestionIds = [];
                render();
                saveSettingsToDb();
            });
        }

        var btnNext = document.getElementById('btnNextQuestion');
        if (btnNext) btnNext.addEventListener('click', showNextQuestion);

        var btnPick = document.getElementById('btnPickStudent');
        if (btnPick) btnPick.addEventListener('click', pickStudent);

        var btnReveal = document.getElementById('btnRevealAnswer');
        if (btnReveal) btnReveal.addEventListener('click', revealAnswer);
    }

    // ---------- Show Next Question ----------
    function showNextQuestion() {
        var filtered = getFilteredQuestions();
        if (filtered.length === 0) return;

        // Get unused questions
        var unused = filtered.filter(function (q) {
            return usedQuestionIds.indexOf(q.id) === -1;
        });

        // Reset if all used
        if (unused.length === 0) {
            usedQuestionIds = [];
            unused = filtered;
        }

        // Pick random
        var idx = Math.floor(Math.random() * unused.length);
        currentQuestion = unused[idx];
        usedQuestionIds.push(currentQuestion.id);
        answerRevealed = false;

        render();
    }

    // ---------- Pick Student ----------
    async function pickStudent() {
        if (isPicking || studentNames.length === 0) return;

        isPicking = true;
        var studentDisplay = document.getElementById('studentDisplay');
        var studentText = document.getElementById('studentText');
        var btnPick = document.getElementById('btnPickStudent');

        if (!studentDisplay || !studentText) { isPicking = false; return; }

        studentDisplay.style.display = 'flex';
        btnPick.disabled = true;

        // Choose final name
        var finalIndex = Math.floor(Math.random() * studentNames.length);
        var finalName = studentNames[finalIndex];

        // Spinning animation
        studentDisplay.className = 'vvdd-student-display spinning';

        var spinDuration = 1500;
        var startTime = Date.now();
        var allNames = studentNames.slice();

        function spinStep() {
            var elapsed = Date.now() - startTime;
            var progress = Math.min(elapsed / spinDuration, 1);

            if (progress < 1) {
                var interval = 50 + (progress * progress * 200);
                var randomName = allNames[Math.floor(Math.random() * allNames.length)];
                studentText.textContent = randomName;
                setTimeout(spinStep, interval);
            } else {
                studentDisplay.className = 'vvdd-student-display chosen';
                studentText.textContent = finalName;
                isPicking = false;
                btnPick.disabled = false;
            }
        }

        spinStep();
    }

    // ---------- Reveal Answer ----------
    function revealAnswer() {
        answerRevealed = true;
        render();
    }

    // ---------- Settings Modal ----------
    function openSettings() {
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

        renderQuestionList();
        updateThemeDatalist();
        settingsModal.classList.add('active');
    }

    btnSettings.addEventListener('click', openSettings);

    btnCloseSettings.addEventListener('click', function () {
        settingsModal.classList.remove('active');
    });

    settingsModal.addEventListener('click', function (e) {
        if (e.target === settingsModal) settingsModal.classList.remove('active');
    });

    btnSaveSettings.addEventListener('click', async function () {
        var newGroupId = selectGroup.value;

        if (newGroupId !== selectedGroupId) {
            selectedGroupId = newGroupId;
            var user = await getSessionUser();
            if (user) await loadStudents(user.id);
        }

        await saveSettingsToDb();
        settingsModal.classList.remove('active');
        render();
    });

    // ---------- Question CRUD ----------
    function updateThemeDatalist() {
        var themes = getUniqueThemes();
        var lists = [document.getElementById('themesList'), document.getElementById('themesListEdit')];
        lists.forEach(function (list) {
            if (!list) return;
            list.innerHTML = '';
            themes.forEach(function (t) {
                var opt = document.createElement('option');
                opt.value = t;
                list.appendChild(opt);
            });
        });
    }

    function renderQuestionList() {
        var listEl = document.getElementById('questionsList');
        if (!listEl) return;

        if (questions.length === 0) {
            listEl.innerHTML = '<p style="color:var(--text-light);text-align:center;padding:20px 0;">Nog geen vragen toegevoegd.</p>';
            return;
        }

        listEl.innerHTML = '';
        questions.forEach(function (q) {
            var item = document.createElement('div');
            item.className = 'vvdd-question-item';

            var text = document.createElement('span');
            text.className = 'vvdd-question-item-text';
            text.textContent = q.question;
            text.title = q.question + ' → ' + q.answer;
            item.appendChild(text);

            if (q.theme) {
                var badge = document.createElement('span');
                badge.className = 'theme-badge';
                badge.textContent = q.theme;
                item.appendChild(badge);
            }

            var actions = document.createElement('div');
            actions.className = 'vvdd-question-item-actions';

            var editBtn = document.createElement('button');
            editBtn.className = 'edit';
            editBtn.innerHTML = '&#9998;';
            editBtn.title = 'Bewerken';
            editBtn.addEventListener('click', function () {
                openEditQuestion(q.id, q.question, q.answer, q.theme || '');
            });
            actions.appendChild(editBtn);

            var delBtn = document.createElement('button');
            delBtn.className = 'delete';
            delBtn.innerHTML = '&times;';
            delBtn.title = 'Verwijderen';
            delBtn.addEventListener('click', function () {
                deleteQuestion(q.id);
            });
            actions.appendChild(delBtn);

            item.appendChild(actions);
            listEl.appendChild(item);
        });
    }

    // Add question
    var addQuestionBtn = document.getElementById('addQuestionBtn');
    var newQuestionInput = document.getElementById('newQuestion');
    var newAnswerInput = document.getElementById('newAnswer');
    var newThemeInput = document.getElementById('newTheme');

    if (addQuestionBtn) {
        addQuestionBtn.addEventListener('click', addQuestion);
    }

    async function addQuestion() {
        var question = newQuestionInput.value.trim();
        var answer = newAnswerInput.value.trim();
        var theme = newThemeInput.value.trim();

        if (!question || !answer) {
            alert('Vul zowel een vraag als een antwoord in.');
            return;
        }

        var user = await getSessionUser();
        if (!user) return;

        var insertData = { user_id: user.id, question: question, answer: answer };
        if (theme) insertData.theme = theme;

        var result = await supabase.from('daily_questions').insert(insertData);

        if (result.error) {
            alert('Fout bij toevoegen: ' + result.error.message);
            return;
        }

        newQuestionInput.value = '';
        newAnswerInput.value = '';
        newThemeInput.value = '';
        newQuestionInput.focus();

        await loadQuestions(user.id);
        renderQuestionList();
        updateThemeDatalist();
    }

    // Delete question
    async function deleteQuestion(id) {
        if (!confirm('Weet je zeker dat je deze vraag wilt verwijderen?')) return;

        var result = await supabase.from('daily_questions').delete().eq('id', id);

        if (result.error) {
            alert('Fout bij verwijderen: ' + result.error.message);
            return;
        }

        var user = await getSessionUser();
        if (user) await loadQuestions(user.id);
        renderQuestionList();
        updateThemeDatalist();

        // If deleted question was current, reset
        if (currentQuestion && currentQuestion.id === id) {
            currentQuestion = null;
            answerRevealed = false;
        }
    }

    // Edit question
    function openEditQuestion(id, question, answer, theme) {
        document.getElementById('editQuestionId').value = id;
        document.getElementById('editQuestionInput').value = question;
        document.getElementById('editAnswerInput').value = answer;
        document.getElementById('editThemeInput').value = theme;
        updateThemeDatalist();
        document.getElementById('editQuestionModal').classList.add('active');
        setTimeout(function () { document.getElementById('editQuestionInput').focus(); }, 100);
    }

    document.getElementById('saveEditQuestion').addEventListener('click', async function () {
        var id = document.getElementById('editQuestionId').value;
        var question = document.getElementById('editQuestionInput').value.trim();
        var answer = document.getElementById('editAnswerInput').value.trim();
        var theme = document.getElementById('editThemeInput').value.trim();

        if (!question || !answer) {
            alert('Vul zowel een vraag als een antwoord in.');
            return;
        }

        var result = await supabase
            .from('daily_questions')
            .update({ question: question, answer: answer, theme: theme || null })
            .eq('id', id);

        if (result.error) {
            alert('Fout bij opslaan: ' + result.error.message);
            return;
        }

        document.getElementById('editQuestionModal').classList.remove('active');

        var user = await getSessionUser();
        if (user) await loadQuestions(user.id);
        renderQuestionList();
        updateThemeDatalist();

        // Update current question if it was edited
        if (currentQuestion && currentQuestion.id === id) {
            currentQuestion = questions.find(function (q) { return q.id === id; });
        }
    });

    document.getElementById('closeEditQuestion').addEventListener('click', function () {
        document.getElementById('editQuestionModal').classList.remove('active');
    });

    document.getElementById('cancelEditQuestion').addEventListener('click', function () {
        document.getElementById('editQuestionModal').classList.remove('active');
    });

    document.getElementById('editQuestionModal').addEventListener('click', function (e) {
        if (e.target === this) this.classList.remove('active');
    });

    // Escape to close modals
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            if (document.getElementById('editQuestionModal').classList.contains('active')) {
                document.getElementById('editQuestionModal').classList.remove('active');
            } else if (settingsModal.classList.contains('active')) {
                settingsModal.classList.remove('active');
            }
        }
    });

    // ---------- Init ----------
    loadSettings();
});

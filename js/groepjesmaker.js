/* ============================================
   GROEPJESMAKER - JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    const TOOL_NAME = 'groepjesmaker';

    // Elements
    const container = document.getElementById('groepjesContainer');
    const btnSettings = document.getElementById('btnSettings');
    const settingsModal = document.getElementById('settingsModal');
    const btnCloseSettings = document.getElementById('btnCloseSettings');
    const btnSaveSettings = document.getElementById('btnSaveSettings');
    const selectGroup = document.getElementById('selectGroup');
    const splitCountSelect = document.getElementById('splitCount');
    const splitCountLabel = document.getElementById('splitCountLabel');

    // State
    let selectedGroupId = null;
    let splitMethod = 'numGroups';
    let splitCount = 2;
    let groups = [];
    let studentNames = [];
    let isShuffling = false;

    // ---------- Supabase Settings ----------
    async function getSessionUser() {
        const { data: { session } } = await supabase.auth.getSession();
        return session?.user || null;
    }

    async function loadSettings() {
        const user = await getSessionUser();
        if (!user) return;

        // Load tool settings
        const { data } = await supabase
            .from('tool_settings')
            .select('settings')
            .eq('user_id', user.id)
            .eq('tool_name', TOOL_NAME)
            .single();

        if (data && data.settings) {
            if (data.settings.selectedGroupId) selectedGroupId = data.settings.selectedGroupId;
            if (data.settings.splitMethod) splitMethod = data.settings.splitMethod;
            if (data.settings.splitCount) splitCount = data.settings.splitCount;
        }

        // Load user's groups
        await loadGroups(user.id);

        // Load students for selected group
        await loadStudents(user.id);

        render();
    }

    async function loadGroups(userId) {
        const { data } = await supabase
            .from('groups')
            .select('id, name')
            .eq('user_id', userId)
            .eq('archived', false)
            .order('created_at', { ascending: true });

        groups = data || [];

        // If selected group not in list, auto-select first
        if (groups.length > 0 && !groups.find(g => g.id === selectedGroupId)) {
            selectedGroupId = groups[0].id;
        }
    }

    async function loadStudents(userId) {
        if (!selectedGroupId) {
            studentNames = [];
            return;
        }

        const { data } = await supabase
            .from('students')
            .select('first_name, last_name')
            .eq('group_id', selectedGroupId)
            .eq('user_id', userId)
            .eq('archived', false)
            .order('student_number', { ascending: true });

        studentNames = (data || []).map(s => {
            return s.last_name ? s.first_name + ' ' + s.last_name : s.first_name;
        });
    }

    async function saveSettingsToDb() {
        const user = await getSessionUser();
        if (!user) return;

        await supabase
            .from('tool_settings')
            .upsert({
                user_id: user.id,
                tool_name: TOOL_NAME,
                settings: { selectedGroupId, splitMethod, splitCount },
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id,tool_name' });
    }

    // ---------- Render ----------
    function render() {
        if (groups.length === 0) {
            container.innerHTML = [
                '<div class="groepjesmaker-empty">',
                '    <span class="empty-icon">&#128101;</span>',
                '    <p>Je hebt nog geen groepen met leerlingen.<br>',
                '    Voeg eerst leerlingen toe via Instellingen.</p>',
                '    <button class="btn-open-settings" id="btnGoToKlas">Ga naar Mijn klas</button>',
                '</div>'
            ].join('\n');
            bindGoToKlas();
            return;
        }

        if (studentNames.length === 0) {
            container.innerHTML = [
                '<div class="groepjesmaker-empty">',
                '    <span class="empty-icon">&#128101;</span>',
                '    <p>Deze groep heeft nog geen leerlingen.<br>',
                '    Voeg leerlingen toe via Instellingen of kies een andere groep.</p>',
                '    <button class="btn-open-settings" id="btnGoToKlas">Ga naar Mijn klas</button>',
                '</div>'
            ].join('\n');
            bindGoToKlas();
            return;
        }

        container.innerHTML = [
            '<button class="groepjes-shuffle-btn" id="btnShuffle">&#128256; Verdeel in groepjes</button>',
            '<div class="groepjes-result" id="groepjesResult"></div>'
        ].join('\n');

        document.getElementById('btnShuffle').addEventListener('click', shuffleGroups);
    }

    function bindGoToKlas() {
        const btn = document.getElementById('btnGoToKlas');
        if (btn) {
            btn.addEventListener('click', () => {
                if (typeof openInstellingen === 'function') openInstellingen('mijnklas');
            });
        }
    }

    // ---------- Shuffle Logic ----------
    function shuffleArray(arr) {
        const shuffled = arr.slice();
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = shuffled[i];
            shuffled[i] = shuffled[j];
            shuffled[j] = temp;
        }
        return shuffled;
    }

    function divideIntoGroups(names, method, count) {
        const shuffled = shuffleArray(names);
        const result = [];

        if (method === 'numGroups') {
            var numGroups = Math.min(count, shuffled.length);
            for (var i = 0; i < numGroups; i++) {
                result.push([]);
            }
            shuffled.forEach(function (name, idx) {
                result[idx % numGroups].push(name);
            });
        } else {
            var perGroup = count;
            for (var i = 0; i < shuffled.length; i += perGroup) {
                result.push(shuffled.slice(i, i + perGroup));
            }
        }

        return result;
    }

    async function shuffleGroups() {
        if (isShuffling) return;
        isShuffling = true;

        var btn = document.getElementById('btnShuffle');
        var resultEl = document.getElementById('groepjesResult');
        btn.disabled = true;

        // Clear previous result
        resultEl.innerHTML = '';

        // Visual feedback
        btn.innerHTML = '&#128256; Bezig met verdelen...';

        // Small delay for effect
        await new Promise(function (resolve) { setTimeout(resolve, 400); });

        // Calculate groups
        var result = divideIntoGroups(studentNames, splitMethod, splitCount);

        // Render groups with staggered animation
        var html = '';
        for (var i = 0; i < result.length; i++) {
            var group = result[i];
            var delay = i * 80;
            html += '<div class="groepje-card" style="animation-delay: ' + delay + 'ms">';
            html += '<div class="groepje-header">Groepje ' + (i + 1);
            html += '<span class="groepje-count">' + group.length + ' leerling' + (group.length !== 1 ? 'en' : '') + '</span>';
            html += '</div>';
            html += '<div class="groepje-body">';
            for (var j = 0; j < group.length; j++) {
                html += '<div class="student-name">' + escapeHtml(group[j]) + '</div>';
            }
            html += '</div></div>';
        }
        resultEl.innerHTML = html;

        btn.innerHTML = '&#128256; Opnieuw verdelen';
        btn.disabled = false;
        isShuffling = false;
    }

    // ---------- Settings Modal ----------
    function populateSettings() {
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

        // Set split method radio
        var radios = document.querySelectorAll('input[name="splitMethod"]');
        for (var i = 0; i < radios.length; i++) {
            radios[i].checked = radios[i].value === splitMethod;
        }

        updateSplitLabel();
        splitCountSelect.value = splitCount;
    }

    function updateSplitLabel() {
        if (splitMethod === 'numGroups') {
            splitCountLabel.textContent = 'Aantal groepjes';
        } else {
            splitCountLabel.textContent = 'Leerlingen per groepje';
        }
    }

    btnSettings.addEventListener('click', function () {
        populateSettings();
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

    // Radio change
    var radios = document.querySelectorAll('input[name="splitMethod"]');
    for (var i = 0; i < radios.length; i++) {
        radios[i].addEventListener('change', function (e) {
            splitMethod = e.target.value;
            updateSplitLabel();
        });
    }

    function closeModal() {
        settingsModal.classList.remove('active');
    }

    btnSaveSettings.addEventListener('click', async function () {
        var newGroupId = selectGroup.value;
        var checkedRadio = document.querySelector('input[name="splitMethod"]:checked');
        var newSplitMethod = checkedRadio ? checkedRadio.value : 'numGroups';
        var newSplitCount = parseInt(splitCountSelect.value) || 2;

        splitMethod = newSplitMethod;
        splitCount = newSplitCount;

        if (newGroupId !== selectedGroupId) {
            selectedGroupId = newGroupId;
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

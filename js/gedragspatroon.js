/* ============================================
   GEDRAGSPATROON TOOL - JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    const TOOL_NAME = 'gedragspatroon';

    // ---------- DOM Elements ----------
    const btnSettings = document.getElementById('btnSettings');
    const settingsModal = document.getElementById('settingsModal');
    const btnCloseSettings = document.getElementById('btnCloseSettings');
    const btnSaveSettings = document.getElementById('btnSaveSettings');
    const settingMode = document.getElementById('settingMode');
    const settingGroup = document.getElementById('settingGroup');
    const settingDisplayType = document.getElementById('settingDisplayType');
    const groupSelectGroup = document.getElementById('groupSelectGroup');
    const segmentsList = document.getElementById('segmentsList');
    const btnAddSegment = document.getElementById('btnAddSegment');
    const btnPrevWeek = document.getElementById('btnPrevWeek');
    const btnNextWeek = document.getElementById('btnNextWeek');
    const weekLabel = document.getElementById('weekLabel');
    const studentSelectWrapper = document.getElementById('studentSelectWrapper');
    const studentSelect = document.getElementById('studentSelect');
    const gpGrid = document.getElementById('gpGrid');
    const gpGridHead = document.getElementById('gpGridHead');
    const gpGridBody = document.getElementById('gpGridBody');
    const gpLegend = document.getElementById('gpLegend');

    if (!gpGrid) return;

    // ---------- Constants ----------
    const DAY_NAMES = ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag'];
    const DAY_SHORT = ['Ma', 'Di', 'Wo', 'Do', 'Vr'];

    const VALUE_LABELS = {
        colors: { 3: 'Goed', 2: 'Matig', 1: 'Niet goed' },
        smileys: { 3: '\u{1F604}', 2: '\u{1F610}', 1: '\u{1F622}' }
    };

    const COLOR_CLASSES = { 3: 'color-good', 2: 'color-moderate', 1: 'color-bad' };
    const SMILEY_MAP = { 3: '\u{1F604}', 2: '\u{1F610}', 1: '\u{1F622}' };

    const DEFAULT_SEGMENTS = ['Ochtend', 'Kleine pauze', 'Na de kleine pauze', 'Grote pauze', 'Middag'];

    // ---------- State ----------
    let mode = 'class'; // 'class' | 'individual'
    let displayType = 'colors'; // 'colors' | 'smileys'
    let segments = [...DEFAULT_SEGMENTS];
    let selectedGroupId = null;
    let selectedStudentId = null;
    let weekOffset = 0; // 0 = current week, -1 = last week, etc.
    let data = { class: {}, students: {} };
    let students = [];
    let groups = [];

    // ---------- Date Helpers ----------
    function getWeekDates(offset = 0) {
        const now = new Date();
        now.setDate(now.getDate() + offset * 7);
        const day = now.getDay(); // 0=Sun, 1=Mon...
        const mondayOffset = day === 0 ? -6 : 1 - day;
        const monday = new Date(now);
        monday.setDate(now.getDate() + mondayOffset);

        const dates = [];
        for (let i = 0; i < 5; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            dates.push(formatDate(d));
        }
        return dates;
    }

    function formatDate(d) {
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }

    function getTodayKey() {
        return formatDate(new Date());
    }

    function getWeekNumber(dateStr) {
        const d = new Date(dateStr);
        const onejan = new Date(d.getFullYear(), 0, 1);
        const days = Math.floor((d - onejan) / 86400000);
        return Math.ceil((days + onejan.getDay() + 1) / 7);
    }

    function formatWeekLabel() {
        const dates = getWeekDates(weekOffset);
        const weekNum = getWeekNumber(dates[0]);
        const fmtShort = d => {
            const p = d.split('-');
            return parseInt(p[2]) + ' ' + ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'][parseInt(p[1]) - 1];
        };
        return `Week ${weekNum} (${fmtShort(dates[0])} - ${fmtShort(dates[4])})`;
    }

    // ---------- Supabase Helpers ----------
    async function getSessionUser() {
        const { data: { session } } = await supabase.auth.getSession();
        return session?.user || null;
    }

    async function loadSettings() {
        const user = await getSessionUser();
        if (!user) return;
        const { data: settingsData } = await supabase
            .from('tool_settings')
            .select('settings')
            .eq('user_id', user.id)
            .eq('tool_name', TOOL_NAME)
            .single();

        if (settingsData && settingsData.settings) {
            const s = settingsData.settings;
            if (s.mode) mode = s.mode;
            if (s.displayType) displayType = s.displayType;
            if (Array.isArray(s.segments) && s.segments.length > 0) segments = s.segments;
            if (s.selectedGroupId) selectedGroupId = s.selectedGroupId;
            if (s.data) data = s.data;
            // Ensure data structure
            if (!data.class) data.class = {};
            if (!data.students) data.students = {};
        }
    }

    async function saveSettingsToDb() {
        const user = await getSessionUser();
        if (!user) return;
        await supabase
            .from('tool_settings')
            .upsert({
                user_id: user.id,
                tool_name: TOOL_NAME,
                settings: { mode, displayType, segments, selectedGroupId, data },
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id,tool_name' });
    }

    async function loadGroups() {
        const user = await getSessionUser();
        if (!user) return;
        const { data: groupData } = await supabase
            .from('groups')
            .select('id, name')
            .eq('user_id', user.id)
            .eq('archived', false)
            .order('name');
        groups = groupData || [];
    }

    async function loadStudents() {
        if (!selectedGroupId) {
            students = [];
            return;
        }
        const user = await getSessionUser();
        if (!user) return;
        const { data: studentData } = await supabase
            .from('students')
            .select('id, first_name, last_name')
            .eq('group_id', selectedGroupId)
            .eq('user_id', user.id)
            .eq('archived', false)
            .order('student_number', { ascending: true });
        students = studentData || [];
    }

    // ---------- Data Access ----------
    function getCellValue(dateKey, segmentIndex) {
        if (mode === 'class') {
            return data.class[dateKey]?.[segmentIndex] ?? null;
        } else {
            if (!selectedStudentId) return null;
            return data.students[selectedStudentId]?.[dateKey]?.[segmentIndex] ?? null;
        }
    }

    function setCellValue(dateKey, segmentIndex, value) {
        if (mode === 'class') {
            if (!data.class[dateKey]) {
                data.class[dateKey] = new Array(segments.length).fill(null);
            }
            // Ensure array is long enough
            while (data.class[dateKey].length < segments.length) {
                data.class[dateKey].push(null);
            }
            data.class[dateKey][segmentIndex] = value;
        } else {
            if (!selectedStudentId) return;
            if (!data.students[selectedStudentId]) {
                data.students[selectedStudentId] = {};
            }
            if (!data.students[selectedStudentId][dateKey]) {
                data.students[selectedStudentId][dateKey] = new Array(segments.length).fill(null);
            }
            while (data.students[selectedStudentId][dateKey].length < segments.length) {
                data.students[selectedStudentId][dateKey].push(null);
            }
            data.students[selectedStudentId][dateKey][segmentIndex] = value;
        }
        saveSettingsToDb();
    }

    // Cycle: null → 3 (good) → 2 (moderate) → 1 (bad) → null
    function cycleValue(current) {
        if (current === null) return 3;
        if (current === 3) return 2;
        if (current === 2) return 1;
        return null;
    }

    // ---------- Build UI ----------
    function buildUI() {
        renderLegend();
        renderWeekLabel();
        renderStudentSelect();
        renderGrid();
    }

    // ---------- Legend ----------
    function renderLegend() {
        gpLegend.innerHTML = '';

        const items = [
            { value: 3, label: 'Goed' },
            { value: 2, label: 'Matig' },
            { value: 1, label: 'Niet goed' }
        ];

        items.forEach(item => {
            const el = document.createElement('div');
            el.className = 'gp-legend-item';

            if (displayType === 'colors') {
                const dot = document.createElement('span');
                dot.className = 'gp-legend-dot ' + COLOR_CLASSES[item.value];
                el.appendChild(dot);
            } else {
                const emoji = document.createElement('span');
                emoji.className = 'gp-legend-emoji';
                emoji.textContent = SMILEY_MAP[item.value];
                el.appendChild(emoji);
            }

            const label = document.createElement('span');
            label.textContent = item.label;
            el.appendChild(label);

            gpLegend.appendChild(el);
        });

        // Add empty indicator
        const emptyEl = document.createElement('div');
        emptyEl.className = 'gp-legend-item';
        const emptyDot = document.createElement('span');
        emptyDot.className = 'gp-legend-dot';
        emptyDot.style.border = '2px dashed #E0E0EA';
        emptyDot.style.background = 'transparent';
        emptyEl.appendChild(emptyDot);
        const emptyLabel = document.createElement('span');
        emptyLabel.textContent = 'Niet ingevuld';
        emptyEl.appendChild(emptyLabel);
        gpLegend.appendChild(emptyEl);
    }

    // ---------- Week Navigation ----------
    function renderWeekLabel() {
        weekLabel.textContent = formatWeekLabel();
    }

    btnPrevWeek.addEventListener('click', () => {
        weekOffset--;
        renderWeekLabel();
        renderGrid();
    });

    btnNextWeek.addEventListener('click', () => {
        weekOffset++;
        renderWeekLabel();
        renderGrid();
    });

    // ---------- Student Select ----------
    function renderStudentSelect() {
        if (mode === 'individual' && students.length > 0) {
            studentSelectWrapper.style.display = '';
            studentSelect.innerHTML = '<option value="">Selecteer leerling...</option>';
            students.forEach(s => {
                const opt = document.createElement('option');
                opt.value = s.id;
                opt.textContent = s.last_name ? s.first_name + ' ' + s.last_name : s.first_name;
                if (s.id === selectedStudentId) opt.selected = true;
                studentSelect.appendChild(opt);
            });
        } else {
            studentSelectWrapper.style.display = 'none';
        }
    }

    studentSelect.addEventListener('change', () => {
        selectedStudentId = studentSelect.value || null;
        renderGrid();
    });

    // ---------- Render Grid ----------
    function renderGrid() {
        const weekDates = getWeekDates(weekOffset);
        const todayKey = getTodayKey();

        // Show empty state for individual mode without student
        if (mode === 'individual' && !selectedStudentId) {
            gpGridHead.innerHTML = '';
            gpGridBody.innerHTML = '';
            const wrapper = gpGrid.closest('.gp-grid-wrapper');
            // Replace with empty state
            let emptyState = wrapper.querySelector('.gp-empty-state');
            if (!emptyState) {
                emptyState = document.createElement('div');
                emptyState.className = 'gp-empty-state';
                emptyState.innerHTML = '<div class="empty-icon">\u{1F464}</div><p>Selecteer een leerling om het gedragspatroon te bekijken.</p>';
                wrapper.appendChild(emptyState);
            }
            emptyState.style.display = '';
            gpGrid.style.display = 'none';
            return;
        }

        // Remove empty state
        const wrapper = gpGrid.closest('.gp-grid-wrapper');
        const emptyState = wrapper.querySelector('.gp-empty-state');
        if (emptyState) emptyState.style.display = 'none';
        gpGrid.style.display = '';

        // Header
        gpGridHead.innerHTML = '';
        const headerRow = document.createElement('tr');
        const dayTh = document.createElement('th');
        dayTh.textContent = 'Dag';
        headerRow.appendChild(dayTh);

        segments.forEach(seg => {
            const th = document.createElement('th');
            th.textContent = seg;
            headerRow.appendChild(th);
        });
        gpGridHead.appendChild(headerRow);

        // Body
        gpGridBody.innerHTML = '';
        weekDates.forEach((dateKey, dayIndex) => {
            const row = document.createElement('tr');
            if (dateKey === todayKey) row.classList.add('today');

            // Day name cell
            const dayTd = document.createElement('td');
            const dayFull = DAY_NAMES[dayIndex];
            const dateParts = dateKey.split('-');
            dayTd.innerHTML = `<strong>${dayFull}</strong><br><small style="color:var(--text-light);font-weight:400;">${dateParts[2]}-${dateParts[1]}</small>`;
            row.appendChild(dayTd);

            // Segment cells
            segments.forEach((_, segIndex) => {
                const td = document.createElement('td');
                const cell = document.createElement('div');
                cell.className = 'gp-cell';

                const value = getCellValue(dateKey, segIndex);
                applyCellStyle(cell, value);

                cell.addEventListener('click', () => {
                    const currentVal = getCellValue(dateKey, segIndex);
                    const newVal = cycleValue(currentVal);
                    setCellValue(dateKey, segIndex, newVal);
                    applyCellStyle(cell, newVal);

                    // Pop animation
                    cell.classList.remove('popping');
                    void cell.offsetWidth;
                    cell.classList.add('popping');
                    setTimeout(() => cell.classList.remove('popping'), 300);
                });

                td.appendChild(cell);
                row.appendChild(td);
            });

            gpGridBody.appendChild(row);
        });
    }

    function applyCellStyle(cell, value) {
        // Reset
        cell.className = 'gp-cell';
        cell.textContent = '';

        if (value === null) return;

        if (displayType === 'colors') {
            cell.classList.add(COLOR_CLASSES[value]);
        } else {
            cell.classList.add('smiley-filled');
            cell.textContent = SMILEY_MAP[value];
        }
    }

    // ---------- Settings Modal ----------
    let tempSegments = [];

    function openModal() {
        settingMode.value = mode;
        settingDisplayType.value = displayType;
        tempSegments = [...segments];
        renderSegmentsList();
        updateModeVisibility();
        loadGroupsIntoSelect();
        settingsModal.classList.add('active');
    }

    function closeModal() {
        settingsModal.classList.remove('active');
    }

    function updateModeVisibility() {
        groupSelectGroup.style.display = settingMode.value === 'individual' ? '' : 'none';
    }

    settingMode.addEventListener('change', updateModeVisibility);

    async function loadGroupsIntoSelect() {
        await loadGroups();
        settingGroup.innerHTML = '<option value="">Selecteer groep...</option>';
        groups.forEach(g => {
            const opt = document.createElement('option');
            opt.value = g.id;
            opt.textContent = g.name;
            if (g.id === selectedGroupId) opt.selected = true;
            settingGroup.appendChild(opt);
        });
    }

    function renderSegmentsList() {
        segmentsList.innerHTML = '';
        tempSegments.forEach((seg, i) => {
            const item = document.createElement('div');
            item.className = 'gp-segment-item';

            const input = document.createElement('input');
            input.type = 'text';
            input.value = seg;
            input.placeholder = 'Naam dagdeel';
            input.addEventListener('input', () => {
                tempSegments[i] = input.value;
            });

            const removeBtn = document.createElement('button');
            removeBtn.className = 'gp-segment-remove';
            removeBtn.innerHTML = '&times;';
            removeBtn.title = 'Verwijderen';
            removeBtn.addEventListener('click', () => {
                if (tempSegments.length <= 1) return; // At least 1 segment
                tempSegments.splice(i, 1);
                renderSegmentsList();
            });

            item.appendChild(input);
            item.appendChild(removeBtn);
            segmentsList.appendChild(item);
        });
    }

    btnAddSegment.addEventListener('click', () => {
        tempSegments.push('');
        renderSegmentsList();
        // Focus the new input
        const inputs = segmentsList.querySelectorAll('input');
        if (inputs.length > 0) inputs[inputs.length - 1].focus();
    });

    btnSettings.addEventListener('click', openModal);
    btnCloseSettings.addEventListener('click', closeModal);

    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && settingsModal.classList.contains('active')) {
            closeModal();
        }
    });

    btnSaveSettings.addEventListener('click', async () => {
        mode = settingMode.value;
        displayType = settingDisplayType.value;

        // Filter empty segments and save
        segments = tempSegments.filter(s => s.trim() !== '');
        if (segments.length === 0) segments = [...DEFAULT_SEGMENTS];

        const newGroupId = settingGroup.value || null;
        if (newGroupId !== selectedGroupId) {
            selectedGroupId = newGroupId;
            selectedStudentId = null;
            await loadStudents();
        }

        await saveSettingsToDb();
        buildUI();
        closeModal();
    });

    // ---------- Init ----------
    async function init() {
        await loadSettings();
        if (mode === 'individual' && selectedGroupId) {
            await loadStudents();
        }
        buildUI();
    }
    init();
});

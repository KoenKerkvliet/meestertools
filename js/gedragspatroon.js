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
    const studentSelectWrapper = document.getElementById('studentSelectWrapper');
    const studentSelect = document.getElementById('studentSelect');
    const emptyState = document.getElementById('emptyState');

    // Day view
    const btnPrevDay = document.getElementById('btnPrevDay');
    const btnNextDay = document.getElementById('btnNextDay');
    const dayLabel = document.getElementById('dayLabel');
    const dayChart = document.getElementById('dayChart');
    const chartColumns = document.getElementById('chartColumns');
    const connectionLine = document.getElementById('connectionLine');
    const xAxisLabels = document.getElementById('xAxisLabels');
    const gpLegend = document.getElementById('gpLegend');

    // Week view
    const btnPrevWeek = document.getElementById('btnPrevWeek');
    const btnNextWeek = document.getElementById('btnNextWeek');
    const weekLabel = document.getElementById('weekLabel');
    const weekGridHead = document.getElementById('weekGridHead');
    const weekGridBody = document.getElementById('weekGridBody');
    const btnDownloadPdf = document.getElementById('btnDownloadPdf');

    // Note popup
    const notePopup = document.getElementById('notePopup');
    const noteInput = document.getElementById('noteInput');
    const btnNoteSave = document.getElementById('btnNoteSave');
    const btnNoteDelete = document.getElementById('btnNoteDelete');
    const btnNoteClose = document.getElementById('btnNoteClose');

    if (!chartColumns) return;

    // ---------- Constants ----------
    const DAY_NAMES = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];
    const DAY_NAMES_SHORT = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'];
    const MONTH_NAMES = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
    const WEEKDAY_NAMES = ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag'];

    const LEVELS = [
        { value: 3, label: 'Goed', color: '#6BCB77', colorBorder: '#5AB868', markerClass: 'marker-good', weekClass: 'wc-good', smiley: '\u{1F604}' },
        { value: 2, label: 'Matig', color: '#FFB347', colorBorder: '#E8A33E', markerClass: 'marker-moderate', weekClass: 'wc-moderate', smiley: '\u{1F610}' },
        { value: 1, label: 'Niet goed', color: '#FF6B6B', colorBorder: '#E85D5D', markerClass: 'marker-bad', weekClass: 'wc-bad', smiley: '\u{1F622}' }
    ];

    const DEFAULT_SEGMENTS = ['Ochtend', 'Kleine pauze', 'Na de kleine pauze', 'Grote pauze', 'Middag'];

    // ---------- State ----------
    let mode = 'class';
    let displayType = 'colors';
    let segments = [...DEFAULT_SEGMENTS];
    let selectedGroupId = null;
    let selectedStudentId = null;
    let dayOffset = 0; // 0 = today
    let weekOffset = 0;
    let data = { class: {}, students: {} };
    let notes = { class: {}, students: {} };
    let students = [];
    let groups = [];

    // Note popup state
    let activeNoteSegIndex = null;
    let activeNoteDateKey = null;

    // ---------- Date Helpers ----------
    function formatDate(d) {
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }

    function getTodayKey() {
        return formatDate(new Date());
    }

    function getDateForDayOffset(offset) {
        const d = new Date();
        d.setDate(d.getDate() + offset);
        return d;
    }

    function getDayKey() {
        return formatDate(getDateForDayOffset(dayOffset));
    }

    function formatDayLabel() {
        const d = getDateForDayOffset(dayOffset);
        return DAY_NAMES[d.getDay()] + ' ' + d.getDate() + ' ' + MONTH_NAMES[d.getMonth()];
    }

    function getWeekDates(offset = 0) {
        const now = new Date();
        now.setDate(now.getDate() + offset * 7);
        const day = now.getDay();
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
            return parseInt(p[2]) + ' ' + MONTH_NAMES[parseInt(p[1]) - 1].slice(0, 3);
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
            if (!data.class) data.class = {};
            if (!data.students) data.students = {};
            if (s.notes) notes = s.notes;
            if (!notes.class) notes.class = {};
            if (!notes.students) notes.students = {};
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
                settings: { mode, displayType, segments, selectedGroupId, data, notes },
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
        if (!selectedGroupId) { students = []; return; }
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
            if (!data.class[dateKey]) data.class[dateKey] = new Array(segments.length).fill(null);
            while (data.class[dateKey].length < segments.length) data.class[dateKey].push(null);
            data.class[dateKey][segmentIndex] = value;
        } else {
            if (!selectedStudentId) return;
            if (!data.students[selectedStudentId]) data.students[selectedStudentId] = {};
            if (!data.students[selectedStudentId][dateKey]) data.students[selectedStudentId][dateKey] = new Array(segments.length).fill(null);
            while (data.students[selectedStudentId][dateKey].length < segments.length) data.students[selectedStudentId][dateKey].push(null);
            data.students[selectedStudentId][dateKey][segmentIndex] = value;
        }
        // Clear note if value is cleared
        if (value === null) {
            setNoteValue(dateKey, segmentIndex, null);
        }
        saveSettingsToDb();
    }

    // ---------- Notes Access ----------
    function getNoteValue(dateKey, segmentIndex) {
        if (mode === 'class') {
            return notes.class[dateKey]?.[segmentIndex] ?? null;
        } else {
            if (!selectedStudentId) return null;
            return notes.students[selectedStudentId]?.[dateKey]?.[segmentIndex] ?? null;
        }
    }

    function setNoteValue(dateKey, segmentIndex, value) {
        if (mode === 'class') {
            if (!notes.class[dateKey]) notes.class[dateKey] = new Array(segments.length).fill(null);
            while (notes.class[dateKey].length < segments.length) notes.class[dateKey].push(null);
            notes.class[dateKey][segmentIndex] = value || null;
        } else {
            if (!selectedStudentId) return;
            if (!notes.students[selectedStudentId]) notes.students[selectedStudentId] = {};
            if (!notes.students[selectedStudentId][dateKey]) notes.students[selectedStudentId][dateKey] = new Array(segments.length).fill(null);
            while (notes.students[selectedStudentId][dateKey].length < segments.length) notes.students[selectedStudentId][dateKey].push(null);
            notes.students[selectedStudentId][dateKey][segmentIndex] = value || null;
        }
        saveSettingsToDb();
    }

    // ---------- Build UI ----------
    function buildUI() {
        renderLegend();
        renderStudentSelect();
        renderDayView();
        renderWeekView();
    }

    // ---------- Legend ----------
    function renderLegend() {
        gpLegend.innerHTML = '';
        LEVELS.forEach(level => {
            const el = document.createElement('div');
            el.className = 'gp-legend-item';
            if (displayType === 'colors') {
                const dot = document.createElement('span');
                dot.className = 'gp-legend-dot ' + (level.value === 3 ? 'good' : level.value === 2 ? 'moderate' : 'bad');
                el.appendChild(dot);
            } else {
                const emoji = document.createElement('span');
                emoji.className = 'gp-legend-emoji';
                emoji.textContent = level.smiley;
                el.appendChild(emoji);
            }
            const label = document.createElement('span');
            label.textContent = level.label;
            el.appendChild(label);
            gpLegend.appendChild(el);
        });
    }

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
        renderDayView();
        renderWeekView();
    });

    // ---------- Day Navigation ----------
    btnPrevDay.addEventListener('click', () => { dayOffset--; closeNotePopup(); renderDayView(); });
    btnNextDay.addEventListener('click', () => { dayOffset++; closeNotePopup(); renderDayView(); });

    // ---------- Render Day View ----------
    function renderDayView() {
        dayLabel.textContent = formatDayLabel();
        const dateKey = getDayKey();

        // Handle empty state for individual mode
        const showEmpty = mode === 'individual' && !selectedStudentId;
        emptyState.style.display = showEmpty ? '' : 'none';
        dayChart.style.display = showEmpty ? 'none' : '';
        xAxisLabels.style.display = showEmpty ? 'none' : '';

        if (showEmpty) return;

        // Build columns
        chartColumns.innerHTML = '';
        connectionLine.innerHTML = '';

        segments.forEach((seg, segIndex) => {
            const col = document.createElement('div');
            col.className = 'gp-chart-column';

            // 3 slots: top = good (3), middle = moderate (2), bottom = bad (1)
            LEVELS.forEach(level => {
                const slot = document.createElement('div');
                slot.className = 'gp-chart-slot';
                slot.dataset.segIndex = segIndex;
                slot.dataset.level = level.value;

                const currentVal = getCellValue(dateKey, segIndex);
                if (currentVal === level.value) {
                    const marker = createMarker(level, dateKey, segIndex);
                    slot.appendChild(marker);
                }

                slot.addEventListener('click', (e) => {
                    // Don't toggle value if note button was clicked
                    if (e.target.closest('.gp-note-btn')) return;
                    const val = getCellValue(dateKey, segIndex);
                    const newVal = val === level.value ? null : level.value;
                    setCellValue(dateKey, segIndex, newVal);
                    closeNotePopup();
                    renderDayView();
                    renderWeekView();
                });

                col.appendChild(slot);
            });

            chartColumns.appendChild(col);
        });

        // Build x-axis labels
        xAxisLabels.innerHTML = '';
        segments.forEach(seg => {
            const lbl = document.createElement('div');
            lbl.className = 'gp-x-label';
            lbl.textContent = seg;
            lbl.title = seg;
            xAxisLabels.appendChild(lbl);
        });

        // Draw connection lines (after render, use setTimeout for layout)
        requestAnimationFrame(() => drawConnectionLines(dateKey));
    }

    function createMarker(level, dateKey, segIndex) {
        const marker = document.createElement('div');
        marker.className = 'gp-chart-marker';
        if (displayType === 'colors') {
            marker.classList.add(level.markerClass);
        } else {
            marker.classList.add('marker-smiley');
            marker.textContent = level.smiley;
        }
        marker.classList.add('popping');
        setTimeout(() => marker.classList.remove('popping'), 350);

        // Note button
        const noteBtn = document.createElement('button');
        noteBtn.className = 'gp-note-btn';
        const existingNote = getNoteValue(dateKey, segIndex);
        if (existingNote) {
            noteBtn.classList.add('has-note');
            noteBtn.innerHTML = '\u{1F4DD}';
            noteBtn.title = existingNote;
        } else {
            noteBtn.innerHTML = '\u{270F}\u{FE0F}';
            noteBtn.title = 'Notitie toevoegen';
        }
        noteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openNotePopup(dateKey, segIndex, noteBtn);
        });
        marker.appendChild(noteBtn);

        return marker;
    }

    // ---------- Note Popup ----------
    function openNotePopup(dateKey, segIndex, anchorEl) {
        activeNoteDateKey = dateKey;
        activeNoteSegIndex = segIndex;

        const currentNote = getNoteValue(dateKey, segIndex) || '';
        noteInput.value = currentNote;
        btnNoteDelete.style.display = currentNote ? '' : 'none';

        // Position popup near the marker
        const rect = anchorEl.getBoundingClientRect();
        const mainRect = document.querySelector('.tool-page-content').getBoundingClientRect();

        notePopup.classList.add('active');

        // Calculate position after making visible
        requestAnimationFrame(() => {
            const popupRect = notePopup.getBoundingClientRect();
            let left = rect.left + rect.width / 2 - popupRect.width / 2;
            let top = rect.bottom + 8;

            // Keep within viewport
            if (left < 8) left = 8;
            if (left + popupRect.width > window.innerWidth - 8) left = window.innerWidth - popupRect.width - 8;
            if (top + popupRect.height > window.innerHeight - 8) {
                top = rect.top - popupRect.height - 8;
            }

            notePopup.style.left = left + 'px';
            notePopup.style.top = top + 'px';
            noteInput.focus();
        });
    }

    function closeNotePopup() {
        notePopup.classList.remove('active');
        activeNoteDateKey = null;
        activeNoteSegIndex = null;
    }

    btnNoteSave.addEventListener('click', () => {
        if (activeNoteDateKey !== null && activeNoteSegIndex !== null) {
            setNoteValue(activeNoteDateKey, activeNoteSegIndex, noteInput.value.trim());
            closeNotePopup();
            renderDayView();
            renderWeekView();
        }
    });

    btnNoteDelete.addEventListener('click', () => {
        if (activeNoteDateKey !== null && activeNoteSegIndex !== null) {
            setNoteValue(activeNoteDateKey, activeNoteSegIndex, null);
            closeNotePopup();
            renderDayView();
            renderWeekView();
        }
    });

    btnNoteClose.addEventListener('click', closeNotePopup);

    // Close popup on outside click
    document.addEventListener('click', (e) => {
        if (notePopup.classList.contains('active') && !notePopup.contains(e.target) && !e.target.closest('.gp-note-btn')) {
            closeNotePopup();
        }
    });

    // Save on Enter
    noteInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            btnNoteSave.click();
        }
        if (e.key === 'Escape') {
            closeNotePopup();
        }
    });

    function drawConnectionLines(dateKey) {
        connectionLine.innerHTML = '';
        const points = [];
        const chartRect = chartColumns.getBoundingClientRect();

        segments.forEach((_, segIndex) => {
            const val = getCellValue(dateKey, segIndex);
            if (val === null) {
                points.push(null);
                return;
            }
            // Find the marker's slot
            const col = chartColumns.children[segIndex];
            if (!col) { points.push(null); return; }
            const levelIndex = LEVELS.findIndex(l => l.value === val);
            const slot = col.children[levelIndex];
            if (!slot) { points.push(null); return; }
            const slotRect = slot.getBoundingClientRect();
            const x = slotRect.left - chartRect.left + slotRect.width / 2;
            const y = slotRect.top - chartRect.top + slotRect.height / 2;
            points.push({ x, y });
        });

        // Draw lines between consecutive non-null points
        for (let i = 0; i < points.length - 1; i++) {
            if (points[i] && points[i + 1]) {
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', points[i].x);
                line.setAttribute('y1', points[i].y);
                line.setAttribute('x2', points[i + 1].x);
                line.setAttribute('y2', points[i + 1].y);
                connectionLine.appendChild(line);
            }
        }
    }

    // ---------- Week Navigation ----------
    btnPrevWeek.addEventListener('click', () => { weekOffset--; renderWeekView(); });
    btnNextWeek.addEventListener('click', () => { weekOffset++; renderWeekView(); });

    // ---------- Render Week View ----------
    function renderWeekView() {
        weekLabel.textContent = formatWeekLabel();
        const weekDates = getWeekDates(weekOffset);
        const todayKey = getTodayKey();

        // Header
        weekGridHead.innerHTML = '';
        const headerRow = document.createElement('tr');
        const dayTh = document.createElement('th');
        dayTh.textContent = 'Dag';
        headerRow.appendChild(dayTh);

        segments.forEach(seg => {
            const th = document.createElement('th');
            th.textContent = seg;
            headerRow.appendChild(th);
        });
        weekGridHead.appendChild(headerRow);

        // Body
        weekGridBody.innerHTML = '';
        weekDates.forEach((dateKey, dayIndex) => {
            const row = document.createElement('tr');
            if (dateKey === todayKey) row.classList.add('today');

            const dayTd = document.createElement('td');
            dayTd.innerHTML = `<strong>${WEEKDAY_NAMES[dayIndex]}</strong>`;
            row.appendChild(dayTd);

            segments.forEach((_, segIndex) => {
                const td = document.createElement('td');
                const val = getCellValue(dateKey, segIndex);
                const note = getNoteValue(dateKey, segIndex);

                if (val !== null) {
                    const wrapper = document.createElement('div');
                    wrapper.className = 'gp-week-cell-wrapper';

                    const cell = document.createElement('div');
                    cell.className = 'gp-week-cell';
                    const level = LEVELS.find(l => l.value === val);
                    if (displayType === 'colors') {
                        cell.classList.add(level.weekClass);
                    } else {
                        cell.classList.add('wc-smiley');
                        cell.textContent = level.smiley;
                    }
                    wrapper.appendChild(cell);

                    // Show note icon if note exists
                    if (note) {
                        const noteIcon = document.createElement('span');
                        noteIcon.className = 'gp-week-note-icon';
                        noteIcon.innerHTML = '\u{1F4CB}';
                        noteIcon.title = note;
                        wrapper.appendChild(noteIcon);

                        // Tooltip
                        const tooltip = document.createElement('div');
                        tooltip.className = 'gp-week-tooltip';
                        tooltip.textContent = note;
                        wrapper.appendChild(tooltip);
                    }

                    td.appendChild(wrapper);
                } else {
                    const cell = document.createElement('div');
                    cell.className = 'gp-week-cell wc-empty';
                    td.appendChild(cell);
                }

                row.appendChild(td);
            });

            weekGridBody.appendChild(row);
        });
    }

    // ---------- PDF Download ----------
    function hexToRgb(hex) {
        return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
    }

    function generatePdf() {
        if (!window.jspdf) {
            alert('PDF-bibliotheek kon niet geladen worden. Probeer de pagina te vernieuwen.');
            return;
        }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        const pageW = 297, pageH = 210;
        const margin = 20;
        const weekDates = getWeekDates(weekOffset);
        const todayKey = getTodayKey();

        // Header
        doc.setFillColor(108, 99, 255);
        doc.rect(0, 0, pageW, 28, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('Gedragspatroon', margin, 18);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(formatWeekLabel(), pageW - margin, 18, { align: 'right' });

        // Subtitle (student name if individual)
        let subtitleY = 38;
        if (mode === 'individual' && selectedStudentId) {
            const student = students.find(s => s.id === selectedStudentId);
            if (student) {
                doc.setTextColor(50, 50, 70);
                doc.setFontSize(13);
                doc.setFont('helvetica', 'bold');
                const name = student.last_name ? student.first_name + ' ' + student.last_name : student.first_name;
                doc.text(name, pageW / 2, subtitleY, { align: 'center' });
                subtitleY += 10;
            }
        }

        // Table
        const tableTop = subtitleY + 4;
        const dayColW = 35;
        const segColW = (pageW - margin * 2 - dayColW) / segments.length;
        const rowH = 18;

        // Table header
        doc.setFillColor(248, 248, 252);
        doc.rect(margin, tableTop, pageW - margin * 2, rowH, 'F');
        doc.setDrawColor(230, 230, 240);
        doc.setLineWidth(0.3);
        doc.line(margin, tableTop + rowH, pageW - margin, tableTop + rowH);

        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(120, 120, 140);
        doc.text('DAG', margin + 4, tableTop + 11);

        segments.forEach((seg, i) => {
            const x = margin + dayColW + i * segColW;
            doc.text(seg.toUpperCase(), x + segColW / 2, tableTop + 11, { align: 'center' });
        });

        // Table rows
        weekDates.forEach((dateKey, dayIndex) => {
            const rowY = tableTop + rowH + dayIndex * rowH;
            const isToday = dateKey === todayKey;

            if (isToday) {
                doc.setFillColor(238, 237, 251);
                doc.rect(margin, rowY, pageW - margin * 2, rowH, 'F');
            }

            doc.setDrawColor(240, 240, 245);
            doc.setLineWidth(0.2);
            doc.line(margin, rowY + rowH, pageW - margin, rowY + rowH);

            // Day name
            doc.setFontSize(10);
            doc.setFont('helvetica', isToday ? 'bold' : 'normal');
            doc.setTextColor(isToday ? 108 : 50, isToday ? 99 : 50, isToday ? 255 : 70);
            doc.text(WEEKDAY_NAMES[dayIndex], margin + 4, rowY + 12);

            // Values
            segments.forEach((_, segIndex) => {
                const val = getCellValue(dateKey, segIndex);
                if (val === null) return;

                const x = margin + dayColW + segIndex * segColW + segColW / 2;
                const y = rowY + rowH / 2;
                const level = LEVELS.find(l => l.value === val);
                const note = getNoteValue(dateKey, segIndex);

                // Always use colored circles for reliable PDF rendering
                const [r, g, b] = hexToRgb(level.color);
                doc.setFillColor(r, g, b);
                doc.circle(x, y, 4, 'F');

                // If smiley mode, add label text inside/below
                if (displayType === 'smileys') {
                    doc.setFontSize(6);
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(255, 255, 255);
                    const label = level.value === 3 ? ':)' : level.value === 2 ? ':|' : ':(';
                    doc.text(label, x, y + 1.8, { align: 'center' });
                }

                // Note indicator
                if (note) {
                    doc.setFontSize(6);
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(108, 99, 255);
                    doc.text('*', x + 5.5, y - 2);
                }
            });
        });

        // Notes section
        const notesStartY = tableTop + rowH + 5 * rowH + 12;
        let hasNotes = false;
        let noteY = notesStartY;

        // Collect all notes for the week
        const allNotes = [];
        weekDates.forEach((dateKey, dayIndex) => {
            segments.forEach((seg, segIndex) => {
                const note = getNoteValue(dateKey, segIndex);
                if (note) {
                    allNotes.push({
                        day: WEEKDAY_NAMES[dayIndex],
                        segment: seg,
                        note: note
                    });
                }
            });
        });

        // Legend
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        let legendX = margin;
        LEVELS.forEach(level => {
            const [r, g, b] = hexToRgb(level.color);
            doc.setFillColor(r, g, b);
            doc.circle(legendX + 3, noteY - 1.5, 3, 'F');
            legendX += 10;

            if (displayType === 'smileys') {
                doc.setFontSize(7);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(255, 255, 255);
                const label = level.value === 3 ? ':)' : level.value === 2 ? ':|' : ':(';
                doc.text(label, legendX - 7, noteY - 0.2, { align: 'center' });
            }

            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 100, 110);
            doc.text(level.label, legendX, noteY);
            legendX += doc.getTextWidth(level.label) + 14;
        });

        // Notes list
        if (allNotes.length > 0) {
            noteY += 10;
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(50, 50, 70);
            doc.text('Notities', margin, noteY);
            noteY += 6;

            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            allNotes.forEach(n => {
                if (noteY > pageH - 15) return; // Don't overflow page
                doc.setTextColor(108, 99, 255);
                doc.text(n.day + ' - ' + n.segment + ':', margin, noteY);
                const labelW = doc.getTextWidth(n.day + ' - ' + n.segment + ': ');
                doc.setTextColor(80, 80, 90);
                const maxW = pageW - margin * 2 - labelW;
                const noteLines = doc.splitTextToSize(n.note, maxW);
                doc.text(noteLines[0], margin + labelW, noteY);
                if (noteLines.length > 1) {
                    noteY += 4;
                    doc.text(noteLines.slice(1).join(' '), margin + 4, noteY);
                }
                noteY += 5;
            });
        }

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(180, 180, 190);
        doc.text('Meestertools - Gedragspatroon', margin, pageH - 8);
        const now = new Date();
        const timestamp = now.toLocaleDateString('nl-NL') + ' ' + now.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
        doc.text('Gedownload: ' + timestamp, pageW - margin, pageH - 8, { align: 'right' });

        // Save
        const filename = 'gedragspatroon-' + getWeekDates(weekOffset)[0] + '.pdf';
        doc.save(filename);
    }

    if (btnDownloadPdf) {
        btnDownloadPdf.addEventListener('click', generatePdf);
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
            input.addEventListener('input', () => { tempSegments[i] = input.value; });

            const removeBtn = document.createElement('button');
            removeBtn.className = 'gp-segment-remove';
            removeBtn.innerHTML = '&times;';
            removeBtn.title = 'Verwijderen';
            removeBtn.addEventListener('click', () => {
                if (tempSegments.length <= 1) return;
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
        const inputs = segmentsList.querySelectorAll('input');
        if (inputs.length > 0) inputs[inputs.length - 1].focus();
    });

    btnSettings.addEventListener('click', openModal);
    btnCloseSettings.addEventListener('click', closeModal);
    settingsModal.addEventListener('click', (e) => { if (e.target === settingsModal) closeModal(); });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && settingsModal.classList.contains('active')) closeModal();
    });

    btnSaveSettings.addEventListener('click', async () => {
        mode = settingMode.value;
        displayType = settingDisplayType.value;

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

/* ============================================
   KLASSENDIENST - JavaScript

   Wijst per schoolweek automatisch klassendienst toe, roterend op
   leerlingnummer. Houdt rekening met het ingestelde schooljaar
   (1 augustus t/m 31 juli) en de ingevulde vakanties: in vakantieweken
   is er geen klassendienst.

   - Gebruikt de globale actieve klas (MTActiveClass) voor de leerlingen.
   - Schooljaar + vakanties komen uit tool_settings ('schooljaar').
   - Eigen instellingen (kinderen per week, taken) uit tool_settings
     ('klassendienst').
   - Toont: deze week (wie + taken), sneak preview volgende week en een
     jaaroverzicht dat als pdf te downloaden is.
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {
    var TOOL_NAME = 'klassendienst';

    // ---------- DOM ----------
    var container = document.getElementById('kdContainer');
    var btnSettings = document.getElementById('btnSettings');
    var settingsModal = document.getElementById('settingsModal');
    var btnCloseSettings = document.getElementById('btnCloseSettings');
    var btnSaveSettings = document.getElementById('btnSaveSettings');
    var perWeekSelect = document.getElementById('kdPerWeek');
    var tasksEdit = document.getElementById('kdTasksEdit');
    var addTaskBtn = document.getElementById('kdAddTaskBtn');
    var openSchooljaarLink = document.getElementById('kdOpenSchooljaar');

    if (!container) return;

    // ---------- State ----------
    var settings = { perWeek: 2, tasks: [], startOffset: 0 };
    var schooljaar = null;          // { activeYear, years: {..} }
    var students = [];              // gesorteerd op leerlingnummer
    var groupName = '';
    var schoolWeeks = [];           // [{ monday, friday, sunday, index, students }]

    var DAYS = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'];
    var MONTHS = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
    var DEFAULT_TASKS = ['Bord schoonmaken', 'Afval opruimen', 'Planten water geven'];

    // ---------- Helpers ----------
    function escapeHtml(str) {
        var div = document.createElement('div');
        div.textContent = str == null ? '' : str;
        return div.innerHTML;
    }

    function parseDate(str) {
        if (!str) return null;
        var d = new Date(str + 'T00:00:00');
        return isNaN(d.getTime()) ? null : d;
    }

    function startOfDay(d) {
        var x = new Date(d);
        x.setHours(0, 0, 0, 0);
        return x;
    }

    function addDays(d, n) {
        var x = new Date(d);
        x.setDate(x.getDate() + n);
        return x;
    }

    function mondayOf(d) {
        var x = startOfDay(d);
        var day = x.getDay();           // 0 = zondag
        var diff = (day === 0 ? -6 : 1 - day);
        return addDays(x, diff);
    }

    function fmtDay(d) {
        return DAYS[d.getDay()] + ' ' + d.getDate() + ' ' + MONTHS[d.getMonth()];
    }

    function fmtRange(monday, friday) {
        return fmtDay(monday) + ' – ' + fmtDay(friday);
    }

    function initials(s) {
        var f = (s.first_name || '').charAt(0);
        var l = (s.last_name || '').charAt(0);
        return (f + l).toUpperCase() || '?';
    }

    function studentName(s) {
        return s.last_name ? (s.first_name + ' ' + s.last_name) : s.first_name;
    }

    function currentSchoolYearLabel() {
        var now = new Date();
        var y = now.getFullYear();
        var startYear = now.getMonth() >= 7 ? y : y - 1;
        return startYear + '/' + (startYear + 1);
    }

    // ---------- Supabase ----------
    async function getSessionUser() {
        try {
            var res = await supabase.auth.getSession();
            return res && res.data && res.data.session ? res.data.session.user : null;
        } catch (e) { return null; }
    }

    async function loadSettings(user) {
        var res = await supabase
            .from('tool_settings')
            .select('settings')
            .eq('user_id', user.id)
            .eq('tool_name', TOOL_NAME)
            .maybeSingle();
        if (res.data && res.data.settings) {
            var s = res.data.settings;
            if (typeof s.perWeek === 'number') settings.perWeek = s.perWeek;
            if (Array.isArray(s.tasks)) settings.tasks = s.tasks;
            if (typeof s.startOffset === 'number') settings.startOffset = s.startOffset;
        } else {
            settings.tasks = DEFAULT_TASKS.slice();
        }
    }

    async function saveSettings(user) {
        await supabase
            .from('tool_settings')
            .upsert({
                user_id: user.id,
                tool_name: TOOL_NAME,
                settings: settings,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id,tool_name' });
    }

    async function loadSchooljaar(user) {
        var res = await supabase
            .from('tool_settings')
            .select('settings')
            .eq('user_id', user.id)
            .eq('tool_name', 'schooljaar')
            .maybeSingle();
        if (res.data && res.data.settings) {
            schooljaar = res.data.settings;
            if (!schooljaar.years) schooljaar.years = {};
        } else {
            schooljaar = { activeYear: currentSchoolYearLabel(), years: {} };
        }
    }

    async function loadStudents(groupId) {
        var res = await supabase
            .from('students')
            .select('id, first_name, last_name, student_number')
            .eq('group_id', groupId)
            .eq('archived', false)
            .order('student_number', { ascending: true });
        students = res.data || [];
    }

    // ---------- Schoolweken berekenen ----------
    function getVacations() {
        if (!schooljaar) return [];
        var yr = schooljaar.activeYear || currentSchoolYearLabel();
        var entry = schooljaar.years ? schooljaar.years[yr] : null;
        var list = (entry && entry.vacations) ? entry.vacations : [];
        return list.map(function (v) {
            return { name: v.name, start: parseDate(v.start), end: parseDate(v.end) };
        }).filter(function (v) { return v.start && v.end; });
    }

    function activeYearLabel() {
        return (schooljaar && schooljaar.activeYear) ? schooljaar.activeYear : currentSchoolYearLabel();
    }

    function dayInVacations(day, vacs) {
        for (var i = 0; i < vacs.length; i++) {
            if (day >= vacs[i].start && day <= vacs[i].end) return true;
        }
        return false;
    }

    function isVacationWeek(monday, vacs) {
        // Vakantieweek = alle werkdagen (ma t/m vr) vallen in een vakantie
        for (var k = 0; k < 5; k++) {
            if (!dayInVacations(addDays(monday, k), vacs)) return false;
        }
        return true;
    }

    function buildSchoolWeeks() {
        var label = activeYearLabel();
        var startYear = parseInt(label.split('/')[0], 10);
        var yearStart = new Date(startYear, 7, 1);        // 1 augustus
        var yearEnd = new Date(startYear + 1, 6, 31);     // 31 juli
        var vacs = getVacations();

        var weeks = [];
        var m = mondayOf(yearStart);
        var guard = 0;
        while (m <= yearEnd && guard < 80) {
            guard++;
            if (!isVacationWeek(m, vacs)) {
                weeks.push({ monday: new Date(m), friday: addDays(m, 4), sunday: addDays(m, 6) });
            }
            m = addDays(m, 7);
        }

        // Rotatie op leerlingnummer toewijzen
        var n = students.length;
        var per = Math.max(1, settings.perWeek || 1);
        var offset = settings.startOffset || 0;
        weeks.forEach(function (w, i) {
            w.index = i;
            w.students = [];
            if (n > 0) {
                for (var k = 0; k < per; k++) {
                    var idx = (i * per + offset + k) % n;
                    if (idx < 0) idx += n;
                    w.students.push(students[idx]);
                }
            }
        });

        schoolWeeks = weeks;
    }

    function findCurrentWeek() {
        var today = startOfDay(new Date());
        for (var i = 0; i < schoolWeeks.length; i++) {
            if (today >= schoolWeeks[i].monday && today <= schoolWeeks[i].sunday) {
                return { index: i, vacationNow: false };
            }
        }
        // Geen schoolweek vandaag (vakantie / weekend in vakantie / buiten schooljaar)
        for (var j = 0; j < schoolWeeks.length; j++) {
            if (schoolWeeks[j].monday > today) {
                return { index: j, vacationNow: true };
            }
        }
        return { index: -1, vacationNow: false };
    }

    // ---------- Render ----------
    function render() {
        if (!window.MTActiveClass || !window.MTActiveClass.getId()) {
            container.innerHTML = noClassHtml();
            bindEmptyState();
            return;
        }
        if (!students.length) {
            container.innerHTML = emptyMsgHtml('Deze klas heeft nog geen leerlingen. Voeg leerlingen toe via Mijn klas.', 'mijnklas');
            bindEmptyState();
            return;
        }
        if (!schoolWeeks.length) {
            container.innerHTML = emptyMsgHtml('Er zijn geen schoolweken gevonden voor dit schooljaar. Controleer het schooljaar en de vakanties.', 'schooljaar');
            bindEmptyState();
            return;
        }

        var cur = findCurrentWeek();
        var html = '';

        if (cur.index === -1) {
            html += '<div class="kd-banner">Het schooljaar ' + escapeHtml(activeYearLabel()) + ' is afgelopen. Stel een nieuw schooljaar in via Instellingen &rarr; Schooljaar.</div>';
            container.innerHTML = html + jaaroverzichtHtml(-1);
            bindOverview();
            return;
        }

        var week = schoolWeeks[cur.index];
        var totalWeeks = schoolWeeks.length;

        if (cur.vacationNow) {
            html += '<div class="kd-banner">&#127796; Het is nu vakantie. Hieronder zie je de eerstvolgende schoolweek met klassendienst.</div>';
        }

        // Deze week hero
        html += '<section class="kd-hero">';
        html += '  <div class="kd-hero-top">';
        html += '    <span class="kd-week-pill">Week ' + (week.index + 1) + ' van ' + totalWeeks + '</span>';
        html += '    <h2 class="kd-hero-title">' + (cur.vacationNow ? 'Eerstvolgende klassendienst' : 'Deze week klassendienst') + '</h2>';
        html += '    <p class="kd-hero-date">' + escapeHtml(fmtRange(week.monday, week.friday)) + '</p>';
        html += '  </div>';
        html += '  <div class="kd-hero-grid">';
        html += '    <div class="kd-duty-people">' + peopleCardsHtml(week.students, 'big') + '</div>';
        html += '    <div class="kd-tasks-panel">';
        html += '      <h3>Taken</h3>';
        html += taskListHtml();
        html += '    </div>';
        html += '  </div>';
        html += '</section>';

        // Sneak preview volgende week
        var next = schoolWeeks[cur.index + 1];
        if (next) {
            html += '<section class="kd-next">';
            html += '  <div class="kd-next-head"><span class="kd-next-icon">&#128064;</span> Volgende week zijn jullie aan de beurt</div>';
            html += '  <p class="kd-next-date">' + escapeHtml(fmtRange(next.monday, next.friday)) + '</p>';
            html += '  <div class="kd-next-people">' + peopleCardsHtml(next.students, 'small') + '</div>';
            html += '</section>';
        }

        // Jaaroverzicht
        html += jaaroverzichtHtml(week.index);

        container.innerHTML = html;
        bindOverview();
    }

    function peopleCardsHtml(list, size) {
        if (!list || !list.length) return '<p class="kd-empty-inline">Geen leerlingen</p>';
        return list.map(function (s) {
            return '<div class="kd-person kd-person-' + size + '">' +
                '<span class="kd-avatar">' + escapeHtml(initials(s)) + '</span>' +
                '<span class="kd-person-name">' + escapeHtml(studentName(s)) + '</span>' +
                '<span class="kd-person-nr">nr. ' + escapeHtml(String(s.student_number)) + '</span>' +
                '</div>';
        }).join('');
    }

    function taskListHtml() {
        if (!settings.tasks || !settings.tasks.length) {
            return '<p class="kd-empty-inline">Nog geen taken ingesteld. Voeg taken toe via het tandwiel rechtsboven.</p>';
        }
        return '<ul class="kd-task-list">' + settings.tasks.map(function (t) {
            return '<li><span class="kd-task-check">&#10003;</span>' + escapeHtml(t) + '</li>';
        }).join('') + '</ul>';
    }

    function jaaroverzichtHtml(currentIndex) {
        var rows = schoolWeeks.map(function (w) {
            var names = w.students.map(studentName).join(', ') || '—';
            var cls = (w.index === currentIndex) ? ' class="kd-row-current"' : '';
            return '<tr' + cls + '>' +
                '<td>' + (w.index + 1) + '</td>' +
                '<td>' + escapeHtml(fmtRange(w.monday, w.friday)) + '</td>' +
                '<td>' + escapeHtml(names) + '</td>' +
                '</tr>';
        }).join('');

        return '<section class="kd-overview">' +
            '<div class="kd-overview-head">' +
            '  <h3>Jaaroverzicht ' + escapeHtml(activeYearLabel()) + '</h3>' +
            '  <button class="btn-primary kd-pdf-btn" id="kdPdfBtn">&#128229; Download als pdf</button>' +
            '</div>' +
            '<div class="kd-table-wrap"><table class="kd-table">' +
            '<thead><tr><th>Week</th><th>Datum</th><th>Klassendienst</th></tr></thead>' +
            '<tbody>' + rows + '</tbody>' +
            '</table></div>' +
            '</section>';
    }

    function noClassHtml() {
        return '<div class="kd-empty">' +
            '<span class="kd-empty-icon">&#129529;</span>' +
            '<h2>Kies eerst een klas</h2>' +
            '<p>Selecteer rechtsboven een actieve klas om de klassendienst te bekijken.</p>' +
            '</div>';
    }

    function emptyMsgHtml(msg, section) {
        return '<div class="kd-empty">' +
            '<span class="kd-empty-icon">&#129529;</span>' +
            '<h2>Bijna klaar</h2>' +
            '<p>' + escapeHtml(msg) + '</p>' +
            '<button class="btn-primary" data-open-section="' + section + '">Open instellingen</button>' +
            '</div>';
    }

    function bindEmptyState() {
        container.querySelectorAll('[data-open-section]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                if (window.openInstellingen) window.openInstellingen(btn.dataset.openSection);
            });
        });
    }

    function bindOverview() {
        var btn = document.getElementById('kdPdfBtn');
        if (btn) btn.addEventListener('click', downloadPdf);
    }

    // ---------- PDF ----------
    function downloadPdf() {
        if (!window.jspdf || !window.jspdf.jsPDF) {
            alert('De pdf-bibliotheek kon niet worden geladen. Probeer de pagina te verversen.');
            return;
        }
        var jsPDF = window.jspdf.jsPDF;
        var doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

        var title = 'Klassendienst ' + activeYearLabel();
        doc.setFontSize(18);
        doc.setTextColor(108, 99, 255);
        doc.text(title, 14, 18);
        doc.setFontSize(11);
        doc.setTextColor(90, 90, 90);
        doc.text('Klas: ' + (groupName || '-'), 14, 25);

        var body = schoolWeeks.map(function (w) {
            return [
                String(w.index + 1),
                fmtRange(w.monday, w.friday),
                w.students.map(studentName).join(', ') || '-'
            ];
        });

        doc.autoTable({
            head: [['Week', 'Datum', 'Klassendienst']],
            body: body,
            startY: 30,
            styles: { fontSize: 10, cellPadding: 2.5 },
            headStyles: { fillColor: [108, 99, 255], textColor: 255 },
            alternateRowStyles: { fillColor: [243, 244, 248] },
            columnStyles: { 0: { cellWidth: 16, halign: 'center' }, 1: { cellWidth: 55 } },
            margin: { left: 14, right: 14 }
        });

        var safeName = (groupName || 'klas').replace(/[^a-z0-9]+/gi, '-').toLowerCase();
        doc.save('klassendienst-' + activeYearLabel().replace('/', '-') + '-' + safeName + '.pdf');
    }

    // ---------- Settings modal ----------
    function renderTasksEdit() {
        if (!settings.tasks.length) {
            tasksEdit.innerHTML = '<p class="kd-empty-inline">Nog geen taken. Klik op "+ Taak".</p>';
            return;
        }
        tasksEdit.innerHTML = settings.tasks.map(function (t, i) {
            return '<div class="kd-task-row">' +
                '<input type="text" class="kd-task-input" data-index="' + i + '" value="' + escapeHtml(t) + '" placeholder="Taak">' +
                '<button type="button" class="btn-small btn-delete kd-task-del" data-index="' + i + '">&times;</button>' +
                '</div>';
        }).join('');

        tasksEdit.querySelectorAll('.kd-task-del').forEach(function (btn) {
            btn.addEventListener('click', function () {
                collectTasks();
                settings.tasks.splice(parseInt(btn.dataset.index, 10), 1);
                renderTasksEdit();
            });
        });
    }

    function collectTasks() {
        var inputs = tasksEdit.querySelectorAll('.kd-task-input');
        var out = [];
        inputs.forEach(function (inp) { out.push(inp.value); });
        settings.tasks = out;
    }

    function openSettings() {
        perWeekSelect.value = String(settings.perWeek || 2);
        renderTasksEdit();
        settingsModal.classList.add('active');
    }
    function closeSettings() {
        settingsModal.classList.remove('active');
    }

    if (addTaskBtn) addTaskBtn.addEventListener('click', function () {
        collectTasks();
        settings.tasks.push('');
        renderTasksEdit();
        var inputs = tasksEdit.querySelectorAll('.kd-task-input');
        if (inputs.length) inputs[inputs.length - 1].focus();
    });

    if (btnSettings) btnSettings.addEventListener('click', openSettings);
    if (btnCloseSettings) btnCloseSettings.addEventListener('click', closeSettings);
    if (settingsModal) settingsModal.addEventListener('click', function (e) {
        if (e.target === settingsModal) closeSettings();
    });
    if (openSchooljaarLink) openSchooljaarLink.addEventListener('click', function (e) {
        e.preventDefault();
        closeSettings();
        if (window.openInstellingen) window.openInstellingen('schooljaar');
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && settingsModal.classList.contains('active')) closeSettings();
    });

    if (btnSaveSettings) btnSaveSettings.addEventListener('click', async function () {
        collectTasks();
        settings.tasks = settings.tasks.map(function (t) { return t.trim(); }).filter(function (t) { return t; });
        settings.perWeek = parseInt(perWeekSelect.value, 10) || 2;
        var user = await getSessionUser();
        if (user) await saveSettings(user);
        closeSettings();
        buildSchoolWeeks();
        render();
    });

    // ---------- Init ----------
    async function init() {
        var user = await getSessionUser();
        if (!user) { container.innerHTML = noClassHtml(); return; }

        await loadSettings(user);
        await loadSchooljaar(user);

        if (window.MTActiveClass && window.MTActiveClass.ready) {
            try { await window.MTActiveClass.ready; } catch (e) {}
        }

        var groupId = window.MTActiveClass ? window.MTActiveClass.getId() : '';
        groupName = window.MTActiveClass ? window.MTActiveClass.getName() : '';

        if (groupId) {
            await loadStudents(groupId);
            buildSchoolWeeks();
        }
        render();
    }

    init();
});

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
   - Taken bevatten een dag-veld { text, day } waarbij day 'all' of 1..5 is.
   - Toont: deze week (wie + taken per dag), sneak preview volgende week en
     een jaaroverzicht dat als pdf te downloaden is.
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
    var kdLinkCheckbox = document.getElementById('kdLinkKP');
    var kdLinkWrap = document.getElementById('kdLinkKPWrap');
    var kdLinkRewardSelect = document.getElementById('kdLinkKPReward');
    var toastEl = document.getElementById('kdToast');

    var chooseModal = document.getElementById('kdChooseModal');
    var chooseClose = document.getElementById('kdChooseClose');
    var chooseCancel = document.getElementById('kdChooseCancel');
    var chooseConfirm = document.getElementById('kdChooseConfirm');
    var chooseGrid = document.getElementById('kdChooseGrid');
    var chooseSub = document.getElementById('kdChooseSub');
    var chooseCount = document.getElementById('kdChooseCount');

    if (!container) return;

    // ---------- State ----------
    var settings = { perWeek: 2, tasks: [], startOffset: 0, kdLink: { enabled: false, rewardTypeId: null }, manualPlan: null };
    var schooljaar = null;          // { activeYear, years: {..} }
    var students = [];              // gesorteerd op leerlingnummer
    var groupName = '';
    var groupId = '';
    var schoolWeeks = [];           // [{ monday, friday, sunday, index, students }]
    var selectedDay = 0;            // 0 = vandaag (auto), 1..5 = ma..vr
    var checkState = {};            // { taskText: true } voor de huidige datum
    var currentUser = null;         // gecachede Supabase gebruiker
    var klassePrestRewardTypes = []; // positieve reward types uit Klasseprestatie

    var DAYS = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'];
    var DAY_NAMES = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];
    var WEEKDAYS = [
        { code: 1, short: 'ma', name: 'maandag' },
        { code: 2, short: 'di', name: 'dinsdag' },
        { code: 3, short: 'wo', name: 'woensdag' },
        { code: 4, short: 'do', name: 'donderdag' },
        { code: 5, short: 'vr', name: 'vrijdag' }
    ];
    var MONTHS = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
    var DEFAULT_TASKS = [
        { text: 'Bord schoonmaken', day: 'all' },
        { text: 'Afval opruimen', day: 'all' },
        { text: 'Planten water geven', day: 'all' }
    ];
    var MONSTER_COUNT = 36;

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

    function ymd(d) {
        return d.getFullYear() + '-' +
            ('0' + (d.getMonth() + 1)).slice(-2) + '-' +
            ('0' + d.getDate()).slice(-2);
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

    var monsterByStudentId = {}; // {student_id: 1..36}, uniek binnen de klas
    function monsterHash(key) {
        key = String(key || '');
        var h = 0;
        for (var i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
        return h;
    }
    // Wijs elk kind in de klas een UNIEK monstertje toe (1..36). Voorkeur =
    // hash van het id; bij botsing schuift het deterministisch door naar het
    // eerstvolgende vrije monster. Zelfde algoritme als in Klasseprestatie en
    // Complimentenmuur, zodat een kind overal hetzelfde monster houdt.
    function assignMonsters(list) {
        var map = {}, used = {};
        var sorted = (list || []).slice().sort(function (a, b) {
            var ai = String(a.id), bi = String(b.id);
            return ai < bi ? -1 : ai > bi ? 1 : 0;
        });
        sorted.forEach(function (s) {
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
        return '../assets/avatars/monsters/monster-' + (n < 10 ? '0' + n : n) + '.png';
    }

    // Migreer oude string-taken naar { text, day }
    function normalizeTask(t) {
        if (t && typeof t === 'object') {
            return { text: String(t.text || ''), day: normalizeDay(t.day) };
        }
        return { text: String(t || ''), day: 'all' };
    }

    function normalizeDay(d) {
        if (d === 'all' || d == null || d === '') return 'all';
        var n = parseInt(d, 10);
        return (n >= 1 && n <= 5) ? n : 'all';
    }

    // Welke werkdag-code (1..5) is vandaag? Weekend → maandag (1)
    function todayWeekdayCode() {
        var d = new Date().getDay();
        return (d >= 1 && d <= 5) ? d : 1;
    }

    // De dag die actief getoond wordt (tabkeuze of vandaag)
    function activeDayCode() {
        return selectedDay || todayWeekdayCode();
    }

    // ---------- Afvinklijst (per datum, lokaal) ----------
    function checkStorageKey() {
        var d = new Date();
        var ymd = d.getFullYear() + '-' +
            ('0' + (d.getMonth() + 1)).slice(-2) + '-' +
            ('0' + d.getDate()).slice(-2);
        return 'mt_kd_check_' + (groupId || 'x') + '_' + ymd;
    }

    function loadCheckState() {
        checkState = {};
        try {
            var raw = localStorage.getItem(checkStorageKey());
            var arr = raw ? JSON.parse(raw) : [];
            if (Array.isArray(arr)) {
                arr.forEach(function (k) { checkState[k] = true; });
            }
        } catch (e) { checkState = {}; }
    }

    function saveCheckState() {
        try {
            var arr = Object.keys(checkState).filter(function (k) { return checkState[k]; });
            localStorage.setItem(checkStorageKey(), JSON.stringify(arr));
        } catch (e) { /* stil falen */ }
        checkAndAward();
    }

    // ---------- Koppeling Klasseprestatie ----------
    function awardedKey() {
        var d = new Date();
        var ymd = d.getFullYear() + '-' +
            ('0' + (d.getMonth() + 1)).slice(-2) + '-' +
            ('0' + d.getDate()).slice(-2);
        return 'mt_kd_awarded_' + (groupId || 'x') + '_' + ymd;
    }

    function wasAwardedToday() {
        try { return !!localStorage.getItem(awardedKey()); } catch (e) { return false; }
    }

    function markAwardedToday() {
        try { localStorage.setItem(awardedKey(), '1'); } catch (e) {}
    }

    function allTodayTasksDone() {
        var code = todayWeekdayCode();
        var todayTasks = settings.tasks.filter(function (t) {
            return t.day === 'all' || t.day === code;
        });
        if (!todayTasks.length) return false;
        return todayTasks.every(function (t) { return !!checkState[t.text]; });
    }

    async function checkAndAward() {
        if (!settings.kdLink.enabled || !settings.kdLink.rewardTypeId) return;
        if (wasAwardedToday()) return;
        if (!allTodayTasksDone()) return;

        // Haal de huidige dienstdoende leerlingen op
        var cur = findCurrentWeek();
        if (cur.index === -1 || cur.vacationNow) return;
        var dutyStudents = schoolWeeks[cur.index] ? schoolWeeks[cur.index].students : [];
        if (!dutyStudents.length) return;

        // Vind het reward type
        var rt = klassePrestRewardTypes.find(function (r) {
            return r.id === settings.kdLink.rewardTypeId;
        });
        if (!rt) return;

        await awardKlasseprestatiePoints(rt, dutyStudents);
    }

    async function awardKlasseprestatiePoints(rt, dutyStudents) {
        if (!currentUser) return;
        var signed = rt.type === 'positief' ? rt.points : -rt.points;
        var rows = dutyStudents.map(function (s) {
            return {
                user_id: currentUser.id,
                student_id: s.id,
                reward_type_id: rt.id,
                points: signed
            };
        });
        var res = await supabase.from('klasseprestatie_points').insert(rows);
        if (res.error) {
            console.error('Klasseprestatie koppeling fout:', res.error);
            return;
        }
        markAwardedToday();
        var namen = dutyStudents.map(function (s) {
            return s.first_name || studentName(s);
        }).join(' & ');
        showToast('&#127942; ' + namen + ' ' + (dutyStudents.length === 1 ? 'heeft' : 'hebben') +
            ' "' + rt.icon + ' ' + rt.label + '" ontvangen in Klasseprestatie!');
    }

    function showToast(msg) {
        if (!toastEl) return;
        toastEl.innerHTML = msg;
        toastEl.classList.add('visible');
        clearTimeout(showToast._timer);
        showToast._timer = setTimeout(function () {
            toastEl.classList.remove('visible');
        }, 5000);
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
            if (Array.isArray(s.tasks)) settings.tasks = s.tasks.map(normalizeTask);
            if (typeof s.startOffset === 'number') settings.startOffset = s.startOffset;
            if (s.kdLink && typeof s.kdLink === 'object') {
                settings.kdLink = {
                    enabled: !!s.kdLink.enabled,
                    rewardTypeId: s.kdLink.rewardTypeId || null
                };
            }
            if (s.manualPlan && typeof s.manualPlan === 'object' && Array.isArray(s.manualPlan.order)) {
                settings.manualPlan = s.manualPlan;
            }
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

    async function loadStudents(gid) {
        var res = await supabase
            .from('students')
            .select('id, first_name, last_name, student_number')
            .eq('group_id', gid)
            .eq('archived', false)
            .order('student_number', { ascending: true });
        students = res.data || [];
        monsterByStudentId = assignMonsters(students);
    }

    async function loadKlasseprestatieRewardTypes() {
        if (!currentUser) return;
        try {
            var res = await supabase
                .from('klasseprestatie_reward_types')
                .select('id, icon, label, points, type')
                .eq('user_id', currentUser.id)
                .eq('type', 'positief')
                .eq('archived', false)
                .order('sort_order');
            klassePrestRewardTypes = res.data || [];
        } catch (e) { klassePrestRewardTypes = []; }
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

        // Toewijzing: standaard rotatie op leerlingnummer. Is er een handmatig
        // gekozen groepje (manualPlan) voor dit schooljaar, dan zet dat groepje
        // op de ankerweek en loopt de rotatie daarvandaan verder op nummer.
        var per = Math.max(1, settings.perWeek || 1);
        var order = students;              // standaard: op leerlingnummer (al gesorteerd)
        var anchorIdx = -1;

        var plan = settings.manualPlan;
        if (plan && plan.year === activeYearLabel() && Array.isArray(plan.order) && plan.anchorMonday) {
            // Volgorde: gekozen kinderen eerst, dan de rest op nummer.
            // Vertrokken leerlingen vallen weg; nieuwe leerlingen sluiten achteraan aan.
            var byId = {};
            students.forEach(function (s) { byId[s.id] = s; });
            var built = [], inPlan = {};
            plan.order.forEach(function (id) {
                if (byId[id]) { built.push(byId[id]); inPlan[id] = true; }
            });
            students.forEach(function (s) { if (!inPlan[s.id]) built.push(s); });
            if (built.length) order = built;
            // Ankerweek op datum vinden
            for (var a = 0; a < weeks.length; a++) {
                if (ymd(weeks[a].monday) === plan.anchorMonday) { anchorIdx = a; break; }
            }
        }

        var n = order.length;
        var base = anchorIdx >= 0 ? anchorIdx : 0;
        var offset = anchorIdx >= 0 ? 0 : (settings.startOffset || 0);
        weeks.forEach(function (w, i) {
            w.index = i;
            w.students = [];
            if (n > 0) {
                for (var k = 0; k < per; k++) {
                    var idx = ((i - base) * per + offset + k) % n;
                    if (idx < 0) idx += n;
                    w.students.push(order[idx]);
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
        loadCheckState();

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
        var dayCode = activeDayCode();
        var todayCode = todayWeekdayCode();
        var realToday = new Date().getDay();
        var todayName = (realToday >= 1 && realToday <= 5) ? DAY_NAMES[realToday] : DAY_NAMES[todayCode];

        if (cur.vacationNow) {
            html += '<div class="kd-banner">&#127796; Het is nu vakantie. Hieronder zie je de eerstvolgende schoolweek met klassendienst.</div>';
        }

        // ---- Hero ----
        html += '<section class="kd-hero">';
        html += '  <div class="kd-hero-top">';
        html += '    <span class="kd-week-pill">Week ' + (week.index + 1) + ' van ' + totalWeeks + '</span>';
        html += '    <h2 class="kd-hero-title">' + (cur.vacationNow ? 'Eerstvolgende klassendienst' : 'Deze week klassendienst') + '</h2>';
        html += '    <p class="kd-hero-date">' + escapeHtml(fmtRange(week.monday, week.friday)) + '</p>';
        html += '    <div class="kd-hero-actions">';
        html += '      <button type="button" class="kd-choose-btn" id="kdChooseBtn">&#9999;&#65039; Zelf het groepje kiezen</button>';
        if (manualPlanActive()) {
            html += '      <button type="button" class="kd-reset-btn" id="kdResetPlan">&#8634; Automatische rotatie</button>';
        }
        html += '    </div>';
        if (manualPlanActive()) {
            html += '    <p class="kd-manual-note">&#9998; Je hebt het groepje vanaf deze week zelf ingesteld.</p>';
        }
        html += '  </div>';
        html += '  <div class="kd-hero-grid">';
        html += '    <div class="kd-duty-people">' + peopleCardsHtml(week.students, 'big') + '</div>';
        html += '    <div class="kd-tasks-panel">';

        // Dag-header met tabs
        html += '      <div class="kd-day-header">';
        html += '        <span class="kd-today-label">Vandaag: <strong>' + todayName + '</strong></span>';
        html += '        <div class="kd-day-tabs">';
        WEEKDAYS.forEach(function (wd) {
            var isActive = (wd.code === dayCode);
            var isToday = (wd.code === todayCode);
            var cls = 'kd-day-tab' + (isActive ? ' active' : '') + (isToday ? ' is-today' : '');
            html += '<button type="button" class="' + cls + '" data-day="' + wd.code + '">' + wd.short + '</button>';
        });
        html += '        </div>';
        html += '      </div>';

        // Taakoverzicht (verwisselbaar per tab)
        html += '      <div id="kdTasksWrap">' + taskListHtml(dayCode) + '</div>';
        html += '    </div>';
        html += '  </div>';
        html += '</section>';

        // ---- Sneak preview volgende week ----
        var next = schoolWeeks[cur.index + 1];
        if (next) {
            html += '<section class="kd-next">';
            html += '  <div class="kd-next-head"><span class="kd-next-icon">&#128064;</span> Volgende week zijn jullie aan de beurt</div>';
            html += '  <p class="kd-next-date">' + escapeHtml(fmtRange(next.monday, next.friday)) + '</p>';
            html += '  <div class="kd-next-people">' + peopleCardsHtml(next.students, 'small') + '</div>';
            html += '</section>';
        }

        // ---- Jaaroverzicht ----
        html += jaaroverzichtHtml(week.index);

        container.innerHTML = html;
        bindDayTabs();
        bindTaskChecks();
        bindOverview();
        bindHeroActions();
    }

    function manualPlanActive() {
        var p = settings.manualPlan;
        return !!(p && p.year === activeYearLabel() && Array.isArray(p.order) && p.order.length);
    }

    function bindHeroActions() {
        var b = document.getElementById('kdChooseBtn');
        if (b) b.addEventListener('click', openChooseModal);
        var r = document.getElementById('kdResetPlan');
        if (r) r.addEventListener('click', clearManualPlan);
    }

    // ---- Personen met monster-avatar ----
    function peopleCardsHtml(list, size) {
        if (!list || !list.length) return '<p class="kd-empty-inline">Geen leerlingen</p>';
        return list.map(function (s) {
            var src = monsterForStudent(s);
            var inits = escapeHtml(initials(s));
            // onerror: verberg img, toon de initialen-span
            return '<div class="kd-person kd-person-' + size + '">' +
                '<div class="kd-avatar">' +
                  '<img src="' + src + '" alt="" class="kd-avatar-img" ' +
                       'onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">' +
                  '<span class="kd-avatar-initials">' + inits + '</span>' +
                '</div>' +
                '<span class="kd-person-name">' + escapeHtml(studentName(s)) + '</span>' +
                '<span class="kd-person-nr">nr. ' + escapeHtml(String(s.student_number)) + '</span>' +
                '</div>';
        }).join('');
    }

    // ---- Takenlijst gefilterd op dag, met afvinkbare knoppen ----
    function taskListHtml(dayCode) {
        if (!settings.tasks || !settings.tasks.length) {
            return '<p class="kd-empty-inline">Nog geen taken ingesteld. Voeg taken toe via het tandwiel rechtsboven.</p>';
        }
        var visible = settings.tasks.filter(function (t) {
            return t.day === 'all' || t.day === dayCode;
        });
        if (!visible.length) {
            var nm = WEEKDAYS.find(function (w) { return w.code === dayCode; });
            return '<p class="kd-empty-inline">Geen taken voor ' + escapeHtml(nm ? nm.name : 'deze dag') + '. Voeg dagspecifieke taken toe via het tandwiel.</p>';
        }
        return '<ul class="kd-task-list">' + visible.map(function (t) {
            var key = t.text;
            var done = !!checkState[key];
            var liCls = done ? ' class="kd-task-done"' : '';
            var btnCls = 'kd-task-check' + (done ? ' done' : '');
            var badge = (t.day === 'all')
                ? '<span class="kd-task-badge">elke dag</span>'
                : '';
            return '<li' + liCls + '>' +
                '<button type="button" class="' + btnCls + '" data-key="' + escapeHtml(key) + '" aria-label="Afvinken">&#10003;</button>' +
                '<span class="kd-task-text">' + escapeHtml(t.text) + '</span>' +
                badge +
                '</li>';
        }).join('') + '</ul>';
    }

    // ---- Dagtabs koppelen ----
    function bindDayTabs() {
        var tabs = container.querySelectorAll('.kd-day-tab');
        tabs.forEach(function (tab) {
            tab.addEventListener('click', function () {
                selectedDay = parseInt(tab.dataset.day, 10);
                tabs.forEach(function (t) { t.classList.toggle('active', t === tab); });
                var wrap = document.getElementById('kdTasksWrap');
                if (wrap) {
                    wrap.innerHTML = taskListHtml(selectedDay);
                    bindTaskChecks();
                }
            });
        });
    }

    // ---- Afvinkknopjes koppelen ----
    function bindTaskChecks() {
        var wrap = document.getElementById('kdTasksWrap');
        if (!wrap) return;
        wrap.querySelectorAll('.kd-task-check').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var key = btn.dataset.key;
                if (checkState[key]) {
                    delete checkState[key];
                } else {
                    checkState[key] = true;
                }
                saveCheckState();
                var li = btn.closest('li');
                var isDone = !!checkState[key];
                if (li) li.classList.toggle('kd-task-done', isDone);
                btn.classList.toggle('done', isDone);
            });
        });
    }

    // ---- Jaaroverzicht ----
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
            tasksEdit.innerHTML = '<p class="kd-empty-inline">Nog geen taken. Klik op „+ Taak”.</p>';
            return;
        }
        tasksEdit.innerHTML = settings.tasks.map(function (t, i) {
            var dayVal = (t.day === 'all' || t.day == null) ? 'all' : String(t.day);
            var opts = [
                { v: 'all', l: 'Alle dagen' },
                { v: '1', l: 'Maandag' },
                { v: '2', l: 'Dinsdag' },
                { v: '3', l: 'Woensdag' },
                { v: '4', l: 'Donderdag' },
                { v: '5', l: 'Vrijdag' }
            ].map(function (o) {
                return '<option value="' + o.v + '"' + (dayVal === o.v ? ' selected' : '') + '>' + o.l + '</option>';
            }).join('');

            return '<div class="kd-task-row">' +
                '<input type="text" class="kd-task-input" data-index="' + i + '" ' +
                    'value="' + escapeHtml(t.text) + '" placeholder="Taak omschrijving">' +
                '<select class="kd-day-select" data-index="' + i + '">' + opts + '</select>' +
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
        var rows = tasksEdit.querySelectorAll('.kd-task-row');
        var out = [];
        rows.forEach(function (row) {
            var inp = row.querySelector('.kd-task-input');
            var sel = row.querySelector('.kd-day-select');
            out.push({
                text: inp ? inp.value : '',
                day: normalizeDay(sel ? sel.value : 'all')
            });
        });
        settings.tasks = out;
    }

    function renderKPLinkSettings() {
        if (!kdLinkCheckbox || !kdLinkWrap || !kdLinkRewardSelect) return;
        kdLinkCheckbox.checked = !!settings.kdLink.enabled;
        kdLinkWrap.style.display = settings.kdLink.enabled ? 'block' : 'none';

        kdLinkRewardSelect.innerHTML = '';
        if (!klassePrestRewardTypes.length) {
            var opt = document.createElement('option');
            opt.value = '';
            opt.textContent = 'Geen beloningen gevonden — voeg toe in Klasseprestatie';
            kdLinkRewardSelect.appendChild(opt);
        } else {
            klassePrestRewardTypes.forEach(function (r) {
                var opt = document.createElement('option');
                opt.value = r.id;
                opt.textContent = r.icon + ' ' + r.label + ' (+' + r.points + ')';
                if (r.id === settings.kdLink.rewardTypeId) opt.selected = true;
                kdLinkRewardSelect.appendChild(opt);
            });
            // Fallback: selecteer eerste als huidige rewardTypeId niet gevonden wordt
            if (!klassePrestRewardTypes.find(function (r) { return r.id === settings.kdLink.rewardTypeId; })) {
                settings.kdLink.rewardTypeId = klassePrestRewardTypes[0] ? klassePrestRewardTypes[0].id : null;
                if (settings.kdLink.rewardTypeId) kdLinkRewardSelect.value = settings.kdLink.rewardTypeId;
            }
        }
    }

    function openSettings() {
        perWeekSelect.value = String(settings.perWeek || 2);
        renderTasksEdit();
        renderKPLinkSettings();
        settingsModal.classList.add('active');
    }

    function closeSettings() {
        settingsModal.classList.remove('active');
    }

    if (addTaskBtn) addTaskBtn.addEventListener('click', function () {
        collectTasks();
        settings.tasks.push({ text: '', day: 'all' });
        renderTasksEdit();
        var inputs = tasksEdit.querySelectorAll('.kd-task-input');
        if (inputs.length) inputs[inputs.length - 1].focus();
    });

    if (kdLinkCheckbox) kdLinkCheckbox.addEventListener('change', function () {
        settings.kdLink.enabled = kdLinkCheckbox.checked;
        if (kdLinkWrap) kdLinkWrap.style.display = settings.kdLink.enabled ? 'block' : 'none';
    });

    if (kdLinkRewardSelect) kdLinkRewardSelect.addEventListener('change', function () {
        settings.kdLink.rewardTypeId = kdLinkRewardSelect.value || null;
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
        if (e.key === 'Escape' && settingsModal && settingsModal.classList.contains('active')) closeSettings();
    });

    if (btnSaveSettings) btnSaveSettings.addEventListener('click', async function () {
        collectTasks();
        settings.tasks = settings.tasks
            .map(function (t) { return { text: (t.text || '').trim(), day: t.day }; })
            .filter(function (t) { return t.text; });
        settings.perWeek = parseInt(perWeekSelect.value, 10) || 2;
        var user = await getSessionUser();
        if (user) await saveSettings(user);
        closeSettings();
        buildSchoolWeeks();
        render();
    });

    // ---------- Zelf het groepje kiezen ----------
    var chooseSelected = [];

    function openChooseModal() {
        if (!chooseModal) return;
        var cur = findCurrentWeek();
        if (cur.index === -1) { showToast('Het schooljaar is afgelopen — stel eerst een nieuw schooljaar in.'); return; }
        var per = Math.max(1, settings.perWeek || 1);
        // Voorselecteren: het groepje van de huidige (getoonde) week
        var curStudents = (schoolWeeks[cur.index] && schoolWeeks[cur.index].students) || [];
        chooseSelected = curStudents.map(function (s) { return s.id; }).slice(0, per);
        renderChooseGrid();
        chooseModal.classList.add('active');
    }

    function closeChooseModal() {
        if (chooseModal) chooseModal.classList.remove('active');
    }

    function renderChooseGrid() {
        var per = Math.max(1, settings.perWeek || 1);
        if (chooseSub) {
            chooseSub.textContent = 'Selecteer ' + per + ' ' + (per === 1 ? 'kind' : 'kinderen') +
                ' voor deze week. Daarna loopt de rotatie verder op leerlingnummer.';
        }
        if (chooseCount) {
            chooseCount.textContent = chooseSelected.length + ' / ' + per + ' gekozen';
            chooseCount.classList.toggle('is-complete', chooseSelected.length === per);
        }
        chooseGrid.innerHTML = students.map(function (s) {
            var sel = chooseSelected.indexOf(s.id) !== -1;
            return '<button type="button" class="kd-choose-chip' + (sel ? ' selected' : '') + '" data-id="' + s.id + '">' +
                '<img src="' + monsterForStudent(s) + '" alt="" class="kd-choose-monster" ' +
                    'onerror="this.style.visibility=\'hidden\'">' +
                '<span class="kd-choose-name">' + escapeHtml(s.first_name || studentName(s)) + '</span>' +
                '<span class="kd-choose-nr">nr. ' + escapeHtml(String(s.student_number)) + '</span>' +
                '</button>';
        }).join('');
        chooseGrid.querySelectorAll('.kd-choose-chip').forEach(function (b) {
            b.addEventListener('click', function () { toggleChoose(b.dataset.id); });
        });
        if (chooseConfirm) chooseConfirm.disabled = chooseSelected.length !== per;
    }

    function toggleChoose(id) {
        var per = Math.max(1, settings.perWeek || 1);
        var i = chooseSelected.indexOf(id);
        if (i !== -1) {
            chooseSelected.splice(i, 1);
        } else {
            // Bij de max aangekomen? Vervang de oudste keuze, zo wissel je makkelijk.
            if (chooseSelected.length >= per) chooseSelected.shift();
            chooseSelected.push(id);
        }
        renderChooseGrid();
    }

    async function confirmChoose() {
        var per = Math.max(1, settings.perWeek || 1);
        if (chooseSelected.length !== per) return;
        var cur = findCurrentWeek();
        if (cur.index === -1) { showToast('Het schooljaar is afgelopen.'); return; }
        var anchorMonday = ymd(schoolWeeks[cur.index].monday);

        // Gekozen kinderen eerst (op nummer), daarna de rest op nummer.
        var chosenSet = {};
        chooseSelected.forEach(function (id) { chosenSet[id] = true; });
        var chosen = students.filter(function (s) { return chosenSet[s.id]; });
        var rest = students.filter(function (s) { return !chosenSet[s.id]; });
        var order = chosen.concat(rest).map(function (s) { return s.id; });

        settings.manualPlan = { year: activeYearLabel(), anchorMonday: anchorMonday, order: order };
        var user = await getSessionUser();
        if (user) await saveSettings(user);
        closeChooseModal();
        buildSchoolWeeks();
        render();
        showToast('&#9998; Nieuw voorstel gemaakt vanaf deze week.');
    }

    async function clearManualPlan() {
        if (!confirm('Terug naar de automatische rotatie op leerlingnummer? Je handmatig gekozen groepje vervalt.')) return;
        settings.manualPlan = null;
        var user = await getSessionUser();
        if (user) await saveSettings(user);
        buildSchoolWeeks();
        render();
        showToast('&#8634; Automatische rotatie hersteld.');
    }

    if (chooseClose) chooseClose.addEventListener('click', closeChooseModal);
    if (chooseCancel) chooseCancel.addEventListener('click', closeChooseModal);
    if (chooseConfirm) chooseConfirm.addEventListener('click', confirmChoose);
    if (chooseModal) chooseModal.addEventListener('click', function (e) {
        if (e.target === chooseModal) closeChooseModal();
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && chooseModal && chooseModal.classList.contains('active')) closeChooseModal();
    });

    // ---------- Init ----------
    async function init() {
        var user = await getSessionUser();
        if (!user) { container.innerHTML = noClassHtml(); return; }
        currentUser = user;

        await loadSettings(user);
        await loadSchooljaar(user);
        await loadKlasseprestatieRewardTypes();

        if (window.MTActiveClass && window.MTActiveClass.ready) {
            try { await window.MTActiveClass.ready; } catch (e) {}
        }

        groupId = window.MTActiveClass ? window.MTActiveClass.getId() : '';
        groupName = window.MTActiveClass ? window.MTActiveClass.getName() : '';

        if (groupId) {
            await loadStudents(groupId);
            buildSchoolWeeks();
        }
        render();
    }

    init();
});

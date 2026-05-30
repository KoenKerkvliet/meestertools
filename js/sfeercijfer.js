/* ============================================
   MEESTERTOOLS - Sfeercijfer

   Volg het groepsklimaat over tijd met één cijfer (1-10) per dag.
   Twee bronnen, allebei optioneel:
     - "Mijn cijfer": de leerkracht geeft één cijfer voor de groep.
     - "Klassikale ronde": leerlingen geven om de beurt een cijfer,
       de tool toont het klasgemiddelde.
   Daarbij een optionele notitie per dag, een grafiek over tijd en
   een logboek. Data per klas opgeslagen in tool_settings (JSON).
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    const TOOL_NAME = 'sfeercijfer';

    // Kleuren 1 t/m 10 (rood -> groen)
    const SCALE_COLORS = ['#E5484D', '#EC6240', '#F37C3B', '#F59331', '#F2A92C',
        '#E2BD22', '#BFC62B', '#92C13F', '#5FB457', '#2BA24C'];

    // ---------- DOM ----------
    const groupSelect = document.getElementById('sfGroupSelect');
    const noGroup = document.getElementById('sfNoGroup');
    const main = document.getElementById('sfMain');
    const todayDateEl = document.getElementById('sfTodayDate');
    const teacherScale = document.getElementById('sfTeacherScale');
    const noteEl = document.getElementById('sfNote');
    const roundResult = document.getElementById('sfRoundResult');
    const roundScale = document.getElementById('sfRoundScale');
    const roundClearBtn = document.getElementById('sfRoundClear');
    const periodEl = document.getElementById('sfPeriod');
    const chartEl = document.getElementById('sfChart');
    const chartEmpty = document.getElementById('sfChartEmpty');
    const tooltip = document.getElementById('sfTooltip');
    const logEl = document.getElementById('sfLog');
    const logEmpty = document.getElementById('sfLogEmpty');

    // ---------- State ----------
    let groups = [];
    let data = {};              // { byGroup: { [groupId]: { days: { dateKey: {teacher,note,round} } } } }
    let currentGroupId = '';
    let studentCount = 0;
    let period = 30;            // 30 | 90 | 'schooljaar' | 'all'
    let saveTimer = null;

    // ---------- Helpers ----------
    function escapeHtml(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }
    function todayKey() {
        const d = new Date();
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }
    const MONTHS = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
    const MONTHS_SHORT = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
    const DAYS = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];
    function parseKey(key) {
        const p = key.split('-');
        return new Date(parseInt(p[0]), parseInt(p[1]) - 1, parseInt(p[2]));
    }
    function fmtLong(key) {
        const d = parseKey(key);
        return DAYS[d.getDay()] + ' ' + d.getDate() + ' ' + MONTHS[d.getMonth()];
    }
    function fmtShort(key) {
        const d = parseKey(key);
        return d.getDate() + ' ' + MONTHS_SHORT[d.getMonth()];
    }
    async function getSessionUser() {
        const { data: { session } } = await supabase.auth.getSession();
        return session ? session.user : null;
    }

    // ---------- Data store ----------
    function groupDays() {
        if (!data.byGroup) data.byGroup = {};
        if (!data.byGroup[currentGroupId]) data.byGroup[currentGroupId] = { days: {} };
        if (!data.byGroup[currentGroupId].days) data.byGroup[currentGroupId].days = {};
        return data.byGroup[currentGroupId].days;
    }
    function readDay(key) {
        const days = groupDays();
        return days[key] || { teacher: undefined, note: '', round: undefined };
    }
    function writeDay(key, rec) {
        const days = groupDays();
        days[key] = rec;
    }
    function pruneDay(key) {
        const days = groupDays();
        const r = days[key];
        if (!r) return;
        const emptyRound = !r.round || !r.round.total;
        if ((r.teacher === undefined || r.teacher === null) && emptyRound && !(r.note && r.note.trim())) {
            delete days[key];
        }
    }
    function roundAvg(round) {
        if (!round || !round.total) return null;
        let sum = 0;
        round.counts.forEach(function (c, i) { sum += (i + 1) * c; });
        return sum / round.total;
    }

    async function loadSettings() {
        const user = await getSessionUser();
        if (!user) return;
        const { data: row } = await supabase
            .from('tool_settings')
            .select('settings')
            .eq('user_id', user.id)
            .eq('tool_name', TOOL_NAME)
            .maybeSingle();
        if (row && row.settings && typeof row.settings === 'object') {
            data = row.settings;
        }
        if (!data.byGroup) data.byGroup = {};
    }
    function scheduleSave() {
        if (saveTimer) clearTimeout(saveTimer);
        saveTimer = setTimeout(saveSettings, 500);
    }
    async function saveSettings() {
        const user = await getSessionUser();
        if (!user) return;
        await supabase
            .from('tool_settings')
            .upsert({
                user_id: user.id,
                tool_name: TOOL_NAME,
                settings: data,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id,tool_name' });
    }

    async function loadGroups() {
        const user = await getSessionUser();
        if (!user) return [];
        const { data: rows } = await supabase
            .from('groups')
            .select('id, name')
            .eq('user_id', user.id)
            .eq('archived', false)
            .order('name');
        return rows || [];
    }
    async function loadStudentCount(groupId) {
        const { count } = await supabase
            .from('students')
            .select('id', { count: 'exact', head: true })
            .eq('group_id', groupId)
            .eq('archived', false);
        return count || 0;
    }

    // ---------- Render: Vandaag ----------
    function renderToday() {
        todayDateEl.textContent = fmtLong(todayKey());
        const rec = readDay(todayKey());
        renderTeacherScale(rec);
        noteEl.value = rec.note || '';
        renderRound(rec);
    }

    function renderTeacherScale(rec) {
        teacherScale.innerHTML = '';
        for (let v = 1; v <= 10; v++) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'sf-scale-btn' + (rec.teacher === v ? ' selected' : '');
            btn.textContent = v;
            if (rec.teacher === v) {
                btn.style.background = SCALE_COLORS[v - 1];
                btn.style.borderColor = SCALE_COLORS[v - 1];
            }
            btn.addEventListener('click', function () { onTeacherPick(v, btn); });
            teacherScale.appendChild(btn);
        }
    }

    function onTeacherPick(v, btn) {
        const key = todayKey();
        const rec = Object.assign({ teacher: undefined, note: '', round: undefined }, readDay(key));
        rec.teacher = (rec.teacher === v) ? undefined : v; // nogmaals klikken = wissen
        writeDay(key, rec);
        pruneDay(key);
        scheduleSave();
        renderTeacherScale(readDay(key));
        if (rec.teacher !== undefined) {
            const fresh = teacherScale.children[v - 1];
            if (fresh) { fresh.classList.add('clicked'); setTimeout(function () { fresh.classList.remove('clicked'); }, 350); }
        }
        renderTrend();
        renderLog();
    }

    function renderRound(rec) {
        const round = rec.round;
        const avg = roundAvg(round);
        // Resultaatblok
        let html = '';
        if (avg != null) {
            const total = round.total;
            let bar = '<div class="sf-round-bar">';
            round.counts.forEach(function (c, i) {
                if (c <= 0) return;
                bar += '<span style="width:' + (c / total * 100) + '%;background:' + SCALE_COLORS[i] + '"></span>';
            });
            bar += '</div>';
            const ctx = studentCount ? (total + ' van ' + studentCount + ' leerlingen') : (total + ' ' + (total === 1 ? 'cijfer' : 'cijfers'));
            html = '<span class="sf-round-avg" style="color:' + colorForValue(avg) + '">' + avg.toFixed(1) + '</span>' +
                '<div class="sf-round-meta"><span>' + ctx + '</span>' + bar + '</div>';
        } else {
            html = '<span class="sf-round-avg empty">&ndash;</span>' +
                '<div class="sf-round-meta"><span>Tik per leerling op een cijfer hieronder.</span></div>';
        }
        roundResult.innerHTML = html;

        // Schaal met tally-badges
        roundScale.innerHTML = '';
        for (let v = 1; v <= 10; v++) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'sf-scale-btn';
            btn.textContent = v;
            const cnt = round && round.counts ? round.counts[v - 1] : 0;
            if (cnt > 0) {
                btn.style.borderColor = SCALE_COLORS[v - 1];
                btn.style.color = SCALE_COLORS[v - 1];
                const badge = document.createElement('span');
                badge.className = 'sf-tally';
                badge.textContent = cnt;
                btn.appendChild(badge);
            }
            btn.addEventListener('click', function () { onRoundTick(v, btn); });
            roundScale.appendChild(btn);
        }
    }

    function onRoundTick(v, btn) {
        const key = todayKey();
        const rec = Object.assign({ teacher: undefined, note: '', round: undefined }, readDay(key));
        if (!rec.round || !rec.round.counts) rec.round = { counts: new Array(10).fill(0), total: 0 };
        rec.round.counts[v - 1] += 1;
        rec.round.total += 1;
        writeDay(key, rec);
        scheduleSave();
        btn.classList.add('clicked');
        setTimeout(function () { btn.classList.remove('clicked'); }, 350);
        renderRound(readDay(key));
        renderTrend();
        renderLog();
    }

    roundClearBtn.addEventListener('click', function () {
        const key = todayKey();
        const rec = readDay(key);
        if (!rec.round || !rec.round.total) return;
        if (!confirm('De klassikale ronde van vandaag wissen?')) return;
        const fresh = Object.assign({}, rec);
        fresh.round = undefined;
        writeDay(key, fresh);
        pruneDay(key);
        scheduleSave();
        renderRound(readDay(key));
        renderTrend();
        renderLog();
    });

    noteEl.addEventListener('input', function () {
        const key = todayKey();
        const rec = Object.assign({ teacher: undefined, note: '', round: undefined }, readDay(key));
        rec.note = noteEl.value;
        writeDay(key, rec);
        pruneDay(key);
        scheduleSave();
        renderLog();
    });

    function colorForValue(v) {
        const idx = Math.min(9, Math.max(0, Math.round(v) - 1));
        return SCALE_COLORS[idx];
    }

    // ---------- Verloop (grafiek) ----------
    function daysInPeriod() {
        const days = groupDays();
        const keys = Object.keys(days).filter(function (k) {
            const r = days[k];
            return (r.teacher !== undefined && r.teacher !== null) || roundAvg(r.round) != null;
        });
        let cutoff = null;
        if (period === 30 || period === 90) {
            const c = new Date(); c.setHours(0, 0, 0, 0); c.setDate(c.getDate() - period);
            cutoff = c;
        } else if (period === 'schooljaar') {
            const now = new Date();
            const startYear = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
            cutoff = new Date(startYear, 7, 1);
        }
        return keys
            .filter(function (k) { return !cutoff || parseKey(k) >= cutoff; })
            .sort();
    }

    function renderTrend() {
        const keys = daysInPeriod();
        const points = keys.map(function (k) {
            const r = readDay(k);
            return {
                key: k,
                teacher: (r.teacher !== undefined && r.teacher !== null) ? r.teacher : null,
                cls: roundAvg(r.round),
                clsTotal: r.round ? r.round.total : 0,
                note: (r.note || '').trim()
            };
        });

        if (points.length < 2) {
            chartEl.style.display = 'none';
            chartEmpty.style.display = 'block';
            return;
        }
        chartEl.style.display = 'block';
        chartEmpty.style.display = 'none';

        const W = 820, H = 340;
        const padL = 34, padR = 16, padT = 16, padB = 30;
        const plotW = W - padL - padR;
        const plotH = H - padT - padB;
        const n = points.length;
        const xFor = function (i) { return n <= 1 ? padL + plotW / 2 : padL + (i / (n - 1)) * plotW; };
        const yFor = function (v) { return padT + (1 - (v - 1) / 9) * plotH; };

        let svg = '';
        // Horizontale gridlijnen + y-labels (2,4,6,8,10)
        [2, 4, 6, 8, 10].forEach(function (v) {
            const y = yFor(v);
            svg += '<line class="sf-grid-line" x1="' + padL + '" y1="' + y + '" x2="' + (W - padR) + '" y2="' + y + '"></line>';
            svg += '<text class="sf-axis-label" x="' + (padL - 8) + '" y="' + (y + 4) + '" text-anchor="end">' + v + '</text>';
        });

        // Lijnen
        svg += linePath(points, 'teacher', xFor, yFor, 'sf-line-teacher');
        svg += linePath(points, 'cls', xFor, yFor, 'sf-line-class');

        // X-labels (max ~6 evenredig verdeeld)
        const labelStep = Math.max(1, Math.ceil(n / 6));
        for (let i = 0; i < n; i += labelStep) {
            svg += '<text class="sf-axis-label" x="' + xFor(i) + '" y="' + (H - 8) + '" text-anchor="middle">' + escapeHtml(fmtShort(points[i].key)) + '</text>';
        }

        // Punten + hitvlakken
        points.forEach(function (p, i) {
            const x = xFor(i);
            if (p.cls != null) {
                svg += '<circle class="sf-dot-class" cx="' + x + '" cy="' + yFor(p.cls) + '" r="4"></circle>';
            }
            if (p.teacher != null) {
                if (p.note) {
                    svg += '<circle class="sf-dot-note" cx="' + x + '" cy="' + yFor(p.teacher) + '" r="7"></circle>';
                }
                svg += '<circle class="sf-dot-teacher" cx="' + x + '" cy="' + yFor(p.teacher) + '" r="4"></circle>';
            }
            // transparant hitvlak voor tooltip
            const hy = p.teacher != null ? yFor(p.teacher) : yFor(p.cls);
            svg += '<circle class="sf-hit" data-i="' + i + '" cx="' + x + '" cy="' + hy + '" r="14" fill="transparent" style="cursor:pointer"></circle>';
        });

        chartEl.innerHTML = svg;

        // Tooltip-events
        chartEl.querySelectorAll('.sf-hit').forEach(function (hit) {
            hit.addEventListener('mouseenter', function () { showTip(points[parseInt(hit.dataset.i)], hit); });
            hit.addEventListener('mouseleave', hideTip);
        });
    }

    function linePath(points, field, xFor, yFor, cls) {
        let d = '';
        let started = false;
        points.forEach(function (p, i) {
            const v = p[field];
            if (v == null) return;
            d += (started ? ' L ' : 'M ') + xFor(i) + ' ' + yFor(v);
            started = true;
        });
        if (!d) return '';
        return '<path class="' + cls + '" d="' + d + '"></path>';
    }

    function showTip(p, hit) {
        const wrap = chartEl.parentElement;
        const wrapRect = wrap.getBoundingClientRect();
        const dotRect = hit.getBoundingClientRect();
        const left = dotRect.left - wrapRect.left + dotRect.width / 2;
        const top = dotRect.top - wrapRect.top + dotRect.height / 2 - 8;

        let html = '<strong>' + escapeHtml(fmtLong(p.key)) + '</strong>';
        if (p.teacher != null) html += '<br>Mijn cijfer: <strong>' + p.teacher + '</strong>';
        if (p.cls != null) html += '<br>Klas: <strong>' + p.cls.toFixed(1) + '</strong> (' + p.clsTotal + ')';
        if (p.note) html += '<span class="sf-tt-note">&ldquo;' + escapeHtml(p.note) + '&rdquo;</span>';
        tooltip.innerHTML = html;
        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
        tooltip.classList.add('visible');
    }
    function hideTip() { tooltip.classList.remove('visible'); }

    periodEl.addEventListener('click', function (e) {
        const btn = e.target.closest('button');
        if (!btn) return;
        const raw = btn.dataset.days;
        period = (raw === 'all' || raw === 'schooljaar') ? raw : parseInt(raw);
        periodEl.querySelectorAll('button').forEach(function (b) { b.classList.toggle('active', b === btn); });
        renderTrend();
    });

    // ---------- Logboek ----------
    function renderLog() {
        const days = groupDays();
        const keys = Object.keys(days).filter(function (k) {
            const r = days[k];
            return (r.teacher !== undefined && r.teacher !== null) || roundAvg(r.round) != null || (r.note && r.note.trim());
        }).sort().reverse();

        if (!keys.length) {
            logEl.style.display = 'none';
            logEmpty.style.display = 'block';
            return;
        }
        logEl.style.display = 'flex';
        logEmpty.style.display = 'none';
        logEl.innerHTML = '';

        keys.forEach(function (k) {
            const r = readDay(k);
            const avg = roundAvg(r.round);
            const row = document.createElement('div');
            row.className = 'sf-log-row';

            let chips = '';
            if (r.teacher !== undefined && r.teacher !== null) {
                chips += '<span class="sf-log-chip teacher">' + r.teacher + ' <small>ik</small></span>';
            }
            if (avg != null) {
                chips += '<span class="sf-log-chip class">' + avg.toFixed(1) + ' <small>klas</small></span>';
            }

            row.innerHTML =
                '<span class="sf-log-date">' + escapeHtml(fmtShort(k)) + '</span>' +
                '<span class="sf-log-scores">' + chips + '</span>' +
                '<span class="sf-log-note">' + (r.note && r.note.trim() ? escapeHtml(r.note.trim()) : '') + '</span>' +
                '<button class="sf-log-del" title="Verwijderen">&times;</button>';

            row.querySelector('.sf-log-del').addEventListener('click', function () {
                if (!confirm('Sfeercijfer van ' + fmtLong(k) + ' verwijderen?')) return;
                delete days[k];
                scheduleSave();
                if (k === todayKey()) renderToday();
                renderTrend();
                renderLog();
            });

            logEl.appendChild(row);
        });
    }

    // ---------- Flow ----------
    async function selectGroup(groupId) {
        currentGroupId = groupId || '';
        if (window.MTActiveClass && currentGroupId) window.MTActiveClass.setId(currentGroupId);
        if (!currentGroupId) {
            noGroup.style.display = 'block';
            main.style.display = 'none';
            return;
        }
        noGroup.style.display = 'none';
        main.style.display = 'block';
        studentCount = await loadStudentCount(currentGroupId);
        renderToday();
        renderTrend();
        renderLog();
    }

    groupSelect.addEventListener('change', function () { selectGroup(groupSelect.value); });

    // ---------- Init ----------
    async function init() {
        await loadSettings();
        groups = await loadGroups();
        groupSelect.innerHTML = '<option value="">Kies een klas...</option>' +
            groups.map(function (g) { return '<option value="' + g.id + '">' + escapeHtml(g.name) + '</option>'; }).join('');

        if (window.MTActiveClass && window.MTActiveClass.ready) {
            try { await window.MTActiveClass.ready; } catch (e) {}
        }
        let defaultId = '';
        if (window.MTActiveClass) defaultId = window.MTActiveClass.resolveDefault('', groups);
        if (defaultId && groups.some(function (g) { return g.id === defaultId; })) {
            groupSelect.value = defaultId;
            await selectGroup(defaultId);
        }
    }

    init();
});

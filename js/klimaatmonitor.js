/* ============================================
   MEESTERTOOLS - Klimaat-monitor

   Bundelt het sociogram (per leerling) en de klasseprestatie-erkenning
   en signaleert kinderen die aan de rand staan. Signalerend, niet
   oordelend: de leerkracht houdt altijd de eigen blik op de groep.

   Notities + "opgepakt"-vinkje per gesignaleerd kind worden bewaard in
   tool_settings (JSON), net als de andere groepsvorming-tools.
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    const TOOL_NAME = 'klimaatmonitor';
    const RECENT_DAYS = 30;

    // ---------- DOM ----------
    const groupSelect = document.getElementById('kmGroupSelect');
    const basisWrap = document.getElementById('kmBasisWrap');
    const basisSelect = document.getElementById('kmBasisSelect');
    const noGroup = document.getElementById('kmNoGroup');
    const main = document.getElementById('kmMain');
    const summaryEl = document.getElementById('kmSummary');
    const noSociogram = document.getElementById('kmNoSociogram');
    const signalsEl = document.getElementById('kmSignals');
    const signalsEmpty = document.getElementById('kmSignalsEmpty');
    const rosterSection = document.getElementById('kmRosterSection');
    const rosterSub = document.getElementById('kmRosterSub');
    const rosterEl = document.getElementById('kmRoster');

    // ---------- State ----------
    let groups = [];
    let students = [];
    let sessions = [];
    let currentGroupId = '';
    let currentSessionId = '';
    let notesByGroup = {};       // { groupId: { studentId: {note, handled, updatedAt} } }
    let saveTimer = null;

    // ---------- Helpers ----------
    function escapeHtml(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }
    function studentName(s) {
        if (!s) return '?';
        return ((s.first_name || '') + ' ' + (s.last_name || '')).trim() || '?';
    }
    function formatDate(iso) {
        if (!iso) return '';
        const d = new Date(iso);
        const m = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
        return d.getDate() + ' ' + m[d.getMonth()] + ' ' + d.getFullYear();
    }
    function typeLabel(t) {
        return t === 'werken' ? 'Samen werken' : t === 'spelen' ? 'Samen spelen' : (t || '');
    }
    async function getSessionUser() {
        const { data: { session } } = await supabase.auth.getSession();
        return session ? session.user : null;
    }

    // ---------- Data ----------
    async function loadSettings() {
        const user = await getSessionUser();
        if (!user) return;
        const { data } = await supabase
            .from('tool_settings')
            .select('settings')
            .eq('user_id', user.id)
            .eq('tool_name', TOOL_NAME)
            .maybeSingle();
        if (data && data.settings && data.settings.notes && typeof data.settings.notes === 'object') {
            notesByGroup = data.settings.notes;
        }
    }

    function scheduleSave() {
        if (saveTimer) clearTimeout(saveTimer);
        saveTimer = setTimeout(saveSettings, 600);
    }

    async function saveSettings() {
        const user = await getSessionUser();
        if (!user) return;
        await supabase
            .from('tool_settings')
            .upsert({
                user_id: user.id,
                tool_name: TOOL_NAME,
                settings: { notes: notesByGroup },
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id,tool_name' });
    }

    async function loadGroups() {
        const user = await getSessionUser();
        if (!user) return [];
        const { data } = await supabase
            .from('groups')
            .select('id, name')
            .eq('user_id', user.id)
            .eq('archived', false)
            .order('name');
        return data || [];
    }

    async function loadStudents(groupId) {
        const { data } = await supabase
            .from('students')
            .select('id, first_name, last_name')
            .eq('group_id', groupId)
            .eq('archived', false)
            .order('first_name');
        return data || [];
    }

    async function loadSessions(groupId) {
        const { data } = await supabase
            .from('sociogram_sessions')
            .select('id, type, afname_datum, titel')
            .eq('group_id', groupId)
            .order('afname_datum', { ascending: false });
        return data || [];
    }

    async function loadPicks(sessionId) {
        const { data } = await supabase
            .from('sociogram_picks')
            .select('from_student_id, to_student_id, pick_type')
            .eq('session_id', sessionId);
        return data || [];
    }

    // Klasseprestatie van de laatste RECENT_DAYS, per leerling geteld naar
    // erkenning (positieve punten) vs. aandachtspunten (negatieve punten).
    async function loadRecognition(studentIds) {
        const result = {};
        studentIds.forEach(function (id) { result[id] = { positief: 0, aandacht: 0 }; });
        if (!studentIds.length) return result;
        const since = new Date();
        since.setDate(since.getDate() - RECENT_DAYS);
        const { data } = await supabase
            .from('klasseprestatie_points')
            .select('student_id, points, awarded_at')
            .in('student_id', studentIds)
            .gte('awarded_at', since.toISOString());
        (data || []).forEach(function (row) {
            const r = result[row.student_id];
            if (!r) return;
            if (row.points >= 0) r.positief += 1;
            else r.aandacht += 1;
        });
        return result;
    }

    // ---------- Analyse ----------
    // Bouw per leerling de inkomende positieve/negatieve keuzes en wederzijdse
    // vriendschappen op basis van de gekozen sociogram-peiling.
    function computeSociometrics(picks) {
        const posIn = {};   // studentId -> Set van kiezers
        const negIn = {};
        const posOut = {};  // studentId -> Set van gekozenen
        students.forEach(function (s) {
            posIn[s.id] = new Set();
            negIn[s.id] = new Set();
            posOut[s.id] = new Set();
        });
        picks.forEach(function (p) {
            if (!posIn[p.to_student_id] || !posOut[p.from_student_id]) return;
            if (p.pick_type === 'positief') {
                posIn[p.to_student_id].add(p.from_student_id);
                posOut[p.from_student_id].add(p.to_student_id);
            } else if (p.pick_type === 'negatief') {
                negIn[p.to_student_id].add(p.from_student_id);
            }
        });
        const metrics = {};
        students.forEach(function (s) {
            let mutual = 0;
            posOut[s.id].forEach(function (otherId) {
                if (posOut[otherId] && posOut[otherId].has(s.id)) mutual += 1;
            });
            metrics[s.id] = {
                posIn: posIn[s.id].size,
                negIn: negIn[s.id].size,
                mutual: mutual
            };
        });
        return metrics;
    }

    // Bouw de signaal-redenen voor één leerling. severity: 'high' | 'med' | 'info'.
    function buildReasons(metric, recog, hasSociogram) {
        const reasons = [];
        if (hasSociogram && metric) {
            const p = metric.posIn, n = metric.negIn;
            if (p === 0 && n === 0) {
                reasons.push({ sev: 'high', text: 'Valt buiten beeld: niet gekozen én niet gemeden door klasgenoten.' });
            } else if (p === 0 && n >= 2) {
                reasons.push({ sev: 'high', text: 'Wordt door meerdere kinderen liever gemeden en door niemand positief gekozen.' });
            } else if (p === 0 && n === 1) {
                reasons.push({ sev: 'med', text: 'Door niemand positief gekozen.' });
            } else if (p === 1) {
                reasons.push({ sev: 'med', text: 'Maar door één klasgenoot positief gekozen.' });
            }
            if (p >= 1 && metric.mutual === 0) {
                reasons.push({ sev: 'med', text: 'Geen wederzijdse vriendschap: koos anderen, maar dat is niet beantwoord.' });
            }
            if (p >= 2 && n >= 2) {
                reasons.push({ sev: 'info', text: 'Omstreden: zowel positief als negatief gekozen — verdeelde reacties.' });
            }
        }
        if (recog) {
            if (recog.aandacht >= 3) {
                reasons.push({ sev: 'med', text: 'Relatief veel aandachtspunten in de klasseprestatie de afgelopen ' + RECENT_DAYS + ' dagen.' });
            }
            if (recog.positief === 0) {
                reasons.push({ sev: 'info', text: 'Kreeg de afgelopen ' + RECENT_DAYS + ' dagen geen erkenning of compliment in de klasseprestatie.' });
            }
        }
        return reasons;
    }

    function topSeverity(reasons) {
        if (reasons.some(function (r) { return r.sev === 'high'; })) return 'high';
        if (reasons.some(function (r) { return r.sev === 'med'; })) return 'med';
        if (reasons.length) return 'info';
        return 'ok';
    }

    // ---------- Notities ----------
    function getNote(studentId) {
        const g = notesByGroup[currentGroupId];
        return (g && g[studentId]) || { note: '', handled: false };
    }
    function setNote(studentId, patch) {
        if (!notesByGroup[currentGroupId]) notesByGroup[currentGroupId] = {};
        const cur = notesByGroup[currentGroupId][studentId] || { note: '', handled: false };
        notesByGroup[currentGroupId][studentId] = Object.assign(cur, patch, { updatedAt: new Date().toISOString() });
        scheduleSave();
    }

    // ---------- Render ----------
    function render(metrics, recogById, hasSociogram) {
        // Bouw per leerling het analyse-record
        const records = students.map(function (s) {
            const metric = metrics ? metrics[s.id] : null;
            const recog = recogById[s.id] || { positief: 0, aandacht: 0 };
            const reasons = buildReasons(metric, recog, hasSociogram);
            return {
                student: s,
                metric: metric,
                recog: recog,
                reasons: reasons,
                sev: topSeverity(reasons)
            };
        });

        const flagged = records.filter(function (r) { return r.sev === 'high' || r.sev === 'med'; });
        // Hoogste severity eerst, dan op naam
        const order = { high: 0, med: 1 };
        flagged.sort(function (a, b) {
            if (order[a.sev] !== order[b.sev]) return order[a.sev] - order[b.sev];
            return studentName(a.student).localeCompare(studentName(b.student));
        });

        renderSummary(records, flagged, hasSociogram);
        renderSignals(flagged);
        renderRoster(records, hasSociogram);

        noSociogram.style.display = hasSociogram ? 'none' : 'flex';
    }

    function renderSummary(records, flagged, hasSociogram) {
        const high = flagged.filter(function (r) { return r.sev === 'high'; }).length;
        const med = flagged.filter(function (r) { return r.sev === 'med'; }).length;
        const ok = records.length - flagged.length;
        summaryEl.innerHTML =
            statCard(records.length, 'leerlingen', '') +
            statCard(high, high === 1 ? 'urgent signaal' : 'urgente signalen', 'is-alert') +
            statCard(med, 'om in de gaten te houden', 'is-watch') +
            statCard(ok, 'goed in beeld', 'is-ok');
    }
    function statCard(num, label, cls) {
        return '<div class="km-stat ' + cls + '">' +
            '<span class="km-stat-num">' + num + '</span>' +
            '<span class="km-stat-label">' + escapeHtml(label) + '</span>' +
        '</div>';
    }

    function renderSignals(flagged) {
        if (!flagged.length) {
            signalsEl.style.display = 'none';
            signalsEmpty.style.display = 'block';
            return;
        }
        signalsEl.style.display = 'grid';
        signalsEmpty.style.display = 'none';
        signalsEl.innerHTML = '';

        flagged.forEach(function (r) {
            const note = getNote(r.student.id);
            const sevLabel = r.sev === 'high' ? 'Urgent' : 'In de gaten houden';
            const card = document.createElement('div');
            card.className = 'km-signal-card sev-' + r.sev + (note.handled ? ' is-handled' : '');

            const reasonsHtml = r.reasons.map(function (reason) {
                return '<li class="km-reason sev-' + reason.sev + '">' +
                    '<span class="km-reason-dot"></span>' +
                    '<span>' + escapeHtml(reason.text) + '</span>' +
                '</li>';
            }).join('');

            card.innerHTML =
                '<div class="km-signal-head">' +
                    '<span class="km-signal-name">' + escapeHtml(studentName(r.student)) + '</span>' +
                    '<span class="km-signal-badge sev-' + r.sev + '">' + sevLabel + '</span>' +
                '</div>' +
                '<ul class="km-reasons">' + reasonsHtml + '</ul>' +
                '<div class="km-note-wrap">' +
                    '<textarea class="km-note" placeholder="Notitie: wat ga je doen of opvolgen?">' + escapeHtml(note.note) + '</textarea>' +
                    '<label class="km-handled">' +
                        '<input type="checkbox"' + (note.handled ? ' checked' : '') + '>' +
                        '<span>Opgepakt</span>' +
                    '</label>' +
                '</div>';

            const textarea = card.querySelector('.km-note');
            textarea.addEventListener('input', function () {
                setNote(r.student.id, { note: textarea.value });
            });
            const checkbox = card.querySelector('.km-handled input');
            checkbox.addEventListener('change', function () {
                setNote(r.student.id, { handled: checkbox.checked });
                card.classList.toggle('is-handled', checkbox.checked);
            });

            signalsEl.appendChild(card);
        });
    }

    function renderRoster(records, hasSociogram) {
        rosterSub.textContent = hasSociogram
            ? 'Volledig overzicht. Gebaseerd op de gekozen sociogram-peiling en de klasseprestatie van de afgelopen ' + RECENT_DAYS + ' dagen.'
            : 'Volledig overzicht. Gebaseerd op de klasseprestatie van de afgelopen ' + RECENT_DAYS + ' dagen (nog geen sociogram).';

        const sorted = records.slice().sort(function (a, b) {
            return studentName(a.student).localeCompare(studentName(b.student));
        });

        let head = '<thead><tr><th>Leerling</th>';
        if (hasSociogram) {
            head += '<th class="num">+ gekozen</th><th class="num">- gekozen</th><th class="num">wederzijds</th>';
        }
        head += '<th class="num">erkenning ' + RECENT_DAYS + 'd</th><th class="num">aandacht ' + RECENT_DAYS + 'd</th><th>Status</th></tr></thead>';

        let body = '<tbody>';
        sorted.forEach(function (r) {
            const m = r.metric || { posIn: 0, negIn: 0, mutual: 0 };
            const pillCls = r.sev === 'high' ? 's-high' : r.sev === 'med' ? 's-med' : 's-ok';
            const pillTxt = r.sev === 'high' ? 'Urgent' : r.sev === 'med' ? 'Let op' : 'Goed in beeld';
            body += '<tr class="' + (r.sev === 'high' || r.sev === 'med' ? 'is-flagged' : '') + '">' +
                '<td class="km-cell-name">' + escapeHtml(studentName(r.student)) + '</td>';
            if (hasSociogram) {
                body += '<td class="num pos">' + m.posIn + '</td>' +
                    '<td class="num neg">' + m.negIn + '</td>' +
                    '<td class="num">' + (m.mutual > 0 ? m.mutual : '<span class="muted">0</span>') + '</td>';
            }
            body += '<td class="num">' + (r.recog.positief > 0 ? r.recog.positief : '<span class="muted">0</span>') + '</td>' +
                '<td class="num">' + (r.recog.aandacht > 0 ? r.recog.aandacht : '<span class="muted">0</span>') + '</td>' +
                '<td><span class="km-pill ' + pillCls + '">' + pillTxt + '</span></td>' +
            '</tr>';
        });
        body += '</tbody>';
        rosterEl.innerHTML = head + body;
    }

    // ---------- Flow ----------
    async function refresh() {
        if (!currentGroupId) {
            noGroup.style.display = 'block';
            main.style.display = 'none';
            basisWrap.style.display = 'none';
            return;
        }
        noGroup.style.display = 'none';
        main.style.display = 'block';

        students = await loadStudents(currentGroupId);
        sessions = await loadSessions(currentGroupId);

        // Basis-peiling dropdown
        if (sessions.length) {
            basisWrap.style.display = 'flex';
            basisSelect.innerHTML = sessions.map(function (s) {
                const label = (s.titel ? s.titel + ' — ' : '') + typeLabel(s.type) + ' · ' + formatDate(s.afname_datum);
                return '<option value="' + s.id + '">' + escapeHtml(label) + '</option>';
            }).join('');
            if (!sessions.some(function (s) { return s.id === currentSessionId; })) {
                currentSessionId = sessions[0].id;
            }
            basisSelect.value = currentSessionId;
        } else {
            basisWrap.style.display = 'none';
            currentSessionId = '';
        }

        const studentIds = students.map(function (s) { return s.id; });
        const recogById = await loadRecognition(studentIds);

        let metrics = null;
        const hasSociogram = !!currentSessionId;
        if (hasSociogram) {
            const picks = await loadPicks(currentSessionId);
            metrics = computeSociometrics(picks);
        }

        render(metrics, recogById, hasSociogram);
    }

    async function selectGroup(groupId) {
        currentGroupId = groupId || '';
        currentSessionId = '';
        if (window.MTActiveClass && currentGroupId) window.MTActiveClass.setId(currentGroupId);
        await refresh();
    }

    basisSelect.addEventListener('change', async function () {
        currentSessionId = basisSelect.value;
        await refresh();
    });

    groupSelect.addEventListener('change', function () {
        selectGroup(groupSelect.value);
    });

    // ---------- Init ----------
    async function init() {
        await loadSettings();
        groups = await loadGroups();

        groupSelect.innerHTML = '<option value="">Kies een klas...</option>' +
            groups.map(function (g) {
                return '<option value="' + g.id + '">' + escapeHtml(g.name) + '</option>';
            }).join('');

        if (window.MTActiveClass && window.MTActiveClass.ready) {
            try { await window.MTActiveClass.ready; } catch (e) {}
        }
        let defaultId = '';
        if (window.MTActiveClass) {
            defaultId = window.MTActiveClass.resolveDefault('', groups);
        }
        if (defaultId && groups.some(function (g) { return g.id === defaultId; })) {
            groupSelect.value = defaultId;
            await selectGroup(defaultId);
        }
    }

    init();
});

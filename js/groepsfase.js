/* ============================================
   GROEPSFASE-TRACKER - JavaScript

   Houdt per klas bij in welke groepsfase (Tuckman) de groep zit,
   met passende werkvormen en een tijdlijn over het schooljaar.
   Data wordt opgeslagen in tool_settings (JSON), net als Check-in
   en Gedragspatroon. Geen aparte tabel nodig.
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    const TOOL_NAME = 'groepsfase';

    // ---------- Fase-inhoud (eigen tekst, Tuckman als kapstok) ----------
    const PHASES = [
        {
            id: 'kennismaken',
            name: 'Kennismaken',
            tuckman: 'Forming',
            emoji: '\u{1F331}', // 🌱
            color: '#4ECDC4',
            desc: 'De groep is net gevormd. Leerlingen zijn voorzichtig en beleefd, zoeken houvast bij jou en tasten af wie de anderen zijn. Er is nog weinig wij-gevoel.',
            focus: [
                'Wees zichtbaar aanwezig en stuur duidelijk; jij bent het veilige middelpunt.',
                'Investeer in kennismaken: namen, interesses en korte 1-op-1 momentjes.',
                'Maak samen de eerste afspraken en herhaal ze vaak.'
            ],
            werkvormen: [
                { text: 'Kennismakingsspellen waarbij iedereen even in beeld komt.' },
                { text: 'Stel samen de klassenafspraken op en hang ze zichtbaar op.' },
                { text: 'Laat iedereen aan de beurt komen met de', tool: { label: 'Namenkiezer', href: '/digibord/namenkiezer', icon: '\u{270D}\u{FE0F}' } },
                { text: 'Peil dagelijks de sfeer met de', tool: { label: 'Check-in', href: '/groepsvorming/checkin', icon: '\u{1F60A}' } }
            ]
        },
        {
            id: 'aftasten',
            name: 'Aftasten',
            tuckman: 'Storming',
            emoji: '\u{26A1}', // ⚡
            color: '#FF8C42',
            desc: 'Leerlingen bepalen hun positie en de pikorde. Er ontstaat wrijving, grenzen worden opgezocht en groepjes botsen. Vervelend, maar het hoort erbij — juist nu is jouw sturing belangrijk.',
            focus: [
                'Blijf rustig en consequent; conflict is normaal, geen falen.',
                'Pak gedoe klein en snel aan en benoem wat je ziet.',
                'Houd vast aan de afspraken en handhaaf ze zichtbaar.'
            ],
            werkvormen: [
                { text: 'Oefen conflictoplossing met een vast stappenplan.' },
                { text: 'Kringgesprek over hoe we met elkaar omgaan.' },
                { text: 'Zie wie samen optrekt en wie aan de rand staat met het', tool: { label: 'Sociogram', href: '/groepsvorming/sociogram', icon: '\u{1F91D}' } },
                { text: 'Mix bewust buiten de vriendenclubjes met de', tool: { label: 'Groepjesmaker', href: '/digibord/groepjesmaker', icon: '\u{1F465}' } }
            ]
        },
        {
            id: 'afspreken',
            name: 'Afspreken',
            tuckman: 'Norming',
            emoji: '\u{1F91D}', // 🤝
            color: '#6C63FF',
            desc: 'De storm gaat liggen. Afspraken worden eigen gemaakt, leerlingen accepteren elkaars rollen en er groeit een wij-gevoel. Er ontstaat ruimte om echt samen te werken.',
            focus: [
                'Geef de groep stap voor stap meer eigen verantwoordelijkheid.',
                'Vier wat goed gaat en maak gewenst gedrag zichtbaar.',
                'Bewaak dat ook de stillere leerlingen blijven meedoen.'
            ],
            werkvormen: [
                { text: 'Coöperatieve werkvormen met vaste rollen.' },
                { text: 'Laat leerlingen elkaar complimenten geven.' },
                { text: 'Waardeer gewenst gedrag met', tool: { label: 'Klasseprestatie', href: '/klasseprestatie', icon: '\u{1F3C6}' } },
                { text: 'Wissel de samenstelling af met de', tool: { label: 'Groepjesmaker', href: '/digibord/groepjesmaker', icon: '\u{1F465}' } }
            ]
        },
        {
            id: 'presteren',
            name: 'Samen presteren',
            tuckman: 'Performing',
            emoji: '\u{1F31F}', // 🌟
            color: '#6BCB77',
            desc: 'Een veilige, hechte groep die zelfstandig samenwerkt en problemen grotendeels zelf oplost. Leerlingen vertrouwen elkaar en jou. Geniet ervan — en blijf het onderhouden.',
            focus: [
                'Geef ruimte voor zelfstandigheid en eigen initiatief.',
                'Blijf het groepsgevoel voeden; het gaat niet vanzelf door.',
                'Daag de groep uit met gezamenlijke doelen.'
            ],
            werkvormen: [
                { text: 'Werk aan een klassenproject met een gezamenlijk doel.' },
                { text: 'Laat leerlingen elkaar opbouwende feedback geven.' },
                { text: 'Vier successen samen op het', tool: { label: 'Podium', href: '/digibord/podium', icon: '\u{1F947}' } },
                { text: 'Houd vinger aan de pols met de', tool: { label: 'Check-in', href: '/groepsvorming/checkin', icon: '\u{1F60A}' } }
            ]
        },
        {
            id: 'afsluiten',
            name: 'Afsluiten',
            tuckman: 'Adjourning',
            emoji: '\u{1F44B}', // 👋
            color: '#FF6B9D',
            desc: 'Het einde van het schooljaar nadert of de groep gaat uit elkaar. Er komt ruimte voor terugblikken en afscheid nemen. Emoties mogen er zijn.',
            focus: [
                'Sta stil bij wat de groep samen heeft beleefd.',
                'Geef afscheid een plek; benoem dat het ook verdrietig kan zijn.',
                'Bekrachtig wat ieder heeft geleerd en bijgedragen.'
            ],
            werkvormen: [
                { text: 'Terugblik-kring: de mooiste momenten van het jaar.' },
                { text: 'Maak samen een klassenboek of afscheidsritueel.' },
                { text: 'Zet iedereen nog eens in het zonnetje op het', tool: { label: 'Podium', href: '/digibord/podium', icon: '\u{1F947}' } }
            ]
        }
    ];
    const PHASE_BY_ID = {};
    PHASES.forEach(p => { PHASE_BY_ID[p.id] = p; });

    // ---------- DOM ----------
    const groupSelect = document.getElementById('gfGroupSelect');
    const noGroup = document.getElementById('gfNoGroup');
    const main = document.getElementById('gfMain');
    const phasesEl = document.getElementById('gfPhases');
    const detailEl = document.getElementById('gfDetail');
    const logForm = document.getElementById('gfLogForm');
    const dateInput = document.getElementById('gfDate');
    const noteInput = document.getElementById('gfNote');
    const logBtn = document.getElementById('gfLogBtn');
    const cancelEditBtn = document.getElementById('gfCancelEdit');
    const timelineEl = document.getElementById('gfTimeline');
    const timelineEmpty = document.getElementById('gfTimelineEmpty');

    if (!phasesEl) return;

    // ---------- State ----------
    let groups = [];
    let entriesByGroup = {};   // { groupId: [ {id, date, phase, note} ] }
    let selectedGroupId = '';
    let selectedPhaseId = null;
    let editingId = null;

    // ---------- Helpers ----------
    const MONTHS = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];

    function todayKey() {
        const d = new Date();
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }

    function formatDateNL(key) {
        const p = String(key).split('-');
        if (p.length !== 3) return key;
        return parseInt(p[2], 10) + ' ' + MONTHS[parseInt(p[1], 10) - 1] + ' ' + p[0];
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str == null ? '' : str;
        return div.innerHTML;
    }

    function newId() {
        return 'e' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    }

    function getEntries(groupId) {
        const arr = entriesByGroup[groupId] || [];
        // Nieuwste eerst (op datum, dan op volgorde van toevoegen)
        return arr.slice().sort((a, b) => {
            if (a.date === b.date) return 0;
            return a.date < b.date ? 1 : -1;
        });
    }

    function getCurrentPhaseId(groupId) {
        const sorted = getEntries(groupId);
        return sorted.length ? sorted[0].phase : null;
    }

    // ---------- Supabase ----------
    async function getSessionUser() {
        const { data: { session } } = await supabase.auth.getSession();
        return session ? session.user : null;
    }

    async function loadSettings() {
        const user = await getSessionUser();
        if (!user) return;
        const { data } = await supabase
            .from('tool_settings')
            .select('settings')
            .eq('user_id', user.id)
            .eq('tool_name', TOOL_NAME)
            .maybeSingle();
        if (data && data.settings && data.settings.entries && typeof data.settings.entries === 'object') {
            entriesByGroup = data.settings.entries;
        }
    }

    async function saveSettings() {
        const user = await getSessionUser();
        if (!user) return;
        await supabase
            .from('tool_settings')
            .upsert({
                user_id: user.id,
                tool_name: TOOL_NAME,
                settings: { entries: entriesByGroup },
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id,tool_name' });
    }

    async function loadGroups() {
        const user = await getSessionUser();
        if (!user) return;
        const { data } = await supabase
            .from('groups')
            .select('id, name')
            .eq('user_id', user.id)
            .eq('archived', false)
            .order('name');
        groups = data || [];
    }

    // ---------- Render ----------
    function renderGroupSelect() {
        groupSelect.innerHTML = '<option value="">Kies een klas...</option>';
        groups.forEach(g => {
            const opt = document.createElement('option');
            opt.value = g.id;
            opt.textContent = g.name;
            if (g.id === selectedGroupId) opt.selected = true;
            groupSelect.appendChild(opt);
        });
    }

    function renderPhases() {
        const currentId = getCurrentPhaseId(selectedGroupId);
        phasesEl.innerHTML = '';
        PHASES.forEach(p => {
            const card = document.createElement('div');
            card.className = 'gf-phase' + (p.id === selectedPhaseId ? ' is-active' : '');
            card.style.setProperty('--phase-color', p.color);
            card.innerHTML =
                (p.id === currentId ? '<span class="gf-phase-current">Nu</span>' : '') +
                '<span class="gf-phase-emoji">' + p.emoji + '</span>' +
                '<div class="gf-phase-name">' + escapeHtml(p.name) + '</div>' +
                '<div class="gf-phase-tuckman">' + escapeHtml(p.tuckman) + '</div>';
            card.addEventListener('click', () => selectPhase(p.id));
            phasesEl.appendChild(card);
        });
    }

    function renderDetail() {
        if (!selectedPhaseId) { detailEl.style.display = 'none'; return; }
        const p = PHASE_BY_ID[selectedPhaseId];
        detailEl.style.display = '';
        detailEl.style.setProperty('--phase-color', p.color);

        const focusHtml = p.focus.map(f => '<li>' + escapeHtml(f) + '</li>').join('');
        const werkHtml = p.werkvormen.map(w => {
            let html = '<div class="gf-werkvorm">' + escapeHtml(w.text);
            if (w.tool) {
                html += ' <a class="gf-tool-chip" href="' + w.tool.href + '">' +
                    '<span>' + w.tool.icon + '</span>' + escapeHtml(w.tool.label) + '</a>';
            }
            html += '</div>';
            return html;
        }).join('');

        detailEl.innerHTML =
            '<div class="gf-detail-head">' +
                '<span class="gf-detail-emoji">' + p.emoji + '</span>' +
                '<div>' +
                    '<div class="gf-detail-title">' + escapeHtml(p.name) + '</div>' +
                    '<div class="gf-detail-tuckman">Tuckman: ' + escapeHtml(p.tuckman) + '</div>' +
                '</div>' +
            '</div>' +
            '<p class="gf-detail-desc">' + escapeHtml(p.desc) + '</p>' +
            '<div class="gf-detail-cols">' +
                '<div><h4>Waar let je op</h4><ul>' + focusHtml + '</ul></div>' +
                '<div><h4>Passende werkvormen</h4><div class="gf-werkvormen">' + werkHtml + '</div></div>' +
            '</div>';
    }

    function renderForm() {
        if (!selectedPhaseId) { logForm.style.display = 'none'; return; }
        logForm.style.display = '';
        const p = PHASE_BY_ID[selectedPhaseId];
        if (editingId) {
            logBtn.textContent = 'Bijwerken';
            cancelEditBtn.style.display = '';
        } else {
            logBtn.textContent = 'Vastleggen als ‘' + p.name + '’';
            cancelEditBtn.style.display = 'none';
        }
    }

    function renderTimeline() {
        const entries = getEntries(selectedGroupId);
        timelineEl.innerHTML = '';
        if (!entries.length) {
            timelineEmpty.style.display = '';
            return;
        }
        timelineEmpty.style.display = 'none';
        entries.forEach(entry => {
            const p = PHASE_BY_ID[entry.phase];
            if (!p) return;
            const item = document.createElement('div');
            item.className = 'gf-timeline-item';
            item.style.setProperty('--phase-color', p.color);
            item.innerHTML =
                '<span class="gf-timeline-dot"></span>' +
                '<div class="gf-timeline-body">' +
                    '<div class="gf-timeline-top">' +
                        '<span class="gf-phase-tag">' + p.emoji + ' ' + escapeHtml(p.name) + '</span>' +
                        '<span class="gf-timeline-date">' + formatDateNL(entry.date) + '</span>' +
                    '</div>' +
                    (entry.note ? '<div class="gf-timeline-note">' + escapeHtml(entry.note) + '</div>' : '') +
                '</div>' +
                '<div class="gf-timeline-actions">' +
                    '<button class="gf-icon-btn gf-edit" title="Bewerken">✎</button>' +
                    '<button class="gf-icon-btn gf-del" title="Verwijderen">\u{1F5D1}</button>' +
                '</div>';
            item.querySelector('.gf-edit').addEventListener('click', () => startEdit(entry.id));
            item.querySelector('.gf-del').addEventListener('click', () => deleteEntry(entry.id));
            timelineEl.appendChild(item);
        });
    }

    function renderAll() {
        renderPhases();
        renderDetail();
        renderForm();
        renderTimeline();
    }

    // ---------- Acties ----------
    function selectPhase(id) {
        selectedPhaseId = id;
        renderPhases();
        renderDetail();
        renderForm();
    }

    function resetForm() {
        editingId = null;
        dateInput.value = todayKey();
        noteInput.value = '';
    }

    async function logEntry() {
        if (!selectedGroupId || !selectedPhaseId) return;
        const date = dateInput.value || todayKey();
        const note = noteInput.value.trim();

        if (!entriesByGroup[selectedGroupId]) entriesByGroup[selectedGroupId] = [];
        const list = entriesByGroup[selectedGroupId];

        if (editingId) {
            const existing = list.find(e => e.id === editingId);
            if (existing) {
                existing.date = date;
                existing.phase = selectedPhaseId;
                existing.note = note;
            }
        } else {
            list.push({ id: newId(), date: date, phase: selectedPhaseId, note: note });
        }

        resetForm();
        // Selecteer de huidige (nieuwste) fase zodat het beeld klopt
        selectedPhaseId = getCurrentPhaseId(selectedGroupId);
        renderAll();
        await saveSettings();
    }

    function startEdit(id) {
        const list = entriesByGroup[selectedGroupId] || [];
        const entry = list.find(e => e.id === id);
        if (!entry) return;
        editingId = id;
        selectedPhaseId = entry.phase;
        dateInput.value = entry.date;
        noteInput.value = entry.note || '';
        renderPhases();
        renderDetail();
        renderForm();
        logForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    async function deleteEntry(id) {
        if (!confirm('Dit peilmoment verwijderen?')) return;
        const list = entriesByGroup[selectedGroupId] || [];
        entriesByGroup[selectedGroupId] = list.filter(e => e.id !== id);
        if (editingId === id) resetForm();
        selectedPhaseId = getCurrentPhaseId(selectedGroupId);
        renderAll();
        await saveSettings();
    }

    function applyGroup(groupId) {
        selectedGroupId = groupId || '';
        editingId = null;
        resetForm();
        if (!selectedGroupId) {
            noGroup.style.display = '';
            main.style.display = 'none';
            return;
        }
        noGroup.style.display = 'none';
        main.style.display = '';
        selectedPhaseId = getCurrentPhaseId(selectedGroupId);
        renderAll();
    }

    // ---------- Events ----------
    groupSelect.addEventListener('change', () => {
        const id = groupSelect.value;
        applyGroup(id);
        if (window.MTActiveClass && id) window.MTActiveClass.setId(id);
    });
    logBtn.addEventListener('click', logEntry);
    cancelEditBtn.addEventListener('click', () => { resetForm(); renderForm(); });

    // ---------- Init ----------
    async function init() {
        resetForm();
        await loadSettings();
        await loadGroups();
        if (window.MTActiveClass) {
            selectedGroupId = window.MTActiveClass.resolveDefault(selectedGroupId, groups);
        }
        renderGroupSelect();
        applyGroup(selectedGroupId);
    }
    init();
});

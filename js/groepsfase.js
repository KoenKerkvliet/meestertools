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

    // Lesideeën
    const settingsBtn = document.getElementById('gfSettingsBtn');
    const ideasSection = document.getElementById('gfIdeasSection');
    const ideasEl = document.getElementById('gfIdeas');
    const ideasEmpty = document.getElementById('gfIdeasEmpty');
    const ideasAddBtn = document.getElementById('gfIdeasAddBtn');
    const modal = document.getElementById('gfModal');
    const modalClose = document.getElementById('gfModalClose');
    const modalList = document.getElementById('gfModalList');
    const ideaForm = document.getElementById('gfIdeaForm');
    const ideaFormTitle = document.getElementById('gfIdeaFormTitle');
    const ideaPhaseSel = document.getElementById('gfIdeaPhase');
    const ideaTitleInput = document.getElementById('gfIdeaTitle');
    const ideaDescInput = document.getElementById('gfIdeaDesc');
    const ideaFileInput = document.getElementById('gfIdeaFile');
    const fileCurrent = document.getElementById('gfFileCurrent');
    const ideaSaveBtn = document.getElementById('gfIdeaSave');
    const ideaCancelBtn = document.getElementById('gfIdeaCancel');
    const ideaMsg = document.getElementById('gfIdeaMsg');

    const BUCKET = 'groepsfase';
    const MAX_FILE_BYTES = 10 * 1024 * 1024;

    if (!phasesEl) return;

    // ---------- State ----------
    let groups = [];
    let entriesByGroup = {};   // { groupId: [ {id, date, phase, note} ] }
    let ideas = [];            // [ {id, phase, title, desc, file: {path, name}|null} ]
    let selectedGroupId = '';
    let selectedPhaseId = null;
    let editingId = null;
    let editingIdeaId = null;
    let removeExistingFile = false;

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
        if (data && data.settings && Array.isArray(data.settings.ideas)) {
            ideas = data.settings.ideas;
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
                settings: { entries: entriesByGroup, ideas: ideas },
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

    function renderIdeas() {
        if (!selectedPhaseId) { ideasSection.style.display = 'none'; return; }
        ideasSection.style.display = '';
        const p = PHASE_BY_ID[selectedPhaseId];
        ideasSection.style.setProperty('--phase-color', p.color);
        const list = ideas.filter(i => i.phase === selectedPhaseId);
        ideasEl.innerHTML = '';
        if (!list.length) { ideasEmpty.style.display = ''; return; }
        ideasEmpty.style.display = 'none';
        list.forEach(idea => {
            const card = document.createElement('div');
            card.className = 'gf-idea-card';
            card.style.setProperty('--phase-color', p.color);
            let html = '<div class="gf-idea-card-title">' + escapeHtml(idea.title) + '</div>';
            if (idea.desc) html += '<p class="gf-idea-card-desc">' + escapeHtml(idea.desc) + '</p>';
            if (idea.file && idea.file.path) {
                html += '<span class="gf-idea-file" role="button" tabindex="0">\u{1F4CE} ' +
                    escapeHtml(idea.file.name || 'Document') + '</span>';
            }
            card.innerHTML = html;
            const fileLink = card.querySelector('.gf-idea-file');
            if (fileLink) fileLink.addEventListener('click', () => openFile(idea.file.path));
            ideasEl.appendChild(card);
        });
    }

    function renderAll() {
        renderPhases();
        renderDetail();
        renderIdeas();
        renderForm();
        renderTimeline();
    }

    // ---------- Acties ----------
    function selectPhase(id) {
        selectedPhaseId = id;
        renderPhases();
        renderDetail();
        renderIdeas();
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

    // ---------- Lesideeën ----------
    async function openFile(path) {
        if (!path) return;
        try {
            const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 120);
            if (error || !data) throw error || new Error('Geen url');
            window.open(data.signedUrl, '_blank', 'noopener');
        } catch (e) {
            alert('Kon het document niet openen. Probeer het later opnieuw.');
        }
    }

    function setIdeaMsg(text, type) {
        ideaMsg.textContent = text || '';
        ideaMsg.className = 'gf-idea-msg' + (type ? ' ' + type : '');
        if (type === 'success') {
            setTimeout(() => {
                if (ideaMsg.textContent === text) { ideaMsg.textContent = ''; ideaMsg.className = 'gf-idea-msg'; }
            }, 4000);
        }
    }

    function populatePhaseSelect() {
        ideaPhaseSel.innerHTML = PHASES.map(p =>
            '<option value="' + p.id + '">' + escapeHtml(p.name + ' (' + p.tuckman + ')') + '</option>'
        ).join('');
    }

    function resetIdeaForm() {
        editingIdeaId = null;
        removeExistingFile = false;
        ideaTitleInput.value = '';
        ideaDescInput.value = '';
        ideaFileInput.value = '';
        fileCurrent.style.display = 'none';
        fileCurrent.innerHTML = '';
        ideaFormTitle.textContent = 'Nieuw lesidee';
        ideaSaveBtn.textContent = 'Lesidee opslaan';
        ideaCancelBtn.style.display = 'none';
        setIdeaMsg('', '');
    }

    function renderModalList() {
        if (!ideas.length) {
            modalList.innerHTML = '<div class="gf-modal-empty">Je hebt nog geen lesideeën. Voeg hieronder je eerste idee toe &mdash; je kunt het elk jaar opnieuw gebruiken.</div>';
            return;
        }
        let html = '<div class="gf-modal-list-title">Jouw lesideeën</div>';
        PHASES.forEach(p => {
            ideas.filter(i => i.phase === p.id).forEach(idea => {
                html +=
                    '<div class="gf-modal-item">' +
                        '<div class="gf-modal-item-body">' +
                            '<div class="gf-modal-item-title">' + escapeHtml(idea.title) + '</div>' +
                            '<div class="gf-modal-item-meta">' + p.emoji + ' ' + escapeHtml(p.name) +
                                (idea.file ? ' &middot; \u{1F4CE} bestand' : '') + '</div>' +
                        '</div>' +
                        '<div class="gf-modal-item-actions">' +
                            '<button class="gf-icon-btn" data-edit="' + idea.id + '" title="Bewerken">✎</button>' +
                            '<button class="gf-icon-btn gf-del" data-del="' + idea.id + '" title="Verwijderen">\u{1F5D1}</button>' +
                        '</div>' +
                    '</div>';
            });
        });
        modalList.innerHTML = html;
        modalList.querySelectorAll('[data-edit]').forEach(b =>
            b.addEventListener('click', () => startEditIdea(b.getAttribute('data-edit'))));
        modalList.querySelectorAll('[data-del]').forEach(b =>
            b.addEventListener('click', () => deleteIdea(b.getAttribute('data-del'))));
    }

    function startEditIdea(id) {
        const idea = ideas.find(i => i.id === id);
        if (!idea) return;
        editingIdeaId = id;
        removeExistingFile = false;
        ideaPhaseSel.value = idea.phase;
        ideaTitleInput.value = idea.title || '';
        ideaDescInput.value = idea.desc || '';
        ideaFileInput.value = '';
        if (idea.file && idea.file.path) {
            fileCurrent.style.display = '';
            fileCurrent.innerHTML = '\u{1F4CE} ' + escapeHtml(idea.file.name || 'Document') +
                ' <button type="button" class="gf-file-remove" id="gfFileRemoveBtn">verwijderen</button>';
            const rm = document.getElementById('gfFileRemoveBtn');
            if (rm) rm.addEventListener('click', () => {
                removeExistingFile = true;
                fileCurrent.style.display = 'none';
                fileCurrent.innerHTML = '';
            });
        } else {
            fileCurrent.style.display = 'none';
            fileCurrent.innerHTML = '';
        }
        ideaFormTitle.textContent = 'Lesidee bewerken';
        ideaSaveBtn.textContent = 'Wijzigingen opslaan';
        ideaCancelBtn.style.display = '';
        setIdeaMsg('', '');
        ideaForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    async function saveIdea(e) {
        e.preventDefault();
        const title = ideaTitleInput.value.trim();
        if (!title) { setIdeaMsg('Geef je lesidee een titel.', 'error'); return; }
        const user = await getSessionUser();
        if (!user) { setIdeaMsg('Je bent niet ingelogd.', 'error'); return; }

        const picked = ideaFileInput.files && ideaFileInput.files[0] ? ideaFileInput.files[0] : null;
        if (picked && picked.size > MAX_FILE_BYTES) {
            setIdeaMsg('Het bestand is groter dan 10 MB.', 'error');
            return;
        }

        ideaSaveBtn.disabled = true;
        ideaSaveBtn.textContent = 'Opslaan...';
        setIdeaMsg('', '');

        try {
            const phase = ideaPhaseSel.value;
            const desc = ideaDescInput.value.trim();
            const id = editingIdeaId || newId();
            const existing = editingIdeaId ? ideas.find(i => i.id === id) : null;
            let fileMeta = existing && existing.file ? existing.file : null;

            // Oud bestand weg als het expliciet verwijderd of vervangen wordt.
            if ((removeExistingFile || picked) && fileMeta && fileMeta.path) {
                await supabase.storage.from(BUCKET).remove([fileMeta.path]);
                fileMeta = null;
            }
            // Nieuw bestand uploaden.
            if (picked) {
                const safeName = picked.name.replace(/[^\w.\-]+/g, '_');
                const path = user.id + '/' + id + '/' + safeName;
                const up = await supabase.storage.from(BUCKET).upload(path, picked, { upsert: true });
                if (up.error) throw up.error;
                fileMeta = { path: path, name: picked.name };
            }

            const record = { id: id, phase: phase, title: title, desc: desc, file: fileMeta };
            if (existing) Object.assign(existing, record);
            else ideas.push(record);

            await saveSettings();
            renderModalList();
            renderIdeas();
            resetIdeaForm();
            ideaPhaseSel.value = phase; // blijf handig op dezelfde fase staan
            setIdeaMsg('Lesidee opgeslagen!', 'success');
        } catch (err) {
            setIdeaMsg('Fout bij opslaan: ' + (err && err.message ? err.message : err), 'error');
        } finally {
            ideaSaveBtn.disabled = false;
            ideaSaveBtn.textContent = editingIdeaId ? 'Wijzigingen opslaan' : 'Lesidee opslaan';
        }
    }

    async function deleteIdea(id) {
        const idea = ideas.find(i => i.id === id);
        if (!idea) return;
        if (!confirm('Dit lesidee verwijderen?')) return;
        if (idea.file && idea.file.path) {
            try { await supabase.storage.from(BUCKET).remove([idea.file.path]); } catch (e) {}
        }
        ideas = ideas.filter(i => i.id !== id);
        if (editingIdeaId === id) resetIdeaForm();
        await saveSettings();
        renderModalList();
        renderIdeas();
    }

    function openModal(prefillPhase) {
        populatePhaseSelect();
        resetIdeaForm();
        if (prefillPhase) ideaPhaseSel.value = prefillPhase;
        renderModalList();
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // ---------- Events ----------
    settingsBtn.addEventListener('click', () => openModal(selectedPhaseId));
    ideasAddBtn.addEventListener('click', () => { openModal(selectedPhaseId); setTimeout(() => ideaTitleInput.focus(), 50); });
    modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
    });
    ideaForm.addEventListener('submit', saveIdea);
    ideaCancelBtn.addEventListener('click', resetIdeaForm);

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

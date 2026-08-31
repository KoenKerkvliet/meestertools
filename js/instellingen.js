/* ============================================
   MEESTERTOOLS - Instellingen Overlay
   Versie: v0.0.2
   ============================================ */

(function () {
    // State
    let overlayEl = null;
    let currentSection = 'profiel';
    let groups = [];
    let students = {};
    let activeGroupId = null;
    let showArchived = false;
    let currentUserId = null;
    let membersByGroup = {};      // {group_id: [{user_id}]} - duo-leerkrachten
    let schoolName = null;        // voor de leerlingcode-prefix
    let schoolNameLoaded = false;

    // Schooljaar state
    let schooljaarData = { activeYear: null, years: {} };
    let sjActiveYear = null;
    let vacations = [];
    let schooljaarLoaded = false;

    // ---------- Open / Close ----------
    window.openInstellingen = function (section) {
        if (!overlayEl) {
            createOverlay();
        }
        if (section) {
            switchSection(section);
        }
        overlayEl.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    function closeInstellingen() {
        if (overlayEl) {
            overlayEl.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // ---------- Get current user from session (fast, cached) ----------
    async function getCurrentUser() {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            return session?.user || null;
        } catch (err) {
            console.error('Session error:', err);
            return null;
        }
    }

    // ---------- Leerlingcode (4 letters + 3 cijfers, prefix = school) ----------
    // Bestaande codes (3 letters + 3 cijfers) blijven gewoon geldig;
    // alleen nieuw uitgedeelde codes krijgen het langere, sterkere formaat.
    async function ensureSchoolName() {
        if (schoolNameLoaded) return schoolName;
        try {
            const user = await getCurrentUser();
            if (user) {
                const { data } = await supabase.from('profiles').select('schools(name)').eq('id', user.id).single();
                schoolName = (data && data.schools && data.schools.name) || '';
            }
        } catch (e) { /* niet fataal */ }
        schoolNameLoaded = true;
        return schoolName;
    }
    function genStudentCode(school) {
        const LET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let prefix = String(school || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2);
        while (prefix.length < 2) prefix += 'X'; // fallback als school (te) kort is
        const buf = new Uint32Array(5);
        crypto.getRandomValues(buf);
        const letters = LET[buf[0] % 26] + LET[buf[1] % 26];
        const digits = String(buf[2] % 10) + String(buf[3] % 10) + String(buf[4] % 10);
        return prefix + letters + digits;
    }
    // Geef leerlingen zonder code er één (backfill). Globaal uniek -> retry bij botsing.
    async function ensureCodesForGroup(groupId) {
        const missing = (students[groupId] || []).filter(s => !s.code);
        if (!missing.length) return;
        const school = await ensureSchoolName();
        for (const s of missing) {
            for (let attempt = 0; attempt < 8; attempt++) {
                const code = genStudentCode(school);
                const { error } = await supabase.from('students').update({ code }).eq('id', s.id);
                if (!error) { s.code = code; break; }
                if (error.code !== '23505') break; // andere fout -> niet eindeloos proberen
            }
        }
    }

    // ---------- Create Overlay HTML ----------
    function createOverlay() {
        overlayEl = document.createElement('div');
        overlayEl.className = 'instellingen-overlay';
        overlayEl.innerHTML = `
            <div class="instellingen-container">
                <div class="instellingen-header">
                    <h2>Instellingen</h2>
                    <button class="instellingen-close" id="instellingenClose">&times;</button>
                </div>
                <div class="instellingen-body">
                    <div class="instellingen-sidebar">
                        <button class="instellingen-nav-item active" data-section="profiel">
                            <span class="nav-icon">&#128100;</span> Profiel
                        </button>
                        <button class="instellingen-nav-item" data-section="mijnklas">
                            <span class="nav-icon">&#127891;</span> Mijn klas
                        </button>
                        <button class="instellingen-nav-item" data-section="schooljaar">
                            <span class="nav-icon">&#128197;</span> Schooljaar
                        </button>
                    </div>
                    <div class="instellingen-content">
                        <!-- Profiel Section -->
                        <div class="instellingen-section active" id="section-profiel">
                            <h3>Profiel bewerken</h3>
                            <div class="profiel-card">
                                <h4>Persoonlijke gegevens</h4>
                                <div class="form-group">
                                    <label for="profielNaam">Volledige naam</label>
                                    <input type="text" id="profielNaam" placeholder="Je naam">
                                </div>
                                <div class="form-group">
                                    <label>E-mailadres</label>
                                    <input type="email" id="profielEmail" disabled style="opacity:0.6;cursor:not-allowed">
                                </div>
                                <div class="form-group school-veld">
                                    <label for="profielSchool">School</label>
                                    <input type="text" id="profielSchool" placeholder="Naam van je school" autocomplete="off">
                                    <div class="school-suggesties" id="profielSchoolSuggesties"></div>
                                </div>
                                <div class="form-group">
                                    <label for="profielPlaats">Plaats van de school</label>
                                    <input type="text" id="profielPlaats" placeholder="Bijv. Zwolle">
                                    <p class="school-plaats-hint">Nodig om scholen met dezelfde naam uit elkaar te houden.</p>
                                </div>
                                <button class="btn-save" id="saveProfielBtn">Opslaan</button>
                                <div class="profiel-message" id="profielMessage"></div>
                            </div>
                            <div class="profiel-card">
                                <h4>Wachtwoord wijzigen</h4>
                                <div class="form-group">
                                    <label for="newPassword">Nieuw wachtwoord</label>
                                    <input type="password" id="newPassword" placeholder="Minimaal 6 tekens">
                                </div>
                                <div class="form-group">
                                    <label for="confirmPassword">Bevestig wachtwoord</label>
                                    <input type="password" id="confirmPassword" placeholder="Herhaal wachtwoord">
                                </div>
                                <button class="btn-save" id="savePasswordBtn">Wachtwoord wijzigen</button>
                                <div class="profiel-message" id="passwordMessage"></div>
                            </div>
                        </div>
                        <!-- Mijn Klas Section -->
                        <div class="instellingen-section" id="section-mijnklas">
                            <h3>Mijn klas</h3>
                            <div class="klas-toolbar">
                                <button class="btn-primary" id="addGroupBtn">+ Nieuwe groep</button>
                                <button class="btn-add-small" id="joinGroupBtn" title="Kreeg je een code van een collega?">Deelnemen aan een klas</button>
                                <label class="filter-toggle">
                                    <input type="checkbox" id="showArchivedGroups"> Toon gearchiveerd
                                </label>
                            </div>
                            <div id="joinGroupForm" style="display:none;margin-bottom:16px">
                                <div class="inline-add-form">
                                    <input type="text" id="joinCode" placeholder="Code van je collega" maxlength="12" autocomplete="off" style="text-transform:uppercase">
                                    <button class="btn-add-small" id="confirmJoinGroup">Deelnemen</button>
                                </div>
                                <div class="inline-form-hint">Werk je op andere dagen met de klas van een collega? Vraag om een uitnodigingscode via Instellingen &rarr; Mijn klas &rarr; Samenwerken.</div>
                                <div class="inline-form-error" id="joinGroupError"></div>
                            </div>
                            <div id="addGroupForm" style="display:none;margin-bottom:16px">
                                <div class="inline-add-form">
                                    <input type="text" id="newGroupName" placeholder="Groepsnaam (bijv. Groep 5A)">
                                    <button class="btn-add-small" id="confirmAddGroup">Toevoegen</button>
                                </div>
                                <div class="inline-form-error" id="addGroupError"></div>
                            </div>
                            <div class="groepen-list" id="groepenList"></div>
                        </div>
                        <!-- Schooljaar Section -->
                        <div class="instellingen-section" id="section-schooljaar">
                            <h3>Schooljaar &amp; vakanties</h3>
                            <div class="profiel-card">
                                <h4>Actief schooljaar</h4>
                                <div class="form-group">
                                    <label for="schooljaarSelect">Schooljaar (loopt van 1 augustus t/m 31 juli)</label>
                                    <select id="schooljaarSelect"></select>
                                </div>
                                <p class="sj-hint">Vul hieronder de vakanties van dit schooljaar in. Zo weet Meestertools welke weken schoolweken zijn &mdash; handig voor o.a. de Klassendienst.</p>
                            </div>
                            <div class="profiel-card">
                                <div class="klas-toolbar">
                                    <h4 style="margin:0">Vakanties</h4>
                                    <button class="btn-add-small" id="addVacationBtn">+ Vakantie</button>
                                </div>
                                <div class="sj-vacation-list" id="vacationList"></div>
                                <button class="btn-save" id="saveSchooljaarBtn">Opslaan</button>
                                <div class="profiel-message" id="schooljaarMessage"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Inner modal for editing -->
                <div class="instellingen-modal" id="instellingenModal">
                    <div class="modal">
                        <div class="modal-header">
                            <h2 id="innerModalTitle">Bewerken</h2>
                            <button class="modal-close" id="innerModalClose">&times;</button>
                        </div>
                        <div class="modal-body" id="innerModalBody"></div>
                        <div class="modal-footer" id="innerModalFooter"></div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(overlayEl);
        bindEvents();
        loadProfielData();
    }

    // ---------- Bind Events ----------
    function bindEvents() {
        // Close
        overlayEl.querySelector('#instellingenClose').addEventListener('click', closeInstellingen);
        overlayEl.addEventListener('click', (e) => {
            if (e.target === overlayEl) closeInstellingen();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && overlayEl && overlayEl.classList.contains('active')) {
                const innerModal = overlayEl.querySelector('#instellingenModal');
                if (innerModal.classList.contains('active')) {
                    innerModal.classList.remove('active');
                } else {
                    closeInstellingen();
                }
            }
        });

        // Sidebar nav
        overlayEl.querySelectorAll('.instellingen-nav-item').forEach(btn => {
            btn.addEventListener('click', () => {
                switchSection(btn.dataset.section);
            });
        });

        // Profiel save
        overlayEl.querySelector('#saveProfielBtn').addEventListener('click', saveProfiel);
        overlayEl.querySelector('#savePasswordBtn').addEventListener('click', savePassword);

        // Mijn klas
        overlayEl.querySelector('#addGroupBtn').addEventListener('click', () => {
            const form = overlayEl.querySelector('#addGroupForm');
            form.style.display = form.style.display === 'none' ? 'block' : 'none';
            if (form.style.display === 'block') {
                overlayEl.querySelector('#newGroupName').focus();
            }
        });
        overlayEl.querySelector('#confirmAddGroup').addEventListener('click', addGroup);

        // ---------- Deelnemen aan de klas van een collega ----------
        const joinForm = () => overlayEl.querySelector('#joinGroupForm');
        overlayEl.querySelector('#joinGroupBtn').addEventListener('click', () => {
            const f = joinForm();
            f.style.display = f.style.display === 'block' ? 'none' : 'block';
            if (f.style.display === 'block') overlayEl.querySelector('#joinCode').focus();
        });
        const doeMee = async () => {
            const input = overlayEl.querySelector('#joinCode');
            const code = (input.value || '').trim();
            if (!code) return;
            const btn = overlayEl.querySelector('#confirmJoinGroup');
            btn.disabled = true; btn.textContent = 'Bezig...';
            const { data, error } = await supabase.rpc('redeem_group_invite', { p_code: code });
            btn.disabled = false; btn.textContent = 'Deelnemen';
            if (error) {
                showInlineError('joinGroupForm', error.message || 'Deelnemen lukte niet.');
                return;
            }
            input.value = '';
            joinForm().style.display = 'none';
            await loadGroups();
            alert('Je werkt nu mee in "' + (data.group_name || 'de klas') + '".');
        };
        overlayEl.querySelector('#confirmJoinGroup').addEventListener('click', doeMee);
        overlayEl.querySelector('#joinCode').addEventListener('keydown', (e) => { if (e.key === 'Enter') doeMee(); });
        overlayEl.querySelector('#newGroupName').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') addGroup();
        });
        overlayEl.querySelector('#showArchivedGroups').addEventListener('change', (e) => {
            showArchived = e.target.checked;
            renderGroups();
        });

        // Inner modal close
        overlayEl.querySelector('#innerModalClose').addEventListener('click', () => {
            overlayEl.querySelector('#instellingenModal').classList.remove('active');
        });

        // Schooljaar
        overlayEl.querySelector('#schooljaarSelect').addEventListener('change', (e) => {
            // huidige (niet-opgeslagen) vakanties bewaren bij het wisselen van jaar
            if (sjActiveYear) schooljaarData.years[sjActiveYear] = { vacations: collectVacations() };
            sjActiveYear = e.target.value;
            vacations = (schooljaarData.years[sjActiveYear] && schooljaarData.years[sjActiveYear].vacations
                ? schooljaarData.years[sjActiveYear].vacations.slice() : []);
            renderVacations();
        });
        overlayEl.querySelector('#addVacationBtn').addEventListener('click', () => {
            vacations = collectVacations();
            vacations.push({ name: '', start: '', end: '' });
            renderVacations();
        });
        overlayEl.querySelector('#saveSchooljaarBtn').addEventListener('click', saveSchooljaar);
    }

    // ---------- Switch Section ----------
    function switchSection(section) {
        currentSection = section;
        overlayEl.querySelectorAll('.instellingen-nav-item').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.section === section);
        });
        overlayEl.querySelectorAll('.instellingen-section').forEach(sec => {
            sec.classList.remove('active');
        });
        const target = overlayEl.querySelector('#section-' + section);
        if (target) target.classList.add('active');

        if (section === 'mijnklas') {
            loadGroups();
        } else if (section === 'schooljaar') {
            loadSchooljaar();
        }
    }

    // ---------- SCHOOLJAAR LOGIC ----------
    function currentSchoolYearLabel() {
        const now = new Date();
        const y = now.getFullYear();
        // Schooljaar start in augustus (maand index 7)
        const startYear = now.getMonth() >= 7 ? y : y - 1;
        return startYear + '/' + (startYear + 1);
    }

    function buildYearOptions(activeLabel) {
        const sel = overlayEl.querySelector('#schooljaarSelect');
        const baseStart = parseInt(currentSchoolYearLabel().split('/')[0], 10);
        const labels = [];
        for (let offset = -1; offset <= 3; offset++) {
            const s = baseStart + offset;
            labels.push(s + '/' + (s + 1));
        }
        // Zorg dat een eventueel opgeslagen jaar erbij staat
        if (activeLabel && labels.indexOf(activeLabel) === -1) labels.push(activeLabel);
        labels.sort();
        sel.innerHTML = labels.map(l => `<option value="${l}">${l}</option>`).join('');
        sel.value = activeLabel;
    }

    async function loadSchooljaar() {
        if (schooljaarLoaded) {
            renderVacations();
            return;
        }
        const user = await getCurrentUser();
        if (!user) return;

        const { data } = await supabase
            .from('tool_settings')
            .select('settings')
            .eq('user_id', user.id)
            .eq('tool_name', 'schooljaar')
            .maybeSingle();

        if (data && data.settings) {
            schooljaarData = data.settings;
            if (!schooljaarData.years) schooljaarData.years = {};
        } else {
            schooljaarData = { activeYear: null, years: {} };
        }

        sjActiveYear = schooljaarData.activeYear || currentSchoolYearLabel();
        schooljaarData.activeYear = sjActiveYear;
        vacations = (schooljaarData.years[sjActiveYear] && schooljaarData.years[sjActiveYear].vacations
            ? schooljaarData.years[sjActiveYear].vacations.slice() : []);

        buildYearOptions(sjActiveYear);
        renderVacations();
        schooljaarLoaded = true;
    }

    function collectVacations() {
        const rows = overlayEl.querySelectorAll('#vacationList .sj-vacation-row');
        const out = [];
        rows.forEach(row => {
            out.push({
                name: row.querySelector('.sj-vac-name').value.trim(),
                start: row.querySelector('.sj-vac-start').value,
                end: row.querySelector('.sj-vac-end').value
            });
        });
        return out;
    }

    function renderVacations() {
        const container = overlayEl.querySelector('#vacationList');
        if (!vacations.length) {
            container.innerHTML = '<div class="leerlingen-empty">Nog geen vakanties toegevoegd. Voeg de vakanties van dit schooljaar toe.</div>';
            return;
        }
        container.innerHTML = vacations.map((v, i) => `
            <div class="sj-vacation-row" data-index="${i}">
                <input type="text" class="sj-vac-name" placeholder="Naam (bijv. Herfstvakantie)" value="${escapeHtml(v.name || '')}">
                <div class="sj-vac-dates">
                    <label>van <input type="date" class="sj-vac-start" value="${v.start || ''}"></label>
                    <label>t/m <input type="date" class="sj-vac-end" value="${v.end || ''}"></label>
                </div>
                <button class="btn-small btn-delete sj-vac-del" data-index="${i}">Verwijderen</button>
            </div>
        `).join('');

        container.querySelectorAll('.sj-vac-del').forEach(btn => {
            btn.addEventListener('click', () => {
                vacations = collectVacations();
                vacations.splice(parseInt(btn.dataset.index, 10), 1);
                renderVacations();
            });
        });
    }

    async function saveSchooljaar() {
        const btn = overlayEl.querySelector('#saveSchooljaarBtn');
        const msgEl = overlayEl.querySelector('#schooljaarMessage');
        const user = await getCurrentUser();
        if (!user) {
            showMessage(msgEl, 'Je bent niet ingelogd.', 'error');
            return;
        }

        // Verzamel en valideer
        const cleaned = collectVacations().filter(v => v.name || v.start || v.end);
        for (const v of cleaned) {
            if (v.start && v.end && v.start > v.end) {
                showMessage(msgEl, 'Een vakantie heeft een einddatum vóór de startdatum.', 'error');
                return;
            }
        }

        schooljaarData.activeYear = sjActiveYear;
        schooljaarData.years[sjActiveYear] = { vacations: cleaned };

        btn.disabled = true;
        btn.textContent = 'Opslaan...';
        try {
            const { error } = await supabase
                .from('tool_settings')
                .upsert({
                    user_id: user.id,
                    tool_name: 'schooljaar',
                    settings: schooljaarData,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id,tool_name' });
            if (error) throw error;
            vacations = cleaned.slice();
            renderVacations();
            showMessage(msgEl, 'Schooljaar opgeslagen!', 'success');
        } catch (err) {
            showMessage(msgEl, 'Fout: ' + err.message, 'error');
        }
        btn.disabled = false;
        btn.textContent = 'Opslaan';
    }

    // ---------- PROFIEL LOGIC ----------
    async function loadProfielData() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const nameInput = overlayEl.querySelector('#profielNaam');
        const emailInput = overlayEl.querySelector('#profielEmail');

        nameInput.value = user.user_metadata?.full_name || '';
        emailInput.value = user.email || '';

        // School-gegevens + suggesties van bestaande scholen
        try {
            const profRes = await supabase
                .from('profiles').select('school_id, schools(name, city)').eq('id', user.id).single();

            const naamEl = overlayEl.querySelector('#profielSchool');
            const plaatsEl = overlayEl.querySelector('#profielPlaats');

            if (profRes.data?.schools) {
                naamEl.value = profRes.data.schools.name || '';
                plaatsEl.value = profRes.data.schools.city || '';
            }

            // Maar een keer aanhaken: het profielscherm wordt hergebruikt.
            if (!naamEl.dataset.suggestiesAan) {
                profielSchoolKiezer = schoolSuggestie(
                    naamEl, plaatsEl, overlayEl.querySelector('#profielSchoolSuggesties'));
                naamEl.dataset.suggestiesAan = '1';
            }
        } catch (err) {
            console.error('School-gegevens laden mislukt:', err);
        }
    }

    /* ---------- Scholen koppelen ----------

       Twee scholen met dezelfde naam in verschillende plaatsen zijn twee
       verschillende scholen, en die mogen nooit samenvallen. De plaats is
       daarom geen extraatje maar de scheidslijn: zonder plaats koppelen we
       niet aan iets bestaands.

       Tot v1.54.1 pakte deze functie bij een lege plaats gewoon `matches[0]`,
       de eerste de beste school met die naam. Wie "de Schatgraver" intikte en
       de plaats leeg liet, kon zo aan de Schatgraver in een andere provincie
       gekoppeld worden.

       De naamvergelijking loopt via MT.schoolKey, zodat "BS de Schatgraver" en
       "de Schatgraver" elkaar vinden. Een gelijke sleutel is een vermoeden, geen
       bewijs: verschilt de ingetikte tekst van de bestaande naam, dan vraagt de
       aanroeper het eerst aan de gebruiker (vraagSchoolBevestiging).
    */

    // Alle scholen, een keer opgehaald en daarna hergebruikt door beide velden.
    let schoolCache = null;
    let profielSchoolKiezer = null;
    async function alleScholen() {
        if (schoolCache) return schoolCache;
        const { data } = await supabase
            .from('schools').select('id, name, city').eq('archived', false).order('name');
        schoolCache = data || [];
        return schoolCache;
    }

    // Zoekt de bestaande school die bij deze naam + plaats hoort.
    // Geeft null als er geen plaats is ingevuld: dan kunnen we niet weten
    // welke gelijknamige school bedoeld wordt.
    async function vindSchool(schoolName, schoolCity) {
        if (!schoolName || !schoolCity) return null;
        const nk = MT.schoolKey(schoolName);
        const ck = MT.cityKey(schoolCity);
        if (!nk || !ck) return null;
        const lijst = await alleScholen();
        return lijst.find(s => MT.schoolKey(s.name) === nk && MT.cityKey(s.city) === ck) || null;
    }
    window._vindSchool = vindSchool;

    // Zoek een bestaande school op naam + plaats of maak hem aan.
    // Geeft het school-id terug, of null als er geen naam is ingevuld.
    // forceNieuw: de gebruiker heeft bevestigd dat het echt een andere school is.
    async function resolveSchoolId(schoolName, schoolCity, forceNieuw) {
        if (!schoolName) return null;
        if (!schoolCity) {
            const err = new Error('Vul ook de plaats in, anders kunnen we scholen met dezelfde naam niet uit elkaar houden.');
            err.code = 'GEEN_PLAATS';
            throw err;
        }

        if (!forceNieuw) {
            const bestaand = await vindSchool(schoolName, schoolCity);
            if (bestaand) return bestaand.id;
        }

        const { data: created, error: insertError } = await supabase
            .from('schools')
            .insert({ name: schoolName, city: schoolCity })
            .select('id, name, city')
            .single();
        if (insertError) throw insertError;
        schoolCache = null;   // lijst is verouderd
        return created.id;
    }
    // Ook gebruikt door de school-popup op het dashboard
    window._resolveSchoolId = resolveSchoolId;

    /* Suggestielijst onder een schoolveld.

       Vervangt de <datalist>. Die filterde op de hele inhoud van het veld, dus
       wie met "BS " begon zag nooit een bestaande school staan - de aanleiding
       voor precies de dubbeling die we hier proberen te voorkomen. Deze lijst
       zoekt op de genormaliseerde naam en op de plaats, en toont altijd allebei
       zodat twee gelijknamige scholen uit elkaar te houden zijn.
    */
    function schoolSuggestie(nameInput, cityInput, mountEl) {
        let gekozenId = null;

        function verberg() { mountEl.innerHTML = ''; mountEl.style.display = 'none'; }

        async function toon() {
            const ruw = nameInput.value.trim();
            const nk = MT.schoolKey(ruw);
            const ck = MT.cityKey(cityInput.value.trim());
            if (ruw.length < 2) { verberg(); return; }

            const lijst = await alleScholen();
            const treffers = lijst.filter(s => {
                const sk = MT.schoolKey(s.name);
                if (!sk) return false;
                // Op het begin vergelijken, niet ergens middenin: bij "ergens
                // middenin" stelde "BS d" ook Elzeneind voor (de d van eind).
                // Beide richtingen, zodat iemand die meer typt dan er staat
                // ("Schatgraverschool") de school nog steeds vindt.
                if (nk && sk.indexOf(nk) !== 0 && nk.indexOf(sk) !== 0) return false;
                if (ck && MT.cityKey(s.city).indexOf(ck) !== 0) return false;
                return true;
            }).slice(0, 6);

            if (!treffers.length) { verberg(); return; }

            mountEl.innerHTML = treffers.map(s =>
                '<button type="button" class="school-suggestie" data-id="' + escapeHtml(s.id) + '"' +
                ' data-naam="' + escapeHtml(s.name) + '" data-plaats="' + escapeHtml(s.city || '') + '">' +
                '<span class="school-suggestie-naam">' + escapeHtml(s.name) + '</span>' +
                '<span class="school-suggestie-plaats">' + escapeHtml(s.city || 'plaats onbekend') + '</span>' +
                '</button>'
            ).join('');
            mountEl.style.display = 'block';
        }

        mountEl.addEventListener('click', (e) => {
            const btn = e.target.closest('.school-suggestie');
            if (!btn) return;
            nameInput.value = btn.dataset.naam;
            cityInput.value = btn.dataset.plaats;
            gekozenId = btn.dataset.id;
            verberg();
        });

        // Zelf verder typen betekent: niet meer de school die je aanklikte.
        nameInput.addEventListener('input', () => { gekozenId = null; toon(); });
        cityInput.addEventListener('input', () => { gekozenId = null; toon(); });
        nameInput.addEventListener('focus', toon);
        document.addEventListener('click', (e) => {
            if (e.target !== nameInput && !mountEl.contains(e.target)) verberg();
        });

        return { gekozenId: () => gekozenId, verberg: verberg };
    }
    window._schoolSuggestie = schoolSuggestie;

    /* Vraag om bevestiging als de ingetikte naam anders geschreven is dan de
       school die we gevonden hebben. Alleen binnen dezelfde plaats - over
       plaatsgrenzen heen vragen we het niet eens, dan is het per definitie een
       andere school.

       Geeft terug: 'koppel' (gebruik de bestaande), 'nieuw' (maak een aparte),
       of null (gebruiker koos niets - dan niet opslaan). */
    function vraagSchoolBevestiging(ingetikt, bestaand) {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay school-bevestig-overlay';
            overlay.innerHTML =
                '<div class="modal" style="max-width:460px;">' +
                    '<div class="modal-header"><h2>&#127979; Bedoel je deze school?</h2></div>' +
                    '<div class="modal-body">' +
                        '<p>Je typte <strong>' + escapeHtml(ingetikt) + '</strong>. In ' +
                        escapeHtml(bestaand.city || 'dezelfde plaats') + ' staat al:</p>' +
                        '<p class="school-bevestig-naam">' + escapeHtml(bestaand.name) + '</p>' +
                        '<p class="school-bevestig-uitleg">Kies je deze, dan werk je in dezelfde school als je collega. ' +
                        'Is het echt een andere school, dan zetten we jouw schrijfwijze apart neer.</p>' +
                    '</div>' +
                    '<div class="modal-footer">' +
                        '<button class="btn-cancel" data-keuze="nieuw">Nee, andere school</button>' +
                        '<button class="btn-primary" data-keuze="koppel">Ja, die is het</button>' +
                    '</div>' +
                '</div>';
            document.body.appendChild(overlay);
            requestAnimationFrame(() => overlay.classList.add('active'));

            overlay.addEventListener('click', (e) => {
                const btn = e.target.closest('[data-keuze]');
                if (btn) {
                    const keuze = btn.dataset.keuze;
                    overlay.classList.remove('active');
                    setTimeout(() => overlay.remove(), 250);
                    resolve(keuze);
                } else if (e.target === overlay) {
                    overlay.classList.remove('active');
                    setTimeout(() => overlay.remove(), 250);
                    resolve(null);
                }
            });
        });
    }
    window._vraagSchoolBevestiging = vraagSchoolBevestiging;

    /* De hele beslissing in een stap, zodat het profielscherm en de
       schoolpopup op het dashboard exact hetzelfde doen.

       Geeft het school-id terug, null (geen school ingevuld), of false als de
       gebruiker de bevestigingsvraag wegklikte - dan hoort er niets opgeslagen
       te worden. Gooit een fout met code GEEN_PLAATS als de plaats ontbreekt. */
    async function kiesSchoolId(schoolName, schoolCity, gekozenId) {
        if (!schoolName) return null;
        // Uit de suggestielijst geklikt: dan weten we het zeker.
        if (gekozenId) return gekozenId;

        if (!schoolCity) {
            const err = new Error('Vul ook de plaats in, anders kunnen we scholen met dezelfde naam niet uit elkaar houden.');
            err.code = 'GEEN_PLAATS';
            throw err;
        }

        const bestaand = await vindSchool(schoolName, schoolCity);
        if (bestaand) {
            // Zelfde school, zelfde schrijfwijze: niets te vragen.
            if (MT.normName(bestaand.name) === MT.normName(schoolName)) return bestaand.id;

            const keuze = await vraagSchoolBevestiging(schoolName, bestaand);
            if (!keuze) return false;
            if (keuze === 'koppel') return bestaand.id;
            return resolveSchoolId(schoolName, schoolCity, true);
        }
        return resolveSchoolId(schoolName, schoolCity, false);
    }
    window._kiesSchoolId = kiesSchoolId;

    async function saveProfiel() {
        const btn = overlayEl.querySelector('#saveProfielBtn');
        const msgEl = overlayEl.querySelector('#profielMessage');
        const name = overlayEl.querySelector('#profielNaam').value.trim();

        if (!name) {
            showMessage(msgEl, 'Vul je naam in.', 'error');
            return;
        }

        btn.disabled = true;
        btn.textContent = 'Opslaan...';

        try {
            // Update auth metadata
            const { error: authError } = await supabase.auth.updateUser({
                data: { full_name: name }
            });
            if (authError) throw authError;

            // School koppelen: bestaande school zoeken, anders aanmaken.
            // Leeg veld = koppeling verwijderen.
            const schoolName = overlayEl.querySelector('#profielSchool').value.trim();
            const schoolCity = overlayEl.querySelector('#profielPlaats').value.trim();
            const schoolId = await kiesSchoolId(schoolName, schoolCity,
                profielSchoolKiezer ? profielSchoolKiezer.gekozenId() : null);
            if (schoolId === false) {          // gebruiker brak de vraag af
                btn.disabled = false;
                btn.textContent = 'Opslaan';
                return;
            }

            // Update profiles table
            const { data: { user } } = await supabase.auth.getUser();
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ full_name: name, school_id: schoolId })
                .eq('id', user.id);
            if (profileError) throw profileError;

            // Update header display
            const profileBtn = document.getElementById('profileBtn');
            const nameEl = document.querySelector('.dropdown-header .name');
            const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
            if (profileBtn) profileBtn.textContent = initials;
            if (nameEl) nameEl.textContent = name;

            showMessage(msgEl, 'Profiel opgeslagen!', 'success');
        } catch (err) {
            // Een ontbrekende plaats is geen storing maar een aanwijzing:
            // die tekst tonen we zoals hij is, zonder 'Fout:' ervoor.
            showMessage(msgEl, err.code === 'GEEN_PLAATS' ? err.message : 'Fout: ' + err.message, 'error');
        }

        btn.disabled = false;
        btn.textContent = 'Opslaan';
    }

    async function savePassword() {
        const btn = overlayEl.querySelector('#savePasswordBtn');
        const msgEl = overlayEl.querySelector('#passwordMessage');
        const newPw = overlayEl.querySelector('#newPassword').value;
        const confirmPw = overlayEl.querySelector('#confirmPassword').value;

        if (!newPw || newPw.length < 6) {
            showMessage(msgEl, 'Wachtwoord moet minimaal 6 tekens zijn.', 'error');
            return;
        }
        if (newPw !== confirmPw) {
            showMessage(msgEl, 'Wachtwoorden komen niet overeen.', 'error');
            return;
        }

        btn.disabled = true;
        btn.textContent = 'Wijzigen...';

        try {
            const { error } = await supabase.auth.updateUser({ password: newPw });
            if (error) throw error;

            overlayEl.querySelector('#newPassword').value = '';
            overlayEl.querySelector('#confirmPassword').value = '';
            showMessage(msgEl, 'Wachtwoord gewijzigd!', 'success');
        } catch (err) {
            showMessage(msgEl, 'Fout: ' + err.message, 'error');
        }

        btn.disabled = false;
        btn.textContent = 'Wachtwoord wijzigen';
    }

    function showMessage(el, text, type) {
        el.textContent = text;
        el.className = 'profiel-message ' + type;
        setTimeout(() => { el.className = 'profiel-message'; }, 4000);
    }

    // ---------- Inline form error helpers ----------
    function showInlineError(containerId, msg) {
        var errEl = overlayEl.querySelector('#' + containerId + 'Error');
        if (!errEl) {
            errEl = document.createElement('div');
            errEl.id = containerId + 'Error';
            errEl.className = 'inline-form-error';
            var container = overlayEl.querySelector('#' + containerId);
            if (container) container.appendChild(errEl);
        }
        errEl.textContent = msg;
        errEl.style.display = 'block';
    }

    function clearInlineError(containerId) {
        var errEl = overlayEl.querySelector('#' + containerId + 'Error');
        if (errEl) errEl.style.display = 'none';
    }

    // ---------- MIJN KLAS LOGIC ----------
    async function loadGroups() {
        const user = await getCurrentUser();
        if (!user) return;

        const { data, error } = await supabase
            .from('groups')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error loading groups:', error);
            return;
        }

        groups = data || [];
        currentUserId = user.id;

        // Wie heeft er nog meer toegang tot deze groepen? (duo-leerkrachten)
        membersByGroup = {};
        try {
            const { data: mem } = await supabase
                .from('group_members')
                .select('group_id, user_id, created_at');
            (mem || []).forEach(m => {
                (membersByGroup[m.group_id] = membersByGroup[m.group_id] || []).push(m);
            });
        } catch (e) { /* niet fataal: de ledenlijst is een extraatje */ }

        // Load student counts
        const { data: studentData } = await supabase
            .from('students')
            .select('id, group_id, archived');

        students = {};
        (studentData || []).forEach(s => {
            if (!students[s.group_id]) students[s.group_id] = [];
            students[s.group_id].push(s);
        });

        renderGroups();
    }

    function renderGroups() {
        const container = overlayEl.querySelector('#groepenList');
        const filtered = showArchived ? groups : groups.filter(g => !g.archived);

        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="groepen-empty">
                    <span class="empty-icon">&#127891;</span>
                    <p>${showArchived ? 'Geen groepen gevonden.' : 'Je hebt nog geen groepen. Maak een groep aan om te beginnen!'}</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filtered.map(g => {
            const studentList = students[g.id] || [];
            const activeCount = studentList.filter(s => !s.archived).length;
            const isActive = activeGroupId === g.id;

            const isOwner = g.user_id === currentUserId;
            const duos = (membersByGroup[g.id] || []).length;

            return `
                <div class="groep-item${isActive ? ' active' : ''}${g.archived ? ' archived' : ''}" data-id="${g.id}">
                    <div class="groep-header" data-id="${g.id}">
                        <span class="groep-expand">&#9654;</span>
                        <span class="groep-name">${escapeHtml(g.name)}</span>
                        ${g.archived ? '<span class="badge badge-archived">Gearchiveerd</span>' : ''}
                        ${!isOwner ? '<span class="badge badge-gedeeld" title="Je collega heeft je toegang gegeven tot deze klas">Gedeeld met jou</span>' : ''}
                        ${isOwner && duos ? `<span class="badge badge-gedeeld" title="Je deelt deze klas met een collega">Duo &times;${duos}</span>` : ''}
                        <span class="groep-count">${activeCount} leerling${activeCount !== 1 ? 'en' : ''}</span>
                        <div class="groep-actions">
                            ${isOwner ? `
                            <button class="btn-small btn-edit" onclick="event.stopPropagation();window._editGroup('${g.id}')">Bewerken</button>
                            <button class="btn-small btn-edit" onclick="event.stopPropagation();window._manageDuo('${g.id}')">Samenwerken</button>
                            ${g.archived
                                ? `<button class="btn-small btn-restore" onclick="event.stopPropagation();window._archiveGroup('${g.id}',false)">Herstellen</button>`
                                : `<button class="btn-small btn-archive" onclick="event.stopPropagation();window._archiveGroup('${g.id}',true)">Archiveren</button>`
                            }
                            <button class="btn-small btn-delete" onclick="event.stopPropagation();window._deleteGroup('${g.id}')">Verwijderen</button>
                            ` : `
                            <button class="btn-small btn-archive" onclick="event.stopPropagation();window._leaveGroup('${g.id}')">Toegang opzeggen</button>
                            `}
                        </div>
                    </div>
                    <div class="leerlingen-panel" id="leerlingen-${g.id}">
                        ${isActive ? renderStudentsPanel(g.id) : ''}
                    </div>
                </div>
            `;
        }).join('');

        // Bind group header clicks
        container.querySelectorAll('.groep-header').forEach(header => {
            header.addEventListener('click', () => {
                const id = header.dataset.id;
                if (activeGroupId === id) {
                    activeGroupId = null;
                    renderGroups();
                } else {
                    activeGroupId = id;
                    loadStudentsForGroup(id);
                }
            });
        });
    }

    function renderStudentsPanel(groupId) {
        const studentList = (students[groupId] || []).filter(s => showArchived || !s.archived);

        let html = `
            <div class="leerlingen-toolbar">
                <h4>Leerlingen</h4>
                <button class="btn-add-small" onclick="window._showAddStudent('${groupId}')">+ Leerling</button>
                <button class="btn-add-small" onclick="window._printCodes('${groupId}')" title="Print de leerlingcodes om uit te delen">&#128424;&#65039; Codes printen</button>
            </div>
            <div id="addStudentForm-${groupId}" style="display:none;margin-bottom:12px">
                <div class="inline-add-form">
                    <input type="text" id="studentFirstName-${groupId}" placeholder="Voornaam" oninput="window._checkDuplicateName('${groupId}')">
                    <input type="text" id="studentSuffix-${groupId}" placeholder="Letter" maxlength="2" style="max-width:70px" title="Alleen nodig bij dubbele voornamen, bijv. K.">
                    <button class="btn-add-small" onclick="window._addStudent('${groupId}')">Toevoegen</button>
                </div>
                <div class="inline-form-hint" id="addStudentForm-${groupId}Hint"></div>
                <div class="inline-form-error" id="addStudentForm-${groupId}Error"></div>
            </div>
        `;

        if (studentList.length === 0) {
            html += '<div class="leerlingen-empty">Nog geen leerlingen in deze groep.</div>';
        } else {
            html += '<div class="leerlingen-list">';
            studentList.forEach(s => {
                html += `
                    <div class="leerling-item${s.archived ? ' archived' : ''}">
                        <span class="leerling-nummer">${s.student_number}</span>
                        <span class="leerling-naam">${escapeHtml(studentName(s))}</span>
                        ${s.code ? `<span class="leerling-code" title="Inlogcode voor meestertools.nl/leerling">${escapeHtml(s.code)}</span>` : ''}
                        ${s.archived ? '<span class="badge badge-archived" style="font-size:10px">Gearchiveerd</span>' : ''}
                        <div class="leerling-actions">
                            <button class="btn-small btn-edit" onclick="window._editStudent('${s.id}','${groupId}')">Bewerken</button>
                            ${s.archived
                                ? `<button class="btn-small btn-restore" onclick="window._archiveStudent('${s.id}','${groupId}',false)">Herstellen</button>`
                                : `<button class="btn-small btn-archive" onclick="window._archiveStudent('${s.id}','${groupId}',true)">Archiveren</button>`
                            }
                            <button class="btn-small btn-delete" onclick="window._deleteStudent('${s.id}','${groupId}')">Verwijderen</button>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
        }

        return html;
    }

    async function loadStudentsForGroup(groupId) {
        const user = await getCurrentUser();
        if (!user) return;

        const { data } = await supabase
            .from('students')
            .select('*')
            .eq('group_id', groupId)
            .order('student_number', { ascending: true });

        students[groupId] = data || [];
        await ensureCodesForGroup(groupId);
        renderGroups();
    }

    // ---------- Group CRUD ----------
    async function addGroup() {
        const input = overlayEl.querySelector('#newGroupName');
        const name = input.value.trim();
        if (!name) return;

        const btn = overlayEl.querySelector('#confirmAddGroup');
        btn.disabled = true;
        btn.textContent = 'Toevoegen...';
        clearInlineError('addGroup');

        try {
            const user = await getCurrentUser();
            if (!user) {
                showInlineError('addGroup', 'Je bent niet ingelogd. Ververs de pagina en probeer opnieuw.');
                return;
            }

            const { error } = await supabase
                .from('groups')
                .insert({ name: name, user_id: user.id });

            if (error) {
                console.error('Error adding group:', error);
                showInlineError('addGroup', 'Fout bij aanmaken: ' + error.message);
                return;
            }

            input.value = '';
            clearInlineError('addGroup');
            overlayEl.querySelector('#addGroupForm').style.display = 'none';
            loadGroups();
        } catch (err) {
            console.error('Unexpected error:', err);
            showInlineError('addGroup', 'Er ging iets mis: ' + err.message);
        } finally {
            btn.disabled = false;
            btn.textContent = 'Toevoegen';
        }
    }

    window._editGroup = function (id) {
        const group = groups.find(g => g.id === id);
        if (!group) return;

        const modal = overlayEl.querySelector('#instellingenModal');
        overlayEl.querySelector('#innerModalTitle').textContent = 'Groep bewerken';
        overlayEl.querySelector('#innerModalBody').innerHTML = `
            <div class="form-group">
                <label for="editGroupName">Groepsnaam</label>
                <input type="text" id="editGroupName" value="${escapeHtml(group.name)}">
            </div>
        `;
        overlayEl.querySelector('#innerModalFooter').innerHTML = `
            <button class="btn-cancel" id="cancelEditGroup">Annuleren</button>
            <button class="btn-primary" id="saveEditGroup">Opslaan</button>
        `;
        modal.classList.add('active');

        overlayEl.querySelector('#cancelEditGroup').addEventListener('click', () => modal.classList.remove('active'));
        overlayEl.querySelector('#saveEditGroup').addEventListener('click', async () => {
            const newName = overlayEl.querySelector('#editGroupName').value.trim();
            if (!newName) return;

            await supabase.from('groups').update({ name: newName }).eq('id', id);
            modal.classList.remove('active');
            loadGroups();
        });
    };

    window._archiveGroup = async function (id, archive) {
        await supabase.from('groups').update({ archived: archive }).eq('id', id);
        loadGroups();
    };

    window._deleteGroup = function (id) {
        const group = groups.find(g => g.id === id);
        if (!group) return;

        const modal = overlayEl.querySelector('#instellingenModal');
        overlayEl.querySelector('#innerModalTitle').textContent = 'Groep verwijderen';
        overlayEl.querySelector('#innerModalBody').innerHTML = `
            <p class="confirm-text">
                Weet je zeker dat je <strong>${escapeHtml(group.name)}</strong> wilt verwijderen?
                Alle leerlingen in deze groep worden ook verwijderd. Dit kan niet ongedaan worden gemaakt.
            </p>
        `;
        overlayEl.querySelector('#innerModalFooter').innerHTML = `
            <button class="btn-cancel" id="cancelDeleteGroup">Annuleren</button>
            <button class="btn-danger" id="confirmDeleteGroup">Verwijderen</button>
        `;
        modal.classList.add('active');

        overlayEl.querySelector('#cancelDeleteGroup').addEventListener('click', () => modal.classList.remove('active'));
        overlayEl.querySelector('#confirmDeleteGroup').addEventListener('click', async () => {
            await supabase.from('groups').delete().eq('id', id);
            if (activeGroupId === id) activeGroupId = null;
            modal.classList.remove('active');
            loadGroups();
        });
    };

    // ---------- Student CRUD ----------
    window._showAddStudent = function (groupId) {
        const form = overlayEl.querySelector('#addStudentForm-' + groupId);
        if (form) {
            form.style.display = form.style.display === 'none' ? 'block' : 'none';
            if (form.style.display === 'block') {
                overlayEl.querySelector('#studentFirstName-' + groupId).focus();
            }
        }
    };

    // Waarschuwt zodra de getypte voornaam al in deze groep voorkomt. Geen blokkade
    // (drie kinderen die Noa heten mag), maar een duw richting de achterletter op
    // het moment dat het uitmaakt: zonder onderscheid koppelen de meedoen-tools
    // ze allemaal aan hetzelfde kind.
    window._checkDuplicateName = function (groupId) {
        const hint = overlayEl.querySelector('#addStudentForm-' + groupId + 'Hint');
        if (!hint) return;
        const input = overlayEl.querySelector('#studentFirstName-' + groupId);
        const typed = normName(input ? input.value : '');
        const clash = typed
            ? (students[groupId] || []).filter(s => !s.archived && normName(s.first_name) === typed)
            : [];
        if (!clash.length) { hint.textContent = ''; hint.style.display = 'none'; return; }
        const letters = clash.map(s => normSuffix(s.name_suffix)).filter(Boolean);
        hint.textContent = 'Er is al een ' + (clash[0].first_name || typed) + ' in deze groep'
            + (letters.length ? ' (' + letters.map(l => l + '.').join(', ') + ')' : '')
            + '. Geef ze allebei een letter ter onderscheid.';
        hint.style.display = 'block';
    };

    window._addStudent = async function (groupId) {
        const firstNameInput = overlayEl.querySelector('#studentFirstName-' + groupId);
        const suffixInput = overlayEl.querySelector('#studentSuffix-' + groupId);
        const firstName = firstNameInput.value.trim();
        const nameSuffix = normSuffix(suffixInput.value);
        if (!firstName) return;

        // Find the add button and show loading
        var addBtn = firstNameInput.closest('.inline-add-form').querySelector('.btn-add-small');
        if (addBtn) {
            addBtn.disabled = true;
            addBtn.textContent = 'Toevoegen...';
        }

        try {
            const user = await getCurrentUser();
            if (!user) {
                showInlineError('addStudentForm-' + groupId, 'Je bent niet ingelogd. Ververs de pagina.');
                return;
            }

            // Volgnummer: oplopend binnen déze groep, en rechtstreeks uit de database.
            // (Stond eerder op de max over alle geladen groepen, en die lijst bevat
            // bij het openen van Instellingen nog helemaal geen nummers — waardoor
            // het per ongeluk goed ging, maar een kind in groep 5 nummer 29 kreeg
            // zodra groep 8 ook openstond.)
            const { data: lastStudent } = await supabase
                .from('students')
                .select('student_number')
                .eq('group_id', groupId)
                .order('student_number', { ascending: false })
                .limit(1)
                .maybeSingle();
            const studentNumber = ((lastStudent && lastStudent.student_number) || 0) + 1;

            // Unieke leerlingcode genereren (retry bij globale botsing).
            const school = await ensureSchoolName();
            let created = false, lastErr = null;
            for (let attempt = 0; attempt < 8 && !created; attempt++) {
                const { error } = await supabase
                    .from('students')
                    .insert({
                        first_name: firstName,
                        name_suffix: nameSuffix,
                        student_number: studentNumber,
                        group_id: groupId,
                        user_id: user.id,
                        code: genStudentCode(school)
                    });
                if (!error) { created = true; break; }
                lastErr = error;
                if (error.code !== '23505') break;
            }

            if (!created) {
                console.error('Error adding student:', lastErr);
                showInlineError('addStudentForm-' + groupId, 'Fout bij toevoegen: ' + (lastErr ? lastErr.message : ''));
                return;
            }

            firstNameInput.value = '';
            suffixInput.value = '';
            window._checkDuplicateName(groupId);
            overlayEl.querySelector('#addStudentForm-' + groupId).style.display = 'none';
            loadStudentsForGroup(groupId);
        } catch (err) {
            console.error('Unexpected error:', err);
            showInlineError('addStudentForm-' + groupId, 'Er ging iets mis: ' + err.message);
        } finally {
            if (addBtn) {
                addBtn.disabled = false;
                addBtn.textContent = 'Toevoegen';
            }
        }
    };

    // Print de leerlingcodes (knip-uit-strookjes) om uit te delen.
    window._printCodes = async function (groupId) {
        await ensureCodesForGroup(groupId);
        const list = (students[groupId] || []).filter(s => !s.archived);
        if (!list.length) { alert('Er zijn nog geen leerlingen om te printen.'); return; }
        const group = groups.find(g => g.id === groupId);
        const groupName = group ? group.name : '';
        const host = location.host;

        const cards = list.map(s =>
            '<div class="slip">' +
                '<div class="nm">' + escapeHtml(s.first_name) + '</div>' +
                '<div class="cd">' + escapeHtml(s.code || '') + '</div>' +
                '<div class="hint">Ga naar <b>' + escapeHtml(host) + '/leerling</b><br>en vul je voornaam en code in.</div>' +
            '</div>'
        ).join('');

        const html = '<!DOCTYPE html><html lang="nl"><head><meta charset="UTF-8">' +
            '<title>Leerlingcodes - ' + escapeHtml(groupName) + '</title><style>' +
            '*{margin:0;padding:0;box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact;color-adjust:exact;}' +
            'body{font-family:"Segoe UI",system-ui,Arial,sans-serif;padding:16px;color:#2D3436;}' +
            'h1{font-size:18px;margin:0 0 14px;}' +
            '.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;}' +
            '.slip{border:2px dashed #B9B6D6;border-radius:12px;padding:16px 18px;page-break-inside:avoid;text-align:center;}' +
            '.nm{font-size:20px;font-weight:800;margin-bottom:6px;}' +
            '.cd{font-family:"Courier New",monospace;font-size:32px;font-weight:800;letter-spacing:.14em;color:#6C63FF;margin-bottom:8px;}' +
            '.hint{font-size:12.5px;color:#636E72;line-height:1.4;}' +
            '@page{margin:12mm;}' +
            '@media print{body{padding:0;}}' +
            '</style></head><body>' +
            '<h1>Leerlingcodes &mdash; ' + escapeHtml(groupName) + '</h1>' +
            '<div class="grid">' + cards + '</div>' +
            '<script>window.onload=function(){setTimeout(function(){window.print();},350);};<\/script>' +
            '</body></html>';

        const w = window.open('', '_blank');
        if (!w) { alert('Sta pop-ups toe om te kunnen printen.'); return; }
        w.document.open();
        w.document.write(html);
        w.document.close();
    };

    window._editStudent = function (studentId, groupId) {
        const studentList = students[groupId] || [];
        const student = studentList.find(s => s.id === studentId);
        if (!student) return;

        const modal = overlayEl.querySelector('#instellingenModal');
        overlayEl.querySelector('#innerModalTitle').textContent = 'Leerling bewerken';
        overlayEl.querySelector('#innerModalBody').innerHTML = `
            <div class="form-group">
                <label for="editFirstName">Voornaam</label>
                <input type="text" id="editFirstName" value="${escapeHtml(student.first_name)}">
            </div>
            <div class="form-group">
                <label for="editSuffix">Letter ter onderscheid</label>
                <input type="text" id="editSuffix" maxlength="2" value="${escapeHtml(normSuffix(student.name_suffix))}">
                <small class="form-hint">Alleen invullen als er meer kinderen met deze voornaam in de groep zitten, bijv. K. Dan staat er overal &ldquo;${escapeHtml((student.first_name || '').trim())} K.&rdquo;.</small>
            </div>
        `;
        overlayEl.querySelector('#innerModalFooter').innerHTML = `
            <button class="btn-cancel" id="cancelEditStudent">Annuleren</button>
            <button class="btn-primary" id="saveEditStudent">Opslaan</button>
        `;
        modal.classList.add('active');

        overlayEl.querySelector('#cancelEditStudent').addEventListener('click', () => modal.classList.remove('active'));
        overlayEl.querySelector('#saveEditStudent').addEventListener('click', async () => {
            const fn = overlayEl.querySelector('#editFirstName').value.trim();
            const sx = normSuffix(overlayEl.querySelector('#editSuffix').value);
            if (!fn) return;

            await supabase.from('students').update({ first_name: fn, name_suffix: sx }).eq('id', studentId);
            modal.classList.remove('active');
            loadStudentsForGroup(groupId);
        });
    };

    // ---------- Samenwerken: duo-leerkracht ----------
    // De code loopt via create_group_invite/redeem_group_invite in de database.
    // Die functies controleren zelf of jij de eigenaar bent; de tabel met
    // uitnodigingen is voor niemand rechtstreeks leesbaar, zodat codes niet
    // afgelopen kunnen worden.
    window._manageDuo = async function (groupId) {
        const group = groups.find(g => g.id === groupId);
        if (!group) return;
        const leden = membersByGroup[groupId] || [];

        const modal = overlayEl.querySelector('#instellingenModal');
        overlayEl.querySelector('#innerModalTitle').textContent = 'Samenwerken in ' + group.name;
        overlayEl.querySelector('#innerModalBody').innerHTML = `
            <p class="confirm-text">Werkt er een collega op andere dagen met deze klas? Geef haar of hem
            een uitnodigingscode. Jullie werken daarna in dezelfde klas: dezelfde kinderen, dezelfde
            punten, dezelfde plattegrond.</p>
            <p class="confirm-text"><strong>Wat blijft van jou:</strong> de groep zelf, je beloningsknoppen
            en je eigen instellingen. Je collega gebruikt die wel, maar kan ze niet wijzigen of iemand
            anders uitnodigen.</p>
            <div class="form-group">
                <label>Toegang nu</label>
                <div id="duoLeden">${leden.length
                    ? leden.map(m => `<div class="duo-lid">Collega toegevoegd op ${new Date(m.created_at).toLocaleDateString('nl-NL')}
                        <button class="btn-small btn-delete" data-remove="${escapeHtml(m.user_id)}">Intrekken</button></div>`).join('')
                    : '<em>Nog niemand. Alleen jij hebt toegang.</em>'}</div>
            </div>
            <div class="form-group">
                <button class="btn-save" id="duoMaakCode">Uitnodigingscode maken</button>
                <div id="duoCodeUit" style="margin-top:10px"></div>
            </div>
            <div class="inline-form-error" id="duoFout"></div>
        `;
        overlayEl.querySelector('#innerModalFooter').innerHTML =
            '<button class="btn-cancel" id="duoSluit">Sluiten</button>';
        modal.classList.add('active');

        const fout = overlayEl.querySelector('#duoFout');
        const toonFout = (msg) => { fout.textContent = msg; fout.style.display = 'block'; };

        overlayEl.querySelector('#duoSluit').addEventListener('click', () => modal.classList.remove('active'));

        overlayEl.querySelector('#duoMaakCode').addEventListener('click', async () => {
            fout.style.display = 'none';
            const btn = overlayEl.querySelector('#duoMaakCode');
            btn.disabled = true; btn.textContent = 'Bezig...';
            const { data, error } = await supabase.rpc('create_group_invite', { p_group: groupId });
            btn.disabled = false; btn.textContent = 'Nieuwe code maken';
            if (error) { toonFout(error.message || 'Aanmaken lukte niet.'); return; }
            const tot = new Date(data.expires_at).toLocaleDateString('nl-NL');
            overlayEl.querySelector('#duoCodeUit').innerHTML =
                `<div class="duo-code">${escapeHtml(data.code)}</div>
                 <p class="form-hint">Geef deze code aan je collega. Zij vult hem in bij
                 Instellingen &rarr; Mijn klas &rarr; <em>Deelnemen aan een klas</em>.
                 De code werkt &eacute;&eacute;n keer en verloopt op ${tot}.</p>`;
        });

        overlayEl.querySelectorAll('[data-remove]').forEach(b => {
            b.addEventListener('click', async () => {
                const { error } = await supabase.rpc('remove_group_member',
                    { p_group: groupId, p_user: b.getAttribute('data-remove') });
                if (error) { toonFout(error.message || 'Intrekken lukte niet.'); return; }
                modal.classList.remove('active');
                loadGroups();
            });
        });
    };

    // Zelf een gedeelde klas verlaten.
    window._leaveGroup = async function (groupId) {
        const group = groups.find(g => g.id === groupId);
        if (!group) return;
        const modal = overlayEl.querySelector('#instellingenModal');
        overlayEl.querySelector('#innerModalTitle').textContent = 'Toegang opzeggen';
        overlayEl.querySelector('#innerModalBody').innerHTML = `
            <p class="confirm-text">Wil je je toegang tot <strong>${escapeHtml(group.name)}</strong> opzeggen?
            De klas en alle gegevens blijven gewoon bestaan bij je collega; jij ziet ze alleen niet meer.
            Je collega kan je later opnieuw uitnodigen.</p>`;
        overlayEl.querySelector('#innerModalFooter').innerHTML = `
            <button class="btn-cancel" id="leaveNee">Annuleren</button>
            <button class="btn-primary" id="leaveJa">Toegang opzeggen</button>`;
        modal.classList.add('active');
        overlayEl.querySelector('#leaveNee').addEventListener('click', () => modal.classList.remove('active'));
        overlayEl.querySelector('#leaveJa').addEventListener('click', async () => {
            const { data: { session } } = await supabase.auth.getSession();
            await supabase.rpc('remove_group_member', { p_group: groupId, p_user: session.user.id });
            modal.classList.remove('active');
            loadGroups();
        });
    };

    window._archiveStudent = async function (studentId, groupId, archive) {
        await supabase.from('students').update({ archived: archive }).eq('id', studentId);
        loadStudentsForGroup(groupId);
    };

    window._deleteStudent = function (studentId, groupId) {
        const studentList = students[groupId] || [];
        const student = studentList.find(s => s.id === studentId);
        if (!student) return;

        const fullName = studentName(student);

        const modal = overlayEl.querySelector('#instellingenModal');
        overlayEl.querySelector('#innerModalTitle').textContent = 'Leerling verwijderen';
        overlayEl.querySelector('#innerModalBody').innerHTML = `
            <p class="confirm-text">
                Weet je zeker dat je <strong>${escapeHtml(fullName)}</strong> wilt verwijderen?
                Dit kan niet ongedaan worden gemaakt.
            </p>
        `;
        overlayEl.querySelector('#innerModalFooter').innerHTML = `
            <button class="btn-cancel" id="cancelDeleteStudent">Annuleren</button>
            <button class="btn-danger" id="confirmDeleteStudent">Verwijderen</button>
        `;
        modal.classList.add('active');

        overlayEl.querySelector('#cancelDeleteStudent').addEventListener('click', () => modal.classList.remove('active'));
        overlayEl.querySelector('#confirmDeleteStudent').addEventListener('click', async () => {
            await supabase.from('students').delete().eq('id', studentId);
            modal.classList.remove('active');
            loadStudentsForGroup(groupId);
        });
    };

    // ---------- Utility ----------
    function escapeHtml(s) { return MT.escapeHtml(s); }

    // Achterletter: alleen letters, max 2, als "K" opgeslagen en als "K." getoond.
    // Bewust te kort voor een achternaam — de database dwingt dat ook af.
    function normSuffix(raw) {
        return String(raw == null ? '' : raw)
            .replace(/[^A-Za-zÀ-ÿ]/g, '')
            .slice(0, 2)
            .replace(/^./, c => c.toUpperCase())
            .replace(/^(.)(.)$/, (m, a, b) => a + b.toLowerCase());
    }
    function studentName(s) {
        if (!s) return '?';
        const f = (s.first_name || '').trim();
        const x = normSuffix(s.name_suffix);
        return (x ? f + ' ' + x + '.' : f) || '?';
    }
    function normName(s) {
        return String(s == null ? '' : s).trim().toLowerCase();
    }

})();

/* ============================================
   PODIUM TOOL - JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    const TOOL_NAME = 'podium';

    // ---------- Podiumgrootte ----------
    const MIN_PLACES = 1;
    const MAX_PLACES = 5;
    const DEFAULT_PLACES = 3;

    // Hoogte van elk blok in pixels, per aantal plaatsen. Met de hand gekozen in
    // plaats van berekend: bij drie plaatsen staan hier exact de oude waarden, zodat
    // het podium dat iedereen kent niet ineens verspringt. Index 0 = plaats 1.
    const BLOCK_HEIGHTS = {
        1: [200],
        2: [190, 130],
        3: [180, 130, 90],
        4: [180, 140, 105, 75],
        5: [175, 143, 114, 88, 65]
    };

    // ---------- DOM Elements ----------
    const btnSettings = document.getElementById('btnSettings');
    const settingsModal = document.getElementById('settingsModal');
    const btnCloseSettings = document.getElementById('btnCloseSettings');
    const btnSaveSettings = document.getElementById('btnSaveSettings');
    const settingGroup = document.getElementById('settingGroup');
    const settingCount = document.getElementById('settingCount');
    const placeFields = document.getElementById('placeFields');
    const settingsHint = document.getElementById('settingsHint');

    const btnReveal = document.getElementById('btnReveal');
    const emptyState = document.getElementById('emptyState');
    const podiumStage = document.querySelector('.podium-stage');
    const podiumAction = document.querySelector('.podium-action');
    const confettiCanvas = document.getElementById('confettiCanvas');

    if (!btnReveal) return;

    // ---------- State ----------
    let selectedGroupId = null;
    let placeCount = DEFAULT_PLACES;
    let placeIds = [];    // index 0 = plaats 1
    let placeNames = [];  // idem: de naam zoals die op het bord komt
    let nameEls = [];     // de naam-elementen op het podium, index 0 = plaats 1
    let students = [];
    let groups = [];
    let revealStep = 0;   // aantal plaatsen dat al onthuld is
    let modalGroupId = null; // de groep die op dit moment in de instellingen staat

    function clampCount(n) {
        n = parseInt(n, 10);
        if (!n || n < MIN_PLACES) return DEFAULT_PLACES;
        return Math.min(n, MAX_PLACES);
    }

    // Volgorde van links naar rechts: de winnaar in het midden, de rest om en om
    // links en rechts ernaast. Dat geeft 2-1-3 bij drie plaatsen (het klassieke
    // podium) en 4-2-1-3-5 bij vijf.
    function stageOrder(count) {
        const left = [], right = [];
        for (let rank = 2; rank <= count; rank++) {
            (rank % 2 === 0 ? left : right).push(rank);
        }
        return left.reverse().concat([1], right);
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
            selectedGroupId = s.selectedGroupId || null;

            if (Array.isArray(s.placeNames)) {
                placeCount = clampCount(s.placeCount);
                placeIds = s.placeIds || [];
                placeNames = s.placeNames;
            } else {
                // Opgeslagen vóór de instelbare podiumgrootte: toen was het altijd drie.
                placeCount = 3;
                placeIds = [s.place1Id || null, s.place2Id || null, s.place3Id || null];
                placeNames = [s.place1Name || '', s.place2Name || '', s.place3Name || ''];
            }
            normalizePlaces();
        }
    }

    // Zorg dat beide lijsten precies placeCount lang zijn: bij het ophogen van het
    // aantal plaatsen komen er lege bij, bij het verlagen vallen ze eraf.
    function normalizePlaces() {
        placeIds.length = placeCount;
        placeNames.length = placeCount;
        for (let i = 0; i < placeCount; i++) {
            if (!placeIds[i]) placeIds[i] = null;
            if (!placeNames[i]) placeNames[i] = '';
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
                settings: {
                    selectedGroupId,
                    placeCount,
                    placeIds,
                    placeNames
                },
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id,tool_name' });
    }

    async function loadGroups() {
        const user = await getSessionUser();
        if (!user) return;
        const { data: groupData } = await supabase
            .from('groups')
            .select('id, name')
            .eq('archived', false)
            .order('name');
        groups = groupData || [];
    }

    async function loadStudents(groupId) {
        if (!groupId) { students = []; return; }
        const user = await getSessionUser();
        if (!user) return;
        const { data: studentData } = await supabase
            .from('students')
            .select('id, first_name, name_suffix')
            .eq('group_id', groupId)
            .eq('archived', false)
            .order('student_number', { ascending: true });
        students = studentData || [];
    }

    // ---------- UI ----------
    function buildUI() {
        const hasPlaces = placeNames.length === placeCount && placeNames.every(n => n);

        if (!hasPlaces) {
            podiumStage.style.display = 'none';
            podiumAction.style.display = 'none';
            emptyState.style.display = '';
            return;
        }

        podiumStage.style.display = '';
        podiumAction.style.display = '';
        emptyState.style.display = 'none';

        buildStage();
        resetPodium();
    }

    // De blokken staan niet in de HTML: hoeveel het er zijn is een instelling.
    function buildStage() {
        podiumStage.innerHTML = '';
        podiumStage.dataset.count = placeCount;
        nameEls = [];

        const heights = BLOCK_HEIGHTS[placeCount] || BLOCK_HEIGHTS[DEFAULT_PLACES];

        stageOrder(placeCount).forEach(rank => {
            const place = document.createElement('div');
            place.className = 'podium-place place-' + rank;

            const nameEl = document.createElement('div');
            nameEl.className = 'podium-name hidden-text';
            nameEl.textContent = '???';

            const block = document.createElement('div');
            block.className = 'podium-block block-' + rank;
            block.style.setProperty('--h', heights[rank - 1] + 'px');

            const number = document.createElement('span');
            number.className = 'podium-number';
            number.textContent = rank;

            block.appendChild(number);
            place.appendChild(nameEl);
            place.appendChild(block);
            podiumStage.appendChild(place);

            nameEls[rank - 1] = nameEl;
        });
    }

    function resetPodium() {
        revealStep = 0;

        nameEls.forEach(el => {
            el.textContent = '???';
            el.classList.remove('revealed');
            el.classList.add('hidden-text');
        });

        podiumStage.querySelectorAll('.podium-place').forEach(el => el.classList.remove('active'));

        btnReveal.textContent = 'Onthul!';
        btnReveal.classList.remove('reset');
    }

    // ---------- Reveal Logic ----------
    // Van de laagste plaats naar de winnaar toe, hoeveel plaatsen er ook zijn.
    // Bij één plaats is de eerste klik dus meteen de winnaar plus confetti.
    btnReveal.addEventListener('click', () => {
        if (revealStep >= placeCount) {
            resetPodium();
            return;
        }

        revealStep++;
        revealPlace(placeCount - revealStep + 1);

        if (revealStep >= placeCount) {
            btnReveal.textContent = 'Opnieuw';
            btnReveal.classList.add('reset');
            launchConfetti();
        } else if (revealStep === placeCount - 1) {
            btnReveal.textContent = 'En de winnaar is...';
        } else {
            btnReveal.textContent = 'Volgende...';
        }
    });

    function revealPlace(rank) {
        const nameEl = nameEls[rank - 1];
        if (!nameEl) return;

        nameEl.classList.remove('hidden-text');
        nameEl.textContent = placeNames[rank - 1];
        // Force reflow for animation
        void nameEl.offsetWidth;
        nameEl.classList.add('revealed');

        const placeEl = podiumStage.querySelector('.place-' + rank);
        if (placeEl) placeEl.classList.add('active');
    }

    // ---------- Confetti ----------
    function launchConfetti() {
        const canvas = confettiCanvas;
        const ctx = canvas.getContext('2d');
        canvas.style.display = 'block';
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles = [];
        const colors = ['#FFD700', '#FF6B6B', '#6BCB77', '#6C63FF', '#FFB347', '#FF69B4', '#00CED1', '#FF4500'];
        const particleCount = 100;

        // Create particles from top center
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: canvas.width / 2 + (Math.random() - 0.5) * 200,
                y: canvas.height * 0.3 + (Math.random() - 0.5) * 100,
                vx: (Math.random() - 0.5) * 12,
                vy: Math.random() * -8 - 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 8 + 4,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 10,
                gravity: 0.15 + Math.random() * 0.1,
                opacity: 1,
                shape: Math.random() > 0.5 ? 'rect' : 'circle'
            });
        }

        let startTime = Date.now();
        const duration = 3500;

        function animate() {
            const elapsed = Date.now() - startTime;
            if (elapsed > duration) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                canvas.style.display = 'none';
                return;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach(p => {
                p.x += p.vx;
                p.vy += p.gravity;
                p.y += p.vy;
                p.rotation += p.rotationSpeed;
                p.vx *= 0.99;

                // Fade out in last second
                if (elapsed > duration - 1000) {
                    p.opacity = Math.max(0, (duration - elapsed) / 1000);
                }

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rotation * Math.PI) / 180);
                ctx.globalAlpha = p.opacity;
                ctx.fillStyle = p.color;

                if (p.shape === 'rect') {
                    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
                } else {
                    ctx.beginPath();
                    ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.restore();
            });

            requestAnimationFrame(animate);
        }

        animate();
    }

    // ---------- Settings Modal ----------
    const PLACE_LABELS = {
        1: '\u{1F947} Plaats 1 (Goud)',
        2: '\u{1F948} Plaats 2 (Zilver)',
        3: '\u{1F949} Plaats 3 (Brons)',
        4: 'Plaats 4',
        5: 'Plaats 5'
    };

    function openModal() {
        settingCount.value = String(placeCount);
        hideHint();
        loadGroupsIntoSelect();
        settingsModal.classList.add('active');
    }

    function closeModal() {
        settingsModal.classList.remove('active');
    }

    function showHint(text) {
        settingsHint.textContent = text;
        settingsHint.style.display = '';
    }

    function hideHint() {
        settingsHint.style.display = 'none';
    }

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

        modalGroupId = selectedGroupId;

        if (selectedGroupId) {
            await loadStudents(selectedGroupId);
            renderPlaceFields();
        } else {
            placeFields.style.display = 'none';
        }
    }

    function studentLabel(s) {
        return s.name_suffix ? s.first_name + ' ' + s.name_suffix + '.' : s.first_name;
    }

    // Een select per plaats, opgebouwd van de laagste plaats naar de winnaar toe:
    // dezelfde volgorde als waarin ze straks onthuld worden.
    function renderPlaceFields() {
        const count = clampCount(settingCount.value);
        placeFields.innerHTML = '';
        placeFields.style.display = '';

        for (let rank = count; rank >= 1; rank--) {
            const group = document.createElement('div');
            group.className = 'form-group';

            const label = document.createElement('label');
            label.setAttribute('for', 'settingPlace' + rank);
            label.textContent = PLACE_LABELS[rank];

            const select = document.createElement('select');
            select.id = 'settingPlace' + rank;
            select.dataset.rank = rank;

            const blank = document.createElement('option');
            blank.value = '';
            blank.textContent = 'Selecteer leerling...';
            select.appendChild(blank);

            students.forEach(s => {
                const opt = document.createElement('option');
                opt.value = s.id;
                opt.textContent = studentLabel(s);
                if (s.id === placeIds[rank - 1]) opt.selected = true;
                select.appendChild(opt);
            });

            group.appendChild(label);
            group.appendChild(select);
            placeFields.appendChild(group);
        }
    }

    // Onthoud wat er nu in de selects staat, zodat een gekozen leerling niet
    // verdwijnt als je het aantal plaatsen aanpast.
    function readPlaceFields() {
        placeFields.querySelectorAll('select[data-rank]').forEach(select => {
            placeIds[parseInt(select.dataset.rank, 10) - 1] = select.value || null;
        });
    }

    settingCount.addEventListener('change', () => {
        if (placeFields.style.display === 'none') return;
        readPlaceFields();
        hideHint();
        renderPlaceFields();
    });

    settingGroup.addEventListener('change', async () => {
        const groupId = settingGroup.value || null;
        hideHint();
        if (groupId) {
            // Een andere groep betekent andere kinderen: de oude keuzes gelden niet meer.
            if (groupId !== modalGroupId) placeIds = [];
            await loadStudents(groupId);
            renderPlaceFields();
        } else {
            students = [];
            placeFields.style.display = 'none';
        }
        modalGroupId = groupId;
    });

    btnSettings.addEventListener('click', openModal);
    btnCloseSettings.addEventListener('click', closeModal);
    settingsModal.addEventListener('click', (e) => { if (e.target === settingsModal) closeModal(); });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && settingsModal.classList.contains('active')) closeModal();
    });

    btnSaveSettings.addEventListener('click', async () => {
        const chosenGroup = settingGroup.value || null;
        placeCount = clampCount(settingCount.value);

        // Eerst controleren, dan pas opslaan. Vroeger sloot de modal ook bij een
        // half ingevulde top drie, en stond je met een leeg podium voor de klas
        // zonder te zien waarom.
        if (!chosenGroup) {
            showHint('Kies eerst een groep.');
            return;
        }

        selectedGroupId = chosenGroup;
        readPlaceFields();
        normalizePlaces();

        if (placeIds.some(id => !id)) {
            showHint(placeCount === 1
                ? 'Kies wie er op het podium komt.'
                : 'Vul alle ' + placeCount + ' de plaatsen in, of kies hierboven minder podiumplaatsen.');
            return;
        }

        const dubbel = placeIds.find((id, i) => placeIds.indexOf(id) !== i);
        if (dubbel) {
            const s = students.find(st => st.id === dubbel);
            showHint((s ? studentLabel(s) : 'Een leerling') + ' staat op meer dan één plaats.');
            return;
        }

        placeNames = placeIds.map(id => {
            const s = students.find(st => st.id === id);
            return s ? studentLabel(s) : '';
        });

        hideHint();
        await saveSettingsToDb();
        buildUI();
        closeModal();
    });

    // ---------- Init ----------
    async function init() {
        await loadSettings();
        buildUI();
    }
    init();
});

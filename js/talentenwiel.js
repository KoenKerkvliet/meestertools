/* ============================================
   MEESTERTOOLS - Talentenwiel
   Versie: v1.0.0

   Maak zichtbaar waar elk kind goed in is: draai het wiel om een
   leerling in het zonnetje te zetten, en verzamel per kind talenten
   (suggestie-chips + eigen invoer, max 4).
   Data per klas in tool_settings (JSON):
   { byGroup: { [groupId]: { [studentId]: ['talent', ...] } } }
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    const TOOL_NAME = 'talentenwiel';
    const MAX_TALENTS = 4;

    const canvas = document.getElementById('twCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const spinBtn = document.getElementById('twSpinBtn');
    const spotlight = document.getElementById('twSpotlight');
    const spotName = document.getElementById('twSpotName');
    const spotTalents = document.getElementById('twSpotTalents');
    const spotAsk = document.getElementById('twSpotAsk');
    const spotEdit = document.getElementById('twSpotEdit');
    const gridEl = document.getElementById('twGrid');
    const statsEl = document.getElementById('twStats');
    const emptyEl = document.getElementById('twEmpty');
    const viewWiel = document.getElementById('twViewWiel');
    const viewOverzicht = document.getElementById('twViewOverzicht');

    const modal = document.getElementById('twModal');
    const modalTitle = document.getElementById('twModalTitle');
    const chosenEl = document.getElementById('twChosen');
    const suggestionsEl = document.getElementById('twSuggestions');
    const customInput = document.getElementById('twCustomInput');

    const COLORS = ['#6C63FF', '#FF6B6B', '#4ECDC4', '#FFB347', '#FF6B9D', '#45B7D1', '#6BCB77', '#8B83FF'];

    const SUGGESTIES = [
        'helpen', 'luisteren', 'humor', 'tekenen', 'knutselen', 'rekenen',
        'lezen', 'verhalen vertellen', 'sport', 'dansen', 'muziek', 'zingen',
        'geduld', 'doorzetten', 'samenwerken', 'organiseren', 'opruimen',
        'computers', 'zorgen voor dieren', 'netjes werken', 'presenteren',
        'nieuwe ideeën', 'eerlijk zijn', 'troosten', 'bouwen', 'plannen'
    ];

    // ---------- State ----------
    let byGroup = {};
    let groups = [];
    let groupId = '';
    let students = [];
    let currentAngle = 0;
    let isSpinning = false;
    let lastPickedId = null;
    let spotStudentId = null;
    let editingStudentId = null;
    let editingTalents = [];

    function groupData() {
        if (!byGroup[groupId]) byGroup[groupId] = {};
        return byGroup[groupId];
    }

    // ---------- Supabase ----------
    async function getSessionUser() {
        const { data: { session } } = await supabase.auth.getSession();
        return session?.user || null;
    }

    async function loadSettings() {
        const user = await getSessionUser();
        if (!user) return;
        const { data } = await supabase
            .from('tool_settings')
            .select('settings')
            .eq('user_id', user.id)
            .eq('tool_name', TOOL_NAME)
            .single();
        if (data && data.settings && data.settings.byGroup) {
            byGroup = data.settings.byGroup;
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
                settings: { byGroup },
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id,tool_name' });
    }

    async function loadGroups() {
        const user = await getSessionUser();
        if (!user) return;
        const { data } = await supabase
            .from('groups')
            .select('id, name')
            .eq('archived', false)
            .order('name');
        groups = data || [];
    }

    async function loadStudents() {
        students = [];
        if (!groupId) return;
        const user = await getSessionUser();
        if (!user) return;
        const { data } = await supabase
            .from('students')
            .select('id, first_name, name_suffix')
            .eq('group_id', groupId)
            .eq('archived', false)
            .order('first_name');
        students = data || [];
    }

    // ---------- Wiel tekenen ----------
    function drawWheel() {
        const size = canvas.width;
        const center = size / 2;
        const radius = center - 4;

        ctx.clearRect(0, 0, size, size);

        if (!students.length) {
            ctx.fillStyle = '#E2E2EE';
            ctx.beginPath();
            ctx.arc(center, center, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#999';
            ctx.font = '20px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Geen leerlingen', center, center);
            return;
        }

        const sliceAngle = (Math.PI * 2) / students.length;
        const fontSize = students.length <= 8 ? 20 : students.length <= 16 ? 16 : students.length <= 26 ? 13 : 11;

        students.forEach((s, i) => {
            const startAngle = currentAngle + i * sliceAngle;
            const endAngle = startAngle + sliceAngle;

            ctx.beginPath();
            ctx.moveTo(center, center);
            ctx.arc(center, center, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = COLORS[i % COLORS.length];
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.save();
            ctx.translate(center, center);
            ctx.rotate(startAngle + sliceAngle / 2);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold ' + fontSize + 'px sans-serif';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            const name = s.first_name || '?';
            const displayText = name.length > 14 ? name.substring(0, 12) + '..' : name;
            ctx.fillText(displayText, radius - 14, 0);
            ctx.restore();
        });

        ctx.beginPath();
        ctx.arc(center, center, 20, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.strokeStyle = '#E2E2EE';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    // ---------- Draaien ----------
    function spinWheel() {
        if (isSpinning || students.length < 2) return;
        isSpinning = true;
        spinBtn.disabled = true;
        spotlight.style.display = 'none';

        const sliceAngle = (Math.PI * 2) / students.length;

        // Winnaar kiezen (niet twee keer dezelfde achter elkaar)
        let winnerIndex;
        let tries = 50;
        do {
            winnerIndex = Math.floor(Math.random() * students.length);
            tries--;
        } while (students[winnerIndex].id === lastPickedId && tries > 0 && students.length > 1);

        const fullRotations = 4 + Math.floor(Math.random() * 4);
        const sliceCenter = winnerIndex * sliceAngle + sliceAngle / 2;
        let targetAngle = -sliceCenter - Math.PI / 2 + fullRotations * Math.PI * 2;
        targetAngle += (Math.random() - 0.5) * sliceAngle * 0.6;
        if (targetAngle <= currentAngle) targetAngle += Math.PI * 2 * 4;

        const startAngle = currentAngle;
        const totalDelta = targetAngle - startAngle;
        const duration = 3500;
        let startTime = null;

        function animate(timestamp) {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            currentAngle = startAngle + totalDelta * eased;
            drawWheel();
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                isSpinning = false;
                spinBtn.disabled = false;
                lastPickedId = students[winnerIndex].id;
                showSpotlight(students[winnerIndex]);
            }
        }
        requestAnimationFrame(animate);
    }

    // ---------- Spotlight ----------
    function esc(str) {
        const d = document.createElement('div');
        d.textContent = str == null ? '' : str;
        return d.innerHTML;
    }

    function showSpotlight(student) {
        const talents = groupData()[student.id] || [];
        spotStudentId = student.id;
        spotName.textContent = student.first_name;
        spotTalents.innerHTML = talents
            .map((t) => '<span class="tw-talent-chip">&#11088; ' + esc(t) + '</span>')
            .join('');
        spotAsk.style.display = talents.length ? 'none' : '';
        spotEdit.textContent = talents.length ? 'Talenten aanpassen ✎' : 'Talenten invullen ✎';
        spotlight.style.display = '';
        spotlight.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // ---------- Overzicht ----------
    function renderGrid() {
        const data = groupData();
        gridEl.innerHTML = '';
        let withTalents = 0;

        students.forEach((s) => {
            const talents = data[s.id] || [];
            if (talents.length) withTalents++;

            const card = document.createElement('button');
            card.type = 'button';
            card.className = 'tw-card' + (talents.length ? '' : ' no-talents');
            card.innerHTML =
                '<span class="tw-card-name">' + esc(s.first_name) + '</span>' +
                (talents.length
                    ? '<span class="tw-card-talents">' + talents.map((t) => '<span class="tw-mini-chip">' + esc(t) + '</span>').join('') + '</span>'
                    : '<span class="tw-card-none">Nog geen talenten — klik om in te vullen.</span>');
            card.addEventListener('click', () => openModal(s));
            gridEl.appendChild(card);
        });

        statsEl.textContent = withTalents + ' van ' + students.length + ' leerlingen heeft talenten op het wiel';
    }

    function renderAll() {
        const hasStudents = students.length > 0;
        emptyEl.style.display = hasStudents ? 'none' : '';
        spinBtn.style.display = hasStudents ? '' : 'none';
        drawWheel();
        renderGrid();
    }

    // ---------- Modal ----------
    function renderModalChips() {
        chosenEl.innerHTML = '';
        editingTalents.forEach((t) => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'tw-pick chosen';
            b.textContent = t;
            b.title = 'Verwijderen';
            b.addEventListener('click', () => {
                editingTalents = editingTalents.filter((x) => x !== t);
                renderModalChips();
            });
            chosenEl.appendChild(b);
        });

        suggestionsEl.innerHTML = '';
        SUGGESTIES.filter((t) => !editingTalents.includes(t)).forEach((t) => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'tw-pick';
            b.textContent = t;
            b.addEventListener('click', () => addTalent(t));
            suggestionsEl.appendChild(b);
        });
    }

    function addTalent(t) {
        t = String(t || '').trim().slice(0, 30);
        if (!t || editingTalents.includes(t)) return;
        if (editingTalents.length >= MAX_TALENTS) return;
        editingTalents.push(t);
        renderModalChips();
    }

    function openModal(student) {
        editingStudentId = student.id;
        editingTalents = (groupData()[student.id] || []).slice();
        modalTitle.textContent = 'Talenten van ' + student.first_name;
        customInput.value = '';
        renderModalChips();
        modal.classList.add('active');
    }

    function closeModal() {
        modal.classList.remove('active');
        editingStudentId = null;
    }

    async function saveModal() {
        if (!editingStudentId) return;
        const data = groupData();
        if (editingTalents.length) {
            data[editingStudentId] = editingTalents.slice();
        } else {
            delete data[editingStudentId];
        }
        const savedId = editingStudentId;
        closeModal();
        renderAll();
        // Spotlight verversen als die leerling net in het zonnetje stond
        if (spotlight.style.display !== 'none' && savedId === spotStudentId) {
            const s = students.find((x) => x.id === savedId);
            if (s) showSpotlight(s);
        }
        await saveSettingsToDb();
    }

    // ---------- Weergave wisselen ----------
    document.querySelectorAll('.tw-tab').forEach((tab) => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tw-tab').forEach((t) => t.classList.remove('active'));
            tab.classList.add('active');
            const isWiel = tab.dataset.view === 'wiel';
            viewWiel.style.display = isWiel ? '' : 'none';
            viewOverzicht.style.display = isWiel ? 'none' : '';
        });
    });

    // ---------- Events ----------
    spinBtn.addEventListener('click', spinWheel);
    canvas.addEventListener('click', spinWheel);

    spotEdit.addEventListener('click', () => {
        const s = students.find((x) => x.id === spotStudentId);
        if (s) openModal(s);
    });

    document.getElementById('twModalClose').addEventListener('click', closeModal);
    document.getElementById('twModalSave').addEventListener('click', saveModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    document.getElementById('twCustomAdd').addEventListener('click', () => {
        addTalent(customInput.value);
        customInput.value = '';
        customInput.focus();
    });
    customInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            addTalent(customInput.value);
            customInput.value = '';
        }
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

    // ---------- Init + actieve klas ----------
    async function switchGroup(newId) {
        groupId = newId || '';
        lastPickedId = null;
        spotlight.style.display = 'none';
        await loadStudents();
        renderAll();
    }

    async function init() {
        await loadSettings();
        await loadGroups();
        if (window.MTActiveClass) {
            groupId = window.MTActiveClass.resolveDefault(groupId, groups);
            window.MTActiveClass.onChange((id) => { switchGroup(id); });
        } else if (groups.length) {
            groupId = groups[0].id;
        }
        await loadStudents();
        renderAll();
    }

    init();
});

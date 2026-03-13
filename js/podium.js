/* ============================================
   PODIUM TOOL - JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    const TOOL_NAME = 'podium';

    // ---------- DOM Elements ----------
    const btnSettings = document.getElementById('btnSettings');
    const settingsModal = document.getElementById('settingsModal');
    const btnCloseSettings = document.getElementById('btnCloseSettings');
    const btnSaveSettings = document.getElementById('btnSaveSettings');
    const settingGroup = document.getElementById('settingGroup');
    const settingPlace1 = document.getElementById('settingPlace1');
    const settingPlace2 = document.getElementById('settingPlace2');
    const settingPlace3 = document.getElementById('settingPlace3');
    const studentFields = document.getElementById('studentFields');
    const studentFields1 = document.getElementById('studentFields1');
    const studentFields2 = document.getElementById('studentFields2');

    const name1 = document.getElementById('name1');
    const name2 = document.getElementById('name2');
    const name3 = document.getElementById('name3');
    const btnReveal = document.getElementById('btnReveal');
    const emptyState = document.getElementById('emptyState');
    const podiumStage = document.querySelector('.podium-stage');
    const podiumAction = document.querySelector('.podium-action');
    const confettiCanvas = document.getElementById('confettiCanvas');

    if (!btnReveal) return;

    // ---------- State ----------
    let selectedGroupId = null;
    let place1Id = null;
    let place2Id = null;
    let place3Id = null;
    let place1Name = '';
    let place2Name = '';
    let place3Name = '';
    let students = [];
    let groups = [];
    let revealStep = 0; // 0=none, 1=#3 shown, 2=#2 shown, 3=all shown

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
            place1Id = s.place1Id || null;
            place2Id = s.place2Id || null;
            place3Id = s.place3Id || null;
            place1Name = s.place1Name || '';
            place2Name = s.place2Name || '';
            place3Name = s.place3Name || '';
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
                    place1Id, place2Id, place3Id,
                    place1Name, place2Name, place3Name
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
            .eq('user_id', user.id)
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
            .select('id, first_name, last_name')
            .eq('group_id', groupId)
            .eq('user_id', user.id)
            .eq('archived', false)
            .order('student_number', { ascending: true });
        students = studentData || [];
    }

    // ---------- UI ----------
    function buildUI() {
        const hasPlaces = place1Name && place2Name && place3Name;

        if (!hasPlaces) {
            podiumStage.style.display = 'none';
            podiumAction.style.display = 'none';
            emptyState.style.display = '';
            return;
        }

        podiumStage.style.display = '';
        podiumAction.style.display = '';
        emptyState.style.display = 'none';

        resetPodium();
    }

    function resetPodium() {
        revealStep = 0;

        // Reset all names to ???
        [name1, name2, name3].forEach(el => {
            el.textContent = '???';
            el.classList.remove('revealed');
            el.classList.add('hidden-text');
        });

        // Remove active states from blocks
        document.querySelectorAll('.podium-place').forEach(el => el.classList.remove('active'));

        // Reset button
        btnReveal.textContent = 'Onthul!';
        btnReveal.classList.remove('reset');
    }

    // ---------- Reveal Logic ----------
    btnReveal.addEventListener('click', () => {
        if (revealStep >= 3) {
            // Reset
            resetPodium();
            return;
        }

        revealStep++;

        if (revealStep === 1) {
            // Reveal #3
            revealPlace(name3, place3Name, '.place-3');
            btnReveal.textContent = 'Volgende...';
        } else if (revealStep === 2) {
            // Reveal #2
            revealPlace(name2, place2Name, '.place-2');
            btnReveal.textContent = 'En de winnaar is...';
        } else if (revealStep === 3) {
            // Reveal #1 + confetti
            revealPlace(name1, place1Name, '.place-1');
            btnReveal.textContent = 'Opnieuw';
            btnReveal.classList.add('reset');
            launchConfetti();
        }
    });

    function revealPlace(nameEl, name, placeSelector) {
        nameEl.classList.remove('hidden-text');
        nameEl.textContent = name;
        // Force reflow for animation
        void nameEl.offsetWidth;
        nameEl.classList.add('revealed');

        const placeEl = document.querySelector(placeSelector);
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
    function openModal() {
        loadGroupsIntoSelect();
        settingsModal.classList.add('active');
    }

    function closeModal() {
        settingsModal.classList.remove('active');
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

        if (selectedGroupId) {
            await loadStudents(selectedGroupId);
            showStudentFields(true);
            populateStudentDropdowns();
        } else {
            showStudentFields(false);
        }
    }

    function showStudentFields(show) {
        studentFields.style.display = show ? '' : 'none';
        studentFields1.style.display = show ? '' : 'none';
        studentFields2.style.display = show ? '' : 'none';
    }

    function populateStudentDropdowns() {
        [settingPlace1, settingPlace2, settingPlace3].forEach((select, i) => {
            const currentId = [place1Id, place2Id, place3Id][i];
            select.innerHTML = '<option value="">Selecteer leerling...</option>';
            students.forEach(s => {
                const opt = document.createElement('option');
                opt.value = s.id;
                opt.textContent = s.last_name ? s.first_name + ' ' + s.last_name : s.first_name;
                if (s.id === currentId) opt.selected = true;
                select.appendChild(opt);
            });
        });
    }

    settingGroup.addEventListener('change', async () => {
        const groupId = settingGroup.value || null;
        if (groupId) {
            await loadStudents(groupId);
            showStudentFields(true);
            populateStudentDropdowns();
        } else {
            students = [];
            showStudentFields(false);
        }
    });

    btnSettings.addEventListener('click', openModal);
    btnCloseSettings.addEventListener('click', closeModal);
    settingsModal.addEventListener('click', (e) => { if (e.target === settingsModal) closeModal(); });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && settingsModal.classList.contains('active')) closeModal();
    });

    btnSaveSettings.addEventListener('click', async () => {
        selectedGroupId = settingGroup.value || null;

        // Get selected student names
        function getStudentName(id) {
            const s = students.find(st => st.id === id);
            if (!s) return '';
            return s.last_name ? s.first_name + ' ' + s.last_name : s.first_name;
        }

        place1Id = settingPlace1.value || null;
        place2Id = settingPlace2.value || null;
        place3Id = settingPlace3.value || null;
        place1Name = getStudentName(place1Id);
        place2Name = getStudentName(place2Id);
        place3Name = getStudentName(place3Id);

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

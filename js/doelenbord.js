/* ============================================
   MEESTERTOOLS - Doelenbord
   Versie: v1.0.0

   Elke leerling een eigen mini-doel: stellen, status bijhouden
   (bezig/gelukt) en kort reflecteren. Plus één klassendoel.
   Data per klas in tool_settings (JSON):
   { byGroup: { [groupId]: {
       classGoal: { text, done },
       students: { [studentId]: { doel, status, reflectie } }
   } } }
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    const TOOL_NAME = 'doelenbord';

    const grid = document.getElementById('dbGrid');
    if (!grid) return;

    const statsEl = document.getElementById('dbStats');
    const emptyEl = document.getElementById('dbEmpty');
    const classGoalCard = document.getElementById('dbClassGoal');
    const classGoalText = document.getElementById('dbClassGoalText');
    const classGoalDoneBtn = document.getElementById('dbClassGoalDone');

    const modal = document.getElementById('dbModal');
    const modalTitle = document.getElementById('dbModalTitle');
    const goalInput = document.getElementById('dbGoalInput');
    const reflectInput = document.getElementById('dbReflectInput');
    const statusSeg = document.getElementById('dbStatusSeg');

    const classModal = document.getElementById('dbClassModal');
    const classGoalInput = document.getElementById('dbClassGoalInput');

    // ---------- State ----------
    let byGroup = {};          // alle data, per groep
    let groups = [];
    let groupId = '';
    let students = [];
    let editingStudentId = null;
    let modalStatus = 'bezig';

    function groupData() {
        if (!byGroup[groupId]) byGroup[groupId] = { classGoal: null, students: {} };
        if (!byGroup[groupId].students) byGroup[groupId].students = {};
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

    // ---------- Render ----------
    function esc(str) {
        const d = document.createElement('div');
        d.textContent = str == null ? '' : str;
        return d.innerHTML;
    }

    function renderClassGoal() {
        const cg = groupData().classGoal;
        if (cg && cg.text) {
            classGoalText.textContent = cg.text;
            classGoalCard.classList.toggle('is-done', !!cg.done);
            classGoalDoneBtn.style.display = '';
        } else {
            classGoalText.textContent = 'Nog geen klassendoel — klik om er samen één te bedenken.';
            classGoalCard.classList.remove('is-done');
            classGoalDoneBtn.style.display = 'none';
        }
    }

    function renderGrid() {
        const data = groupData().students;
        grid.innerHTML = '';

        if (!students.length) {
            emptyEl.style.display = '';
            statsEl.textContent = '';
            return;
        }
        emptyEl.style.display = 'none';

        let withGoal = 0, done = 0;
        students.forEach((s) => {
            const entry = data[s.id];
            const hasGoal = !!(entry && entry.doel);
            if (hasGoal) withGoal++;
            const isDone = hasGoal && entry.status === 'gelukt';
            if (isDone) done++;

            const card = document.createElement('button');
            card.type = 'button';
            card.className = 'db-card' + (hasGoal ? (isDone ? ' is-gelukt' : '') : ' no-goal');
            card.innerHTML =
                '<span class="db-card-name">' + esc(s.first_name) + '</span>' +
                '<span class="db-card-badge">' + (hasGoal ? (isDone ? '\u{1F389}' : '\u{1F4AA}') : '') + '</span>' +
                '<span class="db-card-goal">' + (hasGoal ? esc(entry.doel) : 'Nog geen doel — klik om er één te stellen.') + '</span>' +
                (hasGoal && entry.reflectie ? '<span class="db-card-reflect">' + esc(entry.reflectie) + '</span>' : '');
            card.addEventListener('click', () => openModal(s));
            grid.appendChild(card);
        });

        statsEl.textContent = withGoal + ' van ' + students.length + ' leerlingen heeft een doel' +
            (done ? ' · ' + done + ' gelukt \u{1F389}' : '');
    }

    function renderAll() {
        renderClassGoal();
        renderGrid();
    }

    // ---------- Modal: leerling-doel ----------
    function setModalStatus(status) {
        modalStatus = status;
        statusSeg.querySelectorAll('button').forEach((b) => {
            b.classList.toggle('active', b.dataset.status === status);
        });
    }

    function openModal(student) {
        editingStudentId = student.id;
        const entry = groupData().students[student.id] || {};
        modalTitle.textContent = 'Doel van ' + student.first_name;
        goalInput.value = entry.doel || '';
        reflectInput.value = entry.reflectie || '';
        setModalStatus(entry.status === 'gelukt' ? 'gelukt' : 'bezig');
        modal.classList.add('active');
        goalInput.focus();
    }

    function closeModal() {
        modal.classList.remove('active');
        editingStudentId = null;
    }

    async function saveModal() {
        if (!editingStudentId) return;
        const doel = goalInput.value.trim();
        const data = groupData().students;
        if (doel) {
            data[editingStudentId] = {
                doel,
                status: modalStatus,
                reflectie: reflectInput.value.trim(),
                updated: new Date().toISOString()
            };
        } else {
            delete data[editingStudentId];
        }
        closeModal();
        renderAll();
        await saveSettingsToDb();
    }

    async function deleteModalGoal() {
        if (!editingStudentId) return;
        delete groupData().students[editingStudentId];
        closeModal();
        renderAll();
        await saveSettingsToDb();
    }

    // ---------- Modal: klassendoel ----------
    function openClassModal() {
        const cg = groupData().classGoal;
        classGoalInput.value = (cg && cg.text) || '';
        classModal.classList.add('active');
        classGoalInput.focus();
    }

    function closeClassModal() {
        classModal.classList.remove('active');
    }

    async function saveClassModal() {
        const text = classGoalInput.value.trim();
        const gd = groupData();
        const wasDone = !!(gd.classGoal && gd.classGoal.done && gd.classGoal.text === text);
        gd.classGoal = text ? { text, done: wasDone } : null;
        closeClassModal();
        renderAll();
        await saveSettingsToDb();
    }

    async function deleteClassGoal() {
        groupData().classGoal = null;
        closeClassModal();
        renderAll();
        await saveSettingsToDb();
    }

    async function toggleClassGoalDone(e) {
        e.stopPropagation(); // niet ook de bewerk-modal openen
        const cg = groupData().classGoal;
        if (!cg || !cg.text) return;
        cg.done = !cg.done;
        renderAll();
        await saveSettingsToDb();
    }

    // ---------- Events ----------
    classGoalCard.addEventListener('click', openClassModal);
    classGoalDoneBtn.addEventListener('click', toggleClassGoalDone);

    document.getElementById('dbModalClose').addEventListener('click', closeModal);
    document.getElementById('dbModalSave').addEventListener('click', saveModal);
    document.getElementById('dbModalDelete').addEventListener('click', deleteModalGoal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    document.getElementById('dbClassModalClose').addEventListener('click', closeClassModal);
    document.getElementById('dbClassModalSave').addEventListener('click', saveClassModal);
    document.getElementById('dbClassModalDelete').addEventListener('click', deleteClassGoal);
    classModal.addEventListener('click', (e) => { if (e.target === classModal) closeClassModal(); });

    statusSeg.querySelectorAll('button').forEach((b) => {
        b.addEventListener('click', () => setModalStatus(b.dataset.status));
    });

    goalInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') saveModal(); });
    classGoalInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') saveClassModal(); });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { closeModal(); closeClassModal(); }
    });

    // ---------- Init + actieve klas ----------
    async function switchGroup(newId) {
        groupId = newId || '';
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

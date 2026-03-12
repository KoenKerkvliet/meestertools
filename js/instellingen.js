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
                                <label class="filter-toggle">
                                    <input type="checkbox" id="showArchivedGroups"> Toon gearchiveerd
                                </label>
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
        }
    }

    // ---------- PROFIEL LOGIC ----------
    async function loadProfielData() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const nameInput = overlayEl.querySelector('#profielNaam');
        const emailInput = overlayEl.querySelector('#profielEmail');

        nameInput.value = user.user_metadata?.full_name || '';
        emailInput.value = user.email || '';
    }

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

            // Update profiles table
            const { data: { user } } = await supabase.auth.getUser();
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ full_name: name })
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
            showMessage(msgEl, 'Fout: ' + err.message, 'error');
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
            .eq('user_id', user.id)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error loading groups:', error);
            return;
        }

        groups = data || [];

        // Load student counts
        const { data: studentData } = await supabase
            .from('students')
            .select('id, group_id, archived')
            .eq('user_id', user.id);

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

            return `
                <div class="groep-item${isActive ? ' active' : ''}${g.archived ? ' archived' : ''}" data-id="${g.id}">
                    <div class="groep-header" data-id="${g.id}">
                        <span class="groep-expand">&#9654;</span>
                        <span class="groep-name">${escapeHtml(g.name)}</span>
                        ${g.archived ? '<span class="badge badge-archived">Gearchiveerd</span>' : ''}
                        <span class="groep-count">${activeCount} leerling${activeCount !== 1 ? 'en' : ''}</span>
                        <div class="groep-actions">
                            <button class="btn-small btn-edit" onclick="event.stopPropagation();window._editGroup('${g.id}')">Bewerken</button>
                            ${g.archived
                                ? `<button class="btn-small btn-restore" onclick="event.stopPropagation();window._archiveGroup('${g.id}',false)">Herstellen</button>`
                                : `<button class="btn-small btn-archive" onclick="event.stopPropagation();window._archiveGroup('${g.id}',true)">Archiveren</button>`
                            }
                            <button class="btn-small btn-delete" onclick="event.stopPropagation();window._deleteGroup('${g.id}')">Verwijderen</button>
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
            </div>
            <div id="addStudentForm-${groupId}" style="display:none;margin-bottom:12px">
                <div class="inline-add-form">
                    <input type="text" id="studentFirstName-${groupId}" placeholder="Voornaam">
                    <input type="text" id="studentLastName-${groupId}" placeholder="Achternaam" style="max-width:140px">
                    <button class="btn-add-small" onclick="window._addStudent('${groupId}')">Toevoegen</button>
                </div>
                <div class="inline-form-error" id="addStudentForm-${groupId}Error"></div>
            </div>
        `;

        if (studentList.length === 0) {
            html += '<div class="leerlingen-empty">Nog geen leerlingen in deze groep.</div>';
        } else {
            html += '<div class="leerlingen-list">';
            studentList.forEach(s => {
                const fullName = s.last_name ? s.first_name + ' ' + s.last_name : s.first_name;
                html += `
                    <div class="leerling-item${s.archived ? ' archived' : ''}">
                        <span class="leerling-nummer">${s.student_number}</span>
                        <span class="leerling-naam">${escapeHtml(fullName)}</span>
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
            .eq('user_id', user.id)
            .order('student_number', { ascending: true });

        students[groupId] = data || [];
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

    window._addStudent = async function (groupId) {
        const firstNameInput = overlayEl.querySelector('#studentFirstName-' + groupId);
        const lastNameInput = overlayEl.querySelector('#studentLastName-' + groupId);
        const firstName = firstNameInput.value.trim();
        const lastName = lastNameInput.value.trim();
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

            // Auto-generate student number
            const allStudents = Object.values(students).flat();
            const maxNumber = allStudents.length > 0
                ? Math.max.apply(null, allStudents.map(function(s) { return s.student_number || 0; }))
                : 0;
            const studentNumber = maxNumber + 1;

            const { error } = await supabase
                .from('students')
                .insert({
                    first_name: firstName,
                    last_name: lastName,
                    student_number: studentNumber,
                    group_id: groupId,
                    user_id: user.id
                });

            if (error) {
                console.error('Error adding student:', error);
                showInlineError('addStudentForm-' + groupId, 'Fout bij toevoegen: ' + error.message);
                return;
            }

            firstNameInput.value = '';
            lastNameInput.value = '';
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
                <label for="editLastName">Achternaam</label>
                <input type="text" id="editLastName" value="${escapeHtml(student.last_name || '')}">
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
            const ln = overlayEl.querySelector('#editLastName').value.trim();
            if (!fn) return;

            await supabase.from('students').update({ first_name: fn, last_name: ln }).eq('id', studentId);
            modal.classList.remove('active');
            loadStudentsForGroup(groupId);
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

        const fullName = student.last_name ? student.first_name + ' ' + student.last_name : student.first_name;

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
    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

})();

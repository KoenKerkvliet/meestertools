/* ============================================
   MEESTERTOOLS - Admin Panel JavaScript
   Versie: v0.0.2
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // Only run on admin page
    if (!document.querySelector('.admin-content')) return;

    // ---------- State ----------
    let allSchools = [];
    let allUsers = [];
    let confirmCallback = null;

    // ---------- Tab Switching ----------
    const tabs = document.querySelectorAll('.admin-tab');
    const panels = document.querySelectorAll('.admin-tab-panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
        });
    });

    // ---------- Load Data ----------
    async function loadSchools() {
        const showArchived = document.getElementById('showArchivedSchools')?.checked;
        let query = supabase.from('schools').select('*').order('name');

        if (!showArchived) {
            query = query.eq('archived', false);
        }

        const { data, error } = await query;
        if (error) {
            console.error('Error loading schools:', error);
            return;
        }
        allSchools = data || [];
        renderSchools();
    }

    async function loadUsers() {
        const { data, error } = await supabase
            .from('profiles')
            .select('*, schools(name)')
            .order('full_name');

        if (error) {
            console.error('Error loading users:', error);
            return;
        }
        allUsers = data || [];
        renderUsers();
    }

    // ---------- Render Schools ----------
    function renderSchools() {
        const tbody = document.getElementById('schoolsTableBody');
        const search = document.getElementById('searchSchools')?.value?.toLowerCase() || '';

        const filtered = allSchools.filter(s =>
            s.name.toLowerCase().includes(search) ||
            (s.city || '').toLowerCase().includes(search) ||
            (s.address || '').toLowerCase().includes(search)
        );

        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr><td colspan="6">
                    <div class="admin-empty">
                        <span class="empty-icon">&#127979;</span>
                        <p>Geen scholen gevonden</p>
                    </div>
                </td></tr>`;
            return;
        }

        // Count users per school
        const userCounts = {};
        allUsers.forEach(u => {
            if (u.school_id) {
                userCounts[u.school_id] = (userCounts[u.school_id] || 0) + 1;
            }
        });

        tbody.innerHTML = filtered.map(school => `
            <tr>
                <td><strong>${escapeHtml(school.name)}</strong></td>
                <td>${escapeHtml(school.address || '-')}</td>
                <td>${escapeHtml(school.city || '-')}</td>
                <td>
                    <span class="badge ${school.archived ? 'badge-archived' : 'badge-active'}">
                        ${school.archived ? 'Gearchiveerd' : 'Actief'}
                    </span>
                </td>
                <td>${userCounts[school.id] || 0}</td>
                <td class="actions">
                    <button class="btn-small btn-edit" onclick="editSchool('${school.id}')">Bewerken</button>
                    ${school.archived
                        ? `<button class="btn-small btn-restore" onclick="restoreSchool('${school.id}')">Herstellen</button>`
                        : `<button class="btn-small btn-archive" onclick="archiveSchool('${school.id}')">Archiveren</button>`
                    }
                    <button class="btn-small btn-delete" onclick="deleteSchool('${school.id}', '${escapeHtml(school.name)}')">Verwijderen</button>
                </td>
            </tr>
        `).join('');
    }

    // ---------- Render Users ----------
    function renderUsers() {
        const tbody = document.getElementById('usersTableBody');
        const search = document.getElementById('searchUsers')?.value?.toLowerCase() || '';

        const filtered = allUsers.filter(u =>
            (u.full_name || '').toLowerCase().includes(search) ||
            (u.email || '').toLowerCase().includes(search)
        );

        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr><td colspan="5">
                    <div class="admin-empty">
                        <span class="empty-icon">&#128100;</span>
                        <p>Geen gebruikers gevonden</p>
                    </div>
                </td></tr>`;
            return;
        }

        tbody.innerHTML = filtered.map(user => {
            const roleBadge = user.role === 'super_admin'
                ? '<span class="badge badge-super">Super Admin</span>'
                : user.role === 'admin'
                    ? '<span class="badge badge-admin">Admin</span>'
                    : '<span class="badge badge-user">Gebruiker</span>';

            const schoolName = user.schools?.name
                ? escapeHtml(user.schools.name)
                : '<span class="no-school">Geen school</span>';

            return `
                <tr>
                    <td><strong>${escapeHtml(user.full_name || 'Onbekend')}</strong></td>
                    <td>${escapeHtml(user.email || '-')}</td>
                    <td>${roleBadge}</td>
                    <td>${schoolName}</td>
                    <td class="actions">
                        <button class="btn-small btn-edit" onclick="editUser('${user.id}')">Bewerken</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // ---------- School CRUD ----------

    // Add school button
    document.getElementById('addSchoolBtn')?.addEventListener('click', () => {
        document.getElementById('schoolModalTitle').textContent = 'School toevoegen';
        document.getElementById('schoolForm').reset();
        document.getElementById('schoolId').value = '';
        openModal('schoolModal');
    });

    // Save school
    document.getElementById('saveSchoolBtn')?.addEventListener('click', async () => {
        const id = document.getElementById('schoolId').value;
        const name = document.getElementById('schoolName').value.trim();
        const address = document.getElementById('schoolAddress').value.trim();
        const city = document.getElementById('schoolCity').value.trim();

        if (!name) {
            alert('Vul een schoolnaam in.');
            return;
        }

        const schoolData = { name, address: address || null, city: city || null };

        if (id) {
            // Update
            const { error } = await supabase.from('schools').update(schoolData).eq('id', id);
            if (error) {
                alert('Fout bij opslaan: ' + error.message);
                return;
            }
        } else {
            // Insert
            const { error } = await supabase.from('schools').insert(schoolData);
            if (error) {
                alert('Fout bij toevoegen: ' + error.message);
                return;
            }
        }

        closeModal('schoolModal');
        await loadSchools();
    });

    // Edit school (global function for onclick)
    window.editSchool = function(id) {
        const school = allSchools.find(s => s.id === id);
        if (!school) return;

        document.getElementById('schoolModalTitle').textContent = 'School bewerken';
        document.getElementById('schoolId').value = school.id;
        document.getElementById('schoolName').value = school.name;
        document.getElementById('schoolAddress').value = school.address || '';
        document.getElementById('schoolCity').value = school.city || '';
        openModal('schoolModal');
    };

    // Archive school
    window.archiveSchool = async function(id) {
        showConfirm('School archiveren', 'Weet je zeker dat je deze school wilt archiveren?', async () => {
            const { error } = await supabase.from('schools').update({ archived: true }).eq('id', id);
            if (error) {
                alert('Fout: ' + error.message);
                return;
            }
            await loadSchools();
        });
    };

    // Restore school
    window.restoreSchool = async function(id) {
        const { error } = await supabase.from('schools').update({ archived: false }).eq('id', id);
        if (error) {
            alert('Fout: ' + error.message);
            return;
        }
        await loadSchools();
    };

    // Delete school
    window.deleteSchool = function(id, name) {
        showConfirm('School verwijderen', `Weet je zeker dat je "${name}" permanent wilt verwijderen? Dit kan niet ongedaan worden gemaakt.`, async () => {
            const { error } = await supabase.from('schools').delete().eq('id', id);
            if (error) {
                alert('Fout bij verwijderen: ' + error.message);
                return;
            }
            await loadSchools();
            await loadUsers(); // Refresh users since school_id may be set to null
        });
    };

    // ---------- User Edit ----------

    window.editUser = async function(id) {
        const user = allUsers.find(u => u.id === id);
        if (!user) return;

        document.getElementById('userId').value = user.id;
        document.getElementById('userName').value = user.full_name || 'Onbekend';
        document.getElementById('userEmail').value = user.email || '-';
        document.getElementById('userRole').value = user.role;

        // Populate school dropdown
        const schoolSelect = document.getElementById('userSchool');
        schoolSelect.innerHTML = '<option value="">-- Geen school --</option>';

        // Load all schools (including non-archived for assignment)
        const { data: schools } = await supabase.from('schools').select('id, name').eq('archived', false).order('name');
        if (schools) {
            schools.forEach(s => {
                const opt = document.createElement('option');
                opt.value = s.id;
                opt.textContent = s.name;
                schoolSelect.appendChild(opt);
            });
        }

        schoolSelect.value = user.school_id || '';
        openModal('userModal');
    };

    // Save user
    document.getElementById('saveUserBtn')?.addEventListener('click', async () => {
        const id = document.getElementById('userId').value;
        const role = document.getElementById('userRole').value;
        const schoolId = document.getElementById('userSchool').value || null;

        const { error } = await supabase
            .from('profiles')
            .update({ role, school_id: schoolId })
            .eq('id', id);

        if (error) {
            alert('Fout bij opslaan: ' + error.message);
            return;
        }

        closeModal('userModal');
        await loadUsers();
    });

    // ---------- Search ----------
    document.getElementById('searchSchools')?.addEventListener('input', renderSchools);
    document.getElementById('searchUsers')?.addEventListener('input', renderUsers);
    document.getElementById('showArchivedSchools')?.addEventListener('change', loadSchools);

    // ---------- Confirm Modal ----------
    function showConfirm(title, message, callback) {
        document.getElementById('confirmTitle').textContent = title;
        document.getElementById('confirmMessage').textContent = message;
        confirmCallback = callback;
        openModal('confirmModal');
    }

    document.getElementById('confirmAction')?.addEventListener('click', async () => {
        if (confirmCallback) {
            await confirmCallback();
            confirmCallback = null;
        }
        closeModal('confirmModal');
    });

    // ---------- Modal Helpers ----------
    function openModal(id) {
        document.getElementById(id)?.classList.add('active');
    }

    function closeModal(id) {
        document.getElementById(id)?.classList.remove('active');
    }

    // Close buttons
    document.getElementById('closeSchoolModal')?.addEventListener('click', () => closeModal('schoolModal'));
    document.getElementById('cancelSchoolModal')?.addEventListener('click', () => closeModal('schoolModal'));
    document.getElementById('closeUserModal')?.addEventListener('click', () => closeModal('userModal'));
    document.getElementById('cancelUserModal')?.addEventListener('click', () => closeModal('userModal'));
    document.getElementById('closeConfirmModal')?.addEventListener('click', () => closeModal('confirmModal'));
    document.getElementById('cancelConfirm')?.addEventListener('click', () => closeModal('confirmModal'));

    // Close modal on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('active');
            }
        });
    });

    // Close modal on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
        }
    });

    // ---------- Utility ----------
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ---------- Initial Load ----------
    // Wait for auth check to complete, then load data
    const checkAuth = setInterval(async () => {
        if (window.userRole !== undefined) {
            clearInterval(checkAuth);
            if (window.userRole === 'super_admin') {
                await Promise.all([loadSchools(), loadUsers()]);
            }
        }
    }, 100);

    // Timeout after 5 seconds
    setTimeout(() => clearInterval(checkAuth), 5000);

});

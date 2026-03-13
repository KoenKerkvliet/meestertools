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

    // ---------- Sub-Tab Switching (Woorden Flitsen) ----------
    const subTabs = document.querySelectorAll('.words-sub-tab');
    const subPanels = document.querySelectorAll('.words-sub-panel');

    subTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            subTabs.forEach(t => t.classList.remove('active'));
            subPanels.forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById('subtab-' + tab.dataset.subtab).classList.add('active');
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

    // ---------- WOORDENLIJSTEN ----------
    const READING_LEVELS = ['E3', 'M4', 'E4', 'M5', 'E5', 'M6', 'E6', 'M7', 'E7', 'Plus'];
    let allWords = [];
    let allDifficulties = [];
    let activeLevel = READING_LEVELS[0];
    let levelCounts = {};

    function renderLevelTabs() {
        const container = document.getElementById('levelTabs');
        if (!container) return;
        container.innerHTML = '';
        READING_LEVELS.forEach(level => {
            const btn = document.createElement('button');
            btn.className = 'words-level-tab' + (level === activeLevel ? ' active' : '');
            const count = levelCounts[level] || 0;
            btn.innerHTML = escapeHtml(level) + ' <span class="word-count">' + count + '</span>';
            btn.addEventListener('click', () => {
                activeLevel = level;
                renderLevelTabs();
                renderDifficultiesList();
                renderWordsList();
                updateDifficultyDropdowns();
            });
            container.appendChild(btn);
        });
    }

    // ---------- Difficulties ----------
    async function loadAllDifficulties() {
        try {
            const { data, error } = await supabase
                .from('flash_difficulties')
                .select('*')
                .order('name');

            if (error) {
                console.error('Error loading difficulties:', error);
                allDifficulties = [];
                return;
            }
            allDifficulties = data || [];
        } catch (e) {
            console.error('Exception loading difficulties:', e);
            allDifficulties = [];
        }
    }

    function getDifficultiesForLevel(level) {
        return allDifficulties.filter(d => d.levels && d.levels.indexOf(level) !== -1);
    }

    function getDifficultyName(id) {
        const d = allDifficulties.find(d => d.id === id);
        return d ? d.name : '';
    }

    function renderDifficultiesList() {
        const container = document.getElementById('difficultiesList');
        if (!container) return;

        if (allDifficulties.length === 0) {
            container.innerHTML = `
                <div class="admin-empty" style="width:100%;">
                    <span class="empty-icon">&#128203;</span>
                    <p>Nog geen moeilijkheden. Voeg er een toe!</p>
                </div>`;
            return;
        }

        container.innerHTML = '';
        allDifficulties.forEach(d => {
            const chip = document.createElement('div');
            chip.className = 'word-chip';

            const text = document.createElement('span');
            text.textContent = d.name;
            chip.appendChild(text);

            // Show level badges
            if (d.levels && d.levels.length > 0) {
                const badgesWrap = document.createElement('span');
                badgesWrap.className = 'word-levels-badges';
                d.levels.forEach(lvl => {
                    const badge = document.createElement('span');
                    badge.className = 'word-level-badge';
                    badge.textContent = lvl;
                    badgesWrap.appendChild(badge);
                });
                chip.appendChild(badgesWrap);
            }

            const actions = document.createElement('div');
            actions.className = 'word-chip-actions';

            const editBtn = document.createElement('button');
            editBtn.className = 'word-chip-btn edit';
            editBtn.innerHTML = '&#9998;';
            editBtn.title = 'Bewerken';
            editBtn.addEventListener('click', () => openEditDifficultyModal(d.id, d.name, d.levels || []));
            actions.appendChild(editBtn);

            const delBtn = document.createElement('button');
            delBtn.className = 'word-chip-btn delete';
            delBtn.innerHTML = '&times;';
            delBtn.title = 'Verwijderen';
            delBtn.addEventListener('click', () => deleteDifficulty(d.id));
            actions.appendChild(delBtn);

            chip.appendChild(actions);
            container.appendChild(chip);
        });
    }

    function updateDifficultyDropdowns() {
        const difficulties = getDifficultiesForLevel(activeLevel);
        const selects = [
            document.getElementById('newWordDifficulty'),
            document.getElementById('editWordDifficulty')
        ];
        selects.forEach(select => {
            if (!select) return;
            const currentVal = select.value;
            select.innerHTML = '<option value="">Geen moeilijkheid</option>';
            difficulties.forEach(d => {
                const opt = document.createElement('option');
                opt.value = d.id;
                opt.textContent = d.name;
                select.appendChild(opt);
            });
            select.value = currentVal;
        });
    }

    // Render level checkboxes for a container
    function renderLevelCheckboxes(containerId, selectedLevels) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';
        READING_LEVELS.forEach(level => {
            const label = document.createElement('label');
            label.className = 'diff-level-check' + (selectedLevels.indexOf(level) !== -1 ? ' checked' : '');

            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.value = level;
            cb.checked = selectedLevels.indexOf(level) !== -1;
            cb.addEventListener('change', () => {
                label.classList.toggle('checked', cb.checked);
            });

            label.appendChild(cb);
            label.appendChild(document.createTextNode(level));
            container.appendChild(label);
        });
    }

    function getCheckedLevels(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return [];
        const checked = [];
        container.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
            checked.push(cb.value);
        });
        return checked;
    }

    // Init new difficulty level checkboxes
    renderLevelCheckboxes('newDifficultyLevels', []);

    // Add difficulty
    const addDifficultyBtn = document.getElementById('addDifficultyBtn');
    const newDifficultyInput = document.getElementById('newDifficultyInput');

    if (addDifficultyBtn && newDifficultyInput) {
        addDifficultyBtn.addEventListener('click', addDifficulty);
        newDifficultyInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') addDifficulty();
        });
    }

    async function addDifficulty() {
        const name = newDifficultyInput.value.trim();
        if (!name) return;

        const levels = getCheckedLevels('newDifficultyLevels');
        if (levels.length === 0) {
            alert('Selecteer minimaal één leesniveau.');
            return;
        }

        const { error } = await supabase
            .from('flash_difficulties')
            .insert({ levels: levels, name: name });

        if (error) {
            alert('Fout bij toevoegen: ' + error.message);
            return;
        }

        newDifficultyInput.value = '';
        renderLevelCheckboxes('newDifficultyLevels', []);
        newDifficultyInput.focus();
        await loadAllDifficulties();
        renderDifficultiesList();
        updateDifficultyDropdowns();
    }

    async function deleteDifficulty(id) {
        showConfirm('Moeilijkheid verwijderen', 'Weet je zeker dat je deze moeilijkheid wilt verwijderen? Woorden die hieraan gekoppeld zijn behouden hun niveau maar verliezen de moeilijkheid.', async () => {
            const { error } = await supabase
                .from('flash_difficulties')
                .delete()
                .eq('id', id);

            if (error) {
                alert('Fout bij verwijderen: ' + error.message);
                return;
            }

            await loadAllDifficulties();
            renderDifficultiesList();
            updateDifficultyDropdowns();
            await loadAllWords(); // refresh words since difficulty_id may be nulled
        });
    }

    function openEditDifficultyModal(id, name, levels) {
        document.getElementById('editDifficultyId').value = id;
        document.getElementById('editDifficultyInput').value = name;
        renderLevelCheckboxes('editDifficultyLevels', levels || []);
        openModal('difficultyEditModal');
        setTimeout(() => document.getElementById('editDifficultyInput').focus(), 100);
    }

    document.getElementById('saveDifficultyBtn')?.addEventListener('click', async () => {
        const id = document.getElementById('editDifficultyId').value;
        const name = document.getElementById('editDifficultyInput').value.trim();
        const levels = getCheckedLevels('editDifficultyLevels');

        if (!name) {
            alert('Vul een naam in.');
            return;
        }

        if (levels.length === 0) {
            alert('Selecteer minimaal één leesniveau.');
            return;
        }

        const { error } = await supabase
            .from('flash_difficulties')
            .update({ name: name, levels: levels })
            .eq('id', id);

        if (error) {
            alert('Fout bij opslaan: ' + error.message);
            return;
        }

        closeModal('difficultyEditModal');
        await loadAllDifficulties();
        renderDifficultiesList();
        updateDifficultyDropdowns();
        renderWordsList(); // refresh difficulty badges on words
    });

    document.getElementById('closeDifficultyEditModal')?.addEventListener('click', () => closeModal('difficultyEditModal'));
    document.getElementById('cancelDifficultyEditModal')?.addEventListener('click', () => closeModal('difficultyEditModal'));

    document.getElementById('editDifficultyInput')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') document.getElementById('saveDifficultyBtn').click();
    });

    // ---------- Words ----------
    async function loadAllWords() {
        try {
            const { data, error } = await supabase
                .from('flash_words')
                .select('*')
                .order('word');

            if (error) {
                console.error('Error loading words:', error);
                allWords = [];
            } else {
                allWords = data || [];
            }
        } catch (e) {
            console.error('Exception loading words:', e);
            allWords = [];
        }

        levelCounts = {};
        allWords.forEach(w => {
            levelCounts[w.level] = (levelCounts[w.level] || 0) + 1;
        });

        renderLevelTabs();
        renderWordsList();
    }

    function renderWordsList() {
        const container = document.getElementById('wordsList');
        if (!container) return;

        const words = allWords.filter(w => w.level === activeLevel);

        if (words.length === 0) {
            container.innerHTML = `
                <div class="admin-empty" style="width:100%;">
                    <span class="empty-icon">&#128218;</span>
                    <p>Nog geen woorden voor ${escapeHtml(activeLevel)}. Voeg er een toe!</p>
                </div>`;
            return;
        }

        container.innerHTML = '';
        words.forEach(w => {
            const chip = document.createElement('div');
            chip.className = 'word-chip';

            const text = document.createElement('span');
            text.textContent = w.word;
            chip.appendChild(text);

            // Show difficulty badge if set
            if (w.difficulty_id) {
                const diffName = getDifficultyName(w.difficulty_id);
                if (diffName) {
                    const badge = document.createElement('span');
                    badge.className = 'word-difficulty-badge';
                    badge.textContent = diffName;
                    chip.appendChild(badge);
                }
            }

            const actions = document.createElement('div');
            actions.className = 'word-chip-actions';

            const editBtn = document.createElement('button');
            editBtn.className = 'word-chip-btn edit';
            editBtn.innerHTML = '&#9998;';
            editBtn.title = 'Bewerken';
            editBtn.addEventListener('click', () => openEditWordModal(w.id, w.word, w.difficulty_id));
            actions.appendChild(editBtn);

            const delBtn = document.createElement('button');
            delBtn.className = 'word-chip-btn delete';
            delBtn.innerHTML = '&times;';
            delBtn.title = 'Verwijderen';
            delBtn.addEventListener('click', () => deleteWord(w.id));
            actions.appendChild(delBtn);

            chip.appendChild(actions);
            container.appendChild(chip);
        });
    }

    const addWordBtn = document.getElementById('addWordBtn');
    const newWordInput = document.getElementById('newWordInput');

    if (addWordBtn && newWordInput) {
        addWordBtn.addEventListener('click', addWord);
        newWordInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') addWord();
        });
    }

    async function addWord() {
        const raw = newWordInput.value.trim();
        if (!raw) return;

        const difficultyId = document.getElementById('newWordDifficulty')?.value || null;

        // Split by comma, trim each, filter empty
        const words = raw.split(',').map(w => w.trim()).filter(w => w.length > 0);
        if (words.length === 0) return;

        const rows = words.map(w => {
            const row = { level: activeLevel, word: w };
            if (difficultyId) row.difficulty_id = difficultyId;
            return row;
        });

        const { error } = await supabase
            .from('flash_words')
            .insert(rows);

        if (error) {
            alert('Fout bij toevoegen: ' + error.message);
            return;
        }

        newWordInput.value = '';
        newWordInput.focus();
        await loadAllWords();
    }

    async function deleteWord(id) {
        const { error } = await supabase
            .from('flash_words')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Fout bij verwijderen: ' + error.message);
            return;
        }

        await loadAllWords();
    }

    function openEditWordModal(id, word, difficultyId) {
        document.getElementById('editWordId').value = id;
        document.getElementById('editWordInput').value = word;

        // Update edit difficulty dropdown for current level
        const editSelect = document.getElementById('editWordDifficulty');
        const difficulties = getDifficultiesForLevel(activeLevel);
        editSelect.innerHTML = '<option value="">Geen moeilijkheid</option>';
        difficulties.forEach(d => {
            const opt = document.createElement('option');
            opt.value = d.id;
            opt.textContent = d.name;
            editSelect.appendChild(opt);
        });
        editSelect.value = difficultyId || '';

        openModal('wordModal');
        setTimeout(() => document.getElementById('editWordInput').focus(), 100);
    }

    document.getElementById('saveWordBtn')?.addEventListener('click', async () => {
        const id = document.getElementById('editWordId').value;
        const word = document.getElementById('editWordInput').value.trim();
        const difficultyId = document.getElementById('editWordDifficulty')?.value || null;

        if (!word) {
            alert('Vul een woord in.');
            return;
        }

        const { error } = await supabase
            .from('flash_words')
            .update({ word: word, difficulty_id: difficultyId })
            .eq('id', id);

        if (error) {
            alert('Fout bij opslaan: ' + error.message);
            return;
        }

        closeModal('wordModal');
        await loadAllWords();
    });

    document.getElementById('closeWordModal')?.addEventListener('click', () => closeModal('wordModal'));
    document.getElementById('cancelWordModal')?.addEventListener('click', () => closeModal('wordModal'));

    document.getElementById('editWordInput')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') document.getElementById('saveWordBtn').click();
    });

    // ---------- Initial Load ----------
    // Wait for auth check to complete, then load data
    const checkAuth = setInterval(async () => {
        if (window.userRole !== undefined) {
            clearInterval(checkAuth);
            if (window.userRole === 'super_admin') {
                try {
                    await Promise.all([loadSchools(), loadUsers(), loadAllDifficulties(), loadAllWords()]);
                } catch (e) {
                    console.error('Error during initial load:', e);
                }
                // Always render after all data is loaded
                renderDifficultiesList();
                updateDifficultyDropdowns();
            }
        }
    }, 100);

    // Timeout after 5 seconds
    setTimeout(() => clearInterval(checkAuth), 5000);

});

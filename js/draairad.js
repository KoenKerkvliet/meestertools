/* ============================================
   DRAAIRAD - JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {
    var TOOL_NAME = 'draairad';

    // ---------- Colour palette (12 colours) ----------
    var COLORS = [
        '#6C63FF', '#FF6B6B', '#4ECB71', '#FFB84D',
        '#45B7D1', '#F78FB3', '#7C5CFC', '#2ED8A3',
        '#FF8A5C', '#A78BFA', '#38BDF8', '#FB923C'
    ];

    // ---------- Default data ----------
    var defaultData = {
        groups: [
            {
                id: Date.now(),
                title: 'Voorbeeld',
                items: ['Optie 1', 'Optie 2', 'Optie 3', 'Optie 4']
            }
        ],
        activeGroupId: null
    };

    // ---------- State ----------
    var settings = null;
    var currentAngle = 0;
    var isSpinning = false;
    var lastPickedItem = null;

    // ---------- Elements ----------
    var canvas = document.getElementById('wheelCanvas');
    var ctx = canvas.getContext('2d');
    var wheelWrapper = document.getElementById('wheelWrapper');
    var groupBar = document.getElementById('groupBar');
    var resultText = document.getElementById('resultText');
    var btnSettings = document.getElementById('btnSettings');
    var settingsModal = document.getElementById('settingsModal');
    var btnCloseSettings = document.getElementById('btnCloseSettings');
    var btnSaveSettings = document.getElementById('btnSaveSettings');
    var settingsBody = document.getElementById('settingsBody');

    // ---------- Supabase helpers ----------
    function getSessionUser() {
        return supabase.auth.getSession().then(function (res) {
            var session = res.data.session;
            return session ? session.user : null;
        });
    }

    function loadSettings() {
        return getSessionUser().then(function (user) {
            if (!user) {
                applyDefaults();
                return;
            }
            return supabase
                .from('tool_settings')
                .select('settings')
                .eq('user_id', user.id)
                .eq('tool_name', TOOL_NAME)
                .single()
                .then(function (res) {
                    if (res.data && res.data.settings && res.data.settings.groups && res.data.settings.groups.length > 0) {
                        settings = res.data.settings;
                        // Make sure activeGroupId is valid
                        var ids = settings.groups.map(function (g) { return g.id; });
                        if (ids.indexOf(settings.activeGroupId) === -1) {
                            settings.activeGroupId = ids[0];
                        }
                    } else {
                        applyDefaults();
                    }
                    renderGroupBar();
                    drawWheel();
                });
        });
    }

    function applyDefaults() {
        settings = JSON.parse(JSON.stringify(defaultData));
        settings.activeGroupId = settings.groups[0].id;
    }

    function saveSettingsToDb() {
        return getSessionUser().then(function (user) {
            if (!user) return;
            return supabase
                .from('tool_settings')
                .upsert({
                    user_id: user.id,
                    tool_name: TOOL_NAME,
                    settings: settings,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id,tool_name' });
        });
    }

    // ---------- Active group helper ----------
    function getActiveGroup() {
        if (!settings) return null;
        for (var i = 0; i < settings.groups.length; i++) {
            if (settings.groups[i].id === settings.activeGroupId) return settings.groups[i];
        }
        return settings.groups[0] || null;
    }

    // ---------- Group bar ----------
    function renderGroupBar() {
        groupBar.innerHTML = '';
        if (!settings || settings.groups.length <= 1) {
            groupBar.style.display = 'none';
            return;
        }
        groupBar.style.display = 'flex';
        settings.groups.forEach(function (g) {
            var pill = document.createElement('button');
            pill.className = 'draairad-group-pill' + (g.id === settings.activeGroupId ? ' active' : '');
            pill.textContent = g.title;
            pill.setAttribute('data-gid', g.id);
            pill.addEventListener('click', function () {
                if (isSpinning) return;
                settings.activeGroupId = g.id;
                lastPickedItem = null;
                resultText.textContent = '';
                renderGroupBar();
                drawWheel();
                saveSettingsToDb();
            });
            groupBar.appendChild(pill);
        });
    }

    // ---------- Draw wheel ----------
    function drawWheel() {
        var group = getActiveGroup();
        var items = group ? group.items : [];
        var size = canvas.width;
        var center = size / 2;
        var radius = center - 4;

        ctx.clearRect(0, 0, size, size);

        if (items.length === 0) {
            ctx.fillStyle = '#E2E2EE';
            ctx.beginPath();
            ctx.arc(center, center, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#999';
            ctx.font = '20px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Geen items', center, center);
            return;
        }

        var sliceAngle = (Math.PI * 2) / items.length;

        // Font size scales with number of items
        var fontSize = items.length <= 4 ? 20 : items.length <= 8 ? 16 : 13;

        items.forEach(function (item, i) {
            var startAngle = currentAngle + i * sliceAngle;
            var endAngle = startAngle + sliceAngle;

            // Draw slice
            ctx.beginPath();
            ctx.moveTo(center, center);
            ctx.arc(center, center, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = COLORS[i % COLORS.length];
            ctx.fill();

            // Draw border
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw text
            ctx.save();
            ctx.translate(center, center);
            ctx.rotate(startAngle + sliceAngle / 2);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold ' + fontSize + 'px sans-serif';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            // Truncate long text
            var displayText = item.length > 18 ? item.substring(0, 16) + '..' : item;
            ctx.fillText(displayText, radius - 16, 0);
            ctx.restore();
        });

        // Center circle
        ctx.beginPath();
        ctx.arc(center, center, 18, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.strokeStyle = '#E2E2EE';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    // ---------- Spin animation ----------
    function spinWheel() {
        if (isSpinning) return;
        var group = getActiveGroup();
        if (!group || group.items.length < 2) return;

        isSpinning = true;
        wheelWrapper.classList.add('spinning');
        resultText.textContent = '';
        resultText.classList.remove('pop');

        var items = group.items;
        var sliceAngle = (Math.PI * 2) / items.length;

        // Pick winner (not same as last)
        var winnerIndex;
        var maxTries = 50;
        do {
            winnerIndex = Math.floor(Math.random() * items.length);
            maxTries--;
        } while (items[winnerIndex] === lastPickedItem && maxTries > 0 && items.length > 1);

        // Calculate target angle
        // The pointer is at the top (270 degrees / -PI/2 / 3PI/2)
        // We need the winner slice to be under the pointer
        var fullRotations = 4 + Math.floor(Math.random() * 4); // 4-7 full rotations
        var sliceCenter = winnerIndex * sliceAngle + sliceAngle / 2;
        // Pointer is at top = -PI/2 (or 3PI/2). We need sliceCenter to align with top.
        // targetAngle such that: targetAngle + sliceCenter = ... aligns with -PI/2 mod 2PI
        var targetAngle = -sliceCenter - Math.PI / 2 + fullRotations * Math.PI * 2;
        // Add small random offset within slice to look natural
        var randomOffset = (Math.random() - 0.5) * sliceAngle * 0.6;
        targetAngle += randomOffset;

        // Make sure we always spin forward
        if (targetAngle <= currentAngle) {
            targetAngle += Math.PI * 2 * 4;
        }

        var startAngle = currentAngle;
        var totalDelta = targetAngle - startAngle;
        var duration = 3500;
        var startTime = null;

        function animate(timestamp) {
            if (!startTime) startTime = timestamp;
            var elapsed = timestamp - startTime;
            var progress = Math.min(elapsed / duration, 1);

            // Cubic ease-out
            var eased = 1 - Math.pow(1 - progress, 3);

            currentAngle = startAngle + totalDelta * eased;
            drawWheel();

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Normalize angle
                currentAngle = currentAngle % (Math.PI * 2);
                isSpinning = false;
                wheelWrapper.classList.remove('spinning');

                // Show result
                var winner = items[winnerIndex];
                lastPickedItem = winner;
                resultText.textContent = winner;
                resultText.classList.add('pop');
            }
        }

        requestAnimationFrame(animate);
    }

    // ---------- Wheel click / keyboard ----------
    wheelWrapper.addEventListener('click', function () {
        spinWheel();
    });

    document.addEventListener('keydown', function (e) {
        if (e.code === 'Space' && !settingsModal.classList.contains('active')) {
            e.preventDefault();
            spinWheel();
        }
    });

    // ---------- Settings modal ----------
    btnSettings.addEventListener('click', function () {
        renderSettingsModal();
        settingsModal.classList.add('active');
    });

    btnCloseSettings.addEventListener('click', closeModal);

    settingsModal.addEventListener('click', function (e) {
        if (e.target === settingsModal) closeModal();
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && settingsModal.classList.contains('active')) {
            closeModal();
        }
    });

    function closeModal() {
        settingsModal.classList.remove('active');
    }

    // ---------- Render settings modal ----------
    function renderSettingsModal() {
        var html = '<div class="settings-groups-list">';

        settings.groups.forEach(function (g, gi) {
            html += '<div class="settings-group-card" data-gindex="' + gi + '">';
            html += '<div class="settings-group-header">';
            html += '<input type="text" class="sg-title" value="' + escapeAttr(g.title) + '" placeholder="Naam onderwerp">';
            html += '<button class="settings-group-delete" data-gindex="' + gi + '" title="Verwijder onderwerp">&times;</button>';
            html += '</div>';

            // Items as chips
            html += '<div class="settings-items-wrap">';
            g.items.forEach(function (item, ii) {
                html += '<span class="settings-item-chip">' + escapeHtml(item);
                html += '<button class="chip-remove" data-gindex="' + gi + '" data-iindex="' + ii + '">&times;</button>';
                html += '</span>';
            });
            html += '</div>';

            // Add item row
            html += '<div class="settings-add-item-row">';
            html += '<input type="text" class="sg-new-item" data-gindex="' + gi + '" placeholder="Nieuw item...">';
            html += '<button class="sg-add-item-btn" data-gindex="' + gi + '">+ Toevoegen</button>';
            html += '</div>';

            html += '</div>';
        });

        html += '</div>';
        html += '<button class="settings-add-group-btn" id="btnAddGroup">+ Nieuw onderwerp</button>';

        settingsBody.innerHTML = html;

        // ---------- Event delegation ----------

        // Delete group
        settingsBody.querySelectorAll('.settings-group-delete').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var gi = parseInt(this.getAttribute('data-gindex'));
                if (settings.groups.length <= 1) return; // keep at least 1
                settings.groups.splice(gi, 1);
                // Fix activeGroupId
                var ids = settings.groups.map(function (g) { return g.id; });
                if (ids.indexOf(settings.activeGroupId) === -1) {
                    settings.activeGroupId = ids[0];
                }
                renderSettingsModal();
            });
        });

        // Remove item chip
        settingsBody.querySelectorAll('.chip-remove').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var gi = parseInt(this.getAttribute('data-gindex'));
                var ii = parseInt(this.getAttribute('data-iindex'));
                settings.groups[gi].items.splice(ii, 1);
                renderSettingsModal();
            });
        });

        // Add item
        settingsBody.querySelectorAll('.sg-add-item-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var gi = parseInt(this.getAttribute('data-gindex'));
                addItemFromInput(gi);
            });
        });

        // Enter key on new item input
        settingsBody.querySelectorAll('.sg-new-item').forEach(function (input) {
            input.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') {
                    var gi = parseInt(this.getAttribute('data-gindex'));
                    addItemFromInput(gi);
                }
            });
        });

        // Add group
        document.getElementById('btnAddGroup').addEventListener('click', function () {
            // Read titles from inputs first
            syncTitlesFromInputs();
            settings.groups.push({
                id: Date.now(),
                title: 'Nieuw onderwerp',
                items: []
            });
            renderSettingsModal();
            // Focus the new group's title input
            var cards = settingsBody.querySelectorAll('.settings-group-card');
            var lastCard = cards[cards.length - 1];
            if (lastCard) {
                var titleInput = lastCard.querySelector('.sg-title');
                if (titleInput) {
                    titleInput.focus();
                    titleInput.select();
                }
            }
        });
    }

    function addItemFromInput(gi) {
        var input = settingsBody.querySelector('.sg-new-item[data-gindex="' + gi + '"]');
        var val = input.value.trim();
        if (!val) return;
        // Sync titles first
        syncTitlesFromInputs();
        settings.groups[gi].items.push(val);
        renderSettingsModal();
        // Focus the input again
        var newInput = settingsBody.querySelector('.sg-new-item[data-gindex="' + gi + '"]');
        if (newInput) newInput.focus();
    }

    function syncTitlesFromInputs() {
        var titleInputs = settingsBody.querySelectorAll('.sg-title');
        titleInputs.forEach(function (input, i) {
            if (settings.groups[i]) {
                settings.groups[i].title = input.value.trim() || 'Onderwerp';
            }
        });
    }

    // Save button
    btnSaveSettings.addEventListener('click', function () {
        syncTitlesFromInputs();

        // Validate: at least one group with at least one item
        var valid = false;
        settings.groups.forEach(function (g) {
            if (g.items.length > 0) valid = true;
        });
        if (!valid) {
            alert('Voeg minstens 1 item toe aan een onderwerp.');
            return;
        }

        // Fix activeGroupId if needed
        var ids = settings.groups.map(function (g) { return g.id; });
        if (ids.indexOf(settings.activeGroupId) === -1) {
            settings.activeGroupId = ids[0];
        }

        saveSettingsToDb().then(function () {
            lastPickedItem = null;
            resultText.textContent = '';
            renderGroupBar();
            drawWheel();
            closeModal();
        });
    });

    // ---------- Helpers ----------
    function escapeHtml(str) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    function escapeAttr(str) {
        return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // ---------- Init ----------
    loadSettings();
});

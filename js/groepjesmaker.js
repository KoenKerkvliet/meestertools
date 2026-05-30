/* ============================================
   GROEPJESMAKER - JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    const TOOL_NAME = 'groepjesmaker';

    // Elements
    const container = document.getElementById('groepjesContainer');
    const btnSettings = document.getElementById('btnSettings');
    const settingsModal = document.getElementById('settingsModal');
    const btnCloseSettings = document.getElementById('btnCloseSettings');
    const btnSaveSettings = document.getElementById('btnSaveSettings');
    const selectGroup = document.getElementById('selectGroup');
    const splitCountSelect = document.getElementById('splitCount');
    const splitCountLabel = document.getElementById('splitCountLabel');
    const useSociogramCheckbox = document.getElementById('useSociogramCheckbox');
    const sociogramWarning = document.getElementById('sociogramWarning');
    const sociogramHint = document.getElementById('sociogramHint');
    const sociogramModeGroup = document.getElementById('sociogramModeGroup');

    // State
    let selectedGroupId = null;
    let splitMethod = 'numGroups';
    let splitCount = 2;
    let useSociogram = false;
    let sociogramMode = 'samen'; // 'samen' = vrienden bij elkaar | 'mix' = vrienden uit elkaar
    let groups = [];
    let students = [];          // [{id, first_name, last_name}, ...]
    let sociogramConstraints = null; // { mutualNegativeIds: Set<'a:b'>, mutualPositiveIds: Set<'a:b'>, sessionInfo: {...} } | null
    let isShuffling = false;

    // ---------- Supabase Settings ----------
    async function getSessionUser() {
        const { data: { session } } = await supabase.auth.getSession();
        return session?.user || null;
    }

    async function loadSettings() {
        const user = await getSessionUser();
        if (!user) return;

        // Load tool settings
        const { data } = await supabase
            .from('tool_settings')
            .select('settings')
            .eq('user_id', user.id)
            .eq('tool_name', TOOL_NAME)
            .single();

        if (data && data.settings) {
            if (data.settings.selectedGroupId) selectedGroupId = data.settings.selectedGroupId;
            if (data.settings.splitMethod) splitMethod = data.settings.splitMethod;
            if (data.settings.splitCount) splitCount = data.settings.splitCount;
            if (data.settings.useSociogram) useSociogram = data.settings.useSociogram;
            if (data.settings.sociogramMode) sociogramMode = data.settings.sociogramMode;
        }

        // Load user's groups
        await loadGroups(user.id);

        // Load students for selected group
        await loadStudents(user.id);

        // Probeer sociogram constraints te laden
        await loadSociogramConstraints();

        render();
    }

    async function loadGroups(userId) {
        const { data } = await supabase
            .from('groups')
            .select('id, name')
            .eq('user_id', userId)
            .eq('archived', false)
            .order('created_at', { ascending: true });

        groups = data || [];

        if (window.MTActiveClass) {
            selectedGroupId = window.MTActiveClass.resolveDefault(selectedGroupId, groups);
        }

        // If selected group not in list, auto-select first
        if (groups.length > 0 && !groups.find(g => g.id === selectedGroupId)) {
            selectedGroupId = groups[0].id;
        }
    }

    async function loadStudents(userId) {
        if (!selectedGroupId) {
            students = [];
            return;
        }

        const { data } = await supabase
            .from('students')
            .select('id, first_name, last_name')
            .eq('group_id', selectedGroupId)
            .eq('user_id', userId)
            .eq('archived', false)
            .order('student_number', { ascending: true });

        students = data || [];
    }

    function studentLabel(s) {
        if (!s) return '';
        return s.last_name ? s.first_name + ' ' + s.last_name : s.first_name;
    }

    /**
     * Haal het meest recente sociogram op voor de huidige groep en bouw
     * mutual-negative + mutual-positive sets voor constraint-aware verdelen.
     */
    async function loadSociogramConstraints() {
        sociogramConstraints = null;
        if (!selectedGroupId) return;

        // Pak de meest recente sessie van deze groep (ongeacht type)
        const { data: sessions } = await supabase
            .from('sociogram_sessions')
            .select('id, type, afname_datum, titel')
            .eq('group_id', selectedGroupId)
            .order('afname_datum', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(1);

        if (!sessions || sessions.length === 0) return;
        const session = sessions[0];

        const { data: picks } = await supabase
            .from('sociogram_picks')
            .select('from_student_id, to_student_id, pick_type')
            .eq('session_id', session.id);

        if (!picks) return;

        // Bouw lookup sets
        const posPairs = new Set(); // 'a:b' = a kiest b positief
        const negPairs = new Set();
        picks.forEach(function (p) {
            const key = p.from_student_id + ':' + p.to_student_id;
            if (p.pick_type === 'positief') posPairs.add(key);
            else negPairs.add(key);
        });

        // Mutual = beide kanten dezelfde keuze. Sla canonical 'min:max' op zodat we makkelijk kunnen lookup.
        const mutualNeg = new Set();
        const oneWayNeg = new Set();
        const mutualPos = new Set();
        negPairs.forEach(function (key) {
            const parts = key.split(':');
            const reverse = parts[1] + ':' + parts[0];
            const sorted = parts[0] < parts[1] ? parts[0] + ':' + parts[1] : parts[1] + ':' + parts[0];
            if (negPairs.has(reverse)) {
                mutualNeg.add(sorted);
            } else {
                oneWayNeg.add(sorted);
            }
        });
        posPairs.forEach(function (key) {
            const parts = key.split(':');
            const reverse = parts[1] + ':' + parts[0];
            if (posPairs.has(reverse)) {
                const sorted = parts[0] < parts[1] ? parts[0] + ':' + parts[1] : parts[1] + ':' + parts[0];
                mutualPos.add(sorted);
            }
        });

        sociogramConstraints = {
            mutualNeg: mutualNeg,
            oneWayNeg: oneWayNeg,
            mutualPos: mutualPos,
            session: session,
        };
    }

    async function saveSettingsToDb() {
        const user = await getSessionUser();
        if (!user) return;

        if (window.MTActiveClass && selectedGroupId) window.MTActiveClass.setId(selectedGroupId);

        await supabase
            .from('tool_settings')
            .upsert({
                user_id: user.id,
                tool_name: TOOL_NAME,
                settings: { selectedGroupId, splitMethod, splitCount, useSociogram, sociogramMode },
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id,tool_name' });
    }

    // ---------- Render ----------
    function render() {
        if (groups.length === 0) {
            container.innerHTML = [
                '<div class="groepjesmaker-empty">',
                '    <span class="empty-icon">&#128101;</span>',
                '    <p>Je hebt nog geen groepen met leerlingen.<br>',
                '    Voeg eerst leerlingen toe via Instellingen.</p>',
                '    <button class="btn-open-settings" id="btnGoToKlas">Ga naar Mijn klas</button>',
                '</div>'
            ].join('\n');
            bindGoToKlas();
            return;
        }

        if (students.length === 0) {
            container.innerHTML = [
                '<div class="groepjesmaker-empty">',
                '    <span class="empty-icon">&#128101;</span>',
                '    <p>Deze groep heeft nog geen leerlingen.<br>',
                '    Voeg leerlingen toe via Instellingen of kies een andere groep.</p>',
                '    <button class="btn-open-settings" id="btnGoToKlas">Ga naar Mijn klas</button>',
                '</div>'
            ].join('\n');
            bindGoToKlas();
            return;
        }

        container.innerHTML = [
            '<button class="tool-action-btn groepjes-shuffle-btn" id="btnShuffle">&#128256; Verdeel in groepjes</button>',
            '<div class="groepjes-result" id="groepjesResult"></div>'
        ].join('\n');

        document.getElementById('btnShuffle').addEventListener('click', shuffleGroups);
    }

    function bindGoToKlas() {
        const btn = document.getElementById('btnGoToKlas');
        if (btn) {
            btn.addEventListener('click', () => {
                if (typeof openInstellingen === 'function') openInstellingen('mijnklas');
            });
        }
    }

    // ---------- Shuffle Logic ----------
    function shuffleArray(arr) {
        const shuffled = arr.slice();
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = shuffled[i];
            shuffled[i] = shuffled[j];
            shuffled[j] = temp;
        }
        return shuffled;
    }

    function divideIntoGroups(studs, method, count) {
        const shuffled = shuffleArray(studs);
        const result = [];

        if (method === 'numGroups') {
            var numGroups = Math.min(count, shuffled.length);
            for (var i = 0; i < numGroups; i++) {
                result.push([]);
            }
            shuffled.forEach(function (s, idx) {
                result[idx % numGroups].push(s);
            });
        } else {
            var perGroup = count;
            for (var i = 0; i < shuffled.length; i += perGroup) {
                result.push(shuffled.slice(i, i + perGroup));
            }
        }

        return result;
    }

    /**
     * Weighted cost van een groepsindeling.
     *   wederzijds negatief in zelfde groep = +1000 (hard violation, moet vermeden)
     *   eenzijdig  negatief in zelfde groep = +10   (soft violation, liefst vermeden)
     *   wederzijds positief in zelfde groep = -1    (bonus, lagere cost is beter)
     *
     * Lager = beter.
     */
    function calculateCost(grouping) {
        if (!sociogramConstraints) return 0;
        var cost = 0;
        for (var g = 0; g < grouping.length; g++) {
            var group = grouping[g];
            for (var i = 0; i < group.length; i++) {
                for (var j = i + 1; j < group.length; j++) {
                    var a = group[i].id, b = group[j].id;
                    var key = a < b ? a + ':' + b : b + ':' + a;
                    if (sociogramConstraints.mutualNeg.has(key)) cost += 1000;
                    else if (sociogramConstraints.oneWayNeg.has(key)) cost += 10;
                    if (sociogramConstraints.mutualPos.has(key)) {
                        // 'samen': vrienden bij elkaar belonen (lagere cost).
                        // 'mix': vrienden in zelfde groep juist bestraffen, zodat ze
                        // over verschillende groepjes verdeeld worden.
                        cost += (sociogramMode === 'mix') ? 8 : -1;
                    }
                }
            }
        }
        return cost;
    }

    /**
     * Tel violations per type voor reporting.
     */
    function countStats(grouping) {
        var stats = { mutualNeg: 0, oneWayNeg: 0, mutualPos: 0 };
        if (!sociogramConstraints) return stats;
        for (var g = 0; g < grouping.length; g++) {
            var group = grouping[g];
            for (var i = 0; i < group.length; i++) {
                for (var j = i + 1; j < group.length; j++) {
                    var a = group[i].id, b = group[j].id;
                    var key = a < b ? a + ':' + b : b + ':' + a;
                    if (sociogramConstraints.mutualNeg.has(key)) stats.mutualNeg++;
                    else if (sociogramConstraints.oneWayNeg.has(key)) stats.oneWayNeg++;
                    if (sociogramConstraints.mutualPos.has(key)) stats.mutualPos++;
                }
            }
        }
        return stats;
    }

    /**
     * Probeer een groepsindeling te vinden met minimale cost.
     * Strategie: meerdere random verdelingen, elk repairen via swaps, beste behouden.
     */
    function divideIntoGroupsWithSociogram(studs, method, count) {
        var bestGrouping = null;
        var bestCost = Infinity;
        var bestStats = null;

        var maxAttempts = 30;
        for (var attempt = 0; attempt < maxAttempts; attempt++) {
            var grouping = divideIntoGroups(studs, method, count);
            grouping = repairGrouping(grouping);
            var cost = calculateCost(grouping);

            if (cost < bestCost) {
                bestGrouping = grouping;
                bestCost = cost;
                bestStats = countStats(grouping);
                if (bestStats.mutualNeg === 0 && bestStats.oneWayNeg === 0 && attempt >= 5) break;
            }
        }
        return { grouping: bestGrouping, stats: bestStats };
    }

    /**
     * Probeer swaps die de totale cost verlagen.
     * Hill-climbing: voor elke swap, check of het de cost verlaagt. Zo ja, hou hem.
     */
    function repairGrouping(grouping) {
        if (!sociogramConstraints) return grouping;
        var maxIterations = 100;
        for (var iter = 0; iter < maxIterations; iter++) {
            var beforeCost = calculateCost(grouping);
            var improved = false;

            // Probeer elke swap tussen verschillende groepen
            outer:
            for (var g1 = 0; g1 < grouping.length; g1++) {
                for (var i = 0; i < grouping[g1].length; i++) {
                    for (var g2 = g1 + 1; g2 < grouping.length; g2++) {
                        for (var j = 0; j < grouping[g2].length; j++) {
                            // Swap
                            var temp = grouping[g1][i];
                            grouping[g1][i] = grouping[g2][j];
                            grouping[g2][j] = temp;

                            var newCost = calculateCost(grouping);
                            if (newCost < beforeCost) {
                                // Verbetering, hou de swap
                                improved = true;
                                break outer;
                            } else {
                                // Revert
                                temp = grouping[g1][i];
                                grouping[g1][i] = grouping[g2][j];
                                grouping[g2][j] = temp;
                            }
                        }
                    }
                }
            }

            if (!improved) break;
        }
        return grouping;
    }

    async function shuffleGroups() {
        if (isShuffling) return;
        isShuffling = true;

        var btn = document.getElementById('btnShuffle');
        var resultEl = document.getElementById('groepjesResult');
        btn.disabled = true;

        // Clear previous result
        resultEl.innerHTML = '';

        // Visual feedback
        btn.innerHTML = '&#128256; Bezig met verdelen...';

        // Small delay for effect
        await new Promise(function (resolve) { setTimeout(resolve, 400); });

        // Calculate groups — gebruik sociogram-aware variant als ingeschakeld
        var grouping, stats = null, usedSociogram = false;
        if (useSociogram && sociogramConstraints) {
            var r = divideIntoGroupsWithSociogram(students, splitMethod, splitCount);
            grouping = r.grouping;
            stats = r.stats;
            usedSociogram = true;
        } else {
            grouping = divideIntoGroups(students, splitMethod, splitCount);
        }

        // Subtiel info-icoon (rechtsboven) i.p.v. prominente banner
        var infoIconHtml = '';
        if (usedSociogram) {
            var sessionLabel = sociogramConstraints.session.titel ||
                (sociogramConstraints.session.type === 'werken' ? 'Samen werken' : 'Samen spelen');

            // Bouw tooltip text (multi-line via \n in data-tooltip)
            var tooltipLines = ['Sociogram toegepast: ' + sessionLabel];
            if (sociogramMode === 'mix') {
                var totalPos = sociogramConstraints.mutualPos.size;
                var separated = totalPos - stats.mutualPos;
                tooltipLines.push('✓ ' + separated + ' van ' + totalPos + ' vriendenpaar' + (totalPos === 1 ? '' : 'paren') + ' uit elkaar gehaald');
            } else {
                tooltipLines.push('✓ ' + stats.mutualPos + ' wederzijds positieve band' + (stats.mutualPos === 1 ? '' : 'en') + ' samen geplaatst');
            }
            if (stats.mutualNeg === 0) {
                tooltipLines.push('✓ 0 wederzijds-negatieve paren in zelfde groep');
            } else {
                tooltipLines.push('⚠ ' + stats.mutualNeg + ' wederzijds-negatief paar' + (stats.mutualNeg === 1 ? '' : 'paren') + ' kon niet vermeden worden');
            }
            if (stats.oneWayNeg === 0) {
                tooltipLines.push('✓ 0 eenzijdig-negatieve paren in zelfde groep');
            } else {
                tooltipLines.push('⚠ ' + stats.oneWayNeg + ' eenzijdig-negatief paar' + (stats.oneWayNeg === 1 ? '' : ' paren') + ' in zelfde groep (kon niet anders)');
            }

            var tooltipText = tooltipLines.join('\n');
            infoIconHtml = '<div class="groepjes-info-wrap">' +
                '<span class="groepjes-info-icon" tabindex="0" data-tooltip="' + escapeHtml(tooltipText) + '" aria-label="Sociogram informatie">i</span>' +
            '</div>';
        }

        // Render groups with staggered animation
        var html = infoIconHtml;
        for (var i = 0; i < grouping.length; i++) {
            var group = grouping[i];
            var delay = i * 80;
            html += '<div class="groepje-card" style="animation-delay: ' + delay + 'ms">';
            html += '<div class="groepje-header">Groepje ' + (i + 1);
            html += '<span class="groepje-count">' + group.length + ' leerling' + (group.length !== 1 ? 'en' : '') + '</span>';
            html += '</div>';
            html += '<div class="groepje-body">';
            for (var j = 0; j < group.length; j++) {
                html += '<div class="student-name">' + escapeHtml(studentLabel(group[j])) + '</div>';
            }
            html += '</div></div>';
        }
        resultEl.innerHTML = html;

        btn.innerHTML = '&#128256; Opnieuw verdelen';
        btn.disabled = false;
        isShuffling = false;
    }

    // ---------- Settings Modal ----------
    function populateSettings() {
        // Populate group dropdown
        var options = '';
        for (var i = 0; i < groups.length; i++) {
            var g = groups[i];
            var selected = g.id === selectedGroupId ? ' selected' : '';
            options += '<option value="' + g.id + '"' + selected + '>' + escapeHtml(g.name) + '</option>';
        }

        if (groups.length === 0) {
            selectGroup.innerHTML = '<option value="">Geen groepen beschikbaar</option>';
        } else {
            selectGroup.innerHTML = options;
        }

        // Set split method radio
        var radios = document.querySelectorAll('input[name="splitMethod"]');
        for (var i = 0; i < radios.length; i++) {
            radios[i].checked = radios[i].value === splitMethod;
        }

        updateSplitLabel();
        splitCountSelect.value = splitCount;

        // Sociogram checkbox + warning + modus
        useSociogramCheckbox.checked = useSociogram;
        var modeRadios = document.querySelectorAll('input[name="sociogramMode"]');
        for (var m = 0; m < modeRadios.length; m++) {
            modeRadios[m].checked = modeRadios[m].value === sociogramMode;
        }
        updateSociogramHint();
    }

    function updateSociogramHint() {
        if (sociogramConstraints) {
            sociogramWarning.style.display = 'none';
            sociogramHint.style.display = 'block';
        } else {
            sociogramWarning.style.display = 'block';
            sociogramHint.style.display = 'none';
        }
        // Modus-keuze alleen tonen als er een sociogram is én de optie aan staat.
        if (sociogramModeGroup) {
            sociogramModeGroup.style.display =
                (sociogramConstraints && useSociogramCheckbox.checked) ? 'block' : 'none';
        }
    }

    function updateSplitLabel() {
        if (splitMethod === 'numGroups') {
            splitCountLabel.textContent = 'Aantal groepjes';
        } else {
            splitCountLabel.textContent = 'Leerlingen per groepje';
        }
    }

    btnSettings.addEventListener('click', function () {
        populateSettings();
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

    // Radio change
    var radios = document.querySelectorAll('input[name="splitMethod"]');
    for (var i = 0; i < radios.length; i++) {
        radios[i].addEventListener('change', function (e) {
            splitMethod = e.target.value;
            updateSplitLabel();
        });
    }

    // Sociogram-checkbox aan/uit → modus-keuze tonen of verbergen
    useSociogramCheckbox.addEventListener('change', updateSociogramHint);

    // Group dropdown change → reload sociogram preview voor de gekozen groep
    selectGroup.addEventListener('change', async function () {
        var pendingGroupId = selectGroup.value;
        if (!pendingGroupId) return;
        // Tijdelijk constraint laden voor preview, zonder permanent te switchen
        var previousGroupId = selectedGroupId;
        selectedGroupId = pendingGroupId;
        await loadSociogramConstraints();
        updateSociogramHint();
        selectedGroupId = previousGroupId; // pas op save echt switchen
    });

    function closeModal() {
        settingsModal.classList.remove('active');
    }

    btnSaveSettings.addEventListener('click', async function () {
        var newGroupId = selectGroup.value;
        var checkedRadio = document.querySelector('input[name="splitMethod"]:checked');
        var newSplitMethod = checkedRadio ? checkedRadio.value : 'numGroups';
        var newSplitCount = parseInt(splitCountSelect.value) || 2;

        var checkedMode = document.querySelector('input[name="sociogramMode"]:checked');
        splitMethod = newSplitMethod;
        splitCount = newSplitCount;
        useSociogram = useSociogramCheckbox.checked;
        sociogramMode = checkedMode ? checkedMode.value : 'samen';

        if (newGroupId !== selectedGroupId) {
            selectedGroupId = newGroupId;
            var user = await getSessionUser();
            if (user) await loadStudents(user.id);
            await loadSociogramConstraints();
            updateSociogramHint();
        }

        await saveSettingsToDb();
        closeModal();
        render();
    });

    // ---------- Utility ----------
    function escapeHtml(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ---------- Init ----------
    loadSettings();
});

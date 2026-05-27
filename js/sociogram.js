/* ============================================
   MEESTERTOOLS - Sociogram
   Versie: v0.0.2
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    // ---------- DOM ----------
    var states = {
        welcome: document.getElementById('sgState-welcome'),
        setup: document.getElementById('sgState-setup'),
        entry: document.getElementById('sgState-entry'),
        results: document.getElementById('sgState-results'),
    };

    var pastListEl = document.getElementById('sgPastList');
    var btnNew = document.getElementById('sgBtnNew');

    // Setup
    var groupSelect = document.getElementById('sgGroupSelect');
    var groupHint = document.getElementById('sgGroupHint');
    var dateInput = document.getElementById('sgDate');
    var titelInput = document.getElementById('sgTitel');
    var setupError = document.getElementById('sgSetupError');
    var btnSetupCancel = document.getElementById('sgBtnSetupCancel');
    var btnSetupNext = document.getElementById('sgBtnSetupNext');

    // Entry
    var entryCards = document.getElementById('sgEntryCards');
    var entryGroupName = document.getElementById('sgEntryGroupName');
    var entryMeta = document.getElementById('sgEntryMeta');
    var entryProgress = document.getElementById('sgEntryProgress');
    var entryError = document.getElementById('sgEntryError');
    var btnEntryCancel = document.getElementById('sgBtnEntryCancel');
    var btnEntryCancel2 = document.getElementById('sgBtnEntryCancel2');
    var btnEntrySave = document.getElementById('sgBtnEntrySave');
    var btnEntrySave2 = document.getElementById('sgBtnEntrySave2');

    // Results
    var resultsTitle = document.getElementById('sgResultsTitle');
    var resultsMeta = document.getElementById('sgResultsMeta');
    var btnResultsBack = document.getElementById('sgBtnResultsBack');
    var btnResultsDelete = document.getElementById('sgBtnResultsDelete');
    var tabBtns = document.querySelectorAll('.sg-tab');

    // ---------- State ----------
    var groups = [];
    var students = [];
    var currentSession = null; // {id, group_id, type, afname_datum, titel}
    var currentPicks = {};     // { from_id: { positief: [to_id, to_id, to_id], negatief: [...] } }

    // ---------- Helpers ----------
    function showState(state) {
        Object.keys(states).forEach(function (s) {
            states[s].classList.toggle('hidden', s !== state);
        });
        // Scroll naar boven bij state change
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function studentName(student) {
        if (!student) return '?';
        var first = student.first_name || '';
        var last = student.last_name || '';
        return (first + ' ' + last).trim() || '?';
    }

    function typeLabel(type) {
        return type === 'werken' ? 'Samen werken' : type === 'spelen' ? 'Samen spelen' : type;
    }

    function formatDate(isoDate) {
        if (!isoDate) return '';
        var d = new Date(isoDate);
        var maand = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
        return d.getDate() + ' ' + maand[d.getMonth()] + ' ' + d.getFullYear();
    }

    function showError(el, msg) {
        el.textContent = msg;
        el.style.display = 'block';
        setTimeout(function () { el.style.display = 'none'; }, 5000);
    }

    // ---------- Data loaders ----------
    async function loadGroups() {
        var { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];
        var { data, error } = await supabase
            .from('groups')
            .select('id, name')
            .eq('user_id', user.id)
            .eq('archived', false)
            .order('name');
        if (error) {
            console.error('loadGroups error', error);
            return [];
        }
        return data || [];
    }

    async function loadStudents(groupId) {
        var { data, error } = await supabase
            .from('students')
            .select('id, first_name, last_name, student_number')
            .eq('group_id', groupId)
            .eq('archived', false)
            .order('first_name');
        if (error) {
            console.error('loadStudents error', error);
            return [];
        }
        return data || [];
    }

    async function loadPastSessions() {
        var { data, error } = await supabase
            .from('sociogram_sessions')
            .select('id, group_id, type, afname_datum, titel, created_at, groups(name)')
            .order('afname_datum', { ascending: false });
        if (error) {
            console.error('loadPastSessions error', error);
            return [];
        }
        return data || [];
    }

    async function loadSession(sessionId) {
        var { data, error } = await supabase
            .from('sociogram_sessions')
            .select('id, group_id, type, afname_datum, titel, groups(name)')
            .eq('id', sessionId)
            .single();
        if (error) {
            console.error('loadSession error', error);
            return null;
        }
        return data;
    }

    async function loadPicks(sessionId) {
        var { data, error } = await supabase
            .from('sociogram_picks')
            .select('from_student_id, to_student_id, pick_type, rank')
            .eq('session_id', sessionId);
        if (error) {
            console.error('loadPicks error', error);
            return [];
        }
        return data || [];
    }

    // ---------- WELCOME state ----------
    async function renderWelcome() {
        showState('welcome');
        var sessions = await loadPastSessions();
        if (!sessions.length) {
            pastListEl.innerHTML = '<p class="sg-empty-msg">Nog geen sociogrammen afgenomen. Klik op "Nieuw sociogram maken" om te beginnen.</p>';
            return;
        }
        pastListEl.innerHTML = '';
        sessions.forEach(function (s) {
            var card = document.createElement('div');
            card.className = 'sg-past-card';
            card.innerHTML =
                '<div class="sg-past-main">' +
                    '<div class="sg-past-icon">' + (s.type === 'werken' ? '&#128218;' : '&#9917;') + '</div>' +
                    '<div class="sg-past-text">' +
                        '<strong>' + (s.titel ? escapeHtml(s.titel) : typeLabel(s.type) + ' - ' + escapeHtml(s.groups?.name || 'Onbekend')) + '</strong>' +
                        '<small>' + typeLabel(s.type) + ' &middot; ' + escapeHtml(s.groups?.name || '?') + ' &middot; ' + formatDate(s.afname_datum) + '</small>' +
                    '</div>' +
                '</div>' +
                '<button class="btn-secondary" data-session-id="' + s.id + '">Bekijken &rarr;</button>';
            pastListEl.appendChild(card);
            card.querySelector('button').addEventListener('click', function () {
                openExistingResults(s.id);
            });
        });
    }

    function escapeHtml(s) {
        return String(s || '').replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    // ---------- SETUP state ----------
    async function renderSetup() {
        currentSession = null;
        currentPicks = {};
        students = [];
        groups = await loadGroups();
        groupSelect.innerHTML = '<option value="">Kies een klas...</option>';
        if (!groups.length) {
            groupHint.style.display = 'block';
            btnSetupNext.disabled = true;
        } else {
            groupHint.style.display = 'none';
            btnSetupNext.disabled = false;
            groups.forEach(function (g) {
                var opt = document.createElement('option');
                opt.value = g.id;
                opt.textContent = g.name;
                groupSelect.appendChild(opt);
            });
        }
        // Defaults
        dateInput.value = new Date().toISOString().slice(0, 10);
        titelInput.value = '';
        document.querySelectorAll('input[name="sgType"]').forEach(function (r) { r.checked = false; });
        showState('setup');
    }

    btnNew.addEventListener('click', renderSetup);
    btnSetupCancel.addEventListener('click', renderWelcome);

    btnSetupNext.addEventListener('click', async function () {
        var groupId = groupSelect.value;
        var type = (document.querySelector('input[name="sgType"]:checked') || {}).value;
        var datum = dateInput.value;
        var titel = titelInput.value.trim();

        if (!groupId) return showError(setupError, 'Kies eerst een klas.');
        if (!type) return showError(setupError, 'Kies "Samen werken" of "Samen spelen".');
        if (!datum) return showError(setupError, 'Vul een afnamedatum in.');

        students = await loadStudents(groupId);
        if (students.length < 4) {
            return showError(setupError, 'Deze klas heeft minder dan 4 leerlingen. Voeg eerst meer leerlingen toe via Beheer.');
        }

        // Maak session aan in DB
        var { data: { user } } = await supabase.auth.getUser();
        var { data, error } = await supabase
            .from('sociogram_sessions')
            .insert({
                user_id: user.id,
                group_id: groupId,
                type: type,
                afname_datum: datum,
                titel: titel || null,
            })
            .select()
            .single();
        if (error) {
            console.error('insert session error', error);
            return showError(setupError, 'Sessie kon niet aangemaakt worden: ' + error.message);
        }
        currentSession = Object.assign({}, data, {
            groups: { name: groups.find(function (g) { return g.id === groupId; })?.name || '' }
        });
        initEmptyPicks();
        renderEntry();
    });

    function initEmptyPicks() {
        currentPicks = {};
        students.forEach(function (s) {
            currentPicks[s.id] = { positief: ['', '', ''], negatief: ['', '', ''] };
        });
    }

    // ---------- ENTRY state ----------
    function renderEntry() {
        entryGroupName.textContent = currentSession.groups.name;
        entryMeta.textContent = typeLabel(currentSession.type) + ' · ' + formatDate(currentSession.afname_datum);
        updateProgress();

        entryCards.innerHTML = '';
        students.forEach(function (student) {
            var card = buildStudentCard(student);
            entryCards.appendChild(card);
        });

        showState('entry');
    }

    function buildStudentCard(student) {
        var card = document.createElement('div');
        card.className = 'sg-entry-card';
        card.dataset.studentId = student.id;

        var others = students.filter(function (s) { return s.id !== student.id; });

        card.innerHTML =
            '<div class="sg-entry-card-header">' +
                '<h3>' + escapeHtml(studentName(student)) + '</h3>' +
                '<span class="sg-entry-card-status" data-status="empty">leeg</span>' +
            '</div>' +
            '<div class="sg-entry-card-body">' +
                '<div class="sg-pick-col sg-pick-pos">' +
                    '<h4>&plus; Positief (3 keuzes)</h4>' +
                    buildSelectsHtml('positief', others) +
                '</div>' +
                '<div class="sg-pick-col sg-pick-neg">' +
                    '<h4>&minus; Negatief (3 keuzes)</h4>' +
                    buildSelectsHtml('negatief', others) +
                '</div>' +
            '</div>';

        // Wire up change handlers
        card.querySelectorAll('select').forEach(function (sel) {
            sel.addEventListener('change', function () {
                var type = sel.dataset.type;
                var rank = parseInt(sel.dataset.rank);
                currentPicks[student.id][type][rank - 1] = sel.value;
                updateStudentStatus(card, student.id);
                updateProgress();
                validateCardConsistency(card, student.id);
            });
        });

        return card;
    }

    function buildSelectsHtml(type, others) {
        var html = '';
        for (var rank = 1; rank <= 3; rank++) {
            html += '<select data-type="' + type + '" data-rank="' + rank + '">';
            html += '<option value="">— keuze ' + rank + ' —</option>';
            others.forEach(function (s) {
                html += '<option value="' + s.id + '">' + escapeHtml(studentName(s)) + '</option>';
            });
            html += '</select>';
        }
        return html;
    }

    function updateStudentStatus(card, studentId) {
        var picks = currentPicks[studentId];
        var posCount = picks.positief.filter(function (v) { return !!v; }).length;
        var negCount = picks.negatief.filter(function (v) { return !!v; }).length;
        var statusEl = card.querySelector('.sg-entry-card-status');
        if (posCount === 0 && negCount === 0) {
            statusEl.textContent = 'leeg';
            statusEl.dataset.status = 'empty';
        } else if (posCount === 3 && negCount === 3) {
            statusEl.textContent = 'compleet';
            statusEl.dataset.status = 'complete';
        } else {
            statusEl.textContent = posCount + '/3 + · ' + negCount + '/3 -';
            statusEl.dataset.status = 'partial';
        }
    }

    function validateCardConsistency(card, studentId) {
        var picks = currentPicks[studentId];
        var allErrors = [];

        // Check: niet zelfde naam 2x binnen positief OF negatief
        ['positief', 'negatief'].forEach(function (type) {
            var values = picks[type].filter(function (v) { return !!v; });
            var unique = new Set(values);
            if (unique.size !== values.length) {
                allErrors.push('Dubbele naam binnen ' + type);
            }
        });

        // Check: zelfde naam mag niet in positief EN negatief
        var posSet = new Set(picks.positief.filter(function (v) { return !!v; }));
        picks.negatief.filter(function (v) { return !!v; }).forEach(function (v) {
            if (posSet.has(v)) {
                allErrors.push('Naam komt voor in zowel positief als negatief');
            }
        });

        var existingMsg = card.querySelector('.sg-card-error');
        if (existingMsg) existingMsg.remove();
        if (allErrors.length) {
            var msg = document.createElement('div');
            msg.className = 'sg-card-error';
            msg.textContent = allErrors.join(' · ');
            card.appendChild(msg);
            card.classList.add('has-error');
        } else {
            card.classList.remove('has-error');
        }
    }

    function updateProgress() {
        var total = students.length;
        var complete = 0;
        students.forEach(function (s) {
            var picks = currentPicks[s.id];
            var pos = picks.positief.filter(function (v) { return !!v; }).length;
            var neg = picks.negatief.filter(function (v) { return !!v; }).length;
            if (pos === 3 && neg === 3) complete++;
        });
        entryProgress.textContent = complete + ' / ' + total + ' compleet';
    }

    btnEntryCancel.addEventListener('click', cancelEntry);
    btnEntryCancel2.addEventListener('click', cancelEntry);
    btnEntrySave.addEventListener('click', saveEntry);
    btnEntrySave2.addEventListener('click', saveEntry);

    async function cancelEntry() {
        if (!confirm('Sessie annuleren? De aangemaakte sessie wordt verwijderd, alle ingevoerde keuzes gaan verloren.')) return;
        if (currentSession?.id) {
            await supabase.from('sociogram_sessions').delete().eq('id', currentSession.id);
        }
        renderWelcome();
    }

    async function saveEntry() {
        // Valideer alle cards
        var anyError = false;
        document.querySelectorAll('.sg-entry-card').forEach(function (card) {
            if (card.classList.contains('has-error')) anyError = true;
        });
        if (anyError) {
            return showError(entryError, 'Er staan nog fouten in een of meer kaarten. Controleer en pas aan.');
        }

        // Bouw pick rows. Mag niet helemaal leeg zijn.
        var rows = [];
        var anyPicks = false;
        Object.keys(currentPicks).forEach(function (fromId) {
            var p = currentPicks[fromId];
            ['positief', 'negatief'].forEach(function (type) {
                p[type].forEach(function (toId, idx) {
                    if (toId) {
                        rows.push({
                            session_id: currentSession.id,
                            from_student_id: fromId,
                            to_student_id: toId,
                            pick_type: type,
                            rank: idx + 1,
                        });
                        anyPicks = true;
                    }
                });
            });
        });

        if (!anyPicks) {
            return showError(entryError, 'Voer eerst keuzes in voor ten minste één leerling.');
        }

        var { error } = await supabase.from('sociogram_picks').insert(rows);
        if (error) {
            console.error('insert picks error', error);
            return showError(entryError, 'Opslaan mislukt: ' + error.message);
        }

        await openExistingResults(currentSession.id);
    }

    // ---------- RESULTS state ----------
    async function openExistingResults(sessionId) {
        var session = await loadSession(sessionId);
        if (!session) {
            alert('Sessie kon niet geladen worden.');
            return;
        }
        currentSession = session;
        students = await loadStudents(session.group_id);
        var picks = await loadPicks(sessionId);
        renderResults(picks);
    }

    function renderResults(picks) {
        resultsTitle.textContent = currentSession.titel || (typeLabel(currentSession.type) + ' - ' + (currentSession.groups?.name || ''));
        resultsMeta.textContent = typeLabel(currentSession.type) + ' · ' + (currentSession.groups?.name || '') + ' · ' + formatDate(currentSession.afname_datum);

        // Compute stats
        var statsByStudent = {};
        students.forEach(function (s) {
            statsByStudent[s.id] = {
                student: s,
                receivedPos: [],
                receivedNeg: [],
                givenPos: [],
                givenNeg: [],
            };
        });

        picks.forEach(function (p) {
            var statTarget = statsByStudent[p.to_student_id];
            var statSource = statsByStudent[p.from_student_id];
            if (!statTarget || !statSource) return;
            if (p.pick_type === 'positief') {
                statTarget.receivedPos.push(p.from_student_id);
                statSource.givenPos.push(p.to_student_id);
            } else {
                statTarget.receivedNeg.push(p.from_student_id);
                statSource.givenNeg.push(p.to_student_id);
            }
        });

        // --- Tab 1: Overzicht ---
        renderOverzicht(statsByStudent);

        // --- Tab 2: Wederzijds positief ---
        renderWederzijds(picks);

        // --- Tab 3: Conflicten ---
        renderConflicten(picks);

        // --- Tab 4: Aandachtspunten ---
        renderAandacht(statsByStudent);

        // --- Tab 5: Plaatsing ---
        renderPlaatsing(picks);

        // Reset tab to first
        tabBtns.forEach(function (b) { b.classList.toggle('active', b.dataset.tab === 'overzicht'); });
        document.querySelectorAll('.sg-tab-content').forEach(function (c) {
            c.classList.toggle('active', c.id === 'sgTab-overzicht');
        });

        showState('results');
    }

    // ---------- PLAATSING (seating suggestions) ----------
    // Cache picks zodat regenereer-knop opnieuw kan matchen
    var currentPicksData = null;

    function renderPlaatsing(picks) {
        currentPicksData = picks;
        var container = document.getElementById('sgTab-plaatsing');
        container.innerHTML =
            '<div class="sg-plaatsing-toolbar">' +
                '<p class="sg-tab-intro">Automatisch voorgestelde duo-plaatsing op basis van de sociogram-data. Wederzijds negatief = nooit samen. Wederzijds positief = bij voorkeur samen.</p>' +
                '<button class="btn-secondary" id="sgBtnRegenerate">&#8635; Regenereer</button>' +
            '</div>' +
            '<div id="sgPlaatsingResult"></div>';

        document.getElementById('sgBtnRegenerate').addEventListener('click', function () {
            buildAndRenderPairs(currentPicksData);
        });

        buildAndRenderPairs(picks);
    }

    function buildAndRenderPairs(picks) {
        var result = generatePairs(picks, students);
        var resultEl = document.getElementById('sgPlaatsingResult');

        var html = '';

        // Group pairs by quality (perfect / compatible / suboptimal)
        var perfect = result.pairs.filter(function (p) { return p.quality === 'perfect'; });
        var positive = result.pairs.filter(function (p) { return p.quality === 'positive'; });
        var neutral = result.pairs.filter(function (p) { return p.quality === 'neutral'; });
        var suboptimal = result.pairs.filter(function (p) { return p.quality === 'suboptimal'; });

        html += '<div class="sg-pl-summary">' +
            '<div class="sg-pl-stat sg-pl-stat-perfect"><strong>' + perfect.length + '</strong><span>wederzijds positief</span></div>' +
            '<div class="sg-pl-stat sg-pl-stat-positive"><strong>' + positive.length + '</strong><span>eenzijdig positief</span></div>' +
            '<div class="sg-pl-stat sg-pl-stat-neutral"><strong>' + neutral.length + '</strong><span>neutraal</span></div>' +
            '<div class="sg-pl-stat sg-pl-stat-suboptimal"><strong>' + suboptimal.length + '</strong><span>niet ideaal</span></div>' +
        '</div>';

        if (result.violations.length > 0) {
            html += '<div class="sg-pl-warning">' +
                '<strong>&#9888;&#65039; Let op:</strong> de algorithm kon niet alle harde restricties vermijden. ' +
                'De volgende koppels zijn wederzijds negatief en zouden niet samen moeten zitten:<br>' +
                result.violations.map(function (v) {
                    return '<span>' + escapeHtml(studentName(v.a)) + ' &harr; ' + escapeHtml(studentName(v.b)) + '</span>';
                }).join(', ') +
            '</div>';
        }

        html += '<div class="sg-pl-grid">';
        result.pairs.forEach(function (pair, idx) {
            var qualityIcon = {
                perfect: '&#129309;', // 🤝
                positive: '&#128077;', // 👍
                neutral: '&#9898;',     // ⚪
                suboptimal: '&#9888;&#65039;', // ⚠️
            }[pair.quality];
            var qualityLabel = {
                perfect: 'Wederzijds positief',
                positive: 'Eenzijdig positief',
                neutral: 'Geen voorkeur',
                suboptimal: 'Niet ideaal — eenzijdig negatief',
            }[pair.quality];

            html += '<div class="sg-pl-pair sg-pl-' + pair.quality + '">' +
                '<div class="sg-pl-pair-number">Duo ' + (idx + 1) + '</div>' +
                '<div class="sg-pl-pair-body">' +
                    '<div class="sg-pl-pair-names">' +
                        '<strong>' + escapeHtml(studentName(pair.a)) + '</strong>' +
                        '<span class="sg-pl-pair-link">&harr;</span>' +
                        '<strong>' + escapeHtml(studentName(pair.b)) + '</strong>' +
                    '</div>' +
                    '<div class="sg-pl-pair-meta">' +
                        '<span class="sg-pl-quality">' + qualityIcon + ' ' + qualityLabel + '</span>' +
                    '</div>' +
                '</div>' +
            '</div>';
        });
        html += '</div>';

        // Leftover students (odd number)
        if (result.leftover.length > 0) {
            html += '<div class="sg-pl-leftover">' +
                '<h4>&#128100; Solo (geen duo):</h4>' +
                '<div class="sg-pl-leftover-list">' +
                result.leftover.map(function (s) {
                    return '<span class="sg-pl-leftover-name">' + escapeHtml(studentName(s)) + '</span>';
                }).join('') +
                '</div>' +
                '<p class="sg-pl-leftover-hint">Bij oneven aantal leerlingen blijft 1 leerling over. Plaats deze bij een geschikt duo om een trio te vormen.</p>' +
            '</div>';
        }

        resultEl.innerHTML = html;
    }

    /**
     * Genereer duo's op basis van picks via greedy matching met scoring.
     *
     * Scoring:
     *   wederzijds positief  = +20  (kwaliteit: perfect)
     *   eenzijdig positief   = +5   (kwaliteit: positive)
     *   geen voorkeur        =  0   (kwaliteit: neutral)
     *   eenzijdig negatief   = -10  (kwaliteit: suboptimal)
     *   wederzijds negatief  = -Inf (harde constraint, nooit samen)
     *
     * Met randomized tiebreaks zodat "Regenereer" andere varianten kan tonen.
     */
    function generatePairs(picks, allStudents) {
        // Bouw quick-lookup sets
        var posSet = new Set(); // 'from:to'
        var negSet = new Set();
        picks.forEach(function (p) {
            var key = p.from_student_id + ':' + p.to_student_id;
            if (p.pick_type === 'positief') posSet.add(key);
            else negSet.add(key);
        });

        function compat(aId, bId) {
            var aPosB = posSet.has(aId + ':' + bId);
            var bPosA = posSet.has(bId + ':' + aId);
            var aNegB = negSet.has(aId + ':' + bId);
            var bNegA = negSet.has(bId + ':' + aId);

            if (aNegB && bNegA) return { score: -Infinity, quality: 'forbidden' };
            if (aPosB && bPosA) return { score: 20, quality: 'perfect' };
            if (aNegB || bNegA) return { score: -10, quality: 'suboptimal' };
            if (aPosB || bPosA) return { score: 5, quality: 'positive' };
            return { score: 0, quality: 'neutral' };
        }

        // Generate all candidate pairs met scoring
        var candidates = [];
        for (var i = 0; i < allStudents.length; i++) {
            for (var j = i + 1; j < allStudents.length; j++) {
                var c = compat(allStudents[i].id, allStudents[j].id);
                candidates.push({
                    a: allStudents[i],
                    b: allStudents[j],
                    score: c.score,
                    quality: c.quality,
                    tiebreak: Math.random(), // randomize ties voor regenereer
                });
            }
        }

        // Sorteer: hoogste score eerst, met random tiebreak
        candidates.sort(function (x, y) {
            if (y.score !== x.score) return y.score - x.score;
            return y.tiebreak - x.tiebreak;
        });

        // Greedy matching
        var paired = new Set();
        var pairs = [];
        var violations = [];

        for (var k = 0; k < candidates.length; k++) {
            var cand = candidates[k];
            if (paired.has(cand.a.id) || paired.has(cand.b.id)) continue;
            if (cand.quality === 'forbidden') {
                // Geen forbidden pair maken — skip
                continue;
            }
            pairs.push(cand);
            paired.add(cand.a.id);
            paired.add(cand.b.id);
        }

        // Leftover students (oneven aantal of niet-koppelbaar door alle forbidden)
        var leftover = allStudents.filter(function (s) { return !paired.has(s.id); });

        // Als er nog 2+ leftovers zijn die alleen forbidden pairs hebben — fallback noodzakelijk
        // Voor V1: gewoon als leftover tonen, gebruiker plaatst zelf
        if (leftover.length >= 2) {
            // Check of er forbidden pairs onder de leftovers zijn (voor warning)
            for (var i = 0; i < leftover.length; i++) {
                for (var j = i + 1; j < leftover.length; j++) {
                    var c2 = compat(leftover[i].id, leftover[j].id);
                    if (c2.quality === 'forbidden') {
                        violations.push({ a: leftover[i], b: leftover[j] });
                    }
                }
            }
        }

        return { pairs: pairs, leftover: leftover, violations: violations };
    }

    function renderOverzicht(statsByStudent) {
        var rows = Object.values(statsByStudent).map(function (st) {
            var pos = st.receivedPos.length;
            var neg = st.receivedNeg.length;
            var score = pos - neg;
            var status, statusClass;
            if (pos >= 4 && neg <= 1) { status = '🌟 Populair'; statusClass = 'popular'; }
            else if (pos === 0 && neg === 0) { status = '👻 Onzichtbaar'; statusClass = 'invisible'; }
            else if (pos === 0 && neg >= 2) { status = '🚨 Geïsoleerd'; statusClass = 'isolated'; }
            else if (neg >= 4) { status = '⚠️ Gemeden'; statusClass = 'avoided'; }
            else if (pos > neg) { status = '😊 Geliefd'; statusClass = 'liked'; }
            else if (neg > pos) { status = '😐 Onder druk'; statusClass = 'pressure'; }
            else { status = '➖ Neutraal'; statusClass = 'neutral'; }
            return { ...st, pos: pos, neg: neg, score: score, status: status, statusClass: statusClass };
        });
        rows.sort(function (a, b) { return b.score - a.score; });

        var html = '<table class="sg-results-table"><thead><tr>' +
            '<th>Leerling</th>' +
            '<th class="num">+ ontvangen</th>' +
            '<th class="num">- ontvangen</th>' +
            '<th class="num">Score</th>' +
            '<th>Status</th>' +
            '</tr></thead><tbody>';
        rows.forEach(function (r) {
            html += '<tr>' +
                '<td><strong>' + escapeHtml(studentName(r.student)) + '</strong></td>' +
                '<td class="num pos">' + r.pos + '</td>' +
                '<td class="num neg">' + r.neg + '</td>' +
                '<td class="num"><strong>' + (r.score > 0 ? '+' : '') + r.score + '</strong></td>' +
                '<td><span class="sg-status sg-status-' + r.statusClass + '">' + r.status + '</span></td>' +
            '</tr>';
        });
        html += '</tbody></table>';
        document.getElementById('sgTab-overzicht').innerHTML = html;
    }

    function renderWederzijds(picks) {
        // Find pairs A→B+ and B→A+ both positive
        var posPairs = new Set();
        var posByPair = {};
        picks.forEach(function (p) {
            if (p.pick_type !== 'positief') return;
            posByPair[p.from_student_id + ':' + p.to_student_id] = true;
        });
        var wederzijds = [];
        Object.keys(posByPair).forEach(function (k) {
            var parts = k.split(':');
            var a = parts[0], b = parts[1];
            if (posByPair[b + ':' + a] && a < b) { // a<b deduplicates pair
                wederzijds.push([a, b]);
            }
        });

        if (!wederzijds.length) {
            document.getElementById('sgTab-wederzijds').innerHTML = '<p class="sg-empty-msg">Geen wederzijdse positieve keuzes gevonden.</p>';
            return;
        }

        var studentMap = {};
        students.forEach(function (s) { studentMap[s.id] = s; });

        var html = '<p class="sg-tab-intro">Leerlingen die elkaar als positief hebben gekozen.</p><div class="sg-pair-grid">';
        wederzijds.forEach(function (pair) {
            html += '<div class="sg-pair-card positive">' +
                '<span class="sg-pair-icon">🤝</span>' +
                '<div class="sg-pair-names">' +
                    '<strong>' + escapeHtml(studentName(studentMap[pair[0]])) + '</strong>' +
                    '<span class="sg-pair-link">&harr;</span>' +
                    '<strong>' + escapeHtml(studentName(studentMap[pair[1]])) + '</strong>' +
                '</div>' +
            '</div>';
        });
        html += '</div>';
        document.getElementById('sgTab-wederzijds').innerHTML = html;
    }

    function renderConflicten(picks) {
        // Pairs A→B- and B→A-
        var negByPair = {};
        picks.forEach(function (p) {
            if (p.pick_type !== 'negatief') return;
            negByPair[p.from_student_id + ':' + p.to_student_id] = true;
        });
        var conflicten = [];
        Object.keys(negByPair).forEach(function (k) {
            var parts = k.split(':');
            var a = parts[0], b = parts[1];
            if (negByPair[b + ':' + a] && a < b) {
                conflicten.push([a, b]);
            }
        });

        if (!conflicten.length) {
            document.getElementById('sgTab-conflict').innerHTML = '<p class="sg-empty-msg">Geen wederzijds negatieve keuzes gevonden.</p>';
            return;
        }

        var studentMap = {};
        students.forEach(function (s) { studentMap[s.id] = s; });

        var html = '<p class="sg-tab-intro">Leerlingen die elkaar als negatief hebben gekozen — mogelijk een conflict om in de gaten te houden.</p><div class="sg-pair-grid">';
        conflicten.forEach(function (pair) {
            html += '<div class="sg-pair-card negative">' +
                '<span class="sg-pair-icon">⚡</span>' +
                '<div class="sg-pair-names">' +
                    '<strong>' + escapeHtml(studentName(studentMap[pair[0]])) + '</strong>' +
                    '<span class="sg-pair-link">&harr;</span>' +
                    '<strong>' + escapeHtml(studentName(studentMap[pair[1]])) + '</strong>' +
                '</div>' +
            '</div>';
        });
        html += '</div>';
        document.getElementById('sgTab-conflict').innerHTML = html;
    }

    function renderAandacht(statsByStudent) {
        var attention = Object.values(statsByStudent).filter(function (st) {
            return st.receivedPos.length === 0;
        });

        if (!attention.length) {
            document.getElementById('sgTab-aandacht').innerHTML = '<p class="sg-empty-msg">Geen leerlingen zonder positieve stemmen — iedereen is gekozen door minstens één klasgenoot.</p>';
            return;
        }

        var html = '<p class="sg-tab-intro">Leerlingen die geen enkele positieve stem hebben ontvangen. Houd ze extra in de gaten.</p>';
        html += '<div class="sg-attention-list">';
        attention.forEach(function (st) {
            var negText = st.receivedNeg.length > 0 ? ' &middot; <span class="sg-attn-neg">' + st.receivedNeg.length + ' negatieve stemmen</span>' : ' &middot; geen negatieve stemmen';
            html += '<div class="sg-attention-card">' +
                '<span class="sg-attn-icon">🔍</span>' +
                '<div>' +
                    '<strong>' + escapeHtml(studentName(st.student)) + '</strong>' +
                    '<small>0 positieve stemmen' + negText + '</small>' +
                '</div>' +
            '</div>';
        });
        html += '</div>';
        document.getElementById('sgTab-aandacht').innerHTML = html;
    }

    // Tabs
    tabBtns.forEach(function (b) {
        b.addEventListener('click', function () {
            tabBtns.forEach(function (x) { x.classList.toggle('active', x === b); });
            document.querySelectorAll('.sg-tab-content').forEach(function (c) {
                c.classList.toggle('active', c.id === 'sgTab-' + b.dataset.tab);
            });
        });
    });

    btnResultsBack.addEventListener('click', renderWelcome);
    btnResultsDelete.addEventListener('click', async function () {
        if (!currentSession?.id) return;
        if (!confirm('Sociogram volledig verwijderen? Dit kan niet ongedaan gemaakt worden.')) return;
        await supabase.from('sociogram_sessions').delete().eq('id', currentSession.id);
        renderWelcome();
    });

    // ---------- Init ----------
    renderWelcome();
});

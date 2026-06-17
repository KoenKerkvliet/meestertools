/* ============================================
   MEESTERTOOLS - Sociogram
   Versie: v0.0.2
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    // ---------- DOM ----------
    var states = {
        welcome: document.getElementById('sgState-welcome'),
        setup: document.getElementById('sgState-setup'),
        live: document.getElementById('sgState-live'),
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
    var btnSetupDigital = document.getElementById('sgBtnSetupDigital');

    // Live (digitale afname)
    var liveCode = document.getElementById('sgLiveCode');
    var liveMeta = document.getElementById('sgLiveMeta');
    var liveUrl = document.getElementById('sgLiveUrl');
    var liveQr = document.getElementById('sgLiveQr');
    var liveProgressCount = document.getElementById('sgLiveProgressCount');
    var liveList = document.getElementById('sgLiveList');
    var btnLiveFinish = document.getElementById('sgBtnLiveFinish');
    var btnLiveCancel = document.getElementById('sgBtnLiveCancel');

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
            .select('id, group_id, type, afname_datum, titel, status, code, created_at, groups(name)')
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
            .select('id, group_id, type, afname_datum, titel, status, code, groups(name)')
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
            var isLive = s.status === 'open';
            var card = document.createElement('div');
            card.className = 'sg-past-card' + (isLive ? ' is-live' : '');
            var liveBadge = isLive ? ' <span class="sg-live-badge">&#9679; live bezig</span>' : '';
            card.innerHTML =
                '<div class="sg-past-main">' +
                    '<div class="sg-past-icon">' + (s.type === 'werken' ? '&#128218;' : '&#9917;') + '</div>' +
                    '<div class="sg-past-text">' +
                        '<strong>' + (s.titel ? escapeHtml(s.titel) : typeLabel(s.type) + ' - ' + escapeHtml(s.groups?.name || 'Onbekend')) + '</strong>' +
                        '<small>' + typeLabel(s.type) + ' &middot; ' + escapeHtml(s.groups?.name || '?') + ' &middot; ' + formatDate(s.afname_datum) + liveBadge + '</small>' +
                    '</div>' +
                '</div>' +
                '<button class="btn-secondary" data-session-id="' + s.id + '">' + (isLive ? 'Verder &rarr;' : 'Bekijken &rarr;') + '</button>';
            pastListEl.appendChild(card);
            card.querySelector('button').addEventListener('click', function () {
                if (isLive) resumeLive(s.id);
                else openExistingResults(s.id);
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
        // Voorselecteer de globale actieve klas (indien beschikbaar)
        if (window.MTActiveClass) {
            var activeId = window.MTActiveClass.getId();
            if (activeId && groups.some(function (g) { return g.id === activeId; })) {
                groupSelect.value = activeId;
            }
        }
        // Defaults
        dateInput.value = new Date().toISOString().slice(0, 10);
        titelInput.value = '';
        document.querySelectorAll('input[name="sgType"]').forEach(function (r) { r.checked = false; });
        showState('setup');
    }

    btnNew.addEventListener('click', renderSetup);
    btnSetupCancel.addEventListener('click', renderWelcome);

    // Gedeelde validatie + leerlingen laden voor beide afnamevormen.
    // Geeft { user, groupId, type, datum, titel } terug of null bij een fout.
    async function prepareSetup() {
        var groupId = groupSelect.value;
        var type = (document.querySelector('input[name="sgType"]:checked') || {}).value;
        var datum = dateInput.value;
        var titel = titelInput.value.trim();

        if (!groupId) { showError(setupError, 'Kies eerst een klas.'); return null; }
        if (!type) { showError(setupError, 'Kies "Samen werken" of "Samen spelen".'); return null; }
        if (!datum) { showError(setupError, 'Vul een afnamedatum in.'); return null; }

        if (window.MTActiveClass) window.MTActiveClass.setId(groupId);

        students = await loadStudents(groupId);
        if (students.length < 4) {
            showError(setupError, 'Deze klas heeft minder dan 4 leerlingen. Voeg eerst meer leerlingen toe via Beheer.');
            return null;
        }
        var { data: { user } } = await supabase.auth.getUser();
        return { user: user, groupId: groupId, type: type, datum: datum, titel: titel };
    }

    function insertResultFields(data, groupId) {
        return Object.assign({}, data, {
            groups: { name: groups.find(function (g) { return g.id === groupId; })?.name || '' }
        });
    }

    // ---- Papieren afname: handmatig invoeren ----
    btnSetupNext.addEventListener('click', async function () {
        var p = await prepareSetup();
        if (!p) return;

        var { data, error } = await supabase
            .from('sociogram_sessions')
            .insert({
                user_id: p.user.id,
                group_id: p.groupId,
                type: p.type,
                afname_datum: p.datum,
                titel: p.titel || null,
            })
            .select()
            .single();
        if (error) {
            console.error('insert session error', error);
            return showError(setupError, 'Sessie kon niet aangemaakt worden: ' + error.message);
        }
        currentSession = insertResultFields(data, p.groupId);
        initEmptyPicks();
        renderEntry();
    });

    // ---- Digitale afname: sessie starten, leerlingen vullen zelf in ----
    if (btnSetupDigital) btnSetupDigital.addEventListener('click', async function () {
        var p = await prepareSetup();
        if (!p) return;

        btnSetupDigital.disabled = true;
        var created = null, lastErr = null;
        for (var attempt = 0; attempt < 6 && !created; attempt++) {
            var res = await supabase
                .from('sociogram_sessions')
                .insert({
                    user_id: p.user.id,
                    group_id: p.groupId,
                    type: p.type,
                    afname_datum: p.datum,
                    titel: p.titel || null,
                    code: genCode(5),
                    status: 'open',
                })
                .select()
                .single();
            if (!res.error) { created = res.data; break; }
            lastErr = res.error;
            if (res.error.code !== '23505') break; // alleen bij dubbele code opnieuw
        }
        btnSetupDigital.disabled = false;

        if (!created) {
            console.error('insert digital session error', lastErr);
            return showError(setupError, 'Sessie kon niet gestart worden. Probeer opnieuw.');
        }
        currentSession = insertResultFields(created, p.groupId);
        startLive();
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

        // Naam-indexen voor het type-veld: namen om uit aan te vullen,
        // en een map om een (volledig getypte) naam terug te vertalen naar id.
        var names = [];
        var byName = {};   // 'ariana' -> id (eerste voorkomen wint bij dubbele namen)
        var nameById = {}; // id -> 'Ariana' (canonieke schrijfwijze)
        others.forEach(function (s) {
            var n = studentName(s);
            names.push(n);
            nameById[s.id] = n;
            var key = n.toLowerCase();
            if (!(key in byName)) byName[key] = s.id;
        });

        card.innerHTML =
            '<div class="sg-entry-card-header">' +
                '<h3>' + escapeHtml(studentName(student)) + '</h3>' +
                '<span class="sg-entry-card-status" data-status="empty">leeg</span>' +
            '</div>' +
            '<div class="sg-entry-card-body">' +
                '<div class="sg-pick-col sg-pick-pos">' +
                    '<h4>&plus; Positief (3 keuzes)</h4>' +
                    buildInputsHtml('positief') +
                '</div>' +
                '<div class="sg-pick-col sg-pick-neg">' +
                    '<h4>&minus; Negatief (3 keuzes)</h4>' +
                    buildInputsHtml('negatief') +
                '</div>' +
            '</div>';

        var inputs = Array.prototype.slice.call(card.querySelectorAll('.sg-pick-input'));

        function resolveInput(inp) {
            var type = inp.dataset.type;
            var rank = parseInt(inp.dataset.rank);
            var val = inp.value.trim();
            var id = val ? (byName[val.toLowerCase()] || '') : '';
            if (val && !id) {
                // Geen exacte match: accepteer een naam die hiermee begint.
                var lower = val.toLowerCase();
                for (var i = 0; i < names.length; i++) {
                    if (names[i].toLowerCase().indexOf(lower) === 0) { id = byName[names[i].toLowerCase()]; break; }
                }
            }
            if (id) {
                inp.value = nameById[id]; // canonieke schrijfwijze
                inp.classList.remove('sg-input-unknown');
            } else {
                inp.classList.toggle('sg-input-unknown', !!val); // getypt maar geen match
            }
            currentPicks[student.id][type][rank - 1] = id;
            updateStudentStatus(card, student.id);
            updateProgress();
            validateCardConsistency(card, student.id);
        }

        inputs.forEach(function (inp, idx) {
            // Inline-aanvulling: vul de rest van de eerste passende naam aan
            // en selecteer dat stuk, zodat Tab/Enter de keuze bevestigt.
            inp.addEventListener('input', function (e) {
                if (e.inputType && e.inputType.indexOf('delete') === 0) return; // niet aanvullen bij wissen
                var typed = inp.value;
                if (!typed) return;
                var lower = typed.toLowerCase();
                var match = null;
                for (var i = 0; i < names.length; i++) {
                    if (names[i].toLowerCase().indexOf(lower) === 0) { match = names[i]; break; }
                }
                if (match && match.length > typed.length) {
                    inp.value = match;
                    try { inp.setSelectionRange(typed.length, match.length); } catch (err) {}
                }
            });
            inp.addEventListener('blur', function () { resolveInput(inp); });
            inp.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    resolveInput(inp);
                    if (inputs[idx + 1]) inputs[idx + 1].focus();
                    else inp.blur();
                }
            });
        });

        return card;
    }

    function buildInputsHtml(type) {
        var html = '';
        for (var rank = 1; rank <= 3; rank++) {
            html += '<input type="text" class="sg-pick-input" data-type="' + type + '" data-rank="' + rank + '" ' +
                'autocomplete="off" autocapitalize="words" spellcheck="false" ' +
                'placeholder="— keuze ' + rank + ' — typ een naam">';
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

    // ---------- LIVE state (digitale afname) ----------
    var liveChannel = null;
    var livePoll = null;
    var submittedIds = {}; // { student_id: true }

    function genCode(len) {
        var ALPH = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // zonder I,O,0,1,L
        var arr = new Uint32Array(len);
        crypto.getRandomValues(arr);
        var s = '';
        for (var i = 0; i < len; i++) s += ALPH[arr[i] % ALPH.length];
        return s;
    }

    async function setRealtimeAuth() {
        try {
            var { data } = await supabase.auth.getSession();
            if (data.session) supabase.realtime.setAuth(data.session.access_token);
        } catch (e) { /* niet fataal */ }
    }
    function detachLiveRealtime() {
        if (liveChannel) { try { supabase.removeChannel(liveChannel); } catch (e) {} liveChannel = null; }
    }
    function attachLiveRealtime() {
        detachLiveRealtime();
        if (!currentSession) return;
        liveChannel = supabase.channel('sg-' + currentSession.id)
            .on('postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'sociogram_participants', filter: 'session_id=eq.' + currentSession.id },
                function (payload) {
                    if (payload.new && payload.new.student_id) {
                        submittedIds[payload.new.student_id] = true;
                        renderLiveProgress();
                    }
                })
            .subscribe();
    }
    function stopLivePoll() { if (livePoll) { clearInterval(livePoll); livePoll = null; } }
    function startLivePoll() { stopLivePoll(); livePoll = setInterval(loadParticipants, 5000); }

    async function loadParticipants() {
        if (!currentSession) return;
        var { data } = await supabase
            .from('sociogram_participants')
            .select('student_id')
            .eq('session_id', currentSession.id);
        submittedIds = {};
        (data || []).forEach(function (p) { submittedIds[p.student_id] = true; });
        renderLiveProgress();
    }

    async function startLive() {
        await setRealtimeAuth();
        submittedIds = {};
        renderLive();
        attachLiveRealtime();
        startLivePoll();
        loadParticipants();
    }

    // Vanuit het overzicht een nog lopende digitale sessie hervatten.
    async function resumeLive(sessionId) {
        var session = await loadSession(sessionId);
        if (!session) { alert('Sessie kon niet geladen worden.'); return; }
        currentSession = session;
        students = await loadStudents(session.group_id);
        startLive();
    }

    function renderLive() {
        liveCode.textContent = currentSession.code || '';
        liveMeta.textContent = typeLabel(currentSession.type) + ' · ' + (currentSession.groups?.name || '');
        var base = location.host;
        liveUrl.textContent = base + '/leerling';

        // QR naar de leerlingpagina (optioneel — alleen als de lib geladen is)
        liveQr.innerHTML = '';
        if (typeof qrcode !== 'undefined') {
            try {
                var qr = qrcode(0, 'M');
                qr.addData(location.origin + '/leerling');
                qr.make();
                liveQr.innerHTML = qr.createImgTag(5, 8);
            } catch (e) { /* qr optioneel */ }
        }
        renderLiveProgress();
        showState('live');
    }

    function renderLiveProgress() {
        if (!students.length) { liveList.innerHTML = ''; liveProgressCount.textContent = ''; return; }
        var done = students.filter(function (s) { return submittedIds[s.id]; }).length;
        liveProgressCount.textContent = done + ' / ' + students.length + ' klaar';
        // Klaar bovenaan, daarna nog-bezig — beide alfabetisch zoals geladen.
        var sorted = students.slice().sort(function (a, b) {
            var da = submittedIds[a.id] ? 0 : 1, db = submittedIds[b.id] ? 0 : 1;
            return da - db;
        });
        liveList.innerHTML = sorted.map(function (s) {
            var ok = !!submittedIds[s.id];
            return '<span class="sg-live-chip ' + (ok ? 'is-done' : 'is-todo') + '">' +
                '<span class="sg-live-dot">' + (ok ? '&#10003;' : '&#8230;') + '</span>' +
                escapeHtml(studentName(s)) +
            '</span>';
        }).join('');
    }

    function teardownLive() {
        detachLiveRealtime();
        stopLivePoll();
    }

    async function finishLive() {
        if (!currentSession) return;
        var done = students.filter(function (s) { return submittedIds[s.id]; }).length;
        var msg = done < students.length
            ? 'Nog niet iedereen heeft ingevuld (' + done + ' van ' + students.length + '). Toch afronden en resultaten bekijken?'
            : 'Afnemen afronden en de resultaten bekijken?';
        if (!confirm(msg)) return;
        var { error } = await supabase
            .from('sociogram_sessions')
            .update({ status: 'closed' })
            .eq('id', currentSession.id);
        if (error) { showError(setupError, 'Afronden lukte niet. Probeer opnieuw.'); return; }
        teardownLive();
        await openExistingResults(currentSession.id);
    }

    async function cancelLive() {
        if (!currentSession) return;
        if (!confirm('Digitale sessie annuleren? De sessie en alle ingevulde antwoorden worden verwijderd.')) return;
        teardownLive();
        await supabase.from('sociogram_sessions').delete().eq('id', currentSession.id);
        renderWelcome();
    }

    if (btnLiveFinish) btnLiveFinish.addEventListener('click', finishLive);
    if (btnLiveCancel) btnLiveCancel.addEventListener('click', cancelLive);

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
    var currentGroupSize = 2;

    function renderPlaatsing(picks) {
        currentPicksData = picks;
        var container = document.getElementById('sgTab-plaatsing');
        container.innerHTML =
            '<div class="sg-plaatsing-toolbar">' +
                '<p class="sg-tab-intro">Automatisch voorgestelde plaatsing op basis van de sociogram-data. Wederzijds negatief = nooit samen. Wederzijds positief = bij voorkeur samen.</p>' +
                '<div class="sg-pl-controls">' +
                    '<div class="sg-pl-size-selector">' +
                        '<span>Per groep:</span>' +
                        '<button class="sg-size-btn active" data-size="2">2</button>' +
                        '<button class="sg-size-btn" data-size="3">3</button>' +
                        '<button class="sg-size-btn" data-size="4">4</button>' +
                        '<button class="sg-size-btn" data-size="5">5</button>' +
                    '</div>' +
                    '<button class="btn-secondary" id="sgBtnRegenerate">&#8635; Regenereer</button>' +
                '</div>' +
            '</div>' +
            '<div id="sgPlaatsingResult"></div>';

        document.getElementById('sgBtnRegenerate').addEventListener('click', function () {
            buildAndRenderGroups(currentPicksData, currentGroupSize);
        });

        document.querySelectorAll('.sg-size-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                document.querySelectorAll('.sg-size-btn').forEach(function (b) { b.classList.remove('active'); });
                btn.classList.add('active');
                currentGroupSize = parseInt(btn.dataset.size);
                buildAndRenderGroups(currentPicksData, currentGroupSize);
            });
        });

        buildAndRenderGroups(picks, currentGroupSize);
    }

    function buildAndRenderGroups(picks, groupSize) {
        var result = generateGroups(picks, students, groupSize);
        var resultEl = document.getElementById('sgPlaatsingResult');

        // Aggregeer kwaliteit-stats
        var stats = { great: 0, good: 0, neutral: 0, mixed: 0, critical: 0 };
        var totalPositiveBonds = 0;
        var totalNegativeBonds = 0;
        result.groups.forEach(function (g) {
            stats[g.quality] = (stats[g.quality] || 0) + 1;
            totalPositiveBonds += g.positives;
            totalNegativeBonds += g.negatives;
        });

        var html = '';

        html += '<div class="sg-pl-summary">' +
            '<div class="sg-pl-stat sg-pl-stat-perfect"><strong>' + result.groups.length + '</strong><span>groepjes van ' + groupSize + '</span></div>' +
            '<div class="sg-pl-stat sg-pl-stat-positive"><strong>' + totalPositiveBonds + '</strong><span>positieve banden</span></div>' +
            '<div class="sg-pl-stat sg-pl-stat-neutral"><strong>' + (stats.great + stats.good) + '</strong><span>goede groepjes</span></div>' +
            '<div class="sg-pl-stat sg-pl-stat-suboptimal"><strong>' + totalNegativeBonds + '</strong><span>eenzijdig negatieve banden</span></div>' +
        '</div>';

        if (result.criticalIssues.length > 0) {
            html += '<div class="sg-pl-warning">' +
                '<strong>&#9888;&#65039; Let op:</strong> de algorithm kon niet alle harde restricties vermijden. ' +
                'De volgende koppels zijn wederzijds negatief en zitten toch in hetzelfde groepje:<br>' +
                result.criticalIssues.map(function (v) {
                    return '<span>' + escapeHtml(studentName(v.a)) + ' &harr; ' + escapeHtml(studentName(v.b)) + '</span>';
                }).join(', ') +
            '</div>';
        }

        html += '<div class="sg-pl-grid">';
        result.groups.forEach(function (group, idx) {
            html += renderGroupCard(group, idx, groupSize);
        });
        html += '</div>';

        // Geen leftover meer want algoritme verdeelt alles
        resultEl.innerHTML = html;
    }

    function renderGroupCard(group, idx, expectedSize) {
        var qualityLabels = {
            great: { icon: '&#129309;', label: 'Sterk groepje' },
            good: { icon: '&#128077;', label: 'Goede mix' },
            neutral: { icon: '&#9898;', label: 'Neutraal' },
            mixed: { icon: '&#9888;&#65039;', label: 'Gemengd — eenzijdig negatief' },
            critical: { icon: '&#128293;', label: 'Conflict — wederzijds negatief' },
        };
        var q = qualityLabels[group.quality] || qualityLabels.neutral;

        var html = '<div class="sg-pl-group sg-pl-' + group.quality + '">';
        html += '<div class="sg-pl-group-header">';
        html += '<strong>Groep ' + (idx + 1) + '</strong>';
        html += '<span class="sg-pl-group-size">' + group.students.length + ' leerlingen</span>';
        html += '</div>';

        html += '<div class="sg-pl-group-members">';
        group.students.forEach(function (s) {
            html += '<span class="sg-pl-member">' + escapeHtml(studentName(s)) + '</span>';
        });
        html += '</div>';

        html += '<div class="sg-pl-group-meta">';
        html += '<span class="sg-pl-quality">' + q.icon + ' ' + q.label + '</span>';
        if (group.positives > 0) {
            html += '<span class="sg-pl-bond sg-pl-bond-pos">' + group.positives + ' positieve band' + (group.positives === 1 ? '' : 'en') + '</span>';
        }
        if (group.negatives > 0) {
            html += '<span class="sg-pl-bond sg-pl-bond-neg">' + group.negatives + ' eenzijdig negatief</span>';
        }
        html += '</div>';

        // Toon specifieke wederzijds-positieve relaties als die er zijn
        var posPairs = group.pairBonds.filter(function (p) { return p.quality === 'perfect'; });
        if (posPairs.length > 0) {
            html += '<div class="sg-pl-bonds-list">';
            posPairs.forEach(function (p) {
                html += '<div class="sg-pl-bond-detail">' +
                    '&#129309; ' + escapeHtml(studentName(p.a)) + ' &harr; ' + escapeHtml(studentName(p.b)) +
                '</div>';
            });
            html += '</div>';
        }

        // Toon negatieve relaties (als waarschuwing)
        var negPairs = group.pairBonds.filter(function (p) { return p.quality === 'suboptimal' || p.quality === 'forbidden'; });
        if (negPairs.length > 0) {
            html += '<div class="sg-pl-bonds-list sg-pl-bonds-neg">';
            negPairs.forEach(function (p) {
                var icon = p.quality === 'forbidden' ? '&#128293;' : '&#9888;&#65039;';
                html += '<div class="sg-pl-bond-detail">' +
                    icon + ' ' + escapeHtml(studentName(p.a)) + ' / ' + escapeHtml(studentName(p.b)) +
                '</div>';
            });
            html += '</div>';
        }

        html += '</div>';
        return html;
    }

    /**
     * Genereer groepjes van N op basis van picks via greedy seed-and-grow.
     *
     * Per pair compatibility:
     *   wederzijds positief  = +20  (perfect)
     *   eenzijdig positief   = +5   (positive)
     *   geen voorkeur        =  0   (neutral)
     *   eenzijdig negatief   = -10  (suboptimal)
     *   wederzijds negatief  = -Inf (forbidden)
     *
     * Algoritme:
     *   1. Bouw groep door beste seed-paar te kiezen (highest compat)
     *   2. Voeg leden toe op basis van cohesie-score met alle huidige leden
     *   3. Skip kandidaten met forbidden constraints
     *   4. Random tiebreaks zodat Regenereer varianten toont
     */
    function generateGroups(picks, allStudents, groupSize) {
        // Bouw quick-lookup sets
        var posSet = new Set();
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

        function groupCohesionWith(group, studentId) {
            var total = 0;
            var hasForbidden = false;
            for (var i = 0; i < group.length; i++) {
                var c = compat(group[i].id, studentId);
                if (c.score === -Infinity) hasForbidden = true;
                else total += c.score;
            }
            return { score: total + Math.random() * 0.5, forbidden: hasForbidden };
        }

        function describeGroup(group) {
            var positives = 0, negatives = 0;
            var pairBonds = [];
            for (var i = 0; i < group.length; i++) {
                for (var j = i + 1; j < group.length; j++) {
                    var c = compat(group[i].id, group[j].id);
                    pairBonds.push({ a: group[i], b: group[j], score: c.score, quality: c.quality });
                    if (c.quality === 'perfect') positives++;
                    else if (c.quality === 'suboptimal') negatives++;
                }
            }
            var hasForbidden = pairBonds.some(function (p) { return p.quality === 'forbidden'; });
            var quality;
            if (hasForbidden) quality = 'critical';
            else if (negatives > 0) quality = 'mixed';
            else if (positives >= Math.max(1, group.length - 1)) quality = 'great';
            else if (positives > 0) quality = 'good';
            else quality = 'neutral';
            return { positives: positives, negatives: negatives, pairBonds: pairBonds, quality: quality };
        }

        var remaining = allStudents.slice();
        var groups = [];
        var criticalIssues = [];

        // Voor groupSize 2: gewoon de oude greedy pair matching
        if (groupSize === 2) {
            // Genereer alle candidate pairs
            var candidates = [];
            for (var i = 0; i < remaining.length; i++) {
                for (var j = i + 1; j < remaining.length; j++) {
                    var c = compat(remaining[i].id, remaining[j].id);
                    candidates.push({
                        a: remaining[i], b: remaining[j],
                        score: c.score, quality: c.quality,
                        tiebreak: Math.random(),
                    });
                }
            }
            candidates.sort(function (x, y) {
                if (y.score !== x.score) return y.score - x.score;
                return y.tiebreak - x.tiebreak;
            });
            var paired = new Set();
            candidates.forEach(function (cand) {
                if (paired.has(cand.a.id) || paired.has(cand.b.id)) return;
                if (cand.quality === 'forbidden') return;
                groups.push([cand.a, cand.b]);
                paired.add(cand.a.id);
                paired.add(cand.b.id);
            });
            // Eventueel een oneven leerling: plaats in een geschikt bestaand duo (wordt trio)
            var leftover = remaining.filter(function (s) { return !paired.has(s.id); });
            if (leftover.length === 1) {
                var loner = leftover[0];
                var bestIdx = -1, bestScore = -Infinity;
                for (var gi = 0; gi < groups.length; gi++) {
                    var coh = groupCohesionWith(groups[gi], loner.id);
                    if (coh.forbidden) continue;
                    if (coh.score > bestScore) { bestScore = coh.score; bestIdx = gi; }
                }
                if (bestIdx >= 0) groups[bestIdx].push(loner);
                else groups.push([loner]);
            } else if (leftover.length >= 2) {
                // Kan voorkomen als er veel forbidden pairs zijn — bundel als laatste groep met warning
                groups.push(leftover);
            }
        } else {
            // groupSize >= 3: seed-and-grow algoritme
            while (remaining.length >= 2) {
                // Hoeveel leerlingen blijven er over? Als laatste groep <groupSize: pak alles wat over is.
                var thisSize = groupSize;
                if (remaining.length < groupSize * 2 && remaining.length < groupSize) {
                    thisSize = remaining.length;
                } else if (remaining.length < groupSize) {
                    thisSize = remaining.length;
                }

                // Vind beste seed-pair
                var bestSeed = null;
                for (var i = 0; i < remaining.length; i++) {
                    for (var j = i + 1; j < remaining.length; j++) {
                        var c2 = compat(remaining[i].id, remaining[j].id);
                        if (c2.score === -Infinity) continue;
                        var tb = Math.random();
                        if (!bestSeed || c2.score > bestSeed.score ||
                            (c2.score === bestSeed.score && tb > bestSeed.tiebreak)) {
                            bestSeed = {
                                a: remaining[i], b: remaining[j],
                                score: c2.score, tiebreak: tb,
                            };
                        }
                    }
                }

                if (!bestSeed) {
                    // Alleen forbidden pairs over — dwing groep
                    groups.push(remaining.slice());
                    remaining = [];
                    break;
                }

                var group = [bestSeed.a, bestSeed.b];
                remaining = remaining.filter(function (s) {
                    return s.id !== bestSeed.a.id && s.id !== bestSeed.b.id;
                });

                // Voeg leden toe tot thisSize bereikt is
                while (group.length < thisSize && remaining.length > 0) {
                    var bestCand = null;
                    for (var k = 0; k < remaining.length; k++) {
                        var coh2 = groupCohesionWith(group, remaining[k].id);
                        if (coh2.forbidden) continue;
                        if (!bestCand || coh2.score > bestCand.score) {
                            bestCand = { student: remaining[k], score: coh2.score };
                        }
                    }
                    if (!bestCand) {
                        // Geen niet-forbidden kandidaat — stop met deze groep
                        break;
                    }
                    group.push(bestCand.student);
                    remaining = remaining.filter(function (s) { return s.id !== bestCand.student.id; });
                }

                groups.push(group);
            }

            // Eventuele laatste leerling: voeg toe aan groep met beste cohesie
            if (remaining.length === 1) {
                var loner2 = remaining[0];
                var bestIdx2 = -1, bestScore2 = -Infinity;
                for (var gi2 = 0; gi2 < groups.length; gi2++) {
                    var coh3 = groupCohesionWith(groups[gi2], loner2.id);
                    if (coh3.forbidden) continue;
                    if (coh3.score > bestScore2) { bestScore2 = coh3.score; bestIdx2 = gi2; }
                }
                if (bestIdx2 >= 0) groups[bestIdx2].push(loner2);
                else groups.push([loner2]);
                remaining = [];
            }
        }

        // Beschrijf elke groep
        var result = groups.map(function (g) {
            var desc = describeGroup(g);
            if (desc.quality === 'critical') {
                desc.pairBonds.filter(function (p) { return p.quality === 'forbidden'; }).forEach(function (p) {
                    criticalIssues.push({ a: p.a, b: p.b });
                });
            }
            return {
                students: g,
                quality: desc.quality,
                positives: desc.positives,
                negatives: desc.negatives,
                pairBonds: desc.pairBonds,
            };
        });

        return { groups: result, criticalIssues: criticalIssues };
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

    // ---------- WERKBLADEN (PDF per leerling) ----------
    // Voorgestructureerd A4 (staand) om het sociogram op papier af te nemen:
    // naam + monstertje bovenaan, een uitlegblok en twee invulvakken
    // (3 positieve en 3 negatieve keuzes). Eén pagina per leerling.
    var btnWerkblad = document.getElementById('sgBtnWerkblad');

    var WB = { w: 1240, h: 1754 };  // A4 staand op ~150 dpi
    var WB_M = 70;                  // paginamarge
    var MONSTER_COUNT = 36;

    // Zelfde monster-toewijzing als in Klassendienst/Klasseprestatie/
    // Complimentenmuur/Naamkaarten, zodat elk kind overal hetzelfde
    // monstertje heeft.
    function monsterHash(key) {
        key = String(key || '');
        var h = 0;
        for (var i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
        return h;
    }

    function assignMonsters(list) {
        var map = {}, used = {};
        var sorted = (list || []).slice().sort(function (a, b) {
            var ai = String(a.id), bi = String(b.id);
            return ai < bi ? -1 : ai > bi ? 1 : 0;
        });
        sorted.forEach(function (s) {
            var n = monsterHash(s.id) % MONSTER_COUNT, tries = 0;
            while (used[n] && tries < MONSTER_COUNT) { n = (n + 1) % MONSTER_COUNT; tries++; }
            used[n] = true;
            map[s.id] = n + 1;
        });
        return map;
    }

    var wbImgCache = {};
    function wbLoadImage(src) {
        if (!wbImgCache[src]) {
            wbImgCache[src] = new Promise(function (resolve) {
                var img = new Image();
                img.onload = function () { resolve(img); };
                img.onerror = function () { resolve(null); };
                img.src = src;
            });
        }
        return wbImgCache[src];
    }

    function wbRoundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
    }

    function wbWrapText(ctx, text, maxWidth) {
        var words = text.split(' '), lines = [], line = '';
        words.forEach(function (w) {
            var test = line ? line + ' ' + w : w;
            if (ctx.measureText(test).width > maxWidth && line) {
                lines.push(line);
                line = w;
            } else {
                line = test;
            }
        });
        if (line) lines.push(line);
        return lines;
    }

    // Tekent één invulvak (titel + 3 genummerde schrijflijnen),
    // geeft de hoogte van het vak terug.
    function wbDrawSection(ctx, y, opts) {
        var x = WB_M, w = WB.w - WB_M * 2;
        var pad = 34, rowH = 110, titleH = 60;
        var h = pad + titleH + rowH * 3 + pad - 30;

        ctx.fillStyle = opts.bg;
        wbRoundRect(ctx, x, y, w, h, 20);
        ctx.fill();
        ctx.strokeStyle = opts.border;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Titel met emoji
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.font = '38px Arial, sans-serif';
        ctx.fillStyle = '#1a1a1a';
        ctx.fillText(opts.emoji, x + pad, y + pad + 22);
        ctx.font = 'bold 36px Arial, sans-serif';
        ctx.fillStyle = opts.titleColor;
        ctx.fillText(opts.title, x + pad + 58, y + pad + 22);

        // 3 schrijflijnen met nummerrondjes
        for (var i = 0; i < 3; i++) {
            var rowY = y + pad + titleH + rowH * i + rowH / 2;

            ctx.beginPath();
            ctx.arc(x + pad + 24, rowY, 26, 0, Math.PI * 2);
            ctx.fillStyle = opts.titleColor;
            ctx.fill();
            ctx.font = 'bold 30px Arial, sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.fillText(String(i + 1), x + pad + 24, rowY + 1);

            ctx.beginPath();
            ctx.moveTo(x + pad + 74, rowY + 28);
            ctx.lineTo(x + w - pad, rowY + 28);
            ctx.strokeStyle = '#9AA0AC';
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.textAlign = 'left';
        }

        return h;
    }

    function wbPaint(ctx, student, monsterImg, type, datum) {
        var W = WB.w, H = WB.h;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, W, H);

        var y = WB_M;

        // ---- Kop: monstertje + naam ----
        var nameX = WB_M;
        if (monsterImg) {
            ctx.drawImage(monsterImg, WB_M, y, 150, 150);
            nameX = WB_M + 185;
        }

        var name = studentName(student);
        var fontSize = 76;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold ' + fontSize + 'px Arial, sans-serif';
        while (ctx.measureText(name).width > W - WB_M - nameX && fontSize > 30) {
            fontSize -= 4;
            ctx.font = 'bold ' + fontSize + 'px Arial, sans-serif';
        }
        ctx.fillStyle = '#1a1a1a';
        ctx.fillText(name, nameX, y + 58);

        ctx.font = '30px Arial, sans-serif';
        ctx.fillStyle = '#636E72';
        var sub = 'Sociogram · ' + typeLabel(type) + (datum ? ' · ' + formatDate(datum) : '');
        ctx.fillText(sub, nameX, y + 122);

        y += 180;
        ctx.beginPath();
        ctx.moveTo(WB_M, y);
        ctx.lineTo(W - WB_M, y);
        ctx.strokeStyle = '#E8E8F0';
        ctx.lineWidth = 2;
        ctx.stroke();
        y += 36;

        // ---- Uitlegblok ----
        var werkwoord = type === 'spelen' ? 'speelt' : 'samenwerkt';
        var infoTekst = 'Schrijf in elk vak drie namen van kinderen uit je eigen klas. ' +
            'Kies eerst drie kinderen met wie jij graag ' + werkwoord + ', en daarna drie kinderen ' +
            'met wie je dat liever niet doet. Er is geen goed of fout: vul in wat jij vindt. ' +
            'Alleen je juf of meester ziet je antwoorden.';

        var pad = 34;
        var infoW = W - WB_M * 2;
        ctx.font = '29px Arial, sans-serif';
        var infoLines = wbWrapText(ctx, infoTekst, infoW - pad * 2);
        var infoH = pad + 48 + 14 + infoLines.length * 42 + pad - 14;

        ctx.fillStyle = '#F3F2FF';
        wbRoundRect(ctx, WB_M, y, infoW, infoH, 20);
        ctx.fill();
        ctx.strokeStyle = '#D8D5FF';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.font = '34px Arial, sans-serif';
        ctx.fillStyle = '#1a1a1a';
        ctx.fillText('\u{1F4A1}', WB_M + pad, y + pad + 18);
        ctx.font = 'bold 32px Arial, sans-serif';
        ctx.fillStyle = '#5A52D5';
        ctx.fillText('Zo werkt het', WB_M + pad + 52, y + pad + 18);

        ctx.font = '29px Arial, sans-serif';
        ctx.fillStyle = '#444444';
        infoLines.forEach(function (line, i) {
            ctx.fillText(line, WB_M + pad, y + pad + 48 + 14 + i * 42 + 14);
        });

        y += infoH + 40;

        // ---- Vak 1: positief ----
        var posTitle = type === 'spelen'
            ? 'Met deze kinderen speel ik graag'
            : 'Met deze kinderen werk ik graag samen';
        var posH = wbDrawSection(ctx, y, {
            emoji: '\u{1F60A}',
            title: posTitle,
            titleColor: '#2E7D32',
            bg: '#F0FBF2',
            border: '#BDE8C8'
        });
        y += posH + 36;

        // ---- Vak 2: negatief ----
        var negTitle = type === 'spelen'
            ? 'Met deze kinderen speel ik liever niet'
            : 'Met deze kinderen werk ik liever niet samen';
        wbDrawSection(ctx, y, {
            emoji: '\u{1F615}',
            title: negTitle,
            titleColor: '#D63031',
            bg: '#FFF4F0',
            border: '#FFD2C8'
        });

        // ---- Voettekst ----
        ctx.font = '22px Arial, sans-serif';
        ctx.fillStyle = '#B2BEC3';
        ctx.textAlign = 'center';
        ctx.fillText('Meestertools · Sociogram werkblad', W / 2, H - 44);
        ctx.textAlign = 'left';
    }

    async function generateWerkbladen() {
        if (!window.jspdf) return showError(setupError, 'PDF-bibliotheek is nog niet geladen. Probeer het zo nog eens.');

        var groupId = groupSelect.value;
        var type = (document.querySelector('input[name="sgType"]:checked') || {}).value;
        var datum = dateInput.value;

        if (!groupId) return showError(setupError, 'Kies eerst een klas.');
        if (!type) return showError(setupError, 'Kies "Samen werken" of "Samen spelen".');

        var wbStudents = await loadStudents(groupId);
        if (!wbStudents.length) return showError(setupError, 'Deze klas heeft nog geen leerlingen.');

        var monsterMap = assignMonsters(wbStudents);

        btnWerkblad.disabled = true;
        btnWerkblad.textContent = 'Bezig met maken...';

        try {
            var jsPDF = window.jspdf.jsPDF;
            var doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
            var pageW = doc.internal.pageSize.getWidth();
            var pageH = doc.internal.pageSize.getHeight();

            var work = document.createElement('canvas');
            work.width = WB.w;
            work.height = WB.h;
            var wctx = work.getContext('2d');

            for (var i = 0; i < wbStudents.length; i++) {
                var s = wbStudents[i];
                var n = monsterMap[s.id];
                var src = '../assets/avatars/monsters/monster-' + (n < 10 ? '0' + n : n) + '.png';
                var monsterImg = await wbLoadImage(src);
                wbPaint(wctx, s, monsterImg, type, datum);
                if (i > 0) doc.addPage('a4', 'portrait');
                doc.addImage(work.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, pageW, pageH);
            }

            var groupName = groups.find(function (g) { return g.id === groupId; })?.name || 'klas';
            doc.save('sociogram-werkbladen-' + type + '-' + groupName.replace(/\s+/g, '-').toLowerCase() + '.pdf');
        } catch (err) {
            console.error('Werkbladen genereren mislukt:', err);
            showError(setupError, 'Werkbladen maken is niet gelukt. Probeer het opnieuw.');
        }

        btnWerkblad.disabled = false;
        btnWerkblad.textContent = 'Download werkbladen (PDF)';
    }

    if (btnWerkblad) btnWerkblad.addEventListener('click', generateWerkbladen);

    // ---------- Init ----------
    renderWelcome();
});

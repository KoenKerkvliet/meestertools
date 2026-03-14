/* ============================================
   24 GAME - JavaScript (Kompas Layout)
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

    var container = document.getElementById('game24Container');
    if (!container) return;

    // State
    var allSets = [];
    var usedSetIds = [];
    var currentSet = null;          // { id, numbers, difficulty }
    var originalCards = [];          // cards at compass positions (indices 0-3)
    var resultCards = [];            // result cards at bottom
    var selectedCardRef = null;      // { source: 'original'|'result', index: number }
    var selectedOp = null;
    var steps = [];
    var gameOver = false;
    var score = { wins: 0, total: 0 };
    var selectedDifficulty = '';     // '' = all

    // ---------- Supabase ----------
    async function loadSets() {
        var result = await supabase
            .from('game24_sets')
            .select('id, numbers, difficulty')
            .order('created_at');

        allSets = result.data || [];
    }

    // ---------- Filtering ----------
    function getFilteredSets() {
        if (!selectedDifficulty) return allSets;
        return allSets.filter(function (s) {
            return s.difficulty === selectedDifficulty;
        });
    }

    // ---------- Difficulty helpers ----------
    function getDifficultyStars(difficulty) {
        if (difficulty === 'makkelijk') return 1;
        if (difficulty === 'moeilijk') return 3;
        return 2; // gemiddeld
    }

    function getStarsClass(difficulty) {
        return 'stars-' + getDifficultyStars(difficulty);
    }

    // ---------- New Game ----------
    function startNewGame() {
        var filtered = getFilteredSets();
        if (filtered.length === 0) return;

        // Get unused sets
        var unused = filtered.filter(function (s) {
            return usedSetIds.indexOf(s.id) === -1;
        });

        if (unused.length === 0) {
            usedSetIds = [];
            unused = filtered;
        }

        // Pick random set
        var idx = Math.floor(Math.random() * unused.length);
        currentSet = unused[idx];
        usedSetIds.push(currentSet.id);

        // Initialize original cards at compass positions
        originalCards = currentSet.numbers.map(function (n, i) {
            return { value: n, used: false };
        });

        resultCards = [];
        selectedCardRef = null;
        selectedOp = null;
        steps = [];
        gameOver = false;

        render();
    }

    function resetCurrentGame() {
        if (!currentSet) return;

        originalCards = currentSet.numbers.map(function (n, i) {
            return { value: n, used: false };
        });

        resultCards = [];
        selectedCardRef = null;
        selectedOp = null;
        steps = [];
        gameOver = false;

        render();
    }

    function undoLastStep() {
        if (steps.length === 0) return;

        steps.pop();

        // Replay from scratch
        originalCards = currentSet.numbers.map(function (n) {
            return { value: n, used: false };
        });
        resultCards = [];

        for (var i = 0; i < steps.length; i++) {
            var s = steps[i];
            // Mark original cards used
            if (s.srcA === 'original') originalCards[s.idxA].used = true;
            if (s.srcB === 'original') originalCards[s.idxB].used = true;
            // Mark result cards used
            if (s.srcA === 'result') resultCards[s.idxA].used = true;
            if (s.srcB === 'result') resultCards[s.idxB].used = true;
            // Add result card
            resultCards.push({ value: s.result, used: false });
        }

        selectedCardRef = null;
        selectedOp = null;
        gameOver = false;

        render();
    }

    // ---------- Card Selection ----------
    function getCard(ref) {
        if (ref.source === 'original') return originalCards[ref.index];
        return resultCards[ref.index];
    }

    function sameRef(a, b) {
        return a && b && a.source === b.source && a.index === b.index;
    }

    function selectCard(ref) {
        if (gameOver) return;

        var card = getCard(ref);
        if (card.used) return;

        if (selectedCardRef === null) {
            selectedCardRef = ref;
            render();
        } else if (sameRef(selectedCardRef, ref)) {
            selectedCardRef = null;
            render();
        } else if (selectedOp !== null) {
            performOperation(selectedCardRef, selectedOp, ref);
        } else {
            selectedCardRef = ref;
            render();
        }
    }

    function selectOperation(op) {
        if (gameOver) return;
        if (selectedCardRef === null) return;

        if (selectedOp === op) {
            selectedOp = null;
        } else {
            selectedOp = op;
        }
        render();
    }

    function performOperation(refA, op, refB) {
        var cardA = getCard(refA);
        var cardB = getCard(refB);
        var a = cardA.value;
        var b = cardB.value;
        var result;

        switch (op) {
            case '+': result = a + b; break;
            case '-': result = a - b; break;
            case '*': result = a * b; break;
            case '/':
                if (b === 0) {
                    selectedOp = null;
                    render();
                    return;
                }
                result = a / b;
                break;
        }

        // Record step with source info for undo
        steps.push({
            a: a, op: op, b: b, result: result,
            srcA: refA.source, idxA: refA.index,
            srcB: refB.source, idxB: refB.index
        });

        // Mark cards as used
        cardA.used = true;
        cardB.used = true;

        // Add result card
        resultCards.push({ value: result, used: false });

        selectedCardRef = null;
        selectedOp = null;

        // Check if game is done
        var activeCount = 0;
        var lastActive = null;

        for (var i = 0; i < originalCards.length; i++) {
            if (!originalCards[i].used) { activeCount++; lastActive = originalCards[i]; }
        }
        for (var j = 0; j < resultCards.length; j++) {
            if (!resultCards[j].used) { activeCount++; lastActive = resultCards[j]; }
        }

        if (activeCount === 1) {
            gameOver = true;
            score.total++;
            if (lastActive.value === 24) {
                score.wins++;
            }
        }

        render();
    }

    // ---------- Format Number ----------
    function formatNumber(n) {
        if (Number.isInteger(n)) return n.toString();
        var rounded = Math.round(n * 100) / 100;
        return rounded.toString();
    }

    // ---------- Get Instruction Text ----------
    function getInstruction() {
        if (gameOver) return '';
        if (selectedCardRef === null) return 'Kies een getal';
        if (selectedOp === null) return 'Kies een bewerking';
        return 'Kies het tweede getal';
    }

    // ---------- Set Difficulty Filter ----------
    function setDifficulty(diff) {
        selectedDifficulty = diff;
        // Reset game if no matching sets
        currentSet = null;
        originalCards = [];
        resultCards = [];
        selectedCardRef = null;
        selectedOp = null;
        steps = [];
        gameOver = false;
        render();
    }

    // ---------- Render ----------
    function render() {
        var filtered = getFilteredSets();

        if (allSets.length === 0) {
            container.innerHTML =
                '<div class="game24-empty">' +
                '    <span class="empty-icon">&#127922;</span>' +
                '    <p>Er zijn nog geen sets toegevoegd.<br>Vraag de beheerder om sets van 4 getallen toe te voegen.</p>' +
                '</div>';
            return;
        }

        // Difficulty filter buttons
        var filterHtml = '<div class="game24-diff-filter">';
        var filters = [
            { key: '', label: 'Alles' },
            { key: 'makkelijk', label: '\u2605 Makkelijk' },
            { key: 'gemiddeld', label: '\u2605\u2605 Gemiddeld' },
            { key: 'moeilijk', label: '\u2605\u2605\u2605 Moeilijk' }
        ];
        for (var f = 0; f < filters.length; f++) {
            var activeClass = selectedDifficulty === filters[f].key ? ' active' : '';
            filterHtml += '<button class="game24-diff-filter-btn' + activeClass + '" data-diff="' + filters[f].key + '">' + filters[f].label + '</button>';
        }
        filterHtml += '</div>';

        if (filtered.length === 0) {
            container.innerHTML = filterHtml +
                '<div class="game24-empty">' +
                '    <span class="empty-icon">&#127922;</span>' +
                '    <p>Geen sets beschikbaar voor deze moeilijkheidsgraad.</p>' +
                '    <button class="game24-btn game24-btn-new" id="btnShowAll">\ud83d\udd0d Toon alles</button>' +
                '</div>';
            bindFilterButtons();
            var btnShowAll = document.getElementById('btnShowAll');
            if (btnShowAll) btnShowAll.addEventListener('click', function () { setDifficulty(''); });
            return;
        }

        if (!currentSet) {
            container.innerHTML = filterHtml +
                '<div class="game24-target">' +
                '    <div class="game24-target-label">Doel</div>' +
                '    <div class="game24-target-number">24</div>' +
                '</div>' +
                '<p style="color:var(--text-medium);text-align:center;font-size:15px;max-width:360px;">Combineer 4 getallen met +, &minus;, &times; en &divide; om precies 24 te maken. Gebruik elk getal precies 1 keer!</p>' +
                '<div class="game24-actions">' +
                '    <button class="game24-btn game24-btn-new" id="btnNewGame">&#127922; Start spel</button>' +
                '</div>';

            bindFilterButtons();
            document.getElementById('btnNewGame').addEventListener('click', startNewGame);
            return;
        }

        var html = '';
        var difficulty = currentSet.difficulty || 'gemiddeld';
        var starCount = getDifficultyStars(difficulty);
        var starsStr = '\u2605'.repeat(starCount);
        var starsClass = getStarsClass(difficulty);

        // Two-column layout
        html += '<div class="game24-layout">';

        // === LEFT COLUMN: Board ===
        html += '<div class="game24-col-board">';
        html += '<div class="game24-board-wrapper">';
        html += '<div class="game24-board-circle"></div>';
        html += '<div class="game24-board-cross"></div>';

        // Difficulty indicator below + button in rode balk
        html += '<div class="game24-diff-indicator diff-' + difficulty + '">' + starsStr + '</div>';

        html += '<div class="game24-compass">';
        html += renderOpButton('+', '+', 'n');
        html += renderOriginalCard(0, 'nw');
        html += renderOriginalCard(1, 'no');
        html += renderOpButton('-', '\u2212', 'w');

        // Center: score (rode ruit - alleen getal)
        html += '<div class="game24-pos-center">';
        html += '<div class="game24-center">';
        html += '<div class="game24-center-value">' + score.wins + '</div>';
        html += '</div>';
        html += '</div>';

        html += renderOpButton('*', '\u00D7', 'o');
        html += renderOriginalCard(2, 'zw');
        html += renderOriginalCard(3, 'zo');
        html += renderOpButton('/', '\u00F7', 'z');
        html += '</div>'; // end compass
        html += '</div>'; // end board-wrapper
        html += '</div>'; // end col-board

        // === RIGHT COLUMN: Controls ===
        html += '<div class="game24-col-panel">';

        // Difficulty filter in panel
        html += filterHtml;

        // Instruction
        if (!gameOver) {
            var instruction = getInstruction();
            var highlightClass = selectedCardRef !== null ? ' highlight' : '';
            html += '<div class="game24-instruction' + highlightClass + '">' + escapeHtml(instruction) + '</div>';
        }

        // Results area
        html += '<div class="game24-results-area">';
        html += '<div class="game24-results-label">Resultaten</div>';
        html += '<div class="game24-results-row">';
        if (resultCards.length === 0) {
            html += '<span class="game24-results-empty">Maak een bewerking om resultaten te zien</span>';
        } else {
            for (var r = 0; r < resultCards.length; r++) {
                var rc = resultCards[r];
                var rcClasses = 'game24-result-card';
                if (rc.used) rcClasses += ' used';
                if (selectedCardRef && sameRef(selectedCardRef, { source: 'result', index: r })) rcClasses += ' selected';
                if (gameOver && !rc.used) rcClasses += ' disabled';

                html += '<div class="' + rcClasses + '" data-result-index="' + r + '">';
                html += '<span class="game24-result-step">Stap ' + (r + 1) + '</span>';
                html += formatNumber(rc.value);
                html += '</div>';
            }
        }
        html += '</div>';
        html += '</div>';

        // Steps history
        if (steps.length > 0) {
            html += '<div class="game24-steps">';
            html += '<div class="game24-steps-title">Stappen</div>';
            for (var k = 0; k < steps.length; k++) {
                var s = steps[k];
                var opSymbol = s.op === '*' ? '\u00D7' : s.op === '/' ? '\u00F7' : s.op === '-' ? '\u2212' : s.op;
                html += '<div class="game24-step">';
                html += '<span class="step-num">' + (k + 1) + '.</span>';
                html += '<span class="step-calc">' + formatNumber(s.a) + ' ' + opSymbol + ' ' + formatNumber(s.b) + ' = ' + formatNumber(s.result) + '</span>';
                html += '</div>';
            }
            html += '</div>';
        }

        // Game over
        if (gameOver) {
            var activeCards = getAllActiveCards();
            var finalValue = activeCards[0].value;
            if (finalValue === 24) {
                html += '<div class="game24-gameover win animate">';
                html += '<span class="game24-gameover-icon">&#127881;</span>';
                html += '<div class="game24-gameover-text">Goed gedaan!</div>';
                html += '<div class="game24-gameover-sub">Je hebt 24 gemaakt!</div>';
                html += '</div>';
            } else {
                html += '<div class="game24-gameover lose animate">';
                html += '<span class="game24-gameover-icon">&#128533;</span>';
                html += '<div class="game24-gameover-text">Helaas, ' + formatNumber(finalValue) + '</div>';
                html += '<div class="game24-gameover-sub">Het resultaat is niet 24.</div>';
                html += '</div>';
            }
        }

        // Action buttons
        html += '<div class="game24-actions">';
        if (gameOver) {
            html += '<button class="game24-btn game24-btn-new" id="btnNewGame">&#127922; Nieuw spel</button>';
            html += '<button class="game24-btn game24-btn-reset" id="btnReset">&#128260; Opnieuw</button>';
        } else {
            html += '<button class="game24-btn game24-btn-undo" id="btnUndo"' + (steps.length === 0 ? ' disabled' : '') + '>&#8592; Undo</button>';
            html += '<button class="game24-btn game24-btn-reset" id="btnReset"' + (steps.length === 0 ? ' disabled' : '') + '>&#128260; Reset</button>';
            html += '<button class="game24-btn game24-btn-new" id="btnNewGame">&#127922; Nieuw spel</button>';
        }
        html += '</div>';

        html += '</div>'; // end col-panel
        html += '</div>'; // end layout

        container.innerHTML = html;

        // Bind events
        bindFilterButtons();
        bindCardClicks();
        bindOpClicks();
        bindResultCardClicks();

        var btnNew = document.getElementById('btnNewGame');
        if (btnNew) btnNew.addEventListener('click', startNewGame);

        var btnReset = document.getElementById('btnReset');
        if (btnReset) btnReset.addEventListener('click', resetCurrentGame);

        var btnUndo = document.getElementById('btnUndo');
        if (btnUndo) btnUndo.addEventListener('click', undoLastStep);
    }

    // ---------- Render Helpers ----------
    function renderOriginalCard(index, position) {
        var card = originalCards[index];
        var classes = 'game24-card game24-pos-' + position;
        if (card.used) classes += ' used';
        if (selectedCardRef && sameRef(selectedCardRef, { source: 'original', index: index })) classes += ' selected';
        if (gameOver && !card.used) classes += ' disabled';

        var html = '<div class="' + classes + '" data-card-index="' + index + '">';
        html += formatNumber(card.value);
        html += '</div>';
        return html;
    }

    function renderOpButton(opValue, opSymbol, position) {
        var opsDisabled = selectedCardRef === null || gameOver;
        var opClass = 'game24-op-btn game24-pos-' + position;
        if (selectedOp === opValue) opClass += ' selected';

        return '<button class="' + opClass + '" data-op="' + opValue + '"' + (opsDisabled ? ' disabled' : '') + '>' + opSymbol + '</button>';
    }

    // ---------- Get all active cards ----------
    function getAllActiveCards() {
        var active = [];
        for (var i = 0; i < originalCards.length; i++) {
            if (!originalCards[i].used) active.push(originalCards[i]);
        }
        for (var j = 0; j < resultCards.length; j++) {
            if (!resultCards[j].used) active.push(resultCards[j]);
        }
        return active;
    }

    // ---------- Event Binding ----------
    function bindFilterButtons() {
        var filterBtns = container.querySelectorAll('.game24-diff-filter-btn');
        for (var i = 0; i < filterBtns.length; i++) {
            filterBtns[i].addEventListener('click', function () {
                setDifficulty(this.getAttribute('data-diff'));
            });
        }
    }

    function bindCardClicks() {
        var cardEls = container.querySelectorAll('.game24-card:not(.used):not(.disabled)');
        for (var i = 0; i < cardEls.length; i++) {
            cardEls[i].addEventListener('click', function () {
                var idx = parseInt(this.getAttribute('data-card-index'));
                selectCard({ source: 'original', index: idx });
            });
        }
    }

    function bindOpClicks() {
        var opEls = container.querySelectorAll('.game24-op-btn');
        for (var i = 0; i < opEls.length; i++) {
            opEls[i].addEventListener('click', function () {
                selectOperation(this.getAttribute('data-op'));
            });
        }
    }

    function bindResultCardClicks() {
        var rcEls = container.querySelectorAll('.game24-result-card:not(.used):not(.disabled)');
        for (var i = 0; i < rcEls.length; i++) {
            rcEls[i].addEventListener('click', function () {
                var idx = parseInt(this.getAttribute('data-result-index'));
                selectCard({ source: 'result', index: idx });
            });
        }
    }

    // ---------- Utility ----------
    function escapeHtml(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ---------- Init ----------
    async function init() {
        await loadSets();
        render();
    }

    init();
});

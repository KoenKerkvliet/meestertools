/* ============================================
   24 GAME - JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

    var container = document.getElementById('game24Container');
    if (!container) return;

    // State
    var allSets = [];
    var usedSetIds = [];
    var currentSet = null;      // { id, numbers: [a,b,c,d] }
    var cards = [];             // active cards: [{ value, id, isResult }]
    var selectedCardIndex = null;
    var selectedOp = null;
    var steps = [];             // history: [{ a, op, b, result }]
    var gameOver = false;
    var score = { wins: 0, total: 0 };

    // ---------- Supabase ----------
    async function loadSets() {
        var result = await supabase
            .from('game24_sets')
            .select('id, numbers')
            .order('created_at');

        allSets = result.data || [];
    }

    // ---------- New Game ----------
    function startNewGame() {
        if (allSets.length === 0) return;

        // Get unused sets
        var unused = allSets.filter(function (s) {
            return usedSetIds.indexOf(s.id) === -1;
        });

        if (unused.length === 0) {
            usedSetIds = [];
            unused = allSets;
        }

        // Pick random set
        var idx = Math.floor(Math.random() * unused.length);
        currentSet = unused[idx];
        usedSetIds.push(currentSet.id);

        // Initialize cards
        cards = currentSet.numbers.map(function (n, i) {
            return { value: n, id: 'card-' + i, isResult: false, used: false };
        });

        selectedCardIndex = null;
        selectedOp = null;
        steps = [];
        gameOver = false;

        render();
    }

    function resetCurrentGame() {
        if (!currentSet) return;

        cards = currentSet.numbers.map(function (n, i) {
            return { value: n, id: 'card-' + i, isResult: false, used: false };
        });

        selectedCardIndex = null;
        selectedOp = null;
        steps = [];
        gameOver = false;

        render();
    }

    function undoLastStep() {
        if (steps.length === 0) return;

        var lastStep = steps.pop();

        // Restore the result card to unused state and bring back original cards
        cards = [];
        if (steps.length === 0) {
            // Reset to original
            cards = currentSet.numbers.map(function (n, i) {
                return { value: n, id: 'card-' + i, isResult: false, used: false };
            });
        } else {
            // Replay all steps from scratch
            var tempCards = currentSet.numbers.map(function (n, i) {
                return { value: n, id: 'card-' + i, isResult: false, used: false };
            });

            for (var i = 0; i < steps.length; i++) {
                var s = steps[i];
                // Find the two cards used
                var cardA = null, cardB = null;
                for (var j = 0; j < tempCards.length; j++) {
                    if (!tempCards[j].used && tempCards[j].value === s.a && cardA === null) {
                        cardA = j;
                    } else if (!tempCards[j].used && tempCards[j].value === s.b && cardB === null) {
                        cardB = j;
                    }
                }
                if (cardA !== null) tempCards[cardA].used = true;
                if (cardB !== null) tempCards[cardB].used = true;

                tempCards.push({ value: s.result, id: 'result-' + i, isResult: true, used: false });
            }

            cards = tempCards;
        }

        selectedCardIndex = null;
        selectedOp = null;
        gameOver = false;

        render();
    }

    // ---------- Card Selection ----------
    function selectCard(index) {
        if (gameOver) return;

        var card = cards[index];
        if (card.used) return;

        if (selectedCardIndex === null) {
            // First card selected
            selectedCardIndex = index;
            render();
        } else if (selectedCardIndex === index) {
            // Deselect
            selectedCardIndex = null;
            render();
        } else if (selectedOp !== null) {
            // We have first card + op, this is the second card
            performOperation(selectedCardIndex, selectedOp, index);
        } else {
            // Switch selection to this card
            selectedCardIndex = index;
            render();
        }
    }

    function selectOperation(op) {
        if (gameOver) return;
        if (selectedCardIndex === null) return;

        selectedOp = op;
        render();
    }

    function performOperation(cardAIndex, op, cardBIndex) {
        var a = cards[cardAIndex].value;
        var b = cards[cardBIndex].value;
        var result;

        switch (op) {
            case '+': result = a + b; break;
            case '-': result = a - b; break;
            case '*': result = a * b; break;
            case '/':
                if (b === 0) {
                    alert('Delen door 0 is niet mogelijk.');
                    selectedOp = null;
                    render();
                    return;
                }
                result = a / b;
                break;
        }

        // Record step
        steps.push({ a: a, op: op, b: b, result: result });

        // Mark cards as used, add result card
        cards[cardAIndex].used = true;
        cards[cardBIndex].used = true;
        cards.push({ value: result, id: 'result-' + steps.length, isResult: true, used: false });

        selectedCardIndex = null;
        selectedOp = null;

        // Check if game is done (only 1 card remaining)
        var activeCards = cards.filter(function (c) { return !c.used; });
        if (activeCards.length === 1) {
            gameOver = true;
            score.total++;
            if (activeCards[0].value === 24) {
                score.wins++;
            }
        }

        render();
    }

    // ---------- Format Number ----------
    function formatNumber(n) {
        // Show nice fractions or integers
        if (Number.isInteger(n)) return n.toString();
        // Round to 2 decimals
        var rounded = Math.round(n * 100) / 100;
        return rounded.toString();
    }

    // ---------- Get Instruction Text ----------
    function getInstruction() {
        if (gameOver) return '';
        if (selectedCardIndex === null) return 'Kies een getal';
        if (selectedOp === null) return 'Kies een bewerking';
        return 'Kies het tweede getal';
    }

    // ---------- Render ----------
    function render() {
        if (allSets.length === 0) {
            container.innerHTML =
                '<div class="game24-empty">' +
                '    <span class="empty-icon">&#127922;</span>' +
                '    <p>Er zijn nog geen sets toegevoegd.<br>Vraag de beheerder om sets van 4 getallen toe te voegen.</p>' +
                '</div>';
            return;
        }

        if (!currentSet) {
            container.innerHTML =
                '<div class="game24-target">' +
                '    <div class="game24-target-label">Doel</div>' +
                '    <div class="game24-target-number">24</div>' +
                '</div>' +
                '<p style="color:var(--text-medium);text-align:center;font-size:15px;max-width:360px;">Combineer 4 getallen met +, &minus;, &times; en &divide; om precies 24 te maken. Gebruik elk getal precies 1 keer!</p>' +
                '<div class="game24-actions">' +
                '    <button class="game24-btn game24-btn-new" id="btnNewGame">&#127922; Start spel</button>' +
                '</div>';

            document.getElementById('btnNewGame').addEventListener('click', startNewGame);
            return;
        }

        var html = '';
        var activeCards = cards.filter(function (c) { return !c.used; });

        // Score
        if (score.total > 0) {
            html += '<div class="game24-score">';
            html += '<div class="game24-score-item"><div class="game24-score-value">' + score.wins + '</div><div class="game24-score-label">Goed</div></div>';
            html += '<div class="game24-score-item"><div class="game24-score-value">' + score.total + '</div><div class="game24-score-label">Gespeeld</div></div>';
            html += '</div>';
        }

        // Target
        html += '<div class="game24-target">';
        html += '<div class="game24-target-label">Maak</div>';
        html += '<div class="game24-target-number">24</div>';
        html += '</div>';

        if (!gameOver) {
            // Instruction
            var instruction = getInstruction();
            var highlightClass = selectedCardIndex !== null ? ' highlight' : '';
            html += '<div class="game24-instruction' + highlightClass + '">' + escapeHtml(instruction) + '</div>';
        }

        // Cards
        html += '<div class="game24-cards">';
        for (var i = 0; i < cards.length; i++) {
            var card = cards[i];
            var classes = 'game24-card';
            if (card.used) classes += ' used';
            if (i === selectedCardIndex) classes += ' selected';
            if (card.isResult && !card.used) classes += ' result-card';
            if (gameOver && !card.used) classes += ' disabled';

            html += '<div class="' + classes + '" data-card-index="' + i + '">';
            html += formatNumber(card.value);
            html += '</div>';
        }
        html += '</div>';

        // Operations
        if (!gameOver) {
            var opsDisabled = selectedCardIndex === null;
            html += '<div class="game24-operations">';
            var ops = ['+', '-', '\u00D7', '\u00F7'];
            var opValues = ['+', '-', '*', '/'];
            for (var j = 0; j < ops.length; j++) {
                var opClass = 'game24-op-btn';
                if (selectedOp === opValues[j]) opClass += ' selected';
                html += '<button class="' + opClass + '" data-op="' + opValues[j] + '"' + (opsDisabled ? ' disabled' : '') + '>' + ops[j] + '</button>';
            }
            html += '</div>';
        }

        // Steps history
        if (steps.length > 0) {
            html += '<div class="game24-steps">';
            html += '<div class="game24-steps-title">Stappen</div>';
            for (var k = 0; k < steps.length; k++) {
                var s = steps[k];
                var opSymbol = s.op === '*' ? '\u00D7' : s.op === '/' ? '\u00F7' : s.op;
                html += '<div class="game24-step">';
                html += '<span class="step-num">' + (k + 1) + '.</span>';
                html += '<span class="step-calc">' + formatNumber(s.a) + ' ' + opSymbol + ' ' + formatNumber(s.b) + ' = ' + formatNumber(s.result) + '</span>';
                html += '</div>';
            }
            html += '</div>';
        }

        // Game over result
        if (gameOver) {
            var finalValue = activeCards[0].value;
            if (finalValue === 24) {
                html += '<div class="game24-result win animate">';
                html += '<span class="game24-result-icon">&#127881;</span>';
                html += '<div class="game24-result-text">Goed gedaan!</div>';
                html += '<div class="game24-result-sub">Je hebt 24 gemaakt!</div>';
                html += '</div>';
            } else {
                html += '<div class="game24-result lose animate">';
                html += '<span class="game24-result-icon">&#128533;</span>';
                html += '<div class="game24-result-text">Helaas, ' + formatNumber(finalValue) + '</div>';
                html += '<div class="game24-result-sub">Het resultaat is niet 24. Probeer het opnieuw!</div>';
                html += '</div>';
            }
        }

        // Action buttons
        html += '<div class="game24-actions">';
        if (gameOver) {
            html += '<button class="game24-btn game24-btn-new" id="btnNewGame">&#127922; Nieuw spel</button>';
            html += '<button class="game24-btn game24-btn-reset" id="btnReset">&#128260; Opnieuw proberen</button>';
        } else {
            html += '<button class="game24-btn game24-btn-undo" id="btnUndo"' + (steps.length === 0 ? ' disabled' : '') + '>&#8592; Ongedaan maken</button>';
            html += '<button class="game24-btn game24-btn-reset" id="btnReset"' + (steps.length === 0 ? ' disabled' : '') + '>&#128260; Reset</button>';
            html += '<button class="game24-btn game24-btn-new" id="btnNewGame">&#127922; Nieuw spel</button>';
        }
        html += '</div>';

        container.innerHTML = html;

        // Bind card clicks
        var cardEls = container.querySelectorAll('.game24-card:not(.used):not(.disabled)');
        for (var ci = 0; ci < cardEls.length; ci++) {
            cardEls[ci].addEventListener('click', function () {
                var idx = parseInt(this.getAttribute('data-card-index'));
                selectCard(idx);
            });
        }

        // Bind operation clicks
        var opEls = container.querySelectorAll('.game24-op-btn');
        for (var oi = 0; oi < opEls.length; oi++) {
            opEls[oi].addEventListener('click', function () {
                selectOperation(this.getAttribute('data-op'));
            });
        }

        // Bind action buttons
        var btnNew = document.getElementById('btnNewGame');
        if (btnNew) btnNew.addEventListener('click', startNewGame);

        var btnReset = document.getElementById('btnReset');
        if (btnReset) btnReset.addEventListener('click', resetCurrentGame);

        var btnUndo = document.getElementById('btnUndo');
        if (btnUndo) btnUndo.addEventListener('click', undoLastStep);
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

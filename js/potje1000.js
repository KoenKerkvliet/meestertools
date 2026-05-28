/* ============================================
   POTJE 1000 - JavaScript

   Spel: gooi 6 keer een dobbelsteen. Elke worp schrijven de
   leerlingen het aantal ogen in 1 van de 6 bovenste vakjes van
   hun schema (2 rijen van 3 cijfers = twee getallen). Daarna
   tellen ze de twee getallen op en proberen ze zo dicht mogelijk
   bij het doel te komen.

   Drie modi (altijd 6 worpen):
     - Hele getallen  -> twee getallen H-T-E,  doel 1000
     - 2 decimalen    -> twee getallen E,th,   doel 10
     - 3 decimalen    -> twee getallen 0,thd,  doel 1  (de "0," staat al ingevuld)

   Onder water is de rekenpuzzel in alle modi identiek: verdeel de
   6 ogen over twee 3-cijferige getallen waarvan de som het dichtst
   bij 1000 ligt. Alleen de komma-positie, de vaste "0," en het doel
   verschillen. De knop 'Controleer' vult de optimale verdeling in.
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    const MAX_ROLLS = 6;
    const TARGET = 1000; // interne rekendoel (altijd 1000)

    // ---------- Modi ----------
    // topTokens: opbouw van een bovenste rij (links->rechts).
    //   cell  -> dobbelsteenvakje, 'place' = index in de oplossing (0=meest significant)
    //   fixed -> vast vakje met waarde 'val' (bv. de voorgevulde 0)
    //   comma -> kommateken
    // totalTokens: opbouw van de totaalrij, 'pad' = index in het 4-cijferige totaal.
    const MODES = {
        heel: {
            name: 'Hele getallen', targetText: '1000', decimals: 0, divisor: 1,
            topTokens: [
                { type: 'cell', place: 0, h: 'H' },
                { type: 'cell', place: 1, h: 'T' },
                { type: 'cell', place: 2, h: 'E' }
            ],
            totalTokens: [
                { type: 'cell', pad: 0, h: 'D', blankZero: true },
                { type: 'cell', pad: 1, h: 'H' },
                { type: 'cell', pad: 2, h: 'T' },
                { type: 'cell', pad: 3, h: 'E' }
            ]
        },
        dec1: {
            name: '1 decimaal', targetText: '100', decimals: 1, divisor: 10,
            topTokens: [
                { type: 'cell', place: 0, h: 'T' },
                { type: 'cell', place: 1, h: 'E' },
                { type: 'comma' },
                { type: 'cell', place: 2, h: 't' }
            ],
            totalTokens: [
                { type: 'cell', pad: 0, h: 'H', blankZero: true },
                { type: 'cell', pad: 1, h: 'T' },
                { type: 'cell', pad: 2, h: 'E' },
                { type: 'comma' },
                { type: 'cell', pad: 3, h: 't' }
            ]
        },
        dec2: {
            name: '2 decimalen', targetText: '10', decimals: 2, divisor: 100,
            topTokens: [
                { type: 'cell', place: 0, h: 'E' },
                { type: 'comma' },
                { type: 'cell', place: 1, h: 't' },
                { type: 'cell', place: 2, h: 'h' }
            ],
            totalTokens: [
                { type: 'cell', pad: 0, h: 'T', blankZero: true },
                { type: 'cell', pad: 1, h: 'E' },
                { type: 'comma' },
                { type: 'cell', pad: 2, h: 't' },
                { type: 'cell', pad: 3, h: 'h' }
            ]
        },
        dec3: {
            name: '3 decimalen', targetText: '1', decimals: 3, divisor: 1000,
            topTokens: [
                { type: 'fixed', val: '0', h: 'E' },
                { type: 'comma' },
                { type: 'cell', place: 0, h: 't' },
                { type: 'cell', place: 1, h: 'h' },
                { type: 'cell', place: 2, h: 'd' }
            ],
            totalTokens: [
                { type: 'cell', pad: 0, h: 'E' },
                { type: 'comma' },
                { type: 'cell', pad: 1, h: 't' },
                { type: 'cell', pad: 2, h: 'h' },
                { type: 'cell', pad: 3, h: 'd' }
            ]
        }
    };

    // ---------- DOM ----------
    const diceEl = document.getElementById('p1000Dice');
    const counterEl = document.getElementById('p1000Counter');
    const rollBtn = document.getElementById('p1000RollBtn');
    const checkBtn = document.getElementById('p1000CheckBtn');
    const resetBtn = document.getElementById('p1000ResetBtn');
    const historyEl = document.getElementById('p1000History');
    const schemaEl = document.getElementById('p1000Schema');
    const questionEl = document.getElementById('p1000Question');
    const resultEl = document.getElementById('p1000Result');
    const modesEl = document.getElementById('p1000Modes');

    if (!diceEl || !rollBtn || !schemaEl) return;

    const pips = Array.from(diceEl.querySelectorAll('.p1000-pip'));

    const PIP_MAP = {
        1: [4], 2: [0, 8], 3: [0, 4, 8],
        4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8]
    };

    // ---------- State ----------
    let mode = 'heel';
    let rolls = [];
    let rolling = false;
    let revealed = false;

    // ---------- Helpers ----------
    function el(cls, txt) {
        const d = document.createElement('div');
        d.className = cls;
        if (txt != null) d.textContent = txt;
        return d;
    }

    function rowInt(row) { return 100 * row[0] + 10 * row[1] + row[2]; }

    // Formatteer een geheel getal volgens de huidige modus (komma-notatie).
    function fmt(intVal) {
        const m = MODES[mode];
        if (m.decimals === 0) return String(intVal);
        return (intVal / m.divisor).toFixed(m.decimals).replace('.', ',');
    }

    // ---------- Dobbelsteen ----------
    function drawDice(value) {
        const on = PIP_MAP[value] || [];
        pips.forEach((pip, i) => pip.classList.toggle('on', on.includes(i)));
    }

    function updateCounter() {
        if (rolls.length < MAX_ROLLS) {
            counterEl.textContent = 'Worp ' + (rolls.length + 1) + ' van ' + MAX_ROLLS;
            counterEl.classList.remove('done');
        } else {
            counterEl.textContent = 'Alle 6 worpen gedaan!';
            counterEl.classList.add('done');
        }
    }

    function addHistory(value) {
        const die = document.createElement('div');
        die.className = 'p1000-hist-die';
        die.textContent = value;
        historyEl.appendChild(die);
    }

    function roll() {
        if (rolling || rolls.length >= MAX_ROLLS) return;
        rolling = true;
        rollBtn.disabled = true;

        diceEl.classList.remove('rolling');
        void diceEl.offsetWidth;
        diceEl.classList.add('rolling');

        const flicker = setInterval(() => drawDice(1 + Math.floor(Math.random() * 6)), 70);

        setTimeout(() => {
            clearInterval(flicker);
            const value = 1 + Math.floor(Math.random() * 6);
            drawDice(value);
            rolls.push(value);
            addHistory(value);
            updateCounter();
            diceEl.classList.remove('rolling');
            rolling = false;

            if (rolls.length >= MAX_ROLLS) {
                rollBtn.style.display = 'none';
                checkBtn.style.display = '';
                checkBtn.disabled = false;
                resetBtn.style.display = '';
            } else {
                rollBtn.disabled = false;
            }
        }, 500);
    }

    // ---------- Beste verdeling ----------
    // Verdeel de 6 ogen over 3 plaatswaarden (2 per plaats). De twee
    // rijen vormen samen de optelsom. Zoek de verdeling die de som het
    // dichtst bij 1000 brengt.
    function bestArrangement(values) {
        let best = null;
        for (let a = 0; a < 6; a++) {
            for (let b = a + 1; b < 6; b++) {
                const rest = [0, 1, 2, 3, 4, 5].filter(i => i !== a && i !== b);
                for (let c = 0; c < rest.length; c++) {
                    for (let d = c + 1; d < rest.length; d++) {
                        const tIdx = [rest[c], rest[d]];
                        const eIdx = rest.filter(i => i !== rest[c] && i !== rest[d]);
                        const hSum = values[a] + values[b];
                        const tSum = values[tIdx[0]] + values[tIdx[1]];
                        const eSum = values[eIdx[0]] + values[eIdx[1]];
                        const total = 100 * hSum + 10 * tSum + eSum;
                        const diff = Math.abs(total - TARGET);
                        if (!best || diff < best.diff) {
                            best = {
                                diff: diff,
                                total: total,
                                rows: [
                                    [values[a], values[tIdx[0]], values[eIdx[0]]],
                                    [values[b], values[tIdx[1]], values[eIdx[1]]]
                                ]
                            };
                        }
                    }
                }
            }
        }
        return best;
    }

    // ---------- Schema opbouwen (per modus) ----------
    function buildSchema() {
        const m = MODES[mode];
        schemaEl.innerHTML = '';

        // Kopletters boven de bovenste rijen
        const headers = el('p1000-headers');
        m.topTokens.forEach(tok => {
            headers.appendChild(tok.type === 'comma' ? el('p1000-hcomma') : el('p1000-hcell', tok.h));
        });
        schemaEl.appendChild(headers);

        // Twee bovenste rijen
        const top = el('p1000-top');
        for (let r = 0; r < 2; r++) {
            const row = el('p1000-row');
            m.topTokens.forEach(tok => {
                if (tok.type === 'comma') {
                    row.appendChild(el('p1000-comma', ','));
                } else if (tok.type === 'fixed') {
                    row.appendChild(el('p1000-cell prefilled', tok.val));
                } else {
                    const c = el('p1000-cell');
                    c.dataset.row = r;
                    c.dataset.place = tok.place;
                    row.appendChild(c);
                }
            });
            top.appendChild(row);
        }
        schemaEl.appendChild(top);

        schemaEl.appendChild(el('p1000-plus', '+'));

        // Totaalrij
        const wrap = el('p1000-total-wrap');
        wrap.appendChild(el('p1000-total-label', 'totaal:'));
        const total = el('p1000-total');
        m.totalTokens.forEach(tok => {
            if (tok.type === 'comma') {
                total.appendChild(el('p1000-tcomma', ','));
            } else {
                const c = el('p1000-tcell');
                c.dataset.pad = tok.pad;
                if (tok.blankZero) c.dataset.blankZero = '1';
                c.appendChild(el('p1000-tlabel', tok.h));
                total.appendChild(c);
            }
        });
        wrap.appendChild(total);
        schemaEl.appendChild(wrap);
    }

    function updateQuestion() {
        questionEl.textContent = 'Wie komt het dichtst bij de ' + MODES[mode].targetText + '?';
    }

    // ---------- Invullen / onthullen ----------
    function fillCell(cell, value, delay) {
        setTimeout(() => {
            cell.textContent = value;
            cell.classList.add('filled');
        }, delay);
    }

    function fillTotalCell(cell, value, delay) {
        const label = cell.querySelector('.p1000-tlabel');
        setTimeout(() => {
            cell.textContent = value;
            if (label) cell.appendChild(label);
            if (value !== '') cell.classList.add('filled');
        }, delay);
    }

    function doReveal(animate) {
        const best = bestArrangement(rolls);
        let delay = 0;
        const step = animate ? 120 : 0;

        schemaEl.querySelectorAll('.p1000-cell[data-row]').forEach(cell => {
            const r = parseInt(cell.dataset.row, 10);
            const p = parseInt(cell.dataset.place, 10);
            fillCell(cell, best.rows[r][p], delay);
            delay += step;
        });

        const padded = String(best.total).padStart(4, '0');
        schemaEl.querySelectorAll('.p1000-tcell[data-pad]').forEach(cell => {
            let digit = padded[parseInt(cell.dataset.pad, 10)];
            if (cell.dataset.blankZero && digit === '0') digit = '';
            fillTotalCell(cell, digit, delay);
            delay += step;
        });

        setTimeout(() => showResult(best), delay + (animate ? 100 : 0));
    }

    function showResult(best) {
        const n1 = fmt(rowInt(best.rows[0]));
        const n2 = fmt(rowInt(best.rows[1]));
        const sum = fmt(best.total);
        const targetText = MODES[mode].targetText;
        const perfect = best.diff === 0;

        resultEl.className = 'p1000-result' + (perfect ? ' perfect' : '');
        resultEl.innerHTML =
            '<div class="p1000-result-sum">' + n1 + ' + ' + n2 + ' = ' + sum + '</div>' +
            '<div class="p1000-result-diff">' +
            (perfect
                ? '&#127881; Precies ' + targetText + '! Dit is de beste oplossing.'
                : 'De beste oplossing zit <strong>' + fmt(best.diff) + '</strong> van de ' + targetText + ' af.') +
            '</div>';
        resultEl.style.display = '';
    }

    function check() {
        revealed = true;
        checkBtn.disabled = true;
        checkBtn.style.display = 'none';
        doReveal(true);
    }

    // ---------- Modus wisselen ----------
    function setMode(newMode) {
        if (!MODES[newMode] || newMode === mode) return;
        mode = newMode;
        Array.from(modesEl.querySelectorAll('.p1000-mode')).forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });
        buildSchema();
        updateQuestion();
        // Schema opnieuw vullen als de oplossing al onthuld was (zonder animatie).
        if (revealed && rolls.length === MAX_ROLLS) {
            doReveal(false);
        }
    }

    // ---------- Reset ----------
    function reset() {
        rolls = [];
        rolling = false;
        revealed = false;
        historyEl.innerHTML = '';
        resultEl.style.display = 'none';
        resultEl.innerHTML = '';

        buildSchema();
        pips.forEach(pip => pip.classList.remove('on'));
        updateCounter();

        rollBtn.style.display = '';
        rollBtn.disabled = false;
        checkBtn.style.display = 'none';
        checkBtn.disabled = false;
        resetBtn.style.display = 'none';
    }

    // ---------- Events ----------
    rollBtn.addEventListener('click', roll);
    checkBtn.addEventListener('click', check);
    resetBtn.addEventListener('click', reset);
    modesEl.addEventListener('click', (e) => {
        const btn = e.target.closest('.p1000-mode');
        if (btn) setMode(btn.dataset.mode);
    });

    // ---------- Init ----------
    buildSchema();
    updateQuestion();
    updateCounter();
});

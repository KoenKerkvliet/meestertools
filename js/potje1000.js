/* ============================================
   POTJE 1000 - JavaScript

   Spel: gooi 6 keer een dobbelsteen. Elke worp schrijven de
   leerlingen het aantal ogen in 1 van de 6 bovenste vakjes van
   hun HTE-schema (2 rijen van H-T-E = twee getallen van 3 cijfers).
   Daarna tellen ze de twee getallen op. Wie het dichtst bij 1000
   komt, wint.

   De knop 'Controleer' berekent de OPTIMALE verdeling van de 6
   gegooide ogen en vult het schema in, zodat je de beste oplossing
   kunt laten zien.
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    const MAX_ROLLS = 6;
    const TARGET = 1000;

    // ---------- DOM ----------
    const diceEl = document.getElementById('p1000Dice');
    const counterEl = document.getElementById('p1000Counter');
    const rollBtn = document.getElementById('p1000RollBtn');
    const checkBtn = document.getElementById('p1000CheckBtn');
    const resetBtn = document.getElementById('p1000ResetBtn');
    const historyEl = document.getElementById('p1000History');
    const topEl = document.getElementById('p1000Top');
    const totalEl = document.getElementById('p1000Total');
    const resultEl = document.getElementById('p1000Result');

    if (!diceEl || !rollBtn) return;

    const pips = Array.from(diceEl.querySelectorAll('.p1000-pip'));
    const topCells = Array.from(topEl.querySelectorAll('.p1000-cell'));
    const totalCells = Array.from(totalEl.querySelectorAll('.p1000-tcell'));

    // Pip-posities per dobbelsteenwaarde (raster 0-8)
    const PIP_MAP = {
        1: [4],
        2: [0, 8],
        3: [0, 4, 8],
        4: [0, 2, 6, 8],
        5: [0, 2, 4, 6, 8],
        6: [0, 2, 3, 5, 6, 8]
    };

    // ---------- State ----------
    let rolls = [];
    let rolling = false;

    // ---------- Dobbelsteen tekenen ----------
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

    // ---------- Gooien ----------
    function roll() {
        if (rolling || rolls.length >= MAX_ROLLS) return;
        rolling = true;
        rollBtn.disabled = true;

        diceEl.classList.remove('rolling');
        void diceEl.offsetWidth; // reflow zodat de animatie herstart
        diceEl.classList.add('rolling');

        // Een paar tussenwaarden tonen voor het 'rollende' effect
        const flicker = setInterval(() => {
            drawDice(1 + Math.floor(Math.random() * 6));
        }, 70);

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
                resetBtn.style.display = '';
            } else {
                rollBtn.disabled = false;
            }
        }, 500);
    }

    // ---------- Beste verdeling berekenen ----------
    // Verdeel de 6 ogen over 3 plaatswaarden (H/T/E), telkens 2 per
    // plaats. De twee rijen vormen samen de optelsom. Zoek de verdeling
    // die de som het dichtst bij 1000 brengt.
    function bestArrangement(values) {
        let best = null;
        for (let a = 0; a < 6; a++) {
            for (let b = a + 1; b < 6; b++) {
                // a,b -> honderdtallen
                const rest = [0, 1, 2, 3, 4, 5].filter(i => i !== a && i !== b);
                for (let c = 0; c < rest.length; c++) {
                    for (let d = c + 1; d < rest.length; d++) {
                        const tIdx = [rest[c], rest[d]];          // tientallen
                        const eIdx = rest.filter(i => i !== rest[c] && i !== rest[d]); // eenheden
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

    // ---------- Schema invullen ----------
    function fillCell(cell, value, delay) {
        setTimeout(() => {
            cell.textContent = value;
            cell.classList.add('filled');
        }, delay);
    }

    function fillTotalCell(cell, value, delay) {
        setTimeout(() => {
            const label = cell.querySelector('.p1000-tlabel');
            cell.textContent = value === '' ? '' : value;
            if (label) cell.appendChild(label);
            if (value !== '') cell.classList.add('filled');
        }, delay);
    }

    function check() {
        const best = bestArrangement(rolls);
        checkBtn.disabled = true;
        checkBtn.style.display = 'none';

        let delay = 0;
        // Bovenste cellen: rij 0 dan rij 1, telkens H-T-E
        topCells.forEach(cell => {
            const r = parseInt(cell.dataset.row, 10);
            const p = parseInt(cell.dataset.place, 10);
            fillCell(cell, best.rows[r][p], delay);
            delay += 130;
        });

        // Totaalrij: D-H-T-E
        const padded = String(best.total).padStart(4, '0').split('');
        const digits = [
            padded[0] === '0' ? '' : padded[0], // duizendtallen (leeg bij 0)
            padded[1],
            padded[2],
            padded[3]
        ];
        totalCells.forEach((cell, i) => {
            fillTotalCell(cell, digits[i], delay);
            delay += 130;
        });

        // Uitkomst tonen
        setTimeout(() => {
            const n1 = best.rows[0].join('');
            const n2 = best.rows[1].join('');
            const perfect = best.diff === 0;
            resultEl.className = 'p1000-result' + (perfect ? ' perfect' : '');
            resultEl.innerHTML =
                '<div class="p1000-result-sum">' + n1 + ' + ' + n2 + ' = ' + best.total + '</div>' +
                '<div class="p1000-result-diff">' +
                (perfect
                    ? '&#127881; Precies 1000! Dit is de beste oplossing.'
                    : 'De beste oplossing zit <strong>' + best.diff + '</strong> van de 1000 af.') +
                '</div>';
            resultEl.style.display = '';
        }, delay + 100);
    }

    // ---------- Reset ----------
    function reset() {
        rolls = [];
        rolling = false;
        historyEl.innerHTML = '';
        resultEl.style.display = 'none';
        resultEl.innerHTML = '';

        topCells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('filled');
        });
        totalCells.forEach(cell => {
            const place = cell.dataset.place;
            cell.classList.remove('filled');
            cell.innerHTML = '<span class="p1000-tlabel">' + place.toUpperCase() + '</span>';
        });

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

    // ---------- Init ----------
    updateCounter();
});

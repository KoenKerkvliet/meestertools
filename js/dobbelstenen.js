/* ============================================
   DOBBELSTENEN - JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    const TOOL_NAME = 'dobbelstenen';

    // Elements
    const diceGrid = document.getElementById('diceGrid');
    const diceTotal = document.getElementById('diceTotal');
    const btnRoll = document.getElementById('btnRoll');
    const btnSettings = document.getElementById('btnSettings');
    const settingsModal = document.getElementById('settingsModal');
    const btnCloseSettings = document.getElementById('btnCloseSettings');
    const btnSaveSettings = document.getElementById('btnSaveSettings');
    const selectDiceCount = document.getElementById('diceCount');

    // State
    let numDice = 1;
    let currentValues = [1];
    let isRolling = false;

    // Pip positions for each dice value (CSS grid positions)
    const pipLayouts = {
        1: ['center'],
        2: ['top-right', 'bottom-left'],
        3: ['top-right', 'center', 'bottom-left'],
        4: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
        5: ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'],
        6: ['top-left', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-right']
    };

    // ---------- Supabase Settings ----------
    async function getSessionUser() {
        const { data: { session } } = await supabase.auth.getSession();
        return session?.user || null;
    }

    async function loadSettings() {
        const user = await getSessionUser();
        if (!user) return;

        const { data } = await supabase
            .from('tool_settings')
            .select('settings')
            .eq('user_id', user.id)
            .eq('tool_name', TOOL_NAME)
            .single();

        if (data && data.settings) {
            if (data.settings.numDice) {
                numDice = Math.min(6, Math.max(1, data.settings.numDice));
            }
        }
        currentValues = Array(numDice).fill(1);
        renderDice(currentValues);
    }

    async function saveSettingsToDb() {
        const user = await getSessionUser();
        if (!user) return;

        await supabase
            .from('tool_settings')
            .upsert({
                user_id: user.id,
                tool_name: TOOL_NAME,
                settings: { numDice },
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id,tool_name' });
    }

    // ---------- Render Dice ----------
    function createDie(value) {
        const die = document.createElement('div');
        die.className = 'dobbelsteen';

        const pips = pipLayouts[value] || [];
        pips.forEach(pos => {
            const pip = document.createElement('span');
            pip.className = 'pip pip-' + pos;
            die.appendChild(pip);
        });

        return die;
    }

    function renderDice(values) {
        diceGrid.innerHTML = '';
        values.forEach(val => {
            diceGrid.appendChild(createDie(val));
        });
        updateTotal(values);
    }

    function updateTotal(values) {
        if (values.length > 1) {
            const sum = values.reduce((a, b) => a + b, 0);
            diceTotal.textContent = 'Totaal: ' + sum;
            diceTotal.className = 'dice-total show';
        } else {
            diceTotal.textContent = '';
            diceTotal.className = 'dice-total hide';
        }
    }

    // ---------- Roll Logic ----------
    function randomValue() {
        return Math.floor(Math.random() * 6) + 1;
    }

    function updateDiePips(die, value) {
        die.innerHTML = '';
        const pips = pipLayouts[value] || [];
        pips.forEach(pos => {
            const pip = document.createElement('span');
            pip.className = 'pip pip-' + pos;
            die.appendChild(pip);
        });
    }

    async function rollDice() {
        if (isRolling) return;
        isRolling = true;
        btnRoll.disabled = true;

        // Hide total during roll (reserve space if multiple dice)
        if (numDice > 1) {
            diceTotal.className = 'dice-total';
        } else {
            diceTotal.className = 'dice-total hide';
        }

        // Generate final values
        const finalValues = Array.from({ length: numDice }, () => randomValue());

        // Create dice and start toss animation with staggered delays
        diceGrid.innerHTML = '';
        const diceElements = [];

        for (let i = 0; i < numDice; i++) {
            const die = createDie(currentValues[i] || 1);
            // Stagger each die by 50-90ms for natural feel
            const delay = i * 55 + Math.random() * 35;
            die.style.animationDelay = delay + 'ms';
            die.classList.add('rolling');
            diceGrid.appendChild(die);
            diceElements.push({ element: die, delay: delay });
        }

        // During the "in air" phase, rapidly swap pip values for tumble effect
        const swapInterval = 90;
        const swapDuration = 550;
        let swapCount = 0;

        const swapTimer = setInterval(() => {
            swapCount++;
            diceElements.forEach(({ element }) => {
                updateDiePips(element, randomValue());
                // Pips stay dim during rolling (CSS handles opacity)
            });
        }, swapInterval);

        // Stop swapping pip values before the landing phase
        setTimeout(() => {
            clearInterval(swapTimer);
            // Set final values while still in air (pips are dimmed by CSS)
            diceElements.forEach(({ element }, i) => {
                updateDiePips(element, finalValues[i]);
            });
        }, swapDuration);

        // After toss animation completes, show the landing effect
        const maxDelay = diceElements.length > 0
            ? Math.max(...diceElements.map(d => d.delay))
            : 0;
        const tossAnimationDuration = 1000; // matches CSS animation duration
        const totalWait = tossAnimationDuration + maxDelay + 50;

        setTimeout(() => {
            // Replace dice with landed versions
            diceGrid.innerHTML = '';

            finalValues.forEach((val, i) => {
                const die = createDie(val);
                // Stagger the landing pop
                const landDelay = i * 50;
                die.style.animationDelay = landDelay + 'ms';
                die.classList.add('landed');
                diceGrid.appendChild(die);
            });

            currentValues = finalValues;

            // Show total with a slight delay for dramatic effect
            setTimeout(() => {
                updateTotal(finalValues);
            }, 180);

            // Clean up after all effects finish
            const cleanupDelay = 500 + (numDice - 1) * 50;
            setTimeout(() => {
                diceGrid.querySelectorAll('.dobbelsteen').forEach(d => {
                    d.classList.remove('landed');
                    d.style.animationDelay = '';
                });
                isRolling = false;
                btnRoll.disabled = false;
            }, cleanupDelay);

        }, totalWait);
    }

    btnRoll.addEventListener('click', rollDice);

    // Spacebar to roll
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && !settingsModal.classList.contains('active')) {
            e.preventDefault();
            rollDice();
        }
    });

    // ---------- Settings Modal ----------
    btnSettings.addEventListener('click', () => {
        selectDiceCount.value = numDice;
        settingsModal.classList.add('active');
    });

    btnCloseSettings.addEventListener('click', closeModal);

    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && settingsModal.classList.contains('active')) {
            closeModal();
        }
    });

    function closeModal() {
        settingsModal.classList.remove('active');
    }

    btnSaveSettings.addEventListener('click', async () => {
        numDice = parseInt(selectDiceCount.value) || 1;
        currentValues = Array(numDice).fill(1);
        renderDice(currentValues);
        await saveSettingsToDb();
        closeModal();
    });

    // ---------- Init ----------
    loadSettings();
});

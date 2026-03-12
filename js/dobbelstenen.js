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
    function createDie(value, extraClass) {
        const die = document.createElement('div');
        die.className = 'dobbelsteen' + (extraClass ? ' ' + extraClass : '');

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
            diceTotal.style.display = 'block';
        } else {
            diceTotal.style.display = 'none';
        }
    }

    // ---------- Roll Logic ----------
    function randomValue() {
        return Math.floor(Math.random() * 6) + 1;
    }

    async function rollDice() {
        if (isRolling) return;
        isRolling = true;
        btnRoll.disabled = true;
        btnRoll.classList.add('rolling');

        // Generate final values
        const finalValues = Array.from({ length: numDice }, () => randomValue());

        // Animate: rapid random changes then slow down
        const totalDuration = 800;
        const intervalStart = 50;
        const intervalEnd = 150;
        const startTime = Date.now();

        function animateStep() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / totalDuration, 1);

            if (progress < 1) {
                // Show random values during animation
                const tempValues = Array.from({ length: numDice }, () => randomValue());
                diceGrid.innerHTML = '';
                tempValues.forEach(val => {
                    diceGrid.appendChild(createDie(val, 'rolling'));
                });

                // Slow down interval as we approach the end
                const currentInterval = intervalStart + (intervalEnd - intervalStart) * progress;
                setTimeout(animateStep, currentInterval);
            } else {
                // Show final values with bounce
                diceGrid.innerHTML = '';
                finalValues.forEach(val => {
                    diceGrid.appendChild(createDie(val, 'bounce-in'));
                });
                currentValues = finalValues;
                updateTotal(finalValues);

                isRolling = false;
                btnRoll.disabled = false;
                btnRoll.classList.remove('rolling');

                // Remove bounce class after animation
                setTimeout(() => {
                    diceGrid.querySelectorAll('.dobbelsteen').forEach(d => {
                        d.classList.remove('bounce-in');
                    });
                }, 500);
            }
        }

        animateStep();
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

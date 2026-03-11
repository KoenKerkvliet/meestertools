/* ============================================
   STOPLICHT - JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_KEY = 'meestertools_stoplicht';

    // Elements
    const lampRood = document.getElementById('lampRood');
    const lampOranje = document.getElementById('lampOranje');
    const lampGroen = document.getElementById('lampGroen');
    const label = document.getElementById('stoplichtLabel');
    const btnSettings = document.getElementById('btnSettings');
    const settingsModal = document.getElementById('settingsModal');
    const btnCloseSettings = document.getElementById('btnCloseSettings');
    const btnSaveSettings = document.getElementById('btnSaveSettings');
    const inputRood = document.getElementById('labelRood');
    const inputOranje = document.getElementById('labelOranje');
    const inputGroen = document.getElementById('labelGroen');

    const lamps = [lampRood, lampOranje, lampGroen];

    // State
    let activeColor = null;
    let labels = {
        rood: 'Niet praten',
        oranje: 'Fluisteren',
        groen: 'Praten mag'
    };

    // ---------- Load Settings from localStorage ----------
    function loadSettings() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.labels) labels = parsed.labels;
            }
        } catch (e) {
            // Use defaults
        }
    }

    function saveSettings() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ labels }));
        } catch (e) {
            // Storage not available
        }
    }

    // ---------- Lamp Click ----------
    lamps.forEach(lamp => {
        lamp.addEventListener('click', () => {
            const color = lamp.dataset.color;

            if (activeColor === color) {
                // Toggle off
                lamp.classList.remove('active');
                activeColor = null;
                updateLabel(null);
            } else {
                // Deactivate all, activate clicked
                lamps.forEach(l => l.classList.remove('active'));
                lamp.classList.add('active');
                activeColor = color;
                updateLabel(color);
            }
        });
    });

    function updateLabel(color) {
        if (!color) {
            label.textContent = '';
            label.className = 'stoplicht-label';
            return;
        }
        label.textContent = labels[color] || '';
        label.className = 'stoplicht-label color-' + color;
    }

    // ---------- Settings Modal ----------
    btnSettings.addEventListener('click', () => {
        inputRood.value = labels.rood;
        inputOranje.value = labels.oranje;
        inputGroen.value = labels.groen;
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

    btnSaveSettings.addEventListener('click', () => {
        labels.rood = inputRood.value.trim() || 'Niet praten';
        labels.oranje = inputOranje.value.trim() || 'Fluisteren';
        labels.groen = inputGroen.value.trim() || 'Praten mag';
        saveSettings();

        // Update visible label if a color is active
        if (activeColor) {
            updateLabel(activeColor);
        }

        closeModal();
    });

    // ---------- Init ----------
    loadSettings();
});

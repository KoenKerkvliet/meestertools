/* ============================================
   STOPLICHT - JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    const TOOL_NAME = 'stoplicht';

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
            if (data.settings.labels) labels = data.settings.labels;
            // Update visible label if a color is already active
            if (activeColor) updateLabel(activeColor);
        }
    }

    async function saveSettingsToDb() {
        const user = await getSessionUser();
        if (!user) return;

        await supabase
            .from('tool_settings')
            .upsert({
                user_id: user.id,
                tool_name: TOOL_NAME,
                settings: { labels },
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id,tool_name' });
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

    btnSaveSettings.addEventListener('click', async () => {
        labels.rood = inputRood.value.trim() || 'Niet praten';
        labels.oranje = inputOranje.value.trim() || 'Fluisteren';
        labels.groen = inputGroen.value.trim() || 'Praten mag';
        await saveSettingsToDb();

        if (activeColor) {
            updateLabel(activeColor);
        }

        closeModal();
    });

    // ---------- Init ----------
    loadSettings();
});

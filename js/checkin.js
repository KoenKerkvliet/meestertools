/* ============================================
   CHECK-IN TOOL - JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    const TOOL_NAME = 'checkin';

    // ---------- DOM Elements ----------
    const checkinTitle = document.getElementById('checkinTitle');
    const checkinPie = document.getElementById('checkinPie');
    const checkinTotal = document.getElementById('checkinTotal');
    const checkinLegend = document.getElementById('checkinLegend');
    const checkinSmileys = document.getElementById('checkinSmileys');
    const btnReset = document.getElementById('btnReset');
    const btnSettings = document.getElementById('btnSettings');
    const settingsModal = document.getElementById('settingsModal');
    const btnCloseSettings = document.getElementById('btnCloseSettings');
    const btnSaveSettings = document.getElementById('btnSaveSettings');
    const settingTitle = document.getElementById('settingTitle');
    const settingSmileyCount = document.getElementById('settingSmileyCount');

    if (!checkinPie) return;

    // ---------- Smiley Configurations ----------
    const SMILEY_CONFIGS = {
        5: {
            emojis: ['\u{1F622}', '\u{1F615}', '\u{1F610}', '\u{1F642}', '\u{1F604}'],
            colors: ['#FF8C42', '#FFB347', '#FFD93D', '#A8E06C', '#6BCB77']
        },
        4: {
            emojis: ['\u{1F622}', '\u{1F615}', '\u{1F642}', '\u{1F604}'],
            colors: ['#FF8C42', '#FFD93D', '#A8E06C', '#6BCB77']
        },
        3: {
            emojis: ['\u{1F622}', '\u{1F610}', '\u{1F604}'],
            colors: ['#FF8C42', '#FFD93D', '#6BCB77']
        }
    };

    // ---------- State ----------
    let smileyCount = 5;
    let title = 'Hoe voel je je vandaag?';
    let votes = [0, 0, 0, 0, 0];
    let animatingPie = false;
    let displayVotes = [0, 0, 0, 0, 0];

    // ---------- SVG Constants ----------
    const CX = 150, CY = 150, RADIUS = 140;

    // ---------- Supabase Helpers ----------
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
            if (data.settings.title) title = data.settings.title;
            if ([3, 4, 5].includes(data.settings.smileyCount)) smileyCount = data.settings.smileyCount;
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
                settings: { title, smileyCount },
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id,tool_name' });
    }

    // ---------- Build UI ----------
    function buildUI() {
        checkinTitle.textContent = title;
        votes = new Array(smileyCount).fill(0);
        displayVotes = new Array(smileyCount).fill(0);
        renderSmileys();
        renderLegend();
        renderPieFromValues(votes);
        updateTotal(0);
    }

    // ---------- Render Smileys ----------
    function renderSmileys() {
        checkinSmileys.innerHTML = '';
        const config = SMILEY_CONFIGS[smileyCount];
        config.emojis.forEach((emoji, index) => {
            const btn = document.createElement('button');
            btn.className = 'checkin-smiley-btn';
            btn.textContent = emoji;
            btn.style.borderColor = config.colors[index];
            btn.addEventListener('click', () => handleVote(index, btn));
            checkinSmileys.appendChild(btn);
        });
    }

    // ---------- Render Legend ----------
    function renderLegend() {
        checkinLegend.innerHTML = '';
        const config = SMILEY_CONFIGS[smileyCount];
        config.emojis.forEach((emoji, index) => {
            const item = document.createElement('div');
            item.className = 'checkin-legend-item';
            item.innerHTML = `
                <span class="checkin-legend-dot" style="background:${config.colors[index]}"></span>
                <span>${emoji}</span>
                <span class="checkin-legend-count" id="legendCount${index}">${votes[index]}</span>
            `;
            checkinLegend.appendChild(item);
        });
    }

    function updateLegendCounts() {
        votes.forEach((count, i) => {
            const el = document.getElementById(`legendCount${i}`);
            if (el) el.textContent = count;
        });
    }

    // ---------- Handle Vote ----------
    function handleVote(index, btnElement) {
        const oldVotes = [...votes];
        votes[index]++;

        // Bounce animation on smiley
        btnElement.classList.remove('clicked');
        void btnElement.offsetWidth;
        btnElement.classList.add('clicked');
        setTimeout(() => btnElement.classList.remove('clicked'), 500);

        // Floating +1
        showFloatingPlus(btnElement, SMILEY_CONFIGS[smileyCount].colors[index]);

        // Update legend
        updateLegendCounts();

        // Update total with pop
        const total = votes.reduce((a, b) => a + b, 0);
        updateTotal(total);
        checkinTotal.classList.remove('pop');
        void checkinTotal.offsetWidth;
        checkinTotal.classList.add('pop');

        // Animate pie
        animatePie(oldVotes, votes);
    }

    // ---------- Floating +1 ----------
    function showFloatingPlus(btnElement, color) {
        const plus = document.createElement('span');
        plus.className = 'checkin-float-plus';
        plus.textContent = '+1';
        plus.style.color = color;

        const rect = btnElement.getBoundingClientRect();
        const containerRect = btnElement.closest('.checkin-container').getBoundingClientRect();
        plus.style.left = (rect.left - containerRect.left + rect.width / 2 - 12) + 'px';
        plus.style.top = (rect.top - containerRect.top - 10) + 'px';

        btnElement.closest('.checkin-container').appendChild(plus);
        setTimeout(() => plus.remove(), 700);
    }

    // ---------- Update Total ----------
    function updateTotal(total) {
        checkinTotal.querySelector('.total-number').textContent = total;
        checkinTotal.querySelector('.total-label').textContent = total === 1 ? 'stem' : 'stemmen';
    }

    // ---------- Pie Chart Rendering ----------
    function createArcPath(cx, cy, r, startAngle, endAngle) {
        if (endAngle - startAngle >= 2 * Math.PI - 0.001) {
            return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx} ${cy + r} A ${r} ${r} 0 1 1 ${cx} ${cy - r} Z`;
        }
        const x1 = cx + r * Math.cos(startAngle);
        const y1 = cy + r * Math.sin(startAngle);
        const x2 = cx + r * Math.cos(endAngle);
        const y2 = cy + r * Math.sin(endAngle);
        const largeArc = (endAngle - startAngle > Math.PI) ? 1 : 0;
        return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    }

    function renderPieFromValues(values) {
        // Remove existing segments
        checkinPie.querySelectorAll('.pie-segment').forEach(p => p.remove());

        const total = values.reduce((a, b) => a + b, 0);
        if (total === 0) return;

        const config = SMILEY_CONFIGS[smileyCount];
        let startAngle = 0;

        values.forEach((count, i) => {
            if (count <= 0) return;
            const fraction = count / total;
            const endAngle = startAngle + fraction * 2 * Math.PI;

            const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            pathEl.setAttribute('d', createArcPath(CX, CY, RADIUS, startAngle, endAngle));
            pathEl.setAttribute('fill', config.colors[i]);
            pathEl.classList.add('pie-segment');
            checkinPie.appendChild(pathEl);

            startAngle = endAngle;
        });
    }

    // ---------- Animated Pie Transition ----------
    function animatePie(oldVotes, newVotes, duration = 400) {
        if (animatingPie) {
            // Skip animation, render final state directly
            displayVotes = [...newVotes];
            renderPieFromValues(newVotes);
            return;
        }

        animatingPie = true;
        const startTime = performance.now();
        const from = [...oldVotes];
        const to = [...newVotes];

        function frame(now) {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic

            const interpolated = to.map((nv, i) => from[i] + (nv - from[i]) * eased);
            displayVotes = interpolated;
            renderPieFromValues(interpolated);

            if (progress < 1) {
                requestAnimationFrame(frame);
            } else {
                animatingPie = false;
                displayVotes = [...to];
            }
        }
        requestAnimationFrame(frame);
    }

    // ---------- Reset ----------
    btnReset.addEventListener('click', () => {
        const oldVotes = [...votes];
        votes = new Array(smileyCount).fill(0);
        updateLegendCounts();
        updateTotal(0);
        checkinTotal.classList.remove('pop');
        void checkinTotal.offsetWidth;
        checkinTotal.classList.add('pop');
        animatePie(oldVotes, votes);
    });

    // ---------- Settings Modal ----------
    function openModal() {
        settingTitle.value = title;
        settingSmileyCount.value = smileyCount;
        settingsModal.classList.add('active');
    }

    function closeModal() {
        settingsModal.classList.remove('active');
    }

    btnSettings.addEventListener('click', openModal);
    btnCloseSettings.addEventListener('click', closeModal);

    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && settingsModal.classList.contains('active')) {
            closeModal();
        }
    });

    btnSaveSettings.addEventListener('click', async () => {
        title = settingTitle.value.trim() || 'Hoe voel je je vandaag?';
        smileyCount = parseInt(settingSmileyCount.value);
        await saveSettingsToDb();
        buildUI();
        closeModal();
    });

    // ---------- Init ----------
    async function init() {
        await loadSettings();
        buildUI();
    }
    init();
});

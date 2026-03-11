/* ============================================
   TIME TIMER - JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    const SVG_NS = 'http://www.w3.org/2000/svg';
    const CX = 160;
    const CY = 160;
    const RADIUS = 140;
    const TOTAL_MINUTES = 60;
    const TOOL_NAME = 'timetimer';

    // Elements
    const timerSvg = document.getElementById('timerSvg');
    const wedge = document.getElementById('timerWedge');
    const hand = document.getElementById('timerHand');
    const dragHandle = document.getElementById('timerDragHandle');
    const markersGroup = document.getElementById('timerMarkers');
    const numbersGroup = document.getElementById('timerNumbers');
    const digitalDisplay = document.getElementById('timerDigital');
    const presetsContainer = document.getElementById('timerPresets');
    const btnStart = document.getElementById('btnStart');
    const btnPause = document.getElementById('btnPause');
    const btnReset = document.getElementById('btnReset');
    const btnDismiss = document.getElementById('btnDismiss');
    const alertOverlay = document.getElementById('timerAlert');
    const timerContainer = document.querySelector('.timer-container');

    // Settings elements
    const btnSettings = document.getElementById('btnSettings');
    const settingsModal = document.getElementById('settingsModal');
    const btnCloseSettings = document.getElementById('btnCloseSettings');
    const btnSavePresets = document.getElementById('btnSavePresets');
    const btnAddPreset = document.getElementById('btnAddPreset');
    const newPresetInput = document.getElementById('newPresetInput');
    const presetList = document.getElementById('presetList');

    // State
    let totalSeconds = 0;
    let remainingSeconds = 0;
    let timerInterval = null;
    let isRunning = false;
    let isDragging = false;
    let audioCtx = null;
    let presets = [];
    let editPresets = [];

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
            presets = data.settings.presets || [];
            renderPresetButtons();
        }
    }

    async function saveSettings() {
        const user = await getSessionUser();
        if (!user) return;

        await supabase
            .from('tool_settings')
            .upsert({
                user_id: user.id,
                tool_name: TOOL_NAME,
                settings: { presets },
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id,tool_name' });
    }

    function renderPresetButtons() {
        presetsContainer.innerHTML = '';
        const sorted = [...presets].sort((a, b) => a - b);
        sorted.forEach(minutes => {
            const btn = document.createElement('button');
            btn.className = 'preset-btn';
            btn.dataset.minutes = minutes;
            btn.textContent = minutes + ' min';
            btn.addEventListener('click', () => {
                if (isRunning) return;
                setTimeFromMinutes(minutes);
                presetsContainer.querySelectorAll('.preset-btn').forEach(b => {
                    b.classList.toggle('active', parseInt(b.dataset.minutes) === minutes);
                });
            });
            presetsContainer.appendChild(btn);
        });
    }

    // ---------- Draw Clock Face ----------
    function drawMarkers() {
        for (let i = 0; i < 60; i++) {
            const angle = (i / 60) * 2 * Math.PI - Math.PI / 2;
            const isMajor = i % 5 === 0;
            const outerR = RADIUS + 8;
            const innerR = isMajor ? RADIUS - 6 : RADIUS - 2;

            const line = document.createElementNS(SVG_NS, 'line');
            line.setAttribute('x1', CX + Math.cos(angle) * innerR);
            line.setAttribute('y1', CY + Math.sin(angle) * innerR);
            line.setAttribute('x2', CX + Math.cos(angle) * outerR);
            line.setAttribute('y2', CY + Math.sin(angle) * outerR);
            line.setAttribute('stroke', isMajor ? '#636E72' : '#CBD5E0');
            line.setAttribute('stroke-width', isMajor ? 2.5 : 1.5);
            markersGroup.appendChild(line);
        }
    }

    function drawNumbers() {
        for (let i = 0; i < 12; i++) {
            const minutes = i * 5;
            const angle = (i / 12) * 2 * Math.PI - Math.PI / 2;
            const labelR = RADIUS - 22;

            const text = document.createElementNS(SVG_NS, 'text');
            text.setAttribute('x', CX + Math.cos(angle) * labelR);
            text.setAttribute('y', CY + Math.sin(angle) * labelR);
            text.textContent = minutes === 0 ? '60' : minutes;
            numbersGroup.appendChild(text);
        }
    }

    // ---------- Wedge Drawing (based on 60-minute clock) ----------
    function polarToCartesian(angle) {
        return {
            x: CX + RADIUS * Math.cos(angle),
            y: CY + RADIUS * Math.sin(angle)
        };
    }

    function minutesToAngle(minutes) {
        return (minutes / TOTAL_MINUTES) * 2 * Math.PI - Math.PI / 2;
    }

    function updateDisplay(seconds) {
        const minutes = seconds / 60;
        const fraction = minutes / TOTAL_MINUTES;

        if (fraction <= 0) {
            wedge.setAttribute('d', '');
            hand.setAttribute('opacity', '0');
            dragHandle.setAttribute('cx', CX);
            dragHandle.setAttribute('cy', CY - RADIUS);
        } else if (fraction >= 1) {
            wedge.setAttribute('d',
                `M ${CX} ${CY} ` +
                `m 0 -${RADIUS} ` +
                `a ${RADIUS} ${RADIUS} 0 1 1 0 ${RADIUS * 2} ` +
                `a ${RADIUS} ${RADIUS} 0 1 1 0 -${RADIUS * 2} Z`
            );
            const endAngle = minutesToAngle(TOTAL_MINUTES - 0.001);
            const tip = polarToCartesian(endAngle);
            hand.setAttribute('x2', tip.x);
            hand.setAttribute('y2', tip.y);
            hand.setAttribute('opacity', '1');
            dragHandle.setAttribute('cx', tip.x);
            dragHandle.setAttribute('cy', tip.y);
        } else {
            const startAngle = -Math.PI / 2;
            const endAngle = startAngle + fraction * 2 * Math.PI;
            const start = polarToCartesian(startAngle);
            const end = polarToCartesian(endAngle);
            const largeArc = fraction > 0.5 ? 1 : 0;

            wedge.setAttribute('d',
                `M ${CX} ${CY} L ${start.x} ${start.y} ` +
                `A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${end.x} ${end.y} Z`
            );

            hand.setAttribute('x2', end.x);
            hand.setAttribute('y2', end.y);
            hand.setAttribute('opacity', '1');
            dragHandle.setAttribute('cx', end.x);
            dragHandle.setAttribute('cy', end.y);
        }

        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        digitalDisplay.textContent =
            String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
    }

    // ---------- Drag / Touch to Set Time ----------
    function getMinutesFromEvent(event) {
        const svgRect = timerSvg.getBoundingClientRect();
        const svgCenterX = svgRect.left + svgRect.width / 2;
        const svgCenterY = svgRect.top + svgRect.height / 2;

        const clientX = event.touches ? event.touches[0].clientX : event.clientX;
        const clientY = event.touches ? event.touches[0].clientY : event.clientY;

        const dx = clientX - svgCenterX;
        const dy = clientY - svgCenterY;

        let angle = Math.atan2(dx, -dy);
        if (angle < 0) angle += 2 * Math.PI;

        let minutes = Math.round((angle / (2 * Math.PI)) * TOTAL_MINUTES);
        if (minutes === 0) minutes = TOTAL_MINUTES;
        return minutes;
    }

    function setTimeFromMinutes(minutes) {
        totalSeconds = minutes * 60;
        remainingSeconds = totalSeconds;
        updateDisplay(remainingSeconds);
        btnStart.disabled = false;
        btnReset.disabled = false;

        presetsContainer.querySelectorAll('.preset-btn').forEach(b => {
            b.classList.toggle('active', parseInt(b.dataset.minutes) === minutes);
        });
    }

    function onDragStart(e) {
        if (isRunning) return;
        isDragging = true;
        timerSvg.style.cursor = 'grabbing';
        dragHandle.style.cursor = 'grabbing';
        e.preventDefault();
        const minutes = getMinutesFromEvent(e);
        setTimeFromMinutes(minutes);
    }

    function onDragMove(e) {
        if (!isDragging || isRunning) return;
        e.preventDefault();
        const minutes = getMinutesFromEvent(e);
        setTimeFromMinutes(minutes);
    }

    function onDragEnd() {
        if (!isDragging) return;
        isDragging = false;
        timerSvg.style.cursor = '';
        dragHandle.style.cursor = 'grab';
    }

    timerSvg.addEventListener('mousedown', onDragStart);
    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('mouseup', onDragEnd);
    timerSvg.addEventListener('touchstart', onDragStart, { passive: false });
    document.addEventListener('touchmove', onDragMove, { passive: false });
    document.addEventListener('touchend', onDragEnd);

    // ---------- Start / Pause / Reset ----------
    btnStart.addEventListener('click', () => {
        if (totalSeconds <= 0) return;
        startTimer();
    });

    btnPause.addEventListener('click', () => pauseTimer());
    btnReset.addEventListener('click', () => resetTimer());

    btnDismiss.addEventListener('click', () => {
        alertOverlay.classList.remove('active');
        stopAlarmSound();
        resetTimer();
    });

    function startTimer() {
        isRunning = true;
        timerContainer.classList.add('running');
        btnStart.style.display = 'none';
        btnPause.style.display = '';
        btnReset.disabled = true;

        timerInterval = setInterval(() => {
            remainingSeconds--;

            if (remainingSeconds <= 0) {
                remainingSeconds = 0;
                clearInterval(timerInterval);
                timerInterval = null;
                isRunning = false;
                timerFinished();
            }

            updateDisplay(remainingSeconds);
        }, 1000);
    }

    function pauseTimer() {
        isRunning = false;
        timerContainer.classList.remove('running');
        clearInterval(timerInterval);
        timerInterval = null;
        btnStart.style.display = '';
        btnPause.style.display = 'none';
        btnReset.disabled = false;
    }

    function resetTimer() {
        isRunning = false;
        timerContainer.classList.remove('running');
        clearInterval(timerInterval);
        timerInterval = null;
        totalSeconds = 0;
        remainingSeconds = 0;
        updateDisplay(0);
        btnStart.style.display = '';
        btnPause.style.display = 'none';
        btnStart.disabled = true;
        btnReset.disabled = true;
        presetsContainer.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
    }

    // ---------- Timer Finished ----------
    function timerFinished() {
        timerContainer.classList.remove('running');
        btnStart.style.display = '';
        btnPause.style.display = 'none';
        btnReset.disabled = false;
        btnStart.disabled = true;

        alertOverlay.classList.add('active');
        playAlarmSound();
    }

    // ---------- Alarm Sound (Web Audio API) ----------
    function playAlarmSound() {
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            playBeepSequence(0);
        } catch (e) {
            // Audio not supported
        }
    }

    function playBeepSequence(count) {
        if (count >= 6 || !audioCtx) return;

        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.frequency.value = count % 2 === 0 ? 880 : 660;
        oscillator.type = 'sine';
        gainNode.gain.value = 0.3;

        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        oscillator.stop(audioCtx.currentTime + 0.3);

        setTimeout(() => playBeepSequence(count + 1), 400);
    }

    function stopAlarmSound() {
        if (audioCtx) {
            audioCtx.close();
            audioCtx = null;
        }
    }

    // ---------- Settings Modal ----------
    btnSettings.addEventListener('click', () => {
        editPresets = [...presets];
        renderEditPresets();
        settingsModal.classList.add('active');
        newPresetInput.value = '';
    });

    btnCloseSettings.addEventListener('click', closeSettingsModal);

    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) closeSettingsModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && settingsModal.classList.contains('active')) {
            closeSettingsModal();
        }
    });

    function closeSettingsModal() {
        settingsModal.classList.remove('active');
    }

    btnAddPreset.addEventListener('click', addPreset);

    newPresetInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') addPreset();
    });

    function addPreset() {
        const val = parseInt(newPresetInput.value);
        if (!val || val < 1 || val > 60) return;
        if (editPresets.includes(val)) {
            newPresetInput.value = '';
            return;
        }
        editPresets.push(val);
        renderEditPresets();
        newPresetInput.value = '';
        newPresetInput.focus();
    }

    function renderEditPresets() {
        presetList.innerHTML = '';
        const sorted = [...editPresets].sort((a, b) => a - b);
        if (sorted.length === 0) {
            presetList.innerHTML = '<span class="preset-list-empty">Nog geen snelkeuzetijden ingesteld.</span>';
            return;
        }
        sorted.forEach(minutes => {
            const tag = document.createElement('span');
            tag.className = 'preset-tag';
            tag.innerHTML = `${minutes} min <button class="preset-tag-remove" data-minutes="${minutes}">&times;</button>`;
            tag.querySelector('.preset-tag-remove').addEventListener('click', () => {
                editPresets = editPresets.filter(m => m !== minutes);
                renderEditPresets();
            });
            presetList.appendChild(tag);
        });
    }

    btnSavePresets.addEventListener('click', async () => {
        presets = [...editPresets];
        await saveSettings();
        renderPresetButtons();
        closeSettingsModal();
    });

    // ---------- Init ----------
    drawMarkers();
    drawNumbers();
    renderPresetButtons();
    updateDisplay(0);
    loadSettings();
});

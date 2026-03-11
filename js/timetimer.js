/* ============================================
   TIME TIMER - JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    const SVG_NS = 'http://www.w3.org/2000/svg';
    const CX = 160;
    const CY = 160;
    const RADIUS = 140;

    // Elements
    const wedge = document.getElementById('timerWedge');
    const hand = document.getElementById('timerHand');
    const markersGroup = document.getElementById('timerMarkers');
    const numbersGroup = document.getElementById('timerNumbers');
    const digitalDisplay = document.getElementById('timerDigital');
    const btnStart = document.getElementById('btnStart');
    const btnPause = document.getElementById('btnPause');
    const btnReset = document.getElementById('btnReset');
    const btnDismiss = document.getElementById('btnDismiss');
    const alertOverlay = document.getElementById('timerAlert');
    const presetBtns = document.querySelectorAll('.preset-btn');
    const timerContainer = document.querySelector('.timer-container');

    // State
    let totalSeconds = 0;
    let remainingSeconds = 0;
    let timerInterval = null;
    let isRunning = false;
    let audioCtx = null;

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

    // ---------- Draw Wedge (remaining time) ----------
    function polarToCartesian(angle) {
        return {
            x: CX + RADIUS * Math.cos(angle),
            y: CY + RADIUS * Math.sin(angle)
        };
    }

    function updateWedge(fraction) {
        if (fraction <= 0) {
            wedge.setAttribute('d', '');
            hand.setAttribute('opacity', '0');
            return;
        }

        if (fraction >= 1) {
            // Full circle
            wedge.setAttribute('d',
                `M ${CX} ${CY} ` +
                `m 0 -${RADIUS} ` +
                `a ${RADIUS} ${RADIUS} 0 1 1 0 ${RADIUS * 2} ` +
                `a ${RADIUS} ${RADIUS} 0 1 1 0 -${RADIUS * 2} Z`
            );
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
        }

        // Update hand position
        const handAngle = -Math.PI / 2 + fraction * 2 * Math.PI;
        const handTip = polarToCartesian(handAngle);
        hand.setAttribute('x2', handTip.x);
        hand.setAttribute('y2', handTip.y);
        hand.setAttribute('opacity', '1');
    }

    // ---------- Update Digital Display ----------
    function updateDigital(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        digitalDisplay.textContent =
            String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
    }

    // ---------- Preset Buttons ----------
    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (isRunning) return;

            const minutes = parseInt(btn.dataset.minutes);
            setTime(minutes * 60);

            presetBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    function setTime(seconds) {
        totalSeconds = seconds;
        remainingSeconds = seconds;
        updateWedge(1);
        updateDigital(seconds);
        btnStart.disabled = false;
        btnReset.disabled = false;
    }

    // ---------- Start / Pause / Reset ----------
    btnStart.addEventListener('click', () => {
        if (totalSeconds <= 0) return;
        startTimer();
    });

    btnPause.addEventListener('click', () => {
        pauseTimer();
    });

    btnReset.addEventListener('click', () => {
        resetTimer();
    });

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

            const fraction = totalSeconds > 0 ? remainingSeconds / totalSeconds : 0;
            updateWedge(fraction);
            updateDigital(remainingSeconds);
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
        updateWedge(0);
        updateDigital(0);
        btnStart.style.display = '';
        btnPause.style.display = 'none';
        btnStart.disabled = true;
        btnReset.disabled = true;
        presetBtns.forEach(b => b.classList.remove('active'));
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
            // Audio not supported, silent fallback
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

    // ---------- Init ----------
    drawMarkers();
    drawNumbers();
    updateWedge(0);
    updateDigital(0);
});

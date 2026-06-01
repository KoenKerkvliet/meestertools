/* ============================================
   KLASSEPRESTATIE - Extra tools (Timer + Stoplicht)

   Zelfstandige module, losgekoppeld van klasseprestatie.js. Voegt een
   'Tools'-knop toe aan de bovenbalk met een keuzemenu (Timer / Stoplicht).
   De tools verschijnen in een balk ONDER de leerlingen (#kprToolsTray),
   die bewust buiten render() van klasseprestatie.js valt — zo blijft de
   timer doorlopen terwijl je punten uitdeelt. Beide tools zijn weg te
   klikken via hun eigen kruisje.
   ============================================ */

(function () {
    var dd = document.getElementById('kprToolsDd');
    var toolsBtn = document.getElementById('kprBtnTools');
    var menu = document.getElementById('kprToolsMenu');
    var tray = document.getElementById('kprToolsTray');
    if (!toolsBtn || !menu || !tray) return;

    // Timer-instel-popup
    var timerModal = document.getElementById('kprTimerModal');
    var timerClose = document.getElementById('kprTimerClose');
    var timerCancel = document.getElementById('kprTimerCancel');
    var timerStart = document.getElementById('kprTimerStart');
    var timerMin = document.getElementById('kprTimerMin');
    var timerSec = document.getElementById('kprTimerSec');
    var timerPresets = document.getElementById('kprTimerPresets');

    // ---------- Dropdown ----------
    function openMenu() {
        menu.hidden = false;
        toolsBtn.setAttribute('aria-expanded', 'true');
        dd.classList.add('open');
    }
    function closeMenu() {
        menu.hidden = true;
        toolsBtn.setAttribute('aria-expanded', 'false');
        dd.classList.remove('open');
    }
    toolsBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        if (menu.hidden) openMenu(); else closeMenu();
    });
    document.addEventListener('click', function (e) {
        if (!dd.contains(e.target)) closeMenu();
    });
    menu.querySelectorAll('.kpr-tools-menu-item').forEach(function (item) {
        item.addEventListener('click', function () {
            var tool = item.getAttribute('data-tool');
            closeMenu();
            if (tool === 'timer') openTimerModal();
            else if (tool === 'stoplicht') addStoplicht();
        });
    });

    function updateTray() {
        tray.hidden = tray.children.length === 0;
    }

    // ---------- Timer ----------
    var timerCardRef = null;
    var timerInterval = null;
    var timerRemaining = 0;
    var timerTotal = 0;
    var timerPaused = false;

    function openTimerModal() {
        if (!timerModal) return;
        timerModal.classList.add('active');
        if (timerMin) timerMin.focus();
    }
    function closeTimerModal() {
        if (timerModal) timerModal.classList.remove('active');
    }
    if (timerClose) timerClose.addEventListener('click', closeTimerModal);
    if (timerCancel) timerCancel.addEventListener('click', closeTimerModal);
    if (timerModal) timerModal.addEventListener('click', function (e) {
        if (e.target === timerModal) closeTimerModal();
    });
    if (timerPresets) {
        timerPresets.querySelectorAll('button').forEach(function (b) {
            b.addEventListener('click', function () {
                var total = parseInt(b.getAttribute('data-sec'), 10) || 0;
                if (timerMin) timerMin.value = Math.floor(total / 60);
                if (timerSec) timerSec.value = total % 60;
            });
        });
    }
    if (timerStart) timerStart.addEventListener('click', function () {
        var m = Math.max(0, Math.min(180, parseInt(timerMin && timerMin.value, 10) || 0));
        var s = Math.max(0, Math.min(59, parseInt(timerSec && timerSec.value, 10) || 0));
        var total = m * 60 + s;
        if (total <= 0) { if (timerMin) timerMin.focus(); return; }
        closeTimerModal();
        startTimer(total);
    });

    function fmtTime(sec) {
        var m = Math.floor(sec / 60);
        var s = sec % 60;
        return (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
    }

    function startTimer(total) {
        removeTimer();
        timerTotal = total;
        timerRemaining = total;
        timerPaused = false;

        var card = document.createElement('div');
        card.className = 'kpr-tool-card kpr-timer-card';
        card.innerHTML =
            '<button class="kpr-tool-card-close" title="Sluiten" data-act="close">&times;</button>' +
            '<div class="kpr-tool-card-title">&#9201;&#65039; Timer</div>' +
            '<div class="kpr-timer-display">' + fmtTime(timerRemaining) + '</div>' +
            '<div class="kpr-timer-bar"><div class="kpr-timer-bar-fill"></div></div>' +
            '<div class="kpr-timer-controls">' +
                '<button class="kpr-timer-ctrl" data-act="toggle">&#10074;&#10074; Pauze</button>' +
                '<button class="kpr-timer-ctrl" data-act="plus">+1 min</button>' +
            '</div>';

        var display = card.querySelector('.kpr-timer-display');
        var barFill = card.querySelector('.kpr-timer-bar-fill');
        var toggleBtn = card.querySelector('[data-act="toggle"]');

        function refresh() {
            display.textContent = fmtTime(timerRemaining);
            var pct = timerTotal > 0 ? (timerRemaining / timerTotal) * 100 : 0;
            barFill.style.width = pct + '%';
        }
        card._refresh = refresh;

        card.addEventListener('click', function (e) {
            var btn = e.target.closest('[data-act]');
            if (!btn) return;
            var act = btn.getAttribute('data-act');
            if (act === 'close') { removeTimer(); }
            else if (act === 'toggle') {
                if (card.classList.contains('is-done')) return;
                timerPaused = !timerPaused;
                toggleBtn.innerHTML = timerPaused ? '&#9654; Verder' : '&#10074;&#10074; Pauze';
                card.classList.toggle('is-paused', timerPaused);
            } else if (act === 'plus') {
                timerRemaining += 60;
                timerTotal = Math.max(timerTotal, timerRemaining);
                if (card.classList.contains('is-done')) {
                    // weer laten lopen na 'tijd is om'
                    card.classList.remove('is-done');
                    var lbl = card.querySelector('.kpr-timer-done');
                    if (lbl) lbl.remove();
                    if (!timerInterval) timerInterval = setInterval(tick, 1000);
                }
                refresh();
            }
        });

        tray.appendChild(card);
        timerCardRef = card;
        refresh();
        updateTray();
        timerInterval = setInterval(tick, 1000);
    }

    function tick() {
        if (timerPaused || !timerCardRef) return;
        timerRemaining--;
        if (timerRemaining <= 0) {
            timerRemaining = 0;
            if (timerCardRef._refresh) timerCardRef._refresh();
            finishTimer();
            return;
        }
        if (timerCardRef._refresh) timerCardRef._refresh();
    }

    function finishTimer() {
        if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
        if (!timerCardRef) return;
        timerCardRef.classList.add('is-done');
        timerCardRef.classList.remove('is-paused');
        var controls = timerCardRef.querySelector('.kpr-timer-controls');
        if (controls && !timerCardRef.querySelector('.kpr-timer-done')) {
            var done = document.createElement('div');
            done.className = 'kpr-timer-done';
            done.innerHTML = '&#9200; Tijd is om!';
            controls.parentNode.insertBefore(done, controls);
        }
        beep();
    }

    function removeTimer() {
        if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
        if (timerCardRef && timerCardRef.parentNode) timerCardRef.parentNode.removeChild(timerCardRef);
        timerCardRef = null;
        updateTray();
    }

    function beep() {
        try {
            var AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) return;
            var ac = new AC();
            var o = ac.createOscillator();
            var g = ac.createGain();
            o.connect(g); g.connect(ac.destination);
            o.type = 'sine';
            o.frequency.value = 880;
            g.gain.value = 0.0001;
            var t = ac.currentTime;
            g.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
            g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
            o.start(t);
            o.stop(t + 0.62);
            setTimeout(function () { try { ac.close(); } catch (e) {} }, 900);
        } catch (e) { /* geluid is optioneel */ }
    }

    // ---------- Stoplicht ----------
    var stoplichtCardRef = null;
    var STOP_LEVELS = [
        { key: 'rood', color: '#E1483B', label: 'Stil' },
        { key: 'oranje', color: '#F2A33C', label: 'Fluisteren' },
        { key: 'groen', color: '#36B45A', label: 'Overleggen' }
    ];

    function addStoplicht() {
        if (stoplichtCardRef) { stoplichtCardRef.classList.add('kpr-attn'); setTimeout(function () { if (stoplichtCardRef) stoplichtCardRef.classList.remove('kpr-attn'); }, 600); return; }

        var card = document.createElement('div');
        card.className = 'kpr-tool-card kpr-stoplicht-card';
        var lamps = STOP_LEVELS.map(function (lv, i) {
            return '<button type="button" class="kpr-stop-lamp" data-i="' + i + '" style="--lamp:' + lv.color + '">' +
                '<span class="kpr-stop-dot"></span>' +
                '<span class="kpr-stop-label">' + lv.label + '</span>' +
                '</button>';
        }).join('');
        card.innerHTML =
            '<button class="kpr-tool-card-close" title="Sluiten" data-act="close">&times;</button>' +
            '<div class="kpr-tool-card-title">&#128678; Stoplicht</div>' +
            '<div class="kpr-stop-lamps">' + lamps + '</div>';

        var active = 0; // standaard: rood/stil
        function setActive(i) {
            active = i;
            card.querySelectorAll('.kpr-stop-lamp').forEach(function (l, idx) {
                l.classList.toggle('active', idx === i);
            });
        }
        card.addEventListener('click', function (e) {
            var close = e.target.closest('[data-act="close"]');
            if (close) { removeStoplicht(); return; }
            var lamp = e.target.closest('.kpr-stop-lamp');
            if (lamp) setActive(parseInt(lamp.getAttribute('data-i'), 10));
        });

        tray.appendChild(card);
        stoplichtCardRef = card;
        setActive(0);
        updateTray();
    }

    function removeStoplicht() {
        if (stoplichtCardRef && stoplichtCardRef.parentNode) stoplichtCardRef.parentNode.removeChild(stoplichtCardRef);
        stoplichtCardRef = null;
        updateTray();
    }

    // ---------- Escape sluit menu / timer-popup ----------
    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;
        if (timerModal && timerModal.classList.contains('active')) closeTimerModal();
        else if (!menu.hidden) closeMenu();
    });
})();

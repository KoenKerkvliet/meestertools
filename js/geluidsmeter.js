/* ============================================
   GELUIDSMETER - JavaScript

   Meet het geluidsniveau in de klas via de microfoon (Web Audio API).
   Een grote meter wordt groen/oranje/rood en waarschuwt als het te luid wordt.
   Het geluid wordt alleen lokaal in de browser verwerkt; er wordt niets
   opgenomen of naar een server gestuurd.
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {
    var TOOL_NAME = 'geluidsmeter';

    // ---------- DOM ----------
    var startScreen = document.getElementById('gmStart');
    var startBtn = document.getElementById('gmStartBtn');
    var errorEl = document.getElementById('gmError');
    var meter = document.getElementById('gmMeter');
    var circle = document.getElementById('gmCircle');
    var face = document.getElementById('gmFace');
    var status = document.getElementById('gmStatus');
    var barFill = document.getElementById('gmBarFill');
    var barThreshold = document.getElementById('gmBarThreshold');
    var stopBtn = document.getElementById('gmStopBtn');

    var btnSettings = document.getElementById('btnSettings');
    var settingsModal = document.getElementById('settingsModal');
    var btnCloseSettings = document.getElementById('btnCloseSettings');
    var btnSaveSettings = document.getElementById('btnSaveSettings');
    var sensitivityRange = document.getElementById('gmSensitivity');
    var sensitivityVal = document.getElementById('gmSensitivityVal');
    var thresholdRange = document.getElementById('gmThreshold');
    var thresholdVal = document.getElementById('gmThresholdVal');

    if (!startBtn) return;

    // ---------- State ----------
    var sensitivity = 5;   // multiplier op de gemeten RMS
    var threshold = 60;    // percentage waarboven "te luid"
    var running = false;

    var audioCtx = null;
    var analyser = null;
    var source = null;
    var stream = null;
    var dataArray = null;
    var rafId = null;

    var shownLevel = 0;        // gladgestreken weergegeven niveau (0..100)
    var loudSince = 0;         // timestamp sinds het continu te luid is

    // ---------- Supabase ----------
    async function getSessionUser() {
        try {
            var res = await supabase.auth.getSession();
            return res && res.data && res.data.session ? res.data.session.user : null;
        } catch (e) { return null; }
    }

    async function loadSettings() {
        var user = await getSessionUser();
        if (!user) return;
        var res = await supabase
            .from('tool_settings')
            .select('settings')
            .eq('user_id', user.id)
            .eq('tool_name', TOOL_NAME)
            .single();
        if (res.data && res.data.settings) {
            var s = res.data.settings;
            if (typeof s.sensitivity === 'number') sensitivity = s.sensitivity;
            if (typeof s.threshold === 'number') threshold = s.threshold;
        }
        applySettingsToControls();
    }

    async function saveSettings() {
        var user = await getSessionUser();
        if (!user) return;
        await supabase
            .from('tool_settings')
            .upsert({
                user_id: user.id,
                tool_name: TOOL_NAME,
                settings: { sensitivity: sensitivity, threshold: threshold },
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id,tool_name' });
    }

    function applySettingsToControls() {
        sensitivityRange.value = sensitivity;
        sensitivityVal.textContent = sensitivity;
        thresholdRange.value = threshold;
        thresholdVal.textContent = threshold + '%';
        barThreshold.style.left = threshold + '%';
    }

    // ---------- Microfoon ----------
    async function start() {
        errorEl.style.display = 'none';
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            showError('Je browser ondersteunt geen microfoontoegang.');
            return;
        }
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
            });
        } catch (e) {
            if (e && (e.name === 'NotAllowedError' || e.name === 'SecurityError')) {
                showError('Geen toestemming voor de microfoon. Sta de microfoon toe en probeer opnieuw.');
            } else if (e && e.name === 'NotFoundError') {
                showError('Geen microfoon gevonden op dit apparaat.');
            } else {
                showError('De microfoon kon niet worden gestart. Probeer het opnieuw.');
            }
            return;
        }

        var Ctx = window.AudioContext || window.webkitAudioContext;
        audioCtx = new Ctx();
        if (audioCtx.state === 'suspended') {
            try { await audioCtx.resume(); } catch (e) { /* negeer */ }
        }
        source = audioCtx.createMediaStreamSource(stream);
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.8;
        source.connect(analyser);
        dataArray = new Uint8Array(analyser.fftSize);

        running = true;
        shownLevel = 0;
        loudSince = 0;
        startScreen.style.display = 'none';
        meter.style.display = '';
        loop();
    }

    function stop() {
        running = false;
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
        if (stream) {
            stream.getTracks().forEach(function (t) { t.stop(); });
            stream = null;
        }
        if (source) { try { source.disconnect(); } catch (e) {} source = null; }
        if (audioCtx) { try { audioCtx.close(); } catch (e) {} audioCtx = null; }
        analyser = null;
        meter.style.display = 'none';
        startScreen.style.display = '';
        circle.classList.remove('alert');
    }

    function showError(msg) {
        errorEl.textContent = msg;
        errorEl.style.display = 'block';
    }

    // ---------- Meetlus ----------
    function loop() {
        if (!running || !analyser) return;
        analyser.getByteTimeDomainData(dataArray);

        var sum = 0;
        for (var i = 0; i < dataArray.length; i++) {
            var x = (dataArray[i] - 128) / 128;
            sum += x * x;
        }
        var rms = Math.sqrt(sum / dataArray.length);
        var target = Math.min(100, rms * sensitivity * 130);

        // Gladstrijken zodat de meter rustig beweegt
        shownLevel += (target - shownLevel) * 0.35;
        var lvl = Math.max(0, Math.min(100, shownLevel));

        render(lvl);
        rafId = requestAnimationFrame(loop);
    }

    function render(lvl) {
        barFill.style.width = lvl + '%';

        // Pulserend cirkeltje
        var scale = 1 + (lvl / 100) * 0.12;
        circle.style.transform = 'scale(' + scale.toFixed(3) + ')';

        var ratio = threshold > 0 ? lvl / threshold : 0;
        var state, label, emoji;
        if (ratio >= 1) {
            state = 'loud'; label = 'Te luid! Ssst…'; emoji = '😫'; // 😫
        } else if (ratio >= 0.7) {
            state = 'busy'; label = 'Het wordt wat drukker'; emoji = '😐'; // 😐
        } else {
            state = 'calm'; label = 'Lekker rustig'; emoji = '🙂'; // 🙂
        }

        setClass(circle, state);
        setClass(status, state);
        status.textContent = label;
        face.textContent = emoji;

        // Aanhoudend te luid -> schud-alarm
        var now = performance.now();
        if (state === 'loud') {
            if (!loudSince) loudSince = now;
            if (now - loudSince > 1200) {
                circle.classList.add('alert');
                face.textContent = '🤫'; // 🤫
            }
        } else {
            loudSince = 0;
            circle.classList.remove('alert');
        }
    }

    function setClass(el, state) {
        el.classList.remove('calm', 'busy', 'loud');
        el.classList.add(state);
    }

    // ---------- Instellingen modal ----------
    function openSettings() {
        applySettingsToControls();
        settingsModal.classList.add('active');
    }
    function closeSettings() {
        settingsModal.classList.remove('active');
    }

    sensitivityRange.addEventListener('input', function () {
        sensitivity = parseInt(sensitivityRange.value, 10);
        sensitivityVal.textContent = sensitivity;
    });
    thresholdRange.addEventListener('input', function () {
        threshold = parseInt(thresholdRange.value, 10);
        thresholdVal.textContent = threshold + '%';
        barThreshold.style.left = threshold + '%';
    });

    btnSettings.addEventListener('click', openSettings);
    btnCloseSettings.addEventListener('click', closeSettings);
    settingsModal.addEventListener('click', function (e) {
        if (e.target === settingsModal) closeSettings();
    });
    btnSaveSettings.addEventListener('click', async function () {
        await saveSettings();
        closeSettings();
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && settingsModal.classList.contains('active')) closeSettings();
    });

    // ---------- Events ----------
    startBtn.addEventListener('click', start);
    stopBtn.addEventListener('click', stop);

    // Stop de microfoon netjes bij het verlaten van de pagina
    window.addEventListener('pagehide', stop);

    // ---------- Init ----------
    loadSettings();
});

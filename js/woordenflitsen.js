/* ============================================
   WOORDEN FLITSEN - JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

    // Elements
    var wfDisplay = document.getElementById('wfDisplay');
    var wfWord = document.getElementById('wfWord');
    var levelSelector = document.getElementById('wfLevelSelector');
    var speedSelector = document.getElementById('wfSpeedSelector');
    var btnStartPause = document.getElementById('btnStartPause');
    var btnDifficulty = document.getElementById('btnDifficulty');
    var difficultyModal = document.getElementById('difficultyModal');
    var closeDifficultyModal = document.getElementById('closeDifficultyModal');
    var closeDifficultyBtn = document.getElementById('closeDifficultyBtn');

    // State
    var selectedLevel = null;
    var speed = 3; // 1-5
    var words = [];
    var isRunning = false;
    var currentIndex = 0;
    var flashTimer = null;
    var blankTimer = null;

    // Speed map: milliseconds word is shown (display time)
    // 1 star = slow (2500ms), 5 stars = fast (600ms)
    var speedMap = {
        1: 2500,
        2: 1800,
        3: 1200,
        4: 800,
        5: 500
    };

    // Blank time between words (slightly shorter than display)
    var blankMap = {
        1: 1000,
        2: 700,
        3: 500,
        4: 350,
        5: 250
    };

    // ---------- Supabase ----------
    async function loadWords(level) {
        var result = await supabase
            .from('flash_words')
            .select('word')
            .eq('level', level)
            .order('created_at', { ascending: true });

        words = (result.data || []).map(function (w) { return w.word; });
        currentIndex = 0;
    }

    // ---------- Level Selection ----------
    var levelBtns = levelSelector.querySelectorAll('.wf-level-btn');
    for (var i = 0; i < levelBtns.length; i++) {
        levelBtns[i].addEventListener('click', function () {
            var level = this.getAttribute('data-level');
            selectLevel(level);
        });
    }

    async function selectLevel(level) {
        // Stop if running
        if (isRunning) stopFlashing();

        selectedLevel = level;

        // Update active state
        var btns = levelSelector.querySelectorAll('.wf-level-btn');
        for (var i = 0; i < btns.length; i++) {
            btns[i].classList.toggle('active', btns[i].getAttribute('data-level') === level);
        }

        // Load words
        wfWord.textContent = 'Laden...';
        wfWord.className = 'wf-word placeholder';
        await loadWords(level);

        if (words.length === 0) {
            wfWord.textContent = 'Geen woorden voor niveau ' + level;
            btnStartPause.disabled = true;
        } else {
            wfWord.textContent = words.length + ' woorden geladen — druk op start';
            btnStartPause.disabled = false;
        }
    }

    // ---------- Speed Selection ----------
    var starBtns = speedSelector.querySelectorAll('.wf-star-btn');
    for (var i = 0; i < starBtns.length; i++) {
        starBtns[i].addEventListener('click', function () {
            var newSpeed = parseInt(this.getAttribute('data-speed'));
            setSpeed(newSpeed);
        });
    }

    function setSpeed(newSpeed) {
        speed = newSpeed;
        updateStarDisplay();
    }

    function updateStarDisplay() {
        var btns = speedSelector.querySelectorAll('.wf-star-btn');
        for (var i = 0; i < btns.length; i++) {
            var btnSpeed = parseInt(btns[i].getAttribute('data-speed'));
            btns[i].classList.toggle('active', btnSpeed <= speed);
        }
    }

    // Init stars display
    updateStarDisplay();

    // ---------- Start/Pause ----------
    btnStartPause.addEventListener('click', function () {
        if (isRunning) {
            pauseFlashing();
        } else {
            startFlashing();
        }
    });

    function startFlashing() {
        if (!selectedLevel || words.length === 0) return;

        isRunning = true;
        wfDisplay.classList.add('active');
        btnStartPause.innerHTML = '&#10074;&#10074; Pauze';
        btnStartPause.classList.add('paused');

        showNextWord();
    }

    function showNextWord() {
        if (!isRunning) return;
        if (words.length === 0) return;

        // Wrap around
        if (currentIndex >= words.length) {
            currentIndex = 0;
        }

        var word = words[currentIndex];
        wfWord.textContent = word;
        wfWord.className = 'wf-word flash-in';

        // After display time, show blank briefly
        flashTimer = setTimeout(function () {
            if (!isRunning) return;

            // Brief blank
            wfWord.textContent = '';
            wfWord.className = 'wf-word';

            currentIndex++;

            // Check if we've gone through all words
            if (currentIndex >= words.length) {
                // End of list — stop
                stopFlashing();
                wfWord.textContent = 'Klaar! Alle woorden zijn geweest.';
                wfWord.className = 'wf-word placeholder';
                currentIndex = 0;
                return;
            }

            blankTimer = setTimeout(function () {
                showNextWord();
            }, blankMap[speed]);

        }, speedMap[speed]);
    }

    function pauseFlashing() {
        isRunning = false;
        clearTimeout(flashTimer);
        clearTimeout(blankTimer);

        btnStartPause.innerHTML = '&#9654; Start';
        btnStartPause.classList.remove('paused');
        wfDisplay.classList.remove('active');
    }

    function stopFlashing() {
        isRunning = false;
        clearTimeout(flashTimer);
        clearTimeout(blankTimer);

        btnStartPause.innerHTML = '&#9654; Start';
        btnStartPause.classList.remove('paused');
        wfDisplay.classList.remove('active');
    }

    // ---------- Difficulty Modal (placeholder) ----------
    btnDifficulty.addEventListener('click', function () {
        difficultyModal.classList.add('active');
    });

    closeDifficultyModal.addEventListener('click', function () {
        difficultyModal.classList.remove('active');
    });

    closeDifficultyBtn.addEventListener('click', function () {
        difficultyModal.classList.remove('active');
    });

    difficultyModal.addEventListener('click', function (e) {
        if (e.target === difficultyModal) difficultyModal.classList.remove('active');
    });

    // ---------- Keyboard ----------
    document.addEventListener('keydown', function (e) {
        if (e.code === 'Space' && !difficultyModal.classList.contains('active')) {
            e.preventDefault();
            if (isRunning) {
                pauseFlashing();
            } else {
                startFlashing();
            }
        }
    });

    // ---------- Init ----------
    btnStartPause.disabled = true;
});

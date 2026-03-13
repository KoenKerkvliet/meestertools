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
    var difficultyList = document.getElementById('difficultyList');

    // Constants
    var MAX_WORDS = 16;

    // State
    var selectedLevel = null;
    var speed = 3; // 1-5
    var allWordsForLevel = []; // all words for selected level
    var difficulties = []; // difficulties for selected level
    var selectedDifficultyId = null; // null = all words
    var flashWords = []; // the 16 (or fewer) words to flash
    var isRunning = false;
    var currentIndex = 0;
    var flashTimer = null;
    var blankTimer = null;

    // Speed map: milliseconds word is shown (display time)
    var speedMap = {
        1: 2500,
        2: 1800,
        3: 1200,
        4: 800,
        5: 500
    };

    // Blank time between words
    var blankMap = {
        1: 1000,
        2: 700,
        3: 500,
        4: 350,
        5: 250
    };

    // ---------- Supabase ----------
    async function loadWordsForLevel(level) {
        var result = await supabase
            .from('flash_words')
            .select('word, difficulty_id')
            .eq('level', level)
            .order('created_at', { ascending: true });

        allWordsForLevel = result.data || [];
    }

    async function loadDifficultiesForLevel(level) {
        var result = await supabase
            .from('flash_difficulties')
            .select('id, name, levels')
            .contains('levels', [level])
            .order('name');

        difficulties = result.data || [];
    }

    // ---------- Prepare Flash Words ----------
    function prepareFlashWords() {
        // Filter by difficulty if selected
        var filtered;
        if (selectedDifficultyId) {
            filtered = allWordsForLevel.filter(function (w) {
                return w.difficulty_id === selectedDifficultyId;
            });
        } else {
            filtered = allWordsForLevel.slice();
        }

        // Shuffle
        for (var i = filtered.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = filtered[i];
            filtered[i] = filtered[j];
            filtered[j] = temp;
        }

        // Take max 16
        flashWords = filtered.slice(0, MAX_WORDS).map(function (w) { return w.word; });
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
        selectedDifficultyId = null;

        // Update active state
        var btns = levelSelector.querySelectorAll('.wf-level-btn');
        for (var i = 0; i < btns.length; i++) {
            btns[i].classList.toggle('active', btns[i].getAttribute('data-level') === level);
        }

        // Reset difficulty button text
        btnDifficulty.textContent = 'Alle woorden';

        // Load data
        wfWord.textContent = 'Laden...';
        wfWord.className = 'wf-word placeholder';

        await Promise.all([loadWordsForLevel(level), loadDifficultiesForLevel(level)]);

        updateReadyState();
    }

    function updateReadyState() {
        // Count available words with current filter
        var available;
        if (selectedDifficultyId) {
            available = allWordsForLevel.filter(function (w) {
                return w.difficulty_id === selectedDifficultyId;
            });
        } else {
            available = allWordsForLevel;
        }

        if (available.length === 0) {
            var msg = selectedDifficultyId ? 'Geen woorden voor deze moeilijkheid' : 'Geen woorden voor niveau ' + selectedLevel;
            wfWord.textContent = msg;
            wfWord.className = 'wf-word placeholder';
            btnStartPause.disabled = true;
        } else {
            var count = Math.min(available.length, MAX_WORDS);
            wfWord.textContent = count + ' woorden klaar — druk op start';
            wfWord.className = 'wf-word placeholder';
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
        if (!selectedLevel) return;

        // If starting fresh (not resuming from pause), prepare new set
        if (currentIndex === 0 || flashWords.length === 0) {
            prepareFlashWords();
        }

        if (flashWords.length === 0) return;

        isRunning = true;
        wfDisplay.classList.add('active');
        btnStartPause.innerHTML = '&#10074;&#10074; Pauze';
        btnStartPause.classList.add('paused');

        showNextWord();
    }

    function showNextWord() {
        if (!isRunning) return;
        if (flashWords.length === 0) return;

        if (currentIndex >= flashWords.length) {
            // Done — all words shown
            stopFlashing();
            wfWord.textContent = 'Klaar! Alle ' + flashWords.length + ' woorden zijn geweest.';
            wfWord.className = 'wf-word placeholder';
            currentIndex = 0;
            flashWords = [];
            return;
        }

        var word = flashWords[currentIndex];
        wfWord.textContent = word;
        wfWord.className = 'wf-word flash-in';

        // After display time, show blank briefly
        flashTimer = setTimeout(function () {
            if (!isRunning) return;

            // Brief blank
            wfWord.textContent = '';
            wfWord.className = 'wf-word';

            currentIndex++;

            // Check if done
            if (currentIndex >= flashWords.length) {
                stopFlashing();
                wfWord.textContent = 'Klaar! Alle ' + flashWords.length + ' woorden zijn geweest.';
                wfWord.className = 'wf-word placeholder';
                currentIndex = 0;
                flashWords = [];
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

    // ---------- Difficulty Modal ----------
    btnDifficulty.addEventListener('click', function () {
        renderDifficultyList();
        difficultyModal.classList.add('active');
    });

    function renderDifficultyList() {
        if (!difficultyList) return;
        difficultyList.innerHTML = '';

        // "All words" option
        var allOption = document.createElement('button');
        allOption.className = 'wf-diff-option' + (!selectedDifficultyId ? ' active' : '');
        allOption.textContent = 'Alle woorden';
        allOption.addEventListener('click', function () {
            selectedDifficultyId = null;
            btnDifficulty.textContent = 'Alle woorden';
            difficultyModal.classList.remove('active');
            if (isRunning) stopFlashing();
            currentIndex = 0;
            flashWords = [];
            updateReadyState();
        });
        difficultyList.appendChild(allOption);

        if (difficulties.length === 0) {
            var emptyMsg = document.createElement('p');
            emptyMsg.style.cssText = 'color:var(--text-light);text-align:center;padding:12px 0;font-size:14px;';
            emptyMsg.textContent = 'Geen moeilijkheden voor dit niveau. Voeg ze toe via Beheer.';
            difficultyList.appendChild(emptyMsg);
            return;
        }

        difficulties.forEach(function (d) {
            var btn = document.createElement('button');
            btn.className = 'wf-diff-option' + (selectedDifficultyId === d.id ? ' active' : '');
            btn.textContent = d.name;

            // Count words for this difficulty
            var count = allWordsForLevel.filter(function (w) { return w.difficulty_id === d.id; }).length;
            var countSpan = document.createElement('span');
            countSpan.className = 'wf-diff-count';
            countSpan.textContent = count;
            btn.appendChild(countSpan);

            btn.addEventListener('click', function () {
                selectedDifficultyId = d.id;
                btnDifficulty.textContent = d.name;
                difficultyModal.classList.remove('active');
                if (isRunning) stopFlashing();
                currentIndex = 0;
                flashWords = [];
                updateReadyState();
            });
            difficultyList.appendChild(btn);
        });
    }

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

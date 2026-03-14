/* ============================================
   WOORDEN FLITSEN - JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

    // Elements
    var wfDisplay = document.getElementById('wfDisplay');
    var wfWord = document.getElementById('wfWord');
    var levelSelect = document.getElementById('wfLevelSelect');
    var speedSelector = document.getElementById('wfSpeedSelector');
    var btnStartPause = document.getElementById('btnStartPause');
    var btnDifficulty = document.getElementById('btnDifficulty');
    var difficultyModal = document.getElementById('difficultyModal');
    var diffModalTitle = document.getElementById('diffModalTitle');
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
    var selectedDifficultyIds = []; // array of selected IDs (empty = all words)
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
        // Filter by selected difficulties
        var filtered;
        if (selectedDifficultyIds.length > 0) {
            filtered = allWordsForLevel.filter(function (w) {
                return selectedDifficultyIds.indexOf(w.difficulty_id) !== -1;
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

    // ---------- Level Selection (dropdown) ----------
    if (levelSelect) {
        levelSelect.addEventListener('change', function () {
            selectLevel(this.value);
        });
    }

    async function selectLevel(level) {
        // Stop if running
        if (isRunning) stopFlashing();

        selectedLevel = level;
        selectedDifficultyIds = [];

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
        if (selectedDifficultyIds.length > 0) {
            available = allWordsForLevel.filter(function (w) {
                return selectedDifficultyIds.indexOf(w.difficulty_id) !== -1;
            });
        } else {
            available = allWordsForLevel;
        }

        if (available.length === 0) {
            var msg = selectedDifficultyIds.length > 0 ? 'Geen woorden voor deze selectie' : 'Geen woorden voor niveau ' + selectedLevel;
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

    // ---------- Difficulty Button Text ----------
    function updateDifficultyButtonText() {
        if (selectedDifficultyIds.length === 0) {
            btnDifficulty.textContent = 'Alle woorden';
        } else if (selectedDifficultyIds.length === 1) {
            var d = difficulties.find(function (d) { return d.id === selectedDifficultyIds[0]; });
            btnDifficulty.textContent = d ? d.name : '1 geselecteerd';
        } else {
            btnDifficulty.textContent = selectedDifficultyIds.length + ' geselecteerd';
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
        if (!selectedLevel) {
            alert('Kies eerst een leesniveau.');
            return;
        }
        renderDifficultyList();
        if (diffModalTitle) {
            diffModalTitle.textContent = 'Leesmoeilijkheden selecteren - ' + selectedLevel;
        }
        difficultyModal.classList.add('active');
    });

    function renderDifficultyList() {
        if (!difficultyList) return;
        difficultyList.innerHTML = '';

        if (difficulties.length === 0) {
            var emptyMsg = document.createElement('p');
            emptyMsg.style.cssText = 'color:var(--text-light);text-align:center;padding:24px 0;font-size:14px;grid-column:1/-1;';
            emptyMsg.textContent = 'Geen moeilijkheden voor dit niveau. Voeg ze toe via Beheer.';
            difficultyList.appendChild(emptyMsg);
            return;
        }

        difficulties.forEach(function (d) {
            var isSelected = selectedDifficultyIds.indexOf(d.id) !== -1;

            var card = document.createElement('button');
            card.className = 'wf-diff-card' + (isSelected ? ' selected' : '');
            card.type = 'button';

            var nameSpan = document.createElement('span');
            nameSpan.className = 'wf-diff-card-name';
            nameSpan.textContent = d.name;
            card.appendChild(nameSpan);

            var checkmark = document.createElement('span');
            checkmark.className = 'wf-diff-card-check';
            checkmark.innerHTML = '&#10003;';
            card.appendChild(checkmark);

            card.addEventListener('click', function () {
                var idx = selectedDifficultyIds.indexOf(d.id);
                if (idx !== -1) {
                    selectedDifficultyIds.splice(idx, 1);
                    card.classList.remove('selected');
                } else {
                    selectedDifficultyIds.push(d.id);
                    card.classList.add('selected');
                }
            });

            difficultyList.appendChild(card);
        });
    }

    closeDifficultyModal.addEventListener('click', closeDiffModal);
    closeDifficultyBtn.addEventListener('click', closeDiffModal);

    difficultyModal.addEventListener('click', function (e) {
        if (e.target === difficultyModal) closeDiffModal();
    });

    function closeDiffModal() {
        difficultyModal.classList.remove('active');
        updateDifficultyButtonText();
        if (isRunning) stopFlashing();
        currentIndex = 0;
        flashWords = [];
        if (selectedLevel) updateReadyState();
    }

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

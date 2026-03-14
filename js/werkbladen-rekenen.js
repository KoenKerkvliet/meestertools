/* ============================================
   WERKBLAD REKENEN - JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

    // Elements
    var btnGenerate = document.getElementById('btnGenerate');
    var btnDownloadPdf = document.getElementById('btnDownloadPdf');
    var previewSection = document.getElementById('previewSection');
    var previewEl = document.getElementById('wbPreview');
    var decimalOptions = document.getElementById('decimalOptions');
    var settingsBewerkingen = document.getElementById('settingsBewerkingen');
    var settingsStaartdelingen = document.getElementById('settingsStaartdelingen');
    var settingsCijferen = document.getElementById('settingsCijferen');
    var generateSection = document.getElementById('generateSection');

    if (!btnGenerate) return;

    // Set date to today
    var dateInput = document.getElementById('wbDate');
    if (dateInput) {
        var today = new Date();
        var yyyy = today.getFullYear();
        var mm = ('0' + (today.getMonth() + 1)).slice(-2);
        var dd = ('0' + today.getDate()).slice(-2);
        dateInput.value = yyyy + '-' + mm + '-' + dd;
    }

    var currentType = 'bewerkingen';
    var generatedSums = [];
    var generatedDivisions = [];
    var generatedCijfer = [];
    var currentSettings = {};

    // ---------- Type Cards ----------
    var typeCards = document.querySelectorAll('.wb-type-card');
    typeCards.forEach(function (card) {
        card.addEventListener('click', function () {
            typeCards.forEach(function (c) { c.classList.remove('active'); });
            this.classList.add('active');
            currentType = this.getAttribute('data-type');
            updateSettingsVisibility();
        });
    });

    function updateSettingsVisibility() {
        settingsBewerkingen.style.display = 'none';
        settingsStaartdelingen.style.display = 'none';
        if (settingsCijferen) settingsCijferen.style.display = 'none';
        generateSection.style.display = '';
        previewSection.style.display = 'none';

        if (currentType === 'bewerkingen') {
            settingsBewerkingen.style.display = '';
        } else if (currentType === 'staartdelingen') {
            settingsStaartdelingen.style.display = '';
        } else if (currentType === 'cijferen') {
            if (settingsCijferen) settingsCijferen.style.display = '';
        } else {
            generateSection.style.display = 'none';
            // Show coming soon in preview
            previewSection.style.display = '';
            previewEl.innerHTML =
                '<div class="wb-coming-soon">' +
                '<div class="wb-coming-icon">&#128679;</div>' +
                '<p>Dit type werkblad is binnenkort beschikbaar.</p>' +
                '</div>';
        }
    }

    // ---------- Operation Toggles (wide) ----------
    var toggleBtns = document.querySelectorAll('.wb-toggle-wide');
    toggleBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            this.classList.toggle('active');
            // Ensure at least one is active
            var anyActive = document.querySelector('.wb-toggle-wide.active');
            if (!anyActive) this.classList.add('active');
        });
    });

    // ---------- Stepper (aantal sommen) ----------
    var countInput = document.getElementById('wbCount');
    var btnMinus = document.getElementById('wbCountMinus');
    var btnPlus = document.getElementById('wbCountPlus');

    if (btnMinus) {
        btnMinus.addEventListener('click', function () {
            var val = parseInt(countInput.value) || 40;
            if (val > 1) countInput.value = val - 1;
        });
    }
    if (btnPlus) {
        btnPlus.addEventListener('click', function () {
            var val = parseInt(countInput.value) || 40;
            if (val < 200) countInput.value = val + 1;
        });
    }

    // ---------- Number Type Switch ----------
    var numTypeBtns = document.querySelectorAll('.wb-switch-btn[data-numtype]');
    var numberTypeHidden = document.getElementById('numberTypeHidden');

    numTypeBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            numTypeBtns.forEach(function (b) { b.classList.remove('active'); });
            this.classList.add('active');
            var val = this.getAttribute('data-numtype');
            numberTypeHidden.value = val;
            decimalOptions.style.display = val === 'decimaal' ? '' : 'none';
        });
    });

    // ---------- Name Field Switch ----------
    var nameFieldBtns = document.querySelectorAll('.wb-switch-btn[data-namefield]');
    var nameFieldHidden = document.getElementById('wbNameField');

    nameFieldBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            nameFieldBtns.forEach(function (b) { b.classList.remove('active'); });
            this.classList.add('active');
            nameFieldHidden.value = this.getAttribute('data-namefield');
        });
    });

    // ---------- Long Division Stepper ----------
    var ldCountInput = document.getElementById('wbLdCount');
    var ldBtnMinus = document.getElementById('wbLdCountMinus');
    var ldBtnPlus = document.getElementById('wbLdCountPlus');

    if (ldBtnMinus) {
        ldBtnMinus.addEventListener('click', function () {
            var val = parseInt(ldCountInput.value) || 12;
            if (val > 1) ldCountInput.value = val - 1;
        });
    }
    if (ldBtnPlus) {
        ldBtnPlus.addEventListener('click', function () {
            var val = parseInt(ldCountInput.value) || 12;
            if (val < 48) ldCountInput.value = val + 1;
        });
    }

    // ---------- Long Division Remainder Switch ----------
    var remainderBtns = document.querySelectorAll('.wb-switch-btn[data-remainder]');
    var remainderHidden = document.getElementById('wbLdRemainder');
    var ldDecimalOptions = document.getElementById('ldDecimalOptions');

    remainderBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            remainderBtns.forEach(function (b) { b.classList.remove('active'); });
            this.classList.add('active');
            var val = this.getAttribute('data-remainder');
            remainderHidden.value = val;
            ldDecimalOptions.style.display = val === 'decimaal' ? '' : 'none';
        });
    });

    // ---------- Long Division Decimal Toggle ----------
    document.querySelectorAll('.wb-toggle-num[data-lddec]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            this.parentNode.querySelectorAll('.wb-toggle-num').forEach(function (b) {
                b.classList.remove('active');
            });
            this.classList.add('active');
            document.getElementById('wbLdDecimals').value = this.getAttribute('data-lddec');
        });
    });

    // ---------- Decimal Toggle Buttons ----------
    document.querySelectorAll('.wb-toggle-num').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var target = this.getAttribute('data-target');
            // Deactivate siblings
            this.parentNode.querySelectorAll('.wb-toggle-num').forEach(function (b) {
                b.classList.remove('active');
            });
            this.classList.add('active');
            if (target) document.getElementById(target).value = this.getAttribute('data-dec') || this.getAttribute('data-cfdec') || this.getAttribute('data-lddec');
        });
    });

    // ---------- Cijferen Stepper ----------
    var cfCountInput = document.getElementById('wbCfCount');
    var cfBtnMinus = document.getElementById('wbCfCountMinus');
    var cfBtnPlus = document.getElementById('wbCfCountPlus');

    if (cfBtnMinus) {
        cfBtnMinus.addEventListener('click', function () {
            var val = parseInt(cfCountInput.value) || 20;
            if (val > 1) cfCountInput.value = val - 1;
        });
    }
    if (cfBtnPlus) {
        cfBtnPlus.addEventListener('click', function () {
            var val = parseInt(cfCountInput.value) || 20;
            if (val < 80) cfCountInput.value = val + 1;
        });
    }

    // ---------- Cijferen Operation Toggles ----------
    var cfToggleBtns = document.querySelectorAll('.wb-toggle-wide[data-cfop]');
    cfToggleBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            this.classList.toggle('active');
            var anyActive = document.querySelector('.wb-toggle-wide[data-cfop].active');
            if (!anyActive) this.classList.add('active');
        });
    });

    // ---------- Cijferen Number Type Switch ----------
    var cfNumTypeBtns = document.querySelectorAll('.wb-switch-btn[data-cfnumtype]');
    var cfNumberTypeHidden = document.getElementById('cfNumberTypeHidden');
    var cfDecimalOptions = document.getElementById('cfDecimalOptions');

    cfNumTypeBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            cfNumTypeBtns.forEach(function (b) { b.classList.remove('active'); });
            this.classList.add('active');
            var val = this.getAttribute('data-cfnumtype');
            if (cfNumberTypeHidden) cfNumberTypeHidden.value = val;
            if (cfDecimalOptions) cfDecimalOptions.style.display = val === 'decimaal' ? '' : 'none';
        });
    });

    // ---------- Cijferen Decimal Toggles ----------
    document.querySelectorAll('.wb-toggle-num[data-cfdec]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            this.parentNode.querySelectorAll('.wb-toggle-num').forEach(function (b) {
                b.classList.remove('active');
            });
            this.classList.add('active');
            var target = this.getAttribute('data-target');
            if (target) document.getElementById(target).value = this.getAttribute('data-cfdec');
        });
    });

    // ---------- Read Settings ----------
    function readSettings() {
        var ops = [];
        document.querySelectorAll('.wb-toggle-wide[data-op].active').forEach(function (btn) {
            ops.push(btn.getAttribute('data-op'));
        });

        var numberType = numberTypeHidden.value;

        // Format date
        var dateVal = document.getElementById('wbDate').value;
        var dateStr = '';
        if (dateVal) {
            var d = new Date(dateVal);
            dateStr = ('0' + d.getDate()).slice(-2) + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + d.getFullYear();
        }

        return {
            title: document.getElementById('wbTitle').value.trim() || 'Rekenwerkblad',
            date: dateStr,
            datePrefix: document.getElementById('wbDatePrefix').value.trim(),
            showName: document.getElementById('wbNameField').value === 'ja',
            count: Math.max(1, Math.min(200, parseInt(document.getElementById('wbCount').value) || 40)),
            operations: ops,
            numberType: numberType,
            decimals1: numberType === 'decimaal' ? parseInt(document.getElementById('wbDec1').value) : 0,
            decimals2: numberType === 'decimaal' ? parseInt(document.getElementById('wbDec2').value) : 0,
            min1: parseFloat(document.getElementById('wbMin1').value) || 1,
            max1: parseFloat(document.getElementById('wbMax1').value) || 100,
            min2: parseFloat(document.getElementById('wbMin2').value) || 1,
            max2: parseFloat(document.getElementById('wbMax2').value) || 100,
            answerSheet: document.getElementById('wbAnswerSheet').checked
        };
    }

    // ---------- Generate Random Number ----------
    function randomInRange(min, max, decimals) {
        if (decimals > 0) {
            var factor = Math.pow(10, decimals);
            var raw = min + Math.random() * (max - min);
            return Math.round(raw * factor) / factor;
        }
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // ---------- Generate Sums ----------
    function sumKey(a, op, b) {
        return a + op + b;
    }

    function generateSums(settings) {
        var sums = [];
        var used = {};
        var maxAttempts = settings.count * 10;
        var totalAttempts = 0;

        while (sums.length < settings.count && totalAttempts < maxAttempts) {
            totalAttempts++;

            var op = settings.operations[Math.floor(Math.random() * settings.operations.length)];
            var a = randomInRange(settings.min1, settings.max1, settings.decimals1);
            var b = randomInRange(settings.min2, settings.max2, settings.decimals2);

            // Subtraction: ensure a >= b (no negative answers)
            if (op === '-' && a < b) {
                var tmp = a; a = b; b = tmp;
            }

            // Division: ensure whole number answer >= 5
            if (op === '/') {
                // Pick b first (not zero), then make a a multiple of b
                var bAttempts = 0;
                while (b === 0 && bAttempts < 20) {
                    b = randomInRange(settings.min2, settings.max2, settings.decimals2);
                    bAttempts++;
                }
                if (b === 0) b = 1;
                // Make a a multiple of b within range, with answer >= 5
                var minMult = Math.max(Math.ceil(settings.min1 / b), 5);
                var maxMult = Math.floor(settings.max1 / b);
                if (minMult > maxMult) {
                    // No valid multiple in range, skip
                    continue;
                }
                var mult = Math.floor(Math.random() * (maxMult - minMult + 1)) + minMult;
                a = mult * b;
            }

            var answer;
            switch (op) {
                case '+': answer = a + b; break;
                case '-': answer = a - b; break;
                case '*': answer = a * b; break;
                case '/': answer = a / b; break;
            }

            // Round answer to avoid floating point issues
            answer = Math.round(answer * 1000) / 1000;

            // Skip if answer is not a whole number
            if (!Number.isInteger(answer)) continue;

            // Skip negative answers
            if (answer < 0) continue;

            // Skip duplicates
            var key = sumKey(a, op, b);
            if (used[key]) continue;
            used[key] = true;

            sums.push({ a: a, op: op, b: b, answer: answer });
        }

        return sums;
    }

    // ---------- Format Number ----------
    function formatNum(n) {
        if (Number.isInteger(n)) return n.toString();
        // Show up to 3 decimals, remove trailing zeros
        return parseFloat(n.toFixed(3)).toString();
    }

    // ---------- Op Symbol ----------
    function opSymbol(op) {
        switch (op) {
            case '+': return '+';
            case '-': return '\u2212';
            case '*': return '\u00D7';
            case '/': return '\u00F7';
        }
        return op;
    }

    // PDF-safe symbols (jsPDF default font doesn't support unicode math chars)
    function opSymbolPdf(op) {
        switch (op) {
            case '+': return '+';
            case '-': return '-';
            case '*': return 'x';
            case '/': return ':';
        }
        return op;
    }

    // ---------- Calculate Max Column Widths ----------
    function calcMaxWidths(sums) {
        var maxA = 0;
        var maxB = 0;
        var maxAnswer = 0;
        for (var i = 0; i < sums.length; i++) {
            var aLen = formatNum(sums[i].a).length;
            var bLen = formatNum(sums[i].b).length;
            var ansLen = formatNum(sums[i].answer).length;
            if (aLen > maxA) maxA = aLen;
            if (bLen > maxB) maxB = bLen;
            if (ansLen > maxAnswer) maxAnswer = ansLen;
        }
        return { maxA: maxA, maxB: maxB, maxAnswer: maxAnswer };
    }

    // ---------- Layout: 2 cols, 4 rows of blocks, 5 sums per block ----------
    // Numbering goes left-to-right, top-to-bottom through blocks
    function arrangeInBlocks(sums) {
        var cols = 2;
        var sumsPerBlock = 5;
        var totalBlocks = Math.ceil(sums.length / sumsPerBlock);
        var rows = Math.ceil(totalBlocks / cols);
        var blocks = [];

        for (var b = 0; b < totalBlocks; b++) {
            var start = b * sumsPerBlock;
            var end = Math.min(start + sumsPerBlock, sums.length);
            var block = [];
            for (var i = start; i < end; i++) {
                block.push({ sum: sums[i], index: i });
            }
            blocks.push(block);
        }

        // Arrange in grid order: row by row, left to right
        // blocks[0] = top-left, blocks[1] = top-right, blocks[2] = second-row-left, etc.
        var grid = [];
        for (var r = 0; r < rows; r++) {
            var rowBlocks = [];
            for (var c = 0; c < cols; c++) {
                var idx = r * cols + c;
                rowBlocks.push(idx < blocks.length ? blocks[idx] : []);
            }
            grid.push(rowBlocks);
        }

        return { grid: grid, rows: rows, cols: cols };
    }

    // ---------- Build header HTML ----------
    function buildHeaderHtml(settings, isAnswers) {
        var html = '';

        // Title row (title left, date right)
        html += '<div class="wb-preview-header-row">';
        var titleText = isAnswers ? escapeHtml(settings.title) + ' - Antwoordblad' : escapeHtml(settings.title);
        html += '<div class="wb-preview-title">' + titleText + '</div>';
        if (settings.date) {
            var dateDisplay = settings.datePrefix ? escapeHtml(settings.datePrefix) + ' ' + settings.date : settings.date;
            html += '<div class="wb-preview-date">' + dateDisplay + '</div>';
        }
        html += '</div>';

        // Name field
        if (settings.showName) {
            html += '<div class="wb-preview-name">Naam: ___________________________</div>';
        }

        // Separator
        html += '<div class="wb-preview-separator"></div>';

        return html;
    }

    // ---------- Render Preview ----------
    var SUMS_PER_PAGE = 50; // 2 cols × 5 rows × 5 per block

    function renderPreview(settings, sums) {
        var html = '';

        // Preview: only show first page of sums (PDF downloads all pages)
        var previewSums = sums.slice(0, SUMS_PER_PAGE);
        html += '<div class="wb-preview-page">';
        html += buildHeaderHtml(settings, false);
        html += renderSumsGrid(previewSums, false);
        html += '<div class="wb-preview-footer">Meester Tools</div>';
        html += '</div>';

        // Answer sheet: only first page
        if (settings.answerSheet) {
            html += '<div class="wb-preview-page">';
            html += buildHeaderHtml(settings, true);
            html += renderSumsGrid(previewSums, true);
            html += '<div class="wb-preview-footer">Meester Tools</div>';
            html += '</div>';
        }

        previewEl.innerHTML = html;
        previewSection.style.display = '';
    }

    function renderSumsGrid(sums, showAnswers) {
        var layout = arrangeInBlocks(sums);
        var widths = calcMaxWidths(sums);

        // Build grid-template-columns based on max character widths
        var colA = Math.max(widths.maxA, 2) + 'ch';
        var colOp = '2ch';
        var colB = Math.max(widths.maxB, 2) + 'ch';
        var colEq = '1.5ch';
        var colAns = showAnswers ? Math.max(widths.maxAnswer, 3) + 'ch' : '4ch';
        var gridCols = colA + ' ' + colOp + ' ' + colB + ' ' + colEq + ' ' + colAns;

        var html = '<div class="wb-preview-blocks">';

        for (var r = 0; r < layout.rows; r++) {
            for (var c = 0; c < layout.cols; c++) {
                var block = layout.grid[r][c];
                html += '<div class="wb-preview-block">';
                for (var i = 0; i < block.length; i++) {
                    var entry = block[i];
                    var s = entry.sum;
                    html += '<div class="wb-preview-sum" style="grid-template-columns:' + gridCols + ';">';
                    html += '<span class="wb-preview-a">' + formatNum(s.a) + '</span>';
                    html += '<span class="wb-preview-op">' + opSymbol(s.op) + '</span>';
                    html += '<span class="wb-preview-b">' + formatNum(s.b) + '</span>';
                    html += '<span class="wb-preview-eq">=</span>';
                    if (showAnswers) {
                        html += '<span class="wb-preview-answer">' + formatNum(s.answer) + '</span>';
                    } else {
                        html += '<span class="wb-preview-line">___</span>';
                    }
                    html += '</div>';
                }
                html += '</div>';
            }
        }

        html += '</div>';
        return html;
    }

    // ============================================
    // STAARTDELINGEN (Long Division)
    // ============================================

    // ---------- Read Settings Staartdelingen ----------
    function readSettingsStaartdelingen() {
        // Format date (shared)
        var dateVal = document.getElementById('wbDate').value;
        var dateStr = '';
        if (dateVal) {
            var d = new Date(dateVal);
            dateStr = ('0' + d.getDate()).slice(-2) + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + d.getFullYear();
        }

        return {
            title: document.getElementById('wbTitle').value.trim() || 'Rekenwerkblad',
            date: dateStr,
            datePrefix: document.getElementById('wbDatePrefix').value.trim(),
            showName: document.getElementById('wbNameField').value === 'ja',
            count: Math.max(1, Math.min(48, parseInt(document.getElementById('wbLdCount').value) || 12)),
            divisionType: document.getElementById('wbLdRemainder').value,
            ldDecimals: parseInt(document.getElementById('wbLdDecimals').value) || 1,
            minDeeltal: parseInt(document.getElementById('wbLdMinDeeltal').value) || 10,
            maxDeeltal: parseInt(document.getElementById('wbLdMaxDeeltal').value) || 100,
            minDeler: parseInt(document.getElementById('wbLdMinDeler').value) || 2,
            maxDeler: parseInt(document.getElementById('wbLdMaxDeler').value) || 9,
            answerSheet: document.getElementById('wbLdAnswerSheet').checked
        };
    }

    // ---------- Generate Long Divisions ----------
    function generateLongDivisions(settings) {
        var divisions = [];
        var used = {};
        var maxAttempts = settings.count * 50;
        var totalAttempts = 0;

        while (divisions.length < settings.count && totalAttempts < maxAttempts) {
            totalAttempts++;

            var deler = Math.floor(Math.random() * (settings.maxDeler - settings.minDeler + 1)) + settings.minDeler;
            if (deler <= 0) deler = 2;

            var deeltal, quotient, rest, decimalAnswer;

            if (settings.divisionType === 'zonder') {
                // Without remainder: deeltal = deler * quotient
                var minQ = Math.max(3, Math.ceil(settings.minDeeltal / deler));
                var maxQ = Math.floor(settings.maxDeeltal / deler);
                if (minQ > maxQ) continue;

                quotient = Math.floor(Math.random() * (maxQ - minQ + 1)) + minQ;
                deeltal = deler * quotient;
                rest = 0;
                decimalAnswer = null;
            } else if (settings.divisionType === 'met') {
                // With remainder: deeltal = deler * quotient + rest, 0 < rest < deler
                var minQ = Math.max(3, Math.ceil(settings.minDeeltal / deler));
                var maxQ = Math.floor(settings.maxDeeltal / deler);
                if (minQ > maxQ) continue;

                quotient = Math.floor(Math.random() * (maxQ - minQ + 1)) + minQ;
                if (deler <= 1) continue;
                rest = Math.floor(Math.random() * (deler - 1)) + 1;
                deeltal = deler * quotient + rest;

                if (deeltal > settings.maxDeeltal || deeltal < settings.minDeeltal) continue;
                decimalAnswer = null;
            } else {
                // Decimal: deeltal / deler = decimal answer with max N decimals
                // Generate a decimal answer first, then compute deeltal
                var factor = Math.pow(10, settings.ldDecimals);
                var wholeMin = Math.max(3, Math.ceil(settings.minDeeltal / deler));
                var wholeMax = Math.floor(settings.maxDeeltal / deler);
                if (wholeMin > wholeMax) continue;

                // Random whole part >= 3
                var wholePart = Math.floor(Math.random() * (wholeMax - wholeMin + 1)) + wholeMin;
                // Random decimal part (at least 1 so it's not a whole number)
                var decPart = Math.floor(Math.random() * (factor - 1)) + 1;
                var answer = wholePart + decPart / factor;

                // deeltal = deler * answer, must be a whole number
                deeltal = Math.round(deler * answer * factor) / factor;
                // Check deeltal is integer
                if (!Number.isInteger(Math.round(deeltal * 100) / 100)) {
                    // Force it: deeltal = deler * (wholePart * factor + decPart) / factor
                    var numerator = wholePart * factor + decPart;
                    if ((numerator * deler) % factor !== 0) {
                        // Not a clean integer deeltal, try differently
                        // Pick deeltal directly as integer, compute decimal answer
                        deeltal = Math.floor(Math.random() * (settings.maxDeeltal - settings.minDeeltal + 1)) + settings.minDeeltal;
                        answer = Math.round((deeltal / deler) * factor) / factor;
                        // Ensure answer has decimals and >= 3
                        if (answer === Math.floor(answer) || answer < 3) continue;
                    } else {
                        deeltal = (numerator * deler) / factor;
                    }
                }

                if (deeltal > settings.maxDeeltal || deeltal < settings.minDeeltal) continue;
                if (!Number.isInteger(deeltal)) continue;

                decimalAnswer = Math.round((deeltal / deler) * factor) / factor;
                if (decimalAnswer < 3) continue;
                // Verify it actually has decimals
                if (decimalAnswer === Math.floor(decimalAnswer)) continue;

                quotient = Math.floor(decimalAnswer);
                rest = 0;
            }

            // Skip duplicates
            var key = deeltal + '/' + deler;
            if (used[key]) continue;
            used[key] = true;

            divisions.push({
                deeltal: deeltal,
                deler: deler,
                quotient: quotient,
                rest: rest,
                decimalAnswer: decimalAnswer
            });
        }

        return divisions;
    }

    // ---------- Render Long Division Preview ----------
    var LD_PER_PAGE = 12; // 3 cols × 4 rows

    function renderLdPreview(settings, divisions) {
        var html = '';

        // Preview: only show first page of divisions (PDF downloads all pages)
        var previewDivs = divisions.slice(0, LD_PER_PAGE);
        html += '<div class="wb-preview-page">';
        html += buildHeaderHtml(settings, false);
        html += renderLdGrid(previewDivs, false);
        html += '<div class="wb-preview-footer">Meester Tools</div>';
        html += '</div>';

        // Answer sheet: only first page
        if (settings.answerSheet) {
            html += '<div class="wb-preview-page">';
            html += buildHeaderHtml(settings, true);
            html += renderLdGrid(previewDivs, true);
            html += '<div class="wb-preview-footer">Meester Tools</div>';
            html += '</div>';
        }

        previewEl.innerHTML = html;
        previewSection.style.display = '';
    }

    function renderLdGrid(divisions, showAnswers) {
        var html = '<div class="wb-ld-grid">';

        for (var i = 0; i < divisions.length; i++) {
            var div = divisions[i];
            html += '<div class="wb-ld-cell">';
            html += '<div class="wb-ld-notation">';
            html += '<span>' + div.deler + '</span>';
            html += ' / ';
            html += '<span>' + div.deeltal + '</span>';
            html += ' \\ ';
            if (showAnswers) {
                if (div.decimalAnswer !== null) {
                    html += '<span class="wb-ld-answer">' + div.decimalAnswer + '</span>';
                } else {
                    html += '<span class="wb-ld-answer">' + div.quotient;
                    if (div.rest > 0) html += ' rest ' + div.rest;
                    html += '</span>';
                }
            } else {
                html += '<span class="wb-ld-blank">___</span>';
            }
            html += '</div>';

            // Empty work space
            if (!showAnswers) {
                html += '<div class="wb-ld-work"></div>';
            }

            html += '</div>';
        }

        html += '</div>';
        return html;
    }

    // ---------- Long Division PDF ----------
    function generateLdPdfPage(doc, settings, divisions, isAnswers) {
        var pageW = 210;
        var margin = 20;
        var contentW = pageW - margin * 2;

        // Title (left-aligned)
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(50, 50, 70);
        var titleText = settings.title;
        if (isAnswers) titleText += ' - Antwoordblad';
        doc.text(titleText, margin, margin + 7);

        // Date (right-aligned)
        if (settings.date) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 100, 110);
            var dateDisplay = settings.datePrefix ? settings.datePrefix + ' ' + settings.date : settings.date;
            doc.text(dateDisplay, pageW - margin, margin + 7, { align: 'right' });
        }

        var yPos = margin + 16;

        // Name field (above separator)
        if (settings.showName) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 100, 110);
            doc.text('Naam: ___________________________', margin, yPos);
            yPos += 8;
        }

        // Separator line
        doc.setDrawColor(200, 200, 210);
        doc.setLineWidth(0.5);
        doc.line(margin, yPos, pageW - margin, yPos);

        var yStart = yPos + 8;

        // Grid: 3 columns, max 4 rows
        var numCols = 3;
        var colGap = 8;
        var colW = (contentW - colGap * (numCols - 1)) / numCols;
        var cellH = isAnswers ? 20 : 55; // answers need less space
        var rowGap = 6;

        for (var i = 0; i < divisions.length; i++) {
            var col = i % numCols;
            var row = Math.floor(i / numCols);
            var x = margin + col * (colW + colGap);
            var y = yStart + row * (cellH + rowGap);

            var div = divisions[i];

            // Notation: deler / deeltal \ answer
            doc.setFontSize(12);
            doc.setFont('courier', 'normal');
            doc.setTextColor(50, 50, 70);

            var notation = div.deler + ' / ' + div.deeltal + ' \\ ';
            doc.text(notation, x, y);

            if (isAnswers) {
                var ansText;
                if (div.decimalAnswer !== null) {
                    ansText = div.decimalAnswer.toString();
                } else {
                    ansText = div.quotient.toString();
                    if (div.rest > 0) ansText += ' rest ' + div.rest;
                }
                doc.setFont('courier', 'bold');
                doc.setTextColor(108, 99, 255);
                var notationW = doc.getTextWidth(notation);
                doc.text(ansText, x + notationW, y);
            } else {
                // Draw answer line
                var notationW = doc.getTextWidth(notation);
                doc.setDrawColor(200, 200, 210);
                doc.setLineWidth(0.3);
                doc.line(x + notationW, y, x + notationW + 12, y);
            }
        }

        // Footer separator
        doc.setDrawColor(220, 220, 230);
        doc.setLineWidth(0.3);
        doc.line(margin, 285, pageW - margin, 285);

        // Footer
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(160, 160, 175);
        doc.text('Meester Tools', margin, 290);
    }

    // ============================================
    // CIJFEREN (Column Arithmetic)
    // ============================================

    var CF_PER_PAGE = 20; // 4 cols × 5 rows

    // ---------- Read Settings Cijferen ----------
    function readSettingsCijferen() {
        var ops = [];
        document.querySelectorAll('.wb-toggle-wide[data-cfop].active').forEach(function (btn) {
            ops.push(btn.getAttribute('data-cfop'));
        });

        var dateVal = document.getElementById('wbDate').value;
        var dateStr = '';
        if (dateVal) {
            var d = new Date(dateVal);
            dateStr = ('0' + d.getDate()).slice(-2) + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + d.getFullYear();
        }

        var numberType = cfNumberTypeHidden ? cfNumberTypeHidden.value : 'heel';

        return {
            title: document.getElementById('wbTitle').value.trim() || 'Rekenwerkblad',
            date: dateStr,
            datePrefix: document.getElementById('wbDatePrefix').value.trim(),
            showName: document.getElementById('wbNameField').value === 'ja',
            count: Math.max(1, Math.min(80, parseInt(document.getElementById('wbCfCount').value) || 20)),
            operations: ops,
            numberType: numberType,
            decimals1: numberType === 'decimaal' ? parseInt(document.getElementById('wbCfDec1').value) : 0,
            decimals2: numberType === 'decimaal' ? parseInt(document.getElementById('wbCfDec2').value) : 0,
            min1: parseFloat(document.getElementById('wbCfMin1').value) || 100,
            max1: parseFloat(document.getElementById('wbCfMax1').value) || 500,
            min2: parseFloat(document.getElementById('wbCfMin2').value) || 100,
            max2: parseFloat(document.getElementById('wbCfMax2').value) || 500,
            answerSheet: document.getElementById('wbCfAnswerSheet').checked
        };
    }

    // ---------- Generate Cijfer Sums ----------
    function generateCijferSums(settings) {
        var sums = [];
        var used = {};
        var maxAttempts = settings.count * 10;
        var totalAttempts = 0;

        while (sums.length < settings.count && totalAttempts < maxAttempts) {
            totalAttempts++;

            var op = settings.operations[Math.floor(Math.random() * settings.operations.length)];
            var a = randomInRange(settings.min1, settings.max1, settings.decimals1);
            var b = randomInRange(settings.min2, settings.max2, settings.decimals2);

            // Subtraction: ensure a >= b (no negative answers)
            if (op === '-' && a < b) {
                var tmp = a; a = b; b = tmp;
            }

            var answer;
            switch (op) {
                case '+': answer = a + b; break;
                case '-': answer = a - b; break;
                case '*': answer = a * b; break;
            }

            answer = Math.round(answer * 1000) / 1000;

            // For whole numbers mode, skip non-integer answers
            if (settings.numberType === 'heel' && !Number.isInteger(answer)) continue;

            // Skip negative answers
            if (answer < 0) continue;

            // Skip duplicates
            var key = a + op + b;
            if (used[key]) continue;
            used[key] = true;

            sums.push({ a: a, op: op, b: b, answer: answer });
        }

        return sums;
    }

    // ---------- Render Cijferen Preview ----------
    function renderCfPreview(settings, sums) {
        var html = '';

        // Preview: only first page
        var previewSums = sums.slice(0, CF_PER_PAGE);
        html += '<div class="wb-preview-page">';
        html += buildHeaderHtml(settings, false);
        html += renderCfGrid(previewSums, false);
        html += '<div class="wb-preview-footer">Meester Tools</div>';
        html += '</div>';

        // Answer sheet: only first page
        if (settings.answerSheet) {
            html += '<div class="wb-preview-page">';
            html += buildHeaderHtml(settings, true);
            html += renderCfGrid(previewSums, true);
            html += '<div class="wb-preview-footer">Meester Tools</div>';
            html += '</div>';
        }

        previewEl.innerHTML = html;
        previewSection.style.display = '';
    }

    function renderCfGrid(sums, showAnswers) {
        var html = '<div class="wb-cf-grid">';

        for (var i = 0; i < sums.length; i++) {
            var s = sums[i];
            var aStr = formatNum(s.a);
            var bStr = formatNum(s.b);
            var ansStr = formatNum(s.answer);

            // Determine the widest string for alignment
            var maxLen = Math.max(aStr.length, bStr.length + 2, showAnswers ? ansStr.length : 0);

            html += '<div class="wb-cf-cell">';
            // Top number (right-aligned)
            html += '<div class="wb-cf-number">' + escapeHtml(aStr) + '</div>';
            // Bottom number with operator
            html += '<div class="wb-cf-bottom-row">';
            html += '<span class="wb-cf-op">' + opSymbol(s.op) + '</span>';
            html += '<span class="wb-cf-number">' + escapeHtml(bStr) + '</span>';
            html += '</div>';
            // Line
            html += '<div class="wb-cf-line"></div>';
            // Answer or empty
            if (showAnswers) {
                html += '<div class="wb-cf-answer">' + escapeHtml(ansStr) + '</div>';
            }
            html += '</div>';
        }

        html += '</div>';
        return html;
    }

    // ---------- Cijferen PDF ----------
    function generateCfPdfPage(doc, settings, sums, isAnswers) {
        var pageW = 210;
        var margin = 20;
        var contentW = pageW - margin * 2;

        // Title (left-aligned)
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(50, 50, 70);
        var titleText = settings.title;
        if (isAnswers) titleText += ' - Antwoordblad';
        doc.text(titleText, margin, margin + 7);

        // Date (right-aligned)
        if (settings.date) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 100, 110);
            var dateDisplay = settings.datePrefix ? settings.datePrefix + ' ' + settings.date : settings.date;
            doc.text(dateDisplay, pageW - margin, margin + 7, { align: 'right' });
        }

        var yPos = margin + 16;

        // Name field (above separator)
        if (settings.showName) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 100, 110);
            doc.text('Naam: ___________________________', margin, yPos);
            yPos += 8;
        }

        // Separator line
        doc.setDrawColor(200, 200, 210);
        doc.setLineWidth(0.5);
        doc.line(margin, yPos, pageW - margin, yPos);

        var yStart = yPos + 8;

        // Grid: 4 columns, max 5 rows
        var numCols = 4;
        var colGap = 8;
        var colW = (contentW - colGap * (numCols - 1)) / numCols;
        var cellH = isAnswers ? 28 : 40;
        var rowGap = 6;

        doc.setFont('courier', 'normal');

        for (var i = 0; i < sums.length; i++) {
            var col = i % numCols;
            var row = Math.floor(i / numCols);
            var x = margin + col * (colW + colGap);
            var y = yStart + row * (cellH + rowGap);

            var s = sums[i];
            var aStr = formatNum(s.a);
            var bStr = formatNum(s.b);
            var ansStr = formatNum(s.answer);

            doc.setFontSize(12);
            doc.setFont('courier', 'normal');
            doc.setTextColor(50, 50, 70);

            // Right edge of the cell for alignment
            var rightX = x + colW - 4;

            // Top number (right-aligned)
            doc.text(aStr, rightX, y, { align: 'right' });

            // Bottom number with operator (right-aligned, op to the left)
            var lineY = y + 7;
            doc.text(bStr, rightX, lineY, { align: 'right' });

            // Operator to the left of the bottom number
            var bWidth = doc.getTextWidth(bStr);
            var opStr = opSymbolPdf(s.op);
            doc.text(opStr, rightX - bWidth - 2, lineY);

            // Underline
            var lineStartX = rightX - Math.max(doc.getTextWidth(aStr), bWidth + doc.getTextWidth(opStr) + 2) - 2;
            doc.setDrawColor(80, 80, 90);
            doc.setLineWidth(0.4);
            doc.line(lineStartX, lineY + 2, rightX + 1, lineY + 2);

            // Answer
            if (isAnswers) {
                doc.setFont('courier', 'bold');
                doc.setTextColor(108, 99, 255);
                doc.text(ansStr, rightX, lineY + 9, { align: 'right' });
            }
        }

        // Footer separator
        doc.setDrawColor(220, 220, 230);
        doc.setLineWidth(0.3);
        doc.line(margin, 285, pageW - margin, 285);

        // Footer
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(160, 160, 175);
        doc.text('Meester Tools', margin, 290);
    }

    // ---------- Generate Button ----------
    btnGenerate.addEventListener('click', function () {
        if (currentType === 'bewerkingen') {
            currentSettings = readSettings();
            generatedSums = generateSums(currentSettings);
            generatedDivisions = [];
            generatedCijfer = [];
            renderPreview(currentSettings, generatedSums);
        } else if (currentType === 'staartdelingen') {
            currentSettings = readSettingsStaartdelingen();
            generatedDivisions = generateLongDivisions(currentSettings);
            generatedSums = [];
            generatedCijfer = [];
            renderLdPreview(currentSettings, generatedDivisions);
        } else if (currentType === 'cijferen') {
            currentSettings = readSettingsCijferen();
            generatedCijfer = generateCijferSums(currentSettings);
            generatedSums = [];
            generatedDivisions = [];
            renderCfPreview(currentSettings, generatedCijfer);
        } else {
            return;
        }

        // Scroll to preview
        previewSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // ---------- PDF Generation ----------
    btnDownloadPdf.addEventListener('click', function () {
        if (generatedSums.length === 0 && generatedDivisions.length === 0 && generatedCijfer.length === 0) return;
        if (!window.jspdf) {
            alert('PDF-bibliotheek kon niet geladen worden. Probeer de pagina te vernieuwen.');
            return;
        }

        var jsPDF = window.jspdf.jsPDF;
        var doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

        if (generatedCijfer.length > 0) {
            // Cijferen PDF - paginate per 20
            var cfPages = Math.ceil(generatedCijfer.length / CF_PER_PAGE);
            for (var p = 0; p < cfPages; p++) {
                if (p > 0) doc.addPage();
                var pageSums = generatedCijfer.slice(p * CF_PER_PAGE, (p + 1) * CF_PER_PAGE);
                generateCfPdfPage(doc, currentSettings, pageSums, false);
            }
            if (currentSettings.answerSheet) {
                for (var p = 0; p < cfPages; p++) {
                    doc.addPage();
                    var pageSums = generatedCijfer.slice(p * CF_PER_PAGE, (p + 1) * CF_PER_PAGE);
                    generateCfPdfPage(doc, currentSettings, pageSums, true);
                }
            }
            var filename = 'werkblad-cijferen-' + new Date().toISOString().slice(0, 10) + '.pdf';
            doc.save(filename);
        } else if (generatedDivisions.length > 0) {
            // Staartdelingen PDF - paginate per 12
            var ldPages = Math.ceil(generatedDivisions.length / LD_PER_PAGE);
            for (var p = 0; p < ldPages; p++) {
                if (p > 0) doc.addPage();
                var pageDivs = generatedDivisions.slice(p * LD_PER_PAGE, (p + 1) * LD_PER_PAGE);
                generateLdPdfPage(doc, currentSettings, pageDivs, false);
            }
            if (currentSettings.answerSheet) {
                for (var p = 0; p < ldPages; p++) {
                    doc.addPage();
                    var pageDivs = generatedDivisions.slice(p * LD_PER_PAGE, (p + 1) * LD_PER_PAGE);
                    generateLdPdfPage(doc, currentSettings, pageDivs, true);
                }
            }
            var filename = 'werkblad-staartdelingen-' + new Date().toISOString().slice(0, 10) + '.pdf';
            doc.save(filename);
        } else {
            // Bewerkingen PDF - paginate per 50
            var sumPages = Math.ceil(generatedSums.length / SUMS_PER_PAGE);
            for (var p = 0; p < sumPages; p++) {
                if (p > 0) doc.addPage();
                var pageSums = generatedSums.slice(p * SUMS_PER_PAGE, (p + 1) * SUMS_PER_PAGE);
                generatePdfPage(doc, currentSettings, pageSums, false);
            }
            if (currentSettings.answerSheet) {
                for (var p = 0; p < sumPages; p++) {
                    doc.addPage();
                    var pageSums = generatedSums.slice(p * SUMS_PER_PAGE, (p + 1) * SUMS_PER_PAGE);
                    generatePdfPage(doc, currentSettings, pageSums, true);
                }
            }
            var filename = 'werkblad-rekenen-' + new Date().toISOString().slice(0, 10) + '.pdf';
            doc.save(filename);
        }
    });

    function generatePdfPage(doc, settings, sums, isAnswers) {
        var pageW = 210;
        var margin = 20;
        var contentW = pageW - margin * 2;

        // Title (left-aligned)
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(50, 50, 70);
        var titleText = settings.title;
        if (isAnswers) titleText += ' - Antwoordblad';
        doc.text(titleText, margin, margin + 7);

        // Date (right-aligned)
        if (settings.date) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 100, 110);
            var dateDisplay = settings.datePrefix ? settings.datePrefix + ' ' + settings.date : settings.date;
            doc.text(dateDisplay, pageW - margin, margin + 7, { align: 'right' });
        }

        var yPos = margin + 16;

        // Name field (above separator)
        if (settings.showName) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 100, 110);
            doc.text('Naam: ___________________________', margin, yPos);
            yPos += 8;
        }

        // Separator line
        doc.setDrawColor(200, 200, 210);
        doc.setLineWidth(0.5);
        doc.line(margin, yPos, pageW - margin, yPos);

        var yStart = yPos + 6;

        // Block layout: 2 columns, blocks of 5 sums, left-to-right
        var layout = arrangeInBlocks(sums);
        var lineH = 7.5;
        var blockGap = 8;
        var numCols = 2;
        var colGap = 12;
        var colW = (contentW - colGap * (numCols - 1)) / numCols;

        // Calculate dynamic column widths based on content
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        var aW = 0;
        var bW = 0;
        var ansW = 0;
        for (var si = 0; si < sums.length; si++) {
            var tw;
            tw = doc.getTextWidth(formatNum(sums[si].a));
            if (tw > aW) aW = tw;
            tw = doc.getTextWidth(formatNum(sums[si].b));
            if (tw > bW) bW = tw;
            tw = doc.getTextWidth(formatNum(sums[si].answer));
            if (tw > ansW) ansW = tw;
        }
        // Add small padding
        aW += 1;
        bW += 1;
        ansW += 1;
        var opW = 5;
        var eqW = 4;

        var y = yStart;

        for (var r = 0; r < layout.rows; r++) {
            for (var c = 0; c < layout.cols; c++) {
                var block = layout.grid[r][c];
                if (block.length === 0) continue;

                var colX = margin + c * (colW + colGap);

                for (var i = 0; i < block.length; i++) {
                    var entry = block[i];
                    var s = entry.sum;
                    var currentY = y + i * lineH;

                    // Check page break
                    if (currentY > 280) {
                        doc.addPage();
                        y = margin + 8;
                        currentY = y + i * lineH;
                    }

                    doc.setFontSize(11);
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(50, 50, 70);

                    // Getal 1 (right-aligned within its column)
                    doc.text(formatNum(s.a), colX + aW, currentY, { align: 'right' });

                    // Operator (center)
                    doc.text(opSymbolPdf(s.op), colX + aW + opW / 2, currentY, { align: 'center' });

                    // Getal 2 (right-aligned within its column)
                    doc.text(formatNum(s.b), colX + aW + opW + bW, currentY, { align: 'right' });

                    // = sign
                    var eqX = colX + aW + opW + bW + 2;
                    doc.text('=', eqX, currentY);

                    // Answer or line
                    var ansX = eqX + eqW;
                    if (isAnswers) {
                        doc.setFont('helvetica', 'bold');
                        doc.setTextColor(108, 99, 255);
                        doc.text(formatNum(s.answer), ansX, currentY);
                    } else {
                        doc.setDrawColor(200, 200, 210);
                        doc.setLineWidth(0.3);
                        doc.line(ansX, currentY, ansX + 12, currentY);
                    }
                }
            }

            // Move y down for next row of blocks
            var maxBlockSize = 0;
            for (var mc = 0; mc < layout.cols; mc++) {
                var bl = layout.grid[r][mc];
                if (bl.length > maxBlockSize) maxBlockSize = bl.length;
            }
            y += maxBlockSize * lineH + blockGap;
        }

        // Footer separator
        doc.setDrawColor(220, 220, 230);
        doc.setLineWidth(0.3);
        doc.line(margin, 285, pageW - margin, 285);

        // Footer
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(160, 160, 175);
        doc.text('Meester Tools', margin, 290);
    }

    // ---------- Utility ----------
    function escapeHtml(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
});

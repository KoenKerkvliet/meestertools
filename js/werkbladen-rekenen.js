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
    var settingsPercent = document.getElementById('settingsPercent');
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
    var generatedPercent = [];
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
        if (settingsPercent) settingsPercent.style.display = 'none';
        generateSection.style.display = '';
        previewSection.style.display = 'none';

        if (currentType === 'bewerkingen') {
            settingsBewerkingen.style.display = '';
        } else if (currentType === 'staartdelingen') {
            settingsStaartdelingen.style.display = '';
        } else if (currentType === 'cijferen') {
            if (settingsCijferen) settingsCijferen.style.display = '';
        } else if (currentType === 'procenten') {
            if (settingsPercent) settingsPercent.style.display = '';
        } else {
            generateSection.style.display = 'none';
            previewSection.style.display = '';
            previewEl.innerHTML =
                '<div class="wb-coming-soon">' +
                '<div class="wb-coming-icon">&#128679;</div>' +
                '<p>Dit type werkblad is binnenkort beschikbaar.</p>' +
                '</div>';
        }
    }

    // ---------- Hide preview on any setting change ----------
    function hidePreview() {
        previewSection.style.display = 'none';
    }

    // Listen to all setting inputs (text fields, number fields, date)
    document.querySelectorAll('#settingsGeneral input, #settingsBewerkingen input, #settingsStaartdelingen input, #settingsPercent input').forEach(function (input) {
        input.addEventListener('input', hidePreview);
        input.addEventListener('change', hidePreview);
    });
    if (settingsCijferen) {
        settingsCijferen.querySelectorAll('input').forEach(function (input) {
            input.addEventListener('input', hidePreview);
            input.addEventListener('change', hidePreview);
        });
    }

    // ---------- Operation Toggles (wide) - Bewerkingen only ----------
    var toggleBtns = document.querySelectorAll('.wb-toggle-wide[data-op]');
    toggleBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            this.classList.toggle('active');
            var anyActive = document.querySelector('.wb-toggle-wide[data-op].active');
            if (!anyActive) this.classList.add('active');
            hidePreview();
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
            hidePreview();
        });
    }
    if (btnPlus) {
        btnPlus.addEventListener('click', function () {
            var val = parseInt(countInput.value) || 40;
            if (val < 200) countInput.value = val + 1;
            hidePreview();
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
            hidePreview();
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
            hidePreview();
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
            hidePreview();
        });
    }
    if (ldBtnPlus) {
        ldBtnPlus.addEventListener('click', function () {
            var val = parseInt(ldCountInput.value) || 12;
            if (val < 48) ldCountInput.value = val + 1;
            hidePreview();
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
            hidePreview();
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
            hidePreview();
        });
    });

    // ---------- Decimal Toggle Buttons ----------
    document.querySelectorAll('.wb-toggle-num').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var target = this.getAttribute('data-target');
            this.parentNode.querySelectorAll('.wb-toggle-num').forEach(function (b) {
                b.classList.remove('active');
            });
            this.classList.add('active');
            if (target) document.getElementById(target).value = this.getAttribute('data-dec') || this.getAttribute('data-cfdec') || this.getAttribute('data-lddec');
            hidePreview();
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
            hidePreview();
        });
    }
    if (cfBtnPlus) {
        cfBtnPlus.addEventListener('click', function () {
            var val = parseInt(cfCountInput.value) || 20;
            if (val < 80) cfCountInput.value = val + 1;
            hidePreview();
        });
    }

    // ---------- Cijferen Operation Toggles ----------
    var cfToggleBtns = document.querySelectorAll('.wb-toggle-wide[data-cfop]');
    var cfAddOptions = document.getElementById('cfAddOptions');
    var cfSubOptions = document.getElementById('cfSubOptions');
    var cfMulOptions = document.getElementById('cfMulOptions');

    function updateCfSubOptionsVisibility() {
        var addActive = document.querySelector('.wb-toggle-wide[data-cfop="+"].active');
        var subActive = document.querySelector('.wb-toggle-wide[data-cfop="-"].active');
        var mulActive = document.querySelector('.wb-toggle-wide[data-cfop="*"].active');
        if (cfAddOptions) cfAddOptions.style.display = addActive ? '' : 'none';
        if (cfSubOptions) cfSubOptions.style.display = subActive ? '' : 'none';
        if (cfMulOptions) cfMulOptions.style.display = mulActive ? '' : 'none';
    }

    cfToggleBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            this.classList.toggle('active');
            var anyActive = document.querySelector('.wb-toggle-wide[data-cfop].active');
            if (!anyActive) this.classList.add('active');
            updateCfSubOptionsVisibility();
            hidePreview();
        });
    });

    // ---------- Cijferen Sub-option Toggles (Optellen) ----------
    document.querySelectorAll('.wb-suboption[data-cfadd]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.wb-suboption[data-cfadd]').forEach(function (b) {
                b.classList.remove('active');
            });
            this.classList.add('active');
            document.getElementById('wbCfAddType').value = this.getAttribute('data-cfadd');
            hidePreview();
        });
    });

    // ---------- Cijferen Sub-option Toggles (Aftrekken) ----------
    document.querySelectorAll('.wb-suboption[data-cfsub]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.wb-suboption[data-cfsub]').forEach(function (b) {
                b.classList.remove('active');
            });
            this.classList.add('active');
            document.getElementById('wbCfSubType').value = this.getAttribute('data-cfsub');
            hidePreview();
        });
    });

    // ---------- Cijferen Sub-option Toggles (Vermenigvuldigen) ----------
    document.querySelectorAll('.wb-suboption[data-cfmul]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.wb-suboption[data-cfmul]').forEach(function (b) {
                b.classList.remove('active');
            });
            this.classList.add('active');
            document.getElementById('wbCfMulType').value = this.getAttribute('data-cfmul');
            hidePreview();
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
            hidePreview();
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

    // ---------- Procenten Stepper ----------
    var pctCountInput = document.getElementById('wbPctCount');
    var pctBtnMinus = document.getElementById('wbPctCountMinus');
    var pctBtnPlus = document.getElementById('wbPctCountPlus');

    if (pctBtnMinus) {
        pctBtnMinus.addEventListener('click', function () {
            var val = parseInt(pctCountInput.value) || 50;
            if (val > 1) pctCountInput.value = val - 1;
            hidePreview();
        });
    }
    if (pctBtnPlus) {
        pctBtnPlus.addEventListener('click', function () {
            var val = parseInt(pctCountInput.value) || 50;
            if (val < 200) pctCountInput.value = val + 1;
            hidePreview();
        });
    }

    // ---------- Procenten Type Switch ----------
    var pctTypeBtns = document.querySelectorAll('.wb-switch-btn[data-pcttype]');
    var pctTypeHidden = document.getElementById('wbPctType');
    var pctDeelOptions = document.getElementById('pctDeelOptions');
    var pctOmrekenOptions = document.getElementById('pctOmrekenOptions');
    var pctRangeField = document.getElementById('pctRangeField');

    pctTypeBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            pctTypeBtns.forEach(function (b) { b.classList.remove('active'); });
            this.classList.add('active');
            var val = this.getAttribute('data-pcttype');
            if (pctTypeHidden) pctTypeHidden.value = val;
            if (pctDeelOptions) pctDeelOptions.style.display = val === 'deelvangeheel' ? '' : 'none';
            if (pctOmrekenOptions) pctOmrekenOptions.style.display = val === 'omrekenen' ? '' : 'none';
            if (pctRangeField) pctRangeField.style.display = val === 'deelvangeheel' ? '' : 'none';
            hidePreview();
        });
    });

    // ---------- Procenten Level Sub-options ----------
    document.querySelectorAll('.wb-suboption[data-pctlevel]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.wb-suboption[data-pctlevel]').forEach(function (b) {
                b.classList.remove('active');
            });
            this.classList.add('active');
            document.getElementById('wbPctLevel').value = this.getAttribute('data-pctlevel');
            hidePreview();
        });
    });

    // ---------- Conversion Level Sub-options ----------
    document.querySelectorAll('.wb-suboption[data-convlevel]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.wb-suboption[data-convlevel]').forEach(function (b) {
                b.classList.remove('active');
            });
            this.classList.add('active');
            document.getElementById('wbConvLevel').value = this.getAttribute('data-convlevel');
            hidePreview();
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
        var maxAttempts = settings.count * 200;
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
    function arrangeInBlocks(sums, blockSize) {
        var cols = 2;
        var sumsPerBlock = blockSize || 5;
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

        // Title row (title left, name field right)
        html += '<div class="wb-preview-header-row">';
        var titleText = isAnswers ? escapeHtml(settings.title) + ' - Antwoordblad' : escapeHtml(settings.title);
        html += '<div class="wb-preview-title">' + titleText + '</div>';
        if (settings.showName) {
            html += '<div class="wb-preview-name">Naam: ___________________________</div>';
        }
        html += '</div>';

        // Date row (below title)
        if (settings.date) {
            var dateDisplay = settings.datePrefix ? escapeHtml(settings.datePrefix) + ' ' + settings.date : settings.date;
            html += '<div class="wb-preview-date">' + dateDisplay + '</div>';
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
        var isPct = sums.length > 0 && sums[0].op === 'pct';

        if (isPct) {
            // Procenten: "a% van b = ___"
            var widths = calcMaxWidths(sums);
            // a = percentage (add "%" suffix), op = "van", b = geheel
            var colA = Math.max(widths.maxA + 1, 3) + 'ch'; // +1 for % sign
            var colOp = '3.5ch'; // "van"
            var colB = Math.max(widths.maxB, 3) + 'ch';
            var colEq = '1.5ch';
            var colAns = showAnswers ? Math.max(widths.maxAnswer, 3) + 'ch' : '4ch';
            var gridCols = colA + ' ' + colOp + ' ' + colB + ' ' + colEq + ' ' + colAns;
        } else {
            var widths = calcMaxWidths(sums);
            var colA = Math.max(widths.maxA, 2) + 'ch';
            var colOp = '2ch';
            var colB = Math.max(widths.maxB, 2) + 'ch';
            var colEq = '1.5ch';
            var colAns = showAnswers ? Math.max(widths.maxAnswer, 3) + 'ch' : '4ch';
            var gridCols = colA + ' ' + colOp + ' ' + colB + ' ' + colEq + ' ' + colAns;
        }

        var html = '<div class="wb-preview-blocks">';

        for (var r = 0; r < layout.rows; r++) {
            for (var c = 0; c < layout.cols; c++) {
                var block = layout.grid[r][c];
                html += '<div class="wb-preview-block">';
                for (var i = 0; i < block.length; i++) {
                    var entry = block[i];
                    var s = entry.sum;
                    html += '<div class="wb-preview-sum" style="grid-template-columns:' + gridCols + ';">';
                    if (isPct) {
                        html += '<span class="wb-preview-a">' + s.a + '%</span>';
                        html += '<span class="wb-preview-op">van</span>';
                    } else {
                        html += '<span class="wb-preview-a">' + formatNum(s.a) + '</span>';
                        html += '<span class="wb-preview-op">' + opSymbol(s.op) + '</span>';
                    }
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
        var maxAttempts = settings.count * 200;
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
        doc.text(titleText, margin, 12);

        // Name field (right-aligned, same line as title)
        if (settings.showName) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 100, 110);
            doc.text('Naam: ___________________________', pageW - margin, 12, { align: 'right' });
        }

        var yPos = 18;

        // Date (below title)
        if (settings.date) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 100, 110);
            var dateDisplay = settings.datePrefix ? settings.datePrefix + ' ' + settings.date : settings.date;
            doc.text(dateDisplay, margin, yPos);
            yPos += 6;
        }

        var yStart = yPos + 10;

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

        var addTypeEl = document.getElementById('wbCfAddType');
        var subTypeEl = document.getElementById('wbCfSubType');
        var mulTypeEl = document.getElementById('wbCfMulType');

        return {
            title: document.getElementById('wbTitle').value.trim() || 'Rekenwerkblad',
            date: dateStr,
            datePrefix: document.getElementById('wbDatePrefix').value.trim(),
            showName: document.getElementById('wbNameField').value === 'ja',
            count: Math.max(1, Math.min(80, parseInt(document.getElementById('wbCfCount').value) || 20)),
            operations: ops,
            numberType: numberType,
            addType: addTypeEl ? addTypeEl.value : 'zonder',
            subType: subTypeEl ? subTypeEl.value : 'zonder',
            mulType: mulTypeEl ? mulTypeEl.value : '1cijfer',
            decimals1: numberType === 'decimaal' ? parseInt(document.getElementById('wbCfDec1').value) : 0,
            decimals2: numberType === 'decimaal' ? parseInt(document.getElementById('wbCfDec2').value) : 0,
            min1: parseFloat(document.getElementById('wbCfMin1').value) || 100,
            max1: parseFloat(document.getElementById('wbCfMax1').value) || 500,
            min2: parseFloat(document.getElementById('wbCfMin2').value) || 100,
            max2: parseFloat(document.getElementById('wbCfMax2').value) || 500,
            answerSheet: document.getElementById('wbCfAnswerSheet').checked
        };
    }

    // ---------- Digit Helpers for Cijferen ----------
    function getDigits(n) {
        // Returns [units, tens, hundreds, thousands, ...]
        var digits = [];
        n = Math.abs(Math.round(n));
        if (n === 0) return [0];
        while (n > 0) {
            digits.push(n % 10);
            n = Math.floor(n / 10);
        }
        return digits;
    }

    function getCarries(a, b) {
        // Returns array of carries: [carryToTens, carryToHundreds, carryToThousands]
        var da = getDigits(a);
        var db = getDigits(b);
        var maxLen = Math.max(da.length, db.length);
        var carry = 0;
        var carries = [];
        for (var i = 0; i < maxLen; i++) {
            var sum = (da[i] || 0) + (db[i] || 0) + carry;
            carry = sum >= 10 ? 1 : 0;
            carries.push(carry);
        }
        if (carry) carries.push(carry);
        return carries;
    }

    function getBorrows(a, b) {
        // Returns array of borrows: [borrowFromTens, borrowFromHundreds, ...]
        var da = getDigits(a);
        var db = getDigits(b);
        var maxLen = Math.max(da.length, db.length);
        var borrow = 0;
        var borrows = [];
        for (var i = 0; i < maxLen; i++) {
            var diff = (da[i] || 0) - (db[i] || 0) - borrow;
            if (diff < 0) {
                borrow = 1;
                borrows.push(1);
            } else {
                borrow = 0;
                borrows.push(0);
            }
        }
        return borrows;
    }

    function matchesAddType(a, b, addType) {
        var carries = getCarries(a, b);
        var answer = a + b;
        // carries[0] = carry from E to T, carries[1] = carry from T to H
        var carryT = carries[0] || 0;
        var carryH = carries[1] || 0;

        switch (addType) {
            case 'zonder': return carryT === 0 && carryH === 0;
            case 't': return carryT === 1 && carryH === 0;
            case 'h': return carryT === 0 && carryH === 1;
            case 'th': return carryT === 1 && carryH === 1;
            case 'soms': return true; // any combination
            case 'd': return answer >= 1000;
        }
        return true;
    }

    function matchesSubType(a, b, subType) {
        // a >= b assumed
        var borrows = getBorrows(a, b);
        // borrows[0] = borrow at E (from T), borrows[1] = borrow at T (from H)
        var borrowT = borrows[0] || 0;
        var borrowH = borrows[1] || 0;

        switch (subType) {
            case 'zonder': return borrowT === 0 && borrowH === 0;
            case 't': return borrowT === 1 && borrowH === 0;
            case 'th': return borrowT === 1 && borrowH === 1;
            case 'soms': return true;
        }
        return true;
    }

    // ---------- Generate Cijfer Sums ----------
    function generateCijferSums(settings) {
        var sums = [];
        var used = {};
        var maxAttempts = settings.count * 200; // More attempts for constrained generation
        var totalAttempts = 0;

        while (sums.length < settings.count && totalAttempts < maxAttempts) {
            totalAttempts++;

            var op = settings.operations[Math.floor(Math.random() * settings.operations.length)];
            var a = randomInRange(settings.min1, settings.max1, settings.decimals1);
            var b;

            // Multiplication: override second number based on mulType
            if (op === '*') {
                switch (settings.mulType) {
                    case '1cijfer':
                        b = Math.floor(Math.random() * 8) + 2; // 2-9
                        break;
                    case 'tientallen':
                        b = (Math.floor(Math.random() * 9) + 1) * 10; // 10,20,...,90
                        break;
                    case '2cijfers':
                        b = Math.floor(Math.random() * 89) + 11; // 11-99
                        break;
                    default:
                        b = randomInRange(settings.min2, settings.max2, settings.decimals2);
                }
            } else {
                b = randomInRange(settings.min2, settings.max2, settings.decimals2);
            }

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

            // Check overschrijding/lenen constraints
            if (op === '+' && !matchesAddType(a, b, settings.addType)) continue;
            if (op === '-' && !matchesSubType(a, b, settings.subType)) continue;

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

            // Calculate line width based on widest number
            var maxLen = Math.max(aStr.length, bStr.length, showAnswers ? ansStr.length : 0);
            var lineWidth = (maxLen * 0.75) + 0.5; // ch-based width

            html += '<div class="wb-cf-cell">';
            // Top number (right-aligned)
            html += '<div class="wb-cf-number">' + escapeHtml(aStr) + '</div>';
            // Bottom number with operator absolutely positioned to the right
            html += '<div class="wb-cf-number wb-cf-bottom">' + escapeHtml(bStr) + '<span class="wb-cf-op">' + opSymbol(s.op) + '</span></div>';
            // Line (width based on numbers)
            html += '<div class="wb-cf-line" style="width:' + lineWidth + 'em;"></div>';
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
        doc.text(titleText, margin, 12);

        // Name field (right-aligned, same line as title)
        if (settings.showName) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 100, 110);
            doc.text('Naam: ___________________________', pageW - margin, 12, { align: 'right' });
        }

        var yPos = 18;

        // Date (below title)
        if (settings.date) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 100, 110);
            var dateDisplay = settings.datePrefix ? settings.datePrefix + ' ' + settings.date : settings.date;
            doc.text(dateDisplay, margin, yPos);
            yPos += 6;
        }

        var yStart = yPos + 10;

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

            // Right edge for number alignment
            var rightX = x + colW - 8;

            // Top number (right-aligned)
            doc.text(aStr, rightX, y, { align: 'right' });

            // Bottom number (right-aligned)
            var lineY = y + 7;
            doc.text(bStr, rightX, lineY, { align: 'right' });

            // Operator to the right of the bottom number
            var opStr = opSymbolPdf(s.op);
            doc.text(opStr, rightX + 2, lineY);

            // Underline (width based on widest number only)
            var aWidth = doc.getTextWidth(aStr);
            var bWidth = doc.getTextWidth(bStr);
            var ansWidth = isAnswers ? doc.getTextWidth(ansStr) : 0;
            var maxNumWidth = Math.max(aWidth, bWidth, ansWidth);
            var lineStartX = rightX - maxNumWidth - 1;
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

        // Footer
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(160, 160, 175);
        doc.text('Meester Tools', margin, 290);
    }

    // ============================================
    // PROCENTEN (Percentages)
    // ============================================

    // ---------- Read Settings Procenten ----------
    function readSettingsPercent() {
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
            count: Math.max(1, Math.min(200, parseInt(pctCountInput.value) || 50)),
            pctType: pctTypeHidden ? pctTypeHidden.value : 'deelvangeheel',
            pctLevel: document.getElementById('wbPctLevel').value || 'makkelijk',
            convLevel: document.getElementById('wbConvLevel').value || 'makkelijk',
            pctMin: parseInt(document.getElementById('wbPctMin').value) || 50,
            pctMax: parseInt(document.getElementById('wbPctMax').value) || 500,
            answerSheet: document.getElementById('wbPctAnswerSheet').checked
        };
    }

    // ---------- Generate Percent Sums ----------
    function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }

    function generatePercentSums(settings) {
        var sums = [];
        var used = {};

        // Define percentage pools based on level
        var easyPcts = [10, 25, 50, 5, 75, 1];
        var via10Pcts = [10, 20, 30, 40, 50, 60, 70, 80, 90];
        var hardPcts = [];
        for (var i = 1; i <= 99; i++) {
            if (easyPcts.indexOf(i) === -1 && via10Pcts.indexOf(i) === -1) {
                hardPcts.push(i);
            }
        }

        var pctPool;
        switch (settings.pctLevel) {
            case 'makkelijk': pctPool = easyPcts; break;
            case 'via10': pctPool = via10Pcts; break;
            case 'moeilijk': pctPool = hardPcts; break;
            default: pctPool = easyPcts;
        }

        // Pre-compute valid geheel values per percentage (must give whole-number answer)
        var validGeheel = {};
        for (var pi = 0; pi < pctPool.length; pi++) {
            var p = pctPool[pi];
            var step = 100 / gcd(p, 100); // geheel must be multiple of step
            var values = [];
            var start = Math.ceil(settings.pctMin / step) * step;
            for (var v = start; v <= settings.pctMax; v += step) {
                values.push(v);
            }
            if (values.length > 0) validGeheel[p] = values;
        }

        // Filter pctPool to only percentages that have valid geheel values
        var usablePcts = pctPool.filter(function (p) { return validGeheel[p] && validGeheel[p].length > 0; });

        var maxAttempts = settings.count * 200;
        var totalAttempts = 0;

        while (sums.length < settings.count && totalAttempts < maxAttempts && usablePcts.length > 0) {
            totalAttempts++;

            var pct = usablePcts[Math.floor(Math.random() * usablePcts.length)];
            var geheelArr = validGeheel[pct];
            var geheel = geheelArr[Math.floor(Math.random() * geheelArr.length)];
            var answer = (pct / 100) * geheel;

            // Skip duplicates
            var key = pct + '%van' + geheel;
            if (used[key]) continue;
            used[key] = true;

            sums.push({
                a: pct,
                op: 'pct',
                b: geheel,
                answer: answer
            });
        }

        return sums;
    }

    // ============================================
    // CONVERSIES (Breuken / Procenten / Komma's)
    // ============================================

    var easyConv = [
        { breuk: '1/2', procent: '50', komma: '0,5' },
        { breuk: '1/4', procent: '25', komma: '0,25' },
        { breuk: '1/5', procent: '20', komma: '0,2' },
        { breuk: '1/10', procent: '10', komma: '0,1' },
        { breuk: '1/20', procent: '5', komma: '0,05' },
        { breuk: '1/25', procent: '4', komma: '0,04' },
        { breuk: '1/50', procent: '2', komma: '0,02' },
        { breuk: '1/100', procent: '1', komma: '0,01' },
        { breuk: '1/8', procent: '12,5', komma: '0,125' },
        { breuk: '1/3', procent: '33\u2153', komma: '0,33...' }
    ];

    var hardConv = easyConv.concat([
        { breuk: '3/4', procent: '75', komma: '0,75' },
        { breuk: '2/5', procent: '40', komma: '0,4' },
        { breuk: '3/5', procent: '60', komma: '0,6' },
        { breuk: '4/5', procent: '80', komma: '0,8' },
        { breuk: '2/3', procent: '66\u2154', komma: '0,66...' },
        { breuk: '3/10', procent: '30', komma: '0,3' },
        { breuk: '7/10', procent: '70', komma: '0,7' },
        { breuk: '9/10', procent: '90', komma: '0,9' },
        { breuk: '3/8', procent: '37,5', komma: '0,375' },
        { breuk: '5/8', procent: '62,5', komma: '0,625' },
        { breuk: '7/8', procent: '87,5', komma: '0,875' },
        { breuk: '3/20', procent: '15', komma: '0,15' },
        { breuk: '7/20', procent: '35', komma: '0,35' },
        { breuk: '9/20', procent: '45', komma: '0,45' },
        { breuk: '2/25', procent: '8', komma: '0,08' },
        { breuk: '3/25', procent: '12', komma: '0,12' }
    ]);

    function generateConvSums(settings) {
        var pool = settings.convLevel === 'moeilijk' ? hardConv : easyConv;
        var sums = [];
        var used = {};
        var maxUnique = pool.length * 3; // Each conversion can appear with 3 different given states
        var maxAttempts = settings.count * 200;
        var totalAttempts = 0;
        var allUniqueUsed = false;

        while (sums.length < settings.count && totalAttempts < maxAttempts) {
            totalAttempts++;

            var conv = pool[Math.floor(Math.random() * pool.length)];
            var given = Math.floor(Math.random() * 3); // 0=breuk, 1=procent, 2=komma

            if (!allUniqueUsed) {
                // Try to use unique combinations first
                var key = conv.breuk + '_' + given;
                if (used[key]) {
                    if (used[conv.breuk + '_0'] && used[conv.breuk + '_1'] && used[conv.breuk + '_2']) continue;
                    for (var g = 0; g < 3; g++) {
                        if (!used[conv.breuk + '_' + g]) { given = g; break; }
                    }
                    key = conv.breuk + '_' + given;
                    if (used[key]) continue;
                }
                used[key] = true;

                // Check if all unique combinations are exhausted
                if (Object.keys(used).length >= maxUnique) {
                    allUniqueUsed = true;
                }
            }
            // When all unique used, allow any combination (duplicates ok)

            sums.push({
                breuk: conv.breuk,
                procent: conv.procent,
                komma: conv.komma,
                given: given,
                op: 'conv'
            });
        }

        return sums;
    }

    // ---------- Render Conversion Preview ----------
    function renderConvPreview(settings, sums) {
        var html = '';

        var previewSums = sums.slice(0, SUMS_PER_PAGE);
        html += '<div class="wb-preview-page">';
        html += buildHeaderHtml(settings, false);
        html += renderConvGrid(previewSums, false);
        html += '<div class="wb-preview-footer">Meester Tools</div>';
        html += '</div>';

        if (settings.answerSheet) {
            html += '<div class="wb-preview-page">';
            html += buildHeaderHtml(settings, true);
            html += renderConvGrid(previewSums, true);
            html += '<div class="wb-preview-footer">Meester Tools</div>';
            html += '</div>';
        }

        previewEl.innerHTML = html;
        previewSection.style.display = '';
    }

    function renderConvGrid(sums, showAnswers) {
        var layout = arrangeInBlocks(sums, 4);

        // Calculate max widths
        var maxBreuk = 0, maxPct = 0, maxKomma = 0;
        for (var i = 0; i < sums.length; i++) {
            // For stacked fractions: width based on max of num/den
            var fracParts = sums[i].breuk.split('/');
            if (fracParts.length === 2) {
                maxBreuk = Math.max(maxBreuk, Math.max(fracParts[0].length, fracParts[1].length) + 1);
            } else {
                maxBreuk = Math.max(maxBreuk, sums[i].breuk.length);
            }
            maxPct = Math.max(maxPct, (sums[i].procent + '%').length);
            maxKomma = Math.max(maxKomma, sums[i].komma.length);
        }
        var colBreuk = Math.max(maxBreuk, 3) + 'ch';
        var colEq = '1.5ch';
        var colPct = Math.max(maxPct, 5) + 'ch';
        var colKomma = Math.max(maxKomma, 5) + 'ch';
        var gridCols = colBreuk + ' ' + colEq + ' ' + colPct + ' ' + colEq + ' ' + colKomma;

        var html = '<div class="wb-preview-blocks">';

        for (var r = 0; r < layout.rows; r++) {
            for (var c = 0; c < layout.cols; c++) {
                var block = layout.grid[r][c];
                html += '<div class="wb-preview-block">';
                for (var i = 0; i < block.length; i++) {
                    var entry = block[i];
                    var s = entry.sum;
                    html += '<div class="wb-preview-sum" style="grid-template-columns:' + gridCols + ';">';

                    // Breuk
                    if (showAnswers || s.given === 0) {
                        html += '<span class="wb-preview-a">' + renderFracHtml(s.breuk, false) + '</span>';
                    } else {
                        html += '<span class="wb-preview-a">' + renderFracHtml(s.breuk, true) + '</span>';
                    }
                    html += '<span class="wb-preview-eq">=</span>';

                    // Procent
                    if (showAnswers || s.given === 1) {
                        html += '<span class="wb-preview-b">' + escapeHtml(s.procent) + '%</span>';
                    } else {
                        html += '<span class="wb-preview-line">___%</span>';
                    }
                    html += '<span class="wb-preview-eq">=</span>';

                    // Komma
                    if (showAnswers || s.given === 2) {
                        html += '<span class="wb-preview-answer">' + escapeHtml(s.komma) + '</span>';
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

    // ---------- Conversion PDF ----------
    function generateConvPdfPage(doc, settings, sums, isAnswers) {
        var pageW = 210;
        var margin = 20;
        var contentW = pageW - margin * 2;

        // Title (left-aligned)
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(50, 50, 70);
        var titleText = settings.title;
        if (isAnswers) titleText += ' - Antwoordblad';
        doc.text(titleText, margin, 12);

        // Name field (right-aligned, same line as title)
        if (settings.showName) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 100, 110);
            doc.text('Naam: ___________________________', pageW - margin, 12, { align: 'right' });
        }

        var yPos = 18;

        // Date (below title)
        if (settings.date) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 100, 110);
            var dateDisplay = settings.datePrefix ? settings.datePrefix + ' ' + settings.date : settings.date;
            doc.text(dateDisplay, margin, yPos);
            yPos += 6;
        }

        var yStart = yPos + 10;

        // Block layout: 2 columns, blocks of 4
        var layout = arrangeInBlocks(sums, 4);
        var lineH = 9;
        var blockGap = 8;
        var numCols = 2;
        var colGap = 12;
        var colW = (contentW - colGap * (numCols - 1)) / numCols;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');

        // Calculate column widths
        var breukW = 0, pctW = 0, kommaW = 0;
        doc.setFontSize(9); // fraction font size
        for (var si = 0; si < sums.length; si++) {
            var tw;
            // For fraction: width is max of numerator, denominator
            var fracParts = sums[si].breuk.split('/');
            if (fracParts.length === 2) {
                var numTw = doc.getTextWidth(fracParts[0]);
                var denTw = doc.getTextWidth(fracParts[1]);
                tw = Math.max(numTw, denTw) + 2;
            } else {
                tw = doc.getTextWidth(sums[si].breuk);
            }
            if (tw > breukW) breukW = tw;
        }
        doc.setFontSize(11);
        for (var si = 0; si < sums.length; si++) {
            var tw;
            tw = doc.getTextWidth(sums[si].procent + '%');
            if (tw > pctW) pctW = tw;
            tw = doc.getTextWidth(sums[si].komma);
            if (tw > kommaW) kommaW = tw;
        }
        breukW += 2;
        pctW += 1;
        kommaW += 1;
        var eqW = 4;
        var blankW = doc.getTextWidth('____') + 1;

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

                    if (currentY > 280) {
                        doc.addPage();
                        y = margin + 8;
                        currentY = y + i * lineH;
                    }

                    doc.setFontSize(11);

                    var xPos = colX;

                    // Breuk (stacked fraction)
                    if (s.given === 0 || isAnswers) {
                        var fracColor = (s.given !== 0 && isAnswers) ? [108, 99, 255] : [50, 50, 70];
                        drawFractionPdf(doc, s.breuk, xPos + breukW, currentY, fracColor);
                    } else {
                        // Blank fraction: draw placeholder lines
                        drawFractionPdf(doc, '?/?', xPos + breukW, currentY, null);
                    }
                    xPos += breukW;

                    // = sign
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(50, 50, 70);
                    doc.text('=', xPos + eqW / 2, currentY, { align: 'center' });
                    xPos += eqW;

                    // Procent
                    var pctSymW = doc.getTextWidth('%');
                    if (s.given === 1) {
                        doc.setFont('helvetica', 'normal');
                        doc.setTextColor(50, 50, 70);
                        doc.text(s.procent + '%', xPos + pctW, currentY, { align: 'right' });
                    } else if (isAnswers) {
                        doc.setFont('helvetica', 'bold');
                        doc.setTextColor(108, 99, 255);
                        doc.text(s.procent + '%', xPos + pctW, currentY, { align: 'right' });
                    } else {
                        // Draw blank line and % sign within column bounds
                        doc.setFont('helvetica', 'normal');
                        doc.setTextColor(50, 50, 70);
                        doc.text('%', xPos + pctW, currentY, { align: 'right' });
                        doc.setDrawColor(200, 200, 210);
                        doc.setLineWidth(0.3);
                        var lineEnd = xPos + pctW - pctSymW - 1;
                        doc.line(lineEnd - blankW, currentY, lineEnd, currentY);
                    }
                    xPos += pctW;

                    // = sign
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(50, 50, 70);
                    doc.text('=', xPos + eqW / 2, currentY, { align: 'center' });
                    xPos += eqW;

                    // Komma
                    if (s.given === 2) {
                        doc.setFont('helvetica', 'normal');
                        doc.setTextColor(50, 50, 70);
                        doc.text(s.komma, xPos + kommaW, currentY, { align: 'right' });
                    } else if (isAnswers) {
                        doc.setFont('helvetica', 'bold');
                        doc.setTextColor(108, 99, 255);
                        doc.text(s.komma, xPos + kommaW, currentY, { align: 'right' });
                    } else {
                        doc.setDrawColor(200, 200, 210);
                        doc.setLineWidth(0.3);
                        doc.line(xPos + kommaW - blankW, currentY, xPos + kommaW, currentY);
                    }
                }
            }

            var maxBlockSize = 0;
            for (var mc = 0; mc < layout.cols; mc++) {
                var bl = layout.grid[r][mc];
                if (bl.length > maxBlockSize) maxBlockSize = bl.length;
            }
            y += maxBlockSize * lineH + blockGap;
        }

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
            generatedPercent = [];
            renderPreview(currentSettings, generatedSums);
        } else if (currentType === 'staartdelingen') {
            currentSettings = readSettingsStaartdelingen();
            generatedDivisions = generateLongDivisions(currentSettings);
            generatedSums = [];
            generatedCijfer = [];
            generatedPercent = [];
            renderLdPreview(currentSettings, generatedDivisions);
        } else if (currentType === 'cijferen') {
            currentSettings = readSettingsCijferen();
            generatedCijfer = generateCijferSums(currentSettings);
            generatedSums = [];
            generatedDivisions = [];
            generatedPercent = [];
            renderCfPreview(currentSettings, generatedCijfer);
        } else if (currentType === 'procenten') {
            currentSettings = readSettingsPercent();
            generatedSums = [];
            generatedDivisions = [];
            generatedCijfer = [];
            if (currentSettings.pctType === 'omrekenen') {
                generatedPercent = generateConvSums(currentSettings);
                renderConvPreview(currentSettings, generatedPercent);
            } else {
                generatedPercent = generatePercentSums(currentSettings);
                renderPreview(currentSettings, generatedPercent);
            }
        } else {
            return;
        }

        // Scroll to preview
        previewSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // ---------- PDF Generation ----------
    btnDownloadPdf.addEventListener('click', function () {
        if (generatedSums.length === 0 && generatedDivisions.length === 0 && generatedCijfer.length === 0 && generatedPercent.length === 0) return;
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
        } else if (generatedPercent.length > 0) {
            // Detect conversion type
            var isConv = generatedPercent[0] && generatedPercent[0].op === 'conv';
            var pdfFn = isConv ? generateConvPdfPage : generatePdfPage;
            var pctPages = Math.ceil(generatedPercent.length / SUMS_PER_PAGE);
            for (var p = 0; p < pctPages; p++) {
                if (p > 0) doc.addPage();
                var pageSums = generatedPercent.slice(p * SUMS_PER_PAGE, (p + 1) * SUMS_PER_PAGE);
                pdfFn(doc, currentSettings, pageSums, false);
            }
            if (currentSettings.answerSheet) {
                for (var p = 0; p < pctPages; p++) {
                    doc.addPage();
                    var pageSums = generatedPercent.slice(p * SUMS_PER_PAGE, (p + 1) * SUMS_PER_PAGE);
                    pdfFn(doc, currentSettings, pageSums, true);
                }
            }
            var filename = 'werkblad-procenten-' + new Date().toISOString().slice(0, 10) + '.pdf';
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
        doc.text(titleText, margin, 12);

        // Name field (right-aligned, same line as title)
        if (settings.showName) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 100, 110);
            doc.text('Naam: ___________________________', pageW - margin, 12, { align: 'right' });
        }

        var yPos = 18;

        // Date (below title)
        if (settings.date) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 100, 110);
            var dateDisplay = settings.datePrefix ? settings.datePrefix + ' ' + settings.date : settings.date;
            doc.text(dateDisplay, margin, yPos);
            yPos += 6;
        }

        var yStart = yPos + 10;

        // Block layout: 2 columns, blocks of 5 sums, left-to-right
        var layout = arrangeInBlocks(sums);
        var lineH = 7.5;
        var blockGap = 8;
        var numCols = 2;
        var colGap = 12;
        var colW = (contentW - colGap * (numCols - 1)) / numCols;

        // Detect if this is a percentage worksheet
        var isPctPdf = sums.length > 0 && sums[0].op === 'pct';

        // Calculate dynamic column widths based on content
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        var aW = 0;
        var bW = 0;
        var ansW = 0;
        for (var si = 0; si < sums.length; si++) {
            var tw;
            var aText = isPctPdf ? sums[si].a + '%' : formatNum(sums[si].a);
            tw = doc.getTextWidth(aText);
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
        var opW = isPctPdf ? doc.getTextWidth('van') + 3 : 5;
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

                    if (isPctPdf) {
                        // Percentage: "25% van 200 = ___"
                        doc.text(s.a + '%', colX + aW, currentY, { align: 'right' });
                        doc.text('van', colX + aW + opW / 2, currentY, { align: 'center' });
                    } else {
                        // Getal 1 (right-aligned within its column)
                        doc.text(formatNum(s.a), colX + aW, currentY, { align: 'right' });
                        // Operator (center)
                        doc.text(opSymbolPdf(s.op), colX + aW + opW / 2, currentY, { align: 'center' });
                    }

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

        // Footer
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(160, 160, 175);
        doc.text('Meester Tools', margin, 290);
    }

    // ---------- Utility ----------
    // Draw stacked fraction in PDF: num over den with horizontal line
    // rightX = right edge of fraction column, baseY = text baseline
    // color = [r,g,b] for text, null = blank placeholder
    function drawFractionPdf(doc, breukStr, rightX, baseY, color) {
        var parts = breukStr.split('/');
        if (parts.length !== 2) {
            if (color) {
                doc.setTextColor(color[0], color[1], color[2]);
                doc.text(breukStr, rightX, baseY, { align: 'right' });
            }
            return;
        }
        var num = parts[0], den = parts[1];
        doc.setFontSize(9);

        if (color) {
            // Draw actual fraction
            var numW = doc.getTextWidth(num);
            var denW = doc.getTextWidth(den);
            var fracW = Math.max(numW, denW) + 2;

            // Center fraction at rightX - fracW/2
            var centerX = rightX - fracW / 2;

            doc.setFont('helvetica', color[0] === 108 ? 'bold' : 'normal');
            doc.setTextColor(color[0], color[1], color[2]);

            // Numerator (above baseline)
            doc.text(num, centerX, baseY - 3, { align: 'center' });

            // Fraction line
            doc.setDrawColor(color[0], color[1], color[2]);
            doc.setLineWidth(0.4);
            doc.line(centerX - fracW / 2, baseY - 1.5, centerX + fracW / 2, baseY - 1.5);

            // Denominator (below baseline)
            doc.text(den, centerX, baseY + 1.5, { align: 'center' });
        } else {
            // Blank placeholder: just draw the fraction line and small blanks
            var placeholderW = 8;
            var centerX = rightX - placeholderW / 2;

            doc.setDrawColor(200, 200, 210);
            doc.setLineWidth(0.3);
            doc.line(centerX - placeholderW / 2, baseY - 1.5, centerX + placeholderW / 2, baseY - 1.5);

            // Small blank lines for num and den
            doc.line(centerX - 3, baseY - 3, centerX + 3, baseY - 3);
            doc.line(centerX - 3, baseY + 1.5, centerX + 3, baseY + 1.5);
        }

        doc.setFontSize(11);
    }

    function escapeHtml(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // Render a fraction as stacked HTML (numerator over denominator with horizontal line)
    function renderFracHtml(breukStr, isBlank) {
        var parts = breukStr.split('/');
        if (parts.length !== 2) return escapeHtml(breukStr);
        var cls = isBlank ? 'wb-frac wb-frac-blank' : 'wb-frac';
        return '<span class="' + cls + '">' +
            '<span class="wb-frac-num">' + escapeHtml(parts[0]) + '</span>' +
            '<span class="wb-frac-den">' + escapeHtml(parts[1]) + '</span>' +
            '</span>';
    }
});

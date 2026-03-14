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
        if (currentType === 'bewerkingen') {
            settingsBewerkingen.style.display = '';
        } else {
            settingsBewerkingen.style.display = 'none';
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
    var switchBtns = document.querySelectorAll('.wb-switch-btn');
    var numberTypeHidden = document.getElementById('numberTypeHidden');

    switchBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            switchBtns.forEach(function (b) { b.classList.remove('active'); });
            this.classList.add('active');
            var val = this.getAttribute('data-numtype');
            numberTypeHidden.value = val;
            decimalOptions.style.display = val === 'decimaal' ? '' : 'none';
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
            document.getElementById(target).value = this.getAttribute('data-dec');
        });
    });

    // ---------- Read Settings ----------
    function readSettings() {
        var ops = [];
        document.querySelectorAll('.wb-toggle-wide.active').forEach(function (btn) {
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
            showName: document.getElementById('wbNameField').checked,
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
    function renderPreview(settings, sums) {
        var html = '';

        html += buildHeaderHtml(settings, false);
        html += renderSumsGrid(sums, false);
        html += '<div class="wb-preview-footer">Meester Tools</div>';

        // Answer sheet
        if (settings.answerSheet) {
            html += '<div class="wb-preview-divider">Antwoordblad</div>';
            html += buildHeaderHtml(settings, true);
            html += renderSumsGrid(sums, true);
            html += '<div class="wb-preview-footer">Meester Tools</div>';
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

    // ---------- Generate Button ----------
    btnGenerate.addEventListener('click', function () {
        if (currentType !== 'bewerkingen') return;

        currentSettings = readSettings();
        generatedSums = generateSums(currentSettings);
        renderPreview(currentSettings, generatedSums);

        // Scroll to preview
        previewSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // ---------- PDF Generation ----------
    btnDownloadPdf.addEventListener('click', function () {
        if (generatedSums.length === 0) return;
        if (!window.jspdf) {
            alert('PDF-bibliotheek kon niet geladen worden. Probeer de pagina te vernieuwen.');
            return;
        }

        var jsPDF = window.jspdf.jsPDF;
        var doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        var pageW = 210;
        var pageH = 297;
        var margin = 20;
        var contentW = pageW - margin * 2;

        generatePdfPage(doc, currentSettings, generatedSums, false);

        // Answer sheet on new page
        if (currentSettings.answerSheet) {
            doc.addPage();
            generatePdfPage(doc, currentSettings, generatedSums, true);
        }

        var filename = 'werkblad-rekenen-' + new Date().toISOString().slice(0, 10) + '.pdf';
        doc.save(filename);
    });

    function generatePdfPage(doc, settings, sums, isAnswers) {
        var pageW = 210;
        var margin = 20;
        var contentW = pageW - margin * 2;

        // Title (left-aligned)
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(50, 50, 70);
        var titleText = settings.title;
        if (isAnswers) titleText += ' - Antwoordblad';
        doc.text(titleText, margin, margin + 8);

        // Date (right-aligned)
        if (settings.date) {
            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 100, 110);
            var dateDisplay = settings.datePrefix ? settings.datePrefix + ' ' + settings.date : settings.date;
            doc.text(dateDisplay, pageW - margin, margin + 8, { align: 'right' });
        }

        var yPos = margin + 14;

        // Name field (above separator)
        if (settings.showName) {
            doc.setFontSize(11);
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

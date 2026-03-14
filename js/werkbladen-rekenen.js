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

    // ---------- Operation Toggles ----------
    var toggleBtns = document.querySelectorAll('.wb-toggle');
    toggleBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            this.classList.toggle('active');
            // Ensure at least one is active
            var anyActive = document.querySelector('.wb-toggle.active');
            if (!anyActive) this.classList.add('active');
        });
    });

    // ---------- Number Type Radio ----------
    var radioInputs = document.querySelectorAll('input[name="numberType"]');
    radioInputs.forEach(function (radio) {
        radio.addEventListener('change', function () {
            decimalOptions.style.display = this.value === 'decimaal' ? '' : 'none';
        });
    });

    // ---------- Read Settings ----------
    function readSettings() {
        var ops = [];
        document.querySelectorAll('.wb-toggle.active').forEach(function (btn) {
            ops.push(btn.getAttribute('data-op'));
        });

        var numberType = document.querySelector('input[name="numberType"]:checked').value;

        return {
            title: document.getElementById('wbTitle').value.trim() || 'Rekenen',
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
    function generateSums(settings) {
        var sums = [];

        for (var i = 0; i < settings.count; i++) {
            var op = settings.operations[Math.floor(Math.random() * settings.operations.length)];
            var a = randomInRange(settings.min1, settings.max1, settings.decimals1);
            var b = randomInRange(settings.min2, settings.max2, settings.decimals2);

            // Division: prevent divide by zero
            if (op === '/') {
                var attempts = 0;
                while (b === 0 && attempts < 20) {
                    b = randomInRange(settings.min2, settings.max2, settings.decimals2);
                    attempts++;
                }
                if (b === 0) b = 1;
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

    // ---------- Render Preview ----------
    function renderPreview(settings, sums) {
        var html = '';

        // Title
        html += '<div class="wb-preview-title">' + escapeHtml(settings.title) + '</div>';

        // Name field
        if (settings.showName) {
            html += '<div class="wb-preview-name">Naam: ___________________________</div>';
        }

        // Sums grid
        html += '<div class="wb-preview-grid">';
        for (var i = 0; i < sums.length; i++) {
            var s = sums[i];
            html += '<div class="wb-preview-sum">';
            html += '<span class="wb-preview-num">' + (i + 1) + '.</span>';
            html += '<span class="wb-preview-calc">' + formatNum(s.a) + ' ' + opSymbol(s.op) + ' ' + formatNum(s.b) + ' = ___</span>';
            html += '</div>';
        }
        html += '</div>';

        // Answer sheet
        if (settings.answerSheet) {
            html += '<div class="wb-preview-divider">Antwoordblad</div>';
            html += '<div class="wb-preview-grid">';
            for (var j = 0; j < sums.length; j++) {
                var sa = sums[j];
                html += '<div class="wb-preview-sum">';
                html += '<span class="wb-preview-num">' + (j + 1) + '.</span>';
                html += '<span class="wb-preview-calc">' + formatNum(sa.a) + ' ' + opSymbol(sa.op) + ' ' + formatNum(sa.b) + ' = </span>';
                html += '<span class="wb-preview-answer">' + formatNum(sa.answer) + '</span>';
                html += '</div>';
            }
            html += '</div>';
        }

        previewEl.innerHTML = html;
        previewSection.style.display = '';
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

        // Title
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(50, 50, 70);
        var titleText = settings.title;
        if (isAnswers) titleText += ' - Antwoordblad';
        doc.text(titleText, pageW / 2, margin + 8, { align: 'center' });

        var yStart = margin + 16;

        // Name field
        if (settings.showName) {
            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 100, 110);
            doc.text('Naam: ___________________________', margin, yStart);
            yStart += 12;
        }

        // Sums in 2 columns
        var colW = contentW / 2 - 5;
        var lineH = 8;
        var sumsPerCol = Math.ceil(sums.length / 2);
        var y = yStart;

        for (var i = 0; i < sums.length; i++) {
            var col = i < sumsPerCol ? 0 : 1;
            var row = col === 0 ? i : i - sumsPerCol;
            var x = margin + col * (colW + 10);
            var currentY = y + row * lineH;

            // Check page break
            if (currentY > 280) {
                doc.addPage();
                y = margin + 8;
                // Recalculate based on remaining
                currentY = y + row * lineH;
            }

            var s = sums[i];
            var num = (i + 1) + '.';
            var calc = formatNum(s.a) + ' ' + opSymbol(s.op) + ' ' + formatNum(s.b) + ' = ';

            // Number
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(160, 160, 170);
            doc.text(num, x, currentY);

            // Calculation
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(50, 50, 70);
            doc.text(calc, x + 10, currentY);

            // Answer (or line)
            if (isAnswers) {
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(108, 99, 255);
                var calcWidth = doc.getTextWidth(calc);
                doc.text(formatNum(s.answer), x + 10 + calcWidth, currentY);
            } else {
                // Draw answer line
                var calcW2 = doc.getTextWidth(calc);
                var lineX = x + 10 + calcW2;
                doc.setDrawColor(200, 200, 210);
                doc.setLineWidth(0.3);
                doc.line(lineX, currentY, lineX + 20, currentY);
            }
        }

        // Footer
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(180, 180, 190);
        doc.text('Meestertools - Werkblad Rekenen', margin, 290);
        var now = new Date();
        var timestamp = now.toLocaleDateString('nl-NL') + ' ' + now.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
        doc.text(timestamp, pageW - margin, 290, { align: 'right' });
    }

    // ---------- Utility ----------
    function escapeHtml(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
});

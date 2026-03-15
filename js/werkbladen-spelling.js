/* ============================================
   WERKBLAD SPELLING - JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

    // Elements
    var settingsWerkwoordspelling = document.getElementById('settingsWerkwoordspelling');
    var settingsSpelling = document.getElementById('settingsSpelling');
    var generateSection = document.getElementById('spGenerateSection');
    var previewSection = document.getElementById('spPreviewSection');
    var previewEl = document.getElementById('wbSpPreview');

    if (!settingsWerkwoordspelling) return;

    // Set date to today
    var dateInput = document.getElementById('wbSpDate');
    if (dateInput) {
        var today = new Date();
        var yyyy = today.getFullYear();
        var mm = ('0' + (today.getMonth() + 1)).slice(-2);
        var dd = ('0' + today.getDate()).slice(-2);
        dateInput.value = yyyy + '-' + mm + '-' + dd;
    }

    var currentSpType = 'werkwoordspelling';
    var generatedSentences = [];

    // ---------- Type Cards ----------
    var typeCards = document.querySelectorAll('.wb-type-card[data-sptype]');
    typeCards.forEach(function (card) {
        card.addEventListener('click', function () {
            typeCards.forEach(function (c) { c.classList.remove('active'); });
            this.classList.add('active');
            currentSpType = this.getAttribute('data-sptype');
            updateSpSettingsVisibility();
            hidePreview();
        });
    });

    function updateSpSettingsVisibility() {
        if (settingsWerkwoordspelling) settingsWerkwoordspelling.style.display = 'none';
        if (settingsSpelling) settingsSpelling.style.display = 'none';

        if (currentSpType === 'werkwoordspelling') {
            if (settingsWerkwoordspelling) settingsWerkwoordspelling.style.display = '';
            if (generateSection) generateSection.style.display = '';
        } else if (currentSpType === 'spelling') {
            if (settingsSpelling) settingsSpelling.style.display = '';
            if (generateSection) generateSection.style.display = 'none';
        }
    }

    function hidePreview() {
        if (previewSection) previewSection.style.display = 'none';
        generatedSentences = [];
    }

    // ---------- Name Field Switch ----------
    var nameFieldBtns = document.querySelectorAll('.wb-switch-btn[data-spnamefield]');
    var nameFieldHidden = document.getElementById('wbSpNameField');

    nameFieldBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            nameFieldBtns.forEach(function (b) { b.classList.remove('active'); });
            this.classList.add('active');
            nameFieldHidden.value = this.getAttribute('data-spnamefield');
            hidePreview();
        });
    });

    // ---------- Date Field Switch ----------
    var dateFieldBtns = document.querySelectorAll('.wb-switch-btn[data-spdatefield]');
    var dateFieldHidden = document.getElementById('wbSpDateField');
    var datePrefixField = document.getElementById('spDatePrefix');
    var datePickerField = document.getElementById('spDatePicker');

    dateFieldBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            dateFieldBtns.forEach(function (b) { b.classList.remove('active'); });
            this.classList.add('active');
            var val = this.getAttribute('data-spdatefield');
            dateFieldHidden.value = val;
            if (datePrefixField) datePrefixField.style.display = val === 'ja' ? '' : 'none';
            if (datePickerField) datePickerField.style.display = val === 'ja' ? '' : 'none';
            hidePreview();
        });
    });

    // ---------- Tijd Tonen Switch ----------
    var tijdBtns = document.querySelectorAll('.wb-switch-btn[data-sptijd]');
    var tijdHidden = document.getElementById('wbSpTijdField');

    tijdBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            tijdBtns.forEach(function (b) { b.classList.remove('active'); });
            this.classList.add('active');
            tijdHidden.value = this.getAttribute('data-sptijd');
            hidePreview();
        });
    });

    // ---------- Filter Tijd Switch ----------
    var filterTijdBtns = document.querySelectorAll('.wb-switch-btn[data-spfiltertijd]');
    var filterTijdHidden = document.getElementById('wbSpFilterTijd');

    filterTijdBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            filterTijdBtns.forEach(function (b) { b.classList.remove('active'); });
            this.classList.add('active');
            filterTijdHidden.value = this.getAttribute('data-spfiltertijd');
            hidePreview();
        });
    });

    // ---------- Filter Sterk Switch ----------
    var filterSterkBtns = document.querySelectorAll('.wb-switch-btn[data-spsterk]');
    var filterSterkHidden = document.getElementById('wbSpFilterSterk');

    filterSterkBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            filterSterkBtns.forEach(function (b) { b.classList.remove('active'); });
            this.classList.add('active');
            filterSterkHidden.value = this.getAttribute('data-spsterk');
            hidePreview();
        });
    });

    // ---------- Vormen Toggles ----------
    var vormBtns = document.querySelectorAll('.wb-toggle-wide[data-spvorm]');

    vormBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            // Ensure at least 1 active
            var activeCount = 0;
            vormBtns.forEach(function (b) { if (b.classList.contains('active')) activeCount++; });

            if (this.classList.contains('active') && activeCount <= 1) return;

            this.classList.toggle('active');
            hidePreview();
        });
    });

    // ---------- Antwoordblad Switch ----------
    var antwoordBtns = document.querySelectorAll('.wb-switch-btn[data-spantwoord]');
    var antwoordHidden = document.getElementById('wbSpAnswerSheet');

    antwoordBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            antwoordBtns.forEach(function (b) { b.classList.remove('active'); });
            this.classList.add('active');
            antwoordHidden.value = this.getAttribute('data-spantwoord');
            hidePreview();
        });
    });

    // ---------- Settings Reader ----------
    function getFormattedDate() {
        if (dateFieldHidden && dateFieldHidden.value === 'nee') return '';
        var dateVal = document.getElementById('wbSpDate');
        if (!dateVal || !dateVal.value) return '';
        var d = new Date(dateVal.value);
        return ('0' + d.getDate()).slice(-2) + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + d.getFullYear();
    }

    function getDatePrefix() {
        if (dateFieldHidden && dateFieldHidden.value === 'nee') return '';
        var el = document.getElementById('wbSpDatePrefix');
        return el ? el.value.trim() : '';
    }

    function readSettingsWerkwoordspelling() {
        var title = document.getElementById('wbSpTitle')?.value.trim() || 'Spellingwerkblad';
        var showName = nameFieldHidden ? nameFieldHidden.value === 'ja' : true;
        var showTijd = tijdHidden ? tijdHidden.value === 'ja' : true;
        var filterTijd = filterTijdHidden ? filterTijdHidden.value : 'beide';
        var filterSterk = filterSterkHidden ? filterSterkHidden.value : 'beide';
        var answerSheet = antwoordHidden ? antwoordHidden.value === 'ja' : true;

        var activeVormen = [];
        vormBtns.forEach(function (b) {
            if (b.classList.contains('active')) {
                activeVormen.push(b.getAttribute('data-spvorm'));
            }
        });

        return {
            title: title,
            showName: showName,
            date: getFormattedDate(),
            datePrefix: getDatePrefix(),
            showTijd: showTijd,
            filterTijd: filterTijd,
            filterSterk: filterSterk,
            vormen: activeVormen,
            answerSheet: answerSheet
        };
    }

    // ---------- Load Sentences from Supabase ----------
    async function loadSentencesFromSupabase(settings) {
        var query = supabase
            .from('spelling_sentences')
            .select('*')
            .eq('type', 'werkwoordspelling');

        // Filter tijd
        if (settings.filterTijd === 'tt') {
            query = query.eq('tijd', 'tt');
        } else if (settings.filterTijd === 'vt') {
            query = query.eq('tijd', 'vt');
        }

        // Filter sterk
        if (settings.filterSterk === 'sterk') {
            query = query.eq('sterk', true);
        } else if (settings.filterSterk === 'zwak') {
            query = query.eq('sterk', false);
        }

        // Filter vormen
        if (settings.vormen.length > 0) {
            query = query.in('vorm', settings.vormen);
        }

        var result = await query;
        if (result.error) {
            console.error('Error loading sentences:', result.error);
            return [];
        }
        return result.data || [];
    }

    // Shuffle array
    function shuffle(arr) {
        var a = arr.slice();
        for (var i = a.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var tmp = a[i];
            a[i] = a[j];
            a[j] = tmp;
        }
        return a;
    }

    // ---------- Preview ----------
    function renderSpellingPreview(sentences, settings) {
        if (!previewEl) return;

        var SENTENCES_PER_PAGE = 20;
        var pages = [];
        for (var i = 0; i < sentences.length; i += SENTENCES_PER_PAGE) {
            pages.push(sentences.slice(i, i + SENTENCES_PER_PAGE));
        }

        var html = '';

        // Render worksheet pages
        pages.forEach(function (pageSentences, pageIdx) {
            html += renderSpellingPage(pageSentences, settings, false, pageIdx + 1, pages.length);
        });

        // Render answer pages
        if (settings.answerSheet) {
            pages.forEach(function (pageSentences, pageIdx) {
                html += renderSpellingPage(pageSentences, settings, true, pageIdx + 1, pages.length);
            });
        }

        previewEl.innerHTML = html;
    }

    function renderSpellingPage(sentences, settings, isAnswers, pageNum, totalPages) {
        var html = '<div class="wb-preview-page">';

        // Header
        html += '<div class="wb-preview-header-row">';
        html += '<span class="wb-preview-title">' + escapeHtml(settings.title) + (isAnswers ? ' - Antwoorden' : '') + '</span>';
        if (settings.date) {
            var dateStr = settings.datePrefix ? settings.datePrefix + ' ' + settings.date : settings.date;
            html += '<span class="wb-preview-date">' + escapeHtml(dateStr) + '</span>';
        }
        html += '</div>';

        if (settings.showName) {
            html += '<div class="wb-preview-name">Naam: ____________________</div>';
        }

        html += '<div class="wb-preview-separator"></div>';

        // Table
        html += '<table class="wb-sp-table">';
        html += '<thead><tr>';
        html += '<th style="width:30px;">#</th>';
        html += '<th style="width:100px;">Werkwoord</th>';
        if (settings.showTijd) {
            html += '<th style="width:40px;">Tijd</th>';
        }
        html += '<th>Zin</th>';
        html += '</tr></thead>';
        html += '<tbody>';

        sentences.forEach(function (s, idx) {
            var nr = idx + 1;
            var zin = '';
            if (s.zin_begin) zin += escapeHtml(s.zin_begin) + ' ';
            if (s.antwoord) {
                if (isAnswers) {
                    zin += '<span class="wb-sp-answer">' + escapeHtml(s.antwoord) + '</span>';
                } else {
                    zin += '<span class="wb-sp-blank">____________</span>';
                }
                zin += ' ';
            }
            if (s.zin_vervolg) zin += escapeHtml(s.zin_vervolg) + ' ';
            if (s.antwoord2) {
                if (isAnswers) {
                    zin += '<span class="wb-sp-answer">' + escapeHtml(s.antwoord2) + '</span>';
                } else {
                    zin += '<span class="wb-sp-blank">____________</span>';
                }
                zin += ' ';
            }
            if (s.zin_einde) zin += escapeHtml(s.zin_einde);
            zin = zin.trim();

            html += '<tr>';
            html += '<td style="color:#999;">' + nr + '</td>';
            html += '<td><em>' + escapeHtml(s.werkwoord) + '</em></td>';
            if (settings.showTijd) {
                html += '<td style="font-size:10px;color:#888;">' + (s.tijd === 'tt' ? 'tt' : 'vt') + '</td>';
            }
            html += '<td>' + zin + '</td>';
            html += '</tr>';
        });

        html += '</tbody></table>';

        // Footer
        html += '<div class="wb-preview-footer">';
        if (totalPages > 1) {
            html += (isAnswers ? 'Antwoorden - ' : '') + 'Pagina ' + pageNum + ' van ' + totalPages;
        }
        html += '</div>';

        html += '</div>';
        return html;
    }

    // ---------- Generate Button ----------
    var generateBtn = document.getElementById('btnSpGenerate');
    if (generateBtn) {
        generateBtn.addEventListener('click', async function () {
            if (currentSpType !== 'werkwoordspelling') return;

            var settings = readSettingsWerkwoordspelling();
            generateBtn.disabled = true;
            generateBtn.textContent = 'Laden...';

            try {
                var allSentences = await loadSentencesFromSupabase(settings);

                if (allSentences.length === 0) {
                    alert('Geen zinnen gevonden met de huidige filters. Voeg eerst zinnen toe in het beheerpaneel.');
                    return;
                }

                generatedSentences = shuffle(allSentences).slice(0, 20);

                if (allSentences.length < 20) {
                    generatedSentences = shuffle(allSentences);
                }

                renderSpellingPreview(generatedSentences, settings);

                if (previewSection) previewSection.style.display = '';
                previewSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } catch (e) {
                console.error('Error generating worksheet:', e);
                alert('Er is een fout opgetreden bij het genereren.');
            } finally {
                generateBtn.disabled = false;
                generateBtn.innerHTML = '&#128065; Voorbeeld bekijken';
            }
        });
    }

    // ---------- PDF Generation ----------
    var downloadBtn = document.getElementById('btnSpDownloadPdf');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function () {
            if (generatedSentences.length === 0) return;

            var settings = readSettingsWerkwoordspelling();
            generateSpellingPdf(generatedSentences, settings);
        });
    }

    function generateSpellingPdf(sentences, settings) {
        var jsPDF = window.jspdf.jsPDF;
        var doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

        var margin = 15;
        var pageW = 210;
        var contentW = pageW - margin * 2;
        var SENTENCES_PER_PAGE = 20;

        var pages = [];
        for (var i = 0; i < sentences.length; i += SENTENCES_PER_PAGE) {
            pages.push(sentences.slice(i, i + SENTENCES_PER_PAGE));
        }

        // Render worksheet pages
        pages.forEach(function (pageSentences, pageIdx) {
            if (pageIdx > 0) doc.addPage();
            renderSpellingPdfPage(doc, pageSentences, settings, false, margin, contentW, pageIdx + 1, pages.length);
        });

        // Render answer pages
        if (settings.answerSheet) {
            pages.forEach(function (pageSentences, pageIdx) {
                doc.addPage();
                renderSpellingPdfPage(doc, pageSentences, settings, true, margin, contentW, pageIdx + 1, pages.length);
            });
        }

        doc.save((settings.title || 'Spellingwerkblad') + '.pdf');
    }

    function renderSpellingPdfPage(doc, sentences, settings, isAnswers, margin, contentW, pageNum, totalPages) {
        var y = margin;
        var pageW = 210;

        // Header
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text(settings.title + (isAnswers ? ' - Antwoorden' : ''), margin, y);

        // Date on right
        if (settings.date) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            var dateStr = settings.datePrefix ? settings.datePrefix + ' ' + settings.date : settings.date;
            doc.text(dateStr, pageW - margin, y, { align: 'right' });
        }

        y += 6;

        // Name field
        if (settings.showName) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.text('Naam: ____________________', margin, y);
            y += 6;
        }

        // Separator
        doc.setDrawColor(200, 200, 210);
        doc.setLineWidth(0.3);
        doc.line(margin, y, pageW - margin, y);
        y += 6;

        // Column positions
        var colNr = margin;
        var colWerkwoord = margin + 10;
        var colTijd = margin + 45;
        var colZin = settings.showTijd ? margin + 58 : margin + 45;
        var lineH = 10;

        // Table header
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text('#', colNr, y);
        doc.text('Werkwoord', colWerkwoord, y);
        if (settings.showTijd) {
            doc.text('Tijd', colTijd, y);
        }
        doc.text('Zin', colZin, y);
        y += 2;
        doc.setDrawColor(200, 200, 210);
        doc.line(margin, y, pageW - margin, y);
        y += 5;

        // Sentences
        doc.setTextColor(30, 30, 30);
        sentences.forEach(function (s, idx) {
            var nr = idx + 1;

            // Number
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(150, 150, 150);
            doc.text(nr + '.', colNr, y);

            // Werkwoord (italic)
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(10);
            doc.setTextColor(30, 30, 30);
            doc.text(s.werkwoord || '', colWerkwoord, y);

            // Tijd
            if (settings.showTijd) {
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8);
                doc.setTextColor(130, 130, 130);
                doc.text(s.tijd === 'tt' ? 'tt' : 'vt', colTijd, y);
            }

            // Zin
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(30, 30, 30);

            // Build full sentence for non-answer display
            var zinParts = '';
            if (s.zin_begin) zinParts += s.zin_begin + ' ';
            if (s.antwoord) {
                zinParts += isAnswers ? s.antwoord : '____________';
                zinParts += ' ';
            }
            if (s.zin_vervolg) zinParts += s.zin_vervolg + ' ';
            if (s.antwoord2) {
                zinParts += isAnswers ? s.antwoord2 : '____________';
                zinParts += ' ';
            }
            if (s.zin_einde) zinParts += s.zin_einde;
            zinParts = zinParts.trim();

            // Truncate if too long
            var maxZinW = pageW - margin - colZin;
            var zinLines = doc.splitTextToSize(zinParts, maxZinW);

            if (isAnswers) {
                // Draw sentence with highlighted answers
                var curX = colZin;
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(10);
                doc.setTextColor(30, 30, 30);

                if (s.zin_begin) {
                    doc.text(s.zin_begin + ' ', curX, y);
                    curX += doc.getTextWidth(s.zin_begin + ' ');
                }
                if (s.antwoord) {
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(108, 99, 255);
                    doc.text(s.antwoord, curX, y);
                    curX += doc.getTextWidth(s.antwoord + ' ');
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(30, 30, 30);
                }
                if (s.zin_vervolg) {
                    doc.text(s.zin_vervolg + ' ', curX, y);
                    curX += doc.getTextWidth(s.zin_vervolg + ' ');
                }
                if (s.antwoord2) {
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(108, 99, 255);
                    doc.text(s.antwoord2, curX, y);
                    curX += doc.getTextWidth(s.antwoord2 + ' ');
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(30, 30, 30);
                }
                if (s.zin_einde) {
                    doc.text(s.zin_einde, curX, y);
                }
            } else {
                doc.text(zinLines[0], colZin, y);
            }

            // Light line
            y += 2;
            doc.setDrawColor(230, 230, 240);
            doc.setLineWidth(0.2);
            doc.line(margin, y, pageW - margin, y);
            y += lineH - 2;
        });

        // Footer
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(160, 160, 170);
        var footerY = 287;
        doc.line(margin, footerY - 3, pageW - margin, footerY - 3);
        var footerText = 'Meestertools.nl';
        if (totalPages > 1) {
            footerText += (isAnswers ? ' | Antwoorden' : '') + ' | Pagina ' + pageNum + ' van ' + totalPages;
        }
        doc.text(footerText, margin, footerY);
    }

    // ---------- Utility ----------
    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

});

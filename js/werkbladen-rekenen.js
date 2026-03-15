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
    var settingsBreuken = document.getElementById('settingsBreuken');
    var settingsMetriek = document.getElementById('settingsMetriek');
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
        if (settingsBreuken) settingsBreuken.style.display = 'none';
        if (settingsMetriek) settingsMetriek.style.display = 'none';
        if (settingsPercent) settingsPercent.style.display = 'none';
        generateSection.style.display = '';
        previewSection.style.display = 'none';

        if (currentType === 'bewerkingen') {
            settingsBewerkingen.style.display = '';
        } else if (currentType === 'staartdelingen') {
            settingsStaartdelingen.style.display = '';
        } else if (currentType === 'cijferen') {
            if (settingsCijferen) settingsCijferen.style.display = '';
        } else if (currentType === 'breuken') {
            if (settingsBreuken) settingsBreuken.style.display = '';
        } else if (currentType === 'metriek') {
            if (settingsMetriek) settingsMetriek.style.display = '';
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
    if (settingsMetriek) {
        settingsMetriek.querySelectorAll('input').forEach(function (input) {
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

    // ---------- Date Field Switch ----------
    var dateFieldBtns = document.querySelectorAll('.wb-switch-btn[data-datefield]');
    var dateFieldHidden = document.getElementById('wbDateField');
    var datePrefixField = document.getElementById('datePrefix');
    var datePickerField = document.getElementById('datePicker');

    dateFieldBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            dateFieldBtns.forEach(function (b) { b.classList.remove('active'); });
            this.classList.add('active');
            var val = this.getAttribute('data-datefield');
            dateFieldHidden.value = val;
            if (datePrefixField) datePrefixField.style.display = val === 'ja' ? '' : 'none';
            if (datePickerField) datePickerField.style.display = val === 'ja' ? '' : 'none';
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

    // ---------- Breuken Stepper ----------
    var fracCountInput = document.getElementById('wbFracCount');
    var fracBtnMinus = document.getElementById('wbFracCountMinus');
    var fracBtnPlus = document.getElementById('wbFracCountPlus');
    var fracMaxDenInput = document.getElementById('wbFracMaxDen');
    var fracMaxDenMinus = document.getElementById('wbFracMaxDenMinus');
    var fracMaxDenPlus = document.getElementById('wbFracMaxDenPlus');

    if (fracBtnMinus) {
        fracBtnMinus.addEventListener('click', function () {
            var val = parseInt(fracCountInput.value) || 50;
            if (val > 1) fracCountInput.value = val - 1;
            hidePreview();
        });
    }
    if (fracBtnPlus) {
        fracBtnPlus.addEventListener('click', function () {
            var val = parseInt(fracCountInput.value) || 50;
            if (val < 200) fracCountInput.value = val + 1;
            hidePreview();
        });
    }
    if (fracMaxDenMinus) {
        fracMaxDenMinus.addEventListener('click', function () {
            var val = parseInt(fracMaxDenInput.value) || 12;
            if (val > 2) fracMaxDenInput.value = val - 1;
            hidePreview();
        });
    }
    if (fracMaxDenPlus) {
        fracMaxDenPlus.addEventListener('click', function () {
            var val = parseInt(fracMaxDenInput.value) || 12;
            if (val < 100) fracMaxDenInput.value = val + 1;
            hidePreview();
        });
    }

    // ---------- Breuken Operation Toggles ----------
    var fracAddOptions = document.getElementById('fracAddOptions');
    var fracSubOptions = document.getElementById('fracSubOptions');
    var fracMulOptions = document.getElementById('fracMulOptions');
    var fracDivOptions = document.getElementById('fracDivOptions');

    function updateFracOpSubOptions() {
        var addActive = document.querySelector('.wb-toggle-wide[data-fracop="+"].active');
        var subActive = document.querySelector('.wb-toggle-wide[data-fracop="-"].active');
        var mulActive = document.querySelector('.wb-toggle-wide[data-fracop="*"].active');
        var divActive = document.querySelector('.wb-toggle-wide[data-fracop="/"].active');
        if (fracAddOptions) fracAddOptions.style.display = addActive ? '' : 'none';
        if (fracSubOptions) fracSubOptions.style.display = subActive ? '' : 'none';
        if (fracMulOptions) fracMulOptions.style.display = mulActive ? '' : 'none';
        if (fracDivOptions) fracDivOptions.style.display = divActive ? '' : 'none';
    }

    document.querySelectorAll('.wb-toggle-wide[data-fracop]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            this.classList.toggle('active');
            updateFracOpSubOptions();
            hidePreview();
        });
    });

    // Show sub-options for initially active ops
    updateFracOpSubOptions();

    // ---------- Breuken Sub-option groups ----------
    var fracSubOptionGroups = ['fracadd', 'fracsub', 'fracmul', 'fracdiv'];
    var fracSubOptionHiddens = {
        fracadd: 'wbFracAddOpt',
        fracsub: 'wbFracSubOpt',
        fracmul: 'wbFracMulOpt',
        fracdiv: 'wbFracDivOpt'
    };
    fracSubOptionGroups.forEach(function (group) {
        document.querySelectorAll('.wb-suboption[data-' + group + ']').forEach(function (btn) {
            btn.addEventListener('click', function () {
                document.querySelectorAll('.wb-suboption[data-' + group + ']').forEach(function (b) {
                    b.classList.remove('active');
                });
                this.classList.add('active');
                var hiddenId = fracSubOptionHiddens[group];
                if (hiddenId) document.getElementById(hiddenId).value = this.getAttribute('data-' + group);
                hidePreview();
            });
        });
    });

    // ---------- Breuken Level Sub-options ----------
    document.querySelectorAll('.wb-suboption[data-fraclevel]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.wb-suboption[data-fraclevel]').forEach(function (b) {
                b.classList.remove('active');
            });
            this.classList.add('active');
            document.getElementById('wbFracLevel').value = this.getAttribute('data-fraclevel');
            hidePreview();
        });
    });

    // ---------- Breuken Type Switch ----------
    var fracTypeBtns = document.querySelectorAll('.wb-switch-btn[data-fractype]');
    var fracTypeHidden = document.getElementById('wbFracType');
    var fracRekenenOptions = document.getElementById('fracRekenenOptions');
    var fracLevelOptions = document.getElementById('fracLevelOptions');

    fracTypeBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            fracTypeBtns.forEach(function (b) { b.classList.remove('active'); });
            this.classList.add('active');
            var val = this.getAttribute('data-fractype');
            if (fracTypeHidden) fracTypeHidden.value = val;
            // Show/hide rekenen-specific options
            if (fracRekenenOptions) fracRekenenOptions.style.display = val === 'rekenen' ? '' : 'none';
            if (fracLevelOptions) fracLevelOptions.style.display = val === 'rekenen' ? '' : 'none';
            // Hide all op sub-options when not rekenen
            if (val !== 'rekenen') {
                if (fracAddOptions) fracAddOptions.style.display = 'none';
                if (fracSubOptions) fracSubOptions.style.display = 'none';
                if (fracMulOptions) fracMulOptions.style.display = 'none';
                if (fracDivOptions) fracDivOptions.style.display = 'none';
            } else {
                updateFracOpSubOptions();
            }
            // Adjust default count: rekenen 40 (2x4x5), vereenvoudigen/helen 60 (3x4x5)
            var defaultCount = val === 'rekenen' ? 40 : 60;
            fracCountInput.value = defaultCount;
            hidePreview();
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
            var maxVal = parseInt(pctCountInput.max) || 200;
            if (val < maxVal) pctCountInput.value = val + 1;
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
            // Conversie: max 40 sommen (2x4 grid × 5 rijen)
            var maxCount = val === 'omrekenen' ? 40 : 200;
            pctCountInput.max = maxCount;
            if (parseInt(pctCountInput.value) > maxCount) pctCountInput.value = maxCount;
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

    // ---------- Metriek Stepper ----------
    var metCountInput = document.getElementById('wbMetCount');
    var metBtnMinus = document.getElementById('wbMetCountMinus');
    var metBtnPlus = document.getElementById('wbMetCountPlus');

    if (metBtnMinus) {
        metBtnMinus.addEventListener('click', function () {
            var val = parseInt(metCountInput.value) || 75;
            if (val > 1) metCountInput.value = val - 1;
            hidePreview();
        });
    }
    if (metBtnPlus) {
        metBtnPlus.addEventListener('click', function () {
            var val = parseInt(metCountInput.value) || 75;
            if (val < 200) metCountInput.value = val + 1;
            hidePreview();
        });
    }

    // ---------- Metriek Category Switch ----------
    var metCatBtns = document.querySelectorAll('.wb-switch-btn[data-metcat]');
    var metCatHidden = document.getElementById('wbMetCat');
    var metUnitsLengte = document.getElementById('metUnitsLengte');
    var metUnitsOppervlakte = document.getElementById('metUnitsOppervlakte');
    var metUnitsInhoud = document.getElementById('metUnitsInhoud');
    var metUnitsGewicht = document.getElementById('metUnitsGewicht');

    function updateMetUnitsVisibility() {
        var cat = metCatHidden ? metCatHidden.value : 'lengte';
        if (metUnitsLengte) metUnitsLengte.style.display = cat === 'lengte' ? '' : 'none';
        if (metUnitsOppervlakte) metUnitsOppervlakte.style.display = cat === 'oppervlakte' ? '' : 'none';
        if (metUnitsInhoud) metUnitsInhoud.style.display = cat === 'inhoud' ? '' : 'none';
        if (metUnitsGewicht) metUnitsGewicht.style.display = cat === 'gewicht' ? '' : 'none';
    }

    metCatBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            metCatBtns.forEach(function (b) { b.classList.remove('active'); });
            this.classList.add('active');
            if (metCatHidden) metCatHidden.value = this.getAttribute('data-metcat');
            updateMetUnitsVisibility();
            hidePreview();
        });
    });

    // ---------- Metriek Unit Toggles ----------
    document.querySelectorAll('#settingsMetriek .wb-toggle-wide[data-metunit]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            this.classList.toggle('active');
            // Ensure at least 2 units active in the current category
            var parent = this.closest('.wb-field');
            var activeCount = parent.querySelectorAll('.wb-toggle-wide.active').length;
            if (activeCount < 2) this.classList.add('active');
            hidePreview();
        });
    });

    // ---------- Metriek Level Sub-options ----------
    document.querySelectorAll('.wb-suboption[data-metlevel]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.wb-suboption[data-metlevel]').forEach(function (b) {
                b.classList.remove('active');
            });
            this.classList.add('active');
            document.getElementById('wbMetLevel').value = this.getAttribute('data-metlevel');
            hidePreview();
        });
    });

    // ---------- Read Settings ----------
    // ---------- Shared Date Helper ----------
    function getFormattedDate() {
        if (dateFieldHidden && dateFieldHidden.value === 'nee') return '';
        var dateVal = document.getElementById('wbDate').value;
        if (!dateVal) return '';
        var d = new Date(dateVal);
        return ('0' + d.getDate()).slice(-2) + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + d.getFullYear();
    }

    function getDatePrefix() {
        if (dateFieldHidden && dateFieldHidden.value === 'nee') return '';
        return document.getElementById('wbDatePrefix').value.trim();
    }

    function readSettings() {
        var ops = [];
        document.querySelectorAll('.wb-toggle-wide[data-op].active').forEach(function (btn) {
            ops.push(btn.getAttribute('data-op'));
        });

        var numberType = numberTypeHidden.value;

        return {
            title: document.getElementById('wbTitle').value.trim() || 'Rekenwerkblad',
            date: getFormattedDate(),
            datePrefix: getDatePrefix(),
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
    function arrangeInBlocks(sums, numCols) {
        var cols = numCols || 2;
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
    var CONV_PER_PAGE = 40; // 2 cols × 4 rows × 5 per block
    var FRAC_CALC_PER_PAGE = 40; // 2 cols × 4 rows × 5 per block (breuken rekenen)
    var FRAC_SIMPLE_PER_PAGE = 60; // 3 cols × 4 rows × 5 per block (vereenvoudigen/helen)

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
        return {
            title: document.getElementById('wbTitle').value.trim() || 'Rekenwerkblad',
            date: getFormattedDate(),
            datePrefix: getDatePrefix(),
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

        var numberType = cfNumberTypeHidden ? cfNumberTypeHidden.value : 'heel';

        var addTypeEl = document.getElementById('wbCfAddType');
        var subTypeEl = document.getElementById('wbCfSubType');
        var mulTypeEl = document.getElementById('wbCfMulType');

        return {
            title: document.getElementById('wbTitle').value.trim() || 'Rekenwerkblad',
            date: getFormattedDate(),
            datePrefix: getDatePrefix(),
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
        return {
            title: document.getElementById('wbTitle').value.trim() || 'Rekenwerkblad',
            date: getFormattedDate(),
            datePrefix: getDatePrefix(),
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
    // BREUKEN (optellen, aftrekken, ×, ÷)
    // ============================================

    var generatedFractions = [];

    function getFracSettings() {
        var activeFracOps = [];
        document.querySelectorAll('.wb-toggle-wide[data-fracop].active').forEach(function (b) {
            activeFracOps.push(b.getAttribute('data-fracop'));
        });
        if (activeFracOps.length === 0) activeFracOps = ['+'];

        return {
            title: document.getElementById('wbTitle').value.trim() || 'Rekenwerkblad',
            date: getFormattedDate(),
            datePrefix: getDatePrefix(),
            showName: document.getElementById('wbNameField').value === 'ja',
            count: Math.max(1, Math.min(200, parseInt(fracCountInput.value) || 50)),
            fracType: fracTypeHidden ? fracTypeHidden.value : 'rekenen',
            ops: activeFracOps,
            level: document.getElementById('wbFracLevel').value || 'gelijknamig',
            maxDen: Math.max(2, parseInt(fracMaxDenInput.value) || 12),
            addOpt: document.getElementById('wbFracAddOpt').value || 'kleiner1',
            subOpt: document.getElementById('wbFracSubOpt').value || 'gewoon',
            mulOpt: document.getElementById('wbFracMulOpt').value || 'breukxbreuk',
            divOpt: document.getElementById('wbFracDivOpt').value || 'breukdbreuk',
            answerSheet: document.getElementById('wbFracAnswerSheet').checked
        };
    }

    // Helper: random int in range [min, max]
    function randInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function generateFracSums(settings) {
        var sums = [];
        var used = {};
        var maxAttempts = settings.count * 300;
        var attempts = 0;

        while (sums.length < settings.count && attempts < maxAttempts) {
            attempts++;
            var op = settings.ops[Math.floor(Math.random() * settings.ops.length)];
            var den1, den2, num1, num2, resDen, resNum;

            // --- Determine denominators ---
            if (op === '+' || op === '-') {
                if (settings.level === 'gelijknamig') {
                    den1 = randInt(2, settings.maxDen);
                    den2 = den1;
                } else {
                    den1 = randInt(2, settings.maxDen);
                    den2 = randInt(2, settings.maxDen);
                    if (den1 === den2) den2 = den1 < settings.maxDen ? den1 + 1 : den1 - 1;
                }
            } else {
                den1 = randInt(2, settings.maxDen);
                den2 = randInt(2, settings.maxDen);
            }

            // --- Generate per operation ---
            if (op === '+') {
                var opt = settings.addOpt || 'kleiner1';
                if (opt === 'groter1') {
                    // Both nums > half den so sum > 1
                    num1 = randInt(Math.ceil(den1 / 2), den1 - 1);
                    num2 = randInt(Math.ceil(den2 / 2), den2 - 1);
                } else if (opt === 'kleiner1') {
                    num1 = randInt(1, den1 - 1);
                    num2 = randInt(1, den2 - 1);
                } else {
                    // soms: random
                    num1 = randInt(1, den1 - 1);
                    num2 = randInt(1, den2 - 1);
                }

                if (settings.level === 'gelijknamig') {
                    resNum = num1 + num2;
                    resDen = den1;
                } else {
                    var g = gcd(den1, den2);
                    var commonDen = (den1 * den2) / g;
                    if (commonDen > 100) continue;
                    resNum = num1 * (commonDen / den1) + num2 * (commonDen / den2);
                    resDen = commonDen;
                }

                if (resNum <= 0) continue;
                // Filter based on addOpt
                if (opt === 'kleiner1' && resNum >= resDen) continue;
                if (opt === 'groter1' && resNum <= resDen) continue;

            } else if (op === '-') {
                var subOpt = settings.subOpt || 'gewoon';
                if (subOpt === 'gewoon') {
                    // Zonder helen: gewone breuken < 1
                    num1 = randInt(1, den1 - 1);
                    num2 = randInt(1, den2 - 1);
                } else if (subOpt === 'methelen') {
                    // Met helen: eerste getal is gemengd (> 1)
                    var helen1 = randInt(1, 4);
                    num1 = helen1 * den1 + randInt(1, den1 - 1);
                    num2 = randInt(1, den2 - 1);
                } else {
                    // Beide met helen
                    var helen1 = randInt(2, 5);
                    num1 = helen1 * den1 + randInt(1, den1 - 1);
                    var helen2 = randInt(1, helen1 - 1);
                    num2 = helen2 * den2 + randInt(1, den2 - 1);
                }

                if (settings.level === 'gelijknamig') {
                    resNum = num1 - num2;
                    resDen = den1;
                } else {
                    var g = gcd(den1, den2);
                    var commonDen = (den1 * den2) / g;
                    if (commonDen > 100) continue;
                    resNum = num1 * (commonDen / den1) - num2 * (commonDen / den2);
                    resDen = commonDen;
                }

                if (resNum <= 0) continue;

            } else if (op === '*') {
                var mulOpt = settings.mulOpt || 'breukxbreuk';
                if (mulOpt === 'breukxheel') {
                    num1 = randInt(1, den1 - 1);
                    num2 = randInt(2, 10);
                    den2 = 1;
                } else if (mulOpt === 'gemengd') {
                    if (Math.random() < 0.5) {
                        num1 = randInt(1, den1 - 1);
                        num2 = randInt(2, 10);
                        den2 = 1;
                    } else {
                        num1 = randInt(1, den1 - 1);
                        num2 = randInt(1, den2 - 1);
                    }
                } else {
                    num1 = randInt(1, den1 - 1);
                    num2 = randInt(1, den2 - 1);
                }
                resNum = num1 * num2;
                resDen = den1 * den2;
                if (resDen > 100) continue;

            } else {
                // Division: a/b ÷ c/d = (a*d)/(b*c)
                var divOpt = settings.divOpt || 'breukdbreuk';
                if (divOpt === 'breukdheel') {
                    num1 = randInt(1, den1 - 1);
                    num2 = randInt(2, 10);
                    den2 = 1;
                } else if (divOpt === 'gemengd') {
                    if (Math.random() < 0.5) {
                        num1 = randInt(1, den1 - 1);
                        num2 = randInt(2, 10);
                        den2 = 1;
                    } else {
                        num1 = randInt(1, den1 - 1);
                        num2 = randInt(1, den2 - 1);
                    }
                } else {
                    num1 = randInt(1, den1 - 1);
                    num2 = randInt(1, den2 - 1);
                }
                resNum = num1 * den2;
                resDen = den1 * num2;
                if (resDen > 100 || resDen === 0) continue;
            }

            // Simplify result
            var gs = gcd(Math.abs(resNum), Math.abs(resDen));
            resNum = resNum / gs;
            resDen = resDen / gs;

            var key = num1 + '/' + den1 + op + num2 + '/' + den2;
            if (used[key]) continue;
            used[key] = true;

            sums.push({
                num1: num1, den1: den1,
                num2: num2, den2: den2,
                op: op,
                resNum: resNum, resDen: resDen
            });
        }

        return sums;
    }

    // ---------- Vereenvoudigen ----------
    function generateSimplSums(settings) {
        var sums = [];
        var used = {};
        var maxAttempts = settings.count * 200;
        var attempts = 0;

        while (sums.length < settings.count && attempts < maxAttempts) {
            attempts++;
            // Generate a simplified fraction, then multiply by a factor
            var den = Math.floor(Math.random() * (settings.maxDen - 1)) + 2;
            var num = Math.floor(Math.random() * (den - 1)) + 1;
            // Make sure it's already simplified
            var g = gcd(num, den);
            var simpNum = num / g;
            var simpDen = den / g;
            if (simpNum === num && simpDen === den) {
                // Already simplified, need to multiply to create unsimplified version
                var factor = Math.floor(Math.random() * 4) + 2;
                num = simpNum * factor;
                den = simpDen * factor;
                if (den > 100) continue;
            }
            // Now num/den can be simplified to simpNum/simpDen
            g = gcd(num, den);
            simpNum = num / g;
            simpDen = den / g;
            if (simpNum === num) continue; // already simplified, skip

            var key = num + '/' + den;
            if (used[key]) continue;
            used[key] = true;

            sums.push({
                type: 'simpl',
                num1: num, den1: den,
                resNum: simpNum, resDen: simpDen
            });
        }
        return sums;
    }

    // ---------- Helen eruit halen ----------
    function generateHelenSums(settings) {
        var sums = [];
        var used = {};
        var maxAttempts = settings.count * 200;
        var attempts = 0;

        while (sums.length < settings.count && attempts < maxAttempts) {
            attempts++;
            var den = Math.floor(Math.random() * (settings.maxDen - 1)) + 2;
            // Numerator must be > denominator (oneigenlijke breuk)
            var helen = Math.floor(Math.random() * 5) + 1; // 1-5 whole parts
            var restNum = Math.floor(Math.random() * (den - 1)) + 1; // rest 1..den-1
            // Simplify the rest
            var g = gcd(restNum, den);
            restNum = restNum / g;
            den = den / g;
            if (den < 2) continue;

            var num = helen * den + restNum;

            var key = num + '/' + den;
            if (used[key]) continue;
            used[key] = true;

            sums.push({
                type: 'helen',
                num1: num, den1: den,
                helen: helen,
                restNum: restNum, restDen: den
            });
        }
        return sums;
    }

    function opSymbolHtml(op) {
        switch (op) {
            case '+': return '+';
            case '-': return '&minus;';
            case '*': return '&times;';
            case '/': return '&divide;';
            default: return op;
        }
    }

    function opSymbolPdfFrac(op) {
        switch (op) {
            case '+': return '+';
            case '-': return '-';
            case '*': return 'x';
            case '/': return ':';
            default: return op;
        }
    }

    // Helper: render fraction answer, showing mixed number when num >= den
    function renderFracAnswerHtml(num, den) {
        if (den === 1) return '<span>' + num + '</span>';
        if (num < den) return renderFracHtml(num + '/' + den, false);
        var whole = Math.floor(num / den);
        var rest = num % den;
        if (rest === 0) return '<span>' + whole + '</span>';
        return '<span>' + whole + ' </span>' + renderFracHtml(rest + '/' + den, false);
    }

    // Helper: render fraction input (num1/den1) - shows mixed number for nums > den
    function renderFracInputHtml(num, den) {
        if (den === 1) return '<span>' + num + '</span>';
        if (num <= den) return renderFracHtml(num + '/' + den, false);
        var whole = Math.floor(num / den);
        var rest = num % den;
        if (rest === 0) return '<span>' + whole + '</span>';
        return '<span>' + whole + ' </span>' + renderFracHtml(rest + '/' + den, false);
    }

    // Helper: render helen answer as "2 1/3" (whole + fraction)
    function renderHelenAnswer(helen, restNum, restDen, isBlank) {
        if (isBlank) {
            return '<span class="wb-preview-line">___</span>';
        }
        if (restNum === 0) {
            return '<span>' + helen + '</span>';
        }
        return '<span>' + helen + ' </span>' + renderFracHtml(restNum + '/' + restDen, false);
    }

    function renderFracSumGrid(sums, showAnswers) {
        // Detect type from first sum
        var fracType = sums.length > 0 && sums[0].type ? sums[0].type : 'rekenen';
        var gridCols = (fracType === 'simpl' || fracType === 'helen') ? 3 : 2;
        var layout = arrangeInBlocks(sums, gridCols);
        var blocksClass = gridCols === 3 ? 'wb-preview-blocks wb-preview-blocks-3' : 'wb-preview-blocks';
        var html = '<div class="' + blocksClass + '">';

        for (var r = 0; r < layout.rows; r++) {
            for (var c = 0; c < layout.cols; c++) {
                var block = layout.grid[r][c];
                html += '<div class="wb-preview-block">';
                for (var i = 0; i < block.length; i++) {
                    var s = block[i].sum;

                    if (fracType === 'simpl') {
                        html += '<div class="wb-preview-sum" style="grid-template-columns: 4ch 2.5ch 4ch; align-items: center;">';
                        html += '<span>' + renderFracHtml(s.num1 + '/' + s.den1, false) + '</span>';
                        html += '<span class="wb-preview-eq">=</span>';
                        if (showAnswers) {
                            html += '<span class="wb-preview-answer">' + renderFracHtml(s.resNum + '/' + s.resDen, false) + '</span>';
                        } else {
                            html += '<span>' + renderFracHtml('?/?', true) + '</span>';
                        }
                        html += '</div>';
                    } else if (fracType === 'helen') {
                        html += '<div class="wb-preview-sum" style="grid-template-columns: 4ch 2.5ch 5ch; align-items: center;">';
                        html += '<span>' + renderFracHtml(s.num1 + '/' + s.den1, false) + '</span>';
                        html += '<span class="wb-preview-eq">=</span>';
                        if (showAnswers) {
                            html += '<span class="wb-preview-answer">' + renderHelenAnswer(s.helen, s.restNum, s.restDen, false) + '</span>';
                        } else {
                            html += '<span>' + renderHelenAnswer(0, 0, 0, true) + '</span>';
                        }
                        html += '</div>';
                    } else {
                        html += '<div class="wb-preview-sum" style="grid-template-columns: 5ch 2ch 5ch 2ch 6ch; align-items: center;">';
                        html += '<span>' + renderFracInputHtml(s.num1, s.den1) + '</span>';
                        html += '<span class="wb-preview-eq">' + opSymbolHtml(s.op) + '</span>';
                        html += '<span>' + renderFracInputHtml(s.num2, s.den2) + '</span>';
                        html += '<span class="wb-preview-eq">=</span>';
                        if (showAnswers) {
                            html += '<span class="wb-preview-answer">' + renderFracAnswerHtml(s.resNum, s.resDen) + '</span>';
                        } else {
                            html += '<span>' + renderFracHtml('?/?', true) + '</span>';
                        }
                        html += '</div>';
                    }
                }
                html += '</div>';
            }
        }
        html += '</div>';
        return html;
    }

    function renderFracPreview(settings, sums) {
        var html = '';
        var perPage = settings.fracType === 'rekenen' ? FRAC_CALC_PER_PAGE : FRAC_SIMPLE_PER_PAGE;
        var previewSums = sums.slice(0, perPage);

        html += '<div class="wb-preview-page">';
        html += buildHeaderHtml(settings, false);
        html += renderFracSumGrid(previewSums, false);
        html += '<div class="wb-preview-footer">Meester Tools</div>';
        html += '</div>';

        if (settings.answerSheet) {
            html += '<div class="wb-preview-page">';
            html += buildHeaderHtml(settings, true);
            html += renderFracSumGrid(previewSums, true);
            html += '<div class="wb-preview-footer">Meester Tools</div>';
            html += '</div>';
        }

        previewEl.innerHTML = html;
        previewSection.style.display = '';
    }

    function generateFracPdfPage(doc, settings, sums, isAnswers) {
        var pageW = 210;
        var margin = 20;
        var contentW = pageW - margin * 2;

        // Title
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(50, 50, 70);
        var titleText = settings.title;
        if (isAnswers) titleText += ' - Antwoordblad';
        doc.text(titleText, margin, 12);

        if (settings.showName) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 100, 110);
            doc.text('Naam: ___________________________', pageW - margin, 12, { align: 'right' });
        }

        var yPos = 18;
        if (settings.date) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 100, 110);
            var dateDisplay = settings.datePrefix ? settings.datePrefix + ' ' + settings.date : settings.date;
            doc.text(dateDisplay, margin, yPos);
            yPos += 6;
        }

        var yStart = yPos + 10;

        // Detect type
        var fracType = sums.length > 0 && sums[0].type ? sums[0].type : 'rekenen';
        var numCols = (fracType === 'simpl' || fracType === 'helen') ? 3 : 2;
        var layout = arrangeInBlocks(sums, numCols);
        var lineH = 11;
        var blockGap = 8;
        var colGap = numCols === 3 ? 8 : 12;
        var colW = (contentW - colGap * (numCols - 1)) / numCols;

        // Measure fraction widths
        doc.setFontSize(9);
        var fracW = 0;
        for (var si = 0; si < sums.length; si++) {
            var s = sums[si];
            var nums = [s.num1, s.den1];
            if (s.num2 !== undefined) { nums.push(s.num2); nums.push(s.den2); }
            if (s.resNum !== undefined) { nums.push(s.resNum); nums.push(s.resDen); }
            if (s.helen !== undefined) nums.push(s.helen);
            if (s.restNum !== undefined) { nums.push(s.restNum); nums.push(s.restDen); }
            for (var ni = 0; ni < nums.length; ni++) {
                var tw = doc.getTextWidth(String(Math.abs(nums[ni])));
                if (tw > fracW) fracW = tw;
            }
        }
        fracW += 3;
        doc.setFontSize(11);
        var opW = 5;
        var eqW = 5;

        var y = yStart;

        for (var r = 0; r < layout.rows; r++) {
            for (var c = 0; c < layout.cols; c++) {
                var block = layout.grid[r][c];
                if (block.length === 0) continue;
                var colX = margin + c * (colW + colGap);

                for (var i = 0; i < block.length; i++) {
                    var s = block[i].sum;
                    var currentY = y + i * lineH;

                    if (currentY > 280) {
                        doc.addPage();
                        y = margin + 8;
                        currentY = y + i * lineH;
                    }

                    var xPos = colX;

                    if (fracType === 'simpl') {
                        // Vereenvoudigen: breuk = antwoord
                        drawFractionPdf(doc, s.num1 + '/' + s.den1, xPos + fracW, currentY, [50, 50, 70]);
                        xPos += fracW;
                        doc.setFontSize(11);
                        doc.setTextColor(50, 50, 70);
                        doc.text('=', xPos + eqW / 2, currentY, { align: 'center' });
                        xPos += eqW;
                        if (isAnswers) {
                            drawFractionPdf(doc, s.resNum + '/' + s.resDen, xPos + fracW, currentY, [108, 99, 255]);
                        } else {
                            drawFractionPdf(doc, '?/?', xPos + fracW, currentY, null);
                        }
                    } else if (fracType === 'helen') {
                        // Helen: breuk = heel rest
                        drawFractionPdf(doc, s.num1 + '/' + s.den1, xPos + fracW, currentY, [50, 50, 70]);
                        xPos += fracW;
                        doc.setFontSize(11);
                        doc.setTextColor(50, 50, 70);
                        doc.text('=', xPos + eqW / 2, currentY, { align: 'center' });
                        xPos += eqW;
                        if (isAnswers) {
                            var color = [108, 99, 255];
                            doc.setFontSize(11);
                            doc.setFont('helvetica', 'bold');
                            doc.setTextColor(color[0], color[1], color[2]);
                            if (s.restNum === 0) {
                                doc.text(String(s.helen), xPos + fracW, currentY, { align: 'right' });
                            } else {
                                var helenStr = String(s.helen);
                                var helenW = doc.getTextWidth(helenStr + ' ');
                                doc.text(helenStr, xPos, currentY);
                                drawFractionPdf(doc, s.restNum + '/' + s.restDen, xPos + helenW + fracW, currentY, color);
                            }
                        } else {
                            doc.setDrawColor(200, 200, 210);
                            doc.setLineWidth(0.3);
                            doc.line(xPos, currentY, xPos + fracW * 2, currentY);
                        }
                    } else {
                        // Rekenen: breuk op breuk = antwoord (with mixed numbers)
                        drawMixedFracPdf(doc, s.num1, s.den1, xPos + fracW, currentY, [50, 50, 70]);
                        xPos += fracW;

                        doc.setFontSize(11);
                        doc.setFont('helvetica', 'normal');
                        doc.setTextColor(50, 50, 70);
                        doc.text(opSymbolPdfFrac(s.op), xPos + opW / 2, currentY, { align: 'center' });
                        xPos += opW;

                        drawMixedFracPdf(doc, s.num2, s.den2, xPos + fracW, currentY, [50, 50, 70]);
                        xPos += fracW;

                        doc.setFontSize(11);
                        doc.setTextColor(50, 50, 70);
                        doc.text('=', xPos + eqW / 2, currentY, { align: 'center' });
                        xPos += eqW;

                        if (isAnswers) {
                            drawMixedFracPdf(doc, s.resNum, s.resDen, xPos + fracW, currentY, [108, 99, 255]);
                        } else {
                            drawFractionPdf(doc, '?/?', xPos + fracW, currentY, null);
                        }
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

    // ============================================
    // METRIEK (Metric Conversions)
    // ============================================

    var METRIC_PER_PAGE = 75; // 3 cols × 5 rows × 5 per block

    // Unit definitions per category with conversion factors to base unit
    var metricUnits = {
        lengte: {
            units: ['km', 'hm', 'dam', 'm', 'dm', 'cm', 'mm'],
            factors: { km: 1000, hm: 100, dam: 10, m: 1, dm: 0.1, cm: 0.01, mm: 0.001 },
            labels: { km: 'km', hm: 'hm', dam: 'dam', m: 'm', dm: 'dm', cm: 'cm', mm: 'mm' }
        },
        oppervlakte: {
            units: ['km2', 'hm2', 'dam2', 'm2', 'dm2', 'cm2', 'mm2'],
            factors: { km2: 1000000, hm2: 10000, dam2: 100, m2: 1, dm2: 0.01, cm2: 0.0001, mm2: 0.000001 },
            labels: { km2: 'km\u00B2', hm2: 'hm\u00B2', dam2: 'dam\u00B2', m2: 'm\u00B2', dm2: 'dm\u00B2', cm2: 'cm\u00B2', mm2: 'mm\u00B2' }
        },
        inhoud: {
            units: ['kl', 'hl', 'dal', 'l', 'dl', 'cl', 'ml'],
            factors: { kl: 1000, hl: 100, dal: 10, l: 1, dl: 0.1, cl: 0.01, ml: 0.001 },
            labels: { kl: 'kl', hl: 'hl', dal: 'dal', l: 'l', dl: 'dl', cl: 'cl', ml: 'ml' }
        },
        gewicht: {
            units: ['ton', 'kg', 'hg', 'dag', 'g', 'dg', 'cg', 'mg'],
            factors: { ton: 1000000, kg: 1000, hg: 100, dag: 10, g: 1, dg: 0.1, cg: 0.01, mg: 0.001 },
            labels: { ton: 'ton', kg: 'kg', hg: 'hg', dag: 'dag', g: 'g', dg: 'dg', cg: 'cg', mg: 'mg' }
        }
    };

    function readSettingsMetriek() {
        var cat = metCatHidden ? metCatHidden.value : 'lengte';
        var unitContainerId = 'metUnits' + cat.charAt(0).toUpperCase() + cat.slice(1);
        var container = document.getElementById(unitContainerId);
        var activeUnits = [];
        if (container) {
            container.querySelectorAll('.wb-toggle-wide.active[data-metunit]').forEach(function (b) {
                activeUnits.push(b.getAttribute('data-metunit'));
            });
        }
        if (activeUnits.length < 2) {
            var allUnits = metricUnits[cat].units;
            activeUnits = [allUnits[0], allUnits[1]];
        }

        return {
            title: document.getElementById('wbTitle').value.trim() || 'Rekenwerkblad',
            date: getFormattedDate(),
            datePrefix: getDatePrefix(),
            showName: document.getElementById('wbNameField').value === 'ja',
            count: Math.max(1, Math.min(200, parseInt(metCountInput.value) || 75)),
            category: cat,
            units: activeUnits,
            level: document.getElementById('wbMetLevel').value || 'makkelijk',
            answerSheet: document.getElementById('wbMetAnswerSheet').checked
        };
    }

    function generateMetricSums(settings) {
        var sums = [];
        var used = {};
        var cat = metricUnits[settings.category];
        var units = settings.units;
        var maxAttempts = settings.count * 300;
        var attempts = 0;

        // Determine step size based on category
        var stepFactor = settings.category === 'oppervlakte' ? 100 : 10;

        while (sums.length < settings.count && attempts < maxAttempts) {
            attempts++;

            // Pick two different units
            var fromIdx = Math.floor(Math.random() * units.length);
            var toIdx = Math.floor(Math.random() * units.length);
            if (fromIdx === toIdx) continue;
            var fromUnit = units[fromIdx];
            var toUnit = units[toIdx];

            // Calculate steps between units
            var fromPos = cat.units.indexOf(fromUnit);
            var toPos = cat.units.indexOf(toUnit);
            var steps = Math.abs(toPos - fromPos);

            // Limit steps based on difficulty
            if (settings.level === 'makkelijk' && steps > 2) continue;
            if (settings.level === 'gemiddeld' && steps > 4) continue;
            // moeilijk: no limit

            // Generate value based on difficulty
            var value;
            var convFactor = cat.factors[fromUnit] / cat.factors[toUnit];

            if (settings.level === 'makkelijk') {
                // Simple whole numbers
                var maxVal = toPos > fromPos ? 100 : 10;
                value = Math.floor(Math.random() * maxVal) + 1;
            } else if (settings.level === 'gemiddeld') {
                // Allow some decimals (1 decimal place)
                if (Math.random() < 0.4 && toPos < fromPos) {
                    value = Math.floor(Math.random() * 90 + 10) / 10; // 1.0 - 9.9
                } else {
                    value = Math.floor(Math.random() * 50) + 1;
                }
            } else {
                // Moeilijk: decimals and larger numbers
                if (Math.random() < 0.5) {
                    value = Math.floor(Math.random() * 900 + 100) / 100; // 1.00 - 9.99
                } else {
                    value = Math.floor(Math.random() * 500) + 1;
                }
            }

            // Calculate answer
            var answer = value * convFactor;

            // Round to avoid floating point issues
            answer = Math.round(answer * 1e10) / 1e10;

            // Skip very large or very small answers
            if (answer > 999999 || answer < 0.001) continue;
            if (answer === 0) continue;

            // Skip duplicates
            var key = value + fromUnit + toUnit;
            if (used[key]) continue;
            used[key] = true;

            sums.push({
                value: value,
                fromUnit: fromUnit,
                toUnit: toUnit,
                answer: answer,
                op: 'metric'
            });
        }

        return sums;
    }

    // Format metric number nicely (remove trailing zeros, use comma for Dutch)
    function formatMetric(n) {
        if (Number.isInteger(n)) return n.toString();
        // Show up to 6 decimals, trim trailing zeros
        var str = parseFloat(n.toFixed(6)).toString();
        return str.replace('.', ',');
    }

    function formatMetricDisplay(n) {
        var str = formatMetric(n);
        return str;
    }

    var generatedMetric = [];

    function renderMetricPreview(settings, sums) {
        var html = '';
        var perPage = METRIC_PER_PAGE;
        var previewSums = sums.slice(0, perPage);

        html += '<div class="wb-preview-page">';
        html += buildHeaderHtml(settings, false);
        html += renderMetricGrid(previewSums, false, settings);
        html += '<div class="wb-preview-footer">Meester Tools</div>';
        html += '</div>';

        if (settings.answerSheet) {
            html += '<div class="wb-preview-page">';
            html += buildHeaderHtml(settings, true);
            html += renderMetricGrid(previewSums, true, settings);
            html += '<div class="wb-preview-footer">Meester Tools</div>';
            html += '</div>';
        }

        previewEl.innerHTML = html;
        previewSection.style.display = '';
    }

    function renderMetricGrid(sums, showAnswers, settings) {
        var layout = arrangeInBlocks(sums, 3);
        var cat = metricUnits[settings.category];

        // Calculate max widths
        var maxValue = 0, maxUnit1 = 0, maxUnit2 = 0, maxAnswer = 0;
        for (var i = 0; i < sums.length; i++) {
            var s = sums[i];
            maxValue = Math.max(maxValue, formatMetricDisplay(s.value).length);
            maxUnit1 = Math.max(maxUnit1, (cat.labels[s.fromUnit] || s.fromUnit).length);
            maxUnit2 = Math.max(maxUnit2, (cat.labels[s.toUnit] || s.toUnit).length);
            maxAnswer = Math.max(maxAnswer, formatMetricDisplay(s.answer).length);
        }

        var colVal = Math.max(maxValue, 3) + 'ch';
        var colU1 = Math.max(maxUnit1, 2) + 1 + 'ch';
        var colEq = '1.5ch';
        var colAns = showAnswers ? Math.max(maxAnswer, 3) + 'ch' : '4ch';
        var colU2 = Math.max(maxUnit2, 2) + 1 + 'ch';
        var gridCols = colVal + ' ' + colU1 + ' ' + colEq + ' ' + colAns + ' ' + colU2;

        var html = '<div class="wb-preview-blocks wb-preview-blocks-3">';

        for (var r = 0; r < layout.rows; r++) {
            for (var c = 0; c < layout.cols; c++) {
                var block = layout.grid[r][c];
                html += '<div class="wb-preview-block">';
                for (var i = 0; i < block.length; i++) {
                    var s = block[i].sum;
                    html += '<div class="wb-preview-sum" style="grid-template-columns:' + gridCols + ';">';
                    html += '<span class="wb-preview-a">' + escapeHtml(formatMetricDisplay(s.value)) + '</span>';
                    html += '<span class="wb-preview-op">' + escapeHtml(cat.labels[s.fromUnit] || s.fromUnit) + '</span>';
                    html += '<span class="wb-preview-eq">=</span>';
                    if (showAnswers) {
                        html += '<span class="wb-preview-answer">' + escapeHtml(formatMetricDisplay(s.answer)) + '</span>';
                    } else {
                        html += '<span class="wb-preview-line">___</span>';
                    }
                    html += '<span class="wb-preview-op">' + escapeHtml(cat.labels[s.toUnit] || s.toUnit) + '</span>';
                    html += '</div>';
                }
                html += '</div>';
            }
        }
        html += '</div>';
        return html;
    }

    function generateMetricPdfPage(doc, settings, sums, isAnswers) {
        var pageW = 210;
        var margin = 15;
        var contentW = pageW - margin * 2;
        var cat = metricUnits[settings.category];

        // Title
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(50, 50, 70);
        var titleText = settings.title;
        if (isAnswers) titleText += ' - Antwoordblad';
        doc.text(titleText, margin, 12);

        if (settings.showName) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 100, 110);
            doc.text('Naam: ___________________________', pageW - margin, 12, { align: 'right' });
        }

        var yPos = 18;
        if (settings.date) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 100, 110);
            var dateDisplay = settings.datePrefix ? settings.datePrefix + ' ' + settings.date : settings.date;
            doc.text(dateDisplay, margin, yPos);
            yPos += 6;
        }

        var yStart = yPos + 8;

        // Layout: 3 columns
        var numCols = 3;
        var layout = arrangeInBlocks(sums, numCols);
        var lineH = 7;
        var blockGap = 6;
        var colGap = 6;
        var colW = (contentW - colGap * (numCols - 1)) / numCols;

        // Measure column widths
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        var valW = 0, u1W = 0, u2W = 0, ansW = 0;
        for (var si = 0; si < sums.length; si++) {
            var tw;
            tw = doc.getTextWidth(formatMetricDisplay(sums[si].value));
            if (tw > valW) valW = tw;
            tw = doc.getTextWidth(cat.labels[sums[si].fromUnit] || sums[si].fromUnit);
            if (tw > u1W) u1W = tw;
            tw = doc.getTextWidth(cat.labels[sums[si].toUnit] || sums[si].toUnit);
            if (tw > u2W) u2W = tw;
            tw = doc.getTextWidth(formatMetricDisplay(sums[si].answer));
            if (tw > ansW) ansW = tw;
        }
        valW += 1;
        u1W += 1;
        u2W += 1;
        ansW += 1;
        var eqW = 4;
        var blankW = doc.getTextWidth('____') + 1;

        var y = yStart;

        for (var r = 0; r < layout.rows; r++) {
            for (var c = 0; c < layout.cols; c++) {
                var block = layout.grid[r][c];
                if (block.length === 0) continue;
                var colX = margin + c * (colW + colGap);

                for (var i = 0; i < block.length; i++) {
                    var s = block[i].sum;
                    var currentY = y + i * lineH;

                    if (currentY > 280) {
                        doc.addPage();
                        y = margin + 8;
                        currentY = y + i * lineH;
                    }

                    doc.setFontSize(10);
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(50, 50, 70);

                    var xPos = colX;

                    // Value (right-aligned)
                    doc.text(formatMetricDisplay(s.value), xPos + valW, currentY, { align: 'right' });
                    xPos += valW;

                    // From unit
                    doc.text(' ' + (cat.labels[s.fromUnit] || s.fromUnit), xPos, currentY);
                    xPos += u1W + 1;

                    // = sign
                    doc.text('=', xPos + eqW / 2, currentY, { align: 'center' });
                    xPos += eqW;

                    // Answer or blank
                    if (isAnswers) {
                        doc.setFont('helvetica', 'bold');
                        doc.setTextColor(108, 99, 255);
                        doc.text(formatMetricDisplay(s.answer), xPos + ansW, currentY, { align: 'right' });
                    } else {
                        doc.setDrawColor(200, 200, 210);
                        doc.setLineWidth(0.3);
                        doc.line(xPos + ansW - blankW, currentY, xPos + ansW, currentY);
                    }
                    xPos += ansW;

                    // To unit
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(50, 50, 70);
                    doc.text(' ' + (cat.labels[s.toUnit] || s.toUnit), xPos, currentY);
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

        var previewSums = sums.slice(0, CONV_PER_PAGE);
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
        var layout = arrangeInBlocks(sums);

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
        var colEq1 = '2.5ch';
        var colEq2 = '1.5ch';
        var colPct = Math.max(maxPct, 5) + 'ch';
        var colKomma = Math.max(maxKomma, 5) + 'ch';
        var gridCols = colBreuk + ' ' + colEq1 + ' ' + colPct + ' ' + colEq2 + ' ' + colKomma;

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

        // Block layout: 2 columns, blocks of 5
        var layout = arrangeInBlocks(sums);
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
            // Handle Unicode fraction chars for width calculation
            var pctStr = sums[si].procent;
            if (/\u2153/.test(pctStr)) {
                // e.g. '33⅓' → measure '33' + mini fraction width + '%'
                var cleanNum = pctStr.replace(/\u2153/, '');
                doc.setFontSize(7);
                var miniFW = Math.max(doc.getTextWidth('1'), doc.getTextWidth('3')) + 1.5;
                doc.setFontSize(11);
                tw = doc.getTextWidth(cleanNum) + miniFW + doc.getTextWidth('%') + 1;
            } else {
                tw = doc.getTextWidth(pctStr + '%');
            }
            if (tw > pctW) pctW = tw;
            tw = doc.getTextWidth(sums[si].komma);
            if (tw > kommaW) kommaW = tw;
        }
        breukW += 2;
        pctW += 1;
        kommaW += 1;
        var eqW1 = 6; // meer ruimte na eerste =
        var eqW2 = 4;
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

                    // = sign (eerste, met extra ruimte)
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(50, 50, 70);
                    doc.text('=', xPos + eqW1 / 2, currentY, { align: 'center' });
                    xPos += eqW1;

                    // Procent
                    var pctSymW = doc.getTextWidth('%');
                    if (s.given === 1) {
                        drawPercentPdf(doc, s.procent, xPos + pctW, currentY, [50, 50, 70], 'normal');
                    } else if (isAnswers) {
                        drawPercentPdf(doc, s.procent, xPos + pctW, currentY, [108, 99, 255], 'bold');
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

                    // = sign (tweede)
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(50, 50, 70);
                    doc.text('=', xPos + eqW2 / 2, currentY, { align: 'center' });
                    xPos += eqW2;

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
            generatedFractions = [];
            generatedMetric = [];
            renderPreview(currentSettings, generatedSums);
        } else if (currentType === 'staartdelingen') {
            currentSettings = readSettingsStaartdelingen();
            generatedDivisions = generateLongDivisions(currentSettings);
            generatedSums = [];
            generatedCijfer = [];
            generatedPercent = [];
            generatedFractions = [];
            generatedMetric = [];
            renderLdPreview(currentSettings, generatedDivisions);
        } else if (currentType === 'cijferen') {
            currentSettings = readSettingsCijferen();
            generatedCijfer = generateCijferSums(currentSettings);
            generatedSums = [];
            generatedDivisions = [];
            generatedPercent = [];
            generatedFractions = [];
            generatedMetric = [];
            renderCfPreview(currentSettings, generatedCijfer);
        } else if (currentType === 'breuken') {
            currentSettings = getFracSettings();
            generatedSums = [];
            generatedDivisions = [];
            generatedCijfer = [];
            generatedPercent = [];
            generatedMetric = [];
            if (currentSettings.fracType === 'vereenvoudigen') {
                generatedFractions = generateSimplSums(currentSettings);
            } else if (currentSettings.fracType === 'helen') {
                generatedFractions = generateHelenSums(currentSettings);
            } else {
                generatedFractions = generateFracSums(currentSettings);
            }
            renderFracPreview(currentSettings, generatedFractions);
        } else if (currentType === 'metriek') {
            currentSettings = readSettingsMetriek();
            generatedSums = [];
            generatedDivisions = [];
            generatedCijfer = [];
            generatedPercent = [];
            generatedFractions = [];
            generatedMetric = generateMetricSums(currentSettings);
            renderMetricPreview(currentSettings, generatedMetric);
        } else if (currentType === 'procenten') {
            currentSettings = readSettingsPercent();
            generatedSums = [];
            generatedDivisions = [];
            generatedCijfer = [];
            generatedFractions = [];
            generatedMetric = [];
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
        if (generatedSums.length === 0 && generatedDivisions.length === 0 && generatedCijfer.length === 0 && generatedPercent.length === 0 && generatedFractions.length === 0 && generatedMetric.length === 0) return;
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
            var perPage = isConv ? CONV_PER_PAGE : SUMS_PER_PAGE;
            var pctPages = Math.ceil(generatedPercent.length / perPage);
            for (var p = 0; p < pctPages; p++) {
                if (p > 0) doc.addPage();
                var pageSums = generatedPercent.slice(p * perPage, (p + 1) * perPage);
                pdfFn(doc, currentSettings, pageSums, false);
            }
            if (currentSettings.answerSheet) {
                for (var p = 0; p < pctPages; p++) {
                    doc.addPage();
                    var pageSums = generatedPercent.slice(p * perPage, (p + 1) * perPage);
                    pdfFn(doc, currentSettings, pageSums, true);
                }
            }
            var filename = 'werkblad-procenten-' + new Date().toISOString().slice(0, 10) + '.pdf';
            doc.save(filename);
        } else if (generatedMetric.length > 0) {
            var metPages = Math.ceil(generatedMetric.length / METRIC_PER_PAGE);
            for (var p = 0; p < metPages; p++) {
                if (p > 0) doc.addPage();
                var pageSums = generatedMetric.slice(p * METRIC_PER_PAGE, (p + 1) * METRIC_PER_PAGE);
                generateMetricPdfPage(doc, currentSettings, pageSums, false);
            }
            if (currentSettings.answerSheet) {
                for (var p = 0; p < metPages; p++) {
                    doc.addPage();
                    var pageSums = generatedMetric.slice(p * METRIC_PER_PAGE, (p + 1) * METRIC_PER_PAGE);
                    generateMetricPdfPage(doc, currentSettings, pageSums, true);
                }
            }
            var filename = 'werkblad-metriek-' + new Date().toISOString().slice(0, 10) + '.pdf';
            doc.save(filename);
        } else if (generatedFractions.length > 0) {
            var fracPerPage = currentSettings.fracType === 'rekenen' ? FRAC_CALC_PER_PAGE : FRAC_SIMPLE_PER_PAGE;
            var fracPages = Math.ceil(generatedFractions.length / fracPerPage);
            for (var p = 0; p < fracPages; p++) {
                if (p > 0) doc.addPage();
                var pageSums = generatedFractions.slice(p * fracPerPage, (p + 1) * fracPerPage);
                generateFracPdfPage(doc, currentSettings, pageSums, false);
            }
            if (currentSettings.answerSheet) {
                for (var p = 0; p < fracPages; p++) {
                    doc.addPage();
                    var pageSums = generatedFractions.slice(p * fracPerPage, (p + 1) * fracPerPage);
                    generateFracPdfPage(doc, currentSettings, pageSums, true);
                }
            }
            var filename = 'werkblad-breuken-' + new Date().toISOString().slice(0, 10) + '.pdf';
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

    // Draw percentage text in PDF, handling Unicode fraction chars like ⅓
    // rightX = right edge, baseY = text baseline, pctText = e.g. '33⅓'
    function drawPercentPdf(doc, pctText, rightX, baseY, color, fontStyle) {
        doc.setFont('helvetica', fontStyle || 'normal');
        doc.setTextColor(color[0], color[1], color[2]);

        // Check for Unicode vulgar fraction ⅓ (U+2153)
        var fracMatch = pctText.match(/^(\d+)\u2153$/);
        if (fracMatch) {
            var mainNum = fracMatch[1];
            doc.setFontSize(11);
            var pctSymW = doc.getTextWidth('%');
            // Draw "%" at rightX
            doc.text('%', rightX, baseY, { align: 'right' });
            // Draw mini fraction "1/3" before %
            var miniSize = 7;
            doc.setFontSize(miniSize);
            var miniNumW = doc.getTextWidth('1');
            var miniDenW = doc.getTextWidth('3');
            var miniFracW = Math.max(miniNumW, miniDenW) + 1;
            var fracRightX = rightX - pctSymW - 0.5;
            var fracCenterX = fracRightX - miniFracW / 2;
            // Numerator
            doc.text('1', fracCenterX, baseY - 2.5, { align: 'center' });
            // Fraction line
            doc.setDrawColor(color[0], color[1], color[2]);
            doc.setLineWidth(0.3);
            doc.line(fracCenterX - miniFracW / 2, baseY - 1, fracCenterX + miniFracW / 2, baseY - 1);
            // Denominator
            doc.text('3', fracCenterX, baseY + 1.5, { align: 'center' });
            // Draw main number before fraction
            doc.setFontSize(11);
            doc.text(mainNum, fracRightX - miniFracW - 0.5, baseY, { align: 'right' });
            doc.setFontSize(11);
        } else {
            doc.setFontSize(11);
            doc.text(pctText + '%', rightX, baseY, { align: 'right' });
        }
    }

    // Draw fraction or mixed number in PDF
    // If num >= den, shows as whole + fraction (e.g. 2 1/3)
    function drawMixedFracPdf(doc, num, den, rightX, baseY, color) {
        if (den === 1) {
            doc.setFontSize(11);
            doc.setFont('helvetica', color[0] === 108 ? 'bold' : 'normal');
            doc.setTextColor(color[0], color[1], color[2]);
            doc.text(String(num), rightX, baseY, { align: 'right' });
            return;
        }
        if (num < den) {
            drawFractionPdf(doc, num + '/' + den, rightX, baseY, color);
            return;
        }
        var whole = Math.floor(num / den);
        var rest = num % den;
        if (rest === 0) {
            doc.setFontSize(11);
            doc.setFont('helvetica', color[0] === 108 ? 'bold' : 'normal');
            doc.setTextColor(color[0], color[1], color[2]);
            doc.text(String(whole), rightX, baseY, { align: 'right' });
            return;
        }
        // Draw fraction part first (right-aligned at rightX)
        doc.setFontSize(9);
        var numW = doc.getTextWidth(String(rest));
        var denW = doc.getTextWidth(String(den));
        var fracW = Math.max(numW, denW) + 2;
        drawFractionPdf(doc, rest + '/' + den, rightX, baseY, color);
        // Draw whole number to the left of fraction
        doc.setFontSize(11);
        doc.setFont('helvetica', color[0] === 108 ? 'bold' : 'normal');
        doc.setTextColor(color[0], color[1], color[2]);
        doc.text(String(whole) + ' ', rightX - fracW, baseY, { align: 'right' });
    }

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

            // Placeholder dots for num and den
            doc.setFontSize(9);
            doc.setTextColor(200, 200, 210);
            doc.text('...', centerX, baseY - 3, { align: 'center' });
            doc.text('...', centerX, baseY + 1.5, { align: 'center' });
            doc.setTextColor(0, 0, 0);
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
        if (isBlank) {
            return '<span class="wb-frac wb-frac-blank">' +
                '<span class="wb-frac-num">...</span>' +
                '<span class="wb-frac-den">...</span>' +
                '</span>';
        }
        return '<span class="wb-frac">' +
            '<span class="wb-frac-num">' + escapeHtml(parts[0]) + '</span>' +
            '<span class="wb-frac-den">' + escapeHtml(parts[1]) + '</span>' +
            '</span>';
    }
});

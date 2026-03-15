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

    // ---------- Type Cards ----------
    var typeCards = document.querySelectorAll('.wb-type-card[data-sptype]');
    typeCards.forEach(function (card) {
        card.addEventListener('click', function () {
            typeCards.forEach(function (c) { c.classList.remove('active'); });
            this.classList.add('active');
            currentSpType = this.getAttribute('data-sptype');
            updateSpSettingsVisibility();
        });
    });

    function updateSpSettingsVisibility() {
        if (settingsWerkwoordspelling) settingsWerkwoordspelling.style.display = 'none';
        if (settingsSpelling) settingsSpelling.style.display = 'none';
        if (previewSection) previewSection.style.display = 'none';

        if (currentSpType === 'werkwoordspelling') {
            if (settingsWerkwoordspelling) settingsWerkwoordspelling.style.display = '';
        } else if (currentSpType === 'spelling') {
            if (settingsSpelling) settingsSpelling.style.display = '';
        }
    }

    // ---------- Name Field Switch ----------
    var nameFieldBtns = document.querySelectorAll('.wb-switch-btn[data-spnamefield]');
    var nameFieldHidden = document.getElementById('wbSpNameField');

    nameFieldBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            nameFieldBtns.forEach(function (b) { b.classList.remove('active'); });
            this.classList.add('active');
            nameFieldHidden.value = this.getAttribute('data-spnamefield');
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
        });
    });

});

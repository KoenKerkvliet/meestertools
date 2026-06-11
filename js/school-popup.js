/* ============================================
   MEESTERTOOLS - School-popup
   Versie: v0.0.1

   Gebruikers hoeven bij registratie geen school op te geven. Om toch
   zicht te krijgen op welke scholen Meestertools gebruiken, vraagt het
   dashboard er via een popup om zolang profiles.school_id leeg is.

   - "Opslaan" koppelt een bestaande school of maakt een nieuwe aan
     (via window._resolveSchoolId uit instellingen.js).
   - "Niet nu" sluit de popup; bij een volgende login komt de vraag terug.
   - Wacht op de schooljaar-archief check (window.mtSchooljaarPopupShown)
     zodat er nooit twee popups tegelijk staan.

   Laadt na supabase-config.js + instellingen.js + schooljaar-archief.js.
   ============================================ */

(function () {
    if (typeof supabase === 'undefined') return;

    function escapeHtml(str) {
        var div = document.createElement('div');
        div.textContent = str == null ? '' : String(str);
        return div.innerHTML;
    }

    async function init() {
        if (!document.querySelector('.dashboard-content')) return;

        try {
            // Eerst de schooljaar-popup laten beslissen; toont die zich,
            // dan stellen we de schoolvraag pas bij een volgende login.
            if (window.mtSchooljaarPopupShown) {
                var archiefShown = await window.mtSchooljaarPopupShown;
                if (archiefShown) return;
            }

            var sessionRes = await supabase.auth.getSession();
            var session = sessionRes && sessionRes.data ? sessionRes.data.session : null;
            if (!session) return;

            var profRes = await supabase
                .from('profiles')
                .select('school_id')
                .eq('id', session.user.id)
                .single();
            if (!profRes.data || profRes.data.school_id) return;

            // Suggesties van bestaande scholen voor de autocomplete
            var schoolsRes = await supabase
                .from('schools')
                .select('name, city')
                .eq('archived', false)
                .order('name');

            showModal(schoolsRes.data || [], session.user.id);
        } catch (e) {
            // Popup is een extraatje; fouten mogen het dashboard niet breken.
            console.error('School-popup check mislukt:', e);
        }
    }

    function showModal(schools, userId) {
        var overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = 'schoolPopupModal';
        overlay.innerHTML =
            '<div class="modal sj-archief-modal sj-school-modal">' +
                '<div class="modal-header">' +
                    '<h2>&#127979; Op welke school werk je?</h2>' +
                    '<button class="modal-close" id="schoolPopupClose" title="Niet nu">&times;</button>' +
                '</div>' +
                '<div class="modal-body">' +
                    '<p class="sj-intro">Je profiel is bijna compleet! Vul de naam van je school in &mdash; ' +
                    'zo weten we welke scholen Meestertools gebruiken.</p>' +
                    '<div class="sj-form-group">' +
                        '<label for="schoolPopupNaam">School</label>' +
                        '<input type="text" id="schoolPopupNaam" placeholder="Naam van je school" list="schoolPopupSuggesties" autocomplete="off">' +
                        '<datalist id="schoolPopupSuggesties">' +
                        schools.map(function (s) {
                            return '<option value="' + escapeHtml(s.name) + '">' + escapeHtml(s.city || '') + '</option>';
                        }).join('') +
                        '</datalist>' +
                    '</div>' +
                    '<div class="sj-form-group">' +
                        '<label for="schoolPopupPlaats">Plaats van de school</label>' +
                        '<input type="text" id="schoolPopupPlaats" placeholder="Bijv. Zwolle">' +
                    '</div>' +
                    '<p class="sj-note">Je kunt dit later altijd aanpassen via Instellingen &rarr; Profiel.</p>' +
                    '<div class="sj-error" id="schoolPopupError"></div>' +
                '</div>' +
                '<div class="modal-footer">' +
                    '<button class="btn-cancel" id="schoolPopupNietNu">Niet nu</button>' +
                    '<button class="btn-primary" id="schoolPopupOpslaan">Opslaan</button>' +
                '</div>' +
            '</div>';

        document.body.appendChild(overlay);
        requestAnimationFrame(function () { overlay.classList.add('active'); });

        function close() {
            overlay.classList.remove('active');
            setTimeout(function () { overlay.remove(); }, 300);
        }

        function showError(msg) {
            var el = overlay.querySelector('#schoolPopupError');
            el.textContent = msg;
            el.style.display = 'block';
        }

        // Niet nu / kruisje: sluiten, bij een volgende login opnieuw vragen.
        overlay.querySelector('#schoolPopupClose').addEventListener('click', close);
        overlay.querySelector('#schoolPopupNietNu').addEventListener('click', close);

        overlay.querySelector('#schoolPopupOpslaan').addEventListener('click', async function () {
            var name = overlay.querySelector('#schoolPopupNaam').value.trim();
            var city = overlay.querySelector('#schoolPopupPlaats').value.trim();

            if (!name) {
                showError('Vul de naam van je school in, of kies "Niet nu".');
                return;
            }

            var btn = overlay.querySelector('#schoolPopupOpslaan');
            btn.disabled = true;
            btn.textContent = 'Opslaan...';

            try {
                var schoolId = await window._resolveSchoolId(name, city);
                var res = await supabase
                    .from('profiles')
                    .update({ school_id: schoolId })
                    .eq('id', userId);
                if (res.error) throw res.error;
                close();
            } catch (e) {
                console.error('School opslaan mislukt:', e);
                btn.disabled = false;
                btn.textContent = 'Opslaan';
                showError('Opslaan is niet gelukt. Probeer het later opnieuw via Instellingen.');
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

/* ============================================
   MEESTERTOOLS - Schooljaar-archief popup
   Versie: v0.0.1

   Het schooljaar start op 1 augustus. Wie op of na die datum inlogt
   en nog niet-gearchiveerde groepen van vóór 1 augustus heeft, krijgt
   op het dashboard één keer per schooljaar de vraag of die groepen
   gearchiveerd mogen worden.

   - Antwoord wordt bewaard in profiles.archive_prompt_seen_year
     (startjaar van het schooljaar), zodat de vraag op elk apparaat
     maar één keer per schooljaar gesteld wordt.
   - Sluiten via het kruisje = "niet nu": de vraag komt bij een
     volgende login gewoon terug.
   - Gearchiveerde groepen zijn te herstellen via Instellingen -> Mijn klas.

   Laadt na supabase-config.js + app.js + active-class.js.
   ============================================ */

(function () {
    // Andere dashboard-popups (zoals de school-popup) wachten hierop,
    // zodat er nooit twee popups tegelijk verschijnen.
    var resolveShown;
    window.mtSchooljaarPopupShown = new Promise(function (r) { resolveShown = r; });

    // Alleen op het dashboard, en alleen als Supabase beschikbaar is.
    if (typeof supabase === 'undefined') { resolveShown(false); return; }

    // 1 augustus van het huidige schooljaar (startjaar = vorig kalenderjaar
    // als we vóór augustus zitten). getMonth() is 0-based: 7 = augustus.
    function schoolYearStart(now) {
        var y = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
        return new Date(y, 7, 1);
    }

    function escapeHtml(str) {
        var div = document.createElement('div');
        div.textContent = str == null ? '' : String(str);
        return div.innerHTML;
    }

    async function init() {
        if (!document.querySelector('.dashboard-content')) return;

        try {
            var sessionRes = await supabase.auth.getSession();
            var session = sessionRes && sessionRes.data ? sessionRes.data.session : null;
            if (!session) return;

            var start = schoolYearStart(new Date());
            var startYear = start.getFullYear();

            // Dit schooljaar al beantwoord? Dan niets doen.
            var profRes = await supabase
                .from('profiles')
                .select('archive_prompt_seen_year')
                .eq('id', session.user.id)
                .single();
            if (profRes.data && profRes.data.archive_prompt_seen_year >= startYear) return;

            // Niet-gearchiveerde groepen van vóór dit schooljaar.
            var groupRes = await supabase
                .from('groups')
                .select('id, name, created_at')
                .eq('user_id', session.user.id)
                .eq('archived', false)
                .lt('created_at', start.toISOString())
                .order('name');
            var oldGroups = groupRes.data || [];
            if (!oldGroups.length) return;

            showModal(oldGroups, startYear, session.user.id);
            return true;
        } catch (e) {
            // Popup is een extraatje; fouten mogen het dashboard niet breken.
            console.error('Schooljaar-archief check mislukt:', e);
        }
        return false;
    }

    function showModal(oldGroups, startYear, userId) {
        var label = startYear + '-' + (startYear + 1);

        var overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = 'sjArchiefModal';
        overlay.innerHTML =
            '<div class="modal sj-archief-modal">' +
                '<div class="modal-header">' +
                    '<h2>&#127891; Nieuw schooljaar!</h2>' +
                    '<button class="modal-close" id="sjArchiefClose" title="Niet nu">&times;</button>' +
                '</div>' +
                '<div class="modal-body">' +
                    '<p class="sj-intro">Het schooljaar ' + label + ' is begonnen. Wil je de ' +
                    (oldGroups.length === 1 ? 'groep van vorig schooljaar' : 'groepen van vorig schooljaar') +
                    ' archiveren?</p>' +
                    '<div class="sj-groep-list">' +
                    oldGroups.map(function (g) {
                        return '<label class="sj-groep-row">' +
                            '<input type="checkbox" value="' + g.id + '" checked>' +
                            '<span>' + escapeHtml(g.name) + '</span>' +
                        '</label>';
                    }).join('') +
                    '</div>' +
                    '<p class="sj-note">Gearchiveerde groepen verdwijnen uit je tools, maar je raakt niets kwijt: ' +
                    'via Instellingen &rarr; Mijn klas kun je ze altijd terugzetten.</p>' +
                '</div>' +
                '<div class="modal-footer">' +
                    '<button class="btn-cancel" id="sjArchiefNee">Nee, bewaren</button>' +
                    '<button class="btn-primary" id="sjArchiefJa">Archiveren</button>' +
                '</div>' +
            '</div>';

        document.body.appendChild(overlay);
        // Eerst in de DOM, dan activeren voor de fade-in transitie.
        requestAnimationFrame(function () { overlay.classList.add('active'); });

        function close() {
            overlay.classList.remove('active');
            setTimeout(function () { overlay.remove(); }, 300);
        }

        async function markSeen() {
            try {
                await supabase
                    .from('profiles')
                    .update({ archive_prompt_seen_year: startYear })
                    .eq('id', userId);
            } catch (e) { /* volgende login opnieuw vragen is geen ramp */ }
        }

        // Kruisje = niet nu: niets opslaan, volgende login opnieuw vragen.
        overlay.querySelector('#sjArchiefClose').addEventListener('click', close);

        // Nee = bewaren en dit schooljaar niet meer vragen.
        overlay.querySelector('#sjArchiefNee').addEventListener('click', async function () {
            await markSeen();
            close();
        });

        overlay.querySelector('#sjArchiefJa').addEventListener('click', async function () {
            var ids = Array.prototype.slice
                .call(overlay.querySelectorAll('.sj-groep-list input:checked'))
                .map(function (cb) { return cb.value; });

            var btn = overlay.querySelector('#sjArchiefJa');
            btn.disabled = true;
            btn.textContent = 'Bezig...';

            try {
                if (ids.length) {
                    var res = await supabase
                        .from('groups')
                        .update({ archived: true })
                        .in('id', ids)
                        .eq('user_id', userId);
                    if (res.error) throw res.error;

                    // Was de actieve klas net gearchiveerd? Dan wissen.
                    if (window.MTActiveClass && ids.indexOf(window.MTActiveClass.getId()) !== -1) {
                        window.MTActiveClass.setId('');
                    }
                }
                await markSeen();
                // Herladen zodat o.a. de klas-kiezer in de header meteen klopt.
                window.location.reload();
            } catch (e) {
                console.error('Archiveren mislukt:', e);
                btn.disabled = false;
                btn.textContent = 'Archiveren';
                alert('Archiveren is niet gelukt. Probeer het later opnieuw.');
            }
        });
    }

    function run() {
        init().then(function (shown) { resolveShown(!!shown); })
              .catch(function () { resolveShown(false); });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run);
    } else {
        run();
    }
})();

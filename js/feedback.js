/* ============================================
   MEESTERTOOLS - Feedback-popup
   Versie: v1.0.0

   Vraagt een leerkracht op het dashboard hoe Meestertools bevalt: eerst een
   beoordeling van 1 tot 5 sterren, daarna een optionele toelichting.

   - Wanneer er gevraagd wordt bepaalt de database (rpc feedback_moet_vragen):
     twee weken na aanmelden, een klas aangemaakt, hoogstens eens per 90 dagen.
   - De popup heeft bewust geen kruisje en reageert niet op Escape of een klik
     ernaast: hij gaat alleen weg met een beoordeling, of met "Later" (dan
     komt hij over 7 dagen terug). Daarom staat hij alleen op het dashboard en
     nooit in een tool: daar staat vaak een digibord aan voor de klas.
   - De sterren worden meteen opgeslagen. Sluit iemand daarna de pagina zonder
     toelichting, dan is de beoordeling er toch.
   - Beoordelingen staan in public.feedback; beheer.html leest ze mee.
   - Wacht op de andere dashboard-popups (schooljaar-archief, school-popup).

   Testen als super admin zonder iets op te slaan: dashboard?feedback-test

   Laadt na supabase-config.js + schooljaar-archief.js + school-popup.js.
   ============================================ */

(function () {
    'use strict';

    if (typeof supabase === 'undefined') return;

    var LABELS = ['Valt tegen', 'Kan beter', 'Prima', 'Goed', 'Geweldig'];
    var COMMENT_MAX = 2000;

    async function init() {
        if (!document.querySelector('.dashboard-content')) return;

        try {
            // Nooit twee popups tegelijk: heeft er al een gestaan, dan wachten
            // we tot een volgend bezoek.
            if (window.mtSchooljaarPopupShown && await window.mtSchooljaarPopupShown) return;
            if (window.mtSchoolPopupShown && await window.mtSchoolPopupShown) return;

            var sessionRes = await supabase.auth.getSession();
            var session = sessionRes && sessionRes.data ? sessionRes.data.session : null;
            if (!session) return;

            var test = /[?&]feedback-test(?:[=&]|$)/.test(location.search);
            if (test) {
                // Proefversie: alleen voor de beheerder, en er wordt niets opgeslagen.
                var profRes = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
                if (!profRes.data || profRes.data.role !== 'super_admin') return;
            } else {
                var res = await supabase.rpc('feedback_moet_vragen');
                if (res.error || res.data !== true) return;
            }

            showModal(session.user.id, test);
        } catch (e) {
            // Een vraag om feedback mag het dashboard nooit breken.
            console.error('Feedback-popup check mislukt:', e);
        }
    }

    function showModal(userId, test) {
        var overlay = document.createElement('div');
        overlay.className = 'modal-overlay feedback-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-labelledby', 'feedbackTitle');

        var stars = '';
        for (var i = 1; i <= 5; i++) {
            stars += '<button type="button" class="feedback-star" data-n="' + i + '" ' +
                'aria-label="' + i + ' van 5 sterren: ' + LABELS[i - 1] + '">&#9733;</button>';
        }

        overlay.innerHTML =
            '<div class="modal feedback-modal">' +
                '<div class="modal-header">' +
                    '<h2 id="feedbackTitle">&#128156; Hoe bevalt Meestertools?</h2>' +
                '</div>' +
                '<div class="modal-body">' +
                    '<div id="feedbackStepStars">' +
                        '<p class="sj-intro">Je gebruikt Meestertools nu een tijdje. Hoeveel sterren geef je het tot nu toe?</p>' +
                        '<div class="feedback-stars" id="feedbackStars">' + stars + '</div>' +
                        '<div class="feedback-star-label" id="feedbackStarLabel" aria-live="polite">&nbsp;</div>' +
                    '</div>' +
                    '<div id="feedbackStepComment" hidden>' +
                        '<label class="feedback-comment-label" for="feedbackComment">Wil je er iets bij vertellen? <span>(niet verplicht)</span></label>' +
                        '<textarea id="feedbackComment" rows="4" maxlength="' + COMMENT_MAX + '" ' +
                            'placeholder="Wat vind je goed aan Meestertools, en wat minder goed? Alles mag: ook wat je mist of wat anders zou kunnen."></textarea>' +
                        '<p class="sj-note">Noem liever geen namen van leerlingen. Alleen de maker van Meestertools leest dit.</p>' +
                    '</div>' +
                    '<div id="feedbackStepThanks" hidden>' +
                        '<p class="feedback-thanks">&#127881; Dank je wel! Hier word ik echt wijzer van.</p>' +
                    '</div>' +
                    '<div class="sj-error" id="feedbackError"></div>' +
                '</div>' +
                '<div class="modal-footer">' +
                    '<button type="button" class="btn-cancel" id="feedbackLater">Later</button>' +
                    '<button type="button" class="btn-primary" id="feedbackSend" hidden>Klaar</button>' +
                    '<button type="button" class="btn-primary" id="feedbackClose" hidden>Sluiten</button>' +
                '</div>' +
            '</div>';

        document.body.appendChild(overlay);
        requestAnimationFrame(function () { overlay.classList.add('active'); });

        var $ = function (id) { return overlay.querySelector('#' + id); };
        var starEls = Array.prototype.slice.call(overlay.querySelectorAll('.feedback-star'));
        var rating = 0;
        var feedbackId = null;
        var saving = false;

        function close() {
            overlay.classList.remove('active');
            setTimeout(function () { overlay.remove(); }, 300);
        }

        function showError(msg) {
            var el = $('feedbackError');
            el.textContent = msg;
            el.style.display = msg ? 'block' : 'none';
        }

        function paint(n) {
            starEls.forEach(function (el, idx) { el.classList.toggle('on', idx < n); });
            $('feedbackStarLabel').textContent = n ? LABELS[n - 1] : ' ';
        }

        starEls.forEach(function (el) {
            var n = parseInt(el.dataset.n, 10);
            el.addEventListener('mouseenter', function () { paint(n); });
            el.addEventListener('focus', function () { paint(n); });
            el.addEventListener('click', function () { rate(n); });
        });
        $('feedbackStars').addEventListener('mouseleave', function () { paint(rating); });
        $('feedbackStars').addEventListener('focusout', function () { paint(rating); });

        // De beoordeling wordt direct opgeslagen; een volgende klik (iemand
        // bedenkt zich) past dezelfde rij aan.
        async function rate(n) {
            if (saving) return;
            saving = true;
            showError('');

            if (!test) {
                var res = feedbackId
                    ? await supabase.from('feedback').update({ rating: n }).eq('id', feedbackId)
                    : await supabase.from('feedback').insert({ user_id: userId, rating: n }).select('id').single();
                if (res.error) {
                    console.error('Feedback opslaan mislukt:', res.error);
                    saving = false;
                    showError('Opslaan is niet gelukt. Probeer het nog een keer.');
                    return;
                }
                if (!feedbackId) feedbackId = res.data.id;
            }

            rating = n;
            saving = false;
            paint(n);

            // Nu er een beoordeling is, hoort "Later" er niet meer bij.
            $('feedbackStepComment').hidden = false;
            $('feedbackLater').hidden = true;
            $('feedbackSend').hidden = false;
            if (!$('feedbackComment').value) $('feedbackComment').focus();
        }

        // "Klaar" als er niets getypt is, "Versturen" zodra er tekst staat.
        $('feedbackComment').addEventListener('input', function () {
            $('feedbackSend').textContent = this.value.trim() ? 'Versturen' : 'Klaar';
        });

        $('feedbackSend').addEventListener('click', async function () {
            var btn = this;
            var comment = $('feedbackComment').value.trim();

            if (comment && !test) {
                btn.disabled = true;
                var res = await supabase.from('feedback').update({ comment: comment }).eq('id', feedbackId);
                btn.disabled = false;
                if (res.error) {
                    console.error('Toelichting opslaan mislukt:', res.error);
                    showError('Versturen is niet gelukt. Probeer het nog een keer.');
                    return;
                }
            }

            showError('');
            $('feedbackStepStars').hidden = true;
            $('feedbackStepComment').hidden = true;
            $('feedbackStepThanks').hidden = false;
            btn.hidden = true;
            $('feedbackClose').hidden = false;
            $('feedbackClose').focus();
            setTimeout(close, 4000);
        });

        $('feedbackClose').addEventListener('click', close);

        // Later: zeven dagen rust. Mislukt dat, dan komt de popup gewoon bij het
        // volgende bezoek terug, en dat is prima.
        $('feedbackLater').addEventListener('click', async function () {
            this.disabled = true;
            if (!test) {
                var res = await supabase.rpc('feedback_uitstellen');
                if (res.error) console.error('Feedback uitstellen mislukt:', res.error);
            }
            close();
        });

        // Focus op het venster zelf, niet op de eerste ster: die zou meteen
        // "Valt tegen" tonen.
        var dialog = overlay.querySelector('.feedback-modal');
        dialog.setAttribute('tabindex', '-1');
        dialog.focus();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

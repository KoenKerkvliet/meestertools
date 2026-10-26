/* ============================================
   MEESTERTOOLS - Beoordeel-pagina (vanuit de feedbackmail)
   Versie: v1.1.0

   Een ster in de feedbackmail is een link: /beoordeel?t=<code>&s=<1-5>.
   Deze pagina zet die ster klaar; de lezer kan hem nog aanpassen, er een
   toelichting bij zetten en slaat pas op met de knop Versturen, via de
   database-functies feedback_via_mail en feedback_mail_toelichting (zonder
   inloggen: de code is de sleutel).

   - Er wordt NOOIT opgeslagen bij het laden. Mailscanners van scholen
     (Microsoft 365) openen elke link in een echte browser en draaien daarbij
     de JavaScript; ze openden alle 5 sterlinks en gaven zo willekeurige
     cijfers (26 okt 2026). Op een knop klikken doen ze niet.
   - t=proef is de proefmail uit beheer: alles werkt, er wordt niets opgeslagen.
   - Geen app.js: deze pagina is bewust openbaar.

   Laadt na supabase-config.js.
   ============================================ */

(function () {
    'use strict';

    var LABELS = ['Valt tegen', 'Kan beter', 'Prima', 'Goed', 'Geweldig'];
    var params = new URLSearchParams(location.search);
    var code = params.get('t') || '';
    var proef = code === 'proef';
    var gekozen = parseInt(params.get('s'), 10);
    if (!(gekozen >= 1 && gekozen <= 5)) gekozen = 0;

    var $ = function (id) { return document.getElementById(id); };
    var rating = 0;
    var saving = false;

    function toon(id, aan) { $(id).hidden = !aan; }

    function fout(msg) {
        var el = $('bdError');
        el.textContent = msg;
        el.style.display = msg ? 'block' : 'none';
    }

    function ongeldig() {
        $('bdIntro').textContent = 'Deze link werkt niet meer.';
        toon('bdSterren', false);
        toon('bdToelichting', false);
        toon('bdOngeldig', true);
    }

    function paint(n) {
        Array.prototype.forEach.call($('bdStars').children, function (el, i) {
            el.classList.toggle('on', i < n);
        });
        $('bdStarLabel').textContent = n ? LABELS[n - 1] : ' ';
    }

    // Ster kiezen: alleen klaarzetten, nog niet opslaan.
    function kies(n) {
        rating = n;
        paint(n);
        fout('');
        $('bdSend').disabled = false;
    }

    function bouwSterren() {
        var html = '';
        for (var i = 1; i <= 5; i++) {
            html += '<button type="button" class="feedback-star" data-n="' + i + '" aria-label="' +
                i + ' van 5 sterren: ' + LABELS[i - 1] + '">&#9733;</button>';
        }
        $('bdStars').innerHTML = html;
        Array.prototype.forEach.call($('bdStars').children, function (el) {
            var n = parseInt(el.dataset.n, 10);
            el.addEventListener('mouseenter', function () { paint(n); });
            el.addEventListener('focus', function () { paint(n); });
            el.addEventListener('click', function () { kies(n); });
        });
        $('bdStars').addEventListener('mouseleave', function () { paint(rating); });
        $('bdStars').addEventListener('focusout', function () { paint(rating); });
    }

    async function rpc(naam, args) {
        try {
            return await supabase.rpc(naam, args);
        } catch (e) {
            return { error: e };
        }
    }

    // Versturen: eerst de sterren, dan (als die er is) de toelichting.
    $('bdSend').addEventListener('click', async function () {
        if (saving || !rating) return;
        var btn = this;
        var tekst = $('bdComment').value.trim();
        saving = true;
        btn.disabled = true;
        fout('');

        if (!proef) {
            var res = await rpc('feedback_via_mail', { p_token: code, p_rating: rating });
            if (res.error) console.error('Beoordeling opslaan mislukt:', res.error);
            if (!res.error && (!res.data || res.data.ok !== true)) {
                saving = false;
                ongeldig();
                return;
            }
            if (!res.error && tekst) {
                res = await rpc('feedback_mail_toelichting', { p_token: code, p_comment: tekst });
                if (res.error) console.error('Toelichting opslaan mislukt:', res.error);
                else if (!res.data || res.data.ok !== true) res = { error: 'niet ok' };
            }
            if (res.error) {
                saving = false;
                btn.disabled = false;
                fout('Versturen is niet gelukt. Probeer het nog een keer.');
                return;
            }
        }

        saving = false;
        toon('bdSterren', false);
        toon('bdToelichting', false);
        toon('bdDank', true);
        $('bdIntro').textContent = ' ';
    });

    function init() {
        if (!code || code.length > 200 || typeof supabase === 'undefined') {
            ongeldig();
            return;
        }
        if (proef) $('bdProef').style.display = 'block';

        bouwSterren();
        $('bdIntro').textContent = gekozen
            ? 'Klopt dit? Klik op Versturen om je beoordeling op te slaan.'
            : 'Hoeveel sterren geef je Meestertools?';
        if (gekozen) kies(gekozen);
        else $('bdSend').disabled = true;
        toon('bdSterren', true);
        toon('bdToelichting', true);
    }

    init();
})();

/* ============================================
   MEESTERTOOLS - Beoordeel-pagina (vanuit de feedbackmail)
   Versie: v1.0.0

   Een ster in de feedbackmail is een link: /beoordeel?t=<code>&s=<1-5>.
   Deze pagina slaat die beoordeling op via de database-functie
   feedback_via_mail (zonder inloggen: de code is de sleutel) en laat de lezer
   daarna de sterren nog aanpassen en er een toelichting bij zetten.

   - De beoordeling wordt pas opgeslagen als de pagina in een browser laadt,
     niet als een mailscanner de link alleen ophaalt.
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
            el.addEventListener('click', function () { rate(n); });
        });
        $('bdStars').addEventListener('mouseleave', function () { paint(rating); });
        $('bdStars').addEventListener('focusout', function () { paint(rating); });
    }

    // Beoordeling opslaan. Een volgende klik (iemand bedenkt zich) past dezelfde
    // beoordeling aan.
    async function rate(n) {
        if (saving) return;
        saving = true;
        fout('');

        if (!proef) {
            var res;
            try {
                res = await supabase.rpc('feedback_via_mail', { p_token: code, p_rating: n });
            } catch (e) {
                res = { error: e };
            }
            if (res.error) {
                console.error('Beoordeling opslaan mislukt:', res.error);
                saving = false;
                fout('Opslaan is niet gelukt. Probeer het nog een keer.');
                return;
            }
            if (!res.data || res.data.ok !== true) {
                saving = false;
                ongeldig();
                return;
            }
        }

        rating = n;
        saving = false;
        paint(n);
        $('bdIntro').textContent = 'Bedankt voor je beoordeling!';
        toon('bdSterren', true);
        toon('bdToelichting', true);
    }

    $('bdComment').addEventListener('input', function () {
        $('bdSend').textContent = this.value.trim() ? 'Versturen' : 'Klaar';
    });

    $('bdSend').addEventListener('click', async function () {
        var btn = this;
        var tekst = $('bdComment').value.trim();

        if (tekst && !proef) {
            btn.disabled = true;
            var res;
            try {
                res = await supabase.rpc('feedback_mail_toelichting', { p_token: code, p_comment: tekst });
            } catch (e) {
                res = { error: e };
            }
            btn.disabled = false;
            if (res.error || !res.data || res.data.ok !== true) {
                if (res.error) console.error('Toelichting opslaan mislukt:', res.error);
                fout('Versturen is niet gelukt. Probeer het nog een keer.');
                return;
            }
        }

        fout('');
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

        if (gekozen) {
            rate(gekozen);
        } else {
            $('bdIntro').textContent = 'Hoeveel sterren geef je Meestertools?';
            toon('bdSterren', true);
        }
    }

    init();
})();

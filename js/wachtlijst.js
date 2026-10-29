/* ============================================
   MEESTERTOOLS - Wachtlijst 10minutendidactiek

   Een rustige regel op de rekenplekken: "Binnenkort korte rekenlessen van
   10 minuten. Wil je bericht als ze er zijn?" Eén klik zet het e-mailadres van
   het account op de wachtlijst in Emailit (edge function wachtlijst-aanmelden,
   dezelfde lijst als het formulier op de 10MD-site).

   Komt alleen in beeld op een plek met data-mt-wachtlijst, voor een ingelogde
   leerkracht die nog niet op de lijst staat. Met het kruisje blijft hij twee
   maanden weg (alleen in deze browser). Nooit op een Startbord.
   ============================================ */

(function () {
    var WEG_KEY = 'mt-wachtlijst-weg';
    var WEG_DAGEN = 60;

    function weggeklikt() {
        try {
            var t = parseInt(localStorage.getItem(WEG_KEY) || '0', 10);
            return t && Date.now() - t < WEG_DAGEN * 86400000;
        } catch (e) { return false; }
    }

    async function start() {
        var plek = document.querySelector('[data-mt-wachtlijst]');
        if (!plek || document.documentElement.classList.contains('mt-ingebed')) return;
        if (weggeklikt() || typeof supabase === 'undefined') return;

        var sessie = (await supabase.auth.getSession()).data.session;
        if (!sessie) return;

        var res = await supabase.from('wachtlijst_10md').select('user_id').eq('user_id', sessie.user.id).maybeSingle();
        if (res.error || res.data) return;

        plek.innerHTML =
            '<div class="mt-wachtlijst">' +
                '<span class="mt-wachtlijst-icoon" aria-hidden="true">&#9201;&#65039;</span>' +
                '<p class="mt-wachtlijst-tekst"><strong>Binnenkort:</strong> korte rekenlessen van 10 minuten voor op het digibord, met werkblad.</p>' +
                '<button type="button" class="mt-wachtlijst-knop">Houd me op de hoogte</button>' +
                '<button type="button" class="mt-wachtlijst-weg" aria-label="Verbergen" title="Verbergen">&times;</button>' +
            '</div>';

        var knop = plek.querySelector('.mt-wachtlijst-knop');
        var tekst = plek.querySelector('.mt-wachtlijst-tekst');

        plek.querySelector('.mt-wachtlijst-weg').addEventListener('click', function () {
            try { localStorage.setItem(WEG_KEY, String(Date.now())); } catch (e) { /* geen opslag: dan alleen nu weg */ }
            plek.innerHTML = '';
        });

        knop.addEventListener('click', async function () {
            knop.disabled = true;
            knop.textContent = 'Even geduld…';
            var r = await supabase.functions.invoke('wachtlijst-aanmelden', { body: {} });
            if (!r.error && r.data && r.data.ok) {
                tekst.innerHTML = '<strong>Top!</strong> Je krijgt een mail zodra de lessen er zijn. Afmelden kan met de link onderaan die mail.';
                knop.remove();
                plek.querySelector('.mt-wachtlijst-weg').remove();
                return;
            }
            var melding = 'Dat lukte niet. Probeer het later nog eens.';
            try {
                var body = r.error && r.error.context ? await r.error.context.json() : r.data;
                if (body && body.error) melding = body.error;
            } catch (e) { /* standaardmelding */ }
            tekst.textContent = melding;
            knop.disabled = false;
            knop.textContent = 'Opnieuw proberen';
        });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();
})();

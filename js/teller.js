/* ============================================
   MEESTERTOOLS - Anonieme bezoekteller
   Versie: v1.0.0

   Telt een paginaweergave op in een dagtotaal (public.tel_bezoek): welke
   pagina, waar de bezoeker vandaan kwam en of het een telefoon of computer is.
   Er wordt niets over de bezoeker opgeslagen: geen cookie, geen browseropslag,
   geen IP-adres, geen gebruikers-id. Zie supabase/migrations/20261025c_bezoekteller.sql.

   - "Binnenkomst": de bezoeker kwam van buiten de site. Dan telt ook het
     domein waar hij vandaan kwam (alleen de domeinnaam, bv. google.com).
   - Niet geteld: bekende bots, lokaal testen, en een apparaat waarop de
     beheerder in beheer "dit apparaat niet meetellen" heeft aangezet.
   - Werkt zonder supabase-js, zodat hij op elke pagina kan (ook de tijdlijn).
   ============================================ */

(function () {
    'use strict';

    try {
        if (/^(localhost|127\.|\[::1\])/.test(location.hostname)) return;
        // Een tool die als vak op een Startbord staat, is geen eigen bezoek
        if (/[?&]ingebed=1/.test(location.search)) return;
        if (navigator.webdriver) return;
        if (/bot|crawl|spider|slurp|headless|lighthouse|preview|facebookexternalhit|embedly/i.test(navigator.userAgent)) return;
        try { if (localStorage.getItem('mt-niet-tellen') === '1') return; } catch (_) {}

        // Zelfde sleutel als js/supabase-config.js: openbaar, alleen voor de anon-rol.
        var ENDPOINT = 'https://chnjybpwquystuwmiger.supabase.co/rest/v1/rpc/tel_bezoek';
        var KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNobmp5YnB3cXV5c3R1d21pZ2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NzAzOTgsImV4cCI6MjA4ODE0NjM5OH0.d2tlRjvXsk34J3mnYIuCFPWSQR6m6YLu3zv5S7qbz88';

        // /tijdlijn/ en /tijdlijn/index.html tellen als hetzelfde, net als /privacy en /privacy.html.
        var pad = location.pathname.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
        if (pad.length > 1) pad = pad.replace(/\/$/, '');

        var bron = '';
        var binnenkomst = true;
        if (document.referrer) {
            var r = new URL(document.referrer);
            if (r.hostname === location.hostname) binnenkomst = false;
            else bron = r.hostname.replace(/^www\./, '');
        }

        fetch(ENDPOINT, {
            method: 'POST',
            keepalive: true,
            headers: { 'Content-Type': 'application/json', apikey: KEY, Authorization: 'Bearer ' + KEY },
            body: JSON.stringify({
                p_pad: pad,
                p_bron: bron,
                p_mobiel: window.innerWidth < 768,
                p_binnenkomst: binnenkomst
            })
        }).catch(function () {});
    } catch (_) {
        // Tellen is nooit belangrijker dan de pagina zelf.
    }
})();

// Voorleesverhalen bij de eeuwkaarten (tabel public.tijdlijn_verhalen, zie supabase/migrations/20261025d_tijdlijn_verhalen.sql).
// Werkt zonder supabase-js. Bezoekers krijgen alleen gepubliceerde verhalen; wie op meestertools.nl als
// super_admin is ingelogd, krijgt ook de concepten (de database bepaalt dat, niet deze code).
// Zodra de verhalen binnen zijn, staan ze in window.VERHALEN en volgt het event 'verhalen' op document.
window.VERHALEN = window.VERHALEN || {};
(function () {
  var URL = 'https://chnjybpwquystuwmiger.supabase.co/rest/v1/tijdlijn_verhalen?select=eeuw,titel,ondertitel,tekst,klopt,gebeurtenissen,gepubliceerd';
  // Zelfde openbare anon-sleutel als js/supabase-config.js.
  var KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNobmp5YnB3cXV5c3R1d21pZ2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NzAzOTgsImV4cCI6MjA4ODE0NjM5OH0.d2tlRjvXsk34J3mnYIuCFPWSQR6m6YLu3zv5S7qbz88';
  // De sessie van meestertools.nl staat in dezelfde localStorage. Een verlopen sessie wordt hier niet
  // ververst (dat doet supabase-js op de rest van de site); dan vallen we terug op de anon-sleutel.
  function token() {
    try {
      var s = JSON.parse(localStorage.getItem('sb-chnjybpwquystuwmiger-auth-token') || 'null');
      if (s && s.access_token && s.expires_at * 1000 > Date.now() + 30000) return s.access_token;
    } catch (_) {}
    return KEY;
  }
  try {
    fetch(URL, { headers: { apikey: KEY, Authorization: 'Bearer ' + token() } })
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (rows) {
        if (!rows || !rows.length) return;
        rows.forEach(function (v) { window.VERHALEN[v.eeuw] = v; });
        document.dispatchEvent(new Event('verhalen'));
      })
      .catch(function () {});
  } catch (_) {}
})();

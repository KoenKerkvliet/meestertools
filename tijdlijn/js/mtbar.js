// Meestertools-balk boven de tijdlijn: "Bekijk alle tools" gaat voor ingelogde leerkrachten naar hun dashboard.
// Bezoekers zonder account blijven naar de homepage gaan (het dashboard zou hen naar de inlogpagina sturen).
// De tijdlijn draait op hetzelfde domein als Meestertools, dus de Supabase-sessie staat in dezelfde localStorage.
(function () {
  try {
    if (!localStorage.getItem('sb-chnjybpwquystuwmiger-auth-token')) return;
    document.querySelectorAll('.mtbar a').forEach(a => { a.href = '/dashboard'; });
  } catch (_) {}
})();

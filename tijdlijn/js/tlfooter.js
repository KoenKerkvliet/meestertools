// Footer van de tijdlijn: het info-icoon opent een klein venster met de bronnen. Dit sluit het weer bij een klik ernaast of Escape.
// Zonder JavaScript blijft het gewoon een uitklapbaar <details>-element.
(function () {
  const dicht = except => document.querySelectorAll('.tlinfo[open]').forEach(d => { if (d !== except) d.open = false; });
  document.addEventListener('click', e => dicht(e.target.closest('.tlinfo')));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') dicht(null); });
})();

// Extra blokken op de leespagina's, bedoeld voor leerkrachten die een les voorbereiden.
// Gedeeld door de leesweergave in de app (index.html) en de losse pagina's (scripts/bouw-paginas.mjs),
// zodat beide altijd hetzelfde tonen. Alle velden zijn optioneel; een onderwerp zonder verdieping
// ziet er uit zoals voorheen.
//
// Velden in DETAILS[titel], naast aanloop/verloop/perspectieven/cijfers/figuren/bronnen:
//   gevolgen:      [alinea, ...]                 wat het op korte en lange termijn veranderde
//   misverstanden: [[misverstand, uitleg], ...]  wat je in de klas vaak hoort, en hoe het zit
//   hoeWeten:      [alinea, ...]                 welke bronnen er zijn
//   nu:            [alinea, ...]                 wat je er nu nog van merkt
//   vertellen:     'tekst'                        een anekdote om een les mee te openen
//   verbanden:     [[titel, waarom], ...]        andere onderwerpen op de tijdlijn
//   onderwijs:     {ka: [kenmerkend aspect, ...], venster: 'nr. Naam'}   tijdvak komt uit het jaartal
window.VERDIEPING = (function () {
  const paras = (list, esc) => list.map(p => `<p>${esc(p)}</p>`).join('');

  // Komt in het artikel direct na "Wat er gebeurde".
  function naVerloop(D, h, esc) {
    return D.gevolgen && D.gevolgen.length ? `<${h}>Gevolgen</${h}>${paras(D.gevolgen, esc)}` : '';
  }

  // Komt in het artikel na "Andere perspectieven".
  function naPerspectieven(D, h, esc) {
    let s = '';
    if (D.misverstanden && D.misverstanden.length) s += `<${h}>Veelvoorkomende misverstanden</${h}>` +
      D.misverstanden.map(([m, u]) => `<div class="mis"><p class="misq">${esc(m)}</p><p>${esc(u)}</p></div>`).join('');
    if (D.hoeWeten && D.hoeWeten.length) s += `<${h}>Hoe weten we dit?</${h}>${paras(D.hoeWeten, esc)}`;
    if (D.nu && D.nu.length) s += `<${h}>Wat merk je er nu nog van?</${h}>${paras(D.nu, esc)}`;
    return s;
  }

  // Bovenaan de zijkolom.
  function zijBoven(D, h, esc) {
    return D.vertellen ? `<div class="box tell"><${h}>Om te vertellen</${h}><p>${esc(D.vertellen)}</p></div>` : '';
  }

  // Onderaan de zijkolom, voor "Verder lezen". o.tijdvak = {n, t} uit SCHOOL; o.href(titel) = link of null.
  function zijOnder(D, h, esc, o) {
    let s = '';
    const ow = D.onderwijs || {};
    if (o.tijdvak || ow.venster || (ow.ka && ow.ka.length)) {
      s += `<div class="box les"><${h}>In de les</${h}><dl class="facts">` +
        (o.tijdvak ? `<div><dt>Tijdvak</dt><dd>${o.tijdvak.n}. ${esc(o.tijdvak.t)}</dd></div>` : '') +
        (ow.ka && ow.ka.length ? `<div><dt>Kenmerkend aspect</dt><dd class="ka">${ow.ka.map(k => esc(k)).join('<br>')}</dd></div>` : '') +
        (ow.venster ? `<div><dt>Canon van Nederland</dt><dd>Venster ${esc(ow.venster)}</dd></div>` : '') +
        `</dl></div>`;
    }
    const vb = (D.verbanden || []).map(([t, w]) => [t, w, o.href(t)]).filter(x => x[2]);
    if (vb.length) s += `<div class="box"><${h}>Samenhang op de tijdlijn</${h}><ul class="links samen">` +
      vb.map(([t, w, u]) => `<li><a href="${esc(u)}">${esc(t)} →</a>${w ? `<span>${esc(w)}</span>` : ''}</li>`).join('') + `</ul></div>`;
    return s;
  }

  // Alle tekst, voor de zoekfunctie.
  function teksten(D) {
    return [...(D.gevolgen || []), ...(D.misverstanden || []).flat(), ...(D.hoeWeten || []), ...(D.nu || []), ...(D.vertellen ? [D.vertellen] : [])];
  }

  return { naVerloop, naPerspectieven, zijBoven, zijOnder, teksten };
})();

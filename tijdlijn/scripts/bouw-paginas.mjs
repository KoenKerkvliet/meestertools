// Maakt de losse, doorzoekbare pagina's van de Tijdlijn van Nederland:
//   tijdlijn/<slug>.html     één pagina per gebeurtenis (https://meestertools.nl/tijdlijn/<slug>)
//   tijdlijn/onderwerpen.html overzicht van alle gebeurtenissen per periode
//   tijdlijn/sitemap.xml      voor zoekmachines
// Leest dezelfde gegevens als de app (js/*.js) en gebruikt dezelfde slugs (js/slugs.js).
// Gebruik: node tijdlijn/scripts/bouw-paginas.mjs   (draait ook in .github/workflows/tijdlijn-bouwen.yml)
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = 'https://meestertools.nl/tijdlijn/';
const MARK = '<!-- gemaakt door scripts/bouw-paginas.mjs -->';

/* ---- gegevens inlezen, in dezelfde volgorde als index.html ---- */
const ctx = {};
ctx.window = ctx;
vm.createContext(ctx);
const order = ['details-pre', 'details-mid', 'details-vroegmodern', 'details-modern', 'details-20e', 'details-nu', 'verdieping',
  'war-ww1a', 'war-ww1b', 'war-ww2a', 'war-ww2b', 'images-20e', 'images-rest', 'videos', 'data', 'slugs'];
for (const f of order) vm.runInContext(fs.readFileSync(path.join(DIR, 'js', f + '.js'), 'utf8'), ctx, { filename: f + '.js' });
const D = vm.runInContext(`({VERDIEPING:window.VERDIEPING,SCHOOL,EVENTS,WEV,ERAS,TILES,WARS,THEMES,CATL,DG,DGORDER,DETAILS:window.DETAILS,IMAGES:window.IMAGES,VIDEOS:window.VIDEOS,...makeSlugs(EVENTS.concat(WEV))})`, ctx);
const { VERDIEPING, SCHOOL, EVENTS, WEV, ERAS, TILES, WARS, THEMES, CATL, DG, DGORDER, DETAILS, IMAGES, VIDEOS, EVSLUG } = D;

/* ---- hulpjes (zelfde opmaak als de leespagina in index.html) ---- */
const esc = s => String(s).replace(/[&<>"]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));
const IMG = t => IMAGES[t] || [];
const VID = t => VIDEOS[t] || [];
const abs = src => /^https?:/.test(src) ? src : BASE + src;
const tileName = t => t.pre ? t.big : t.n + 'e eeuw';
const mmss = s => s ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` : '';
const short = (x, n = 155) => { if (x.length <= n) return x; const c = x.slice(0, n - 1); return c.slice(0, c.lastIndexOf(' ')).replace(/[,;:]$/, '') + '…'; };
const ini = n => n.replace(/^(Koningin|Keizer|Generaal|Schipper|Koning)\s+/, '').split(/[\s.]+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
const hdr = e => e.war ? { bg: `color-mix(in srgb,var(${e.era.c}) 22%,#fff)`, ink: `color-mix(in srgb,var(${e.era.c}) 55%,#1F2430)` } : e.era.P;
const catPill = e => e.war ? `<span class="cat th" style="--c:var(${e.era.c})">${esc(e.era.n)}</span>`
  : `<span class="cat ${e.cat}">${CATL[e.cat]}</span>${e.c && e.l ? '<span class="cat limburg">Limburg</span>' : ''}`;
const credit = im => `<span class="credit">Foto: ${esc(im.by)} · ${im.licUrl ? `<a href="${esc(im.licUrl)}" target="_blank" rel="noopener">${esc(im.lic)}</a>` : esc(im.lic)} · <a href="${esc(im.page)}" target="_blank" rel="noopener">Wikimedia Commons</a></span>`;
const figHTML = (im, k) => `<figure><div class="ph"><img src="${esc(im.src)}" alt="${esc(im.cap)}"${k ? ' loading="lazy"' : ''} referrerpolicy="no-referrer" onload="this.closest('figure').style.setProperty('--ar',(this.naturalWidth/this.naturalHeight).toFixed(3))" onerror="this.closest('figure').remove()"></div><figcaption>${esc(im.cap)}${credit(im)}</figcaption></figure>`;
const ld = o => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`;

const MTBAR = `<nav class="mtbar px" aria-label="Meestertools"><a class="mtlogo" href="/" aria-label="Meestertools"><img src="/assets/badge-96.png" alt="" width="26" height="26"><b>Meestertools</b></a><span class="mtsub">Gratis tools voor in de klas</span><a class="mtgo" href="/">Bekijk alle tools →</a></nav><script src="js/mtbar.js"></script><script src="/js/teller.js" defer></script><script src="js/tlfooter.js"></script>`;
const FOOT = `<footer class="px tlfoot"><div class="tlfoot-rij"><span class="tlfoot-c">© 2026 <a href="/">Meestertools</a></span><nav class="tlfoot-nav" aria-label="Meer"><a href="onderwerpen">Alle onderwerpen</a><a href="/">Meestertools</a><a href="/privacy">Privacy</a></nav><details class="tlinfo"><summary aria-label="Over de bronnen en afbeeldingen" title="Over de bronnen en afbeeldingen"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9.5"/><path d="M12 11v6"/><circle cx="12" cy="7.6" r=".6" fill="currentColor"/></svg></summary><p>Basis: de 50 vensters van de <a href="https://www.canonvannederland.nl" target="_blank" rel="noopener">Canon van Nederland</a> (herijkt in 2020), aangevuld met andere gebeurtenissen, Limburgse geschiedenis en beide wereldoorlogen. Jaartallen in de prehistorie zijn benaderingen. Afbeeldingen via Wikimedia Commons, met hun eigen licenties; maker en bron staan bij elke afbeelding.</p></details></div></footer>`;
const CTA = `<section class="spcta"><div><h3>Meer gratis tools voor in de klas</h3><p>Meestertools heeft tientallen gratis tools voor leerkrachten in het basisonderwijs: van digibordtools en energizers tot groepsvorming en lesmateriaal.</p></div><div class="btns"><a class="btn dk" href="/">Bekijk Meestertools</a><a class="btn" href="/registreer">Gratis account</a></div></section>`;

function head({ title, desc, url, image, type = 'website', extra = '' }) {
  return `<!doctype html>
${MARK}
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="${type}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${esc(image)}">
<meta property="og:locale" content="nl_NL">
<meta property="og:site_name" content="Meestertools">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#FFFFFF">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&display=swap">
<link rel="stylesheet" href="tijdlijn.css">
${extra}</head>
`;
}

/* ---- volgorde: hoofdtijdlijn op jaar, oorlogen per oorlog op datum (zoals Vorige/Volgende in de app) ---- */
const MAIN = EVENTS.slice().sort((a, b) => a.y - b.y);
const WARLIST = k => WEV.filter(e => e.war === k).sort((a, b) => a.mi - b.mi);
const seqOf = e => e.war ? WARLIST(e.war) : MAIN;

function eventPage(e) {
  const slug = EVSLUG[e.id], url = BASE + slug, Dt = DETAILS[e.t], H = hdr(e), imgs = IMG(e.t), V = VID(e.t);
  const L = seqOf(e), k = L.findIndex(x => x.id === e.id), pv = L[k - 1], nx = L[k + 1];
  const crumbs = e.war
    ? [['Tijdlijn', './'], [WARS[e.war].n, './#' + e.war], [THEMES[e.th].n]]
    : [['Tijdlijn', './'], [e.era.n], [tileName(TILES[e.tile]), './#' + TILES[e.tile].id]];
  const title = `${e.t} (${e.d}) – Tijdlijn van Nederland | Meestertools`;
  const desc = short(e.x);
  const vids = V.length ? `<section class="pgvid" aria-label="Video's"><div class="pvhead"><h3>Bekijken</h3></div>
  <div class="vlist">${V.map(v => `<a class="vcard" href="${esc(v.url)}" target="_blank" rel="noopener">
    <span class="vplay" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>${v.duur ? `<small>${mmss(v.duur)}</small>` : ''}</span>
    <span class="vtxt"><small>${esc(v.bron)}${v.programma ? ' · ' + esc(v.programma) : ''}</small><b>${esc(v.titel)}</b>${v.wat ? `<span class="vwat">${esc(v.wat)}</span>` : ''}
    <span class="vdg">${DGORDER.filter(g => v.doelgroep.includes(g)).map(g => `<i style="--dc:${DG[g].c};--dt:${DG[g].t}">${DG[g].n}</i>`).join('')}</span></span><span class="vgo" aria-hidden="true">↗</span></a>`).join('')}</div>
  <p class="vnote">De video's openen op de site van de bron. In de <a href="./#${slug}/lees">interactieve tijdlijn</a> kun je ze ook hier afspelen.</p></section>` : '';
  const breadcrumbLd = ld({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Meestertools', item: 'https://meestertools.nl/' },
    { '@type': 'ListItem', position: 2, name: 'Tijdlijn van Nederland', item: BASE },
    { '@type': 'ListItem', position: 3, name: e.t, item: url }] });
  return head({ title, desc, url, image: imgs[0] ? abs(imgs[0].src) : BASE + 'og-tijdlijn.jpg', type: 'article', extra: breadcrumbLd + '\n' }) + `<body class="sp">
${MTBAR}
<main class="pgin px spin">
  <nav class="crumbs" aria-label="Kruimelpad">${crumbs.map(([n, h]) => h ? `<a href="${h}">${esc(n)}</a>` : `<span>${esc(n)}</span>`).join('<i aria-hidden="true">›</i>')}</nav>
  <div class="pghero" style="background:${H.bg}"><div class="pmeta">${catPill(e)}<span class="yr" style="color:${H.ink}">${esc(e.d)}</span></div><h1>${esc(e.t)}</h1><p class="lead">${esc(e.x)}</p>
    <div class="btns"><a class="btn dk" href="./#${slug}">Bekijk in de interactieve tijdlijn</a></div></div>
  ${imgs.length ? `<div class="pgimgs n${imgs.length}">${imgs.map(figHTML).join('')}</div>` : ''}
  <div class="pggrid">
    <article class="pgart"><h2>Aanloop en oorzaken</h2>${Dt.aanloop.map(p => `<p>${esc(p)}</p>`).join('')}
      <h2>Wat er gebeurde</h2>${Dt.verloop.map(p => `<p>${esc(p)}</p>`).join('')}
      ${VERDIEPING.naVerloop(Dt, 'h2', esc)}
      ${Dt.perspectieven ? `<h2>Andere perspectieven</h2>${Dt.perspectieven.map(p => `<p>${esc(p)}</p>`).join('')}` : ''}
      ${VERDIEPING.naPerspectieven(Dt, 'h2', esc)}</article>
    <aside class="pgside">
      ${VERDIEPING.zijBoven(Dt, 'h2', esc)}
      <div class="box"><h2>Kerncijfers</h2><dl class="facts">${Dt.cijfers.map(([a, b]) => `<div><dt>${esc(a)}</dt><dd>${esc(b)}</dd></div>`).join('')}</dl></div>
      <div class="box"><h2>Sleutelfiguren</h2><ul class="people">${Dt.figuren.map(([n, r]) => `<li><span class="av" style="background:${H.bg};color:${H.ink}">${esc(ini(n))}</span><div><b>${esc(n)}</b><span>${esc(r)}</span></div></li>`).join('')}</ul></div>
      ${VERDIEPING.zijOnder(Dt, 'h2', esc, { tijdvak: e.war ? null : SCHOOL.find(s => e.y >= s.s && e.y < s.e), href: t => { const x = EVENTS.concat(WEV).find(v => v.t === t); return x ? EVSLUG[x.id] : null; } })}
      <div class="box"><h2>Verder lezen</h2><ul class="links">${Dt.bronnen.map(([l, u]) => `<li><a href="${esc(u)}" target="_blank" rel="noopener">${esc(l)} ↗</a></li>`).join('')}</ul></div>
    </aside>
  </div>
  ${vids}
  <nav class="pgnav" aria-label="Vorige en volgende gebeurtenis">${pv ? `<a class="btn" href="${EVSLUG[pv.id]}" rel="prev"><small>Vorige</small>← ${esc(pv.t)}</a>` : '<span></span>'}${nx ? `<a class="btn dk" href="${EVSLUG[nx.id]}" rel="next"><small>Volgende</small>${esc(nx.t)} →</a>` : '<span></span>'}</nav>
  ${CTA}
</main>
${FOOT}
</body>
</html>
`;
}

function overviewPage() {
  const group = (name, sub, list) => `<section class="ovgroup"><h2>${esc(name)}<small>${esc(sub)}</small></h2><ul class="ovlist">${list.map(e => `<li><span class="yr">${esc(e.d)}</span><a href="${EVSLUG[e.id]}">${esc(e.t)}</a></li>`).join('')}</ul></section>`;
  const eras = ERAS.map(er => [er, MAIN.filter(e => e.era === er)]).filter(([, l]) => l.length);
  const desc = `Alle ${EVENTS.length + WEV.length} onderwerpen van de Tijdlijn van Nederland op een rij: van de Neanderthalers bij Maastricht tot nu, met de Eerste en Tweede Wereldoorlog uitgewerkt.`;
  return head({ title: 'Alle onderwerpen – Tijdlijn van Nederland | Meestertools', desc, url: BASE + 'onderwerpen', image: BASE + 'og-tijdlijn.jpg' }) + `<body class="sp">
${MTBAR}
<main class="pgin px spin">
  <nav class="crumbs" aria-label="Kruimelpad"><a href="./">Tijdlijn</a><i aria-hidden="true">›</i><span>Alle onderwerpen</span></nav>
  <div class="pghero" style="background:var(--sunk)"><h1>Alle onderwerpen</h1><p class="lead">${esc(desc)} Elk onderwerp heeft een eigen pagina met achtergrond, afbeeldingen en video's.</p>
    <div class="btns"><a class="btn dk" href="./">Open de interactieve tijdlijn</a></div></div>
  ${eras.map(([er, l]) => group(er.n, er.r, l)).join('\n  ')}
  ${['ww1', 'ww2'].map(k => group(WARS[k].n, WARS[k].r + ' · alle fronten', WARLIST(k))).join('\n  ')}
  ${CTA}
</main>
${FOOT}
</body>
</html>
`;
}

/* ---- wegschrijven ---- */
const written = new Set();
const write = (name, html) => { fs.writeFileSync(path.join(DIR, name), html); written.add(name); };
for (const e of EVENTS.concat(WEV)) write(EVSLUG[e.id] + '.html', eventPage(e));
write('onderwerpen.html', overviewPage());

// pagina's van gebeurtenissen die niet meer bestaan (bijvoorbeeld na een nieuwe titel) opruimen
let removed = 0;
for (const f of fs.readdirSync(DIR)) {
  if (!f.endsWith('.html') || written.has(f) || f === 'index.html') continue;
  if (fs.readFileSync(path.join(DIR, f), 'utf8').includes(MARK)) { fs.unlinkSync(path.join(DIR, f)); removed++; }
}

const urls = ['', 'onderwerpen', ...MAIN.concat(WARLIST('ww1'), WARLIST('ww2')).map(e => EVSLUG[e.id])];
fs.writeFileSync(path.join(DIR, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${BASE}${u}</loc></url>`).join('\n')}
</urlset>
`);

console.log(`${written.size} pagina's geschreven, ${removed} verouderde verwijderd, sitemap met ${urls.length} adressen.`);

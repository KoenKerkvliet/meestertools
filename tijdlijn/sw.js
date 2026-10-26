// Service worker van de Tijdlijn van Nederland.
// - Pagina en gegevens: eerst het netwerk (zo zie je updates meteen), offline uit de cache.
// - Afbeeldingen: uit de cache zodra ze één keer bekeken zijn.
// - Lettertypen en de pdf-maker (externe bronnen): cache, op de achtergrond ververst.
const VERSION = 'v23';
const SHELL = 'tijdlijn-shell-' + VERSION;
const IMG = 'tijdlijn-img-v2';
const EXT = 'tijdlijn-ext-v1';
const PRECACHE = [
  './',
  './index.html',
  './tijdlijn.css',
  './manifest.webmanifest',
  './js/data.js',
  './js/slugs.js',
  './js/verhalen.js',
  './js/mtbar.js',
  './js/tlfooter.js',
  '/favicon.ico',
  '/icon-192.png',
  "./js/details-20e.js",
  "./js/details-mid.js",
  "./js/details-modern.js",
  "./js/details-nu.js",
  "./js/verdieping.js",
  "./js/details-pre.js",
  "./js/details-vroegmodern.js",
  "./js/images-20e.js",
  "./js/images-rest.js",
  "./js/videos.js",
  "./js/war-ww1a.js",
  "./js/war-ww1b.js",
  "./js/war-ww2a.js",
  "./js/war-ww2b.js",
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      // oude versies van de eigen caches weg (ook de afbeeldingen van vóór de overstap op WebP)
      .then(keys => Promise.all(keys.filter(k => k.startsWith('tijdlijn-') && ![SHELL, IMG, EXT].includes(k)).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

async function networkFirst(req) {
  const cache = await caches.open(SHELL);
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch (err) {
    return (await cache.match(req, { ignoreSearch: true })) || (await cache.match('./index.html')) || Response.error();
  }
}

async function cacheFirst(req, name) {
  const cache = await caches.open(name);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok) cache.put(req, res.clone());
  return res;
}

async function staleWhileRevalidate(req) {
  const cache = await caches.open(EXT);
  const hit = await cache.match(req);
  const net = fetch(req).then(res => { if (res.ok || res.type === 'opaque') cache.put(req, res.clone()); return res; }).catch(() => hit);
  return hit || net;
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    if (url.pathname.includes('/img/')) e.respondWith(cacheFirst(req, IMG));
    else e.respondWith(networkFirst(req));
  } else if (/fonts\.(googleapis|gstatic)\.com|cdnjs\.cloudflare\.com/.test(url.hostname)) {
    e.respondWith(staleWhileRevalidate(req));
  }
});

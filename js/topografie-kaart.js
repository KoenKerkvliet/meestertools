/* ============================================
   TOPOGRAFIE - Gedeelde kaart (window.TopoKaart)
   Versie: v1.0.0

   Tekent een basiskaart uit assets/topografie/<basis>.json als SVG, met
   daarop de items die de leerkracht gekozen heeft. Gebruikt door de editor
   (lesmateriaal/topografie) en door de oefenpagina (/topografie).

   - Basislaag: zee, buurlanden, alle provincies als land, alle rivieren dun.
   - Itemlaag: gekozen provincies (vlak), rivieren (lijn) en punten.
   - Zoomen met scrollwiel, knoppen en twee vingers; slepen om te schuiven.
     Een sleepbeweging telt niet als klik.
   - Punten en tekst blijven op het scherm even groot, hoe ver je ook inzoomt.

   Een item in de database is { t, id } (eigen punt: { t:'e', id, naam, x, y }).
   resolve() maakt daar een kaartobject van met naam, soort en geometrie.
   ============================================ */

(function (global) {
    'use strict';

    var NS = 'http://www.w3.org/2000/svg';
    var cache = {};

    function laad(basis) {
        if (!/^[a-z]+$/.test(basis)) return Promise.reject(new Error('Onbekende kaart'));
        if (!cache[basis]) {
            cache[basis] = fetch('/assets/topografie/' + basis + '.json?v=1').then(function (r) {
                if (!r.ok) throw new Error('Kaart niet gevonden');
                return r.json();
            }).then(function (d) {
                // Opzoektabellen per soort, zodat resolve() niet hoeft te zoeken
                d.index = { p: {}, s: {}, g: {}, r: {} };
                d.provincies.forEach(function (p) { d.index.p[p.id] = p; });
                d.rivieren.forEach(function (r) { d.index.r[r.id] = r; });
                d.gebieden.forEach(function (g) { d.index.g[g.id] = g; });
                d.plaatsen = d.plaatsen.map(function (a) {
                    return { id: a[0], naam: a[1], x: a[2], y: a[3], pop: a[4], prov: !!a[5], hs: !!a[6] };
                });
                d.plaatsen.forEach(function (s) { d.index.s[s.id] = s; });
                return d;
            });
            cache[basis].catch(function () { delete cache[basis]; });
        }
        return cache[basis];
    }

    var SOORT_LABEL = {
        provincie: 'Provincie', plaats: 'Plaats', hoofdstad: 'Hoofdstad',
        provhoofdstad: 'Provinciehoofdstad', rivier: 'Rivier', water: 'Water',
        eiland: 'Eiland', gebied: 'Gebied', eigen: 'Plek'
    };

    // Database-item -> kaartobject. Onbekende ids (bijv. na een kaartupdate)
    // vallen stil weg in plaats van de hele kaart te breken.
    function resolve(map, item) {
        if (!item || !item.t) return null;
        var key = item.t + ':' + item.id;
        if (item.t === 'p') {
            var p = map.index.p[item.id];
            return p && { key: key, t: 'p', id: p.id, naam: p.naam, soort: 'provincie', vorm: 'vlak', d: p.d, lx: p.lx, ly: p.ly };
        }
        if (item.t === 'r') {
            var r = map.index.r[item.id];
            if (!r) return null;
            return { key: key, t: 'r', id: r.id, naam: r.naam, soort: 'rivier', vorm: 'lijn', d: r.d, lx: r.lx, ly: r.ly };
        }
        if (item.t === 's') {
            var s = map.index.s[item.id];
            return s && { key: key, t: 's', id: s.id, naam: s.naam, soort: s.hs ? 'hoofdstad' : s.prov ? 'provhoofdstad' : 'plaats', vorm: 'punt', x: s.x, y: s.y, groot: s.hs || s.prov };
        }
        if (item.t === 'g') {
            var g = map.index.g[item.id];
            return g && { key: key, t: 'g', id: g.id, naam: g.naam, soort: g.soort, vorm: 'punt', x: g.x, y: g.y };
        }
        if (item.t === 'e') {
            if (typeof item.x !== 'number' || typeof item.y !== 'number' || !item.naam) return null;
            return { key: key, t: 'e', id: item.id, naam: String(item.naam).slice(0, 60), soort: 'eigen', vorm: 'punt', x: item.x, y: item.y };
        }
        return null;
    }

    function resolveAll(map, items) {
        return (items || []).map(function (it) { return resolve(map, it); }).filter(Boolean);
    }

    function el(tag, attrs, parent) {
        var n = document.createElementNS(NS, tag);
        if (attrs) Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
        if (parent) parent.appendChild(n);
        return n;
    }

    // ---------- Kaartweergave ----------
    // opts.onKlik(obj | null, {x, y}, event)  obj is een kaartobject of null (zee/land)
    function maak(container, map, opts) {
        opts = opts || {};
        container.classList.add('topo-kaart');
        container.innerHTML = '';

        var svg = el('svg', { 'class': 'topo-svg', role: 'img', 'aria-label': 'Kaart van ' + map.naam });
        container.appendChild(svg);

        el('rect', { x: -2000, y: -2000, width: map.w + 4000, height: map.h + 4000, 'class': 'topo-zee' }, svg);
        el('path', { d: map.buurlanden, 'class': 'topo-buurland' }, svg);
        var gLand = el('g', { 'class': 'topo-land' }, svg);
        map.provincies.forEach(function (p) {
            el('path', { d: p.d, 'class': 'topo-prov-basis', 'data-prov': p.id }, gLand);
        });
        var gRivBasis = el('g', { 'class': 'topo-rivieren-basis' }, svg);
        map.rivieren.forEach(function (r) { el('path', { d: r.d }, gRivBasis); });

        var gVlak = el('g', { 'class': 'topo-laag-vlak' }, svg);
        var gLijn = el('g', { 'class': 'topo-laag-lijn' }, svg);
        var gPunt = el('g', { 'class': 'topo-laag-punt' }, svg);
        var gLabel = el('g', { 'class': 'topo-laag-label' }, svg);

        // Zoombediening
        var ctrl = document.createElement('div');
        ctrl.className = 'topo-zoom';
        ctrl.innerHTML = '<button type="button" data-z="in" aria-label="Inzoomen">+</button>' +
            '<button type="button" data-z="uit" aria-label="Uitzoomen">&minus;</button>' +
            '<button type="button" data-z="reset" aria-label="Hele kaart" title="Hele kaart">&#8634;</button>';
        container.appendChild(ctrl);

        if (map.bron) {
            var bron = document.createElement('div');
            bron.className = 'topo-bron';
            bron.textContent = map.bron;
            container.appendChild(bron);
        }

        var objs = [];          // huidige items
        var nodes = {};         // key -> { vorm, hit, vis, label }
        var labelsAan = false;
        var vb = { x: 0, y: 0, w: map.w, h: map.h };

        function schaal() {
            // schermpixels per kaarteenheid
            var r = svg.getBoundingClientRect();
            if (!r.width) return 1;
            return Math.min(r.width / vb.w, r.height / vb.h);
        }

        function pasGroottesAan() {
            var s = schaal();
            var px = function (n) { return n / s; };
            objs.forEach(function (o) {
                var n = nodes[o.key];
                if (!n) return;
                if (o.vorm === 'punt') {
                    n.vis.setAttribute('r', px(o.groot ? 7 : 5.5));
                    n.hit.setAttribute('r', px(16));
                } else if (o.vorm === 'lijn') {
                    n.vis.setAttribute('stroke-width', px(3.5));
                    n.hit.setAttribute('stroke-width', px(18));
                }
                if (n.label) {
                    n.label.setAttribute('font-size', px(o.vorm === 'vlak' ? 14 : 12.5));
                    n.label.setAttribute('stroke-width', px(3.5));
                    if (o.vorm === 'punt') {
                        n.label.setAttribute('x', o.x + px(9));
                        n.label.setAttribute('y', o.y + px(4));
                    }
                }
            });
            gRivBasis.setAttribute('stroke-width', px(1.6));
            gLand.setAttribute('stroke-width', px(1));
        }

        function zetViewBox() {
            svg.setAttribute('viewBox', vb.x + ' ' + vb.y + ' ' + vb.w + ' ' + vb.h);
            pasGroottesAan();
        }

        function reset() {
            vb = { x: 0, y: 0, w: map.w, h: map.h };
            zetViewBox();
        }

        // Scherm -> kaartcoördinaten (houdt rekening met preserveAspectRatio)
        function naarKaart(clientX, clientY) {
            var pt = svg.createSVGPoint();
            pt.x = clientX; pt.y = clientY;
            var m = svg.getScreenCTM();
            if (!m) return { x: 0, y: 0 };
            var p = pt.matrixTransform(m.inverse());
            return { x: p.x, y: p.y };
        }

        function zoom(factor, cx, cy) {
            var minW = map.w / 12, maxW = map.w;
            var nw = Math.max(minW, Math.min(maxW, vb.w / factor));
            var f = nw / vb.w;
            if (cx == null) { cx = vb.x + vb.w / 2; cy = vb.y + vb.h / 2; }
            vb.x = cx - (cx - vb.x) * f;
            vb.y = cy - (cy - vb.y) * f;
            vb.w = nw;
            vb.h = vb.h * f;
            begrens();
            zetViewBox();
        }

        function begrens() {
            if (vb.w >= map.w) { vb.x = 0; vb.y = 0; vb.w = map.w; vb.h = map.h; return; }
            vb.x = Math.max(-vb.w * 0.25, Math.min(map.w - vb.w * 0.75, vb.x));
            vb.y = Math.max(-vb.h * 0.25, Math.min(map.h - vb.h * 0.75, vb.y));
        }

        ctrl.addEventListener('click', function (e) {
            var b = e.target.closest('button');
            if (!b) return;
            if (b.dataset.z === 'in') zoom(1.6);
            else if (b.dataset.z === 'uit') zoom(1 / 1.6);
            else reset();
        });

        svg.addEventListener('wheel', function (e) {
            e.preventDefault();
            var p = naarKaart(e.clientX, e.clientY);
            zoom(e.deltaY < 0 ? 1.25 : 0.8, p.x, p.y);
        }, { passive: false });

        // ---------- Slepen, knijpen en klikken ----------
        var pointers = {};
        var sleep = null;   // { sx, sy, vbx, vby, verplaatst }
        var knijp = null;   // { afstand, w }

        svg.addEventListener('pointerdown', function (e) {
            pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
            var ids = Object.keys(pointers);
            if (ids.length === 1) {
                sleep = { sx: e.clientX, sy: e.clientY, vbx: vb.x, vby: vb.y, verplaatst: false, doel: e.target };
            } else if (ids.length === 2) {
                var a = pointers[ids[0]], b = pointers[ids[1]];
                knijp = { afstand: Math.hypot(a.x - b.x, a.y - b.y) || 1, w: vb.w };
                if (sleep) sleep.verplaatst = true;
            }
        });

        svg.addEventListener('pointermove', function (e) {
            if (!pointers[e.pointerId]) return;
            pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
            var ids = Object.keys(pointers);
            if (ids.length === 2 && knijp) {
                var a = pointers[ids[0]], b = pointers[ids[1]];
                var d = Math.hypot(a.x - b.x, a.y - b.y);
                var mid = naarKaart((a.x + b.x) / 2, (a.y + b.y) / 2);
                // Doelbreedte volgt de vingerafstand ten opzichte van het begin
                var doelW = knijp.w * knijp.afstand / (d || 1);
                zoom(vb.w / doelW, mid.x, mid.y);
                return;
            }
            if (!sleep) return;
            var dx = e.clientX - sleep.sx, dy = e.clientY - sleep.sy;
            if (!sleep.verplaatst && Math.hypot(dx, dy) < 6) return;
            if (!sleep.verplaatst) {
                sleep.verplaatst = true;
                try { svg.setPointerCapture(e.pointerId); } catch (err) {}
            }
            if (vb.w >= map.w) return;   // hele kaart in beeld: niets te schuiven
            var s = schaal();
            vb.x = sleep.vbx - dx / s;
            vb.y = sleep.vby - dy / s;
            begrens();
            zetViewBox();
            container.classList.add('is-slepen');
        });

        function los(e) {
            var wasKlik = sleep && !sleep.verplaatst && Object.keys(pointers).length === 1;
            var doel = sleep && sleep.doel;
            delete pointers[e.pointerId];
            if (Object.keys(pointers).length < 2) knijp = null;
            if (Object.keys(pointers).length === 0) {
                sleep = null;
                container.classList.remove('is-slepen');
            }
            if (wasKlik && e.type === 'pointerup' && opts.onKlik) {
                var hit = doel && doel.closest ? doel.closest('[data-key]') : null;
                var obj = null;
                if (hit) obj = objs.filter(function (o) { return o.key === hit.getAttribute('data-key'); })[0] || null;
                opts.onKlik(obj, naarKaart(e.clientX, e.clientY), e);
            }
        }
        svg.addEventListener('pointerup', los);
        svg.addEventListener('pointercancel', los);

        // ---------- Items tekenen ----------
        function setItems(lijst) {
            objs = lijst.slice();
            nodes = {};
            [gVlak, gLijn, gPunt, gLabel].forEach(function (g) { g.innerHTML = ''; });
            objs.forEach(function (o) {
                var n = { vorm: o.vorm };
                if (o.vorm === 'vlak') {
                    n.vis = n.hit = el('path', { d: o.d, 'class': 'topo-item topo-vlak', 'data-key': o.key }, gVlak);
                } else if (o.vorm === 'lijn') {
                    var g = el('g', { 'class': 'topo-item topo-lijn', 'data-key': o.key }, gLijn);
                    n.hit = el('path', { d: o.d, 'class': 'topo-hit' }, g);
                    n.vis = el('path', { d: o.d, 'class': 'topo-lijn-vis' }, g);
                    n.groep = g;
                } else {
                    var gp = el('g', { 'class': 'topo-item topo-punt soort-' + o.soort, 'data-key': o.key }, gPunt);
                    n.hit = el('circle', { cx: o.x, cy: o.y, 'class': 'topo-hit' }, gp);
                    n.vis = el('circle', { cx: o.x, cy: o.y, 'class': 'topo-punt-vis' }, gp);
                    n.groep = gp;
                }
                var t = el('text', { 'class': 'topo-label label-' + o.vorm, 'data-label': o.key }, gLabel);
                t.textContent = o.naam;
                if (o.vorm !== 'punt') {
                    t.setAttribute('x', o.lx);
                    t.setAttribute('y', o.ly);
                    // Rivierlabels aan de rechterrand naar links laten lopen
                    t.setAttribute('text-anchor', o.vorm === 'vlak' ? 'middle' : o.lx > map.w * 0.8 ? 'end' : 'start');
                }
                n.label = t;
                nodes[o.key] = n;
            });
            toonLabels(labelsAan);
            pasGroottesAan();
        }

        function toonLabels(aan) {
            labelsAan = !!aan;
            container.classList.toggle('labels-aan', labelsAan);
        }

        // Status van één item: 'doel', 'goed', 'fout', 'gekozen' of null
        function markeer(key, status) {
            var n = nodes[key];
            if (!n) return;
            var node = n.groep || n.vis;
            ['is-doel', 'is-goed', 'is-fout', 'is-gekozen'].forEach(function (c) { node.classList.remove(c); });
            if (n.label) n.label.classList.remove('is-zichtbaar');
            if (status) node.classList.add('is-' + status);
        }

        function toonLabel(key, aan) {
            var n = nodes[key];
            if (n && n.label) n.label.classList.toggle('is-zichtbaar', !!aan);
        }

        function wisMarkeringen() {
            Object.keys(nodes).forEach(function (k) { markeer(k, null); });
        }

        // Breng een item in beeld als het buiten de huidige uitsnede valt
        function inBeeld(key) {
            var o = objs.filter(function (x) { return x.key === key; })[0];
            if (!o || vb.w >= map.w) return;
            var x = o.vorm === 'punt' ? o.x : o.lx, y = o.vorm === 'punt' ? o.y : o.ly;
            if (x < vb.x || x > vb.x + vb.w || y < vb.y || y > vb.y + vb.h) {
                vb.x = x - vb.w / 2; vb.y = y - vb.h / 2;
                begrens(); zetViewBox();
            }
        }

        // Dichtstbijzijnde punt binnen maxPx schermpixels (voor een klik naast een stip)
        function dichtstbijPunt(p, maxPx) {
            var s = schaal(), best = null, bestD = maxPx / s;
            objs.forEach(function (o) {
                if (o.vorm !== 'punt') return;
                var d = Math.hypot(o.x - p.x, o.y - p.y);
                if (d <= bestD) { bestD = d; best = o; }
            });
            return best;
        }

        if (global.ResizeObserver) new ResizeObserver(pasGroottesAan).observe(svg);
        reset();

        return {
            svg: svg,
            setItems: setItems,
            toonLabels: toonLabels,
            toonLabel: toonLabel,
            markeer: markeer,
            wisMarkeringen: wisMarkeringen,
            inBeeld: inBeeld,
            dichtstbijPunt: dichtstbijPunt,
            reset: reset,
            setModus: function (m) { container.setAttribute('data-modus', m || ''); }
        };
    }

    global.TopoKaart = {
        laad: laad,
        resolve: resolve,
        resolveAll: resolveAll,
        maak: maak,
        SOORT_LABEL: SOORT_LABEL
    };
})(window);

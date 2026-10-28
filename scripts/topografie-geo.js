/* ============================================
   MEESTERTOOLS - Topografie: gedeelde geometrie voor de bouwscripts

   Gebruikt door scripts/topografie-nederland.js en
   scripts/topografie-europa.js. Alles werkt op al geprojecteerde
   [x, y]-punten in SVG-eenheden.
   ============================================ */

'use strict';

const r1 = (n) => Math.round(n * 10) / 10;

function sqSegDist(p, a, b) {
    let x = a[0], y = a[1], dx = b[0] - x, dy = b[1] - y;
    if (dx !== 0 || dy !== 0) {
        const t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);
        if (t > 1) { x = b[0]; y = b[1]; } else if (t > 0) { x += dx * t; y += dy * t; }
    }
    dx = p[0] - x; dy = p[1] - y;
    return dx * dx + dy * dy;
}

// Douglas-Peucker, iteratief (diepe recursie op lange kustlijnen loopt anders vast)
function simplify(pts, tol) {
    if (pts.length < 3) return pts;
    const sq = tol * tol, keep = new Uint8Array(pts.length);
    keep[0] = keep[pts.length - 1] = 1;
    const stack = [[0, pts.length - 1]];
    while (stack.length) {
        const [f, l] = stack.pop();
        let max = 0, idx = -1;
        for (let i = f + 1; i < l; i++) {
            const d = sqSegDist(pts[i], pts[f], pts[l]);
            if (d > max) { max = d; idx = i; }
        }
        if (max > sq) { keep[idx] = 1; stack.push([f, idx], [idx, l]); }
    }
    return pts.filter((_, i) => keep[i]);
}

// Sutherland-Hodgman: ring knippen op een rechthoek (buurlanden zijn veel
// groter dan de kaart; alles buiten beeld is alleen maar ballast).
function clipRing(ring, x0, y0, x1, y1) {
    const edges = [
        (p) => p[0] >= x0, (p) => p[0] <= x1, (p) => p[1] >= y0, (p) => p[1] <= y1
    ];
    const isect = [
        (a, b) => [x0, a[1] + (b[1] - a[1]) * (x0 - a[0]) / (b[0] - a[0])],
        (a, b) => [x1, a[1] + (b[1] - a[1]) * (x1 - a[0]) / (b[0] - a[0])],
        (a, b) => [a[0] + (b[0] - a[0]) * (y0 - a[1]) / (b[1] - a[1]), y0],
        (a, b) => [a[0] + (b[0] - a[0]) * (y1 - a[1]) / (b[1] - a[1]), y1]
    ];
    let out = ring;
    for (let e = 0; e < 4; e++) {
        const inp = out; out = [];
        if (!inp.length) break;
        let prev = inp[inp.length - 1];
        for (const cur of inp) {
            const cIn = edges[e](cur), pIn = edges[e](prev);
            if (cIn) { if (!pIn) out.push(isect[e](prev, cur)); out.push(cur); }
            else if (pIn) out.push(isect[e](prev, cur));
            prev = cur;
        }
    }
    return out;
}

// Lijn knippen op een rechthoek: alleen punten binnen (met één punt marge)
function clipLine(line, x0, y0, x1, y1) {
    const inside = (p) => p[0] >= x0 && p[0] <= x1 && p[1] >= y0 && p[1] <= y1;
    const parts = []; let cur = [];
    line.forEach((p, i) => {
        const keepIt = inside(p) || (line[i - 1] && inside(line[i - 1])) || (line[i + 1] && inside(line[i + 1]));
        if (keepIt) cur.push(p); else if (cur.length) { parts.push(cur); cur = []; }
    });
    if (cur.length) parts.push(cur);
    return parts.filter((p) => p.length > 1);
}

function ringArea(r) {
    let a = 0;
    for (let i = 0, j = r.length - 1; i < r.length; j = i++) a += (r[j][0] + r[i][0]) * (r[j][1] - r[i][1]);
    return Math.abs(a / 2);
}

function pathFromRings(rings) {
    return rings.map((r) => 'M' + r.map((p) => r1(p[0]) + ',' + r1(p[1])).join('L') + 'Z').join('');
}
function pathFromLines(lines) {
    return lines.map((l) => 'M' + l.map((p) => r1(p[0]) + ',' + r1(p[1])).join('L')).join('');
}

function polygonsOf(geom) {
    if (geom.type === 'Polygon') return [geom.coordinates];
    if (geom.type === 'MultiPolygon') return geom.coordinates;
    return [];
}

function pointInRing(p, ring) {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const xi = ring[i][0], yi = ring[i][1], xj = ring[j][0], yj = ring[j][1];
        if ((yi > p[1]) !== (yj > p[1]) && p[0] < (xj - xi) * (p[1] - yi) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
}

// Labelpunt: het punt binnen de grootste ring dat het verst van de rand ligt
// (grove versie van "polylabel"). Een zwaartepunt valt bij Zeeland in zee.
function labelPoint(rings) {
    const ring = rings.slice().sort((a, b) => ringArea(b) - ringArea(a))[0];
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    ring.forEach((p) => { minX = Math.min(minX, p[0]); minY = Math.min(minY, p[1]); maxX = Math.max(maxX, p[0]); maxY = Math.max(maxY, p[1]); });
    let best = null, bestD = -1;
    const step = Math.max(maxX - minX, maxY - minY) / 60;
    for (let x = minX; x <= maxX; x += step) {
        for (let y = minY; y <= maxY; y += step) {
            if (!pointInRing([x, y], ring)) continue;
            let d = Infinity;
            for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) d = Math.min(d, sqSegDist([x, y], ring[j], ring[i]));
            if (d > bestD) { bestD = d; best = [x, y]; }
        }
    }
    return best;
}

module.exports = {
    r1, sqSegDist, simplify, clipRing, clipLine, ringArea,
    pathFromRings, pathFromLines, polygonsOf, pointInRing, labelPoint
};

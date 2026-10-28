/* ============================================
   TOPOGRAFIE - Afdrukken (window.TopoPrint)
   Versie: v1.0.0

   Maakt van een kaart een A4-oefenblad of een toets.

   Vaste afspraak op elke kaart (zoals in de atlas):
     1, 2, 3   plaatsen (ook hoofdsteden en eigen punten)
     A, B, C   wateren: zeeën, meren en rivieren
     a, b, c   gebieden: provincies, eilanden en streken
   Binnen elke soort wordt genummerd van noord naar zuid en van west naar
   oost, zodat een oefenblad en een toets van dezelfde kaart altijd
   dezelfde codes hebben.

   - Oefenblad: blad 1 ingevulde kaart, blad 2 blinde kaart.
   - Toets: blinde kaart met codes + antwoordlijnen (naast de kaart of op
     de achterkant), eventueel met een nakijkblad.
   ============================================ */

(function (global) {
    'use strict';

    var esc = function (s) { return MT.escapeHtml(s); };

    // ---------- Codes ----------
    function groepVan(o) {
        if (o.vorm === 'punt' && o.t !== 'g') return 'cijfer';
        if (o.soort === 'rivier' || o.soort === 'water') return 'hoofd';
        return 'klein';
    }

    function letters(n, hoofd) {
        var s = '';
        n++;
        while (n > 0) {
            var r = (n - 1) % 26;
            s = String.fromCharCode(65 + r) + s;
            n = Math.floor((n - 1) / 26);
        }
        return hoofd ? s : s.toLowerCase();
    }

    function positie(o) {
        return o.vorm === 'punt' ? { x: o.x, y: o.y } : { x: o.lx, y: o.ly };
    }

    // Geeft { key: code } en per groep de objecten in codevolgorde
    function codes(objs) {
        var groepen = { cijfer: [], hoofd: [], klein: [] };
        objs.forEach(function (o) { groepen[groepVan(o)].push(o); });
        var map = {};
        Object.keys(groepen).forEach(function (g) {
            // Banden van 70 kaarteenheden: binnen een band van west naar oost
            groepen[g].sort(function (a, b) {
                var pa = positie(a), pb = positie(b);
                var ba = Math.floor(pa.y / 70), bb = Math.floor(pb.y / 70);
                return ba !== bb ? ba - bb : pa.x - pb.x;
            });
            groepen[g].forEach(function (o, i) {
                map[o.key] = g === 'cijfer' ? String(i + 1) : letters(i, g === 'hoofd');
            });
        });
        return { code: map, groepen: groepen };
    }

    // ---------- Plek voor een code of naam ----------
    // Een provinciecode op het labelpunt kan precies op een stad vallen
    // (Flevoland en Lelystad, Utrecht en Utrecht). Dan schuiven we hem naar
    // het dichtstbijzijnde vrije punt binnen de provincie, of langs de rivier.
    function ringen(d) {
        return d.split('Z').filter(function (r) { return r.indexOf('M') !== -1; }).map(function (r) {
            return r.replace(/^[^M]*M/, '').split(/[LM]/).map(function (xy) { return xy.split(',').map(Number); });
        });
    }

    function binnen(pt, ring) {
        var inside = false;
        for (var i = 0, j = ring.length - 1; i < ring.length; j = i++) {
            var xi = ring[i][0], yi = ring[i][1], xj = ring[j][0], yj = ring[j][1];
            if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi) inside = !inside;
        }
        return inside;
    }

    // tekst(o) geeft { tekst, fs } voor wat er bij o komt te staan; we rekenen
    // met rechthoeken, want een plaatsnaam steekt rechts van zijn stip uit.
    function plekken(map, objs, tekst, rPunt, marge) {
        var breedte = function (t) { return t.tekst.length * t.fs * 0.58; };
        var hokje = function (o, x, y) {
            var t = tekst(o), b = breedte(t), hh = t.fs * 0.6;
            if (o.vorm === 'punt' && o.t !== 'g') return [x - rPunt, y - hh, x + rPunt * 1.8 + b, y + hh];
            if (o.vorm === 'lijn') return [x - b / 2, y - hh, x + b / 2, y + hh];
            return [x - Math.max(b, t.fs) / 2, y - hh, x + Math.max(b, t.fs) / 2, y + hh];
        };
        var bezet = objs.filter(function (o) { return o.vorm === 'punt'; }).map(function (o) { return hokje(o, o.x, o.y); });
        var vrij = function (h) {
            return bezet.every(function (b) {
                return h[2] + marge < b[0] || h[0] - marge > b[2] || h[3] + marge < b[1] || h[1] - marge > b[3];
            });
        };
        var uit = {};
        objs.forEach(function (o) {
            if (o.vorm === 'punt') return;
            var start = [o.lx, o.ly], kandidaten = [start];
            if (o.vorm === 'vlak') {
                var rs = ringen(o.d), x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
                rs.forEach(function (r) { r.forEach(function (p) { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); }); });
                for (var x = x0; x <= x1; x += 8) {
                    for (var y = y0; y <= y1; y += 8) {
                        var pt = [x, y];
                        if (rs.some(function (r) { return binnen(pt, r); })) kandidaten.push(pt);
                    }
                }
            } else {
                ringen(o.d + 'Z').forEach(function (r) {
                    r.forEach(function (p) { if (p[0] > 10 && p[0] < map.w - 10 && p[1] > 10 && p[1] < map.h - 10) kandidaten.push(p); });
                });
            }
            kandidaten.sort(function (a, b) {
                return Math.hypot(a[0] - start[0], a[1] - start[1]) - Math.hypot(b[0] - start[0], b[1] - start[1]);
            });
            var plek = kandidaten.filter(function (k) { return vrij(hokje(o, k[0], k[1])); })[0] || start;
            uit[o.key] = { x: plek[0], y: plek[1] };
            bezet.push(hokje(o, plek[0], plek[1]));
        });
        return uit;
    }

    var GROEP_TITEL = {
        cijfer: 'Plaatsen (1, 2, 3)',
        hoofd: 'Wateren (A, B, C)',
        klein: 'Gebieden (a, b, c)'
    };

    // ---------- Kaart als SVG ----------
    // stand: 'namen' (ingevuld), 'blind' (alleen markeringen), 'codes' (toets)
    // breedteMm: hoe breed de kaart op papier wordt, voor de lettergrootte
    // maxHoogteMm: hoe hoog de kaart op het blad mag worden
    function svg(map, objs, stand, codeMap, breedteMm, maxHoogteMm) {
        // Alleen het gebied rond de gekozen onderdelen, zodat een kaart van
        // West-Europa niet piepklein in de hoek van heel Europa staat
        var vb = TopoKaart.uitsnede(map, objs, null, 0.3);
        if (vb.h / vb.w * breedteMm > maxHoogteMm) {
            var w = vb.h * breedteMm / maxHoogteMm;
            vb.x -= (w - vb.w) / 2;
            vb.w = w;
        }
        var u = vb.w / breedteMm;   // kaarteenheden per mm
        var fsNaam = 2.5 * u, fsCode = 3 * u, rPunt = 0.9 * u, rCode = 2.2 * u;
        var halo = ' stroke="#fff" stroke-width="' + (0.8 * u).toFixed(1) + '" paint-order="stroke" stroke-linejoin="round"';
        var plek = plekken(map, objs, function (o) {
            if (stand === 'namen') return { tekst: o.naam, fs: fsNaam };
            if (stand === 'codes') return { tekst: codeMap[o.key], fs: o.vorm === 'punt' && o.t !== 'g' ? fsCode : rCode * 2 };
            return { tekst: '', fs: rPunt * 2 };
        }, rPunt, 0.6 * u);
        var h = [];
        h.push('<svg class="tp-kaart" viewBox="' + [vb.x, vb.y, vb.w, vb.h].map(function (n) { return n.toFixed(1); }).join(' ') + '" xmlns="http://www.w3.org/2000/svg">');
        h.push('<rect x="-1000" y="-1000" width="' + (map.w + 2000) + '" height="' + (map.h + 2000) + '" fill="#E6F2FA"/>');
        h.push('<path d="' + map.buurlanden + '" fill="#F2F2F2" stroke="#BBB" stroke-width="' + (0.15 * u).toFixed(1) + '"/>');
        map.provincies.forEach(function (p) {
            h.push('<path d="' + p.d + '" fill="#FFFFFF" stroke="#999" stroke-width="' + (0.18 * u).toFixed(1) + '"/>');
        });
        if (map.meren) h.push('<path d="' + map.meren + '" fill="#E6F2FA" stroke="#9CC6E4" stroke-width="' + (0.15 * u).toFixed(1) + '"/>');
        h.push('<g fill="none" stroke="#9CC6E4" stroke-width="' + (0.3 * u).toFixed(1) + '" stroke-linecap="round">');
        map.rivieren.forEach(function (r) { h.push('<path d="' + r.d + '"/>'); });
        h.push('</g>');

        objs.forEach(function (o) {
            if (o.vorm !== 'vlak') return;
            h.push('<path d="' + o.d + '" fill="#FFF0BF" stroke="#8A7A40" stroke-width="' + (0.3 * u).toFixed(1) + '"/>');
            // Dwergstaten zijn op papier te klein: een rondje eromheen
            if (o.stip) h.push('<circle cx="' + o.lx + '" cy="' + o.ly + '" r="' + (1.2 * u).toFixed(1) + '" fill="none" stroke="#8A7A40" stroke-width="' + (0.3 * u).toFixed(1) + '"/>');
        });
        objs.forEach(function (o) {
            if (o.vorm === 'lijn') h.push('<path d="' + o.d + '" fill="none" stroke="#2F86C9" stroke-width="' + (0.75 * u).toFixed(1) + '" stroke-linecap="round" stroke-linejoin="round"/>');
        });

        objs.forEach(function (o) {
            var p = plek[o.key] || positie(o);
            var plaats = o.vorm === 'punt' && o.t !== 'g';
            var water = o.soort === 'rivier' || o.soort === 'water';

            if (plaats) {
                h.push('<circle cx="' + p.x + '" cy="' + p.y + '" r="' + (o.groot ? rPunt * 1.3 : rPunt) + '" fill="#111" stroke="#fff" stroke-width="' + (0.3 * u).toFixed(1) + '"/>');
            }

            if (stand === 'namen') {
                var kleur = water ? '#1A5F99' : '#222';
                var stijl = (water ? ' font-style="italic"' : '') + (o.vorm === 'vlak' ? ' font-weight="700"' : ' font-weight="600"');
                var x = plaats ? p.x + rPunt * 1.8 : p.x;
                var anker = plaats ? 'start' : 'middle';
                h.push('<text x="' + x + '" y="' + (p.y + fsNaam * 0.35) + '" font-size="' + fsNaam.toFixed(1) + '" fill="' + kleur + '" text-anchor="' + anker + '"' + stijl + halo + '>' + esc(o.naam) + '</text>');
            } else if (stand === 'blind') {
                if (!plaats && o.vorm === 'punt') {
                    h.push('<circle cx="' + p.x + '" cy="' + p.y + '" r="' + (rPunt * 1.2) + '" fill="#fff" stroke="#111" stroke-width="' + (0.3 * u).toFixed(1) + '"/>');
                }
            } else {
                var code = codeMap[o.key];
                if (plaats) {
                    h.push('<text x="' + (p.x + rPunt * 1.8) + '" y="' + (p.y + fsCode * 0.35) + '" font-size="' + fsCode.toFixed(1) + '" font-weight="800" fill="#111"' + halo + '>' + esc(code) + '</text>');
                } else {
                    h.push('<circle cx="' + p.x + '" cy="' + p.y + '" r="' + rCode + '" fill="#fff" stroke="' + (water ? '#1A5F99' : '#111') + '" stroke-width="' + (0.3 * u).toFixed(1) + '"/>');
                    h.push('<text x="' + p.x + '" y="' + (p.y + fsCode * 0.35) + '" font-size="' + fsCode.toFixed(1) + '" font-weight="800" text-anchor="middle" fill="' + (water ? '#1A5F99' : '#111') + '">' + esc(code) + '</text>');
                }
            }
        });

        h.push('</svg>');
        return h.join('');
    }

    // ---------- Bladen ----------
    function kop(titel, sub, opties) {
        return '<div class="tp-kop">' +
            '<div><div class="tp-titel">' + esc(titel) + '</div><div class="tp-sub">' + esc(sub) + '</div></div>' +
            '<div class="tp-velden">' +
            (opties.naam ? '<div class="tp-veld">Naam: <span></span></div>' : '') +
            (opties.score ? '<div class="tp-veld kort">Score: <span></span> / ' + opties.score + '</div>' : '') +
            '</div></div>';
    }

    var LEGENDA = '<div class="tp-legenda"><b>1, 2, 3</b> = plaatsen &nbsp;&middot;&nbsp; <b>A, B, C</b> = wateren &nbsp;&middot;&nbsp; <b>a, b, c</b> = gebieden</div>';

    // lijnMm: hoogte van een antwoordregel (kleiner als er veel onderdelen zijn)
    function lijnen(c, metAntwoord, lijnMm) {
        var stijl = lijnMm ? ' style="height:' + lijnMm.toFixed(1) + 'mm"' : '';
        return ['cijfer', 'hoofd', 'klein'].filter(function (g) { return c.groepen[g].length; }).map(function (g) {
            return '<div class="tp-groep"><div class="tp-groep-titel">' + GROEP_TITEL[g] + '</div>' +
                c.groepen[g].map(function (o) {
                    return '<div class="tp-lijn"' + stijl + '><span class="tp-code">' + esc(c.code[o.key]) + '</span>' +
                        '<span class="tp-streep">' + (metAntwoord ? esc(o.naam) : '') + '</span></div>';
                }).join('') + '</div>';
        }).join('');
    }

    // soort: 'oefenblad' | 'toets'
    // opties: { naam: bool, layout: 'naast'|'achterkant', nakijk: bool }
    function html(map, objs, titel, soort, opties) {
        var bladen = [];
        if (soort === 'oefenblad') {
            bladen.push('<section class="tp-blad">' + kop(titel, 'Oefenblad · ingevulde kaart', opties) +
                '<div class="tp-kaart-vol">' + svg(map, objs, 'namen', null, 186, 228) + '</div></section>');
            bladen.push('<section class="tp-blad">' + kop(titel, 'Oefenblad · blinde kaart', opties) +
                '<div class="tp-kaart-vol">' + svg(map, objs, 'blind', null, 186, 228) + '</div></section>');
        } else {
            var c = codes(objs);
            var kopOpties = { naam: true, score: objs.length };
            // Naast de kaart is ongeveer 235 mm hoogte voor de lijnen; een
            // groepskop kost zo'n 8 mm. Past het niet meer met regels van
            // 6,5 mm, dan gaan de lijnen naar de achterkant.
            var groepen = ['cijfer', 'hoofd', 'klein'].filter(function (g) { return c.groepen[g].length; }).length;
            var lijnMm = Math.min(8.5, (235 - groepen * 8) / objs.length);
            if (opties.layout === 'naast' && lijnMm >= 6.5) {
                bladen.push('<section class="tp-blad">' + kop(titel, 'Toets topografie', kopOpties) + LEGENDA +
                    '<div class="tp-naast"><div class="tp-kaart-smal">' + svg(map, objs, 'codes', c.code, 112, 228) + '</div>' +
                    '<div class="tp-lijnen">' + lijnen(c, false, lijnMm) + '</div></div></section>');
            } else {
                bladen.push('<section class="tp-blad">' + kop(titel, 'Toets topografie', kopOpties) + LEGENDA +
                    '<div class="tp-kaart-vol">' + svg(map, objs, 'codes', c.code, 186, 222) + '</div></section>');
                bladen.push('<section class="tp-blad">' + kop(titel, 'Toets topografie · antwoorden', { naam: true }) +
                    '<div class="tp-lijnen tp-kolommen">' + lijnen(c, false) + '</div></section>');
            }
            if (opties.nakijk) {
                bladen.push('<section class="tp-blad">' + kop(titel, 'Nakijkblad voor de leerkracht', {}) +
                    '<div class="tp-lijnen tp-kolommen tp-nakijk">' + lijnen(c, true) + '</div></section>');
            }
        }
        return bladen.join('');
    }

    // Zet de bladen in de pagina, opent het printvenster en ruimt daarna op
    function afdrukken(inhoud) {
        var oud = document.getElementById('topoPrint');
        if (oud) oud.remove();
        var div = document.createElement('div');
        div.id = 'topoPrint';
        div.className = 'topo-print';
        div.innerHTML = inhoud;
        document.body.appendChild(div);
        document.body.classList.add('topo-printen');
        function klaar() {
            document.body.classList.remove('topo-printen');
            div.remove();
            window.removeEventListener('afterprint', klaar);
        }
        window.addEventListener('afterprint', klaar);
        setTimeout(function () { window.print(); }, 50);
    }

    global.TopoPrint = { codes: codes, html: html, afdrukken: afdrukken };
})(window);

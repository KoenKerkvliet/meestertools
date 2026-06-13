/* ============================================
   REKENRACE - blok-catalogus + somgenerator

   Eén gedeelde bron voor:
   - de leerkracht-pagina (rekenmuur tekenen, blok kiezen)
   - de leerlingkant (sommen genereren tijdens de race)

   De rekenmuur (Bareka) staat volledig in MT_REKENRACE_BLOCKS, van fase 4
   (boven) naar fase 1A (onder), net als op de poster. In deze eerste versie
   is alleen FASE 1A speelbaar (active:true). Alle andere cellen zijn zichtbaar
   maar "under construction".

   generateSum(blockId) -> { prompt, answer }   (answer is een getal)
   ============================================ */

(function () {
    // ---------- De volledige rekenmuur ----------
    // kind: 'auto' (flitssom), 'getalbegrip' (witte blokken), 'thema' (fase 4)
    const BLOCKS = [
        {
            fase: '4', label: 'FASE 4',
            rows: [
                [
                    { id: '4_lengte', label: 'Lengtematen', kind: 'thema', active: true },
                    { id: '4_inhoud', label: 'Inhoud / Gewicht', kind: 'thema', active: true },
                    { id: '4_omtrek', label: 'Omtrek / Opp.', kind: 'thema', active: true },
                    { id: '4_grafieken', label: 'Grafieken', kind: 'thema', active: true }
                ],
                [
                    { id: '4_breuken', label: 'Breuken', kind: 'thema', active: true },
                    { id: '4_procenten', label: 'Procenten', kind: 'thema', active: true },
                    { id: '4_komma', label: 'Kommagetallen', kind: 'thema', active: true }
                ]
            ]
        },
        {
            fase: '3', label: 'FASE 3',
            rows: [
                [
                    { id: '3_optellen', label: 'Optellen', kind: 'auto', active: true },
                    { id: '3_vermenigvuldigen', label: 'Vermenigvuldigen', kind: 'auto', active: true },
                    { id: '3_delen', label: 'Delen', kind: 'auto', active: true },
                    { id: '3_aftrekken', label: 'Aftrekken', kind: 'auto', active: true }
                ],
                [
                    { id: '3_gb10000', label: 'Getalbegrip tot 10.000', kind: 'getalbegrip', active: true },
                    { id: '3_gb100000', label: 'Getalbegrip tot 100.000', kind: 'getalbegrip', active: true }
                ]
            ]
        },
        {
            fase: '2', label: 'FASE 2',
            rows: [
                [
                    { id: '2_opt_hte', label: '563 + 230', kind: 'auto', active: true },
                    { id: '2_opt_te', label: '56 + 28', kind: 'auto', active: true },
                    { id: '2_tafels', label: '7 × 8', kind: 'auto', active: true },
                    { id: '2_delen', label: '12 : 4', kind: 'auto', active: true },
                    { id: '2_aftr_te', label: '56 − 28', kind: 'auto', active: true },
                    { id: '2_aftr_hte', label: '563 − 230', kind: 'auto', active: true }
                ],
                [
                    { id: '2_gb1000', label: 'Getalbegrip tot 1000', kind: 'getalbegrip', active: true }
                ]
            ]
        },
        {
            fase: '1B', label: 'FASE 1B',
            rows: [
                [
                    { id: '1b_opt_tiental', label: '56 + 20', kind: 'auto', active: true },
                    { id: '1b_opt_eenheden', label: '56 + 8', kind: 'auto', active: true },
                    { id: '1b_tafels', label: '3 × 4', kind: 'auto', active: true },
                    { id: '1b_aftr_eenheden', label: '56 − 8', kind: 'auto', active: true },
                    { id: '1b_aftr_tiental', label: '56 − 20', kind: 'auto', active: true }
                ],
                [
                    { id: '1b_plus10', label: '+10', kind: 'auto', active: true },
                    { id: '1b_plus1', label: '+1', kind: 'auto', active: true },
                    { id: '1b_gb100', label: 'Getalbegrip tot 100', kind: 'getalbegrip', active: true },
                    { id: '1b_min1', label: '−1', kind: 'auto', active: true },
                    { id: '1b_min10', label: '−10', kind: 'auto', active: true }
                ]
            ]
        },
        {
            fase: '1A', label: 'FASE 1A',
            rows: [
                [
                    { id: '1a_opt_t10', label: '5 + 2', kind: 'auto', active: true },
                    { id: '1a_opt_t20_zonder', label: '15 + 2', kind: 'auto', active: true },
                    { id: '1a_opt_t20_met', label: '6 + 8', kind: 'auto', active: true },
                    { id: '1a_splitsen', label: '8 = 5 en 3', kind: 'auto', active: true },
                    { id: '1a_aftr_t20_met', label: '16 − 8', kind: 'auto', active: true },
                    { id: '1a_aftr_t20_zonder', label: '15 − 2', kind: 'auto', active: true },
                    { id: '1a_aftr_t10', label: '5 − 2', kind: 'auto', active: true }
                ],
                [
                    { id: '1a_gb10', label: 'Getalbegrip tot 10', kind: 'getalbegrip', active: true },
                    { id: '1a_gb20', label: 'Getalbegrip tot 20', kind: 'getalbegrip', active: true }
                ]
            ]
        }
    ];

    // Snelle lookup id -> cel
    const BY_ID = {};
    BLOCKS.forEach(f => f.rows.forEach(r => r.forEach(c => { BY_ID[c.id] = c; })));

    function getBlock(id) { return BY_ID[id] || null; }

    // ---------- Som-generatoren (alleen FASE 1A in v1) ----------
    const MINUS = '−'; // echte min-teken voor nette weergave

    function ri(min, max) { return min + Math.floor(Math.random() * (max - min + 1)); }
    function fmtNum(n) { try { return n.toLocaleString('nl-NL'); } catch (e) { return String(n); } }

    // Getalbegrip: opvolger/voorganger/tussen/aanvullen (kleine ranges) en
    // +eenheid / -eenheid / afronden / aanvullen-tot-volgende (grote ranges).
    function makeGB(max, unit, roundName) {
        return function () {
            if (unit < 10) {
                const t = ri(1, 4);
                if (t === 1) { const n = ri(0, max - 1); return { prompt: 'Welk getal komt ná ' + n + '?', answer: n + 1 }; }
                if (t === 2) { const n = ri(1, max); return { prompt: 'Welk getal komt vóór ' + n + '?', answer: n - 1 }; }
                if (t === 3) { const n = ri(1, max - 1); return { prompt: 'Welk getal zit tussen ' + (n - 1) + ' en ' + (n + 1) + '?', answer: n }; }
                const n = ri(0, max); return { prompt: n + ' + … = ' + max, answer: max - n };
            }
            const t = ri(1, 6);
            if (t === 1) { const n = ri(0, max - 1); return { prompt: 'Welk getal komt ná ' + fmtNum(n) + '?', answer: n + 1 }; }
            if (t === 2) { const n = ri(1, max); return { prompt: 'Welk getal komt vóór ' + fmtNum(n) + '?', answer: n - 1 }; }
            if (t === 3) { const n = ri(unit, max - unit); return { prompt: fmtNum(n) + ' + ' + fmtNum(unit) + ' = ?', answer: n + unit }; }
            if (t === 4) { const n = ri(unit * 2, max); return { prompt: fmtNum(n) + ' ' + MINUS + ' ' + fmtNum(unit) + ' = ?', answer: n - unit }; }
            if (t === 5) { const base = ri(1, Math.floor(max / unit) - 1); const n = base * unit + ri(1, unit - 1); return { prompt: 'Rond ' + fmtNum(n) + ' af op ' + roundName + ': ?', answer: Math.round(n / unit) * unit }; }
            const n = ri(1, max - 1); const next = Math.ceil((n + 1) / unit) * unit;
            return { prompt: 'Hoeveel erbij van ' + fmtNum(n) + ' tot ' + fmtNum(next) + '?', answer: next - n };
        };
    }

    // Grafieken: een mini-staafgrafiek (SVG) + een leesvraag. generateSum geeft
    // hier een 'html'-veld terug; de speelpagina toont dat i.p.v. platte tekst.
    function makeGraph() {
        const labels = ['A', 'B', 'C', 'D'];
        const colors = ['#6C63FF', '#34C759', '#FF9F40', '#FF7AA8'];
        const vals = labels.map(() => ri(1, 10));
        const W = 360, H = 200, padL = 30, padB = 26, padT = 12;
        const plotH = H - padB - padT, plotW = W - padL - 10;
        const maxY = 10, unitH = plotH / maxY, gap = plotW / labels.length, bw = gap * 0.55;
        let g = '';
        for (let y = 0; y <= maxY; y++) {
            const yy = padT + plotH - y * unitH;
            g += '<line x1="' + padL + '" y1="' + yy + '" x2="' + (W - 6) + '" y2="' + yy + '" stroke="#E8E6F4" stroke-width="1"/>';
            if (y % 2 === 0) g += '<text x="' + (padL - 6) + '" y="' + (yy + 4) + '" font-size="11" fill="#9A96B8" text-anchor="end">' + y + '</text>';
        }
        labels.forEach(function (lb, i) {
            const x = padL + gap * i + (gap - bw) / 2;
            const bh = vals[i] * unitH, yy = padT + plotH - bh;
            g += '<rect x="' + x + '" y="' + yy + '" width="' + bw + '" height="' + bh + '" rx="3" fill="' + colors[i] + '"/>';
            g += '<text x="' + (x + bw / 2) + '" y="' + (padT + plotH + 16) + '" font-size="13" fill="#2D3436" text-anchor="middle" font-weight="700">' + lb + '</text>';
        });
        const svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" style="max-width:360px;height:auto;">' + g + '</svg>';
        const t = ri(1, 3);
        let q, ans;
        if (t === 1) { const i = ri(0, 3); q = 'Hoeveel is staaf ' + labels[i] + '?'; ans = vals[i]; }
        else if (t === 2) { let i = ri(0, 3), j = ri(0, 3); while (j === i) j = ri(0, 3); q = 'Hoeveel zijn ' + labels[i] + ' en ' + labels[j] + ' samen?'; ans = vals[i] + vals[j]; }
        else { let i = ri(0, 3), j = ri(0, 3); while (j === i) j = ri(0, 3); if (vals[i] < vals[j]) { const k = i; i = j; j = k; } q = 'Hoeveel meer is ' + labels[i] + ' dan ' + labels[j] + '?'; ans = vals[i] - vals[j]; }
        const html = '<div style="font-size:18px;font-weight:700;margin-bottom:8px;color:#2D3436;">' + q + '</div>' + svg;
        return { prompt: q, answer: ans, html: html };
    }

    const GENERATORS = {
        // 5 + 2  -> optellen tot 10
        '1a_opt_t10': function () {
            const a = ri(1, 8);
            const b = ri(1, 10 - a);
            return { prompt: a + ' + ' + b, answer: a + b };
        },
        // 15 + 2 -> tot 20, zonder tiental-overbrugging
        '1a_opt_t20_zonder': function () {
            const u = ri(1, 8);
            const a = 10 + u;
            const b = ri(1, 9 - u);
            return { prompt: a + ' + ' + b, answer: a + b };
        },
        // 6 + 8  -> tot 20, met overbrugging van 10
        '1a_opt_t20_met': function () {
            let a, b;
            do { a = ri(2, 9); b = ri(2, 9); } while (a + b <= 10 || a + b > 18);
            return { prompt: a + ' + ' + b, answer: a + b };
        },
        // 8 = 5 en ? -> splitsen tot 10
        '1a_splitsen': function () {
            const t = ri(5, 10);
            const p = ri(1, t - 1);
            return { prompt: t + ' = ' + p + ' en ?', answer: t - p };
        },
        // 16 - 8 -> tot 20, met overbrugging (lenen)
        '1a_aftr_t20_met': function () {
            const u = ri(1, 7);
            const a = 10 + u;
            const b = ri(u + 1, 9);
            return { prompt: a + ' ' + MINUS + ' ' + b, answer: a - b };
        },
        // 15 - 2 -> tot 20, zonder lenen
        '1a_aftr_t20_zonder': function () {
            const u = ri(1, 9);
            const a = 10 + u;
            const b = ri(1, u);
            return { prompt: a + ' ' + MINUS + ' ' + b, answer: a - b };
        },
        // 5 - 2 -> aftrekken tot 10
        '1a_aftr_t10': function () {
            const a = ri(2, 10);
            const b = ri(1, a);
            return { prompt: a + ' ' + MINUS + ' ' + b, answer: a - b };
        },

        // ---------- FASE 1B (tot 100) ----------
        // 56 + 20 -> TE + heel tiental
        '1b_opt_tiental': function () {
            const t = ri(2, 7), u = ri(1, 9);
            const a = t * 10 + u;
            const b = ri(1, 9 - t) * 10;
            return { prompt: a + ' + ' + b, answer: a + b };
        },
        // 56 + 8 -> TE + eenheden, met overbrugging
        '1b_opt_eenheden': function () {
            const t = ri(1, 8);
            let u, b;
            do { u = ri(2, 9); b = ri(2, 9); } while (u + b <= 10 || u + b > 18);
            const a = t * 10 + u;
            return { prompt: a + ' + ' + b, answer: a + b };
        },
        // 3 x 4 -> kleine tafels (1, 2, 3, 4, 5, 10)
        '1b_tafels': function () {
            const set = [1, 2, 3, 4, 5, 10];
            const a = set[ri(0, set.length - 1)];
            const b = ri(1, 10);
            return { prompt: a + ' × ' + b, answer: a * b };
        },
        // 56 - 8 -> TE - eenheden, met lenen
        '1b_aftr_eenheden': function () {
            const t = ri(1, 8), u = ri(0, 8);
            const b = ri(u + 1, 9);
            const a = t * 10 + u;
            return { prompt: a + ' ' + MINUS + ' ' + b, answer: a - b };
        },
        // 56 - 20 -> TE - heel tiental
        '1b_aftr_tiental': function () {
            const t = ri(2, 8), u = ri(1, 9);
            const a = t * 10 + u;
            const b = ri(1, t - 1) * 10;
            return { prompt: a + ' ' + MINUS + ' ' + b, answer: a - b };
        },
        // Buurgetallen (+10 / +1 / -1 / -10)
        '1b_plus10': function () { const a = ri(1, 89); return { prompt: a + ' + 10', answer: a + 10 }; },
        '1b_plus1': function () { const a = ri(1, 98); return { prompt: a + ' + 1', answer: a + 1 }; },
        '1b_min1': function () { const a = ri(2, 99); return { prompt: a + ' ' + MINUS + ' 1', answer: a - 1 }; },
        '1b_min10': function () { const a = ri(11, 99); return { prompt: a + ' ' + MINUS + ' 10', answer: a - 10 }; },

        // ---------- FASE 2 (tot 1000) ----------
        // 563 + 230 -> HTE + HTE zonder overbrugging
        '2_opt_hte': function () {
            const ah = ri(1, 8), bh = ri(1, 9 - ah);
            const at = ri(0, 8), bt = ri(0, 9 - at);
            const au = ri(0, 9), bu = ri(0, 9 - au);
            const a = ah * 100 + at * 10 + au;
            const b = bh * 100 + bt * 10 + bu;
            return { prompt: a + ' + ' + b, answer: a + b };
        },
        // 56 + 28 -> TE + TE met overbrugging
        '2_opt_te': function () {
            let t1, u1, t2, u2, a, b;
            do {
                t1 = ri(1, 7); u1 = ri(2, 9);
                t2 = ri(1, 7); u2 = ri(2, 9);
                a = t1 * 10 + u1; b = t2 * 10 + u2;
            } while (u1 + u2 <= 10 || a + b > 99);
            return { prompt: a + ' + ' + b, answer: a + b };
        },
        // 7 x 8 -> alle tafels
        '2_tafels': function () {
            const a = ri(1, 10), b = ri(1, 10);
            return { prompt: a + ' × ' + b, answer: a * b };
        },
        // 12 : 4 -> deeltafels
        '2_delen': function () {
            const b = ri(2, 10), q = ri(1, 10);
            const a = b * q;
            return { prompt: a + ' : ' + b, answer: q };
        },
        // 56 - 28 -> TE - TE met lenen
        '2_aftr_te': function () {
            const t1 = ri(2, 9), u1 = ri(0, 8);
            const u2 = ri(u1 + 1, 9);
            const t2 = ri(1, t1 - 1);
            const a = t1 * 10 + u1, b = t2 * 10 + u2;
            return { prompt: a + ' ' + MINUS + ' ' + b, answer: a - b };
        },
        // 563 - 230 -> HTE - HTE zonder lenen
        '2_aftr_hte': function () {
            const ah = ri(2, 9), bh = ri(1, ah - 1);
            const at = ri(0, 9), bt = ri(0, at);
            const au = ri(0, 9), bu = ri(0, au);
            const a = ah * 100 + at * 10 + au;
            const b = bh * 100 + bt * 10 + bu;
            return { prompt: a + ' ' + MINUS + ' ' + b, answer: a - b };
        },

        // ---------- FASE 3 (vlot rekenen, grotere getallen) ----------
        '3_optellen': function () {
            const a = ri(100, 899), b = ri(100, 899);
            return { prompt: a + ' + ' + b, answer: a + b };
        },
        '3_aftrekken': function () {
            const a = ri(300, 999), b = ri(100, a - 100);
            return { prompt: a + ' ' + MINUS + ' ' + b, answer: a - b };
        },
        '3_vermenigvuldigen': function () {
            const a = ri(11, 99), b = ri(2, 9);
            return { prompt: a + ' × ' + b, answer: a * b };
        },
        '3_delen': function () {
            const b = ri(2, 9), q = ri(11, 49);
            const a = b * q;
            return { prompt: a + ' : ' + b, answer: q };
        },

        // ---------- FASE 4 (maten, breuken, procenten, kommagetallen) ----------
        // Antwoorden zijn altijd hele getallen (past bij het cijfertoetsenbord).
        '4_lengte': function () {
            const pairs = [['km', 'm', 1000], ['m', 'cm', 100], ['cm', 'mm', 10], ['m', 'dm', 10], ['dm', 'cm', 10], ['m', 'mm', 1000]];
            const p = pairs[ri(0, pairs.length - 1)];
            const v = ri(2, 9);
            return { prompt: v + ' ' + p[0] + ' = … ' + p[1], answer: v * p[2] };
        },
        '4_inhoud': function () {
            const pairs = [['kg', 'g', 1000], ['l', 'ml', 1000], ['l', 'dl', 10], ['kg', 'hg', 10], ['ton', 'kg', 1000], ['l', 'cl', 100]];
            const p = pairs[ri(0, pairs.length - 1)];
            const v = ri(2, 9);
            return { prompt: v + ' ' + p[0] + ' = … ' + p[1], answer: v * p[2] };
        },
        '4_omtrek': function () {
            const type = ri(1, 4);
            if (type === 1) { const z = ri(2, 12); return { prompt: 'Omtrek vierkant, zijde ' + z, answer: 4 * z }; }
            if (type === 2) { const z = ri(2, 12); return { prompt: 'Opp. vierkant, zijde ' + z, answer: z * z }; }
            if (type === 3) { const l = ri(2, 12), b = ri(2, 12); return { prompt: 'Opp. rechthoek ' + l + ' × ' + b, answer: l * b }; }
            const l = ri(2, 12), b = ri(2, 12); return { prompt: 'Omtrek rechthoek ' + l + ' bij ' + b, answer: 2 * (l + b) };
        },
        '4_breuken': function () {
            const fr = [[1, 2], [1, 3], [1, 4], [1, 5], [2, 3], [3, 4], [2, 5], [3, 5]];
            const f = fr[ri(0, fr.length - 1)];
            const m = ri(2, 8);
            const N = f[1] * m;
            return { prompt: f[0] + '/' + f[1] + ' van ' + N, answer: f[0] * m };
        },
        '4_procenten': function () {
            const pcts = [10, 20, 25, 50, 75];
            const pct = pcts[ri(0, pcts.length - 1)];
            const base = pct === 10 ? 10 : pct === 20 ? 5 : pct === 50 ? 2 : 4; // veelvoud zodat het uitkomt
            const N = base * ri(2, 20);
            return { prompt: pct + '% van ' + N, answer: Math.round(N * pct / 100) };
        },
        // Kommagetallen -> echte decimale antwoorden (knoppenbalk met komma).
        '4_komma': function () {
            function ft(t) { return Math.floor(t / 10) + ',' + (t % 10); } // tienden -> "2,3"
            const type = ri(1, 4);
            if (type === 1) { const a = ri(1, 18), b = ri(1, 18); return { prompt: ft(a) + ' + ' + ft(b), answer: (a + b) / 10 }; }
            if (type === 2) { const a = ri(6, 30), b = ri(1, a - 1); return { prompt: ft(a) + ' ' + MINUS + ' ' + ft(b), answer: (a - b) / 10 }; }
            if (type === 3) { const n = ri(1, 9); return { prompt: n + ' × 0,5', answer: n / 2 }; }
            const a = ri(11, 99); return { prompt: ft(a) + ' × 10', answer: a };
        },

        // ---------- Getalbegrip ----------
        '1a_gb10': makeGB(10, 0, ''),
        '1a_gb20': makeGB(20, 0, ''),
        '1b_gb100': makeGB(100, 10, 'tientallen'),
        '2_gb1000': makeGB(1000, 100, 'honderdtallen'),
        '3_gb10000': makeGB(10000, 1000, 'duizendtallen'),
        '3_gb100000': makeGB(100000, 10000, 'tienduizendtallen'),

        // ---------- Grafieken ----------
        '4_grafieken': makeGraph
    };

    function generateSum(blockId) {
        const gen = GENERATORS[blockId];
        if (!gen) return null;
        return gen();
    }

    // ---------- Beheersings-norm (spiegelt de Edge Function) ----------
    // Bron van waarheid is de Edge Function; dit is alleen voor het directe
    // eindscherm-label. De echte muur komt altijd van 'mywall'.
    const NORM = { accuracy: 90, secPerSum: 4, minGreen: 8, minVerdict: 4 };
    function verdictFor(s) {
        const a = (s && s.answered) || 0;
        if (a < NORM.minVerdict) return null;
        const acc = Math.round(((s.correct || 0) / a) * 100);
        const avgSec = s.totalMs > 0 ? (s.totalMs / a / 1000) : 999;
        const green = a >= NORM.minGreen && acc >= NORM.accuracy && avgSec <= NORM.secPerSum;
        return { status: green ? 'green' : 'orange', accuracy: acc };
    }

    // ---------- Gedeelde wall-renderer (read-only, ingekleurd) ----------
    // statusByBlockId: { blockId: { status:'green'|'orange', regressed:bool } } (of 'green'/'orange' string)
    // opts: { highlight: blockId, hideFaseLabel: bool }
    function wallHtml(statusByBlockId, opts) {
        opts = opts || {};
        const map = statusByBlockId || {};
        function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
        function entry(id) {
            const v = map[id];
            if (!v) return null;
            return typeof v === 'string' ? { status: v, regressed: false } : v;
        }
        return BLOCKS.map(function (f) {
            const rows = f.rows.map(function (row) {
                return '<div class="rr-wall-row">' + row.map(function (c) {
                    const cls = ['rr-cell', 'rr-cell-' + c.kind, 'rr-cell-view'];
                    if (c.active) {
                        const e = entry(c.id);
                        if (e && e.status === 'green') cls.push('is-green');
                        else if (e && e.status === 'orange') cls.push('is-orange');
                        else cls.push('is-grey');
                        if (e && e.regressed) cls.push('is-regressed');
                        if (opts.clickable) cls.push('is-clickable');
                    } else {
                        cls.push('is-locked');
                    }
                    if (opts.highlight && c.id === opts.highlight) cls.push('is-highlight');
                    const seintje = (c.active && entry(c.id) && entry(c.id).regressed)
                        ? '<span class="rr-cell-flag" title="Laatste keer minder">!</span>' : '';
                    const data = c.active ? ' data-block="' + c.id + '"' : '';
                    return '<div class="' + cls.join(' ') + '"' + data + '>' +
                        '<span class="rr-cell-label">' + esc(c.label) + '</span>' + seintje + '</div>';
                }).join('') + '</div>';
            }).join('');
            const lbl = opts.hideFaseLabel ? '' : '<div class="rr-fase-label">' + esc(f.label) + '</div>';
            return '<div class="rr-fase">' + lbl + '<div class="rr-fase-rows">' + rows + '</div></div>';
        }).join('');
    }

    window.MT_REKENRACE_BLOCKS = BLOCKS;
    window.MTRekenrace = {
        blocks: BLOCKS,
        getBlock: getBlock,
        generateSum: generateSum,
        hasGenerator: function (id) { return !!GENERATORS[id]; },
        NORM: NORM,
        verdictFor: verdictFor,
        wallHtml: wallHtml
    };
})();

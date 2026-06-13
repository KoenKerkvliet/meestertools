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
                    { id: '4_lengte', label: 'Lengtematen', kind: 'thema', active: false },
                    { id: '4_inhoud', label: 'Inhoud / Gewicht', kind: 'thema', active: false },
                    { id: '4_omtrek', label: 'Omtrek / Opp.', kind: 'thema', active: false },
                    { id: '4_grafieken', label: 'Grafieken', kind: 'thema', active: false }
                ],
                [
                    { id: '4_breuken', label: 'Breuken', kind: 'thema', active: false },
                    { id: '4_procenten', label: 'Procenten', kind: 'thema', active: false },
                    { id: '4_komma', label: 'Kommagetallen', kind: 'thema', active: false }
                ]
            ]
        },
        {
            fase: '3', label: 'FASE 3',
            rows: [
                [
                    { id: '3_optellen', label: 'Optellen', kind: 'auto', active: false },
                    { id: '3_vermenigvuldigen', label: 'Vermenigvuldigen', kind: 'auto', active: false },
                    { id: '3_delen', label: 'Delen', kind: 'auto', active: false },
                    { id: '3_aftrekken', label: 'Aftrekken', kind: 'auto', active: false }
                ],
                [
                    { id: '3_gb10000', label: 'Getalbegrip tot 10.000', kind: 'getalbegrip', active: false },
                    { id: '3_gb100000', label: 'Getalbegrip tot 100.000', kind: 'getalbegrip', active: false }
                ]
            ]
        },
        {
            fase: '2', label: 'FASE 2',
            rows: [
                [
                    { id: '2_opt_hte', label: '563 + 230', kind: 'auto', active: false },
                    { id: '2_opt_te', label: '56 + 28', kind: 'auto', active: false },
                    { id: '2_tafels', label: '7 × 8', kind: 'auto', active: false },
                    { id: '2_delen', label: '12 : 4', kind: 'auto', active: false },
                    { id: '2_aftr_te', label: '56 − 28', kind: 'auto', active: false },
                    { id: '2_aftr_hte', label: '563 − 230', kind: 'auto', active: false }
                ],
                [
                    { id: '2_gb1000', label: 'Getalbegrip tot 1000', kind: 'getalbegrip', active: false }
                ]
            ]
        },
        {
            fase: '1B', label: 'FASE 1B',
            rows: [
                [
                    { id: '1b_opt_tiental', label: '56 + 20', kind: 'auto', active: false },
                    { id: '1b_opt_eenheden', label: '56 + 8', kind: 'auto', active: false },
                    { id: '1b_tafels', label: '3 × 4', kind: 'auto', active: false },
                    { id: '1b_aftr_eenheden', label: '56 − 8', kind: 'auto', active: false },
                    { id: '1b_aftr_tiental', label: '56 − 20', kind: 'auto', active: false }
                ],
                [
                    { id: '1b_plus10', label: '+10', kind: 'auto', active: false },
                    { id: '1b_plus1', label: '+1', kind: 'auto', active: false },
                    { id: '1b_gb100', label: 'Getalbegrip tot 100', kind: 'getalbegrip', active: false },
                    { id: '1b_min1', label: '−1', kind: 'auto', active: false },
                    { id: '1b_min10', label: '−10', kind: 'auto', active: false }
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
                    { id: '1a_gb10', label: 'Getalbegrip tot 10', kind: 'getalbegrip', active: false },
                    { id: '1a_gb20', label: 'Getalbegrip tot 20', kind: 'getalbegrip', active: false }
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
        }
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
                    } else {
                        cls.push('is-locked');
                    }
                    if (opts.highlight && c.id === opts.highlight) cls.push('is-highlight');
                    const seintje = (c.active && entry(c.id) && entry(c.id).regressed)
                        ? '<span class="rr-cell-flag" title="Laatste keer minder">!</span>' : '';
                    return '<div class="' + cls.join(' ') + '">' +
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

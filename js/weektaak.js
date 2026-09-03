/* ============================================
   MEESTERTOOLS - Weektaak (leerkrachtkant)
   Versie: v1.0.0

   Een digitale weektaak. De leerkracht zet één keer een basisrooster op,
   kopieert dat per week en hangt er moet- en magwerk aan. Kinderen zien hun
   eigen week op /leerling en vinken zelf af.

   Drie dingen die het ontwerp bepalen:

   1. Een week is een KOPIE van het basisrooster, geen verwijzing ernaar.
      Verschuif je in november een gymles in je sjabloon, dan mogen de weken
      van september daar niet in meebewegen. Binnen een week schuif je vrij
      (excursie, toetsweek) zonder je sjabloon te raken.

   2. Werk kan op drie plekken staan, met een duidelijk verschil in bedoeling:
      les  = "dit doe je nu"        (sturing)
      dag  = "dit doe je vandaag"
      week = "dit moet voor vrijdag af, plan het zelf"  (eigenaarschap)
      De daglaag verschijnt alleen als er iets in staat.

   3. Werk is standaard voor de hele klas. Wil je het voor een paar kinderen,
      dan kies je een groepje (dat je één keer aanmaakt) of losse kinderen.
      Een groepje wordt bij het tonen opgelost, dus een kind dat later bij het
      groeilab komt krijgt het werk vanzelf ook.

   Premium: app.js stuurt niet-abonnees terug naar het dashboard, maar het
   échte slot zit in de database (group_has_premium in de RLS-policies).
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    if (!document.getElementById('wtMain')) return;

    var PX_PER_MIN = 1;      // hoogte van een lesblok
    var PAUZE_PX = 18;       // pauzes zijn een streepje, niet op schaal
    var DAGNAMEN = ['', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag'];
    var LESTYPES = [
        ['instructie', 'Instructie'], ['zelfstandig', 'Zelfstandig werken'],
        ['gym', 'Gym'], ['creatief', 'Creatief'], ['toets', 'Toets'],
        ['overig', 'Overig'], ['start', 'Dagstart / afsluiting']
    ];

    // Als een klas nog niets heeft ingesteld: een gewone Nederlandse schoolweek.
    var STANDAARD_DAGEN = [
        { dag: 1, start: '08:30', eind: '15:15' }, { dag: 2, start: '08:30', eind: '15:15' },
        { dag: 3, start: '08:30', eind: '12:30' }, { dag: 4, start: '08:30', eind: '15:15' },
        { dag: 5, start: '08:30', eind: '15:15' }
    ];
    var STANDAARD_PAUZES = [
        { naam: 'pauze', van: '10:15', tot: '10:30', dagen: [1, 2, 3, 4, 5] },
        { naam: 'lunch', van: '12:30', tot: '13:00', dagen: [1, 2, 4, 5] },
        { naam: 'grote pauze', van: '13:00', tot: '13:45', dagen: [1, 2, 4, 5] }
    ];

    var $ = function (id) { return document.getElementById(id); };
    var esc = function (s) { return MT.escapeHtml(s); };

    // ---------- Toestand ----------
    var user = null;
    var groupId = '';
    var instellingen = { dagen: STANDAARD_DAGEN, pauzes: STANDAARD_PAUZES };
    var vakken = [];
    var basisrooster = [];
    var groepjes = [];          // [{id, naam, leden:[studentId]}]
    var leerlingen = [];
    var jaar = 0, weeknr = 0;
    var week = null;            // rij uit weektaak_weken, of null
    var items = [];
    var werkContext = null;     // { niveau, dag, les_id, titel, context }
    var nieuweSoort = 'moet';
    var doelType = 'klas';
    var doelGroepje = '';
    var doelKinderen = {};
    var lesBewerken = null;     // { id, dag } tijdens het bewerken van het basisrooster

    // ---------- Kleine helpers ----------
    function toast(msg) {
        var el = $('wtToast');
        el.textContent = msg;
        el.classList.add('visible');
        clearTimeout(toast._t);
        toast._t = setTimeout(function () { el.classList.remove('visible'); }, 2400);
    }
    function hhmm(t) { return String(t || '').slice(0, 5); }
    function minuten(t) {
        var d = hhmm(t).split(':');
        return (parseInt(d[0], 10) || 0) * 60 + (parseInt(d[1], 10) || 0);
    }
    function duurTekst(van, tot) {
        var m = minuten(tot) - minuten(van);
        if (m < 60) return m + ' min';
        var u = Math.floor(m / 60), r = m % 60;
        return r ? u + ' u ' + r + ' min' : u + ' uur';
    }
    function uuid() {
        if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0;
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }
    function dagInstelling(dag) {
        for (var i = 0; i < instellingen.dagen.length; i++) {
            if (instellingen.dagen[i].dag === dag) return instellingen.dagen[i];
        }
        return { dag: dag, start: '08:30', eind: '15:15' };
    }
    function pauzesVoor(dag) {
        return (instellingen.pauzes || []).filter(function (p) {
            return !p.dagen || p.dagen.indexOf(dag) !== -1;
        }).slice().sort(function (a, b) { return minuten(a.van) - minuten(b.van); });
    }
    function leerlingNaam(s) {
        var achter = (s.name_suffix || '').trim();
        return s.first_name + (achter ? ' ' + achter + '.' : '');
    }

    /* Wie ziet dit werkje? Een groepje wordt hier opgelost en niet bij het
       opslaan, zodat een kind dat later bij het groeilab komt het werk vanzelf
       ook krijgt. */
    function doelLabel(doel) {
        if (!doel || doel.type === 'klas') return '';
        if (doel.type === 'groepje') {
            for (var i = 0; i < groepjes.length; i++) {
                if (groepjes[i].id === doel.id) return groepjes[i].naam;
            }
            return 'groepje';
        }
        var n = (doel.ids || []).length;
        if (n === 1) {
            for (var j = 0; j < leerlingen.length; j++) {
                if (leerlingen[j].id === doel.ids[0]) return leerlingNaam(leerlingen[j]);
            }
        }
        return n + ' kinderen';
    }

    // ---------- Laden ----------
    async function laadBasis() {
        var res = await Promise.all([
            supabase.from('weektaak_instellingen').select('dagen, pauzes').eq('group_id', groupId).maybeSingle(),
            supabase.from('weektaak_vakken').select('*').eq('group_id', groupId).eq('archived', false).order('sort_order'),
            supabase.from('weektaak_rooster').select('*').eq('group_id', groupId).order('dag').order('van'),
            supabase.from('klas_groepjes').select('id, naam').eq('group_id', groupId).order('sort_order'),
            supabase.from('students').select('id, first_name, name_suffix, student_number')
                .eq('group_id', groupId).eq('archived', false).order('student_number')
        ]);

        var inst = res[0].data;
        instellingen = {
            dagen: (inst && inst.dagen && inst.dagen.length) ? inst.dagen : STANDAARD_DAGEN,
            pauzes: (inst && inst.pauzes) ? inst.pauzes : STANDAARD_PAUZES
        };
        vakken = res[1].data || [];
        basisrooster = res[2].data || [];
        groepjes = (res[3].data || []).map(function (g) { return { id: g.id, naam: g.naam, leden: [] }; });
        leerlingen = res[4].data || [];

        if (groepjes.length) {
            var leden = await supabase.from('klas_groepje_leden').select('groepje_id, student_id')
                .in('groepje_id', groepjes.map(function (g) { return g.id; }));
            (leden.data || []).forEach(function (l) {
                var g = groepjes.filter(function (x) { return x.id === l.groepje_id; })[0];
                if (g) g.leden.push(l.student_id);
            });
        }
    }

    async function laadWeek() {
        var res = await supabase.from('weektaak_weken').select('*')
            .eq('group_id', groupId).eq('jaar', jaar).eq('week', weeknr).maybeSingle();
        week = res.data || null;
        items = [];
        if (week) {
            var i = await supabase.from('weektaak_items').select('*')
                .eq('week_id', week.id).order('sort_order').order('created_at');
            items = i.data || [];
        }
    }

    // ---------- Week klaarzetten ----------
    function roosterUitBasis() {
        var perVak = {};
        vakken.forEach(function (v) { perVak[v.id] = v; });
        return basisrooster.map(function (r) {
            var v = perVak[r.vak_id] || { naam: '?', lestype: 'overig' };
            return { les_id: uuid(), dag: r.dag, van: hhmm(r.van), tot: hhmm(r.tot),
                     vak: v.naam, lestype: v.lestype };
        });
    }

    async function maakWeek(uitVorige) {
        var rooster = [], bron = null;
        if (uitVorige) {
            var vorigeMa = new Date(MT.mondayOfIsoWeek(jaar, weeknr));
            vorigeMa.setDate(vorigeMa.getDate() - 7);
            var v = MT.isoWeek(vorigeMa);
            var res = await supabase.from('weektaak_weken').select('*')
                .eq('group_id', groupId).eq('jaar', v.jaar).eq('week', v.week).maybeSingle();
            bron = res.data;
            if (!bron) { toast('Er is nog geen vorige week om over te nemen.'); return; }
            // Nieuwe les-ids: het werk van vorige week mag niet aan dezelfde
            // les blijven hangen, anders delen twee weken hun vinkjes.
            var map = {};
            rooster = (bron.rooster || []).map(function (l) {
                var nieuw = Object.assign({}, l, { les_id: uuid() });
                map[l.les_id] = nieuw.les_id;
                return nieuw;
            });
            bron._map = map;
        } else {
            if (!basisrooster.length) { toast('Je basisrooster is nog leeg. Vul dat eerst in bij ⚙️.'); return; }
            rooster = roosterUitBasis();
        }

        var ins = await supabase.from('weektaak_weken')
            .insert({ group_id: groupId, jaar: jaar, week: weeknr, rooster: rooster, updated_by: user.id })
            .select('*').single();
        if (ins.error) { toast('Aanmaken lukte niet: ' + ins.error.message); return; }
        week = ins.data;

        if (bron) {
            var oude = await supabase.from('weektaak_items').select('*').eq('week_id', bron.id);
            var rijen = (oude.data || []).map(function (it) {
                return {
                    week_id: week.id, group_id: groupId, niveau: it.niveau,
                    les_id: it.les_id ? (bron._map[it.les_id] || null) : null,
                    dag: it.dag, soort: it.soort, tekst: it.tekst,
                    doelgroep: it.doelgroep, sort_order: it.sort_order
                };
            }).filter(function (r) { return r.niveau !== 'les' || r.les_id; });
            if (rijen.length) await supabase.from('weektaak_items').insert(rijen);
        }

        await laadWeek();
        render();
        toast(uitVorige ? 'Vorige week overgenomen.' : 'Week klaargezet uit je basisrooster.');
    }

    // ---------- Renderen ----------
    function itemsVoor(niveau, dag, lesId) {
        return items.filter(function (i) {
            if (i.niveau !== niveau) return false;
            if (niveau === 'week') return true;
            if (i.dag !== dag) return false;
            return niveau === 'dag' ? true : i.les_id === lesId;
        });
    }

    function taakRegel(it) {
        var label = doelLabel(it.doelgroep);
        return '<div class="wt-taak" data-item="' + esc(it.id) + '">' +
            '<span class="wt-taak-soort">' + (it.soort === 'moet' ? '&#128204;' : '&#11088;') + '</span>' +
            '<span class="wt-taak-tekst">' + esc(it.tekst) +
                (label ? '<span class="wt-doelbadge">' + esc(label) + '</span>' : '') +
            '</span>' +
            '<button class="wt-weg" data-weg="' + esc(it.id) + '" title="Verwijderen">&times;</button>' +
            '</div>';
    }

    function render() {
        $('wtWeekLabel').textContent = weekLabel();

        var rechts = $('wtBalkRechts');
        if (week) {
            rechts.innerHTML =
                '<label class="wt-zichtbaar' + (week.zichtbaar ? ' aan' : '') + '">' +
                '<input type="checkbox" id="wtZichtbaar"' + (week.zichtbaar ? ' checked' : '') + '>' +
                (week.zichtbaar ? 'Zichtbaar voor de klas' : 'Nog niet zichtbaar') + '</label>';
            $('wtZichtbaar').addEventListener('change', zetZichtbaar);
        } else {
            rechts.innerHTML = '';
        }

        $('wtLeeg').style.display = week ? 'none' : '';
        $('wtWeek').style.display = week ? '' : 'none';
        if (!week) return;

        renderRooster();
        renderWeekPanelen();
    }

    function weekLabel() {
        var d = MT.weekDates(jaar, weeknr);
        var m = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
        return 'Week ' + weeknr + ' · ' + d[0].getDate() + ' ' + m[d[0].getMonth()] +
               ' – ' + d[4].getDate() + ' ' + m[d[4].getMonth()];
    }

    function renderRooster() {
        var datums = MT.weekDates(jaar, weeknr);
        var html = '';

        for (var dag = 1; dag <= 5; dag++) {
            var di = dagInstelling(dag);
            var lessen = (week.rooster || []).filter(function (l) { return l.dag === dag; })
                .sort(function (a, b) { return minuten(a.van) - minuten(b.van); });
            var kort = minuten(di.eind) < minuten(dagInstelling(1).eind);

            html += '<div class="wt-dag">' +
                '<div class="wt-dagkop"><span class="wt-dagnaam">' + DAGNAMEN[dag] + '</span>' +
                '<span class="wt-dagdatum">' + datums[dag - 1].getDate() + ' ' +
                    ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'][datums[dag - 1].getMonth()] + '</span>' +
                (kort ? '<span class="wt-dagkort">tot ' + hhmm(di.eind) + '</span>' : '') +
                '</div><div class="wt-blokken">';

            // Lessen en pauzes op volgorde van tijd door elkaar heen zetten.
            var stukken = lessen.map(function (l) { return { soort: 'les', van: minuten(l.van), les: l }; })
                .concat(pauzesVoor(dag)
                    .filter(function (p) { return minuten(p.van) < minuten(di.eind); })
                    .map(function (p) { return { soort: 'pauze', van: minuten(p.van), pauze: p }; }))
                .sort(function (a, b) { return a.van - b.van; });

            if (!stukken.length) {
                html += '<p class="wt-leeg-regel" style="padding:8px 2px;">Nog geen lessen.</p>';
            }

            stukken.forEach(function (st) {
                if (st.soort === 'pauze') {
                    html += '<div class="wt-pauze">' + esc(st.pauze.naam || 'pauze') + '</div>';
                    return;
                }
                var l = st.les;
                var hoogte = Math.max(22, (minuten(l.tot) - minuten(l.van)) * PX_PER_MIN);
                var aantal = itemsVoor('les', dag, l.les_id).length;
                html += '<button class="wt-blok wt-t-' + esc(l.lestype || 'overig') + '"' +
                        ' style="height:' + hoogte + 'px" data-les="' + esc(l.les_id) + '" data-dag="' + dag + '">' +
                        (aantal ? '<span class="wt-werkdot">' + aantal + '</span>' : '') +
                        '<span class="wt-blok-tijd">' + hhmm(l.van) + ' – ' + hhmm(l.tot) + '</span>' +
                        '<span class="wt-blok-vak">' + esc(l.vak) + '</span>' +
                        (l.lestype === 'instructie' || l.lestype === 'zelfstandig'
                            ? '<span class="wt-blok-soort">' + (l.lestype === 'instructie' ? 'instructie' : 'zelfstandig') + '</span>' : '') +
                        '</button>';
            });

            html += '</div>';
            if (kort) html += '<div class="wt-dagleeg"></div>';

            var dagItems = itemsVoor('dag', dag);
            html += '<div class="wt-dagwerk"><div class="wt-dagwerk-kop">Vandaag' +
                    '<button class="wt-plus" data-niveau="dag" data-dag="' + dag + '" title="Werk voor deze dag">&#10010;</button>' +
                    '</div>';
            html += dagItems.length
                ? dagItems.map(taakRegel).join('')
                : '<div class="wt-leeg-regel">Niets extra&rsquo;s</div>';
            html += '</div></div>';
        }

        $('wtRooster').innerHTML = html;
    }

    function renderWeekPanelen() {
        var w = itemsVoor('week');
        var moet = w.filter(function (i) { return i.soort === 'moet'; });
        var mag = w.filter(function (i) { return i.soort === 'mag'; });
        $('wtWeekMoet').innerHTML = moet.length ? moet.map(taakRegel).join('')
            : '<div class="wt-leeg-regel">Nog geen moetwerk voor deze week.</div>';
        $('wtWeekMag').innerHTML = mag.length ? mag.map(taakRegel).join('')
            : '<div class="wt-leeg-regel">Nog geen magwerk voor deze week.</div>';
    }

    async function zetZichtbaar(e) {
        var aan = e.target.checked;
        var res = await supabase.from('weektaak_weken').update({ zichtbaar: aan, updated_by: user.id }).eq('id', week.id);
        if (res.error) { toast('Opslaan lukte niet.'); e.target.checked = !aan; return; }
        week.zichtbaar = aan;
        render();
        toast(aan ? 'De klas ziet deze week nu.' : 'Deze week is verborgen voor de klas.');
    }

    // ---------- Werkvenster ----------
    function openWerk(ctx) {
        werkContext = ctx;
        $('wtWerkTitel').textContent = ctx.titel;
        $('wtWerkContext').textContent = ctx.context || '';
        nieuweSoort = 'moet';
        doelType = 'klas'; doelGroepje = ''; doelKinderen = {};
        document.querySelectorAll('.wt-soort').forEach(function (b) {
            b.classList.toggle('active', b.dataset.soort === 'moet');
        });
        $('wtWerkTekst').value = '';
        $('wtWerkFout').textContent = '';
        renderDoelKeuze();
        renderWerkLijst();
        $('wtWerkModal').classList.add('active');
        setTimeout(function () { $('wtWerkTekst').focus(); }, 50);
    }

    function renderWerkLijst() {
        var lijst = itemsVoor(werkContext.niveau, werkContext.dag, werkContext.les_id);
        $('wtWerkLijst').innerHTML = lijst.length
            ? lijst.map(taakRegel).join('')
            : '<div class="wt-leeg-regel">Hier staat nog niets.</div>';
    }

    function renderDoelKeuze() {
        var html = '<button type="button" class="wt-doelknop' + (doelType === 'klas' ? ' active' : '') +
                   '" data-doel="klas">Hele klas</button>';
        groepjes.forEach(function (g) {
            html += '<button type="button" class="wt-doelknop' +
                (doelType === 'groepje' && doelGroepje === g.id ? ' active' : '') +
                '" data-doel="groepje" data-id="' + esc(g.id) + '">' + esc(g.naam) +
                ' <span style="opacity:.6">(' + g.leden.length + ')</span></button>';
        });
        html += '<button type="button" class="wt-doelknop' + (doelType === 'kinderen' ? ' active' : '') +
                '" data-doel="kinderen">Kies kinderen…</button>';
        $('wtDoelKeuze').innerHTML = html;

        var kinderen = $('wtKinderen');
        if (doelType === 'kinderen') {
            kinderen.style.display = '';
            kinderen.innerHTML = leerlingen.map(function (s) {
                return '<button type="button" class="wt-kind' + (doelKinderen[s.id] ? ' active' : '') +
                       '" data-kind="' + esc(s.id) + '">' + esc(leerlingNaam(s)) + '</button>';
            }).join('');
        } else {
            kinderen.style.display = 'none';
            kinderen.innerHTML = '';
        }
    }

    async function voegWerkToe() {
        var tekst = $('wtWerkTekst').value.trim();
        if (tekst.length < 1) { $('wtWerkFout').textContent = 'Vul eerst iets in.'; return; }

        var doel = { type: 'klas' };
        if (doelType === 'groepje') {
            if (!doelGroepje) { $('wtWerkFout').textContent = 'Kies een groepje.'; return; }
            doel = { type: 'groepje', id: doelGroepje };
        } else if (doelType === 'kinderen') {
            var ids = Object.keys(doelKinderen).filter(function (k) { return doelKinderen[k]; });
            if (!ids.length) { $('wtWerkFout').textContent = 'Kies minstens één kind.'; return; }
            doel = { type: 'leerlingen', ids: ids };
        }

        var knop = $('wtWerkToevoegen');
        knop.disabled = true;
        var res = await supabase.from('weektaak_items').insert({
            week_id: week.id, group_id: groupId, niveau: werkContext.niveau,
            les_id: werkContext.les_id || null, dag: werkContext.dag || null,
            soort: nieuweSoort, tekst: tekst, doelgroep: doel,
            sort_order: itemsVoor(werkContext.niveau, werkContext.dag, werkContext.les_id).length
        }).select('*').single();
        knop.disabled = false;

        if (res.error) { $('wtWerkFout').textContent = 'Opslaan lukte niet: ' + res.error.message; return; }
        items.push(res.data);
        $('wtWerkTekst').value = '';
        $('wtWerkFout').textContent = '';
        renderWerkLijst();
        renderRooster();
        renderWeekPanelen();
        $('wtWerkTekst').focus();
    }

    async function verwijderItem(id) {
        var res = await supabase.from('weektaak_items').delete().eq('id', id);
        if (res.error) { toast('Verwijderen lukte niet.'); return; }
        items = items.filter(function (i) { return i.id !== id; });
        if ($('wtWerkModal').classList.contains('active')) renderWerkLijst();
        renderRooster();
        renderWeekPanelen();
    }

    // ---------- Instellingen ----------
    function openInstellingen() {
        renderVakken();
        renderRoosterEdit();
        renderGroepjes();
        renderTijden();
        $('wtInstModal').classList.add('active');
    }

    function renderVakken() {
        var opts = LESTYPES.map(function (t) { return '<option value="' + t[0] + '">' + t[1] + '</option>'; }).join('');
        $('wtVakType').innerHTML = opts;

        $('wtVakkenLijst').innerHTML = vakken.length ? vakken.map(function (v) {
            var naam = LESTYPES.filter(function (t) { return t[0] === v.lestype; })[0];
            return '<div class="wt-vakrij">' +
                '<span class="wt-vakkleur wt-t-' + esc(v.lestype) + '"></span>' +
                '<span class="wt-vaknaam">' + esc(v.naam) + '</span>' +
                '<span class="wt-vaktype">' + esc(naam ? naam[1] : v.lestype) + '</span>' +
                '<button class="wt-weg" data-vakweg="' + esc(v.id) + '" title="Verwijderen">&times;</button>' +
                '</div>';
        }).join('') : '<p class="wt-leeg-regel">Nog geen vakken. Voeg ze hieronder toe.</p>';
    }

    function renderRoosterEdit() {
        var perVak = {};
        vakken.forEach(function (v) { perVak[v.id] = v; });
        var html = '';
        for (var dag = 1; dag <= 5; dag++) {
            var di = dagInstelling(dag);
            var rijen = basisrooster.filter(function (r) { return r.dag === dag; });
            html += '<div class="wt-roosterdag"><div class="wt-roosterdag-kop">' + DAGNAMEN[dag] +
                    '<span class="wt-roosterdag-uren">' + hhmm(di.start) + ' – ' + hhmm(di.eind) + '</span>' +
                    '<button class="wt-plus" data-nieuweles="' + dag + '" title="Les toevoegen">&#10010;</button></div>';
            html += rijen.length ? rijen.map(function (r) {
                var v = perVak[r.vak_id] || { naam: '?', lestype: 'overig' };
                return '<div class="wt-roosterrij" data-lesrij="' + esc(r.id) + '" data-dag="' + dag + '">' +
                    '<span class="wt-vakkleur wt-t-' + esc(v.lestype) + '"></span>' +
                    '<span class="wt-roosterrij-tijd">' + hhmm(r.van) + ' – ' + hhmm(r.tot) + '</span>' +
                    '<span class="wt-roosterrij-vak">' + esc(v.naam) + '</span>' +
                    '<span class="wt-roosterrij-duur">' + duurTekst(r.van, r.tot) + '</span>' +
                    '</div>';
            }).join('') : '<p class="wt-leeg-regel">Nog geen lessen op deze dag.</p>';
            html += '</div>';
        }
        $('wtRoosterEdit').innerHTML = html;
    }

    function renderGroepjes() {
        $('wtGroepjesLijst').innerHTML = groepjes.length ? groepjes.map(function (g) {
            return '<div class="wt-groepjerij">' +
                    '<span class="wt-groepjenaam">' + esc(g.naam) + '</span>' +
                    '<span class="wt-groepje-aantal">' + g.leden.length + ' kinderen</span>' +
                    '<button class="wt-weg" data-groepjeweg="' + esc(g.id) + '" title="Verwijderen">&times;</button>' +
                   '</div>' +
                   '<div class="wt-groepje-leden">' + leerlingen.map(function (s) {
                        return '<button type="button" class="wt-kind' + (g.leden.indexOf(s.id) !== -1 ? ' active' : '') +
                               '" data-lid="' + esc(s.id) + '" data-groepje="' + esc(g.id) + '">' +
                               esc(leerlingNaam(s)) + '</button>';
                   }).join('') + '</div>';
        }).join('') : '<p class="wt-leeg-regel">Nog geen groepjes.</p>';
    }

    function renderTijden() {
        var html = '';
        for (var dag = 1; dag <= 5; dag++) {
            var di = dagInstelling(dag);
            html += '<div class="wt-dagrij"><span class="wt-dagrij-naam">' + DAGNAMEN[dag] + '</span>' +
                '<input type="time" class="wt-input" data-dagstart="' + dag + '" value="' + hhmm(di.start) + '">' +
                '<input type="time" class="wt-input" data-dageind="' + dag + '" value="' + hhmm(di.eind) + '">' +
                '</div>';
        }
        $('wtDagenEdit').innerHTML = html;

        $('wtPauzesEdit').innerHTML = (instellingen.pauzes || []).length
            ? instellingen.pauzes.map(function (p, i) {
                return '<div class="wt-pauzerij">' +
                    '<span class="wt-pauzerij-naam">' + esc(p.naam) + '</span>' +
                    '<span>' + hhmm(p.van) + ' – ' + hhmm(p.tot) + '</span>' +
                    '<span class="wt-roosterrij-duur">' + (p.dagen || []).map(function (d) {
                        return DAGNAMEN[d].slice(0, 2).toLowerCase(); }).join(' ') + '</span>' +
                    '<button class="wt-weg" data-pauzeweg="' + i + '" title="Verwijderen">&times;</button>' +
                    '</div>';
            }).join('')
            : '<p class="wt-leeg-regel">Geen pauzes ingesteld.</p>';
    }

    async function bewaarInstellingen() {
        var dagen = [];
        for (var dag = 1; dag <= 5; dag++) {
            var s = document.querySelector('[data-dagstart="' + dag + '"]');
            var e = document.querySelector('[data-dageind="' + dag + '"]');
            dagen.push({ dag: dag, start: (s && s.value) || '08:30', eind: (e && e.value) || '15:15' });
        }
        instellingen.dagen = dagen;
        var res = await supabase.from('weektaak_instellingen').upsert({
            group_id: groupId, dagen: instellingen.dagen, pauzes: instellingen.pauzes,
            updated_at: new Date().toISOString(), updated_by: user.id
        }, { onConflict: 'group_id' });
        if (res.error) { toast('Opslaan lukte niet: ' + res.error.message); return false; }
        return true;
    }

    // ---------- Les in het basisrooster ----------
    function openLes(dag, rij) {
        lesBewerken = rij ? { id: rij.id, dag: rij.dag } : { id: null, dag: dag };
        $('wtLesTitel').textContent = rij ? 'Les aanpassen' : 'Les toevoegen op ' + DAGNAMEN[dag].toLowerCase();
        $('wtLesVak').innerHTML = vakken.map(function (v) {
            return '<option value="' + esc(v.id) + '"' + (rij && rij.vak_id === v.id ? ' selected' : '') + '>' +
                   esc(v.naam) + '</option>';
        }).join('');
        var di = dagInstelling(lesBewerken.dag);
        $('wtLesVan').value = rij ? hhmm(rij.van) : hhmm(di.start);
        $('wtLesTot').value = rij ? hhmm(rij.tot) : '';
        $('wtLesFout').textContent = '';
        $('wtLesVerwijder').style.display = rij ? '' : 'none';
        $('wtLesModal').classList.add('active');
    }

    async function bewaarLes() {
        var vakId = $('wtLesVak').value;
        var van = $('wtLesVan').value, tot = $('wtLesTot').value;
        if (!vakId) { $('wtLesFout').textContent = 'Maak eerst een vak aan.'; return; }
        if (!van || !tot) { $('wtLesFout').textContent = 'Vul een begin- en eindtijd in.'; return; }
        if (minuten(tot) <= minuten(van)) { $('wtLesFout').textContent = 'De eindtijd moet na de begintijd liggen.'; return; }

        var rij = { group_id: groupId, dag: lesBewerken.dag, van: van, tot: tot, vak_id: vakId };
        var res = lesBewerken.id
            ? await supabase.from('weektaak_rooster').update(rij).eq('id', lesBewerken.id).select('*').single()
            : await supabase.from('weektaak_rooster').insert(rij).select('*').single();
        if (res.error) { $('wtLesFout').textContent = 'Opslaan lukte niet: ' + res.error.message; return; }

        if (lesBewerken.id) {
            basisrooster = basisrooster.map(function (r) { return r.id === res.data.id ? res.data : r; });
        } else {
            basisrooster.push(res.data);
        }
        basisrooster.sort(function (a, b) { return a.dag - b.dag || minuten(a.van) - minuten(b.van); });
        $('wtLesModal').classList.remove('active');
        renderRoosterEdit();
    }

    // ---------- Gebeurtenissen ----------
    $('wtVorige').addEventListener('click', function () { verschuifWeek(-1); });
    $('wtVolgende').addEventListener('click', function () { verschuifWeek(1); });
    $('wtVandaag').addEventListener('click', function () {
        var nu = MT.isoWeek(new Date());
        jaar = nu.jaar; weeknr = nu.week;
        laadWeek().then(render);
    });

    function verschuifWeek(richting) {
        var ma = MT.mondayOfIsoWeek(jaar, weeknr);
        ma.setDate(ma.getDate() + richting * 7);
        var w = MT.isoWeek(ma);
        jaar = w.jaar; weeknr = w.week;
        laadWeek().then(render);
    }

    $('wtUitRooster').addEventListener('click', function () { maakWeek(false); });
    $('wtUitVorige').addEventListener('click', function () { maakWeek(true); });

    // Klik op een lesblok, een plusje of een kruisje in het weekscherm.
    document.addEventListener('click', function (e) {
        var weg = e.target.closest('[data-weg]');
        if (weg) { verwijderItem(weg.dataset.weg); return; }

        var plus = e.target.closest('.wt-plus[data-niveau]');
        if (plus) {
            var niveau = plus.dataset.niveau;
            if (niveau === 'week') {
                nieuweSoort = plus.dataset.soort || 'moet';
                openWerk({ niveau: 'week', titel: 'Werk voor deze week',
                           context: 'Dit moet voor vrijdag af; de kinderen plannen zelf wanneer.' });
                document.querySelectorAll('.wt-soort').forEach(function (b) {
                    b.classList.toggle('active', b.dataset.soort === nieuweSoort);
                });
            } else if (niveau === 'dag') {
                var d = +plus.dataset.dag;
                openWerk({ niveau: 'dag', dag: d, titel: 'Werk voor ' + DAGNAMEN[d].toLowerCase(),
                           context: 'Dit hoort bij deze dag, maar niet bij één les.' });
            }
            return;
        }

        var blok = e.target.closest('.wt-blok');
        if (blok) {
            var dag = +blok.dataset.dag, lesId = blok.dataset.les;
            var les = (week.rooster || []).filter(function (l) { return l.les_id === lesId; })[0];
            openWerk({ niveau: 'les', dag: dag, les_id: lesId,
                       titel: les ? les.vak : 'Les',
                       context: DAGNAMEN[dag].toLowerCase() + ' ' + hhmm(les.van) + ' – ' + hhmm(les.tot) });
            return;
        }
    });

    // Werkvenster
    $('wtWerkSluit').addEventListener('click', function () { $('wtWerkModal').classList.remove('active'); });
    $('wtWerkToevoegen').addEventListener('click', voegWerkToe);
    $('wtWerkTekst').addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); voegWerkToe(); }
    });
    $('wtSoortKeuze').addEventListener('click', function (e) {
        var b = e.target.closest('.wt-soort');
        if (!b) return;
        nieuweSoort = b.dataset.soort;
        document.querySelectorAll('.wt-soort').forEach(function (x) { x.classList.toggle('active', x === b); });
    });
    $('wtDoelKeuze').addEventListener('click', function (e) {
        var b = e.target.closest('.wt-doelknop');
        if (!b) return;
        doelType = b.dataset.doel;
        doelGroepje = b.dataset.id || '';
        renderDoelKeuze();
    });
    $('wtKinderen').addEventListener('click', function (e) {
        var b = e.target.closest('.wt-kind');
        if (!b) return;
        var id = b.dataset.kind;
        doelKinderen[id] = !doelKinderen[id];
        b.classList.toggle('active', !!doelKinderen[id]);
    });

    // Instellingen
    $('wtBtnInstellingen').addEventListener('click', openInstellingen);
    $('wtInstSluit').addEventListener('click', sluitInstellingen);
    $('wtInstKlaar').addEventListener('click', sluitInstellingen);
    async function sluitInstellingen() {
        await bewaarInstellingen();
        $('wtInstModal').classList.remove('active');
        if (week) render();
    }

    document.querySelectorAll('.wt-tab').forEach(function (t) {
        t.addEventListener('click', function () {
            document.querySelectorAll('.wt-tab').forEach(function (x) { x.classList.remove('active'); });
            document.querySelectorAll('.wt-tabpaneel').forEach(function (x) { x.classList.remove('active'); });
            t.classList.add('active');
            $('wtTab' + t.dataset.tab.charAt(0).toUpperCase() + t.dataset.tab.slice(1)).classList.add('active');
        });
    });

    $('wtVakToevoegen').addEventListener('click', async function () {
        var naam = $('wtVakNaam').value.trim();
        if (!naam) return;
        var res = await supabase.from('weektaak_vakken').insert({
            group_id: groupId, naam: naam, lestype: $('wtVakType').value, sort_order: vakken.length
        }).select('*').single();
        if (res.error) { toast('Toevoegen lukte niet: ' + res.error.message); return; }
        vakken.push(res.data);
        $('wtVakNaam').value = '';
        renderVakken();
        renderRoosterEdit();
    });

    $('wtGroepjeToevoegen').addEventListener('click', async function () {
        var naam = $('wtGroepjeNaam').value.trim();
        if (!naam) return;
        var res = await supabase.from('klas_groepjes').insert({
            group_id: groupId, naam: naam, sort_order: groepjes.length
        }).select('id, naam').single();
        if (res.error) { toast('Toevoegen lukte niet: ' + res.error.message); return; }
        groepjes.push({ id: res.data.id, naam: res.data.naam, leden: [] });
        $('wtGroepjeNaam').value = '';
        renderGroepjes();
    });

    $('wtPauzeToevoegen').addEventListener('click', async function () {
        var naam = $('wtPauzeNaam').value.trim() || 'pauze';
        var van = $('wtPauzeVan').value, tot = $('wtPauzeTot').value;
        if (!van || !tot || minuten(tot) <= minuten(van)) { toast('Vul een geldige begin- en eindtijd in.'); return; }
        instellingen.pauzes.push({ naam: naam, van: van, tot: tot, dagen: [1, 2, 3, 4, 5] });
        $('wtPauzeNaam').value = ''; $('wtPauzeVan').value = ''; $('wtPauzeTot').value = '';
        await bewaarInstellingen();
        renderTijden();
    });

    // Klikken binnen het instellingenvenster
    $('wtInstModal').addEventListener('click', async function (e) {
        var vakWeg = e.target.closest('[data-vakweg]');
        if (vakWeg) {
            if (!confirm('Dit vak verwijderen? Lessen in je basisrooster met dit vak verdwijnen mee. Weken die al klaarstaan blijven zoals ze zijn.')) return;
            await supabase.from('weektaak_vakken').delete().eq('id', vakWeg.dataset.vakweg);
            vakken = vakken.filter(function (v) { return v.id !== vakWeg.dataset.vakweg; });
            basisrooster = basisrooster.filter(function (r) { return r.vak_id !== vakWeg.dataset.vakweg; });
            renderVakken(); renderRoosterEdit();
            return;
        }
        var grWeg = e.target.closest('[data-groepjeweg]');
        if (grWeg) {
            if (!confirm('Dit groepje verwijderen? Werk dat je er al voor klaarzette blijft staan.')) return;
            await supabase.from('klas_groepjes').delete().eq('id', grWeg.dataset.groepjeweg);
            groepjes = groepjes.filter(function (g) { return g.id !== grWeg.dataset.groepjeweg; });
            renderGroepjes();
            return;
        }
        var lid = e.target.closest('[data-lid]');
        if (lid) {
            var g = groepjes.filter(function (x) { return x.id === lid.dataset.groepje; })[0];
            if (!g) return;
            var sid = lid.dataset.lid, erin = g.leden.indexOf(sid) !== -1;
            if (erin) {
                await supabase.from('klas_groepje_leden').delete().eq('groepje_id', g.id).eq('student_id', sid);
                g.leden = g.leden.filter(function (x) { return x !== sid; });
            } else {
                await supabase.from('klas_groepje_leden').insert({ groepje_id: g.id, student_id: sid });
                g.leden.push(sid);
            }
            lid.classList.toggle('active', !erin);
            var rij = lid.closest('.wt-groepje-leden').previousElementSibling;
            if (rij) rij.querySelector('.wt-groepje-aantal').textContent = g.leden.length + ' kinderen';
            return;
        }
        var pWeg = e.target.closest('[data-pauzeweg]');
        if (pWeg) {
            instellingen.pauzes.splice(+pWeg.dataset.pauzeweg, 1);
            await bewaarInstellingen();
            renderTijden();
            return;
        }
        var nieuweLes = e.target.closest('[data-nieuweles]');
        if (nieuweLes) { openLes(+nieuweLes.dataset.nieuweles, null); return; }
        var lesRij = e.target.closest('[data-lesrij]');
        if (lesRij) {
            var r = basisrooster.filter(function (x) { return x.id === lesRij.dataset.lesrij; })[0];
            if (r) openLes(r.dag, r);
        }
    });

    $('wtLesSluit').addEventListener('click', function () { $('wtLesModal').classList.remove('active'); });
    $('wtLesAnnuleer').addEventListener('click', function () { $('wtLesModal').classList.remove('active'); });
    $('wtLesOpslaan').addEventListener('click', bewaarLes);
    $('wtLesVerwijder').addEventListener('click', async function () {
        if (!lesBewerken || !lesBewerken.id) return;
        if (!confirm('Deze les uit je basisrooster halen?')) return;
        await supabase.from('weektaak_rooster').delete().eq('id', lesBewerken.id);
        basisrooster = basisrooster.filter(function (r) { return r.id !== lesBewerken.id; });
        $('wtLesModal').classList.remove('active');
        renderRoosterEdit();
    });

    document.querySelectorAll('.modal-overlay').forEach(function (o) {
        o.addEventListener('click', function (e) { if (e.target === o) o.classList.remove('active'); });
    });
    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;
        document.querySelectorAll('.modal-overlay.active').forEach(function (o) { o.classList.remove('active'); });
    });

    // ---------- Init ----------
    (async function init() {
        var s = await supabase.auth.getSession();
        user = (s.data.session && s.data.session.user) || null;
        if (!user) return;

        if (window.MTActiveClass && window.MTActiveClass.ready) {
            try { await window.MTActiveClass.ready; } catch (e) {}
        }
        groupId = window.MTActiveClass ? window.MTActiveClass.getId() : '';

        if (!groupId) {
            $('wtGeenKlas').style.display = '';
            if (window.hidePageLoader) window.hidePageLoader();
            return;
        }

        $('wtMain').style.display = '';
        var nu = MT.isoWeek(new Date());
        jaar = nu.jaar; weeknr = nu.week;

        await laadBasis();
        await laadWeek();
        render();

        if (window.hidePageLoader) window.hidePageLoader();
    })();
});

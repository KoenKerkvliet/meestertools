/* ============================================
   MEESTERTOOLS - Ideeënbus
   Versie: v1.0.0

   Formulier waarmee een leerkracht een idee, verbetering, foutmelding of
   toolwens instuurt, plus een lijst met zijn eigen inzendingen en de status
   daarvan.

   Wat waar staat:
   - public.ideas is privé. RLS laat alleen de inzender en de super admin een
     rij zien. Vrije tekst van leerkrachten kan per ongeluk over een leerling
     gaan, dus die tekst gaat nooit naar een publieke tabel.
   - Wordt een idee goedgekeurd, dan maakt de beheerder een los roadmap-item
     aan (public.roadmap_items, zonder user_id). ideas.roadmap_item_id legt de
     koppeling vast, zodat de inzender hier "staat op de roadmap" ziet.

   De statusnamen in de database zijn kort en technisch; STATUS_LABEL vertaalt
   ze naar iets dat een leerkracht wil lezen.
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    if (!document.getElementById('ibForm')) return;

    var STATUS_LABEL = {
        'nieuw':    { text: 'In de bus',      icon: '📬' },
        'bekeken':  { text: 'Gelezen',        icon: '👀' },
        'gepland':  { text: 'Op de roadmap',  icon: '🗓️' },
        'gebouwd':  { text: 'Gebouwd',        icon: '✅' },
        'niet-nu':  { text: 'Nu even niet',   icon: '💤' }
    };

    var KIND_LABEL = {
        'idee': 'Idee',
        'verbetering': 'Verbetering',
        'bug': 'Foutmelding',
        'nieuwe-tool': 'Nieuwe tool'
    };

    var $ = function (id) { return document.getElementById(id); };
    var esc = function (s) { return MT.escapeHtml(s); };

    var formCard = $('ibFormCard');
    var form = $('ibForm');
    var thanks = $('ibThanks');
    var againBtn = $('ibAgain');
    var toolSelect = $('ibTool');
    var titleInput = $('ibTitle');
    var bodyInput = $('ibBody');
    var titleCount = $('ibTitleCount');
    var bodyCount = $('ibBodyCount');
    var submitBtn = $('ibSubmit');
    var errorEl = $('ibError');
    var mineList = $('ibMine');
    var mineEmpty = $('ibMineEmpty');
    var toastEl = $('ibToast');

    var currentUser = null;
    var kind = 'idee';
    var mine = [];

    // ---------- Kleine helpers ----------
    function toast(msg) {
        toastEl.textContent = msg;
        toastEl.classList.add('visible');
        clearTimeout(toast._t);
        toast._t = setTimeout(function () { toastEl.classList.remove('visible'); }, 2600);
    }

    function showError(msg) {
        errorEl.textContent = msg || '';
    }

    function formatDate(iso) {
        if (!iso) return '';
        var d = new Date(iso);
        if (isNaN(d.getTime())) return '';
        return d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    // ---------- Soort kiezen ----------
    var kindBtns = document.querySelectorAll('.ib-kind');
    Array.prototype.forEach.call(kindBtns, function (btn) {
        btn.addEventListener('click', function () {
            Array.prototype.forEach.call(kindBtns, function (b) {
                b.classList.remove('active');
                b.setAttribute('aria-checked', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-checked', 'true');
            kind = btn.dataset.kind;
        });
    });

    // ---------- Tooldropdown vullen uit de centrale lijst ----------
    // Eén bron van waarheid: template.js kent alle tools al voor de zoekbalk.
    function fillTools() {
        var tools = (window.MT_ALL_TOOLS || []).slice().sort(function (a, b) {
            return a.name.localeCompare(b.name, 'nl');
        });
        tools.forEach(function (t) {
            var opt = document.createElement('option');
            opt.value = t.id;
            opt.textContent = t.name;
            toolSelect.appendChild(opt);
        });

        // Kwam je hier via de knop op een toolpagina, dan staat de tool al klaar.
        var from = '';
        try { from = sessionStorage.getItem('mt_idee_tool') || ''; } catch (e) {}
        if (from) {
            toolSelect.value = from;
            try { sessionStorage.removeItem('mt_idee_tool'); } catch (e) {}
        }
    }

    function toolName(id) {
        if (!id) return '';
        var list = window.MT_ALL_TOOLS || [];
        for (var i = 0; i < list.length; i++) {
            if (list[i].id === id) return list[i].name;
        }
        return id;
    }

    // ---------- Tellers ----------
    function wireCounter(input, out, max) {
        function update() {
            var n = input.value.length;
            out.textContent = n + ' / ' + max;
            out.classList.toggle('warn', n > max - 20);
        }
        input.addEventListener('input', update);
        update();
    }

    wireCounter(titleInput, titleCount, 120);
    wireCounter(bodyInput, bodyCount, 2000);

    // ---------- Eigen inzendingen ----------
    function renderMine() {
        if (!mine.length) {
            mineList.innerHTML = '';
            mineEmpty.style.display = '';
            return;
        }
        mineEmpty.style.display = 'none';

        mineList.innerHTML = mine.map(function (idea) {
            var st = STATUS_LABEL[idea.status] || STATUS_LABEL['nieuw'];
            var meta = [KIND_LABEL[idea.category] || 'Idee'];
            if (idea.tool_id) meta.push(toolName(idea.tool_id));
            meta.push(formatDate(idea.created_at));

            var link = idea.roadmap_item_id
                ? '<a class="ib-mine-link" href="/roadmap">Bekijk op de roadmap &rarr;</a>'
                : '';

            return '' +
                '<div class="ib-mine-item">' +
                    '<div class="ib-mine-top">' +
                        '<span class="ib-mine-title">' + esc(idea.title) + '</span>' +
                        '<span class="ib-status ib-status-' + esc(idea.status) + '">' +
                            st.icon + ' ' + esc(st.text) +
                        '</span>' +
                    '</div>' +
                    '<div class="ib-mine-body">' + esc(idea.body) + '</div>' +
                    '<div class="ib-mine-meta">' +
                        '<span>' + esc(meta.join(' · ')) + '</span>' +
                        link +
                        '<button type="button" class="ib-withdraw" data-id="' + esc(idea.id) + '">Intrekken</button>' +
                    '</div>' +
                '</div>';
        }).join('');
    }

    mineList.addEventListener('click', function (e) {
        var btn = e.target.closest ? e.target.closest('.ib-withdraw') : null;
        if (!btn) return;
        withdraw(btn.dataset.id);
    });

    async function loadMine() {
        if (!currentUser) return;
        var res = await supabase
            .from('ideas')
            .select('id, category, tool_id, title, body, status, roadmap_item_id, created_at')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false });

        if (res.error) {
            console.error('Ideeën laden mislukt:', res.error);
            return;
        }
        mine = res.data || [];
        renderMine();
    }

    async function withdraw(id) {
        if (!id) return;
        if (!window.confirm('Dit idee intrekken? Het verdwijnt uit de ideeënbus.')) return;

        var res = await supabase.from('ideas').delete().eq('id', id);
        if (res.error) {
            toast('Intrekken lukte niet. Probeer het zo nog eens.');
            return;
        }
        mine = mine.filter(function (i) { return i.id !== id; });
        renderMine();
        toast('Idee ingetrokken.');
    }

    // ---------- Versturen ----------
    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        showError('');

        var title = titleInput.value.trim();
        var body = bodyInput.value.trim();

        if (title.length < 3) {
            showError('Vul een korte omschrijving in.');
            titleInput.focus();
            return;
        }
        if (body.length < 5) {
            showError('Vertel er nog even iets meer over.');
            bodyInput.focus();
            return;
        }
        if (!currentUser) {
            showError('Je bent niet meer ingelogd. Ververs de pagina.');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Versturen...';

        var res = await supabase.from('ideas').insert({
            user_id: currentUser.id,
            category: kind,
            tool_id: toolSelect.value || null,
            title: title,
            body: body,
            // Waar kwam je vandaan? Handig bij foutmeldingen, en het is geen
            // persoonsgegeven: alleen het pad binnen de site.
            page_url: document.referrer && document.referrer.indexOf(window.location.origin) === 0
                ? document.referrer.slice(window.location.origin.length)
                : null
        }).select('id, category, tool_id, title, body, status, roadmap_item_id, created_at').single();

        submitBtn.disabled = false;
        submitBtn.textContent = 'Versturen';

        if (res.error) {
            // De rem in de database geeft een check_violation met een leesbare tekst.
            showError(res.error.message && res.error.message.indexOf('ingestuurd') !== -1
                ? res.error.message
                : 'Versturen lukte niet. Probeer het zo nog eens.');
            return;
        }

        mine.unshift(res.data);
        renderMine();

        // Melding naar de beheerder. Bewust niet afwachten: het idee staat al
        // veilig in de database, en een haperende mailservice mag het bedankje
        // niet ophouden. De functie haalt de inhoud zelf op aan de serverkant.
        supabase.functions.invoke('idee-melding', { body: { id: res.data.id } })
            .catch(function (err) { console.warn('Melding versturen mislukt:', err); });

        form.reset();
        titleInput.dispatchEvent(new Event('input'));
        bodyInput.dispatchEvent(new Event('input'));

        formCard.style.display = 'none';
        thanks.style.display = '';
        thanks.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });

    againBtn.addEventListener('click', function () {
        thanks.style.display = 'none';
        formCard.style.display = '';
        titleInput.focus();
    });

    // ---------- Init ----------
    (async function init() {
        fillTools();

        var s = await supabase.auth.getSession();
        currentUser = (s.data.session && s.data.session.user) || null;

        if (currentUser) await loadMine();

        if (window.hidePageLoader) window.hidePageLoader();
    })();
});

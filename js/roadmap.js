/* ============================================
   MEESTERTOOLS - Roadmap
   Versie: v1.0.0

   Publiek bord met wat er gepland, in aanbouw en gebouwd is. Zichtbaar voor
   iedereen die is ingelogd (RLS: "roadmap lezen" is TO authenticated).

   Anoniem, met een kanttekening: bij een stem hoort wél een user_id in
   public.roadmap_votes, anders kan iemand oneindig duimen. Niemand kan die
   tabel lezen behalve zijn eigen rij - ook de beheerder niet. Wat naar buiten
   komt is alleen de teller op roadmap_items, die een trigger bijhoudt.

   "Jouw idee" op een kaartje komt niet uit de publieke tabel maar uit je eigen
   privé-ideeën: ideas.roadmap_item_id wijst naar het item. Die vergelijking
   gebeurt hier in de browser, met gegevens die alleen jij mag zien.
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    if (!document.getElementById('rmGepland')) return;

    var COLUMNS = ['gepland', 'in-aanbouw', 'gebouwd'];

    var $ = function (id) { return document.getElementById(id); };
    var esc = function (s) { return MT.escapeHtml(s); };
    var toastEl = $('ibToast');

    var currentUser = null;
    var items = [];
    var myVotes = {};   // item_id -> true
    var myItems = {};   // item_id -> true (voortgekomen uit een eigen inzending)
    var busy = {};      // item_id -> true zolang een stem onderweg is

    function toast(msg) {
        toastEl.textContent = msg;
        toastEl.classList.add('visible');
        clearTimeout(toast._t);
        toast._t = setTimeout(function () { toastEl.classList.remove('visible'); }, 2400);
    }

    // ---------- Renderen ----------
    function columnId(status) {
        // 'in-aanbouw' -> 'In-aanbouw', zodat het bij de id's in de HTML past.
        return status.charAt(0).toUpperCase() + status.slice(1);
    }

    function render() {
        COLUMNS.forEach(function (status) {
            var mount = $('rm' + columnId(status));
            var empty = $('rmEmpty' + columnId(status));
            var count = $('rmCount' + columnId(status));
            var list = items.filter(function (i) { return i.status === status; });

            count.textContent = list.length;
            empty.style.display = list.length ? 'none' : '';

            mount.innerHTML = list.map(function (item) {
                var voted = !!myVotes[item.id];
                var mine = myItems[item.id]
                    ? '<span class="rm-mine-tag">Jouw idee</span>'
                    : '';

                return '' +
                    '<div class="rm-item">' +
                        '<div class="rm-item-text">' +
                            '<div class="rm-item-title">' + esc(item.title) + '</div>' +
                            (item.body ? '<div class="rm-item-body">' + esc(item.body) + '</div>' : '') +
                            mine +
                        '</div>' +
                        '<button type="button" class="rm-vote' + (voted ? ' voted' : '') + '" ' +
                                'data-id="' + esc(item.id) + '" ' +
                                'aria-pressed="' + (voted ? 'true' : 'false') + '" ' +
                                'title="' + (voted ? 'Haal je duimpje weg' : 'Geef een duimpje') + '">' +
                            '<span class="rm-vote-icon" aria-hidden="true">&#128077;</span>' +
                            '<span class="rm-vote-count">' + item.vote_count + '</span>' +
                        '</button>' +
                    '</div>';
            }).join('');
        });
    }

    // ---------- Stemmen ----------
    document.querySelector('.rm-columns').addEventListener('click', function (e) {
        var btn = e.target.closest ? e.target.closest('.rm-vote') : null;
        if (btn) vote(btn.dataset.id);
    });

    async function vote(id) {
        if (!currentUser) {
            toast('Log in om te stemmen.');
            return;
        }
        if (busy[id]) return;
        busy[id] = true;

        var item = items.filter(function (i) { return i.id === id; })[0];
        if (!item) { busy[id] = false; return; }

        var wasVoted = !!myVotes[id];

        // Meteen bijwerken in beeld; bij een fout draaien we het terug.
        myVotes[id] = !wasVoted;
        item.vote_count = Math.max(0, item.vote_count + (wasVoted ? -1 : 1));
        render();

        var res = wasVoted
            ? await supabase.from('roadmap_votes').delete().eq('item_id', id).eq('user_id', currentUser.id)
            : await supabase.from('roadmap_votes').insert({ item_id: id, user_id: currentUser.id });

        busy[id] = false;

        if (res.error) {
            myVotes[id] = wasVoted;
            item.vote_count = Math.max(0, item.vote_count + (wasVoted ? 1 : -1));
            render();
            toast('Stemmen lukte even niet. Probeer het nog eens.');
        }
    }

    // ---------- Laden ----------
    async function loadItems() {
        var res = await supabase
            .from('roadmap_items')
            .select('id, title, body, status, vote_count, sort_order')
            .order('vote_count', { ascending: false })
            .order('sort_order')
            .order('created_at');

        if (res.error) {
            console.error('Roadmap laden mislukt:', res.error);
            return;
        }
        items = res.data || [];
    }

    async function loadMyVotes() {
        if (!currentUser) return;
        var res = await supabase.from('roadmap_votes').select('item_id');
        if (res.error) return;
        (res.data || []).forEach(function (v) { myVotes[v.item_id] = true; });
    }

    async function loadMyItems() {
        if (!currentUser) return;
        var res = await supabase
            .from('ideas')
            .select('roadmap_item_id')
            .eq('user_id', currentUser.id)
            .not('roadmap_item_id', 'is', null);
        if (res.error) return;
        (res.data || []).forEach(function (i) { myItems[i.roadmap_item_id] = true; });
    }

    // ---------- Init ----------
    (async function init() {
        var s = await supabase.auth.getSession();
        currentUser = (s.data.session && s.data.session.user) || null;

        await loadItems();
        await Promise.all([loadMyVotes(), loadMyItems()]);

        render();
        if (window.hidePageLoader) window.hidePageLoader();
    })();
});

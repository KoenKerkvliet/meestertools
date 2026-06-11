/* ============================================
   ESCAPE ROOMS - Hub
   Versie: v0.0.1

   Overzicht van alle gepubliceerde escape rooms als cards
   (afbeelding, titel, beschrijving, review-sterren) met filters
   op categorie en geschikt-voor (groep 3-4 / 5-6 / 7-8).
   Klik op een card om de room te spelen.
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('erGrid');
    const categorySelect = document.getElementById('erFilterCategory');
    const groupChips = document.getElementById('erFilterGroup');

    if (!grid) return;

    let rooms = [];
    let ratings = {};        // { room_id: { avg: 4.2, count: 3 } }
    let filterCategory = '';
    let filterGroup = '';

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str == null ? '' : String(str);
        return div.innerHTML;
    }

    function groupLabel(g) {
        return g ? 'Groep ' + g : '';
    }

    // Sterren op 5-puntsschaal (halve sterren afgerond naar heel)
    function starsHtml(roomId) {
        const r = ratings[roomId];
        if (!r || !r.count) {
            return '<span class="er-stars er-stars-empty" title="Nog geen reviews">' +
                '&#9734;&#9734;&#9734;&#9734;&#9734; <span class="er-stars-count">nog geen reviews</span></span>';
        }
        const full = Math.round(r.avg);
        let html = '<span class="er-stars" title="' + r.avg.toFixed(1) + ' van 5">';
        for (let i = 1; i <= 5; i++) html += i <= full ? '&#9733;' : '&#9734;';
        html += ' <span class="er-stars-count">' + r.avg.toFixed(1) + ' (' + r.count + ')</span></span>';
        return html;
    }

    function render() {
        const filtered = rooms.filter(r =>
            (!filterCategory || r.category === filterCategory) &&
            (!filterGroup || r.suitable_for === filterGroup)
        );

        if (!filtered.length) {
            grid.innerHTML = '<div class="er-empty"><span class="er-empty-icon">&#128477;&#65039;</span>' +
                '<p>' + (rooms.length ? 'Geen escape rooms gevonden met deze filters.' : 'Er zijn nog geen escape rooms. Kom snel terug!') + '</p></div>';
            return;
        }

        grid.innerHTML = filtered.map(r => `
            <a class="er-card" href="escaperooms/spelen?room=${r.id}">
                <div class="er-card-image">
                    ${r.image_url
                        ? '<img src="' + escapeHtml(r.image_url) + '" alt="" loading="lazy">'
                        : '<span class="er-card-placeholder">&#128477;&#65039;</span>'}
                    <div class="er-card-badges">
                        ${r.category ? '<span class="er-badge er-badge-cat">' + escapeHtml(r.category) + '</span>' : ''}
                        ${r.suitable_for ? '<span class="er-badge er-badge-group">' + groupLabel(r.suitable_for) + '</span>' : ''}
                    </div>
                </div>
                <div class="er-card-body">
                    <h3>${escapeHtml(r.title)}</h3>
                    <p>${escapeHtml(r.description || '')}</p>
                    ${starsHtml(r.id)}
                </div>
            </a>
        `).join('');
    }

    function fillCategoryFilter() {
        const cats = [...new Set(rooms.map(r => r.category).filter(Boolean))].sort();
        cats.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c;
            opt.textContent = c;
            categorySelect.appendChild(opt);
        });
    }

    async function load() {
        try {
            const [roomsRes, reviewsRes] = await Promise.all([
                supabase.from('escaperooms')
                    .select('id, title, description, image_url, category, suitable_for')
                    .eq('published', true)
                    .order('created_at', { ascending: false }),
                supabase.from('escaperoom_reviews').select('room_id, rating')
            ]);

            rooms = roomsRes.data || [];

            ratings = {};
            (reviewsRes.data || []).forEach(rv => {
                if (!ratings[rv.room_id]) ratings[rv.room_id] = { sum: 0, count: 0 };
                ratings[rv.room_id].sum += rv.rating;
                ratings[rv.room_id].count++;
            });
            Object.keys(ratings).forEach(id => {
                ratings[id].avg = ratings[id].sum / ratings[id].count;
            });

            fillCategoryFilter();
            render();
        } catch (err) {
            console.error('Escape rooms laden mislukt:', err);
            grid.innerHTML = '<div class="er-empty"><p>Escape rooms konden niet geladen worden. Probeer het later opnieuw.</p></div>';
        }
    }

    // ---------- Filters ----------
    categorySelect.addEventListener('change', () => {
        filterCategory = categorySelect.value;
        render();
    });

    groupChips.addEventListener('click', (e) => {
        const chip = e.target.closest('.er-chip');
        if (!chip) return;
        groupChips.querySelectorAll('.er-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        filterGroup = chip.dataset.group;
        render();
    });

    load();
});

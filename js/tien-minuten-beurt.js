/* ============================================
   MEESTERTOOLS - 10-minuten-didactiek: beurtenkiezer + timer als bouwsteen
   Versie: v0.0.1

   Voor lessen die zelf geen beurtenkiezer/timer hebben (het responsive
   "app"-format met Voordoen/Samen/Zelf). Werkt met twee knoppen die het
   importscript in de les zet:
     <button id="mtTimer">   en   <button id="mtBeurt">
   Sneltoetsen: B = beurt, T = timer (dubbelklik/Shift+T = opnieuw).
   Namen komen uit MTLes (js/tien-minuten-les.js), dus die moet eerder laden.
   Kleuren volgen de les (--red, --ink, --card), met terugvaltinten.
   ============================================ */

(function () {
    var css = ''
        + '#mtBeurtLaag{position:fixed;inset:0;z-index:100;background:rgba(28,42,68,.72);display:none;align-items:center;justify-content:center;padding:16px}'
        + '#mtBeurtLaag.open{display:flex}'
        + '#mtBeurtLaag .kaart{background:var(--card,#fff);border-radius:24px;width:min(820px,100%);padding:clamp(20px,4vw,40px);text-align:center;box-shadow:0 12px 0 rgba(0,0,0,.18)}'
        + '#mtBeurtLaag .kop{font-weight:800;font-size:1.3rem;color:var(--ink-soft,#56647C)}'
        + '#mtBeurtNaam{font-weight:800;font-size:clamp(3rem,9vw,7rem);line-height:1.25;color:var(--red,#E04E2A);margin:16px 0;min-height:1.25em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'
        + '#mtBeurtNaam.rollen{color:#C9C3D6}'
        + '#mtBeurtNaam.klaar{animation:mtPop .45s ease}'
        + '@keyframes mtPop{0%{transform:scale(.6)}70%{transform:scale(1.12)}100%{transform:scale(1)}}'
        + '#mtBeurtLaag .knoppen{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}'
        + '#mtBeurtInfo{margin-top:14px;font-weight:700;color:var(--ink-soft,#56647C)}'
        + '#mtTimer{min-width:6.5em;font-variant-numeric:tabular-nums}'
        + '#mtTimer.loopt{background:var(--blue,#2F6BD8);border-color:var(--blue,#2F6BD8);color:#fff}'
        + '#mtTimer.klaar{background:var(--red,#E04E2A);border-color:var(--red,#E04E2A);color:#fff;animation:mtPuls .8s infinite}'
        + '@keyframes mtPuls{50%{transform:scale(1.08)}}';
    var st = document.createElement('style');
    st.textContent = css;
    document.head.appendChild(st);

    function init() {
        // ---------- Beurtenkiezer ----------
        var laag = document.createElement('div');
        laag.id = 'mtBeurtLaag';
        laag.innerHTML = '<div class="kaart" role="dialog" aria-label="Wie is er aan de beurt?">'
            + '<div class="kop">Wie is er aan de beurt?</div>'
            + '<div id="mtBeurtNaam">…</div>'
            + '<div class="knoppen"><button class="btn primary" id="mtNogEen" type="button">Nog een naam</button>'
            + '<button class="btn" id="mtSluit" type="button">Sluiten</button></div>'
            + '<div id="mtBeurtInfo"></div></div>';
        document.body.appendChild(laag);

        var naamEl = document.getElementById('mtBeurtNaam');
        var info = document.getElementById('mtBeurtInfo');
        var NAMEN = [], KLAS = null, pot = [], rolt = false;
        if (window.MTLes) {
            MTLes.namen.then(function (n) { NAMEN = n; });
            MTLes.klas.then(function (k) { KLAS = k; });
        }

        function schud(a) {
            for (var i = a.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t;
            }
            return a;
        }
        function kiesNaam() {
            laag.classList.add('open');
            if (!NAMEN.length) {
                naamEl.textContent = 'Geen namen';
                info.textContent = KLAS ? 'Er staan nog geen leerlingen in ' + KLAS + '.' : 'Kies eerst een klas in MeesterTools.';
                return;
            }
            if (rolt) return;
            if (!pot.length) pot = schud(NAMEN.slice());
            var gekozen = pot.pop(), k = 0;
            rolt = true;
            naamEl.className = 'rollen';
            (function rol() {
                naamEl.textContent = NAMEN[Math.floor(Math.random() * NAMEN.length)];
                if (++k < 14) { setTimeout(rol, 40 + k * 9); return; }
                naamEl.textContent = gekozen;
                naamEl.className = 'klaar';
                rolt = false;
                info.textContent = (KLAS ? KLAS + ' · ' : '') + (pot.length
                    ? 'Nog ' + pot.length + ' ' + (pot.length === 1 ? 'kind' : 'kinderen') + ' niet geweest'
                    : 'Iedereen is geweest. De volgende ronde begint opnieuw.');
            })();
        }
        function sluit() { laag.classList.remove('open'); }

        document.getElementById('mtNogEen').onclick = kiesNaam;
        document.getElementById('mtSluit').onclick = sluit;
        laag.addEventListener('click', function (e) { if (e.target === laag) sluit(); });
        var beurtKnop = document.getElementById('mtBeurt');
        if (beurtKnop) beurtKnop.onclick = kiesNaam;

        // ---------- Timer (2 minuten) ----------
        var SEC = 120, tijd = SEC, tik = null;
        var tKnop = document.getElementById('mtTimer');
        function toon() {
            if (tKnop) tKnop.textContent = '⏱ ' + Math.floor(tijd / 60) + ':' + String(tijd % 60).padStart(2, '0');
        }
        function reset() {
            clearInterval(tik); tik = null; tijd = SEC;
            if (tKnop) tKnop.classList.remove('loopt', 'klaar');
            toon();
        }
        function startStop() {
            if (!tKnop) return;
            if (tijd <= 0) reset();
            if (tik) { clearInterval(tik); tik = null; tKnop.classList.remove('loopt'); return; }
            tKnop.classList.add('loopt');
            tik = setInterval(function () {
                tijd--; toon();
                if (tijd <= 0) { clearInterval(tik); tik = null; tKnop.classList.remove('loopt'); tKnop.classList.add('klaar'); }
            }, 1000);
        }
        if (tKnop) { tKnop.onclick = startStop; tKnop.ondblclick = reset; toon(); }

        // ---------- Toetsen ----------
        // Capture-fase op window: loopt vóór de toetsen van de les zelf, zodat
        // spatie/Enter in het beurtvenster een nieuwe naam geeft en niet de
        // les een stap verder zet.
        window.addEventListener('keydown', function (e) {
            if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
            var k = e.key;
            if (laag.classList.contains('open')) {
                if (k === 'Escape') sluit();
                else if (k === 'b' || k === 'B' || k === ' ' || k === 'Enter') { e.preventDefault(); kiesNaam(); }
                e.stopImmediatePropagation();
                return;
            }
            if (k === 'b' || k === 'B') { e.stopImmediatePropagation(); kiesNaam(); }
            else if (k === 't') { e.stopImmediatePropagation(); startStop(); }
            else if (k === 'T') { e.stopImmediatePropagation(); reset(); }
        }, true);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();

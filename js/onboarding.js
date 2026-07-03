/* ============================================
   MEESTERTOOLS - Onboarding-checklist (dashboard)

   Toont nieuwe leerkrachten een kaart met drie eerste stappen:
   1. Klas instellen  2. Namenkiezer proberen  3. Leerlingcodes printen
   Verdwijnt zodra alles gedaan is of na wegklikken (localStorage).
   ============================================ */

(function () {
    const mount = document.getElementById('onboardingMount');
    if (!mount || typeof supabase === 'undefined') return;

    const DISMISS_KEY = 'mt_onb_dismissed';
    const STEP2_KEY = 'mt_onb_namenkiezer';
    const STEP3_KEY = 'mt_onb_codes';

    function flag(key) {
        try { return !!localStorage.getItem(key); } catch (e) { return false; }
    }
    function setFlag(key) {
        try { localStorage.setItem(key, '1'); } catch (e) {}
    }

    if (flag(DISMISS_KEY)) return;

    init();

    async function init() {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            // Stap 1 is gedaan zodra er minstens één (niet-gearchiveerde) leerling is.
            const { count } = await supabase
                .from('students')
                .select('id', { count: 'exact', head: true })
                .eq('archived', false);

            const done1 = (count || 0) > 0;
            const done2 = flag(STEP2_KEY);
            const done3 = flag(STEP3_KEY);

            if (done1 && done2 && done3) {
                setFlag(DISMISS_KEY); // alles klaar -> nooit meer tonen
                return;
            }
            render(done1, done2, done3);
        } catch (err) {
            // De checklist is een extraatje; fouten mogen het dashboard niet breken.
            console.error('Onboarding-checklist kon niet laden:', err);
        }
    }

    function step(done, title, sub, btnLabel, onClick) {
        const li = document.createElement('div');
        li.className = 'onb-step' + (done ? ' done' : '');

        const check = document.createElement('span');
        check.className = 'onb-check';
        check.textContent = '✓';

        const text = document.createElement('div');
        text.className = 'onb-step-text';
        const strong = document.createElement('strong');
        strong.textContent = title;
        const span = document.createElement('span');
        span.textContent = sub;
        text.appendChild(strong);
        text.appendChild(span);

        const btn = document.createElement('button');
        btn.className = 'onb-step-btn';
        btn.type = 'button';
        btn.textContent = btnLabel;
        btn.addEventListener('click', onClick);

        li.appendChild(check);
        li.appendChild(text);
        li.appendChild(btn);
        return li;
    }

    function render(done1, done2, done3) {
        const card = document.createElement('section');
        card.className = 'onb-card';

        const h2 = document.createElement('h2');
        h2.textContent = 'Aan de slag met je klas \u{1F680}';
        const sub = document.createElement('p');
        sub.className = 'onb-sub';
        sub.textContent = 'Drie stappen en alle tools werken met jouw eigen klas.';

        const steps = document.createElement('div');
        steps.className = 'onb-steps';

        steps.appendChild(step(done1,
            '1. Stel je klas in',
            'Voer je leerlingen één keer in — elke tool gebruikt ze daarna automatisch.',
            'Klas instellen',
            () => { if (typeof openInstellingen === 'function') openInstellingen('mijnklas'); }
        ));

        steps.appendChild(step(done2,
            '2. Probeer de namenkiezer',
            'Kies willekeurig een leerling op het digibord — dé favoriet in elke klas.',
            'Naar de namenkiezer',
            () => { setFlag(STEP2_KEY); window.location.href = '/digibord/namenkiezer'; }
        ));

        steps.appendChild(step(done3,
            '3. Print de leerlingcodes',
            'Daarmee kunnen leerlingen op hun eigen pagina: typcursus, rekenmuurtje en meer.',
            'Codes bekijken',
            () => { setFlag(STEP3_KEY); if (typeof openInstellingen === 'function') openInstellingen('mijnklas'); }
        ));

        const dismiss = document.createElement('button');
        dismiss.className = 'onb-dismiss';
        dismiss.type = 'button';
        dismiss.title = 'Checklist verbergen';
        dismiss.innerHTML = '&times;';
        dismiss.addEventListener('click', () => {
            setFlag(DISMISS_KEY);
            card.remove();
        });

        card.appendChild(dismiss);
        card.appendChild(h2);
        card.appendChild(sub);
        card.appendChild(steps);
        mount.appendChild(card);
    }
})();

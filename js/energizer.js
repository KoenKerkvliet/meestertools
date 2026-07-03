/* ============================================
   MEESTERTOOLS - Energizer
   Versie: v1.0.0

   Willekeurige brain break voor in de klas met een grote timer.
   Drie soorten: bewegen (energie kwijt), rust (tot rust komen)
   en samen (verbinding). Werkt ook zonder account; voorkeuren
   (filter + geluid) staan in localStorage.
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    var FILTER_KEY = 'mt_energizer_filter';
    var SOUND_KEY = 'mt_energizer_sound';

    // ---------- Activiteiten (sec = standaardduur) ----------
    var ACTIVITIES = [
        // Bewegen — energie kwijt
        { type: 'bewegen', emoji: '🕺', title: 'Danspauze', sec: 90, desc: 'Zet een vrolijk liedje op en dans bij je tafel tot de timer piept. Hoe gekker, hoe beter!' },
        { type: 'bewegen', emoji: '🐸', title: 'Kikkersprongen', sec: 60, desc: 'Spring als een kikker op de plaats. Hoe veel sprongen haal jij voordat de tijd om is?' },
        { type: 'bewegen', emoji: '🪑', title: 'Stoelenwissel', sec: 60, desc: 'Iedereen staat op en zoekt binnen tien tellen een nieuwe plek. Daarna nog een keer — maar sneller!' },
        { type: 'bewegen', emoji: '🏃', title: 'Rennen op de plaats', sec: 60, desc: 'Ren op de plaats: eerst in slow motion, dan steeds sneller, tot je sprint. En weer terug naar slow motion.' },
        { type: 'bewegen', emoji: '💪', title: 'Tien-tellen-workout', sec: 120, desc: 'Doe 10 sprongen, 10 keer knieheffen en zwaai 10 keer met je armen. Herhaal tot de timer piept.' },
        { type: 'bewegen', emoji: '🦩', title: 'Flamingo-stand', sec: 60, desc: 'Sta op één been als een flamingo. Klapt de juf of meester? Dan wissel je van been!' },
        { type: 'bewegen', emoji: '🌪️', title: 'Schudden maar', sec: 60, desc: 'Schud 8 tellen je rechterarm, 8 je linkerarm, 8 je rechterbeen, 8 je linkerbeen. Daarna 4 tellen, 2 tellen en 1 tel!' },
        { type: 'bewegen', emoji: '🧱', title: 'Duw de muur om', sec: 60, desc: 'Duw tien tellen zo hard als je kunt tegen de muur. Even rust, en dan nog twee keer. Lukt het de muur om te duwen?' },
        { type: 'bewegen', emoji: '👏', title: 'Klap-estafette', sec: 90, desc: 'Stuur één klap zo snel mogelijk de hele klas rond. Neem de tijd op en probeer daarna je record te breken!' },
        { type: 'bewegen', emoji: '🪞', title: 'Spiegelbeeld', sec: 90, desc: 'Sta in tweetallen tegenover elkaar. De één beweegt langzaam, de ander doet precies na — als een spiegel. Halverwege wisselen.' },
        { type: 'bewegen', emoji: '🐘', title: 'Dierenparade', sec: 90, desc: 'De juf of meester noemt een dier en iedereen beweegt als dat dier. Van olifant tot muis, van kangoeroe tot slak.' },
        { type: 'bewegen', emoji: '🤾', title: 'Onzichtbaar springtouw', sec: 60, desc: 'Spring touwtje — zonder touw! Wie houdt het vol tot de timer piept zonder te stoppen?' },

        // Rust — tot rust komen
        { type: 'rust', emoji: '🧘', title: 'Ademhalen in vieren', sec: 120, desc: 'Adem 4 tellen in, houd 4 tellen vast, adem 4 tellen uit en wacht 4 tellen. Herhaal dit rustig tot de timer piept.' },
        { type: 'rust', emoji: '🤫', title: 'Stilte-uitdaging', sec: 120, desc: 'De hele klas is muisstil tot de timer piept. Geen woord, geen gegiechel. Lukt het jullie?' },
        { type: 'rust', emoji: '🖐️', title: 'Vijf-vinger-ademhaling', sec: 90, desc: 'Trek met je wijsvinger langzaam langs de vingers van je andere hand: omhoog adem je in, omlaag adem je uit.' },
        { type: 'rust', emoji: '☁️', title: 'Droomplek', sec: 120, desc: 'Ogen dicht, hoofd op je armen. Denk aan de fijnste plek die je kent. Wat zie je daar? Wat hoor je?' },
        { type: 'rust', emoji: '🌳', title: 'Boom in de wind', sec: 90, desc: 'Sta stevig met beide voeten op de grond, strek je armen als takken omhoog en wieg heel langzaam mee met de wind.' },
        { type: 'rust', emoji: '🦥', title: 'Slow motion', sec: 90, desc: 'Alles wat je nu doet, doe je in extreme slow motion: gapen, zwaaien, opstaan. Hoe langzamer, hoe beter.' },
        { type: 'rust', emoji: '👂', title: 'Geluidenjacht', sec: 60, desc: 'Wees doodstil en luister goed: hoeveel verschillende geluiden hoor je? Tel ze op je vingers.' },
        { type: 'rust', emoji: '🗿', title: 'Standbeeld', sec: 60, desc: 'Bevries als een standbeeld in een gekke houding. Wie kan het langste stil blijven staan?' },

        // Samen — verbinding
        { type: 'samen', emoji: '💛', title: 'Complimentenrondje', sec: 120, desc: 'Geef je buurman of buurvrouw een compliment. Die geeft er weer één door aan de volgende, tot het rondje rond is.' },
        { type: 'samen', emoji: '🔢', title: 'Samen tellen tot 20', sec: 120, desc: 'Tel als klas naar 20: iemand zegt zomaar een getal, zonder afspreken. Praten er twee tegelijk? Dan begin je opnieuw!' },
        { type: 'samen', emoji: '🥁', title: 'Ritme door de kring', sec: 90, desc: 'De juf of meester klapt een ritme voor en de klas klapt het na. Elke ronde wordt het ritme een stukje moeilijker.' },
        { type: 'samen', emoji: '🕵️', title: 'Wie is de leider?', sec: 180, desc: 'Eén kind gaat de gang op. De klas kiest een leider die bewegingen voordoet die iedereen nadoet. Wie raadt wie de leider is?' },
        { type: 'samen', emoji: '🎂', title: 'Op volgorde', sec: 120, desc: 'Ga zonder te praten op volgorde van je verjaardag staan. Alleen gebaren zijn toegestaan. Klopt de rij?' },
        { type: 'samen', emoji: '🎭', title: 'Emotie-estafette', sec: 90, desc: 'Geef een gezichtsuitdrukking door de klas: blij, boos, verbaasd... Is hij aan het einde nog hetzelfde?' },
        { type: 'samen', emoji: '📖', title: 'Verhaal van één zin', sec: 180, desc: 'Maak samen een verhaal: iedereen voegt precies één zin toe. Waar eindigt het verhaal van jullie klas?' },
        { type: 'samen', emoji: '🌊', title: 'De golf', sec: 60, desc: 'Maak een wave door de klas zoals in een voetbalstadion. Eerst langzaam, dan steeds sneller. Halen jullie drie rondjes?' }
    ];

    var TYPE_LABELS = { bewegen: '🏃 Bewegen', rust: '🧘 Rust', samen: '🤝 Samen' };

    // ---------- State ----------
    var filter = 'alles';
    var soundOn = true;
    var current = null;
    var remaining = 0;      // seconden
    var running = false;
    var tickHandle = null;
    var lastId = -1;        // niet twee keer dezelfde achter elkaar

    var $ = function (id) { return document.getElementById(id); };
    var startCard = $('ezStart');
    var activityCard = $('ezActivity');
    var typeBadge = $('ezTypeBadge');
    var emojiEl = $('ezEmoji');
    var titleEl = $('ezTitle');
    var descEl = $('ezDesc');
    var timeDisplay = $('ezTimeDisplay');
    var startBtn = $('ezStartBtn');
    var soundBtn = $('ezSoundBtn');

    // ---------- Voorkeuren ----------
    try {
        var f = localStorage.getItem(FILTER_KEY);
        if (f && (f === 'alles' || TYPE_LABELS[f])) filter = f;
        soundOn = localStorage.getItem(SOUND_KEY) !== 'uit';
    } catch (e) { /* voorkeuren zijn een extraatje */ }

    // ---------- Geluid (kort piepje via WebAudio) ----------
    function beep() {
        if (!soundOn) return;
        try {
            var Ctx = window.AudioContext || window.webkitAudioContext;
            var ctx = new Ctx();
            [0, 0.25, 0.5].forEach(function (t, i) {
                var osc = ctx.createOscillator();
                var gain = ctx.createGain();
                osc.frequency.value = i === 2 ? 880 : 660;
                osc.connect(gain);
                gain.connect(ctx.destination);
                gain.gain.setValueAtTime(0.15, ctx.currentTime + t);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.2);
                osc.start(ctx.currentTime + t);
                osc.stop(ctx.currentTime + t + 0.22);
            });
        } catch (e) { /* geen audio beschikbaar */ }
    }

    function renderSoundBtn() {
        soundBtn.innerHTML = soundOn ? '&#128266;' : '&#128263;';
        soundBtn.title = soundOn ? 'Geluid uitzetten' : 'Geluid aanzetten';
    }

    // ---------- Timer ----------
    function fmt(sec) {
        var m = Math.floor(sec / 60);
        var s = sec % 60;
        return m + ':' + (s < 10 ? '0' : '') + s;
    }

    function renderTime() {
        timeDisplay.textContent = fmt(remaining);
    }

    function stopTimer() {
        running = false;
        if (tickHandle) { clearInterval(tickHandle); tickHandle = null; }
        startBtn.innerHTML = '&#9654; Start';
    }

    function timerDone() {
        stopTimer();
        activityCard.classList.add('is-done');
        beep();
    }

    function toggleTimer() {
        if (running) {
            stopTimer();
            return;
        }
        if (remaining <= 0) resetTimer();
        activityCard.classList.remove('is-done');
        running = true;
        startBtn.innerHTML = '&#10074;&#10074; Pauze';
        tickHandle = setInterval(function () {
            remaining--;
            if (remaining <= 0) {
                remaining = 0;
                renderTime();
                timerDone();
                return;
            }
            renderTime();
        }, 1000);
    }

    function resetTimer() {
        stopTimer();
        activityCard.classList.remove('is-done');
        remaining = current ? current.sec : 60;
        renderTime();
    }

    function adjustTime(delta) {
        if (running) return;
        activityCard.classList.remove('is-done');
        remaining = Math.min(15 * 60, Math.max(30, remaining + delta));
        renderTime();
    }

    // ---------- Activiteit trekken ----------
    function pool() {
        if (filter === 'alles') return ACTIVITIES;
        return ACTIVITIES.filter(function (a) { return a.type === filter; });
    }

    function draw() {
        var list = pool();
        var idx;
        do {
            idx = Math.floor(Math.random() * list.length);
        } while (list.length > 1 && ACTIVITIES.indexOf(list[idx]) === lastId);
        current = list[idx];
        lastId = ACTIVITIES.indexOf(current);

        typeBadge.textContent = TYPE_LABELS[current.type];
        typeBadge.className = 'ez-type-badge ' + current.type;
        emojiEl.textContent = current.emoji;
        titleEl.textContent = current.title;
        descEl.textContent = current.desc;

        startCard.style.display = 'none';
        activityCard.style.display = '';
        resetTimer();
    }

    // ---------- Events ----------
    $('ezDrawBtn').addEventListener('click', draw);
    $('ezNextBtn').addEventListener('click', draw);
    startBtn.addEventListener('click', toggleTimer);
    $('ezResetBtn').addEventListener('click', resetTimer);
    $('ezMinusBtn').addEventListener('click', function () { adjustTime(-30); });
    $('ezPlusBtn').addEventListener('click', function () { adjustTime(30); });

    soundBtn.addEventListener('click', function () {
        soundOn = !soundOn;
        try { localStorage.setItem(SOUND_KEY, soundOn ? 'aan' : 'uit'); } catch (e) {}
        renderSoundBtn();
    });

    document.querySelectorAll('.ez-filter').forEach(function (btn) {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.ez-filter').forEach(function (b) { b.classList.remove('active'); });
            btn.classList.add('active');
            filter = btn.dataset.type;
            try { localStorage.setItem(FILTER_KEY, filter); } catch (e) {}
        });
    });

    // Spatie = start/pauze (alleen als er een activiteit op het bord staat)
    document.addEventListener('keydown', function (e) {
        if (e.code !== 'Space' || activityCard.style.display === 'none') return;
        var tag = (e.target.tagName || '').toLowerCase();
        if (tag === 'input' || tag === 'textarea' || tag === 'button') return;
        e.preventDefault();
        toggleTimer();
    });

    // ---------- Init ----------
    document.querySelectorAll('.ez-filter').forEach(function (b) {
        b.classList.toggle('active', b.dataset.type === filter);
    });
    renderSoundBtn();
});

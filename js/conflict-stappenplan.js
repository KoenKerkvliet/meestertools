/* ============================================
   MEESTERTOOLS - Conflict-stappenplan
   Versie: v1.0.0

   Een stappenplan op het bord waarmee kinderen samen, stap voor stap,
   een ruzie oplossen. Toont een overzicht van de stappen en een
   presenteerweergave die elke stap groot, een voor een, laat zien.

   Statische tool: geen klasgegevens of opslag nodig.
   ============================================ */

(function () {
    'use strict';

    // ---------- De stappen ----------
    var STEPS = [
        {
            n: 1, accent: 'red', icon: '&#128721;', // 🛑
            title: 'Stop en koel af',
            desc: 'Haal even adem en word eerst rustig. Praat pas verder als jullie allebei weer kalm zijn.',
            tip: 'Drink even een glas water of zit heel even apart op een rustige plek.'
        },
        {
            n: 2, accent: 'orange', icon: '&#128066;', // 👂
            title: 'Toon respect',
            desc: 'Laat elkaar uitpraten. Niet schelden, niet schreeuwen en niet wijzen.',
            tip: 'Spreek af: wie het sprekende voorwerp vasthoudt praat, de ander luistert.'
        },
        {
            n: 3, accent: 'blue', icon: '&#128172;', // 💬
            title: 'Wat is het probleem?',
            desc: 'Allebei vertellen jullie je eigen kant van het verhaal. Wat is er precies gebeurd?',
            tip: 'Laat het kind het in eigen woorden herhalen: “Ik hoor je zeggen dat… klopt dat?”'
        },
        {
            n: 4, accent: 'pink', icon: '&#128151;', // 💗
            title: 'Wat voel en denk je?',
            desc: 'Vertel hoe je je voelde en wat je dacht tijdens de ruzie.',
            tip: 'Zo merkt de ander welke impact zijn of haar gedrag had — dat helpt om je in te leven.'
        },
        {
            n: 5, accent: 'green', icon: '&#128161;', // 💡
            title: 'Bedenk oplossingen',
            desc: 'Hoe maken jullie het weer goed? Bedenk samen een eerlijke oplossing.',
            tip: 'Geef elkaar een hand of zeg sorry, en ga weer fijn samen spelen!'
        }
    ];

    var $ = function (id) { return document.getElementById(id); };
    var current = 0;

    // ---------- Overzicht renderen ----------
    function renderOverview() {
        var ol = $('csSteps');
        if (!ol) return;
        ol.innerHTML = STEPS.map(function (s) {
            return '' +
                '<li class="cs-step cs-accent-' + s.accent + '">' +
                    '<div class="cs-step-num">' + s.n + '</div>' +
                    '<div class="cs-step-body">' +
                        '<h3 class="cs-step-title"><span class="cs-step-icon">' + s.icon + '</span>' + s.title + '</h3>' +
                        '<p class="cs-step-desc">' + s.desc + '</p>' +
                        '<p class="cs-step-tip"><span class="cs-tip-label">Tip</span>' + s.tip + '</p>' +
                    '</div>' +
                '</li>';
        }).join('');
    }

    // ---------- Presenteren ----------
    function renderDots() {
        var dots = $('csDots');
        dots.innerHTML = STEPS.map(function (s, i) {
            return '<button class="cs-dot' + (i === current ? ' is-active' : '') +
                '" data-idx="' + i + '" title="Stap ' + s.n + '" aria-label="Stap ' + s.n + '"></button>';
        }).join('');
    }

    function renderStage() {
        var s = STEPS[current];
        var stage = $('csStage');
        stage.className = 'cs-stage cs-accent-' + s.accent;
        stage.innerHTML = '' +
            '<div class="cs-stage-card">' +
                '<div class="cs-stage-top">' +
                    '<span class="cs-stage-num">Stap ' + s.n + ' van ' + STEPS.length + '</span>' +
                    '<span class="cs-stage-icon">' + s.icon + '</span>' +
                '</div>' +
                '<h2 class="cs-stage-title">' + s.title + '</h2>' +
                '<p class="cs-stage-desc">' + s.desc + '</p>' +
                '<div class="cs-stage-tip"><span class="cs-tip-label">Tip</span>' + s.tip + '</div>' +
            '</div>';

        renderDots();
        $('csPrev').disabled = (current === 0);
        var next = $('csNext');
        if (current === STEPS.length - 1) {
            next.innerHTML = 'Klaar &#10003;';
            next.classList.add('cs-nav-done');
        } else {
            next.innerHTML = 'Volgende &rarr;';
            next.classList.remove('cs-nav-done');
        }
    }

    function openPresent() {
        current = 0;
        renderStage();
        $('csPresent').style.display = 'block';
        document.body.classList.add('cs-presenting');
    }

    function closePresent() {
        $('csPresent').style.display = 'none';
        document.body.classList.remove('cs-presenting');
    }

    function go(delta) {
        var next = current + delta;
        if (next < 0) return;
        if (next >= STEPS.length) { closePresent(); return; }
        current = next;
        renderStage();
    }

    function onKey(e) {
        if ($('csPresent').style.display === 'none') return;
        if (e.key === 'Escape') closePresent();
        else if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); go(1); }
        else if (e.key === 'ArrowLeft') go(-1);
    }

    // ---------- Init ----------
    document.addEventListener('DOMContentLoaded', function () {
        renderOverview();
        if (window.hidePageLoader) window.hidePageLoader();

        $('csStart').addEventListener('click', openPresent);
        $('csPresentClose').addEventListener('click', closePresent);
        $('csPrev').addEventListener('click', function () { go(-1); });
        $('csNext').addEventListener('click', function () { go(1); });
        $('csDots').addEventListener('click', function (e) {
            var dot = e.target.closest('.cs-dot');
            if (!dot) return;
            current = parseInt(dot.getAttribute('data-idx'), 10) || 0;
            renderStage();
        });
        document.addEventListener('keydown', onKey);
    });
})();

/* ============================================
   CHECK-IN TOOL - JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    const TOOL_NAME = 'checkin';

    // ---------- DOM Elements ----------
    const checkinTitle = document.getElementById('checkinTitle');
    const checkinPie = document.getElementById('checkinPie');
    const checkinTotal = document.getElementById('checkinTotal');
    const checkinSmileys = document.getElementById('checkinSmileys');
    const btnReset = document.getElementById('btnReset');
    const btnSettings = document.getElementById('btnSettings');
    const settingsModal = document.getElementById('settingsModal');
    const btnCloseSettings = document.getElementById('btnCloseSettings');
    const btnSaveSettings = document.getElementById('btnSaveSettings');
    const settingTitle = document.getElementById('settingTitle');
    const settingSmileyCount = document.getElementById('settingSmileyCount');
    const settingWeekView = document.getElementById('settingWeekView');
    const weekSection = document.getElementById('weekSection');
    const weekGrid = document.getElementById('weekGrid');
    const pieTooltip = document.getElementById('pieTooltip');

    if (!checkinPie) return;

    // ---------- Smiley Configurations ----------
    const SMILEY_CONFIGS = {
        5: {
            emojis: ['\u{1F622}', '\u{1F615}', '\u{1F610}', '\u{1F642}', '\u{1F604}'],
            colors: ['#FF8C42', '#FFB347', '#FFD93D', '#A8E06C', '#6BCB77']
        },
        4: {
            emojis: ['\u{1F622}', '\u{1F615}', '\u{1F642}', '\u{1F604}'],
            colors: ['#FF8C42', '#FFD93D', '#A8E06C', '#6BCB77']
        },
        3: {
            emojis: ['\u{1F622}', '\u{1F610}', '\u{1F604}'],
            colors: ['#FF8C42', '#FFD93D', '#6BCB77']
        }
    };

    const DAY_NAMES = ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag'];
    const DAY_SHORT = ['Ma', 'Di', 'Wo', 'Do', 'Vr'];

    // ---------- State ----------
    let smileyCount = 5;
    let title = 'Hoe voel je je vandaag?';
    let showWeekView = false;
    let votes = [0, 0, 0, 0, 0];
    let weekData = {}; // { "2026-03-10": [2,1,3,5,8], ... }
    let animatingPie = false;

    // ---------- SVG Constants ----------
    const CX = 150, CY = 150, RADIUS = 140;

    // ---------- Date Helpers ----------
    function getTodayKey() {
        const d = new Date();
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }

    function getWeekDates() {
        const now = new Date();
        const day = now.getDay(); // 0=Sun, 1=Mon...
        const mondayOffset = day === 0 ? -6 : 1 - day;
        const monday = new Date(now);
        monday.setDate(now.getDate() + mondayOffset);

        const dates = [];
        for (let i = 0; i < 5; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            dates.push(d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'));
        }
        return dates;
    }

    // ---------- Supabase Helpers ----------
    async function getSessionUser() {
        const { data: { session } } = await supabase.auth.getSession();
        return session?.user || null;
    }

    async function loadSettings() {
        const user = await getSessionUser();
        if (!user) return;
        const { data } = await supabase
            .from('tool_settings')
            .select('settings')
            .eq('user_id', user.id)
            .eq('tool_name', TOOL_NAME)
            .single();

        if (data && data.settings) {
            if (data.settings.title) title = data.settings.title;
            if ([3, 4, 5].includes(data.settings.smileyCount)) smileyCount = data.settings.smileyCount;
            if (typeof data.settings.showWeekView === 'boolean') showWeekView = data.settings.showWeekView;
            if (data.settings.weekData) weekData = data.settings.weekData;
        }

        // Load today's votes from weekData
        const todayKey = getTodayKey();
        if (weekData[todayKey] && weekData[todayKey].length === smileyCount) {
            votes = [...weekData[todayKey]];
        } else {
            votes = new Array(smileyCount).fill(0);
        }
    }

    async function saveSettingsToDb() {
        const user = await getSessionUser();
        if (!user) return;
        await supabase
            .from('tool_settings')
            .upsert({
                user_id: user.id,
                tool_name: TOOL_NAME,
                settings: { title, smileyCount, showWeekView, weekData },
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id,tool_name' });
    }

    function saveTodayVotes() {
        weekData[getTodayKey()] = [...votes];
        saveSettingsToDb();
    }

    // ---------- Build UI ----------
    function buildUI() {
        checkinTitle.textContent = title;
        renderSmileys();
        renderPieFromValues(votes);
        updateTotal(votes.reduce((a, b) => a + b, 0));
        weekSection.style.display = showWeekView ? '' : 'none';
        if (showWeekView) renderWeekView();
    }

    // ---------- Render Smileys ----------
    function renderSmileys() {
        checkinSmileys.innerHTML = '';
        const config = SMILEY_CONFIGS[smileyCount];
        config.emojis.forEach((emoji, index) => {
            const btn = document.createElement('button');
            btn.className = 'checkin-smiley-btn';
            btn.textContent = emoji;
            btn.style.borderColor = config.colors[index];
            btn.addEventListener('click', () => handleVote(index, btn));
            checkinSmileys.appendChild(btn);
        });
    }

    // ---------- Handle Vote ----------
    function handleVote(index, btnElement) {
        const oldVotes = [...votes];
        votes[index]++;

        // Bounce animation
        btnElement.classList.remove('clicked');
        void btnElement.offsetWidth;
        btnElement.classList.add('clicked');
        setTimeout(() => btnElement.classList.remove('clicked'), 500);

        // Floating +1
        showFloatingPlus(btnElement, SMILEY_CONFIGS[smileyCount].colors[index]);

        // Update total with pop
        const total = votes.reduce((a, b) => a + b, 0);
        updateTotal(total);
        checkinTotal.classList.remove('pop');
        void checkinTotal.offsetWidth;
        checkinTotal.classList.add('pop');

        // Animate pie
        animatePie(oldVotes, votes);

        // Save to weekData
        saveTodayVotes();

        // Update week view if visible
        if (showWeekView) renderWeekView();
    }

    // ---------- Floating +1 ----------
    function showFloatingPlus(btnElement, color) {
        const plus = document.createElement('span');
        plus.className = 'checkin-float-plus';
        plus.textContent = '+1';
        plus.style.color = color;

        const rect = btnElement.getBoundingClientRect();
        const containerRect = btnElement.closest('.checkin-container').getBoundingClientRect();
        plus.style.left = (rect.left - containerRect.left + rect.width / 2 - 12) + 'px';
        plus.style.top = (rect.top - containerRect.top - 10) + 'px';

        btnElement.closest('.checkin-container').appendChild(plus);
        setTimeout(() => plus.remove(), 700);
    }

    // ---------- Update Total ----------
    function updateTotal(total) {
        checkinTotal.querySelector('.total-number').textContent = total;
        checkinTotal.querySelector('.total-label').textContent = total === 1 ? 'stem' : 'stemmen';
    }

    // ---------- Pie Chart Rendering ----------
    function createArcPath(cx, cy, r, startAngle, endAngle) {
        if (endAngle - startAngle >= 2 * Math.PI - 0.001) {
            return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx} ${cy + r} A ${r} ${r} 0 1 1 ${cx} ${cy - r} Z`;
        }
        const x1 = cx + r * Math.cos(startAngle);
        const y1 = cy + r * Math.sin(startAngle);
        const x2 = cx + r * Math.cos(endAngle);
        const y2 = cy + r * Math.sin(endAngle);
        const largeArc = (endAngle - startAngle > Math.PI) ? 1 : 0;
        return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    }

    function renderPieFromValues(values) {
        checkinPie.querySelectorAll('.pie-segment').forEach(p => p.remove());

        const total = values.reduce((a, b) => a + b, 0);
        if (total === 0) return;

        const config = SMILEY_CONFIGS[smileyCount];
        let startAngle = 0;

        values.forEach((count, i) => {
            if (count <= 0) return;
            const fraction = count / total;
            const endAngle = startAngle + fraction * 2 * Math.PI;

            const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            pathEl.setAttribute('d', createArcPath(CX, CY, RADIUS, startAngle, endAngle));
            pathEl.setAttribute('fill', config.colors[i]);
            pathEl.classList.add('pie-segment');
            pathEl.dataset.index = i;
            checkinPie.appendChild(pathEl);

            startAngle = endAngle;
        });
    }

    // ---------- Pie Tooltip ----------
    checkinPie.addEventListener('mousemove', (e) => {
        const segment = e.target.closest('.pie-segment');
        if (!segment) {
            pieTooltip.classList.remove('visible');
            return;
        }
        const i = parseInt(segment.dataset.index);
        const config = SMILEY_CONFIGS[smileyCount];
        const total = votes.reduce((a, b) => a + b, 0);
        const pct = total > 0 ? Math.round(votes[i] / total * 100) : 0;

        pieTooltip.textContent = `${config.emojis[i]}  ${votes[i]} ${votes[i] === 1 ? 'leerling' : 'leerlingen'} (${pct}%)`;
        pieTooltip.classList.add('visible');
        pieTooltip.style.left = (e.clientX + 12) + 'px';
        pieTooltip.style.top = (e.clientY - 36) + 'px';
    });

    checkinPie.addEventListener('mouseleave', () => {
        pieTooltip.classList.remove('visible');
    });

    // ---------- Animated Pie Transition ----------
    function animatePie(oldVotes, newVotes, duration = 400) {
        if (animatingPie) {
            renderPieFromValues(newVotes);
            return;
        }

        animatingPie = true;
        const startTime = performance.now();
        const from = [...oldVotes];
        const to = [...newVotes];

        function frame(now) {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const interpolated = to.map((nv, i) => from[i] + (nv - from[i]) * eased);
            renderPieFromValues(interpolated);

            if (progress < 1) {
                requestAnimationFrame(frame);
            } else {
                animatingPie = false;
            }
        }
        requestAnimationFrame(frame);
    }

    // ---------- Reset ----------
    btnReset.addEventListener('click', () => {
        const oldVotes = [...votes];
        votes = new Array(smileyCount).fill(0);
        updateTotal(0);
        checkinTotal.classList.remove('pop');
        void checkinTotal.offsetWidth;
        checkinTotal.classList.add('pop');
        animatePie(oldVotes, votes);
        saveTodayVotes();
        if (showWeekView) renderWeekView();
    });

    // ---------- Week View ----------
    function getAverageMood(dayVotes) {
        const total = dayVotes.reduce((a, b) => a + b, 0);
        if (total === 0) return null;
        const count = dayVotes.length;
        // Weighted average: index 0 = worst, index (count-1) = best
        let weighted = 0;
        dayVotes.forEach((v, i) => { weighted += v * i; });
        const avg = weighted / total; // 0 to (count-1)
        // Map to emoji index for current smileyCount
        const config = SMILEY_CONFIGS[smileyCount];
        const mapped = Math.round(avg / (count - 1) * (smileyCount - 1));
        return config.emojis[Math.min(mapped, smileyCount - 1)];
    }

    function renderWeekView() {
        weekGrid.innerHTML = '';
        const weekDates = getWeekDates();
        const todayKey = getTodayKey();
        const config = SMILEY_CONFIGS[smileyCount];

        weekDates.forEach((dateKey, dayIndex) => {
            const dayVotes = weekData[dateKey];
            const isToday = dateKey === todayKey;
            const hasData = dayVotes && dayVotes.reduce((a, b) => a + b, 0) > 0;

            const col = document.createElement('div');
            col.className = 'checkin-week-day' + (isToday ? ' today' : '') + (!hasData ? ' empty' : '');

            // Day name
            const nameEl = document.createElement('div');
            nameEl.className = 'week-day-name';
            nameEl.textContent = DAY_SHORT[dayIndex];
            col.appendChild(nameEl);

            if (hasData) {
                const total = dayVotes.reduce((a, b) => a + b, 0);

                // Average mood smiley
                const moodEl = document.createElement('div');
                moodEl.className = 'week-day-mood';
                moodEl.textContent = getAverageMood(dayVotes) || '';
                col.appendChild(moodEl);

                // Stacked bar
                const barEl = document.createElement('div');
                barEl.className = 'week-day-bar';
                // Use the config that matches the stored data length
                const storedConfig = SMILEY_CONFIGS[dayVotes.length] || config;
                dayVotes.forEach((v, i) => {
                    if (v <= 0) return;
                    const seg = document.createElement('div');
                    seg.className = 'week-day-bar-segment';
                    seg.style.width = (v / total * 100) + '%';
                    seg.style.background = storedConfig.colors[i];
                    barEl.appendChild(seg);
                });
                col.appendChild(barEl);

                // Count
                const countEl = document.createElement('div');
                countEl.className = 'week-day-count';
                countEl.innerHTML = total + ' <span>' + (total === 1 ? 'stem' : 'stemmen') + '</span>';
                col.appendChild(countEl);
            } else {
                // Empty state
                const emptyEl = document.createElement('div');
                emptyEl.className = 'week-day-empty';
                emptyEl.textContent = isToday ? 'Nog geen stemmen' : 'Geen data';
                col.appendChild(emptyEl);
            }

            weekGrid.appendChild(col);
        });
    }

    // ---------- PDF Download ----------
    const btnDownloadPdf = document.getElementById('btnDownloadPdf');

    function getWeekLabel() {
        const dates = getWeekDates();
        const fmt = d => { const p = d.split('-'); return p[2] + '-' + p[1]; };
        return fmt(dates[0]) + ' t/m ' + fmt(dates[4]);
    }

    function hexToRgb(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return [r, g, b];
    }

    function generatePdf() {
        if (!window.jspdf) {
            alert('PDF-bibliotheek kon niet geladen worden. Probeer de pagina te vernieuwen.');
            return;
        }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        const pageW = 297, pageH = 210;
        const margin = 20;
        const weekDates = getWeekDates();
        const todayKey = getTodayKey();
        const config = SMILEY_CONFIGS[smileyCount];

        // ---- Header ----
        doc.setFillColor(108, 99, 255);
        doc.rect(0, 0, pageW, 28, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('Check-in Weekoverzicht', margin, 18);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(getWeekLabel(), pageW - margin, 18, { align: 'right' });

        // ---- Title ----
        doc.setTextColor(50, 50, 70);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(title, pageW / 2, 42, { align: 'center' });

        // ---- Day columns ----
        const colW = (pageW - margin * 2 - 4 * 8) / 5; // 5 cols with 8mm gaps
        const startY = 52;
        const colH = pageH - startY - margin - 10;

        weekDates.forEach((dateKey, i) => {
            const x = margin + i * (colW + 8);
            const dayVotes = weekData[dateKey];
            const isToday = dateKey === todayKey;
            const hasData = dayVotes && dayVotes.reduce((a, b) => a + b, 0) > 0;

            // Column background
            if (isToday) {
                doc.setFillColor(238, 237, 251);
                doc.setDrawColor(108, 99, 255);
                doc.setLineWidth(0.6);
                doc.roundedRect(x, startY, colW, colH, 4, 4, 'FD');
            } else {
                doc.setFillColor(248, 248, 252);
                doc.setDrawColor(230, 230, 240);
                doc.setLineWidth(0.3);
                doc.roundedRect(x, startY, colW, colH, 4, 4, 'FD');
            }

            // Day name
            doc.setFontSize(13);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(isToday ? 108 : 120, isToday ? 99 : 120, isToday ? 255 : 140);
            doc.text(DAY_NAMES[i], x + colW / 2, startY + 12, { align: 'center' });

            // Date
            const dateParts = dateKey.split('-');
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(160, 160, 170);
            doc.text(dateParts[2] + '-' + dateParts[1] + '-' + dateParts[0], x + colW / 2, startY + 19, { align: 'center' });

            if (hasData) {
                const total = dayVotes.reduce((a, b) => a + b, 0);
                const storedConfig = SMILEY_CONFIGS[dayVotes.length] || config;

                // Total votes
                doc.setFontSize(20);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(50, 50, 70);
                doc.text(String(total), x + colW / 2, startY + 34, { align: 'center' });
                doc.setFontSize(8);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(140, 140, 150);
                doc.text(total === 1 ? 'stem' : 'stemmen', x + colW / 2, startY + 40, { align: 'center' });

                // Stacked horizontal bar
                const barY = startY + 45;
                const barH = 8;
                const barW = colW - 12;
                let barX = x + 6;
                dayVotes.forEach((v, vi) => {
                    if (v <= 0) return;
                    const segW = (v / total) * barW;
                    const [r, g, b] = hexToRgb(storedConfig.colors[vi]);
                    doc.setFillColor(r, g, b);
                    // First segment: round left corners
                    if (barX === x + 6) {
                        doc.roundedRect(barX, barY, segW, barH, 3, 3, 'F');
                    } else {
                        doc.rect(barX, barY, segW, barH, 'F');
                    }
                    barX += segW;
                });

                // Smiley breakdown list
                let listY = startY + 60;
                const smileyLabels = ['Zeer verdrietig', 'Verdrietig', 'Neutraal', 'Blij', 'Zeer blij'];
                const smileyLabels4 = ['Verdrietig', 'Neutraal', 'Blij', 'Zeer blij'];
                const smileyLabels3 = ['Verdrietig', 'Neutraal', 'Blij'];
                const labels = dayVotes.length === 3 ? smileyLabels3 : dayVotes.length === 4 ? smileyLabels4 : smileyLabels;

                dayVotes.forEach((v, vi) => {
                    const [r, g, b] = hexToRgb(storedConfig.colors[vi]);
                    // Color dot
                    doc.setFillColor(r, g, b);
                    doc.circle(x + 8, listY - 1.5, 2.5, 'F');
                    // Label
                    doc.setFontSize(8);
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(80, 80, 90);
                    doc.text(labels[vi], x + 13, listY);
                    // Count + percentage on next line
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(50, 50, 70);
                    const pct = Math.round(v / total * 100);
                    doc.text(v + ' (' + pct + '%)', x + 13, listY + 4.5);
                    listY += 13;
                });
            } else {
                // Empty state
                doc.setFontSize(11);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(180, 180, 190);
                doc.text('Geen data', x + colW / 2, startY + colH / 2, { align: 'center' });
            }
        });

        // ---- Footer ----
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(180, 180, 190);
        doc.text('Meestertools - Check-in Weekoverzicht', margin, pageH - 8);
        const now = new Date();
        const timestamp = now.toLocaleDateString('nl-NL') + ' ' + now.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
        doc.text('Gedownload: ' + timestamp, pageW - margin, pageH - 8, { align: 'right' });

        // ---- Save ----
        const filename = 'checkin-weekoverzicht-' + getWeekDates()[0] + '.pdf';
        doc.save(filename);
    }

    if (btnDownloadPdf) {
        btnDownloadPdf.addEventListener('click', generatePdf);
    }

    // ---------- Settings Modal ----------
    function openModal() {
        settingTitle.value = title;
        settingSmileyCount.value = smileyCount;
        settingWeekView.checked = showWeekView;
        settingsModal.classList.add('active');
    }

    function closeModal() {
        settingsModal.classList.remove('active');
    }

    btnSettings.addEventListener('click', openModal);
    btnCloseSettings.addEventListener('click', closeModal);

    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && settingsModal.classList.contains('active')) {
            closeModal();
        }
    });

    btnSaveSettings.addEventListener('click', async () => {
        title = settingTitle.value.trim() || 'Hoe voel je je vandaag?';
        const newCount = parseInt(settingSmileyCount.value);
        showWeekView = settingWeekView.checked;

        if (newCount !== smileyCount) {
            smileyCount = newCount;
            votes = new Array(smileyCount).fill(0);
        }

        await saveSettingsToDb();
        buildUI();
        closeModal();
    });

    // ---------- Day Change Detection ----------
    // Automatically reset votes when a new day starts (e.g. page stays open overnight)
    let currentDayKey = getTodayKey();

    function checkDayChange() {
        const newDayKey = getTodayKey();
        if (newDayKey !== currentDayKey) {
            // Day has changed - previous day's data is already saved in weekData
            // Start fresh for the new day
            currentDayKey = newDayKey;
            votes = new Array(smileyCount).fill(0);
            buildUI();
        }
    }

    // Check every 30 seconds if the day has changed
    setInterval(checkDayChange, 30000);

    // Also check on window focus (e.g. user returns to tab the next day)
    window.addEventListener('focus', checkDayChange);

    // ---------- Init ----------
    async function init() {
        await loadSettings();
        buildUI();
    }
    init();
});

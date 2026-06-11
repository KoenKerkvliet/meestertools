/* ============================================
   NAAMKAARTEN - JavaScript

   Maak voor elke leerling een omvouwbaar naamkaartje: één A4 in
   liggende oriëntatie met een stippellijn (vouwlijn) precies in het
   midden. De naam staat op beide helften; de bovenste helft staat
   180 graden gedraaid, zodat na het vouwen (vouwlijn omhoog, als een
   tentje op tafel) de naam aan beide kanten rechtop leesbaar is.
   Optioneel met het vaste monstertje van de leerling erbij.
   Download alle kaartjes in één PDF.
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    // ---------- DOM ----------
    const selectGroup = document.getElementById('ncSelectGroup');
    const studentInfo = document.getElementById('ncStudentInfo');
    const nameModeSelect = document.getElementById('ncNameMode');
    const styleSelect = document.getElementById('ncStyle');
    const monsterToggle = document.getElementById('ncMonster');
    const sizeRange = document.getElementById('ncSize');
    const sizeVal = document.getElementById('ncSizeVal');
    const downloadBtn = document.getElementById('ncDownloadBtn');
    const hint = document.getElementById('ncHint');

    const canvas = document.getElementById('ncPreviewCanvas');
    const previewEmpty = document.getElementById('ncPreviewEmpty');
    const previewNav = document.getElementById('ncPreviewNav');
    const previewLabel = document.getElementById('ncPreviewLabel');
    const prevBtn = document.getElementById('ncPrevName');
    const nextBtn = document.getElementById('ncNextName');

    if (!canvas) return;

    // ---------- Constants ----------
    // A4 liggend op ~150 dpi voor scherpe print
    const A4 = { w: 1754, h: 1240 };
    const MARGIN = 60;
    const MONSTER_COUNT = 36;

    // ---------- State ----------
    let students = [];
    let monsterByStudentId = {};
    let previewIndex = 0;
    let renderToken = 0;

    // ---------- Supabase ----------
    async function getSessionUser() {
        const { data: { session } } = await supabase.auth.getSession();
        return session?.user || null;
    }

    async function loadGroups() {
        const user = await getSessionUser();
        if (!user) return [];
        const { data } = await supabase
            .from('groups')
            .select('id, name')
            .eq('user_id', user.id)
            .eq('archived', false)
            .order('name');
        return data || [];
    }

    async function loadStudents(groupId) {
        const user = await getSessionUser();
        if (!user || !groupId) return [];
        const { data } = await supabase
            .from('students')
            .select('id, first_name, last_name')
            .eq('group_id', groupId)
            .eq('user_id', user.id)
            .eq('archived', false)
            .order('student_number', { ascending: true });
        return data || [];
    }

    function cardName(s) {
        if (nameModeSelect.value === 'full' && s.last_name) {
            return s.first_name + ' ' + s.last_name;
        }
        return s.first_name;
    }

    // ---------- Monsters ----------
    // Zelfde toewijzing als in Klassendienst, Klasseprestatie en
    // Complimentenmuur, zodat een kind overal hetzelfde monstertje heeft.
    function monsterHash(key) {
        key = String(key || '');
        let h = 0;
        for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
        return h;
    }

    function assignMonsters(list) {
        const map = {}, used = {};
        const sorted = (list || []).slice().sort((a, b) => {
            const ai = String(a.id), bi = String(b.id);
            return ai < bi ? -1 : ai > bi ? 1 : 0;
        });
        sorted.forEach(s => {
            let n = monsterHash(s.id) % MONSTER_COUNT, tries = 0;
            while (used[n] && tries < MONSTER_COUNT) { n = (n + 1) % MONSTER_COUNT; tries++; }
            used[n] = true;
            map[s.id] = n + 1;
        });
        return map;
    }

    function monsterSrc(s) {
        const id = (s && s.id) || '';
        const n = monsterByStudentId[id] || ((monsterHash(id) % MONSTER_COUNT) + 1);
        return '../assets/avatars/monsters/monster-' + (n < 10 ? '0' + n : n) + '.png';
    }

    // ---------- Afbeeldingen laden (met cache) ----------
    const imgCache = {};
    function loadImage(src) {
        if (!imgCache[src]) {
            imgCache[src] = new Promise(resolve => {
                const img = new Image();
                img.onload = () => resolve(img);
                // Een ontbrekend monstertje mag het kaartje niet blokkeren
                img.onerror = () => resolve(null);
                img.src = src;
            });
        }
        return imgCache[src];
    }

    // ---------- Tekenen van één kaart ----------
    function fontFor(px) {
        return 'bold ' + px + 'px Arial, sans-serif';
    }

    function paintCard(ctx, student, monsterImg) {
        const W = A4.w, H = A4.h;

        // Witte achtergrond
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, W, H);

        // Stippellijn (vouwlijn) precies in het midden
        ctx.strokeStyle = '#9AA0AC';
        ctx.lineWidth = 2;
        ctx.setLineDash([16, 14]);
        ctx.beginPath();
        ctx.moveTo(30, H / 2);
        ctx.lineTo(W - 30, H / 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Onderste helft rechtop, bovenste helft 180 graden gedraaid:
        // na het vouwen staat de naam zo aan beide kanten rechtop.
        paintHalf(ctx, student, monsterImg, false);
        paintHalf(ctx, student, monsterImg, true);
    }

    function paintHalf(ctx, student, monsterImg, top) {
        const W = A4.w, H = A4.h;

        ctx.save();
        if (top) {
            ctx.translate(W / 2, H / 4);
            ctx.rotate(Math.PI);
        } else {
            ctx.translate(W / 2, (H * 3) / 4);
        }

        // Vanaf hier is (0,0) het midden van de helft
        const text = cardName(student);
        const maxWidth = W - MARGIN * 2;
        const sizeFactor = parseInt(sizeRange.value, 10) / 100;
        let fontSize = Math.round((H / 2) * 0.42 * sizeFactor);

        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.font = fontFor(fontSize);

        // Verklein tot monstertje + naam samen binnen de breedte passen
        const groupWidth = () => {
            const ms = monsterImg ? fontSize * 1.25 : 0;
            const gap = monsterImg ? fontSize * 0.25 : 0;
            return ms + gap + ctx.measureText(text).width;
        };
        while (groupWidth() > maxWidth && fontSize > 14) {
            fontSize -= 4;
            ctx.font = fontFor(fontSize);
        }

        let x = -groupWidth() / 2;

        if (monsterImg) {
            const ms = fontSize * 1.25;
            ctx.drawImage(monsterImg, x, -ms / 2, ms, ms);
            x += ms + fontSize * 0.25;
        }

        ctx.lineJoin = 'round';
        if (styleSelect.value === 'solid') {
            ctx.fillStyle = '#1a1a1a';
            ctx.fillText(text, x, 0);
        } else {
            // Open letters: witte vulling met zwarte rand -> zelf inkleuren
            ctx.fillStyle = '#ffffff';
            ctx.fillText(text, x, 0);
            ctx.lineWidth = Math.max(4, fontSize * 0.06);
            ctx.strokeStyle = '#1a1a1a';
            ctx.strokeText(text, x, 0);
        }

        ctx.restore();
    }

    // ---------- Voorbeeld renderen ----------
    async function renderPreview() {
        if (students.length === 0) {
            canvas.style.display = 'none';
            previewEmpty.style.display = '';
            previewNav.style.display = 'none';
            return;
        }

        canvas.width = A4.w;
        canvas.height = A4.h;
        canvas.style.display = '';
        previewEmpty.style.display = 'none';
        previewNav.style.display = '';

        if (previewIndex >= students.length) previewIndex = 0;
        const s = students[previewIndex];

        // Token voorkomt dat een trage (eerste) monster-load een nieuwere
        // render overschrijft.
        const token = ++renderToken;
        const monsterImg = monsterToggle.checked ? await loadImage(monsterSrc(s)) : null;
        if (token !== renderToken) return;

        paintCard(canvas.getContext('2d'), s, monsterImg);
        previewLabel.textContent = cardName(s) + '  (' + (previewIndex + 1) + '/' + students.length + ')';
    }

    function updateReadiness() {
        const ready = students.length > 0;
        downloadBtn.disabled = !ready;
        hint.textContent = ready
            ? students.length + ' naamkaarten klaar om te downloaden.'
            : 'Kies een klas met leerlingen om te beginnen.';
    }

    // ---------- PDF genereren ----------
    async function generatePdf() {
        if (!window.jspdf || students.length === 0) return;
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
        const pageW = doc.internal.pageSize.getWidth();
        const pageH = doc.internal.pageSize.getHeight();

        const work = document.createElement('canvas');
        work.width = A4.w;
        work.height = A4.h;
        const wctx = work.getContext('2d');

        downloadBtn.disabled = true;
        downloadBtn.textContent = 'Bezig met maken...';

        for (let i = 0; i < students.length; i++) {
            const s = students[i];
            const monsterImg = monsterToggle.checked ? await loadImage(monsterSrc(s)) : null;
            paintCard(wctx, s, monsterImg);
            const dataUrl = work.toDataURL('image/jpeg', 0.92);
            if (i > 0) doc.addPage('a4', 'landscape');
            doc.addImage(dataUrl, 'JPEG', 0, 0, pageW, pageH);
        }

        const groupName = selectGroup.options[selectGroup.selectedIndex]?.textContent || 'klas';
        doc.save('naamkaarten-' + groupName.replace(/\s+/g, '-').toLowerCase() + '.pdf');

        downloadBtn.disabled = false;
        downloadBtn.innerHTML = '&#128196; Download alle naamkaarten (PDF)';
    }

    // ---------- Events ----------
    selectGroup.addEventListener('change', async () => {
        const groupId = selectGroup.value;
        if (window.MTActiveClass && groupId) window.MTActiveClass.setId(groupId);
        if (!groupId) {
            students = [];
            monsterByStudentId = {};
            studentInfo.textContent = '';
        } else {
            studentInfo.textContent = 'Leerlingen laden...';
            students = await loadStudents(groupId);
            monsterByStudentId = assignMonsters(students);
            studentInfo.textContent = students.length > 0
                ? students.length + ' leerlingen'
                : 'Geen leerlingen in deze klas.';
        }
        previewIndex = 0;
        renderPreview();
        updateReadiness();
    });

    nameModeSelect.addEventListener('change', renderPreview);
    styleSelect.addEventListener('change', renderPreview);
    monsterToggle.addEventListener('change', renderPreview);
    sizeRange.addEventListener('input', () => {
        sizeVal.textContent = sizeRange.value + '%';
        renderPreview();
    });

    prevBtn.addEventListener('click', () => {
        previewIndex = (previewIndex - 1 + students.length) % students.length;
        renderPreview();
    });
    nextBtn.addEventListener('click', () => {
        previewIndex = (previewIndex + 1) % students.length;
        renderPreview();
    });

    downloadBtn.addEventListener('click', generatePdf);

    // ---------- Init ----------
    async function init() {
        const groups = await loadGroups();
        selectGroup.innerHTML = '<option value="">Selecteer een klas...</option>';
        groups.forEach(g => {
            const opt = document.createElement('option');
            opt.value = g.id;
            opt.textContent = g.name;
            selectGroup.appendChild(opt);
        });

        // Voorselecteer de globale actieve klas zodat de leerlingen meteen laden
        if (window.MTActiveClass) {
            const activeId = window.MTActiveClass.getId();
            if (activeId && groups.some(g => g.id === activeId)) {
                selectGroup.value = activeId;
                selectGroup.dispatchEvent(new Event('change'));
            }
        }
        updateReadiness();
    }
    init();
});

/* ============================================
   NAAMKLEURPLAAT - JavaScript

   Upload een kleurplaat (lijntekening) en zet de namen van een klas
   er met dikke letters overheen. Elke leerling krijgt een eigen A4.
   Download alles in één PDF om uit te printen en op de tafels te leggen.
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    // ---------- DOM ----------
    const selectGroup = document.getElementById('nkSelectGroup');
    const studentInfo = document.getElementById('nkStudentInfo');
    const dropzone = document.getElementById('nkDropzone');
    const fileInput = document.getElementById('nkFileInput');
    const dropzoneText = document.getElementById('nkDropzoneText');
    const styleSelect = document.getElementById('nkStyle');
    const positionSelect = document.getElementById('nkPosition');
    const sizeRange = document.getElementById('nkSize');
    const sizeVal = document.getElementById('nkSizeVal');
    const downloadBtn = document.getElementById('nkDownloadBtn');
    const hint = document.getElementById('nkHint');

    const canvas = document.getElementById('nkPreviewCanvas');
    const previewEmpty = document.getElementById('nkPreviewEmpty');
    const previewNav = document.getElementById('nkPreviewNav');
    const previewLabel = document.getElementById('nkPreviewLabel');
    const prevBtn = document.getElementById('nkPrevName');
    const nextBtn = document.getElementById('nkNextName');

    if (!canvas) return;

    // ---------- Constants ----------
    // Renderresolutie van een A4 (~150 dpi) voor scherpe print.
    const A4 = { w: 1240, h: 1754 };
    const MARGIN = 70; // px marge rond de tekening

    // ---------- State ----------
    let students = [];
    let image = null;          // geladen Image object
    let imgLandscape = false;  // oriëntatie van de kleurplaat
    let previewIndex = 0;

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

    function studentName(s) {
        return s.last_name ? s.first_name + ' ' + s.last_name : s.first_name;
    }

    // ---------- Page dimensions ----------
    function pageDims() {
        return imgLandscape ? { w: A4.h, h: A4.w } : { w: A4.w, h: A4.h };
    }

    // ---------- Tekenen van één kaart ----------
    function drawCard(ctx, name) {
        const dims = pageDims();
        const W = dims.w, H = dims.h;

        // Witte achtergrond
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, W, H);

        // Kleurplaat passend (contain) tekenen, gecentreerd
        if (image) {
            const availW = W - MARGIN * 2;
            const availH = H - MARGIN * 2;
            const scale = Math.min(availW / image.width, availH / image.height);
            const dw = image.width * scale;
            const dh = image.height * scale;
            const dx = (W - dw) / 2;
            const dy = (H - dh) / 2;
            ctx.drawImage(image, dx, dy, dw, dh);
        }

        // Naam erover
        drawName(ctx, name, W, H);
    }

    function drawName(ctx, name, W, H) {
        const text = (name || '').toUpperCase();
        if (!text) return;

        const sizeFactor = parseInt(sizeRange.value, 10) / 100;
        let fontSize = Math.round(H * 0.11 * sizeFactor);

        // Verticale positie
        const pos = positionSelect.value;
        let y;
        if (pos === 'top') y = MARGIN + fontSize * 0.7;
        else if (pos === 'middle') y = H / 2;
        else y = H - MARGIN - fontSize * 0.5;

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Lettergrootte verkleinen tot de naam binnen de breedte past
        const maxWidth = W - MARGIN * 2;
        ctx.font = 'bold ' + fontSize + 'px Arial, sans-serif';
        while (ctx.measureText(text).width > maxWidth && fontSize > 12) {
            fontSize -= 4;
            ctx.font = 'bold ' + fontSize + 'px Arial, sans-serif';
        }

        const x = W / 2;
        ctx.lineJoin = 'round';

        if (styleSelect.value === 'solid') {
            // Volle zwarte letters met een witte rand zodat ze op de tekening leesbaar blijven
            ctx.lineWidth = Math.max(4, fontSize * 0.16);
            ctx.strokeStyle = '#ffffff';
            ctx.strokeText(text, x, y);
            ctx.fillStyle = '#1a1a1a';
            ctx.fillText(text, x, y);
        } else {
            // Open letters: witte vulling met dikke zwarte rand -> zelf inkleuren
            ctx.fillStyle = '#ffffff';
            ctx.fillText(text, x, y);
            ctx.lineWidth = Math.max(5, fontSize * 0.07);
            ctx.strokeStyle = '#1a1a1a';
            ctx.strokeText(text, x, y);
        }
    }

    // ---------- Voorbeeld renderen ----------
    function renderPreview() {
        if (!image || students.length === 0) {
            canvas.style.display = 'none';
            previewEmpty.style.display = '';
            previewNav.style.display = 'none';
            return;
        }

        const dims = pageDims();
        canvas.width = dims.w;
        canvas.height = dims.h;
        canvas.style.display = '';
        previewEmpty.style.display = 'none';
        previewNav.style.display = '';

        if (previewIndex >= students.length) previewIndex = 0;
        const s = students[previewIndex];
        const ctx = canvas.getContext('2d');
        drawCard(ctx, studentName(s));

        previewLabel.textContent = studentName(s) + '  (' + (previewIndex + 1) + '/' + students.length + ')';
    }

    function updateReadiness() {
        const ready = !!image && students.length > 0;
        downloadBtn.disabled = !ready;
        if (!image && students.length === 0) {
            hint.textContent = 'Kies een klas en upload een kleurplaat om te beginnen.';
        } else if (!image) {
            hint.textContent = 'Upload nog een kleurplaat.';
        } else if (students.length === 0) {
            hint.textContent = 'Kies nog een klas met leerlingen.';
        } else {
            hint.textContent = students.length + ' kleurplaten klaar om te downloaden.';
        }
    }

    // ---------- Afbeelding laden ----------
    function handleFile(file) {
        if (!file || !file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                image = img;
                imgLandscape = img.width > img.height;
                dropzoneText.textContent = file.name;
                dropzone.classList.add('has-image');
                previewIndex = 0;
                renderPreview();
                updateReadiness();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // ---------- PDF genereren ----------
    function generatePdf() {
        if (!window.jspdf || !image || students.length === 0) return;
        const { jsPDF } = window.jspdf;
        const orientation = imgLandscape ? 'landscape' : 'portrait';
        const doc = new jsPDF({ orientation: orientation, unit: 'pt', format: 'a4' });
        const pageW = doc.internal.pageSize.getWidth();
        const pageH = doc.internal.pageSize.getHeight();

        const dims = pageDims();
        const work = document.createElement('canvas');
        work.width = dims.w;
        work.height = dims.h;
        const wctx = work.getContext('2d');

        downloadBtn.disabled = true;
        downloadBtn.textContent = 'Bezig met maken...';

        students.forEach((s, i) => {
            drawCard(wctx, studentName(s));
            const dataUrl = work.toDataURL('image/jpeg', 0.92);
            if (i > 0) doc.addPage('a4', orientation);
            doc.addImage(dataUrl, 'JPEG', 0, 0, pageW, pageH);
        });

        const groupName = selectGroup.options[selectGroup.selectedIndex]?.textContent || 'klas';
        doc.save('naamkleurplaten-' + groupName.replace(/\s+/g, '-').toLowerCase() + '.pdf');

        downloadBtn.disabled = false;
        downloadBtn.innerHTML = '&#128196; Download alle kleurplaten (PDF)';
    }

    // ---------- Events ----------
    selectGroup.addEventListener('change', async () => {
        const groupId = selectGroup.value;
        if (!groupId) {
            students = [];
            studentInfo.textContent = '';
        } else {
            studentInfo.textContent = 'Leerlingen laden...';
            students = await loadStudents(groupId);
            studentInfo.textContent = students.length > 0
                ? students.length + ' leerlingen'
                : 'Geen leerlingen in deze klas.';
        }
        previewIndex = 0;
        renderPreview();
        updateReadiness();
    });

    dropzone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => handleFile(e.target.files[0]));

    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
    });

    styleSelect.addEventListener('change', renderPreview);
    positionSelect.addEventListener('change', renderPreview);
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
        updateReadiness();
    }
    init();
});

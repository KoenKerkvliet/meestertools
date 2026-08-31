import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { assignMonsters, hashStr, monsterPath, normName, MONSTER_COUNT, displayNameOf } from '../_shared/monsters.ts'
import { ACTIVE_BLOCKS, computeVerdict, upsertMastery } from '../_shared/rekenmuur.ts'

/**
 * Rekenrace — publieke leerlingkant (klassikale rekensprint).
 *
 * Leerlingen hebben geen account. Al het leerling-verkeer loopt via deze
 * functie met de service-role key, net als bij de complimentenmuur. De
 * rekensommen zijn niet geheim (iedereen kan ze uitrekenen), dus die worden
 * client-side gegenereerd én nagekeken voor 0 netwerklatentie. Deze functie
 * doet het "veilige" werk:
 *   - join: voornaam matchen aan de klas + vast monstertje teruggeven
 *   - progress: geaggregeerde stats wegschrijven (live dashboard) + bij het
 *               afronden de blijvende rekenmuur van het kind bijwerken
 *   - mywall: het persoonlijke rekenmuurtje van het kind teruggeven
 *
 * Acties (POST body { action, code, ... }):
 *   - status   { code }
 *   - join     { code, name, studentId? }
 *   - progress { code, participantId, answered, correct, totalMs, finished }
 *   - mywall   { code, participantId }
 */

const NAME_MAX = 30
const MAX_PARTICIPANTS = 60
const ANSWER_CAP = 100000

// De norm voor "beheerst" en het bijwerken van de muur staan in
// _shared/rekenmuur.ts, want de leerling-functie doet bij solo-oefenen exact
// hetzelfde. Zou dat hier apart staan, dan kon een steentje groen zijn na de
// klassikale race en oranje na zelf oefenen.


serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const action = String(body?.action || '')
    const code = normalizeCode(body?.code)

    if (!code) return json({ ok: false, error: 'Geen code opgegeven.' }, 400)

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data: session, error: sErr } = await admin
      .from('rekenrace_sessions')
      .select('id, user_id, group_id, status, purpose, block_id, block_label, mode, duration_seconds, target_count, started_at')
      .eq('code', code)
      .maybeSingle()

    if (sErr) {
      console.error('session lookup error:', sErr.message)
      return json({ ok: false, error: 'Er ging iets mis.' }, 500)
    }
    if (!session) {
      return json({ ok: true, exists: false })
    }

    const nowMs = Date.now()
    const startedAtMs = session.started_at ? new Date(session.started_at).getTime() : null
    const deadlineMs = (startedAtMs && session.mode === 'tijd' && session.duration_seconds)
      ? startedAtMs + session.duration_seconds * 1000 : null
    const timeUp = deadlineMs !== null && nowMs > deadlineMs

    const pub = {
      exists: true,
      status: session.status,
      purpose: session.purpose || 'race',
      blockId: session.block_id,
      blockLabel: session.block_label,
      mode: session.mode,
      durationSeconds: session.duration_seconds,
      targetCount: session.target_count,
      startedAtMs,
      nowMs,
      timeUp,
    }

    // ---------------- status ----------------
    if (action === 'status') {
      return json({ ok: true, ...pub })
    }

    // ---------------- join ----------------
    if (action === 'join') {
      if (session.status === 'closed') {
        return json({ ok: true, ...pub })
      }
      const name = cleanText(body?.name, NAME_MAX)
      if (!name) return json({ ok: false, error: 'Vul je voornaam in.' }, 400)
      const isView = (session.purpose || 'race') === 'view'

      // Voornaam matchen aan de klas waarvoor de sessie is gestart.
      const { data: roster } = await admin
        .from('students')
        .select('id, first_name, name_suffix, student_number')
        .eq('group_id', session.group_id)
        .eq('archived', false)
        .order('student_number')

      const monsterMap = assignMonsters(roster || [])
      const norm = normName(name)

      // Meer kinderen met dezelfde voornaam? Dan mag de server niet zomaar de
      // eerste pakken — dan komen drie Noa's op hetzelfde rekenmuurtje uit.
      // Het kind kiest zelf, aan de hand van het eigen monstertje.
      const sameName = (roster || []).filter((s) => normName(s.first_name) === norm)
      const pickedId = String(body?.studentId || '')
      let match = sameName.length === 1 ? sameName[0] : null
      if (sameName.length > 1) {
        // Alleen een kind uit dit lijstje mag gekozen worden: je moet de voornaam
        // dus al goed hebben getypt voordat een id iets oplevert.
        match = sameName.find((s) => s.id === pickedId) || null
        if (!match) {
          return json({
            ok: true,
            needsPick: true,
            candidates: sameName.map((s) => ({
              id: s.id,
              label: displayNameOf(s),
              monster: monsterPath(monsterMap[s.id] || ((hashStr(s.id) % MONSTER_COUNT) + 1)),
            })),
            ...pub,
          })
        }
      }

      let studentId = null
      let displayName = titleCase(name)
      let monster
      if (match) {
        studentId = match.id
        displayName = displayNameOf(match) || displayName
        monster = monsterPath(monsterMap[match.id] || ((hashStr(match.id) % MONSTER_COUNT) + 1))
      } else {
        monster = monsterPath((hashStr(norm) % MONSTER_COUNT) + 1)
      }

      // Bekijk-modus = permanente klas-link: geen cap, en deelnemer hergebruiken
      // (op student_id, anders op naam) zodat de tabel niet onbeperkt groeit.
      if (isView) {
        let existing = null
        if (studentId) {
          const r = await admin.from('rekenrace_participants')
            .select('id').eq('session_id', session.id).eq('student_id', studentId).limit(1).maybeSingle()
          existing = r.data || null
        }
        // Alleen terugvallen op de naam als het kind niet aan de klaslijst hangt.
        // Anders zou een tweede Noa de rij van de eerste kunnen overnemen.
        if (!existing && !studentId) {
          const r = await admin.from('rekenrace_participants')
            .select('id, name, student_id').eq('session_id', session.id)
          existing = (r.data || []).find((p) => !p.student_id && normName(p.name) === norm) || null
        }
        if (existing) {
          return json({ ok: true, participantId: existing.id, displayName, monster, matched: !!match, ...pub })
        }
      } else {
        const { count: pCount } = await admin
          .from('rekenrace_participants')
          .select('id', { count: 'exact', head: true })
          .eq('session_id', session.id)
        if ((pCount || 0) >= MAX_PARTICIPANTS) {
          return json({ ok: false, error: 'Deze race zit vol. Vraag je juf of meester om hulp.' }, 429)
        }
      }

      const { data: p, error: pErr } = await admin
        .from('rekenrace_participants')
        .insert({
          session_id: session.id,
          name,
          student_id: studentId,
          display_name: displayName,
          monster,
        })
        .select('id')
        .single()

      if (pErr) {
        console.error('participant insert error:', pErr.message)
        return json({ ok: false, error: 'Aanmelden lukte niet. Probeer opnieuw.' }, 500)
      }
      return json({ ok: true, participantId: p.id, displayName, monster, matched: !!match, ...pub })
    }

    // ---------------- mywall ----------------
    if (action === 'mywall') {
      const participantId = String(body?.participantId || '')
      if (!participantId) return json({ ok: false, error: 'Meld je eerst aan.' }, 400)

      const { data: participant } = await admin
        .from('rekenrace_participants')
        .select('id, session_id, student_id')
        .eq('id', participantId)
        .maybeSingle()

      if (!participant || participant.session_id !== session.id) {
        return json({ ok: false, error: 'Meld je opnieuw aan.' }, 403)
      }
      if (!participant.student_id) {
        return json({ ok: true, matched: false, wall: [], ...pub })
      }
      const { data: wall } = await admin
        .from('rekenmuur_mastery')
        .select('block_id, status, regressed, best_per_min, best_accuracy, last_per_min, last_accuracy, last_answered')
        .eq('student_id', participant.student_id)
      return json({ ok: true, matched: true, wall: wall || [], ...pub })
    }

    // ---------------- solofinish (zelf oefenen vanuit het muurtje) ----------------
    if (action === 'solofinish') {
      const participantId = String(body?.participantId || '')
      if (!participantId) return json({ ok: false, error: 'Meld je eerst aan.' }, 400)
      if ((session.purpose || 'race') !== 'view') {
        return json({ ok: false, error: 'Solo-oefenen kan alleen via de rekenmuur-link.' }, 400)
      }
      const blockId = String(body?.blockId || '')
      if (!ACTIVE_BLOCKS.has(blockId)) return json({ ok: false, error: 'Onbekend steentje.' }, 400)

      const { data: participant } = await admin
        .from('rekenrace_participants')
        .select('id, session_id, student_id')
        .eq('id', participantId)
        .maybeSingle()

      if (!participant || participant.session_id !== session.id) {
        return json({ ok: false, error: 'Meld je opnieuw aan.' }, 403)
      }
      if (!participant.student_id) {
        return json({ ok: true, matched: false, wall: [], ...pub })
      }

      const answered = clampInt(body?.answered, 0, ANSWER_CAP)
      let correct = clampInt(body?.correct, 0, ANSWER_CAP)
      if (correct > answered) correct = answered
      const totalMs = clampInt(body?.totalMs, 0, ANSWER_CAP * 60000)

      let mastery = null
      const verdict = computeVerdict(answered, correct, totalMs)
      if (verdict) {
        mastery = await upsertMastery(
          admin,
          { user_id: session.user_id, group_id: session.group_id, block_id: blockId },
          participant.student_id,
          verdict
        )
      }
      const { data: wall } = await admin
        .from('rekenmuur_mastery')
        .select('block_id, status, regressed, best_per_min, best_accuracy, last_per_min, last_accuracy, last_answered')
        .eq('student_id', participant.student_id)
      return json({ ok: true, matched: true, mastery, wall: wall || [], ...pub })
    }

    // ---------------- progress ----------------
    if (action === 'progress') {
      const participantId = String(body?.participantId || '')
      if (!participantId) return json({ ok: false, error: 'Meld je eerst aan.' }, 400)

      const { data: participant, error: pvErr } = await admin
        .from('rekenrace_participants')
        .select('id, session_id, student_id, answered_count, correct_count, finished')
        .eq('id', participantId)
        .maybeSingle()

      if (pvErr || !participant || participant.session_id !== session.id) {
        return json({ ok: false, error: 'Meld je opnieuw aan.' }, 403)
      }

      const answered = clampInt(body?.answered, participant.answered_count || 0, ANSWER_CAP)
      let correct = clampInt(body?.correct, participant.correct_count || 0, ANSWER_CAP)
      if (correct > answered) correct = answered
      const totalMs = clampInt(body?.totalMs, 0, ANSWER_CAP * 60000)
      const finished = !!body?.finished || !!participant.finished

      const patch = {
        answered_count: answered,
        correct_count: correct,
        total_ms: totalMs,
        finished,
      }
      const firstFinish = finished && !participant.finished
      if (firstFinish) patch.finished_at = new Date().toISOString()

      const { error: uErr } = await admin
        .from('rekenrace_participants')
        .update(patch)
        .eq('id', participant.id)

      if (uErr) {
        console.error('progress update error:', uErr.message)
        return json({ ok: false, error: 'Opslaan lukte niet.' }, 500)
      }

      // Blijvende rekenmuur bijwerken bij de eerste keer afronden van een echte race.
      let mastery = null
      if (firstFinish && (session.purpose || 'race') === 'race' && participant.student_id && session.block_id) {
        const verdict = computeVerdict(answered, correct, totalMs)
        if (verdict) mastery = await upsertMastery(admin, session, participant.student_id, verdict)
      }
      return json({ ok: true, status: session.status, timeUp, mastery })
    }

    return json({ ok: false, error: 'Onbekende actie.' }, 400)
  } catch (err) {
    console.error('rekenrace-sessie error:', err)
    return json({ ok: false, error: err.message || 'Onbekende fout.' }, 500)
  }
})

// ---------- Beheersing (rekenmuur) ----------
function titleCase(s) {
  const t = String(s || '').trim()
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : t
}
function normalizeCode(raw) {
  return String(raw || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)
}
function cleanText(raw, max) {
  return String(raw || '').replace(/\s+/g, ' ').trim().slice(0, max)
}
function clampInt(raw, min, max) {
  let n = parseInt(String(raw), 10)
  if (!Number.isFinite(n)) n = min
  if (n < min) n = min
  if (n > max) n = max
  return n
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

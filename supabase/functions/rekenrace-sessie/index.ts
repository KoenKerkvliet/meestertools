import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

/**
 * Rekenrace — publieke leerlingkant (klassikale rekensprint).
 *
 * Leerlingen hebben geen account. Al het leerling-verkeer loopt via deze
 * functie met de service-role key, net als bij de complimentenmuur. De
 * rekensommen zijn niet geheim (iedereen kan ze uitrekenen), dus die worden
 * client-side gegenereerd én nagekeken voor 0 netwerklatentie. Deze functie
 * doet alleen het "veilige" werk:
 *   - join: voornaam matchen aan de klas + vast monstertje teruggeven
 *   - progress: geaggregeerde stats wegschrijven (live dashboard)
 *
 * Acties (POST body { action, code, ... }):
 *   - status   { code }                          -> sessiestatus + blok + tijd
 *   - join     { code, name }                    -> deelnemer + match + monster
 *   - progress { code, participantId, answered, correct, totalMs, finished }
 */

const NAME_MAX = 30
const MAX_PARTICIPANTS = 60
const MONSTER_COUNT = 36
const ANSWER_CAP = 100000 // bovengrens tegen onzin-waarden

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
      .select('id, group_id, status, block_id, block_label, mode, duration_seconds, target_count, started_at')
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

      const { count: pCount } = await admin
        .from('rekenrace_participants')
        .select('id', { count: 'exact', head: true })
        .eq('session_id', session.id)

      if ((pCount || 0) >= MAX_PARTICIPANTS) {
        return json({ ok: false, error: 'Deze race zit vol. Vraag je juf of meester om hulp.' }, 429)
      }

      // Voornaam matchen aan de klas waarvoor de sessie is gestart.
      const { data: roster } = await admin
        .from('students')
        .select('id, first_name, student_number')
        .eq('group_id', session.group_id)
        .eq('archived', false)
        .order('student_number')

      const monsterMap = assignMonsters(roster || [])
      const norm = normName(name)
      const match = (roster || []).find((s: any) => normName(s.first_name) === norm) || null

      let studentId: string | null = null
      let displayName = titleCase(name)
      let monster: string
      if (match) {
        studentId = match.id
        displayName = match.first_name || displayName
        monster = monsterPath(monsterMap[match.id] || ((hashStr(match.id) % MONSTER_COUNT) + 1))
      } else {
        // Geen match: toch een monstertje, op naam-hash. Leerkracht ziet
        // dit als "niet herkend" (student_id null).
        monster = monsterPath((hashStr(norm) % MONSTER_COUNT) + 1)
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

    // ---------------- progress ----------------
    if (action === 'progress') {
      const participantId = String(body?.participantId || '')
      if (!participantId) return json({ ok: false, error: 'Meld je eerst aan.' }, 400)

      const { data: participant, error: pvErr } = await admin
        .from('rekenrace_participants')
        .select('id, session_id, answered_count, correct_count, finished')
        .eq('id', participantId)
        .maybeSingle()

      if (pvErr || !participant || participant.session_id !== session.id) {
        return json({ ok: false, error: 'Meld je opnieuw aan.' }, 403)
      }

      // Monotoon + geplafonneerd: stats kunnen alleen vooruit, nooit boven cap.
      const answered = clampInt(body?.answered, participant.answered_count || 0, ANSWER_CAP)
      let correct = clampInt(body?.correct, participant.correct_count || 0, ANSWER_CAP)
      if (correct > answered) correct = answered
      const totalMs = clampInt(body?.totalMs, 0, ANSWER_CAP * 60000)
      const finished = !!body?.finished || !!participant.finished

      const patch: Record<string, unknown> = {
        answered_count: answered,
        correct_count: correct,
        total_ms: totalMs,
        finished,
      }
      if (finished && !participant.finished) patch.finished_at = new Date().toISOString()

      const { error: uErr } = await admin
        .from('rekenrace_participants')
        .update(patch)
        .eq('id', participant.id)

      if (uErr) {
        console.error('progress update error:', uErr.message)
        return json({ ok: false, error: 'Opslaan lukte niet.' }, 500)
      }
      return json({ ok: true, status: session.status, timeUp })
    }

    return json({ ok: false, error: 'Onbekende actie.' }, 400)
  } catch (err) {
    console.error('rekenrace-sessie error:', err)
    return json({ ok: false, error: (err as Error).message || 'Onbekende fout.' }, 500)
  }
})

// ---------- Monstertjes (zelfde algoritme als de tools client-side) ----------
function hashStr(key: string): number {
  let h = 0
  key = String(key || '')
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0
  return h
}
function assignMonsters(list: Array<{ id: string }>): Record<string, number> {
  const map: Record<string, number> = {}
  const used: Record<number, boolean> = {}
  ;(list || []).slice().sort((a, b) => {
    const ai = String(a.id), bi = String(b.id)
    return ai < bi ? -1 : ai > bi ? 1 : 0
  }).forEach((s) => {
    let n = hashStr(s.id) % MONSTER_COUNT, tries = 0
    while (used[n] && tries < MONSTER_COUNT) { n = (n + 1) % MONSTER_COUNT; tries++ }
    used[n] = true
    map[s.id] = n + 1
  })
  return map
}
function monsterPath(n: number): string {
  const nn = n < 10 ? '0' + n : String(n)
  return 'assets/avatars/monsters/monster-' + nn + '.png'
}

// ---------- Tekst ----------
function normName(s: unknown): string {
  return String(s == null ? '' : s).trim().toLowerCase()
}
function titleCase(s: string): string {
  const t = String(s || '').trim()
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : t
}
function normalizeCode(raw: unknown): string {
  return String(raw || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)
}
function cleanText(raw: unknown, max: number): string {
  return String(raw || '').replace(/\s+/g, ' ').trim().slice(0, max)
}
function clampInt(raw: unknown, min: number, max: number): number {
  let n = parseInt(String(raw), 10)
  if (!Number.isFinite(n)) n = min
  if (n < min) n = min
  if (n > max) n = max
  return n
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

/**
 * Escape room-sessie — publieke leerlingkant (teams).
 *
 * Teams hebben geen account. Alle leerling-verkeer loopt via deze functie
 * met de service-role key, net als bij de complimentenmuur. Belangrijkste
 * reden hier: de ANTWOORDEN mogen nooit naar de leerling-browser. Vragen
 * gaan zonder antwoord naar de client; controle gebeurt server-side.
 *
 * Acties (POST body { action, code, ... }):
 *   - status    { code }                            -> sessiestatus + tijd
 *   - join      { code, teamName }                  -> team aanmaken
 *   - questions { code, teamId }                    -> vragen (zonder antwoorden) + teamstate
 *   - check     { code, teamId, position, answer }  -> antwoord controleren
 *   - unlock    { code, teamId, position|'finale' } -> kaart/finale openen met sleutels
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const NAME_MAX = 24
const MAX_TEAMS = 40
const MAX_ATTEMPTS = 3000
const GOLD_NEEDED = 2

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
      .from('escaperoom_sessions')
      .select('id, room_id, status, time_limit_minutes, started_at, escaperooms(title, theme)')
      .eq('code', code)
      .maybeSingle()

    if (sErr) {
      console.error('session lookup error:', sErr.message)
      return json({ ok: false, error: 'Er ging iets mis.' }, 500)
    }
    if (!session) {
      return json({ ok: true, exists: false })
    }

    const room = (session as any).escaperooms || {}
    const nowMs = Date.now()
    const startedAtMs = session.started_at ? new Date(session.started_at).getTime() : null
    const deadlineMs = (startedAtMs && session.time_limit_minutes)
      ? startedAtMs + session.time_limit_minutes * 60000 : null
    const timeUp = deadlineMs !== null && nowMs > deadlineMs

    const pub = {
      exists: true,
      status: session.status,
      roomTitle: room.title || '',
      theme: room.theme || 'standaard',
      timeLimitMinutes: session.time_limit_minutes,
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
      const teamName = cleanText(body?.teamName, NAME_MAX)
      if (!teamName) return json({ ok: false, error: 'Vul een teamnaam in.' }, 400)

      const { count: tCount } = await admin
        .from('escaperoom_session_teams')
        .select('id', { count: 'exact', head: true })
        .eq('session_id', session.id)

      if ((tCount || 0) >= MAX_TEAMS) {
        return json({ ok: false, error: 'Deze sessie zit vol. Vraag je juf of meester om hulp.' }, 429)
      }

      const { data: team, error: tErr } = await admin
        .from('escaperoom_session_teams')
        .insert({ session_id: session.id, name: teamName })
        .select('id')
        .single()

      if (tErr) {
        console.error('team insert error:', tErr.message)
        return json({ ok: false, error: 'Aanmelden lukte niet. Probeer opnieuw.' }, 500)
      }
      return json({ ok: true, teamId: team.id, teamName, ...pub })
    }

    // Vanaf hier is een geldig team vereist
    const teamId = String(body?.teamId || '')
    if (!teamId) return json({ ok: false, error: 'Meld je eerst aan.' }, 400)

    const { data: team, error: tvErr } = await admin
      .from('escaperoom_session_teams')
      .select('id, session_id, name, answered, unlocked, finale_unlocked, finished_at, attempts')
      .eq('id', teamId)
      .maybeSingle()

    if (tvErr || !team || team.session_id !== session.id) {
      return json({ ok: false, error: 'Meld je opnieuw aan.' }, 403)
    }

    // Vragen ophalen (nodig voor questions, check en unlock)
    const { data: qs, error: qErr } = await admin
      .from('escaperoom_questions')
      .select('position, question, answer, question_type, options, image_url, puzzle_size, puzzle_level, findit_boxes')
      .eq('room_id', session.room_id)
      .order('position')

    if (qErr || !qs || !qs.length) {
      return json({ ok: false, error: 'Deze escape room heeft geen vragen.' }, 500)
    }

    const finalePos = Math.max(...qs.map((q: any) => q.position))
    const answered: number[] = Array.isArray(team.answered) ? team.answered : []
    const unlocked: number[] = Array.isArray(team.unlocked) ? team.unlocked : []
    const totalNormals = qs.length - 1
    const silverNeeded = Math.max(0, totalNormals - 2)

    function keyState() {
      const answeredNormals = answered.filter(p => p !== finalePos).length
      const silverGranted = Math.min(answeredNormals, silverNeeded)
      const goldGranted = Math.max(0, answeredNormals - silverNeeded)
      return {
        silver: silverGranted - unlocked.length,
        gold: goldGranted - (team.finale_unlocked ? GOLD_NEEDED : 0),
      }
    }

    const teamState = () => ({
      answered,
      unlocked,
      finaleUnlocked: team.finale_unlocked,
      finished: !!team.finished_at,
    })

    // ---------------- questions ----------------
    if (action === 'questions') {
      if (session.status !== 'playing') {
        return json({ ok: true, ...pub, ...teamState(), questions: null })
      }
      const questions = qs.map((q: any) => {
        const t = q.question_type || 'text'
        const isLockish = t === 'cijferslot' || t === 'letterslot' || t === 'draaislot'
        let options: string[] | null = null
        if (t === 'meerkeuze') {
          const all = [String(q.answer)].concat(Array.isArray(q.options) ? q.options.map(String) : [])
          options = seededShuffle(all, hashStr(teamId + ':' + q.position))
        }
        return {
          position: q.position,
          question: q.question,
          question_type: t,
          answer_len: isLockish ? String(q.answer || '').trim().length : null,
          options,
          image_url: (t === 'schuifpuzzel' || t === 'findit') ? q.image_url : null,
          puzzle_size: q.puzzle_size,
          puzzle_level: q.puzzle_level,
          // Find it: de kaders zijn nodig om client-side de klikken te
          // herkennen en te onthullen (net als de schuifpuzzel client-side
          // oplost). Geen tekst-antwoord dat we geheim moeten houden.
          findit_boxes: t === 'findit' ? q.findit_boxes : null,
        }
      })
      return json({ ok: true, ...pub, ...teamState(), questions })
    }

    // ---------------- check ----------------
    if (action === 'check') {
      if (session.status !== 'playing') {
        return json({ ok: false, error: 'De sessie is niet (meer) bezig.', status: session.status }, 409)
      }
      if (timeUp) return json({ ok: false, timeUp: true, error: 'De tijd is om!' }, 409)
      if (team.finished_at) return json({ ok: true, correct: true, ...teamState() })

      const position = parseInt(String(body?.position), 10)
      const q = qs.find((x: any) => x.position === position)
      if (!q) return json({ ok: false, error: 'Onbekende vraag.' }, 400)

      if ((team.attempts || 0) >= MAX_ATTEMPTS) {
        return json({ ok: false, error: 'Te veel pogingen.' }, 429)
      }
      await admin.from('escaperoom_session_teams')
        .update({ attempts: (team.attempts || 0) + 1 })
        .eq('id', team.id)

      if (answered.includes(position)) {
        return json({ ok: true, correct: true, ...teamState() })
      }

      // Alleen open kaarten mogen beantwoord worden
      const isFinale = position === finalePos
      if (isFinale && !team.finale_unlocked) {
        return json({ ok: false, error: 'De finale zit nog op slot.' }, 403)
      }
      if (!isFinale && position > 2 && !unlocked.includes(position)) {
        return json({ ok: false, error: 'Deze kaart zit nog op slot.' }, 403)
      }

      const correct = checkAnswer(q, String(body?.answer ?? ''))
      if (!correct) {
        return json({ ok: true, correct: false })
      }

      answered.push(position)
      const patch: Record<string, unknown> = { answered }
      if (isFinale) patch.finished_at = new Date().toISOString()
      const { error: uErr } = await admin
        .from('escaperoom_session_teams').update(patch).eq('id', team.id)
      if (uErr) {
        console.error('answered update error:', uErr.message)
        return json({ ok: false, error: 'Opslaan lukte niet. Probeer opnieuw.' }, 500)
      }
      if (isFinale) team.finished_at = new Date().toISOString()
      return json({ ok: true, correct: true, finished: isFinale, ...teamState() })
    }

    // ---------------- unlock ----------------
    if (action === 'unlock') {
      if (session.status !== 'playing') {
        return json({ ok: false, error: 'De sessie is niet (meer) bezig.', status: session.status }, 409)
      }
      if (timeUp) return json({ ok: false, timeUp: true, error: 'De tijd is om!' }, 409)

      const keys = keyState()
      const target = String(body?.position ?? '')

      if (target === 'finale') {
        if (team.finale_unlocked) return json({ ok: true, ...teamState() })
        if (keys.gold < GOLD_NEEDED) {
          return json({ ok: false, error: 'Nog niet genoeg gouden sleutels.' }, 403)
        }
        const { error } = await admin.from('escaperoom_session_teams')
          .update({ finale_unlocked: true }).eq('id', team.id)
        if (error) return json({ ok: false, error: 'Openen lukte niet.' }, 500)
        team.finale_unlocked = true
        return json({ ok: true, ...teamState() })
      }

      const position = parseInt(target, 10)
      const isNormal = qs.some((x: any) => x.position === position) && position !== finalePos
      if (!isNormal || position <= 2) return json({ ok: false, error: 'Deze kaart kan niet geopend worden.' }, 400)
      if (unlocked.includes(position)) return json({ ok: true, ...teamState() })
      if (keys.silver < 1) {
        return json({ ok: false, error: 'Geen zilveren sleutel beschikbaar.' }, 403)
      }
      unlocked.push(position)
      const { error } = await admin.from('escaperoom_session_teams')
        .update({ unlocked }).eq('id', team.id)
      if (error) return json({ ok: false, error: 'Openen lukte niet.' }, 500)
      return json({ ok: true, ...teamState() })
    }

    return json({ ok: false, error: 'Onbekende actie.' }, 400)
  } catch (err) {
    console.error('escaperoom-sessie error:', err)
    return json({ ok: false, error: (err as Error).message || 'Onbekende fout.' }, 500)
  }
})

// ---------- Antwoord-controle (spiegelt de normalisatie van de speelpagina) ----------
function checkAnswer(q: { question_type?: string; answer?: string }, raw: string): boolean {
  const t = q.question_type || 'text'
  const stored = String(q.answer ?? '')
  if (t === 'schuifpuzzel') return true // puzzel opgelost = client meldt klaar
  if (t === 'findit') return true // alle verschillen gevonden = client meldt klaar
  if (t === 'cijferslot' || t === 'letterslot' || t === 'draaislot') {
    return raw.trim().toUpperCase() === stored.trim().toUpperCase()
  }
  if (t === 'datum' || t === 'datum_jaar') {
    return raw.trim() === stored.trim()
  }
  // text en meerkeuze: hoofdletter-ongevoelig, spaties genormaliseerd
  return normalizeText(raw) === normalizeText(stored)
}

function normalizeText(s: string): string {
  return String(s || '').trim().toLowerCase().replace(/\s+/g, ' ')
}

function normalizeCode(raw: unknown): string {
  return String(raw || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)
}

function cleanText(raw: unknown, max: number): string {
  return String(raw || '').replace(/\s+/g, ' ').trim().slice(0, max)
}

function hashStr(key: string): number {
  let h = 0
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0
  return h
}

// Deterministische shuffle: zelfde team -> zelfde volgorde (ook na refresh)
function seededShuffle(arr: string[], seed: number): string[] {
  const out = arr.slice()
  let s = seed || 1
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) % 2147483648
    const j = s % (i + 1)
    const tmp = out[i]; out[i] = out[j]; out[j] = tmp
  }
  return out
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { assignMonsters, hashStr, monsterPath, normName, MONSTER_COUNT, displayNameOf } from '../_shared/monsters.ts'

/**
 * Klassikale Typrace — publieke kant (kinderen, geen account).
 *
 * Acties (POST body { action, code, ... }):
 *   - status { code }                      -> status van de sessie (poll)
 *   - join   { code, name, studentId? }    -> deelnemen, geef monster + id
 *   - progress { code, participantId, score } -> eigen score melden (alleen omhoog)
 *
 * De woorden worden client-side gegenereerd; de server houdt alleen de score bij
 * zodat de leerkracht (owner) via realtime een live-ranglijst ziet.
 */

const NAME_MAX = 30
const MAX_PART = 40
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const body = await req.json().catch(() => ({}))
    const action = String(body?.action || '')
    const code = normCode(body?.code)
    if (!code) return json({ ok: false, error: 'Geen code opgegeven.' }, 400)

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data: session } = await admin
      .from('typrace_sessions')
      .select('id, group_id, status, duration_s, started_at')
      .eq('code', code)
      .maybeSingle()

    if (!session) return json({ ok: true, exists: false })
    const pub = {
      exists: true,
      status: session.status,
      duration: session.duration_s,
      startedAt: session.started_at,
    }

    if (action === 'status') return json({ ok: true, ...pub })

    // ---------------- join ----------------
    if (action === 'join') {
      if (session.status === 'closed') return json({ ok: true, ...pub })
      const name = cleanText(body?.name, NAME_MAX)
      if (!name) return json({ ok: false, error: 'Vul je voornaam in.' }, 400)

      // Match op een leerling in de klas van de sessie (voor het monstertje).
      let match: any = null
      let monster = monsterPath((hashStr(name.toLowerCase()) % MONSTER_COUNT) + 1)
      let displayName = name
      if (session.group_id) {
        const { data: roster } = await admin
          .from('students').select('id, first_name, name_suffix')
          .eq('group_id', session.group_id).eq('archived', false)
        const map = assignMonsters(roster || [])

        // Meer kinderen met dezelfde voornaam? Niet zomaar de eerste pakken —
        // dan neemt de tweede Noa de rij én de score van de eerste over.
        // Het kind wijst zichzelf aan via het eigen monstertje.
        const sameName = (roster || []).filter((s: any) => normName(s.first_name) === normName(name))
        const pickedId = String(body?.studentId || '')
        match = sameName.length === 1 ? sameName[0] : null
        if (sameName.length > 1) {
          match = sameName.find((s: any) => s.id === pickedId) || null
          if (!match) {
            return json({
              ok: true,
              needsPick: true,
              candidates: sameName.map((s: any) => ({
                id: s.id,
                label: displayNameOf(s),
                monster: monsterPath(map[s.id] || ((hashStr(s.id) % MONSTER_COUNT) + 1)),
              })),
              ...pub,
            })
          }
        }
        if (match) {
          displayName = displayNameOf(match)
          monster = monsterPath(map[match.id] || ((hashStr(match.id) % MONSTER_COUNT) + 1))
        }
      }

      // Hergebruik een bestaande deelnemer: op student_id als het kind aan de
      // klaslijst hangt, anders pas op naam.
      const { data: parts } = await admin
        .from('typrace_participants')
        .select('id, name, student_id')
        .eq('session_id', session.id)
      const existing = match
        ? (parts || []).find((p: any) => p.student_id === match.id) || null
        : (parts || []).find((p: any) => !p.student_id && normName(p.name) === normName(name)) || null
      if (existing) {
        return json({ ok: true, participantId: existing.id, displayName, monster, ...pub })
      }
      if ((parts || []).length >= MAX_PART) {
        return json({ ok: false, error: 'Deze race zit vol. Vraag je juf of meester om hulp.' }, 429)
      }

      const { data: p, error } = await admin
        .from('typrace_participants')
        .insert({
          session_id: session.id, name, student_id: match ? match.id : null,
          display_name: displayName, monster, score: 0,
        })
        .select('id').single()
      if (error) {
        console.error('typrace join error:', error.message)
        return json({ ok: false, error: 'Aanmelden lukte niet. Probeer opnieuw.' }, 500)
      }
      return json({ ok: true, participantId: p.id, displayName, monster, ...pub })
    }

    // ---------------- progress ----------------
    if (action === 'progress') {
      const participantId = String(body?.participantId || '')
      if (!participantId) return json({ ok: false, error: 'Meld je eerst aan.' }, 400)
      const score = clampInt(body?.score, 0, 100000)

      const { data: cur } = await admin
        .from('typrace_participants')
        .select('id, score')
        .eq('id', participantId).eq('session_id', session.id)
        .maybeSingle()
      if (!cur) return json({ ok: false, error: 'Meld je opnieuw aan.' }, 403)

      if (score > (cur.score || 0)) {
        await admin.from('typrace_participants')
          .update({ score })
          .eq('id', participantId)
      }
      return json({ ok: true, ...pub })
    }

    return json({ ok: false, error: 'Onbekende actie.' }, 400)
  } catch (err) {
    console.error('typrace error:', err)
    return json({ ok: false, error: (err as Error).message || 'Onbekende fout.' }, 500)
  }
})

function normCode(raw: unknown): string {
  return String(raw || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)
}
function cleanText(raw: unknown, max: number): string {
  return String(raw || '').replace(/\s+/g, ' ').trim().slice(0, max)
}
function clampInt(raw: unknown, min: number, max: number): number {
  const n = Math.round(Number(raw))
  if (!isFinite(n)) return min
  return Math.max(min, Math.min(max, n))
}
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

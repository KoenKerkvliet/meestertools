import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

/**
 * Complimentenmuur — publieke leerlingkant.
 *
 * Leerlingen hebben geen account. In plaats van de tabellen rechtstreeks
 * open te zetten voor de anon-rol, loopt alle leerling-verkeer via deze
 * functie met de service-role key. Zo valideren we de sessiecode
 * server-side, lekken we niets en kunnen we eenvoudig misbruik afremmen.
 *
 * Acties (POST body { action, ... }):
 *   - status  { code }                          -> sessiestatus + focus-kind
 *   - join    { code, name, studentId? }        -> maak deelnemer, geef id terug
 *   - submit  { code, participantId, text }     -> dien compliment in
 */

const NAME_MAX = 30
const TEXT_MAX = 280
const MAX_PER_PARTICIPANT = 25
// Cap op deelnemers per sessie: zonder deze rem kan iemand die de code kent
// onbeperkt opnieuw joinen en zo de limiet per deelnemer omzeilen.
// Ruim boven een klas (incl. opnieuw aanmelden na tab sluiten).
const MAX_PARTICIPANTS = 60

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

    // Sessie ophalen op code — voor elke actie nodig.
    const { data: session, error: sErr } = await admin
      .from('compliment_sessions')
      .select('id, group_id, status, focus_student_name, show_author, moderation')
      .eq('code', code)
      .maybeSingle()

    if (sErr) {
      console.error('session lookup error:', sErr.message)
      return json({ ok: false, error: 'Er ging iets mis.' }, 500)
    }
    if (!session) {
      // Bewust generiek: geen onderscheid tussen "bestaat niet" en fout.
      return json({ ok: true, exists: false })
    }

    const pub = {
      exists: true,
      status: session.status,
      focusName: session.focus_student_name,
      showAuthor: session.show_author,
    }

    // ---------------- status ----------------
    if (action === 'status') {
      return json({ ok: true, ...pub })
    }

    // ---------------- join ----------------
    if (action === 'join') {
      if (session.status === 'closed') {
        return json({ ok: true, ...pub }) // dichte sessie: laat client 'afgesloten' tonen
      }
      const name = cleanText(body?.name, NAME_MAX)
      if (!name) return json({ ok: false, error: 'Vul je voornaam in.' }, 400)

      // Deelnemer aan de klaslijst koppelen, zodat de controlelijst van de
      // leerkracht per kind klopt. Op alleen de voornaam ging dat mis: stuurde
      // één Noa iets in, dan stonden alle Noa's als "klaar".
      let match: any = null
      if (session.group_id) {
        const { data: roster } = await admin
          .from('students').select('id, first_name, name_suffix')
          .eq('group_id', session.group_id).eq('archived', false)
        const sameName = (roster || []).filter((s: any) => normName(s.first_name) === normName(name))
        const pickedId = String(body?.studentId || '')
        match = sameName.length === 1 ? sameName[0] : null
        if (sameName.length > 1) {
          match = sameName.find((s: any) => s.id === pickedId) || null
          if (!match) {
            const map = assignMonsters(roster || [])
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
      }

      const { count: pCount } = await admin
        .from('compliment_participants')
        .select('id', { count: 'exact', head: true })
        .eq('session_id', session.id)

      if ((pCount || 0) >= MAX_PARTICIPANTS) {
        return json({ ok: false, error: 'Deze muur zit vol. Vraag je juf of meester om hulp.' }, 429)
      }

      const { data: p, error: pErr } = await admin
        .from('compliment_participants')
        .insert({ session_id: session.id, name, student_id: match ? match.id : null })
        .select('id')
        .single()

      if (pErr) {
        console.error('participant insert error:', pErr.message)
        return json({ ok: false, error: 'Aanmelden lukte niet. Probeer opnieuw.' }, 500)
      }
      return json({ ok: true, participantId: p.id, ...pub })
    }

    // ---------------- submit ----------------
    if (action === 'submit') {
      const participantId = String(body?.participantId || '')
      if (!participantId) return json({ ok: false, error: 'Meld je eerst aan.' }, 400)

      if (session.status !== 'collecting') {
        // Lobby of gesloten: nog/niet meer insturen.
        return json({ ok: false, error: 'De juf of meester heeft het invullen nog niet geopend.', status: session.status }, 409)
      }

      // Deelnemer moet bij deze sessie horen.
      const { data: participant, error: pvErr } = await admin
        .from('compliment_participants')
        .select('id, name, session_id')
        .eq('id', participantId)
        .maybeSingle()

      if (pvErr || !participant || participant.session_id !== session.id) {
        return json({ ok: false, error: 'Meld je opnieuw aan.' }, 403)
      }

      const text = cleanText(body?.text, TEXT_MAX)
      if (!text) return json({ ok: false, error: 'Typ eerst een compliment.' }, 400)

      // Simpele spam-rem: cap aantal complimenten per deelnemer.
      const { count } = await admin
        .from('compliments')
        .select('id', { count: 'exact', head: true })
        .eq('participant_id', participantId)

      if ((count || 0) >= MAX_PER_PARTICIPANT) {
        return json({ ok: false, error: 'Je hebt al heel veel complimenten gegeven. Mooi zo!' }, 429)
      }

      const status = session.moderation ? 'pending' : 'approved'
      const { error: cErr } = await admin
        .from('compliments')
        .insert({
          session_id: session.id,
          participant_id: participantId,
          author_name: participant.name,
          text,
          status,
        })

      if (cErr) {
        console.error('compliment insert error:', cErr.message)
        return json({ ok: false, error: 'Versturen lukte niet. Probeer opnieuw.' }, 500)
      }
      return json({ ok: true, moderated: session.moderation })
    }

    return json({ ok: false, error: 'Onbekende actie.' }, 400)
  } catch (err) {
    console.error('complimentenmuur error:', err)
    return json({ ok: false, error: (err as Error).message || 'Onbekende fout.' }, 500)
  }
})

const MONSTER_COUNT = 36

// Voornaam plus achterletter als die er is: "Noa K.".
function displayNameOf(s: { first_name?: string; name_suffix?: string }): string {
  const x = (s.name_suffix || '').trim()
  return ((s.first_name || '') + ' ' + (x ? x + '.' : '')).trim()
}
function normName(s: unknown): string {
  return String(s == null ? '' : s).trim().toLowerCase()
}
function hashStr(key: string): number {
  let h = 0
  key = String(key || '')
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0
  return h
}
// Zelfde toewijzing als in de tools, zodat een kind overal hetzelfde monster ziet.
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

function normalizeCode(raw: unknown): string {
  return String(raw || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)
}

function cleanText(raw: unknown, max: number): string {
  return String(raw || '').replace(/\s+/g, ' ').trim().slice(0, max)
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

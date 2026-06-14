import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

/**
 * Leerlingpagina (/leerling) — publieke kant, geen account.
 *
 * Een leerling logt in met VOORNAAM + persoonlijke CODE (3 letters + 3 cijfers,
 * prefix = school). Alles loopt via de service-role key; de code is de sleutel.
 *
 * Acties (POST body { action, ... }):
 *   - login { name, code }  -> match leerling op code + voornaam, geef monster
 *   - wall  { code }        -> het rekenmuurtje (mastery) van die leerling
 */

const NAME_MAX = 30
const MONSTER_COUNT = 36

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const action = String(body?.action || '')
    const code = normCode(body?.code)

    if (!code) return json({ ok: false, error: 'Vul je code in.' }, 400)

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data: student } = await admin
      .from('students')
      .select('id, first_name, group_id, archived')
      .eq('code', code)
      .maybeSingle()

    const valid = student && !student.archived

    // ---------------- login ----------------
    if (action === 'login') {
      const name = cleanText(body?.name, NAME_MAX)
      if (!name) return json({ ok: false, error: 'Vul je voornaam in.' }, 400)
      if (!valid || normName(student.first_name) !== normName(name)) {
        return json({ ok: true, matched: false })
      }
      // Monstertje: zelfde (binnen de klas unieke) toewijzing als de tools.
      const { data: roster } = await admin
        .from('students').select('id')
        .eq('group_id', student.group_id).eq('archived', false)
      const map = assignMonsters(roster || [])
      const monster = monsterPath(map[student.id] || ((hashStr(student.id) % MONSTER_COUNT) + 1))
      return json({ ok: true, matched: true, displayName: student.first_name, monster })
    }

    // ---------------- wall ----------------
    if (action === 'wall') {
      if (!valid) return json({ ok: true, matched: false, wall: [] })
      const { data: wall } = await admin
        .from('rekenmuur_mastery')
        .select('block_id, status, regressed, best_per_min, best_accuracy, last_per_min, last_accuracy, last_answered')
        .eq('student_id', student.id)
      return json({ ok: true, matched: true, wall: wall || [] })
    }

    return json({ ok: false, error: 'Onbekende actie.' }, 400)
  } catch (err) {
    console.error('leerling error:', err)
    return json({ ok: false, error: (err as Error).message || 'Onbekende fout.' }, 500)
  }
})

// ---------- Monstertjes (zelfde algoritme als de tools) ----------
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
function normCode(raw: unknown): string {
  return String(raw || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
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

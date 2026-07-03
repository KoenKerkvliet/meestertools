import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

/**
 * Leerlingpagina (/leerling) — publieke kant, geen account.
 *
 * Een leerling logt in met VOORNAAM + persoonlijke CODE (prefix = school;
 * oudere codes zijn 3 letters + 3 cijfers, nieuwe 4 letters + 3 cijfers).
 * Alles loopt via de service-role key.
 *
 * ELKE actie vereist naam + code als paar: een code alleen is niet genoeg
 * (anders zou iemand codes kunnen raden en voortgang/sessies uitlezen).
 * Mislukte pogingen worden per IP afgeremd tegen brute force.
 *
 * Acties (POST body { action, name, code, ... }):
 *   - login            -> match leerling op code + voornaam, geef monster
 *   - wall             -> het rekenmuurtje (mastery) van die leerling
 *   - typetijger_load  -> voortgang van de typcursus
 *   - typetijger_save { lessonId, stars, apm, acc } -> voortgang opslaan (best)
 */

const NAME_MAX = 30
const MONSTER_COUNT = 36

// Brute-force-rem: alleen MISLUKTE pogingen tellen mee (een klas vol geldige
// leerlingen achter één school-IP merkt hier dus niets van). In-memory per
// isolate: geen garantie, wel een effectieve snelheidsrem.
const MISS_WINDOW_MS = 10 * 60 * 1000
const MISS_MAX = 100
const misses = new Map<string, { count: number; resetAt: number }>()

function ipOf(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for') || ''
  return fwd.split(',')[0].trim() || 'onbekend'
}
function tooManyMisses(ip: string): boolean {
  const m = misses.get(ip)
  return !!m && Date.now() <= m.resetAt && m.count >= MISS_MAX
}
function registerMiss(ip: string) {
  const now = Date.now()
  const m = misses.get(ip)
  if (!m || now > m.resetAt) {
    if (misses.size > 5000) misses.clear() // simpele cap tegen geheugengroei
    misses.set(ip, { count: 1, resetAt: now + MISS_WINDOW_MS })
  } else {
    m.count++
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const action = String(body?.action || '')
    const code = normCode(body?.code)
    const name = cleanText(body?.name, NAME_MAX)

    if (!code) return json({ ok: false, error: 'Vul je code in.' }, 400)
    if (!name) return json({ ok: false, error: 'Vul je voornaam in.' }, 400)

    const ip = ipOf(req)
    if (tooManyMisses(ip)) {
      return json({ ok: false, error: 'Te veel mislukte pogingen. Wacht even en probeer het opnieuw.' }, 429)
    }

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data: student } = await admin
      .from('students')
      .select('id, first_name, group_id, archived')
      .eq('code', code)
      .maybeSingle()

    // Naam + code moeten samen kloppen — voor élke actie.
    const valid = !!(student && !student.archived &&
      normName(student.first_name) === normName(name))
    if (!valid) registerMiss(ip)

    // ---------------- login ----------------
    if (action === 'login') {
      if (!valid) {
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

    // ---------------- typetijger: voortgang laden ----------------
    if (action === 'typetijger_load') {
      if (!valid) return json({ ok: true, matched: false, progress: {} })
      const { data: rows } = await admin
        .from('typetijger_progress')
        .select('lesson_id, stars, best_per_min, best_accuracy')
        .eq('student_id', student.id)
      const progress: Record<string, unknown> = {}
      ;(rows || []).forEach((r: any) => {
        progress[r.lesson_id] = {
          done: true, stars: r.stars,
          bestApm: r.best_per_min, bestAcc: r.best_accuracy,
        }
      })
      // Oefendagen (voor de week-streak): de laatste ~60 dagen dat dit kind oefende.
      const { data: act } = await admin
        .from('typetijger_activity')
        .select('activity_date')
        .eq('student_id', student.id)
        .order('activity_date', { ascending: false })
        .limit(60)
      const activityDates = (act || []).map((r: any) => r.activity_date)
      return json({ ok: true, matched: true, progress, activityDates, today: amsterdamToday() })
    }

    // ---------------- typetijger: voortgang opslaan (alleen verbeteren) ----------------
    if (action === 'typetijger_save') {
      if (!valid) return json({ ok: false, error: 'Je code klopt niet.' }, 403)
      const lessonId = cleanText(body?.lessonId, 40)
      if (!lessonId) return json({ ok: false, error: 'Geen les opgegeven.' }, 400)
      const stars = clampInt(body?.stars, 0, 3)
      const apm = clampInt(body?.apm, 0, 100000)
      const acc = clampInt(body?.acc, 0, 100)

      const { data: cur } = await admin
        .from('typetijger_progress')
        .select('stars, best_per_min, best_accuracy')
        .eq('student_id', student.id).eq('lesson_id', lessonId)
        .maybeSingle()

      const row = {
        student_id: student.id,
        group_id: student.group_id,
        lesson_id: lessonId,
        stars: Math.max(stars, (cur && cur.stars) || 0),
        best_per_min: Math.max(apm, (cur && cur.best_per_min) || 0),
        best_accuracy: Math.max(acc, (cur && cur.best_accuracy) || 0),
        updated_at: new Date().toISOString(),
      }
      const { error: upErr } = await admin
        .from('typetijger_progress')
        .upsert(row, { onConflict: 'student_id,lesson_id' })
      if (upErr) {
        console.error('typetijger_save error:', upErr.message)
        return json({ ok: false, error: 'Opslaan lukte niet.' }, 500)
      }

      // Vandaag telt als oefendag (voor de week-streak). Faalt dit, dan mag de
      // les-opslag alsnog slagen — het is een extraatje.
      const { error: actErr } = await admin
        .from('typetijger_activity')
        .upsert(
          { student_id: student.id, group_id: student.group_id, activity_date: amsterdamToday() },
          { onConflict: 'student_id,activity_date' },
        )
      if (actErr) console.error('typetijger activity error:', actErr.message)

      return json({ ok: true, saved: true })
    }

    // ---------------- sessions (actieve sessies van de klas) ----------------
    if (action === 'sessions') {
      if (!valid) return json({ ok: true, sessions: [] })
      const gid = student.group_id
      const naam = encodeURIComponent(student.first_name || '')
      const out: Array<Record<string, unknown>> = []

      const { data: rr } = await admin
        .from('rekenrace_sessions')
        .select('code, block_label, status')
        .eq('group_id', gid).eq('purpose', 'race').in('status', ['lobby', 'playing'])
      ;(rr || []).forEach((s: any) => out.push({
        type: 'rekenrace', icon: '🧮',
        label: 'Rekenrace' + (s.block_label ? ' · ' + s.block_label : ''),
        joinUrl: '/meedoen-rekenrace?code=' + s.code + '&naam=' + naam,
      }))

      const { data: er } = await admin
        .from('escaperoom_sessions')
        .select('code, status, escaperooms(title)')
        .eq('group_id', gid).in('status', ['lobby', 'playing'])
      ;(er || []).forEach((s: any) => {
        const title = s.escaperooms && s.escaperooms.title
        out.push({
          type: 'escaperoom', icon: '🗝️',
          label: 'Escape room' + (title ? ' · ' + title : ''),
          joinUrl: '/meedoen-escaperoom?code=' + s.code,
        })
      })

      const { data: cm } = await admin
        .from('compliment_sessions')
        .select('code, status, focus_student_name')
        .eq('group_id', gid).in('status', ['lobby', 'collecting'])
      ;(cm || []).forEach((s: any) => out.push({
        type: 'compliment', icon: '💛',
        label: 'Complimentenmuur' + (s.focus_student_name ? ' · voor ' + s.focus_student_name : ''),
        joinUrl: '/meedoen?code=' + s.code,
      }))

      // Sociogram — wordt op de leerlingpagina zelf ingevuld (geen aparte
      // meedoen-pagina), dus we geven de sessiecode mee i.p.v. een joinUrl.
      const { data: sg } = await admin
        .from('sociogram_sessions')
        .select('id, code, type, status')
        .eq('group_id', gid).eq('status', 'open')
      for (const s of (sg || []) as any[]) {
        const { count } = await admin
          .from('sociogram_participants')
          .select('id', { count: 'exact', head: true })
          .eq('session_id', s.id).eq('student_id', student.id)
        out.push({
          type: 'sociogram', icon: '🧑‍🤝‍🧑',
          label: 'Sociogram · ' + typeLabel(s.type),
          sessionCode: s.code,
          submitted: (count || 0) > 0,
        })
      }

      return json({ ok: true, sessions: out })
    }

    // ---------------- sociogram: invulgegevens laden ----------------
    if (action === 'socio_load') {
      if (!valid) return json({ ok: true, found: false })
      const sc = normCode(body?.sessionCode)
      const session = await loadSociogramSession(admin, sc)
      if (!session || session.group_id !== student.group_id || session.status !== 'open') {
        return json({ ok: true, found: false })
      }
      // Klasgenoten (zonder zichzelf) om uit te kiezen.
      const { data: roster } = await admin
        .from('students')
        .select('id, first_name, last_name')
        .eq('group_id', student.group_id).eq('archived', false)
        .order('first_name')
      const classmates = (roster || [])
        .filter((s: any) => s.id !== student.id)
        .map((s: any) => ({ id: s.id, name: fullName(s) }))

      const { count } = await admin
        .from('sociogram_participants')
        .select('id', { count: 'exact', head: true })
        .eq('session_id', session.id).eq('student_id', student.id)

      return json({
        ok: true, found: true,
        type: session.type,
        submitted: (count || 0) > 0,
        classmates,
      })
    }

    // ---------------- sociogram: keuzes opslaan ----------------
    if (action === 'socio_save') {
      if (!valid) return json({ ok: false, error: 'Je code klopt niet.' }, 403)
      const sc = normCode(body?.sessionCode)
      const session = await loadSociogramSession(admin, sc)
      if (!session || session.group_id !== student.group_id) {
        return json({ ok: false, error: 'Deze sessie bestaat niet.' }, 404)
      }
      if (session.status !== 'open') {
        return json({ ok: false, error: 'Het invullen is gesloten.' }, 409)
      }

      // Niet twee keer invullen.
      const { data: existing } = await admin
        .from('sociogram_participants')
        .select('id')
        .eq('session_id', session.id).eq('student_id', student.id)
        .maybeSingle()
      if (existing) {
        return json({ ok: true, alreadyDone: true })
      }

      // Geldige klasgenoten (zonder zichzelf) als toegestane keuzes.
      const { data: roster } = await admin
        .from('students').select('id')
        .eq('group_id', student.group_id).eq('archived', false)
      const allowed = new Set((roster || [])
        .map((s: any) => s.id)
        .filter((id: string) => id !== student.id))

      const positief = cleanPicks(body?.positief, allowed)
      const negatief = cleanPicks(body?.negatief, allowed)

      // Geen overlap tussen positief en negatief.
      if (positief.some((id) => negatief.includes(id))) {
        return json({ ok: false, error: 'Een kind kan niet bij allebei staan.' }, 400)
      }
      if (!positief.length && !negatief.length) {
        return json({ ok: false, error: 'Kies eerst minstens één kind.' }, 400)
      }

      const rows: Array<Record<string, unknown>> = []
      positief.forEach((id, i) => rows.push({
        session_id: session.id, from_student_id: student.id,
        to_student_id: id, pick_type: 'positief', rank: i + 1,
      }))
      negatief.forEach((id, i) => rows.push({
        session_id: session.id, from_student_id: student.id,
        to_student_id: id, pick_type: 'negatief', rank: i + 1,
      }))

      // Markeer eerst als ingevuld (unique constraint vangt dubbele inzending af).
      const { error: partErr } = await admin
        .from('sociogram_participants')
        .insert({ session_id: session.id, student_id: student.id })
      if (partErr) {
        if (partErr.code === '23505') return json({ ok: true, alreadyDone: true })
        console.error('participant insert error:', partErr.message)
        return json({ ok: false, error: 'Opslaan lukte niet. Probeer opnieuw.' }, 500)
      }

      if (rows.length) {
        const { error: pErr } = await admin.from('sociogram_picks').insert(rows)
        if (pErr) {
          console.error('picks insert error:', pErr.message)
          return json({ ok: false, error: 'Opslaan lukte niet. Probeer opnieuw.' }, 500)
        }
      }
      return json({ ok: true, saved: true })
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

// ---------- Sociogram ----------
async function loadSociogramSession(admin: any, sessionCode: string) {
  if (!sessionCode) return null
  const { data } = await admin
    .from('sociogram_sessions')
    .select('id, group_id, type, status')
    .eq('code', sessionCode)
    .maybeSingle()
  return data || null
}
function typeLabel(type: unknown): string {
  return type === 'werken' ? 'Samen werken' : type === 'spelen' ? 'Samen spelen' : String(type || '')
}
function fullName(s: { first_name?: string; last_name?: string }): string {
  return ((s.first_name || '') + ' ' + (s.last_name || '')).trim() || '?'
}
// Houd max 3 unieke, toegestane keuzes over (volgorde = rang).
function cleanPicks(raw: unknown, allowed: Set<string>): string[] {
  const out: string[] = []
  if (Array.isArray(raw)) {
    for (const v of raw) {
      const id = String(v || '')
      if (id && allowed.has(id) && !out.includes(id)) out.push(id)
      if (out.length >= 3) break
    }
  }
  return out
}

// ---------- Tekst / getallen ----------
function normName(s: unknown): string {
  return String(s == null ? '' : s).trim().toLowerCase()
}
function normCode(raw: unknown): string {
  // Oude codes zijn 6 tekens, nieuwe 7 — accepteer ruim.
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
// Datum van vandaag in de Nederlandse tijdzone (YYYY-MM-DD), zodat een oefendag
// niet op UTC-middernacht al naar de volgende dag rolt.
function amsterdamToday(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Amsterdam' })
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

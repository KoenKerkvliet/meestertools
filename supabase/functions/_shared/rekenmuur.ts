/**
 * Rekenmuur — gedeelde norm en muur-bijwerking.
 *
 * Stond tot v1.56.0 alleen in rekenrace-sessie. Nu kunnen kinderen ook
 * zelfstandig oefenen vanaf hun eigen pagina (edge function `leerling`), en
 * dan moeten beide wegen exact hetzelfde oordeel vellen. Anders is een
 * steentje groen tijdens de klassikale race en oranje bij solo-oefenen, en dan
 * klopt het muurtje van het kind niet meer met wat de leerkracht ziet.
 *
 * De norm is hier de bron van waarheid. js/rekenrace-blocks.js spiegelt hem
 * alleen voor het eindscherm-label direct na het spelen.
 */

// Norm voor "beheerst" (groen).
export const NORM_ACCURACY = 90       // % goed (vulling groen)
export const NORM_SEC_PER_SUM = 4     // gemiddeld seconden per som
export const MIN_GREEN = 8            // minimaal aantal sommen voor groen
export const MIN_VERDICT = 4          // minder -> geen oordeel (muur ongewijzigd)
export const AWARD_SPEED_MIN_BPM = 15 // >= 15 sommen/min == <= 4 sec/som (rand groen)

// Speelbare steentjes (spiegelt js/rekenrace-blocks.js).
// Alleen een geldig steentje mag de muur bijwerken.
export const ACTIVE_BLOCKS = new Set([
  // FASE 1A
  '1a_opt_t10', '1a_opt_t20_zonder', '1a_opt_t20_met', '1a_splitsen',
  '1a_aftr_t20_met', '1a_aftr_t20_zonder', '1a_aftr_t10',
  // FASE 1B
  '1b_opt_tiental', '1b_opt_eenheden', '1b_tafels', '1b_aftr_eenheden', '1b_aftr_tiental',
  '1b_plus10', '1b_plus1', '1b_min1', '1b_min10',
  // FASE 2
  '2_opt_hte', '2_opt_te', '2_tafels', '2_delen', '2_aftr_te', '2_aftr_hte',
  // FASE 3
  '3_optellen', '3_aftrekken', '3_vermenigvuldigen', '3_delen',
  // FASE 4
  '4_lengte', '4_inhoud', '4_omtrek', '4_breuken', '4_procenten', '4_komma', '4_grafieken',
  // Getalbegrip
  '1a_gb10', '1a_gb20', '1b_gb100', '2_gb1000', '3_gb10000', '3_gb100000',
])

export interface Verdict {
  status: 'green' | 'orange'
  accuracy: number
  perMin: number
  answered: number
}

export function computeVerdict(answered: number, correct: number, totalMs: number): Verdict | null {
  if (!answered || answered < MIN_VERDICT) return null
  const accuracy = Math.round((correct / answered) * 100)
  const avgSec = totalMs > 0 ? (totalMs / answered / 1000) : 999
  const perMin = totalMs > 0 ? Math.round(answered / (totalMs / 60000)) : 0
  const green = answered >= MIN_GREEN && accuracy >= NORM_ACCURACY && avgSec <= NORM_SEC_PER_SUM
  return { status: green ? 'green' : 'orange', accuracy, perMin, answered }
}

// Belonen aan/uit (per leerkracht, tool_settings; standaard aan).
async function rewardEnabled(admin: any, userId: string): Promise<boolean> {
  const { data } = await admin
    .from('tool_settings').select('settings')
    .eq('user_id', userId).eq('tool_name', 'rekenrace').maybeSingle()
  if (data && data.settings && data.settings.awardPoints === false) return false
  return true
}

// Vast Rekenrace-beloningstype per leerkracht (gearchiveerd: telt mee in het
// totaal, maar geen losse knop in Klasseprestatie). Find-or-create op label.
async function ensureRewardType(admin: any, userId: string): Promise<string | null> {
  const { data: existing } = await admin
    .from('klasseprestatie_reward_types').select('id')
    .eq('user_id', userId).eq('label', 'Rekenrace').limit(1).maybeSingle()
  if (existing) return existing.id
  const { data: created, error } = await admin
    .from('klasseprestatie_reward_types')
    .insert({ user_id: userId, type: 'positief', icon: '🧮', label: 'Rekenrace', points: 1, sort_order: 999, archived: true })
    .select('id').single()
  if (error) { console.error('reward type create error:', error.message); return null }
  return created.id
}

export interface MasteryContext {
  user_id: string    // de leerkracht die de klas bezit (voor de beloningspunten)
  group_id: string
  block_id: string
}

/**
 * Werkt één steentje van het muurtje bij en deelt zo nodig de eenmalige
 * klasseprestatiepunten uit. Geeft terug wat er met het steentje gebeurde,
 * of null als het opslaan mislukte.
 */
export async function upsertMastery(
  admin: any, ctx: MasteryContext, studentId: string, v: Verdict,
): Promise<{ blockId: string; status: string; regressed: boolean } | null> {
  const { data: existing } = await admin
    .from('rekenmuur_mastery')
    .select('status, achieved_at, best_per_min, best_accuracy, attempts, awarded_speed, awarded_acc')
    .eq('student_id', studentId)
    .eq('block_id', ctx.block_id)
    .maybeSingle()

  const nowIso = new Date().toISOString()
  let status: string, regressed: boolean, achievedAt: string | null
  if (existing && existing.status === 'green') {
    // Sticky-green: blijft groen, maar zet een seintje als deze beurt terugzakte.
    status = 'green'
    regressed = v.status !== 'green'
    achievedAt = existing.achieved_at
  } else {
    status = v.status
    regressed = false
    achievedAt = v.status === 'green' ? nowIso : (existing ? existing.achieved_at : null)
  }

  const newBestPerMin = Math.max(existing ? existing.best_per_min : 0, v.perMin)
  const newBestAcc = Math.max(existing ? existing.best_accuracy : 0, v.accuracy)

  // Klasseprestatiepunten: eenmalig per mijlpaal per steentje.
  //   rand groen (snel, <= 4 sec) -> awarded_speed ; vulling groen (>= 90%) -> awarded_acc
  let awardedSpeed = existing ? !!existing.awarded_speed : false
  let awardedAcc = existing ? !!existing.awarded_acc : false
  const wantSpeed = !awardedSpeed && newBestPerMin >= AWARD_SPEED_MIN_BPM
  const wantAcc = !awardedAcc && newBestAcc >= NORM_ACCURACY
  if ((wantSpeed || wantAcc) && await rewardEnabled(admin, ctx.user_id)) {
    const rtId = await ensureRewardType(admin, ctx.user_id)
    if (rtId) {
      const rows: Array<Record<string, unknown>> = []
      if (wantSpeed) rows.push({ user_id: ctx.user_id, student_id: studentId, reward_type_id: rtId, points: 1 })
      if (wantAcc) rows.push({ user_id: ctx.user_id, student_id: studentId, reward_type_id: rtId, points: 1 })
      const { error: awErr } = await admin.from('klasseprestatie_points').insert(rows)
      if (!awErr) {
        if (wantSpeed) awardedSpeed = true
        if (wantAcc) awardedAcc = true
      } else {
        console.error('award insert error:', awErr.message)
      }
    }
  }

  const row = {
    user_id: ctx.user_id,
    group_id: ctx.group_id,
    student_id: studentId,
    block_id: ctx.block_id,
    status,
    regressed,
    achieved_at: achievedAt,
    best_per_min: newBestPerMin,
    best_accuracy: newBestAcc,
    last_per_min: v.perMin,
    last_accuracy: v.accuracy,
    last_answered: v.answered,
    last_played_at: nowIso,
    attempts: (existing ? existing.attempts : 0) + 1,
    awarded_speed: awardedSpeed,
    awarded_acc: awardedAcc,
    updated_at: nowIso,
  }
  const { error } = await admin
    .from('rekenmuur_mastery')
    .upsert(row, { onConflict: 'student_id,block_id' })
  if (error) { console.error('mastery upsert error:', error.message); return null }
  return { blockId: ctx.block_id, status, regressed }
}

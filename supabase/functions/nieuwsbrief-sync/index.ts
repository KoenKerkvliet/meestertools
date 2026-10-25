import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

/**
 * Nieuwsbrief-sync — houdt de Emailit-audience "MT – Nieuwe tools" gelijk aan
 * het vinkje profiles.nieuwsbrief.
 *
 * Wie erin hoort bepaalt de database (public._nieuwsbrief_leden): vinkje aan en
 * e-mailadres bevestigd. Deze functie vergelijkt dat met de audience en past
 * alleen het verschil aan:
 *
 *  - hoort erin, staat er niet in       -> toevoegen
 *  - staat erin, maar afgemeld via de afmeldlink van een Emailit-mail
 *                                       -> vinkje in de database uitzetten
 *                                          (de afmelding gaat altijd voor)
 *  - staat erin, hoort er niet (meer) in:
 *      account bestaat nog (vinkje uit) -> uit de audience
 *      account is verwijderd            -> contact helemaal uit Emailit, tenzij
 *                                          het adres ook op een andere lijst staat
 *
 * Aangeroepen door de database (public.nieuwsbrief_sync_tick): direct na een
 * wijziging van het vinkje en elke nacht, zonder JWT maar met het gedeelde
 * geheim uit public.opruim_geheim.
 *
 * De audience-API van Emailit vraagt een "full" API-sleutel. Is EMAILIT_API_KEY
 * alleen een verzendsleutel, zet dan een volledige in EMAILIT_FULL_API_KEY.
 */

const AUDIENCE = 'aud_4LCLCyO6Iq2JoMSApZtN1EAuR2j'
const API = 'https://api.emailit.com/v2'
const KEY = Deno.env.get('EMAILIT_FULL_API_KEY') || Deno.env.get('EMAILIT_API_KEY')!

interface Lid {
  user_id: string
  email: string
  naam: string | null
}

interface Abonnee {
  email: string
  subscribed: boolean
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return json({ ok: false, error: 'Alleen POST.' }, 405)
  }

  try {
    const body = await req.json().catch(() => ({}))
    const geheim = String(body?.geheim || '')

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data: bekend } = await admin.from('opruim_geheim').select('geheim').maybeSingle()
    if (!geheim || !bekend || !gelijk(geheim, bekend.geheim)) {
      return json({ ok: false, error: 'Niet toegestaan.' }, 401)
    }

    const { data: leden, error } = await admin.rpc('_nieuwsbrief_leden')
    if (error) throw error
    const gewenst = new Map<string, Lid>(((leden || []) as Lid[]).map((l) => [l.email.toLowerCase(), l]))
    const huidig = await alleAbonnees()

    let toegevoegd = 0, verwijderd = 0, afgemeld = 0, gewist = 0

    // Toevoegen wie erin hoort.
    for (const [email, lid] of gewenst) {
      const a = huidig.get(email)
      if (!a) {
        await emailit('POST', `/audiences/${AUDIENCE}/subscribers`, { email, first_name: lid.naam || undefined })
        toegevoegd++
      } else if (!a.subscribed) {
        // Afgemeld via Emailit: die keuze nemen we over.
        await admin.from('profiles').update({ nieuwsbrief: false }).eq('id', lid.user_id)
        afgemeld++
      }
    }

    // Weghalen wie er niet (meer) in hoort.
    for (const [email] of huidig) {
      if (gewenst.has(email)) continue
      const { data: account } = await admin.rpc('_nieuwsbrief_account_van', { p_email: email })
      if (account) {
        await emailit('DELETE', `/audiences/${AUDIENCE}/subscribers/${encodeURIComponent(email)}`)
        verwijderd++
      } else {
        // Account weg: dan hoort het adres ook niet meer in Emailit. Behalve als
        // hetzelfde adres op een andere lijst staat; dan alleen van deze lijst af.
        const contact = await emailit('GET', `/contacts/${encodeURIComponent(email)}`)
        const anders = (contact?.audiences || []).some((a: { id: string }) => a.id !== AUDIENCE)
        if (anders) {
          await emailit('DELETE', `/audiences/${AUDIENCE}/subscribers/${encodeURIComponent(email)}`)
          verwijderd++
        } else {
          await emailit('DELETE', `/contacts/${encodeURIComponent(email)}`)
          gewist++
        }
      }
    }

    return json({ ok: true, toegevoegd, verwijderd, afgemeld, gewist })
  } catch (err) {
    console.error('nieuwsbrief-sync error:', err)
    return json({ ok: false, error: (err as Error).message }, 500)
  }
})

async function alleAbonnees(): Promise<Map<string, Abonnee>> {
  const uit = new Map<string, Abonnee>()
  for (let page = 1; page <= 50; page++) {
    const res = await emailit('GET', `/audiences/${AUDIENCE}/subscribers?limit=100&page=${page}`)
    for (const s of (res?.data || []) as Abonnee[]) uit.set(String(s.email).toLowerCase(), s)
    if (!res?.next_page_url) break
  }
  return uit
}

// deno-lint-ignore no-explicit-any
async function emailit(method: string, pad: string, body?: unknown): Promise<any> {
  const res = await fetch(API + pad, {
    method,
    headers: {
      'Authorization': `Bearer ${KEY}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  // Al weg is ook goed.
  if (res.status === 404 && method !== 'POST') return null
  if (!res.ok) throw new Error(`Emailit ${method} ${pad.split('?')[0]}: ${res.status} ${await res.text()}`)
  return res.status === 204 ? null : res.json().catch(() => null)
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

// Vergelijken zonder te lekken hoe ver twee geheimen overeenkomen.
function gelijk(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let verschil = 0
  for (let i = 0; i < a.length; i++) verschil |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return verschil === 0
}

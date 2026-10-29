import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

/**
 * Wachtlijst-aanmelden — zet de ingelogde leerkracht op de wachtlijst van
 * 10minutendidactiek.
 *
 * Dat is de bestaande Emailit-audience "10MD – Wachtlijst", dezelfde als het
 * formulier op de homepage van 10minutendidactiek. Alleen het e-mailadres en de
 * voornaam van het account gaan mee, en alleen als het adres bevestigd is.
 * Daarna komt er een rij in public.wachtlijst_10md, zodat de vraag in
 * Meestertools wegblijft en het dagoverzicht de aanmelding telt.
 *
 * Staat het adres al op de lijst (bijvoorbeeld via de 10MD-site), dan is dat
 * gewoon goed. Afmelden gaat via de link onderaan de mails van Emailit.
 *
 * De audience-API van Emailit vraagt een "full" API-sleutel, net als
 * nieuwsbrief-sync.
 */

const AUDIENCE = 'aud_4LCR0FvCOTGhyrQ17GUmGpgFGCd'
const API = 'https://api.emailit.com/v2'
const KEY = Deno.env.get('EMAILIT_FULL_API_KEY') || Deno.env.get('EMAILIT_API_KEY')!

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return json({ ok: false, error: 'Alleen POST.' }, 405)
  }

  try {
    // De JWT is al gecontroleerd door de runtime; hier halen we de gebruiker eruit.
    const jwt = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '')
    if (!jwt) return json({ ok: false, error: 'Niet ingelogd.' }, 401)

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data: userData } = await admin.auth.getUser(jwt)
    const user = userData?.user
    if (!user?.email) return json({ ok: false, error: 'Niet ingelogd.' }, 401)
    if (!user.email_confirmed_at) {
      return json({ ok: false, error: 'Bevestig eerst je e-mailadres.' }, 400)
    }

    const { data: profiel } = await admin.from('profiles').select('full_name').eq('id', user.id).maybeSingle()
    const voornaam = String(profiel?.full_name || '').trim().split(/\s+/)[0] || undefined
    const email = user.email.toLowerCase()

    const res = await fetch(`${API}/audiences/${AUDIENCE}/subscribers`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, first_name: voornaam }),
    })
    // Al op de lijst (bijvoorbeeld via de 10MD-site) is ook goed: Emailit meldt
    // dat als conflict, of anders blijkt het uit het opvragen van de abonnee.
    if (!res.ok && res.status !== 409 && res.status !== 422) {
      const bestaat = await fetch(`${API}/audiences/${AUDIENCE}/subscribers/${encodeURIComponent(email)}`, {
        headers: { 'Authorization': `Bearer ${KEY}` },
      })
      if (!bestaat.ok) throw new Error(`Emailit: ${res.status} ${await res.text()}`)
    }

    const { error } = await admin
      .from('wachtlijst_10md')
      .upsert({ user_id: user.id }, { onConflict: 'user_id', ignoreDuplicates: true })
    if (error) throw error

    return json({ ok: true })
  } catch (err) {
    console.error('wachtlijst-aanmelden error:', err)
    return json({ ok: false, error: 'Aanmelden lukte niet. Probeer het later nog eens.' }, 500)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

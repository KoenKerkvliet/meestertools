import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { sendEmail } from '../_shared/emailit.ts'

/**
 * Feedback-mail — verstuurt één keer per persoon een mail met vijf sterren om
 * op te klikken. Elke ster is een link naar /beoordeel met een persoonlijke
 * code; de pagina slaat de beoordeling op via public.feedback_via_mail.
 *
 * Wie er aan de beurt is bepaalt de database (public._feedbackmail_kandidaten),
 * en die houdt rekening met de schakelaar, de zomerstop en wie al antwoord gaf.
 * Deze functie voert alleen uit.
 *
 * Twee manieren om haar aan te roepen:
 *  - pg_cron via pg_net (public.feedbackmail_tick), zonder JWT. De database
 *    stuurt het gedeelde geheim uit public.opruim_geheim mee.
 *  - de beheerder, vanuit beheer, met { testmail: true } en zijn eigen JWT: dan
 *    gaat er één proefmail naar het eigen adres. Daar zit geen echte code in, dus
 *    er wordt niets opgeslagen.
 *
 * Elke mail wordt eerst "geclaimd" door een rij in feedbackmail_verzonden
 * (primary key user_id). Zo kan een herhaalde cron-run nooit dezelfde persoon
 * twee keer mailen. Mislukt het versturen, dan gaat de claim weer weg en komt
 * de gebruiker de volgende dag opnieuw aan de beurt.
 *
 * Verder een rem: hoogstens MAX_PER_RUN mails per aanroep (20 per dag, want
 * de cron draait één keer per dag).
 */

const SITE = 'https://meestertools.nl'
// Antwoordadres: info@meestertools.nl bestaat (nog) niet als mailbox, dus antwoorden gaan naar Koens eigen adres.
const CONTACT = 'koenkerkvliet@gmail.com'
const MAX_PER_RUN = 20
const GELDIG_DAGEN = 60
const PROEF_CODE = 'proef'

interface Kandidaat {
  user_id: string
  email: string | null
  naam: string | null
  aangemeld: string
  due: boolean
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

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // ---- Proefmail voor de beheerder ----
    if (body?.testmail === true) {
      const jwt = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '')
      const { data: userData } = await admin.auth.getUser(jwt)
      const user = userData?.user
      if (!user) return json({ ok: false, error: 'Niet ingelogd.' }, 401)

      const { data: prof } = await admin.from('profiles').select('role, full_name, email').eq('id', user.id).maybeSingle()
      if (!prof || prof.role !== 'super_admin') return json({ ok: false, error: 'Alleen voor de beheerder.' }, 403)

      const to = prof.email || user.email
      if (!to) return json({ ok: false, error: 'Geen e-mailadres bekend.' }, 400)

      const naam = String(prof.full_name || '').trim().split(' ')[0] || null
      await sendEmail({ to, reply_to: CONTACT, ...feedbackMail(naam, PROEF_CODE) })
      return json({ ok: true, sent: 1, proef: true })
    }

    // ---- Vanuit de database ----
    const geheim = String(body?.geheim || '')
    const { data: bekend } = await admin.from('opruim_geheim').select('geheim').maybeSingle()
    if (!geheim || !bekend || !gelijk(geheim, bekend.geheim)) {
      return json({ ok: false, error: 'Niet toegestaan.' }, 401)
    }

    // De database kijkt al naar de schakelaar; hier nogmaals, want dit is de
    // plek waar er daadwerkelijk iets de deur uitgaat.
    const { data: inst } = await admin.from('feedbackmail_instellingen').select('aan').maybeSingle()
    if (!inst || inst.aan !== true) {
      return json({ ok: true, sent: 0, reden: 'schakelaar staat uit' })
    }

    const { data: kandidaten, error } = await admin.rpc('_feedbackmail_kandidaten')
    if (error) throw error

    const todo = ((kandidaten || []) as Kandidaat[])
      .filter((k) => k.due && k.email)
      .slice(0, MAX_PER_RUN)

    let sent = 0
    let failed = 0

    for (const k of todo) {
      const code = nieuweCode()

      // Claimen. Bestaat de rij al, dan was een andere run ons voor.
      const claim = await admin.from('feedbackmail_verzonden').insert({
        user_id: k.user_id,
        token_hash: await hash(code),
        verloopt_op: new Date(Date.now() + GELDIG_DAGEN * 24 * 60 * 60 * 1000).toISOString(),
      })
      if (claim.error) {
        if (claim.error.code !== '23505') console.error('claim mislukt:', claim.error)
        continue
      }

      try {
        await sendEmail({ to: k.email!, reply_to: CONTACT, ...feedbackMail(k.naam, code) })
        sent++
      } catch (err) {
        console.error('mail versturen mislukt:', (err as Error).message)
        await admin.from('feedbackmail_verzonden').delete().eq('user_id', k.user_id)
        failed++
      }
    }

    return json({ ok: true, sent, failed })
  } catch (err) {
    console.error('feedback-mail error:', err)
    return json({ ok: false, error: (err as Error).message }, 500)
  }
})

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

function hex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

// 256 bits willekeur: niet te raden.
function nieuweCode(): string {
  return hex(crypto.getRandomValues(new Uint8Array(32)))
}

// Hetzelfde als encode(sha256(convert_to(code, 'UTF8')), 'hex') in de database.
async function hash(code: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(code))
  return hex(new Uint8Array(digest))
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

// ---------- De mail ----------

const LABELS = ['Valt tegen', 'Kan beter', 'Prima', 'Goed', 'Geweldig']

function feedbackMail(naam: string | null, code: string): { subject: string; html: string; text: string } {
  const hoi = naam ? `Hoi ${naam},` : 'Hoi,'
  const link = (n: number) => `${SITE}/beoordeel?t=${encodeURIComponent(code)}&s=${n}`

  const text = `${hoi}

Je gebruikt Meestertools nu een tijdje. Ik bouw het zelf en wil graag weten of het in jouw klas echt helpt.

Hoeveel sterren geef je Meestertools tot nu toe? Klik op een van de links, dan ben je klaar:

5 sterren, geweldig: ${link(5)}
4 sterren, goed: ${link(4)}
3 sterren, prima: ${link(3)}
2 sterren, kan beter: ${link(2)}
1 ster, valt tegen: ${link(1)}

Na je klik kun je er in één zin iets bij zetten: wat goed gaat, wat beter kan, of wat je mist. Dat hoeft niet.

Antwoord ook gerust op deze mail, dan lees ik mee.

Groet,
Koen
Meestertools

--
Dit is een eenmalige mail. Je hoort hier verder niets meer over. De links werken ${GELDIG_DAGEN} dagen en zijn alleen voor jou.`

  const sterren = [1, 2, 3, 4, 5].map((n) => `
              <td align="center" width="20%" style="padding:0 2px;">
                <a href="${esc(link(n))}" style="display:block;text-decoration:none;color:#F5A623;font-size:44px;line-height:1.1;" title="${n} ${n === 1 ? 'ster' : 'sterren'}: ${LABELS[n - 1]}">&#9733;</a>
                <a href="${esc(link(n))}" style="display:block;text-decoration:none;color:#636E72;font-size:13px;line-height:1.4;">${n}<br>${LABELS[n - 1]}</a>
              </td>`).join('')

  const html = layout({
    titel: 'Hoe bevalt Meestertools?',
    preheader: 'Eén klik op een ster is genoeg.',
    inhoud: `
      <p style="margin:0 0 16px 0;">${esc(hoi)}</p>
      <p style="margin:0 0 16px 0;">Je gebruikt Meestertools nu een tijdje. Ik bouw het zelf en wil graag weten of het in jouw klas echt helpt.</p>
      <p style="margin:0 0 8px 0;"><strong>Hoeveel sterren geef je Meestertools tot nu toe?</strong> Klik op een ster, dan ben je klaar.</p>`,
    sterren,
    afsluiting: `
      <p style="margin:0 0 16px 0;">Na je klik kun je er in één zin iets bij zetten: wat goed gaat, wat beter kan, of wat je mist. Dat hoeft niet.</p>
      <p style="margin:0 0 16px 0;">Antwoord ook gerust op deze mail, dan lees ik mee.</p>
      <p style="margin:0;">Groet,<br>Koen<br><span style="color:#636E72;">Meestertools</span></p>`,
    voet: `Dit is een eenmalige mail. Je hoort hier verder niets meer over. De sterren werken ${GELDIG_DAGEN} dagen en zijn alleen voor jou.`,
  })

  return { subject: 'Hoe bevalt Meestertools? Eén klik is genoeg', html, text }
}

// ---------- Opmaak ----------

function layout(o: {
  titel: string
  preheader: string
  inhoud: string
  sterren: string
  afsluiting: string
  voet: string
}): string {
  const PRIMARY = '#6C63FF'
  const TEXT_DARK = '#2D3436'
  const TEXT_MUTED = '#636E72'
  const BG = '#F5F5F7'
  const FOOTER_BG = '#FAFAFA'
  const BORDER = '#E8E8F0'
  const YEAR = new Date().getFullYear()

  return `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${esc(o.titel)}</title>
</head>
<body style="margin:0;padding:0;background:${BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

<div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:${BG};opacity:0;">${esc(o.preheader)}</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BG};">
  <tr>
    <td align="center" style="padding:24px 16px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#ffffff;border:1px solid ${BORDER};">
        <tr>
          <td align="center" bgcolor="${PRIMARY}" style="background:${PRIMARY};padding:28px 24px;">
            <div style="font-size:20px;font-weight:700;letter-spacing:-0.2px;color:#ffffff;">Meestertools</div>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 32px 8px 32px;color:${TEXT_DARK};font-size:16px;line-height:1.6;">
            <h2 style="margin:0 0 20px 0;font-size:20px;font-weight:700;">${esc(o.titel)}</h2>
            ${o.inhoud}
          </td>
        </tr>
        <tr>
          <td style="padding:4px 20px 28px 20px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>${o.sterren}
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:0 32px 32px 32px;color:${TEXT_DARK};font-size:16px;line-height:1.6;">
            ${o.afsluiting}
          </td>
        </tr>
        <tr>
          <td bgcolor="${FOOTER_BG}" style="background:${FOOTER_BG};padding:16px 32px;color:${TEXT_MUTED};font-size:12px;text-align:center;border-top:1px solid ${BORDER};">
            ${esc(o.voet)}<br>&copy; ${YEAR} Meestertools &middot; meestertools.nl
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>

</body>
</html>`
}
